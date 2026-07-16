# Neural Field Guide

Neural Field Guide is a self-contained personal learning and research program for building intelligent systems from understandable primitives, then using those systems for controlled original experiments.

The program currently contains 182 lessons across five complete courses:

| Course | Lessons | Canonical home | What the learner builds |
| --- | ---: | --- | --- |
| Large Language Models | 44 | `/llm/` | Tensors, a tokenizer, a decoder-only Transformer, training and inference systems, and evidence-aware applications |
| World Models | 46 | `/worldmodel/` | State estimators, latent dynamics, imagined rollouts, planners, and model-based decision systems |
| Generative Models | 30 | `/generative/` | Autoregressive, variational, flow, energy-based, diffusion, and conditional generators |
| Reinforcement Learning & Control | 32 | `/rl/` | Tabular and deep value learners, policy-gradient agents, model-based control, and reliable experiments |
| Embodied AI | 30 | `/embodied/` | Typed sensor-policy-actuator loops, imitation and language-conditioned policies, feedback, and simulation studies |

The course selector sits beside the site identity and changes the complete curriculum context. A canonical lesson URL is `/<course-id>/<lesson-id>/`; the root resumes the last selected course, and legacy flat LLM lesson URLs forward to their `/llm/` locations. The recommended sequence and the places where concepts branch or rejoin are documented in [`docs/CURRICULUM_ARCHITECTURE.md`](docs/CURRICULUM_ARCHITECTURE.md).

## Run locally

Prerequisite: Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Open `http://localhost:3000/`. Progress and project notes stay in browser storage and are isolated by course. Existing LLM progress using the original storage key is migrated on first use. Required lessons, practice, feedback, assessments, and reference artifacts work without an account, API, teacher, or external grader.

## Verify the program

```bash
npm run lint
npm test
```

`npm test` creates and verifies the static export, checks preserved learning and experiment artifacts, confirms the current independent page-grade evidence, and runs the complete curriculum, accessibility, and UX regression suite. Documentation-specific invariants can be checked quickly with:

```bash
node --test tests/documentation.test.mjs
```

The current grading rubric, generated 187-page report, objective review, interaction audit, and documentation ownership map are indexed in [`docs/README.md`](docs/README.md).

## Evidence and optional external experiments

Browser labs and preserved fixtures make mechanisms inspectable, but they are not presented as model-quality measurements. Course-scale validation artifacts retain their provenance and claim boundaries. Heavyweight or accelerator-backed experiments are optional extensions, with smoke checks, full commands, expected invariants, variable observations, stop criteria, and failure-preserving output contracts.

The external execution families cover:

- pinned GPT-2/Qwen tokenizer inspection;
- pinned GPT-2 hidden-state measurement;
- pinned OLMo batch token accounting;
- a matched causal-versus-FIM language-model ablation;
- a matched tiny-diffusion schedule ablation;
- a paired DQN target-network experiment;
- an embodied action-chunk feedback experiment.

Start with [`external-executions/README.md`](external-executions/README.md). The Generative, RL, and Embodied runbooks use the same CLI on Google Colab, another compatible GPU service, or a local environment. No external run is required to complete a course, and no plausible result is treated as measured evidence until its preserved artifact is reviewed.

## GitHub Pages deployment target

GitHub Pages is the supported target. `npm run build:pages` uses Next.js native static export and writes the publishable site to `out/`; the application has no database, authentication, secret-backed API, or server runtime requirement.

Publication is not active by default. Read [`docs/GITHUB_PAGES.md`](docs/GITHUB_PAGES.md) before making the repository public or copying the inert workflow template into `.github/workflows/`.

## Repository map

- `AGENTS.md`: contributor contract and complete lesson teaching standard
- `app/course-data.ts` and `app/course-catalog.ts`: LLM source of truth and the five registered course definitions
- `app/world-models/`, `app/generative/`, `app/rl/`, `app/embodied/`: course-specific curricula, labs, assessments, evidence, and projects
- `app/research-courses/`: shared implementation contracts for the three research courses
- `app/curriculum-graph.ts` and `app/research-curriculum-manifests.ts`: cross-course ownership and released-course manifests
- `public/validation-artifacts/` and `public/capstone-artifacts/`: downloadable, machine-readable reference evidence
- `public/experiment-runbooks/`: learner-facing copies of optional accelerator experiment instructions
- `external-executions/`: optional reproduction runners, dependency pins, runbooks, and evidence schemas
- `scripts/`: deterministic generators and repository verifiers
- `docs/`: maintained architecture, review, grading, interaction, and publication documentation
- `tests/`: executable curriculum, content, artifact, accessibility, rendering, and deployment contracts

See [`docs/README.md`](docs/README.md) before adding a new report. It identifies the canonical maintained documents, generated files, owners, regeneration commands, and retirement policy.
