import copy
import tempfile
import unittest
from pathlib import Path

import numpy as np

from embodied_capstone_starter import (
    embodied_research,
    research_rollout,
    run_project,
    verify_research_evidence,
    verify_research_rows,
    verify_study_file,
)


class ResearchStudyTests(unittest.TestCase):
    def test_smoke_and_full_profiles_emit_complete_paired_rows(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            smoke = embodied_research("smoke", root / "smoke.json")
            full = embodied_research("full", root / "full.json")
        self.assertEqual(len(smoke.rows), 6)
        self.assertEqual(len(full.rows), 24)
        self.assertTrue(all(smoke.checks.values()))
        self.assertTrue(all(full.checks.values()))
        for result in (smoke, full):
            self.assertEqual(
                result.manifest["intervention"]["onlyChangedField"], "controllerGain"
            )

    def test_hard_deadline_gate_rejects_one_tampered_row(self):
        result = embodied_research("smoke", Path("unused.json"))
        rows = copy.deepcopy(result.rows)
        rows[0]["deadlinePass"] = False
        rows[0]["deadlineMiss"] = 1
        rows[0]["scheduledComputeTicks"] = rows[0]["deadlineBudgetTicks"] + 1
        checks = verify_research_rows(result.manifest, rows)
        self.assertFalse(checks["hard_deadline_gate_passes_every_accepted_row"])
        self.assertTrue(checks["complete_seed_by_arm_matrix"])

    def test_verifier_rejects_unpinned_baseline_metadata(self):
        result = embodied_research("smoke", Path("unused.json"))
        manifest = copy.deepcopy(result.manifest)
        manifest["portableBaseline"]["requiredDependency"] = "numpy>=0"
        checks = verify_research_rows(manifest, result.rows)
        self.assertFalse(
            checks["portable_baseline_revision_and_dependency_are_pinned"]
        )
        self.assertTrue(checks["complete_seed_by_arm_matrix"])

    def test_verifier_recomputes_gains_trace_dynamics_and_metrics(self):
        result = embodied_research("smoke", Path("unused.json"))
        rows = copy.deepcopy(result.rows)
        rows[0]["controllerGain"] = 99.0
        rows[0]["trace"][0]["postXM"] = 12345.0
        rows[0]["finalErrorM"] = 0.0
        rows[0]["success"] = True
        checks = verify_research_rows(result.manifest, rows)
        self.assertFalse(checks["exactly_one_predeclared_mechanism_changes"])
        self.assertFalse(
            checks["raw_trajectories_and_metrics_recompute_from_pinned_seeds"]
        )

    def test_generated_dossier_round_trips_through_local_verifier(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "research.json"
            dossier = run_project(
                "embodied-research-capstone", "smoke", output
            )
            verification = verify_study_file(output)
        self.assertTrue(all(dossier["checks"].values()))
        self.assertTrue(all(verification["checks"].values()))
        self.assertIn("local deterministic", verification["evidenceKind"])

    def test_coordinated_gain_tamper_is_rejected_against_pinned_protocol(self):
        result = embodied_research("smoke", Path("unused.json"))
        manifest = copy.deepcopy(result.manifest)
        manifest["intervention"]["controllerGain"] = {
            "baseline": 0.15,
            "treatment": 0.75,
        }
        rows = []
        for seed in manifest["seeds"]:
            disturbances = np.random.default_rng(seed + 10_000).uniform(
                -0.003, 0.003, size=10
            )
            rows.append(research_rollout(seed, "baseline", 0.15, disturbances))
            rows.append(research_rollout(seed, "treatment", 0.75, disturbances))
        checks = verify_research_evidence(manifest, rows, result.artifacts)
        self.assertTrue(checks["portable_baseline_revision_and_dependency_are_pinned"])
        self.assertFalse(checks["exactly_one_predeclared_mechanism_changes"])

    def test_assistance_change_is_not_misreported_as_gain_only(self):
        result = embodied_research("smoke", Path("unused.json"))
        rows = copy.deepcopy(result.rows)
        for row in rows:
            if row["arm"] == "treatment":
                row["assisted"] = True
                row["autonomous"] = False
        checks = verify_research_evidence(result.manifest, rows, result.artifacts)
        self.assertFalse(checks["baseline_and_intervention_are_paired"])
        self.assertFalse(checks["raw_trajectories_and_metrics_recompute_from_pinned_seeds"])
        self.assertFalse(checks["no_assisted_run_is_counted_as_autonomous"])

    def test_paired_effect_summary_is_recomputed_from_rows(self):
        result = embodied_research("smoke", Path("unused.json"))
        artifacts = copy.deepcopy(result.artifacts)
        artifacts["pairedEffects"][0]["treatmentMinusBaselineErrorM"] = 999999.0
        checks = verify_research_evidence(result.manifest, result.rows, artifacts)
        self.assertFalse(checks["paired_effects_recompute_from_verified_rows"])


if __name__ == "__main__":
    unittest.main()
