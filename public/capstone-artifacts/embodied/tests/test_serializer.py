import unittest

import numpy as np

from embodied_capstone_starter import MultimodalSerializer, VLAExample


class SerializerTests(unittest.TestCase):
    def test_language_vision_state_tokens_have_typed_shapes_and_masks(self):
        serializer = MultimodalSerializer()
        example = VLAExample(
            "move red left object",
            (255, 0, 0),
            0.25,
            0.05,
            10,
            (-0.1, -0.075, -0.05),
            (True, True, True),
        )
        packet = serializer.serialize(example, now_ms=15)
        self.assertEqual(packet["languageTokenIds"].dtype, np.int64)
        self.assertEqual(packet["languageTokenIds"].shape, (4,))
        self.assertEqual(packet["visionToken"].shape, (4,))
        self.assertEqual(packet["stateToken"].shape, (1,))
        self.assertTrue(packet["fresh"])
        self.assertEqual(serializer.condition_vector(packet).shape, (13,))

    def test_unknown_word_and_stale_timestamp_remain_observable(self):
        serializer = MultimodalSerializer()
        example = VLAExample(
            "move chartreuse left object",
            (5, 6, 7),
            0.2,
            0.0,
            0,
            (-0.1,),
            (True,),
        )
        packet = serializer.serialize(example, now_ms=100)
        self.assertIn(serializer.token_to_id["<unk>"], packet["languageTokenIds"])
        self.assertFalse(packet["fresh"])


if __name__ == "__main__":
    unittest.main()
