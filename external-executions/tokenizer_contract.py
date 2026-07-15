#!/usr/bin/env python3
"""Run the pinned GPT-2/Qwen tokenizer contract and preserve all ten rows."""

from __future__ import annotations

import argparse
import json
import platform
from importlib.metadata import version
from pathlib import Path
from typing import Any

from tokenizers import Tokenizer


PINS = {
    "gpt2": ("openai-community/gpt2", "607a30d"),
    "qwen": ("Qwen/Qwen3.5-4B", "1eef1f4"),
}

CASES = [
    {"id": "english", "text": "A short English sentence.", "risk": "ordinary word and punctuation boundaries"},
    {"id": "japanese", "text": "東京で模型を試す", "risk": "multilingual fertility"},
    {"id": "code", "text": "def f(x):\n    return x + 1", "risk": "newline and indentation"},
    {"id": "emoji", "text": "🧪 café", "risk": "multi-byte emoji and accented text"},
    {
        "id": "replacement",
        "text": b"bad:\xff".decode("utf-8", "replace"),
        "input_bytes_before_utf8_replacement": "6261643aff",
        "risk": "invalid byte is replaced before tokenization",
    },
]


def normalized_text(tokenizer: Tokenizer, text: str) -> str:
    return tokenizer.normalizer.normalize_str(text) if tokenizer.normalizer is not None else text


def run_case(model: str, tokenizer: Tokenizer, case: dict[str, Any]) -> dict[str, Any]:
    original = case["text"]
    normalized = normalized_text(tokenizer, original)
    encoding = tokenizer.encode(original, add_special_tokens=False)
    decoded = tokenizer.decode(encoding.ids, skip_special_tokens=False)
    return {
        "model": model,
        "case_id": case["id"],
        "input_utf8_hex": original.encode("utf-8").hex(),
        "input_bytes_before_utf8_replacement": case.get("input_bytes_before_utf8_replacement"),
        "normalized_text": normalized,
        "token_ids": encoding.ids,
        "tokens": encoding.tokens,
        "decoded_utf8_hex": decoded.encode("utf-8").hex(),
        "decoded_text": decoded,
        "offsets": [list(pair) for pair in encoding.offsets],
        "token_count": len(encoding.ids),
        "round_trip": decoded == original,
        "normalized_round_trip": decoded == normalized,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path("external-executions/runs/tokenizer-contract-measured.json"))
    parser.add_argument("--token", default=None, help="Optional Hugging Face token for gated/private mirrors.")
    args = parser.parse_args()

    results: list[dict[str, Any]] = []
    resolved: dict[str, dict[str, str]] = {}
    for name, (model_id, revision) in PINS.items():
        tokenizer = Tokenizer.from_pretrained(model_id, revision=revision, token=args.token)
        resolved[name] = {"model_id": model_id, "requested_revision": revision}
        results.extend(run_case(name, tokenizer, case) for case in CASES)

    assert len(results) == 10
    assert all(isinstance(token_id, int) for row in results for token_id in row["token_ids"])
    assert all(len(pair) == 2 for row in results for pair in row["offsets"])
    assert all(
        len(row["token_ids"]) == len(row["offsets"]) == len(row["tokens"])
        for row in results
    )

    artifact = {
        "schema_version": "1.0",
        "artifact": "tokenizer-contract-measured",
        "evidence_tier": "executed pinned reproduction",
        "environment": {
            "python": platform.python_version(),
            "tokenizers": version("tokenizers"),
            "huggingface_hub": version("huggingface-hub"),
        },
        "pins": resolved,
        "execution": {
            "command": "python external-executions/tokenizer_contract.py --output external-executions/runs/tokenizer-contract-measured.json",
            "required_columns": ["model", "input_utf8_hex", "normalized_text", "token_ids", "decoded_utf8_hex", "offsets", "token_count", "round_trip"],
            "rows_expected": 10,
            "rows_observed": len(results),
            "integrity_rule": "A result is valid only when all ten rows contain integer token_ids and measured offsets. Never substitute guessed IDs.",
        },
        "cases": CASES,
        "results": results,
        "decision_contract": {
            "must_compare": ["task quality", "context occupancy", "encode/decode behavior", "deployment cost"],
            "invalid_inference": "Fewer tokens alone proves the paired model is better.",
            "blocking_failure": "Any missing row, unpinned payload, guessed ID, or unexplained normalization change.",
        },
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(artifact, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(results)} measured rows to {args.output}")


if __name__ == "__main__":
    main()
