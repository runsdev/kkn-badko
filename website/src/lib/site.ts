// Site-wide constants and public (browser-safe) configuration.
// Server-only secrets live in env.ts — never here (BR-004).

// Indonesian interface per D-06. The organisation's own name, shortened the
// way it is shortened locally: Badan Koordinasi -> Badko.
export const SITE_NAME = "Badko TPA Moyudan";
export const SITE_DESCRIPTION =
  "Arsip Badan Koordinasi TPA Kecamatan Moyudan — 35 catatan kegiatan, foto, dan bahan mengajar dari 2009 sampai 2011.";

// SRS §3.2.9 global parameter
export const POSTS_PER_PAGE = 10;

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]", "::1"]);

/** True for a host nothing outside this machine can resolve. */
function isLoopback(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return LOOPBACK_HOSTS.has(hostname) || hostname.endsWith(".localhost");
  } catch {
    return false; // unparseable is a different problem; don't claim it's local
  }
}

export function siteUrl(): string {
  // A trailing slash would produce "https://host//arsip" everywhere the callers
  // build paths by concatenation (sitemap.ts, the JSON-LD mainEntityOfPage).
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

  // Explicit config wins — EXCEPT a loopback address on a real deployment,
  // which is only ever a leftover from local development.
  //
  // This is not hypothetical. `NEXT_PUBLIC_SITE_URL=http://localhost:3000` was
  // set in Vercel production and won this precedence order, which put
  // `<link rel="canonical" href="http://localhost:3000/...">` on every page of
  // the live site — a page nominating an unreachable host as its preferred URL,
  // i.e. the strongest available instruction not to index it — plus a
  // sitemap.xml whose 38 URLs were all uncrawlable. Silent, and invisible from
  // inside the repo. See 07-seo/SEO_Plan.md §1.
  //
  // Local development is unaffected: VERCEL_PROJECT_PRODUCTION_URL is absent
  // there, so an explicit localhost is still honoured.
  if (explicit && !(vercelHost && isLoopback(explicit))) return explicit;
  if (vercelHost) return `https://${vercelHost}`;
  return "http://localhost:3000";
}

// FR-019: Contact page mailto target
export function contactEmail(): string {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
}
