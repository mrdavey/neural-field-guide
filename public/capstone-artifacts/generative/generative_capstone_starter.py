#!/usr/bin/env python3
"""Dependency-free mechanism starters for the six Generative Models capstones.

These functions execute small deterministic fixtures. They do not train a neural
generator or supply experimental measurements. Replace the named mechanism while
retaining the checks, canonical comparison cells, failures, and claim boundary.
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Callable


PROJECT_IDS = (
    "distribution-workbench-capstone",
    "latent-models-capstone",
    "flow-energy-capstone",
    "diffusion-model-capstone",
    "conditional-safety-capstone",
    "generative-research-capstone",
)


def distribution_workbench():
    probabilities = [0.02, 0.48, 0.50]

    def sample(u: float) -> int:
        cumulative = 0.0
        for index, probability in enumerate(probabilities):
            cumulative += probability
            if u < cumulative:
                return index
        raise AssertionError("normalized support should contain u")

    uniforms = [0.01, 0.03, 0.49, 0.50, 0.99]
    draws = [sample(u) for u in uniforms]
    rows = [{"u": u, "sample": draw} for u, draw in zip(uniforms, draws)]
    checks = {
        "probability_mass_is_one": math.isclose(sum(probabilities), 1.0),
        "support_order_is_explicit": draws == [0, 1, 1, 2, 2],
        "seed_replay_contract_is_testable": [sample(u) for u in uniforms] == draws,
    }
    manifest = {"probabilities": probabilities, "ordering": [0, 1, 2], "independentUnit": "seeded sample batch"}
    return manifest, rows, checks


def latent_models():
    def elbo(reconstruction_nll: float, mean: float, log_variance: float, beta: float) -> dict[str, float]:
        kl = 0.5 * (mean * mean + math.exp(log_variance) - 1.0 - log_variance)
        return {"reconstructionNll": reconstruction_nll, "kl": kl, "beta": beta, "loss": reconstruction_nll + beta * kl}

    baseline = {"arm": "beta=1", **elbo(0.20, 0.4, math.log(0.8), 1.0)}
    annealed = {"arm": "KL annealing", **elbo(0.20, 0.4, math.log(0.8), 0.3)}
    collapsed = elbo(0.20, 0.0, 0.0, 1.0)
    checks = {
        "kl_is_nonnegative": baseline["kl"] >= 0 and annealed["kl"] >= 0,
        "annealing_changes_weight_not_kl_definition": math.isclose(baseline["kl"], annealed["kl"]),
        "standard_normal_posterior_has_zero_kl": math.isclose(collapsed["kl"], 0.0),
        "collapse_probe_is_separate_from_reconstruction": collapsed["reconstructionNll"] == baseline["reconstructionNll"],
    }
    return {"latentDimensions": 1, "independentUnit": "seeded train/evaluation run"}, [baseline, annealed], checks


def flow_energy():
    scale, shift, x = 1.5, -0.25, 0.8
    z = scale * x + shift
    reconstructed = (z - shift) / scale
    log_abs_det = math.log(abs(scale))

    def energy(value: float) -> float:
        return 0.5 * value * value

    step_size = 0.1
    langevin_before = 2.0
    langevin_after = langevin_before - step_size * langevin_before
    rows = [
        {"family": "flow", "x": x, "z": z, "reconstructedX": reconstructed, "logAbsDet": log_abs_det, "budgetUnit": "direct samples", "budgetAmount": 1},
        {"family": "energy", "before": langevin_before, "after": langevin_after, "energyBefore": energy(langevin_before), "energyAfter": energy(langevin_after), "budgetUnit": "gradient evaluations", "budgetAmount": 1},
    ]
    checks = {
        "flow_round_trip_is_exact": math.isclose(reconstructed, x),
        "flow_log_determinant_matches_scale": math.isclose(log_abs_det, math.log(1.5)),
        "energy_gradient_step_lowers_quadratic_energy": energy(langevin_after) < energy(langevin_before),
        "family_cost_units_are_not_equated": rows[0]["budgetUnit"] != rows[1]["budgetUnit"],
    }
    return {"target": "one-dimensional mechanism fixture", "independentUnit": "seeded sampler run"}, rows, checks


def diffusion_model():
    alpha_bar, x0, epsilon = 0.64, 0.75, -0.5
    xt = math.sqrt(alpha_bar) * x0 + math.sqrt(1 - alpha_bar) * epsilon
    reconstructed = (xt - math.sqrt(1 - alpha_bar) * epsilon) / math.sqrt(alpha_bar)
    rows = [
        {"sampler": "baseline", "evaluations": 50, "startNoise": epsilon, "status": "fixture-only"},
        {"sampler": "treatment", "evaluations": 20, "startNoise": epsilon, "status": "fixture-only"},
    ]
    checks = {
        "forward_corruption_matches_declared_equation": math.isclose(xt, 0.3),
        "epsilon_target_reconstructs_x0": math.isclose(reconstructed, x0),
        "paired_samplers_share_start_noise": rows[0]["startNoise"] == rows[1]["startNoise"],
        "model_evaluation_budget_is_explicit": rows[0]["evaluations"] == 50 and rows[1]["evaluations"] == 20,
    }
    return {"alphaBar": alpha_bar, "parameterization": "epsilon", "independentUnit": "fixed starting noise"}, rows, checks


def conditional_safety():
    unconditional, conditional = 0.2, 0.7

    def guided(scale: float) -> float:
        return unconditional + scale * (conditional - unconditional)

    rows = [{"scale": scale, "guidedValue": guided(scale), "insideTrainingEndpoints": 0.0 <= guided(scale) <= 1.0} for scale in (1.0, 2.0, 4.0)]
    checks = {
        "scale_one_recovers_conditional_prediction": math.isclose(rows[0]["guidedValue"], conditional),
        "larger_scale_is_extrapolation": rows[1]["guidedValue"] > conditional,
        "hard_validity_gate_can_block_high_scale": rows[2]["insideTrainingEndpoints"] is False,
    }
    return {"unconditional": unconditional, "conditional": conditional, "independentUnit": "condition-scale-seed cell"}, rows, checks


def generative_research():
    effects = {1: 0.03, 2: -0.03, 3: 0.02, 4: -0.02, 5: 0.01}
    rows = [{"seed": seed, "arm": arm, "budget": {"modelEvaluations": 100}, "score": 0.60 + (effect if arm == "treatment" else 0.0)} for seed, effect in effects.items() for arm in ("baseline", "treatment")]
    expected = {(seed, arm) for seed in effects for arm in ("baseline", "treatment")}
    actual = {(row["seed"], row["arm"]) for row in rows}
    mean_effect = sum(effects.values()) / len(effects)
    checks = {
        "complete_five_seed_pairing": actual == expected,
        "primitive_budgets_match": len({row["budget"]["modelEvaluations"] for row in rows}) == 1,
        "mixed_effects_are_preserved": min(effects.values()) < 0 < max(effects.values()),
        "mean_effect_recomputes": math.isclose(mean_effect, 0.002),
    }
    return {"seeds": list(effects), "arms": ["baseline", "treatment"], "independentUnit": "seeded run"}, rows, checks


BUILDERS: dict[str, Callable] = {
    "distribution-workbench-capstone": distribution_workbench,
    "latent-models-capstone": latent_models,
    "flow-energy-capstone": flow_energy,
    "diffusion-model-capstone": diffusion_model,
    "conditional-safety-capstone": conditional_safety,
    "generative-research-capstone": generative_research,
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
        "course": "generative",
        "lessonId": args.project,
        "evidenceKind": "real local execution of deterministic starter fixtures",
        "manifest": {"profile": "starter-check", **manifest},
        "checks": checks,
        "rawRows": rows,
        "decision": "All starter mechanism checks passed; replace the named fixture with the working system before evaluating the capstone hypothesis.",
        "boundary": "This output proves local deterministic starter wiring only. It is not a trained-generator result, dataset measurement, baseline reproduction, or intervention outcome.",
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(dossier, indent=2) + "\n")
    print(json.dumps({"output": str(args.output), "project": args.project, "checks": checks}, indent=2))


if __name__ == "__main__":
    main()
