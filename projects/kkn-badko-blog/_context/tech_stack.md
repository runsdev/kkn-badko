# Technology Stack & Architecture Constraints — kkn-badko-blog

> Grounded in `PROJECT_PLAN.md` §8 (Tooling & Stack) and the Phase 2 technical notes. Satisfies Royce Step 1 (design constraints exist before analysis).

## Stack

| Layer | Choice | Notes / Source |
|-------|--------|----------------|
| Framework | Next.js (App Router), React | PROJECT_PLAN §8 |
| Language | TypeScript | PROJECT_PLAN §8 (Quality) |
| Content source | Google Blogger API v3 | Core integration |
| Rendering | ISR — **10-minute (600 s) revalidation** | Decided; static-fast + periodic refresh |
| Styling | **Tailwind CSS** (decided — GAP-01 resolved 2026-07-24) | PROJECT_PLAN §8 |
| Hosting | **Vercel** (decided) | First-party Next.js host; ISR + CI/CD built in |
| CI/CD | GitHub + GitHub Actions / Vercel CI | PROJECT_PLAN §8 |
| Testing | Jest/Vitest + React Testing Library; Playwright (optional E2E) | PROJECT_PLAN §8 |
| Quality | ESLint, Prettier, TypeScript | PROJECT_PLAN §8 |

## Blogger API integration

- **Auth:** API key and/or OAuth — used **server-side only**; never shipped to the browser.
- **Key endpoints:** `posts.list`, `posts.get`, `posts.getByPath`, `pages.list`; labels via `posts.list?labels=`; search via `posts.list?q=`.
- **Service layer:** a server-side Blogger client (Next.js API routes / server components) mediates all calls, including native post comments.
- **Caching:** cache API responses + ISR (600 s) revalidation to stay within Blogger API quota.

## Architecture constraints

- API credentials are secrets (env vars / platform secret store); no secrets in the repo.
- Post HTML bodies from Blogger must be sanitized before render (XSS).
- Site is **read-only** against Blogger (decided) — no write-back; authoring stays in Blogger.
- Comments are **native Blogger comments** read via the API; moderation happens in Blogger.
- Contact is a **`mailto:` link** — no form backend and no stored user data.

## Decisions
- Hosting: **Vercel** (decided).
- Vercel plan: **Hobby (free) tier** — serverless function defaults (1024 MB memory, 10 s max duration) suffice for a stateless ISR read path (decided 2026-07-24; GAP-02 resolved; ratify at M1).
- ISR revalidation interval: **10 minutes / 600 s** (decided).
- Domain: **host subdomain at launch** (e.g. `*.vercel.app`); custom domain deferred (decided).
- UI library: **Tailwind CSS** (decided 2026-07-24; GAP-01 resolved; ratify at M1).

## Gaps to confirm
- None open — GAP-01/02 resolved above; GAP-03/04 resolved in `quality_standards.md` and SRS §3.3 / NFR-010.
