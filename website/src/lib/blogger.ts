import "server-only";
import { env } from "@/lib/env";
import { sanitize, toPlainText } from "@/lib/sanitize";
import { POSTS_PER_PAGE } from "@/lib/site";
import type { Post, PostComment, PostListResult, PostSummary, StaticPage } from "@/lib/types";

// Single choke point for all Blogger API v3 access (NFR-014).
// - The API key is attached here and only here; it never appears in error
//   messages, logs, or anything sent to the client (BR-004).
// - All HTML is sanitized before leaving this module (FR-008).
// - Every request carries `next.revalidate` so responses are served from the
//   ISR data cache and refreshed at most every ISR_REVALIDATE seconds (BR-003).

const API_BASE = "https://www.googleapis.com/blogger/v3";
const EXCERPT_LENGTH = 200;
const MAX_PAGE_WALK = 100; // hard stop for token walking on absurd page numbers
const LIST_FIELDS = "nextPageToken,items(id,url,title,published,labels,content)";
const POST_FIELDS = "id,url,title,published,labels,content,author/displayName";

export class BloggerApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "BloggerApiError";
  }
}

interface RawPost {
  id: string;
  url: string;
  title: string;
  published: string;
  content?: string;
  labels?: string[];
  author?: { displayName?: string };
}

interface RawPostList {
  nextPageToken?: string;
  items?: RawPost[];
}

async function bloggerFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const query = new URLSearchParams(params);
  query.set("key", env.bloggerApiKey);
  const res = await fetch(`${API_BASE}/blogs/${env.blogId}${path}?${query}`, {
    next: { revalidate: env.revalidateSeconds },
  });
  if (!res.ok) {
    // message deliberately excludes the URL — it carries the API key (BR-004)
    throw new BloggerApiError(`Blogger API responded ${res.status} for ${path}`, res.status);
  }
  return (await res.json()) as T;
}

export function slugFromPostUrl(url: string): string {
  const path = new URL(url).pathname;
  return path.slice(path.lastIndexOf("/") + 1).replace(/\.html$/, "");
}

function makeExcerpt(html: string): string {
  const text = toPlainText(html);
  if (text.length <= EXCERPT_LENGTH) return text;
  return `${text.slice(0, EXCERPT_LENGTH).replace(/\s+\S*$/, "")}…`;
}

function toSummary(raw: RawPost): PostSummary {
  return {
    id: raw.id,
    title: raw.title,
    slug: slugFromPostUrl(raw.url),
    published: raw.published,
    labels: raw.labels ?? [],
    excerpt: makeExcerpt(raw.content ?? ""),
  };
}

function toPost(raw: RawPost): Post {
  return {
    ...toSummary(raw),
    author: raw.author?.displayName ?? "",
    contentHtml: sanitize(raw.content ?? ""),
  };
}

export async function getBlogInfo(): Promise<{ name: string; totalPosts: number }> {
  const raw = await bloggerFetch<{ name: string; posts?: { totalItems?: number } }>("", {
    fields: "name,posts/totalItems",
  });
  return { name: raw.name, totalPosts: raw.posts?.totalItems ?? 0 };
}

// FR-001/002/004/005/006 — newest-first list, POSTS_PER_PAGE per page.
// Blogger paginates by opaque token, so page n is reached by walking n-1
// tokens (cheap: fetchBodies=false, each hop cached by ISR).
export async function listPostsPage(page: number): Promise<PostListResult> {
  const { totalPosts } = await getBlogInfo();
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  const empty: PostListResult = { posts: [], page, totalPages, totalPosts };
  if (page > totalPages || page > MAX_PAGE_WALK) return empty; // FR-006

  let pageToken: string | undefined;
  for (let hop = 1; hop < page; hop++) {
    const step = await bloggerFetch<RawPostList>("/posts", {
      maxResults: String(POSTS_PER_PAGE),
      fetchBodies: "false",
      fields: "nextPageToken",
      ...(pageToken ? { pageToken } : {}),
    });
    if (!step.nextPageToken) return empty;
    pageToken = step.nextPageToken;
  }

  const data = await bloggerFetch<RawPostList>("/posts", {
    maxResults: String(POSTS_PER_PAGE),
    fields: LIST_FIELDS,
    ...(pageToken ? { pageToken } : {}),
  });
  return { posts: (data.items ?? []).map(toSummary), page, totalPages, totalPosts };
}

// FR-007/010 — resolve /posts/[slug] by scanning the (cached) post index,
// then fetching the full post by id.
export async function getPostBySlug(slug: string): Promise<Post | null> {
  let pageToken: string | undefined;
  for (let hop = 0; hop < MAX_PAGE_WALK; hop++) {
    const data = await bloggerFetch<RawPostList>("/posts", {
      maxResults: "50",
      fetchBodies: "false",
      fields: "nextPageToken,items(id,url)",
      ...(pageToken ? { pageToken } : {}),
    });
    const match = (data.items ?? []).find((p) => slugFromPostUrl(p.url) === slug);
    if (match) {
      const raw = await bloggerFetch<RawPost>(`/posts/${match.id}`, { fields: POST_FIELDS });
      return toPost(raw);
    }
    if (!data.nextPageToken) return null;
    pageToken = data.nextPageToken;
  }
  return null;
}

// Sitemap support (NFR-015): every post's slug + last update, one walk.
export async function listAllPosts(): Promise<{ slug: string; updated: string }[]> {
  const all: { slug: string; updated: string }[] = [];
  let pageToken: string | undefined;
  for (let hop = 0; hop < MAX_PAGE_WALK; hop++) {
    const data = await bloggerFetch<{
      nextPageToken?: string;
      items?: { url: string; updated?: string; published: string }[];
    }>("/posts", {
      maxResults: "50",
      fetchBodies: "false",
      fields: "nextPageToken,items(url,updated,published)",
      ...(pageToken ? { pageToken } : {}),
    });
    for (const p of data.items ?? []) {
      all.push({ slug: slugFromPostUrl(p.url), updated: p.updated ?? p.published });
    }
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }
  return all;
}

// FR-011/012 — label value is URL-encoded by URLSearchParams (P-5)
export async function getPostsByLabel(label: string): Promise<PostSummary[]> {
  const data = await bloggerFetch<RawPostList>("/posts", {
    labels: label,
    maxResults: "50",
    fields: LIST_FIELDS,
  });
  return (data.items ?? []).map(toSummary);
}

// FR-013/014/015 — query is URL-encoded by URLSearchParams (P-3)
export async function searchPosts(q: string): Promise<PostSummary[]> {
  const data = await bloggerFetch<RawPostList>("/posts/search", {
    q,
    fields: LIST_FIELDS,
  });
  return (data.items ?? []).map(toSummary);
}

// FR-016 — read-only native Blogger comments. Returns null on failure so the
// UI hides the block entirely (SRS §3.2.6) instead of erroring the page.
export async function getPostComments(postId: string): Promise<PostComment[] | null> {
  try {
    const data = await bloggerFetch<{
      items?: {
        id: string;
        published: string;
        content?: string;
        author?: { displayName?: string };
      }[];
    }>(`/posts/${postId}/comments`, {
      maxResults: "50",
      fields: "items(id,published,content,author/displayName)",
    });
    return (data.items ?? []).map((c) => ({
      id: c.id,
      author: c.author?.displayName ?? "Anonymous",
      published: c.published,
      contentHtml: sanitize(c.content ?? ""),
    }));
  } catch {
    return null;
  }
}

// FR-018 — About content comes from Blogger static pages. Matches a known
// title, or falls back to the only page if exactly one exists.
const ABOUT_TITLES = ["about", "about us", "tentang", "tentang kami"];

export async function getAboutPage(): Promise<StaticPage | null> {
  const data = await bloggerFetch<{
    items?: { id: string; title: string; content?: string }[];
  }>("/pages", { fetchBodies: "true", fields: "items(id,title,content)" });
  const pages = data.items ?? [];
  const match =
    pages.find((p) => ABOUT_TITLES.includes(p.title.trim().toLowerCase())) ??
    (pages.length === 1 ? pages[0] : undefined);
  if (!match) return null;
  return { id: match.id, title: match.title, contentHtml: sanitize(match.content ?? "") };
}
