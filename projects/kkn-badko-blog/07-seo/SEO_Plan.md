# SEO: research and plan

**Date:** 2026-07-28
**Goal (stakeholder):** someone searching *tpa moyudan*, *badko tpa moyudan*, or similar finds this site.
**Live at:** `https://badkotpamoyudan.vercel.app` — renamed from `tpamoyudan.vercel.app` on 2026-07-28.
**Status:** research complete, plan awaiting decisions (**D-10**, **D-11**)

> **Update, 2026-07-28 — the domain rename.** `badkotpamoyudan.vercel.app` now serves the site and the old `tpamoyudan.vercel.app` returns `404`, so the rename created no fourth duplicate origin. The new name is a real improvement beyond tidiness: it matches the organisation's own name and the original blog's address (`badkotpamoyudan.blogspot.com`), which is the exact string people and documents use. §3's naming argument is partly satisfied by the hostname itself now.
>
> The rename did **not** fix §1 — an environment variable is unaffected by a project rename, and canonicals on the live site still read `http://localhost:3000`. That has since been addressed in code; see §1.

---

## 1. What the live site tells Google today

Measured against `https://tpamoyudan.vercel.app` on 2026-07-28, not inferred from the source.

```
GET /robots.txt
    User-Agent: *
    Allow: /
    Sitemap: http://localhost:3000/sitemap.xml     ← unreachable host

GET /sitemap.xml                                    38 URLs, every one:
    <loc>http://localhost:3000/</loc>
    <loc>http://localhost:3000/posts/link</loc>     ← unreachable host

GET /posts/tuyul
    <link rel="canonical" href="http://localhost:3000/posts/tuyul"/>
    <meta property="og:url" content="http://localhost:3000/posts/tuyul"/>
```

**Every page on the live site declares its canonical URL to be a host that does not exist on the public internet.** A canonical tag is not a hint Google weighs against other evidence — it is the page nominating its own preferred URL. Nominating `localhost` is the strongest possible instruction not to index this page. The sitemap compounds it: all 38 entries are uncrawlable, so the one file whose job is to introduce the site introduces nothing.

Cause: `NEXT_PUBLIC_SITE_URL=http://localhost:3000` is set in the Vercel production environment. `siteUrl()` (`src/lib/site.ts:13-20`) checks that variable first, so it wins over the correct fallback.

### Fixed in code, 2026-07-28 — no Vercel change required

Deleting the variable in Vercel would work, but it leaves the trap armed: the next person to paste a `localhost` value into an environment panel silently de-indexes the site again, and nothing in the repo would show it. `siteUrl()` (`src/lib/site.ts`) now **ignores a loopback address whenever a real deployment host is present**:

```ts
if (explicit && !(vercelHost && isLoopback(explicit))) return explicit;
if (vercelHost) return `https://${vercelHost}`;
return "http://localhost:3000";
```

The guard is deliberately narrow. A legitimate explicit host still wins — that is how the site moves to a custom domain later (Phase 2) — and local development is untouched, because `VERCEL_PROJECT_PRODUCTION_URL` is absent there so an explicit `localhost` is still honoured. `localhost.example.com` is not treated as loopback. Trailing slashes and surrounding whitespace are also stripped, since every caller builds paths by concatenation and `https://host//arsip` was one paste away.

Proven by building with the broken production environment still set — `NEXT_PUBLIC_SITE_URL=http://localhost:3000` **and** `VERCEL_PROJECT_PRODUCTION_URL=badkotpamoyudan.vercel.app`:

```
robots.txt   Sitemap: https://badkotpamoyudan.vercel.app/sitemap.xml
sitemap.xml  <loc>https://badkotpamoyudan.vercel.app/</loc>          (55 URLs, was 38)
arsip.html   <link rel="canonical" href="https://badkotpamoyudan.vercel.app/arsip"/>
```

Covered by 16 tests in `src/lib/site.test.ts`. **Deploying the current working tree therefore fixes §1 on its own.** Clearing the variable in Vercel is still worth doing for hygiene, but it is no longer load-bearing.

### The deployment is also stale

```
og:title       "KKN BADKO Blog"
description    "Blog of Badan Koordinasi TPA Moyudan — content authored in Google Blogger."
```

That is pre-redesign copy, in English. Markers from the current code — *Catatan terbaru*, *Direktori TPA*, *Badko TPA Moyudan* — appear **zero** times in the live HTML. The whole redesign, the TPA directory, the archive board, and the derived Indonesian copy are sitting uncommitted in the working tree.

The live `og:description` also still carries the excerpt bug fixed on 2026-07-28: *"mempunyai TUYULMaksudnya TUYUL :TEKAD."* Every crawler and every social preview is being served that string right now.

**Nothing else in this document matters until these two things are fixed.** The site is currently invisible by instruction, and what little is visible is the wrong content.

---

## 2. The same 35 posts are live on three origins

| Origin | What it is | Indexed? |
|---|---|---|
| `badkotpamoyudan.blogspot.com` | The **original** blog, 2009–2011. 35 posts. `HTTP 200`. | **Yes — this is what Google returns** for "Badan Koordinasi TPA Moyudan" |
| `tpamoyudan.blogspot.com` | The **migration target**, `BLOG_ID 1097072164556393049`. Same 35 posts + the 2026 test post. The CMS this site reads from. | Not surfacing |
| `badkotpamoyudan.vercel.app` | This site, rendering the migration target. Renamed 2026-07-28; the old `tpamoyudan.vercel.app` now `404`s. | Canonicals pointed at localhost until §1 was fixed; not yet redeployed |

Verified: the original blog's feed still reports `totalResults: 35` under the title *"Badan Koordinasi TKA - TPA Kecamatan Moyudan"*, and a web search for the organisation returns **that** blog, with its 2009 Diklat, Festival Anak Sholeh, and wisuda posts — the same posts this site serves.

So the site is competing for its own content against two copies, and losing to the one that has had fifteen years to accumulate trust. Duplicate content is not penalised, but Google picks one URL per cluster and it is currently picking blogspot. Consolidating is worth more than any on-page change in this document.

The comment link shipped on 2026-07-27 points at `tpamoyudan.blogspot.com`. Applying `noindex` there does **not** break it — `noindex` governs indexing, not access.

---

## 3. What "TPA Moyudan" actually returns — and the honest read on it

Two findings that shape what is winnable.

**"TPA" is ambiguous, and the other meaning is winning.** In Sleman, *TPA* also means *Tempat Pemrosesan Akhir* — landfill. A search for "TPA Moyudan" surfaces the planned **TPST Moyudan** waste-processing facility, Sleman's waste-management coordination meetings, and TPA Piyungan. These are government-domain pages on `slemankab.go.id` about an active, newsworthy infrastructure project. **Bare "TPA Moyudan" is not realistically winnable, and chasing it is the wrong target.**

What *is* winnable, because intent is unambiguous and competition is thin:

- `badko tpa moyudan`, `badko tka-tpa moyudan`, `badko tpa kapanewon moyudan`
- `tka-tpa moyudan`, `tpa kecamatan moyudan`
- Named units: `tpa al-furqon sumberarum`, `tpa al-huda kaliduren`, `tpa as-salam sumberrahayu` — the site has **17** of these
- Village-scoped: `tpa sumberarum`, `tpa sumberrahayu`, `tpa sumbersari`, `tpa sumberagung`

**The organisation is real and active, and has no home of its own.** Third parties already document it: the Badko TKA-TPA Rayon Kapanewon Moyudan board for 2022–2026 was inaugurated 11 June 2023 at the Pendapa of Kalurahan Sumbersari, and it ran *Festival Anak Soleh Indonesia 2024* on 25 February 2024 at SMK Muhammadiyah 1 Moyudan. That coverage sits on `muhammadiyahmoyudan.or.id` and `mediacenter.slemankab.go.id` — not on any Badko Moyudan property.

Peer bodies have taken their own domains: `badkotpakalasan.com` (Kalasan), `badkotpagk.com` (Gunungkidul). Moyudan has a `.vercel.app` subdomain and two blogspot blogs.

**A naming mismatch to fix.** The organisation's own name uses **TKA-TPA** (the original blog's title is *"Badan Koordinasi TKA - TPA Kecamatan Moyudan"*), and since 2020 DIY has used **Kapanewon** where the site says **Kecamatan**. The site currently says neither *TKA-TPA* nor *Kapanewon* anywhere. Those are the words people and documents actually use.

---

## 4. The plan

Sequenced by what unblocks what. Hours are build effort, excluding decision time.

### Phase 0 — Become indexable at all · **1 h** · do this first, alone

1. ~~Delete `NEXT_PUBLIC_SITE_URL` from Vercel~~ — **done in code instead** (§1). Still worth clearing the variable in Production *and* Preview for hygiene, so preview deployments stop claiming production URLs, but the deploy no longer depends on it.
2. **Commit and deploy the working tree.** This is now the only blocking step. It ships the redesign, the correct host in every canonical/`og:url`/sitemap entry, the excerpt-whitespace fix (which currently corrupts every `og:description`), and the Blogger comment link.
3. Verify on the live host: `robots.txt` sitemap line, three sampled `<loc>` values, and the canonical on `/`, `/arsip`, and one post.
4. Create a **Google Search Console** property for `badkotpamoyudan.vercel.app`, verify it, submit `sitemap.xml`, and request indexing for the home page.

Until step 2 ships, every other phase is unobservable.

### Phase 1 — Consolidate what can be reached · **2 h** · *D-10 answered 2026-07-28*

**The original blog is not under our control.** Sign-in to `badkotpamoyudan.blogspot.com` is blocked — the account is tied to a Yahoo address that is no longer a usable sign-in path. So the canonical-transfer plan originally written here is off the table: we cannot edit its theme, set `noindex`, redirect it, or delete it.

That removes the best option and leaves a narrower one.

**Worth one attempt first — the account may not be the Yahoo address.** `badkotpamoyudan@yahoo.co.id` is the contact address *published in the blog's post content*. The Google account that actually **owns** the Blogger blog is a separate thing and is often a Gmail address created at the same time. Before writing this off, check Google Account Recovery for any plausible owner address, and ask whoever ran the blog in 2009–2011 which account they used. Recovering it is worth several hours of the rest of this plan, because it is the only route that transfers the existing ranking rather than competing with it.

**What we can do now:**

- **`tpamoyudan.blogspot.com`** (the CMS — we own this one): Blogger → Settings → Crawlers and indexing → **Custom robots header tags → `noindex`**. It exists to be edited, not read, and has no ranking to lose. This removes one of the three duplicates outright and is the whole of Phase 1's actionable work.
  The comment link shipped on 2026-07-27 points here; `noindex` governs indexing, not access, so it keeps working.
- **`badkotpamoyudan.blogspot.com`**: leave it. It stays online, keeps its inbound links, and will keep ranking for the archive posts.

**Strategic consequence — stop competing for the 35 archive posts.** With no canonical to give, Google will keep preferring the 2009 original for that content: it saw it first and it has fifteen years of trust. Fighting that is unwinnable and, more to the point, unnecessary — those posts serve long-tail queries about individual 2010 events, which is not the goal.

Win instead on what the original blog does not have and cannot get:

| | original blogspot | this site |
|---|---|---|
| The 17-TPA directory | — | `/tpa`, derived from the archive |
| Organisation entity markup | — | Phase 3 |
| Working search | — | `/search` |
| Current activity (2023 board, FASI 2024) | — | publishable |
| The organisation's name in the hostname | — | `badkotpamoyudan.vercel.app` |

The target query is an **entity** query — *who is Badko TPA Moyudan* — not an archive query. It is won by being the best page about the organisation, and the original blog has no page about the organisation at all. Phases 3, 4 and 7 are therefore no longer "nice to have after consolidation": with consolidation off the table, **they are the strategy.**

### Phase 2 — A real domain · **decision D-11** + **1–2 h**

`*.vercel.app` is a shared subdomain on a domain owned by someone else. It can rank, but it is a weak base for an institutional query and it signals impermanence to a reader deciding whether this is the official body.

Recommend `badkotpamoyudan.or.id` (`.or.id` is the Indonesian namespace for organisations and is what a body like this should hold) or `.id`. Peer precedent above. Do this **before** Phase 1's canonical work if it is going to happen at all — otherwise the canonicals get pointed at a URL that is itself about to move.

The 2026-07-28 rename to `badkotpamoyudan.vercel.app` lowers the urgency but does not remove the case: the hostname now carries the organisation's actual name, which is most of the on-page benefit, but the domain is still owned by Vercel and still reads as a hosting artefact rather than an institution. Moving later is cheap — set `NEXT_PUBLIC_SITE_URL` to the new domain and the guard in §1 hands precedence straight back to the explicit value.

### Phase 3 — Entity and local structured data · **6–8 h**

Today there is exactly one JSON-LD emitter site-wide (`BlogPosting` on post pages) and it is incomplete.

- **`Organization` / `EducationalOrganization`** in the root layout: `name`, `alternateName` for every real variant (*Badko TKA-TPA Kapanewon Moyudan*, *Badan Koordinasi TKA-TPA Kecamatan Moyudan*, *BADKO TPA Moyudan*), `address` (Kapanewon Moyudan, Sleman, DIY 55563), `email`, `logo`, `areaServed`, `sameAs` for the blogspot origins and any social accounts. **This is the single highest-value schema addition** — it is the object the target queries are about.
- **`WebSite` + `potentialAction: SearchAction`** — `/search?q=` already works and nothing declares it.
- **`ItemList` on `/tpa`, and `EducationalOrganization` per TPA card**, each with its `addressLocality` (padukuhan/kalurahan). Seventeen named entities with real addresses is the best local asset the site has and it is currently invisible to a parser.
- **`BreadcrumbList`** on `/posts/[slug]`, `/labels/[label]`, `/arsip/[year]/[month]`.
- **Complete `BlogPosting`**: add `dateModified`, `url`, `inLanguage: "id-ID"`, `articleSection` from `post.labels` (already in hand), `commentCount` (already computed), and a `publisher.logo` — Google requires a logo on an `Organization` publisher, and its absence invalidates the whole publisher node.

### Phase 4 — Names, titles, descriptions · **3–4 h**

- Fold **TKA-TPA** and **Kapanewon** into `SITE_NAME`/`SITE_DESCRIPTION`, the root title template, and the `/about` and `/tpa` copy. Keep *Kecamatan* as well — both forms are in live use.
- **Derive `SITE_DESCRIPTION`** instead of hardcoding *"35 catatan … 2009 sampai 2011"*. It is the meta description on every page that lacks its own, and it goes stale the moment a post is published. Same for the `"17"` and `"35"` literals in `opengraph-image.tsx`. This is Part 1 of `06-redesign/New_Posts_And_Comments.md` and it is now also an SEO defect.
- **Give every route its own description.** Missing on `/`, `/about`, `/contact`, `/labels/[label]`, `/page/[n]`, and `/search` — all six silently inherit the site-wide string, so Google sees one description across most of the site.
- Title formulas that carry the place: `Label: Foto — Badko TKA-TPA Moyudan`, `TPA Al-Furqon, Sumberarum — …`.

### Phase 5 — Crawl control · **2 h**

The audit found a large indexable surface of thin and duplicate URLs:

- **`/search?q=…`** — no canonical, no `noindex`, not disallowed, and linked site-wide from the footer. Every distinct query string is a separate indexable URL. Add `robots: { index: false, follow: true }`.
- **Unknown labels** — `/labels/anything` returns `200` with an empty state and a self-canonical to that arbitrary string. Should `noindex` or 404.
- **Empty archive months** — `parseMonth` accepts 2400 year/month combinations; only 8 hold posts. The rest return `200` + self-canonical + empty state. Should `noindex`.
- **`/` has no canonical**, and is the "whole archive" target from `LabelSwitcher` and `/search` while `Pagination` and `EmptyState` treat `/arsip` as that page. Pick one and canonicalise.
- **`/page/2..N`** — indexable, no descriptions, absent from the sitemap.
- **`lastModified`** is set only on post URLs; `/`, `/arsip`, `/tpa`, all six labels, and all eight months ship without it.

### Phase 6 — Image alt text · **4–6 h, needs a human**

Every `next/image` on the site uses `alt=""`, and 2009-era Blogger markup carries no alt either, so the sanitizer fills `alt=""`. **Not one image on a photo archive has a text alternative.** Seventeen TPA group photos and hundreds of event photos contribute nothing to image search and nothing to the page's topical signal.

This cannot be automated honestly — it needs someone who recognises the places and events. Highest value first: the 17 `/tpa` directory photos, then post heroes. The empty alts on decorative heroes where the `h1` already names the subject are correctly reasoned and can stay.

### Phase 7 — Off-site · **ongoing, and the real lever**

On-page work makes a site eligible to rank. For a local institutional query, what decides it is corroboration elsewhere.

- **Google Business Profile** for the secretariat (TPA Al-Furqon, Sumberarum) if the organisation wants a map presence.
- **Citations**: `muhammadiyahmoyudan.or.id` and `mediacenter.slemankab.go.id` already write about Badko Moyudan's activities. A link from those articles to this site is worth more than every schema change in Phase 3 combined.
- **Network links**: `badkotpakalasan.com`, `badkotpagk.com`, Badko TKA-TPA DIY's accounts.
- **Publish current activity.** The archive stops in October 2011; the organisation demonstrably did things in 2023 and 2024. A site that documents what an organisation is doing now will out-rank one that stopped fifteen years ago, whatever its markup says.

---

## 5. What I would not do

- **Chase bare "TPA Moyudan".** Landfill intent owns it, backed by government domains and active news. Wasted effort.
- **Keyword-tune the archive posts.** They are historical records. Rewriting them for search damages the thing the site exists to preserve.
- **Add analytics or third-party SEO scripts.** NFR-012 forbids collecting end-user data, and the site currently loads zero third-party scripts. Search Console needs no on-page script when verified by DNS or file.
- **Schema for its own sake.** `FAQPage`, `Event`, `Course` are not warranted by anything the site publishes today.

---

## 6. Decisions required

**D-10 — Which origin is canonical, and what happens to the other two?** — **ANSWERED 2026-07-28.**
Admin access to `badkotpamoyudan.blogspot.com` is unavailable (Yahoo sign-in no longer usable), so canonical transfer is impossible. Resolved as: `noindex` on `tpamoyudan.blogspot.com` (which we do control), leave the original online and untouched, and compete on entity rather than on the archive posts. See Phase 1.
**Residual action:** one attempt at account recovery — the Yahoo address is the *published contact*, not necessarily the *owning Google account*. If it is recoverable, Phase 1's original plan becomes available again and is worth more than several later phases.

**D-11 — Buy a domain, or stay on `badkotpamoyudan.vercel.app`?**
Recommendation: buy `badkotpamoyudan.or.id`. Ordering matters — decide this before Phase 1, or the canonicals get aimed at a URL that then moves.

**Also needs an owner, not a decision:** who holds the Google Search Console property. Without it there is no way to observe whether any of this worked.

---

## 7. Honest summary

Phase 0 is one hour of work and is worth more than Phases 3 through 6 put together. The site is not underperforming in search — it is instructing search engines not to index it, while serving pre-redesign English copy. Phases 1 and 2 decide whether the effort accrues to this site or keeps accruing to a blogspot address from 2009.

As of 2026-07-28 Phase 0 is down to **one action: deploy.** The localhost defect is fixed in code and proven against the real broken environment, the hostname now carries the organisation's name, and the excerpt bug that was corrupting every `og:description` is fixed. All of it is committed (`0e6f0e4`, `8cf0f3b`, `9d82957`, `d6eeea3`) and unshipped. Nothing here is observable until it deploys.

And with D-10 resolved against us, the plan's centre of gravity has moved. Consolidation was going to do the heavy lifting; it cannot. What remains is to make this the best page about the organisation — Phase 3's entity markup, Phase 4's names, and above all Phase 7's off-site corroboration and current activity. Those are no longer the tail of the plan. They are the plan.

Everything from Phase 3 onward is genuine, competent SEO work that will help — but only once the site is a real, indexable, single-origin destination. Sequence matters here more than volume.
