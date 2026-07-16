#!/usr/bin/env python3
"""Dependency-free mechanism starters for the seven RL & Control capstones.

The executable fixtures validate targets, budgets, causal ownership, and gates.
They do not train an agent or supply sampled environment-performance evidence.
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Callable


PROJECT_IDS = (
    "tabular-control-capstone",
    "value-methods-capstone",
    "deep-value-capstone",
    "on-policy-capstone",
    "model-based-capstone",
    "sequence-policy-capstone",
    "rl-research-capstone",
)


def tabular_control():
    gamma = 0.9
    values = {"terminal": 0.0, "safe": 1.0, "start": 0.0}
    for _ in range(50):
        values["start"] = 0.9 * (1 + gamma * values["safe"]) + 0.1 * (-2)
    risky_return, risky_collision = 2.0, 0.2
    rows = [{"arm": "policy_safe", "exactValue": values["start"], "collisionRate": 0.0}, {"arm": "policy_risky", "exactValue": risky_return, "collisionRate": risky_collision}]
    checks = {
        "bellman_backup_is_finite": math.isfinite(values["start"]),
        "exact_terminal_value_is_zero": values["terminal"] == 0.0,
        "constraint_gate_precedes_return": rows[1]["exactValue"] > rows[0]["exactValue"] and rows[1]["collisionRate"] > 0.1,
    }
    return {"gamma": gamma, "collisionGate": 0.1, "independentUnit": "seeded rollout"}, rows, checks


def value_methods():
    reward, gamma, next_value = 1.0, 0.9, 4.0
    continuing_target = reward + gamma * next_value
    terminal_target = reward
    alpha, old = 0.1, 2.0
    updated = old + alpha * (continuing_target - old)
    rows = [{"ending": False, "target": continuing_target, "updatedValue": updated}, {"ending": True, "target": terminal_target, "updatedValue": old + alpha * (terminal_target - old)}]
    checks = {
        "continuing_target_includes_bootstrap": math.isclose(continuing_target, 4.6),
        "terminal_target_masks_bootstrap": terminal_target == reward,
        "td_update_moves_toward_target": old < updated < continuing_target,
    }
    return {"alpha": alpha, "gamma": gamma, "independentUnit": "seeded transition stream"}, rows, checks


def deep_value():
    online = [1.0, 2.0]
    target = online.copy()
    replay = [(0, 1, 1.0, 1, False), (1, 0, -1.0, 0, True)]
    online[0] = 1.4
    before_copy = target[0]
    target = online.copy()
    rows = [{"replayIndex": index, "ending": item[4], "target": item[2] if item[4] else item[2] + 0.9 * max(target)} for index, item in enumerate(replay)]
    checks = {
        "target_network_lags_before_copy": before_copy != online[0],
        "target_copy_is_exact": target == online,
        "terminal_replay_row_does_not_bootstrap": rows[1]["target"] == -1.0,
        "replay_rows_preserve_ending_flag": [row["ending"] for row in rows] == [False, True],
    }
    return {"targetCopyInterval": 20, "replayCapacity": 2, "independentUnit": "seeded agent run"}, rows, checks


def on_policy():
    rewards, values, gamma, lam = [1.0, 0.5], [0.2, 0.3, 0.0], 0.9, 0.95
    advantages = [0.0, 0.0]
    carry = 0.0
    for index in (1, 0):
        delta = rewards[index] + gamma * values[index + 1] - values[index]
        carry = delta + gamma * lam * carry
        advantages[index] = carry
    ratio, epsilon = 1.5, 0.2
    clipped = min(max(ratio, 1 - epsilon), 1 + epsilon)
    rows = [{"step": index, "advantage": advantage} for index, advantage in enumerate(advantages)]
    checks = {
        "gae_runs_backward": advantages[0] > advantages[1],
        "last_advantage_uses_terminal_value": math.isclose(advantages[1], 0.2),
        "policy_ratio_is_clipped": math.isclose(clipped, 1.2),
    }
    return {"gamma": gamma, "lambda": lam, "clipEpsilon": epsilon, "independentUnit": "seeded rollout-update cycle"}, rows, checks


def model_based():
    candidates, horizon = 20, 5
    model_calls = candidates * horizon
    predicted = {"left": 5.0, "right": 6.0}
    realized = {"left": 5.0, "right": 0.0}
    chosen = max(predicted, key=predicted.get)
    rows = [{"action": action, "predictedReturn": predicted[action], "realizedReturn": realized[action]} for action in predicted]
    checks = {
        "model_call_budget_recomputes": model_calls == 100,
        "planner_uses_predicted_ranking": chosen == "right",
        "off_support_failure_is_preserved": realized[chosen] < realized["left"],
        "fallback_can_select_supported_action": max(realized, key=realized.get) == "left",
    }
    return {"candidates": candidates, "horizon": horizon, "modelCalls": model_calls, "independentUnit": "seeded controller run"}, rows, checks


def sequence_policy():
    tokens = ["return", "s0", "a0", "s1", "a1"]
    a0_prefix = tokens[:2]
    changed_future = ["return", "s0", "a0", "s1", "unsafe"]
    support_counts = {"left": 4, "right": 0}
    requested = "right"
    applied = requested if support_counts[requested] > 0 else "abstain"
    rows = [{"requested": requested, "applied": applied, "supportCount": support_counts[requested]}]
    checks = {
        "a0_prefix_excludes_target": "a0" not in a0_prefix,
        "future_action_edit_cannot_change_a0_prefix": changed_future[:2] == a0_prefix,
        "zero_count_action_abstains": applied == "abstain",
    }
    return {"tokens": tokens, "episodeSplit": True, "independentUnit": "held-out episode"}, rows, checks


def rl_research():
    seeds = [11, 23, 41, 53, 67]
    arms = ["baseline", "intervention"]
    effects = {11: 0.02, 23: -0.04, 41: 0.06, 53: 0.01, 67: -0.01}
    budget = {"environmentInteractions": 20000, "optimizerUpdates": 5000}
    rows = [{"seed": seed, "arm": arm, "budget": budget.copy(), "evaluationSuccessRate": 0.60 + (effects[seed] if arm == "intervention" else 0.0), "finite": True} for seed in seeds for arm in arms]
    expected = {(seed, arm) for seed in seeds for arm in arms}
    checks = {
        "complete_five_seed_by_arm_matrix": {(row["seed"], row["arm"]) for row in rows} == expected,
        "primitive_budgets_match": all(row["budget"] == budget for row in rows),
        "negative_and_positive_seed_effects_remain": min(effects.values()) < 0 < max(effects.values()),
        "all_fixture_values_are_finite": all(row["finite"] for row in rows),
    }
    metric = {"field": "evaluationSuccessRate", "name": "DQN frozen-policy evaluation success rate", "unit": "successful episodes / 100 evaluation episodes", "aggregation": "one 100-episode evaluation per canonical seed and arm"}
    return {"seeds": seeds, "arms": arms, "primitiveBudget": budget, "metric": metric, "independentUnit": "seeded run"}, rows, checks


BUILDERS: dict[str, Callable] = {
    "tabular-control-capstone": tabular_control,
    "value-methods-capstone": value_methods,
    "deep-value-capstone": deep_value,
    "on-policy-capstone": on_policy,
    "model-based-capstone": model_based,
    "sequence-policy-capstone": sequence_policy,
    "rl-research-capstone": rl_research,
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
        "course": "rl",
        "lessonId": args.project,
        "evidenceKind": "real local execution of deterministic starter fixtures",
        "manifest": {"profile": "starter-check", **manifest},
        "checks": checks,
        "rawRows": rows,
        "decision": "All starter mechanism checks passed; replace the finite fixture with the working agent before evaluating the capstone hypothesis.",
        "boundary": "This output proves local deterministic starter wiring only. It is not trained-agent performance, an environment benchmark, a baseline reproduction, or an intervention result.",
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(dossier, indent=2) + "\n")
    print(json.dumps({"output": str(args.output), "project": args.project, "checks": checks}, indent=2))


if __name__ == "__main__":
    main()
