# PLAN_LOG.md

## Objective
Rewrite all five course introductions so they spark interest, teach only prerequisite-safe ideas, and prepare learners for the course.

## Plan 1
1. [x] Audit the first lesson in all five courses and map every untaught dependency - Later-taught notation and mechanisms are deferred to their owning lessons.
2. [x] Rewrite the five first lessons and every joined teaching surface - Objectives, explanations, examples, labs, checks, code, motion, and next-use statements agree.
3. [x] Add focused regressions and review documentation - Introduction-specific tests and current independent review evidence are in place.

### Clarifications
- Constraints: Preserve lesson IDs, routes, persistence keys, lesson counts, static hosting, evidence honesty, and the complete lesson teaching contract.
- Checks/Tests: node --test tests/objective-coverage.test.mjs and focused course tests; independent semantic grading; npm run lint; npm test; browser QA

### Verification

- Focused introduction, objective-coverage, interaction, motion, and curriculum suites pass.
- Independent semantic regrade: 11/11 exact objectives pass all five dimensions; 5/5 whole introductions pass.
- Browser QA: all five introductions inspected; representative interaction state verified; 390px and 1440px layouts pass.
- `npm run lint` passes.
- `npm test` passes: static export, artifacts, page-grade provenance, and all 166 regression tests.

### Gaps -> Plan 2

- No implementation gaps remain. Commit the complete scoped change.
