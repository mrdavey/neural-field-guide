# Portable tiny-diffusion experiment

This optional exercise runs the same command in Google Colab, another compatible GPU service, or a local Python environment. The required course is complete without it. It trains two tiny 2D denoisers on identical synthetic ring data and initialization, changing only the linear versus cosine corruption schedule.

## 1. Record the environment

Use Python 3.11. In Colab, select a GPU runtime, clone or upload this repository, change into the repository root, and run:

```bash
python -m pip install -r external-executions/requirements-generative.txt
python - <<'PY'
import platform, torch
print(platform.python_version(), torch.__version__, torch.version.cuda)
print(torch.cuda.is_available(), torch.cuda.get_device_name(0) if torch.cuda.is_available() else "no CUDA GPU")
PY
```

Record the provider, image, GPU, driver/CUDA, package versions, repository revision, and any fallback you apply.

## 2. Run the bounded smoke profile

```bash
python external-executions/generative_diffusion_ablation.py \
  --profile smoke --device auto \
  --repository-revision "$(git rev-parse HEAD)" \
  --output external-executions/runs/generative-diffusion-smoke.json
```

Expected invariants:

- both arms use the same initial-state SHA-256;
- both arms consume exactly 1,600 loss-bearing examples;
- every loss and generated coordinate is finite;
- every sample summary contains eight mode counts and a nonnegative radius error;
- sampling uses 20 batched denoiser invocations over 128 samples, or 2,560 per-example denoiser evaluations per arm;
- the JSON contains `schema_version`, `provenance` (repository and runner revisions), resolved `execution` hardware, `config`, `pairs`, `invariants`, explicit `checkpoint_resume` status, `decision`, and `scope_boundary`.

Variable observations to record, not promises: first/final loss, which modes are occupied after the tiny budget, radius error, and runtime. Smoke mode establishes wiring only. Do not interpret its treatment direction or sample quality.

## 3. Run the full profile

First confirm at least 1 GB free device memory and enough persistent storage for the environment and output. Then run:

```bash
python external-executions/generative_diffusion_ablation.py \
  --profile full --device cuda \
  --repository-revision "$(git rev-parse HEAD)" \
  --output external-executions/runs/generative-diffusion-full.json
```

The full profile uses seeds 101, 202, and 303, 3,000 steps per arm, batch 512, 100 reverse diffusion timesteps, and 4,096 evaluation samples. That is 100 batched forward invocations and 100 × 4,096 = 409,600 per-example denoiser evaluations per arm for sampling, distinct from the 1,536,000 loss-bearing training examples per arm. It stops naturally after the fixed budget. Stop early for non-finite loss, mismatched initialization hashes/budgets, schema failure, repeated OOM, or two elapsed hours.

Expected invariants remain exact. Final loss, mode coverage, radius error, and which schedule performs better are variable. No reviewed GPU reference run is bundled, so there is deliberately no expected numeric quality band.

## 4. Troubleshoot without hiding changes

- CUDA unavailable: reselect a GPU runtime, restart, reinstall the pinned requirements, and re-record the environment.
- Out of memory: reduce batch size for both arms together in `PROFILES`, preserve equal loss-bearing-example budgets by adjusting steps, and record the modified configuration. Do not change only one arm.
- Non-finite loss: preserve the failed JSON/log, retry smoke on CPU, verify dependency pins, then reduce learning rate for both arms only as a separately named protocol revision.
- Different results across providers: expected floating-point and kernel variation may change trajectories. Verify invariants, preserve both artifacts, and do not average hardware-specific timing.
- Null or reversed treatment: keep it. The experiment promises a paired test, not a schedule winner.

## 5. Interpret and preserve

Analyze one row per seed. Confirm the dossier names the repository revision, runner hash, resolved accelerator, and honest checkpoint/resume status (`false` for this bounded runner). Compare paired control/treatment differences in mode coverage and radius error, preserve every failure, and state whether the evidence is resolved, mixed, or invalid under your predeclared decision rule. A valid conclusion remains limited to this synthetic 2D model, implementation, dependency lock, seeds, and budget.
