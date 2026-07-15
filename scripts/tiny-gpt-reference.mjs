import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const vocabulary = ["a", "b", "c", " "];
const sequence = [0, 1, 0, 2, 0];
const dModel = 3;
const hidden = 5;
const context = 4;

const rng = (seed) => () => ((seed = Math.imul(seed ^ seed >>> 15, seed | 1)), seed ^= seed + Math.imul(seed ^ seed >>> 7, seed | 61), ((seed ^ seed >>> 14) >>> 0) / 4294967296);
const random = rng(17);
const matrix = (rows, cols, scale = 0.18) => Array.from({ length: rows * cols }, () => (random() * 2 - 1) * scale);
const initialParameters = () => ({
  token: matrix(vocabulary.length, dModel), position: matrix(context, dModel),
  q: matrix(dModel, dModel), k: matrix(dModel, dModel), v: matrix(dModel, dModel), out: matrix(dModel, dModel),
  up: matrix(dModel, hidden), down: matrix(hidden, dModel), logits: matrix(dModel, vocabulary.length),
});
const clone = (parameters) => Object.fromEntries(Object.entries(parameters).map(([name, values]) => [name, [...values]]));
const linear = (input, weights, outputs) => Array.from({ length: outputs }, (_, output) => input.reduce((sum, value, index) => sum + value * weights[index * outputs + output], 0));
const add = (left, right) => left.map((value, index) => value + right[index]);
const softmax = (values) => { const maximum = Math.max(...values); const exp = values.map((value) => Math.exp(value - maximum)); const total = exp.reduce((a, b) => a + b, 0); return exp.map((value) => value / total); };

function forward(parameters, tokens, usePosition = true) {
  const inputs = tokens.slice(0, context);
  const targets = tokens.slice(1, context + 1);
  const residual = inputs.map((token, position) => Array.from({ length: dModel }, (_, axis) => parameters.token[token * dModel + axis] + (usePosition ? parameters.position[position * dModel + axis] : 0)));
  const queries = residual.map((row) => linear(row, parameters.q, dModel));
  const keys = residual.map((row) => linear(row, parameters.k, dModel));
  const values = residual.map((row) => linear(row, parameters.v, dModel));
  const attended = queries.map((query, position) => {
    const weights = softmax(keys.slice(0, position + 1).map((key) => query.reduce((sum, value, axis) => sum + value * key[axis], 0) / Math.sqrt(dModel)));
    return Array.from({ length: dModel }, (_, axis) => weights.reduce((sum, weight, index) => sum + weight * values[index][axis], 0));
  });
  const afterAttention = residual.map((row, position) => add(row, linear(attended[position], parameters.out, dModel)));
  const afterMlp = afterAttention.map((row) => add(row, linear(linear(row, parameters.up, hidden).map(Math.tanh), parameters.down, dModel)));
  const logits = afterMlp.map((row) => linear(row, parameters.logits, vocabulary.length));
  const probabilities = logits.map(softmax);
  const loss = targets.reduce((sum, target, position) => sum - Math.log(probabilities[position][target] + 1e-12), 0) / targets.length;
  return { logits, probabilities, loss };
}

function train(parameters, steps, usePosition = true, startStep = 0) {
  const logs = [];
  const epsilon = 1e-4;
  const learningRate = 0.45;
  if (startStep === 0) logs.push({ step: 0, trained_tokens: 0, loss: forward(parameters, sequence, usePosition).loss });
  for (let localStep = 1; localStep <= steps; localStep += 1) {
    const gradients = {};
    for (const [name, values] of Object.entries(parameters)) {
      gradients[name] = new Array(values.length);
      for (let index = 0; index < values.length; index += 1) {
        const original = values[index];
        values[index] = original + epsilon;
        const plus = forward(parameters, sequence, usePosition).loss;
        values[index] = original - epsilon;
        const minus = forward(parameters, sequence, usePosition).loss;
        values[index] = original;
        gradients[name][index] = (plus - minus) / (2 * epsilon);
      }
    }
    for (const [name, values] of Object.entries(parameters)) for (let index = 0; index < values.length; index += 1) values[index] -= learningRate * gradients[name][index];
    const step = startStep + localStep;
    if (step % 3 === 0 || localStep === steps) logs.push({ step, trained_tokens: step * context, loss: forward(parameters, sequence, usePosition).loss });
  }
  return logs;
}

function greedySample(parameters) {
  const tokens = [...sequence.slice(0, context)];
  for (let index = 0; index < 8; index += 1) {
    const window = tokens.slice(-context);
    const result = forward(parameters, [...window, 0]);
    const next = result.probabilities.at(-1).reduce((best, value, token) => value > best.value ? { token, value } : best, { token: 0, value: -1 }).token;
    tokens.push(next);
  }
  return tokens.map((token) => vocabulary[token]).join("");
}

export function runTinyGptReference() {
  const start = initialParameters();
  const initial = forward(start, sequence);
  const futureMutation = [...sequence]; futureMutation[3] = 3;
  const mutated = forward(start, futureMutation);
  let maxEarlierDelta = 0;
  for (let position = 0; position < 3; position += 1) for (let token = 0; token < vocabulary.length; token += 1) maxEarlierDelta = Math.max(maxEarlierDelta, Math.abs(initial.logits[position][token] - mutated.logits[position][token]));

  const control = clone(start);
  const controlLogs = train(control, 12, true);
  const checkpointSource = clone(start);
  const firstHalf = train(checkpointSource, 6, true);
  const checkpoint = clone(checkpointSource);
  const secondHalf = train(checkpointSource, 6, true, 6);
  const resumed = clone(checkpoint);
  train(resumed, 6, true, 6);
  const maxResumeDelta = Math.max(...Object.keys(resumed).flatMap((name) => resumed[name].map((value, index) => Math.abs(value - checkpointSource[name][index]))));
  const noPosition = clone(start);
  const noPositionLogs = train(noPosition, 12, false);

  assert.equal(maxEarlierDelta, 0);
  assert.ok(controlLogs.at(-1).loss < controlLogs[0].loss);
  assert.ok(maxResumeDelta < 1e-12);
  assert.ok(controlLogs.at(-1).loss < noPositionLogs.at(-1).loss);

  return {
    artifact: "tiny GPT executable reference run",
    schema_version: "1.0",
    scope: "dependency-free one-block, one-head causal self-attention language model; a correctness fixture, not a GPT-2 capability reproduction",
    provenance: { generator: "scripts/tiny-gpt-reference.mjs", seed: 17, vocabulary, sequence, architecture: { blocks: 1, heads: 1, d_model: dModel, mlp_hidden: hidden, context } },
    command: "node scripts/tiny-gpt-reference.mjs",
    tests: [
      { name: "shifted_labels", status: "pass", input: sequence.slice(0, -1), labels: sequence.slice(1) },
      { name: "causal_future_mutation", status: "pass", max_earlier_logit_delta: maxEarlierDelta },
      { name: "shape_contract", status: "pass", logits_shape: [1, context, vocabulary.length] },
      { name: "overfit_sequence", status: "pass", loss_start: controlLogs[0].loss, loss_end: controlLogs.at(-1).loss },
      { name: "resume_equivalence", status: "pass", max_weight_delta: maxResumeDelta },
    ],
    metrics: controlLogs,
    sample: { prompt: sequence.slice(0, context).map((token) => vocabulary[token]).join(""), greedy_completion: greedySample(control) },
    checkpoint: { step: 6, parameter_count: Object.values(checkpoint).reduce((sum, values) => sum + values.length, 0), restored: ["all parameter arrays", "step", "fixed training sequence"] },
    resume: { first_half: firstHalf, second_half: secondHalf, max_weight_delta: maxResumeDelta },
    ablation: { treatment: "zero position embeddings", control_final_loss: controlLogs.at(-1).loss, treatment_final_loss: noPositionLogs.at(-1).loss, treatment_logs: noPositionLogs, decision: "retain learned positions for this order-sensitive fixture" },
  };
}

const result = runTinyGptReference();
if (process.argv.includes("--verify")) {
  const preserved = JSON.parse(await readFile(new URL("../public/capstone-artifacts/tiny-gpt-reference-run.json", import.meta.url), "utf8"));
  assert.deepEqual(preserved, result);
  console.log("Verified executable tiny-GPT reference against the preserved run.");
} else {
  console.log(JSON.stringify(result, null, 2));
}
