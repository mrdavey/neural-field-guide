# External execution runbook

This directory is the entry point for seven optional external execution families: four pinned LLM validations plus one accelerator-ready experiment for each of Generative Models, Reinforcement Learning & Control, and Embodied AI. Each runner writes a new JSON dossier under `external-executions/runs/`; it never silently overwrites preserved course artifacts.

These runs are optional. The course, its quizzes, and its capstones remain complete without them.

## What counts as evidence

An external result is evidence only when all of the following are true:

- the requested model/repository revision resolves exactly;
- the runner records library versions, command, configuration, and raw measurements;
- every required row is present and numeric;
- control and treatment budgets match where an ablation is involved;
- a failed hypothesis is preserved as a failed hypothesis rather than edited into a positive result;
- the scope boundary travels with the result.

Keep each experiment in its own Python 3.11 virtual environment. The tokenizer contract intentionally pins `tokenizers==0.23.1`; the GPT-2 model probe uses the compatible tokenizer version selected by its pinned Transformers installation.

From the course repository root, create the output directory once:

```bash
mkdir -p external-executions/runs
```

## Execution families

| Course | Experiment | Compute path | Expected result boundary | Detailed runbook |
| --- | --- | --- | --- | --- |
| LLM | Pinned GPT-2 and Qwen tokenizer contract | CPU; tokenizer downloads only | Ten schema-valid measured rows; token count is not a quality claim | Section 1 below |
| LLM | Pinned GPT-2 hidden-state identity probe | CPU by default; CUDA optional | Lookup identity and finite contextual cosines; no monotonic trend is promised | Section 2 below |
| LLM | Pinned OLMo token accounting | Upstream loader environment | Nominal, visible, and loss-bearing counts satisfy declared inequalities for recorded batches only | Section 3 below |
| LLM | Paired causal/FIM ablation | CUDA recommended; CPU supported | Matched token budgets and paired-seed gate; a null or negative result remains valid evidence | Section 4 below |
| Generative Models | Tiny diffusion schedule ablation | Colab, compatible GPU service, or local CPU/GPU | Hash, budget, finite-value, and schema invariants; loss, mode coverage, radius error, and runtime are variable | [`GENERATIVE_DIFFUSION.md`](GENERATIVE_DIFFUSION.md) |
| Reinforcement Learning & Control | DQN target-copy ablation | Colab, compatible GPU service, or local CPU/GPU | Paired initialization, exact step/update/copy counts, finite values, and schema; no winner or performance band is promised | [`RL_DQN.md`](RL_DQN.md) |
| Embodied AI | Action-chunk feedback ablation | Colab, compatible GPU service, or local CPU/GPU | Shared checkpoint and episode specifications, finite traces, exact budgets, and schema; success direction is variable | [`EMBODIED_POLICY.md`](EMBODIED_POLICY.md) |

The three dedicated accelerator runbooks provide install commands, bounded smoke and full profiles, minimum resource guidance, exact invariants, variable observations, stop criteria, troubleshooting, artifact inspection, and claim boundaries. Smoke profiles verify wiring and serialization only. They are not model-quality or policy-quality evidence. Use [`EXPERIMENT_TEMPLATE.md`](EXPERIMENT_TEMPLATE.md) when proposing another intervention so controls, treatment, budget, seeds, falsification criteria, and preservation requirements are explicit before execution.

## 1. Pinned GPT-2 and Qwen tokenizer contract

### Purpose

Produce ten measured rows: two tokenizers × five inputs. Every row contains the exact token IDs, token strings, offsets, decoded bytes, token count, and round-trip result.

Pins:

- `openai-community/gpt2@607a30d`
- `Qwen/Qwen3.5-4B@1eef1f4`
- `tokenizers==0.23.1`

This is CPU-only. It downloads tokenizer payloads, not model weights.

### Setup and run

```bash
python3.11 -m venv external-executions/.venv-tokenizers
source external-executions/.venv-tokenizers/bin/activate
python -m pip install --upgrade pip
python -m pip install -r external-executions/requirements-tokenizers.txt
python external-executions/tokenizer_contract.py \
  --output external-executions/runs/tokenizer-contract-measured.json
```

For a gated mirror, authenticate with `hf auth login` or pass `--token "$HF_TOKEN"`. Never put a token in a committed command or artifact.

### Verify the result

```bash
python - <<'PY'
import json
from pathlib import Path
p = Path("external-executions/runs/tokenizer-contract-measured.json")
d = json.loads(p.read_text())
assert d["execution"]["rows_observed"] == 10
assert len(d["results"]) == 10
assert all(isinstance(i, int) for row in d["results"] for i in row["token_ids"])
assert all(len(pair) == 2 for row in d["results"] for pair in row["offsets"])
print("PASS: ten measured tokenizer rows")
PY
```

Stop and investigate if a revision cannot be resolved, an offset list differs in length from its ID list, or an ID is missing. Fewer tokens alone is not evidence that the paired model is better.

## 2. Pinned GPT-2 hidden-state identity probe

### Purpose

Load the actual 124M-parameter GPT-2 checkpoint and compare the same ` bank` embedding row with its contextual representations in a river sentence and a finance sentence.

The runner:

- resolves `openai-community/gpt2@607a30d`;
- hashes every downloaded config, tokenizer, and weight file;
- sets `pad_token = eos_token` and passes the attention mask;
- locates the final exact ` bank` token in both sentences;
- measures full 768-dimensional cosine at hidden-state indices 1, 6, and 12.

CPU is sufficient; allow roughly 1–2 GB of free RAM and space for the checkpoint cache.

### Setup and run

```bash
python3.11 -m venv external-executions/.venv-gpt2
source external-executions/.venv-gpt2/bin/activate
python -m pip install --upgrade pip
python -m pip install -r external-executions/requirements-gpt2.txt
python external-executions/embedding_identity.py \
  --model openai-community/gpt2 \
  --revision 607a30d \
  --device cpu \
  --output external-executions/runs/embedding-hidden-state-measured.json
```

Use `--device cuda` only when the installed PyTorch build supports that CUDA runtime. CPU is the least ambiguous reproduction path.

### Verify the result

```bash
python - <<'PY'
import json, math
from pathlib import Path
d = json.loads(Path("external-executions/runs/embedding-hidden-state-measured.json").read_text())
m = d["measurement"]
assert math.isclose(m["lookup_cosine"], 1.0, rel_tol=0, abs_tol=1e-6)
assert len(m["positions"]) == 2
assert [r["hidden_state_index"] for r in m["contextual_cosines"]] == [1, 6, 12]
assert all(math.isfinite(r["cosine"]) for r in m["contextual_cosines"])
assert d["model_files"]["sha256"]
print("PASS: lookup invariant and three measured contextual cosines")
PY
```

Do not require the contextual cosines to decrease monotonically. That behavior is empirical for this prompt pair, not an architectural law.

## 3. Token accounting through the pinned OLMo loader

### Purpose

Measure three different quantities from real batches produced by `allenai/OLMo-core@v2.4.0`:

- `nominal`: every configured tensor slot;
- `visible`: positions allowed by `attention_mask`, or all nominal positions when the loader supplies no attention mask;
- `loss_tokens`: labels remaining after OLMo applies `label_mask`, `attention_mask`, and `instance_mask`, shifts labels left, and pads with `-100`.

The included loader-only probe uses OLMo's real `NumpyPaddedFSLDatasetConfig`, `NumpyDataLoaderConfig`, and `get_labels()` with a small local fixture. It exercises an ordinary batch, masking, padding, two ranks, and distributed reduction without downloading a 7B model or the Dolma corpus. This is an authentic loader measurement, not an OLMo 3 training reproduction.

### Install the exact OLMo revision

Clone beside this repository:

```bash
git clone https://github.com/allenai/OLMo-core.git ../OLMo-core-v2.4.0
cd ../OLMo-core-v2.4.0
git checkout v2.4.0
test "$(git rev-parse --short HEAD)" = "1ed8900"
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
```

Install PyTorch using the command appropriate for the machine, then install the pinned checkout as the upstream project documents:

```bash
python -m pip install -e '.[all]'
cd ../'LLMs from scratch'
```

If the repositories are not siblings, replace the final `cd` with the absolute course path.

### Run the two-rank loader probe

With the OLMo virtual environment still active:

```bash
python -m torch.distributed.run --standalone --nproc-per-node=2 \
  external-executions/olmo_loader_probe.py \
  --work-dir external-executions/runs/olmo-loader-work \
  --output-dir external-executions/runs/olmo-loader-logs \
  --steps 2
```

Preserve the exact invocation while merging the rank logs:

```bash
python external-executions/olmo_token_accounting.py \
  --merge external-executions/runs/olmo-loader-logs \
  --expected-world-size 2 \
  --revision v2.4.0 \
  --command "python -m torch.distributed.run --standalone --nproc-per-node=2 external-executions/olmo_loader_probe.py --steps 2" \
  --output external-executions/runs/pretraining-token-accounting-measured.json
```

The merger fails if a rank is absent, an all-reduced row differs from the sum of rank rows, or `loss_tokens ≤ visible ≤ nominal` is violated.

### Instrument an existing OLMo training run instead

The exact v2.4.0 hook belongs in:

`src/olmo_core/train/train_module/transformer/train_module.py`

Copy `olmo_token_accounting.py` into the root of the pinned OLMo checkout as `token_accounting_probe.py`. Add this import:

```python
from token_accounting_probe import record_batch
```

Inside `TransformerTrainModule.train_batch`, place the call immediately after the existing label construction:

```python
if "labels" not in batch:
    batch["labels"] = get_labels(batch, label_ignore_index=self.label_ignore_index)

record_batch(
    step=self.trainer.global_step,
    batch=batch,
    output_dir=os.environ["TOKEN_ACCOUNTING_DIR"],
    label_ignore_index=self.label_ignore_index,
    max_steps=int(os.environ.get("TOKEN_ACCOUNTING_STEPS", "2")),
)
```

Also add `import os`, set `TOKEN_ACCOUNTING_DIR` to a shared output directory, and run the exact official script/config already used by the training job. The helper chooses a CUDA reduction tensor under NCCL even when batches are still on CPU. It records only the requested first steps to limit synchronization overhead.

Preserve the unmodified upstream commit, the patch diff, every CLI override, data manifest/fingerprint, world size, and rank logs. A two-step audit supports only those batches; it does not justify a whole-run token claim unless the same counter is accumulated for the whole run.

## 4. Paired causal/FIM model ablation

### Purpose

Train two genuinely different language-model arms from identical initial weights:

- control: ordinary `prefix + middle + suffix` serialization;
- treatment: a deterministic 50% mix using `<fim_prefix> prefix <fim_suffix> suffix <fim_middle> middle`.

Both arms use the pinned `bigcode/starcoder2-3b@733247c` tokenizer contract, the same synthetic code records, seeds, optimizer, architecture, block order, and exact loss-token budget. The runner trains a course-scale model from scratch; it does not claim to train or reproduce the released 3B StarCoder2 checkpoint.

The default evidence run uses three paired seeds and 120,000 loss-bearing tokens per arm. A CUDA GPU with 8 GB or more is comfortable; CPU works but may be slow.

### Setup

```bash
python3.11 -m venv external-executions/.venv-fim
source external-executions/.venv-fim/bin/activate
python -m pip install --upgrade pip
python -m pip install -r external-executions/requirements-fim.txt
```

First run the wiring-only smoke test:

```bash
python external-executions/fim_causal_ablation.py \
  --smoke \
  --device cpu \
  --output external-executions/runs/fim-causal-smoke.json
```

The smoke result is never evidence. Run the full paired experiment on the intended device:

```bash
python external-executions/fim_causal_ablation.py \
  --device cuda \
  --loss-token-budget 120000 \
  --block-size 241 \
  --batch-size 8 \
  --seeds 17 23 41 \
  --eval-examples 40 \
  --output external-executions/runs/fim-causal-ablation-measured.json
```

If CUDA is unavailable, use `--device cpu`. If memory is tight, reduce `--batch-size` for both arms; do not change only one arm. Keep the full configuration in the resulting dossier.

### Interpret the gate

The predeclared treatment gate is:

1. at least three paired seeds;
2. exactly equal loss-token budgets;
3. the paired bootstrap 95% interval for infilling improvement excludes zero;
4. ordinary completion delta is at least `-0.02`.

The runner records `evidence_gate_passed`. If it is false, the correct conclusion is that this experiment did not establish the benefit. Preserve that result; do not replace it with the course's simulated positive fixture.

## Preserve and promote evidence

After any run:

```bash
python -m pip freeze > external-executions/runs/environment-freeze.txt
shasum -a 256 external-executions/runs/*.json > external-executions/runs/SHA256SUMS
```

Before placing a measured dossier under `public/validation-artifacts/`:

1. read every raw row and confirm the requested revision and command;
2. retain the original measured file unchanged;
3. update the learner-facing evidence tier from simulated/contract to measured only where justified;
4. keep negative and null results;
5. update `scripts/verify-learning-artifacts.mjs` to validate the measured schema and its honest decision, rather than forcing a positive outcome;
6. run `npm test` and inspect the affected lesson in the browser.

Never paste numbers manually into an artifact. Promote the runner output or a mechanically derived dossier with its provenance intact.

## Upstream references

- [Hugging Face Tokenizers API](https://huggingface.co/docs/tokenizers/api/tokenizer)
- [Transformers tokenizer API](https://huggingface.co/docs/transformers/main_classes/tokenizer)
- [OLMo-core v2.4.0 release](https://github.com/allenai/OLMo-core/releases/tag/v2.4.0)
- [OLMo-core official OLMo 3 scripts](https://github.com/allenai/OLMo-core/tree/v2.4.0/src/scripts/official/OLMo3)
- [StarCoder2-3B model card](https://huggingface.co/bigcode/starcoder2-3b)
- [StarCoder2 tokenizer contract](https://huggingface.co/bigcode/starcoder2-3b/blob/733247c/tokenizer_config.json)
