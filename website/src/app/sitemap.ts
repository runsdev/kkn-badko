import type { MetadataRoute } from "next";
import { listAllPosts } from "@/lib/blogger";
import { siteUrl } from "@/lib/site";

// NFR-015 / PROJECT_PLAN 2.4.2 — sitemap over all posts + static routes.
// Refreshes with ISR like every other Blogger-backed route.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.3 },
  ];
  let posts: MetadataRoute.Sitemap = [];
  try {
    posts = (await listAllPosts()).map((p) => ({
      url: `${base}/posts/${p.slug}`,
      lastModified: p.updated,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  } catch {
    // upstream down: ship the static routes rather than failing the sitemap
  }
  return [...staticRoutes, ...posts];
}
