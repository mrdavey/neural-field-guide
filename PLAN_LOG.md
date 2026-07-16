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

---

## Objective
Find and fix every interactive foreground/background colour conflict across the app

## Plan 1
1. [x] Audit default, active, disabled, placeholder, success, error, and hover control states across every shared interactive system
2. [x] Replace opacity-based disabled treatments and ambiguous placeholder colours with explicit readable state colours
3. [x] Expand contrast regression coverage to every released track palette and the repaired interactive states
4. [x] Verify representative lessons in all five courses at desktop and narrow widths, then run lint and the full test suite

### Clarifications
- Constraints: Preserve the editorial visual language, interaction semantics, reduced-motion behavior, and all existing course data
- Checks/Tests: node --test tests/color-contrast.test.mjs; npm run lint; npm test; browser contrast audit at desktop and narrow widths

### Verification

- Step 4: pass - All five courses browser-audited; npm run lint passed; initial npm test passed 163/163 before Plan 2 cleanup
### Gaps -> Plan 2
- Second discovery pass found nine source rules that still dim disabled or muted text controls and rely on a later override; remove that cascade dependency and prohibit it in tests

## Plan 2
1. [x] Delete opacity dimming from every disabled text-control rule and give muted quiz options an explicit readable palette
2. [x] Add a regression that rejects opacity-dimmed disabled or muted text controls
3. [x] Repeat focused, browser, lint, full-suite, and final discovery checks

### Clarifications
- Completion Re-check: Reopened PLAN_LOG.md after the final suite; every Plan 1 and Plan 2 step is complete, the final exact-question discovery pass found zero additional issues, and no unresolved gap remains.
### Verification

- Step 3: pass - Final browser audits passed at desktop and narrow widths; npm run lint passed; npm test passed with 163/163 tests and verified fingerprints
### Gaps -> Plan 3
