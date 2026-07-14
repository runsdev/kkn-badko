	# Project Plan — Fullstack Blog Website (Next.js + Blogger API)

**Document version:** 1.0
**Date:** 2026-06-29
**Project type:** Website development
**Tech stack:** Next.js (frontend + API routes), Google Blogger API (content source), deployed as a fullstack web application

---

## 1. Executive Summary

This project delivers a fullstack blog website built with **Next.js**, sourcing and managing content through the **Google Blogger API**. The work is organized into **3 main phases**, and each main phase is broken into **4 sub-phases** (12 sub-phases total).

| Phase | Name | Estimated Effort |
|-------|------|------------------|
| 1 | Requirement Gathering | 20 hrs |
| 2 | Website Building | 160 hrs |
| 3 | Socialization to Stakeholders | 20 hrs |
| **Total** | | **200 hrs** |

At a nominal **40 productive hrs/week**, the calendar duration is roughly **5 weeks**.

---

## 2. Goals & Success Criteria

**Project goal:** Launch a fast, SEO-friendly blog that reads/writes posts through the Blogger API, with a clean reading experience and an admin-friendly publishing flow.

**Definition of done:**
- Blog renders posts pulled from the Blogger API (list, detail, pagination).
- Search, categories/labels, and individual post pages work.
- Responsive design (mobile, tablet, desktop).
- SEO basics in place (meta tags, sitemap, Open Graph, structured data).
- Deployed to a public URL with CI/CD.
- Stakeholders trained and signed off.

**Out of scope (unless added later):** native mobile app, multi-language i18n, paid subscriptions, custom CMS replacing Blogger.

---

## 3. Roles & Responsibilities

| Role | Responsibility |
|------|----------------|
| Project Owner / Stakeholder | Provides requirements, approves milestones, final sign-off |
| Developer (you) | Design, build, test, deploy |
| Content Owner | Supplies blog content, manages Blogger account |
| Reviewer/QA | Validates features against requirements |

---

## 4. Phase Breakdown

### PHASE 1 — Requirement Gathering (20 hrs)

> Goal: Lock down what to build, for whom, and with what constraints before any code is written.

| Sub-phase | Task | Est. |
|-----------|------|------|
| **1.1 Stakeholder discovery** (5 hrs) | 1.1.1 Prepare interview questions & schedule sessions | 2 hrs |
| | 1.1.2 Conduct stakeholder interviews; capture goals, audience, metrics, content strategy | 3 hrs |
| **1.2 Functional & non-functional requirements** (6 hrs) | 1.2.1 Document functional features (post list, post detail, search, labels, comments, contact) | 3 hrs |
| | 1.2.2 Document non-functional targets (SEO, performance, accessibility) | 3 hrs |
| **1.3 Technical scoping** (5 hrs) | 1.3.1 Set up & verify Blogger API access (OAuth/API key) | 3 hrs |
| | 1.3.2 Decide rendering strategy (SSG/ISR/SSR), hosting target, domain | 2 hrs |
| **1.4 Requirements sign-off** (4 hrs) | 1.4.1 Produce wireframe sketches | 2 hrs |
| | 1.4.2 Compile requirements document, review & get written approval | 2 hrs |

**Deliverables:** Requirements document, wireframes, confirmed API credentials, approved scope.
**Exit criteria:** Stakeholder approves the requirements document.

---

### PHASE 2 — Website Building (160 hrs)

> Goal: Design, implement, and ship the fully working blog.

| Sub-phase | Task | Est. |
|-----------|------|------|
| **2.1 Setup & architecture** (30 hrs) | 2.1.1 Init Next.js project, repo + Git | 4 hrs |
| | 2.1.2 Folder structure & env config | 4 hrs |
| | 2.1.3 Blogger API client/service layer (server-side) | 8 hrs |
| | 2.1.4 Design system / UI library setup | 6 hrs |
| | 2.1.5 Linting, formatting, TypeScript config | 4 hrs |
| | 2.1.6 Base layout & routing skeleton | 4 hrs |
| **2.2 Core features** (60 hrs) | 2.2.1 Home / post list page | 8 hrs |
| | 2.2.2 Pagination | 6 hrs |
| | 2.2.3 Single post page (detail) | 8 hrs |
| | 2.2.4 Labels / categories pages | 8 hrs |
| | 2.2.5 Search functionality | 8 hrs |
| | 2.2.6 Comments integration | 8 hrs |
| | 2.2.7 About page | 6 hrs |
| | 2.2.8 Contact page | 8 hrs |
| **2.3 UI/UX & styling** (40 hrs) | 2.3.1 Responsive layout system | 8 hrs |
| | 2.3.2 Theming & navigation | 8 hrs |
| | 2.3.3 Loading / empty / error states | 6 hrs |
| | 2.3.4 Accessibility pass | 8 hrs |
| | 2.3.5 Image optimization | 4 hrs |
| | 2.3.6 Polish & cross-browser check | 6 hrs |
| **2.4 Optimization, testing & deployment** (30 hrs) | 2.4.1 SEO: meta tags, Open Graph, JSON-LD | 8 hrs |
| | 2.4.2 Sitemap.xml & robots.txt | 4 hrs |
| | 2.4.3 Performance, caching & ISR tuning (Lighthouse) | 6 hrs |
| | 2.4.4 Unit / integration tests | 8 hrs |
| | 2.4.5 CI/CD setup + production deploy | 4 hrs |

**Deliverables:** Working deployed website, source code repository, test suite, deployment pipeline.
**Exit criteria:** All core features functional in production; QA passes against Phase 1 requirements.

#### Technical notes for Phase 2
- **Rendering:** Prefer **ISR (Incremental Static Regeneration)** for blog posts — fast like static, refreshes content from Blogger on a revalidation interval.
- **Blogger API:** Use a server-side service layer (Next.js API routes or server components) so the API key is never exposed to the browser.
- **Key endpoints:** `posts.list`, `posts.get`, `posts.getByPath`, `pages.list`, label/search via `posts.list?labels=` and `?q=`.
- **Caching:** Cache API responses and use revalidation to stay within Blogger API quota.
- **SEO:** Generate `sitemap.xml`, `robots.txt`, per-post meta + Open Graph + JSON-LD `BlogPosting`.

---

### PHASE 3 — Socialization to Stakeholders (20 hrs)

> Goal: Present, hand over, and onboard stakeholders so they can use and maintain the site.

| Sub-phase | Task | Est. |
|-----------|------|------|
| **3.1 Documentation & training material** (6 hrs) | 3.1.1 User / publishing guide (Blogger → site updates) | 3 hrs |
| | 3.1.2 Admin & deployment runbook docs | 3 hrs |
| **3.2 Demo & walkthrough** (5 hrs) | 3.2.1 Prepare demo environment & script | 2 hrs |
| | 3.2.2 Conduct live demo & publishing-flow walkthrough | 3 hrs |
| **3.3 Feedback & adjustments** (5 hrs) | 3.3.1 Collect & log stakeholder feedback | 2 hrs |
| | 3.3.2 Make minor fixes / tweaks | 3 hrs |
| **3.4 Handover & sign-off** (4 hrs) | 3.4.1 Transfer credentials / ownership | 2 hrs |
| | 3.4.2 Final sign-off & post-launch support plan | 2 hrs |

**Deliverables:** User & admin documentation, training session, signed handover.
**Exit criteria:** Stakeholders trained and project formally accepted.

---

## 5. Timeline (indicative, 40 hrs/week)

```
Week 1        : Phase 1 (Requirement Gathering)  ── 20 hrs
Week 2–5      : Phase 2 (Website Building)        ── 160 hrs
   Week 2     :   2.1 Setup & architecture
   Week 3     :   2.2 Core features (start)
   Week 4     :   2.2 Core features / 2.3 UI-UX
   Week 5     :   2.3 UI-UX / 2.4 Optimization & deploy
Week 6        : Phase 3 (Socialization)           ── 20 hrs
```

> Note: Phase 2 spans ~4 weeks. If a 5-week total is required, compress by overlapping 2.3 and 2.4 or adding hours/week.

---

## 6. Milestones

| # | Milestone | Phase | Sign-off |
|---|-----------|-------|----------|
| M1 | Requirements approved | End of Phase 1 | Stakeholder |
| M2 | Project scaffolded + Blogger API connected | End of 2.1 | Developer |
| M3 | Core blog features working | End of 2.2 | QA |
| M4 | Production deployment live | End of 2.4 | Stakeholder |
| M5 | Handover & final sign-off | End of Phase 3 | Stakeholder |

---

## 7. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Blogger API quota limits | Medium | Cache + ISR; minimize live calls |
| API auth/credential delays | High | Secure access during Phase 1 (1.3) |
| Scope creep | High | Lock scope at M1; change requests re-estimated |
| Content not ready at launch | Medium | Use sample/seed content; content owner timeline |
| Performance/SEO gaps | Medium | Lighthouse audit in 2.4 before launch |

---

## 8. Tooling & Stack Summary

- **Framework:** Next.js (App Router), React
- **Content:** Google Blogger API (v3)
- **Styling:** Tailwind CSS (or chosen UI library)
- **Hosting:** Vercel (recommended for Next.js) or equivalent
- **Version control / CI:** Git + GitHub + GitHub Actions / Vercel CI
- **Testing:** Jest/Vitest + React Testing Library; Playwright (optional E2E)
- **Quality:** ESLint, Prettier, TypeScript

---

## 9. Effort Summary

| Phase | Sub-phases | Tasks | Hours |
|-------|-----------|-------|-------|
| 1. Requirement Gathering | 1.1–1.4 | 8 | 20 |
| 2. Website Building | 2.1–2.4 | 25 | 160 |
| 3. Socialization | 3.1–3.4 | 8 | 20 |
| **Total** | **12** | **41** | **200** |

> Every task is scoped to **≤ 8 hours** for easier tracking, assignment, and daily progress check-ins.
