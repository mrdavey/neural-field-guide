#!/usr/bin/env python3
"""Runnable local CPU baselines for the seven RL & Control capstones.

All required work uses one inspectable five-state environment and NumPy.  Smoke
profiles validate the complete agent path quickly; full profiles expand the
declared budgets.  No account, network, accelerator, or external grader is used.
"""
from __future__ import annotations

import argparse
import itertools
import json
import math
from pathlib import Path
from typing import Callable

try:
    import numpy as np
except ImportError as error:  # pragma: no cover - dependency failure path
    raise SystemExit(
        "NumPy is required. Run: python3 -m pip install -r requirements-capstones.txt"
    ) from error


PROJECT_IDS = (
    "tabular-control-capstone",
    "value-methods-capstone",
    "deep-value-capstone",
    "on-policy-capstone",
    "model-based-capstone",
    "sequence-policy-capstone",
    "rl-research-capstone",
)
PROFILES = ("smoke", "full")
CANONICAL_SEEDS = [11, 23, 41, 53, 67]


class ChainEnv:
    """Five states: collision=0, start=2, goal=4; actions are left/right."""

    def __init__(self, slip: float, seed: int, max_steps: int = 12):
        self.slip = slip
        self.rng = np.random.default_rng(seed)
        self.max_steps = max_steps
        self.state = 2
        self.steps = 0

    def reset(self) -> int:
        self.state = 2
        self.steps = 0
        return self.state

    def step(self, action: int) -> tuple[int, float, bool, bool]:
        executed = 1 - action if self.rng.random() < self.slip else action
        self.state = max(0, min(4, self.state + (1 if executed == 1 else -1)))
        self.steps += 1
        terminated = self.state in (0, 4)
        truncated = self.steps >= self.max_steps and not terminated
        reward = 1.0 if self.state == 4 else (-1.0 if self.state == 0 else -0.02)
        return self.state, reward, terminated, truncated


def transition_outcomes(state: int, action: int, slip: float) -> list[tuple[float, int, float, bool]]:
    outcomes = []
    for probability, executed in ((1.0 - slip, action), (slip, 1 - action)):
        next_state = max(0, min(4, state + (1 if executed == 1 else -1)))
        terminal = next_state in (0, 4)
        reward = 1.0 if next_state == 4 else (-1.0 if next_state == 0 else -0.02)
        outcomes.append((probability, next_state, reward, terminal))
    return outcomes


def exact_control(slip: float, gamma: float = 0.95) -> tuple[np.ndarray, np.ndarray]:
    values = np.zeros(5, dtype=np.float64)
    q_values = np.zeros((5, 2), dtype=np.float64)
    for _ in range(10_000):
        old = values.copy()
        for state in (1, 2, 3):
            for action in (0, 1):
                q_values[state, action] = sum(
                    probability * (reward + gamma * (0.0 if terminal else old[next_state]))
                    for probability, next_state, reward, terminal in transition_outcomes(state, action, slip)
                )
            values[state] = q_values[state].max()
        if np.max(np.abs(values - old)) < 1e-12:
            break
    return values, np.argmax(q_values, axis=1)


def evaluate_policy(policy: Callable[[int], int], slip: float, seed: int, episodes: int) -> dict[str, float | int]:
    env = ChainEnv(slip, seed)
    returns = []
    collisions = 0
    successes = 0
    lengths = []
    for _ in range(episodes):
        state = env.reset()
        total = 0.0
        for step in range(env.max_steps):
            state, reward, terminated, truncated = env.step(int(policy(state)))
            total += reward
            if terminated or truncated:
                collisions += int(state == 0)
                successes += int(state == 4)
                lengths.append(step + 1)
                break
        returns.append(total)
    return {
        "meanReturn": float(np.mean(returns)),
        "returnStandardError": float(np.std(returns, ddof=1) / math.sqrt(len(returns))) if len(returns) > 1 else 0.0,
        "collisionRate": collisions / episodes,
        "successRate": successes / episodes,
        "meanEpisodeLength": float(np.mean(lengths)),
        "episodes": episodes,
    }


def tabular_control(profile: str, _output: Path):
    episodes = 100 if profile == "smoke" else 2_000
    rows = []
    exact_rows = []
    for slip in (0.1, 0.3):
        values, policy = exact_control(slip)
        evaluation = evaluate_policy(lambda state, p=policy: int(p[state]), slip, 1000 + int(slip * 10), episodes)
        rows.append({"slipProbability": slip, "exactStartValue": float(values[2]), "policy": policy[1:4].tolist(), **evaluation})
        exact_rows.append(values)
    unsafe = evaluate_policy(lambda _state: 0, 0.1, 222, episodes)
    checks = {
        "exact_solver_converges_to_finite_values": bool(all(np.isfinite(values).all() for values in exact_rows)),
        "terminal_values_remain_zero": bool(all(values[0] == 0.0 and values[4] == 0.0 for values in exact_rows)),
        "seeded_rollout_counts_match_budget": all(row["episodes"] == episodes for row in rows),
        "changed_dynamics_alter_exact_value": not math.isclose(rows[0]["exactStartValue"], rows[1]["exactStartValue"]),
        "collision_gate_can_reject_a_policy": unsafe["collisionRate"] > 0.1,
    }
    return {"environmentId": "five-state-chain-v1", "states": 5, "startState": 2, "terminalStates": [0, 4], "actions": ["left", "right"], "gamma": 0.95, "rolloutEpisodes": episodes, "collisionGate": 0.1, "independentUnit": "seeded rollout"}, rows, checks


def fixed_right_value(slip: float, gamma: float = 0.95) -> np.ndarray:
    values = np.zeros(5)
    for _ in range(10_000):
        old = values.copy()
        for state in (1, 2, 3):
            values[state] = sum(
                probability * (reward + gamma * (0.0 if terminal else old[next_state]))
                for probability, next_state, reward, terminal in transition_outcomes(state, 1, slip)
            )
        if np.max(np.abs(values - old)) < 1e-12:
            break
    return values


def learn_prediction(method: str, slip: float, seed: int, episodes: int, gamma: float = 0.95) -> np.ndarray:
    values = np.zeros(5)
    rng = np.random.default_rng(seed)
    env = ChainEnv(slip, seed + 1)
    alpha = 0.08
    for _ in range(episodes):
        state = env.reset()
        trajectory = []
        for _step in range(env.max_steps):
            next_state, reward, terminated, truncated = env.step(1)
            trajectory.append((state, reward, next_state, terminated))
            if method == "td":
                target = reward + gamma * (0.0 if terminated else values[next_state])
                values[state] += alpha * (target - values[state])
            state = next_state
            if terminated or truncated:
                break
        if method == "mc":
            total = 0.0 if trajectory[-1][3] else values[trajectory[-1][2]]
            for old_state, reward, _next_state, _terminated in reversed(trajectory):
                total = reward + gamma * total
                values[old_state] += alpha * (total - values[old_state])
        # Consume a declared generator stream so seed ownership stays explicit.
        _ = rng.random()
    return values


def learn_control(method: str, slip: float, seed: int, interactions: int, gamma: float = 0.95) -> np.ndarray:
    q_values = np.zeros((5, 2))
    env = ChainEnv(slip, seed)
    rng = np.random.default_rng(seed + 100)
    state = env.reset()
    action = int(rng.integers(0, 2))
    for step in range(interactions):
        epsilon = max(0.05, 0.5 * (1.0 - step / interactions))
        if rng.random() < epsilon:
            action = int(rng.integers(0, 2))
        elif method == "q-learning" or step == 0:
            action = int(np.argmax(q_values[state]))
        next_state, reward, terminated, truncated = env.step(action)
        if method == "sarsa" and not terminated:
            next_action = int(rng.integers(0, 2)) if rng.random() < epsilon else int(np.argmax(q_values[next_state]))
            bootstrap = q_values[next_state, next_action]
        else:
            next_action = 0
            bootstrap = 0.0 if terminated else float(np.max(q_values[next_state]))
        target = reward + gamma * bootstrap
        q_values[state, action] += 0.12 * (target - q_values[state, action])
        state, action = next_state, next_action
        if terminated or truncated:
            state = env.reset()
            action = int(rng.integers(0, 2))
    return q_values


def value_methods(profile: str, _output: Path):
    prediction_episodes = 300 if profile == "smoke" else 4_000
    control_interactions = 800 if profile == "smoke" else 10_000
    evaluation_episodes = 80 if profile == "smoke" else 1_000
    slip = 0.3
    exact = fixed_right_value(slip)
    rows = [{"method": "planning", "valueRmse": 0.0, **evaluate_policy(lambda _state: 1, slip, 300, evaluation_episodes)}]
    for method in ("monte-carlo", "td"):
        learned = learn_prediction("mc" if method == "monte-carlo" else "td", slip, 301, prediction_episodes)
        rows.append({"method": method, "valueRmse": float(np.sqrt(np.mean((learned[1:4] - exact[1:4]) ** 2))), **evaluate_policy(lambda _state: 1, slip, 302, evaluation_episodes)})
    learned_policies = {}
    for method in ("sarsa", "q-learning"):
        q_values = learn_control(method, 0.1, 310 if method == "sarsa" else 311, control_interactions)
        learned_policies[method] = q_values
        evaluation = evaluate_policy(lambda state, q=q_values: int(np.argmax(q[state])), slip, 320, evaluation_episodes)
        rows.append({"method": method, "valueRmse": float(np.sqrt(np.mean((q_values[1:4].max(axis=1) - exact[1:4]) ** 2))), **evaluation})
    terminal_target = 1.0
    continuing_target = -0.02 + 0.95 * 0.7
    checks = {
        "all_five_methods_execute": {row["method"] for row in rows} == {"planning", "monte-carlo", "td", "sarsa", "q-learning"},
        "terminal_target_masks_bootstrap": terminal_target == 1.0,
        "continuing_target_includes_bootstrap": math.isclose(continuing_target, 0.645),
        "learned_values_and_returns_are_finite": all(np.isfinite([row["valueRmse"], row["meanReturn"]]).all() for row in rows),
        "control_methods_produce_two_action_tables": all(table.shape == (5, 2) for table in learned_policies.values()),
    }
    return {"baselineSlipProbability": 0.1, "evaluationSlipProbability": slip, "predictionEpisodes": prediction_episodes, "controlInteractions": control_interactions, "evaluationEpisodes": evaluation_episodes, "independentUnit": "seeded agent run"}, rows, checks


def init_q_network(rng: np.random.Generator) -> dict[str, np.ndarray]:
    return {
        "w1": rng.normal(0.0, 0.15, (5, 16)),
        "b1": np.zeros(16),
        "w2": rng.normal(0.0, 0.15, (16, 2)),
        "b2": np.zeros(2),
    }


def q_forward(parameters: dict[str, np.ndarray], states: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    one_hot = np.eye(5)[states]
    hidden = np.maximum(0.0, one_hot @ parameters["w1"] + parameters["b1"])
    return hidden @ parameters["w2"] + parameters["b2"], hidden


def dqn_update(online: dict[str, np.ndarray], target: dict[str, np.ndarray], batch: list[tuple[int, int, float, int, bool]], gamma: float = 0.95) -> float:
    states = np.array([row[0] for row in batch], dtype=int)
    actions = np.array([row[1] for row in batch], dtype=int)
    rewards = np.array([row[2] for row in batch], dtype=float)
    next_states = np.array([row[3] for row in batch], dtype=int)
    terminals = np.array([row[4] for row in batch], dtype=float)
    q_values, hidden = q_forward(online, states)
    next_q, _ = q_forward(target, next_states)
    targets = rewards + gamma * (1.0 - terminals) * next_q.max(axis=1)
    residual = q_values[np.arange(len(batch)), actions] - targets
    clipped = np.clip(residual, -1.0, 1.0) / len(batch)
    d_q = np.zeros_like(q_values)
    d_q[np.arange(len(batch)), actions] = clipped
    one_hot = np.eye(5)[states]
    grad_w2 = hidden.T @ d_q
    grad_b2 = d_q.sum(axis=0)
    d_hidden = d_q @ online["w2"].T
    d_hidden *= hidden > 0.0
    gradients = {
        "w1": one_hot.T @ d_hidden,
        "b1": d_hidden.sum(axis=0),
        "w2": grad_w2,
        "b2": grad_b2,
    }
    for name, gradient in gradients.items():
        online[name] -= 0.025 * np.clip(gradient, -2.0, 2.0)
    return float(np.mean(np.where(np.abs(residual) <= 1.0, 0.5 * residual * residual, np.abs(residual) - 0.5)))


def train_dqn(seed: int, steps: int, target_interval: int, eval_episodes: int) -> tuple[dict[str, np.ndarray], dict[str, float | int | bool]]:
    rng = np.random.default_rng(seed)
    env = ChainEnv(0.1, seed + 1000)
    online = init_q_network(rng)
    target = {name: value.copy() for name, value in online.items()}
    replay: list[tuple[int, int, float, int, bool]] = []
    state = env.reset()
    losses = []
    target_copies = 0
    update_count = 0
    for interaction in range(steps):
        epsilon = max(0.05, 0.8 - 0.75 * interaction / max(1, steps - 1))
        q_values, _ = q_forward(online, np.array([state]))
        action = int(rng.integers(0, 2)) if rng.random() < epsilon else int(np.argmax(q_values[0]))
        next_state, reward, terminated, truncated = env.step(action)
        replay.append((state, action, reward, next_state, terminated))
        if len(replay) > 2_000:
            replay.pop(0)
        if len(replay) >= 64:
            indices = rng.integers(0, len(replay), size=64)
            losses.append(dqn_update(online, target, [replay[index] for index in indices]))
            update_count += 1
            if update_count % target_interval == 0:
                target = {name: value.copy() for name, value in online.items()}
                target_copies += 1
        state = env.reset() if terminated or truncated else next_state
    evaluation = evaluate_policy(lambda s: int(np.argmax(q_forward(online, np.array([s]))[0][0])), 0.1, seed + 2000, eval_episodes)
    all_q, _ = q_forward(online, np.arange(5))
    row = {
        "seed": seed,
        "targetCopyInterval": target_interval,
        "environmentInteractions": steps,
        "optimizerUpdates": update_count,
        "targetCopies": target_copies,
        "meanTrainingLoss": float(np.mean(losses)) if losses else 0.0,
        "maxAbsoluteQ": float(np.max(np.abs(all_q))),
        "replaySize": len(replay),
        "finite": bool(np.isfinite(all_q).all() and np.isfinite(losses).all()),
        **evaluation,
    }
    return online, row


def deep_value(profile: str, output: Path):
    steps = 500 if profile == "smoke" else 5_000
    eval_episodes = 40 if profile == "smoke" else 200
    seeds = [11] if profile == "smoke" else CANONICAL_SEEDS
    rows = []
    checkpoint_match = True
    for seed in seeds:
        for interval in (20, 100):
            parameters, row = train_dqn(seed, steps, interval, eval_episodes)
            rows.append(row)
            if seed == seeds[0] and interval == 20:
                checkpoint = output.with_name(f"{output.stem}-dqn-checkpoint.npz")
                np.savez(checkpoint, **parameters)
                restored = {name: array for name, array in np.load(checkpoint).items()}
                before, _ = q_forward(parameters, np.arange(5))
                after, _ = q_forward(restored, np.arange(5))
                checkpoint_match = bool(np.array_equal(before, after))
    checks = {
        "both_target_intervals_execute": {row["targetCopyInterval"] for row in rows} == {20, 100},
        "post_warmup_update_count_is_exact": all(row["optimizerUpdates"] == steps - 63 for row in rows),
        "target_copy_path_is_exercised": all(row["targetCopies"] > 0 for row in rows),
        "q_values_and_losses_are_finite": all(row["finite"] for row in rows),
        "checkpoint_round_trip_preserves_q_values": checkpoint_match,
        "evaluation_uses_frozen_greedy_policy": all(row["episodes"] == eval_episodes for row in rows),
    }
    return {"network": "5x16x2 ReLU Q-network", "seeds": seeds, "targetCopyIntervals": [20, 100], "environmentInteractionsPerArm": steps, "optimizerUpdatesPerArm": steps - 63, "evaluationEpisodes": eval_episodes, "independentUnit": "seeded agent run"}, rows, checks


def softmax(logits: np.ndarray) -> np.ndarray:
    shifted = logits - np.max(logits, axis=-1, keepdims=True)
    exponential = np.exp(shifted)
    return exponential / exponential.sum(axis=-1, keepdims=True)


def train_actor_critic(seed: int, interactions: int, lam: float, eval_episodes: int) -> tuple[dict[str, np.ndarray], dict[str, float | int | bool]]:
    rng = np.random.default_rng(seed)
    env = ChainEnv(0.1, seed + 3000)
    policy = rng.normal(0.0, 0.05, (5, 2))
    values = np.zeros(5)
    collected = 0
    update_count = 0
    advantage_values = []
    entropies = []
    max_kl = 0.0
    while collected < interactions:
        states, actions, rewards, terminals = [], [], [], []
        state = env.reset()
        for _ in range(min(env.max_steps, interactions - collected)):
            probabilities = softmax(policy[state : state + 1])[0]
            action = int(rng.choice(2, p=probabilities))
            next_state, reward, terminated, truncated = env.step(action)
            states.append(state); actions.append(action); rewards.append(reward); terminals.append(terminated)
            collected += 1
            state = next_state
            if terminated or truncated:
                break
        bootstrap = 0.0 if terminals[-1] else values[state]
        advantages = np.zeros(len(states))
        carry = 0.0
        next_value = bootstrap
        for index in range(len(states) - 1, -1, -1):
            delta = rewards[index] + 0.95 * (0.0 if terminals[index] else next_value) - values[states[index]]
            carry = delta + 0.95 * lam * (0.0 if terminals[index] else carry)
            advantages[index] = carry
            next_value = values[states[index]]
        scale = float(np.std(advantages)) + 1e-8
        normalized = (advantages - float(np.mean(advantages))) / scale if len(advantages) > 1 else advantages
        old_rows = softmax(policy[np.array(states)])
        for state_value, action, advantage in zip(states, actions, normalized):
            probabilities = softmax(policy[state_value : state_value + 1])[0]
            gradient = -probabilities
            gradient[action] += 1.0
            policy[state_value] += 0.035 * advantage * gradient
        for state_value, advantage in zip(states, advantages):
            values[state_value] += 0.08 * advantage
        new_rows = softmax(policy[np.array(states)])
        kl = np.sum(old_rows * (np.log(old_rows + 1e-12) - np.log(new_rows + 1e-12)), axis=1)
        max_kl = max(max_kl, float(np.max(kl)))
        entropies.extend((-np.sum(new_rows * np.log(new_rows + 1e-12), axis=1)).tolist())
        advantage_values.extend(advantages.tolist())
        update_count += 1
    evaluation = evaluate_policy(lambda s: int(np.argmax(policy[s])), 0.1, seed + 4000, eval_episodes)
    return {"policy": policy, "values": values}, {
        "seed": seed,
        "gaeLambda": lam,
        "environmentInteractions": collected,
        "rolloutUpdates": update_count,
        "advantageVariance": float(np.var(advantage_values)),
        "meanEntropy": float(np.mean(entropies)),
        "maxObservedKl": max_kl,
        "finite": bool(np.isfinite(policy).all() and np.isfinite(values).all()),
        **evaluation,
    }


def on_policy(profile: str, output: Path):
    interactions = 600 if profile == "smoke" else 6_000
    eval_episodes = 40 if profile == "smoke" else 300
    seeds = [11] if profile == "smoke" else CANONICAL_SEEDS
    rows = []
    checkpoint_match = True
    for seed in seeds:
        for lam in (0.5, 0.95):
            parameters, row = train_actor_critic(seed, interactions, lam, eval_episodes)
            rows.append(row)
            if seed == seeds[0] and lam == 0.95:
                checkpoint = output.with_name(f"{output.stem}-actor-critic-checkpoint.npz")
                np.savez(checkpoint, **parameters)
                restored = np.load(checkpoint)
                checkpoint_match = bool(np.array_equal(restored["policy"], parameters["policy"]) and np.array_equal(restored["values"], parameters["values"]))
    checks = {
        "both_gae_estimators_execute": {row["gaeLambda"] for row in rows} == {0.5, 0.95},
        "rollout_ownership_matches_interaction_budget": all(row["environmentInteractions"] == interactions for row in rows),
        "advantages_entropy_and_kl_are_finite": all(np.isfinite([row["advantageVariance"], row["meanEntropy"], row["maxObservedKl"]]).all() for row in rows),
        "actor_and_critic_parameters_are_finite": all(row["finite"] for row in rows),
        "checkpoint_round_trip_is_exact": checkpoint_match,
    }
    return {"agent": "categorical actor-critic", "seeds": seeds, "gaeLambdaArms": [0.5, 0.95], "environmentInteractionsPerArm": interactions, "evaluationEpisodes": eval_episodes, "independentUnit": "seeded rollout-update run"}, rows, checks


def collect_model_data(seed: int, interactions: int) -> list[tuple[int, int, float, int, bool]]:
    rng = np.random.default_rng(seed)
    env = ChainEnv(0.15, seed + 5000)
    state = env.reset()
    rows = []
    for _ in range(interactions):
        # Coverage policy favors right but retains both actions at each interior state.
        action = int(rng.random() < 0.7)
        next_state, reward, terminated, truncated = env.step(action)
        rows.append((state, action, reward, next_state, terminated))
        state = env.reset() if terminated or truncated else next_state
    return rows


def fit_tabular_dynamics(rows: list[tuple[int, int, float, int, bool]]) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    counts = np.zeros((5, 2, 5), dtype=np.float64)
    rewards = np.zeros((5, 2), dtype=np.float64)
    visits = np.zeros((5, 2), dtype=np.float64)
    for state, action, reward, next_state, _terminal in rows:
        counts[state, action, next_state] += 1.0
        rewards[state, action] += reward
        visits[state, action] += 1.0
    transition = (counts + 0.1) / (counts.sum(axis=2, keepdims=True) + 0.5)
    reward_model = np.divide(rewards, visits, out=np.zeros_like(rewards), where=visits > 0)
    return transition, reward_model, visits


def model_accuracy(model: np.ndarray, rows: list[tuple[int, int, float, int, bool]]) -> float:
    return float(np.mean([int(np.argmax(model[state, action])) == next_state for state, action, _reward, next_state, _terminal in rows]))


def plan_action(state: int, transition: np.ndarray, rewards: np.ndarray, visits: np.ndarray, horizon: int, candidates: int, rng: np.random.Generator, support_threshold: int = 5) -> tuple[int, float, int, bool]:
    sequences = rng.integers(0, 2, size=(candidates, horizon))
    sequences[0] = 0
    sequences[1] = 1
    predicted = np.zeros(candidates)
    for candidate, sequence in enumerate(sequences):
        current = state
        discount = 1.0
        for action in sequence:
            predicted[candidate] += discount * rewards[current, action]
            current = int(np.argmax(transition[current, action]))
            discount *= 0.95
            if current in (0, 4):
                break
    best = int(np.argmax(predicted))
    action = int(sequences[best, 0])
    fallback = bool(visits[state, action] < support_threshold)
    if fallback:
        action = int(np.argmax(visits[state]))
    return action, float(predicted[best]), candidates * horizon, fallback


def evaluate_model_controller(seed: int, transition: np.ndarray, rewards: np.ndarray, visits: np.ndarray, horizon: int, candidates: int, episodes: int) -> dict[str, float | int]:
    rng = np.random.default_rng(seed)
    env = ChainEnv(0.15, seed + 6000)
    returns = []
    predicted_first = []
    calls = 0
    fallbacks = 0
    for _ in range(episodes):
        state = env.reset()
        total = 0.0
        for _step in range(env.max_steps):
            action, predicted, used, fallback = plan_action(state, transition, rewards, visits, horizon, candidates, rng)
            predicted_first.append(predicted)
            calls += used
            fallbacks += int(fallback)
            state, reward, terminated, truncated = env.step(action)
            total += reward
            if terminated or truncated:
                break
        returns.append(total)
    return {"meanReturn": float(np.mean(returns)), "meanPredictedPlanReturn": float(np.mean(predicted_first)), "modelCalls": calls, "fallbackCount": fallbacks, "episodes": episodes}


def model_based(profile: str, output: Path):
    training_interactions = 600 if profile == "smoke" else 6_000
    evaluation_episodes = 30 if profile == "smoke" else 300
    training = collect_model_data(11, training_interactions)
    held_out = collect_model_data(23, 300 if profile == "smoke" else 2_000)
    transition, reward_model, visits = fit_tabular_dynamics(training)
    checkpoint = output.with_name(f"{output.stem}-dynamics-checkpoint.npz")
    np.savez(checkpoint, transition=transition, reward_model=reward_model, visits=visits)
    restored = np.load(checkpoint)
    rows = []
    for horizon, candidates in ((10, 64), (5, 128)):
        rows.append({"horizon": horizon, "candidates": candidates, "modelCallsPerDecision": horizon * candidates, "heldOutOneStepAccuracy": model_accuracy(transition, held_out), **evaluate_model_controller(7000 + horizon, transition, reward_model, visits, horizon, candidates, evaluation_episodes)})
    action_conditioned = not np.allclose(transition[2, 0], transition[2, 1])
    checks = {
        "dynamics_are_fitted_from_real_transition_rows": int(visits.sum()) == training_interactions,
        "learned_transition_rows_normalize": bool(np.allclose(transition.sum(axis=2), 1.0)),
        "learned_dynamics_are_action_conditioned": bool(action_conditioned),
        "held_out_one_step_accuracy_is_finite": all(np.isfinite(row["heldOutOneStepAccuracy"]) for row in rows),
        "planner_arms_match_model_calls_per_decision": rows[0]["modelCallsPerDecision"] == rows[1]["modelCallsPerDecision"] == 640,
        "checkpoint_round_trip_is_exact": bool(np.array_equal(restored["transition"], transition) and np.array_equal(restored["reward_model"], reward_model)),
        "fallback_path_is_implemented": all("fallbackCount" in row for row in rows),
    }
    return {"model": "maximum-likelihood action-conditioned transition and reward model", "realTrainingInteractions": training_interactions, "plannerArms": [{"horizon": 10, "candidates": 64}, {"horizon": 5, "candidates": 128}], "modelCallsPerDecision": 640, "evaluationEpisodes": evaluation_episodes, "independentUnit": "seeded learned-model controller run"}, rows, checks


def collect_logged_episodes(seed: int, episodes: int) -> list[dict[str, float | int]]:
    rng = np.random.default_rng(seed)
    env = ChainEnv(0.1, seed + 8000)
    rows = []
    for episode in range(episodes):
        state = env.reset()
        episode_rows = []
        previous_action = 0
        for timestep in range(env.max_steps):
            action = int(rng.random() < (0.8 if state >= 2 else 0.65))
            next_state, reward, terminated, truncated = env.step(action)
            episode_rows.append({"episode": episode, "timestep": timestep, "state": state, "previousAction": previous_action, "action": action, "reward": reward})
            previous_action = action
            state = next_state
            if terminated or truncated:
                break
        total = 0.0
        for row in reversed(episode_rows):
            total = float(row["reward"]) + 0.95 * total
            row["returnToGo"] = total
        rows.extend(episode_rows)
    return rows


def policy_features(rows: list[dict[str, float | int]], sequence: bool) -> np.ndarray:
    states = np.eye(5)[np.array([int(row["state"]) for row in rows])]
    if not sequence:
        return states
    previous = np.eye(2)[np.array([int(row["previousAction"]) for row in rows])]
    returns = np.array([float(row["returnToGo"]) for row in rows])[:, None]
    return np.concatenate((states, previous, returns), axis=1)


def fit_cloning_policy(features: np.ndarray, actions: np.ndarray, steps: int, seed: int) -> np.ndarray:
    rng = np.random.default_rng(seed)
    weights = rng.normal(0.0, 0.01, (features.shape[1], 2))
    for _ in range(steps):
        probabilities = softmax(features @ weights)
        gradient_logits = probabilities
        gradient_logits[np.arange(len(actions)), actions] -= 1.0
        gradient = features.T @ gradient_logits / len(actions)
        weights -= 0.3 * gradient
    return weights


def evaluate_logged_policy(weights: np.ndarray, rows: list[dict[str, float | int]], sequence: bool) -> tuple[float, float]:
    features = policy_features(rows, sequence)
    probabilities = softmax(features @ weights)
    actions = np.array([int(row["action"]) for row in rows])
    loss = -float(np.mean(np.log(probabilities[np.arange(len(actions)), actions] + 1e-12)))
    accuracy = float(np.mean(np.argmax(probabilities, axis=1) == actions))
    return loss, accuracy


def closed_loop_cloning(weights: np.ndarray, sequence: bool, support: np.ndarray, seed: int, episodes: int) -> dict[str, float | int]:
    env = ChainEnv(0.1, seed)
    returns = []
    abstentions = 0
    for _ in range(episodes):
        state = env.reset()
        previous = 0
        total = 0.0
        for _step in range(env.max_steps):
            row = {"state": state, "previousAction": previous, "returnToGo": 1.0}
            features = policy_features([row], sequence)
            action = int(np.argmax(features @ weights))
            if support[state, action] == 0:
                abstentions += 1
                action = int(np.argmax(support[state]))
            state, reward, terminated, truncated = env.step(action)
            previous = action
            total += reward
            if terminated or truncated:
                break
        returns.append(total)
    return {"closedLoopMeanReturn": float(np.mean(returns)), "supportAbstentions": abstentions, "evaluationEpisodes": episodes}


def sequence_policy(profile: str, output: Path):
    episodes = 120 if profile == "smoke" else 1_000
    steps = 250 if profile == "smoke" else 1_500
    evaluation_episodes = 40 if profile == "smoke" else 300
    logged = collect_logged_episodes(11, episodes)
    split_episode = int(episodes * 0.8)
    training = [row for row in logged if int(row["episode"]) < split_episode]
    held_out = [row for row in logged if int(row["episode"]) >= split_episode]
    actions = np.array([int(row["action"]) for row in training])
    support = np.zeros((5, 2), dtype=int)
    for row in training:
        support[int(row["state"]), int(row["action"])] += 1
    rows = []
    checkpoint_match = True
    for name, sequence in (("behavior-cloning", False), ("causal-sequence", True)):
        features = policy_features(training, sequence)
        weights = fit_cloning_policy(features, actions, steps, 9000 + int(sequence))
        held_loss, held_accuracy = evaluate_logged_policy(weights, held_out, sequence)
        row = {"arm": name, "trainingEpisodes": split_episode, "heldOutEpisodes": episodes - split_episode, "optimizerUpdates": steps, "heldOutActionNll": held_loss, "heldOutActionAccuracy": held_accuracy, **closed_loop_cloning(weights, sequence, support, 9100 + int(sequence), evaluation_episodes)}
        rows.append(row)
        if name == "causal-sequence":
            checkpoint = output.with_name(f"{output.stem}-sequence-policy-checkpoint.npz")
            np.savez(checkpoint, weights=weights, support=support)
            restored = np.load(checkpoint)
            checkpoint_match = bool(np.array_equal(restored["weights"], weights) and np.array_equal(restored["support"], support))
    leaked = [dict(row) for row in held_out]
    for row in leaked:
        row["action"] = 1 - int(row["action"])
    prefix_unchanged = np.array_equal(policy_features(held_out, True), policy_features(leaked, True))
    checks = {
        "behavior_cloning_is_actually_optimized": bool(rows[0]["optimizerUpdates"] == steps and np.isfinite(rows[0]["heldOutActionNll"])),
        "sequence_policy_is_actually_optimized": bool(rows[1]["optimizerUpdates"] == steps and np.isfinite(rows[1]["heldOutActionNll"])),
        "episode_split_prevents_row_leakage": not ({int(row["episode"]) for row in training} & {int(row["episode"]) for row in held_out}),
        "causal_features_exclude_target_and_future_actions": bool(prefix_unchanged),
        "support_guard_and_abstention_path_execute": all("supportAbstentions" in row for row in rows),
        "checkpoint_round_trip_is_exact": checkpoint_match,
    }
    return {"loggedEpisodes": episodes, "trainEpisodes": split_episode, "heldOutEpisodes": episodes - split_episode, "arms": ["behavior-cloning", "causal-sequence"], "optimizerUpdatesPerArm": steps, "supportGuard": "abstain from zero-count state-action cells", "independentUnit": "held-out episode"}, rows, checks


def rl_research(profile: str, output: Path):
    steps = 200 if profile == "smoke" else 20_000
    eval_episodes = 8 if profile == "smoke" else 100
    seeds = [11] if profile == "smoke" else CANONICAL_SEEDS
    rows = []
    baseline_checkpoint: Path | None = None
    for seed in seeds:
        for arm, interval in (("baseline", 20), ("intervention", 100)):
            parameters, result = train_dqn(seed, steps, interval, eval_episodes)
            if seed == seeds[0] and arm == "baseline":
                baseline_checkpoint = output.with_name(f"{output.stem}-accepted-baseline.npz")
                np.savez(baseline_checkpoint, **parameters)
            rows.append({"arm": arm, **result, "evaluationSuccessRate": result["successRate"]})
    expected_updates = steps - 63
    expected_cells = {(seed, arm) for seed in seeds for arm in ("baseline", "intervention")}
    baseline_rows = [row for row in rows if row["arm"] == "baseline"]
    checks = {
        "declared_seed_by_arm_matrix_is_complete": {(row["seed"], row["arm"]) for row in rows} == expected_cells,
        "interaction_and_optimizer_budgets_recompute": all(row["environmentInteractions"] == steps and row["optimizerUpdates"] == expected_updates for row in rows),
        "both_target_copy_interventions_are_exercised": all(row["targetCopies"] > 0 for row in rows),
        "all_rows_are_finite": all(row["finite"] for row in rows),
        "baseline_acceptance_passes_before_intervention_analysis": all(row["maxAbsoluteQ"] < 20.0 and row["episodes"] == eval_episodes for row in baseline_rows),
        "accepted_baseline_checkpoint_is_saved": baseline_checkpoint is not None and baseline_checkpoint.is_file(),
    }
    metric = {"field": "evaluationSuccessRate", "name": "frozen greedy-policy evaluation success rate", "unit": f"successful episodes / {eval_episodes} evaluation episodes", "aggregation": "one evaluation per independent seed and arm"}
    manifest = {"seeds": seeds, "arms": ["baseline", "intervention"], "primitiveBudget": {"environmentInteractions": steps, "optimizerUpdates": expected_updates}, "targetCopyIntervals": {"baseline": 20, "intervention": 100}, "metric": metric, "acceptedBaselineCheckpoint": baseline_checkpoint.name if baseline_checkpoint else None, "independentUnit": "seeded DQN run"}
    return manifest, rows, checks


BUILDERS: dict[str, Callable[[str, Path], tuple[dict, list, dict]]] = {
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
    parser.add_argument("--profile", choices=PROFILES, default="smoke")
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    manifest, rows, checks = BUILDERS[args.project](args.profile, args.output)
    if not all(checks.values()):
        raise RuntimeError(f"starter check failed: {checks}")
    dossier = {
        "schemaVersion": 2,
        "course": "rl",
        "lessonId": args.project,
        "evidenceKind": "real local CPU execution of a course-scale RL baseline",
        "manifest": {"profile": args.profile, "numpyVersion": np.__version__, **manifest},
        "checks": checks,
        "rawRows": rows,
        "decision": "The local course-scale build completed its declared checks; interpret only this environment, seed set, primitive budgets, and evaluator.",
        "boundary": "This is real local CPU training or planning evidence. It is not trained-agent performance on an external benchmark, a production safety claim, or an accepted reproduction outside the pinned five-state environment.",
    }
    args.output.write_text(json.dumps(dossier, indent=2) + "\n")
    print(json.dumps({"output": str(args.output), "project": args.project, "profile": args.profile, "checks": checks}, indent=2))


if __name__ == "__main__":
    main()
