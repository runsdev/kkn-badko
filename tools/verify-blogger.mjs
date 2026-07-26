#!/usr/bin/env node
/**
 * verify-blogger.mjs — Phase 1 task 1.3.1 (PROJECT_PLAN)
 *
 * Verifies the Blogger API v3 credentials in website/.env.local by calling:
 *   1. blogs.get    — blog metadata (name, URL, post/page counts)
 *   2. posts.list   — first 3 posts (title, published, labels)
 *   3. pages.list   — static pages (needed for the About page, FR-018)
 *
 * Read-only; uses only the server-side API key (BR-004). The key is never
 * printed — it is stripped from any URL that appears in error output.
 *
 * Usage: node tools/verify-blogger.mjs
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ENV_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "website", ".env.local");
const API = "https://www.googleapis.com/blogger/v3";

// -- minimal .env parser (no deps) -------------------------------------------
function loadEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith("#")) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const redact = (s, key) => String(s).replaceAll(key, "***REDACTED***");

async function call(pathAndQuery, key) {
  const url = `${API}${pathAndQuery}${pathAndQuery.includes("?") ? "&" : "?"}key=${key}`;
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.error?.message ?? res.statusText;
    throw new Error(`HTTP ${res.status} on ${pathAndQuery} — ${redact(msg, key)}`);
  }
  return body;
}

// -- checks -------------------------------------------------------------------
const env = loadEnv(ENV_PATH);
const { BLOGGER_API_KEY: key, BLOG_ID: blogId } = env;

if (!key || !blogId || /REPLACE_WITH/.test(key + blogId)) {
  console.error("FAIL: BLOGGER_API_KEY and/or BLOG_ID missing or still placeholder in website/.env.local");
  process.exit(1);
}

let failed = false;
const ok = (label, detail) => console.log(`  PASS  ${label}${detail ? ` — ${detail}` : ""}`);
const bad = (label, err) => { failed = true; console.error(`  FAIL  ${label} — ${redact(err.message, key)}`); };

console.log(`Verifying Blogger API v3 access (blog ${blogId})\n`);

// 1. blogs.get
try {
  const blog = await call(`/blogs/${blogId}?fields=name,url,posts/totalItems,pages/totalItems,updated`, key);
  ok("blogs.get", `"${blog.name}" (${blog.url}) — ${blog.posts?.totalItems ?? 0} posts, ${blog.pages?.totalItems ?? 0} pages, updated ${blog.updated}`);
} catch (e) { bad("blogs.get", e); }

// 2. posts.list — the core of task 1.3.1
try {
  const posts = await call(`/blogs/${blogId}/posts?maxResults=3&fetchBodies=false&fields=nextPageToken,items(title,published,labels,url)`, key);
  const items = posts.items ?? [];
  ok("posts.list", `${items.length} post(s) returned${posts.nextPageToken ? ", pagination token present (FR-005 viable)" : ""}`);
  for (const p of items) {
    console.log(`          · "${p.title}" (${p.published?.slice(0, 10)})${p.labels ? `  labels: ${p.labels.join(", ")}` : ""}`);
  }
  if (items.length === 0) console.log("          note: blog has no posts yet — API works, but add a post to test list/detail rendering.");
} catch (e) { bad("posts.list", e); }

// 3. pages.list — About page source (FR-018)
try {
  const pages = await call(`/blogs/${blogId}/pages?fetchBodies=false&fields=items(title,url)`, key);
  const items = pages.items ?? [];
  ok("pages.list", items.length ? items.map((p) => `"${p.title}"`).join(", ") : "no static pages yet (About page FR-018 will 404 until one exists)");
} catch (e) { bad("pages.list", e); }

console.log(failed ? "\nRESULT: FAIL — fix the errors above before Phase 2." : "\nRESULT: PASS — credentials valid, task 1.3.1 verified.");
process.exit(failed ? 1 : 0);
