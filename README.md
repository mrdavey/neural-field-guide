# Neural Field Guide

A self-contained, interactive field guide with two complete courses:

- **Large Language Models** builds from tensors and next-token prediction through pre-training, post-training, inference, retrieval, agents, and advanced architectures.
- **World Models** builds from controlled dynamics and hidden state through latent state-space models, imagination, planning, video and foundation models, robotics, safety, operations, and advanced research branches.

The persistent course selector changes the complete curriculum context. Canonical course homes are `/llm/` and `/worldmodel/`; canonical lessons are `/llm/<lesson-id>/` and `/worldmodel/<lesson-id>/`. The root resumes the last selected course, and old flat LLM lesson URLs forward to their `/llm/` locations.

## Run the course locally

Prerequisites: Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Open `http://localhost:3000/`. Learner progress and project notes remain in the browser and are isolated by course. Existing LLM progress using the original storage key is migrated on first use. Neither course requires an account, teacher, external grader, or API.

## Verify the course

```bash
npm run lint
npm test
```

The test command builds the site, verifies the preserved learning artifacts, and runs the curriculum and UX regression suite.

## Optional external reproductions

The course itself is complete without downloading models or running GPU workloads. Four advanced validation exercises require external dependencies or compute:

1. compare the pinned GPT-2 and Qwen tokenizer payloads;
2. measure hidden-state cosines in the pinned GPT-2 checkpoint;
3. count nominal, visible, and loss-bearing tokens in the pinned OLMo loader;
4. run a paired causal-versus-FIM model ablation.

Complete setup, commands, runners, output contracts, failure criteria, and evidence-promotion steps are in [`external-executions/README.md`](external-executions/README.md).

## GitHub Pages deployment target

The course is designed to deploy as a static GitHub Pages site. `npm run build:pages` uses Next.js native static export and writes the publishable site to `out/`. The repository has no Cloudflare worker, Sites project, database binding, or server-side runtime requirement.

Read [`docs/GITHUB_PAGES.md`](docs/GITHUB_PAGES.md) before making the repository public or activating deployment. It covers repository choices, privacy and licensing review, root versus project URLs, local dry runs, workflow activation, GitHub settings, live acceptance checks, updates, rollback, custom domains, and troubleshooting.

## Repository map

- `AGENTS.md`: quality and consistency contract for future agents and contributors
- `app/course-catalog.ts`: shared course contract and the two registered course definitions
- `app/world-models/`: World Models curriculum, sources, labs, code, validations, transfer checks, and capstones
- `app/`: shared course UI plus the existing LLM curriculum, labs, assessments, and capstones
- `public/validation-artifacts/`: preserved validation contracts and evidence dossiers
- `public/capstone-artifacts/`: reference project artifacts
- `scripts/`: deterministic artifact generators and verifiers
- `external-executions/`: optional model-backed reproduction runbook and runners
- `docs/`: publication and maintenance runbooks, including GitHub Pages
- `tests/`: curriculum, artifact, accessibility, and UX regression checks

Publishing is not activated by default. The course and its grading work locally without a hosted service; when publication is requested, GitHub Pages is the supported target.
