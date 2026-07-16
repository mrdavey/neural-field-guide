# PLAN_LOG.md

## Objective
Remove repetitive lesson instructions and duplicate content, and ensure every intended interactive lab is visibly present before its prediction/reflection section.

## Plan 1
1. [x] T001: remove meta-copy and duplicate post-objective narrative while preserving exact objective teaching and checks - Done when shared guide rendering has one non-redundant objective teaching sequence.
2. [x] T001: replace procedural activity and scroll-story panels with concise question/scope framing - Done when labels and before-moving instructions are absent from visible shared UI.

### Clarifications
- Constraints: Preserve lesson IDs, objective coverage records, deterministic assessments, execution labels, evidence boundaries, and existing visual language.
- Checks/Tests: node --test tests/content-ux.test.mjs tests/interactive-learning.test.mjs tests/objective-coverage.test.mjs && npm run lint

### Verification

- Step 1: pass - cmd: node --test tests/content-ux.test.mjs tests/interactive-learning.test.mjs tests/objective-coverage.test.mjs; result: 23 passed, 0 failed; proof: app/lesson-guide-view.tsx and tests/content-ux.test.mjs
- Step 2: pass - cmd: npm run lint; result: pass; proof: app/activity-info.tsx, app/scroll-story.tsx, and app/learning-activities.css
### Gaps -> Plan 2

## Plan 2
1. [x] T002: render the LLM and World Model lab instruments before concise reflection prompts - Done when controls and readouts are never children hidden by PredictionGate.
2. [x] T002: render the shared Research Course lab cases before concise reflection prompts - Done when Generative, RL, and Embodied lessons expose controls immediately.
3. [x] T002: add executable 182-lesson lab coverage and order regressions plus update the interaction audit - Done when every released lesson has a supported visible lab contract.
4. [ ] T002: run focused interaction checks, independent review, lint, and the full required suite - Done when no gaps or regressions remain.

### Verification

- Step 4: fail - cmd: npm test; result: build, 182-route static export, and artifact checks passed, but verify:grades found the LLM learner-facing source fingerprint stale; proof: docs/course-page-grades/llm.json
### Gaps -> Plan 3
- Regenerate course page grade reports from the changed learner-facing source bundle and rerun the full required suite.

## Plan 3
1. [ ] Regenerate course page grade reports - Done when npm run generate:grades updates only derived review metadata for the changed source bundle.
2. [ ] Rerun focused checks and npm test - Done when lint, static export, artifact verification, grade verification, and every regression pass.

### Verification

- Step 1: fail - cmd: npm run generate:grades; result: the generator correctly rejected stale independently reviewed grade records; proof: docs/course-page-grades/*.json

### Gaps -> Plan 4
- Correct explanation-specific response copy without resetting the visible instrument.
- Make every server-visible lab number locale-deterministic.
- Remove objectives repeated in non-LLM orientation and prerequisite bridge surfaces.
- Obtain a clean independent semantic regrade before regenerating the derived grade report.

## Plan 4
1. [x] Fix the three independent-review gaps - Done when lab reflection state/copy, SSR formatting, and single-placement objectives have executable regressions.
2. [x] Obtain an independent semantic pass - Done when the reviewer reports no unresolved content or interaction gap and explicitly reassesses the page-score impact.
3. [x] Refresh reviewed grade records and derived report - Done when current fingerprints are paired with the independent regrade and npm run generate:grades passes.
4. [ ] Run focused checks, lint, and npm test - Done when every required verification passes.

### Verification

- Step 2: pass - independent semantic re-review; result: no unresolved gaps and no score changes across 187 pages; proof: five refreshed course grade records
- Step 3: pass - cmd: npm run generate:grades; result: 187 reviewed page rows regenerated with current fingerprints; proof: docs/COURSE_PAGE_GRADES.md
- Step 4: fail - cmd: npm test; result: build, static export, artifact verification, grade verification, and 157 tests passed; three tests still asserted removed per-step reveal, duplicate objective cue, or a fixed grading date; proof: tests/anime-motion.test.mjs, tests/curriculum-progression.test.mjs, tests/course-page-grades.test.mjs

### Gaps -> Plan 5
- Align the three stale regression assertions with the reviewed single-reveal, single-objective, date-agnostic contracts and rerun the required suite.

## Plan 5
1. [x] Update stale regression assertions - Done when focused motion, progression, and grade-record tests assert the reviewed behavior.
2. [x] Rerun lint and npm test - Done when the complete required suite passes.

### Verification

- Step 2: pass - cmds: npm run lint; npm test; result: lint passed, static export verified 182 canonical lesson routes plus 44 legacy forwards, artifacts and 187 grade rows verified, and 160/160 regressions passed.

### Gaps -> Plan 6
