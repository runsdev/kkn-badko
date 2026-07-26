// Site-wide constants and public (browser-safe) configuration.
// Server-only secrets live in env.ts — never here (BR-004).

export const SITE_NAME = "KKN BADKO Blog";
export const SITE_DESCRIPTION =
  "Blog of Badan Koordinasi TPA Moyudan — content authored in Google Blogger.";

// SRS §3.2.9 global parameter
export const POSTS_PER_PAGE = 10;

export function siteUrl(): string {
  // explicit env wins; on Vercel fall back to the auto-injected production
  // host so sitemap/canonical/OG URLs are correct without manual config
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

// FR-019: Contact page mailto target
export function contactEmail(): string {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
}
