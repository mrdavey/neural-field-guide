#!/usr/bin/env python3
"""Bounded 2D diffusion schedule experiment for the Generative Models course.

The smoke profile validates wiring only. The full profile preserves paired seed-level
rows for linear versus cosine schedules; it does not promise which schedule wins.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import platform
import random
import time
from dataclasses import asdict, dataclass
from pathlib import Path

import numpy as np
import torch
from torch import nn


@dataclass(frozen=True)
class Profile:
    steps: int
    batch: int
    timesteps: int
    samples: int
    seeds: tuple[int, ...]


PROFILES = {
    "smoke": Profile(steps=25, batch=64, timesteps=20, samples=128, seeds=(101,)),
    "full": Profile(steps=3000, batch=512, timesteps=100, samples=4096, seeds=(101, 202, 303)),
}


class Denoiser(nn.Module):
    def __init__(self, width: int = 128) -> None:
        super().__init__()
        self.net = nn.Sequential(nn.Linear(4, width), nn.SiLU(), nn.Linear(width, width), nn.SiLU(), nn.Linear(width, 2))

    def forward(self, x: torch.Tensor, t: torch.Tensor, total_steps: int) -> torch.Tensor:
        angle = t.float().unsqueeze(1) / max(total_steps - 1, 1) * math.pi
        time_features = torch.cat([torch.sin(angle), torch.cos(angle)], dim=1)
        return self.net(torch.cat([x, time_features], dim=1))


def ring_batch(batch: int, generator: torch.Generator, device: torch.device) -> torch.Tensor:
    modes = torch.randint(0, 8, (batch,), generator=generator, device=device)
    angle = modes.float() * (2 * math.pi / 8)
    centers = torch.stack([2 * torch.cos(angle), 2 * torch.sin(angle)], dim=1)
    noise = torch.randn((batch, 2), generator=generator, device=device) * 0.08
    return centers + noise


def schedule(kind: str, timesteps: int, device: torch.device) -> torch.Tensor:
    if kind == "linear":
        beta = torch.linspace(1e-4, 0.02, timesteps, device=device)
        return torch.cumprod(1 - beta, dim=0).clamp(min=1e-5)
    steps = torch.arange(timesteps + 1, device=device, dtype=torch.float64)
    alpha = torch.cos(((steps / timesteps + 0.008) / 1.008) * math.pi / 2) ** 2
    alpha = (alpha / alpha[0]).float()
    return alpha[1:].clamp(min=1e-5, max=0.9999)


def state_hash(model: nn.Module) -> str:
    digest = hashlib.sha256()
    for value in model.state_dict().values():
        digest.update(value.detach().cpu().numpy().tobytes())
    return digest.hexdigest()


def file_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def hardware_record(device: torch.device, requested: str) -> dict[str, object]:
    record: dict[str, object] = {"requested_device": requested, "resolved_device": str(device)}
    if device.type == "cuda":
        properties = torch.cuda.get_device_properties(device)
        record.update({"accelerator": properties.name, "accelerator_memory_bytes": properties.total_memory, "cuda": torch.version.cuda})
    elif device.type == "mps":
        record.update({"accelerator": "Apple MPS", "accelerator_memory_bytes": None, "cuda": None})
    else:
        record.update({"accelerator": platform.processor() or platform.machine() or "CPU", "accelerator_memory_bytes": None, "cuda": None})
    return record


def sample(model: Denoiser, alpha_bar: torch.Tensor, count: int, generator: torch.Generator, device: torch.device) -> torch.Tensor:
    x = torch.randn((count, 2), generator=generator, device=device)
    with torch.no_grad():
        for index in reversed(range(len(alpha_bar))):
            t = torch.full((count,), index, device=device, dtype=torch.long)
            epsilon_hat = model(x, t, len(alpha_bar))
            alpha = alpha_bar[index]
            x0_hat = (x - torch.sqrt(1 - alpha) * epsilon_hat) / torch.sqrt(alpha)
            if index:
                previous = alpha_bar[index - 1]
                x = torch.sqrt(previous) * x0_hat + torch.sqrt(1 - previous) * epsilon_hat
            else:
                x = x0_hat
    return x


def evaluate(samples: torch.Tensor) -> dict[str, object]:
    angles = torch.atan2(samples[:, 1], samples[:, 0]) % (2 * math.pi)
    modes = torch.round(angles / (2 * math.pi / 8)).long() % 8
    counts = torch.bincount(modes, minlength=8)
    radius_error = (torch.linalg.vector_norm(samples, dim=1) - 2).abs().mean()
    return {
        "mode_counts": counts.cpu().tolist(),
        "modes_covered": int((counts > 0).sum().item()),
        "mean_absolute_radius_error": float(radius_error.item()),
        "finite": bool(torch.isfinite(samples).all().item()),
    }


def run_arm(kind: str, seed: int, profile: Profile, device: torch.device, initial_state: dict[str, torch.Tensor]) -> dict[str, object]:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    generator = torch.Generator(device=device).manual_seed(seed)
    model = Denoiser().to(device)
    model.load_state_dict(initial_state)
    initial_hash = state_hash(model)
    optimizer = torch.optim.AdamW(model.parameters(), lr=2e-3)
    alpha_bar = schedule(kind, profile.timesteps, device)
    losses: list[float] = []
    started = time.perf_counter()
    for _ in range(profile.steps):
        x0 = ring_batch(profile.batch, generator, device)
        t = torch.randint(0, profile.timesteps, (profile.batch,), generator=generator, device=device)
        epsilon = torch.randn(x0.shape, generator=generator, device=device)
        alpha = alpha_bar[t].unsqueeze(1)
        xt = torch.sqrt(alpha) * x0 + torch.sqrt(1 - alpha) * epsilon
        prediction = model(xt, t, profile.timesteps)
        loss = torch.mean((prediction - epsilon) ** 2)
        if not torch.isfinite(loss):
            raise RuntimeError(f"non-finite loss for {kind} seed {seed}")
        optimizer.zero_grad(set_to_none=True)
        loss.backward()
        optimizer.step()
        losses.append(float(loss.item()))
    generated = sample(model, alpha_bar, profile.samples, generator, device)
    elapsed = time.perf_counter() - started
    return {
        "schedule": kind,
        "seed": seed,
        "initial_state_sha256": initial_hash,
        "steps": profile.steps,
        "loss_bearing_examples": profile.steps * profile.batch,
        "first_loss": losses[0],
        "final_loss": losses[-1],
        "minimum_loss": min(losses),
        "elapsed_seconds": elapsed,
        "sampling_batched_forward_calls": profile.timesteps,
        "sampling_denoiser_example_evaluations": profile.timesteps * profile.samples,
        "sample_summary": evaluate(generated),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--profile", choices=PROFILES, default="smoke")
    parser.add_argument("--device", choices=["auto", "cpu", "cuda", "mps"], default="auto")
    parser.add_argument("--repository-revision", default="unrecorded-working-tree", help="Git commit or immutable archive revision for this run")
    parser.add_argument("--output", type=Path, default=Path("external-executions/runs/generative-diffusion.json"))
    args = parser.parse_args()
    device_name = args.device
    if device_name == "auto":
        device_name = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
    device = torch.device(device_name)
    profile = PROFILES[args.profile]
    pairs = []
    for seed in profile.seeds:
        torch.manual_seed(seed)
        initial = Denoiser().state_dict()
        control = run_arm("linear", seed, profile, device, initial)
        treatment = run_arm("cosine", seed, profile, device, initial)
        assert control["initial_state_sha256"] == treatment["initial_state_sha256"]
        assert control["loss_bearing_examples"] == treatment["loss_bearing_examples"]
        pairs.append({"seed": seed, "control": control, "treatment": treatment})
    dossier = {
        "schema_version": "1.0",
        "provenance": {"repository_revision": args.repository_revision, "runner_sha256": file_hash(Path(__file__))},
        "execution": { "profile": args.profile, "hardware": hardware_record(device, args.device), "python": platform.python_version(), "torch": torch.__version__, "numpy": np.__version__ },
        "config": asdict(profile),
        "pairs": pairs,
        "invariants": { "paired_initialization": True, "equal_training_examples": True, "finite_rows": all(row[arm]["sample_summary"]["finite"] for row in pairs for arm in ["control", "treatment"]) },
        "checkpoint_resume": {"checkpoint_created": False, "resume_tested": False, "reason": "This bounded schedule runner starts both arms from one in-memory initialization and intentionally does not implement checkpoint/resume."},
        "decision": "smoke_integration_only" if args.profile == "smoke" else "analyze_all_seed_rows_without_promised_direction",
        "scope_boundary": "Course-scale synthetic 2D diffusion schedule study; not an image-model quality or general schedule-superiority claim."
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(dossier, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(args.output), "profile": args.profile, "device": str(device), "pairs": len(pairs)}))


if __name__ == "__main__":
    main()
