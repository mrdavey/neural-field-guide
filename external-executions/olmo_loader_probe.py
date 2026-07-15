#!/usr/bin/env python3
"""Drive a masked partial-batch fixture through the pinned OLMo v2.4.0 loader."""

from __future__ import annotations

import argparse
import os
from pathlib import Path

import numpy as np
import torch.distributed as dist

from olmo_core.data import NumpyDataLoaderConfig, NumpyPaddedFSLDatasetConfig, TokenizerConfig
from olmo_core.data.utils import get_labels

from olmo_token_accounting import record_batch


def distributed_context() -> tuple[int, int]:
    world_size = int(os.environ.get("WORLD_SIZE", "1"))
    if world_size > 1 and not dist.is_initialized():
        dist.init_process_group("gloo")
    rank = dist.get_rank() if dist.is_initialized() else 0
    return rank, world_size


def write_fixture(directory: Path) -> tuple[Path, Path]:
    directory.mkdir(parents=True, exist_ok=True)
    tokens = (np.arange(59, dtype=np.uint32) + 100).astype(np.uint32)
    label_mask = np.ones(59, dtype=np.bool_)
    label_mask[[5, 19, 41]] = False
    token_path = directory / "tokens.npy"
    mask_path = directory / "label-mask.npy"
    tokens.tofile(token_path)
    label_mask.tofile(mask_path)
    return token_path, mask_path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--work-dir", type=Path, default=Path("external-executions/runs/olmo-loader-work"))
    parser.add_argument("--output-dir", type=Path, default=Path("external-executions/runs/olmo-loader-logs"))
    parser.add_argument("--steps", type=int, default=2)
    args = parser.parse_args()
    rank, world_size = distributed_context()

    if rank == 0:
        for old in args.output_dir.glob("*.jsonl"):
            old.unlink()
        token_path, mask_path = write_fixture(args.work_dir / "fixture")
    if dist.is_initialized():
        dist.barrier()
    token_path = args.work_dir / "fixture/tokens.npy"
    mask_path = args.work_dir / "fixture/label-mask.npy"

    tokenizer = TokenizerConfig.dolma2()
    dataset = NumpyPaddedFSLDatasetConfig(
        tokenizer=tokenizer,
        paths=[str(token_path)],
        label_mask_paths=[str(mask_path)],
        sequence_length=8,
        work_dir=str(args.work_dir / "dataset-cache"),
    ).build()
    loader = NumpyDataLoaderConfig(
        global_batch_size=32,
        seed=34521,
        work_dir=str(args.work_dir / "loader-cache"),
        num_workers=0,
        target_device_type="cpu",
    ).build(dataset)

    observed = 0
    for step, batch in enumerate(loader):
        batch["labels"] = get_labels(batch, label_ignore_index=-100)
        record_batch(step=step, batch=batch, output_dir=args.output_dir, max_steps=args.steps)
        observed += 1
        if observed >= args.steps:
            break
    if observed != args.steps:
        raise RuntimeError(f"Expected {args.steps} loader batches, observed {observed}")
    if dist.is_initialized():
        dist.barrier()
        dist.destroy_process_group()
    if rank == 0:
        print(f"Captured {args.steps} batches across {world_size} rank(s) in {args.output_dir}")


if __name__ == "__main__":
    main()
