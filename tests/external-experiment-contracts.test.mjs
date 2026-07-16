import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const cache = new Map();

function resolveTypeScriptModule(specifier, parentFile) {
  const candidate = resolve(dirname(parentFile), specifier);
  for (const path of [candidate, `${candidate}.ts`, join(candidate, "index.ts")]) if (existsSync(path) && extname(path) === ".ts") return path;
  throw new Error(`Cannot resolve ${specifier} from ${parentFile}`);
}

function loadTypeScriptModule(file) {
  const absolute = resolve(file);
  if (cache.has(absolute)) return cache.get(absolute).exports;
  const moduleRecord = { exports: {} };
  cache.set(absolute, moduleRecord);
  const javascript = ts.transpileModule(readFileSync(absolute, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }, fileName: absolute }).outputText;
  const localRequire = (specifier) => specifier.startsWith(".") ? loadTypeScriptModule(resolveTypeScriptModule(specifier, absolute)) : require(specifier);
  Function("exports", "require", "module", "__filename", "__dirname", javascript)(moduleRecord.exports, localRequire, moduleRecord, absolute, dirname(absolute));
  return moduleRecord.exports;
}

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const source = readFileSync(join(root, "app/external-experiments.ts"), "utf8");
const { externalExperiments } = loadTypeScriptModule(join(root, "app/external-experiments.ts"));
const schema = JSON.parse(readFileSync(join(root, "external-executions/experiment-contract.schema.json"), "utf8"));
const template = readFileSync(join(root, "external-executions/EXPERIMENT_TEMPLATE.md"), "utf8");
const courseApp = readFileSync(join(root, "app/course-app.tsx"), "utf8");
const experimentView = readFileSync(join(root, "app/external-experiment-view.tsx"), "utf8");
const courseCatalog = readFileSync(join(root, "app/course-catalog.ts"), "utf8");
const redirects = readFileSync(join(root, "app/route-redirects.tsx"), "utf8");

test("course navigation and typing are ready for course-local manifests", () => {
  assert.match(courseApp, /Object\.values\(courses\)\.map/);
  assert.doesNotMatch(courseApp, /<option value="llm">LLMs<\/option>/);
  assert.match(courseCatalog, /export type CourseTrack = \{ id: string/);
  assert.match(courseCatalog, /recommendedAfter: CourseId\[\]/);
  assert.match(redirects, /saved && isCourseId\(saved\)/);
});

test("external experiments separate invariants, reviewed measurements, and fixtures", () => {
  assert.ok(Object.keys(externalExperiments).length >= 1);
  for (const contract of Object.values(externalExperiments)) {
    assert.equal(contract.executionLabel, "external");
    assert.ok(contract.providers.some((provider) => provider.id === "colab"));
    assert.ok(contract.providers.some((provider) => provider.id !== "colab"));
    assert.match(contract.commands.install, /requirements-/);
    assert.match(contract.commands.smoke, /smoke/);
    assert.match(contract.commands.full, /--device cuda/);
    assert.ok(contract.expected.invariants.length >= 3);
    assert.ok(contract.expected.observations.length >= 2);
    assert.ok(contract.diagnostics.every((diagnostic) => diagnostic.retry.length >= 20));
    if (contract.expected.reviewedReference === null) assert.ok(contract.expected.observations.some((observation) => /no direction|no .*numeric|not .*promis/i.test(observation)), `${contract.id} must not invent expected measurements`);
    if (contract.expected.teachingFixture) assert.match(contract.expected.teachingFixture.boundary, /simulat|fixture|not .*measur/i);
    if (contract.runbook) {
      assert.ok(existsSync(join(root, contract.runbook.repositoryPath)), `${contract.id} repository runbook`);
      assert.ok(existsSync(join(root, "public", contract.runbook.publicUrl)), `${contract.id} public runbook`);
      const publicRunbook = readFileSync(join(root, "public", contract.runbook.publicUrl), "utf8");
      assert.match(publicRunbook, /schema_version/, `${contract.id} runbook output schema`);
      assert.match(publicRunbook, /Smoke|smoke/, `${contract.id} runbook smoke guidance`);
      assert.match(publicRunbook, /Stop|stop/, `${contract.id} runbook stop rule`);
    }
  }
  assert.match(source, /evidenceTier: "measured-external-run"/);
});

test("Generative and RL external contracts expose public runbooks and exact primitive budgets", () => {
  const generative = externalExperiments["tiny-diffusion-schedule-ablation"];
  assert.equal(generative.runbook.publicUrl, "experiment-runbooks/GENERATIVE_DIFFUSION.md");
  assert.match(generative.budgets.smoke, /20 batched denoiser invocations over 128 samples = 2,560 per-example denoiser evaluations/);
  assert.match(generative.budgets.full, /100 batched denoiser invocations over 4,096 samples = 409,600 per-example denoiser evaluations/);
  const runner = readFileSync(join(root, "external-executions/generative_diffusion_ablation.py"), "utf8");
  assert.match(runner, /"sampling_batched_forward_calls": profile\.timesteps/);
  assert.match(runner, /"sampling_denoiser_example_evaluations": profile\.timesteps \* profile\.samples/);
  for (const field of ["provenance", "repository_revision", "runner_sha256", "hardware", "checkpoint_resume"]) assert.ok(runner.includes(`\"${field}\"`), field);

  const rl = externalExperiments["dqn-target-copy-ablation"];
  assert.equal(rl.runbook.publicUrl, "experiment-runbooks/RL_DQN.md");
  assert.match(experimentView, /contract\.runbook\.publicUrl/);
});

test("the portable schema and authoring template require complete execution guidance", () => {
  for (const key of ["revisions", "hardware", "budgets", "commands", "providers", "expected", "diagnostics", "output", "boundary"]) assert.ok(schema.required.includes(key), key);
  assert.deepEqual(schema.properties.expected.required, ["invariants", "observations", "reviewedReference"]);
  for (const phrase of ["Google Colab", "service-neutral hosted GPU shell", "Predict before running", "Reviewed observations", "Teaching fixture", "never silently overwrites"]) assert.ok(template.includes(phrase), phrase);
});
