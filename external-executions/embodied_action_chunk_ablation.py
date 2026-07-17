#!/usr/bin/env python3
"""Bounded action-chunk feedback experiment for the Embodied AI course.

The smoke profile validates wiring only. The full profile trains one policy per seed,
then evaluates prefix-1 and prefix-4 execution from the identical checkpoint on the
same synthetic disturbed episodes. No performance direction is promised.
"""
from __future__ import annotations

import argparse
import hashlib
import json
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
    updates: int
    batch: int
    evaluation_episodes: int
    episode_steps: int
    seeds: tuple[int, ...]


PROFILES = {
    "smoke": Profile(updates=30, batch=64, evaluation_episodes=12, episode_steps=24, seeds=(13,)),
    "full": Profile(updates=3000, batch=512, evaluation_episodes=200, episode_steps=24, seeds=(13, 29, 47, 61, 83)),
}
CHUNK = 4
MAX_ACTION = 0.10


def numeric_leaves_are_finite(value: object) -> bool:
    """Check every recorded numeric leaf, including nested action traces."""
    if isinstance(value, dict):
        return all(numeric_leaves_are_finite(item) for item in value.values())
    if isinstance(value, (list, tuple)):
        return all(numeric_leaves_are_finite(item) for item in value)
    if isinstance(value, (int, float, np.number)):
        return bool(np.isfinite(value))
    return True


class ChunkPolicy(nn.Module):
    def __init__(self, width: int = 96) -> None:
        super().__init__()
        self.net = nn.Sequential(nn.Linear(2, width), nn.SiLU(), nn.Linear(width, width), nn.SiLU(), nn.Linear(width, CHUNK))

    def forward(self, state: torch.Tensor) -> torch.Tensor:
        return self.net(state)


def state_hash(model: nn.Module) -> str:
    digest = hashlib.sha256()
    for value in model.state_dict().values():
        digest.update(value.detach().cpu().numpy().tobytes())
    return digest.hexdigest()


def expert_chunks(position: torch.Tensor, target: torch.Tensor) -> torch.Tensor:
    actions = []
    simulated = position.clone()
    for _ in range(CHUNK):
        action = (target - simulated).clamp(-MAX_ACTION, MAX_ACTION)
        actions.append(action)
        simulated = simulated + action
    return torch.cat(actions, dim=1)


def train(seed: int, profile: Profile, device: torch.device) -> tuple[ChunkPolicy, dict[str, object]]:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    generator = torch.Generator(device=device).manual_seed(seed)
    model = ChunkPolicy().to(device)
    initial_hash = state_hash(model)
    optimizer = torch.optim.AdamW(model.parameters(), lr=2e-3)
    losses: list[float] = []
    started = time.perf_counter()
    for _ in range(profile.updates):
        position = torch.rand((profile.batch, 1), generator=generator, device=device) * 2 - 1
        target = torch.rand((profile.batch, 1), generator=generator, device=device) * 2 - 1
        state = torch.cat([position, target], dim=1)
        expected = expert_chunks(position, target)
        predicted = model(state)
        loss = torch.mean((predicted - expected) ** 2)
        if not torch.isfinite(loss):
            raise RuntimeError(f"non-finite loss for seed {seed}")
        optimizer.zero_grad(set_to_none=True)
        loss.backward()
        optimizer.step()
        losses.append(float(loss.item()))
    training = {
        "seed": seed,
        "initial_state_sha256": initial_hash,
        "trained_checkpoint_sha256": state_hash(model),
        "updates": profile.updates,
        "loss_bearing_examples": profile.updates * profile.batch,
        "first_loss": losses[0],
        "final_loss": losses[-1],
        "minimum_loss": min(losses),
        "training_seconds": time.perf_counter() - started,
        "all_losses_finite": all(np.isfinite(value) for value in losses),
    }
    training["finite"] = numeric_leaves_are_finite(training)
    return model, training


def episode_specs(seed: int, count: int) -> list[dict[str, float]]:
    rng = np.random.default_rng(seed + 10_000)
    specs = []
    while len(specs) < count:
        start, target = (float(value) for value in rng.uniform(-0.9, 0.9, size=2))
        if abs(target - start) < 0.35:
            continue
        direction = 1.0 if len(specs) % 2 == 0 else -1.0
        specs.append({"episode": len(specs), "start": start, "target": target, "disturbance": 0.18 * direction})
    return specs


def evaluate(model: ChunkPolicy, specs: list[dict[str, float]], prefix: int, profile: Profile, device: torch.device) -> dict[str, object]:
    checkpoint = state_hash(model)
    rows = []
    started = time.perf_counter()
    model.eval()
    with torch.no_grad():
        for spec in specs:
            position = spec["start"]
            requested_actions = []
            applied_actions = []
            policy_calls = 0
            clipped = 0
            step = 0
            while step < profile.episode_steps:
                state = torch.tensor([[position, spec["target"]]], dtype=torch.float32, device=device)
                chunk = model(state)[0].detach().cpu().tolist()
                policy_calls += 1
                for requested in chunk[:prefix]:
                    if step >= profile.episode_steps:
                        break
                    applied = max(-MAX_ACTION, min(MAX_ACTION, float(requested)))
                    clipped += int(abs(applied - float(requested)) > 1e-9)
                    requested_actions.append(float(requested))
                    applied_actions.append(applied)
                    position += applied
                    if step == 2:
                        position += spec["disturbance"]
                    step += 1
            final_error = abs(spec["target"] - position)
            rows.append({
                **spec,
                "prefix": prefix,
                "steps": step,
                "policy_calls": policy_calls,
                "final_position": position,
                "final_absolute_error": final_error,
                "success": final_error <= 0.05,
                "clipped_actions": clipped,
                "requested_actions": requested_actions,
                "applied_actions": applied_actions,
            })
    errors = [row["final_absolute_error"] for row in rows]
    result = {
        "execution_prefix": prefix,
        "checkpoint_sha256": checkpoint,
        "episodes": len(rows),
        "action_opportunities_per_episode": profile.episode_steps,
        "success_rate": sum(row["success"] for row in rows) / len(rows),
        "mean_final_absolute_error": sum(errors) / len(errors),
        "maximum_final_absolute_error": max(errors),
        "total_policy_calls": sum(row["policy_calls"] for row in rows),
        "total_clipped_actions": sum(row["clipped_actions"] for row in rows),
        "elapsed_seconds": time.perf_counter() - started,
        "rows": rows,
    }
    result["finite"] = numeric_leaves_are_finite(result)
    return result


def row_episode_spec(row: dict[str, object]) -> dict[str, object]:
    """Return every field that defines a paired evaluation episode."""
    return {
        "episode": row["episode"],
        "start": row["start"],
        "target": row["target"],
        "disturbance": row["disturbance"],
    }


def derive_invariants(pairs: list[dict[str, object]], profile: Profile) -> dict[str, bool]:
    """Derive the release gates from raw pair, episode, and action rows."""
    expected_seeds = list(profile.seeds)
    required_row_fields = {
        "episode",
        "start",
        "target",
        "disturbance",
        "prefix",
        "steps",
        "policy_calls",
        "final_position",
        "final_absolute_error",
        "success",
        "clipped_actions",
        "requested_actions",
        "applied_actions",
    }
    exact_seed_rows = [pair["seed"] for pair in pairs] == expected_seeds
    shared_checkpoint = all(
        pair["control"]["checkpoint_sha256"]
        == pair["treatment"]["checkpoint_sha256"]
        == pair["training"]["trained_checkpoint_sha256"]
        for pair in pairs
    )
    complete_rows = len(pairs) == len(expected_seeds) and all(
        pair["training"]["seed"] == pair["seed"]
        and pair[arm]["episodes"] == profile.evaluation_episodes
        and len(pair[arm]["rows"]) == profile.evaluation_episodes
        and [row["episode"] for row in pair[arm]["rows"]]
        == list(range(profile.evaluation_episodes))
        for pair in pairs
        for arm in ["control", "treatment"]
    )
    identical_specs = all(
        [row_episode_spec(row) for row in pair["control"]["rows"]]
        == [row_episode_spec(row) for row in pair["treatment"]["rows"]]
        for pair in pairs
    )
    equal_opportunities = all(
        pair[arm]["action_opportunities_per_episode"] == profile.episode_steps
        and all(
            row["steps"] == profile.episode_steps
            and len(row["requested_actions"]) == profile.episode_steps
            and len(row["applied_actions"]) == profile.episode_steps
            for row in pair[arm]["rows"]
        )
        for pair in pairs
        for arm in ["control", "treatment"]
    )
    required_fields = all(
        required_row_fields <= row.keys()
        for pair in pairs
        for arm in ["control", "treatment"]
        for row in pair[arm]["rows"]
    )
    finite_rows = all(
        pair["training"]["all_losses_finite"]
        and pair["training"]["finite"]
        and pair[arm]["finite"]
        and numeric_leaves_are_finite(pair[arm]["rows"])
        for pair in pairs
        for arm in ["control", "treatment"]
    )
    return {
        "exact_seed_rows": exact_seed_rows,
        "shared_checkpoint_within_pair": shared_checkpoint,
        "identical_episode_specs_within_pair": identical_specs,
        "equal_action_opportunities": equal_opportunities,
        "complete_seed_and_episode_rows": complete_rows,
        "required_raw_fields": required_fields,
        "finite_rows": finite_rows,
    }


def verify_dossier(dossier: dict[str, object], profile: Profile) -> dict[str, bool]:
    """Recompute all gates so a recorded boolean cannot authorize the full run."""
    required_top_level = {
        "schema_version",
        "execution",
        "config",
        "pairs",
        "invariants",
        "decision",
        "scope_boundary",
    }
    derived = derive_invariants(dossier.get("pairs", []), profile)
    execution = dossier.get("execution", {})
    return {
        "required_top_level_fields": required_top_level <= dossier.keys(),
        "requested_and_resolved_device_are_recorded": (
            isinstance(execution, dict)
            and execution.get("requested_device") in {"auto", "cpu", "cuda", "mps"}
            and execution.get("resolved_device") in {"cpu", "cuda", "mps"}
        ),
        "recorded_invariants_match_rows": dossier.get("invariants") == derived,
        **derived,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--profile", choices=PROFILES, default="smoke")
    parser.add_argument("--device", choices=["auto", "cpu", "cuda", "mps"], default="auto")
    parser.add_argument("--output", type=Path, default=Path("external-executions/runs/embodied-action-chunk.json"))
    args = parser.parse_args()
    device_name = args.device
    if device_name == "auto":
        device_name = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
    device = torch.device(device_name)
    profile = PROFILES[args.profile]
    pairs = []
    for seed in profile.seeds:
        model, training = train(seed, profile, device)
        specs = episode_specs(seed, profile.evaluation_episodes)
        control = evaluate(model, specs, 1, profile, device)
        treatment = evaluate(model, specs, 4, profile, device)
        pairs.append({"seed": seed, "training": training, "control": control, "treatment": treatment})
    invariants = derive_invariants(pairs, profile)
    dossier = {
        "schema_version": "1.0",
        "execution": {"profile": args.profile, "requested_device": args.device, "resolved_device": str(device), "python": platform.python_version(), "torch": torch.__version__, "numpy": np.__version__},
        "config": asdict(profile) | {"chunk_horizon": CHUNK, "control_prefix": 1, "treatment_prefix": 4, "maximum_action": MAX_ACTION, "disturbance_after_step": 2},
        "pairs": pairs,
        "invariants": invariants,
        "decision": "smoke_integration_only" if args.profile == "smoke" else "analyze_all_seed_and_episode_rows_without_promised_direction",
        "scope_boundary": "Course-scale synthetic one-dimensional action-chunk feedback study; not a physical-robot, vision-language-action, or universal chunking claim.",
    }
    verification = verify_dossier(dossier, profile)
    failed = [name for name, passed in verification.items() if not passed]
    if failed:
        raise RuntimeError(f"artifact gate failed: {', '.join(failed)}")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(dossier, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(args.output), "profile": args.profile, "requested_device": args.device, "resolved_device": str(device), "pairs": len(pairs)}))


if __name__ == "__main__":
    main()
