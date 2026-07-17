# Portable DQN target-network experiment

This optional extension belongs to `reproducible-rl-gpu`. The required course is complete without an account or accelerator. The runner trains a small DQN in a five-state synthetic LineWorld and compares target-copy intervals 20 and 100 with paired initialization and matched environment-step budgets. It is not an Atari reproduction or a production control result.

## Record the environment

Use Python 3.11 in an isolated environment. Install `external-executions/requirements-rl.txt`. Record the repository revision, provider image, Python, PyTorch, CUDA/driver, GPU model, and the exact command. On Colab, select a GPU runtime before installation; the same CLI works on compatible services and locally.

## Run the bounded smoke profile

```bash
python external-executions/rl_dqn_target_ablation.py \
  --profile smoke --device auto \
  --output external-executions/runs/rl-dqn-smoke.json
```

Expected exact results: both arms share an initialization hash, 200 environment steps, and 137 optimizer updates after the 64-transition replay warmup; interval 20 performs six target copies and interval 100 performs one, so both treatment paths execute. Q/output/loss values are finite, seed 11 appears, and the JSON contains repository revision, runner/dependency hashes, resolved accelerator plus driver, and the documented schema fields. Success rate, final loss, return, Q magnitude, and runtime are variable observations. Smoke must not be called learning evidence.

## Run the full paired profile

Only continue after smoke invariants pass and the declared budget is acceptable:

```bash
python external-executions/rl_dqn_target_ablation.py \
  --profile full --device cuda \
  --output external-executions/runs/rl-dqn-full.json
```

Full uses seeds 11/23/41/53/67, 20,000 environment steps and 19,937 post-warmup optimizer updates per arm, and 100 frozen-policy evaluation episodes per seed. Preserve every arm and failure row. There is deliberately no expected numeric performance band or promised target-interval winner because no matching authentic reference run has been reviewed.

## Troubleshoot without hiding changes

- CUDA unavailable: select/restart an accelerator runtime, reinstall pins, and record `torch.cuda.is_available()` plus GPU model.
- Out of memory: both arms are already small; if you change hidden width or replay/batch configuration, record a new protocol and apply the same change to both arms.
- Non-finite loss or Q: preserve the failure dossier, rerun smoke on CPU, verify dependency pins, then change learning rate or clipping only as a new declared intervention.
- Provider interruption: preserve the partial log. Do not merge a resumed arm with an independently restarted partner unless all optimizer, replay, environment, schedule, counter, and RNG state are restored and next-step equivalence passes.

Stop after two hours, any non-finite value, mismatched paired hashes/steps/updates, an arm with no target copy, missing seed rows, repeated resource failure, or schema failure.

## Interpret and preserve

The output must contain `schema_version`, `provenance`, `execution`, `config`, `pairs`, `invariants`, `decision`, and `scope_boundary`. Verify `provenance.repository_revision`, runner/dependency hashes, accelerator, CUDA runtime, and driver before interpretation. Classify shapes/budgets/hashes/copy counts as invariants, learned curves and outcomes as variable observations, and any future numeric expectation as a reviewed reference only after its matching artifact, checksum, revisions, hardware, seeds, and raw rows are recorded.
