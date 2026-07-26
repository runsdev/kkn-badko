#!/usr/bin/env node
/**
 * archive-source-content.mjs — content-migration task 2.5, Option B step 1
 *
 * Full read-only archive of the legacy blog via the public Blogger API v3
 * (API key only — no admin access needed, which is the whole point: the
 * legacy account is unrecoverable, so this archive is the durable backup
 * and the input for tools/migrate-posts.mjs).
 *
 * Produces, under projects/kkn-badko-blog/03-content-migration/archive/:
 *   posts.json      — all posts WITH full HTML bodies
 *   comments.json   — all native comments (cannot be migrated as comments;
 *                     archived so their text is never lost)
 *   images/         — every inline image, downloaded
 *
 * Usage: node tools/archive-source-content.mjs [blog-url]
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DEFAULT_SOURCE = "https://badkotpamoyudan.blogspot.com/";
const API = "https://www.googleapis.com/blogger/v3";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_PATH = join(ROOT, "website", ".env.local");
const OUT_DIR = join(ROOT, "projects", "kkn-badko-blog", "03-content-migration", "archive");

const sourceUrl = process.argv[2] ?? DEFAULT_SOURCE;

function loadEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith("#")) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const key = loadEnv(ENV_PATH).BLOGGER_API_KEY;
if (!key || key.startsWith("REPLACE_WITH")) {
  console.error("FAIL: BLOGGER_API_KEY missing in website/.env.local");
  process.exit(1);
}

async function call(url) {
  const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}key=${key}`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (body?.error?.message ?? res.statusText).replaceAll(key, "***");
    throw new Error(`HTTP ${res.status} — ${msg}`);
  }
  return body;
}

mkdirSync(join(OUT_DIR, "images"), { recursive: true });

// 1. Resolve blog, walk all posts with bodies
const blog = await call(`${API}/blogs/byurl?url=${encodeURIComponent(sourceUrl)}&fields=id,name,url`);
console.log(`Archiving "${blog.name}" (${blog.url}, id ${blog.id})`);

const posts = [];
let pageToken;
do {
  const qs = new URLSearchParams({
    maxResults: "50",
    fields:
      "nextPageToken,items(id,url,title,published,updated,labels,content,author/displayName,replies/totalItems)",
    ...(pageToken ? { pageToken } : {}),
  });
  const data = await call(`${API}/blogs/${blog.id}/posts?${qs}`);
  posts.push(...(data.items ?? []));
  pageToken = data.nextPageToken;
} while (pageToken);
console.log(`  posts: ${posts.length} (with full bodies)`);

// 2. Comments for every post that has any
const comments = [];
for (const p of posts) {
  if (!Number(p.replies?.totalItems)) continue;
  const data = await call(
    `${API}/blogs/${blog.id}/posts/${p.id}/comments?fields=items(id,published,content,author/displayName)`,
  );
  for (const c of data.items ?? []) {
    comments.push({
      postId: p.id,
      postTitle: p.title,
      author: c.author?.displayName ?? "Anonymous",
      published: c.published,
      content: c.content ?? "",
    });
  }
}
console.log(`  comments: ${comments.length}`);

// 3. Download every inline image; record url → local file mapping
const imageMap = {};
let imgIndex = 0;
let imgFailed = 0;
for (const p of posts) {
  for (const m of (p.content ?? "").matchAll(/<img[^>]+src="([^"]+)"/g)) {
    const url = m[1];
    if (imageMap[url]) continue;
    imgIndex++;
    const base = decodeURIComponent(new URL(url).pathname.split("/").pop() || "image")
      .replace(/[^A-Za-z0-9._-]/g, "_")
      .slice(-80);
    const file = `${String(imgIndex).padStart(3, "0")}-${base}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      writeFileSync(join(OUT_DIR, "images", file), Buffer.from(await res.arrayBuffer()));
      imageMap[url] = `images/${file}`;
    } catch (e) {
      imgFailed++;
      imageMap[url] = `FAILED: ${e.message}`;
    }
  }
}
console.log(`  images: ${imgIndex - imgFailed} downloaded${imgFailed ? `, ${imgFailed} FAILED` : ""}`);

// 4. Write archives
writeFileSync(
  join(OUT_DIR, "posts.json"),
  JSON.stringify({ source: blog, archivedAt: new Date().toISOString(), imageMap, posts }, null, 2),
);
writeFileSync(join(OUT_DIR, "comments.json"), JSON.stringify(comments, null, 2));

console.log(`\nArchive written to ${OUT_DIR}`);
if (imgFailed) process.exit(1);
