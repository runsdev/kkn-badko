# Software Features — kkn-badko-blog

> Grounded in `PROJECT_PLAN.md` Phase 2 (Website Building). Effort values are the per-task hour estimates from the plan. Add detail where `[CONTEXT-GAP]` is noted before SRS feature decomposition.

## Feature Details Table

| Feature ID | Feature Name | Priority | User Story | Functional Requirements | Non-Functional Requirements | Acceptance Criteria | IEEE 830 Reference | Dependencies | Risks & Mitigations | Estimated Effort |
|------------|--------------|----------|------------|--------------------------|-----------------------------|---------------------|--------------------|--------------|---------------------|------------------|
| FEAT-001 | Home / Post List | High | As a reader, I want a list of recent posts so I can browse the blog. | - Fetch posts via Blogger `posts.list`<br>- Show title, excerpt, date, label | - Server-side fetch; key not exposed<br>- ISR revalidation | - Posts render from live API<br>- Newest first | 4.3.2; 4.3.5 | Blogger API client (2.1.3) | Quota → cache+ISR | 8 h |
| FEAT-002 | Pagination | High | As a reader, I want to page through posts. | - Page/next-token navigation over `posts.list` | - No full reload jank | - Navigates pages correctly | 4.3.2 | FEAT-001 | API paging tokens | 6 h |
| FEAT-003 | Single Post Page | High | As a reader, I want a full post page. | - Fetch via `posts.get`/`getByPath`<br>- Render HTML body safely | - SEO meta per post | - Correct post renders by slug/path | 4.3.2 | Blogger API client | XSS in body → sanitize | 8 h |
| FEAT-004 | Labels / Categories | High | As a reader, I want to filter posts by label. | - List labels; filter via `posts.list?labels=` | - Cached label lists | - Label pages show matching posts | 4.3.2 | FEAT-001 | — | 8 h |
| FEAT-005 | Search | High | As a reader, I want to search posts. | - Query via `posts.list?q=` | - Reasonable latency | - Relevant results returned | 4.3.2 | Blogger API client | API search limits | 8 h |
| FEAT-006 | Comments (native Blogger) | Medium | As a reader, I want to read comments on a post. | - Display native Blogger comments via API for a post | - Server-side fetch; cached | - Comments display on posts; moderation handled in Blogger | 4.3.2 | FEAT-003 | Moderation done in Blogger UI (no custom moderation) | 8 h |
| FEAT-007 | About Page | Medium | As a reader, I want an About page. | - Static/`pages.list` content | - SEO meta | - Page renders | 4.3.2 | — | — | 6 h |
| FEAT-008 | Contact (mailto) | Medium | As a reader, I want to contact the owner. | - `mailto:` link to owner email (no form, no backend) | - No stored user data; no spam surface | - Clicking opens the reader's mail client | 4.3.2 | — | Email address exposure → optional obfuscation | 8 h |

**Total features effort:** 60 h (matches PROJECT_PLAN Phase 2.2).

## Stimulus-Response Mapping (high-priority example — FEAT-001)

| Stimulus | Expected Response | Test Method | Pass/Fail Criteria |
|----------|-------------------|-------------|--------------------|
| Reader opens home page | List of recent posts renders | UI/integration test | Posts from API display; newest first |
| Reader clicks "next page" | Next page of posts loads | UI test | Correct page shown; no key leak in network |

## Assumptions & Constraints
- Content is authored in Blogger; the site is read-mostly against the Blogger API.
- Blogger API key/OAuth is used **server-side only** (never exposed to the browser).
- Rendering strategy is ISR with a **10-minute (600 s) revalidation interval** (decided).
- The site is **read-only** against Blogger — authoring stays in Blogger's own UI (decided).

## Glossary
See `_context/glossary.md`.

## Approval Workflow
| Role | Sign-Off Required | Date |
|------|-------------------|------|
| Project Owner | Initial feature list | |
| Developer | Functional/non-functional feasibility | |
| Reviewer/QA | Acceptance criteria review | |
