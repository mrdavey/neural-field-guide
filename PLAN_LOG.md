# PLAN_LOG.md

## Objective
Turn all five course homes into concise, attractive marketing pages that motivate learners to start and finish.

## Plan 1
1. [x] T001: replace instructional home orientation with course-specific motivation and concise payoff content - Done when all five homes explain why the subject matters without readiness or prerequisite coaching.
2. [x] T001: reshape the home journey, supporting proof, and CTA into an attractive landing-page flow - Done when the shared renderer and CSS preserve honest provenance with marketing-first hierarchy.
3. [x] T001: add regressions and verify every course home at desktop and narrow widths - Done when focused checks, browser QA, lint, and the full suite pass.

### Clarifications
- Constraints: Preserve routes, lesson IDs, course registries, static hosting, accessibility, progress behavior, honest evidence boundaries, and the established editorial visual language.
- Checks/Tests: node --test tests/content-ux.test.mjs tests/curriculum-progression.test.mjs tests/course-page-grades.test.mjs && npm run lint && npm test

### Verification
- Focused home, curriculum, grade, and rendered-HTML regressions pass (33/33).
- Browser QA passes on all five canonical homes at desktop and 390×844: three payoffs, two CTAs, no forbidden readiness copy, no overflow, and no console errors.
- Independent home-page semantic review passes after repairing the World Models six-phase/six-label arc; final home scores are 98, 98, 99, 99, and 98.
- `npm run lint` passes.
- `npm test` passes: static export builds 234 pages, all artifact/grade verifiers pass, and all 161 tests pass.
- Final plan audit found no missing or incorrectly implemented item.

### Gaps -> Plan 2
- None. The independent review's only gap was fixed and covered by a phase-to-story-label regression.
