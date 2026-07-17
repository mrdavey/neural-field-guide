import tempfile
import unittest
from pathlib import Path

import numpy as np

from embodied_capstone_starter import (
    LinearPolicy,
    MomentumState,
    fit_feature_scaler,
    load_behavior_checkpoint,
    make_behavior_cloning_episodes,
    pack_behavior_batch,
    save_behavior_checkpoint,
    split_episodes,
    train_linear_policy,
)


class ResumeTests(unittest.TestCase):
    def test_checkpoint_resume_matches_uninterrupted_next_updates_exactly(self):
        splits = split_episodes(make_behavior_cloning_episodes("smoke"))
        scaler = fit_feature_scaler(splits["train"])
        observations, targets, mask = pack_behavior_batch(splits["train"], scaler)
        episode_ids = [episode.episode_id for episode in splits["train"]]

        direct = LinearPolicy.initialize(2, 2, seed=31)
        direct_optimizer = MomentumState(np.zeros_like(direct.weights))
        train_linear_policy(
            direct, direct_optimizer, observations, targets, mask, steps=360
        )

        partial = LinearPolicy.initialize(2, 2, seed=31)
        partial_optimizer = MomentumState(np.zeros_like(partial.weights))
        train_linear_policy(
            partial, partial_optimizer, observations, targets, mask, steps=180
        )
        with tempfile.TemporaryDirectory() as directory:
            checkpoint = Path(directory) / "checkpoint.npz"
            save_behavior_checkpoint(
                checkpoint, partial, partial_optimizer, scaler, episode_ids
            )
            resumed, resumed_optimizer, restored_scaler, restored_ids = (
                load_behavior_checkpoint(checkpoint)
            )
            train_linear_policy(
                resumed, resumed_optimizer, observations, targets, mask, steps=180
            )

        self.assertEqual(restored_ids, episode_ids)
        self.assertEqual(resumed_optimizer.step, direct_optimizer.step)
        self.assertTrue(np.array_equal(resumed.weights, direct.weights))
        self.assertTrue(
            np.array_equal(restored_scaler.observation_mean, scaler.observation_mean)
        )
        self.assertTrue(np.array_equal(resumed_optimizer.velocity, direct_optimizer.velocity))


if __name__ == "__main__":
    unittest.main()
