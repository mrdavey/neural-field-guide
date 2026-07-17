import unittest

import numpy as np

from embodied_capstone_starter import (
    LinearPolicy,
    MomentumState,
    evaluate_cloning_rollout,
    fit_feature_scaler,
    make_behavior_cloning_episodes,
    masked_policy_loss,
    pack_behavior_batch,
    split_episodes,
    train_linear_policy,
)


class BehaviorPolicyTests(unittest.TestCase):
    def setUp(self):
        self.splits = split_episodes(make_behavior_cloning_episodes("smoke"))
        self.scaler = fit_feature_scaler(self.splits["train"])
        self.observations, self.targets, self.mask = pack_behavior_batch(
            self.splits["train"], self.scaler
        )
        self.policy = LinearPolicy.initialize(2, 2, seed=31)
        self.optimizer = MomentumState(np.zeros_like(self.policy.weights))

    def test_one_batch_fit_reduces_masked_loss(self):
        initial = masked_policy_loss(
            self.policy, self.observations, self.targets, self.mask
        )
        train_linear_policy(
            self.policy,
            self.optimizer,
            self.observations,
            self.targets,
            self.mask,
            steps=360,
        )
        final = masked_policy_loss(self.policy, self.observations, self.targets, self.mask)
        self.assertLess(final, initial * 0.01)

    def test_changed_start_closed_loop_preserves_first_support_departure(self):
        train_linear_policy(
            self.policy,
            self.optimizer,
            self.observations,
            self.targets,
            self.mask,
            steps=360,
        )
        demonstrated = np.concatenate(
            [episode.observations[:, 0] for episode in self.splits["train"]]
        )
        nominal = evaluate_cloning_rollout(
            self.policy, self.scaler, demonstrated, start_x_m=0.0
        )
        changed = evaluate_cloning_rollout(
            self.policy, self.scaler, demonstrated, start_x_m=-0.45
        )
        self.assertTrue(nominal["success"])
        self.assertTrue(nominal["autonomous"])
        self.assertEqual(changed["supportDeparture"], 0)
        self.assertTrue(changed["intervention"])
        self.assertFalse(changed["success"])
        self.assertEqual(changed["trace"][0]["appliedDxM"], 0.0)


if __name__ == "__main__":
    unittest.main()
