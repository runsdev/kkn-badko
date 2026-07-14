# Business Rules — kkn-badko-blog

> Rules traceable to `PROJECT_PLAN.md`. Where policy is not stated, a `[CONTEXT-GAP]` flags a decision the stakeholder must make. Uses SHALL/MUST phrasing.

## Content & sourcing rules
- BR-001: All blog content SHALL originate from the Blogger account via the Blogger API v3 (single source of truth).
- BR-002: The system SHALL be **read-only** against Blogger; it SHALL NOT create or modify Blogger content (decided).
- BR-003: Published Blogger posts SHALL appear on the site within **10 minutes** (ISR 600 s revalidation) (decided).

## Security & access rules
- BR-004: Blogger API credentials MUST be used server-side only and MUST NOT be exposed to the client.
- BR-005: Post HTML retrieved from Blogger MUST be sanitized before rendering.
- BR-006: Secrets MUST be stored in environment variables / platform secret store, never committed to the repository.

## Performance & quota rules
- BR-007: API responses SHALL be cached and served via ISR to remain within Blogger API quota.

## Comments & contact rules
- BR-008: Comments SHALL be **native Blogger comments** displayed read-only on the site; all moderation SHALL occur in the Blogger UI (decided).
- BR-009: Contact SHALL be a **`mailto:` link** to the owner's email; the system SHALL NOT store contact submissions (decided).

## Governance rules
- BR-010: Scope SHALL be locked at milestone M1; subsequent changes SHALL be re-estimated (PROJECT_PLAN risk mitigation).
- BR-011: Each milestone (M1–M5) SHALL require the designated sign-off before the next phase proceeds.
