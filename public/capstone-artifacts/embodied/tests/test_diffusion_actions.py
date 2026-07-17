import math
import unittest

import numpy as np

from embodied_capstone_starter import (
    DIFFUSION_ALPHA_BAR,
    MatrixHead,
    MultimodalSerializer,
    build_diffusion_batch,
    build_vla_action_batch,
    diffuse_actions,
    make_vla_examples,
    sample_diffusion_action,
    train_matrix_head,
)


class DiffusionActionTests(unittest.TestCase):
    def test_forward_corruption_matches_hand_calculation(self):
        clean = np.asarray([[0.10]])
        noise = np.asarray([[0.40]])
        actual = diffuse_actions(clean, noise, timestep=1)
        alpha = DIFFUSION_ALPHA_BAR[1]
        expected = math.sqrt(alpha) * clean + math.sqrt(1.0 - alpha) * noise
        self.assertTrue(np.allclose(actual, expected))

    def test_noise_head_trains_and_sampler_is_deterministic_and_bounded(self):
        serializer = MultimodalSerializer()
        token_sequences, clean_sequences, _, _ = build_vla_action_batch(
            make_vla_examples(), serializer
        )
        conditions = token_sequences.reshape(-1, token_sequences.shape[-1])
        clean = clean_sequences.reshape(-1, 1)
        features, noise_targets = build_diffusion_batch(conditions, clean, seed=41)
        head = MatrixHead.initialize(features.shape[1], 1, seed=43)
        initial, final = train_matrix_head(
            head,
            features,
            noise_targets,
            np.ones_like(noise_targets),
            steps=480,
            learning_rate=0.025,
        )
        self.assertLess(final, initial)
        first, first_trace = sample_diffusion_action(head, conditions[0], seed=47)
        second, second_trace = sample_diffusion_action(head, conditions[0], seed=47)
        self.assertTrue(np.array_equal(first, second))
        self.assertLessEqual(abs(float(first[0])), 0.20)
        self.assertEqual(len(first_trace), 3)
        self.assertEqual(len(second_trace), 3)


if __name__ == "__main__":
    unittest.main()
