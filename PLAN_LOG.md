# PLAN_LOG.md

## Objective
Audit and repair continuity across World Models, Generative Models, RL & Control, and Embodied AI

## Plan 1
1. [x] T001 enumerate all 138 home and adjacent-lesson transitions from canonical reader dossiers - Done when population and course counts are exact
2. [x] T001 semantically classify prerequisite activation, motivation, next-use, and new-term leakage at every seam - Done when every seam has evidence and severity
3. [x] T001 add a durable audit record and exhaustive regression contract - Done when the audit is reproducible and focused checks pass

### Clarifications
- Constraints: Use the isolated worktree; preserve all lesson IDs, order, routes, persistence keys, and unrelated work
- Checks/Tests: focused reader-snapshot, manifest, documentation, and continuity checks

### Verification

- Step 1: pass - Canonical snapshot enumeration returned 46 World Models, 30 Generative, 32 RL, and 30 Embodied handoffs (138 total); tests/cross-course-continuity.test.mjs asserts the exact population.
- Step 2: pass - Complete semantic audit accounted for 90 pass, 48 partial, and 0 fail; all 31 home/track/branch boundaries were independently classified, with World advanced lessons treated as parallel branches.
- Step 3: pass - docs/CURRICULUM_ARCHITECTURE.md records evidence and scoped repairs for every partial seam; focused continuity, snapshot, architecture, and documentation tests passed (22/22), and git diff --check passed.
### Gaps -> Plan 2

## Plan 2
1. [x] T002 build explicit, destination-specific continuity bridges for all 48 findings without changing lesson objectives or order - Done when each repaired page names the prior artifact, need, and new mechanism
2. [x] T002 correct misleading direct-reuse/new-thread labels and World Models advanced branch/capstone structure - Done when relationships match the actual conceptual dependency
3. [x] T002 add semantic regression assertions for the repaired learner-facing copy and relationship taxonomy - Done when focused continuity, reader, objective, course, and documentation checks pass

### Verification

- Step 1: pass - All 48 audited destinations now render an authored bridge naming the prior artifact, the reason the new topic is needed, and its added mechanism; tests reject generic fallback copy and require a substantial causal bridge.
- Step 2: pass - The shared four-way relationship classifier passes all 31 section/branch boundaries. World Models exposes five peer branches from operations and a separate required synthesis after one branch; desktop and 390px browser QA found no overflow or console errors.
- Step 3: pass - Focused continuity, reader, curriculum, objective, World Models, documentation, and legacy LLM tests passed 44/44; npm run lint and git diff --check passed.
### Gaps -> Plan 3

## Plan 3
1. [x] T003 independently grade all 48 repaired destinations and account for all 138 handoffs from blind current reader dossiers - Done when no material seam is partial or failed
2. [x] T003 remediate every independent grading gap and repeat review - Done when the grader returns zero unresolved findings
3. [x] T003 refresh affected whole-page hashes, course fingerprints, and dated review evidence - Done when grade verification matches current learner-facing source
4. [x] T003 run lint, the complete npm test suite, and final worktree/commit checks - Done when all repository contracts pass and only in-scope files are committed

### Verification

- Step 1: pass - A blind independent grader reconstructed all 138 canonical handoffs from current reader dossiers. Its first current-state pass returned 135 pass, 3 partial, and 0 fail and found no internally contradictory affected destination page.
- Step 2: pass - The three residual Generative Models seams received explicit artifact-to-mechanism bridges. A fresh blind regrade returned 3/3 pass, closing the complete population at 138 pass, 0 partial, and 0 fail.
- Step 3: pass - Current reader hashes and source fingerprints were refreshed for all affected records; the LLM dossiers remained byte-for-byte unchanged. `npm run verify:grades` and 42 focused continuity, reader, objective, architecture, and documentation tests passed.
- Step 4: pass - `npm run lint`, the complete `npm test` workflow, and `git diff --check` passed. The static export verified 182 canonical routes plus 44 legacy forwards, all artifacts and visuals verified, and all 219 tests passed.

### Gaps -> Plan 4

None.

## Objective — Visual refinement

Implement the approved Neural Field Guide visual-refinement plan across all course homes and lessons: self-hosted editorial typography, distinct course identities, more open lesson rhythm, an accessible Orient–Learn–Try–Test–Extend rail, consistent semantic content forms, restrained motion, and improved mobile pacing, while leaving the illustration atlas and all lesson meaning unchanged.

## Plan 1
1. [x] Install and wire self-hosted Fraunces and Source Sans 3 variable fonts, introduce shared typography/spacing/surface tokens, and remove literal Georgia usage from active styles - Done when fonts bundle locally with no external requests and all shared headings/body/mono roles use named tokens.
2. [x] Add a typed course theme contract and wire distinct palette/motif variables into the app shell, home hero, page furniture, and restrained CSS-only tactile details while preserving track accents - Done when all five courses are visually distinct beyond text and contrast tests cover every theme.
3. [x] Refine the shared lesson renderers into open narrative, anchor, and metadata surface tiers and apply consistent definition/mechanism/worked-case/boundary/evidence/check styling without changing instructional records - Done when all 182 lessons inherit the editorial rhythm and meaning never relies on color alone.
4. [x] Implement and integrate an accessible Orient → Learn → Try → Test → Extend phase rail with stable phase targets, scroll tracking, keyboard/touch anchors, reduced-motion behavior, and compact mobile presentation - Done when every lesson exposes the five ordered stages and the active stage updates without persistence or routing regressions.
5. [x] Consolidate shared motion so prose is immediately legible, limit motion to meaningful landmarks/state feedback, update the interaction audit, and tune mobile type/spacing/sticky offsets/overflow - Done when normal and reduced-motion behavior pass focused checks at desktop and narrow widths.
6. [x] Add and update focused regression contracts for typography, themes, semantic surfaces, phase navigation, motion, contrast, static rendering, and course-grade fingerprint coverage - Done when focused tests, lint, diff hygiene, and the full repository suite pass without weakening existing contracts.
7. [x] Run browser QA on all five homes plus representative opening, interaction-heavy, and capstone lessons at desktop/narrow/reduced-motion states; refresh required independent page-grade evidence, verify both Pages URL shapes, back-verify all steps/objective, perform the completion re-check, and commit only this worktree implementation - Done when no gaps remain and the scoped commit succeeds.

### Clarifications
- Constraints: Do not modify generated lesson illustrations, visual prompts, the visual manifest, public lesson-visual assets, lesson IDs/order/routes/storage, objective records, assessment answers, or other agents’ original-worktree changes. Keep GitHub Pages compatibility and existing accessibility/evidence boundaries.
- Checks/Tests: Focused node tests; npm run lint; npm test; root and /llms-from-scratch Pages builds/verifiers; desktop/narrow/reduced-motion browser QA; fresh blind course-page grade records because shared fingerprinted sources change; git diff --check.

- Focused verification: 13/13 visual-system and contrast tests plus scoped ESLint passed. Steps 1, 4, and 5 remain open until production-build and browser evidence; no code-level repair was required.
- Back Verification: Pass: shared visual system, typography, themes, editorial surfaces, phase rail, restrained motion, mobile pacing, tests, browser QA, and hosting compatibility remain complete with no atlas changes.
- Objective Verification: Pass: original visual-refinement objective is fully implemented across five homes and 182 lessons; typography, identities, editorial rhythm, phase rail, semantic forms, restrained motion, mobile pacing, accessibility, browser QA, tests, grades, and Pages compatibility pass; illustration atlas remains untouched.
- Completion Re-check: Post-compaction review of original objective/steps: yes; notes: all functional steps, repairs, browser QA, grades, full suite, both Pages shapes, scope exclusions, and back/objective verification pass; scoped isolated-worktree commit is the final handoff action.
### Verification

- Step 2: pass - All five desktop and 390px course homes rendered unique computed accents and motifs with zero horizontal overflow; palette contrast contracts passed.
- Step 3: pass - Shared lesson browser QA showed open prose rhythm, 279px two-column vocabulary cards, semantic labels, and one-column mobile reflow without content changes.
- Step 1: pass - Pinned local variable-font packages compiled successfully in the root production static build; layout imports no remote font resources.
- Step 4: pass - Browser activation and scroll tracking landed Learn, Try, Test, and Extend at 132-156px offsets with correct aria-current state; all five rail stages fit at 390px.
- Step 5: pass - Normal desktop/narrow QA showed zero overflow and no console warnings; source contracts and interaction audit verify prose remains visible and reduced motion removes progressive effects.
- Step 6: pass - cmd: focused visual/content contracts, npm run lint, npm test, git diff --check; result: editorial, contrast, course semantic, artifact, static rendering, and grade fingerprint contracts pass; full suite 221/221; proof: tests/editorial-visual-system.test.mjs and updated course tests
- Step 7: pass - cmd: desktop/narrow browser QA; five fresh blind course regrades; npm run lint; npm test; root and subpath Pages verifiers; reverse/objective/completion rechecks; commit_guard scoped commit is immediate; result: all QA/tests/grades/pages/scope checks pass and the isolated branch is ready for the guarded commit; proof: PLAN_LOG.md and verified diff
### Gaps -> Plan 2
- npm test reached and passed the root static build, Pages verifier, and preserved-artifact checks, then correctly rejected all five stale course-grade source fingerprints; fresh independent blind grading evidence is required before the suite can complete.

### Gaps -> Plan 3
- Desktop vocabulary support cards inherit a four-column grid and shrink to roughly 119px, creating excessive wrapping.
- The rail hash changes on activation but native fragment scrolling is unreliable after client layout; an explicit reduced-motion-aware scroll alignment is needed.
- At 390px the rail unnecessarily hides most of Extend, and several compact lesson controls expose sub-44px touch widths or heights.
## Plan 2
1. [x] Obtain fresh blind independent course-page judgments for all five current reader dossiers and write only grader-produced canonical records.
2. [x] Regenerate the aggregate course-page report, rerun npm test, verify both Pages base-path shapes, and record the final completion evidence.

### Clarifications
- Back Verification: Pass: fresh canonical records total 187/187, aggregate and grade suite pass, and both Pages base-path shapes verify.
### Verification

- Step 1: pass - cmd: five independent blind whole-page grading tasks plus fresh regrades after every semantic repair; result: LLM 45/45, World Models 47/47, Generative 31/31, RL 33/33, Embodied 31/31, total 187/187 with zero blockers and current fingerprints; proof: docs/course-page-grades/*.json
- Step 2: pass - cmd: npm run generate:grades; npm run verify:grades; npm run lint; npm test; subpath build:pages/verify:pages; result: 187 grade rows verified, lint passed, root static export and 221/221 tests passed, /llms-from-scratch export verified 182 routes plus 44 forwards; proof: docs/COURSE_PAGE_GRADES.md and command logs
### Gaps -> Plan 3

### Gaps -> Plan 4
- Fresh blind Generative grading failed reproducible-gpu-experiments because the smoke narrative says no checkpoint is created while its runnable manifest declares checkpoint.pt.
## Plan 3
1. [x] Reflow support vocabulary to two readable desktop columns and one narrow column; compact the mobile phase rail so all five stages are visible at 390px.
2. [x] Make phase anchors perform reliable post-layout scrolling while preserving hash semantics, keyboard/touch activation, scroll tracking, and reduced motion.
3. [x] Raise compact lesson summaries, buttons, and range inputs to 44px touch targets, extend focused contracts, and repeat desktop/narrow browser checks.

### Clarifications
- Back Verification: Pass: browser repair evidence is preserved and editorial/contrast/full regression contracts pass after all later changes.
### Verification

- Step 1: pass - Webpack browser preview measured two 279px vocabulary columns at desktop, one column at narrow width, and a 360px five-stage mobile rail.
- Step 2: pass - Clicking phase anchors updated the hash, used explicit reduced-motion-aware scrolling, landed at stable offsets, and updated aria-current through Test and Extend.
- Step 3: pass - 390x844 attention and capstone checks found no document overflow, no sub-44px inspected lesson controls, and no browser warnings; focused tests and scoped ESLint pass.
### Gaps -> Plan 4

## Plan 4
1. [x] Trace the smoke profile through learner narrative, manifest fixture, runner behavior, and tests; make the declared artifacts match actual smoke output.
2. [x] Add or tighten a focused invariant that rejects profile artifact declarations which disagree with emitted files, then run Generative and artifact checks.
3. [x] Generate a new dossier and obtain a fresh blind independent Generative regrade after the repair.

### Clarifications
- Back Verification: Pass: smoke manifest declares only emitted JSON and focused/full contracts plus 31/31 blind pages pass.
### Verification

- Step 1: pass - cmd: source trace and focused diff review; result: manifest fixture now declares only run.json, matching sole runner write and explicit checkpoint_created false; proof: app/generative/sections/research.ts and external-executions/generative_diffusion_ablation.py
- Step 2: pass - cmd: npx eslint app/generative/sections/research.ts tests/generative-course.test.mjs; result: scoped ESLint passed; proof: repaired smoke manifest and contract test
- Step 3: pass - cmd: fresh blind Generative 31-page regrade and independent schema/hash/fingerprint/arithmetic validation; result: 31 pass, 0 fail, no blockers, min overall 96.25; proof: docs/course-page-grades/generative.json
### Gaps -> Plan 5
- Fresh blind World Models grading found five advanced specialization pages reuse the unrelated operations release-bundle prerequisite, so their branch openings activate the wrong prior knowledge.

## Plan 5
1. [x] Map each advanced World Models specialization to the earlier mechanism it actually reuses, preserve the optional-branch framing and operations prerequisite for the final capstone, and replace the five false operations prerequisites - Done when every specialization opening reactivates relevant prior knowledge without changing lesson IDs/order/objectives.
2. [x] Replace the blanket branch prerequisite test with an exact specialization map and run focused World Models curriculum/narrative checks plus fresh dossier inspection - Done when tests reject the false shared prerequisite and all five reader dossiers show coherent prerequisite context and unchanged next-use language.
3. [x] Obtain a fresh blind independent World Models regrade after the repair - Done when a new grader reads all 47 current dossiers without prior scores and writes the canonical record.

### Clarifications
- Back Verification: Pass: exact advanced prerequisite map remains valid; optional branches and operations capstone handoff are preserved; 47/47 pages pass.
### Verification

- Step 1: pass - cmd: exact prerequisite map review; result: five specializations now reactivate mechanism-relevant earlier lessons and final capstone alone retains operations core; proof: app/world-models/sections/advanced.ts
- Step 2: pass - cmd: node --test tests/world-model-curriculum.test.mjs tests/world-model-narrative.test.mjs plus scoped ESLint and five current reader dossiers; result: 13 passed, 0 failed; each opening names relevant prior idea and preserves optional-branch next use; proof: tests/world-model-curriculum.test.mjs
- Step 3: pass - cmd: fresh blind World Models 47-page regrade plus strict validation and canonical timestamp correction; result: 47 pass, 0 fail, no blockers, coherent specialization prerequisites; proof: docs/course-page-grades/worldmodel.json
### Gaps -> Plan 6
- Fresh blind RL grading found four content-contract defects: tabular capstone environment identity conflicts (three versus five states), every-visit Monte Carlo is included in an overbroad unbiasedness claim, SARSA/Q targets omit terminal masks in the value capstone, and replay stores ending flags without applying them to targets.

## Plan 6
1. [x] Trace the tabular-control capstone through lesson, project, starter, exemplar, and artifacts and align every provenance statement to the actually executed finite environment - Done when one state-space identity is used consistently without weakening its evidence boundary.
2. [x] Correct Monte Carlo estimator claims and all value/replay target equations, examples, code, checks, and truncation language so first-visit versus every-visit bias and terminated versus truncated bootstrapping are explicit - Done when no control or DQN target bootstraps after termination and every-visit is not labeled finite-sample unbiased.
3. [x] Add exact RL regression contracts, run focused RL/artifact checks, inspect fresh reader dossiers, and obtain a new blind independent 33-page RL regrade - Done when contracts pass and a new grader writes a fresh canonical record without prior scores.

### Clarifications
- Back Verification: Pass: RL estimator, ending, replay, and environment-identity repairs pass executable/artifact contracts and 33/33 blind pages.
### Verification

- Step 1: pass - cmd: project/starter/static artifact trace and executable starter tests; result: tabular capstone consistently declares five-state-chain-v1 with states 5, start 2, terminals 0/4; proof: app/rl/capstones.ts, public/capstone-artifacts/rl/rl_capstone_starter.py, public/capstone-artifacts/rl/tabular-control-capstone.json
- Step 2: pass - cmd: official Sutton-Barto primary text check plus source/dossier review; result: first-visit unbiasedness and every-visit consistency/bias distinction match primary text, and value/replay targets apply true-termination masks while continuing-task truncations bootstrap; proof: app/rl/sections/value.ts and app/rl/sections/deep-value.ts
- Step 3: pass - cmd: 14 focused tests plus artifact/lint checks and fresh blind 33-page RL regrade; result: 33 pass, 0 fail, no blockers, current fingerprint and whole-second timestamp validated; proof: tests/rl-course.test.mjs and docs/course-page-grades/rl.json
### Gaps -> Plan 7
- Fresh blind Embodied grading found embodied-task-contracts too brief and repetitively card-assembled for the narrative floor, and calibration-transforms asks learners to infer invalidity from a doubled residual without the baseline value or release threshold.

## Plan 7
1. [x] Extend the embodied-task-contracts opening/debrief as one connected mug-placement chapter and reduce repeated three-step phrasing without changing its objective or local checks - Done when the mechanism, failure, verification, and handoff read as a sustained narrative rather than duplicated cards.
2. [x] Make the calibration transfer case deterministic by supplying baseline residual, doubled residual, and a predeclared gate, then align the correct option, feedback, worked reasoning, and retry - Done when the keyed conclusion follows numerically and no assessment answer index changes.
3. [x] Add focused Embodied contracts, run course/artifact checks, inspect fresh dossiers, and obtain a new blind independent 31-page Embodied regrade - Done when contracts pass and a new grader writes the fresh canonical record without prior scores.

### Clarifications
- Back Verification: Pass: Embodied repairs remain coherent after aggregate/full-suite verification; 31/31 pages pass with zero blockers.
### Verification

- Step 1: pass - cmd: source and fresh dossier review; result: opening sustains mug case from fresh evidence through bounded approach, grasp confirmation, retry/stop, and second-attempt debrief without repeating the same failed-grasp card; proof: app/embodied/sections/foundations.ts
- Step 2: pass - cmd: current reader transfer dossier; result: .004 m baseline, .008 m post-bump, and .006 m gate yield explicit .002 m failure margin with aligned feedback/worked/retry and unchanged correct option 0; proof: app/embodied/sections/perception.ts
- Step 3: pass - cmd: 10 focused Embodied tests, scoped lint/diff hygiene, fresh dossiers, and independent 31-page blind regrade; result: 31 pass, 0 fail, no blockers, 7/7 grade tests; proof: tests/embodied-course.test.mjs and docs/course-page-grades/embodied.json
### Gaps -> Plan 8
