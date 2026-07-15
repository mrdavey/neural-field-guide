# PLAN_LOG.md

## Objective
Implement a future-proof multi-course Neural Field Guide with canonical /llm and /worldmodel routes, an accessible course selector, isolated migrated progress, and a complete self-contained World Models syllabus consistent with the LLM teaching contract

## Plan 1
1. [x] Refactor the current single-course data and registries behind a course-aware contract while preserving all 44 LLM lesson IDs/content - Done when the LLM registries resolve unchanged through course-scoped accessors
2. [x] Replace flat lesson routing with canonical /llm and /worldmodel course and lesson routes, root/legacy forwarding, metadata, history, and base-path-safe navigation - Done when static params cover every canonical route and old LLM lesson links visibly forward
3. [x] Add an accessible course selector and course-isolated progress/capstone persistence with v1 LLM migration - Done when switching courses retains separate search, progress, quiz, and draft state
4. [x] Author the complete cumulative World Models curriculum, guides, exact objective coverage, quizzes, sources, labs/teaching traces, transfer checks, code guidance, and seven capstones - Done when every visible outcome satisfies Orient-Learn-Try-Test-Extend and every core section ends in synthesis
5. [x] Update objective-coverage and interaction audit documentation and obtain an independent semantic grade with zero unresolved objectives - Done when the grader reports a complete pass and the review history is recorded
6. [x] Generalize regression and Pages verification contracts for per-course counts and canonical URLs - Done when focused routing, curriculum, objective, persistence, and export checks pass without weakening LLM invariants
7. [x] Run full lint, tests, both Pages base-path builds, and representative desktop/narrow/reduced-motion QA - Done when all required commands pass and visual behavior is documented
8. [x] Re-audit every plan step, earlier-plan regression, and the original objective; close every discovered gap - Done when the completion re-check is unambiguously yes

### Clarifications
- Constraints: Preserve dirty worktree changes; keep LLM IDs/content and editorial visual language stable; static GitHub Pages only; required learning self-contained; no publication or deployment
- Checks/Tests: node --test tests/objective-coverage.test.mjs; npm run lint; npm test; NEXT_PUBLIC_BASE_PATH= npm run build:pages && EXPECTED_PAGES_BASE_PATH= npm run verify:pages; NEXT_PUBLIC_BASE_PATH=/llms-from-scratch npm run build:pages && EXPECTED_PAGES_BASE_PATH=/llms-from-scratch npm run verify:pages; browser QA at desktop and narrow widths

- Completion Re-check: Post-compaction review of original objective/steps: yes; all 8 original steps and all 6 remediation steps are complete, the semantic gate is 92/92, full verification passes, and no unresolved gap remains.
### Verification

- Step 1: pass - Course catalog resolves the unchanged 44-lesson LLM registries and new 46-lesson World Models registries; npx tsc --noEmit passed after route type regeneration.
- Step 2: pass - Canonical two-segment route source and static params exist; legacy LLM forwarding is implemented and covered by tests/world-model-curriculum.test.mjs.
- Step 3: pass - Accessible labeled select, course-scoped v2 progress, v1 LLM migration, last-course root forwarding, and course-scoped capstone keys are implemented.
- Step 4: pass - 46 lessons, 92 five-dimensional objective records, 46 transfer checks/motion stories, 9 lab modes, 20 notebooks, 6 validations, and 7 capstones/artifacts pass tests/world-model-curriculum.test.mjs.
- Step 5: pass - Interaction audit was extended for nine World Models labs; independent objective semantic gate closed 92/92 and row-level history is documented.
- Step 6: pass - cmd: npm test plus both verify:pages shapes; result: 90 canonical lesson routes, 44 legacy forwards, 139 static pages, 95 tests, and all artifacts pass; proof: tests/world-model-curriculum.test.mjs and scripts/verify-pages-export.mjs.
- Step 7: pass - cmd: npm run lint, npm test, root/subpath Pages builds, and in-app browser QA; result: all commands pass; desktop and 390x844 course/lesson routes, switching, overflow, 44px targets, live lab state, and motion-safe CSS verified.
- Step 8: pass - cmd: reopen PLAN_LOG.md, inspect course/routing/persistence/curriculum/documentation joins, git diff --check, and back-verify full test/browser evidence; result: original multi-course objective is fully wired with no unresolved gaps or earlier-plan regressions.
### Gaps -> Plan 2
- Representations: remediate 6 partial objectives across autoencoders, VAEs, recurrent state, and RSSM
- Training and planning: remediate 8 partial objectives across targets, collapse, KL routing, actor-critic, Dreamer, MuZero, and Dyna/TD-MPC
- Foundation/deployment: remediate 7 partial objectives across video dynamics, Genie, evaluation, compounding error, identification, safety, and operations
- Advanced/capstone: remediate 6 partial objectives and prerequisite leaks across slots, hierarchy, causality, multimodality, and final research packaging
- Repeat independent semantic grade until all 92 objectives pass, then document row-by-row closure

## Plan 2
1. [x] Repair representation and RSSM objective coverage/checks
2. [x] Repair training and planning objective coverage/checks
3. [x] Repair foundation-model and deployment objective coverage/checks
4. [x] Repair advanced and final-capstone coverage plus prerequisite definitions
5. [x] Run structural coverage tests and independent semantic regrade
6. [x] Record 92/92 gate closure in objective review documentation

### Verification

- Step 5: pass - npx tsc --noEmit and focused objective/world curriculum tests passed; independent grader finished at 92 pass, 0 partial, 0 fail with all five dimensions 92/92.
- Step 6: pass - docs/OBJECTIVE_COVERAGE_REVIEW.md now records the World Models remediation history and docs/WORLD_MODEL_OBJECTIVE_COVERAGE_GRADE.md records all 92 exact rows.
- Step 1: pass - proof: app/world-models/sections/representations.ts; result: repaired autoencoder, VAE, recurrent-state, and RSSM traces/checks pass the independent semantic gate.
- Step 2: pass - proof: training.ts and planning.ts; result: target, collapse, KL-gradient, actor-critic, Dreamer, MuZero, and Dyna/TD-MPC rows pass independent review.
- Step 3: pass - proof: foundation-models.ts and deployment.ts; result: generation, Genie, evaluation, exploitation, identification, safety, and operations rows pass independent review.
- Step 4: pass - proof: advanced.ts; result: slots, hierarchy, causal definitions, multimodal trace, and research-capstone packaging pass, with all four prerequisite leaks closed.
### Gaps -> Plan 3
