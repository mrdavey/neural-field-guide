import unittest

from embodied_capstone_starter import (
    CameraHealthPacket,
    IndependentWatchdog,
    RecoveryController,
    recovery_event_trace,
)


class WatchdogTests(unittest.TestCase):
    def test_nominal_packet_has_no_stop_and_stale_packet_holds(self):
        watchdog = IndependentWatchdog(max_camera_age_ms=40)
        self.assertIsNone(watchdog.evaluate(camera_age_ms=10, proprio_x_m=0.2))
        stop = watchdog.evaluate(camera_age_ms=80, proprio_x_m=0.2)
        self.assertIsNotNone(stop)
        self.assertEqual(stop.owner, "watchdog_stop")
        self.assertEqual(stop.dx_m, 0.0)
        self.assertEqual(stop.reason, "stale_camera")
        future = watchdog.evaluate(camera_age_ms=-1, proprio_x_m=0.2)
        self.assertIsNotNone(future)
        self.assertEqual(future.reason, "camera_timestamp_from_future")

    def test_future_timestamp_and_sequence_gap_reset_consecutive_freshness(self):
        controller = RecoveryController()
        watchdog = IndependentWatchdog()
        controller.observe_camera_packet(CameraHealthPacket(0, 90, 100), watchdog)
        self.assertEqual(controller.fresh_packet_count, 1)
        future, stop = controller.observe_camera_packet(
            CameraHealthPacket(1, 120, 110), watchdog
        )
        self.assertFalse(future["accepted"])
        self.assertEqual(stop.reason, "camera_timestamp_from_future")
        self.assertEqual(controller.fresh_packet_count, 0)
        gap, stop = controller.observe_camera_packet(
            CameraHealthPacket(3, 120, 130), watchdog
        )
        self.assertFalse(gap["accepted"])
        self.assertEqual(stop.reason, "camera_sequence_gap")
        self.assertEqual(controller.fresh_packet_count, 0)

    def test_fault_trace_logs_requested_and_applied_divergence(self):
        events, _ = recovery_event_trace()
        containment = events[0]
        self.assertEqual(containment["phase"], "detect_and_contain")
        self.assertNotEqual(
            containment["requestedActionM"], containment["appliedActionM"]
        )
        self.assertEqual(containment["owner"], "watchdog_stop")

    def test_reverse_time_and_overlong_window_reset_consecutive_freshness(self):
        watchdog = IndependentWatchdog()

        reverse = RecoveryController()
        reverse.mode = "fallback"
        reverse.observe_camera_packet(CameraHealthPacket(0, 90, 100), watchdog)
        evidence, stop = reverse.observe_camera_packet(
            CameraHealthPacket(1, 80, 90), watchdog
        )
        self.assertFalse(evidence["accepted"])
        self.assertEqual(stop.reason, "camera_timestamp_not_monotonic")
        self.assertEqual(reverse.fresh_packet_count, 0)

        window = RecoveryController(max_fresh_window_ms=80)
        window.mode = "fallback"
        window.observe_camera_packet(CameraHealthPacket(0, 90, 100), watchdog)
        window.observe_camera_packet(CameraHealthPacket(1, 130, 140), watchdog)
        evidence, stop = window.observe_camera_packet(
            CameraHealthPacket(2, 171, 181), watchdog
        )
        self.assertFalse(evidence["accepted"])
        self.assertEqual(stop.reason, "camera_freshness_window_exceeded")
        self.assertEqual(window.fresh_packet_count, 0)


if __name__ == "__main__":
    unittest.main()
