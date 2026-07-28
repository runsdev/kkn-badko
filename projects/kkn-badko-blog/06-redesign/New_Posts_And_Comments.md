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

**The blog currently has zero comments.** Verified per-post and blog-wide (blog-level listing needs OAuth; with an API key it is 403). The four comments on the legacy blog were recorded as an accepted loss in `Migration_Plan.md`.

**Blogger's own comment form is live and already Indonesian.** On `tpamoyudan.blogspot.com/2010/11/tpa-al-huda-kaliduren-3.html` I found `comment-form`, `comment-editor`, a `comments-block`, and the label **"Posting Komentar"**. So commenting works today — just on the blogspot address, not ours.

**The editor is an origin-pinned iframe.** Its URL is `https://www.blogger.com/comment/frame/{blogId}?po={postId}&hl=id&…&origin=https://tpamoyudan.blogspot.com`. That `origin` parameter is the blog's own domain, which is the first reason embedding it elsewhere is unlikely to work.

### The four options

**A — Link each post to its Blogger comment form.** *(recommended)*
A "Tulis komentar di Blogger" link on the post page, pointing at the blogspot post. The reader comments in Blogger's own form; it appears on our site read-only within the 10-minute revalidation.

- **Breaks nothing.** FR-017 forbids "any interface to create, edit, or delete comments" and its acceptance is "no comment-submission control is present" — a link is navigation, not a control. BR-008 keeps comments read-only and moderated in Blogger, which this *reinforces*. NFR-012 is untouched: no script, no cookie, no data collected by us. NFR-005 stands: no database.
- **Arguably needs no decision record at all** — it is consistent with the requirements as written. Worth confirming rather than assuming.
- **Cost: 2 h.** Verified: the comments block already renders on a post with none — it shows "Belum ada komentar." and the Blogger caption, and only hides when the fetch itself fails. So the invitation has a place to sit with no restructuring.
- **Downside:** a context switch to blogspot.com, which exposes the address the custom domain exists to replace.

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
3. **Explicit acceptance that on-site comment posting is out** — the API has no insert method, and every workaround breaks NFR-012, FR-017, or NFR-005.

**Recommendation: do both, Part 1 first.** Part 1 is a defect fix on the site's most public strings. Part 2 is cheap and only pays off once Part 1 exists.

**Status: OPEN.**

---

## 4. Open questions I could not answer from here

1. **Are comments actually switched on in Blogger's settings?** The form renders on the post page, which strongly implies yes, but the setting itself (Settings → Comments → *Who can comment*) is only visible from the Blogger dashboard. If it is set to "Only members of this blog", a link would send readers to a form they cannot use.
2. **Should comments be moderated?** Blogger can hold them for approval. On a public archive with no active caretaker, unmoderated comments are a spam surface; moderated ones need someone to check. That is an operational commitment, not a code decision, and it belongs in the Runbook if Part 2 proceeds.
3. **What is the intended posting cadence?** The 12-month dormancy threshold in Part 1 is my proposal, not a measured value. If the organisation expects to post seasonally, 12 months is right; if it expects monthly activity, 3–6 months would read better.
