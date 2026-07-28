// Site-wide constants and public (browser-safe) configuration.
// Server-only secrets live in env.ts — never here (BR-004).

// Indonesian interface per D-06. The organisation's own name, shortened the
// way it is shortened locally: Badan Koordinasi -> Badko.
export const SITE_NAME = "Badko TPA Moyudan";
export const SITE_DESCRIPTION =
  "Arsip Badan Koordinasi TPA Kecamatan Moyudan — 35 catatan kegiatan, foto, dan bahan mengajar dari 2009 sampai 2011.";

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
