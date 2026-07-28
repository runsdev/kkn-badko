# Wireframes — kkn-badko-blog

| Field | Value |
|-------|-------|
| **Document** | Low-fidelity wireframes (Phase 1, task 1.4.1) |
| **System** | kkn-badko-blog — Fullstack Blog Website (Next.js + Google Blogger API) |
| **Version** | 1.0 |
| **Date** | 2026-07-24 |
| **Status** | For M1 requirements sign-off (with `01-srs/SRS_Draft.md` v1.1) |
| **Traces to** | SRS §3.1.1 UI screens, FR-001…FR-020, FEAT-001…008 |

These are deliberately low-fidelity: they fix **layout, content slots, navigation, and state behavior**, not colors, typography, or spacing (those belong to Phase 2.3 with Tailwind, decision D-01). Every screen is responsive; the mobile variant is shown once (WF-00, WF-01) and all other screens follow the same single-column stacking rule.

---

## Conventions

- `[ ... ]` interactive element (link, button, input)
- `(n)` numbered callout, explained under each frame
- `~~~~` placeholder for sanitized HTML content from Blogger (never raw — FR-008)
- All screens share the global shell (WF-00): header + footer wrap the content area.

## Route map

| Route | Screen | Wireframe | Rendering |
|-------|--------|-----------|-----------|
| `/` | Home / post list (page 1) | WF-01 | ISR 600 s |
| `/page/[n]` | Post list, page *n* | WF-01 | ISR 600 s |
| `/posts/[slug]` | Post detail + comments | WF-02 | ISR 600 s |
| `/labels/[label]` | Label-filtered list | WF-03 | ISR 600 s |
| `/search?q=…` | Search results | WF-04 | Dynamic (per query) |
| `/about` | About | WF-05 | ISR 600 s |
| `/contact` | Contact (mailto) | WF-06 | Static |
| unknown slug/route | Not found | WF-07c | Static 404 |

---

## WF-00 — Global shell

### Desktop (≥ 1024 px)

```
+----------------------------------------------------------------------+
| (1) KKN BADKO BLOG          (2) [Home]  [About]  [Contact]           |
|                             (3) [ search posts...            ] [Go]  |
+----------------------------------------------------------------------+
|                                                                      |
|                        { screen content area }                       |
|                                                                      |
+----------------------------------------------------------------------+
| (4) (c) KKN BADKO — content authored in Google Blogger               |
+----------------------------------------------------------------------+
```

### Mobile (< 768 px)

```
+------------------------------+
| KKN BADKO BLOG      (5) [=]  |
+------------------------------+
| [ search posts...      ][Go] |
+------------------------------+
|                              |
|   { content, one column }    |
|                              |
+------------------------------+
| (c) KKN BADKO                |
+------------------------------+
```

1. Site title — links to `/`.
2. Primary nav: Home, About (FEAT-007), Contact (FEAT-008).
3. Global search box — submits to `/search?q=…` (FEAT-005); empty/whitespace submit is blocked client-side with an inline prompt (FR-013).
4. Footer — static; no tracking scripts (NFR-012).
5. Hamburger opens the same three nav links; must be keyboard- and screen-reader-operable (WCAG 2.1 AA, NFR-016).

---

## WF-01 — Home / Post list (`/`, `/page/[n]`) — FEAT-001/002

### Desktop

```
+----------------------------------------------------------------------+
| { global shell header }                                              |
+----------------------------------------------------------------------+
| Latest posts                                                         |
|                                                                      |
| +------------------------------------------------------------------+ |
| | (1) [Post title — links to /posts/slug]        (2) 12 Jul 2026  | |
| | (3) [Label]                                                     | |
| | (4) Excerpt of the post body, plain text, max ~3 lines, then    | |
| |     truncated with an ellipsis...                               | |
| +------------------------------------------------------------------+ |
|                                                                      |
|   ... (5) 10 cards per page (POSTS_PER_PAGE), newest first ...       |
|                                                                      |
| (6)            [< Newer]      Page 2 of 7      [Older >]             |
+----------------------------------------------------------------------+
| { global shell footer }                                              |
+----------------------------------------------------------------------+
```

### Mobile

```
+------------------------------+
| Latest posts                 |
| +--------------------------+ |
| | [Post title]             | |
| | [Label]  -  12 Jul 2026  | |
| | Excerpt, max 3 lines...  | |
| +--------------------------+ |
| | [Post title]             | |
| |          ...             | |
| +--------------------------+ |
| [< Newer]  2/7  [Older >]    |
+------------------------------+
```

1. Card title → post detail (FR-007). Whole card is one link target (single tab stop).
2. Publish date, human-readable, from `post.published`.
3. Primary label chip → `/labels/[label]` (FR-011).
4. Excerpt from `post.excerpt` (FR-001).
5. Exactly `POSTS_PER_PAGE = 10` cards, ordered newest-first (FR-002).
6. Pagination controls render only when more than one page exists (FR-004); "Older/Newer" fetch by Blogger page token (FR-005); out-of-range page → WF-07b empty state or 404 (FR-006).

**States:** loading → WF-07a skeleton; API failure with no cache → WF-07d error (FR-003).

---

## WF-02 — Post detail (`/posts/[slug]`) — FEAT-003/006

```
+----------------------------------------------------------------------+
| { global shell header }                                              |
+----------------------------------------------------------------------+
| (1) Post title (h1)                                                  |
| (2) 12 Jul 2026  ·  by Author  ·  [Label] [Label]                    |
|----------------------------------------------------------------------|
| (3) ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~   |
|     ~~~~ sanitized post body (images, headings, lists) ~~~~~~~~~~   |
|     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~   |
|----------------------------------------------------------------------|
| (4) Comments (3)                                                     |
| +------------------------------------------------------------------+ |
| |  Author name  ·  13 Jul 2026                                     | |
| |  ~~~~ sanitized comment text ~~~~                                | |
| +------------------------------------------------------------------+ |
| |  Author name  ·  14 Jul 2026                                     | |
| |  ~~~~ ... ~~~~                                                   | |
| +------------------------------------------------------------------+ |
| (5) Comments are managed in Blogger.                                 |
|                                                                      |
| (6) [<- Back to all posts]                                           |
+----------------------------------------------------------------------+
```

1. One `h1` per page; feeds `<title>`, meta description, Open Graph, and JSON-LD `BlogPosting` (FR-009, NFR-015).
2. Metadata row: date, author display name, all label chips (each → WF-03).
3. Post body rendered **only after sanitization** (FR-008, P-2). Images lazy-loaded.
4. Native Blogger comments, read-only (FR-016); zero comments → "No comments yet." quiet state; comment fetch failure → hide the block entirely (SRS §3.2.6).
5. Static caption — there is deliberately **no comment form** (FR-017).
6. Back link to `/`.

**States:** unknown slug → HTTP 404, WF-07c (FR-010).

---

## WF-03 — Label listing (`/labels/[label]`) — FEAT-004

```
+----------------------------------------------------------------------+
| { global shell header }                                              |
+----------------------------------------------------------------------+
| (1) Posts labeled: "kegiatan"                     (2) [All posts]    |
|                                                                      |
|   { post cards — identical to WF-01 card, filtered by label }        |
|                                                                      |
|   { pagination — identical to WF-01 (6) }                            |
+----------------------------------------------------------------------+
```

1. Heading names the active label (FR-011; label URL-encoded per P-5).
2. Escape hatch back to the unfiltered list.

**States:** label with zero posts → WF-07b empty state, *not* an error (FR-012).

---

## WF-04 — Search results (`/search?q=…`) — FEAT-005

```
+----------------------------------------------------------------------+
| { global shell header — search box retains the submitted query }     |
+----------------------------------------------------------------------+
| (1) Results for: "lomba"  —  4 posts found                           |
|                                                                      |
|   { post cards — identical to WF-01 card }                           |
+----------------------------------------------------------------------+
```

No-results variant:

```
| Results for: "xyzzy"                                                 |
|                                                                      |
|   (2)  No posts match your search.                                   |
|        Try a different keyword, or [browse all posts].               |
```

1. Query echoed back **HTML-escaped**; it was validated non-empty and URL-encoded before the API call (FR-013, FR-014, P-3).
2. Defined no-results state with a recovery action (FR-015).

---

## WF-05 — About (`/about`) — FEAT-007

```
+----------------------------------------------------------------------+
| { global shell header }                                              |
+----------------------------------------------------------------------+
| About (h1)                                                           |
|                                                                      |
| (1) ~~~~ sanitized page content from Blogger `pages` ~~~~            |
|     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~            |
+----------------------------------------------------------------------+
```

1. Content is the Blogger "About" page, sanitized before render (FR-018). Page absent in Blogger → 404 (WF-07c).

---

## WF-06 — Contact (`/contact`) — FEAT-008

```
+----------------------------------------------------------------------+
| { global shell header }                                              |
+----------------------------------------------------------------------+
| Contact (h1)                                                         |
|                                                                      |
| Questions or feedback? Email us:                                     |
|                                                                      |
| (1)   [ ✉  kontak@example.org ]   <- mailto: link                    |
|                                                                      |
| (2) (There is no contact form; nothing you type is stored here.)     |
+----------------------------------------------------------------------+
```

1. Single `mailto:` link to the configured owner email (FR-019; address comes from env config, NFR-018).
2. Plain-text reassurance; no form, no submission endpoint, no storage (FR-020, NFR-012).

---

## WF-07 — Shared state patterns

Every data-backed screen (WF-01…05) uses these; they satisfy the "explicit loading, empty, and error states" clause of SRS §3.1.1.

**(a) Loading — skeleton**

```
| +--------------------------+ |
| | ████████████░░░░░        | |
| | ░░░░  -  ░░░░░░░░        | |
| | ░░░░░░░░░░░░░░░░░░░░░░   | |
| +--------------------------+ |
```

Card-shaped placeholders, no layout shift when content arrives (protects CLS ≤ 0.1, NFR-001).

**(b) Empty**

```
|        (icon)                |
|   Nothing here yet.          |
|   [Browse all posts]         |
```

Used for: empty label (FR-012), out-of-range page (FR-006), no search results (FR-015 — wording per WF-04).

**(c) Not found — HTTP 404**

```
|   404 — Page not found       |
|   The post or page you're    |
|   looking for doesn't exist. |
|   [Go to home page]          |
```

Used for unknown slug (FR-010) and unknown routes. A real 404 status code, not a soft error.

**(d) Error — upstream failure, no cache**

```
|   Something went wrong       |
|   We couldn't load posts.    |
|   Please try again shortly.  |
|   [Retry]                    |
```

Shown only when the Blogger API fails **and** no ISR cache exists (FR-003); with a warm cache the last good page is served instead and readers never see this (NFR-009, P-1). Never exposes a stack trace.

---

## Traceability

| Wireframe | Screen (SRS §3.1.1) | Features | Requirements exercised |
|-----------|---------------------|----------|------------------------|
| WF-00 | Global shell | — | FR-013 (input guard), NFR-012, NFR-016 |
| WF-01 | Home / Post list | FEAT-001/002 | FR-001…FR-006 |
| WF-02 | Post detail | FEAT-003/006 | FR-007…FR-010, FR-016, FR-017, NFR-015 |
| WF-03 | Label / Category | FEAT-004 | FR-011, FR-012 |
| WF-04 | Search results | FEAT-005 | FR-013…FR-015 |
| WF-05 | About | FEAT-007 | FR-018 |
| WF-06 | Contact | FEAT-008 | FR-019, FR-020 |
| WF-07 | Loading/empty/error/404 | cross-cutting | FR-003/006/010/012/015, NFR-001, NFR-009 |

All 8 SRS UI screens and all 20 functional requirements are covered; no wireframe introduces an element without a backing requirement (scope guard per PROJECT_PLAN §7, "scope creep").

---

## Addendum — WF-08, WF-09 (added 2026-07-26 under D-06)

| ID | Screen | Feature | Backing |
|----|--------|---------|---------|
| WF-08 | Home / archive front door | FEAT-001/002 | FR-001…FR-006 **+ D-06** |
| WF-09 | TPA directory (`/tpa`) | — | **D-06** |
| WF-10 | Month archive (`/arsip/[year]/[month]`) | — | **D-07** |
| WF-11 | Beranda / landing page (`/`) | — | **D-08** |

**Both are specified in `06-redesign/Redesign_Plan.md` §3, not here.** They are the one place this document's scope guard is knowingly relaxed: WF-08 adds a hero band, an archive board, a statistics strip, a news section and a teaching-material band, and WF-09 adds a route — none of which has a backing FR. That relaxation was raised as decision gate **D-06** and resolved as approved on 2026-07-26.

WF-08 **supersedes WF-01 for the archive front door**, which **D-08 moved from `/` to `/arsip`**. WF-01 continues to govern `/page/[n]`. Every FR-001…FR-006 obligation now lives on **`/arsip`**: the ten-card feed, all four card slots, and pagination rooted there, so page 2's "newer" link returns to `/arsip`. `POSTS_PER_PAGE` remains exactly 10.

**WF-11** is the new landing page at `/`, specified in `06-redesign/D-08_Landing_Split.md`. It carries no functional requirement — it is identity-first (who this organisation is) where `/arsip` is data-first (what the archive holds). The navy hero band belongs to `/arsip`; WF-11 is deliberately light and its signature is a typographic roll call of the seventeen centres.

WF-00's delegation at line 12 (colour, typography, spacing belong to Phase 2.3) is unchanged and is what authorises the rest of the redesign without a decision record.

Two WF-00/WF-01 requirements that the original build did not meet are satisfied by the redesign: the whole post card is now a single link and a single tab stop (WF-00 (1)), and label chips no longer add a tab stop each.

Interface language is Indonesian as of D-06, so the literal strings drawn in these frames — "Latest posts", "Go", "Newer"/"Older", "Page n of m" — are superseded by their Indonesian equivalents. The frames' layout and state behaviour are unaffected.

**WF-10 (D-07)** is the native equivalent of Blogger's BlogArchive gadget, specified in `06-redesign/Gadgets_Research.md` §6 and §11. Two notes bear on this document's rules:

- **No sidebar.** Blogger puts gadgets in a right rail; this site deliberately does not, because none of WF-00…WF-09 has one. The archive, label and contributor gadgets are expressed as bands and footer columns in the existing rhythm instead.
- **The route omits `loading.tsx` on purpose**, following `/posts/[slug]`, so `notFound()` can return the real 404 status WF-07c requires rather than a soft 200. A valid month holding no posts remains a WF-07b empty state.

Blogger's **Popular Posts** gadget is out of scope permanently, not deferred: no per-post view data exists in the API, and Blogger's own widget reports an empty set for this blog.
