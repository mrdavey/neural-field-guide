# PLAN_LOG.md

## Objective
Make course-grade source fingerprints deterministic across clean checkouts and local runs, repair the RL grade metadata, and verify deployment checks cannot regress

## Plan 1
1. [x] Define and apply a source-only fingerprint policy that excludes generated caches and transient filesystem artifacts - Done when recursive traversal cannot hash Python, build, editor, or OS cache files
2. [x] Add regression coverage and repository ignore rules - Done when a real generated cache file leaves the RL fingerprint unchanged and common transient paths are rejected
3. [x] Refresh only the affected RL fingerprint provenance - Done when the stable source-only fingerprint matches the independently graded record and the generated report remains byte-current
4. [x] Run focused verification, lint, npm test, and both Pages URL shapes - Done when every command passes from a cache-free state and no generated cache appears in git status

### Clarifications
- Constraints: Do not alter semantic grades, learner-facing course content, routes, artifacts, or the active Pages workflow
- Checks/Tests: node --test tests/course-page-grades.test.mjs; npm run verify:grades; npm run lint; npm test; both Pages base paths

- Back-Verification: Rechecked Plan 1 steps 1-4 after full validation: yes; the source-only policy, regression test, provenance metadata, and deployment gates agree with no regression.
- Objective Verification: The original objective is satisfied: yes; clean checkouts and local caches now produce the same grade fingerprint, npm test passes, and no semantic grade or learner-facing content changed.
- Completion Re-check: Post-compaction review of the objective and original four steps: yes; all work is implemented, wired, and verified with no unresolved gap.
### Verification

- Step 1: pass - cmd: node scripts/course-grade-fingerprint.mjs; result: stable source-only hashes produced and RL resolves to b246c96f without generated cache input; proof: scripts/course-grade-fingerprint.mjs
- Step 2: pass - cmd: node --test tests/course-page-grades.test.mjs; result: 7 passed including an integration check that writes a real .pyc cache and observes an unchanged RL hash; proof: tests/course-page-grades.test.mjs and .gitignore
- Step 3: pass - cmd: npm run verify:grades; result: 187 page rows verified and generated report remained byte-current; proof: docs/course-page-grades/rl.json contains the stable source-only fingerprint
- Step 4: pass - cmd: npm run lint; npm test; NEXT_PUBLIC_BASE_PATH=/llms-from-scratch npm run build:pages && EXPECTED_PAGES_BASE_PATH=/llms-from-scratch npm run verify:pages; git diff --check; cache scan; result: lint pass, 153 tests pass, all artifacts and 187 grade rows verify, 182 canonical routes plus 44 legacy forwards pass at root and project prefix, no generated caches remain; proof: terminal output and tracked diff
### Gaps -> Plan 2
