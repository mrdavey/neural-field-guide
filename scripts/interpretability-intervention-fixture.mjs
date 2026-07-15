import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
const interval = (values) => {
  const average = mean(values);
  const variance = values.reduce((sum, value) => sum + (value - average) ** 2, 0) / (values.length - 1);
  const margin = 1.96 * Math.sqrt(variance / values.length);
  return [average - margin, average + margin];
};

export function runInterpretabilityFixture() {
  const promptIds = Array.from({ length: 8 }, (_, index) => `target-${String(index + 1).padStart(2, "0")}`);
  const baselines = [2.01, 2.18, 2.25, 2.09, 2.31, 1.96, 2.16, 2.12];
  const deltas = {
    "target direction -1x": [-1.34, -1.18, -1.29, -1.11, -1.42, -1.07, -1.25, -1.19],
    "same-norm random sham": [-0.12, -0.09, -0.16, -0.11, -0.18, -0.08, -0.13, -0.10],
    "neighboring layer": [-0.31, -0.22, -0.38, -0.29, -0.35, -0.19, -0.33, -0.27],
  };
  const rawOutputs = [];
  for (const [condition, effects] of Object.entries(deltas)) for (let index = 0; index < promptIds.length; index += 1) rawOutputs.push({
    prompt_id: promptIds[index], condition, before_logit_diff: baselines[index], after_logit_diff: baselines[index] + effects[index], paired_effect: effects[index],
    kl: condition === "target direction -1x" ? 0.08 + index * 0.002 : condition === "same-norm random sham" ? 0.025 + index * 0.001 : 0.045 + index * 0.001,
    target_correct_before: true, target_correct_after: condition !== "target direction -1x" || index > 3,
  });
  const summaries = Object.keys(deltas).map((condition) => {
    const rows = rawOutputs.filter((row) => row.condition === condition);
    return { condition, n: rows.length, mean_paired_effect: mean(rows.map((row) => row.paired_effect)), normal_95_ci: interval(rows.map((row) => row.paired_effect)), mean_kl: mean(rows.map((row) => row.kl)), accuracy_after: mean(rows.map((row) => Number(row.target_correct_after))) };
  });
  const target = summaries[0];
  const sham = summaries[1];
  const localityRows = promptIds.map((promptId, index) => ({ prompt_id: promptId, neighbor_effect: -0.08 - index * 0.008, paraphrase_effect: -0.61 - index * 0.03, broad_control_effect: index % 2 ? -0.01 : -0.02 }));
  const persistenceRows = promptIds.map((promptId, index) => ({ prompt_id: promptId, after_32_tokens_effect: -0.13 - index * 0.014, after_reload_effect: 0 }));
  assert.ok(target.normal_95_ci[1] < sham.normal_95_ci[0]);
  assert.equal(rawOutputs.length, 24);
  return {
    artifact: "interpretability intervention executable analysis fixture",
    schema_version: "1.0",
    scope: "filled deterministic course fixture for learning analysis and claim boundaries; raw rows are not represented as measured GPT-2 activations",
    manifest: { generator: "scripts/interpretability-intervention-fixture.mjs", analysis_runtime: "Node.js built-ins; no external statistics library", method_reference: "ROME / causal intervention comparison", model_rerun_target: "openai-community/gpt2@607a30d", site_rerun_target: "residual stream after block 6", seed: 17 },
    command: "node scripts/interpretability-intervention-fixture.mjs --verify",
    bounded_claim: "In this fixture, the named target intervention changes the measured logit difference more than same-norm shams while broad-control effects remain small. A real-model claim requires regenerating every raw row at the pinned checkpoint.",
    prompt_set: promptIds,
    raw_outputs: rawOutputs,
    summaries,
    effect: { paired_target_logit_diff: target.mean_paired_effect, normal_95_ci: target.normal_95_ci, sham_adjusted_effect: target.mean_paired_effect - sham.mean_paired_effect },
    locality_rows: localityRows,
    locality: { mean_neighbor_effect: mean(localityRows.map((row) => row.neighbor_effect)), mean_paraphrase_effect: mean(localityRows.map((row) => row.paraphrase_effect)), mean_broad_control_effect: mean(localityRows.map((row) => row.broad_control_effect)) },
    persistence_rows: persistenceRows,
    persistence: { mean_after_32_tokens_effect: mean(persistenceRows.map((row) => row.after_32_tokens_effect)), mean_after_reload_effect: 0 },
    decision: "The fixture supports only a local causal-effect analysis pattern; it never establishes unique storage, semantic identity, or real GPT-2 behavior.",
    falsifiers: ["target interval overlaps the matched-sham interval", "broad degradation explains the target change", "the real-model effect disappears across paraphrases"],
  };
}

const result = runInterpretabilityFixture();
if (process.argv.includes("--verify")) {
  const preserved = JSON.parse(await readFile(new URL("../public/capstone-artifacts/interpretability-intervention.json", import.meta.url), "utf8"));
  assert.deepEqual(preserved, result);
  console.log("Verified interpretability summaries from every preserved raw fixture row.");
} else console.log(JSON.stringify(result, null, 2));
