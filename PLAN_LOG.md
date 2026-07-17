# PLAN_LOG.md

## Objective
Implement course-wide concept-first visual headings, cumulative scroll-story reveals, streamlined lesson outcomes, standardized lab contrast, and removal of the program bridge

## Plan 1
1. [x] Replace all learner-facing concept-plate headings and picture-centric copy with canonical lesson concept explanations, then add exhaustive 182-lesson regression coverage while preserving generation provenance.
2. [x] Make scroll-story nodes and stage controls reveal progressively, remain revealed after first activation, and keep only the current stage highlighted; add progression tests.
3. [x] Remove the redundant By the end heading while preserving objective teaching/checks, and fully retire the confusing program bridge UI, data, styling, audit text, and obsolete tests.
4. [x] Define and apply one accessible lab color token contract across LLM, World Models, Generative, RL, and Embodied lab surfaces, controls, states, and readouts; extend contrast tests.
5. [x] Run focused tests, exact plan verification, lint, the full suite, representative desktop/narrow browser QA including scroll and labs, then commit the complete scoped change.

### Verification

- Step 1: pass - tests/lesson-visuals.test.mjs passes: all 182 runtime records omit the generic display question, the renderer uses lesson.simple, and prompt provenance retains the historical generation question. Browser confirmed the Introduction concept heading and concept-first labels.
- Step 2: pass - scroll-story-progress regression passes. Browser reached stage 4 then returned to stage 1: only stage 1 retained aria-current/active while all four nodes and controls remained is-revealed at opacity 1.
- Step 3: pass - Content UX and curriculum progression tests pass; browser found zero By-the-end headings and zero program bridges while the outcome cards remained labeled Lesson outcomes and checks. Dead bridge component, data, styles, docs, and test were removed.
- Step 4: pass - Color contract test passes across LLM, World Models, and shared research lab renderers. Browser computed explicit dark/light foregrounds on LLM, World Models, and Generative labs; a light World Models detail clash found during QA was corrected and rechecked.
- Step 5: pass - Representative desktop and 390px browser QA passed for concept copy, cumulative story state, lab contrast, outcomes, bridge removal, and overflow. Final `npm run lint && npm test` passed the static export, 182-visual verifier, artifact and 187-page grade verifiers, and all 171 regression tests.
### Gaps -> Plan 2
- The full grade verifier still fingerprints the retired program-bridge files; after removing those inputs, every course grade record requires a fresh independent semantic regrade against the changed shared learner-facing bundle before its fingerprint can be updated.

## Plan 2
1. [x] Remove retired bridge files from the shared course-grade fingerprint and verify no bridge references remain.
2. [x] Run an independent semantic regrade of the shared course-wide changes; update each course grade record timestamp and exact source fingerprint only if the existing page scores and pass decisions remain defensible.
3. [x] Regenerate the canonical grade report, rerun lint and the complete repository suite, repeat the exact plan gap check, and commit.

### Verification

- Step 2: pass - An independent semantic grader reviewed all 187 composed pages, including the 21 pages whose supplemental program bridge was retired, and approved retaining every score, PASS decision, rationale, and empty blocking-defect list. All five records now carry the independent `2026-07-17T08:50:28Z` regrade and exact fingerprints for the expanded shared visual and interaction source bundle; the canonical 187-page report regenerated successfully.
- Step 3: pass - The repeated exact plan gap check found no missing or incorrect implementation. `npm run lint && npm test` passed, including the complete Pages build/export verifier, preserved artifacts, 182 lesson visuals, 187 independent page grades, and all 171 tests.

### Gaps -> Plan 3

- No further gaps found.
