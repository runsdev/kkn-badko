# Admin & Deployment Runbook — kkn-badko-blog

*(PROJECT_PLAN task 3.1.2 — for whoever maintains the site technically.)*

## Architecture in one paragraph

Next.js (App Router, TypeScript, Tailwind) in `website/`, deployed on **Vercel** (root directory `website/`, auto-deploys on push to `main` at `github.com/runsdev/kkn-badko`). Content lives in Google **Blogger** (blog id in env; "Badan Koordinasi TPA Moyudan", `tpamoyudan.blogspot.com`) and is read server-side only, through one module — `src/lib/blogger.ts` — with a read-only API key. Every page is ISR-cached and refreshes at most every **600 s** (`ISR_REVALIDATE`). All Blogger HTML is sanitized in `src/lib/sanitize.ts` before rendering.

## Credentials (BR-004/BR-006)

| Credential | Where | Notes |
|------------|-------|-------|
| `BLOGGER_API_KEY` | Vercel project env + local `website/.env.local` | Read-only Google API key (Cloud project `runsdev`). Never in the repo, never sent to the browser. |
| `BLOG_ID` | same | Public identifier, not a secret. |
| `GOOGLE_OAUTH_*` | local `.env.local` only | Used once for the 2026 content migration. **Revoke the OAuth client in Cloud Console; delete these lines.** |

Key rotation: Cloud Console → Credentials → regenerate key → update Vercel env → redeploy.

## Environment variables (Vercel → Project → Settings → Environment Variables)

`BLOGGER_API_KEY`, `BLOG_ID`, `ISR_REVALIDATE=600`, `NEXT_PUBLIC_CONTACT_EMAIL`, and optionally `NEXT_PUBLIC_SITE_URL` (if unset, the code uses Vercel's auto-injected production URL).

## Routine operations

| Task | How |
|------|-----|
| Deploy | `git push` to `main` — CI (GitHub Actions: lint, format, typecheck, 23 tests, build) and Vercel build run automatically |
| Local dev | `cd website && npm install && npm run dev` (needs `.env.local`, template in `.env.example`) |
| All checks locally | `npm run lint && npm run typecheck && npm test && npm run build` |
| Verify Blogger access | `node tools/verify-blogger.mjs` (repo root) |
| Content inventory of any public blog | `node tools/analyze-source-blog.mjs <url>` |

## Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| New post not on site | ISR window — wait 10 min. Still missing: check the post is **published** (not draft) in Blogger. |
| Site shows "Something went wrong" | Blogger API failing **and** no warm cache. Check `node tools/verify-blogger.mjs`; check Google Cloud quota; a stale/rotated API key is the usual cause. |
| `/about` is 404 | No Blogger page titled About/Tentang exists, or ISR hasn't refreshed yet (10 min). |
| HTTP 429 from Blogger | Read quota exhausted (10k/day default) — almost impossible with ISR caching; check for a runaway script. |
| Old images broken | Legacy images live on the unrecoverable 2009 account's storage. Backups: `projects/kkn-badko-blog/03-content-migration/archive/images/` — re-insert via Blogger editor or serve from `website/public/`. |
| Build fails in CI on `format:check` | Run `npm run format` and commit. |

## Repo map

| Path | What |
|------|------|
| `website/` | The Next.js app (see `src/lib/` for the service layer, `src/app/` for routes) |
| `tools/` | Operational scripts (verify, analyze, archive, migrate) |
| `projects/kkn-badko-blog/` | Waterfall artifacts: SRS + audit (02), migration plan + content archive (03), QA report (04), these guides (05) |
| `export/` | .docx exports of stakeholder documents (pandoc-generated) |
| `.github/workflows/ci.yml` | CI pipeline |

## Incident contact & escalation

1. Reader-facing outage → check https://kkn-badko.vercel.app/ and Vercel dashboard (build/runtime logs).
2. Content problems → Content Owner via the User Guide.
3. Credential compromise → rotate the API key immediately (it is read-only; blast radius is quota abuse).
