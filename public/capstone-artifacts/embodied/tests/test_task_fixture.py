import math
import copy
import unittest

from embodied_capstone_starter import (
    ActionPacket,
    TaskContractEnvironment,
    TaskSchema,
    oracle_validate_task_trace,
    run_task_trace,
    stable_hash,
    validate_action_packet,
)


class TaskFixtureTests(unittest.TestCase):
    def test_nominal_trace_clips_action_reaches_predicate_and_replays(self):
        first = run_task_trace([0.07, 0.03], seed=17)
        second = run_task_trace([0.07, 0.03], seed=17)
        self.assertEqual(stable_hash(first), stable_hash(second))
        self.assertEqual(first[0]["requestedDxM"], 0.07)
        self.assertEqual(first[0]["appliedDxM"], 0.03)
        self.assertEqual(first[-1]["event"], "success")
        self.assertTrue(oracle_validate_task_trace(first, TaskSchema()))

    def test_stale_and_wrong_frame_packets_are_contained_before_mutation(self):
        environment = TaskContractEnvironment()
        environment.reset(17)
        environment.step(
            environment.observe(0),
            ActionPacket(environment.schema.schema_version, 0, 0, "world", 0.02),
            now_ms=10,
        )
        before_stale = environment.snapshot()
        stale = environment.step(
            environment.observe(10),
            ActionPacket(environment.schema.schema_version, 1, 100, "world", 0.02),
            now_ms=100,
        )
        self.assertIn("stale_observation", stale["validationErrors"])
        self.assertEqual(stale["postX"], stale["preX"])
        self.assertEqual(stale["appliedDxM"], 0.0)
        self.assertEqual(stale["stateHashBefore"], stale["stateHashAfter"])
        self.assertEqual(environment.snapshot(), before_stale)
        self.assertEqual(environment.step_index, 1)
        self.assertAlmostEqual(environment.velocity_mps, 0.2)

        environment.reset(17)
        wrong_frame = environment.step(
            environment.observe(0),
            ActionPacket(environment.schema.schema_version, 0, 0, "camera", 0.02),
            now_ms=10,
        )
        self.assertIn("action_frame", wrong_frame["validationErrors"])
        self.assertEqual(wrong_frame["appliedDxM"], 0.0)
        self.assertEqual(wrong_frame["stateHashBefore"], wrong_frame["stateHashAfter"])

    def test_future_action_timestamp_is_rejected_before_state_mutation(self):
        environment = TaskContractEnvironment()
        environment.reset(17)
        before = environment.snapshot()
        row = environment.step(
            environment.observe(0),
            ActionPacket(environment.schema.schema_version, 0, 999_999, "world", 0.02),
            now_ms=10,
        )
        self.assertIn("action_from_future", row["validationErrors"])
        self.assertEqual(row["stateHashBefore"], row["stateHashAfter"])
        self.assertEqual(environment.snapshot(), before)

    def test_stale_action_and_future_observation_are_rejected_before_mutation(self):
        schema = TaskSchema()
        for observation_timestamp, action_timestamp, now_ms, error in (
            (100, 0, 100, "stale_action"),
            (100, 10, 10, "observation_from_future"),
        ):
            with self.subTest(error=error):
                environment = TaskContractEnvironment(schema)
                environment.reset(17)
                before = environment.snapshot()
                row = environment.step(
                    environment.observe(observation_timestamp),
                    ActionPacket(
                        schema.schema_version,
                        0,
                        action_timestamp,
                        "world",
                        0.02,
                    ),
                    now_ms=now_ms,
                )
                self.assertIn(error, row["validationErrors"])
                self.assertEqual(row["stateHashBefore"], row["stateHashAfter"])
                self.assertEqual(environment.snapshot(), before)

    def test_oracle_rejects_empty_and_forged_terminal_semantics(self):
        schema = TaskSchema()
        self.assertFalse(oracle_validate_task_trace([], schema))
        forged = copy.deepcopy(run_task_trace([0.07, 0.03], seed=17))
        forged[-1]["event"] = "act"
        forged[-1]["terminal"] = False
        self.assertFalse(oracle_validate_task_trace(forged, schema))

    def test_validator_reports_each_malformed_action_field(self):
        schema = TaskSchema()
        errors = validate_action_packet(
            ActionPacket("wrong", -1, -1, "camera", math.nan), schema
        )
        self.assertEqual(
            set(errors),
            {
                "action_schema_version",
                "action_frame",
                "action_sequence",
                "action_timestamp",
                "action_non_finite",
            },
        )

    def test_constraint_failure_has_terminal_precedence(self):
        schema = TaskSchema(
            target_x_m=0.50,
            workspace_max_m=0.04,
            max_steps=5,
        )
        environment = TaskContractEnvironment(schema)
        environment.reset(9)
        first = environment.step(
            environment.observe(0),
            ActionPacket(schema.schema_version, 0, 0, "world", 0.03),
            now_ms=10,
        )
        self.assertEqual(first["event"], "act")
        second = environment.step(
            environment.observe(10),
            ActionPacket(schema.schema_version, 1, 10, "world", 0.03),
            now_ms=20,
        )
        self.assertEqual(second["event"], "constraint_failure_contained")
        self.assertTrue(second["terminal"])
        self.assertEqual(second["appliedDxM"], 0.0)


if __name__ == "__main__":
    unittest.main()
