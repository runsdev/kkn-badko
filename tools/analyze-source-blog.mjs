#!/usr/bin/env node
/**
 * analyze-source-blog.mjs — content-migration pre-analysis
 *
 * Read-only inventory of a public Blogger blog (default: the legacy
 * badkotpamoyudan blog) via the Blogger API v3 — no HTML scraping.
 * Reuses the API key from website/.env.local; the key is never printed.
 *
 * Usage: node tools/analyze-source-blog.mjs [blog-url] [--json <outfile>]
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DEFAULT_SOURCE = "https://badkotpamoyudan.blogspot.com/";
const API = "https://www.googleapis.com/blogger/v3";
const ENV_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "website", ".env.local");

const args = process.argv.slice(2);
const jsonIdx = args.indexOf("--json");
const jsonOut = jsonIdx !== -1 ? args[jsonIdx + 1] : null;
const sourceUrl = args.find((a) => a.startsWith("http")) ?? DEFAULT_SOURCE;

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

// 1. Resolve the blog by URL
const blog = await call(
  `${API}/blogs/byurl?url=${encodeURIComponent(sourceUrl)}&fields=id,name,url,published,updated,posts/totalItems,pages/totalItems`,
);
console.log(`Source blog: "${blog.name}" (${blog.url})`);
console.log(`  id: ${blog.id}`);
console.log(`  first published: ${blog.published?.slice(0, 10)}   last updated: ${blog.updated?.slice(0, 10)}`);
console.log(`  posts: ${blog.posts?.totalItems ?? 0}   pages: ${blog.pages?.totalItems ?? 0}\n`);

// 2. Walk every post (bodies included, for image/label/comment inventory)
const posts = [];
let pageToken;
do {
  const qs = new URLSearchParams({
    maxResults: "50",
    fields: "nextPageToken,items(id,url,title,published,labels,content,replies/totalItems)",
    ...(pageToken ? { pageToken } : {}),
  });
  const data = await call(`${API}/blogs/${blog.id}/posts?${qs}`);
  posts.push(...(data.items ?? []));
  pageToken = data.nextPageToken;
} while (pageToken);

const labelCount = new Map();
const imageHosts = new Map();
let totalImages = 0;
let totalComments = 0;
let unlabeled = 0;

for (const p of posts) {
  totalComments += p.replies?.totalItems ? Number(p.replies.totalItems) : 0;
  if (!p.labels?.length) unlabeled++;
  for (const l of p.labels ?? []) labelCount.set(l, (labelCount.get(l) ?? 0) + 1);
  for (const m of (p.content ?? "").matchAll(/<img[^>]+src="([^"]+)"/g)) {
    totalImages++;
    try {
      const host = new URL(m[1]).hostname;
      imageHosts.set(host, (imageHosts.get(host) ?? 0) + 1);
    } catch {
      imageHosts.set("(relative/invalid)", (imageHosts.get("(relative/invalid)") ?? 0) + 1);
    }
  }
}

const dates = posts.map((p) => p.published).sort();
console.log(`Posts fetched: ${posts.length}`);
if (posts.length) {
  console.log(`  date range: ${dates[0]?.slice(0, 10)} … ${dates[dates.length - 1]?.slice(0, 10)}`);
}
console.log(`  without labels: ${unlabeled}`);
console.log(`  total comments (native Blogger): ${totalComments}`);
console.log(`  inline images: ${totalImages}`);
if (imageHosts.size) {
  console.log("  image hosts:");
  for (const [host, n] of [...imageHosts].sort((a, b) => b[1] - a[1]))
    console.log(`    ${String(n).padStart(4)}  ${host}`);
}
if (labelCount.size) {
  console.log(`  labels (${labelCount.size}):`);
  for (const [label, n] of [...labelCount].sort((a, b) => b[1] - a[1]))
    console.log(`    ${String(n).padStart(4)}  ${label}`);
}

// 3. Static pages
const pagesData = await call(
  `${API}/blogs/${blog.id}/pages?fields=items(id,title,url,published)`,
).catch(() => ({}));
const pages = pagesData.items ?? [];
console.log(`\nStatic pages (${pages.length}):`);
for (const p of pages) console.log(`  - "${p.title}" (${p.published?.slice(0, 10)})`);

// 4. Optional JSON snapshot (no bodies — inventory only, bodies stay in Blogger)
if (jsonOut) {
  writeFileSync(
    jsonOut,
    JSON.stringify(
      {
        analyzedAt: new Date().toISOString(),
        source: { id: blog.id, name: blog.name, url: blog.url },
        totals: {
          posts: posts.length,
          pages: pages.length,
          comments: totalComments,
          images: totalImages,
          unlabeledPosts: unlabeled,
        },
        dateRange: posts.length ? [dates[0], dates[dates.length - 1]] : null,
        labels: Object.fromEntries([...labelCount].sort((a, b) => b[1] - a[1])),
        imageHosts: Object.fromEntries(imageHosts),
        posts: posts.map((p) => ({
          id: p.id,
          title: p.title,
          url: p.url,
          published: p.published,
          labels: p.labels ?? [],
          comments: p.replies?.totalItems ? Number(p.replies.totalItems) : 0,
        })),
        pages: pages.map((p) => ({ id: p.id, title: p.title, url: p.url })),
      },
      null,
      2,
    ),
  );
  console.log(`\nInventory written to ${jsonOut}`);
}
