#!/usr/bin/env node
/**
 * migrate-posts.mjs — content-migration task 2.5, Option B steps 2–3
 *
 * Copies the archived legacy posts (archive/posts.json, produced by
 * tools/archive-source-content.mjs) into the NEW blog via Blogger API v3
 * posts.insert. Writing requires OAuth (scope .../auth/blogger) — the
 * API key alone is read-only.
 *
 * Credentials live in website/.env.local (gitignored — BR-006):
 *   GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET  — OAuth client
 *     (Google Cloud project "runsdev"); add http://localhost:8765/callback
 *     to its Authorized redirect URIs in the Cloud Console first.
 *   GOOGLE_OAUTH_REFRESH_TOKEN — written by the `auth` command below.
 *
 * Usage:
 *   node tools/migrate-posts.mjs auth                     one-off browser consent,
 *                                                         saves the refresh token
 *   node tools/migrate-posts.mjs migrate                  DRY RUN (default)
 *   node tools/migrate-posts.mjs migrate --execute        real inserts
 *   node tools/migrate-posts.mjs migrate --execute --limit 1   test batch
 *
 * Idempotent: posts already present on the target (same title + publish
 * date) are skipped, so re-running never duplicates.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const API = "https://www.googleapis.com/blogger/v3";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_PATH = join(ROOT, "website", ".env.local");
const ARCHIVE = join(ROOT, "projects", "kkn-badko-blog", "03-content-migration", "archive", "posts.json");
const REDIRECT_PORT = 8765;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/callback`;
const SCOPE = "https://www.googleapis.com/auth/blogger";
// Blogger's write quota is a small token bucket (observed ~4-5 inserts per
// burst, then HTTP 429 for a while) — pace generously and retry on 429.
const INSERT_DELAY_MS = 15_000;
const RETRY_DELAYS_MS = [30_000, 60_000, 120_000, 240_000, 300_000, 300_000, 300_000];

function loadEnv() {
  const env = {};
  for (const line of readFileSync(ENV_PATH, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith("#")) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function saveEnvKey(name, value) {
  let text = readFileSync(ENV_PATH, "utf8");
  if (new RegExp(`^${name}=`, "m").test(text)) {
    text = text.replace(new RegExp(`^${name}=.*$`, "m"), `${name}=${value}`);
  } else {
    text += `${text.endsWith("\n") ? "" : "\n"}${name}=${value}\n`;
  }
  writeFileSync(ENV_PATH, text);
}

const env = loadEnv();
const need = (k) => {
  if (!env[k] || env[k].startsWith("REPLACE_WITH")) {
    console.error(`FAIL: ${k} missing in website/.env.local`);
    process.exit(1);
  }
  return env[k];
};

const command = process.argv[2];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- auth ----
async function cmdAuth() {
  const clientId = need("GOOGLE_OAUTH_CLIENT_ID");
  const clientSecret = need("GOOGLE_OAUTH_CLIENT_SECRET");

  const authUrl =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: SCOPE,
      access_type: "offline",
      prompt: "consent",
    });

  console.log("1. Open this URL in a browser, signed in as an ADMIN/AUTHOR of the NEW blog:\n");
  console.log(`   ${authUrl}\n`);
  console.log(`2. Approve access. Waiting for the redirect on ${REDIRECT_URI} ...`);

  const code = await new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url, REDIRECT_URI);
      if (url.pathname !== "/callback") return res.end();
      const c = url.searchParams.get("code");
      res.end(c ? "Authorized — you can close this tab." : "Authorization failed.");
      server.close();
      c ? resolve(c) : reject(new Error(url.searchParams.get("error") ?? "no code"));
    });
    server.listen(REDIRECT_PORT);
    setTimeout(() => {
      server.close();
      reject(new Error("timed out after 5 minutes"));
    }, 300_000).unref();
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });
  const tokens = await res.json();
  if (!res.ok || !tokens.refresh_token) {
    console.error(`FAIL: token exchange — ${tokens.error_description ?? tokens.error ?? res.status}`);
    process.exit(1);
  }
  saveEnvKey("GOOGLE_OAUTH_REFRESH_TOKEN", tokens.refresh_token);
  console.log("\nPASS: refresh token saved to website/.env.local (gitignored).");
  console.log("Next: node tools/migrate-posts.mjs migrate   (dry run)");
}

// ------------------------------------------------------------- migrate ----
async function accessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: need("GOOGLE_OAUTH_CLIENT_ID"),
      client_secret: need("GOOGLE_OAUTH_CLIENT_SECRET"),
      refresh_token: need("GOOGLE_OAUTH_REFRESH_TOKEN"),
      grant_type: "refresh_token",
    }),
  });
  const tokens = await res.json();
  if (!res.ok || !tokens.access_token) {
    console.error(
      `FAIL: could not refresh access token (${tokens.error_description ?? tokens.error ?? res.status}). ` +
        "Re-run: node tools/migrate-posts.mjs auth",
    );
    process.exit(1);
  }
  return tokens.access_token;
}

// Title-only key: publish dates shift across timezones (archive is +07:00,
// the target blog reports its own zone), so date parts don't compare safely.
// All titles in this corpus are unique — verified before migrating.
const dedupKey = (title) => title.trim().replace(/\s+/g, " ").toLowerCase();

async function cmdMigrate() {
  const execute = process.argv.includes("--execute");
  const limitIdx = process.argv.indexOf("--limit");
  const limit = limitIdx !== -1 ? Number(process.argv[limitIdx + 1]) : Infinity;
  const apiKey = need("BLOGGER_API_KEY");
  const targetBlogId = need("BLOG_ID");

  const archive = JSON.parse(readFileSync(ARCHIVE, "utf8"));
  const posts = [...archive.posts].sort((a, b) => a.published.localeCompare(b.published));

  // title-only dedup is safe only if archive titles are unique — verify
  const titleKeys = posts.map((p) => dedupKey(p.title));
  if (new Set(titleKeys).size !== titleKeys.length) {
    console.error("FAIL: archive contains duplicate titles — dedup by title is unsafe, aborting");
    process.exit(1);
  }
  console.log(
    `Source archive: ${posts.length} posts from "${archive.source.name}" (archived ${archive.archivedAt.slice(0, 10)})`,
  );
  console.log(`Target blog id: ${targetBlogId}`);
  console.log(execute ? "Mode: EXECUTE (writing)\n" : "Mode: dry run (pass --execute to write)\n");

  // existing posts on the target → idempotency set
  const existing = new Set();
  let pageToken;
  do {
    const qs = new URLSearchParams({
      maxResults: "50",
      fetchBodies: "false",
      fields: "nextPageToken,items(title,published)",
      key: apiKey,
      ...(pageToken ? { pageToken } : {}),
    });
    const res = await fetch(`${API}/blogs/${targetBlogId}/posts?${qs}`);
    if (!res.ok) {
      console.error(`FAIL: cannot list target blog posts (HTTP ${res.status})`);
      process.exit(1);
    }
    const data = await res.json();
    for (const p of data.items ?? []) existing.add(dedupKey(p.title));
    pageToken = data.nextPageToken;
  } while (pageToken);
  console.log(`Target currently has ${existing.size} post(s).\n`);

  const token = execute ? await accessToken() : null;
  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const post of posts) {
    if (inserted >= limit) break;
    const label = `"${post.title}" (${post.published.slice(0, 10)})`;
    if (existing.has(dedupKey(post.title))) {
      skipped++;
      console.log(`  SKIP    ${label} — already on target`);
      continue;
    }
    if (!execute) {
      inserted++;
      console.log(`  WOULD   ${label}  labels: ${(post.labels ?? []).join(", ") || "-"}`);
      continue;
    }

    let done = false;
    for (let attempt = 0; !done && attempt <= RETRY_DELAYS_MS.length; attempt++) {
      const res = await fetch(`${API}/blogs/${targetBlogId}/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "blogger#post",
          title: post.title,
          content: post.content ?? "",
          labels: post.labels ?? [],
          published: post.published, // preserve the original publish date
        }),
      });
      if (res.ok) {
        const created = await res.json();
        inserted++;
        done = true;
        console.log(`  INSERT  ${label} → ${created.url}`);
      } else if (res.status === 429 && attempt < RETRY_DELAYS_MS.length) {
        const wait = RETRY_DELAYS_MS[attempt];
        console.log(`  429     ${label} — rate-limited, retrying in ${wait / 1000}s (attempt ${attempt + 1})`);
        await sleep(wait);
      } else {
        failed++;
        done = true;
        const body = await res.json().catch(() => ({}));
        console.error(`  FAIL    ${label} — HTTP ${res.status} ${body?.error?.message ?? ""}`);
      }
    }
    await sleep(INSERT_DELAY_MS);
  }

  console.log(
    `\n${execute ? "RESULT" : "DRY RUN"}: ${inserted} ${execute ? "inserted" : "to insert"}, ${skipped} skipped${failed ? `, ${failed} FAILED` : ""}`,
  );
  if (execute && !failed) {
    console.log(
      "Verify with:\n  node tools/analyze-source-blog.mjs https://tpamoyudan.blogspot.com/\n" +
        "(expect 35 posts, 2009-05-21…2011-10-21, same label histogram)",
    );
  }
  if (failed) process.exit(1);
}

if (command === "auth") await cmdAuth();
else if (command === "migrate") await cmdMigrate();
else {
  console.error("Usage: node tools/migrate-posts.mjs <auth | migrate [--execute] [--limit N]>");
  process.exit(1);
}
