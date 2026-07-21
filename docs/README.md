# Documentation map

Reviewed: 15 July 2026

This directory contains the maintained documentation for the five-course, 182-lesson Neural Field Guide. The public program landing page links to all 187 canonical pages: one home for each course and 182 lessons. This file distinguishes current sources of truth from generated evidence so a new audit does not become a second, conflicting specification.

## Maintained documents

| Document | Role | Update when |
| --- | --- | --- |
| [`../README.md`](../README.md) | Program overview, routes, local workflow, evidence boundary, and repository map | Courses, routes, setup, verification, or hosting changes |
| [`../AGENTS.md`](../AGENTS.md) | Contributor contract and complete lesson teaching standard | Repository-wide authoring, evidence, accessibility, or verification policy changes |
| [`CURRICULUM_ARCHITECTURE.md`](CURRICULUM_ARCHITECTURE.md) | Recommended sequence, canonical concept ownership, cross-course joins, release discipline, and research evidence contract | Course dependencies, concept ownership, experiment policy, or release status changes |
| [`OBJECTIVE_COVERAGE_REVIEW.md`](OBJECTIVE_COVERAGE_REVIEW.md) | Consolidated semantic review for all 408 exact lesson objectives | An objective or any teaching/assessment surface that fulfills it changes |
| [`COURSE_PAGE_GRADING_RUBRIC.md`](COURSE_PAGE_GRADING_RUBRIC.md) | Independent grading dimensions, thresholds, blocker rules, and evidence protocol | The page-level grading contract changes |
| [`INTERACTION_AUDIT.md`](INTERACTION_AUDIT.md) | Learning question, visual grammar, Change → Observe → Explain contract, and evidence boundary for instructional motion and labs | An interaction is added or materially changed |
| [`LESSON_VISUAL_ATLAS.md`](LESSON_VISUAL_ATLAS.md) | Complete 182-lesson static visual inventory, representation rules, style contract, provenance, generation, and verification workflow | A lesson plate, visual kind, shared style, prompt, asset, or delivery contract changes |
| [`GITHUB_PAGES.md`](GITHUB_PAGES.md) | Static-export publication, privacy, activation, verification, rollback, and domain runbook | Hosting, routing, public paths, build configuration, or workflow pins change |
| [`../external-executions/README.md`](../external-executions/README.md) | Entry point for optional model-backed and accelerator-backed experiments | A runner, pin, evidence gate, or runbook changes |

`COURSE_PAGE_GRADES.md`, `CURRICULUM_INVENTORY.md`, and `course-page-grades/*.json` are current generated evidence. They are retained because tests validate them against their source fingerprints; do not hand-edit them.

## Source ownership and regeneration

| Generated document or evidence | Source of truth | Regenerate or verify |
| --- | --- | --- |
| `CURRICULUM_INVENTORY.md` | Course registries, released research manifests, and curriculum graph | `node scripts/generate-curriculum-inventory.mjs` |
| `COURSE_PAGE_GRADES.md` and `course-page-grades/*.json` | Reviewed independent grade records plus source fingerprints | `npm run generate:grades`; verify without writes with `npm run verify:grades` |
| Public capstone and validation artifacts | Source contracts and deterministic generators under `app/` and `scripts/` | `npm run verify:artifacts` |
| Lesson visual WebPs | `docs/lesson-visual-prompts.json` and the built-in generation outputs | Process with `node scripts/process-lesson-visual.mjs`; verify with `npm run verify:lesson-visuals` |
| Public experiment runbooks | Corresponding optional runner and maintained external runbook | `node scripts/verify-experiment-contracts.mjs` |

The internal export name `plannedCourseManifests` is retained for compatibility, but Generative Models, Reinforcement Learning & Control, and Embodied AI are released courses. Learner-visible status comes from `app/course-catalog.ts`, not from that legacy identifier.

## Documentation rules

- Update one canonical document instead of creating a new dated status report for the same concern.
- Label browser fixtures, deterministic artifacts, authentic local execution, external execution, and published evidence separately.
- Keep exact course, lesson, objective, capstone, and route counts tied to executable tests.
- Use a review date only after the affected claims and primary sources were actually checked.
- Preserve historical findings in version control; do not retain obsolete root-level scorecards as competing current specifications.
- Link public files through `publicPath(...)`; documentation may use repository-relative links.
- Run `node --test tests/documentation.test.mjs` after documentation changes, then the repository-required `npm run lint` and `npm test`.

## Retired reports

The former component grade, content UX audit, curriculum audit, curriculum progression review, grading report, per-course objective grade snapshots, and one-off task seed files were removed after their still-relevant conclusions were consolidated into the documents above. Their history remains available in Git. Future reviews should update the canonical architecture, objective, interaction, or page-grade document instead of restoring parallel reports.
