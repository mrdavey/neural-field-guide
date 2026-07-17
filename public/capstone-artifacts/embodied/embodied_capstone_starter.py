#!/usr/bin/env python3
"""Executable, deterministic CPU baselines for the six Embodied AI capstones.

The baselines are deliberately small enough to inspect and run on a laptop.  They
exercise real schemas, estimators, optimization, decoding, controller authority,
and paired-study verification with NumPy.  They do *not* use an external
simulator, camera, accelerator, or physical robot.  Consequently, the numerical
results establish course-scale implementation behavior only; they are not robot
performance or safety measurements.

Examples (from this directory)::

    python3 -m pip install -r requirements-capstones.txt
    python3 embodied_capstone_starter.py --project behavior-cloning-capstone \
        --profile smoke --output /tmp/bc-smoke.json
    python3 embodied_capstone_starter.py --verify-dossier /tmp/task-smoke.json
    python3 embodied_capstone_starter.py --verify-study /tmp/research-smoke.json

``--profile smoke`` is the default and fastest correctness path.  ``full`` adds
training updates or research seeds but remains a bounded CPU teaching run.
"""
from __future__ import annotations

import argparse
import hashlib
import inspect
import json
import math
import platform
import tempfile
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Callable, Iterable, Sequence

import numpy as np


PROJECT_IDS = (
    "task-contract-capstone",
    "state-estimator-capstone",
    "behavior-cloning-capstone",
    "vla-policy-capstone",
    "recovery-intervention-capstone",
    "embodied-research-capstone",
)
PROFILES = ("smoke", "full")


def json_ready(value: Any) -> Any:
    """Convert dataclasses and NumPy values into stable JSON-compatible values."""
    if hasattr(value, "__dataclass_fields__"):
        return json_ready(asdict(value))
    if isinstance(value, dict):
        return {str(key): json_ready(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [json_ready(item) for item in value]
    if isinstance(value, np.ndarray):
        return value.tolist()
    if isinstance(value, np.generic):
        return value.item()
    return value


def stable_hash(value: object) -> str:
    payload = json.dumps(json_ready(value), sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(payload).hexdigest()


def array_hash(*arrays: np.ndarray) -> str:
    digest = hashlib.sha256()
    for array in arrays:
        contiguous = np.ascontiguousarray(array)
        digest.update(str(contiguous.dtype).encode())
        digest.update(str(contiguous.shape).encode())
        digest.update(contiguous.tobytes())
    return digest.hexdigest()


@dataclass
class ProjectResult:
    manifest: dict[str, Any]
    rows: list[dict[str, Any]]
    checks: dict[str, bool]
    decision: str
    boundary: str
    artifacts: dict[str, Any] | None = None


# ---------------------------------------------------------------------------
# 1. Typed task contract, replay, predicates, validation, and containment
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class TaskSchema:
    schema_version: str = "embodied-task/1.0"
    observation_frame: str = "world"
    action_frame: str = "world"
    max_packet_age_ms: int = 40
    max_dx_m: float = 0.03
    workspace_min_m: float = -0.05
    workspace_max_m: float = 0.12
    target_x_m: float = 0.06
    target_tolerance_m: float = 1e-9
    max_steps: int = 5


@dataclass(frozen=True)
class ObservationPacket:
    schema_version: str
    sequence: int
    timestamp_ms: int
    frame: str
    x_m: float
    velocity_mps: float


@dataclass(frozen=True)
class ActionPacket:
    schema_version: str
    sequence: int
    issued_at_ms: int
    frame: str
    requested_dx_m: float


def _finite_number(value: Any) -> bool:
    return isinstance(value, (int, float, np.number)) and math.isfinite(float(value))


def validate_observation_packet(packet: ObservationPacket, schema: TaskSchema) -> list[str]:
    errors: list[str] = []
    if packet.schema_version != schema.schema_version:
        errors.append("observation_schema_version")
    if packet.frame != schema.observation_frame:
        errors.append("observation_frame")
    if not isinstance(packet.sequence, int) or packet.sequence < 0:
        errors.append("observation_sequence")
    if not isinstance(packet.timestamp_ms, int) or packet.timestamp_ms < 0:
        errors.append("observation_timestamp")
    if not _finite_number(packet.x_m) or not _finite_number(packet.velocity_mps):
        errors.append("observation_non_finite")
    return errors


def validate_action_packet(packet: ActionPacket, schema: TaskSchema) -> list[str]:
    errors: list[str] = []
    if packet.schema_version != schema.schema_version:
        errors.append("action_schema_version")
    if packet.frame != schema.action_frame:
        errors.append("action_frame")
    if not isinstance(packet.sequence, int) or packet.sequence < 0:
        errors.append("action_sequence")
    if not isinstance(packet.issued_at_ms, int) or packet.issued_at_ms < 0:
        errors.append("action_timestamp")
    if not _finite_number(packet.requested_dx_m):
        errors.append("action_non_finite")
    return errors


class TaskContractEnvironment:
    """A one-dimensional simulator with explicit interface and terminal contracts."""

    def __init__(self, schema: TaskSchema | None = None) -> None:
        self.schema = schema or TaskSchema()
        self.rng = np.random.default_rng(0)
        self.seed = 0
        self.x_m = 0.0
        self.velocity_mps = 0.0
        self.step_index = 0
        self.terminal = False

    def reset(self, seed: int) -> ObservationPacket:
        self.seed = seed
        self.rng = np.random.default_rng(seed)
        self.x_m = 0.0
        self.velocity_mps = 0.0
        self.step_index = 0
        self.terminal = False
        return self.observe(timestamp_ms=0)

    def observe(self, timestamp_ms: int) -> ObservationPacket:
        return ObservationPacket(
            schema_version=self.schema.schema_version,
            sequence=self.step_index,
            timestamp_ms=timestamp_ms,
            frame=self.schema.observation_frame,
            x_m=self.x_m,
            velocity_mps=self.velocity_mps,
        )

    def snapshot(self) -> dict[str, Any]:
        return {
            "seed": self.seed,
            "xM": self.x_m,
            "velocityMps": self.velocity_mps,
            "stepIndex": self.step_index,
            "terminal": self.terminal,
            "rngState": json_ready(self.rng.bit_generator.state),
        }

    def restore(self, snapshot: dict[str, Any]) -> None:
        self.seed = int(snapshot["seed"])
        self.x_m = float(snapshot["xM"])
        self.velocity_mps = float(snapshot["velocityMps"])
        self.step_index = int(snapshot["stepIndex"])
        self.terminal = bool(snapshot["terminal"])
        self.rng = np.random.default_rng()
        self.rng.bit_generator.state = snapshot["rngState"]

    def step(
        self,
        observation: ObservationPacket,
        action: ActionPacket,
        now_ms: int,
    ) -> dict[str, Any]:
        if self.terminal:
            raise RuntimeError("step called after a terminal predicate")
        before = self.snapshot()
        errors = validate_observation_packet(observation, self.schema)
        errors.extend(validate_action_packet(action, self.schema))
        if observation.sequence != self.step_index or action.sequence != self.step_index:
            errors.append("sequence_mismatch")
        packet_age_ms = now_ms - observation.timestamp_ms
        if packet_age_ms < 0:
            errors.append("observation_from_future")
        stale = packet_age_ms > self.schema.max_packet_age_ms
        if stale:
            errors.append("stale_observation")
        action_age_ms = now_ms - action.issued_at_ms
        if action_age_ms < 0:
            errors.append("action_from_future")
        elif action_age_ms > self.schema.max_packet_age_ms:
            errors.append("stale_action")

        requested = float(action.requested_dx_m) if _finite_number(action.requested_dx_m) else 0.0
        bounded = float(np.clip(requested, -self.schema.max_dx_m, self.schema.max_dx_m))
        candidate = self.x_m + bounded
        workspace_violation = not (
            self.schema.workspace_min_m <= candidate <= self.schema.workspace_max_m
        )
        contained = bool(errors) or workspace_violation
        applied = 0.0 if contained else bounded

        # An invalid interface packet is rejected before *any* simulator state
        # advances, including sequence, velocity, terminal state, and RNG.  The
        # caller can repair the packet and retry the same sequence number.
        if errors:
            predicates = {
                "constraintFailure": False,
                "success": False,
                "timeout": False,
            }
            after = self.snapshot()
            return {
                "step": self.step_index,
                "packetAgeMs": packet_age_ms,
                "actionAgeMs": action_age_ms,
                "requestedDxM": requested,
                "boundedDxM": bounded,
                "appliedDxM": 0.0,
                "preX": before["xM"],
                "postX": self.x_m,
                "validationErrors": errors,
                "predicates": predicates,
                "event": "fault_contained",
                "contained": True,
                "terminal": self.terminal,
                "stateHashBefore": stable_hash(before),
                "stateHashAfter": stable_hash(after),
            }

        self.x_m += applied
        self.velocity_mps = applied / 0.1
        self.step_index += 1

        predicates = {
            "constraintFailure": workspace_violation,
            "success": abs(self.x_m - self.schema.target_x_m) <= self.schema.target_tolerance_m,
            "timeout": self.step_index >= self.schema.max_steps,
        }
        # Precedence is constraint failure, then success, then timeout.
        if predicates["constraintFailure"]:
            event = "constraint_failure_contained"
            self.terminal = True
        elif predicates["success"]:
            event = "success"
            self.terminal = True
        elif predicates["timeout"]:
            event = "timeout"
            self.terminal = True
        elif errors:
            event = "fault_contained"
        else:
            event = "act"
        return {
            "step": self.step_index,
            "packetAgeMs": packet_age_ms,
            "actionAgeMs": action_age_ms,
            "requestedDxM": requested,
            "boundedDxM": bounded,
            "appliedDxM": applied,
            "preX": before["xM"],
            "postX": self.x_m,
            "validationErrors": errors,
            "predicates": predicates,
            "event": event,
            "contained": contained,
            "terminal": self.terminal,
            "stateHashBefore": stable_hash(before),
            "stateHashAfter": stable_hash(self.snapshot()),
        }


def run_task_trace(actions: Sequence[float], seed: int = 17) -> list[dict[str, Any]]:
    environment = TaskContractEnvironment()
    environment.reset(seed)
    rows: list[dict[str, Any]] = []
    for step_index, requested in enumerate(actions):
        observation = environment.observe(timestamp_ms=step_index * 10)
        action = ActionPacket(
            schema_version=environment.schema.schema_version,
            sequence=step_index,
            issued_at_ms=step_index * 10,
            frame="world",
            requested_dx_m=requested,
        )
        rows.append(environment.step(observation, action, now_ms=step_index * 10 + 10))
        if rows[-1]["terminal"]:
            break
    return rows


def oracle_validate_task_trace(rows: Sequence[dict[str, Any]], schema: TaskSchema) -> bool:
    """Validate a complete nominal trace from mechanics, predicates, and precedence."""
    if not rows:
        return False
    previous_post: float | None = None
    saw_terminal = False
    for index, row in enumerate(rows):
        try:
            requested = float(row["requestedDxM"])
            bounded = float(np.clip(requested, -schema.max_dx_m, schema.max_dx_m))
            pre_x = float(row["preX"])
            post_x = float(row["postX"])
            applied = float(row["appliedDxM"])
            step = int(row["step"])
            validation_errors = list(row["validationErrors"])
            candidate = pre_x + bounded
            constraint_failure = not (
                schema.workspace_min_m <= candidate <= schema.workspace_max_m
            )
            expected_applied = 0.0 if validation_errors or constraint_failure else bounded
            expected_post = pre_x + expected_applied
            expected_predicates = {
                "constraintFailure": constraint_failure if not validation_errors else False,
                "success": (
                    abs(expected_post - schema.target_x_m) <= schema.target_tolerance_m
                    if not validation_errors
                    else False
                ),
                "timeout": step >= schema.max_steps if not validation_errors else False,
            }
            if validation_errors:
                expected_event = "fault_contained"
            elif expected_predicates["constraintFailure"]:
                expected_event = "constraint_failure_contained"
            elif expected_predicates["success"]:
                expected_event = "success"
            elif expected_predicates["timeout"]:
                expected_event = "timeout"
            else:
                expected_event = "act"
            expected_terminal = expected_event in {
                "constraint_failure_contained",
                "success",
                "timeout",
            }
            if not all(
                (
                    step == index + 1,
                    previous_post is None
                    or math.isclose(pre_x, previous_post, abs_tol=1e-12),
                    math.isclose(float(row["boundedDxM"]), bounded, abs_tol=1e-12),
                    math.isclose(applied, expected_applied, abs_tol=1e-12),
                    math.isclose(post_x, expected_post, abs_tol=1e-12),
                    row["predicates"] == expected_predicates,
                    row["event"] == expected_event,
                    bool(row["contained"]) == bool(validation_errors or constraint_failure),
                    bool(row["terminal"]) == expected_terminal,
                    not expected_terminal or index == len(rows) - 1,
                )
            ):
                return False
            previous_post = post_x
            saw_terminal = saw_terminal or expected_terminal
        except (KeyError, TypeError, ValueError):
            return False
    return saw_terminal


def task_contract(profile: str, output: Path) -> ProjectResult:
    del profile, output
    schema = TaskSchema()
    nominal = run_task_trace([0.07, 0.03])
    replay = run_task_trace([0.07, 0.03])

    def rejected_row(
        observation_timestamp_ms: int,
        action_timestamp_ms: int,
        now_ms: int,
        action_frame: str = "world",
    ) -> dict[str, Any]:
        environment = TaskContractEnvironment(schema)
        environment.reset(17)
        return environment.step(
            environment.observe(observation_timestamp_ms),
            ActionPacket(
                schema.schema_version,
                0,
                action_timestamp_ms,
                action_frame,
                0.02,
            ),
            now_ms=now_ms,
        )

    stale_observation = rejected_row(0, 80, 80)
    future_observation = rejected_row(100, 10, 10)
    stale_action = rejected_row(100, 0, 100)
    future_action = rejected_row(0, 999, 10)
    wrong_frame = rejected_row(0, 0, 10, action_frame="camera")
    invalid_packet_errors = validate_action_packet(
        ActionPacket("wrong-version", -1, -1, "camera", float("nan")), schema
    )
    rows = [
        {
            "arm": "nominal",
            "observationValidationErrors": validate_observation_packet(
                TaskContractEnvironment(schema).reset(17), schema
            ),
            "actionValidationErrors": validate_action_packet(
                ActionPacket(schema.schema_version, 0, 0, "world", 0.02), schema
            ),
            "trace": nominal,
            "replayTrace": replay,
            "traceHash": stable_hash(nominal),
            "replayTraceHash": stable_hash(replay),
        },
        {
            "arm": "malformed_action",
            "validationErrors": invalid_packet_errors,
            "expectedValidationErrors": [
                "action_schema_version",
                "action_frame",
                "action_sequence",
                "action_timestamp",
                "action_non_finite",
            ],
        },
        {"arm": "stale_observation", **stale_observation},
        {"arm": "future_observation", **future_observation},
        {"arm": "stale_action", **stale_action},
        {"arm": "future_action", **future_action},
        {"arm": "wrong_frame", **wrong_frame},
    ]
    by_arm = {row["arm"]: row for row in rows}

    def contained(arm: str, error: str) -> bool:
        row = by_arm[arm]
        return (
            error in row["validationErrors"]
            and row["event"] == "fault_contained"
            and row["appliedDxM"] == 0.0
            and row["postX"] == row["preX"]
            and row["stateHashBefore"] == row["stateHashAfter"]
        )

    checks = {
        "typed_packets_validate": not by_arm["nominal"]["observationValidationErrors"]
        and not by_arm["nominal"]["actionValidationErrors"],
        "malformed_packet_reports_all_contract_faults": (
            by_arm["malformed_action"]["validationErrors"]
            == by_arm["malformed_action"]["expectedValidationErrors"]
        ),
        "reset_and_trace_are_replayable": (
            by_arm["nominal"]["traceHash"]
            == by_arm["nominal"]["replayTraceHash"]
            and by_arm["nominal"]["trace"] == by_arm["nominal"]["replayTrace"]
        ),
        "requested_and_applied_actions_are_distinct": (
            nominal[0]["requestedDxM"] == 0.07 and nominal[0]["appliedDxM"] == 0.03
        ),
        "success_predicate_terminates_nominal_trace": (
            nominal[-1]["event"] == "success" and nominal[-1]["terminal"] is True
        ),
        "oracle_validates_transition_mechanics": oracle_validate_task_trace(nominal, schema),
        "stale_observation_is_contained_without_state_change": contained(
            "stale_observation", "stale_observation"
        ),
        "future_observation_is_contained_without_state_change": contained(
            "future_observation", "observation_from_future"
        ),
        "stale_action_is_contained_without_state_change": contained(
            "stale_action", "stale_action"
        ),
        "future_action_is_contained_without_state_change": contained(
            "future_action", "action_from_future"
        ),
        "wrong_frame_is_contained_without_state_change": contained(
            "wrong_frame", "action_frame"
        ),
    }
    return ProjectResult(
        manifest={
            "seed": 17,
            "taskSchema": asdict(schema),
            "nominalRequestedActionsM": [0.07, 0.03],
            "predicatePrecedence": ["constraintFailure", "success", "timeout"],
            "independentUnit": "replayed branch",
            "matrixAxes": {"arm": [row["arm"] for row in rows]},
        },
        rows=rows,
        checks=checks,
        decision="The typed nominal trace reaches the success predicate, while stale/future observation and action packets plus wrong-frame packets are held before state mutation.",
        boundary="This is real local execution of a one-dimensional deterministic simulator contract. It is not a learned-policy result from an external simulator, a physical-robot measurement, or a safety certification.",
    )


# ---------------------------------------------------------------------------
# 2. Timestamped camera/proprioception estimator with transforms and identity
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class Transform2D:
    source_frame: str
    target_frame: str
    rotation_rad: float
    translation_m: tuple[float, float]

    def rotation_matrix(self) -> np.ndarray:
        cosine, sine = math.cos(self.rotation_rad), math.sin(self.rotation_rad)
        return np.array([[cosine, -sine], [sine, cosine]], dtype=np.float64)

    def apply(self, point: Sequence[float]) -> np.ndarray:
        return self.rotation_matrix() @ np.asarray(point, dtype=np.float64) + np.asarray(
            self.translation_m, dtype=np.float64
        )

    def rotate_covariance(self, covariance: Sequence[Sequence[float]]) -> np.ndarray:
        covariance_array = np.asarray(covariance, dtype=np.float64)
        if covariance_array.shape != (2, 2):
            raise ValueError("camera covariance must have shape [2, 2]")
        rotation = self.rotation_matrix()
        return rotation @ covariance_array @ rotation.T


@dataclass(frozen=True)
class CameraDetection:
    detector_id: str
    xy_camera_m: tuple[float, float]
    covariance_m2: tuple[tuple[float, float], tuple[float, float]]


@dataclass(frozen=True)
class CameraPacket:
    timestamp_ms: int
    frame: str
    detections: tuple[CameraDetection, ...]


@dataclass(frozen=True)
class ProprioPacket:
    timestamp_ms: int
    frame: str
    applied_delta_world_m: tuple[float, float]


@dataclass
class TrackState:
    track_id: str
    position_world_m: np.ndarray
    covariance_m2: np.ndarray
    timestamp_ms: int
    valid: bool = True
    missed_updates: int = 0


class CameraProprioEstimator:
    def __init__(
        self,
        initial_position_world_m: Sequence[float] = (0.35, 0.0),
        age_gate_ms: int = 40,
        sync_gate_ms: int = 20,
        association_gate_m: float = 0.25,
    ) -> None:
        self.age_gate_ms = age_gate_ms
        self.sync_gate_ms = sync_gate_ms
        self.association_gate_m = association_gate_m
        self.state = TrackState(
            track_id="track-0001",
            position_world_m=np.asarray(initial_position_world_m, dtype=np.float64),
            covariance_m2=np.eye(2, dtype=np.float64) * 0.02,
            timestamp_ms=0,
        )

    def snapshot(self) -> dict[str, Any]:
        return {
            "trackId": self.state.track_id,
            "positionWorldM": self.state.position_world_m.copy(),
            "covarianceM2": self.state.covariance_m2.copy(),
            "timestampMs": self.state.timestamp_ms,
            "valid": self.state.valid,
            "missedUpdates": self.state.missed_updates,
        }

    def step(
        self,
        camera: CameraPacket,
        proprio: ProprioPacket,
        camera_to_world: Transform2D,
        now_ms: int,
    ) -> dict[str, Any]:
        if camera.frame != camera_to_world.source_frame or camera_to_world.target_frame != "world":
            raise ValueError("camera transform does not connect camera packet to world")
        if proprio.frame != "world":
            raise ValueError("proprioception delta must be expressed in world frame")

        camera_age_ms = now_ms - camera.timestamp_ms
        proprio_age_ms = now_ms - proprio.timestamp_ms
        skew_ms = abs(camera.timestamp_ms - proprio.timestamp_ms)
        out_of_order = (
            camera.timestamp_ms < self.state.timestamp_ms
            or proprio.timestamp_ms < self.state.timestamp_ms
        )
        if out_of_order:
            covariance_trace = float(np.trace(self.state.covariance_m2))
            return {
                "packetAgeMs": camera_age_ms,
                "cameraAgeMs": camera_age_ms,
                "proprioAgeMs": proprio_age_ms,
                "packetSkewMs": skew_ms,
                "predictedWorldM": self.state.position_world_m.copy(),
                "estimateWorldM": self.state.position_world_m.copy(),
                "priorCovarianceTraceM2": covariance_trace,
                "posteriorCovarianceTraceM2": covariance_trace,
                "trackId": self.state.track_id,
                "selectedDetectorId": None,
                "residualDistanceM": None,
                "valid": False,
                "abstain": True,
                "reason": "out_of_order",
                "missedUpdates": self.state.missed_updates,
            }

        proprio_reason = (
            "future_proprio"
            if proprio_age_ms < 0
            else "stale_proprio"
            if proprio_age_ms > self.age_gate_ms
            else None
        )
        if proprio_reason is not None:
            covariance_trace = float(np.trace(self.state.covariance_m2))
            return {
                "packetAgeMs": camera_age_ms,
                "cameraAgeMs": camera_age_ms,
                "proprioAgeMs": proprio_age_ms,
                "packetSkewMs": skew_ms,
                "predictedWorldM": self.state.position_world_m.copy(),
                "estimateWorldM": self.state.position_world_m.copy(),
                "priorCovarianceTraceM2": covariance_trace,
                "posteriorCovarianceTraceM2": covariance_trace,
                "trackId": self.state.track_id,
                "selectedDetectorId": None,
                "residualDistanceM": None,
                "valid": False,
                "abstain": True,
                "reason": proprio_reason,
                "missedUpdates": self.state.missed_updates,
            }

        predicted = self.state.position_world_m + np.asarray(
            proprio.applied_delta_world_m, dtype=np.float64
        )
        predicted_covariance = self.state.covariance_m2 + np.eye(2) * 0.004
        camera_reason = (
            "future_camera"
            if camera_age_ms < 0
            else "stale_camera"
            if camera_age_ms > self.age_gate_ms
            else "unsynchronized"
            if skew_ms > self.sync_gate_ms
            else None
        )
        stale = camera_reason is not None

        candidates = [
            (
                detection,
                camera_to_world.apply(detection.xy_camera_m),
                camera_to_world.rotate_covariance(detection.covariance_m2),
            )
            for detection in camera.detections
        ]
        associated: tuple[CameraDetection, np.ndarray, np.ndarray] | None = None
        residual_distance = None
        if not stale and candidates:
            associated = min(
                candidates, key=lambda item: float(np.linalg.norm(item[1] - predicted))
            )
            residual_distance = float(np.linalg.norm(associated[1] - predicted))
            if residual_distance > self.association_gate_m:
                associated = None

        prior_covariance = predicted_covariance.copy()
        if stale or associated is None:
            self.state.position_world_m = predicted
            self.state.covariance_m2 = predicted_covariance + np.eye(2) * 0.01
            self.state.timestamp_ms = proprio.timestamp_ms
            self.state.valid = False
            self.state.missed_updates += 1
            reason = camera_reason if stale else "no_match"
            selected_detector = None
        else:
            detection, measurement, measurement_covariance = associated
            innovation_covariance = predicted_covariance + measurement_covariance
            kalman_gain = predicted_covariance @ np.linalg.inv(innovation_covariance)
            self.state.position_world_m = predicted + kalman_gain @ (measurement - predicted)
            self.state.covariance_m2 = (
                np.eye(2, dtype=np.float64) - kalman_gain
            ) @ predicted_covariance
            self.state.timestamp_ms = camera.timestamp_ms
            self.state.valid = True
            self.state.missed_updates = 0
            reason = "updated"
            selected_detector = detection.detector_id
        return {
            "packetAgeMs": camera_age_ms,
            "cameraAgeMs": camera_age_ms,
            "proprioAgeMs": proprio_age_ms,
            "packetSkewMs": skew_ms,
            "predictedWorldM": predicted,
            "estimateWorldM": self.state.position_world_m.copy(),
            "priorCovarianceTraceM2": float(np.trace(prior_covariance)),
            "posteriorCovarianceTraceM2": float(np.trace(self.state.covariance_m2)),
            "trackId": self.state.track_id,
            "selectedDetectorId": selected_detector,
            "residualDistanceM": residual_distance,
            "valid": self.state.valid,
            "abstain": not self.state.valid,
            "reason": reason,
            "missedUpdates": self.state.missed_updates,
        }


def estimator_fixture_trace() -> list[dict[str, Any]]:
    transform = Transform2D("camera", "world", 0.0, (0.10, 0.0))
    estimator = CameraProprioEstimator()
    nominal = estimator.step(
        CameraPacket(
            10,
            "camera",
            (
                CameraDetection("near", (0.28, 0.01), ((0.003, 0.0), (0.0, 0.003))),
                CameraDetection("distractor", (0.90, 0.20), ((0.003, 0.0), (0.0, 0.003))),
            ),
        ),
        ProprioPacket(10, "world", (0.02, 0.0)),
        transform,
        now_ms=15,
    )
    stale = estimator.step(
        CameraPacket(
            20,
            "camera",
            (CameraDetection("near", (0.31, 0.01), ((0.003, 0.0), (0.0, 0.003))),),
        ),
        ProprioPacket(100, "world", (0.01, 0.0)),
        transform,
        now_ms=100,
    )
    no_match = estimator.step(
        CameraPacket(
            110,
            "camera",
            (CameraDetection("far", (1.50, 0.0), ((0.003, 0.0), (0.0, 0.003))),),
        ),
        ProprioPacket(110, "world", (0.01, 0.0)),
        transform,
        now_ms=115,
    )
    return [nominal, stale, no_match]


def estimator_evidence_rows() -> list[dict[str, Any]]:
    nominal, stale_camera, no_match = estimator_fixture_trace()
    anisotropic_transform = Transform2D(
        "camera", "world", math.pi / 2.0, (0.35, 0.0)
    )
    camera_covariance = ((0.001, 0.0), (0.0, 0.10))
    rotated_covariance = anisotropic_transform.rotate_covariance(camera_covariance)

    def temporal_case(camera_timestamp_ms: int, proprio_timestamp_ms: int, now_ms: int) -> dict[str, Any]:
        estimator = CameraProprioEstimator()
        return estimator.step(
            CameraPacket(
                camera_timestamp_ms,
                "camera",
                (
                    CameraDetection(
                        "near",
                        (0.25, 0.0),
                        ((0.01, 0.0), (0.0, 0.01)),
                    ),
                ),
            ),
            ProprioPacket(proprio_timestamp_ms, "world", (0.02, 0.0)),
            Transform2D("camera", "world", 0.0, (0.10, 0.0)),
            now_ms=now_ms,
        )

    return [
        {
            "arm": "transform_contract",
            "pointCameraM": [0.28, 0.01],
            "pointWorldM": Transform2D(
                "camera", "world", 0.0, (0.10, 0.0)
            ).apply((0.28, 0.01)),
            "rotationRad": math.pi / 2.0,
            "cameraCovarianceM2": camera_covariance,
            "worldCovarianceM2": rotated_covariance,
        },
        {"arm": "synchronized", **nominal},
        {"arm": "stale_camera", **stale_camera},
        {"arm": "stale_proprio", **temporal_case(100, 0, 100)},
        {"arm": "future_camera", **temporal_case(20, 10, 10)},
        {"arm": "future_proprio", **temporal_case(10, 20, 10)},
        {"arm": "no_association", **no_match},
    ]


def state_estimator(profile: str, output: Path) -> ProjectResult:
    del profile, output
    rows = estimator_evidence_rows()
    replay = estimator_evidence_rows()
    by_arm = {row["arm"]: row for row in rows}
    nominal = by_arm["synchronized"]
    stale = by_arm["stale_camera"]
    no_match = by_arm["no_association"]
    step_parameters = list(inspect.signature(CameraProprioEstimator.step).parameters)
    checks = {
        "camera_point_is_transformed_to_world": np.allclose(
            by_arm["transform_contract"]["pointWorldM"],
            (0.38, 0.01),
        ),
        "anisotropic_covariance_rotates_into_world_axes": np.allclose(
            np.diag(by_arm["transform_contract"]["worldCovarianceM2"]),
            (0.10, 0.001),
        ),
        "nearest_valid_detection_is_associated": nominal["selectedDetectorId"] == "near",
        "accepted_measurement_reduces_covariance": (
            nominal["posteriorCovarianceTraceM2"] < nominal["priorCovarianceTraceM2"]
        ),
        "stale_camera_predicts_and_abstains": (
            stale["reason"] == "stale_camera" and stale["abstain"]
        ),
        "stale_proprio_rejects_without_track_mutation": (
            by_arm["stale_proprio"]["reason"] == "stale_proprio"
            and by_arm["stale_proprio"]["abstain"]
            and np.array_equal(
                by_arm["stale_proprio"]["predictedWorldM"],
                by_arm["stale_proprio"]["estimateWorldM"],
            )
        ),
        "future_camera_abstains": (
            by_arm["future_camera"]["reason"] == "future_camera"
            and by_arm["future_camera"]["abstain"]
        ),
        "future_proprio_rejects_without_track_mutation": (
            by_arm["future_proprio"]["reason"] == "future_proprio"
            and by_arm["future_proprio"]["abstain"]
            and np.array_equal(
                by_arm["future_proprio"]["predictedWorldM"],
                by_arm["future_proprio"]["estimateWorldM"],
            )
        ),
        "no_match_preserves_identity_and_abstains": (
            no_match["reason"] == "no_match"
            and no_match["trackId"] == nominal["trackId"]
            and no_match["abstain"]
        ),
        "covariance_expands_without_measurement": (
            stale["posteriorCovarianceTraceM2"] > stale["priorCovarianceTraceM2"]
        ),
        "replay_is_exact": stable_hash(rows) == stable_hash(replay),
        "evaluator_truth_is_not_an_estimator_argument": (
            step_parameters == ["self", "camera", "proprio", "camera_to_world", "now_ms"]
            and not any("truth" in parameter.lower() for parameter in step_parameters)
        ),
    }
    return ProjectResult(
        manifest={
            "seed": 23,
            "frames": ["camera", "world"],
            "cameraToWorld": asdict(Transform2D("camera", "world", 0.0, (0.1, 0.0))),
            "ageGateMs": 40,
            "syncGateMs": 20,
            "associationGateM": 0.25,
            "truthJoin": "evaluator-only after estimation",
            "estimatorStepParameters": step_parameters,
            "independentUnit": "replayed packet trajectory",
            "matrixAxes": {"arm": [row["arm"] for row in rows]},
        },
        rows=rows,
        checks=checks,
        artifacts={
            "evidenceHash": stable_hash(rows),
            "replayEvidenceHash": stable_hash(replay),
        },
        decision="The synchronized camera packet updates the persistent track; invalid camera/proprioception time rejects or abstains, and unmatched detections propagate covariance without changing identity.",
        boundary="This is real local deterministic camera/proprioception array processing, not a learned-policy result from an external simulator, a real-sensor calibration, or physical tracking evidence.",
    )


# ---------------------------------------------------------------------------
# 3. Episode-split behavior cloning with masks, scaling, resume, and rollout
# ---------------------------------------------------------------------------


@dataclass
class TrajectoryEpisode:
    episode_id: str
    observations: np.ndarray
    actions: np.ndarray
    action_mask: np.ndarray


@dataclass
class FeatureScaler:
    observation_mean: np.ndarray
    observation_std: np.ndarray
    action_mean: np.ndarray
    action_std: np.ndarray

    def observations_to_model(self, observations: np.ndarray) -> np.ndarray:
        return (observations - self.observation_mean) / self.observation_std

    def actions_to_model(self, actions: np.ndarray) -> np.ndarray:
        return (actions - self.action_mean) / self.action_std

    def actions_from_model(self, actions: np.ndarray) -> np.ndarray:
        return actions * self.action_std + self.action_mean


@dataclass
class LinearPolicy:
    weights: np.ndarray

    @classmethod
    def initialize(cls, feature_count: int, action_count: int, seed: int) -> "LinearPolicy":
        rng = np.random.default_rng(seed)
        return cls(rng.normal(0.0, 0.02, size=(feature_count + 1, action_count)))

    def predict_scaled(self, observations_scaled: np.ndarray) -> np.ndarray:
        augmented = np.column_stack(
            [observations_scaled, np.ones(len(observations_scaled), dtype=np.float64)]
        )
        return augmented @ self.weights


@dataclass
class MomentumState:
    velocity: np.ndarray
    step: int = 0


def make_behavior_cloning_episodes(profile: str = "smoke") -> list[TrajectoryEpisode]:
    starts = (-0.10, 0.0, 0.10, 0.05, -0.05, 0.08)
    if profile == "full":
        starts = starts + (-0.08, 0.03, 0.12)
    episodes: list[TrajectoryEpisode] = []
    for episode_index, start in enumerate(starts):
        x_m = start
        observations: list[list[float]] = []
        actions: list[list[float]] = []
        masks: list[list[float]] = []
        for _ in range(12):
            error = 1.0 - x_m
            dx_m = 0.20 * error
            next_x = x_m + dx_m
            observations.append([x_m, error])
            actions.append([dx_m, 1.0 if next_x >= 0.90 else 0.0])
            masks.append([1.0, 1.0 if next_x >= 0.90 else 0.0])
            x_m = next_x
        episodes.append(
            TrajectoryEpisode(
                episode_id=f"episode-{episode_index:02d}",
                observations=np.asarray(observations, dtype=np.float64),
                actions=np.asarray(actions, dtype=np.float64),
                action_mask=np.asarray(masks, dtype=np.float64),
            )
        )
    return episodes


def split_episodes(
    episodes: Sequence[TrajectoryEpisode],
) -> dict[str, list[TrajectoryEpisode]]:
    # Entire episode IDs, never individual timesteps, cross these boundaries.
    return {
        "train": list(episodes[:-2]),
        "validation": [episodes[-2]],
        "test": [episodes[-1]],
    }


def fit_feature_scaler(episodes: Sequence[TrajectoryEpisode]) -> FeatureScaler:
    observations = np.concatenate([episode.observations for episode in episodes], axis=0)
    actions = np.concatenate([episode.actions for episode in episodes], axis=0)
    masks = np.concatenate([episode.action_mask for episode in episodes], axis=0)
    observation_std = observations.std(axis=0)
    observation_std[observation_std < 1e-8] = 1.0
    action_count = np.maximum(masks.sum(axis=0), 1.0)
    action_mean = (actions * masks).sum(axis=0) / action_count
    action_variance = (((actions - action_mean) ** 2) * masks).sum(axis=0) / action_count
    action_std = np.sqrt(action_variance)
    action_std[action_std < 1e-8] = 1.0
    return FeatureScaler(observations.mean(axis=0), observation_std, action_mean, action_std)


def pack_behavior_batch(
    episodes: Sequence[TrajectoryEpisode], scaler: FeatureScaler
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    observations = np.concatenate([episode.observations for episode in episodes], axis=0)
    actions = np.concatenate([episode.actions for episode in episodes], axis=0)
    mask = np.concatenate([episode.action_mask for episode in episodes], axis=0)
    return (
        scaler.observations_to_model(observations),
        scaler.actions_to_model(actions),
        mask,
    )


def masked_policy_loss(
    policy: LinearPolicy, observations: np.ndarray, targets: np.ndarray, mask: np.ndarray
) -> float:
    residual = (policy.predict_scaled(observations) - targets) * mask
    return float(np.sum(residual**2) / np.maximum(mask.sum(), 1.0))


def train_linear_policy(
    policy: LinearPolicy,
    optimizer: MomentumState,
    observations: np.ndarray,
    targets: np.ndarray,
    mask: np.ndarray,
    steps: int,
    learning_rate: float = 0.04,
    momentum: float = 0.85,
) -> list[float]:
    losses: list[float] = []
    augmented = np.column_stack([observations, np.ones(len(observations))])
    denominator = max(float(mask.sum()), 1.0)
    for _ in range(steps):
        prediction = augmented @ policy.weights
        residual = (prediction - targets) * mask
        gradient = 2.0 * augmented.T @ residual / denominator
        optimizer.velocity = momentum * optimizer.velocity + gradient
        policy.weights -= learning_rate * optimizer.velocity
        optimizer.step += 1
        losses.append(float(np.sum(residual**2) / denominator))
    return losses


def save_behavior_checkpoint(
    path: Path,
    policy: LinearPolicy,
    optimizer: MomentumState,
    scaler: FeatureScaler,
    train_episode_ids: Sequence[str],
) -> str:
    path.parent.mkdir(parents=True, exist_ok=True)
    np.savez_compressed(
        path,
        weights=policy.weights,
        velocity=optimizer.velocity,
        step=np.asarray([optimizer.step], dtype=np.int64),
        observation_mean=scaler.observation_mean,
        observation_std=scaler.observation_std,
        action_mean=scaler.action_mean,
        action_std=scaler.action_std,
        train_episode_ids=np.asarray(list(train_episode_ids), dtype=np.str_),
        schema_version=np.asarray(["bc-checkpoint/1.0"], dtype=np.str_),
    )
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_behavior_checkpoint(
    path: Path,
) -> tuple[LinearPolicy, MomentumState, FeatureScaler, list[str]]:
    with np.load(path, allow_pickle=False) as data:
        if str(data["schema_version"][0]) != "bc-checkpoint/1.0":
            raise ValueError("unsupported behavior-cloning checkpoint schema")
        policy = LinearPolicy(data["weights"].copy())
        optimizer = MomentumState(data["velocity"].copy(), int(data["step"][0]))
        scaler = FeatureScaler(
            data["observation_mean"].copy(),
            data["observation_std"].copy(),
            data["action_mean"].copy(),
            data["action_std"].copy(),
        )
        episode_ids = [str(item) for item in data["train_episode_ids"]]
    return policy, optimizer, scaler, episode_ids


def evaluate_cloning_rollout(
    policy: LinearPolicy,
    scaler: FeatureScaler,
    demonstrated_positions: np.ndarray,
    start_x_m: float,
    horizon: int = 12,
    support_radius_m: float = 0.18,
) -> dict[str, Any]:
    x_m = start_x_m
    trace: list[dict[str, Any]] = []
    first_departure: int | None = None
    for step_index in range(horizon):
        observation = np.asarray([[x_m, 1.0 - x_m]], dtype=np.float64)
        prediction_scaled = policy.predict_scaled(scaler.observations_to_model(observation))
        requested = float(scaler.actions_from_model(prediction_scaled)[0, 0])
        nearest_distance = float(np.min(np.abs(demonstrated_positions - x_m)))
        supported = nearest_distance <= support_radius_m
        if not supported and first_departure is None:
            first_departure = step_index
        applied = float(np.clip(requested, -0.25, 0.25)) if supported else 0.0
        before = x_m
        x_m += applied
        trace.append(
            {
                "step": step_index,
                "observationXM": before,
                "supportDistanceM": nearest_distance,
                "supported": supported,
                "requestedDxM": requested,
                "appliedDxM": applied,
                "postXM": x_m,
                "authority": "policy" if supported else "support_watchdog",
            }
        )
    success = abs(1.0 - x_m) <= 0.08
    return {
        "startXM": start_x_m,
        "finalXM": x_m,
        "success": success,
        "supportDeparture": first_departure,
        "intervention": first_departure is not None,
        "autonomous": first_departure is None,
        "trace": trace,
    }


def behavior_cloning(profile: str, output: Path) -> ProjectResult:
    episodes = make_behavior_cloning_episodes(profile)
    splits = split_episodes(episodes)
    scaler = fit_feature_scaler(splits["train"])
    observations, targets, mask = pack_behavior_batch(splits["train"], scaler)
    total_steps = 360 if profile == "smoke" else 900
    halfway = total_steps // 2

    direct = LinearPolicy.initialize(observations.shape[1], targets.shape[1], seed=31)
    direct_optimizer = MomentumState(np.zeros_like(direct.weights))
    initial_loss = masked_policy_loss(direct, observations, targets, mask)
    train_linear_policy(direct, direct_optimizer, observations, targets, mask, total_steps)
    final_loss = masked_policy_loss(direct, observations, targets, mask)

    resumed = LinearPolicy.initialize(observations.shape[1], targets.shape[1], seed=31)
    resumed_optimizer = MomentumState(np.zeros_like(resumed.weights))
    train_linear_policy(resumed, resumed_optimizer, observations, targets, mask, halfway)
    checkpoint_path = output.with_name(f"{output.stem}-bc-checkpoint.npz")
    checkpoint_hash = save_behavior_checkpoint(
        checkpoint_path,
        resumed,
        resumed_optimizer,
        scaler,
        [episode.episode_id for episode in splits["train"]],
    )
    resumed, resumed_optimizer, restored_scaler, restored_ids = load_behavior_checkpoint(
        checkpoint_path
    )
    train_linear_policy(
        resumed, resumed_optimizer, observations, targets, mask, total_steps - halfway
    )

    demonstrated_positions = np.concatenate(
        [episode.observations[:, 0] for episode in splits["train"]]
    )
    nominal = evaluate_cloning_rollout(
        resumed, restored_scaler, demonstrated_positions, start_x_m=0.0
    )
    shifted = evaluate_cloning_rollout(
        resumed, restored_scaler, demonstrated_positions, start_x_m=-0.45
    )
    ids_by_split = {
        name: [episode.episode_id for episode in split]
        for name, split in splits.items()
    }
    disjoint = all(
        set(ids_by_split[left]).isdisjoint(ids_by_split[right])
        for left, right in (("train", "validation"), ("train", "test"), ("validation", "test"))
    )
    checks = {
        "whole_episode_splits_are_disjoint": disjoint,
        "masks_and_scaled_targets_share_shape": mask.shape == targets.shape,
        "scaling_round_trip_is_exact": np.allclose(
            scaler.actions_from_model(scaler.actions_to_model(episodes[0].actions)),
            episodes[0].actions,
        ),
        "one_batch_fit_reduces_masked_loss": final_loss < initial_loss * 0.01,
        "checkpoint_restores_complete_training_state": (
            restored_ids == ids_by_split["train"]
            and resumed_optimizer.step == total_steps
            and np.array_equal(direct.weights, resumed.weights)
            and np.array_equal(direct_optimizer.velocity, resumed_optimizer.velocity)
            and np.array_equal(
                restored_scaler.observation_mean, scaler.observation_mean
            )
            and np.array_equal(
                restored_scaler.observation_std, scaler.observation_std
            )
            and np.array_equal(restored_scaler.action_mean, scaler.action_mean)
            and np.array_equal(restored_scaler.action_std, scaler.action_std)
        ),
        "nominal_closed_loop_reaches_target": nominal["success"] and nominal["autonomous"],
        "changed_start_exposes_support_departure": (
            shifted["supportDeparture"] == 0
            and shifted["intervention"]
            and not shifted["success"]
        ),
        "requested_and_applied_actions_are_logged": all(
            "requestedDxM" in row and "appliedDxM" in row for row in shifted["trace"]
        ),
    }
    rows = [
        {
            "arm": "nominal",
            "trainingLossStart": initial_loss,
            "trainingLossEnd": final_loss,
            **nominal,
        },
        {
            "arm": "changed_start",
            "trainingLossStart": initial_loss,
            "trainingLossEnd": final_loss,
            **shifted,
        },
    ]
    return ProjectResult(
        manifest={
            "seed": 31,
            "datasetSchema": "typed-trajectory/1.0",
            "splitEpisodeIds": ids_by_split,
            "observationFields": ["x_m", "target_error_m"],
            "actionFields": ["dx_m", "gripper_close"],
            "maskedLoss": "sum(mask * squared scaled error) / sum(mask)",
            "optimizer": {"name": "full-batch momentum gradient descent", "updates": total_steps},
            "changedStartM": -0.45,
            "independentUnit": "closed-loop episode",
            "matrixAxes": {"arm": [row["arm"] for row in rows]},
        },
        rows=rows,
        checks=checks,
        artifacts={
            "checkpoint": checkpoint_path.name,
            "checkpointSha256": checkpoint_hash,
            "weightsSha256": array_hash(resumed.weights),
            "trainingEvidence": {
                "observationShape": list(observations.shape),
                "targetShape": list(targets.shape),
                "maskShape": list(mask.shape),
                "scalingRoundTripMaxAbsError": float(
                    np.max(
                        np.abs(
                            scaler.actions_from_model(
                                scaler.actions_to_model(episodes[0].actions)
                            )
                            - episodes[0].actions
                        )
                    )
                ),
                "initialMaskedLoss": initial_loss,
                "finalMaskedLoss": final_loss,
                "trainEpisodeIds": ids_by_split["train"],
                "restoredEpisodeIds": restored_ids,
                "directOptimizerStep": direct_optimizer.step,
                "resumedOptimizerStep": resumed_optimizer.step,
                "directWeightsSha256": array_hash(direct.weights),
                "resumedWeightsSha256": array_hash(resumed.weights),
                "directVelocitySha256": array_hash(direct_optimizer.velocity),
                "resumedVelocitySha256": array_hash(resumed_optimizer.velocity),
                "scalerSha256": array_hash(
                    scaler.observation_mean,
                    scaler.observation_std,
                    scaler.action_mean,
                    scaler.action_std,
                ),
                "restoredScalerSha256": array_hash(
                    restored_scaler.observation_mean,
                    restored_scaler.observation_std,
                    restored_scaler.action_mean,
                    restored_scaler.action_std,
                ),
            },
        },
        decision="The trainable masked policy exactly resumes and closes the nominal loop; the changed start leaves demonstrated support immediately, so the watchdog holds and the run is labeled assisted failure.",
        boundary="This is a real local learned linear-policy result in a deterministic one-dimensional course environment. It is not a learned-policy result from an external simulator or physical robot, and it does not establish general imitation-learning performance.",
    )


# ---------------------------------------------------------------------------
# 4. Multimodal serializer, causal transformer, and diffusion-style decoder
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class VLAExample:
    instruction: str
    vision_rgb: tuple[int, int, int]
    object_x_m: float
    end_effector_x_m: float
    timestamp_ms: int
    actions_m: tuple[float, ...]
    valid_steps: tuple[bool, ...]


class MultimodalSerializer:
    vocabulary = ("<pad>", "<unk>", "move", "red", "blue", "left", "right", "object")

    def __init__(self, max_language_tokens: int = 4, max_age_ms: int = 40) -> None:
        self.max_language_tokens = max_language_tokens
        self.max_age_ms = max_age_ms
        self.token_to_id = {token: index for index, token in enumerate(self.vocabulary)}

    def serialize(self, example: VLAExample, now_ms: int) -> dict[str, np.ndarray | int | bool]:
        words = example.instruction.lower().split()
        token_ids = [self.token_to_id.get(word, self.token_to_id["<unk>"]) for word in words]
        token_ids = token_ids[: self.max_language_tokens]
        language_mask = [1.0] * len(token_ids)
        while len(token_ids) < self.max_language_tokens:
            token_ids.append(self.token_to_id["<pad>"])
            language_mask.append(0.0)
        rgb = np.asarray(example.vision_rgb, dtype=np.float64) / 255.0
        return {
            "languageTokenIds": np.asarray(token_ids, dtype=np.int64),
            "languageMask": np.asarray(language_mask, dtype=np.float64),
            "visionToken": np.concatenate([rgb, np.asarray([example.object_x_m])]),
            "stateToken": np.asarray([example.end_effector_x_m], dtype=np.float64),
            "timestampMs": example.timestamp_ms,
            "fresh": 0 <= now_ms - example.timestamp_ms <= self.max_age_ms,
        }

    def condition_vector(self, serialized: dict[str, Any]) -> np.ndarray:
        bag = np.zeros(len(self.vocabulary), dtype=np.float64)
        for token_id, valid in zip(
            serialized["languageTokenIds"], serialized["languageMask"]
        ):
            if valid:
                bag[int(token_id)] += 1.0
        denominator = max(float(np.sum(serialized["languageMask"])), 1.0)
        bag /= denominator
        return np.concatenate(
            [bag, serialized["visionToken"], serialized["stateToken"]]
        )


def causal_action_targets(
    actions: np.ndarray, valid_steps: np.ndarray
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    if actions.ndim != 2 or valid_steps.shape != actions.shape:
        raise ValueError("actions and valid_steps must have matching [batch, time] shapes")
    decoder_inputs = np.zeros_like(actions)
    decoder_inputs[:, 1:] = actions[:, :-1]
    targets = actions.copy()
    target_mask = valid_steps.astype(np.float64)
    time_steps = actions.shape[1]
    attention_mask = np.tril(np.ones((time_steps, time_steps), dtype=bool))
    return decoder_inputs, targets, target_mask, attention_mask


def make_vla_examples() -> list[VLAExample]:
    examples: list[VLAExample] = []
    colors = (("red", (255, 30, 30)), ("blue", (30, 30, 255)))
    for color, rgb in colors:
        for direction, sign in (("left", -1.0), ("right", 1.0)):
            for offset in (-0.02, 0.03):
                # Keep the tiny target exactly representable by the linear
                # action head: object position still exercises the vision path,
                # while direction and previous action determine the target.
                magnitude = 0.10
                actions = tuple(sign * magnitude * (0.75**step) for step in range(3))
                examples.append(
                    VLAExample(
                        instruction=f"move {color} {direction} object",
                        vision_rgb=rgb,
                        object_x_m=0.25 + offset,
                        end_effector_x_m=0.05,
                        timestamp_ms=10,
                        actions_m=actions,
                        valid_steps=(True, True, True),
                    )
                )
    return examples


def build_vla_action_batch(
    examples: Sequence[VLAExample], serializer: MultimodalSerializer
) -> tuple[np.ndarray, np.ndarray, np.ndarray, dict[str, np.ndarray]]:
    actions = np.asarray([example.actions_m for example in examples], dtype=np.float64)
    valid = np.asarray([example.valid_steps for example in examples], dtype=bool)
    decoder_inputs, targets, target_mask, attention_mask = causal_action_targets(actions, valid)
    decoder_token_sequences: list[list[np.ndarray]] = []
    for example_index, example in enumerate(examples):
        serialized = serializer.serialize(example, now_ms=15)
        condition = serializer.condition_vector(serialized)
        direction = condition[serializer.token_to_id["right"]] - condition[
            serializer.token_to_id["left"]
        ]
        sequence: list[np.ndarray] = []
        for step_index in range(actions.shape[1]):
            sequence.append(
                np.concatenate(
                    [
                        condition,
                        [
                            decoder_inputs[example_index, step_index],
                            step_index / 2.0,
                            direction,
                        ],
                    ]
                )
            )
        decoder_token_sequences.append(sequence)
    contracts = {
        "decoderInputs": decoder_inputs,
        "targets": targets,
        "targetMask": target_mask,
        "attentionMask": attention_mask,
    }
    return (
        np.asarray(decoder_token_sequences, dtype=np.float64),
        targets[:, :, None],
        target_mask[:, :, None],
        contracts,
    )


@dataclass
class CausalTransformerDecoder:
    """One real masked self-attention block followed by a metric action head.

    This course-scale decoder is intentionally tiny, but every projection and the
    action head are trained.  The lower-triangular mask is applied to attention
    logits before softmax, so a later action token cannot influence an earlier
    prediction.
    """

    input_projection: np.ndarray
    query_projection: np.ndarray
    key_projection: np.ndarray
    value_projection: np.ndarray
    action_head: np.ndarray
    action_bias: np.ndarray

    @classmethod
    def initialize(
        cls, feature_count: int, hidden_width: int = 6, seed: int = 41
    ) -> "CausalTransformerDecoder":
        rng = np.random.default_rng(seed)
        scale = 0.12
        return cls(
            input_projection=rng.normal(
                0.0, scale, size=(feature_count, hidden_width)
            ),
            query_projection=rng.normal(
                0.0, scale, size=(hidden_width, hidden_width)
            ),
            key_projection=rng.normal(
                0.0, scale, size=(hidden_width, hidden_width)
            ),
            value_projection=rng.normal(
                0.0, scale, size=(hidden_width, hidden_width)
            ),
            action_head=rng.normal(0.0, 0.01, size=(hidden_width, 1)),
            action_bias=np.zeros((1,), dtype=np.float64),
        )

    @property
    def hidden_width(self) -> int:
        return int(self.action_head.shape[0])

    @property
    def parameter_count(self) -> int:
        return sum(
            int(parameter.size)
            for parameter in (
                self.input_projection,
                self.query_projection,
                self.key_projection,
                self.value_projection,
                self.action_head,
                self.action_bias,
            )
        )

    def parameter_hash(self) -> str:
        digest = hashlib.sha256()
        for parameter in (
            self.input_projection,
            self.query_projection,
            self.key_projection,
            self.value_projection,
            self.action_head,
            self.action_bias,
        ):
            digest.update(np.asarray(parameter, dtype=np.float64).tobytes())
        return digest.hexdigest()

    def _forward(
        self, tokens: np.ndarray
    ) -> tuple[np.ndarray, np.ndarray, dict[str, np.ndarray]]:
        if tokens.ndim != 3:
            raise ValueError("transformer tokens must have [batch, time, feature] shape")
        projected = np.tanh(tokens @ self.input_projection)
        query = projected @ self.query_projection
        key = projected @ self.key_projection
        value = projected @ self.value_projection
        logits = np.einsum("bth,bsh->bts", query, key) / math.sqrt(
            self.hidden_width
        )
        time_steps = tokens.shape[1]
        causal_mask = np.tril(np.ones((time_steps, time_steps), dtype=bool))
        masked_logits = np.where(causal_mask[None, :, :], logits, -1.0e9)
        shifted_logits = masked_logits - np.max(masked_logits, axis=-1, keepdims=True)
        unnormalized = np.exp(shifted_logits) * causal_mask[None, :, :]
        attention = unnormalized / np.sum(unnormalized, axis=-1, keepdims=True)
        context = np.einsum("bts,bsh->bth", attention, value)
        hidden = projected + context
        predictions = hidden @ self.action_head + self.action_bias
        return predictions, attention, {
            "projected": projected,
            "query": query,
            "key": key,
            "value": value,
            "attention": attention,
            "hidden": hidden,
        }

    def predict(self, tokens: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        predictions, attention, _ = self._forward(tokens)
        return predictions, attention


def train_causal_transformer(
    decoder: CausalTransformerDecoder,
    tokens: np.ndarray,
    targets: np.ndarray,
    mask: np.ndarray,
    steps: int,
    learning_rate: float = 0.018,
) -> tuple[float, float]:
    """Train every attention projection and the action head with NumPy Adam."""

    if targets.shape != mask.shape or targets.shape != tokens.shape[:2] + (1,):
        raise ValueError("targets and mask must have [batch, time, 1] shape")
    parameters = {
        "input_projection": decoder.input_projection,
        "query_projection": decoder.query_projection,
        "key_projection": decoder.key_projection,
        "value_projection": decoder.value_projection,
        "action_head": decoder.action_head,
        "action_bias": decoder.action_bias,
    }
    first_moment = {name: np.zeros_like(value) for name, value in parameters.items()}
    second_moment = {name: np.zeros_like(value) for name, value in parameters.items()}
    denominator = max(float(mask.sum()), 1.0)

    def loss() -> float:
        predictions, _ = decoder.predict(tokens)
        return float(np.sum(((predictions - targets) * mask) ** 2) / denominator)

    initial = loss()
    for step in range(1, steps + 1):
        predictions, _, cache = decoder._forward(tokens)
        prediction_gradient = 2.0 * (predictions - targets) * mask / denominator
        hidden = cache["hidden"]
        projected = cache["projected"]
        attention = cache["attention"]
        query = cache["query"]
        key = cache["key"]
        value = cache["value"]

        gradients: dict[str, np.ndarray] = {}
        gradients["action_head"] = np.einsum(
            "bth,bto->ho", hidden, prediction_gradient
        )
        gradients["action_bias"] = np.sum(prediction_gradient, axis=(0, 1))
        hidden_gradient = prediction_gradient @ decoder.action_head.T
        projected_gradient = hidden_gradient.copy()
        context_gradient = hidden_gradient

        attention_gradient = np.einsum(
            "bth,bsh->bts", context_gradient, value
        )
        value_gradient = np.einsum(
            "bts,bth->bsh", attention, context_gradient
        )
        logits_gradient = attention * (
            attention_gradient
            - np.sum(attention_gradient * attention, axis=-1, keepdims=True)
        )
        scale = math.sqrt(decoder.hidden_width)
        query_gradient = np.einsum("bts,bsh->bth", logits_gradient, key) / scale
        key_gradient = np.einsum("bts,bth->bsh", logits_gradient, query) / scale

        gradients["query_projection"] = np.einsum(
            "bti,btj->ij", projected, query_gradient
        )
        gradients["key_projection"] = np.einsum(
            "bti,btj->ij", projected, key_gradient
        )
        gradients["value_projection"] = np.einsum(
            "bti,btj->ij", projected, value_gradient
        )
        projected_gradient += query_gradient @ decoder.query_projection.T
        projected_gradient += key_gradient @ decoder.key_projection.T
        projected_gradient += value_gradient @ decoder.value_projection.T
        preactivation_gradient = projected_gradient * (1.0 - projected**2)
        gradients["input_projection"] = np.einsum(
            "bti,btj->ij", tokens, preactivation_gradient
        )

        gradient_norm = math.sqrt(
            sum(float(np.sum(gradient**2)) for gradient in gradients.values())
        )
        clip_scale = min(1.0, 5.0 / max(gradient_norm, 1.0e-12))
        for name, parameter in parameters.items():
            gradient = gradients[name] * clip_scale
            first_moment[name] = 0.9 * first_moment[name] + 0.1 * gradient
            second_moment[name] = 0.999 * second_moment[name] + 0.001 * (
                gradient**2
            )
            corrected_first = first_moment[name] / (1.0 - 0.9**step)
            corrected_second = second_moment[name] / (1.0 - 0.999**step)
            parameter -= learning_rate * corrected_first / (
                np.sqrt(corrected_second) + 1.0e-8
            )
    return initial, loss()


@dataclass
class MatrixHead:
    weights: np.ndarray

    @classmethod
    def initialize(cls, feature_count: int, output_count: int, seed: int) -> "MatrixHead":
        rng = np.random.default_rng(seed)
        return cls(rng.normal(0.0, 0.01, size=(feature_count + 1, output_count)))

    def predict(self, features: np.ndarray) -> np.ndarray:
        return np.column_stack([features, np.ones(len(features))]) @ self.weights


def train_matrix_head(
    head: MatrixHead,
    features: np.ndarray,
    targets: np.ndarray,
    mask: np.ndarray,
    steps: int,
    learning_rate: float = 0.08,
) -> tuple[float, float]:
    augmented = np.column_stack([features, np.ones(len(features))])
    denominator = max(float(mask.sum()), 1.0)
    initial = float(np.sum(((augmented @ head.weights - targets) * mask) ** 2) / denominator)
    for _ in range(steps):
        residual = (augmented @ head.weights - targets) * mask
        gradient = 2.0 * augmented.T @ residual / denominator
        head.weights -= learning_rate * gradient
    final = float(np.sum(((augmented @ head.weights - targets) * mask) ** 2) / denominator)
    return initial, final


DIFFUSION_ALPHA_BAR = np.asarray([0.85, 0.50, 0.20], dtype=np.float64)


def diffuse_actions(
    clean_actions: np.ndarray, noise: np.ndarray, timestep: int
) -> np.ndarray:
    alpha = DIFFUSION_ALPHA_BAR[timestep]
    return math.sqrt(alpha) * clean_actions + math.sqrt(1.0 - alpha) * noise


def build_diffusion_batch(
    conditions: np.ndarray, clean_actions: np.ndarray, seed: int = 41
) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(seed)
    features: list[np.ndarray] = []
    targets: list[np.ndarray] = []
    for timestep in range(len(DIFFUSION_ALPHA_BAR)):
        noise = rng.normal(size=clean_actions.shape)
        noisy = diffuse_actions(clean_actions, noise, timestep)
        for row_index in range(len(clean_actions)):
            features.append(
                np.concatenate(
                    [
                        conditions[row_index],
                        noisy[row_index],
                        [timestep / (len(DIFFUSION_ALPHA_BAR) - 1)],
                    ]
                )
            )
            targets.append(noise[row_index])
    return np.asarray(features), np.asarray(targets)


def sample_diffusion_action(
    noise_head: MatrixHead,
    condition: np.ndarray,
    seed: int,
    action_limit_m: float = 0.20,
) -> tuple[np.ndarray, list[dict[str, Any]]]:
    rng = np.random.default_rng(seed)
    noisy_action = rng.normal(size=(1,))
    trace: list[dict[str, Any]] = []
    clean_estimate = noisy_action.copy()
    for timestep in reversed(range(len(DIFFUSION_ALPHA_BAR))):
        feature = np.concatenate(
            [condition, noisy_action, [timestep / (len(DIFFUSION_ALPHA_BAR) - 1)]]
        )[None, :]
        predicted_noise = noise_head.predict(feature)[0]
        alpha = DIFFUSION_ALPHA_BAR[timestep]
        clean_estimate = (noisy_action - math.sqrt(1.0 - alpha) * predicted_noise) / math.sqrt(
            alpha
        )
        trace.append(
            {
                "timestep": timestep,
                "noisyAction": noisy_action.copy(),
                "predictedNoise": predicted_noise.copy(),
                "cleanEstimate": clean_estimate.copy(),
            }
        )
        if timestep > 0:
            next_alpha = DIFFUSION_ALPHA_BAR[timestep - 1]
            noisy_action = math.sqrt(next_alpha) * clean_estimate + math.sqrt(
                1.0 - next_alpha
            ) * predicted_noise
    return np.clip(clean_estimate, -action_limit_m, action_limit_m), trace


def vla_policy(profile: str, output: Path) -> ProjectResult:
    del output
    serializer = MultimodalSerializer()
    examples = make_vla_examples()
    decoder_tokens, targets, mask, contracts = build_vla_action_batch(
        examples, serializer
    )
    updates = 480 if profile == "smoke" else 900
    transformer = CausalTransformerDecoder.initialize(
        decoder_tokens.shape[2], hidden_width=6, seed=41
    )
    transformer_initial_hash = transformer.parameter_hash()
    transformer_initial, transformer_final = train_causal_transformer(
        transformer,
        decoder_tokens,
        targets,
        mask,
        updates,
        learning_rate=0.018,
    )
    transformer_trained_hash = transformer.parameter_hash()

    # The diffusion decoder receives the same serialized condition/action-token
    # rows and clean targets.  It gets the same optimizer-update count, while its
    # three inference calls are reported separately rather than hidden as a
    # matched budget.
    diffusion_conditions = decoder_tokens.reshape(
        -1, decoder_tokens.shape[-1]
    )
    clean_actions = targets.reshape(-1, 1)
    diffusion_features, diffusion_targets = build_diffusion_batch(
        diffusion_conditions, clean_actions, seed=41
    )
    diffusion_head = MatrixHead.initialize(diffusion_features.shape[1], 1, seed=43)
    diffusion_initial, diffusion_final = train_matrix_head(
        diffusion_head,
        diffusion_features,
        diffusion_targets,
        np.ones_like(diffusion_targets),
        updates,
        learning_rate=0.025,
    )

    representative_index = 2  # red/right with the first offset
    representative_example = examples[representative_index]
    serialized = serializer.serialize(representative_example, now_ms=15)
    transformer_predictions, transformer_attention = transformer.predict(
        decoder_tokens[representative_index : representative_index + 1]
    )
    transformer_requested = float(transformer_predictions[0, 0, 0])
    transformer_applied = float(np.clip(transformer_requested, -0.20, 0.20))
    diffusion_requested_array, diffusion_trace = sample_diffusion_action(
        diffusion_head,
        decoder_tokens[representative_index, 0],
        seed=47,
    )
    diffusion_requested = float(diffusion_trace[-1]["cleanEstimate"][0])
    diffusion_applied = float(diffusion_requested_array[0])
    target_action = representative_example.actions_m[0]

    left = VLAExample(
        "move red left object", (255, 30, 30), 0.25, 0.05, 10, (-0.1, -0.075, -0.05), (True, True, True)
    )
    right = VLAExample(
        "move red right object", (255, 30, 30), 0.25, 0.05, 10, (0.1, 0.075, 0.05), (True, True, True)
    )
    counterfactual_tokens, _, _, _ = build_vla_action_batch(
        [left, right], serializer
    )
    counterfactual_predictions, _ = transformer.predict(counterfactual_tokens)
    left_action = float(counterfactual_predictions[0, 0, 0])
    right_action = float(counterfactual_predictions[1, 0, 0])

    original_tokens = decoder_tokens[representative_index : representative_index + 1].copy()
    future_edited_tokens = original_tokens.copy()
    future_edited_tokens[0, 2, -3] = -0.15
    original_predictions, original_attention = transformer.predict(original_tokens)
    future_edited_predictions, future_edited_attention = transformer.predict(
        future_edited_tokens
    )
    attention_mask = contracts["attentionMask"]
    diffusion_deadline_calls = 2
    diffusion_repeat_sample, _ = sample_diffusion_action(
        diffusion_head,
        decoder_tokens[representative_index, 0],
        seed=47,
    )
    transformer_decoder_calls = 1
    diffusion_decoder_calls = len(DIFFUSION_ALPHA_BAR)
    rows = [
        {
            "arm": "causal_transformer_decoder",
            "architecture": "one-head masked self-attention plus metric action head",
            "trainingUpdates": updates,
            "trainingLossStart": transformer_initial,
            "trainingLossEnd": transformer_final,
            "targetMask": contracts["targetMask"][representative_index].tolist(),
            "targetActionM": target_action,
            "requestedActionM": transformer_requested,
            "appliedActionM": transformer_applied,
            "decoderCalls": transformer_decoder_calls,
            "deadlineCallBudget": diffusion_deadline_calls,
            "deadlinePass": transformer_decoder_calls <= diffusion_deadline_calls,
            "constraintPass": abs(transformer_applied) <= 0.20,
            "trainedParameterSha256": transformer_trained_hash,
            "failure": None,
        },
        {
            "arm": "diffusion_style_decoder",
            "trainingUpdates": updates,
            "trainingLossStart": diffusion_initial,
            "trainingLossEnd": diffusion_final,
            "targetMask": contracts["targetMask"][representative_index].tolist(),
            "targetActionM": target_action,
            "requestedActionM": diffusion_requested,
            "appliedActionM": diffusion_applied,
            "decoderCalls": diffusion_decoder_calls,
            "deadlineCallBudget": diffusion_deadline_calls,
            "deadlinePass": diffusion_decoder_calls <= diffusion_deadline_calls,
            "constraintPass": abs(diffusion_applied) <= 0.20,
            "failure": "three denoising calls exceed the predeclared two-call teaching deadline; this is a deterministic call gate, not measured wall-clock latency",
            "denoisingTrace": diffusion_trace,
        },
    ]
    checks = {
        "serializer_emits_typed_modalities_and_masks": (
            serialized["languageTokenIds"].dtype == np.int64
            and serialized["visionToken"].shape == (4,)
            and serialized["stateToken"].shape == (1,)
            and bool(serialized["fresh"])
        ),
        "causal_transformer_uses_lower_triangular_masked_self_attention": (
            np.array_equal(
            attention_mask, np.tril(np.ones((3, 3), dtype=bool))
            )
            and np.all(transformer_attention[:, np.triu_indices(3, 1)[0], np.triu_indices(3, 1)[1]] == 0.0)
            and np.allclose(np.sum(transformer_attention, axis=-1), 1.0)
        ),
        "future_action_edit_cannot_change_earlier_transformer_outputs": (
            np.array_equal(
                original_predictions[:, :2], future_edited_predictions[:, :2]
            )
            and np.array_equal(
                original_attention[:, :2], future_edited_attention[:, :2]
            )
            and not np.allclose(
                original_predictions[:, 2:], future_edited_predictions[:, 2:]
            )
        ),
        "causal_transformer_fits_one_batch": transformer_final
        < transformer_initial * 0.02,
        "language_counterfactual_changes_action_sign": left_action < 0.0 < right_action,
        "diffusion_corruption_head_is_trainable": diffusion_final < diffusion_initial,
        "diffusion_sampling_is_bounded_and_deterministic": (
            abs(diffusion_applied) <= 0.20
            and np.array_equal(diffusion_repeat_sample, diffusion_requested_array)
        ),
        "hard_call_gate_precedes_decoder_ranking": (
            all(
                row["deadlinePass"]
                == (row["decoderCalls"] <= row["deadlineCallBudget"])
                for row in rows
            )
            and rows[0]["deadlinePass"]
            and not rows[1]["deadlinePass"]
        ),
        "decoder_failure_is_preserved": rows[1]["failure"] is not None,
    }
    return ProjectResult(
        manifest={
            "seed": 41,
            "serializerSchema": "language-vision-state/1.0",
            "vocabulary": list(serializer.vocabulary),
            "causalTargetContract": "input[t] contains actions strictly before target action[t]",
            "transformerContract": {
                "decoder": "one-head causal self-attention with residual state and action head",
                "hiddenWidth": transformer.hidden_width,
                "trainableParameters": transformer.parameter_count,
                "mask": "lower triangular before attention softmax",
                "futureEditCheck": "editing token 2 must leave predictions 0 and 1 unchanged",
            },
            "diffusionAlphaBar": DIFFUSION_ALPHA_BAR,
            "matchedTrainingUpdates": updates,
            "sharedCleanActionTargets": int(targets.size),
            "deadline": {
                "unit": "decoder calls per action",
                "hardMaximum": diffusion_deadline_calls,
                "wallClockMeasured": False,
            },
            "actionBoundsM": [-0.20, 0.20],
            "independentUnit": "paired decoder condition",
            "matrixAxes": {"arm": [row["arm"] for row in rows]},
        },
        rows=rows,
        checks=checks,
        artifacts={
            "serializerEvidence": {
                "languageTokenDtype": str(serialized["languageTokenIds"].dtype),
                "languageTokenShape": list(serialized["languageTokenIds"].shape),
                "languageMask": serialized["languageMask"],
                "visionTokenShape": list(serialized["visionToken"].shape),
                "stateTokenShape": list(serialized["stateToken"].shape),
                "fresh": bool(serialized["fresh"]),
            },
            "transformerEvidence": {
                "decoderInputs": contracts["decoderInputs"],
                "targets": contracts["targets"],
                "targetMask": contracts["targetMask"],
                "attentionMask": contracts["attentionMask"],
                "attentionWeights": transformer_attention,
                "initialParameterSha256": transformer_initial_hash,
                "trainedParameterSha256": transformer_trained_hash,
                "originalTokens": original_tokens,
                "futureEditedTokens": future_edited_tokens,
                "originalPredictionsM": original_predictions,
                "futureEditedPredictionsM": future_edited_predictions,
            },
            "groundingCounterfactual": {
                "leftRequestedActionM": left_action,
                "rightRequestedActionM": right_action,
            },
            "diffusionSamplingEvidence": {
                "firstSampleM": diffusion_requested_array,
                "repeatSampleM": diffusion_repeat_sample,
            },
        },
        decision="The trained causal transformer and diffusion-style decoder execute behind the same serializer, clean targets, update count, and action bound. The three-step diffusion decoder fails the declared two-call gate; no architecture-wide quality claim follows.",
        boundary="This is real local NumPy training of a tiny one-head causal transformer and a diffusion-style noise head, followed by deterministic decoding on synthetic tokens. It is not a learned-policy result from an external simulator, an image-model benchmark, measured accelerator latency, or a physical-robot result.",
    )


# ---------------------------------------------------------------------------
# 5. Controller, watchdog, authority, fallback, rollback, and resume trace
# ---------------------------------------------------------------------------


AUTHORITY_PRIORITY = {
    "policy": 10,
    "fallback": 30,
    "human": 50,
    "watchdog_stop": 100,
}


@dataclass(frozen=True)
class ControlCommand:
    owner: str
    dx_m: float
    reason: str


@dataclass(frozen=True)
class CameraHealthPacket:
    sequence: int
    captured_at_ms: int
    received_at_ms: int
    valid: bool = True

    @property
    def age_ms(self) -> int:
        return self.received_at_ms - self.captured_at_ms


class AuthorityArbiter:
    def select(self, commands: Iterable[ControlCommand]) -> ControlCommand:
        commands = list(commands)
        if not commands:
            raise ValueError("at least one authority command is required")
        for command in commands:
            if command.owner not in AUTHORITY_PRIORITY:
                raise ValueError(f"unknown authority owner: {command.owner}")
        return max(commands, key=lambda command: AUTHORITY_PRIORITY[command.owner])


class IndependentWatchdog:
    def __init__(self, max_camera_age_ms: int = 40, workspace_max_m: float = 1.0) -> None:
        self.max_camera_age_ms = max_camera_age_ms
        self.workspace_max_m = workspace_max_m

    def evaluate(self, camera_age_ms: int, proprio_x_m: float) -> ControlCommand | None:
        if camera_age_ms < 0:
            return ControlCommand("watchdog_stop", 0.0, "camera_timestamp_from_future")
        if camera_age_ms > self.max_camera_age_ms:
            return ControlCommand("watchdog_stop", 0.0, "stale_camera")
        if not -0.2 <= proprio_x_m <= self.workspace_max_m:
            return ControlCommand("watchdog_stop", 0.0, "workspace_envelope")
        return None


class RecoveryController:
    def __init__(
        self,
        max_fresh_window_ms: int = 80,
        max_resume_age_ms: int = 40,
    ) -> None:
        self.x_m = 0.20
        self.mode = "policy"
        self.max_fresh_window_ms = max_fresh_window_ms
        self.max_resume_age_ms = max_resume_age_ms
        self._fresh_packet_count = 0
        self._last_camera_sequence = -1
        self._last_camera_captured_at_ms: int | None = None
        self._last_camera_received_at_ms: int | None = None
        self._fresh_window_started_at_ms: int | None = None
        self._last_accepted_received_at_ms: int | None = None
        self.resume_receipt: dict[str, Any] | None = None
        self.rng = np.random.default_rng(53)

    @property
    def fresh_packet_count(self) -> int:
        return self._fresh_packet_count

    def snapshot(self) -> dict[str, Any]:
        return {
            "xM": self.x_m,
            "mode": self.mode,
            "freshPacketCount": self._fresh_packet_count,
            "lastCameraSequence": self._last_camera_sequence,
            "lastCameraCapturedAtMs": self._last_camera_captured_at_ms,
            "lastCameraReceivedAtMs": self._last_camera_received_at_ms,
            "freshWindowStartedAtMs": self._fresh_window_started_at_ms,
            "lastAcceptedReceivedAtMs": self._last_accepted_received_at_ms,
            "maxFreshWindowMs": self.max_fresh_window_ms,
            "maxResumeAgeMs": self.max_resume_age_ms,
            "resumeReceipt": self.resume_receipt,
            "rngState": json_ready(self.rng.bit_generator.state),
        }

    def restore(self, snapshot: dict[str, Any]) -> None:
        self.x_m = float(snapshot["xM"])
        self.mode = str(snapshot["mode"])
        self._fresh_packet_count = int(snapshot["freshPacketCount"])
        self._last_camera_sequence = int(snapshot["lastCameraSequence"])
        self._last_camera_captured_at_ms = snapshot["lastCameraCapturedAtMs"]
        self._last_camera_received_at_ms = snapshot["lastCameraReceivedAtMs"]
        self._fresh_window_started_at_ms = snapshot["freshWindowStartedAtMs"]
        self._last_accepted_received_at_ms = snapshot["lastAcceptedReceivedAtMs"]
        self.max_fresh_window_ms = int(snapshot["maxFreshWindowMs"])
        self.max_resume_age_ms = int(snapshot["maxResumeAgeMs"])
        self.resume_receipt = snapshot["resumeReceipt"]
        self.rng = np.random.default_rng()
        self.rng.bit_generator.state = snapshot["rngState"]

    def policy_command(self) -> ControlCommand:
        return ControlCommand("policy", min(0.08, 0.80 - self.x_m), "reach_target")

    def fallback_command(self) -> ControlCommand:
        # The fallback uses proprioception only and never advances toward the target.
        return ControlCommand("fallback", -0.02 if self.x_m > 0.25 else 0.0, "bounded_retreat")

    def apply(self, command: ControlCommand) -> None:
        self.x_m += float(np.clip(command.dx_m, -0.08, 0.08))
        self.mode = command.owner

    def observe_camera_packet(
        self, packet: CameraHealthPacket, watchdog: IndependentWatchdog
    ) -> tuple[dict[str, Any], ControlCommand | None]:
        """Update the consecutive-fresh gate from an actually checked packet."""
        expected_sequence = self._last_camera_sequence + 1
        sequence_ok = packet.sequence == expected_sequence
        self._last_camera_sequence = max(self._last_camera_sequence, packet.sequence)
        timestamp_monotonic = (
            self._last_camera_captured_at_ms is None
            or self._last_camera_received_at_ms is None
            or (
                packet.captured_at_ms > self._last_camera_captured_at_ms
                and packet.received_at_ms > self._last_camera_received_at_ms
            )
        )
        stop = watchdog.evaluate(camera_age_ms=packet.age_ms, proprio_x_m=self.x_m)
        if not packet.valid:
            stop = ControlCommand("watchdog_stop", 0.0, "camera_packet_invalid")
        elif not sequence_ok:
            stop = ControlCommand("watchdog_stop", 0.0, "camera_sequence_gap")
        elif stop is None and not timestamp_monotonic:
            stop = ControlCommand(
                "watchdog_stop", 0.0, "camera_timestamp_not_monotonic"
            )
        elif (
            stop is None
            and self._fresh_window_started_at_ms is not None
            and packet.received_at_ms - self._fresh_window_started_at_ms
            > self.max_fresh_window_ms
        ):
            stop = ControlCommand(
                "watchdog_stop", 0.0, "camera_freshness_window_exceeded"
            )
        self._last_camera_captured_at_ms = (
            packet.captured_at_ms
            if self._last_camera_captured_at_ms is None
            else max(self._last_camera_captured_at_ms, packet.captured_at_ms)
        )
        self._last_camera_received_at_ms = (
            packet.received_at_ms
            if self._last_camera_received_at_ms is None
            else max(self._last_camera_received_at_ms, packet.received_at_ms)
        )
        if stop is not None:
            self._fresh_packet_count = 0
            self._fresh_window_started_at_ms = None
            self._last_accepted_received_at_ms = None
            return {
                "accepted": False,
                "cameraSequence": packet.sequence,
                "capturedAtMs": packet.captured_at_ms,
                "receivedAtMs": packet.received_at_ms,
                "cameraAgeMs": packet.age_ms,
                "reason": stop.reason,
                "freshPacketCount": self._fresh_packet_count,
                "freshWindowStartedAtMs": self._fresh_window_started_at_ms,
            }, stop
        if self._fresh_window_started_at_ms is None:
            self._fresh_window_started_at_ms = packet.received_at_ms
        self._fresh_packet_count += 1
        self._last_accepted_received_at_ms = packet.received_at_ms
        return {
            "accepted": True,
            "cameraSequence": packet.sequence,
            "capturedAtMs": packet.captured_at_ms,
            "receivedAtMs": packet.received_at_ms,
            "cameraAgeMs": packet.age_ms,
            "reason": "fresh",
            "freshPacketCount": self._fresh_packet_count,
            "freshWindowStartedAtMs": self._fresh_window_started_at_ms,
        }, None

    def authorize_resume(self, operator: str, reason: str, timestamp_ms: int) -> dict[str, Any]:
        if self.mode != "fallback":
            raise RuntimeError("fallback must own control before human resume")
        if self._fresh_packet_count < 3:
            raise RuntimeError("three consecutive fresh packets are required before resume")
        if self._last_accepted_received_at_ms is None:
            raise RuntimeError("accepted camera evidence is required before resume")
        if timestamp_ms < self._last_accepted_received_at_ms:
            raise RuntimeError("resume receipt cannot predate current camera evidence")
        evidence_age_ms = timestamp_ms - self._last_accepted_received_at_ms
        if evidence_age_ms > self.max_resume_age_ms:
            raise RuntimeError("current camera evidence expired before resume")
        self.resume_receipt = {
            "operator": operator,
            "reason": reason,
            "timestampMs": timestamp_ms,
            "fromMode": self.mode,
            "evidenceReceivedAtMs": self._last_accepted_received_at_ms,
            "evidenceAgeMs": evidence_age_ms,
        }
        self.mode = "human"
        return self.resume_receipt


def recovery_event_trace() -> tuple[list[dict[str, Any]], dict[str, Any]]:
    controller = RecoveryController()
    watchdog = IndependentWatchdog()
    arbiter = AuthorityArbiter()
    events: list[dict[str, Any]] = []

    snapshot = controller.snapshot()
    snapshot_hash = stable_hash(snapshot)
    requested = controller.policy_command()
    fault_packet = CameraHealthPacket(sequence=0, captured_at_ms=20, received_at_ms=100)
    packet_evidence, stop = controller.observe_camera_packet(fault_packet, watchdog)
    assert stop is not None
    selected = arbiter.select([requested, controller.fallback_command(), stop])
    before = controller.x_m
    controller.apply(selected)
    events.append(
        {
            "phase": "detect_and_contain",
            "fault": stop.reason,
            **packet_evidence,
            "requestedActionM": requested.dx_m,
            "appliedActionM": selected.dx_m,
            "owner": selected.owner,
            "preXM": before,
            "postXM": controller.x_m,
        }
    )

    # Perturb internal state to prove rollback restores controller and RNG state.
    controller.x_m = 0.44
    _ = controller.rng.normal()
    corrupt_hash = stable_hash(controller.snapshot())
    controller.restore(snapshot)
    restored_hash = stable_hash(controller.snapshot())
    fallback_entry = controller.fallback_command()
    controller.apply(fallback_entry)
    events.append(
        {
            "phase": "rollback",
            "owner": "fallback",
            "snapshotHash": snapshot_hash,
            "corruptHash": corrupt_hash,
            "restoredHash": restored_hash,
            "restored": restored_hash == snapshot_hash,
            "appliedActionM": fallback_entry.dx_m,
        }
    )

    recovery_packets = (
        # The full rollback restores the sensor cursor with controller/RNG
        # state, so this replay branch restarts its local packet sequence at 0.
        CameraHealthPacket(sequence=0, captured_at_ms=108, received_at_ms=120),
        CameraHealthPacket(sequence=1, captured_at_ms=132, received_at_ms=140),
        CameraHealthPacket(sequence=2, captured_at_ms=155, received_at_ms=160),
    )
    for packet in recovery_packets:
        packet_evidence, packet_stop = controller.observe_camera_packet(packet, watchdog)
        assert packet_stop is None
        fallback = controller.fallback_command()
        controller.apply(fallback)
        events.append(
            {
                "phase": "fallback_freshness_gate",
                **packet_evidence,
                "requiredFreshPackets": 3,
                "owner": "fallback",
                "appliedActionM": fallback.dx_m,
                "freshnessSatisfied": controller.fresh_packet_count >= 3,
                "resumeAuthorized": False,
            }
        )

    receipt = controller.authorize_resume("operator-01", "scene inspected", 161)
    human_command = ControlCommand("human", 0.0, "explicit_resume")
    selected_resume = arbiter.select([controller.fallback_command(), human_command])
    controller.apply(selected_resume)
    events.append(
        {
            "phase": "resume",
            "owner": selected_resume.owner,
            "appliedActionM": selected_resume.dx_m,
            "resumeReceipt": receipt,
            "autonomous": False,
        }
    )
    metadata = {
        "snapshotHash": snapshot_hash,
        "restoredHash": restored_hash,
        "finalState": controller.snapshot(),
    }
    for row_index, event in enumerate(events):
        event["rowIndex"] = row_index
    return events, metadata


def recovery_adversarial_evidence() -> dict[str, Any]:
    watchdog = IndependentWatchdog()

    future_controller = RecoveryController()
    future_controller.mode = "fallback"
    future_evidence, future_stop = future_controller.observe_camera_packet(
        CameraHealthPacket(0, 110, 100), watchdog
    )

    reset_controller = RecoveryController()
    reset_controller.mode = "fallback"
    reset_controller.observe_camera_packet(CameraHealthPacket(0, 90, 100), watchdog)
    reset_evidence, reset_stop = reset_controller.observe_camera_packet(
        CameraHealthPacket(1, 101, 110, valid=False), watchdog
    )

    monotonic_controller = RecoveryController()
    monotonic_controller.mode = "fallback"
    monotonic_controller.observe_camera_packet(
        CameraHealthPacket(0, 90, 100), watchdog
    )
    monotonic_evidence, monotonic_stop = monotonic_controller.observe_camera_packet(
        CameraHealthPacket(1, 80, 90), watchdog
    )

    window_controller = RecoveryController(max_fresh_window_ms=80)
    window_controller.mode = "fallback"
    window_controller.observe_camera_packet(CameraHealthPacket(0, 90, 100), watchdog)
    window_controller.observe_camera_packet(CameraHealthPacket(1, 130, 140), watchdog)
    window_evidence, window_stop = window_controller.observe_camera_packet(
        CameraHealthPacket(2, 171, 181), watchdog
    )

    resume_controller = RecoveryController(max_resume_age_ms=40)
    resume_controller.mode = "fallback"
    for packet in (
        CameraHealthPacket(0, 90, 100),
        CameraHealthPacket(1, 110, 120),
        CameraHealthPacket(2, 130, 140),
    ):
        resume_controller.observe_camera_packet(packet, watchdog)
    predated_error = None
    expired_error = None
    try:
        resume_controller.authorize_resume("operator", "predated", 139)
    except RuntimeError as error:
        predated_error = str(error)
    try:
        resume_controller.authorize_resume("operator", "expired", 181)
    except RuntimeError as error:
        expired_error = str(error)

    return {
        "futureCamera": {
            "evidence": future_evidence,
            "stopReason": future_stop.reason if future_stop else None,
        },
        "badPacketReset": {
            "evidence": reset_evidence,
            "stopReason": reset_stop.reason if reset_stop else None,
            "freshPacketCountAfter": reset_controller.fresh_packet_count,
        },
        "nonMonotonicTimestamps": {
            "evidence": monotonic_evidence,
            "stopReason": monotonic_stop.reason if monotonic_stop else None,
            "freshPacketCountAfter": monotonic_controller.fresh_packet_count,
        },
        "freshnessWindow": {
            "evidence": window_evidence,
            "stopReason": window_stop.reason if window_stop else None,
            "freshPacketCountAfter": window_controller.fresh_packet_count,
        },
        "resumeTiming": {
            "lastEvidenceReceivedAtMs": 140,
            "predatedReceiptTimestampMs": 139,
            "expiredReceiptTimestampMs": 181,
            "predatedError": predated_error,
            "expiredError": expired_error,
        },
    }


def recovery_intervention(profile: str, output: Path) -> ProjectResult:
    del profile, output
    events, metadata = recovery_event_trace()
    adversarial = recovery_adversarial_evidence()
    stop_event = events[0]
    rollback_event = events[1]
    resume_event = events[-1]
    arbiter = AuthorityArbiter()
    precedence = arbiter.select(
        [
            ControlCommand("human", 0.03, "manual_move"),
            ControlCommand("watchdog_stop", 0.0, "constraint"),
            ControlCommand("policy", 0.08, "nominal"),
        ]
    )
    checks = {
        "watchdog_changes_requested_to_safe_applied_action": (
            stop_event["requestedActionM"] != stop_event["appliedActionM"]
            and stop_event["appliedActionM"] == 0.0
        ),
        "future_and_stale_camera_ages_are_rejected": (
            stop_event["reason"] == "stale_camera"
            and adversarial["futureCamera"]["stopReason"]
            == "camera_timestamp_from_future"
            and not adversarial["futureCamera"]["evidence"]["accepted"]
        ),
        "watchdog_stop_has_non_overridable_precedence": precedence.owner == "watchdog_stop",
        "fallback_owns_freshness_gate": all(
            event["owner"] == "fallback"
            for event in events
            if event["phase"] == "fallback_freshness_gate"
        ),
        "rollback_restores_controller_and_rng_hash": rollback_event["restored"],
        "resume_requires_three_fresh_packets": events[-2]["freshPacketCount"] == 3,
        "freshness_gate_is_derived_from_checked_packet_sequence": (
            [
                event["cameraSequence"]
                for event in events
                if event["phase"] == "fallback_freshness_gate"
            ]
            == [0, 1, 2]
            and all(
                event["accepted"]
                for event in events
                if event["phase"] == "fallback_freshness_gate"
            )
        ),
        "bad_packet_resets_consecutive_freshness": (
            adversarial["badPacketReset"]["stopReason"]
            == "camera_packet_invalid"
            and adversarial["badPacketReset"]["freshPacketCountAfter"] == 0
        ),
        "freshness_requires_monotonic_timestamps": (
            adversarial["nonMonotonicTimestamps"]["stopReason"]
            == "camera_timestamp_not_monotonic"
            and adversarial["nonMonotonicTimestamps"]["freshPacketCountAfter"] == 0
        ),
        "freshness_requires_bounded_consecutive_window": (
            adversarial["freshnessWindow"]["stopReason"]
            == "camera_freshness_window_exceeded"
            and adversarial["freshnessWindow"]["freshPacketCountAfter"] == 0
        ),
        "resume_receipt_must_use_current_unexpired_evidence": (
            adversarial["resumeTiming"]["predatedError"]
            == "resume receipt cannot predate current camera evidence"
            and adversarial["resumeTiming"]["expiredError"]
            == "current camera evidence expired before resume"
            and resume_event["resumeReceipt"]["evidenceAgeMs"] == 1
        ),
        "human_resume_has_receipt_and_is_assisted": (
            resume_event["owner"] == "human"
            and not resume_event["autonomous"]
            and resume_event["resumeReceipt"]["operator"] == "operator-01"
        ),
        "authority_transfer_is_visible_in_trace": [
            event["owner"] for event in events if "owner" in event
        ] == ["watchdog_stop", "fallback", "fallback", "fallback", "fallback", "human"],
    }
    return ProjectResult(
        manifest={
            "seed": 53,
            "fault": "stale_camera",
            "cameraAgeGateMs": 40,
            "freshPacketsBeforeResume": 3,
            "maxFreshWindowMs": 80,
            "maxResumeEvidenceAgeMs": 40,
            "cameraHealthPacketSchema": [
                "sequence",
                "captured_at_ms",
                "received_at_ms",
                "valid",
            ],
            "authorityPriority": AUTHORITY_PRIORITY,
            "rollbackSnapshotHash": metadata["snapshotHash"],
            "independentUnit": "fault-injection episode",
            "matrixAxes": {"rowIndex": list(range(len(events)))},
            "matrixIdentity": "rowIndex identifies the ordered executable authority events; phase is the emitted event phase.",
        },
        rows=events,
        checks=checks,
        artifacts={"adversarialEvidence": adversarial},
        decision="The independent watchdog wins authority and holds the faulted command; rollback restores the paired state, fallback owns bounded monotonic freshness checks, and only a current unexpired human receipt resumes control.",
        boundary="This is real local deterministic authority and rollback logic. It is not a learned-policy result from a robot, a physical stop-distance measurement, a human-factors study, or an operational safety certification.",
    )


# ---------------------------------------------------------------------------
# 6. Pinned portable baseline, matched intervention, profiles, and verifier
# ---------------------------------------------------------------------------


RESEARCH_BASELINE = {
    "id": "portable-linear-reach-v1",
    "algorithm": "bounded proportional controller in deterministic 1-D environment",
    "implementationRevision": "embodied-starter/2.0",
    "requiredDependency": "numpy==2.4.4",
    "externalAssets": [],
    "horizon": 10,
    "targetXM": 0.80,
    "actionLimitM": 0.20,
    "scheduledComputeTicksPerStep": 5,
    "successToleranceM": 0.06,
    "controllerGains": {"baseline": 0.35, "treatment": 0.55},
    "assisted": False,
    "autonomous": True,
}


def research_seeds(profile: str) -> tuple[int, ...]:
    return (101, 202, 303) if profile == "smoke" else tuple(range(101, 113))


def research_rollout(
    seed: int,
    arm: str,
    controller_gain: float,
    disturbances: np.ndarray,
    horizon: int = 10,
) -> dict[str, Any]:
    rng = np.random.default_rng(seed)
    initial_x = float(rng.uniform(-0.30, 0.05))
    target_x = 0.80
    x_m = initial_x
    trace: list[dict[str, Any]] = []
    scheduled_compute_ticks = 0
    for step_index in range(horizon):
        requested = controller_gain * (target_x - x_m)
        applied = float(np.clip(requested, -0.20, 0.20))
        before = x_m
        x_m += applied + float(disturbances[step_index])
        scheduled_compute_ticks += 5
        trace.append(
            {
                "step": step_index,
                "preXM": before,
                "requestedDxM": requested,
                "appliedDxM": applied,
                "disturbanceM": float(disturbances[step_index]),
                "postXM": x_m,
            }
        )
    final_error = abs(target_x - x_m)
    deadline_budget_ticks = horizon * 5
    return {
        "seed": seed,
        "pairId": f"seed-{seed}",
        "arm": arm,
        "controllerGain": controller_gain,
        "initialXM": initial_x,
        "targetXM": target_x,
        "horizon": horizon,
        "actionLimitM": 0.20,
        "policyCalls": horizon,
        "scheduledComputeTicks": scheduled_compute_ticks,
        "deadlineBudgetTicks": deadline_budget_ticks,
        "deadlinePass": scheduled_compute_ticks <= deadline_budget_ticks,
        "deadlineMiss": int(scheduled_compute_ticks > deadline_budget_ticks),
        "disturbanceHash": array_hash(disturbances),
        "finalErrorM": final_error,
        "success": final_error <= 0.06,
        "assisted": False,
        "autonomous": True,
        "trace": trace,
    }


def verify_research_rows(
    manifest: dict[str, Any], rows: Sequence[dict[str, Any]]
) -> dict[str, bool]:
    seeds = tuple(int(seed) for seed in manifest["seeds"])
    arms = tuple(str(arm) for arm in manifest["arms"])
    expected_cells = {(seed, arm) for seed in seeds for arm in arms}
    actual_cells = {(int(row["seed"]), str(row["arm"])) for row in rows}
    required = {
        "seed",
        "pairId",
        "arm",
        "controllerGain",
        "initialXM",
        "targetXM",
        "horizon",
        "actionLimitM",
        "policyCalls",
        "scheduledComputeTicks",
        "deadlineBudgetTicks",
        "deadlinePass",
        "deadlineMiss",
        "disturbanceHash",
        "finalErrorM",
        "success",
        "assisted",
        "autonomous",
        "trace",
    }
    rows_by_seed: dict[int, list[dict[str, Any]]] = {
        seed: [row for row in rows if int(row["seed"]) == seed] for seed in seeds
    }
    matched_fields = (
        "pairId",
        "initialXM",
        "targetXM",
        "horizon",
        "actionLimitM",
        "policyCalls",
        "scheduledComputeTicks",
        "deadlineBudgetTicks",
        "deadlinePass",
        "deadlineMiss",
        "disturbanceHash",
        "assisted",
        "autonomous",
    )
    pairs_match = all(
        len(pair) == len(arms)
        and all(pair[0][field] == row[field] for row in pair[1:] for field in matched_fields)
        for pair in rows_by_seed.values()
    )
    gains = manifest["intervention"]["controllerGain"]
    pinned_gains = RESEARCH_BASELINE["controllerGains"]
    one_change = (
        gains == pinned_gains
        and manifest["intervention"]["onlyChangedField"] == "controllerGain"
        and all(
            row["arm"] in gains
            and math.isclose(
                float(row["controllerGain"]), float(gains[row["arm"]]), abs_tol=1e-12
            )
            for row in rows
        )
    )

    ticks_per_step = int(RESEARCH_BASELINE["scheduledComputeTicksPerStep"])

    def recompute_row(row: dict[str, Any]) -> dict[str, bool]:
        """Recompute a raw row from its pinned seed and trace, never its claims."""
        try:
            seed = int(row["seed"])
            expected_gain = float(gains[str(row["arm"])])
            horizon = int(RESEARCH_BASELINE["horizon"])
            target = float(RESEARCH_BASELINE["targetXM"])
            action_limit = float(RESEARCH_BASELINE["actionLimitM"])
            success_tolerance = float(RESEARCH_BASELINE["successToleranceM"])
            expected_initial = float(np.random.default_rng(seed).uniform(-0.30, 0.05))
            expected_disturbances = np.random.default_rng(seed + 10_000).uniform(
                -0.003, 0.003, size=horizon
            )
            trace = row["trace"]
            x_m = expected_initial
            mechanics_ok = len(trace) == horizon
            observed_disturbances: list[float] = []
            for step_index, event in enumerate(trace):
                disturbance = float(event["disturbanceM"])
                requested = expected_gain * (target - x_m)
                applied = float(np.clip(requested, -action_limit, action_limit))
                post_x = x_m + applied + disturbance
                mechanics_ok = mechanics_ok and all(
                    (
                        int(event["step"]) == step_index,
                        math.isclose(float(event["preXM"]), x_m, abs_tol=1e-12),
                        math.isclose(
                            float(event["requestedDxM"]), requested, abs_tol=1e-12
                        ),
                        math.isclose(float(event["appliedDxM"]), applied, abs_tol=1e-12),
                        math.isclose(float(event["postXM"]), post_x, abs_tol=1e-12),
                    )
                )
                observed_disturbances.append(disturbance)
                x_m = post_x
            observed_disturbance_array = np.asarray(observed_disturbances, dtype=np.float64)
            final_error = abs(target - x_m)
            metrics_ok = all(
                (
                    math.isclose(float(row["controllerGain"]), expected_gain, abs_tol=1e-12),
                    math.isclose(float(row["initialXM"]), expected_initial, abs_tol=1e-12),
                    math.isclose(float(row["targetXM"]), target, abs_tol=1e-12),
                    int(row["horizon"]) == horizon,
                    math.isclose(float(row["actionLimitM"]), action_limit, abs_tol=1e-12),
                    np.allclose(observed_disturbance_array, expected_disturbances, atol=1e-12),
                    row["disturbanceHash"] == array_hash(expected_disturbances),
                    math.isclose(float(row["finalErrorM"]), final_error, abs_tol=1e-12),
                    bool(row["success"]) == (final_error <= success_tolerance),
                    bool(row["assisted"]) is bool(RESEARCH_BASELINE["assisted"]),
                    bool(row["autonomous"])
                    is bool(RESEARCH_BASELINE["autonomous"]),
                )
            )
            scheduled_ticks = horizon * ticks_per_step
            deadline_ok = all(
                (
                    int(row["policyCalls"]) == horizon,
                    int(row["scheduledComputeTicks"]) == scheduled_ticks,
                    int(row["deadlineBudgetTicks"]) == scheduled_ticks,
                    bool(row["deadlinePass"]),
                    int(row["deadlineMiss"]) == 0,
                )
            )
            return {
                "mechanics": mechanics_ok,
                "metrics": metrics_ok,
                "deadline": deadline_ok,
            }
        except (KeyError, TypeError, ValueError, IndexError):
            return {"mechanics": False, "metrics": False, "deadline": False}

    recomputed = [recompute_row(row) for row in rows]
    return {
        "portable_baseline_revision_and_dependency_are_pinned": (
            manifest.get("portableBaseline") == RESEARCH_BASELINE
        ),
        "profile_seed_matrix_matches_declared_budget": (
            manifest.get("profile") in PROFILES
            and seeds == research_seeds(str(manifest["profile"]))
        ),
        "complete_seed_by_arm_matrix": actual_cells == expected_cells,
        "all_raw_rows_have_verifier_fields": all(required.issubset(row) for row in rows),
        "baseline_and_intervention_are_paired": pairs_match,
        "exactly_one_predeclared_mechanism_changes": one_change,
        "raw_trajectories_and_metrics_recompute_from_pinned_seeds": all(
            item["mechanics"] and item["metrics"] for item in recomputed
        ),
        "hard_deadline_gate_passes_every_accepted_row": all(
            item["deadline"] for item in recomputed
        ),
        "trace_lengths_match_declared_horizons": all(
            len(row["trace"]) == row["horizon"] for row in rows
        ),
        "no_assisted_run_is_counted_as_autonomous": all(
            row["assisted"] is RESEARCH_BASELINE["assisted"]
            and row["autonomous"] is RESEARCH_BASELINE["autonomous"]
            for row in rows
        ),
    }


def research_paired_effects(
    rows: Sequence[dict[str, Any]], seeds: Sequence[int]
) -> list[dict[str, Any]]:
    paired_effects: list[dict[str, Any]] = []
    for seed in seeds:
        pair = {row["arm"]: row for row in rows if int(row["seed"]) == int(seed)}
        if set(pair) != {"baseline", "treatment"}:
            continue
        paired_effects.append(
            {
                "seed": int(seed),
                "baselineFinalErrorM": pair["baseline"]["finalErrorM"],
                "treatmentFinalErrorM": pair["treatment"]["finalErrorM"],
                "treatmentMinusBaselineErrorM": (
                    pair["treatment"]["finalErrorM"]
                    - pair["baseline"]["finalErrorM"]
                ),
            }
        )
    return paired_effects


def verify_research_evidence(
    manifest: dict[str, Any],
    rows: Sequence[dict[str, Any]],
    artifacts: dict[str, Any],
) -> dict[str, bool]:
    checks = verify_research_rows(manifest, rows)
    expected_effects = research_paired_effects(rows, manifest.get("seeds", []))
    checks["paired_effects_recompute_from_verified_rows"] = (
        artifacts.get("pairedEffects") == expected_effects
        and len(expected_effects) == len(manifest.get("seeds", []))
    )
    return checks


def embodied_research(profile: str, output: Path) -> ProjectResult:
    del output
    seeds = research_seeds(profile)
    arms = dict(RESEARCH_BASELINE["controllerGains"])
    rows: list[dict[str, Any]] = []
    for seed in seeds:
        disturbance_rng = np.random.default_rng(seed + 10_000)
        disturbances = disturbance_rng.uniform(-0.003, 0.003, size=10)
        for arm, gain in arms.items():
            rows.append(research_rollout(seed, arm, gain, disturbances))
    manifest = {
        "profile": profile,
        "portableBaseline": RESEARCH_BASELINE,
        "seeds": list(seeds),
        "arms": list(arms),
        "matrixAxes": {"seed": list(seeds), "arm": list(arms)},
        "intervention": {
            "onlyChangedField": "controllerGain",
            "controllerGain": arms,
        },
        "matchedPrimitiveBudgets": [
            "initial state",
            "disturbance sequence",
            "horizon",
            "action bound",
            "policy calls",
            "scheduled deadline ticks",
        ],
        "hardDeadline": {
            "unit": "deterministic scheduled compute ticks",
            "ticksPerControlStep": 5,
            "wallClockMeasured": False,
        },
        "independentUnit": "paired seeded rollout",
    }
    paired_effects = research_paired_effects(rows, seeds)
    artifacts = {"pairedEffects": paired_effects}
    checks = verify_research_evidence(manifest, rows, artifacts)
    return ProjectResult(
        manifest=manifest,
        rows=rows,
        checks=checks,
        artifacts=artifacts,
        decision="The gain-only intervention is reported from every paired seed after the deterministic deadline gate. The result is bounded to this portable one-dimensional baseline and profile.",
        boundary="This is real local deterministic execution of a pinned portable teaching baseline. It is not a learned-policy result from an external benchmark, a physical-robot measurement, real timing evidence, or a general embodied-system conclusion.",
    )


BUILDERS: dict[str, Callable[[str, Path], ProjectResult]] = {
    "task-contract-capstone": task_contract,
    "state-estimator-capstone": state_estimator,
    "behavior-cloning-capstone": behavior_cloning,
    "vla-policy-capstone": vla_policy,
    "recovery-intervention-capstone": recovery_intervention,
    "embodied-research-capstone": embodied_research,
}


def checkpoint_content_hash(path: Path) -> str:
    digest = hashlib.sha256()
    with np.load(path, allow_pickle=False) as data:
        for key in sorted(data.files):
            digest.update(key.encode())
            value = np.asarray(data[key])
            digest.update(array_hash(value).encode())
    return digest.hexdigest()


def verify_canonical_nonresearch_evidence(
    project: str,
    profile: str,
    manifest: dict[str, Any],
    rows: Sequence[dict[str, Any]],
    artifacts: dict[str, Any],
    dossier_path: Path,
) -> dict[str, bool]:
    """Regenerate a deterministic starter fixture instead of trusting booleans."""
    with tempfile.TemporaryDirectory() as directory:
        expected_output = Path(directory) / dossier_path.name
        expected = BUILDERS[project](profile, expected_output)
        expected_manifest = {"profile": profile, **expected.manifest}
        manifest_matches = stable_hash(manifest) == stable_hash(expected_manifest)
        rows_match = stable_hash(rows) == stable_hash(expected.rows)
        if project == "behavior-cloning-capstone":
            actual_checkpoint = Path(str(artifacts.get("checkpoint", "")))
            if not actual_checkpoint.is_absolute():
                actual_checkpoint = dossier_path.parent / actual_checkpoint
            expected_checkpoint = expected_output.with_name(
                f"{expected_output.stem}-bc-checkpoint.npz"
            )
            checkpoint_exists = actual_checkpoint.is_file()
            checkpoint_receipt_matches = (
                checkpoint_exists
                and hashlib.sha256(actual_checkpoint.read_bytes()).hexdigest()
                == artifacts.get("checkpointSha256")
            )
            checkpoint_contents_match = (
                checkpoint_exists
                and checkpoint_content_hash(actual_checkpoint)
                == checkpoint_content_hash(expected_checkpoint)
            )
            comparable_actual = {
                key: value
                for key, value in artifacts.items()
                if key not in {"checkpoint", "checkpointSha256"}
            }
            comparable_expected = {
                key: value
                for key, value in (expected.artifacts or {}).items()
                if key not in {"checkpoint", "checkpointSha256"}
            }
            artifacts_match = (
                stable_hash(comparable_actual) == stable_hash(comparable_expected)
                and Path(str(artifacts.get("checkpoint", ""))).name
                == expected_checkpoint.name
                and checkpoint_receipt_matches
                and checkpoint_contents_match
            )
        else:
            artifacts_match = stable_hash(artifacts) == stable_hash(
                expected.artifacts or {}
            )
    evidence_matches = manifest_matches and rows_match and artifacts_match
    return {
        name: bool(passed and evidence_matches)
        for name, passed in expected.checks.items()
    }


def recompute_project_checks(
    project: str,
    manifest: dict[str, Any],
    rows: Sequence[dict[str, Any]],
    artifacts: dict[str, Any],
    dossier_path: Path,
) -> dict[str, bool]:
    profile = str(manifest.get("profile", ""))
    if profile not in PROFILES:
        return {"profile_is_supported": False}
    if project == "embodied-research-capstone":
        return verify_research_evidence(manifest, rows, artifacts)
    return verify_canonical_nonresearch_evidence(
        project, profile, manifest, rows, artifacts, dossier_path
    )


def run_project(project: str, profile: str, output: Path) -> dict[str, Any]:
    started = time.perf_counter()
    result = BUILDERS[project](profile, output)
    runtime_seconds = time.perf_counter() - started
    manifest = {"profile": profile, **result.manifest}
    artifacts = result.artifacts or {}
    checks = recompute_project_checks(
        project, manifest, result.rows, artifacts, output
    )
    if not all(checks.values()):
        failed = [name for name, passed in checks.items() if not passed]
        raise RuntimeError(f"{project} baseline checks failed: {failed}")
    dossier = {
        "schemaVersion": 1,
        "course": "embodied",
        "lessonId": project,
        "evidenceKind": "real local execution of a deterministic NumPy course-scale baseline",
        "execution": {
            "source": "local Python process",
            "profile": profile,
            "pythonVersion": platform.python_version(),
            "numpyVersion": np.__version__,
            "runtimeSecondsObserved": runtime_seconds,
            "runtimeIsEnvironmentDependent": True,
            "deterministicNumericalEvidence": True,
            "externalSimulatorUsed": False,
            "physicalRobotUsed": False,
        },
        "manifest": manifest,
        "checks": checks,
        "rawRows": result.rows,
        "artifacts": artifacts,
        "decision": result.decision,
        "boundary": result.boundary,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(json_ready(dossier), indent=2) + "\n")
    return dossier


def verify_dossier_file(path: Path) -> dict[str, Any]:
    dossier = json.loads(path.read_text())
    required_top_level = {
        "schemaVersion",
        "course",
        "lessonId",
        "evidenceKind",
        "execution",
        "manifest",
        "checks",
        "rawRows",
        "artifacts",
        "decision",
        "boundary",
    }
    if not required_top_level.issubset(dossier):
        missing = sorted(required_top_level - set(dossier))
        raise RuntimeError(f"dossier is missing required fields: {missing}")
    project = str(dossier.get("lessonId"))
    if project not in PROJECT_IDS or dossier.get("course") != "embodied":
        raise ValueError("--verify-dossier expects an Embodied capstone dossier")
    checks = recompute_project_checks(
        project,
        dossier["manifest"],
        dossier["rawRows"],
        dossier["artifacts"],
        path,
    )
    stored_checks_match = dossier.get("checks") == checks
    if not all(checks.values()) or not stored_checks_match:
        failed = [name for name, passed in checks.items() if not passed]
        if not stored_checks_match:
            failed.append("stored_checks_match_recomputed_evidence")
        raise RuntimeError(f"{project} dossier verification failed: {failed}")
    return {
        "verified": str(path),
        "project": project,
        "evidenceKind": "local deterministic regeneration and evidence verification",
        "checks": checks,
        "boundary": "Verification regenerates the pinned course fixture and checks its preserved evidence; it does not reproduce a robot or external benchmark result.",
    }


def verify_study_file(path: Path) -> dict[str, Any]:
    dossier = json.loads(path.read_text())
    if dossier.get("lessonId") != "embodied-research-capstone":
        raise ValueError("--verify-study expects an embodied-research-capstone dossier")
    return verify_dossier_file(path)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", choices=PROJECT_IDS)
    parser.add_argument("--profile", choices=PROFILES, default="smoke")
    parser.add_argument("--output", type=Path)
    parser.add_argument(
        "--verify-study",
        type=Path,
        help="verify a generated embodied-research-capstone dossier instead of running a project",
    )
    parser.add_argument(
        "--verify-dossier",
        type=Path,
        help="recompute any generated Embodied capstone dossier from preserved evidence",
    )
    args = parser.parse_args()
    if args.verify_study is not None and args.verify_dossier is not None:
        parser.error("choose only one of --verify-study or --verify-dossier")
    if args.verify_study is not None or args.verify_dossier is not None:
        if args.project is not None or args.output is not None:
            parser.error("verification cannot be combined with --project or --output")
    elif args.project is None or args.output is None:
        parser.error("--project and --output are required unless a verification mode is used")
    return args


def main() -> None:
    args = parse_args()
    if args.verify_study is not None:
        print(json.dumps(json_ready(verify_study_file(args.verify_study)), indent=2))
        return
    if args.verify_dossier is not None:
        print(json.dumps(json_ready(verify_dossier_file(args.verify_dossier)), indent=2))
        return
    dossier = run_project(args.project, args.profile, args.output)
    print(
        json.dumps(
            {
                "output": str(args.output),
                "project": args.project,
                "profile": args.profile,
                "runtimeSecondsObserved": dossier["execution"]["runtimeSecondsObserved"],
                "checks": dossier["checks"],
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
