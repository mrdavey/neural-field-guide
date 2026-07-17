import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { mkdtemp, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, extname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const cache = new Map();
function resolveTypeScriptModule(specifier, parentFile) { const candidate = resolve(dirname(parentFile), specifier); for (const path of [candidate, `${candidate}.ts`, join(candidate, "index.ts")]) if (existsSync(path) && extname(path) === ".ts") return path; throw new Error(`Cannot resolve ${specifier} from ${parentFile}`); }
function loadTypeScriptModule(file) { const absolute = resolve(file); if (cache.has(absolute)) return cache.get(absolute).exports; const moduleRecord = { exports: {} }; cache.set(absolute, moduleRecord); const javascript = ts.transpileModule(readFileSync(absolute, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, fileName: absolute }).outputText; const localRequire = (specifier) => specifier.startsWith(".") ? loadTypeScriptModule(resolveTypeScriptModule(specifier, absolute)) : require(specifier); Function("exports", "require", "module", "__filename", "__dirname", javascript)(moduleRecord.exports, localRequire, moduleRecord, absolute, dirname(absolute)); return moduleRecord.exports; }

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const course = loadTypeScriptModule(join(root, "app/generative/index.ts"));
const external = loadTypeScriptModule(join(root, "app/external-experiments.ts"));
const catalogSource = readFileSync(join(root, "app/course-catalog.ts"), "utf8");
const courseAppSource = readFileSync(join(root, "app/course-app.tsx"), "utf8");

test("Generative Models ships the reviewed 30-lesson build ladder", () => {
  assert.equal(course.generativeLessons.length, 30);
  assert.deepEqual(course.generativeLessons.map((lesson) => lesson.number), Array.from({ length: 30 }, (_, index) => index + 1));
  assert.equal(new Set(course.generativeLessons.map((lesson) => lesson.id)).size, 30);
  assert.deepEqual(course.generativeTracks.map((track) => track.id), ["gen-foundations", "gen-latents", "gen-energy", "gen-diffusion", "gen-conditional", "gen-research"]);
  assert.deepEqual(course.generativeTracks.map((track) => course.generativeLessons.filter((lesson) => lesson.track === track.id).length), [5, 5, 5, 5, 5, 5]);
  assert.deepEqual(course.generativeLessons.filter((lesson) => lesson.capstone).map((lesson) => lesson.number), [5, 10, 15, 20, 25, 30]);
  for (const lesson of course.generativeLessons) for (const prerequisite of lesson.prerequisites ?? []) assert.ok(course.generativeLessonById[prerequisite].number < lesson.number, `${lesson.id} prerequisite ${prerequisite}`);
  assert.match(catalogSource, /courseIds = \["llm", "worldmodel", "generative", "rl", "embodied"\]/);
  assert.match(catalogSource, /generative: \{/);
  assert.deepEqual(course.generativeLessonById["generation-as-distribution"].programPrerequisites, []);
  assert.match(courseAppSource, /course\.id !== "llm" && guide/);
  assert.match(courseAppSource, /program-prerequisite-list/);
  assert.match(courseAppSource, /showVocabulary=\{course\.id === "llm"\}/);
});

test("every exact objective has five authored teaching dimensions and a committed changed-case test", () => {
  assert.equal(Object.keys(course.generativeLessonGuides).length, 30);
  assert.deepEqual(Object.keys(course.generativeLessonGuides).sort(), Object.keys(course.generativeObjectiveCoverage).sort());
  const prompts = [];
  for (const lesson of course.generativeLessons) {
    const guide = course.generativeLessonGuides[lesson.id];
    const coverage = course.generativeObjectiveCoverage[lesson.id];
    assert.equal(coverage.length, 2, lesson.id);
    assert.deepEqual(coverage.map((item) => item.objective), guide.objectives, `${lesson.id} exact objective join`);
    assert.ok(guide.vocabulary.length >= 3, `${lesson.id} vocabulary`);
    for (const item of coverage) {
      for (const field of ["explanation", "mechanism", "workedExample", "boundary"]) assert.ok(item[field].length >= 50, `${lesson.id} ${item.objective} ${field}`);
      assert.ok(item.check.prompt.length >= 40, `${lesson.id} check prompt ${item.check.prompt.length}`);
      assert.ok(item.check.expected.length >= 50, `${lesson.id} check expected ${item.check.expected.length}`);
      assert.ok(item.check.retry.length >= 40, `${lesson.id} check retry ${item.check.retry.length}`);
      prompts.push(item.check.prompt);
    }
  }
  assert.equal(prompts.length, 60);
  assert.equal(new Set(prompts).size, 60);
});

test("every lesson has a semantic Change → Observe → Explain lab, transfer check, motion story, and guided code notebook", () => {
  for (const registry of [course.generativeResearchLabs, course.generativeTransferChecks, course.generativeMotionStories, course.generativeCodeExamples, course.generativeCodeGuidance]) assert.deepEqual(Object.keys(registry).sort(), course.generativeLessons.map((lesson) => lesson.id).sort());
  for (const lesson of course.generativeLessons) {
    const lab = course.generativeResearchLabs[lesson.id];
    for (const field of ["question", "change", "observe", "explain", "complete", "boundary"]) assert.ok(lab[field].length >= 35, `${lesson.id} lab ${field}`);
    assert.equal(lab.cases.length, 3);
    assert.ok(lab.cases.every((item) => item.detail.length >= 35 && item.meter >= 0 && item.meter <= 100));
    const transfer = course.generativeTransferChecks[lesson.id];
    assert.equal(transfer.options.length, 3);
    assert.ok(transfer.options.every((option) => option.feedback.length >= 20), `${lesson.id} transfer feedback ${transfer.options.map((option) => option.feedback.length).join("/")}`);
    assert.ok(course.generativeCodeExamples[lesson.id].code.includes("\n"), `${lesson.id} code is substantive`);
  }
});

test("six capstones include projects, evidence packs, and honest machine-readable reference artifacts", async () => {
  const ids = course.generativeLessons.filter((lesson) => lesson.capstone).map((lesson) => lesson.id);
  assert.equal(ids.length, 6);
  for (const registry of [course.generativeCapstoneProjects, course.generativeCapstoneEvidencePacks, course.generativeCapstoneArtifactFiles, course.generativeSynthesisMaps]) assert.deepEqual(Object.keys(registry).sort(), [...ids].sort());
  for (const id of ids) {
    const project = course.generativeCapstoneProjects[id];
    assert.equal(project.stages.length, 4);
    assert.ok(project.deliverables.length >= 3 && project.rubric.length >= 4);
    assert.match(project.exemplar.summary, /do not claim that a model was trained/);
    assert.doesNotMatch(project.exemplar.summary, /reproduces|executes/);
    const referenceCopy = course.generativeCapstoneEvidencePacks[id].reference.sections.map((section) => section.content).join(" ");
    assert.match(referenceCopy, /does not claim they ran/);
    assert.match(referenceCopy, /Planned or null cells are instructions, not observations/);
    assert.doesNotMatch(referenceCopy, /gates pass before branching/);
    const artifact = JSON.parse(await readFile(join(root, "public/capstone-artifacts/generative", `${id}.json`), "utf8"));
    assert.equal(artifact.course, "generative");
    assert.equal(artifact.lessonId, id);
    assert.match(artifact.evidenceKind, /fixture/);
    assert.ok(artifact.failure.length >= 60 && artifact.boundary.length >= 60);
    assert.ok(Array.isArray(artifact.rawRows));
  }
});

test("Generative capstone references match the canonical source contract and all starter modes execute", async () => {
  const contracts = JSON.parse(await readFile(join(root, "app/capstone-reference-contracts.json"), "utf8")).generative;
  const work = await mkdtemp(join(tmpdir(), "generative-starters-"));
  try {
    for (const [id, contract] of Object.entries(contracts)) {
      const projectText = JSON.stringify(course.generativeCapstoneProjects[id]);
      const artifact = JSON.parse(await readFile(join(root, "public/capstone-artifacts/generative", `${id}.json`), "utf8"));
      if (contract.matrixAxes) assert.deepEqual(artifact.manifest.matrixAxes, contract.matrixAxes, `${id} source-contract axes`);
      if (contract.requiredCells) {
        assert.deepEqual(artifact.manifest.requiredCells, contract.requiredCells, `${id} source-contract cells`);
        const fields = Object.keys(contract.requiredCells[0]);
        const key = (row) => JSON.stringify(fields.map((field) => row[field]));
        assert.deepEqual(new Set(artifact.rawRows.map(key)), new Set(contract.requiredCells.map(key)), `${id} complete required cells`);
      }
      const output = join(work, `${id}.json`);
      const run = spawnSync("python3", [join(root, "public/capstone-artifacts/generative/generative_capstone_starter.py"), "--project", id, "--output", output], { encoding: "utf8" });
      assert.equal(run.status, 0, `${id} starter: ${run.stderr}`);
      const dossier = JSON.parse(await readFile(output, "utf8"));
      assert.equal(dossier.lessonId, id);
      assert.ok(Object.values(dossier.checks).every(Boolean), `${id} starter checks`);
      assert.match(dossier.boundary, /not a trained-generator result/);
      if (id === "distribution-workbench-capstone") assert.match(projectText, new RegExp(`${contract.matrixAxes.seed.length} canonical seeds`));
      if (id === "diffusion-model-capstone") assert.match(projectText, new RegExp(`${contract.matrixAxes.startSeed.length} canonical fixed start tensors`));
      if (id === "flow-energy-capstone") assert.ok(contract.requiredCells.filter((cell) => cell.family === "energy").every((cell) => projectText.includes(String(cell.budgetAmount))), `${id} promised EBM budgets join canonical cells`);
    }
  } finally {
    await rm(work, { recursive: true, force: true });
  }
});

test("the optional GPU extension is portable, bounded, and does not fabricate expected measurements", async () => {
  const contract = external.externalExperiments["tiny-diffusion-schedule-ablation"];
  assert.equal(contract.courseId, "generative");
  assert.equal(contract.expected.reviewedReference, null);
  assert.deepEqual(contract.providers.map((provider) => provider.id), ["colab", "compatible-service", "local"]);
  assert.ok(contract.expected.invariants.length >= 4 && contract.expected.observations.length >= 3);
  assert.match(contract.boundary, /synthetic two-dimensional/);
  assert.equal(contract.runbook.publicUrl, "experiment-runbooks/GENERATIVE_DIFFUSION.md");
  const runbook = await readFile(join(root, "external-executions/GENERATIVE_DIFFUSION.md"), "utf8");
  for (const heading of ["Record the environment", "Run the bounded smoke profile", "Run the full profile", "Troubleshoot without hiding changes", "Interpret and preserve"]) assert.ok(runbook.includes(heading));
  assert.match(runbook, /there is deliberately no expected numeric quality band/i);
  assert.match(runbook, /2,560 per-example denoiser evaluations per arm/);
  assert.match(runbook, /409,600 per-example denoiser evaluations per arm/);
  assert.match(runbook, /`schema_version`/);
  const lesson = course.generativeLessonById["reproducible-gpu-experiments"];
  assert.match(lesson.example, /does not create a checkpoint/);
});
