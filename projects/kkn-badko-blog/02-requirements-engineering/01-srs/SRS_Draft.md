# Software Requirements Specification (SRS) — kkn-badko-blog

| Field | Value |
|-------|-------|
| **Document** | Software Requirements Specification (SRS Draft) |
| **System** | kkn-badko-blog — Fullstack Blog Website (Next.js + Google Blogger API) |
| **Version** | 1.0 (complete draft — all sections) |
| **Date** | 2026-06-29 |
| **Methodology** | Waterfall (IEEE 830 / IEEE 29148) |
| **Status** | Complete — §1–§3.6 generated; audited (see `Audit_Report.md`) |
| **Traceability sources** | all files in `_context/` |
| **Governing standards** | IEEE Std 830-1998, IEEE Std 29148-2018, IEEE Std 1016, ISO/IEC 25010 / 25023 / 25051 / 25062 |

---

## Table of Contents

- [1. Introduction](#1-introduction)
  - [1.1 Purpose](#11-purpose)
  - [1.2 Scope](#12-scope)
  - [1.3 Definitions, Acronyms, and Abbreviations](#13-definitions-acronyms-and-abbreviations)
  - [1.4 References](#14-references)
  - [1.5 Overview](#15-overview)
  - [1.6 Out of Scope](#16-out-of-scope)
- [2. Overall Description](#2-overall-description)
  - [2.1 Product Perspective](#21-product-perspective) (2.1.1–2.1.8: System, User, Hardware, Software, Communications Interfaces; Memory; Operations; Site Adaptation)
  - [2.2 Product Functions](#22-product-functions)
  - [2.3 User Characteristics](#23-user-characteristics)
  - [2.4 Constraints](#24-constraints)
  - [2.5 Assumptions and Dependencies](#25-assumptions-and-dependencies)
  - [2.6 Apportioning of Requirements](#26-apportioning-of-requirements)
- [3. Specific Requirements](#3-specific-requirements)
  - [3.1 External Interface Requirements](#31-external-interface-requirements) (3.1.1–3.1.4)
  - [3.2 System Features (Functional Requirements)](#32-system-features-functional-requirements) — FR-001…FR-020 across 3.2.1–3.2.8
  - [3.2 Logic and Data Model](#32-logic-and-data-model) — 3.2.9 Process Descriptions, 3.2.10 Data Constructs, 3.2.11 Data Dictionary
  - [3.3 Performance Requirements](#33-performance-requirements) — NFR-001…003
  - [3.4 Design Constraints](#34-design-constraints) — NFR-004…008
  - [3.5 Software System Attributes](#35-software-system-attributes) — NFR-009…017 (3.5.1 Reliability, 3.5.2 Availability, 3.5.3 Security, 3.5.4 Maintainability, 3.5.5 Standards Compliance)
  - [3.6 Other Requirements](#36-other-requirements) — NFR-018…019

*Companion artifact: `Audit_Report.md` — Requirements Audit, RTM (39 requirements), Gap Analysis, and Conformance Statement.*

---

## 1. Introduction

### 1.1 Purpose

This section distinguishes the purpose of the **software** from the purpose of **this document**.

**Purpose of the software.** The kkn-badko-blog system SHALL deliver a fast, SEO-friendly, publicly accessible blog that renders content authored in Google Blogger. Content authoring remains in the Blogger platform; the system reads posts, pages, labels, and comments through the Blogger API v3 and presents them with a clean, responsive, accessible reading experience.

**Purpose of this SRS.** This document specifies the functional and non-functional requirements, external interfaces, and quality attributes of the kkn-badko-blog system with sufficient rigor for design, implementation, verification, and acceptance. It serves as the authoritative agreement between the Project Owner, the Developer, the Content Owner, and Reviewer/QA. Every requirement in later sections SHALL trace to a stakeholder need recorded in `_context/vision.md`.

**Intended audience.** Project Owner / Stakeholder (scope and acceptance), Developer (design and implementation), Content Owner (publishing workflow), and Reviewer/QA (verification).

### 1.2 Scope

**Product name:** kkn-badko-blog.

**Product relationship to larger systems.** The system is a Next.js application deployed to the **Vercel** hosting platform that consumes the **Google Blogger platform** as its single upstream content source via the Blogger API v3. It is a downstream, read-only consumer of Blogger; it neither replaces Blogger's authoring interface nor writes back to it.

The following scope items each trace to a stakeholder need in `_context/vision.md`:

| Scope item (IN scope) | Traces to |
|-----------------------|-----------|
| Render a paginated list of posts from the Blogger API | OBJ-002, FIT-001, FEAT-001/002 |
| Render individual post detail pages | OBJ-002, FIT-001, FEAT-003 |
| Filter posts by label / category | FIT-002, FEAT-004 |
| Search posts | FIT-002, FEAT-005 |
| Display native Blogger comments (read-only) | FEAT-006, BR-008 |
| Provide About and Contact (mailto) pages | FEAT-007/008, BR-009 |
| Responsive design across mobile, tablet, desktop | FIT-003 |
| SEO baseline: meta tags, Open Graph, JSON-LD, sitemap, robots | OBJ-001, FIT-004 |
| Deploy to a public URL with CI/CD | OBJ-001, FIT-005 |
| Meet performance and accessibility targets | FIT-006 (Lighthouse ≥ 90), FIT-007 (WCAG 2.1 AA) |
| Enable stakeholders to operate and maintain the site | OBJ-003 |

**Benefits.** The system gives readers a fast, discoverable blog while allowing the Content Owner to keep authoring in the familiar Blogger interface, with content appearing on the site within 10 minutes (ISR 600 s revalidation).

### 1.3 Definitions, Acronyms, and Abbreviations

Terms are standardized per IEEE Std 610.12-1990 and this project's `_context/glossary.md`.

| Term | Definition |
|------|------------|
| Blogger API (v3) | Google REST API used to read blog posts, pages, labels, and comments that back this site. |
| Next.js | React framework used for the frontend and server-side API/render layer. |
| App Router | Next.js routing model used for pages and server components. |
| ISR | Incremental Static Regeneration — serves static pages and revalidates them from the source on an interval (600 s for this system). |
| SSG | Static Site Generation — pages built at build time. |
| SSR | Server-Side Rendering — pages rendered per request on the server. |
| Service layer | Server-side module that mediates all Blogger API calls and hides credentials. |
| Label | Blogger's term for a post category/tag; used for filtering. |
| SEO | Search Engine Optimization. |
| Open Graph | Metadata standard for rich link previews on social platforms. |
| JSON-LD | Structured-data format; `BlogPosting` schema used for posts. |
| Sitemap | `sitemap.xml` listing site URLs for crawlers. |
| Lighthouse | Google tool auditing performance, SEO, accessibility, and best practices. |
| WCAG | Web Content Accessibility Guidelines (target level 2.1 AA). |
| NFR | Non-Functional Requirement. |
| CI/CD | Continuous Integration / Continuous Deployment. |
| IEEE 830 | IEEE Std 830-1998, Recommended Practice for Software Requirements Specifications. |
| IEEE 29148 | ISO/IEC/IEEE 29148, Requirements engineering. |
| ISO/IEC 25010 | Systems and software product quality model. |
| PSR / CSR / FSAR | Royce's formal customer review gates: Preliminary, Critical, and Final Software Acceptance Reviews. |
| MVP | Minimum Viable Product. |

### 1.4 References

**Governing standards:**
1. IEEE Std 830-1998 — Recommended Practice for Software Requirements Specifications.
2. ISO/IEC/IEEE 29148-2018 — Requirements engineering.
3. IEEE Std 1233-1998 — Guide for Developing System Requirements Specifications.
4. IEEE Std 610.12-1990 — Standard Glossary of Software Engineering Terminology.
5. ISO/IEC 25010 — Systems and software Quality Requirements and Evaluation (product quality model).
6. ISO/IEC 25023 — Measurement of system and software product quality.
7. ISO/IEC 25051 — Requirements for quality of Ready to Use Software Product (RUSP).
8. ISO/IEC 15504-1 — Process assessment concepts and vocabulary.

**Project context sources (traceability):**
9. `_context/vision.md` — problem, stakeholders, objectives, fit criteria, scope, risks.
10. `_context/glossary.md` — standardized terminology.
11. `_context/features.md` — feature inventory (FEAT-001…008).
12. `_context/tech_stack.md` — technology and architecture constraints.
13. `_context/business_rules.md` — business rules (BR-001…011).
14. `_context/quality_standards.md` — ISO/IEC 25010 quality targets.
15. `PROJECT_PLAN.md` — end-to-end phase and effort plan.

### 1.5 Overview

The remainder of this SRS is organized per IEEE 830:

- **Section 2 — Overall Description:** product perspective (Blogger + Vercel context), product functions, user classes, operating environment, constraints, assumptions, and dependencies. *(To be produced by `descriptive-modeling`.)*
- **Section 3.1 — External Interface Requirements:** user, hardware, software (Blogger API v3), and communications interfaces. *(To be produced by `interface-specification`.)*
- **Section 3.2 — System Features (Functional Requirements):** functional decomposition with stimulus/response pairs and "shall" clauses for FEAT-001…008. *(To be produced by `feature-decomposition`.)*
- **Section 3.2.2–3.2.4 — Logic and data constructs / business rules.** *(To be produced by `logic-modeling`.)*
- **Sections 3.3–3.5 — Non-Functional Requirements / quality attributes** mapped from ISO/IEC 25010 (performance ≥ 90 Lighthouse, WCAG 2.1 AA, coverage ≥ 80%, best-effort availability). *(To be produced by `attribute-mapping`.)*
- **Section 4 — Verification & Validation:** audit and Requirements Traceability Matrix. *(To be produced by `semantic-auditing`.)*

### 1.6 Out of Scope

The following items are explicitly excluded to prevent scope creep. Every reasonable expectation is classified IN or OUT of scope.

| # | Out-of-Scope Item | Reason / Notes |
|---|-------------------|----------------|
| 1 | Native mobile application | Out of scope per `_context/vision.md` §6; web-responsive only. |
| 2 | Multi-language / i18n | Deferred; single-language site. |
| 3 | Paid subscriptions / paywall | Not part of the blog objectives. |
| 4 | Custom CMS replacing Blogger | Blogger remains the sole authoring system (BR-001). |
| 5 | Write-back to Blogger (create/edit posts on the site) | System is read-only (BR-002). |
| 6 | Contact form with backend storage | Contact is a `mailto:` link; no submissions are stored (BR-009). |
| 7 | Custom comment/moderation system | Native Blogger comments only; moderation occurs in Blogger (BR-008). |
| 8 | Custom domain at launch | Launches on the Vercel subdomain; custom domain deferred. |

---

## 2. Overall Description

> Generated by `descriptive-modeling` from `_context/tech_stack.md`, `_context/features.md`, and `_context/quality_standards.md`, per IEEE 830 §5.2.

### 2.1 Product Perspective

kkn-badko-blog is a self-contained Next.js (App Router) web application deployed on the **Vercel** platform. It operates as a **downstream, read-only consumer** of the Google Blogger platform: all content originates in Blogger and is retrieved through the Blogger API v3 by a server-side service layer. The system holds no persistent database of its own; state is limited to build artifacts and the ISR cache (600 s revalidation). The system SHALL sanitize all HTML received from Blogger before rendering.

**System Block Diagram (description).** Reader browsers issue HTTPS requests to the Vercel edge/serverless runtime hosting the Next.js app. Next.js server components / API routes call the Google Blogger API v3 over HTTPS, using a server-side API key; responses are cached and served as ISR-rendered pages. A CI/CD pipeline (GitHub → Vercel) builds and deploys the application. No component runs on-premise; there is no application database and no write path back to Blogger.

#### 2.1.1 System Interfaces
| Interface | Functionality | Description |
|-----------|---------------|-------------|
| Google Blogger API v3 | Content source | REST/JSON over HTTPS; `posts.list`, `posts.get`, `posts.getByPath`, `pages.list`, comments; server-side key. |
| Vercel platform | Hosting + runtime | Serves ISR pages, runs serverless/edge functions, terminates TLS, provides CI/CD. |
| GitHub | Source + CI trigger | Repository and pipeline trigger for builds/deploys. |

#### 2.1.2 User Interfaces
The system SHALL present a responsive web UI (mobile, tablet, desktop) meeting **WCAG 2.1 AA**. Logical screens: Home / post list (with pagination), Post detail (with native Blogger comments), Label/category listing, Search results, About, Contact (`mailto:` link). The UI SHALL provide clear loading, empty, and error states.

#### 2.1.3 Hardware Interfaces
The system has no direct hardware interfaces. It runs on Vercel's managed cloud infrastructure and is consumed by standard client devices (desktop/mobile browsers) over HTTPS. No specialized peripherals, ports, or drivers are required.

#### 2.1.4 Software Interfaces
| Name | Version | Source | Purpose / Message Format |
|------|---------|--------|--------------------------|
| Next.js (App Router) | current LTS-compatible | Vercel/OSS | Application framework; render + API routes |
| React | bundled with Next.js | OSS | UI component rendering |
| Node.js runtime | Vercel-provided | Vercel | Executes server components / functions |
| Google Blogger API | v3 | Google | Content retrieval; JSON over HTTPS |
| Tailwind CSS | current | OSS | Styling `[CONTEXT-GAP: UI library not finalized]` |
| Jest/Vitest + React Testing Library | current | OSS | Unit/integration tests |
| Playwright (optional) | current | OSS | E2E tests |

#### 2.1.5 Communications Interfaces
All traffic SHALL use HTTPS/TLS. Client↔app is HTTPS. App↔Blogger is REST/JSON over HTTPS. No other network protocols are required. There is no requirement for a private/local network.

#### 2.1.6 Memory Constraints
The system SHALL operate within Vercel serverless/edge function limits (memory and execution-time bounds of the selected plan). There is no application database; secondary storage is limited to build output and the ISR page cache. `[CONTEXT-GAP: Vercel plan tier and function memory limit not specified]`

#### 2.1.7 Operations
Normal operation is unattended content serving. Content changes are made by the Content Owner in Blogger and appear on the site within 10 minutes via ISR revalidation. Deployments are automated through CI/CD. Backup/recovery of content is inherently provided by Blogger (system of record); the application is stateless and can be redeployed from source at any time.

#### 2.1.8 Site Adaptation Requirements
Deployment SHALL be configured via environment variables (Blogger API key, target Blog ID, ISR interval, contact email for the `mailto:` link). No per-site data migration is required. Initialization consists of setting environment variables and connecting the repository to Vercel.

### 2.2 Product Functions
Features (FEAT-001…008) group into four major capability buckets:

| Capability bucket | Functions | Features |
|-------------------|-----------|----------|
| Content Presentation | Post list, pagination, post detail rendering | FEAT-001, FEAT-002, FEAT-003 |
| Content Discovery | Label/category filtering, search | FEAT-004, FEAT-005 |
| Engagement & Information | Native comment display, About page, Contact (mailto) | FEAT-006, FEAT-007, FEAT-008 |
| Platform Quality | SEO (meta/OG/JSON-LD/sitemap), performance, deployment | Derived from OBJ-001, quality_standards |

### 2.3 User Characteristics
| User class | Education / Expertise | Interaction |
|------------|----------------------|-------------|
| Reader (public) | General public; no technical expertise assumed | Browses, searches, reads posts and comments |
| Content Owner | Blogger-literate; non-developer | Authors/moderates content in Blogger; no site login |
| Developer | Software engineering | Builds, deploys, maintains the application |
| Reviewer / QA | Testing / requirements literacy | Verifies features against this SRS |

### 2.4 Constraints
- **Read-only source:** The system SHALL NOT create or modify Blogger content (BR-002).
- **Credential handling:** Blogger API credentials SHALL be server-side only (BR-004); secrets SHALL NOT be committed (BR-006).
- **Content safety:** Blogger HTML SHALL be sanitized before render (BR-005).
- **API quota:** Responses SHALL be cached with ISR (600 s) to remain within Blogger API quota (BR-007).
- **No stored user data:** Contact is a `mailto:` link; the system SHALL NOT store user submissions (BR-009).
- **Quality standards:** The system SHALL conform to ISO/IEC 25010 targets in `quality_standards.md` (Lighthouse performance ≥ 90, WCAG 2.1 AA, test coverage ≥ 80%) and be evaluated as ready-to-use software per **ISO/IEC 25051**.
- **Environmental dependency:** As a cloud-hosted site consumed over the public internet, availability depends on Vercel and reader connectivity; the reliability target is best-effort (no formal SLA).

### 2.5 Assumptions and Dependencies
- A Google Blogger blog exists, is published, and is reachable via the Blogger API v3.
- Valid Blogger API credentials (API key / Blog ID) are provided before build.
- The Blogger API v3 remains available and backward-compatible for the endpoints used.
- Content is authored and moderated in Blogger by the Content Owner.
- A Vercel account and a GitHub repository are available for hosting and CI/CD.
- `[CONTEXT-GAP: UI library (Tailwind assumed) to be confirmed]`

### 2.6 Apportioning of Requirements
The following are apportioned to future versions and are not required for v1.0:

| # | Deferred item | Target |
|---|---------------|--------|
| 1 | Custom domain attachment (launch on Vercel subdomain) | Post-launch |
| 2 | Any write-back / authoring UI on the site | Not planned |
| 3 | Multi-language / i18n | Not planned |

All other requirements in this SRS are apportioned to the initial release (v1.0).

---

## 3. Specific Requirements

### 3.1 External Interface Requirements

> Generated by `interface-specification` from `_context/tech_stack.md`, `_context/features.md`, and `_context/quality_standards.md`, per IEEE 830 §5.3.1.

**Actors (from feature user stories and the tech stack):**
- **Reader** (public end user) — home/list, post detail, label, search, About, Contact (FEAT-001…008).
- **Content Owner** — indirect actor; authors and moderates content in the Blogger platform, not on this site.
- **Google Blogger API v3** — external system actor (content provider).
- **Vercel platform** — external hosting/runtime actor.

#### 3.1.1 User Interfaces
The system SHALL present a responsive HTML/CSS web interface rendered by Next.js, usable on mobile, tablet, and desktop viewports, and SHALL conform to **WCAG 2.1 AA** and ISO/IEC 25010 Usability.

| UI screen | Purpose | Key elements | Traces to |
|-----------|---------|--------------|-----------|
| Home / Post list | Browse recent posts | Post cards (title, excerpt, date, label), pagination control | FEAT-001/002 |
| Post detail | Read a full post | Sanitized post body, metadata, native Blogger comments | FEAT-003/006 |
| Label / Category | Filter by label | Label list, filtered post list | FEAT-004 |
| Search results | Find posts | Search input, results list, empty state | FEAT-005 |
| About | Static information | Page content from Blogger `pages` | FEAT-007 |
| Contact | Reach the owner | `mailto:` link (no form) | FEAT-008 |

- The UI SHALL provide explicit loading, empty, and error states for every data-backed screen.
- Search input SHALL be validated/encoded before use in the Blogger `q` query parameter (input-validation expectations per ISO/IEC 25062).
- No end-user authentication UI is required (the site is public, read-only).

#### 3.1.2 Hardware Interfaces
The system requires no direct hardware interfaces. It executes on Vercel's managed serverless/edge runtime and is accessed by standard client devices (browsers) over the public internet. No peripherals, sensors, serial ports, or device drivers are involved.

| Device class | Interface | Notes |
|--------------|-----------|-------|
| Client devices (desktop/mobile browsers) | HTTPS over the public internet | Standard TCP/IP; no app-specific hardware requirement |
| Host infrastructure (Vercel) | Managed cloud (abstracted) | No physical hardware owned or configured by the project |

#### 3.1.3 Software Interfaces
| Name | Version | Protocol / Port | Auth | Message format | Purpose |
|------|---------|-----------------|------|----------------|---------|
| Google Blogger API | v3 | HTTPS / 443 (TLS 1.3) | Server-side API key | JSON (REST) | Retrieve posts, pages, labels, comments (`posts.list/get/getByPath`, `pages.list`) |
| Vercel platform | current | HTTPS / 443 | Platform token (CI) | Platform API / build hooks | Host, build, deploy, serve ISR pages |
| GitHub | current | HTTPS / 443 | Repo/CI credentials | Git / webhooks | Source control and CI/CD trigger |

- The Blogger API key SHALL be transmitted only from the server-side service layer (never the browser), consistent with BR-004.
- No relational database interface exists; therefore no database ports (e.g., 3306/5432) are opened.
- No token-based end-user session interface (e.g., RFC 7519 JWT) is required, as the site has no user login.

#### 3.1.4 Communications Interfaces
All communication SHALL use HTTPS on port **443** with **TLS 1.3**.

**Connectivity map (description).** A reader's browser establishes an HTTPS/443 (TLS 1.3) connection to the Vercel edge/serverless runtime. For content, the Next.js server layer opens an outbound HTTPS/443 (TLS 1.3) connection to `www.googleapis.com` (Blogger API v3), retrieves JSON, caches it under ISR (600 s), and returns rendered HTML to the browser over the same secured client connection. CI/CD traffic flows from GitHub to Vercel over HTTPS/443. The Contact interaction is client-side only: selecting the `mailto:` link invokes the reader's local mail client (no network call to this system).

- Inbound: only 443/HTTPS is exposed (Vercel-managed TLS termination).
- Outbound: only 443/HTTPS to Google Blogger API and platform services.
- No custom low-level protocols, VPN, or private-network requirements apply. Client link-layer (e.g., Wi‑Fi such as IEEE 802.11 family, cellular, or wired) is out of the system's control and imposes no additional requirement beyond reachable internet access.

### 3.2 System Features (Functional Requirements)

> Generated by `feature-decomposition` from `_context/features.md` and `_context/quality_standards.md`, per IEEE 830 §5.3.1–§5.3.2. Every requirement carries one `shall` per clause, a GWT acceptance stub with exactly one `When`, an importance ranking (IEEE 830 §4.3.5), and backward traceability (§4.3.8). Conformance target: ISO/IEC 25010 Functional Suitability.

**Global parameters (affect behavior across features):**
- `POSTS_PER_PAGE` — number of posts per list page = **10** (decided).
- `ISR_REVALIDATE` — cache revalidation interval = 600 s (decided).
- `BLOG_ID`, `BLOGGER_API_KEY` — server-side configuration (BR-004/006).

---

#### 3.2.1 Home / Post List — [Source: features.md > FEAT-001]

**3.2.1.1 Description / Priority.** Display a paginated list of the blog's posts retrieved from the Blogger API. **Importance: Essential.**

**3.2.1.2 Stimulus / Response.**
| Stimulus | Response |
|----------|----------|
| Reader requests the home page | System returns an ISR-rendered list of the most recent `POSTS_PER_PAGE` posts |
| Blogger API is unreachable | System serves the last good cached page or a defined error state |

**3.2.1.3 Functional Requirements.**

**FR-001: Retrieve and render post list.** The system shall retrieve posts via Blogger `posts.list` and render title, excerpt, publish date, and primary label for each.
**Acceptance:** *Given* a published blog with posts, *When* a reader opens the home page, *Then* up to `POSTS_PER_PAGE` posts render with title, excerpt, date, and label. *Priority: Must | Audience: End User | Precondition: BLOG_ID configured.*

**FR-002: Order newest-first.** The system shall order the post list by published date descending.
**Acceptance:** *Given* posts with differing publish dates, *When* the list renders, *Then* the newest post appears first. *Priority: Must | Audience: End User | Precondition: None.*

**FR-003: Handle API failure.** The system shall present a defined error state when the post list cannot be retrieved and no cache exists.
**Acceptance:** *Given* the Blogger API is unavailable and no cached page exists, *When* a reader opens the home page, *Then* a non-blank error state is shown (not a stack trace). *Priority: Must | Audience: End User | Precondition: None.*

**§5.3.2 coverage:** validity — none (no user input); sequence — request → `posts.list` → cache(ISR 600 s) → render; abnormal — FR-003; parameters — `POSTS_PER_PAGE`, `ISR_REVALIDATE`; I/O — Blogger JSON → HTML list; errors — FR-003.

---

#### 3.2.2 Pagination — [Source: features.md > FEAT-002]

**3.2.2.1 Description / Priority.** Navigate across pages of the post list. **Importance: Essential.**

**3.2.2.2 Stimulus / Response.**
| Stimulus | Response |
|----------|----------|
| Reader selects "next"/"previous" | System renders the corresponding page of posts |
| Reader requests a non-existent page | System returns an empty state or 404 |

**3.2.2.3 Functional Requirements.**

**FR-004: Provide pagination controls.** The system shall render next/previous navigation whenever more than `POSTS_PER_PAGE` posts exist.
**Acceptance:** *Given* more posts than one page holds, *When* the list renders, *Then* pagination controls are visible. *Priority: Must | Audience: End User | Precondition: None.*

**FR-005: Fetch a page by token/index.** The system shall retrieve the requested page using the Blogger page token/index.
**Acceptance:** *Given* a valid next-page reference, *When* the reader activates "next", *Then* the next set of posts renders. *Priority: Must | Audience: End User | Precondition: FR-001.*

**FR-006: Reject invalid page requests.** The system shall return an empty state or HTTP 404 for an out-of-range page.
**Acceptance:** *Given* a page reference beyond the last page, *When* it is requested, *Then* an empty state or 404 is returned (no error page crash). *Priority: Should | Audience: End User | Precondition: None.*

**§5.3.2 coverage:** validity — page reference must resolve to a valid token/range; sequence — resolve token → `posts.list` → render; abnormal — FR-006; parameters — `POSTS_PER_PAGE`; I/O — page ref → post subset; errors — FR-006.

---

#### 3.2.3 Single Post Page — [Source: features.md > FEAT-003]

**3.2.3.1 Description / Priority.** Render a full post by its slug/path. **Importance: Essential.**

**3.2.3.2 Stimulus / Response.**
| Stimulus | Response |
|----------|----------|
| Reader opens a post URL | System renders the sanitized post body and metadata |
| Reader opens an unknown slug | System returns HTTP 404 |

**3.2.3.3 Functional Requirements.**

**FR-007: Retrieve a post by path.** The system shall retrieve the post via `posts.getByPath`/`posts.get` for the requested slug.
**Acceptance:** *Given* an existing published post, *When* its URL is opened, *Then* that post's content renders. *Priority: Must | Audience: End User | Precondition: None.*

**FR-008: Sanitize post HTML.** The system shall sanitize post HTML before rendering to prevent script injection (BR-005).
**Acceptance:** *Given* a post body containing a `<script>` element, *When* the post renders, *Then* the script is not executed. *Priority: Must | Audience: Developer | Precondition: None.*

**FR-009: Emit per-post SEO metadata.** The system shall emit title, meta description, Open Graph, and JSON-LD `BlogPosting` for the post.
**Acceptance:** *Given* a rendered post, *When* the page source is inspected, *Then* per-post meta, OG, and JSON-LD tags are present. *Priority: Must | Audience: Developer | Precondition: None.*

**FR-010: Return 404 for unknown post.** The system shall return HTTP 404 when the slug matches no post.
**Acceptance:** *Given* a slug with no matching post, *When* it is opened, *Then* HTTP 404 with a defined not-found page is returned. *Priority: Must | Audience: End User | Precondition: None.*

**§5.3.2 coverage:** validity — slug must map to a post; sequence — resolve slug → fetch → sanitize → render + emit metadata; abnormal — FR-010; parameters — `ISR_REVALIDATE`; I/O — slug → post HTML + metadata; errors — FR-008, FR-010.

---

#### 3.2.4 Labels / Categories — [Source: features.md > FEAT-004]

**3.2.4.1 Description / Priority.** Filter posts by Blogger label. **Importance: Essential.**

**3.2.4.2 Stimulus / Response.**
| Stimulus | Response |
|----------|----------|
| Reader selects a label | System renders posts carrying that label |
| Label has no posts | System renders an empty state |

**3.2.4.3 Functional Requirements.**

**FR-011: Filter by label.** The system shall retrieve posts for a selected label via `posts.list?labels=`.
**Acceptance:** *Given* a label with matching posts, *When* the reader selects it, *Then* only posts carrying that label render. *Priority: Must | Audience: End User | Precondition: None.*

**FR-012: Empty label state.** The system shall render a defined empty state when a label has no posts.
**Acceptance:** *Given* a label with zero posts, *When* its page is opened, *Then* an empty state (not an error) is shown. *Priority: Should | Audience: End User | Precondition: None.*

**§5.3.2 coverage:** validity — label value URL-encoded; sequence — read label → `posts.list?labels=` → render; abnormal — FR-012; parameters — `POSTS_PER_PAGE`; I/O — label → filtered posts; errors — falls back to FR-003 pattern on API failure.

---

#### 3.2.5 Search — [Source: features.md > FEAT-005]

**3.2.5.1 Description / Priority.** Search posts by free-text query. **Importance: Essential.**

**3.2.5.2 Stimulus / Response.**
| Stimulus | Response |
|----------|----------|
| Reader submits a query | System renders matching posts |
| Reader submits an empty query | System prompts for input; no API call |
| No matches | System renders an empty state |

**3.2.5.3 Functional Requirements.**

**FR-013: Validate and encode query.** The system shall reject an empty/whitespace query and URL-encode a non-empty query before use in the Blogger `q` parameter.
**Acceptance:** *Given* the search box, *When* a reader submits only whitespace, *Then* no API call is made and an input prompt is shown. *Priority: Must | Audience: End User | Precondition: None.*

**FR-014: Return search results.** The system shall retrieve matching posts via `posts.list?q=` and render them.
**Acceptance:** *Given* a query matching one or more posts, *When* it is submitted, *Then* matching posts render. *Priority: Must | Audience: End User | Precondition: FR-013.*

**FR-015: No-results state.** The system shall render a defined empty state when a query yields no posts.
**Acceptance:** *Given* a query with no matches, *When* it is submitted, *Then* a "no results" state is shown. *Priority: Should | Audience: End User | Precondition: FR-014.*

**§5.3.2 coverage:** validity — non-empty + encoded query (ISO/IEC 25062); sequence — validate → encode → `posts.list?q=` → render; abnormal — FR-013, FR-015; parameters — `POSTS_PER_PAGE`; I/O — query string → matching posts; errors — API failure → FR-003 pattern.

---

#### 3.2.6 Comments (native Blogger, read-only) — [Source: features.md > FEAT-006]

**3.2.6.1 Description / Priority.** Display native Blogger comments on a post; no on-site submission. **Importance: Conditional.**

**3.2.6.2 Stimulus / Response.**
| Stimulus | Response |
|----------|----------|
| Reader opens a post | System renders that post's Blogger comments |
| Post has no comments | System renders a "no comments" state |

**3.2.6.3 Functional Requirements.**

**FR-016: Display post comments.** The system shall retrieve and render the post's native Blogger comments read-only.
**Acceptance:** *Given* a post with comments in Blogger, *When* the post renders, *Then* those comments display. *Priority: Should | Audience: End User | Precondition: FR-007.*

**FR-017: No on-site comment submission.** The system shall not provide any interface to create, edit, or delete comments (BR-002, BR-008).
**Acceptance:** *Given* a rendered post, *When* the reader views the comment area, *Then* no comment-submission control is present. *Priority: Must | Audience: End User | Precondition: None.*

**§5.3.2 coverage:** validity — none (read-only); sequence — fetch comments → sanitize → render; abnormal — no-comments state; parameters — `ISR_REVALIDATE`; I/O — post id → comment list; errors — API failure → hide comment block gracefully.

---

#### 3.2.7 About Page — [Source: features.md > FEAT-007]

**3.2.7.1 Description / Priority.** Render an About page. **Importance: Conditional.**

**3.2.7.2 Stimulus / Response.**
| Stimulus | Response |
|----------|----------|
| Reader opens /about | System renders the About content |

**3.2.7.3 Functional Requirements.**

**FR-018: Render About content.** The system shall render the About page from Blogger `pages` content, sanitized before render.
**Acceptance:** *Given* an About page exists in Blogger, *When* /about is opened, *Then* its sanitized content renders. *Priority: Should | Audience: End User | Precondition: None.*

**§5.3.2 coverage:** validity — none; sequence — fetch page → sanitize → render; abnormal — 404 if page absent; parameters — `ISR_REVALIDATE`; I/O — page id → HTML; errors — absent page → 404.

---

#### 3.2.8 Contact (mailto) — [Source: features.md > FEAT-008]

**3.2.8.1 Description / Priority.** Provide a contact path via a `mailto:` link. **Importance: Conditional.**

**3.2.8.2 Stimulus / Response.**
| Stimulus | Response |
|----------|----------|
| Reader activates the contact link | The reader's mail client opens addressed to the owner |

**3.2.8.3 Functional Requirements.**

**FR-019: Provide mailto link.** The system shall present a `mailto:` link to the configured owner email.
**Acceptance:** *Given* the Contact page, *When* the reader activates the contact link, *Then* the local mail client opens addressed to the owner email. *Priority: Should | Audience: End User | Precondition: Owner email configured.*

**FR-020: No submission storage.** The system shall not collect or store any contact submission (BR-009).
**Acceptance:** *Given* the Contact page, *When* it is inspected, *Then* no form or server endpoint that stores input is present. *Priority: Must | Audience: Developer | Precondition: None.*

**§5.3.2 coverage:** validity — none (client-side link); sequence — render link; abnormal — none; parameters — owner email; I/O — none stored; errors — none.

---

> Sections 1.0–3.2 are grounded in `_context/` and cite IEEE 830 and ISO/IEC 25010/25051/25062. Twenty functional requirements (FR-001…FR-020) trace to FEAT-001…008.

---

### 3.2 Logic and Data Model

> Generated by `logic-modeling` from `_context/business_rules.md`, `_context/tech_stack.md`, and `_context/quality_standards.md`, per IEEE 1016 and ISO/IEC 25010 (Reliability; Analysability under Maintainability). This fulfils the logic-modeling mandate for Process Descriptions, Data Construct Specifications, and a Data Dictionary. Subsections are numbered **3.2.9–3.2.11** to avoid collision with the per-feature subsections 3.2.1–3.2.8 above.
>
> **Data-store dialect determination (logged):** `tech_stack.md` specifies **no relational database** — the system is a read-only consumer of the Google Blogger API v3 with no MySQL/PostgreSQL store. Therefore `DECIMAL(19,4)`/`NUMERIC(19,4)` currency types do **not** apply. Data constructs are typed DTOs (TypeScript over JSON) derived from Blogger API responses.
>
> **Numeric precision note:** the system performs **no monetary or derived financial calculations**, so the "round to 2 decimals, Round Half Up" rule is **Not Applicable**. The only arithmetic is integer index math (page offsets) and an integer time comparison (cache staleness), both exact.

#### 3.2.9 Process Descriptions (Logic / Transition Models)

**P-1 — Content freshness / ISR revalidation** *(BR-003, BR-007)*
- **Input:** an incoming page request and the cached render's timestamp.
- **Algorithm:**
  1. Compute cache age: $$stale = (t_{now} - t_{cached}) \ge ISR\_REVALIDATE$$ where $ISR\_REVALIDATE = 600\ \text{s}$.
  2. IF `stale` is false, THEN serve the cached page (fast path; supports ISO/IEC 25010 Performance Efficiency).
  3. ELSE serve the cached page **and** trigger a background refetch from Blogger; on success, replace the cache.
  4. IF the background refetch fails, THEN retain the last good cache (Reliability: no user-visible failure) and log the error (Analysability).
- **Affected entities:** `PostSummary[]`, `Post`, `Page`, ISR cache; actors: Reader, Blogger API.
- **Transition:** `FRESH → STALE → (revalidating) → FRESH`; a failed revalidation holds `STALE-served-from-cache`.

**P-2 — Post HTML sanitization** *(BR-005)*
- **Input:** raw post/page HTML body from Blogger.
- **Algorithm:**
  1. Parse the HTML against an allow-list of tags/attributes.
  2. IF a node is disallowed (e.g., `<script>`, inline event handlers), THEN remove it.
  3. ELSE retain the node.
  4. Return sanitized HTML for rendering (Reliability + Security).
- **Affected entities:** `Post.content`, `Page.content`; actor: Reader.
- **Transition:** `RAW → SANITIZED`; only `SANITIZED` content reaches the DOM.

**P-3 — Search query validation and encoding** *(FR-013)*
- **Input:** the reader's raw search string `q`.
- **Algorithm:**
  1. Trim `q`.
  2. IF `q` is empty after trim, THEN abort (no API call) and prompt for input.
  3. ELSE URL-encode `q` and call `posts.list?q=<encoded>` (input-validation per ISO/IEC 25062).
  4. IF the API returns zero posts, THEN render the no-results state.
- **Affected entities:** search request, `PostSummary[]`; actor: Reader.
- **Transition:** `IDLE → VALIDATING → (rejected | QUERYING) → RESULTS | EMPTY`.

**P-4 — Pagination token/offset resolution** *(FR-004…FR-006)*
- **Input:** requested page number `page` (or Blogger `pageToken`).
- **Algorithm:**
  1. Compute the zero-based offset for display: $$offset = (page - 1) \times POSTS\_PER\_PAGE,\quad POSTS\_PER\_PAGE = 10$$
  2. IF `page < 1` OR the resolved page exceeds the available range, THEN return an empty state or HTTP 404.
  3. ELSE fetch that page via the Blogger page token and render.
- **Affected entities:** `PostListPage` (`items`, `nextPageToken`); actor: Reader.
- **Transition:** `PAGE(n) → PAGE(n±1)`; out-of-range → `NOT_FOUND`.

**P-5 — Label filtering** *(FR-011, FR-012)*
- **Input:** a selected label string.
- **Algorithm:**
  1. URL-encode the label.
  2. Call `posts.list?labels=<encoded>`.
  3. IF the result set is empty, THEN render the empty state; ELSE render the filtered list.
- **Affected entities:** `Label`, `PostSummary[]`; actor: Reader.
- **Transition:** `ALL_POSTS → FILTERED(label) | EMPTY`.

**P-6 — Comment display (read-only)** *(BR-002, BR-008)*
- **Input:** a post identifier.
- **Algorithm:**
  1. Fetch the post's native Blogger comments.
  2. IF none exist, THEN render the "no comments" state.
  3. ELSE render comments read-only; no create/edit/delete path is exposed (Reliability + Security).
- **Affected entities:** `Comment[]`; actor: Reader (read-only), Content Owner (moderates in Blogger, out of system).
- **Transition:** `POST_VIEW → COMMENTS_LOADED | NO_COMMENTS`.

#### 3.2.10 Data Construct Specifications

These record types are DTOs projected from Blogger API v3 JSON; none are persisted by the system.

- **PostSummary** — a list-item projection of a post: identifier, title, excerpt, publish date, primary label, and URL path. Supports FEAT-001/002/004/005.
- **Post** — a full post: identifier, title, sanitized content, publish/updated dates, labels, URL path, and author display name. Supports FEAT-003.
- **Page** — a static page (e.g., About): identifier, title, sanitized content, URL path. Supports FEAT-007.
- **Comment** — a read-only comment on a post: identifier, author display name, published date, sanitized content. Supports FEAT-006.
- **Label** — a category tag: name and (optional) post count. Supports FEAT-004.
- **PostListPage** — a page of results: `items: PostSummary[]`, `nextPageToken`, `page`. Supports pagination and search.

Keeping these constructs as thin, typed projections keeps the logic layer analysable (ISO/IEC 25010 Maintainability) and the render path reliable.

#### 3.2.11 Data Dictionary

| Name | Representation | Units / Format | Range / Accuracy |
|------|----------------|----------------|------------------|
| post.id | string | Blogger post id | non-empty; unique per blog |
| post.title | string | UTF-8 text | 0–~300 chars (Blogger limit) |
| post.content | string (sanitized HTML) | HTML fragment | allow-list only (P-2) |
| post.excerpt | string | UTF-8 text | derived; ≤ configured excerpt length |
| post.published | string | ISO 8601 datetime (UTC) | valid RFC 3339 timestamp |
| post.updated | string | ISO 8601 datetime (UTC) | valid RFC 3339 timestamp |
| post.path | string | URL path/slug | URL-safe; unique per blog |
| post.labels | string[] | array of label names | 0..n entries |
| post.author | string | display name | 0–~100 chars |
| page.id | string | Blogger page id | non-empty; unique per blog |
| page.title | string | UTF-8 text | 0–~300 chars |
| page.content | string (sanitized HTML) | HTML fragment | allow-list only (P-2) |
| page.path | string | URL path | URL-safe |
| comment.id | string | Blogger comment id | non-empty |
| comment.author | string | display name | 0–~100 chars |
| comment.published | string | ISO 8601 datetime (UTC) | valid RFC 3339 |
| comment.content | string (sanitized HTML) | HTML fragment | allow-list only (P-2) |
| label.name | string | UTF-8 text | non-empty |
| label.count | integer | count of posts | ≥ 0 (exact) |
| postListPage.items | PostSummary[] | array | 0..`POSTS_PER_PAGE` entries |
| postListPage.nextPageToken | string \| null | opaque token | null at last page |
| postListPage.page | integer | 1-based page index | ≥ 1 (exact) |
| config.POSTS_PER_PAGE | integer | count | = 10 (exact) |
| config.ISR_REVALIDATE | integer | seconds | = 600 (exact) |

*Log:* processes modeled = **6** (P-1…P-6); data dictionary rows emitted = **24**; monetary types = 0 (N/A); dialect = none (no RDBMS).

---

> Sections 1.0–3.2 (incl. logic & data model) are grounded in `_context/` and cite IEEE 830, IEEE 1016, and ISO/IEC 25010/25051/25062.

---

### 3.3 Performance Requirements

> Generated by `attribute-mapping` from `_context/quality_standards.md` and `_context/tech_stack.md`, per IEEE 830 §5.3.3 and ISO/IEC 25023.

**NFR-001 — Page performance.** The system shall render the home and post pages fast enough to achieve a **Lighthouse Performance score ≥ 90** on a mid-tier mobile profile, corresponding to Core Web Vitals "good" thresholds (LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms). *Importance: Essential. [Source: quality_standards.md > Performance Efficiency]*

**NFR-002 — Cached-path latency.** The system shall serve an ISR-cached page without a synchronous Blogger API call under normal load. *Importance: Essential. [Source: business_rules.md > BR-007]*

**NFR-003 — Content freshness.** The system shall reflect a published or edited Blogger post on the site within **10 minutes** (ISR revalidation = 600 s). *Importance: Essential. [Source: business_rules.md > BR-003]*

**Quality Attribute Scenario — Performance (ISO/IEC 25023):**
| Element | Value |
|---------|-------|
| Source | A reader on a mobile device |
| Stimulus | Requests the home page or a post page |
| Environment | Production, normal load, page in ISR cache |
| Artifact | Next.js render served from Vercel edge |
| Response | Page is delivered and becomes interactive |
| Response Measure | Lighthouse Performance ≥ 90; LCP ≤ 2.5 s |

`[CONTEXT-GAP: peak concurrent-load figure not specified by stakeholder — Lighthouse/CWV thresholds used as the performance oracle]`

### 3.4 Design Constraints

> Per IEEE 830 §5.3.4. Mandatory implementation standards and environmental factors from `tech_stack.md`.

**NFR-004 — Language & framework.** The system shall be implemented in **TypeScript** on **Next.js (App Router)** running on the Vercel-provided Node.js runtime. *Importance: Essential.*
**NFR-005 — No relational data store.** The system shall not depend on any application database; Blogger is the system of record. *Importance: Essential. [Source: tech_stack.md]*
**NFR-006 — Secure credential handling.** The system shall access the Blogger API only from server-side code using credentials held in environment variables; secrets shall not be committed to source. *Importance: Essential. [Source: BR-004, BR-006]*
**NFR-007 — Transport security.** All inbound and outbound traffic shall use HTTPS with TLS 1.3. *Importance: Essential.*
**NFR-008 — Code quality toolchain.** The codebase shall pass ESLint and Prettier checks and TypeScript type-checking in CI. *Importance: Essential. [Source: tech_stack.md]*

**Environmental factors.**
- **API availability/quota:** system behavior depends on Blogger API availability and quota; mitigated by ISR caching (P-1).
- **Reader connectivity:** as a public internet site, end-to-end responsiveness depends on the reader's own network, which is outside system control.

### 3.5 Software System Attributes

> Per IEEE 830 §5.3.5, as ranked Quality Attribute Scenarios.

**3.5.1 Reliability.**
**NFR-009 — Graceful degradation.** On a Blogger API failure with a warm cache, the system shall continue serving the last good content rather than an error. *Importance: Essential.*
| Scenario | Source: Blogger API · Stimulus: request fails/times out · Environment: production, warm cache · Artifact: service layer · Response: serve cached page + log · Response Measure: 0 user-visible 5xx while cache is valid |

No hardware-MTBF requirement applies (stateless, cloud-hosted, no on-prem hardware).

**3.5.2 Availability.**
**NFR-010 — Best-effort availability.** The system shall rely on Vercel's default platform availability; no formal SLA/uptime percentage is committed for v1.0. *Importance: Conditional. [Source: quality_standards.md > Reliability]*

**3.5.3 Security.**
**NFR-011 — Output sanitization.** The system shall sanitize all Blogger-sourced HTML before rendering (XSS prevention). *Importance: Essential. [Source: BR-005]*
**NFR-012 — No stored user data.** The system shall not collect, process, or store end-user personal data; contact is a `mailto:` link. *Importance: Essential. [Source: BR-009]*
| Scenario | Source: malicious post content · Stimulus: post body contains `<script>` · Environment: production render · Artifact: sanitizer (P-2) · Response: node removed · Response Measure: script never executes in the DOM |

AES-256 at-rest encryption and RBAC are **Not Applicable**: the system stores no data and has no user accounts or privileged roles.

**3.5.4 Maintainability.**
**NFR-013 — Test coverage.** The system shall maintain automated unit/integration test coverage **≥ 80%**. *Importance: Essential. [Source: quality_standards.md > Maintainability]*
**NFR-014 — Modularity / analysability.** All Blogger access shall be isolated behind a single server-side service layer to keep the code analysable. *Importance: Essential.*

**3.5.5 Standards Compliance** *(IEEE 830 §5.3.5.1).*
**NFR-015 — SEO structured data.** The system shall emit per-post `<title>`/meta description, Open Graph tags, and JSON-LD `BlogPosting`, and shall publish `sitemap.xml` and `robots.txt`. *Importance: Essential. [Source: quality_standards.md > SEO]*
**NFR-016 — Accessibility.** The system shall conform to **WCAG 2.1 AA**. *Importance: Essential.*
**NFR-017 — Ready-to-use quality.** The delivered product shall be evaluated against **ISO/IEC 25051** (RUSP), including accompanying user and deployment documentation (Phase 3 deliverables). *Importance: Conditional.*

### 3.6 Other Requirements *(IEEE 830 §5.3.8)*

**NFR-018 — Portability / installation.** The system shall be deployable from source to Vercel via CI/CD, configured solely through environment variables (`BLOG_ID`, `BLOGGER_API_KEY`, `ISR_REVALIDATE`, owner contact email). *Importance: Essential.*
**NFR-019 — Localization.** The system shall present a single language for v1.0; internationalization (i18n) is out of scope. *Importance: Conditional. [Source: vision.md > Out of Scope]*

No additional requirements beyond those specified in Sections 3.1–3.6 have been identified.

---

> Sections 1.0–3.6 are grounded in `_context/` and cite IEEE 830, IEEE 1016, and ISO/IEC 25010/25023/25051/25062. Nineteen non-functional requirements (NFR-001…NFR-019) join the twenty functional requirements. Next and final skill in the Waterfall pipeline: **`semantic-auditing`** (SRS §4 — V&V audit + Requirements Traceability Matrix).
