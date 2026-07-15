#!/usr/bin/env python3
"""Measure lookup identity and contextual hidden-state cosines in pinned GPT-2."""

from __future__ import annotations

import argparse
import hashlib
import json
import platform
from importlib.metadata import version
from pathlib import Path

import torch
from huggingface_hub import snapshot_download
from torch.nn.functional import cosine_similarity
from transformers import AutoModelForCausalLM, AutoTokenizer


TEXTS = ["We sat beside the river bank", "She visited the central bank"]
LAYERS = [1, 6, 12]


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def choose_device(requested: str) -> torch.device:
    if requested != "auto":
        return torch.device(requested)
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="openai-community/gpt2")
    parser.add_argument("--revision", default="607a30d")
    parser.add_argument("--device", default="auto", help="auto, cpu, cuda, cuda:0, or mps")
    parser.add_argument("--output", type=Path, default=Path("external-executions/runs/embedding-hidden-state-measured.json"))
    args = parser.parse_args()

    torch.manual_seed(0)
    device = choose_device(args.device)
    snapshot = Path(snapshot_download(
        repo_id=args.model,
        revision=args.revision,
        allow_patterns=["*.safetensors", "config.json", "generation_config.json", "merges.txt", "vocab.json", "tokenizer.json", "tokenizer_config.json", "special_tokens_map.json"],
    ))
    files = sorted(path for path in snapshot.rglob("*") if path.is_file())
    hashes = {str(path.relative_to(snapshot)): file_sha256(path) for path in files}

    tokenizer = AutoTokenizer.from_pretrained(snapshot, local_files_only=True)
    tokenizer.pad_token = tokenizer.eos_token
    model = AutoModelForCausalLM.from_pretrained(snapshot, local_files_only=True, output_hidden_states=True).to(device).eval()
    batch = tokenizer(TEXTS, return_tensors="pt", padding=True)
    batch = {key: value.to(device) for key, value in batch.items()}

    bank_ids = tokenizer.encode(" bank", add_special_tokens=False)
    if len(bank_ids) != 1:
        raise RuntimeError(f"Expected ' bank' to be one token at the pin, observed {bank_ids}")
    bank_id = bank_ids[0]
    positions: list[int] = []
    for row, attention in zip(batch["input_ids"], batch["attention_mask"]):
        matches = ((row == bank_id) & attention.bool()).nonzero(as_tuple=False).flatten()
        if not len(matches):
            raise RuntimeError("Pinned bank token was not found in one of the two sentences")
        positions.append(int(matches[-1].item()))

    with torch.inference_mode():
        output = model(**batch, output_hidden_states=True, return_dict=True)
    if output.hidden_states is None or len(output.hidden_states) != 13:
        raise RuntimeError(f"Expected embedding output plus 12 block outputs, got {0 if output.hidden_states is None else len(output.hidden_states)}")

    lookup = model.get_input_embeddings().weight[bank_id]
    lookup_cosine = float(cosine_similarity(lookup, lookup, dim=0).item())
    contextual = []
    for layer in LAYERS:
        first = output.hidden_states[layer][0, positions[0]]
        second = output.hidden_states[layer][1, positions[1]]
        contextual.append({"hidden_state_index": layer, "cosine": float(cosine_similarity(first, second, dim=0).item())})

    artifact = {
        "schema_version": "1.0",
        "artifact": "embedding-hidden-state-measured",
        "evidence_tier": "executed pinned checkpoint probe",
        "pins": {"model": f"{args.model}@{args.revision}", "architecture": "12 layers, 768 hidden dimensions", "sentences": TEXTS},
        "environment": {
            "python": platform.python_version(),
            "torch": torch.__version__,
            "transformers": version("transformers"),
            "safetensors": version("safetensors"),
            "device": str(device),
        },
        "model_files": {"snapshot_directory": snapshot.name, "sha256": hashes},
        "correctness_repairs": {
            "padding": "Set tok.pad_token = tok.eos_token before padding=True.",
            "masking": "Pass the returned attention_mask to the model.",
            "position_selection": "Locate the final occurrence of the exact token ID returned by encode(' bank', add_special_tokens=False).",
            "precision": "Report full 768-dimensional cosine before any projection.",
        },
        "execution": {
            "command": f"python external-executions/embedding_identity.py --model {args.model} --revision {args.revision} --output {args.output}",
            "required_output": ["python/torch/transformers versions", "model file hashes", "bank token id", "two positions", "lookup cosine", "layer 1/6/12 contextual cosines"],
            "blocking_failure": "Do not claim measured contextual values if any output is missing, non-numeric, or came from an unpinned checkpoint.",
        },
        "measurement": {
            "bank_token_id": bank_id,
            "positions": positions,
            "lookup_cosine": lookup_cosine,
            "contextual_cosines": contextual,
        },
        "invariants": [
            {"name": "same lookup row", "expected": "cosine approximately 1.0", "observed": lookup_cosine, "reason": "both positions index the same embedding-table row"},
            {"name": "contextual values", "expected": "empirical numeric cosines at layers 1, 6, and 12", "observed": contextual, "reason": "attention and MLP computation can separate the contexts; monotonic separation is not guaranteed"},
        ],
        "scope_boundary": "One prompt pair and one checkpoint demonstrate lookup identity versus contextual computation. They do not establish that cosine similarity alone explains model behavior.",
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(artifact, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"lookup cosine: {lookup_cosine:.9f}")
    for row in contextual:
        print(f"hidden state {row['hidden_state_index']}: {row['cosine']:.9f}")
    print(f"Wrote measured probe to {args.output}")


if __name__ == "__main__":
    main()
