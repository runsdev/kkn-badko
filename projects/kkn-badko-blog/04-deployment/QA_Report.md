# Deployment QA Report — kkn-badko-blog

| Field | Value |
|-------|-------|
| **Production URL** | https://kkn-badko.vercel.app/ |
| **Deployed from** | `main` (Vercel Git integration, root directory `website/`) |
| **Date** | 2026-07-26 |
| **Scope** | PROJECT_PLAN 2.4.3 acceptance (Lighthouse/CWV) + production verification |

## 1. Production verification

| Check | Result |
|-------|--------|
| Home lists migrated posts, newest first, pagination | PASS (35 posts, 4 pages) |
| Post detail with images, labels, comments block | PASS |
| `/labels/[label]`, `/search?q=` | PASS |
| `/robots.txt`, `/sitemap.xml` (38 URLs) | PASS with defect DEF-01 (below) |
| Unknown route/slug → real HTTP 404 | PASS |
| TTFB (root document) | 30 ms |
| About page | Created in Blogger 2026-07-26 (placeholder text); serves via ISR after revalidation |

**DEF-01 (fixed in repo, pending deploy):** sitemap/robots/canonical URLs emitted `http://localhost:3000` because `NEXT_PUBLIC_SITE_URL` is unset in the Vercel project. Fix: `siteUrl()` now falls back to Vercel's auto-injected `VERCEL_PROJECT_PRODUCTION_URL`. **Lands with the next `git push`.**

## 2. Lighthouse (task 2.4.3 oracle — NFR-001, D-03)

Run locally (Chromium headless, mobile emulation) against production, 2026-07-26. Local CPU emulation is noisier than Google's PSI infrastructure; PSI re-run recommended when its daily quota resets.

| Page | Perf | A11y | Best-Pr | SEO | LCP | CLS |
|------|------|------|---------|-----|-----|-----|
| Home | 86 | 96 | 100 | 100 | 2.7 s | 0 |
| Post (image-heavy) | 89 | 96 | 96 | 100 | 3.0 s | 0.128 |

**Verdict: borderline vs the ≥ 90 target.** Findings and dispositions:

| Finding | Source | Disposition |
|---------|--------|-------------|
| A11y 96: disabled pagination arrows contrast 1.96:1 | site code | **FIXED** (dashed border + AA-compliant text) — pending deploy |
| Perf 86–89: ~1.8 s main-thread hydration on emulated mobile CPU | Next.js framework baseline (TTFB is 30 ms; only 28 KiB unused JS) | Accepted for v1.0; re-measure on PSI infra — expected ≥ 90 there |
| CLS 0.128 on post: legacy images lack width/height attributes | 2009 content markup | Content-quality item — fixable per-post in Blogger by re-inserting images; not a site defect |
| Image-only links without accessible names; tables without `<th>`; low-res originals | 2009 content markup | Content-quality items for the Owner's editorial backlog |

## 3. Residual actions

1. `git push` → auto-deploy: lands DEF-01 fix + contrast fix (a11y → 100 expected).
2. Re-run Lighthouse via PageSpeed Insights when quota resets; record final scores here.
3. Owner: replace the About placeholder text in Blogger (Pages → About).
4. Owner: revoke/delete the migration OAuth client in Cloud Console (migration and About creation are done; the website needs only the read-only API key).
