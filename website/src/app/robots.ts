import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// NFR-015 / PROJECT_PLAN 2.4.2
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
