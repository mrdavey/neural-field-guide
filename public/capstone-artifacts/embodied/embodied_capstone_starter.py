#!/usr/bin/env python3
"""Dependency-free local starter checks for the six Embodied AI capstones.

This executes deterministic interface fixtures, not a learned policy, simulator
benchmark, or physical robot. Replace the named fixture mechanism for a project
while retaining its assertions, evidence schema, failure rows, and boundary.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Callable


PROJECT_IDS = (
    "task-contract-capstone",
    "state-estimator-capstone",
    "behavior-cloning-capstone",
    "vla-policy-capstone",
    "recovery-intervention-capstone",
    "embodied-research-capstone",
)


def stable_hash(value: object) -> str:
    payload = json.dumps(value, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(payload).hexdigest()


@dataclass
class TaskFixture:
    seed: int
    x_m: float = 0.0
    step_index: int = 0

    def reset(self) -> dict[str, object]:
        self.x_m = 0.0
        self.step_index = 0
        return {"x_m": self.x_m, "frame": "world", "step": self.step_index, "seed": self.seed}

    def step(self, requested_dx_m: float, packet_age_ms: int) -> dict[str, object]:
        clipped = max(-0.03, min(0.03, requested_dx_m))
        stale = packet_age_ms > 40
        applied = 0.0 if stale else clipped
        self.x_m += applied
        self.step_index += 1
        return {
            "step": self.step_index,
            "packetAgeMs": packet_age_ms,
            "requestedDxM": requested_dx_m,
            "appliedDxM": applied,
            "xM": self.x_m,
            "event": "stale_sensor" if stale else "act",
        }


def task_contract() -> tuple[dict[str, object], list[dict[str, object]], dict[str, bool]]:
    env = TaskFixture(seed=17)
    initial = env.reset()
    nominal = {"arm": "nominal", **env.step(0.07, 10)}
    env.reset()
    stale = {"arm": "stale", **env.step(0.07, 80)}
    replay_initial = env.reset()
    checks = {
        "reset_is_replayable": stable_hash(initial) == stable_hash(replay_initial),
        "requested_and_applied_are_distinct": nominal["requestedDxM"] == 0.07 and nominal["appliedDxM"] == 0.03,
        "stale_packet_is_contained": stale["event"] == "stale_sensor" and stale["appliedDxM"] == 0.0,
    }
    manifest = {"seed": 17, "ageGateMs": 40, "actionLimitM": 0.03, "independentUnit": "replayed branch"}
    return manifest, [nominal, stale], checks


def state_estimator() -> tuple[dict[str, object], list[dict[str, object]], dict[str, bool]]:
    def update(prior_x: float, camera_x: float, age_ms: int) -> dict[str, object]:
        valid = age_ms <= 40
        estimate = 0.5 * prior_x + 0.5 * camera_x if valid else prior_x
        variance = 0.001 if valid else 0.006
        return {"estimateM": estimate, "varianceM2": variance, "valid": valid, "abstain": not valid}

    nominal = {"arm": "nominal", "packetAgeMs": 10, **update(0.40, 0.42, 10), "truthM": 0.41}
    delayed = {"arm": "delay", "packetAgeMs": 80, **update(0.40, 0.54, 80), "truthM": 0.47}
    checks = {
        "synchronized_packet_updates": nominal["valid"] is True and abs(nominal["estimateM"] - 0.41) < 1e-12,
        "stale_packet_abstains": delayed["valid"] is False and delayed["abstain"] is True,
        "evaluator_truth_is_not_policy_input": "truthM" not in {"prior_x", "camera_x", "age_ms"},
    }
    manifest = {"seed": 23, "ageGateMs": 40, "frames": ["world"], "independentUnit": "held-out trajectory"}
    return manifest, [nominal, delayed], checks


def behavior_cloning() -> tuple[dict[str, object], list[dict[str, object]], dict[str, bool]]:
    demonstrated_states = {0, 1}

    def rollout(states: list[int]) -> dict[str, object]:
        first_departure = next((i for i, state in enumerate(states) if state not in demonstrated_states), None)
        return {
            "supportDeparture": first_departure,
            "success": first_departure is None,
            "intervention": first_departure is not None,
            "requestedActions": ["right" for _ in states],
            "appliedActions": ["right" if state in demonstrated_states else "hold" for state in states],
        }

    nominal = {"arm": "nominal", **rollout([0, 1])}
    shifted = {"arm": "shift", **rollout([0, 1, 2, 3, 4, 5]), "workspaceExitStep": 5}
    checks = {
        "whole_episode_split_declared": True,
        "nominal_stays_in_support": nominal["supportDeparture"] is None,
        "changed_start_preserves_first_departure": shifted["supportDeparture"] == 2,
        "assistance_is_not_autonomy": shifted["intervention"] is True and shifted["success"] is False,
    }
    manifest = {"seed": 31, "policy": "lookup fixture", "independentUnit": "closed-loop episode", "intervention": "2 cm start shift"}
    return manifest, [nominal, shifted], checks


def vla_policy() -> tuple[dict[str, object], list[dict[str, object]], dict[str, bool]]:
    tokens = ["instruction", "o0", "a0", "o1", "a1"]
    prediction_rows = [1, 3]
    target_rows = [2, 4]
    prefixes = [tokens[: row + 1] for row in prediction_rows]
    target_shift_ok = all(tokens[target] not in prefix for target, prefix in zip(target_rows, prefixes))
    rows = [
        {"arm": "diffusion", "success": 0.8, "latencyMs": 60, "grounding": True, "deadlinePass": False, "feasible": False},
        {"arm": "transformer", "success": 0.7, "latencyMs": 20, "grounding": False, "deadlinePass": True, "feasible": False},
    ]
    checks = {
        "action_targets_are_shifted": target_shift_ok,
        "future_action_edit_cannot_change_a0_prefix": prefixes[0] == ["instruction", "o0"],
        "hard_gates_precede_success_ranking": not any(row["feasible"] for row in rows),
    }
    manifest = {"seed": 41, "deadlineMs": 50, "tokens": tokens, "predictionRows": prediction_rows, "targetRows": target_rows, "independentUnit": "paired evaluation cell"}
    return manifest, rows, checks


def recovery_intervention() -> tuple[dict[str, object], list[dict[str, object]], dict[str, bool]]:
    rows = [
        {"phase": "detect", "fault": "stale_camera", "latencyMs": 20, "requestedAction": "move", "appliedAction": "hold", "owner": "watchdog"},
        {"phase": "recover", "freshPackets": 3, "appliedAction": "hold", "owner": "fallback"},
        {"phase": "resume", "taskSuccess": True, "autonomous": False, "owner": "human"},
    ]
    checks = {
        "detection_changes_applied_action": rows[0]["requestedAction"] != rows[0]["appliedAction"],
        "fallback_owns_recovery": rows[1]["owner"] == "fallback",
        "human_resume_is_assisted": rows[2]["owner"] == "human" and rows[2]["autonomous"] is False,
    }
    manifest = {"seed": 53, "fault": "stale camera", "detectionBudgetMs": 30, "independentUnit": "fault-injection episode"}
    return manifest, rows, checks


def embodied_research() -> tuple[dict[str, object], list[dict[str, object]], dict[str, bool]]:
    rows = [
        {"seed": 11, "arm": "baseline", "success": 0.70, "deadlineMiss": 0},
        {"seed": 11, "arm": "treatment", "success": 0.80, "deadlineMiss": 0},
        {"seed": 23, "arm": "baseline", "success": 0.75, "deadlineMiss": 0},
        {"seed": 23, "arm": "treatment", "success": 0.90, "deadlineMiss": 1},
    ]
    expected_cells = {(seed, arm) for seed in (11, 23) for arm in ("baseline", "treatment")}
    actual_cells = {(row["seed"], row["arm"]) for row in rows}
    treatment_feasible = all(row["deadlineMiss"] == 0 for row in rows if row["arm"] == "treatment")
    checks = {
        "complete_seed_by_arm_matrix": actual_cells == expected_cells,
        "matched_rows_are_paired": all(sum(row["seed"] == seed for row in rows) == 2 for seed in (11, 23)),
        "deadline_gate_blocks_treatment": treatment_feasible is False,
    }
    manifest = {"seeds": [11, 23], "arms": ["baseline", "treatment"], "matrixAxes": {"seed": [11, 23], "arm": ["baseline", "treatment"]}, "hardGate": "zero deadline misses", "independentUnit": "seeded run"}
    return manifest, rows, checks


BUILDERS: dict[str, Callable[[], tuple[dict[str, object], list[dict[str, object]], dict[str, bool]]]] = {
    "task-contract-capstone": task_contract,
    "state-estimator-capstone": state_estimator,
    "behavior-cloning-capstone": behavior_cloning,
    "vla-policy-capstone": vla_policy,
    "recovery-intervention-capstone": recovery_intervention,
    "embodied-research-capstone": embodied_research,
}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", choices=PROJECT_IDS, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    manifest, rows, checks = BUILDERS[args.project]()
    if not all(checks.values()):
        raise RuntimeError(f"starter check failed: {checks}")
    dossier = {
        "schemaVersion": 1,
        "course": "embodied",
        "lessonId": args.project,
        "evidenceKind": "real local execution of deterministic starter fixtures",
        "manifest": {"profile": "starter-check", **manifest},
        "checks": checks,
        "rawRows": rows,
        "decision": "All starter interface checks passed; replace one fixture mechanism and rerun the same evidence contract before making a bounded capstone conclusion.",
        "boundary": "This output proves local deterministic starter wiring only. It is not a learned-policy result, simulator benchmark, physical measurement, or safety claim.",
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(dossier, indent=2) + "\n")
    print(json.dumps({"output": str(args.output), "project": args.project, "checks": checks}, indent=2))


if __name__ == "__main__":
    main()
