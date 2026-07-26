# Content Migration Plan — Legacy Blog → New Blog

| Field | Value |
|-------|-------|
| **Document** | Content migration analysis & plan (PROJECT_PLAN task 2.5, scope addendum) |
| **System** | kkn-badko-blog — the website itself is unaffected; migration happens Blogger-to-Blogger |
| **Source** | `https://badkotpamoyudan.blogspot.com/` — "Badan Koordinasi TKA - TPA Kecamatan Moyudan" (blog id `73173088394329522`) |
| **Target** | `https://tpamoyudan.blogspot.com/` — "Badan Koordinasi TPA Moyudan" (blog id in `website/.env.local`, `BLOG_ID`) |
| **Version** | 1.0 |
| **Date** | 2026-07-26 |
| **Status** | **COMPLETE 2026-07-26** — Option B executed and verified: 35/35 posts on the target blog (§9) |

## 1. Purpose

The organization's historical content (2009–2011) lives on a legacy Blogger blog. The new website (Phase 2) reads exclusively from the new blog via the Blogger API v3. This plan covers analyzing the legacy content and bringing it into the **new** blog so the website serves it — after which the new blog is the single content source going forward (consistent with SRS §2.1: Blogger remains the only authoring platform).

**Explicitly not a scraping task.** The legacy blog is public, so its full content is readable through the same Blogger API v3 the website already uses — no HTML scraping is needed or planned (analysis was done with `tools/analyze-source-blog.mjs`, read-only, API-key only).

## 2. Source analysis (run 2026-07-26)

Full machine-readable inventory: `source-blog-inventory.json` (committed alongside this plan). Re-runnable anytime:

```
node tools/analyze-source-blog.mjs https://badkotpamoyudan.blogspot.com/
```

| Item | Finding | Migration consequence |
|------|---------|----------------------|
| Posts | **35**, published 2009-05-21 … 2011-10-21, all labeled | Small corpus — any option is low-effort |
| Labels | 6: FOTO (20), BERITA (7), TIPS (5), PROFIL (2), LINK (1), BCM (1) | Taxonomy carries over as-is; site renders labels dynamically (FR-011) |
| Comments | **4** native Blogger comments | Preserved **only** by native import (Option A); API writes cannot recreate other people's comments |
| Inline images | 20, **all** on `blogger.googleusercontent.com` | Stay on Google's CDN — valid after migration with no re-hosting; sanitizer already allows https images (FR-008). QA must spot-check that 2009-era image URLs still resolve |
| Static pages | 0 | Nothing to migrate; the new blog still needs its own About page (FR-018) |
| Blog `updated` timestamp | 2024-12-19 — years after the last post | Someone with admin access touched the legacy blog recently → Option A's access prerequisite is likely satisfiable |

## 3. Options considered

| # | Approach | Prerequisite | Preserves | Effort | Verdict |
|---|----------|--------------|-----------|--------|---------|
| **A** | **Blogger native export/import**: legacy dashboard → Settings → *Back up content* (Atom XML) → new blog dashboard → *Import content* | Admin access to the legacy blog | Posts, publish dates, labels, **comments**, authorship | ~3 hrs incl. verification | **Recommended** |
| B | **API copy**: read legacy posts via API (public), write to new blog via `posts.insert` with OAuth (scope `https://www.googleapis.com/auth/blogger`) — the OAuth client created earlier in project `runsdev` becomes useful here | OAuth consent as an author of the **new** blog only | Posts, publish dates (settable), labels. **Comments lost** (4), author shown as importer | ~6 hrs (script + quota care) | Fallback if A's access is unavailable |
| C | HTML scraping of the public site | none | Degraded everything | high | **Rejected** — pointless; the API already serves the same data cleanly |
| D | No migration: point the website's `BLOG_ID` at the legacy blog | none | n/a | 0 | Rejected — splits authoring across two blogs or freezes content in the legacy one; contradicts the single-source decision |

## 4. Decision gate — D-05 (stakeholder)

> **D-05: Does the Project Owner have admin access to the legacy blog (`badkotpamoyudan.blogspot.com`)?**
> - Yes → execute **Option A**.
> - No, and access can't be recovered → execute **Option B**, accepting loss of 4 comments and original authorship display.

**RESOLVED 2026-07-26: No — Option B selected.** The legacy blog belongs to a Blogger account that authenticated via **Yahoo credentials**, a sign-in path Google no longer supports; the account is unrecoverable. Consequences accepted: the 4 native comments cannot be recreated as comments (their text is preserved in `archive/comments.json`), and migrated posts will show the new blog's author. The unrecoverable account also means the legacy content could disappear permanently if Google ever purges the orphaned account — which is why the full archive (§6 step 0) was taken immediately upon this decision, before execution of anything else.

## 5. Data mapping (both options)

| Legacy field | Target | Notes |
|--------------|--------|-------|
| Post title | Post title | unchanged |
| Post HTML body | Post HTML body | unchanged in Blogger; website sanitizes at render (FR-008) — legacy markup (2009-era `<font>`, inline styles) is stripped/normalized by the sanitizer, no pre-cleaning needed |
| Publish date | Publish date | A: preserved automatically. B: set `published` on insert |
| Labels | Labels | unchanged (FOTO, BERITA, TIPS, PROFIL, LINK, BCM) |
| Image URLs | unchanged | remain on `blogger.googleusercontent.com` |
| Comments (4) | A: imported / B: dropped | |
| Post URL/slug | regenerated by Blogger from title + original date | site slugs (`/posts/[slug]`) derive from the URL basename → effectively identical; redirects from old blogspot URLs are **out of scope** for v1.0 |

## 6. Execution procedure

**Option A (native import):**
1. Legacy blog dashboard → Settings → Manage blog → **Back up content** → download the Atom XML file. Keep it out of the repo (it's content, not code — store with the Project Owner).
2. New blog dashboard → Settings → Manage blog → **Import content** → upload the file → choose **publish immediately** (not drafts).
3. Run the import **once only** — re-importing duplicates posts; Blogger has no built-in dedup.
4. Verify (§7). If the result is wrong, delete the imported posts from the new blog (it currently has 0 posts, so everything present post-import is removable without loss) and retry.

**Option B (API copy)** — SELECTED (D-05). Pipeline is archive-first: migration reads from the committed archive, not from the live legacy blog, so it keeps working even if the legacy blog vanishes.

0. **Archive (done 2026-07-26):** `node tools/archive-source-content.mjs` → `archive/posts.json` (35 posts, full bodies), `archive/comments.json` (4), `archive/images/` (20/20 downloaded, 1.1 MB) — all committed. This is the durable backup of the unrecoverable account's content.
1. **OAuth setup (Owner, one-off):** in Cloud Console (project `runsdev`) add `http://localhost:8765/callback` to the OAuth client's Authorized redirect URIs; put the client id/secret into `website/.env.local` (`GOOGLE_OAUTH_CLIENT_ID/_SECRET`); run `node tools/migrate-posts.mjs auth` signed in as an author/admin of the **new** blog — the refresh token is saved to `.env.local` automatically (never committed, BR-006).
2. **Dry run (verified 2026-07-26):** `node tools/migrate-posts.mjs migrate` — lists what would be inserted; idempotency check against the target confirmed working (35 to insert, 0 skipped on empty target).
3. **Test batch:** `node tools/migrate-posts.mjs migrate --execute --limit 1` → check the post on the new blog and the website (`npm run dev`).
4. **Full run:** `node tools/migrate-posts.mjs migrate --execute` — oldest-first, original `published` dates preserved, labels carried over, throttled 1.5 s/insert; safe to re-run (already-migrated posts are skipped).
5. Verify (§7) and fill in §9.

## 7. Verification (either option)

1. `node tools/analyze-source-blog.mjs https://tpamoyudan.blogspot.com/` — expect: 35 posts, date range 2009-05-21…2011-10-21, identical label histogram, 20 images, and (Option A) 4 comments.
2. `node tools/verify-blogger.mjs` — still PASS.
3. Website spot-check (local `npm run dev` or production): home lists 10 newest legacy posts with pagination "Page 1 of 4"; `/labels/FOTO` shows 20; a 2009 post renders with images; the post with comments shows them read-only.
4. Record the result in this document (§9) and, if migration precedes launch, in the M-milestone notes.

## 8. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| ~~Double import → duplicated posts~~ | ~~Med~~ | Closed by design: `migrate-posts.mjs` skips posts already on the target (title + publish date), verified in dry run |
| ~~Legacy admin access actually unavailable~~ | — | **Realized** (Yahoo-linked account, D-05) → Option B in effect; 4 comments preserved as text in `archive/comments.json` |
| Legacy content purged by Google (orphaned account) before/after migration | High → Low | **Mitigated 2026-07-26:** full content archive committed to the repo (posts, comments, images); migration reads from the archive, not the live blog |
| Image URLs (`blogger.googleusercontent.com`, legacy account's storage) die later | Med | All 20 images archived in-repo; if links break post-launch, re-host from `archive/images/` (e.g. re-insert via Blogger editor or serve from `website/public/`) and update the affected posts |
| Blogger write quota (Option B) | Low | 35 posts « daily quota; 1.5 s throttle between inserts |

## 9. Execution record

| Date | Step | Result | Verified by |
|------|------|--------|-------------|
| 2026-07-26 | D-05 decided: No legacy access (Yahoo-linked account) → Option B | — | Project Owner |
| 2026-07-26 | Archive (§6 step 0): 35 posts + 4 comments + 20/20 images | PASS — committed | Developer |
| 2026-07-26 | Dry run (§6 step 2): 35 to insert, 0 skipped, target has 0 posts | PASS | Developer |
| 2026-07-26 | OAuth setup + first execute run by Owner: 9 inserted, then HTTP 429 (write quota); 1 duplicate created (dedup keyed on title+date, but dates shift timezones) | partial | Owner |
| 2026-07-26 | Fixes: title-only dedup + 429 backoff (commit `878f1b9`); duplicate post moved to Blogger trash | PASS | Developer |
| 2026-07-26 | Full run: **26 inserted, 9 skipped, 0 failed** → target has 35/35 posts | PASS | Developer |
| 2026-07-26 | §7 verification: 35 posts, identical label histogram (FOTO 20 / BERITA 7 / TIPS 5 / PROFIL 2 / LINK 1 / BCM 1), 20/20 images on Google CDN; website spot-check — home lists newest-first, `/labels/FOTO` filters, post detail renders with images (dates display in the target blog's timezone, one day earlier than source — cosmetic, accepted) | **PASS — migration complete** | Developer |
