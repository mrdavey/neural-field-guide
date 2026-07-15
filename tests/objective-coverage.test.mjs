import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, extname, join, resolve } from "node:path";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const cache = new Map();

function resolveTypeScriptModule(specifier, parentFile) {
  const candidate = resolve(dirname(parentFile), specifier);
  for (const path of [candidate, `${candidate}.ts`, join(candidate, "index.ts")]) {
    if (existsSync(path) && extname(path) === ".ts") return path;
  }
  throw new Error(`Cannot resolve ${specifier} from ${parentFile}`);
}

function loadTypeScriptModule(file) {
  const absolute = resolve(file);
  if (cache.has(absolute)) return cache.get(absolute).exports;
  const moduleRecord = { exports: {} };
  cache.set(absolute, moduleRecord);
  const javascript = ts.transpileModule(readFileSync(absolute, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: absolute,
  }).outputText;
  const localRequire = (specifier) => specifier.startsWith(".")
    ? loadTypeScriptModule(resolveTypeScriptModule(specifier, absolute))
    : require(specifier);
  Function("exports", "require", "module", "__filename", "__dirname", javascript)(moduleRecord.exports, localRequire, moduleRecord, absolute, dirname(absolute));
  return moduleRecord.exports;
}

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const coverageSource = readFileSync(join(root, "app/lesson-objective-coverage.ts"), "utf8");
const { lessonGuides } = loadTypeScriptModule(join(root, "app/lesson-guides/index.ts"));
const { lessonObjectiveCoverage, objectiveCoverageRemediations } = loadTypeScriptModule(join(root, "app/lesson-objective-coverage.ts"));

const mechanismRemediations = ["probability-softmax#2", "embedding-layer#2", "positional-encoding#1", "positional-encoding#2", "attention#1", "instruction-tuning-rlhf#3", "sft#2", "generation-kv-cache#2", "lora#3"];
const workedExampleRemediations = [
  "introduction#2", "tensors-shapes#3", "gradients-backprop#3", "optimizers#1", "tokenization#2", "embedding-layer#1", "positional-encoding#1", "positional-encoding#2", "positional-encoding#3", "attention#1", "gpt2-from-scratch#1",
  "pretraining-overview#1", "pretraining-overview#2", "infrastructure#1", "posttraining-overview#1", "posttraining-overview#3", "sft#1", "sft#2", "preference-optimization#2", "rl-fundamentals#1", "rlhf#1", "rlhf#2", "tools-safety#1", "tulu3-case-study#1",
  "decoding-sampling#1", "decoding-sampling#3", "generation-kv-cache#1", "generation-kv-cache#2", "quantization-memory#3", "serving-systems#2", "serving-systems#3", "test-time-compute#2", "context-engineering#2", "agent-loops#3", "evaluation-design#1", "distillation#2", "lora#3", "moe#1", "multimodal-models#2", "interpretability-editing#1", "interpretability-editing#3",
];
const checkRemediations = [
  "tensors-shapes#2", "optimizers#1", "tokenization#2", "embedding-layer#1", "embedding-layer#3", "positional-encoding#3", "attention#1", "gpt2-from-scratch#1", "gpt2-from-scratch#2", "gpt2-from-scratch#3",
  "pretraining-overview#2", "objectives-details#3", "infrastructure#1", "pretraining-evaluation#1", "pretraining-evaluation#3", "olmo3-case-study#3", "posttraining-overview#1", "posttraining-overview#2", "instruction-tuning-rlhf#1", "instruction-tuning-rlhf#2", "instruction-tuning-rlhf#3", "sft#1", "sft#2", "sft#3", "preference-optimization#2", "rl-fundamentals#1", "tools-safety#1",
  "decoding-sampling#1", "decoding-sampling#2", "generation-kv-cache#1", "generation-kv-cache#2", "quantization-memory#3", "serving-systems#3", "test-time-compute#2", "context-engineering#2", "context-engineering#3", "agent-loops#1", "agent-loops#3", "evaluation-design#1", "lora#3", "moe#1",
];

test("all 44 lessons explicitly teach all 132 visible outcomes", () => {
  assert.doesNotMatch(coverageSource, /(?<!\\)\\(?!\\)/, "learner-facing math must preserve JavaScript backslashes");
  assert.equal(Object.keys(lessonGuides).length, 44);
  assert.deepEqual(Object.keys(lessonObjectiveCoverage).sort(), Object.keys(lessonGuides).sort());

  let objectiveCount = 0;
  const checkPrompts = [];
  for (const [lessonId, guide] of Object.entries(lessonGuides)) {
    const coverage = lessonObjectiveCoverage[lessonId];
    assert.equal(coverage.length, guide.objectives.length, `${lessonId} coverage count`);
    assert.deepEqual(coverage.map((item) => item.objective), guide.objectives, `${lessonId} exact objective join`);
    objectiveCount += coverage.length;

    for (const [index, item] of coverage.entries()) {
      for (const field of ["explanation", "mechanism", "workedExample", "boundary"]) {
        assert.ok(item[field].trim().length >= 24, `${lessonId} objective ${index + 1} needs substantive ${field}`);
      }
      assert.ok(item.check.prompt.trim().length >= 30, `${lessonId} objective ${index + 1} needs an observable check`);
      assert.ok(item.check.expected.trim().length >= 24, `${lessonId} objective ${index + 1} needs expected reasoning`);
      assert.ok(item.check.retry.trim().length >= 40, `${lessonId} objective ${index + 1} needs a useful retry route`);
      checkPrompts.push(item.check.prompt);
    }
  }

  assert.equal(objectiveCount, 132);
  assert.equal(new Set(checkPrompts).size, 132, "every objective needs an independently authored check");
});

test("all 59 semantic partials receive dimension-specific authored remediation", () => {
  assert.equal(Object.keys(objectiveCoverageRemediations).length, 59);
  for (const key of mechanismRemediations) assert.ok(objectiveCoverageRemediations[key]?.mechanism?.length >= 80, `${key} mechanism remediation`);
  for (const key of workedExampleRemediations) assert.ok(objectiveCoverageRemediations[key]?.workedExample?.length >= 80, `${key} worked-example remediation`);
  for (const key of checkRemediations) {
    assert.ok(objectiveCoverageRemediations[key]?.check?.expected?.length >= 80, `${key} changed-case expected reasoning`);
    assert.ok(objectiveCoverageRemediations[key]?.check?.retry?.length >= 40, `${key} useful retry route`);
  }
  const union = new Set([...mechanismRemediations, ...workedExampleRemediations, ...checkRemediations]);
  assert.deepEqual([...union].sort(), Object.keys(objectiveCoverageRemediations).sort());
});

test("remediation closes missing evidence and prerequisite leaks", () => {
  assert.match(lessonObjectiveCoverage["decoding-sampling"][0].check.prompt, /\[2,1,0,-1\]/);
  assert.match(lessonObjectiveCoverage["decoding-sampling"][0].check.expected, /\[0\.644,0\.237,0\.087,0\.032\][\s\S]*top-k=2[\s\S]*Append red/i);
  assert.match(lessonObjectiveCoverage["quantization-memory"][2].workedExample, /Decision fixture—not a course hardware measurement/);
  assert.match(lessonObjectiveCoverage["quantization-memory"][2].check.expected, /Choose 4-bit[\s\S]*61≤65[\s\S]*6\.5≤8/);
  assert.doesNotMatch(lessonObjectiveCoverage["tensors-shapes"][2].workedExample, /query|key|attention/i);
  assert.doesNotMatch(lessonObjectiveCoverage["probability-softmax"][1].mechanism, /p-y|backprop/i);
  assert.match(lessonObjectiveCoverage["embedding-layer"][1].mechanism, /moves information between positions[\s\S]*transforms the combined features/);
});

test("second-pass remediation defines position mechanisms and parallelism contracts precisely", () => {
  const contentOnlyPosition = lessonObjectiveCoverage["positional-encoding"][0];
  assert.match(contentOnlyPosition.mechanism, /^A query is[\s\S]*a key is[\s\S]*a value is/);
  assert.match(contentOnlyPosition.mechanism, /Reordering the input[\s\S]*rows and columns permuted[\s\S]*outputs are permuted[\s\S]*cannot determine which[\s\S]*came first/);

  const positionDesigns = lessonObjectiveCoverage["positional-encoding"][1];
  assert.match(positionDesigns.mechanism, /^A query is[\s\S]*a key is/);
  assert.match(positionDesigns.mechanism, /Absolute encoding[\s\S]*takes[\s\S]*inserts position[\s\S]*produces a position-marked hidden representation/);
  assert.match(positionDesigns.mechanism, /Relative-bias encoding[\s\S]*takes[\s\S]*inserts[\s\S]*produces a position-aware comparison score/);
  assert.match(positionDesigns.mechanism, /Rotary encoding[\s\S]*takes[\s\S]*inserts position[\s\S]*produces a score/);

  const parallelism = lessonObjectiveCoverage.infrastructure[0];
  assert.doesNotMatch(parallelism.workedExample, /replicates stage-local execution/i);
  assert.match(parallelism.workedExample, /Pipeline parallelism partitions layer weights by depth[\s\S]*each stage retains only its assigned layers[\s\S]*schedule moves microbatches/);
  assert.match(parallelism.workedExample, /Megatron-style sequence parallelism[\s\S]*LayerNorm and dropout activations[\s\S]*parameters remain present[\s\S]*parameter gradients are reduced/);
  assert.match(parallelism.workedExample, /context parallelism[\s\S]*partitions all layer activations along sequence length/);
  for (const method of ["Data", "Tensor", "Pipeline", "Megatron-style sequence"]) {
    assert.match(parallelism.check.expected, new RegExp(`${method} — partitioned:[\\s\\S]*retained/replicated:[\\s\\S]*communication:[\\s\\S]*benefit:`, "i"));
  }
});
