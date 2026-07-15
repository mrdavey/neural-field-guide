import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [rootReadme, runbook, tokenizer, embedding, olmoProbe, olmoLoader, fim, tokenizerRequirements] = await Promise.all([
  read("README.md"),
  read("external-executions/README.md"),
  read("external-executions/tokenizer_contract.py"),
  read("external-executions/embedding_identity.py"),
  read("external-executions/olmo_token_accounting.py"),
  read("external-executions/olmo_loader_probe.py"),
  read("external-executions/fim_causal_ablation.py"),
  read("external-executions/requirements-tokenizers.txt"),
]);

test("the repository points learners to one complete external-execution runbook", () => {
  assert.match(rootReadme, /external-executions\/README\.md/);
  for (const heading of [
    "Pinned GPT-2 and Qwen tokenizer contract",
    "Pinned GPT-2 hidden-state identity probe",
    "Token accounting through the pinned OLMo loader",
    "Paired causal/FIM model ablation",
  ]) assert.ok(runbook.includes(heading), heading);
  assert.match(runbook, /optional/i);
  assert.match(runbook, /never silently overwrites/i);
});

test("the tokenizer runner preserves the exact ten-row pinned contract", () => {
  for (const pin of ["607a30d", "1eef1f4", "tokenizers==0.23.1"]) {
    assert.ok(`${tokenizer}\n${tokenizerRequirements}`.includes(pin), pin);
  }
  assert.match(tokenizer, /assert len\(results\) == 10/);
  for (const field of ["token_ids", "decoded_utf8_hex", "offsets", "round_trip"]) assert.ok(tokenizer.includes(field), field);
  assert.match(tokenizer, /Never substitute guessed IDs/);
});

test("the GPT-2 probe records hashes, exact positions, and full-dimensional cosines", () => {
  for (const phrase of ["snapshot_download", "file_sha256", "attention_mask", "bank_ids", "LAYERS = [1, 6, 12]", "cosine_similarity"]) assert.ok(embedding.includes(phrase), phrase);
  assert.match(embedding, /len\(output\.hidden_states\) != 13/);
  assert.match(runbook, /monotonically/);
});

test("the OLMo probe counts the labels that the pinned loader actually trains on", () => {
  assert.match(olmoLoader, /NumpyPaddedFSLDatasetConfig/);
  assert.match(olmoLoader, /NumpyDataLoaderConfig/);
  assert.match(olmoLoader, /get_labels/);
  assert.match(olmoProbe, /labels != label_ignore_index/);
  assert.match(olmoProbe, /dist\.all_reduce/);
  assert.match(olmoProbe, /loss_tokens <= visible <= nominal/);
  assert.match(olmoProbe, /Reduced mismatch/);
  assert.match(runbook, /v2\.4\.0/);
  assert.match(runbook, /1ed8900/);
});

test("the FIM runner enforces paired initialization and equal token budgets", () => {
  for (const phrase of ["733247c", "<fim_prefix>", "<fim_suffix>", "<fim_middle>", "torch.manual_seed(seed)", "trained_tokens != args.loss_token_budget", "paired_bootstrap", "evidence_gate_passed"]) assert.ok(fim.includes(phrase), phrase);
  assert.match(runbook, /three paired seeds/);
  assert.match(runbook, /did not establish the benefit/);
  assert.match(runbook, /does not claim to train or reproduce the released 3B StarCoder2 checkpoint/i);
});

test("all measured outputs stay separate until provenance review", () => {
  for (const script of [tokenizer, embedding, olmoProbe, fim]) assert.match(script, /external-executions\/runs\//);
  assert.match(runbook, /Before placing a measured dossier under `public\/validation-artifacts\/`/);
  assert.match(runbook, /Never paste numbers manually/);
  assert.match(runbook, /run `npm test`/);
});
