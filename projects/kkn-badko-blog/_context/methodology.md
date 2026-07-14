---
methodology: waterfall
domain: web-content-publishing
---
# Methodology

**Selected methodology:** Waterfall (IEEE 830 / IEEE 29148 SRS pipeline)

Selected by stakeholder instruction. The project has a fixed, well-understood
scope (a fullstack blog reading content from the Blogger API) and a phase-gated
plan with up-front requirement gathering, so a sequential waterfall track with
formal review gates is appropriate.

## Royce's 5 Critical Steps — planning status
| Step | Requirement | Status |
|------|-------------|--------|
| 1. Design First | Preliminary design before analysis | Planned — see `tech_stack.md` (constraints) |
| 2. Document Everything | Documentation IS the design | This pipeline produces the 6 canonical docs |
| 3. Do It Twice | Pilot/prototype before delivered version | `[CONTEXT-GAP: pilot/prototype plan not stated in PROJECT_PLAN.md]` |
| 4. Plan Testing Early | Test planning begins at design | Phase 2.4 includes test suite; test strategy to start in design phase |
| 5. Involve the Customer | PSR / CSR / FSAR review gates | Maps to plan milestones M1, M3/M4, M5 |

## Documentation roadmap (Waterfall track)
| Phase | Skill | Output | Maps to PROJECT_PLAN |
|-------|-------|--------|----------------------|
| 1 | `initialize-srs` | `_context/` scaffold (this step) | Phase 1.1–1.2 |
| 2 | `context-engineering` | SRS Section 1 (Introduction) | Phase 1.2 |
| 3 | `descriptive-modeling` | SRS Section 2 (Overall Description) | Phase 1.2 |
| 4 | `interface-specification` | SRS Section 3.1 (External Interfaces) | Phase 1.3 |
| 5 | `feature-decomposition` | SRS Section 3.2 (System Features) | Phase 1.2 |
| 6 | `logic-modeling` | Business rules, algorithms | Phase 1.2 |
| 7 | `attribute-mapping` | SRS Section 3.3–3.5 (NFRs) | Phase 1.2 |
| 8 | `semantic-auditing` | V&V audit + Requirements Traceability Matrix | Phase 1.4 |
