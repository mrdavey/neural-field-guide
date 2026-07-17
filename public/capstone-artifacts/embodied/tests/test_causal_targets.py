import unittest

import numpy as np

from embodied_capstone_starter import (
    CausalTransformerDecoder,
    MultimodalSerializer,
    build_vla_action_batch,
    causal_action_targets,
    make_vla_examples,
    train_causal_transformer,
)


class CausalTargetTests(unittest.TestCase):
    def test_targets_are_shifted_and_attention_is_strictly_causal_for_inputs(self):
        actions = np.asarray([[0.1, 0.2, 0.3]], dtype=np.float64)
        valid = np.asarray([[True, True, False]])
        decoder_inputs, targets, target_mask, attention = causal_action_targets(
            actions, valid
        )
        self.assertTrue(np.array_equal(decoder_inputs, [[0.0, 0.1, 0.2]]))
        self.assertTrue(np.array_equal(targets, actions))
        self.assertTrue(np.array_equal(target_mask, [[1.0, 1.0, 0.0]]))
        self.assertTrue(np.array_equal(attention, np.tril(np.ones((3, 3), dtype=bool))))

    def test_masked_self_attention_blocks_future_edit_from_earlier_outputs(self):
        serializer = MultimodalSerializer()
        tokens, _, _, _ = build_vla_action_batch(make_vla_examples(), serializer)
        decoder = CausalTransformerDecoder.initialize(tokens.shape[2], seed=41)
        original = tokens[:1].copy()
        edited = original.copy()
        edited[0, 2, -3] = -0.15
        original_predictions, original_attention = decoder.predict(original)
        edited_predictions, edited_attention = decoder.predict(edited)
        self.assertTrue(
            np.array_equal(original_predictions[:, :2], edited_predictions[:, :2])
        )
        self.assertTrue(
            np.array_equal(original_attention[:, :2], edited_attention[:, :2])
        )
        self.assertFalse(
            np.allclose(original_predictions[:, 2:], edited_predictions[:, 2:])
        )
        upper_rows, upper_columns = np.triu_indices(3, 1)
        self.assertTrue(
            np.all(original_attention[:, upper_rows, upper_columns] == 0.0)
        )
        self.assertTrue(np.allclose(original_attention.sum(axis=-1), 1.0))

    def test_smoke_and_full_transformer_training_are_deterministic(self):
        serializer = MultimodalSerializer()
        tokens, targets, mask, _ = build_vla_action_batch(
            make_vla_examples(), serializer
        )
        for steps in (480, 900):
            first = CausalTransformerDecoder.initialize(tokens.shape[2], seed=41)
            second = CausalTransformerDecoder.initialize(tokens.shape[2], seed=41)
            first_losses = train_causal_transformer(
                first, tokens, targets, mask, steps=steps
            )
            second_losses = train_causal_transformer(
                second, tokens, targets, mask, steps=steps
            )
            self.assertEqual(first_losses, second_losses)
            self.assertEqual(first.parameter_hash(), second.parameter_hash())
            self.assertLess(first_losses[1], first_losses[0] * 0.02)


if __name__ == "__main__":
    unittest.main()
