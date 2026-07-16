# External experiment template

Use this template for every Colab, compatible hosted GPU, or local accelerator exercise. The TypeScript source of truth is `app/external-experiments.ts`; `experiment-contract.schema.json` defines the portable shape.

## 1. Outcome and evidence label

- Course and lesson:
- Observable outcome:
- Label: `external`
- What the run can establish:
- What it cannot establish:

## 2. Exact revisions

- Neural Field Guide revision:
- Runner revision:
- Python and dependency pins:
- Model ID and revision:
- Dataset ID, configuration and revision:
- Container/runtime image if applicable:

## 3. Compute and budget

- Minimum and reference hardware:
- GPU memory and storage:
- Download size:
- Smoke budget:
- Full-run steps/tokens/episodes and seeds:
- Stop criteria:
- Possible service cost or quota boundary:

## 4. Provider instructions

Write complete setup and run instructions for:

1. Google Colab when the repository is reachable or uploaded;
2. a service-neutral hosted GPU shell;
3. local execution when practical.

Do not hide credentials in a notebook, command, output artifact, environment dump or screenshot.

## 5. Predict before running

Name the invariant or relationship the learner predicts. Record the prediction before showing the reviewed reference observation.

## 6. Expected results

Separate these visibly:

- **Invariants:** exact checks that should hold for every valid run, such as shapes, equal budgets, finite losses, required rows and serialization fields.
- **Reviewed observations:** measured values or ranges backed by preserved raw rows, exact hardware, declared seeds and a review date.
- **Qualitative expectation:** a direction or visible behavior when no reviewed numeric run exists. Do not invent a range.
- **Teaching fixture:** deterministic or simulated values used only to teach arithmetic, serialization or interpretation.

## 7. Diagnostics and retry

For every likely failure, record the symptom, likely cause, safe retry action and condition that invalidates the comparison.

## 8. Artifact

The runner writes a new versioned artifact under `external-executions/runs/`. It must preserve configuration, environment, raw rows, summaries, failures, decision and claim boundary. It never silently overwrites a reviewed public artifact.
