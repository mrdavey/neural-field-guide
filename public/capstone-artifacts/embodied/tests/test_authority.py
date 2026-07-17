import unittest

from embodied_capstone_starter import (
    AuthorityArbiter,
    CameraHealthPacket,
    ControlCommand,
    IndependentWatchdog,
    RecoveryController,
)


class AuthorityTests(unittest.TestCase):
    def test_watchdog_stop_cannot_be_overridden_by_human_or_policy(self):
        selected = AuthorityArbiter().select(
            [
                ControlCommand("policy", 0.08, "move"),
                ControlCommand("human", 0.03, "manual move"),
                ControlCommand("watchdog_stop", 0.0, "constraint"),
            ]
        )
        self.assertEqual(selected.owner, "watchdog_stop")
        self.assertEqual(selected.dx_m, 0.0)

    def test_resume_requires_freshness_and_records_human_receipt(self):
        controller = RecoveryController()
        controller.mode = "fallback"
        watchdog = IndependentWatchdog()
        controller.observe_camera_packet(CameraHealthPacket(0, 90, 100), watchdog)
        controller.observe_camera_packet(CameraHealthPacket(1, 100, 110), watchdog)
        with self.assertRaisesRegex(RuntimeError, "three consecutive"):
            controller.authorize_resume("operator", "checked", 100)
        reset, stop = controller.observe_camera_packet(
            CameraHealthPacket(2, 40, 120), watchdog
        )
        self.assertFalse(reset["accepted"])
        self.assertEqual(stop.reason, "stale_camera")
        self.assertEqual(controller.fresh_packet_count, 0)
        for packet in (
            CameraHealthPacket(3, 120, 130),
            CameraHealthPacket(4, 131, 140),
            CameraHealthPacket(5, 142, 150),
        ):
            evidence, stop = controller.observe_camera_packet(packet, watchdog)
            self.assertTrue(evidence["accepted"])
            self.assertIsNone(stop)
        receipt = controller.authorize_resume("operator", "checked", 151)
        self.assertEqual(receipt["operator"], "operator")
        self.assertEqual(receipt["fromMode"], "fallback")
        self.assertEqual(receipt["evidenceReceivedAtMs"], 150)
        self.assertEqual(receipt["evidenceAgeMs"], 1)
        self.assertEqual(controller.mode, "human")

    def test_resume_rejects_predated_and_expired_evidence(self):
        watchdog = IndependentWatchdog()
        for receipt_timestamp, message in (
            (139, "cannot predate"),
            (181, "expired"),
        ):
            with self.subTest(receipt_timestamp=receipt_timestamp):
                controller = RecoveryController(max_resume_age_ms=40)
                controller.mode = "fallback"
                for packet in (
                    CameraHealthPacket(0, 90, 100),
                    CameraHealthPacket(1, 110, 120),
                    CameraHealthPacket(2, 130, 140),
                ):
                    controller.observe_camera_packet(packet, watchdog)
                with self.assertRaisesRegex(RuntimeError, message):
                    controller.authorize_resume(
                        "operator", "invalid receipt time", receipt_timestamp
                    )

    def test_freshness_counter_cannot_be_assigned_directly(self):
        controller = RecoveryController()
        with self.assertRaises(AttributeError):
            controller.fresh_packet_count = 3


if __name__ == "__main__":
    unittest.main()
