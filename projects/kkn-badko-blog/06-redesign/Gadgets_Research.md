# Blogger Layout gadgets on the custom site — research & plan

**Document version:** 1.0
**Date:** 2026-07-27
**Question:** can the site render the gadgets as configured in Blogger's Layout tab?
**Status:** research complete; **D-07 resolved 2026-07-27 as Option A and built** (§10–11)

---

## 1. Short answer

**Partly, and the interesting half is a "yes" nobody expects.**

- **The Blogger API cannot tell us anything about Layout.** There is no endpoint for layouts, gadgets, widgets, themes or templates — verified against the official v3 reference and by probing the live blog with both an API key and an OAuth token. Everything 404s.
- **But the configuration is readable anyway.** The published blogspot page embeds a complete, machine-readable manifest of every configured gadget — id, type, section and title — inside its `_WidgetManager._Init(…)` call. I extracted and parsed this blog's manifest successfully (§3).
- **9 of the 10 configured gadgets are already built or are trivially derivable** from data the site already fetches. Only one is genuinely impossible.
- **The one real functional gap is a month-level archive.** The site has year granularity; Blogger's sidebar has seven months.

So the honest framing is not "can we read Blogger's layout" but **"should the site follow Blogger's layout, or should it own its own layout and just cover the same ground?"** My recommendation is the latter, for reasons in §6.

---

## 2. What Blogger exposes — evidence

### API v3 has no layout surface

The official reference lists exactly eight resources: Blogs, Comments, Pages, Posts, Users, BlogUserInfos, PageViews, PostUserInfos. **Nothing for layout, gadgets, widgets, themes or templates.**

Probed live against blog `1097072164556393049`:

| Path | API key | OAuth token |
|---|---|---|
| `/layout` | 404 | 404 |
| `/gadgets`, `/widgets` | 404 | — |
| `/template`, `/theme` | 404 | 404 |
| `/` (blog) | 200 | 200 |

The project's OAuth credentials (held from migration 2.5) unlock nothing extra here. The theme XML is downloadable only through the Blogger UI, by hand.

### `pageviews` works, but is useless for gadgets

`GET /blogs/{id}/pageviews` requires OAuth and the lowercase spelling. It returns **one number for the whole blog**:

```json
{ "kind": "blogger#page_views", "blogId": "1097072164556393049",
  "counts": [ { "timeRange": "ALL_TIME", "count": "4" } ] }
```

No per-post breakdown exists in the API. This is what makes a Popular Posts gadget impossible — see §4.

---

## 3. This blog's actual Layout configuration

Extracted from the rendered homepage and parsed cleanly:

| Gadget id | Type | Section | Title |
|---|---|---|---|
| `BlogSearch1` | BlogSearch | `search_top` | "Cari Blog Ini" |
| `Header1` | Header | `header` | "Badan Koordinasi TPA Moyudan (Header)" |
| `FeaturedPost1` | FeaturedPost | `page_body` | — (pinned to postId `9159549317994431373` = **"LINK"**) |
| `Blog1` | Blog | `page_body` | "Postingan Blog" |
| `PopularPosts1` | PopularPosts | `page_body` | — (**`posts: []`** — empty) |
| `Attribution1` | Attribution | `footer` | — |
| `Profile1` | Profile | `sidebar_top` | "Kontributor" |
| `BlogArchive1` | BlogArchive | `sidebar_bottom` | — |
| `Label1` | Label | `sidebar_bottom` | "Label" |
| `ReportAbuse1` | ReportAbuse | `sidebar_bottom` | — |

Gadget **content** also renders server-side as text, so it is scrapeable: `Label1` lists BCM, BERITA, FOTO, LINK, PROFIL, TIPS; `BlogArchive1` lists seven months with counts; `Profile1` lists two contributors. The **links are generated client-side** (zero `?label=` or `_archive.html` hrefs in the served HTML) — which does not matter, because this site generates its own URLs.

`PopularPosts1` has no server-rendered container at all, consistent with its empty `posts` array.

---

## 4. Gadget-by-gadget feasibility

| Blogger gadget | Data source | State on our site | Verdict |
|---|---|---|---|
| BlogSearch | local full-text over the archive index | header search box | **done** |
| Header | `blogs.get` name | wordmark + hero | **done** |
| Blog (feed) | `posts.list` | "Seluruh catatan" + pagination | **done** |
| Label | post labels | hero dots, `LabelSwitcher`, footer column | **done** |
| Attribution | static | footer | **done** |
| **BlogArchive** | post `published` dates | **year only** — 2009/2010/2011 | **gap — build it** |
| **Profile / "Kontributor"** | `author/displayName`; `users.get` via OAuth | absent | **buildable** |
| **FeaturedPost** | needs the Layout manifest for *which* post | absent | **buildable, manifest-dependent** |
| ReportAbuse | static Blogger URL | absent | buildable, near-zero value |
| **PopularPosts** | ✗ no per-post stats anywhere | absent | **impossible — see below** |

### PopularPosts is not a "not yet", it is a "cannot"

Three independent confirmations: the API's `pageviews` returns a single blog-wide total (4 all-time); Blogger's own `PopularPosts1` widget reports `posts: []`; and it renders no markup. Blogger computes this from internal stats it does not expose. **There is no honest way to build this gadget**, and faking it with "most commented" would be misleading on a blog whose comments were an accepted migration loss.

Recommendation: drop it, and say so rather than substituting something that looks similar.

### The month archive — the one real gap

Blogger's sidebar shows seven months; our timeline shows three years. Derived from the same `published` dates we already have, and it matches Blogger's numbers exactly:

| Month | Posts | | Month | Posts |
|---|---|---|---|---|
| Okt 2011 | 1 | | Sep 2010 | 1 |
| Feb 2011 | 4 | | Jul 2009 | 5 |
| Des 2010 | 1 | | Mei 2009 | 2 |
| Nov 2010 | 21 | | **Total** | **35** |

Nov 2010's 21 posts is the TPA directory photo-shoot; the shape of this table *is* the archive's story, which is exactly why month granularity is worth having.

### A finding worth acting on independently

The legacy export's author is **"BADKO RAYON TKA-TPA KECAMATAN MOYUDAN"** on all 35 posts. The migrated blog's author is **"Harun664"**, and `Profile1` lists two contributors (`Harun664`, `runsha`). So migration 2.5 re-attributed the whole archive from the organisation to the operator's personal account — a content-fidelity loss not recorded in `Migration_Plan.md`.

This is the same item flagged in `Redesign_Plan.md` §10, now with the original value recovered. **Renaming the Blogger display name to "Badko Rayon TKA-TPA Kecamatan Moyudan" fixes it site-wide within the 10-minute revalidation window**, needs no deployment, and would make any Kontributor gadget correct rather than wrong.

---

## 5. Three options

### Option A — Native gadget equivalents, design-led *(recommended)*

Build what the gadgets do, in this site's own design language and layout rhythm. No dependency on Blogger's Layout. Adds: month archive, Kontributor block, optional featured note.

- **Cost:** ~18 h. **Risk:** none beyond ordinary UI work.
- **Trade-off:** the stakeholder rearranging gadgets in Blogger Layout does *not* change the site.

### Option B — Mirror the Layout manifest at runtime

Fetch the blogspot homepage on the ISR cycle, parse `_WidgetManager._Init`, and render our components into the sections and order the manifest declares.

- **Cost:** ~26 h. **Risk: high, and structural.**
- `_WidgetManager._Init` is an undocumented internal of Blogger's rendering layer. It can change without notice and without a version to pin.
- It is a JS object literal with single quotes, not JSON. Measured: it parses today, and the current manifest contains zero apostrophes. But the blob does not only carry gadget titles — the `Blog1` widget embeds **every post title on the page** (LINK, TUYUL, Pujian untuk Santri, TPA AL-HUDA KALIDUREN 3 …). One post titled with an apostrophe — and "Al-Qur'an" is everyday vocabulary for this organisation — breaks both naive quote-swapping (`JSONDecodeError`) and Python-literal evaluation (`SyntaxError`). A genuine JS-string-aware parse is required, not a transform.
- It adds an outbound dependency on `tpamoyudan.blogspot.com`, which is *not* the API host. SRS §3.1.4 permits "only 443/HTTPS to Google Blogger API and platform services"; blogspot.com is arguably a platform service, but that is a judgement call, not a given.
- **The HTML/JavaScript gadget is the real blocker.** If anyone ever adds one, faithfully mirroring it means injecting arbitrary third-party markup and script — flatly against NFR-012 (no tracking scripts) and FR-008/BR-005 (everything sanitized). We would have to refuse or neuter it, at which point the site no longer mirrors the Layout and the whole premise leaks.
- And the payoff is small: this is a **frozen 2009–2011 archive** with a gadget set that has no reason to change.

### Option C — Hybrid: native widgets, manifest read once for two facts

Option A, plus a build-time read of the manifest used *only* to resolve (a) which post is Featured and (b) whether the archive/label/contributor blocks are switched on — with hard-coded fallbacks if the fetch or parse fails.

- **Cost:** ~22 h. **Risk:** medium, bounded — a parse failure degrades to Option A rather than breaking a page.
- Gets the self-serve nicety (pin a featured post from Blogger) without pretending to mirror arbitrary gadgets.

**I recommend A**, and C only if being able to pin a featured post from Blogger's UI genuinely matters to the stakeholder. B buys a capability this content does not need at a fragility cost I would not want to hand over at M5.

---

## 6. How the gadgets should look here — not a sidebar

Blogger puts gadgets in a right rail. **This site should not.** `Wireframes.md` has no sidebar on any of the eight screens, the redesign is built on a full-width 1280px band rhythm, and bolting a 300px rail onto it would fight the hero, the archive board and the 3-up grids — and collapse to a meaningless stack on mobile anyway.

The same information reads better as bands in the existing rhythm:

```
  ── existing home page ────────────────────────────────
  hero band (label dots)            ← Label gadget, already
  Papan Arsip board                 ← (our own)
  stat / timeline strip             ← EXTEND to months
  ┌────────────────────────────────────────────────┐
  │ Arsip per bulan            7 bulan · 35 catatan│  ← BlogArchive
  │  2011  Okt ▏1        Feb ▎▎▎▎4                 │
  │  2010  Des ▏1   Nov ████████████████████ 21    │
  │        Sep ▏1                                  │
  │  2009  Jul ▎▎▎▎▎5    Mei ▎▎2                   │
  └────────────────────────────────────────────────┘
  Kabar & kegiatan                  ← existing
  Bahan mengajar (yellow band)      ← existing
  Seluruh catatan + pagination      ← Blog gadget, already
  footer: Arsip / Label / Organisasi / Kontributor  ← Profile gadget
```

Concretely:

1. **`ArchiveStats` gains month granularity** — years stay as the grouping, months become the rows. Reuses the existing `<table>`, keeps the accessible markup, and is a strictly better version of what is already there rather than a new component.
2. **New route `/arsip/[year]/[month]`** so a month is linkable, mirroring what Blogger's archive links do. Reuses `PostCard` and the existing empty/error states.
3. **Kontributor becomes a footer column**, not a sidebar card — one line per contributor with a post count. Low prominence, which is honest: there is effectively one author.
4. **FeaturedPost, if adopted (Option C)**, becomes a "Catatan pilihan" band directly under the archive board, using the existing tinted-card treatment.
5. **ReportAbuse: not built.** It is a link to a Blogger moderation form for a blog with 4 lifetime views and no comment form. Nothing to report and nowhere to report it from.

---

## 7. Constraints this must respect

Unchanged from the redesign, and all of them bear on this work:

- **Scope guard.** `Wireframes.md:318` forbids UI without a backing requirement; a month archive and a Kontributor block have none. **D-07 required** (§8).
- **POSTS_PER_PAGE = 10** stays exact; a month view is a *filtered* list and must not disturb the pagination rooted at `/`.
- **All four states** (loading / empty / error / 404) on every new data-backed screen — SRS §3.1.1.
- **WCAG 2.1 AA**, accessibility target 100. Any new colour pair goes through `contrast.test.ts`, which asserts the palette rather than documenting it.
- **API key server-side only** (BR-004, NFR-006, NFR-014); all Blogger access stays behind `lib/blogger.ts`.
- **No tracking scripts** (NFR-012) — the specific reason Option B's HTML gadget case is disqualifying.
- **Quota** (BR-003, NFR-002): the month archive needs *no new API calls*. `listArchiveIndex()` already returns every post with its date, so months are derived in memory exactly as years are today.

---

## 8. Decision gate — D-07 (stakeholder)

**Question: should the site add gadget-equivalent widgets, and should it follow Blogger's Layout configuration?**

**Being asked for**

1. A **month-level archive** (band + `/arsip/[year]/[month]` route) — no backing FR.
2. A **Kontributor** footer column — no backing FR.
3. Optionally, reading Blogger's Layout manifest to pin a **featured post** (Option C).
4. Explicit acceptance that **Popular Posts will not exist**, because no data for it exists.

**Consequences to accept**

- Option A: **+18 h**; two new UI elements without an FR; one new route; `Wireframes.md` gains WF-10.
- Option C instead: **+22 h**, plus a documented dependency on an undocumented Blogger internal, with a defined fallback.
- Option B is **not recommended** and is costed only for comparison (+26 h, high risk).
- Independent of all three: the Blogger **author display name should be corrected** to the organisation (§4). No code, no deploy.

### RESOLVED 2026-07-27: Option A — build the gadgets natively

Stakeholder directed "build gadget natively". Consequences accepted as listed. Option B (mirroring the Layout manifest) is **not** adopted, and neither is Option C's featured-post reader — the site owns its own layout and covers the same ground from the API.

| Field | Value |
|---|---|
| ID | D-07 |
| Closes | scope guard `Wireframes.md:318` for the month archive and Kontributor column |
| Decision | Native gadget equivalents; no dependency on Blogger Layout; Popular Posts explicitly out of scope |
| Re-estimate | +18 h |
| Decided | 2026-07-27 |
| Status | **RESOLVED** |

---

## 11. Implementation record — 2026-07-27

Built, verified and green: ESLint, Prettier, `tsc --noEmit` clean; clean `next build`; **138 tests passing** (up from 117).

### What shipped

| Gadget equivalent | Where | Verified against Blogger |
|---|---|---|
| **BlogArchive** | "Arsip per bulan" band on `/`, replacing the year-only timeline | 7 months, exact match: Okt 2011 (1), Feb 2011 (4), Des 2010 (1), **Nov 2010 (21)**, Sep 2010 (1), Jul 2009 (5), Mei 2009 (2) = 35 |
| **BlogArchive links** | new route `/arsip/[year]/[month]` | `/arsip/2010/11` → "November 2010, 21 catatan" |
| **Profile / Kontributor** | footer column, distinct post authors with counts | renders "Harun664 · 35" — see below |
| Popular Posts | **not built** | no data exists to build it from |
| ReportAbuse | **not built** | nothing to report, nowhere to report from |

Costs no extra API call: months, contributors and a month's posts are all derived in memory from the `listArchiveIndex()` walk the home page already makes. Month archives are in `sitemap.xml` (7 URLs, 52 total).

### Decisions taken during the build

- **Empty months are omitted, empty years are kept.** A silent year inside the span says "the archive went quiet"; eleven silent months inside a year say nothing and would bury the month holding 21 of the 35 posts.
- **The month route has no `loading.tsx`.** With one, `notFound()` streams behind a Suspense boundary and can only produce a soft 200 — the same limitation `/page/[n]` lives with. `/posts/[slug]` already omits its skeleton for exactly this reason, so the new route follows that precedent and returns **real 404s**: verified for `/arsip/2010/1` (not zero-padded), `/13`, `/00`, `/1899/01`, `/20x0/11`, `/2010/011`. A *valid* month with no posts stays a 200 empty state, matching FR-012's rule for an empty label.
- **Prev/next skip empty months**, so the sequence never lands on an empty page: Nov 2010 links to Sep 2010 and Des 2010, not Okt 2010.
- **The footer derives contributors itself** rather than receiving them, because it renders from the root layout. It is `async` with a `try`/`catch` returning `[]`, so an upstream failure costs one footer column rather than taking down pages that need no data at all — `/contact` among them. Side effect: every route now carries the 10-minute revalidate that call brings, including `/contact` and `/_not-found`.
- **`author` was added to `LIST_FIELDS`** and to `PostSummary` as optional. It rides along on a request already being made, so the Kontributor list is free.

### A pre-existing bug found and fixed

The month page screenshot showed an excerpt reading *"memberi semangat santri **&amp;** membenarkan"* — a literal, visible `&amp;`.

Cause: `sanitize-html` with `allowedTags: []` returns **HTML**, so it correctly leaves `&`, `<`, `>` and `"` entity-encoded while decoding everything else (`&nbsp;`, `&ldquo;`, `&#39;`). React then renders that text node verbatim. `toPlainText` now decodes those four, with `&amp;` decoded **last** so an author's escaped literal `&amp;lt;` stays `&lt;` instead of collapsing to `<`.

This predates the redesign and affected **every excerpt on the site** — home feed, label pages, search results, month pages — not just this one. Five tests added.

### Confirmation of the migration attribution finding

The Kontributor column renders exactly one name, **"Harun664 · 35"**, which is the operator account rather than the organisation. §4 records the original value recoverable from the legacy export. Correcting the Blogger display name to "Badko Rayon TKA-TPA Kecamatan Moyudan" fixes the footer, every post byline and the JSON-LD author in one edit, with no code and no deploy.

---

## 9. Estimate — Option A

| # | Task | Est. |
|---|---|---|
| G1 | `lib/archive.ts`: month buckets grouped under years, gap-preserving like `yearCounts` | 3 h |
| G2 | `ArchiveStats` → month rows under year groups, table markup and caption kept | 4 h |
| G3 | `/arsip/[year]/[month]` route + `loading` + empty/404 states + canonical | 5 h |
| G4 | Kontributor footer column (distinct authors + counts) | 2 h |
| G5 | Tests: month bucketing, gap years, route params, contrast for any new pair | 3 h |
| G6 | `Wireframes.md` WF-10, `User_Guide.md` note, D-07 resolution | 1 h |
| | **Total** | **18 h** |

Add **4 h** for Option C's manifest reader (fetch, tolerant parse, fallback, cache).

---

## 10. Open risks

1. **`_WidgetManager._Init` is undocumented.** Only relevant under B/C. If adopted, the reader must fail soft and be covered by a test using a captured fixture, so a Blogger change surfaces as a failing test rather than a broken page.
2. **An apostrophe anywhere in the blob breaks naive parsing**, and the blob carries every post title on the page, not just gadget titles — so the exposure is 35 post titles wide, not 10 gadget titles. Measured: parses cleanly today (zero apostrophes present); fails on both a quote swap and a Python-literal eval the moment one appears. Only relevant under B/C, and it argues for a real JS-literal parse plus a captured-fixture test.
3. **Month archive URLs are new public surface.** They should be in `sitemap.xml` (as `/tpa` and the label views now are) and carry canonicals.
4. **A second contributor exists** (`runsha`) with zero posts attributed. A Kontributor block derived from post authors will show one name; derived from `Profile1`, two. Post authors is the truthful source.
