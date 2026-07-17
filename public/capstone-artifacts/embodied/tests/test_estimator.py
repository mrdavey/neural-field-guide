import unittest

import numpy as np

from embodied_capstone_starter import (
    CameraDetection,
    CameraPacket,
    CameraProprioEstimator,
    ProprioPacket,
    Transform2D,
    estimator_fixture_trace,
    stable_hash,
)


class EstimatorTests(unittest.TestCase):
    def test_transform_and_nearest_association_update_covariance(self):
        transform = Transform2D("camera", "world", np.pi / 2.0, (1.0, 2.0))
        self.assertTrue(np.allclose(transform.apply((1.0, 0.0)), (1.0, 3.0)))

        nominal = estimator_fixture_trace()[0]
        self.assertEqual(nominal["selectedDetectorId"], "near")
        self.assertEqual(nominal["reason"], "updated")
        self.assertLess(
            nominal["posteriorCovarianceTraceM2"], nominal["priorCovarianceTraceM2"]
        )

    def test_anisotropic_camera_covariance_rotates_into_world_axes(self):
        transform = Transform2D("camera", "world", np.pi / 2.0, (0.35, 0.0))
        camera_covariance = ((0.001, 0.0), (0.0, 0.10))
        rotated = transform.rotate_covariance(camera_covariance)
        self.assertTrue(np.allclose(np.diag(rotated), (0.10, 0.001)))

        estimator = CameraProprioEstimator(initial_position_world_m=(0.35, 0.0))
        row = estimator.step(
            CameraPacket(
                10,
                "camera",
                (CameraDetection("anisotropic", (0.0, 0.0), camera_covariance),),
            ),
            ProprioPacket(10, "world", (0.0, 0.0)),
            transform,
            now_ms=10,
        )
        self.assertEqual(row["reason"], "updated")
        self.assertLess(
            estimator.state.covariance_m2[1, 1], estimator.state.covariance_m2[0, 0]
        )

    def test_stale_and_no_match_paths_abstain_and_preserve_identity(self):
        nominal, stale, no_match = estimator_fixture_trace()
        self.assertEqual(stale["reason"], "stale_camera")
        self.assertTrue(stale["abstain"])
        self.assertGreater(
            stale["posteriorCovarianceTraceM2"], stale["priorCovarianceTraceM2"]
        )
        self.assertEqual(no_match["reason"], "no_match")
        self.assertTrue(no_match["abstain"])
        self.assertEqual(nominal["trackId"], stale["trackId"])
        self.assertEqual(stale["trackId"], no_match["trackId"])

    def test_packet_trace_replays_exactly(self):
        self.assertEqual(
            stable_hash(estimator_fixture_trace()), stable_hash(estimator_fixture_trace())
        )

    def test_frame_mismatch_fails_closed(self):
        estimator = CameraProprioEstimator()
        with self.assertRaisesRegex(ValueError, "connect camera packet"):
            estimator.step(
                CameraPacket(
                    10,
                    "camera",
                    (CameraDetection("x", (0.1, 0.0), ((0.01, 0.0), (0.0, 0.01))),),
                ),
                ProprioPacket(10, "world", (0.0, 0.0)),
                Transform2D("other", "world", 0.0, (0.0, 0.0)),
                now_ms=10,
            )

    def test_out_of_order_packets_abstain_without_mutating_track(self):
        estimator = CameraProprioEstimator()
        transform = Transform2D("camera", "world", 0.0, (0.1, 0.0))
        estimator.step(
            CameraPacket(
                10,
                "camera",
                (CameraDetection("near", (0.25, 0.0), ((0.01, 0.0), (0.0, 0.01))),),
            ),
            ProprioPacket(10, "world", (0.0, 0.0)),
            transform,
            now_ms=10,
        )
        before = estimator.snapshot()
        row = estimator.step(
            CameraPacket(
                5,
                "camera",
                (CameraDetection("old", (0.25, 0.0), ((0.01, 0.0), (0.0, 0.01))),),
            ),
            ProprioPacket(5, "world", (0.1, 0.0)),
            transform,
            now_ms=15,
        )
        self.assertEqual(row["reason"], "out_of_order")
        self.assertTrue(row["abstain"])
        after = estimator.snapshot()
        self.assertEqual(before["trackId"], after["trackId"])
        self.assertTrue(np.array_equal(before["positionWorldM"], after["positionWorldM"]))
        self.assertTrue(np.array_equal(before["covarianceM2"], after["covarianceM2"]))
        self.assertEqual(before["timestampMs"], after["timestampMs"])

    def test_future_and_stale_proprioception_reject_without_track_mutation(self):
        transform = Transform2D("camera", "world", 0.0, (0.1, 0.0))
        for proprio_timestamp, now_ms, expected_reason in (
            (30, 15, "future_proprio"),
            (0, 100, "stale_proprio"),
        ):
            with self.subTest(reason=expected_reason):
                estimator = CameraProprioEstimator()
                before = estimator.snapshot()
                row = estimator.step(
                    CameraPacket(
                        now_ms,
                        "camera",
                        (
                            CameraDetection(
                                "near",
                                (0.25, 0.0),
                                ((0.01, 0.0), (0.0, 0.01)),
                            ),
                        ),
                    ),
                    ProprioPacket(proprio_timestamp, "world", (0.1, 0.0)),
                    transform,
                    now_ms=now_ms,
                )
                after = estimator.snapshot()
                self.assertEqual(row["reason"], expected_reason)
                self.assertTrue(row["abstain"])
                self.assertTrue(
                    np.array_equal(before["positionWorldM"], after["positionWorldM"])
                )
                self.assertTrue(
                    np.array_equal(before["covarianceM2"], after["covarianceM2"])
                )
                self.assertEqual(before["timestampMs"], after["timestampMs"])


if __name__ == "__main__":
    unittest.main()
