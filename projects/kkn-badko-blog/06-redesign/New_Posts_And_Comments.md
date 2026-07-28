# Two questions: new posts vs. the archive, and enabling comments

**Date:** 2026-07-27
**Status:** research complete, plan awaiting a decision (**D-09**)

---

## Part 1 — A new post is currently mislabelled as archive

You are right, and it is worse than a wording problem: the site *asserts* things about the archive that a single new post makes false.

### What I measured

I simulated adding one post dated today to the current three-year set:

| | frozen archive | after one 2026 post |
|---|---|---|
| `span` | `2009–2011` | `2009–2026` ✓ adapts |
| `total` | 3 | 4 ✓ adapts |
| month groups rendered | 2011, 2010, 2009 | 2026, 2011, 2010, 2009 ✓ empty years skipped |
| gap-filled year list | 3 entries | **18 entries, 14 of them zero** |
| the caption would read | "Arsip berhenti setelah 2011" | **"Arsip berhenti setelah 2026"** |

So the *numbers* mostly self-correct. The *claims* do not.

### Two distinct defects

**a) Six strings are hardcoded to 2009–2011 and to 35 posts.** They will be wrong forever, and two of them are the site's most public surfaces:

| File | String |
|---|---|
| `lib/site.ts:8` | `SITE_DESCRIPTION` — "35 catatan … dari 2009 sampai 2011". **This is the meta description on every page.** |
| `app/opengraph-image.tsx:14,53` | "…2009–2011" and "35 catatan … 2009 sampai 2011". **This is the social sharing card.** |
| `app/layout.tsx:78` | promo banner "Arsip 2009–2011" — on every page |
| `app/page.tsx:51` | door title "Arsip 2009–2011" |
| `app/arsip/page.tsx:22` | description "…2009–2011" |
| `app/tpa/page.tsx:14` | description "…arsip Badko, 2009–2011" |

**b) The framing itself is archive-only, and it is asserted rather than derived.** `ArchiveStats` says the archive "berhenti setelah" a year it computes — which turns into the absurd "the archive stopped after 2026" the moment 2026 has a post. `Hero` says the posts were "diarsipkan supaya tidak hilang". Beranda says "Situs ini menyimpan catatannya". All true today; all wrong about something published this morning.

There is also a structural gap: a new post has nowhere that says *new*. It lands in "Seluruh catatan" and in `/arsip/2026/07` under a heading reading "Arsip Juli 2026", and the only nav item that leads to it is labelled **Arsip**.

### The fix: derive the framing, don't assert it

One idea carries the whole change — **the site should work out for itself whether it is still dormant**, and speak accordingly. Nothing hardcoded, nothing to remember to update.

Add to `lib/archive.ts`, with an injectable `now` so it stays testable:

```ts
latestPublished(posts)            // newest post's date
isDormant(posts, now, months=12)  // nothing published for over a year
recentPosts(posts, now, months=12)
```

Then every assertion becomes conditional on one boolean:

| Surface | dormant (today) | active (a new post exists) |
|---|---|---|
| Promo banner | `Arsip {span} · Dokumentasi TPA se-Kecamatan Moyudan` | `{n} catatan baru · Terakhir diperbarui {date}` |
| `SITE_DESCRIPTION` | derived, not a constant — built in a `generateMetadata` on the root layout | same, with the live count and span |
| OG card | as now, with derived numbers | leads with the newest post |
| `ArchiveStats` caption | "Arsip berhenti setelah {year}" | "Catatan terbaru: {month} {year}" |
| `Hero` / Beranda copy | "diarsipkan supaya tidak hilang" | "masih diperbarui" |
| Beranda | roll call first | **"Baru" section promoted above the roll call**, each recent post chipped |
| Month page | "Arsip {month}" | "{month}" with a `Baru` chip when recent |

Threshold: **12 months**. A community organisation that posts twice a year is not dormant; one that has not posted since 2011 is. Injectable, so it is one number to change and it is covered by tests rather than by judgement.

`Date.now()` in a server component makes output time-dependent, which is fine here — ISR re-evaluates every 10 minutes anyway — but the helpers must take `now` as a parameter so the tests are not clock-dependent.

**Estimate: 8 h.** Six hardcoded strings, three conditional copy paths, one new derivation with tests, and a root-layout `generateMetadata`.

---

## Part 2 — Can comments be enabled?

**Reading them already works. Accepting new ones cannot be done on this site without breaking four requirements — but there is a clean way to get comments flowing anyway.**

### Research findings

**Blogger's API cannot create a comment.** The v3 Comments resource has `list`, `get`, `approve`, `delete`, `listByBlog`, `markAsSpam`, `removeContent` — **there is no insert**. Probed directly against the live blog with an OAuth token: `POST` and `PUT` to `/posts/{id}/comments` both return **404**. There is no method to call.

**The legacy GData v2 comment-POST endpoint still serves, but no longer accepts.** Probed 2026-07-27 against the live blog. This was worth checking separately: v2 was the API that *did* have a comment-publish method, at

```
POST https://www.blogger.com/feeds/{blogId}/{postId}/comments/default
Content-Type: application/atom+xml
<entry xmlns='http://www.w3.org/2005/Atom'><title …/><content type='html'>…</content></entry>
```

The **read** side of v2 is alive: `GET` on that URL, on `/posts/default`, and on the blog-wide comments feed all return `200 application/atom+xml` with valid Atom.

The **write** side is gone, and it fails silently rather than loudly:

| Probe | Result |
|---|---|
| `POST` + OAuth Bearer + `GData-Version: 2` | `200`, body is the **read feed** |
| `POST` with no auth | `200`, read feed — auth is not even consulted |
| `POST` with a malformed entry (`<nope/>`), and with an empty body | `200`, read feed — the body is not parsed |
| `POST` to the `blogspot.com` host, to `/comments/full`, to the blog-wide feed | `200`, read feed |
| `POST` to `/posts/default/{postId}/comments/default` | `404` |
| `X-HTTP-Method-Override: POST` | `200`, read feed |

The decisive measurement: **the `POST` response is byte-identical to the `GET` response** (same md5). The method is ignored and the read handler serves it. Blog comment count before the probes: 1. After all eight: **1** — nothing created, nothing pending, nothing in spam.

So a client for this endpoint could not be written *even badly*. There is no status code to branch on and no error body to surface: every call looks like a success and every call does nothing. Shipping one would produce a comment box that silently swallows what readers write — worse than having none.

**Consequence for the options below: A is not merely the recommended option, it is the only one that can accept a comment at all.** B, C and D were already ruled out on requirements; A is now ruled *in* on the additional ground that Blogger's own editor is the last surface Google still lets a comment through.

**The blog currently has zero comments.** Verified per-post and blog-wide (blog-level listing needs OAuth; with an API key it is 403). The four comments on the legacy blog were recorded as an accepted loss in `Migration_Plan.md`.

**Blogger's own comment form is live and already Indonesian.** On `tpamoyudan.blogspot.com/2010/11/tpa-al-huda-kaliduren-3.html` I found `comment-form`, `comment-editor`, a `comments-block`, and the label **"Posting Komentar"**. So commenting works today — just on the blogspot address, not ours.

**The editor is an origin-pinned iframe.** Its URL is `https://www.blogger.com/comment/frame/{blogId}?po={postId}&hl=id&…&origin=https://tpamoyudan.blogspot.com`. That `origin` parameter is the blog's own domain, which is the first reason embedding it elsewhere is unlikely to work.

### The four options

**A — Link each post to its Blogger comment form.** *(recommended — **implemented 2026-07-27**)*
A "Tulis komentar di Blogger" link on the post page, pointing at the blogspot post. The reader comments in Blogger's own form; it appears on our site read-only within the 10-minute revalidation.

- **Breaks nothing.** FR-017 forbids "any interface to create, edit, or delete comments" and its acceptance is "no comment-submission control is present" — a link is navigation, not a control. BR-008 keeps comments read-only and moderated in Blogger, which this *reinforces*. NFR-012 is untouched: no script, no cookie, no data collected by us. NFR-005 stands: no database.
- **Arguably needs no decision record at all** — it is consistent with the requirements as written. Worth confirming rather than assuming.
- **Cost: 2 h.** Verified: the comments block already renders on a post with none — it shows "Belum ada komentar." and the Blogger caption, and only hides when the fetch itself fails. So the invitation has a place to sit with no restructuring.
- **Downside:** a context switch to blogspot.com, which exposes the address the custom domain exists to replace.
- **As built:** `lib/comments.ts` (`bloggerCommentUrl`, + tests) and `components/CommentInvite.tsx` (+ tests), rendered by `app/posts/[slug]/page.tsx`. The link target is `{post.url}#comment-form` — the URL Blogger itself publishes as the post's `rel="replies" type="text/html"` link, not a constructed guess. `Post` gained `url`, which `POST_FIELDS` already fetched, so this costs no extra API call. Verified against the running production build on a post with a comment and a post without: both render the invitation, and the destination returns `200` with the editor on it.

**B — Embed Blogger's comment iframe.** *Not recommended.*
Would keep the reader on our site, but: the `origin` parameter is pinned to blogspot.com so it probably refuses to load; a blogger.com iframe sets Google cookies, which collides with NFR-012's "shall not collect, process, or store end-user personal data"; and an embedded form **is** a comment-submission control, so it violates FR-017 outright. Two requirement breaches for a feature that may not even render.

**C — Third-party comments** (Disqus, Giscus, Cusdis). *Not recommended.*
External scripts and tracking break NFR-012. Giscus and Utterances require the reader to have a GitHub account — entirely wrong for TPA teachers and parents in Moyudan. And it moves the comment record out of Blogger, breaking both BR-008's moderation model and the architecture's single-source-of-truth premise.

**D — Self-hosted comments.** *Not recommended.*
Needs storage (NFR-005 forbids an application database), needs to collect names and emails (NFR-012 forbids), needs a moderation surface (no admin UI exists and none is in scope), and needs spam handling. Largest change, most requirements broken.

### Honest note on value

The blog has **4 page views all time** and **0 comments**, and nothing has been published since October 2011. Comments on a dormant archive will not be used. They become worth having only if the organisation starts posting again — which is exactly what Part 1 is about. **The two asks belong together:** make the site handle new posts properly, and comments have a reason to exist. On their own today, they do not.

---

## 3. Decision gate — D-09 (stakeholder)

**Question: adopt the derived dormant/active framing, and add a comment link to Blogger?**

1. **Part 1, derived framing** — replaces six hardcoded strings and three asserted claims with values computed from the posts. **8 h.** No new route, no new UI element without a purpose; this is a correctness fix to copy the site already displays, so it arguably needs no scope approval — but it does change the meta description and OG card, which are stakeholder-visible.
2. **Part 2, Option A comment link** — **2 h.** Consistent with FR-017 and BR-008 as written; confirmation wanted rather than approval.
3. **Explicit acceptance that on-site comment posting is out** — v3 has no insert method, the legacy GData v2 endpoint silently discards writes (probed above), and every remaining workaround breaks NFR-012, FR-017, or NFR-005.

**Recommendation: do both, Part 1 first.** Part 1 is a defect fix on the site's most public strings. Part 2 is cheap and only pays off once Part 1 exists.

**Status: OPEN.**

---

## 4. Open questions I could not answer from here

1. **Are comments actually switched on in Blogger's settings?** *Partly answered, still worth confirming from the dashboard.* Fetching the editor iframe directly (`/comment/frame/{blogId}?po={postId}&hl=id`) returns `200` and renders an Indonesian editor — "Masukkan Komentar", a textarea, "Publikasikan" — so commenting is enabled in some form. The only identity wording in that HTML is **"Akun Google"**, with no "Anonim" and no "Nama/URL", which points at *User with Google Accounts* rather than *Anyone*. The editor is JS-rendered, so this is inference from the served markup and not proof; the setting itself is only visible at Settings → Comments → *Who can comment*. The shipped copy therefore says Blogger "**mungkin** meminta Anda masuk" — hedged deliberately, because the exact setting was not read. Confirm it from the dashboard and tighten the wording.
2. **Should comments be moderated?** Blogger can hold them for approval. On a public archive with no active caretaker, unmoderated comments are a spam surface; moderated ones need someone to check. That is an operational commitment, not a code decision, and it belongs in the Runbook if Part 2 proceeds.
3. **What is the intended posting cadence?** The 12-month dormancy threshold in Part 1 is my proposal, not a measured value. If the organisation expects to post seasonally, 12 months is right; if it expects monthly activity, 3–6 months would read better.
