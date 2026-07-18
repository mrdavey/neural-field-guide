# PLAN_LOG.md

## Objective
Harden the direct-to-main workflow so local pushes run the same isolated, pinned verification contract as GitHub Actions; keep deployment gated, add weekly clean verification, and document/test the complete path.

## Plan 1
1. [x] Create the shared isolated CI verifier and environment receipt - Done when one repository command installs the locked Node graph, creates a clean Python 3.12 environment, installs every capstone requirement, runs lint/full tests/root and project-prefix Pages checks, and leaves tracked build metadata unchanged.
2. [x] Wire direct pushes and GitHub Actions to the shared verifier - Done when a repository-managed executable pre-push hook blocks failed verification, the hook is installed locally through a documented command, the pinned Ubuntu workflow calls the same verifier, scheduled runs verify without deploying, and push/manual runs deploy only after success.
3. [x] Add regression contracts and operator documentation - Done when executable tests validate hook installation/content, workflow order/pins/schedule/deployment conditions, dependency coverage, shared command wiring, and the direct-main runbook explains normal use and the intentional bypass boundary.
4. [ ] Verify, back-check, and commit - Done when clean-environment focused tests, action/YAML validation, npm run ci:verify, both Pages URL shapes, lint/full tests, exact plan/objective completion gates, diff hygiene, and a guarded scoped commit all pass.

### Clarifications
- Constraints: Keep direct pushes to main; do not introduce PR or candidate-branch requirements; preserve GitHub Pages as the only deployment target; production deployment must remain gated behind verification.
- Checks/Tests: node --test tests/github-pages-docs.test.mjs; npm run ci:verify; npm run lint; npm test; root and /neural-field-guide Pages verification; workflow YAML validation; git diff --check

- Back-Verification: yes; repeated focused tests, automatic prepare hook installation, shellcheck, actionlint, aggregate-lock coverage, workflow/template equality, and diff hygiene show no regression or remaining implementation gap.
- Objective Verification: yes; direct-to-main remains the workflow, local pushes run the shared isolated verifier, GitHub repeats it before upload/deploy, and weekly runs verify without deploying.
- Completion Re-check: yes; re-opened the original objective and all four steps after the final full ci:verify pass; all implementation and wiring requirements are satisfied, with only the guarded commit as the next mechanical gate.
### Verification

- Step 1: pass - cmd: npm run ci:verify plus pre/post shasum; result: fresh Python 3.12 venv began without NumPy, aggregate lock installed NumPy 2.4.4, npm ci/lint/211 tests/root and /neural-field-guide exports passed, tsconfig.tsbuildinfo hash stayed 8cf54180; proof: scripts/ci-verify.mjs, requirements-ci.txt, tsconfig.pages.json
- Step 2: pass - cmd: npm run hooks:install; git config --get core.hooksPath; node --test tests/github-pages-docs.test.mjs; result: .githooks installed, failing verifier exits 73 through pre-push, workflow pins ubuntu-24.04/Node 22.13.0/Python 3.12, weekly schedule skips configure/upload/deploy, push/manual deployment remains gated; proof: .githooks/pre-push, scripts/install-git-hooks.mjs, .github/workflows/deploy-pages.yml
- Step 3: pass - cmd: node --test tests/github-pages-docs.test.mjs; actionlint active and template workflows; result: 9/9 focused contracts and both actionlint checks pass, aggregate lock exhaustively covers all capstone Python locks, direct-main bypass boundary documented; proof: tests/github-pages-docs.test.mjs, README.md, docs/GITHUB_PAGES.md, docs/github-pages/deploy-pages.yml
### Gaps -> Plan 2
