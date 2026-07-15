#!/usr/bin/env python3
"""Instrument pinned OLMo batches and merge rank logs into an evidence dossier."""

from __future__ import annotations

import argparse
import json
import platform
from collections import defaultdict
from pathlib import Path
from typing import Any

import torch
import torch.distributed as dist


def append_jsonl(path: Path, row: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as stream:
        stream.write(json.dumps(row, sort_keys=True) + "\n")


def record_batch(
    *,
    step: int,
    batch: dict[str, Any],
    output_dir: str | Path,
    label_ignore_index: int = -100,
    max_steps: int = 2,
) -> None:
    """Record local and all-reduced counts after OLMo has constructed `batch['labels']`."""
    if int(step) >= max_steps:
        return
    if "input_ids" not in batch or "labels" not in batch:
        raise KeyError("record_batch must run after OLMo get_labels() has populated input_ids and labels")

    input_ids = batch["input_ids"]
    labels = batch["labels"]
    if input_ids.shape != labels.shape:
        raise ValueError(f"input_ids {tuple(input_ids.shape)} and labels {tuple(labels.shape)} must have identical shape")
    nominal = int(input_ids.numel())
    attention_mask = batch.get("attention_mask")
    visible = nominal if attention_mask is None else int((attention_mask != 0).sum().item())
    loss_tokens = int((labels != label_ignore_index).sum().item())
    if not (0 <= loss_tokens <= visible <= nominal):
        raise ValueError(f"Expected loss_tokens <= visible <= nominal, observed {loss_tokens} <= {visible} <= {nominal}")

    rank = dist.get_rank() if dist.is_available() and dist.is_initialized() else 0
    world_size = dist.get_world_size() if dist.is_available() and dist.is_initialized() else 1
    reduce_device = input_ids.device
    if world_size > 1 and dist.get_backend() == "nccl" and reduce_device.type != "cuda":
        reduce_device = torch.device("cuda", torch.cuda.current_device())
    local = torch.tensor([nominal, visible, loss_tokens], dtype=torch.int64, device=reduce_device)
    reduced = local.clone()
    if world_size > 1:
        dist.all_reduce(reduced, op=dist.ReduceOp.SUM)

    output_dir = Path(output_dir)
    append_jsonl(output_dir / f"rank-{rank:05d}.jsonl", {
        "step": int(step),
        "rank": rank,
        "world_size": world_size,
        "shape": list(input_ids.shape),
        "nominal": nominal,
        "visible": visible,
        "loss_tokens": loss_tokens,
    })
    if rank == 0:
        append_jsonl(output_dir / "reduced.jsonl", {
            "step": int(step),
            "world_size": world_size,
            "nominal": int(reduced[0].item()),
            "visible": int(reduced[1].item()),
            "loss_tokens": int(reduced[2].item()),
            "utilization": int(reduced[2].item()) / int(reduced[0].item()),
        })


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def merge_logs(input_dir: Path, output: Path, revision: str, command: str, expected_world_size: int | None) -> None:
    rank_files = sorted(input_dir.glob("rank-*.jsonl"))
    if not rank_files or not (input_dir / "reduced.jsonl").exists():
        raise FileNotFoundError("Expected rank-*.jsonl and reduced.jsonl files from an instrumented OLMo run")
    raw_rows = [row for path in rank_files for row in read_jsonl(path)]
    reduced_rows = read_jsonl(input_dir / "reduced.jsonl")
    if expected_world_size is not None and len(rank_files) != expected_world_size:
        raise ValueError(f"Expected {expected_world_size} rank logs, found {len(rank_files)}")

    by_step: dict[int, list[dict[str, Any]]] = defaultdict(list)
    for row in raw_rows:
        by_step[int(row["step"])].append(row)
        if not (row["loss_tokens"] <= row["visible"] <= row["nominal"]):
            raise ValueError(f"Invalid local inequality in {row}")
    reduced_by_step = {int(row["step"]): row for row in reduced_rows}
    for step, rows in by_step.items():
        if step not in reduced_by_step:
            raise ValueError(f"Missing reduced row for step {step}")
        expected = {key: sum(int(row[key]) for row in rows) for key in ("nominal", "visible", "loss_tokens")}
        observed = {key: int(reduced_by_step[step][key]) for key in expected}
        if observed != expected:
            raise ValueError(f"Reduced mismatch at step {step}: expected {expected}, observed {observed}")

    totals = {key: sum(int(row[key]) for row in reduced_rows) for key in ("nominal", "visible", "loss_tokens")}
    artifact = {
        "schema_version": "1.0",
        "artifact": "pretraining-token-accounting-measured",
        "evidence_tier": "executed pinned OLMo loader probe",
        "pins": {"reference_loader": f"allenai/OLMo-core@{revision}"},
        "environment": {"python": platform.python_version(), "torch": torch.__version__},
        "command": command,
        "raw_rank_rows": sorted(raw_rows, key=lambda row: (row["step"], row["rank"])),
        "distributed_reconciliation": sorted(reduced_rows, key=lambda row: row["step"]),
        "run_total": {
            "configured_nominal": totals["nominal"],
            "sum_visible": totals["visible"],
            "sum_loss_tokens": totals["loss_tokens"],
            "reconciled": True,
        },
        "interpretation": "Loss-bearing tokens are counted from OLMo's shifted, masked labels after get_labels(); distributed totals are sums of every preserved rank row.",
        "scope_boundary": "These measurements support only the pinned loader, data/config, and captured steps. They do not substitute configured capacity for measured labels or claim a full OLMo 3 training reproduction.",
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(artifact, indent=2) + "\n", encoding="utf-8")
    print(f"Merged {len(raw_rows)} rank rows and {len(reduced_rows)} reduced rows into {output}")


def demo(output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    for old in output_dir.glob("*.jsonl"):
        old.unlink()
    batches = [
        {
            "input_ids": torch.arange(16).reshape(2, 8),
            "attention_mask": torch.ones((2, 8), dtype=torch.long),
            "labels": torch.cat([torch.arange(14), torch.tensor([-100, -100])]).reshape(2, 8),
        },
        {
            "input_ids": torch.arange(16).reshape(2, 8),
            "attention_mask": torch.tensor([[1] * 8, [1] * 3 + [0] * 5]),
            "labels": torch.tensor([[1] * 8, [1, 1] + [-100] * 6]),
        },
    ]
    for step, batch in enumerate(batches):
        record_batch(step=step, batch=batch, output_dir=output_dir)
    print(f"Wrote deterministic smoke-test logs to {output_dir}; these are not OLMo measurements")


def main() -> None:
    parser = argparse.ArgumentParser()
    action = parser.add_mutually_exclusive_group(required=True)
    action.add_argument("--demo", action="store_true")
    action.add_argument("--merge", type=Path, metavar="INPUT_DIR")
    parser.add_argument("--output-dir", type=Path, default=Path("external-executions/runs/olmo-demo"))
    parser.add_argument("--output", type=Path, default=Path("external-executions/runs/pretraining-token-accounting-measured.json"))
    parser.add_argument("--revision", default="v2.4.0")
    parser.add_argument("--command", default="RECORD THE EXACT TORCHRUN COMMAND HERE")
    parser.add_argument("--expected-world-size", type=int)
    args = parser.parse_args()
    if args.demo:
        demo(args.output_dir)
    else:
        merge_logs(args.merge, args.output, args.revision, args.command, args.expected_world_size)


if __name__ == "__main__":
    main()
