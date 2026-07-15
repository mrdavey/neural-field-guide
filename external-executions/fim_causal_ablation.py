#!/usr/bin/env python3
"""Train matched tiny causal and 50%-FIM models with a real equal-token budget."""

from __future__ import annotations

import argparse
import json
import math
import platform
import random
from dataclasses import dataclass
from importlib.metadata import version
from pathlib import Path
from statistics import mean
from typing import Iterable

import torch
import torch.nn as nn
import torch.nn.functional as F
from tokenizers import Tokenizer
from torch.utils.data import DataLoader, TensorDataset


MODEL_ID = "bigcode/starcoder2-3b"
REVISION = "733247c"
FIM_PREFIX = "<fim_prefix>"
FIM_SUFFIX = "<fim_suffix>"
FIM_MIDDLE = "<fim_middle>"


@dataclass(frozen=True)
class Record:
    record_id: str
    prefix: str
    middle: str
    suffix: str


class TinyCausalLM(nn.Module):
    def __init__(self, vocab_size: int, block_size: int, d_model: int, heads: int, layers: int, dropout: float = 0.1):
        super().__init__()
        self.block_size = block_size
        self.token_embedding = nn.Embedding(vocab_size, d_model)
        self.position_embedding = nn.Embedding(block_size, d_model)
        layer = nn.TransformerEncoderLayer(d_model, heads, d_model * 4, dropout=dropout, batch_first=True, norm_first=True, activation="gelu")
        self.blocks = nn.TransformerEncoder(layer, layers)
        self.norm = nn.LayerNorm(d_model)
        self.head = nn.Linear(d_model, vocab_size, bias=False)
        self.head.weight = self.token_embedding.weight

    def forward(self, token_ids: torch.Tensor) -> torch.Tensor:
        length = token_ids.shape[1]
        if length > self.block_size:
            raise ValueError(f"Sequence length {length} exceeds block size {self.block_size}")
        positions = torch.arange(length, device=token_ids.device)
        hidden = self.token_embedding(token_ids) + self.position_embedding(positions)
        causal_mask = torch.triu(torch.full((length, length), float("-inf"), device=token_ids.device), diagonal=1)
        return self.head(self.norm(self.blocks(hidden, mask=causal_mask)))


def make_records(start: int, count: int) -> list[Record]:
    records = []
    for index in range(start, start + count):
        multiplier = index % 7 + 2
        bias = index % 11
        modulus = index % 13 + 17
        records.append(Record(
            record_id=f"fn-{index:04d}",
            prefix=f"def transform_{index}(x):\n",
            middle=f"    scaled = x * {multiplier} + {bias}\n    return scaled % {modulus}\n",
            suffix=f"\nassert transform_{index}({index % 9}) >= 0\n",
        ))
    return records


def serialize(record: Record, fim: bool) -> str:
    if fim:
        return f"{FIM_PREFIX}{record.prefix}{FIM_SUFFIX}{record.suffix}{FIM_MIDDLE}{record.middle}"
    return f"{record.prefix}{record.middle}{record.suffix}"


def encode(tokenizer: Tokenizer, text: str) -> list[int]:
    return tokenizer.encode(text, add_special_tokens=False).ids


def build_blocks(tokenizer: Tokenizer, records: list[Record], arm: str, loss_budget: int, block_size: int) -> tuple[torch.Tensor, dict]:
    losses_per_block = block_size - 1
    if loss_budget % losses_per_block:
        raise ValueError(f"loss-token budget must be divisible by block_size - 1 ({losses_per_block})")
    block_count = loss_budget // losses_per_block
    required_tokens = block_count * block_size
    eos_id = tokenizer.token_to_id("<|endoftext|>")
    if eos_id is None:
        raise RuntimeError("Pinned tokenizer has no <|endoftext|> token")
    stream: list[int] = []
    records_used = 0
    fim_records = 0
    while len(stream) < required_tokens:
        record = records[records_used % len(records)]
        is_fim = arm == "50%-fim" and records_used % 2 == 0
        stream.extend(encode(tokenizer, serialize(record, is_fim)))
        stream.append(eos_id)
        records_used += 1
        fim_records += int(is_fim)
    stream = stream[:required_tokens]
    blocks = torch.tensor(stream, dtype=torch.long).reshape(block_count, block_size)
    return blocks, {
        "records_serialized": records_used,
        "fim_records": fim_records,
        "realized_fim_fraction": fim_records / records_used,
        "blocks": block_count,
        "block_size": block_size,
        "loss_tokens": block_count * losses_per_block,
    }


def choose_device(requested: str) -> torch.device:
    if requested != "auto":
        return torch.device(requested)
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")


def train_arm(tokenizer: Tokenizer, records: list[Record], arm: str, seed: int, args: argparse.Namespace, device: torch.device) -> tuple[TinyCausalLM, dict]:
    torch.manual_seed(seed)
    blocks, manifest = build_blocks(tokenizer, records, arm, args.loss_token_budget, args.block_size)
    model = TinyCausalLM(tokenizer.get_vocab_size(), args.block_size, args.d_model, args.heads, args.layers).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.learning_rate, weight_decay=0.1)
    generator = torch.Generator().manual_seed(seed)
    loader = DataLoader(TensorDataset(blocks), batch_size=args.batch_size, shuffle=True, generator=generator)
    model.train()
    losses = []
    trained_tokens = 0
    for (batch,) in loader:
        batch = batch.to(device)
        logits = model(batch)
        loss = F.cross_entropy(logits[:, :-1].reshape(-1, logits.shape[-1]), batch[:, 1:].reshape(-1))
        optimizer.zero_grad(set_to_none=True)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        losses.append(float(loss.item()))
        trained_tokens += batch.shape[0] * (batch.shape[1] - 1)
    if trained_tokens != args.loss_token_budget:
        raise RuntimeError(f"Token reconciliation failed: trained {trained_tokens}, expected {args.loss_token_budget}")
    return model, {**manifest, "optimizer_steps": len(losses), "loss_start": losses[0], "loss_end": losses[-1]}


@torch.inference_mode()
def greedy_tokens(model: TinyCausalLM, prompt: list[int], target_length: int, device: torch.device) -> list[int]:
    generated = list(prompt)
    model.eval()
    for _ in range(target_length):
        context = torch.tensor([generated[-model.block_size:]], dtype=torch.long, device=device)
        next_id = int(model(context)[0, -1].argmax().item())
        generated.append(next_id)
    return generated[len(prompt):]


def evaluate(model: TinyCausalLM, tokenizer: Tokenizer, records: Iterable[Record], device: torch.device) -> dict:
    infill_correct = 0
    completion_correct = 0
    count = 0
    for record in records:
        infill_prompt = encode(tokenizer, f"{FIM_PREFIX}{record.prefix}{FIM_SUFFIX}{record.suffix}{FIM_MIDDLE}")
        infill_target = encode(tokenizer, record.middle)
        completion_prompt = encode(tokenizer, record.prefix)
        completion_target = encode(tokenizer, record.middle + record.suffix)
        infill_correct += int(greedy_tokens(model, infill_prompt, len(infill_target), device) == infill_target)
        completion_correct += int(greedy_tokens(model, completion_prompt, len(completion_target), device) == completion_target)
        count += 1
    return {
        "examples": count,
        "infilling_exact_match": infill_correct / count,
        "completion_pass_at_1": completion_correct / count,
    }


def percentile(values: list[float], probability: float) -> float:
    values = sorted(values)
    index = min(len(values) - 1, max(0, math.floor(probability * (len(values) - 1))))
    return values[index]


def paired_bootstrap(deltas: list[float], samples: int = 5000) -> list[float]:
    rng = random.Random(1729)
    estimates = [mean(rng.choice(deltas) for _ in deltas) for _ in range(samples)]
    return [percentile(estimates, 0.025), percentile(estimates, 0.975)]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path("external-executions/runs/fim-causal-ablation-measured.json"))
    parser.add_argument("--device", default="auto")
    parser.add_argument("--loss-token-budget", type=int, default=120_000)
    parser.add_argument("--block-size", type=int, default=241)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument("--learning-rate", type=float, default=3e-4)
    parser.add_argument("--seeds", type=int, nargs="+", default=[17, 23, 41])
    parser.add_argument("--eval-examples", type=int, default=40)
    parser.add_argument("--d-model", type=int, default=192)
    parser.add_argument("--heads", type=int, default=4)
    parser.add_argument("--layers", type=int, default=4)
    parser.add_argument("--smoke", action="store_true", help="Run a quick wiring check; its metrics are not evidence.")
    args = parser.parse_args()
    if args.smoke:
        args.loss_token_budget, args.seeds, args.eval_examples, args.d_model, args.layers = 2_400, [17], 4, 96, 2

    device = choose_device(args.device)
    tokenizer = Tokenizer.from_pretrained(MODEL_ID, revision=REVISION)
    for token in (FIM_PREFIX, FIM_SUFFIX, FIM_MIDDLE):
        if tokenizer.token_to_id(token) is None:
            raise RuntimeError(f"Pinned tokenizer is missing {token}")
    train_records = make_records(0, 2_000)
    eval_records = make_records(10_000, args.eval_examples)
    rows = []
    manifests = {}
    for seed in args.seeds:
        for arm in ("causal-only", "50%-fim"):
            print(f"training seed={seed} arm={arm} on {device}", flush=True)
            model, manifest = train_arm(tokenizer, train_records, arm, seed, args, device)
            metrics = evaluate(model, tokenizer, eval_records, device)
            rows.append({"seed": seed, "arm": arm, **metrics, "loss_start": manifest["loss_start"], "loss_end": manifest["loss_end"]})
            manifests[f"{seed}:{arm}"] = manifest
            del model
            if device.type == "cuda":
                torch.cuda.empty_cache()

    paired_infill = []
    paired_completion = []
    for seed in args.seeds:
        control = next(row for row in rows if row["seed"] == seed and row["arm"] == "causal-only")
        treatment = next(row for row in rows if row["seed"] == seed and row["arm"] == "50%-fim")
        paired_infill.append(treatment["infilling_exact_match"] - control["infilling_exact_match"])
        paired_completion.append(treatment["completion_pass_at_1"] - control["completion_pass_at_1"])
    infill_delta = mean(paired_infill)
    completion_delta = mean(paired_completion)
    infill_ci = paired_bootstrap(paired_infill) if len(paired_infill) > 1 else [paired_infill[0], paired_infill[0]]
    gate = -0.02
    passed = len(args.seeds) >= 3 and infill_ci[0] > 0 and completion_delta >= gate and not args.smoke

    artifact = {
        "schema_version": "1.0",
        "artifact": "fim-causal-ablation-measured",
        "evidence_tier": "wiring smoke test" if args.smoke else "executed paired small-model ablation",
        "pins": {"token_contract": f"{MODEL_ID}@{REVISION}", "seeds": args.seeds, "declared_fim_fraction": 0.5, "loss_token_budget_per_arm": args.loss_token_budget},
        "environment": {"python": platform.python_version(), "torch": torch.__version__, "tokenizers": version("tokenizers"), "device": str(device)},
        "model": {"class": "course TinyCausalLM", "vocab_size": tokenizer.get_vocab_size(), "block_size": args.block_size, "d_model": args.d_model, "heads": args.heads, "layers": args.layers},
        "serialization_contract": {"causal": "prefix + middle + suffix", "fim": "<fim_prefix> prefix <fim_suffix> suffix <fim_middle> middle"},
        "manifests": manifests,
        "paired_metrics": rows,
        "uncertainty": {"paired_infilling_deltas": paired_infill, "infilling_delta": infill_delta, "bootstrap_95_ci": infill_ci, "paired_completion_deltas": paired_completion, "completion_delta": completion_delta, "completion_regression_gate": gate},
        "decision": "Treatment passes the predeclared gate." if passed else "Treatment does not pass the predeclared evidence gate; preserve the result and do not claim improvement.",
        "evidence_gate_passed": passed,
        "scope_boundary": "This is an actual paired course-scale small-model ablation using StarCoder2's pinned token contract. It is not a StarCoder2 checkpoint training run or a claim about the released 3B model.",
        "configuration": {key: value for key, value in vars(args).items() if key != "output"},
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(artifact, indent=2, default=str) + "\n", encoding="utf-8")
    print(json.dumps({"infill_delta": infill_delta, "infill_ci": infill_ci, "completion_delta": completion_delta, "passed": passed}, indent=2))
    print(f"Wrote measured ablation to {args.output}")


if __name__ == "__main__":
    main()
