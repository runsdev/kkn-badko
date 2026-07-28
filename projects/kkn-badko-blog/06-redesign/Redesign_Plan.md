# Redesign Plan — Visual system, information architecture, and motion

**Document version:** 1.0
**Date:** 2026-07-26
**Phase:** 2.3 (UI/UX & styling), with a scope addendum requiring decision **D-06**
**Design source:** `website/DESIGN.md` (`Notion-design-analysis`, alpha)
**Supersedes:** nothing. Extends `02-requirements-engineering/02-wireframes/Wireframes.md` v1.0 with WF-08/WF-09.

---

## 1. Why this document exists

`Wireframes.md:12` delegates colour, typography, spacing and motion to Phase 2.3. Those parts of this plan need no approval — they are the work.

Three parts of it **do** need approval, because `Wireframes.md:318` records a scope guard (*"no wireframe introduces an element without a backing requirement"*) and BR-010 freezes scope at M1:

1. A hero band, archive board, and statistics strip on the home page — UI elements with no backing FR.
2. A new route, `/tpa`.
3. Switching the interface language from English to Indonesian.

Those were gathered into **decision gate D-06** (§9), **resolved 2026-07-26 as approved in full**. The gate is recorded for the audit trail; no part of this plan is now blocked.

### 1.1 What the content actually is

Probed live against the Blogger API on 2026-07-26:

| Fact | Value |
|---|---|
| Blog | Badan Koordinasi TPA Moyudan (`tpamoyudan.blogspot.com`) |
| Posts | 35 |
| Date range | **2009-05-20 → 2011-10-20.** Nothing since. |
| Posts per year | 2009: 7 · 2010: 23 · 2011: 5 |
| Labels | FOTO 20 · BERITA 7 · TIPS 5 · PROFIL 2 · LINK 1 · BCM 1 |
| Unlabelled posts | 0 |
| Posts containing an image | 20 of 35 |
| Image host | `blogger.googleusercontent.com`, 100% |
| Image size in markup | `/s320/` — 320 px longest edge |
| Blogger static pages | 1 (`About`) |

Two consequences that drive the whole design:

**This is an archive, not a feed.** The newest post is fifteen years old. A reverse-chronological "Latest posts" heading is factually misleading. The design should say what the thing is: a preserved record of 2009–2011.

**17 of the 35 posts are a place directory.** Every FOTO post whose title starts with `TPA ` names one Qur'an study centre and its village — *TPA AL-HUDA KALIDUREN 3*, *TPA AT-TAQWA SANGUBANYU*, *TPA NURUL IMAN GOSER*. In a 10-per-page reverse-chronological list these 17 near-identical entries occupy pages 1–2 and bury the seven event reports and six teaching-material posts. The directory is the single most useful thing in the archive and it is currently the least findable.

---

## 2. Design direction

### 2.1 The idea

`DESIGN.md:479` explains its own colour spectrum as one that *"echoes live product database properties"* — Notion's visual language is a database with coloured properties. This archive **is** a small database: 35 records, six label properties, 17 places, three years.

So the decoration is the data. Where `DESIGN.md:748` calls for *"scattered colourful sticky-note dots"* on the navy hero band, this site renders **six dots — one per label, in that label's assigned colour, carrying its count**. Where `DESIGN.md:718` calls for a `workspace-mockup-card` showing *"actual product UI"*, this site shows **the actual archive** as a Notion-style board of the 17 TPA centres. Neither element is ornamental; remove the data and the element disappears.

That is the signature: **the archive's own taxonomy is the graphic system.** One colour per label, used identically for the hero dot, the card tint, the chip, and the filter pill, everywhere on the site.

### 2.2 The label colour map

Deterministic, single source of truth in `lib/labels.ts`. Every colour is a `DESIGN.md` token except two derived deep variants (§2.4).

| Label | n | Accent (dot, rule) | Surface tint | Chip text | Ratio | Why this colour |
|---|---|---|---|---|---|---|
| `FOTO` | 20 | teal `#2a9d99` | mint `#d9f3e1` | teal-deep `#1c6b68` † | 5.33:1 | the photo directory — the archive's bulk |
| `BERITA` | 7 | orange `#dd5b00` | peach `#ffe8d4` | orange-deep `#793400` | 7.70:1 | events and announcements |
| `TIPS` | 5 | yellow `#f5d75e` | yellow `#fef7d6` | brown `#523410` | 10.49:1 | pairs with the yellow-bold teaching band |
| `PROFIL` | 2 | purple `#7b3ff2` | lavender `#e6e0f5` | purple-800 `#391c57` | 11.06:1 | organisational identity |
| `BCM` | 1 | pink `#ff64c8` | rose `#fde0ec` | pink-deep `#a02e6d` | 5.49:1 | Bermain–Cerita–Menyanyi: the playful one |
| `LINK` | 1 | link-blue `#0075de` | sky `#dcecfa` | link-pressed `#005bab` | 5.65:1 | the label is literally a list of links |

All six verified ≥ 4.5:1 (WCAG 2.1 AA, normal text).

† derived — see §2.4.

Six labels, six brand colours, one-to-one, each with a reason. A seventh label added in Blogger falls back to `card-tint-gray` + `charcoal`; the map is a lookup with a default, never a crash.

### 2.3 Typography

| Role | Face | Loaded as |
|---|---|---|
| Display — hero, section openers, card titles | **Plus Jakarta Sans** (variable 200–800) | `next/font/google`, `--font-display` |
| Body, UI, data, captions, buttons | **Inter** (variable, `opsz` axis) | `next/font/google`, `--font-sans` |

`DESIGN.md:530` specifies *"Notion Sans — Notion's custom Inter-based variable typeface"*, which is proprietary, with Inter named as the first fallback. Inter therefore takes every body and UI surface exactly as the brief intends.

For display, Plus Jakarta Sans is the deliberate choice. It is a humanist-geometric variable sans — structurally the same family of shapes the brief asks for — but it was designed by Tokotype as the official typeface of Jakarta. On a site about seventeen Qur'an study groups in a Yogyakarta sub-district, an Indonesian typeface in the display role is a choice specific to this subject rather than a default. It carries the personality; Inter stays neutral underneath.

Both are self-hosted at build time by `next/font`, so there is no runtime third-party request — which matters for NFR-012 (no tracking scripts) and for the performance budget. **Geist Mono is dropped**: it is wired into the theme today and used by no markup, so this is one fewer font file than the current build.

Scale is `DESIGN.md` §Typography verbatim, with the responsive hero ramp from `DESIGN.md:798`: 80 → 56 → 48 → 36 px. Headings get `text-wrap: balance`; all counts and dates get `font-variant-numeric: tabular-nums`.

### 2.4 Two deviations from DESIGN.md, both forced by WCAG

NFR-016 (WCAG 2.1 AA) outranks a visual token, and `QA_Report.md:44` sets the accessibility target at **100**, up from the 96 measured before the pagination contrast fix. Two `DESIGN.md` specifications fail 4.5:1 and must not be used as written:

**`badge-tag-green` fails.** `DESIGN.md:699` specifies brand-green `#1aae39` on mint `#d9f3e1` — that is **2.50:1**, well under the 4.5:1 floor. Replaced with a derived `teal-deep #1c6b68` at 5.33:1.

**`stone` and `muted` fail as text, and `steel` has no margin.** Computed against canvas `#ffffff`:

| Token | Hex | Ratio on white | Verdict |
|---|---|---|---|
| `ink` | `#1a1a1a` | 17.40:1 | body, headings |
| `charcoal` | `#37352f` | 12.26:1 | body emphasis |
| `slate` | `#5d5b54` | **6.80:1** | **secondary text, footer links, placeholders** |
| `steel` | `#787671` | 4.54:1 | passes by 0.04 — avoid |
| `stone` | `#a4a097` | 2.61:1 | ✗ non-text only |
| `muted` | `#bbb8b1` | 1.98:1 | ✗ borders and rules only |

`DESIGN.md:516` assigns `steel` to *"tertiary, footer links"*. It clears 4.5:1 by four hundredths, which is close enough that a future token nudge or an anti-aliased small size could tip it — and this project has already lost accessibility points to exactly one dim-grey token. **This plan uses `slate` for all tertiary text instead**, and demotes `steel`, `stone` and `muted` to non-text roles.

This is the same defect class as the one already fixed in `Pagination.tsx` (`text-muted/50` at 1.96:1, `QA_Report.md:37`). Rule for the whole redesign: **no opacity-dimmed text.** Dim by choosing a darker token, never by lowering alpha. Disabled states keep a non-colour cue — the existing dashed border pattern.

Verified as passing, no change needed: white on primary `#5645d4` = 6.57:1 · white on navy `#0a1530` = 18.06:1 · `on-dark-muted #a4a097` on navy = 6.93:1 (the token that fails on white is fine on the hero band) · `charcoal` on mint = 10.43:1 · link-blue `#0075de` on white = 4.57:1, kept underlined since it too sits close to the floor.

Every ratio in this section was computed with the WCAG relative-luminance formula and is reproducible; they are not estimates.

---

## 3. Information architecture

Every existing route and URL survives. `/` remains page 1 of the paginated feed, so `Pagination.tsx`'s `newerHref = page === 2 ? "/" : …` contract is untouched and `POSTS_PER_PAGE = 10` stays exact.

| Route | Change | Backing |
|---|---|---|
| `/` | Restructured — see WF-08. Keeps the 10-card feed **and** its pagination. | FR-001…006 + **D-06** |
| `/page/[n]` | Restyled. Feed only, no hero. Contract unchanged. | FR-004, FR-005 |
| `/posts/[slug]` | Restyled. Hero photo, prose body, comments. | FR-007…010, 016, 017 |
| `/labels/[label]` | Restyled + a six-label `pill-tab` switcher in label colours. | FR-011, FR-012 |
| `/search` | Restyled with `search-pill`. Result list animates on re-query. | FR-013…015 |
| `/about` · `/contact` | Restyled. Contact stays a bare `mailto:`, no form. | FR-018…020 |
| `/tpa` | **NEW** — directory of the 17 TPA centres. | **D-06** |
| 404 · sitemap · robots | Restyled 404; generated files unchanged. | FR-006, FR-010, NFR-015 |

### WF-08 — Home (`/`)

```
┌──────────────────────────────────────────────────────────────┐
│ promo-banner   Arsip 2009–2011 · 35 catatan · 17 TPA         │  surface strip
├──────────────────────────────────────────────────────────────┤
│ ◆ Badko TPA Moyudan    Arsip  TPA  Tentang  Kontak  [ cari ] │  sticky, hairline-bottom
├══════════════════════════════════════════════════════════════┤
│  ● FOTO 20     ● BERITA 7                    ● TIPS 5        │  ← the six label dots
│                                                   ● PROFIL 2 │    ARE the taxonomy.
│         Rekaman 17 TPA di Kecamatan Moyudan.                 │    Staggered in on load.
│    Dikumpulkan 2009–2011, diarsipkan agar tidak hilang.      │
│         [ Telusuri arsip ]  [ Lihat 17 TPA ]                 │  purple + outlined-on-dark
│  ● BCM 1                                        ● LINK 1     │
│   ┌────────────────────────────────────────────────────┐     │  navy #0a1530
│   │ Papan Arsip · 17 tempat            FOTO ●          │     │
│   │ ────────────────────────────────────────────────── │     │  workspace-mockup-card,
│   │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │     │  breaks out of the band,
│   │  │KALI- │ │SANGU-│ │GOSER │ │PENDU-│  6 of 17     │     │  Level-3 shadow.
│   │  │DUREN │ │BANYU │ │Nurul │ │LAN   │  + semua →   │     │
│   │  │Al-Huda│ │At-Taqwa│ │Iman │ │Al-Amin│            │     │
│   └────┴──────┴─┴──────┴─┴──────┴─┴──────┴────────────┘     │
└──────────────────────────────────────────────────────────────┘
   stat-row · surface · rounded-lg
   35 catatan   6 label   17 TPA   2009–2011
   2009 ████ 7     2010 ████████████████ 23     2011 ███ 5

   Kabar & Kegiatan — 7 catatan                    semua BERITA →
   ┌───────────────────┐ ┌───────────────────┐  peach tint, 2-up
   │ Wisuda & Khataman │ │ FAS Kab. Sleman   │
   └───────────────────┘ └───────────────────┘

   ┌────────────────────────────────────────────────────────┐
   │ Bahan mengajar: BCM          card-feature-yellow-bold  │
   │ Bermain · Cerita · Menyanyi — 6 catatan                │
   │ [TUYUL] [SATE vs BAYEM] [3 ER] [Pujian untuk Santri]   │
   └────────────────────────────────────────────────────────┘

   Terbaru                                          ← FR-001…006 live here
   ┌────────────────────────────────────────────────────────┐
   │ [thumb] KALIDUREN                    16 Nov 2010       │  whole card = one
   │         TPA AL-HUDA KALIDUREN 3            ● FOTO      │  link, one tab stop
   │         Excerpt, plain text, clamped to 3 lines…       │  (Wireframes.md:121)
   └────────────────────────────────────────────────────────┘
   × 10                              [‹ Lebih baru]  Halaman 1 dari 4  [Lebih lama ›]

   footer-region · 4 columns · Arsip / Label / Organisasi / Tautan
```

The mockup card and the standalone directory grid were **merged**: the hero card *is* the directory preview, with the full 17 on `/tpa`. One element doing one job.

### WF-09 — TPA directory (`/tpa`)

```
   Direktori TPA                                   17 tempat
   Setiap TPA di Kecamatan Moyudan yang terekam dalam arsip ini.

   ┌───────────┐ ┌───────────┐ ┌───────────┐   3-up desktop
   │  [photo]  │ │  [photo]  │ │  [photo]  │   2-up tablet
   │ KALIDUREN │ │SANGUBANYU │ │  GOSER    │   1-up mobile
   │ TPA AL-   │ │ TPA AT-   │ │ TPA NURUL │   mint tint, village
   │ HUDA 3    │ │ TAQWA     │ │ IMAN      │   as eyebrow
   └───────────┘ └───────────┘ └───────────┘
```

Village name as the eyebrow, TPA name as the title. Both come from the post title; the Arabic-derived centre names paired with Javanese village names are the archive's own vernacular and the reason this view reads as belonging to this place.

Derivation is a documented heuristic in `lib/tpa.ts`: posts labelled `FOTO` whose title matches `/^TPA\s+/i`. Verified against the migrated archive — it returns **exactly 17**, and correctly excludes the three other `FOTO` posts (`Panitia`, `Panitia Lokal`, and `Wisuda Ibu-ibu TPA As-Salam II Kruwet`, where `TPA` appears mid-title). If the match ever yields fewer than five results the page falls back to all `FOTO` posts, so a future title-convention change degrades instead of emptying the page. Unit-tested against the current 35 titles.

Two data quirks the parser must absorb rather than pretend away. One entry is `TPA AL-HIKMAH TEGAL REJO BERSAMA PANITIA  WISUDA` — a group photo, not a clean directory record, with a trailing descriptive clause and a double space. And village names are not delimited: `TPA SABIILUL MUTTAQIIN KALIDUREN 1` and `TPA AS-SALAM II KRUWET` interleave Roman numerals and digits with the place name, so no split rule recovers the village reliably. The parser therefore keeps the full title as the card's accessible name and treats the eyebrow as **presentational only** — derived where a match is confident, omitted otherwise. A missing eyebrow is a quiet gap; a wrong village name on a directory of real places is not acceptable.

### 3.1 Card contract

FR-001 requires title, excerpt, publish date and label on every card, and `User_Guide.md:22` promises editors that *"the first ~200 characters become the excerpt on the home page"* — so all four slots stay, and `EXCERPT_LENGTH = 200` is untouched.

Two current defects get fixed while restyling:

- `Wireframes.md:121` requires *"whole card is one link target (single tab stop)"*. Today only the title is a link, and each label chip adds another tab stop. New card: one `<Link>` wrapping the card, with label chips rendered as non-interactive spans on the card and interactive only in the label switcher and on the detail page.
- Label chips currently sit inside a `<p>`. They move to a `<ul>`.

---

## 4. Motion

`DESIGN.md:819` records under Known Gaps: *"Animation/transition timings not extracted; recommend 150–200 ms ease."* That recommendation sets the tempo.

Motion is React's **`<ViewTransition>`** — native `document.startViewTransition`, zero dependencies, and already available because Next.js 16 bundles React canary in the App Router. No animation library is added, which matters because NFR-012 rules out third-party runtime requests and the performance budget has no room. Requires `experimental: { viewTransition: true }`.

Every animation below states what it communicates. Anything that could not answer that question was cut.

| # | Pattern | Where | Communicates | Implementation |
|---|---|---|---|---|
| 1 | Shared element | card photo → detail hero photo | "same TPA, going deeper" | `<ViewTransition name={\`post-img-${id}\`} share="morph">` on both sides |
| 1b | Text morph | card title `h2` → detail `h1` | continuity of the title | `share="text-morph"` — avoids the raster ghost that `morph` leaves on resized text |
| 2 | Suspense reveal | the 3 existing `loading.tsx` | "data arrived" | skeleton `exit="slide-down"`, content `enter="slide-up" default="none"` |
| 3 | List identity | search results, label switch | "same items, new arrangement" | `<ViewTransition key={post.id}>` per card + `startTransition` → `router.replace` |
| 4 | Enter/exit | search validation message | "something appeared" | VT `enter` on the `role="alert"` node |
| 5 | Directional route | card → detail, back link | "forward / back" | `transitionTypes={['nav-forward']}` on `<Link>`; type-keyed VT **in each page component, not the layout** |
| — | Header anchor | sticky header | it is the fixed reference point | `viewTransitionName: 'site-header'` + `animation: none; z-index: 100` |
| — | Hero dot cascade | the six label dots | the archive assembling itself | one CSS `@keyframes`, per-dot `animation-delay`, opacity + transform only |
| — | Card hover lift | post and TPA cards | affordance | `translateY(-2px)` + elevation-2 shadow, 150 ms |

The dot cascade is the only autonomous animation on the site — one orchestrated moment on the hero rather than effects scattered down the page. It runs well under the 5 s that WCAG 2.2.2 would require a pause control for.

**Deliberately not built:** scroll-triggered section reveals. They would risk content staying invisible where `animation-timeline` is unsupported, they cost main-thread time the budget cannot spare, and the page is stronger with one motion moment than five.

CSS comes from the `vercel-react-view-transitions` recipe set rather than hand-written keyframes, including the reduced-motion block:

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*), ::view-transition-new(*), ::view-transition-group(*) {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
  }
}
```

The same query disables the dot cascade and the hover lift. Only `transform` and `opacity` are animated; `transition: all` appears nowhere; properties are always listed explicitly.

Two behaviours worth stating so they are not read as bugs: the browser back button does not carry a transition type, so directional slides do not play on it (the shared-element morph still does); and unsupported browsers skip every transition and navigate normally.

---

## 5. Performance — not a gate, but the choices stand

**Stakeholder ruling, 2026-07-26: the recorded numbers are not authoritative and do not gate this work.**

`QA_Report.md:26` states the run was made with local Chromium headless and mobile CPU emulation, and flags itself: *"Local CPU emulation is noisier than Google's PSI infrastructure; PSI re-run recommended when its daily quota resets."* Its own disposition line (`:38`) expects *"≥ 90 there"* on real infrastructure. So the figures below are a noisy local baseline, not a measured production failure, and the redesign is not held against them.

The countermeasures in this section are kept anyway — every one of them is either free or a correctness fix, and none of them constrains the design. The CLS work in particular is worth doing on its own merits, because reserving space for legacy images is right regardless of what a score says.

Baseline for reference only, `QA_Report.md:28-31`:

| Page | Perf | A11y | Best-pr. | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| Home | **86** | 96 | 100 | 100 | **2.7 s** | 0 |
| Post (image-heavy) | **89** | 96 | 96 | 100 | **3.0 s** | **0.128** |

NFR-001 requires Performance ≥ 90, LCP ≤ 2.5 s, CLS ≤ 0.1. NFR-001 still binds the *product*; what has been set aside is treating this particular local measurement as the oracle for it.

The work, kept for its own sake rather than to defend a score:

1. **Thumbnails cost zero API calls.** `blogger.ts:17` already requests `content` on list endpoints, so the first image URL can be extracted from HTML the app has in hand. `PostSummary` gains an optional `image`.
2. **Serve real resolution.** Markup carries `/s320/`; rewriting the path segment yields larger renditions — verified: `/s1600/` → 254 KB, `/w1200/` → 230 KB, both HTTP 200. Cards request `/w800/`, detail heroes `/w1600/`.
3. **`next/image` with v16 config.** `remotePatterns: [{ protocol: 'https', hostname: '**.googleusercontent.com' }, { protocol: 'https', hostname: '**.blogspot.com' }]`. Note `qualities` now defaults to `[75]` in v16 and other values are silently coerced, so any non-75 quality must be declared.
4. **The LCP element stays text.** The hero is a flat navy fill with a text headline on a `display: swap` font. No large image competes for LCP above the fold — this should *lower* home LCP against today's 2.7 s.
5. **Detail hero image**: `loading="eager" fetchPriority="high"`. Not `priority` — deprecated in v16 in favour of `preload`, and the docs recommend `loading`/`fetchPriority` over `preload` in most cases.
6. **Kill the 0.128 CLS.** It comes from legacy body images carrying no `width`/`height` (`QA_Report.md:39`, ruled a content issue and therefore never fixed). The intrinsic aspect ratio is not recoverable from a Blogger URL, so the fix is a design one: content images render inside a fixed-aspect rounded frame tinted with the post's label colour, `object-fit: contain`. Space is reserved deterministically, CLS goes to 0, and legacy 320 px photos stop looking accidental. The sanitiser keeps its existing `loading="lazy" decoding="async"` transform.
7. **`preconnect` to `blogger.googleusercontent.com`.**
8. **One fewer font file** — Geist Mono removed.
9. **Candidate, measure before keeping:** `experimental.inlineCss: true`, which the Next.js docs recommend specifically for atomic CSS on first load.
10. **Leave `cacheComponents` off.** It is off by default in v16 and switching it on would change `dynamic`/`revalidate` semantics and unmount behaviour mid-project for no gain here.

Exit criterion: SEO and Best-Practices must not regress, and accessibility must reach 100 — those three are stable across measurement environments and remain checkable. Performance and LCP are recorded as observations only, pending the PSI re-run that `QA_Report.md:45` already carries as residual action 2.

---

## 6. Next.js 16.2.12 specifics

`website/AGENTS.md` warns that this version diverges from training data. Verified against the bundled docs in `node_modules/next/dist/docs/`:

| Area | Correct in 16.2.12 |
|---|---|
| `next/image` | `priority` is deprecated → `preload`; prefer `loading="eager"` + `fetchPriority="high"`. `imageSizes` lost `16`. `minimumCacheTTL` now 14400 s. `domains` deprecated → `remotePatterns`. |
| `error.tsx` | `{ error, unstable_retry }` as of v16.2.0. `reset` still works but is no longer recommended — `unstable_retry()` re-fetches. **`src/app/error.tsx` currently uses `reset` and should migrate.** |
| `viewport` / `themeColor` | Separate `export const viewport: Viewport`. `themeColor`, `colorScheme` and `viewport` inside `metadata` are all deprecated. The site exports none today; the redesign adds one (theme-color must match the page background per the interface guidelines). |
| View transitions | `experimental: { viewTransition: true }` — still nested under `experimental`. `import { ViewTransition } from 'react'`. |
| `transitionTypes` | Confirmed present in this build: `transitionTypes?: string[]` on `next/link`, added v16.2.0. Also on `router.push`/`replace`. |
| Scroll | v16 no longer overrides `scroll-behavior`. A sticky header needs `html { scroll-padding-top: 64px }`, and smooth scrolling needs `data-scroll-behavior="smooth"` on `<html>`. |
| `params` / `searchParams` | Always `Promise`. Already correct in this codebase. |
| Fonts | `next/font` unchanged. Omit `weight` to get the variable font. `@theme inline` is the documented way to bind font variables — already the pattern in `globals.css`. |
| Build | Turbopack is the default; a custom `webpack` config would fail the build. None exists. |
| `opengraph-image` | `ImageResponse` from `next/og`, flexbox only, ≤ 500 KB bundle, `params` is a Promise. |

---

## 7. Files touched

**New:** `lib/labels.ts` (colour map) · `lib/tpa.ts` (directory derivation) · `lib/image.ts` (first-image extraction + size rewrite) · `components/` — `Hero`, `ArchiveBoard`, `ArchiveStats`, `LabelChip`, `LabelSwitcher`, `PostCard` (rewritten), `TpaCard`, `SectionHeader`, `Transition` (the type-keyed VT wrapper), `Prose` · `app/tpa/page.tsx` + `loading.tsx` · `app/opengraph-image.tsx`.

**Modified:** `globals.css` (whole token layer + VT recipes) · `layout.tsx` (fonts, nav, footer, promo banner, `lang="id"`, `viewport` export) · every `page.tsx` · `Pagination`, `SearchBox`, `NavLinks`, `EmptyState`, `ErrorState`, `PostListSkeleton` · `error.tsx` (`unstable_retry`) · `lib/types.ts` (`PostSummary.image`) · `lib/blogger.ts` (populate `image`) · `lib/format.ts` (`id-ID`) · `next.config.ts` (images, viewTransition) · the three component test files.

**Untouched:** `lib/env.ts`, `lib/sanitize.ts` (except the image frame CSS hook), `robots.ts`, `sitemap.ts`, and every server-side Blogger access path. NFR-014's single service layer and BR-004's server-only API key are unaffected — the redesign adds no client-side data fetching.

### Tests

No existing test asserts on a CSS class, so restyling breaks nothing. Three assert on copy that Indonesian changes, and they are updated in the same commit:

| File | Assertion | Becomes |
|---|---|---|
| `SearchBox.test.tsx` | button named `"Go"` | `"Cari"` |
| `Pagination.test.tsx` | text `"Page 1 of 4"`, links `/Newer/`, `/Older/` | `"Halaman 1 dari 4"`, `/Lebih baru/`, `/Lebih lama/` |
| `PostCard.test.tsx` / `format.test.ts` | dates `"6 Jul 2009"`, `"12 Jul 2026"` | **both unchanged** — verified that `id-ID` renders them identically. Four of twelve months do differ (`May→Mei`, `Aug→Agu`, `Oct→Okt`, `Dec→Des`), and both existing fixtures happen to be July, so a non-July case is added to cover the switch |

New tests: `labels.ts` (every label maps, unknown label falls back), `tpa.ts` (17 from the real titles, fallback path), `image.ts` (extraction, `/s320/` → `/w800/` rewrite, no-image case). NFR-013's ≥ 80% coverage gate is maintained.

---

## 8. Sequence and estimate

Ordered so nothing is built twice: tokens first, then the components that consume them, then motion over finished markup, then measurement.

| # | Task | Est. | Gate |
|---|---|---|---|
| R1.1 | Token layer in `globals.css` — colours, type scale, spacing, radii, elevation | 4 h | — |
| R1.2 | Fonts: Plus Jakarta Sans + Inter, drop Geist Mono, `@theme inline` binding | 2 h | — |
| R1.3 | `lib/labels.ts` + `LabelChip` + contrast verification of all six pairs | 3 h | — |
| R1.4 | Shell: layout, sticky nav, promo banner, 4-column footer, `lang="id"`, `viewport` | 6 h | — |
| R2.1 | `lib/image.ts`, `PostSummary.image`, `next.config.ts` images, `next/image` adoption | 5 h | — |
| R2.2 | `PostCard` rewrite — single tab stop, thumbnail, four required slots | 4 h | — |
| R2.3 | Indonesian copy pass across all screens + the four shared states | 4 h | **D-06** |
| R2.4 | `Pagination`, `SearchBox`, `NavLinks`, skeleton, empty, error, 404 restyle | 6 h | — |
| R3.1 | Home: hero band + dot legend + CTAs | 6 h | **D-06** |
| R3.2 | `ArchiveBoard` mockup card + `lib/tpa.ts` | 6 h | **D-06** |
| R3.3 | `ArchiveStats` timeline strip | 3 h | **D-06** |
| R3.4 | BERITA section + yellow-bold BCM/TIPS band | 4 h | **D-06** |
| R3.5 | `/tpa` route + loading state + `WF-09` | 5 h | **D-06** |
| R4.1 | Post detail restyle + label-tinted image frames (the CLS fix) | 6 h | — |
| R4.2 | Label page + six-label `pill-tab` switcher | 4 h | — |
| R4.3 | Search, About, Contact restyle | 4 h | — |
| R5.1 | `experimental.viewTransition`, VT CSS recipes, `Transition` wrapper, header anchor | 4 h | — |
| R5.2 | Shared-element morphs (photo + title) across card → detail | 5 h | — |
| R5.3 | Suspense reveals in the 3 `loading.tsx`; list identity on search/label | 4 h | — |
| R5.4 | Directional `transitionTypes` on every navigation + walk all paths | 4 h | — |
| R5.5 | Hero dot cascade, hover lifts, reduced-motion audit | 3 h | — |
| R6.1 | `opengraph-image.tsx`, icons, theme-color | 3 h | — |
| R6.2 | Test updates + new unit tests; lint, format, typecheck, build green | 5 h | — |
| R6.3 | Interface-guidelines review pass (`web-design-guidelines` skill) + fixes | 5 h | — |
| R6.4 | Lighthouse re-run, record in `QA_Report.md`, verify ≥ 90 / LCP / CLS / A11y 100 | 4 h | — |
| R6.5 | Update `Wireframes.md` (WF-08/09), `User_Guide.md` wording, `README` | 4 h | — |
| | **Total** | **113 h** | |

R1, R2.1–R2.2, R4, R5, R6 need no approval. R2.3 and all of R3 are held behind D-06 — about **28 h** of the 113.

At 40 productive h/week that is roughly **three weeks**. It is a Phase 2.3/2.4 re-entry after M4, so PROJECT_PLAN §5's timeline needs a line for it and BR-010 requires the re-estimate recorded here.

### Rollback

Every change is additive or a restyle; no data migration, no URL change, no Blogger-side change. `git revert` of the redesign range restores the current site exactly. The one irreversible-in-practice item is the Indonesian copy pass, because `User_Guide.md` gets updated alongside it.

---

## 9. Decision gate — D-06 (stakeholder)

**Question: may the home page carry UI elements with no backing functional requirement, may a `/tpa` route be added, and may the interface language change from English to Indonesian?**

Raised because `Wireframes.md:318` records a scope guard against unbacked UI elements, and BR-010 freezes scope at M1 with changes requiring re-estimation.

**What is being asked for**

1. **Home-page elements with no backing FR** — a navy hero band with a six-dot label legend, an archive board card, an archive statistics strip, a BERITA section, and a yellow-bold teaching-material band. Justification: the newest post is from October 2011 and 17 of 35 posts are a place directory, so a bare reverse-chronological list misrepresents the content and buries its most useful part. FR-001…006 remain satisfied in full — the 10-card feed and its pagination stay on `/`.
2. **A new route, `/tpa`** — the 17-centre directory. No existing route or URL changes.
3. **Interface language → Indonesian**, with `lang="id"` and `id-ID` dates. All 35 posts and all six labels are Indonesian and the audience is the Moyudan community. This does **not** violate NFR-019, which requires a single language and does not name one; i18n stays out of scope. Moving `lang` is required by WCAG 3.1.1 under NFR-016.

**Consequences to accept**

- +113 h against PROJECT_PLAN's 208 h baseline, of which ~28 h is the gated portion.
- `Wireframes.md` gains WF-08 and WF-09; its scope-guard line needs a pointer to this decision.
- `User_Guide.md` needs a wording pass: it currently promises new posts appear *"at the top of the website's home page"*, which stays true but now sits below the hero and three curated sections.
- Three test files change with the Indonesian copy.

**Options**

- **A — approve all three.** The plan as written.
- **B — approve 1 and 2, keep English.** Drops R2.3 (4 h) and the test churn. Leaves an English shell over Indonesian content.
- **C — approve 3 only.** Restyle and translate in place; home stays a bare list. Drops ~24 h. The 17 TPA posts stay buried.
- **D — reject.** Colour, typography, spacing and motion proceed under `Wireframes.md:12` with no layout or copy change (about 85 h).

### RESOLVED 2026-07-26: Option A — approved, all three

Stakeholder directed that the design overhaul proceed in full. Consequences accepted as listed above, with one amendment: the Lighthouse consequence is withdrawn, because the recorded Performance and LCP figures were ruled a stale local-emulation baseline rather than a production measurement (see §5). NFR-001 remains a product requirement; this measurement is no longer its oracle.

Per the D-01…D-04 precedent, no requirement text, priority or trace changes as a result. `Wireframes.md` gains WF-08 and WF-09 by reference to §3 of this document.

| Field | Value |
|---|---|
| ID | D-06 |
| Closes | scope guard `Wireframes.md:318`; BR-010 re-estimation |
| Decision | Home restructure + `/tpa` route + Indonesian interface approved |
| Re-estimate | +113 h against the 208 h baseline |
| Decided | 2026-07-26 |
| Status | **RESOLVED** |

---

## 10. Implementation record — 2026-07-26

Built and verified in one pass after D-06 was approved. `next build` clean, ESLint clean, Prettier clean, `tsc --noEmit` clean, **108 tests passing** (up from 23). Every route verified against a production server: `/`, `/tpa`, `/page/2`, `/labels/[label]`, `/search`, `/about`, `/contact` return 200; `/posts/<unknown>` and `/nope` return a real **404**, not a soft one.

### Departures from the plan as written

| Decision | Why |
|---|---|
| **Dark mode dropped.** The previous emerald theme had an OS-preference dark variant; the redesign is light-only, with `color-scheme: light`. | `DESIGN.md:818` records dark-mode values as never surfaced, and the pastel tint system is a light-mode device — a dark variant needs its own tint ramp and its own contrast pass, not an inversion. A visible capability was removed, so it is recorded here rather than left implicit. |
| **A `react` module augmentation was added** (`src/types/react-view-transition.d.ts`). | `<ViewTransition>` and `addTransitionType` ship in the React canary that Next 16 vendors for the App Router, but are absent from `@types/react` 19.2 and from the top-level `react` package. They work at runtime and fail `tsc`, and NFR-008 requires typecheck to pass. Verified against this build's vendored `react` and `react-dom` before writing. Delete the file when the types land upstream. |
| **One API method added** — `listArchiveIndex()`. | WF-08 needs label counts, a year histogram, the directory and three curated sections. As six label queries that is six calls per revalidation; as one walk it is a single request at this size, with everything else derived in memory (BR-003, NFR-002). |
| **The hero image is promoted out of the post body.** | It has to exist on the detail page to be the shared-element morph target. Every one of the 20 image-bearing posts has exactly **one** image, so rendering a hero *and* the body image would duplicate it. `stripFirstImage` removes it, including a wrapping anchor that would otherwise be left empty. Verified: no post is left with an empty body. |
| **Post hero frames are 3:2, cards 4:3.** | Every archive photo is straight off a DSLR. 3:2 with `object-contain` avoids letterboxing on the hero; cards crop with `object-cover`, where 4:3 is the better grid cell. |
| **Two `DESIGN.md` colour specs overridden**, per §2.4. | WCAG 2.1 AA under NFR-016 outranks a visual token. |

### Defects found in review and fixed

An independent guidelines review caught six real problems that code review by eye had missed. All are fixed; a `contrast.test.ts` suite now asserts the palette rather than documenting it.

1. **Active label pill failed contrast.** White on the mid-tone accents measured 1.42:1 (yellow), 2.66:1 (pink), 3.29:1 (teal), 3.77:1 (orange) — four of six labels. Fixed by using the `deep` tone as the active background (6.26–14.21:1), which also removed a per-label exception list. `LabelStyle.text` was renamed `deep` to make the dual role explicit.
2. **`:focus-visible { border-radius: 2px }`** — inherited from the pre-redesign stylesheet. That rule is *unlayered* and Tailwind emits utilities into `@layer utilities`, so unlayered declarations win: every pill, card and button squared off its corners on keyboard focus. Removed; outlines have followed `border-radius` since Chrome 94.
3. **`text-link` on tinted surfaces** was 4.37:1 on `surface-soft`. Switched to `link-pressed` (6.52:1) in the three places it sat on a tint.
4. **`--error` was 4.51:1** — passing by one hundredth, at 12px, over a translucent header. Darkened to `#c92a2a` (5.46:1).
5. **Loading boundaries were silent** to screen readers — every skeleton is `aria-hidden` and nothing announced. Each of the four now carries an `sr-only` `role="status"`.
6. **Above-fold thumbnails were lazy.** The board's first row and `/tpa`'s first row are the LCP candidate on their pages; the first three of each now load eagerly. Also fixed: `TpaCard` hardcoded `h2` inside a section whose own heading is `h2`, and the skip link had no focusable target for Safari.

Two review findings were **not** taken: `vt-fade` animates `filter: blur()` rather than transform/opacity alone, and `.lift` transitions `box-shadow`. The first is the official Next.js/Vercel recipe verbatim and the motion skill explicitly warns against hand-rolling it; the second is a hover affordance on one card at a time, gated behind `@media (hover: hover)`, with properties listed explicitly rather than `all`.

### Second review pass — correctness defects, reproduced live and fixed

A separate adversarial review probed the running site and found bugs that no amount of reading would have surfaced. All were re-tested against a production server after fixing.

| Defect | Was | Now |
|---|---|---|
| **Search silently truncated.** Blogger's `/posts/search` hard-caps at 10 items and — measured on this blog — returns a `nextPageToken` **forever while re-serving the same 10 posts** (12 hops → 120 items, 10 distinct). So it can neither be totalled nor paged. `/search?q=wisuda` reported "10 catatan" when 20 posts match, and results 11+ were unreachable. | 10 of 20 | **20 of 20.** `q=tpa` returns 32, `q=khataman` 9. |
| **`/labels/foto` rendered a convincing lie:** a fully styled "Foto" page reporting **0 catatan**. Blogger's `labels=` filter is case-sensitive; display text was upper-cased while the raw URL segment went to the API. | 0 posts | **20 posts.** `canonicalLabel()` normalises to the taxonomy's own casing. Verified no double-decode: `/labels/FOTO%2520` correctly resolves to `FOTO%20`, not `FOTO`. |
| **`/page/0x2` and `/page/1e1` served real page content at junk URLs**, with no canonical — indexable duplicates. `Number("0x2")` is 2 and passed `Number.isInteger`. | real page 2 | Rejected by a strict `^[1-9][0-9]*$` test; junk and page-1 URLs now also carry `robots: noindex`. |
| **`/page/99` printed "halaman 99 dari 4"** and offered a "Lebih baru" chain through 95 empty pages. | contradictory | Heading and pagination are suppressed out of range; the empty state stands alone. |
| **A single `http://` or `lh3.ggpht.com` image URL would 500 the whole page.** `next/image`'s loader *throws* on an unrecognised host or protocol, propagating to `error.tsx` — and Blogger is a live editable source where 2009-era markup routinely carries both. | latent 500 | Extraction now discards anything the optimizer would reject; `**.ggpht.com` added to `remotePatterns`. |
| **The hero could render twice.** `firstImageUrl` skips spacer pixels and non-optimizable sources, but `stripFirstImage` removed *the first* `<img>` positionally — so a 1×1 tracking pixel ahead of the real photo meant the pixel was stripped and the photo stayed in the body. Aggravated by extraction reading raw content while the strip ran on sanitized content. | latent duplicate | Stripped **by source**, matched against the hero URL. |
| **`data-src` was matched as `src`.** | latent wrong image | Anchored to `(?:^\|\s)src`. |
| **Disabled pagination ends were `aria-hidden`**, removing the very affordance the dashed border exists to convey. | hidden from AT | Exposed, with an `sr-only` "(tidak tersedia)". |
| **Sitemap omitted `/tpa` and every label view** — `/tpa` is a primary page of the new IA. | 3 static + posts | `/tpa` + 6 label URLs + 35 posts. |
| **Timezone split.** `formatDate` rendered in the server's local zone while the year was read in UTC, so the two could disagree by a day. | inconsistent | Both pinned to `Asia/Jakarta` via a shared `yearOf()`, which also buckets the timeline. |

**Three Suspense-reveal animations were dead code and have been deleted rather than left in.** The review traced this through React's commit implementation: with `loading.tsx`, Next places the Suspense boundary *outside* the page component, so the outermost view transition on reveal is the page's own `<Transition>`; a Suspense reveal carries no transition type, `<Transition>` resolves an untyped transition to `"none"`, and React then stops descending — so a nested `enter` VT is never reached. The skill's two-layer pattern only works when the outer VT sits *above* the boundary, which a page component cannot do. The skeletons keep their exit slide, which does fire, and `default="none"` was added to all four so the skeleton's mount no longer fires the browser's default cross-fade against the outgoing navigation slide. The `/labels/[label]` crossfade was also wrong — `enter` alone never pairs, so the outgoing list simply vanished; it now uses the documented `key` + `name` + `share` pattern.

**One defect is accepted, not fixed.** A genuinely malformed percent-escape (`/labels/%`, `/labels/%zz`) returns **500 rather than 404**. The throw happens in Next's routing layer before the route handler runs — no stack trace is logged and `error.tsx` is never rendered, so it cannot be caught in the page; the `try`/`catch` around `decodeURIComponent` is kept as a guard but is unreachable for this input. Converting it would mean adding a `proxy.ts` running on every request, in the non-configurable Node runtime, to handle a URL that is invalid per RFC 3986 and that no browser or crawler emits. That is disproportionate. Recorded here so it is not rediscovered as new.

**Not a defect, checked and cleared:** the hero's "Rekaman 17 TPA" is correct. `TPA AL-HIKMAH TEGAL REJO` is a real seventeenth centre, photographed with the graduation committee; the village eyebrow is omitted for it only because the trailing clause makes the parse unsafe, which is the designed fail-quiet. The two heuristics answer different questions and do not disagree.

### One thing worth a content decision, not a code change

Every migrated post renders **"oleh Harun664"** — the Blogger account that ran the 2.5 migration, not the original author. WF-02 (2) requires the author in the metadata row, and the value is accurate as *Blogger's* author of record, so the code is correct. But it reads as though one person wrote all 35 posts. Changing the display name in Blogger would fix it site-wide within the 10-minute revalidation window; no deployment needed.

---

## 11. Open items

1. **`website/DESIGN.md` is untracked** and carries a `:Zone.Identifier` sidecar from a Windows download. If it is the design source of record it should be committed; the sidecar should be deleted either way.
2. **`DESIGN.md` describes surfaces this site does not have** — pricing tiers, logo walls, comparison tables, FAQ accordions. Those components are deliberately not built. The mapping used here is: `hero-band-dark` → home hero; `workspace-mockup-card` → archive board; `card-feature-*` tints → label-tinted cards; `badge-tag-*` → label chips; `pill-tab` → label switcher; `search-pill` → search; `stat-row` → archive timeline; `card-feature-yellow-bold` → teaching-material band; `footer-region` → footer.
3. **`DESIGN.md:810` suggests `npx @google/design.md lint DESIGN.md`.** Not run — unverified third-party package, and NFR-012's no-third-party posture argues for checking it before adding it to any workflow.
4. **Comment count is unknown at design time.** `getPostComments` returns `null` on failure and the block hides entirely; the redesign must keep that path, and `Migration_Plan.md` records 4 comments as an accepted migration loss.
5. **Author is often empty.** `Post.author` may be `""`; the detail meta row must not render a dangling `· by`. Handled — and see §10 on the migration account name.
6. **Dark mode is not implemented** and the previous theme's dark variant was removed (§10). If it is wanted back it needs its own tint ramp and its own contrast pass, which is a scoped piece of work rather than a token flip.
7. **`.next` incremental artifacts drifted** during development: repeated `next build` runs left prerendered HTML for `/` and `/tpa` referencing a CSS chunk from an earlier build, which then 404'd. A clean `rm -rf .next && next build` resolved it and every route now resolves the same chunk. Not a code defect and not reachable on Vercel, where every deploy builds fresh — noted so it is not re-diagnosed as one.
