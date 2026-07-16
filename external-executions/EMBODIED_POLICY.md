# Portable action-chunk feedback experiment

This optional exercise runs the same command in Google Colab, another compatible GPU service, or a local Python environment. The required course is complete without it. It trains one small policy to predict four future one-dimensional actions, then evaluates that exact checkpoint on identical disturbed episodes while changing only whether the controller replans after one action or executes all four before observing feedback again.

## 1. Record the environment

Use Python 3.11. In Colab, select a GPU runtime, clone or upload this repository, change into the repository root, and run:

```bash
python -m pip install -r external-executions/requirements-embodied.txt
python - <<'PY'
import platform, torch
print(platform.python_version(), torch.__version__, torch.version.cuda)
print(torch.cuda.is_available(), torch.cuda.get_device_name(0) if torch.cuda.is_available() else "no CUDA GPU")
PY
```

Record the provider, image, GPU, driver/CUDA, package versions, repository revision, and any fallback. The policy input is `[position, target]`; its output is four bounded delta-position requests. The evaluator injects the declared disturbance after action opportunity 2.

## 2. Run the bounded smoke profile

```bash
python external-executions/embodied_action_chunk_ablation.py \
  --profile smoke --device auto \
  --output external-executions/runs/embodied-action-chunk-smoke.json
```

Expected invariants:

- both evaluation arms use the same trained-checkpoint SHA-256;
- both arms receive the same 12 episode specifications, starts, targets, disturbances, and 24 action opportunities;
- every loss, requested/applied action, position, and final error is finite;
- each episode records requested and applied actions, policy calls, clipping, disturbance, final error, and success;
- the JSON contains `schema_version`, `execution`, `config`, `pairs`, `invariants`, `decision`, and `scope_boundary`.

Variable observations to record, not promises: first/final training loss, success, final error, clipping, policy calls, and runtime. Smoke mode proves wiring and serialization only. It does not establish whether either feedback prefix is better.

## 3. Run the full profile

First confirm at least 1 GB free device memory and persistent storage for the environment and JSON. Then run:

```bash
python external-executions/embodied_action_chunk_ablation.py \
  --profile full --device cuda \
  --output external-executions/runs/embodied-action-chunk-full.json
```

The full profile uses seeds 13, 29, 47, 61, and 83; 3,000 updates; batch 512; and 200 paired evaluation episodes per seed. Each episode has 24 action opportunities. Prefix 1 makes 24 policy calls; prefix 4 normally makes 6. Stop after two hours, any non-finite value, a checkpoint/spec/budget mismatch, repeated OOM, missing row, or schema failure.

Expected invariants remain exact. Learned error, success, clipping, runtime, and the direction or consistency of the prefix effect are variable. No reviewed GPU reference run is bundled, so there is deliberately no expected numeric performance band.

## 4. Troubleshoot without hiding changes

- CUDA unavailable: reselect and restart a GPU runtime, reinstall the pinned requirements, and re-record the environment.
- Out of memory: reduce the batch for the single shared training run, adjust updates if preserving examples is part of your revised protocol, and label the result as a new configuration.
- Non-finite loss: retain the error log, retry smoke on CPU, verify dependency pins, and treat any learning-rate change as a new protocol revision.
- Checkpoint hashes or episode specifications differ: discard the comparison; evaluate both prefixes from one restored checkpoint and one immutable episode table.
- Null, mixed, or reversed treatment: keep it. Inspect paired episode traces and disturbances instead of selecting favorable seeds.

## 5. Interpret and preserve

Analyze one paired row per seed and retain all episode rows. Apply interface and finite-value gates first; then compare paired final error, success, clipping, and the intentional policy-call trade-off. State whether feedback delay has a resolved, mixed, null, or invalid effect for this exact system. This synthetic study cannot establish vision, language grounding, contact dynamics, hardware safety, or universal action-chunk superiority.
