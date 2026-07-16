# Portable tiny-diffusion experiment

This optional exercise runs unchanged in Google Colab, a compatible GPU service, or a local Python environment. Required course work does not require an account or GPU. It trains paired tiny 2D denoisers on the same synthetic ring data and initialization, changing only the linear versus cosine corruption schedule.

## 1. Record the environment

Use Python 3.11, select a GPU runtime when available, clone or upload the repository, change into its root, and run:

```bash
python -m pip install -r external-executions/requirements-generative.txt
python - <<'PY'
import platform, torch
print(platform.python_version(), torch.__version__, torch.version.cuda)
print(torch.cuda.is_available(), torch.cuda.get_device_name(0) if torch.cuda.is_available() else "no CUDA GPU")
PY
```

Record provider, image, GPU, driver/CUDA, package versions, repository revision, and every fallback.

## 2. Run the bounded smoke profile

```bash
python external-executions/generative_diffusion_ablation.py \
  --profile smoke --device auto \
  --repository-revision "$(git rev-parse HEAD)" \
  --output external-executions/runs/generative-diffusion-smoke.json
```

Expected invariants:

- both arms use the same initial-state SHA-256 and exactly 1,600 loss-bearing examples;
- every loss and generated coordinate is finite;
- every summary has eight mode counts and a nonnegative radius error;
- sampling uses 20 batched denoiser invocations over 128 samples, or 2,560 per-example denoiser evaluations per arm;
- JSON contains `schema_version`, `provenance` (repository and runner revisions), resolved `execution` hardware, `config`, `pairs`, `invariants`, explicit `checkpoint_resume` status, `decision`, and `scope_boundary`.

First/final loss, occupied modes, radius error, and runtime are variable observations—not expected results. Smoke proves wiring only.

## 3. Run the full profile

After smoke invariants pass, confirm at least 1 GB free device memory and persistent output storage:

```bash
python external-executions/generative_diffusion_ablation.py \
  --profile full --device cuda \
  --repository-revision "$(git rev-parse HEAD)" \
  --output external-executions/runs/generative-diffusion-full.json
```

Full uses seeds 101/202/303, 3,000 training steps per arm, batch 512, 100 reverse timesteps, and 4,096 evaluation samples: 100 batched forward invocations and 409,600 per-example denoiser evaluations per arm for sampling, plus 1,536,000 loss-bearing training examples per arm. Stop after two hours, any non-finite value, unequal hash/budget, repeated OOM, missing row, or schema failure.

There is deliberately no expected numeric quality band or promised schedule winner.

## 4. Troubleshoot without hiding changes

- CUDA unavailable: restart a GPU runtime, reinstall pins, and re-record the environment.
- Out of memory: reduce batch for both arms, preserve equal loss-bearing-example budgets, and record a new protocol revision.
- Non-finite loss: preserve the failure log, retry smoke on CPU, verify pins, and declare any shared learning-rate change.
- Provider differences: preserve both artifacts; do not compare timing without matched hardware.
- Null or reversed treatment: keep it. Verify invariants and report the observed paired evidence.

## 5. Interpret and preserve

Retain one paired row per seed plus all raw fields. Confirm the dossier names the repository revision, runner hash, resolved accelerator, and honest checkpoint/resume status (`false` for this bounded runner). Compare mode coverage and radius error only after invariants pass. State whether the evidence is resolved, mixed, null, or invalid for this exact synthetic model, implementation, dependencies, seeds, and budget. It cannot establish image quality or universal schedule superiority.
