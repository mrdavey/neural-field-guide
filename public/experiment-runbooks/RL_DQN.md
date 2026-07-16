# Portable DQN target-network experiment

This optional extension belongs to `reproducible-rl-gpu`. Required course work is complete without an account or accelerator. It trains a small DQN in a five-state synthetic LineWorld and compares target-copy intervals 20 and 100 under paired initialization and matched environment-step budgets.

## 1. Record the environment

Use Python 3.11 in an isolated environment. In Colab, select a GPU first; the same commands work on compatible services and locally.

```bash
python -m pip install -r external-executions/requirements-rl.txt
python - <<'PY'
import platform, torch
print(platform.python_version(), torch.__version__, torch.version.cuda)
print(torch.cuda.is_available(), torch.cuda.get_device_name(0) if torch.cuda.is_available() else "no CUDA GPU")
PY
```

Record repository revision, provider image, Python, PyTorch, CUDA/driver, GPU model, and exact command.

## 2. Run the bounded smoke profile

```bash
python external-executions/rl_dqn_target_ablation.py \
  --profile smoke --device auto \
  --output external-executions/runs/rl-dqn-smoke.json
```

Expected invariants: both arms share the initialization hash, 200 environment steps, and 137 optimizer updates after the 64-transition replay warmup; interval 20 performs six target copies and interval 100 performs one. Q/output/loss values are finite, seed 11 appears, and JSON contains `schema_version`, `provenance`, resolved hardware in `execution`, `config`, `pairs`, `invariants`, `decision`, and `scope_boundary`. Success, final loss, return, Q magnitude, and runtime are variable. Smoke is not learning evidence.

## 3. Run the full paired profile

Continue only when smoke invariants pass and the budget is acceptable:

```bash
python external-executions/rl_dqn_target_ablation.py \
  --profile full --device cuda \
  --output external-executions/runs/rl-dqn-full.json
```

Full uses seeds 11/23/41/53/67, 20,000 environment steps per arm, and 100 frozen-policy evaluation episodes per seed. Preserve every row. There is no expected numeric performance band or promised target-interval winner.

## 4. Troubleshoot without hiding changes

- CUDA unavailable: restart an accelerator runtime, reinstall pins, and record CUDA availability plus GPU model.
- Out of memory: record any hidden-width, replay, or batch change as a new protocol and apply it equally.
- Non-finite loss or Q: preserve the failure, retry smoke on CPU, verify pins, and predeclare any new stabilization treatment.
- Provider interruption: keep the partial log; resume only if optimizer, replay, environment, schedules, counters, RNG state, and next-step equivalence are restored.

Stop after two hours, any non-finite value, mismatched pair hash/step/update budget, an arm with no target copy, missing seed row, repeated resource failure, or schema failure.

## 5. Interpret and preserve

Confirm the dossier records repository revision, runner/dependency hashes, accelerator, CUDA runtime, and driver. Classify hashes, budgets, target-copy counts, shapes, and schema as invariants; learned curves and outcomes as variable observations; and a numeric expectation as a reviewed reference only when its artifact, checksum, revisions, hardware, seeds, and raw rows are preserved. This synthetic study is not an Atari reproduction or universal DQN claim.
