# Working in Neural Field Guide

## Scope and purpose

This file governs the entire repository. It is the operating contract for agents and contributors working on the course.

The product is a self-contained, self-paced course that teaches LLMs from first principles to a motivated beginner. Optimize for durable human understanding, not content volume, feature count, visual novelty, or a nominal grading score.

## Non-negotiable product principles

1. **Beginner-first, never beginner-only.** Introduce every new term in plain language before relying on it. Then provide the precise mechanism, notation, limitations, and implementation detail an advanced learner needs.
2. **Build knowledge cumulatively.** A lesson may depend only on ideas already taught or explicitly introduced in that lesson. State prerequisites, activate prior knowledge, and explain where the new idea will be reused.
3. **Make invisible mechanisms observable.** Prefer worked traces, controlled examples, diagrams, simulations, comparisons, prediction prompts, and causal explanations over unsupported summaries.
4. **Keep the learning loop self-contained.** Required explanations, practice, checks, feedback, hints, and worked answers must function without an account, API, teacher, external grader, or paid service. External links and heavyweight runs are optional extensions.
5. **Label evidence honestly.** Clearly distinguish browser simulation, deterministic fixture, pseudocode, adapted code, real local execution, external reproduction, and published evidence. Never present a plausible number as a measurement.
6. **Prefer depth with structure.** Substantial reading is welcome, but use descriptive headings, focused paragraphs, progressive disclosure, generous whitespace, and concrete examples so density does not become cognitive overload.
7. **Preserve learner agency.** Ask for a prediction or decision before revealing an answer. Give diagnostic feedback and a retry path; do not use vague “looks good” self-certification as mastery evidence.

## Start every task this way

1. Read the user request, this file, and the smallest set of relevant source and test files.
2. Inspect `git status --short`. The working tree may contain valuable user or agent changes; never discard, reset, or broadly rewrite unrelated work.
3. Identify the learner outcome and the knowledge dependencies before choosing a UI or implementation.
4. For curriculum ordering changes, map the affected prerequisites, lesson numbers, next-use statements, code examples, assessments, and capstones before editing.
5. For accuracy-sensitive or time-sensitive claims, verify current primary or official sources. Record a revision/date where implementation behavior or model details may change.
6. Make the smallest coherent change that fully solves the task. Preserve the established architecture, visual language, IDs, and learning contracts unless the task explicitly calls for changing them.
7. Run focused checks during implementation, then the required repository checks before handoff.
8. After successful verification, commit every complete in-scope implementation with scoped staging. Never include unrelated or unfinished work; if a safe commit is blocked, state the reason explicitly at handoff.

## Repository map and source of truth

- `app/course-data.ts`: curriculum tracks, lesson order, definitions, analogies, examples, misconceptions, quizzes, prerequisites, and source links.
- `app/course-app.tsx`: course shell, navigation, progress, lesson composition, and the home learning path.
- `app/course-catalog.ts`: the five released course definitions, routes, storage keys, and selector metadata.
- `app/world-models/`, `app/generative/`, `app/rl/`, and `app/embodied/`: course-specific lessons, teaching records, labs, assessments, evidence, and projects.
- `app/research-courses/`: shared teaching, assessment, artifact, and interaction contracts for the Generative, RL, and Embodied courses.
- `app/curriculum-graph.ts` and `app/research-curriculum-manifests.ts`: cross-course concept ownership and the released research-course manifests.
- `app/lesson-guides/`: long-form instructional content. `index.ts` is the registry and `types.ts` defines the guide contract.
- `app/lesson-objective-coverage.ts`: exact objective-to-teaching joins. Every visible outcome must map to its plain explanation, mechanism, worked trace, boundary, and committed check/retry.
- `app/lesson-guide-view.tsx`: renders long-form explanations, prediction-led code, guided practice, vocabulary, and resources.
- `app/lesson-labs.tsx`: browser-based teaching simulations and interactive labs.
- `app/code-examples.ts`: lesson code notebooks. Every entry needs matching guidance in `app/activity-info.tsx`.
- `app/lesson-evidence.ts`, `app/lesson-transfer-checks.ts`, and `app/lesson-transfer-distractors.ts`: lesson-specific contrasts and objectively checked transfer tasks.
- `app/mastery-studios.tsx`: higher-order decision studios for concepts that benefit from scenario practice.
- `app/technical-validations.tsx` and `app/validation-artifacts.ts`: authentic-validation contracts and links to preserved evidence.
- `app/capstone-projects.ts`, `app/capstone-evidence.ts`, and `app/capstone-project-view.tsx`: cumulative project instructions, scaffolds, local checks, exemplars, and artifact links.
- `public/validation-artifacts/`: reviewed learning-validation dossiers that are publicly downloadable.
- `public/capstone-artifacts/`: complete, machine-readable reference artifacts for capstones.
- `external-executions/`: optional model-backed reproduction runners and their evidence boundary.
- `scripts/`: deterministic artifact generators and repository verifiers.
- `tests/`: executable curriculum, accuracy, UX, accessibility, artifact, deployment, and rendering contracts.
- `docs/README.md`: canonical documentation index, ownership map, regeneration commands, and retirement policy.
- `docs/GITHUB_PAGES.md`: publication runbook. Publication is optional and is not activated by default.

Do not manually edit generated output in `.next/`, `dist/`, `out/`, or `tsconfig.tsbuildinfo`. Fix the source and rebuild.

## Complete lesson teaching contract

Every lesson should follow the visible sequence **Orient → Learn → Try → Test → Extend**.

### Orient

- State the concrete learner outcome in observable terms.
- Name prerequisites and briefly reactivate the exact prior idea being reused.
- Explain why the concept matters and where it fits in an LLM system.
- Preview where this knowledge will be used next.

### Learn

- Give a one-sentence simple definition that does not depend on unexplained jargon.
- Follow with a precise, in-depth definition including inputs, transformation, outputs, and role in the larger system.
- Use an analogy, then explicitly state where the analogy breaks.
- Include at least one worked example with real values, shapes, tokens, or a concrete scenario.
- Explain the most likely beginner misconception and why it is wrong.
- Define new vocabulary before using it as shorthand.
- Render meaningful mathematical notation as mathematics rather than prose-like ASCII.

### Objective coverage gate

- Treat every sentence in “By the end of…” as a learning promise. Content after the outcome list must teach the whole promise; similar vocabulary or a passing mention does not count.
- Maintain one explicit `lessonObjectiveCoverage` record for every exact objective. Do not infer coverage with array position, modulo indexing, shared filler, or an unreviewed default.
- A record passes the authoring gate only when it contains all five dimensions: (1) a beginner-readable explanation, (2) a precise causal mechanism with inputs/transformation/outputs or decision evidence, (3) a concrete worked value/shape/token/trace/scenario, (4) a boundary, failure case, or misconception, and (5) an observable check with expected reasoning and a specific retry route.
- Make learners commit a response before revealing expected reasoning. The objective check is guided retrieval practice; retain the later deterministic changed-case assessment for mastery evidence.
- When an objective changes, update its coverage record, the related narrative/example/assessment, and `docs/OBJECTIVE_COVERAGE_REVIEW.md` in the same change. Run `node --test tests/objective-coverage.test.mjs` before the full required suite.
- After the content author finishes, use an independent grader to compare each objective semantically with all five coverage dimensions. Revise every failed or partial item and repeat grading until a complete pass contains no unresolved objective. Structural tests alone cannot award that pass.

### Try

- Use the interaction that best exposes the mechanism: manipulate inputs, trace state, compare cases, predict output, debug a failure, or make a constrained decision.
- Make the task, controls, expected observation, and completion condition explicit.
- Use `ActivityInfo` to say whether an activity is `run`, `adapt`, `pseudocode`, `simulated`, `checked`, `reflect`, `external`, `inspect`, `project`, `optional`, or `self-paced`.
- Do not add an interaction merely to create motion. It must answer a learning question that static prose answers less effectively.

### Test

- Required assessment must be graded locally and deterministically wherever the task permits.
- No teacher, external grader, API, or account may be required to complete or check required work.
- Give option-specific or error-specific feedback, not only correct/incorrect.
- Include a retry path and a worked explanation after a genuine attempt.
- Test transfer to a changed or unfamiliar case, not just recognition of wording from the definition.
- Do not require an LLM judge, teacher, server, account, or external submission.

### Extend

- Make further reading optional and explain what each source helps the learner verify or understand.
- Use primary/foundational sources and current official documentation where possible.
- End major sections with a synthesis case study or capstone that integrates the section rather than introducing unrelated prerequisites.

## Curriculum ordering and change discipline

- Keep lesson IDs stable. They are persistence keys and join keys across guides, labs, evidence, transfer checks, validation, tests, and capstones.
- Do not move a lesson earlier than its prerequisites or make a later optional branch appear mandatory.
- When adding or removing a lesson, update every relevant registry and deliberately update test counts. Current tests encode 182 released lessons and 187 canonical pages: 44 LLM, 46 World Models, 30 Generative Models, 32 Reinforcement Learning & Control, and 30 Embodied AI lessons, plus five course homes. Count changes must reflect an intentional curriculum decision; course-specific notebook, validation, and capstone counts remain exact in their executable contracts.
- Preserve the cumulative spine: foundations → architecture → pre-training → post-training → inference/reasoning → applications/safety → advanced specialization.
- Advanced topics may branch by learner goal. Do not invent a single dependency chain when the concepts are genuinely parallel.
- Case studies should synthesize the immediately preceding section with a current, inspectable, openly documented system. Explain why the example was chosen and which details should not be generalized.
- Do not remove a foundational concept merely because a modern library abstracts it. Teach the mechanism first, then the abstraction.

## Accuracy, evidence, and sources

- Prefer original papers, official documentation, official repositories, model cards, dataset cards, and primary release reports.
- Use exact revisions, commits, model IDs, versions, dataset snapshots, or access dates when a result depends on them.
- Separate facts reported by a source from inferences made by the course.
- Never fabricate citations, links, benchmark values, token IDs, model outputs, runtime measurements, or experimental conclusions.
- Treat a deterministic teaching fixture as a fixture. It can validate arithmetic or serialization, not model quality.
- Treat a browser simulation as a mechanism demonstration, not an external model run.
- Keep claims proportional to evidence. One prompt, seed, checkpoint, metric, or successful sample is rarely sufficient for a general conclusion.
- For comparisons, match the relevant data, token, compute, initialization, evaluator, and stopping budgets or clearly describe what remains confounded.
- Include failure cases, boundary conditions, uncertainty, alternative explanations, and what evidence would falsify the conclusion.
- If a preserved JSON artifact changes, retain its schema/provenance boundary and run the artifact verifier. Do not promote optional external output into `public/` without review.
- Review time-sensitive sources when touching the lesson. Do not mechanically update a “reviewed” date without actually rechecking the resource and claim.

## Mathematical notation

- Wrap inline notation in `$...$` and display notation in `$$...$$` inside learner-facing strings.
- Render learner-facing strings with `MathText` or `MathExpression`; do not inject raw LaTeX-looking text into ordinary paragraphs.
- In TypeScript strings, preserve backslashes correctly (`\\` where JavaScript escaping requires it).
- The local MathML renderer supports a deliberate subset of LaTeX. When introducing a new command, either extend `app/math-text.tsx` with tests or express the notation using the supported subset.
- Define symbols before manipulating them. Give shapes and units where applicable.
- Follow an equation with a plain-language interpretation and, for important formulas, a small numerical example.
- Ensure display math scrolls safely on narrow screens and retains an accessible textual label.

## Code examples and execution labels

- Every entry in `app/code-examples.ts` must have the same lesson ID in `codeActivityGuidance`.
- `run` means the shown block is complete for the stated environment. Name dependencies, hardware assumptions, nondeterminism, and expected observation.
- `adapt` means syntax is real but surrounding objects or data are intentionally absent. Name every required input; never imply copy-paste execution.
- `pseudocode` means interfaces are conceptual. Prefer readable responsibilities over library-shaped fake APIs.
- Ask the learner to predict before revealing output or reasoning.
- Use small inspectable examples before production-scale code. Show shapes, masks, target shifts, state, seeds, and failure modes that affect correctness.
- Never include secrets, paid credentials, unsafe destructive commands, or an unbounded GPU/download instruction in required course work.
- Heavyweight exercises must remain optional and point to a pinned runbook with stop criteria and evidence requirements.

## Interactive and assessment UX

- The page must explain what to do before the learner manipulates controls.
- Use an info layer through `ActivityInfo`; it must work by hover, keyboard focus, and click/tap. Do not make essential instructions hover-only.
- Preserve learner attempts before reveal. Disable reveal until a meaningful attempt where appropriate.
- Give local, specific feedback tied to the learner's choice or failed field.
- Make reset/clear actions explicit and confirm destructive clearing of saved work.
- Progress and capstone drafts stay in `localStorage`. Do not silently change storage keys or schemas; provide a migration or intentionally version the key.
- Never claim a free-text response was objectively graded unless deterministic criteria genuinely support that claim. Use guided comparison for open reflection.
- Avoid gamification that rewards clicking through instead of understanding.

## Capstones

Each capstone is a build-and-learn project, not a paragraph defending why the topic matters. It must include:

- a concrete outcome, prerequisites, time/compute expectations, and materials;
- staged instructions with goals, actions, checkpoints, hints, and a persistent workspace prompt;
- runnable starter scaffolding or an explicit specification when execution is optional;
- correctness checks that can be performed locally;
- required evidence, failure logs, and decision criteria;
- a rubric with observable developing/proficient/excellent distinctions;
- a complete worked reference and downloadable machine-readable artifact;
- reflection prompts that connect implementation decisions back to course concepts;
- primary sources and a clear boundary between a course-scale result and a production claim.

## UI, accessibility, and visual consistency

- Preserve the existing editorial field-guide visual language: warm paper surfaces, dark ink panels, track colors, serif display headings, system sans/mono body utilities, restrained borders, and generous space.
- Use the readable single-column flow for long prose. Grids are appropriate for short comparisons, mappings, controls, and summaries—not dense narrative.
- Prefer more whitespace over compressing independent learning components into one screen.
- Keep line length comfortable, body text readable, headings descriptive, and sections visually distinct.
- Use semantic HTML, real buttons, associated labels, fieldsets/legends for grouped choices, and meaningful link text.
- All functions must work with keyboard and touch. Preserve visible focus styles and logical focus order.
- Never encode meaning with color alone. Provide text, shape, state, or labels as a second channel.
- Respect reduced-motion preferences. Animation must clarify state rather than distract.
- Code, tables, formulas, and long URLs must wrap or scroll without breaking narrow screens.
- Avoid decorative imagery that adds no instructional value. Prefer CSS, typography, existing icon language, and purposeful diagrams.

### Instructional interaction and motion review

- Begin with a learning question, not an animation technique. Name the learner-controlled variable, the state that changes, the observation to make, and the completion condition before choosing Three.js, SVG, CSS, canvas, or ordinary controls.
- Every visual must encode the lesson's causal mechanism or decision. Matrices should expose relationships between axes, distributions should preserve visible mass, pipelines should show transformations, queues should show admission and release, boundaries should show authority, and interventions should distinguish observation from causal change.
- Topic-colored particles, generic node graphs, decorative rotation, and track-themed motion do not count as a lesson representation. They may be a restrained depth layer only when a static, inspectable semantic diagram carries the meaning without them.
- Record an explicit visual grammar, learning question, representation, and evidence boundary for every shared animation. Keep `threeConceptSemantics` exhaustive when adding a concept and update `docs/INTERACTION_AUDIT.md` when adding or materially changing an interaction.
- Audit every manipulable lab for **Change → Observe → Explain**: what the learner changes, what should visibly respond, why that response follows from the mechanism, and what the simulation cannot establish. Repair or remove a lab when static prose would teach the same thing more clearly.
- Prefer a single readable row flow for instructional headings, directions, and stage explanations. Use multiple columns only for short items that learners genuinely need to compare side by side; never force narrative prose into a dashboard grid.
- Preserve meaning under WebGL failure and reduced motion. Progressive visual effects may disappear, but labels, current state, causal relationships, instructions, and assessment must remain available.
- Check representative interactions at desktop and narrow widths for sticky behavior, reading order, overflow, keyboard controls, touch targets, and reduced-motion state. A visually novel interaction does not pass until these checks and its lesson-specific semantic review pass.

## Architecture and hosting constraints

- Preserve the existing Next.js App Router structure and package lock.
- `npm run dev` is the normal local course preview.
- `npm run build` is the normal Next.js application build.
- GitHub Pages is the only planned deployment target: `npm run build:pages` uses Next.js native static export and writes `out/`.
- Any public file linked from application code must use `publicPath(...)` so project Pages URLs such as `/repository-name/` work.
- Keep the required course functional as a static export without a server, database, secrets, authentication, or request-dependent route handlers. If a future feature truly requires a backend, state that it is incompatible with the current GitHub Pages target before implementing it.
- Do not activate, publish, push, or copy the Pages workflow into `.github/workflows/` unless the user explicitly requests publication. The inert template lives at `docs/github-pages/deploy-pages.yml`.
- Follow `docs/GITHUB_PAGES.md` for privacy review, activation, acceptance checks, rollback, and custom domains.

## Required verification

For content, curriculum, assessment, artifact, or UI changes, run:

```bash
npm run lint
npm test
```

`npm test` must build the normal application, verify preserved artifacts, and run the entire regression suite. Add focused tests for new invariants; do not weaken a test merely to make a change pass.

For changes to routing, fonts, public asset URLs, build configuration, dependencies, or publishing, also verify both Pages URL shapes:

```bash
NEXT_PUBLIC_BASE_PATH= npm run build:pages
EXPECTED_PAGES_BASE_PATH= npm run verify:pages

NEXT_PUBLIC_BASE_PATH=/llms-from-scratch npm run build:pages
EXPECTED_PAGES_BASE_PATH=/llms-from-scratch npm run verify:pages
```

Replace `/llms-from-scratch` with the intended project repository name when known.

For visual changes, inspect the affected experience at desktop and narrow widths when browser QA is requested or permitted by the active workflow. Check reading order, overflow, focus, touch targets, instructions, answer/retry states, and saved progress.

The current normal build may report a non-fatal large-chunk warning. Do not hide it. If a change materially increases initial payload or interaction latency, split appropriate optional components without breaking the lesson sequence.

## Definition of done

A change is complete only when:

- the requested learner outcome is fully implemented;
- prerequisite and next-use relationships remain coherent;
- prose, examples, math, code, interactions, and feedback agree with one another;
- required work remains self-contained and optional external work is labeled;
- evidence and sources support the exact strength of every claim;
- desktop, narrow-screen, keyboard, touch, and reduced-motion behavior are preserved as relevant;
- persistence and public asset paths remain compatible;
- focused tests and the full required suite pass;
- no unrelated changes, secrets, generated output, or fabricated evidence were introduced;
- the handoff states what changed, what was verified, and any genuine limitation.

Do not declare a component “100%” because it is long or because a test passes. A top-quality component is accurate, comprehensible to its intended learner, appropriately challenging, transferable to a new case, accessible, and honest about its limits.
