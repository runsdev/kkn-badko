import type { MetadataRoute } from "next";
import { monthsByYear } from "@/lib/archive";
import { listAllPosts, listArchiveIndex } from "@/lib/blogger";
import { LABEL_ORDER } from "@/lib/labels";
import { siteUrl } from "@/lib/site";

// NFR-015 / PROJECT_PLAN 2.4.2 — sitemap over all posts + static routes.
// Refreshes with ISR like every other Blogger-backed route.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    // D-08: the post list lives here now, so this is the archive's real root
    { url: `${base}/arsip`, changeFrequency: "daily", priority: 0.9 },
    // /tpa is a primary page of the post-D-06 IA, linked from both the hero
    // and the footer, so it belongs here alongside the other top-level routes.
    { url: `${base}/tpa`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.3 },
    // The label views are the archive's other real index. Emitted from the
    // taxonomy rather than from post data so the sitemap still lists them when
    // Blogger is unreachable.
    ...LABEL_ORDER.map((label) => ({
      url: `${base}/labels/${encodeURIComponent(label)}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
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

  // Month archives (D-07). Only months that actually hold posts are emitted, so
  // the sitemap never advertises an empty page. Derived, not enumerated, so a
  // newly published month appears on the next revalidation.
  let months: MetadataRoute.Sitemap = [];
  try {
    months = monthsByYear(await listArchiveIndex())
      .flatMap((group) => group.months)
      .map((m) => ({
        url: `${base}${m.href}`,
        changeFrequency: "yearly" as const,
        priority: 0.4,
      }));
  } catch {
    // same posture as above — a missing section beats a failed sitemap
  }

  return [...staticRoutes, ...posts, ...months];
}
