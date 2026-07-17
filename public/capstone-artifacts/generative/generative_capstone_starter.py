#!/usr/bin/env python3
"""Runnable local CPU baselines for the six Generative Models capstones.

The three model-building projects train or fit deliberately small NumPy systems:
an 8x8 VAE, a verified 2D flow plus an energy sampler, and a 16x16
diffusion denoiser.  ``--profile smoke`` is the fast correctness path;
``--profile full`` expands seeds/steps while remaining a course-scale CPU run.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import math
import platform
from pathlib import Path
import time
from typing import Callable

try:
    import numpy as np
except ImportError as error:  # pragma: no cover - exercised on dependency failure
    raise SystemExit(
        "NumPy is required. Run: python3 -m pip install -r requirements-capstones.txt"
    ) from error


PROJECT_IDS = (
    "distribution-workbench-capstone",
    "latent-models-capstone",
    "flow-energy-capstone",
    "diffusion-model-capstone",
    "conditional-safety-capstone",
    "generative-research-capstone",
)
PROFILES = ("smoke", "full")


def sigmoid(value: np.ndarray) -> np.ndarray:
    value = np.clip(value, -30.0, 30.0)
    return 1.0 / (1.0 + np.exp(-value))


def binary_shapes(count: int, size: int, rng: np.random.Generator) -> tuple[np.ndarray, np.ndarray]:
    """Create inspectable bars/squares without downloads or hidden data."""
    images = np.zeros((count, size, size), dtype=np.float64)
    labels = np.arange(count) % 3
    for index, label in enumerate(labels):
        offset = 2 + (index // 3) % max(1, size - 4)
        if label == 0:
            images[index, :, offset : offset + 2] = 1.0
        elif label == 1:
            images[index, offset : offset + 2, :] = 1.0
        else:
            images[index, offset : offset + 3, offset : offset + 3] = 1.0
    # A small declared flip rate prevents a perfectly duplicated lookup table.
    flips = rng.random(images.shape) < 0.01
    images = np.where(flips, 1.0 - images, images)
    return images.reshape(count, -1), labels


def distribution_workbench(profile: str, _output: Path):
    probabilities = np.array([0.02, 0.48, 0.50], dtype=np.float64)
    sample_counts = [100, 10_000]
    seeds = [1, 2, 3] if profile == "smoke" else list(range(1, 21))
    rows = []
    draws_by_cell: dict[tuple[int, int], np.ndarray] = {}
    for seed in seeds:
        for sample_count in sample_counts:
            # Reinitialize the same named generator for each arm. The 100-draw
            # control is therefore an exact prefix of the 10,000-draw arm.
            rng = np.random.Generator(np.random.PCG64(seed))
            draws = rng.choice(3, size=sample_count, p=probabilities)
            draws_by_cell[(seed, sample_count)] = draws
            counts = np.bincount(draws, minlength=3)
            rows.append({
                "seed": seed,
                "arm": "control" if sample_count == 100 else "sample-count-intervention",
                "sampleCount": sample_count,
                "counts": counts.tolist(),
                "rareModeMissed": bool(counts[0] == 0),
            })
    replay = np.random.Generator(np.random.PCG64(seeds[0])).choice(3, size=100, p=probabilities)
    miss_rates = {
        str(sample_count): float(np.mean([
            row["rareModeMissed"] for row in rows if row["sampleCount"] == sample_count
        ]))
        for sample_count in sample_counts
    }
    paired_miss_effects = np.array([
        int(next(row["rareModeMissed"] for row in rows if row["seed"] == seed and row["sampleCount"] == 10_000))
        - int(next(row["rareModeMissed"] for row in rows if row["seed"] == seed and row["sampleCount"] == 100))
        for seed in seeds
    ], dtype=np.float64)
    analysis_rng = np.random.default_rng(20260717)
    bootstrap_draws = paired_miss_effects[
        analysis_rng.integers(0, len(paired_miss_effects), size=(10_000, len(paired_miss_effects)))
    ].mean(axis=1)
    paired_interval = np.percentile(bootstrap_draws, [2.5, 97.5]).tolist()
    fixed_contract = {
        "probabilities": probabilities.tolist(),
        "supportOrder": [0, 1, 2],
        "generator": "numpy.random.Generator(numpy.random.PCG64(seed))",
        "seeds": seeds,
        "drawApi": "Generator.choice(3, p=probabilities)",
        "rareMode": 0,
        "metric": "fraction of seeded batches with rareCount == 0",
    }
    checks = {
        "sampler_correctness_probability_mass_is_one": bool(np.isclose(probabilities.sum(), 1.0)),
        "sampler_correctness_counts_cover_every_draw": all(sum(row["counts"]) == row["sampleCount"] for row in rows),
        "sampler_correctness_support_is_exact": all(len(row["counts"]) == 3 and min(row["counts"]) >= 0 for row in rows),
        "sampler_correctness_seed_replay_is_exact": replay.tolist() == np.random.Generator(np.random.PCG64(seeds[0])).choice(3, size=100, p=probabilities).tolist(),
        "intervention_matrix_has_both_counts_for_every_seed": {(row["seed"], row["sampleCount"]) for row in rows} == {(seed, sample_count) for seed in seeds for sample_count in sample_counts},
        "intervention_changes_only_sample_count": all(
            draws_by_cell[(seed, 10_000)][:100].tolist() == draws_by_cell[(seed, 100)].tolist()
            for seed in seeds
        ),
        "paired_miss_rate_effect_and_interval_are_finite": bool(np.isfinite(paired_miss_effects).all() and np.isfinite(paired_interval).all()),
    }
    manifest = {
        "studyDesign": "paired one-factor sample-count intervention",
        "controlSampleCount": 100,
        "interventionSampleCount": 10_000,
        "fixedContract": fixed_contract,
        "rareModeMissRateBySampleCount": miss_rates,
        "pairedMissRateDifferenceInterventionMinusControl": miss_rates["10000"] - miss_rates["100"],
        "pairedSeedEffectsInterventionMinusControl": paired_miss_effects.tolist(),
        "pairedPercentileBootstrap95": paired_interval,
        "analysisSeed": 20260717,
        "correctnessEvidence": "separate exact sampler invariants in checks",
        "effectEvidence": "paired rareModeMissed rows summarized above",
        "independentUnit": "paired seeded sample batch",
    }
    return manifest, rows, checks


def init_vae(rng: np.random.Generator, input_dim: int = 64, latent_dim: int = 2) -> dict[str, np.ndarray]:
    return {
        "w_mu": rng.normal(0.0, 0.04, (input_dim, latent_dim)),
        "b_mu": np.zeros(latent_dim),
        "w_logvar": rng.normal(0.0, 0.01, (input_dim, latent_dim)),
        "b_logvar": np.full(latent_dim, -1.0),
        "w_decoder": rng.normal(0.0, 0.04, (latent_dim, input_dim)),
        "b_decoder": np.zeros(input_dim),
    }


def vae_metrics(parameters: dict[str, np.ndarray], data: np.ndarray) -> dict[str, float | int]:
    mu = data @ parameters["w_mu"] + parameters["b_mu"]
    logvar = np.clip(data @ parameters["w_logvar"] + parameters["b_logvar"], -5.0, 2.0)
    reconstruction = sigmoid(mu @ parameters["w_decoder"] + parameters["b_decoder"])
    nll = -np.mean(data * np.log(reconstruction + 1e-8) + (1.0 - data) * np.log(1.0 - reconstruction + 1e-8))
    kl = 0.5 * np.mean(mu * mu + np.exp(logvar) - 1.0 - logvar)
    active_units = int(np.sum(np.var(mu, axis=0) > 1e-3))
    if len(data) > 1:
        swapped = mu.copy()
        swapped[[0, 1], 0] = swapped[[1, 0], 0]
        swap_effect = float(np.mean(np.abs(sigmoid(swapped @ parameters["w_decoder"] + parameters["b_decoder"]) - reconstruction)))
    else:
        swap_effect = 0.0
    return {"reconstructionNll": float(nll), "kl": float(kl), "activeUnits": active_units, "latentSwapEffect": swap_effect}


def train_vae(data: np.ndarray, seed: int, steps: int, anneal: bool) -> tuple[dict[str, np.ndarray], dict[str, float | int], float]:
    rng = np.random.default_rng(seed)
    parameters = init_vae(rng, data.shape[1], 2)
    initial_nll = float(vae_metrics(parameters, data)["reconstructionNll"])
    batch_size = min(32, len(data))
    learning_rate = 0.18
    for step in range(steps):
        indices = rng.integers(0, len(data), size=batch_size)
        batch = data[indices]
        mu = batch @ parameters["w_mu"] + parameters["b_mu"]
        raw_logvar = batch @ parameters["w_logvar"] + parameters["b_logvar"]
        logvar = np.clip(raw_logvar, -5.0, 2.0)
        standard_deviation = np.exp(0.5 * logvar)
        epsilon = rng.normal(size=mu.shape)
        latent = mu + standard_deviation * epsilon
        reconstruction = sigmoid(latent @ parameters["w_decoder"] + parameters["b_decoder"])
        beta = min(1.0, (step + 1) / max(1, int(0.3 * steps))) if anneal else 1.0

        d_logits = (reconstruction - batch) / (batch_size * batch.shape[1])
        grad_w_decoder = latent.T @ d_logits
        grad_b_decoder = d_logits.sum(axis=0)
        d_latent = d_logits @ parameters["w_decoder"].T
        d_mu = d_latent + beta * mu / (batch_size * mu.shape[1])
        d_logvar = d_latent * epsilon * 0.5 * standard_deviation
        d_logvar += beta * 0.5 * (np.exp(logvar) - 1.0) / (batch_size * mu.shape[1])
        d_logvar *= ((raw_logvar > -5.0) & (raw_logvar < 2.0))

        gradients = {
            "w_mu": batch.T @ d_mu,
            "b_mu": d_mu.sum(axis=0),
            "w_logvar": batch.T @ d_logvar,
            "b_logvar": d_logvar.sum(axis=0),
            "w_decoder": grad_w_decoder,
            "b_decoder": grad_b_decoder,
        }
        for name, gradient in gradients.items():
            parameters[name] -= learning_rate * np.clip(gradient, -2.0, 2.0)
    return parameters, vae_metrics(parameters, data), initial_nll


def latent_models(profile: str, output: Path):
    steps = 220 if profile == "smoke" else 900
    seeds = [11] if profile == "smoke" else [11, 23, 41]
    data_rng = np.random.default_rng(7001)
    train, _ = binary_shapes(72 if profile == "smoke" else 180, 8, data_rng)
    held_out, _ = binary_shapes(30, 8, np.random.default_rng(7002))
    rows = []
    checkpoint_parameters: dict[str, np.ndarray] | None = None
    all_improved = True
    for seed in seeds:
        for arm, anneal in (("beta=1", False), ("KL-anneal-30pct", True)):
            parameters, train_metrics, initial_nll = train_vae(train, seed, steps, anneal)
            held_metrics = vae_metrics(parameters, held_out)
            all_improved = all_improved and float(train_metrics["reconstructionNll"]) < initial_nll
            rows.append({
                "seed": seed,
                "arm": arm,
                "trainingSteps": steps,
                "initialTrainReconstructionNll": initial_nll,
                "train": train_metrics,
                "heldOut": held_metrics,
            })
            if checkpoint_parameters is None:
                checkpoint_parameters = copy.deepcopy(parameters)
    assert checkpoint_parameters is not None
    checkpoint = output.with_name(f"{output.stem}-vae-checkpoint.npz")
    np.savez(checkpoint, **checkpoint_parameters)
    restored = {name: array for name, array in np.load(checkpoint).items()}
    before = vae_metrics(checkpoint_parameters, held_out)
    after = vae_metrics(restored, held_out)
    checks = {
        "vae_training_reduces_reconstruction_nll": bool(all_improved),
        "held_out_metrics_are_finite": all(np.isfinite([row["heldOut"]["reconstructionNll"], row["heldOut"]["kl"]]).all() for row in rows),
        "latent_shape_is_two_dimensional": checkpoint_parameters["w_mu"].shape == (64, 2),
        "checkpoint_round_trip_preserves_evaluation": before == after,
        "both_predeclared_arms_execute": {row["arm"] for row in rows} == {"beta=1", "KL-anneal-30pct"},
    }
    manifest = {
        "data": "generated 8x8 bars and squares",
        "latentDimensions": 2,
        "seeds": seeds,
        "trainingStepsPerArm": steps,
        "checkpoint": checkpoint.name,
        "independentUnit": "seeded train/evaluation run",
    }
    return manifest, rows, checks


def ring_data(count: int, rng: np.random.Generator) -> tuple[np.ndarray, np.ndarray]:
    labels = rng.integers(0, 8, size=count)
    angles = labels * (2.0 * math.pi / 8.0)
    centers = np.stack((3.0 * np.cos(angles), 3.0 * np.sin(angles)), axis=1)
    return centers + rng.normal(0.0, 0.22, size=(count, 2)), labels


def fit_triangular_flow(data: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    mean = data.mean(axis=0)
    covariance = np.cov(data.T) + np.eye(2) * 1e-5
    lower = np.linalg.cholesky(covariance)
    return mean, lower


def flow_to_base(data: np.ndarray, mean: np.ndarray, lower: np.ndarray) -> np.ndarray:
    return np.linalg.solve(lower, (data - mean).T).T


def flow_to_data(base: np.ndarray, mean: np.ndarray, lower: np.ndarray) -> np.ndarray:
    return base @ lower.T + mean


def mixture_energy_and_gradient(points: np.ndarray, centers: np.ndarray, sigma: float = 0.55) -> tuple[np.ndarray, np.ndarray]:
    differences = points[:, None, :] - centers[None, :, :]
    logits = -np.sum(differences * differences, axis=2) / (2.0 * sigma * sigma)
    maximum = logits.max(axis=1, keepdims=True)
    weights = np.exp(logits - maximum)
    normalizer = weights.sum(axis=1, keepdims=True)
    weights /= normalizer
    energy = -(maximum[:, 0] + np.log(normalizer[:, 0]))
    gradient = np.sum(weights[:, :, None] * differences, axis=1) / (sigma * sigma)
    return energy, gradient


def mode_summary(samples: np.ndarray, centers: np.ndarray) -> tuple[int, list[float]]:
    nearest = np.argmin(np.sum((samples[:, None, :] - centers[None, :, :]) ** 2, axis=2), axis=1)
    counts = np.bincount(nearest, minlength=8)
    occupancy = counts / counts.sum()
    return int(np.sum(counts > 0)), occupancy.round(4).tolist()


def shared_ring_quality(samples: np.ndarray, target_centers: np.ndarray) -> dict[str, float | int | list[float]]:
    squared_distances = np.sum((samples[:, None, :] - target_centers[None, :, :]) ** 2, axis=2)
    occupied, occupancy = mode_summary(samples, target_centers)
    return {
        "occupiedModes": occupied,
        "modeOccupancy": occupancy,
        "meanDistanceToNearestMode": float(np.mean(np.sqrt(np.min(squared_distances, axis=1)))),
    }


def flow_energy(profile: str, _output: Path):
    rng = np.random.default_rng(8101)
    train, train_labels = ring_data(512 if profile == "smoke" else 4096, rng)
    held_out, _ = ring_data(256 if profile == "smoke" else 1024, np.random.default_rng(8102))
    target_centers = np.stack([
        3.0 * np.cos(np.arange(8) * 2.0 * math.pi / 8.0),
        3.0 * np.sin(np.arange(8) * 2.0 * math.pi / 8.0),
    ], axis=1)
    mean, lower = fit_triangular_flow(train)
    held_base = flow_to_base(held_out, mean, lower)
    held_round_trip = flow_to_data(held_base, mean, lower)
    log_abs_det = float(np.log(np.diag(lower)).sum())
    held_nll = float(np.mean(0.5 * np.sum(held_base * held_base, axis=1) + math.log(2.0 * math.pi) + log_abs_det))
    retained_sample_count = 64 if profile == "smoke" else 256
    generation_seed = 8103
    flow_samples = flow_to_data(np.random.default_rng(generation_seed).normal(size=(retained_sample_count, 2)), mean, lower)
    flow_quality = shared_ring_quality(flow_samples, target_centers)

    fitted_centers = np.stack([train[train_labels == label].mean(axis=0) for label in range(8)])
    budgets = [20, 100, 500]
    chain_count = retained_sample_count
    starts = np.random.default_rng(generation_seed).normal(0.0, 3.0, size=(chain_count, 2))
    budget_unit = "deterministic scalar primitive operations per retained sample (DWU)"
    flow_dwu_per_sample = 8
    energy_gradient_dwu_per_state = 129
    langevin_update_dwu_per_state = 8
    energy_step_dwu_per_state = energy_gradient_dwu_per_state + langevin_update_dwu_per_state
    rows = [{
        "family": "flow",
        "budgetUnit": budget_unit,
        "budgetAmount": flow_dwu_per_sample,
        "deterministicWorkUnitsPerRetainedSample": flow_dwu_per_sample,
        "deterministicWorkUnitsTotal": flow_dwu_per_sample * retained_sample_count,
        "familyOperationUnit": "direct transforms per retained sample",
        "familyOperationCount": 1,
        "randomVariatesPerRetainedSample": 2,
        "sharedEvaluator": "occupied modes and mean distance to nearest pinned target center",
        "heldOutNll": held_nll,
        "roundTripMaxError": float(np.max(np.abs(held_round_trip - held_out))),
        **flow_quality,
    }]
    all_finite = True
    for budget in budgets:
        sampler_rng = np.random.default_rng(generation_seed)
        # Consume the same initial-state variates before drawing Langevin noise.
        sampler_rng.normal(0.0, 3.0, size=(chain_count, 2))
        chains = starts.copy()
        chain_trace = [chains.copy()]
        for _ in range(budget):
            _, gradient = mixture_energy_and_gradient(chains, fitted_centers)
            chains -= 0.5 * 0.08 ** 2 * gradient
            chains += 0.08 * sampler_rng.normal(size=chains.shape)
            chain_trace.append(chains.copy())
        energies, _ = mixture_energy_and_gradient(chains, fitted_centers)
        energy_quality = shared_ring_quality(chains, target_centers)
        trace_array = np.stack(chain_trace)
        before = trace_array[:-1, :, 0].reshape(-1)
        after = trace_array[1:, :, 0].reshape(-1)
        lag_one = float(np.corrcoef(before, after)[0, 1])
        work_per_sample = budget * energy_step_dwu_per_state
        all_finite = all_finite and bool(np.isfinite(chains).all() and np.isfinite(energies).all())
        rows.append({
            "family": "energy",
            "budgetUnit": budget_unit,
            "budgetAmount": work_per_sample,
            "deterministicWorkUnitsPerRetainedSample": work_per_sample,
            "deterministicWorkUnitsTotal": work_per_sample * retained_sample_count,
            "familyOperationUnit": "gradient evaluations per retained state",
            "familyOperationCount": budget,
            "totalGradientCalls": budget * chain_count,
            "randomVariatesPerRetainedSample": 2 * budget,
            "sharedEvaluator": "occupied modes and mean distance to nearest pinned target center",
            "meanEnergy": float(energies.mean()),
            "lagOneStateAutocorrelation": lag_one,
            **energy_quality,
        })
    checks = {
        "flow_round_trip_is_exact_within_float64_tolerance": rows[0]["roundTripMaxError"] < 1e-10,
        "flow_exact_density_is_finite": bool(np.isfinite(held_nll)),
        "energy_gradient_budgets_are_exact": all(row["totalGradientCalls"] == row["familyOperationCount"] * chain_count for row in rows[1:]),
        "langevin_states_and_energies_are_finite": bool(all_finite),
        "shared_dwu_axis_recomputes_from_operation_ledger": rows[0]["budgetAmount"] == flow_dwu_per_sample and all(row["budgetAmount"] == row["familyOperationCount"] * energy_step_dwu_per_state for row in rows[1:]),
        "shared_quality_evaluator_is_identical": len({row["sharedEvaluator"] for row in rows}) == 1,
        "family_native_operation_units_remain_distinct": rows[0]["familyOperationUnit"] != rows[1]["familyOperationUnit"],
        "retained_sample_counts_match_across_families": len(flow_samples) == chain_count,
        "all_eight_target_modes_are_represented_in_training": fitted_centers.shape == (8, 2),
    }
    manifest = {
        "studyDesign": "bounded cross-family benchmark; no causal treatment arm",
        "target": "generated eight-mode 2D ring",
        "flow": "fitted triangular affine bijection with exact inverse and log determinant",
        "energy": "fitted eight-component Gaussian-mixture energy with Langevin sampling",
        "energyBudgets": budgets,
        "chains": chain_count,
        "generationSeed": generation_seed,
        "retainedSamplesPerCell": retained_sample_count,
        "sharedQualityEvaluator": "occupied modes and mean distance to nearest pinned target center",
        "workAxis": {
            "name": budget_unit,
            "definition": "one declared scalar arithmetic, comparison, or transcendental operation in generation; RNG generation and quality evaluation excluded and reported separately",
            "interpretation": "reproducible algorithmic accounting, not wall-clock, energy, hardware, or information equivalence",
            "flowDirectTransformPerState": {
                "matrixMultiplications": 4,
                "matrixReductionAdditions": 2,
                "shiftAdditions": 2,
                "total": flow_dwu_per_sample,
            },
            "ebmPerGradientStepPerState": {
                "energyAndGradientOperations": energy_gradient_dwu_per_state,
                "langevinStateUpdateOperations": langevin_update_dwu_per_state,
                "total": energy_step_dwu_per_state,
            },
        },
        "familySpecificDiagnostics": {
            "flow": ["direct transforms", "round-trip error", "held-out normalized NLL"],
            "energy": ["gradient evaluations", "random variates", "raw energy", "lag-one state autocorrelation"],
        },
        "independentUnit": "seeded sampler run",
    }
    return manifest, rows, checks


def diffusion_stats(clean: np.ndarray, noises: np.ndarray, a: np.ndarray, s: np.ndarray, mean_image: np.ndarray, indices: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    matrix = np.zeros((len(a), 3, 3), dtype=np.float64)
    vector = np.zeros((len(a), 3), dtype=np.float64)
    mean_rows = np.broadcast_to(mean_image, (len(indices), clean.shape[1]))
    for timestep in range(len(a)):
        noisy = a[timestep] * clean[indices] + s[timestep] * noises[timestep, indices]
        features = np.stack((noisy, mean_rows, np.ones_like(noisy)), axis=2).reshape(-1, 3)
        target = noises[timestep, indices].reshape(-1)
        matrix[timestep] = features.T @ features
        vector[timestep] = features.T @ target
    return matrix, vector


def solve_diffusion_coefficients(matrix: np.ndarray, vector: np.ndarray) -> np.ndarray:
    regularizer = np.eye(3) * 1e-6
    return np.stack([np.linalg.solve(matrix[index] + regularizer, vector[index]) for index in range(len(matrix))])


def denoise_epsilon(noisy: np.ndarray, timestep: int, coefficients: np.ndarray, mean_image: np.ndarray) -> np.ndarray:
    weights = coefficients[timestep]
    return weights[0] * noisy + weights[1] * mean_image + weights[2]


def reverse_diffusion(starts: np.ndarray, schedule: list[int], coefficients: np.ndarray, mean_image: np.ndarray, a: np.ndarray, s: np.ndarray) -> np.ndarray:
    current = starts.copy()
    for position, timestep in enumerate(schedule):
        epsilon_hat = denoise_epsilon(current, timestep, coefficients, mean_image)
        clean_hat = np.clip((current - s[timestep] * epsilon_hat) / a[timestep], 0.0, 1.0)
        if position + 1 < len(schedule):
            next_timestep = schedule[position + 1]
            current = a[next_timestep] * clean_hat + s[next_timestep] * epsilon_hat
        else:
            current = clean_hat
    return current


def generated_shape_coverage(samples: np.ndarray, size: int = 16) -> tuple[int, list[int]]:
    images = samples.reshape(-1, size, size)
    vertical = images.sum(axis=1).max(axis=1)
    horizontal = images.sum(axis=2).max(axis=1)
    square_like = np.abs(vertical - horizontal) < 0.75
    labels = np.where(square_like, 2, np.where(vertical > horizontal, 0, 1))
    counts = np.bincount(labels, minlength=3)
    return int(np.sum(counts > 0)), counts.tolist()


def diffusion_model(profile: str, output: Path):
    timesteps = 50
    train_count = 72 if profile == "smoke" else 240
    clean, _ = binary_shapes(train_count, 16, np.random.default_rng(9001))
    held_out, _ = binary_shapes(30, 16, np.random.default_rng(9002))
    alpha_bar = np.linspace(0.98, 0.02, timesteps)
    a = np.sqrt(alpha_bar)
    s = np.sqrt(1.0 - alpha_bar)
    noises = np.random.default_rng(9003).normal(size=(timesteps, train_count, clean.shape[1]))
    mean_image = clean.mean(axis=0)
    split = train_count // 2
    first_matrix, first_vector = diffusion_stats(clean, noises, a, s, mean_image, np.arange(split))
    resume_checkpoint = output.with_name(f"{output.stem}-diffusion-resume-checkpoint.npz")
    np.savez(resume_checkpoint, matrix=first_matrix, vector=first_vector, mean_image=mean_image, alpha_bar=alpha_bar)
    restored = np.load(resume_checkpoint)
    second_matrix, second_vector = diffusion_stats(clean, noises, a, s, mean_image, np.arange(split, train_count))
    resumed_matrix = restored["matrix"] + second_matrix
    resumed_vector = restored["vector"] + second_vector
    coefficients = solve_diffusion_coefficients(resumed_matrix, resumed_vector)
    direct_matrix, direct_vector = diffusion_stats(clean, noises, a, s, mean_image, np.arange(train_count))
    direct_coefficients = solve_diffusion_coefficients(direct_matrix, direct_vector)
    evaluation_checkpoint = output.with_name(f"{output.stem}-diffusion-evaluation-checkpoint.npz")
    np.savez(evaluation_checkpoint, coefficients=coefficients, mean_image=mean_image, alpha_bar=alpha_bar)
    checkpoint_digest = hashlib.sha256(
        coefficients.tobytes() + mean_image.tobytes() + alpha_bar.tobytes()
    ).hexdigest()
    training_run_id = hashlib.sha256(
        f"binary-shapes|train-seed=9001|noise-seed=9003|count={train_count}|epsilon|float64".encode()
    ).hexdigest()

    held_noise = np.random.default_rng(9004).normal(size=held_out.shape)
    timestep_rows = []
    for timestep in (0, 12, 24, 36, 49):
        noisy = a[timestep] * held_out + s[timestep] * held_noise
        prediction = denoise_epsilon(noisy, timestep, coefficients, mean_image)
        timestep_rows.append({"timestep": timestep, "heldOutNoiseMse": float(np.mean((prediction - held_noise) ** 2))})

    start_seeds = list(range(31, 39)) if profile == "smoke" else list(range(31, 63))
    start_count = len(start_seeds)
    starts = np.stack([np.random.default_rng(seed).normal(size=clean.shape[1]) for seed in start_seeds])
    starts_digest = hashlib.sha256(starts.tobytes()).hexdigest()
    baseline_schedule = list(range(49, -1, -1))
    treatment_schedule = np.rint(np.linspace(49, 0, 20)).astype(int).tolist()
    rows = []
    quality_summary_by_nfe = {}
    execution_environment = {
        "device": "CPU in the same Python process",
        "platform": platform.platform(),
        "numpyVersion": np.__version__,
        "dtype": "float64",
    }
    evaluator_id = "nearest-held-out-mse+shape-class-coverage-v1"
    for arm, schedule in (("control", baseline_schedule), ("nfe-intervention", treatment_schedule)):
        started = time.perf_counter()
        generated = reverse_diffusion(starts, schedule, coefficients, mean_image, a, s)
        wall_seconds = time.perf_counter() - started
        distances = np.mean((generated[:, None, :] - held_out[None, :, :]) ** 2, axis=2)
        coverage, counts = generated_shape_coverage(generated)
        images = generated.reshape(-1, 16, 16)
        vertical = images.sum(axis=1).max(axis=1)
        horizontal = images.sum(axis=2).max(axis=1)
        shape_labels = np.where(np.abs(vertical - horizontal) < 0.75, 2, np.where(vertical > horizontal, 0, 1))
        quality_summary_by_nfe[str(len(schedule))] = {
            "meanNearestHeldOutMse": float(np.mean(np.min(distances, axis=1))),
            "shapeClassesOccupied": coverage,
            "shapeClassCounts": counts,
            "hardwareSpecificWallSecondsDiagnostic": wall_seconds,
        }
        for index, start_seed in enumerate(start_seeds):
            rows.append({
                "startSeed": start_seed,
                "arm": arm,
                "sampler": "fixed deterministic DDIM-style epsilon update",
                "modelEvaluationsPerSample": len(schedule),
                "timestepGrid": schedule,
                "startTensorDigest": hashlib.sha256(starts[index].tobytes()).hexdigest(),
                "checkpointDigest": checkpoint_digest,
                "trainingRunId": training_run_id,
                "evaluatorId": evaluator_id,
                "executionEnvironment": execution_environment,
                "nearestHeldOutMse": float(np.min(distances[index])),
                "shapeClass": int(shape_labels[index]),
                "finiteFailure": bool(not np.isfinite(generated[index]).all()),
                "hardwareSpecificWallSecondsForArmDiagnostic": wall_seconds,
            })
    rows_by_pair = {(row["startSeed"], row["arm"]): row for row in rows}
    fixed_fields = ["sampler", "startSeed", "startTensorDigest", "checkpointDigest", "trainingRunId", "evaluatorId", "executionEnvironment"]
    paired_rows = [(rows_by_pair[(seed, "control")], rows_by_pair[(seed, "nfe-intervention")]) for seed in start_seeds]
    paired_mse_effects = np.array([
        intervention["nearestHeldOutMse"] - control["nearestHeldOutMse"]
        for control, intervention in paired_rows
    ], dtype=np.float64)
    analysis_rng = np.random.default_rng(20260718)
    bootstrap_draws = paired_mse_effects[
        analysis_rng.integers(0, len(paired_mse_effects), size=(10_000, len(paired_mse_effects)))
    ].mean(axis=1)
    paired_mse_interval = np.percentile(bootstrap_draws, [2.5, 97.5]).tolist()
    checks = {
        "forward_schedule_obeys_a2_plus_s2_equals_one": bool(np.allclose(a * a + s * s, 1.0)),
        "learned_epsilon_losses_are_finite": all(np.isfinite(row["heldOutNoiseMse"]) for row in timestep_rows),
        "resume_sufficient_statistics_match_uninterrupted_fit": bool(np.allclose(coefficients, direct_coefficients, atol=1e-10)),
        "paired_nfe_matrix_has_both_arms_for_every_start": len(rows) == 2 * len(start_seeds) and len(rows_by_pair) == 2 * len(start_seeds),
        "paired_nfe_arms_share_every_non_intervention_field": all(control[field] == intervention[field] for control, intervention in paired_rows for field in fixed_fields),
        "paired_nfe_arms_share_fixed_start_tensors": all(control["startTensorDigest"] == intervention["startTensorDigest"] for control, intervention in paired_rows),
        "sampler_update_rule_is_fixed_across_nfe_arms": len({row["sampler"] for row in rows}) == 1,
        "model_evaluation_budgets_are_exact": {row["arm"]: row["modelEvaluationsPerSample"] for row in rows} == {"control": 50, "nfe-intervention": 20},
        "timestep_grid_change_is_induced_by_nfe": all(len(control["timestepGrid"]) == 50 and len(intervention["timestepGrid"]) == 20 and control["timestepGrid"][0] == intervention["timestepGrid"][0] == 49 and control["timestepGrid"][-1] == intervention["timestepGrid"][-1] == 0 for control, intervention in paired_rows),
        "reverse_samples_are_finite": all(not row["finiteFailure"] for row in rows),
        "paired_quality_effect_and_interval_are_finite": bool(np.isfinite(paired_mse_effects).all() and np.isfinite(paired_mse_interval).all()),
    }
    manifest = {
        "studyDesign": "paired one-factor NFE intervention within one sampler; not an equal-NFE sampler-family comparison",
        "data": "generated 16x16 bars and squares",
        "parameterization": "epsilon",
        "denoiser": "per-timestep fitted linear epsilon predictor",
        "sampler": "fixed deterministic DDIM-style epsilon update",
        "controlNfe": 50,
        "interventionNfe": 20,
        "inducedChange": "evenly spaced timestep grid length",
        "timesteps": timesteps,
        "fixedStartCount": start_count,
        "startSeeds": start_seeds,
        "startTensorDigest": starts_digest,
        "resumeCheckpoint": resume_checkpoint.name,
        "evaluationCheckpoint": evaluation_checkpoint.name,
        "checkpointDigest": checkpoint_digest,
        "trainingRunId": training_run_id,
        "evaluatorId": evaluator_id,
        "executionEnvironment": execution_environment,
        "heldOutLossByTimestep": timestep_rows,
        "qualitySummaryByNfe": quality_summary_by_nfe,
        "pairedNearestHeldOutMseDifference20Minus50": {
            "seedEffects": paired_mse_effects.tolist(),
            "mean": float(paired_mse_effects.mean()),
            "pairedPercentileBootstrap95": paired_mse_interval,
            "analysisSeed": 20260718,
            "direction": "negative means the 20-NFE arm has lower nearest-held-out MSE",
        },
        "independentUnit": "fixed starting noise",
        "interpretationBoundary": "quality versus NFE for this fixed sampler; comparing sampler families requires a separate experiment with NFE held equal",
    }
    return manifest, rows, checks


def conditional_safety(profile: str, _output: Path):
    scales = (1.0, 2.0, 4.0)
    seeds = range(3) if profile == "smoke" else range(10)
    rows = []
    for seed in seeds:
        rng = np.random.default_rng(seed)
        unconditional = 0.2 + rng.normal(0.0, 0.01)
        conditional = 0.7 + rng.normal(0.0, 0.01)
        for scale in scales:
            guided = unconditional + scale * (conditional - unconditional)
            rows.append({"seed": seed, "scale": scale, "guidedValue": float(guided), "insideTrainingEndpoints": bool(0.0 <= guided <= 1.0)})
    checks = {
        "scale_one_recovers_conditional_path": all(abs(row["guidedValue"] - (0.7 + np.random.default_rng(row["seed"]).normal(0.0, 0.01, size=2)[1])) < 1e-12 for row in rows if row["scale"] == 1.0),
        "larger_scale_is_declared_extrapolation": any(not row["insideTrainingEndpoints"] for row in rows if row["scale"] == 4.0),
        "condition_scale_seed_matrix_is_complete": len(rows) == len(tuple(seeds)) * len(scales),
    }
    return {"scales": list(scales), "seeds": list(seeds), "independentUnit": "condition-scale-seed cell"}, rows, checks


def generative_research(profile: str, _output: Path):
    effects = {1: 0.03, 2: -0.03, 3: 0.02, 4: -0.02, 5: 0.01}
    rows = [{"seed": seed, "arm": arm, "budget": {"modelEvaluations": 100}, "qualityProxy": 0.60 + (effect if arm == "treatment" else 0.0)} for seed, effect in effects.items() for arm in ("baseline", "treatment")]
    bootstrap_rng = np.random.default_rng(44)
    paired = np.array(list(effects.values()))
    draws = paired[bootstrap_rng.integers(0, len(paired), size=(2_000 if profile == "smoke" else 10_000, len(paired)))].mean(axis=1)
    interval = np.percentile(draws, [2.5, 97.5]).tolist()
    expected = {(seed, arm) for seed in effects for arm in ("baseline", "treatment")}
    checks = {
        "complete_five_seed_pairing": {(row["seed"], row["arm"]) for row in rows} == expected,
        "primitive_budgets_match": len({row["budget"]["modelEvaluations"] for row in rows}) == 1,
        "mixed_effects_are_preserved": float(paired.min()) < 0 < float(paired.max()),
        "paired_percentile_bootstrap_is_finite": bool(np.isfinite(interval).all()),
    }
    return {"seeds": list(effects), "arms": ["baseline", "treatment"], "analysisSeed": 44, "pairedBootstrap95": interval, "independentUnit": "seeded run"}, rows, checks


BUILDERS: dict[str, Callable[[str, Path], tuple[dict, list, dict]]] = {
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
    parser.add_argument("--profile", choices=PROFILES, default="smoke")
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    manifest, rows, checks = BUILDERS[args.project](args.profile, args.output)
    if not all(checks.values()):
        raise RuntimeError(f"starter check failed: {checks}")
    dossier = {
        "schemaVersion": 2,
        "course": "generative",
        "lessonId": args.project,
        "evidenceKind": "real local CPU execution of a course-scale baseline",
        "manifest": {"profile": args.profile, "numpyVersion": np.__version__, **manifest},
        "checks": checks,
        "rawRows": rows,
        "decision": "The local course-scale build completed its declared checks; interpret only its generated data, seeds, budgets, and proxies.",
        "boundary": "This is real local CPU execution, including training or fitting for model-building projects. It is not a benchmark, production-quality generator result, external dataset measurement, or accepted research reproduction.",
    }
    args.output.write_text(json.dumps(dossier, indent=2) + "\n")
    print(json.dumps({"output": str(args.output), "project": args.project, "profile": args.profile, "checks": checks}, indent=2))


if __name__ == "__main__":
    main()
