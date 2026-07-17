import unittest

import numpy as np

from embodied_capstone_starter import (
    fit_feature_scaler,
    make_behavior_cloning_episodes,
    pack_behavior_batch,
    split_episodes,
)


class DatasetTests(unittest.TestCase):
    def test_split_uses_disjoint_whole_episode_ids(self):
        splits = split_episodes(make_behavior_cloning_episodes("smoke"))
        ids = {
            name: {episode.episode_id for episode in episodes}
            for name, episodes in splits.items()
        }
        self.assertTrue(ids["train"].isdisjoint(ids["validation"]))
        self.assertTrue(ids["train"].isdisjoint(ids["test"]))
        self.assertTrue(ids["validation"].isdisjoint(ids["test"]))
        self.assertEqual(sum(map(len, splits.values())), 6)

    def test_masks_scaling_and_shapes_are_explicit(self):
        splits = split_episodes(make_behavior_cloning_episodes("smoke"))
        scaler = fit_feature_scaler(splits["train"])
        observations, actions, masks = pack_behavior_batch(splits["train"], scaler)
        self.assertEqual(observations.shape[1], 2)
        self.assertEqual(actions.shape, masks.shape)
        self.assertTrue(np.any(masks[:, 1] == 0.0))
        self.assertTrue(np.any(masks[:, 1] == 1.0))
        original = splits["train"][0].actions
        self.assertTrue(
            np.allclose(
                scaler.actions_from_model(scaler.actions_to_model(original)), original
            )
        )
        self.assertTrue(np.all(scaler.observation_std > 0.0))
        self.assertTrue(np.all(scaler.action_std > 0.0))


if __name__ == "__main__":
    unittest.main()
