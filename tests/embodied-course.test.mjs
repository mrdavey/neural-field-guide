import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
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
  const javascript = ts.transpileModule(readFileSync(absolute, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, fileName: absolute }).outputText;
  const localRequire = (specifier) => specifier.startsWith(".") ? loadTypeScriptModule(resolveTypeScriptModule(specifier, absolute)) : require(specifier);
  Function("exports", "require", "module", "__filename", "__dirname", javascript)(moduleRecord.exports, localRequire, moduleRecord, absolute, dirname(absolute));
  return moduleRecord.exports;
}

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const course = loadTypeScriptModule(join(root, "app/embodied/index.ts"));
const external = loadTypeScriptModule(join(root, "app/external-experiments.ts"));
const catalogSource = readFileSync(join(root, "app/course-catalog.ts"), "utf8");

test("Embodied AI ships the reviewed 30-lesson perception-language-action ladder", () => {
  assert.equal(course.embodiedLessons.length, 30);
  assert.deepEqual(course.embodiedLessons.map((lesson) => lesson.number), Array.from({ length: 30 }, (_, index) => index + 1));
  assert.equal(new Set(course.embodiedLessons.map((lesson) => lesson.id)).size, 30);
  assert.deepEqual(course.embodiedTracks.map((track) => track.id), ["emb-foundations", "emb-perception", "emb-data", "emb-policies", "emb-control", "emb-research"]);
  assert.deepEqual(course.embodiedTracks.map((track) => course.embodiedLessons.filter((lesson) => lesson.track === track.id).length), [5, 5, 5, 5, 5, 5]);
  assert.deepEqual(course.embodiedLessons.filter((lesson) => lesson.capstone).map((lesson) => lesson.number), [5, 10, 15, 20, 25, 30]);
  for (const lesson of course.embodiedLessons) for (const prerequisite of lesson.prerequisites ?? []) assert.ok(course.embodiedLessonById[prerequisite].number < lesson.number, `${lesson.id} prerequisite ${prerequisite}`);
  assert.match(catalogSource, /courseIds = \["llm", "worldmodel", "generative", "rl", "embodied"\]/);
  assert.match(catalogSource, /embodied: \{/);
  assert.deepEqual(course.embodiedLessonById["embodied-task-contracts"].programPrerequisites, []);
});

test("every Embodied AI objective has five authored teaching dimensions and a unique committed check", () => {
  assert.equal(Object.keys(course.embodiedLessonGuides).length, 30);
  assert.deepEqual(Object.keys(course.embodiedLessonGuides).sort(), Object.keys(course.embodiedObjectiveCoverage).sort());
  const prompts = [];
  for (const lesson of course.embodiedLessons) {
    const guide = course.embodiedLessonGuides[lesson.id];
    const coverage = course.embodiedObjectiveCoverage[lesson.id];
    assert.equal(coverage.length, 2, lesson.id);
    assert.deepEqual(coverage.map((item) => item.objective), guide.objectives, `${lesson.id} exact objective join`);
    assert.ok(guide.vocabulary.length >= 3, `${lesson.id} vocabulary`);
    for (const item of coverage) {
      for (const field of ["explanation", "mechanism", "workedExample", "boundary"]) assert.ok(item[field].length >= 50, `${lesson.id} ${item.objective} ${field}`);
      assert.ok(item.check.prompt.length >= 40, `${lesson.id} check prompt`);
      assert.ok(item.check.expected.length >= 50, `${lesson.id} check expected`);
      assert.ok(item.check.retry.length >= 40, `${lesson.id} check retry`);
      prompts.push(item.check.prompt);
    }
  }
  assert.equal(prompts.length, 60);
  assert.equal(new Set(prompts).size, 60);
});

test("every Embodied AI lesson exposes Change → Observe → Explain, transfer, motion, and guided code", () => {
  for (const registry of [course.embodiedResearchLabs, course.embodiedTransferChecks, course.embodiedMotionStories, course.embodiedCodeExamples, course.embodiedCodeGuidance]) {
    assert.deepEqual(Object.keys(registry).sort(), course.embodiedLessons.map((lesson) => lesson.id).sort());
  }
  for (const lesson of course.embodiedLessons) {
    const lab = course.embodiedResearchLabs[lesson.id];
    for (const field of ["question", "change", "observe", "explain", "complete", "boundary"]) assert.ok(lab[field].length >= 35, `${lesson.id} lab ${field}`);
    assert.equal(lab.cases.length, 3, `${lesson.id} cases`);
    assert.ok(lab.cases.every((item) => item.detail.length >= 35 && item.meter >= 0 && item.meter <= 100), `${lesson.id} case semantics`);
    const transfer = course.embodiedTransferChecks[lesson.id];
    assert.equal(transfer.options.length, 3, `${lesson.id} transfer options`);
    assert.ok(transfer.options.every((option) => option.feedback.length >= 20), `${lesson.id} transfer feedback`);
    assert.ok(course.embodiedCodeExamples[lesson.id].code.includes("\n"), `${lesson.id} code is substantive`);
  }
});

test("six Embodied AI capstones include complete projects and honest downloadable fixtures", async () => {
  const ids = course.embodiedLessons.filter((lesson) => lesson.capstone).map((lesson) => lesson.id);
  assert.equal(ids.length, 6);
  for (const registry of [course.embodiedCapstoneProjects, course.embodiedCapstoneEvidencePacks, course.embodiedCapstoneArtifactFiles, course.embodiedSynthesisMaps]) assert.deepEqual(Object.keys(registry).sort(), [...ids].sort());
  for (const id of ids) {
    const project = course.embodiedCapstoneProjects[id];
    assert.equal(project.stages.length, 4, id);
    assert.ok(project.deliverables.length >= 3 && project.rubric.length >= 4, id);
    const artifact = JSON.parse(await readFile(join(root, "public/capstone-artifacts/embodied", `${id}.json`), "utf8"));
    assert.equal(artifact.course, "embodied");
    assert.equal(artifact.lessonId, id);
    assert.match(artifact.evidenceKind, /fixture/);
    assert.ok(artifact.failure.length >= 60 && artifact.boundary.length >= 60, id);
    assert.ok(Array.isArray(artifact.rawRows));
    assert.match(artifact.starter.command, new RegExp(id));
    assert.ok(artifact.implementation.requiredComponents.length >= 6, `${id} working-system components`);
    assert.ok(artifact.implementation.buildOrder.length >= 5, `${id} build order`);
    assert.ok(artifact.acceptanceChecks.length >= 3, `${id} acceptance checks`);
    assert.ok(artifact.acceptanceChecks.every((check) => check.action.length >= 45 && check.expected.length >= 45), `${id} observable acceptance`);
    const axes = Object.entries(artifact.manifest.matrixAxes);
    const expectedCells = axes.reduce((cells, [field, values]) => cells.flatMap((cell) => values.map((value) => ({ ...cell, [field]: value }))), [{}]);
    const key = (row) => JSON.stringify(axes.map(([field]) => row[field]));
    assert.deepEqual(new Set(artifact.rawRows.map(key)), new Set(expectedCells.map(key)), `${id} complete declared evidence matrix`);
  }
});

test("the Embodied AI capstone starter executes every project with explicit expected checks", async () => {
  const script = join(root, "public/capstone-artifacts/embodied/embodied_capstone_starter.py");
  const outputDir = await mkdtemp(join(tmpdir(), "embodied-capstones-"));
  try {
    for (const id of course.embodiedLessons.filter((lesson) => lesson.capstone).map((lesson) => lesson.id)) {
      const output = join(outputDir, `${id}.json`);
      execFileSync("python3", [script, "--project", id, "--output", output], { stdio: "pipe" });
      const dossier = JSON.parse(await readFile(output, "utf8"));
      assert.equal(dossier.lessonId, id);
      assert.match(dossier.evidenceKind, /real local execution/);
      assert.ok(Object.keys(dossier.checks).length >= 3, id);
      assert.ok(Object.values(dossier.checks).every(Boolean), id);
      assert.ok(dossier.rawRows.length >= 2, id);
      assert.match(dossier.boundary, /not a learned-policy result/i);
    }
  } finally {
    await rm(outputDir, { recursive: true, force: true });
  }
});

test("audited Embodied AI traces preserve physical and statistical semantics", () => {
  const partial = course.embodiedLessonById["embodied-partial-observation"];
  assert.match(partial.example, /confirmed rigidly grasped/);
  assert.match(partial.example, /different dynamics hypothesis/);
  assert.match(course.embodiedCodeExamples["embodied-partial-observation"].code, /grasp_valid/);

  const transformer = course.embodiedLessonById["transformer-action-policies"];
  assert.match(transformer.example, /hidden state at o1 predicts a1/);
  assert.match(course.embodiedCodeExamples["transformer-action-policies"].code, /predict_rows=\[1,3\]/);
  assert.match(course.embodiedCodeExamples["transformer-action-policies"].code, /replace_future_a1/);

  const evaluation = course.embodiedLessonById["embodied-evaluation-suites"];
  assert.match(evaluation.deep, /Wilson interval/);
  assert.match(evaluation.example, /\[\.60,\.98\]/);
  assert.match(course.embodiedCodeExamples["embodied-evaluation-suites"].code, /def wilson/);

  const latency = course.embodiedLessonById["latency-safety-operations"];
  assert.match(latency.deep, /p99 camera-to-applied-command latency must be at most 50 ms/);
  assert.doesNotMatch(latency.example, /average passes/);
  assert.match(latency.example, /median/);

  const fusion = course.embodiedLessonById["sensor-fusion-tracking"];
  assert.match(fusion.deep, /observation matrix \$H\$ maps/);
  assert.match(course.embodiedObjectiveCoverage["sensor-fusion-tracking"][1].mechanism, /negative log likelihood, \$-\\log p\(z\)\$ \(NLL\)/);
  assert.match(fusion.example, /scalar case \$H=1\$/);

  const chunks = course.embodiedLessonById["action-representations-chunking"];
  assert.match(chunks.misconception, /does not itself create multimodality/);
  assert.match(chunks.misconception, /decoder and training objective/);
});

test("the action-chunk GPU extension is portable, bounded, and promises only invariants", async () => {
  const contract = external.externalExperiments["action-chunk-feedback-ablation"];
  assert.equal(contract.courseId, "embodied");
  assert.equal(contract.lessonId, "reproducible-embodied-gpu");
  assert.equal(contract.expected.reviewedReference, null);
  assert.deepEqual(contract.providers.map((provider) => provider.id), ["colab", "compatible-service", "local"]);
  assert.ok(contract.expected.invariants.length >= 4 && contract.expected.observations.length >= 3);
  assert.match(contract.boundary, /synthetic one-dimensional/);
  const runbook = await readFile(join(root, "external-executions/EMBODIED_POLICY.md"), "utf8");
  const publicRunbook = await readFile(join(root, "public/experiment-runbooks/EMBODIED_POLICY.md"), "utf8");
  assert.equal(publicRunbook, runbook, "downloadable and repository runbooks stay identical");
  assert.match(contract.commands.smoke, /--profile smoke --device auto/);
  assert.match(contract.commands.full, /--profile full --device cuda/);
  assert.equal(contract.runbook.publicUrl, "experiment-runbooks/EMBODIED_POLICY.md");
  for (const heading of ["Record the environment", "Run the bounded smoke profile", "Run the full profile", "Troubleshoot without hiding changes", "Interpret and preserve"]) assert.ok(runbook.includes(heading), heading);
  assert.match(runbook, /no expected numeric performance band/i);
  const runner = await readFile(join(root, "external-executions/embodied_action_chunk_ablation.py"), "utf8");
  assert.match(runner, /def numeric_leaves_are_finite/);
  assert.match(runner, /"all_losses_finite"/);
  assert.match(runner, /pair\["training"\]\["all_losses_finite"\]/);
});
