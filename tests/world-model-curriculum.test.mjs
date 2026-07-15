import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
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
const world = loadTypeScriptModule(join(root, "app/world-models/index.ts"));
const code = loadTypeScriptModule(join(root, "app/world-models/code-examples.ts"));
const capstones = loadTypeScriptModule(join(root, "app/world-models/capstones.ts"));
const lessonLabs = loadTypeScriptModule(join(root, "app/world-models/lesson-lab-specs.ts"));

test("World Models has 46 stable, prerequisite-respecting lessons across seven territories", () => {
  assert.equal(world.worldModelLessons.length, 46);
  assert.deepEqual(world.worldModelLessons.map((lesson) => lesson.number), Array.from({ length: 46 }, (_, index) => index + 1));
  assert.equal(new Set(world.worldModelLessons.map((lesson) => lesson.id)).size, 46);
  assert.deepEqual(world.worldModelTracks.map((track) => track.id), ["wm-foundations", "wm-representations", "wm-training", "wm-planning", "wm-foundation-models", "wm-deployment", "wm-advanced"]);
  assert.deepEqual(world.worldModelTracks.map((track) => world.worldModelLessons.filter((lesson) => lesson.track === track.id).length), [8, 6, 6, 8, 6, 6, 6]);

  for (const lesson of world.worldModelLessons) {
    for (const prerequisiteId of lesson.prerequisites ?? []) {
      const prerequisite = world.worldModelLessonById[prerequisiteId];
      assert.ok(prerequisite, `${lesson.id} references missing ${prerequisiteId}`);
      assert.ok(prerequisite.number < lesson.number, `${lesson.id} moves ahead of ${prerequisiteId}`);
    }
  }

  for (const branch of world.worldModelLessons.filter((lesson) => lesson.number >= 41)) assert.deepEqual(branch.prerequisites, ["world-model-operations-case-study"], `${branch.id} should branch from shared core`);
});

test("every World Models objective has explicit five-dimensional teaching coverage", async () => {
  assert.deepEqual(Object.keys(world.worldModelLessonGuides).sort(), Object.keys(world.worldModelObjectiveCoverage).sort());
  assert.equal(Object.keys(world.worldModelLessonGuides).length, 46);
  let count = 0;
  const prompts = [];
  for (const lesson of world.worldModelLessons) {
    const guide = world.worldModelLessonGuides[lesson.id];
    const coverage = world.worldModelObjectiveCoverage[lesson.id];
    assert.deepEqual(coverage.map((item) => item.objective), guide.objectives, `${lesson.id} exact objective join`);
    assert.equal(coverage.length, 2, `${lesson.id} should make two visible promises`);
    for (const [index, item] of coverage.entries()) {
      for (const field of ["explanation", "mechanism", "workedExample", "boundary"]) assert.ok(item[field].trim().length >= 50, `${lesson.id} objective ${index + 1} ${field}`);
      assert.ok(item.check.prompt.trim().length >= 40, `${lesson.id} objective ${index + 1} check prompt`);
      assert.ok(item.check.expected.trim().length >= 50, `${lesson.id} objective ${index + 1} expected reasoning`);
      assert.ok(item.check.retry.trim().length >= 40, `${lesson.id} objective ${index + 1} retry`);
      prompts.push(item.check.prompt);
      count += 1;
    }
  }
  assert.equal(count, 92);
  assert.equal(new Set(prompts).size, 92);
  const files = await readdir(join(root, "app/world-models/sections"));
  const source = (await Promise.all(files.map((file) => readFile(join(root, "app/world-models/sections", file), "utf8")))).join("\n");
  assert.doesNotMatch(source, /(?<!\\)\\(?!\\)/, "learner-facing math must preserve JavaScript backslashes");
});

test("World Models supplies deterministic transfer checks, semantic motion, labs, and code guidance", async () => {
  assert.deepEqual(Object.keys(world.worldModelTransferChecks).sort(), world.worldModelLessons.map((lesson) => lesson.id).sort());
  assert.deepEqual(Object.keys(world.worldModelMotionStories).sort(), world.worldModelLessons.map((lesson) => lesson.id).sort());
  for (const transfer of Object.values(world.worldModelTransferChecks)) {
    assert.equal(transfer.options.length, 3);
    assert.ok(transfer.answer >= 0 && transfer.answer < 3);
    assert.equal(transfer.options.filter((option) => option.feedback.trim().length >= 20).length, 3);
  }

  const labSource = await readFile(join(root, "app/world-models/labs.tsx"), "utf8");
  const labSpecSource = await readFile(join(root, "app/world-models/lesson-lab-specs.ts"), "utf8");
  const styles = await readFile(join(root, "app/globals.css"), "utf8");
  for (const lab of ["wm-state", "wm-belief", "wm-latent", "wm-rollout", "wm-planner", "wm-video", "wm-uncertainty", "wm-safety", "wm-evaluation"]) {
    assert.match(labSource, new RegExp(`"${lab}": \\{ title:`));
    assert.ok(world.worldModelLessons.some((lesson) => lesson.lab === lab), `${lab} must be used`);
  }
  for (const phrase of ["Learning question:", "EXPLAIN", "COMPLETE WHEN", "Evidence boundary:"]) assert.ok(labSource.includes(phrase));
  assert.match(labSource, /<LearningActivityContract[\s\S]*question=[\s\S]*action=[\s\S]*observe=[\s\S]*explain=[\s\S]*complete=[\s\S]*boundary=/, "World Model labs need a visible learning question, action, observation, explanation, completion, and evidence boundary");
  assert.match(labSource, /<PredictionGate[\s\S]*Before the readout appears/, "World Model readouts must remain hidden until a learner prediction is committed");
  assert.match(labSource, /type="range"[^>]*onInput=/, "range labs should update continuously for pointer, touch, and keyboard input");
  assert.match(styles, /\.lesson-breadcrumb button\{[^}]*min-height:44px/);
  assert.match(styles, /\.course-selector select\{[^}]*min-height:44px/);
  assert.match(styles, /\.learning-objectives,\.objective-map,[^}]*\{max-width:100%;min-width:0\}/, "narrow objective cards should be allowed to shrink inside the viewport");

  assert.deepEqual(Object.keys(lessonLabs.worldModelLessonLabSpecs).sort(), world.worldModelLessons.map((lesson) => lesson.id).sort(), "every lesson needs a mechanism-specific lab");
  for (const lesson of world.worldModelLessons) {
    const spec = lessonLabs.worldModelLessonLabSpecs[lesson.id];
    assert.ok(spec.title.trim().length >= 12, `${lesson.id} lab title`);
    for (const field of ["question", "change", "observe", "explain", "complete", "boundary"]) assert.ok(spec[field].trim().length >= 35, `${lesson.id} lab ${field}`);
    const readout = spec.evaluate(spec.control.initial);
    assert.ok(readout.resultLabel.trim().length >= 3, `${lesson.id} result label`);
    assert.ok(readout.resultValue.trim().length >= 1, `${lesson.id} result value`);
    assert.ok(readout.detail.trim().length >= 35, `${lesson.id} diagnostic feedback`);
    assert.ok(readout.meter >= 0 && readout.meter <= 100, `${lesson.id} meter range`);
  }
  assert.match(labSource, /worldModelLessonLabSpecs\[lesson\.id\]/, "WorldModelLab must use the lesson-specific contract rather than only a shared type");
  assert.match(labSource, /<span><MathText>\{result\.resultLabel\}<\/MathText><\/span>/, "lab result labels must render mathematical notation rather than raw delimiters");
  assert.match(labSource, /<strong><MathText>\{result\.resultValue\}<\/MathText><\/strong>/, "lab result values must render mathematical notation rather than raw delimiters");
  assert.doesNotMatch(labSpecSource, /(?<!\\)\\(?!\\)/, "learner-facing lab math must preserve JavaScript backslashes");

  assert.equal(Object.keys(code.worldModelCodeExamples).length, 20);
  assert.deepEqual(Object.keys(code.worldModelCodeExamples).sort(), Object.keys(code.worldModelCodeGuidance).sort());
  assert.match(code.worldModelCodeExamples["actor-critic-lambda"].code, /def lambda_returns\(lam\)/);
  assert.match(code.worldModelCodeExamples["actor-critic-lambda"].code, /continuations/);
  assert.match(code.worldModelCodeExamples["actor-critic-lambda"].observe, /\[5\.32, 5\.6, 3\.0\]/);

  const requiredDiagnosticChoices = {
    "latent-prior-posterior": 5,
    "compounding-error-exploitation": 4,
    "hierarchical-multiscale": 6,
    "geometry-physical-priors": 6,
    "causal-counterfactual-models": 5,
  };
  for (const [id, count] of Object.entries(requiredDiagnosticChoices)) assert.equal(lessonLabs.worldModelLessonLabSpecs[id].control.choices.length, count, `${id} diagnostic cases`);
  assert.match(lessonLabs.worldModelLessonLabSpecs["latent-prior-posterior"].evaluate(2).resultValue, /\.68 NATS/);
  assert.match(lessonLabs.worldModelLessonLabSpecs["causal-counterfactual-models"].evaluate(3).resultValue, /POSITIVITY FAIL/);
  const validationSource = await readFile(join(root, "app/world-models/technical-validations.tsx"), "utf8");
  assert.equal((validationSource.match(/^  (?:(?:"[^"]+")|(?:[a-z][\w-]*)): \{ title:/gm) ?? []).length, 6);
  for (const phrase of ["Contract", "Expected observation", "Claim boundary", "preserved machine-readable dossier"]) assert.ok(validationSource.includes(phrase));
});

test("World Models source provenance is direct where the lesson makes system-specific claims", async () => {
  const resourceUrls = (id) => world.worldModelLessonGuides[id].resources.map((resource) => resource.url);
  assert.ok(resourceUrls("autoregressive-diffusion-dynamics").includes("https://arxiv.org/abs/2204.03458"));
  assert.ok(resourceUrls("differentiable-planning").some((url) => url.includes("ba6d843eb4251a4526ce65d1807a9309")));
  assert.ok(resourceUrls("compounding-error-exploitation").some((url) => url.includes("5faf461eff3099671ad63c6f3f094f7f")));
  assert.ok(resourceUrls("compounding-error-exploitation").includes("https://arxiv.org/abs/1812.01129"));
  assert.ok(resourceUrls("system-identification-sim-to-real").includes("https://proceedings.mlr.press/v155/mehta21a.html"));
  assert.ok(resourceUrls("system-identification-sim-to-real").includes("https://doi.org/10.1016/j.sysconle.2004.09.003"));
  assert.ok(resourceUrls("hierarchical-multiscale").includes("https://arxiv.org/abs/2406.00483"));
  assert.ok(resourceUrls("geometry-physical-priors").includes("https://proceedings.mlr.press/v162/park22a.html"));
  assert.ok(resourceUrls("causal-counterfactual-models").some((url) => url.includes("10.1214/09-SS057")));
  assert.ok(resourceUrls("language-multimodal-world-models").includes("https://proceedings.mlr.press/v235/lin24g.html"));
  assert.ok(resourceUrls("world-model-research-capstone").some((url) => url.includes("help.osf.io")));
  assert.equal(world.worldModelLessonGuides["foundation-world-models-case-study"].resources.length, 4);
  assert.equal(world.worldModelLessonGuides["dyna-tdmpc-case-study"].resources.length, 4);

  const simulatorSource = world.worldModelLessonGuides["system-identification-sim-to-real"].resources.find((resource) => resource.url.includes("mehta21a"));
  assert.equal(simulatorSource.title, "A User’s Guide to Calibrating Robotic Simulators");

  const comparison = JSON.parse(await readFile(join(root, "public/capstone-artifacts/worldmodel/foundation-world-models-case-study.json"), "utf8"));
  assert.equal(comparison.rawRows.filter((row) => row.sourceUrl?.startsWith("http")).length, 4);
  const research = JSON.parse(await readFile(join(root, "public/capstone-artifacts/worldmodel/world-model-research-capstone.json"), "utf8"));
  assert.equal(research.decision.startsWith("Not supported"), true);
  assert.equal(research.sourceManifest.length, 2);
  const dynaComparison = JSON.parse(await readFile(join(root, "public/capstone-artifacts/worldmodel/dyna-tdmpc-case-study.json"), "utf8"));
  assert.deepEqual(dynaComparison.sourceManifest.map((source) => source.family), ["Dyna", "Dreamer", "MuZero", "TD-MPC"]);
  assert.equal(dynaComparison.sourceManifest.filter((source) => source.sourceUrl.startsWith("http")).length, 4);
});

test("seven World Models capstones have complete local projects and machine-readable references", async () => {
  const expected = [...world.worldModelCapstoneLessonIds];
  assert.equal(expected.length, 7);
  assert.deepEqual(Object.keys(capstones.worldModelCapstoneProjects).sort(), expected.sort());
  assert.deepEqual(Object.keys(capstones.worldModelCapstoneEvidencePacks).sort(), expected.sort());
  assert.deepEqual(Object.keys(capstones.worldModelCapstoneArtifactFiles).sort(), expected.sort());
  for (const id of expected) {
    const project = capstones.worldModelCapstoneProjects[id];
    assert.equal(project.stages.length, 4);
    assert.ok(project.deliverables.length >= 3);
    assert.ok(project.rubric.length >= 4);
    const artifact = JSON.parse(await readFile(join(root, "public/capstone-artifacts/worldmodel", `${id}.json`), "utf8"));
    assert.equal(artifact.course, "worldmodel");
    assert.equal(artifact.lessonId, id);
    assert.ok(artifact.failure.length >= 40);
    assert.ok(artifact.boundary.length >= 40);
  }
});

test("multi-course URLs, selector, and progress migration are explicit", async () => {
  const [app, landing, lessonRoute, redirects] = await Promise.all([
    readFile(join(root, "app/course-app.tsx"), "utf8"),
    readFile(join(root, "app/[courseId]/page.tsx"), "utf8"),
    readFile(join(root, "app/[courseId]/[lessonId]/page.tsx"), "utf8"),
    readFile(join(root, "app/route-redirects.tsx"), "utf8"),
  ]);
  assert.match(app, /<select value=\{course\.id\}/);
  assert.match(app, /publicPath\(`\/\$\{course\.id\}\/\$\{id\}\/`\)/);
  assert.match(app, /neural-field-guide-progress-v2:\$\{course\.id\}/);
  assert.match(app, /LEGACY_LLM_STORAGE_KEY/);
  assert.match(landing, /LegacyLessonRedirect/);
  assert.match(lessonRoute, /courseIds\.flatMap/);
  assert.match(redirects, /\/llm\/\$\{lessonId\}\//);
});
