import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const readJson = async (relativePath) => {
  const bytes = await readFile(new URL(`../${relativePath}`, import.meta.url));
  return { bytes, data: JSON.parse(bytes.toString("utf8")), sha256: createHash("sha256").update(bytes).digest("hex") };
};

const validationPaths = [
  "public/validation-artifacts/tokenizer-contract-result.json",
  "public/validation-artifacts/embedding-hidden-state-result.json",
  "public/validation-artifacts/pretraining-token-accounting-result.json",
  "public/validation-artifacts/fim-causal-ablation-result.json",
  "public/validation-artifacts/tulu-stage-runtime-ledger.json",
  "public/validation-artifacts/tulu-posttraining-result-ledger.json",
];

const capstonePaths = [
  "public/capstone-artifacts/optimizer-learning-step.json",
  "public/capstone-artifacts/tiny-gpt-reference-run.json",
  "public/capstone-artifacts/olmo3-flow-audit.json",
  "public/capstone-artifacts/tulu-dual-purpose-design.json",
  "public/capstone-artifacts/inference-service-benchmark.json",
  "public/capstone-artifacts/safe-agent-operations.json",
  "public/capstone-artifacts/interpretability-intervention.json",
];

const worldModelCapstonePaths = [
  "public/capstone-artifacts/worldmodel/belief-states-filtering.json",
  "public/capstone-artifacts/worldmodel/rssm-planet-case-study.json",
  "public/capstone-artifacts/worldmodel/uncertainty-ensembles.json",
  "public/capstone-artifacts/worldmodel/dyna-tdmpc-case-study.json",
  "public/capstone-artifacts/worldmodel/foundation-world-models-case-study.json",
  "public/capstone-artifacts/worldmodel/world-model-operations-case-study.json",
  "public/capstone-artifacts/worldmodel/world-model-research-capstone.json",
];

const records = await Promise.all([...validationPaths, ...capstonePaths].map(readJson));
for (const [index, record] of records.entries()) {
  assert.equal(record.data.schema_version, "1.0", `${[...validationPaths, ...capstonePaths][index]} schema`);
  assert.equal(typeof record.data.artifact, "string");
  assert.ok(record.bytes.length > 300, "artifact must contain inspectable evidence");
}

const tokenizer = records[0].data;
assert.equal(tokenizer.cases.length, 5);
assert.equal(tokenizer.execution.rows_expected, 10);
assert.match(tokenizer.execution.integrity_rule, /Never substitute guessed IDs/);

const embedding = records[1].data;
assert.match(embedding.correctness_repairs.padding, /pad_token = tok\.eos_token/);
assert.deepEqual(embedding.execution.required_output.slice(-3), ["two positions", "lookup cosine", "layer 1/6/12 contextual cosines"]);

const accounting = records[2].data;
for (const row of accounting.raw_rank_rows) assert.ok(row.loss_tokens <= row.visible && row.visible <= row.nominal);
const sums = accounting.raw_rank_rows.reduce((total, row) => ({
  nominal: total.nominal + row.nominal,
  visible: total.visible + row.visible,
  loss: total.loss + row.loss_tokens,
}), { nominal: 0, visible: 0, loss: 0 });
assert.deepEqual(sums, { nominal: 64, visible: 50, loss: 48 });
assert.equal(accounting.run_total.sum_loss_tokens, sums.loss);

const fim = records[3].data;
assert.equal(fim.manifest.fim_records / fim.manifest.records, fim.pins.declared_fim_fraction);
assert.equal(fim.manifest.control_loss_tokens, fim.manifest.treatment_loss_tokens);
assert.ok(fim.uncertainty.bootstrap_95_ci[0] > 0);
assert.ok(fim.uncertainty.completion_delta >= fim.uncertainty.completion_regression_gate);
assert.match(fim.scope_boundary, /explicitly simulated/);

const stages = records[4].data;
assert.deepEqual(stages.stages.map((row) => row.stage), ["base", "sft", "dpo", "online_rlvr", "runtime_control"]);
assert.equal(stages.stages[3].outgoing, "allenai/Llama-3.1-Tulu-3.1-8B");
assert.equal(stages.release_evidence.safety.at(-1), 81.2);

const posttraining = records[5].data;
assert.equal(posttraining.matched_metrics.length, 5);
assert.deepEqual(posttraining.stage_decisions.map((row) => row.stage), ["SFT", "DPO", "GRPO RLVR"]);
assert.match(posttraining.runtime_boundary, /authorization/);

const tinyGpt = records[7].data;
assert.equal(tinyGpt.provenance.generator, "scripts/tiny-gpt-reference.mjs");
assert.equal(tinyGpt.tests.find((row) => row.name === "causal_future_mutation").max_earlier_logit_delta, 0);
assert.ok(tinyGpt.tests.find((row) => row.name === "overfit_sequence").loss_end < tinyGpt.tests.find((row) => row.name === "overfit_sequence").loss_start);
assert.equal(tinyGpt.resume.max_weight_delta, 0);

const inference = records[10].data;
assert.equal(inference.raw_requests.length, 20);
for (const aggregate of inference.aggregates) assert.equal(aggregate.requests, inference.raw_requests.filter((row) => row.arm === aggregate.arm).length);
assert.match(inference.scope, /not hardware\/vLLM performance claims/);

const intervention = records[12].data;
assert.equal(intervention.raw_outputs.length, 24);
assert.equal(intervention.summaries.reduce((sum, row) => sum + row.n, 0), intervention.raw_outputs.length);
assert.match(intervention.scope, /not represented as measured GPT-2 activations/);

const worldModelRecords = await Promise.all(worldModelCapstonePaths.map(readJson));
for (const [index, record] of worldModelRecords.entries()) {
  assert.equal(record.data.schemaVersion, 1, `${worldModelCapstonePaths[index]} schema`);
  assert.equal(record.data.course, "worldmodel");
  assert.ok(record.data.lessonId);
  assert.ok(record.data.failure.length >= 40);
  assert.ok(record.data.boundary.length >= 40);
  assert.ok(record.bytes.length > 500, "world-model artifact must contain inspectable evidence");
}

console.log(`Verified ${records.length} learning artifacts under ${root}`);
for (const [index, record] of records.entries()) console.log(`${[...validationPaths, ...capstonePaths][index]}  sha256:${record.sha256}`);
for (const [index, record] of worldModelRecords.entries()) console.log(`${worldModelCapstonePaths[index]}  sha256:${record.sha256}`);
