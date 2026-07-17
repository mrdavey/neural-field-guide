import copy
import json
import tempfile
import unittest
from pathlib import Path

from embodied_capstone_starter import json_ready, run_project, verify_dossier_file


class DossierVerifierTests(unittest.TestCase):
    def test_each_nonresearch_dossier_round_trips_and_rejects_raw_tampering(self):
        tamper = {
            "task-contract-capstone": lambda dossier: dossier["rawRows"][0]["trace"][
                -1
            ].__setitem__("terminal", False),
            "state-estimator-capstone": lambda dossier: dossier["rawRows"][1].__setitem__(
                "selectedDetectorId", "forged"
            ),
            "behavior-cloning-capstone": lambda dossier: dossier["rawRows"][0].__setitem__(
                "success", False
            ),
            "vla-policy-capstone": lambda dossier: dossier["rawRows"][1].__setitem__(
                "decoderCalls", 1
            ),
            "recovery-intervention-capstone": lambda dossier: dossier["rawRows"][
                0
            ].__setitem__("owner", "policy"),
        }
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for project, mutate in tamper.items():
                with self.subTest(project=project):
                    output = root / f"{project}.json"
                    dossier = run_project(project, "smoke", output)
                    self.assertTrue(all(verify_dossier_file(output)["checks"].values()))
                    forged = copy.deepcopy(dossier)
                    mutate(forged)
                    forged_path = root / f"{project}-forged.json"
                    forged_path.write_text(
                        json.dumps(json_ready(forged), indent=2) + "\n"
                    )
                    with self.assertRaisesRegex(RuntimeError, "verification failed"):
                        verify_dossier_file(forged_path)

    def test_stored_check_boolean_cannot_override_recomputed_evidence(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "task.json"
            dossier = run_project("task-contract-capstone", "smoke", output)
            dossier["checks"]["oracle_validates_transition_mechanics"] = False
            output.write_text(json.dumps(dossier, indent=2) + "\n")
            with self.assertRaisesRegex(
                RuntimeError, "stored_checks_match_recomputed_evidence"
            ):
                verify_dossier_file(output)

    def test_vla_attention_or_future_output_tampering_fails_regeneration(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for field, mutate in (
                (
                    "future attention",
                    lambda dossier: dossier["artifacts"]["transformerEvidence"][
                        "attentionWeights"
                    ][0][0].__setitem__(2, 0.5),
                ),
                (
                    "future-edited earlier output",
                    lambda dossier: dossier["artifacts"]["transformerEvidence"][
                        "futureEditedPredictionsM"
                    ][0][0].__setitem__(0, 9.0),
                ),
            ):
                with self.subTest(field=field):
                    output = root / "vla.json"
                    dossier = run_project("vla-policy-capstone", "smoke", output)
                    mutate(dossier)
                    output.write_text(json.dumps(json_ready(dossier), indent=2) + "\n")
                    with self.assertRaisesRegex(RuntimeError, "verification failed"):
                        verify_dossier_file(output)


if __name__ == "__main__":
    unittest.main()
