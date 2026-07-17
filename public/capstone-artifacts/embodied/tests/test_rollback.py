import unittest

from embodied_capstone_starter import RecoveryController, recovery_event_trace, stable_hash


class RollbackTests(unittest.TestCase):
    def test_snapshot_restores_controller_and_rng_state_exactly(self):
        controller = RecoveryController()
        snapshot = controller.snapshot()
        expected_hash = stable_hash(snapshot)
        controller.x_m = 0.9
        controller.mode = "watchdog_stop"
        _ = controller.rng.normal()
        self.assertNotEqual(stable_hash(controller.snapshot()), expected_hash)
        controller.restore(snapshot)
        self.assertEqual(stable_hash(controller.snapshot()), expected_hash)

    def test_event_trace_contains_rollback_then_explicit_resume(self):
        events, metadata = recovery_event_trace()
        phases = [event["phase"] for event in events]
        self.assertIn("rollback", phases)
        self.assertEqual(events[-1]["phase"], "resume")
        self.assertEqual(events[-1]["owner"], "human")
        self.assertFalse(events[-1]["autonomous"])
        self.assertEqual(metadata["snapshotHash"], metadata["restoredHash"])
        recovery_packets = [
            event for event in events if event["phase"] == "fallback_freshness_gate"
        ]
        self.assertEqual(
            [event["cameraSequence"] for event in recovery_packets], [0, 1, 2]
        )
        self.assertEqual(
            [event["freshPacketCount"] for event in recovery_packets], [1, 2, 3]
        )
        self.assertTrue(all(event["accepted"] for event in recovery_packets))
        self.assertTrue(recovery_packets[-1]["freshnessSatisfied"])
        self.assertFalse(recovery_packets[-1]["resumeAuthorized"])


if __name__ == "__main__":
    unittest.main()
