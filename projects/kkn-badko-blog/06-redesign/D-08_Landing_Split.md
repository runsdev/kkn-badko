# D-08 — Split the landing page from the archive

**Date:** 2026-07-27
**Status:** **RESOLVED — approved and built**
**Supersedes:** the `/` half of WF-08 (which moves to `/arsip` unchanged)

---

## 1. What changed

The archive front door built under D-06 lived at `/` and did two jobs at once: it introduced the organisation *and* served as the paginated post list. Those are now separate pages.

| Route | Job | Signature |
|---|---|---|
| `/` — **Beranda** (new, WF-11) | who this **is** | light `surface-soft` field; the seventeen centres as a typographic **roll call** |
| `/arsip` — **Arsip** (WF-08, moved verbatim) | what the archive **contains** | navy hero band; photo board; month timeline; the full paginated feed |

They are built so they cannot be confused for one another. `DESIGN.md`'s navy band stays `/arsip`'s signature and is deliberately **not** repeated on Beranda; the landing page is light and leads with type. Same design system, opposite composition, same 17 records shown two opposite ways — a board of photographs on one, a list of names on the other.

Beranda's own content: light hero with an inline four-figure summary, the roll call, three tinted "doors" (Arsip / Kabar & kegiatan / Bahan mengajar), and the three newest posts.

---

## 2. Why this needed a decision

`Wireframes.md:318` guards against UI without a backing requirement, and BR-010 freezes scope at M1. This change goes further than adding UI — **it moves where a functional requirement is satisfied**:

- **FR-001…FR-006** (post list, newest-first, 10 per page, next/previous navigation, empty state for an out-of-range page) were satisfied at `/`. They are now satisfied at **`/arsip`**.
- `POSTS_PER_PAGE = 10` is unchanged and still exact.
- The list's page 1 is now `/arsip`, so `Pagination`'s page-2 "newer" link returns there instead of `/`, and `/page/1` and junk page URLs redirect to `/arsip`.

No URL was removed. `/page/[n]`, `/posts/[slug]`, `/labels/[label]`, `/search`, `/tpa`, `/about`, `/contact` and `/arsip/[year]/[month]` are all untouched.

**Consequences accepted:** +1 route; `Wireframes.md` gains WF-11 and WF-08 is scoped to `/arsip`; the nav grows to five items; `User_Guide.md` needs its "where a post shows up" table repointed.

---

## 3. Implementation record

Built and green: ESLint, Prettier, `tsc --noEmit` clean; clean `next build`; **144 tests passing** (up from 138). All 19 routes verified live, including every 404.

### Repointed, so nothing still assumes the feed lives at `/`

`Pagination` (page-2 "newer" → `/arsip`, plus its test) · `/page/[n]` redirect and comment · `EmptyState`'s "browse the whole archive" · the post detail back link · the footer's "Semua catatan" · the month page's "Semua bulan" anchor → `/arsip#bentuk-arsip` · `NavLinks` gains **Arsip** · `sitemap.xml` gains `/arsip` at priority 0.9 and demotes `/` to `monthly` (the landing page is stable; the list is what changes).

### New

`components/RollCall.tsx` — the signature block. `lib/tpa.ts` gains `prettyTpaName()`, because archive titles are shouted (`TPA SABIILUL MUTTAQIIN KALIDUREN 1`) which is fine in a dense grid but unreadable set large. It preserves what must stay uppercase — the `TPA` prefix, roman branch numerals (`AS-SALAM II` must not become `Ii`), digits — and cases each hyphen segment so `AL-HUDA` becomes `Al-Huda` rather than `Al-huda`. A title that is already mixed-case is left alone, so a future post typed normally is not reflowed. Six tests.

No new API calls: Beranda derives everything from the same cached `listArchiveIndex()` walk.

### A JSX whitespace bug found by looking at the render

The roll call's count rendered as **"17TPA"**. The HTML was `17<!-- -->TPA` — the space between the expression and the following word had genuinely been dropped, which happens when the expression begins its line inside a multi-line JSX text block. Two other spots with the same shape (`/tpa`'s "17 tempat", the archive band's year totals) were checked in the raw HTML and are **fine**, so this is positional rather than universal.

Fixed with an explicit `&nbsp;`, which is also the better typography — "17 TPA" should not break across lines. The same fix was applied to the door counts, which had lost the space before their arrow (`35 catatan→`).

**Lesson worth keeping:** this class of bug is invisible in code review and invisible to the test suite, because Testing Library normalises whitespace. It was only caught by rendering the page and reading it.

---

## 4. Register entry

| Field | Value |
|---|---|
| ID | D-08 |
| Closes | relocation of FR-001…FR-006 from `/` to `/arsip`; scope guard `Wireframes.md:318` for WF-11 |
| Decision | Split the landing page from the archive; Beranda is identity-first, `/arsip` is the post list root |
| Re-estimate | +10 h |
| Decided | 2026-07-27 |
| Status | **RESOLVED** |

Per the D-01…D-04 precedent, no requirement *text*, priority or trace changes — only the route at which FR-001…FR-006 are satisfied, which is recorded here and in `Wireframes.md`.
