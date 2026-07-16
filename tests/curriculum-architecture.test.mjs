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
const llm = loadTypeScriptModule(join(root, "app/course-data.ts"));
const world = loadTypeScriptModule(join(root, "app/world-models/index.ts"));
const generative = loadTypeScriptModule(join(root, "app/generative/index.ts"));
const rl = loadTypeScriptModule(join(root, "app/rl/index.ts"));
const embodied = loadTypeScriptModule(join(root, "app/embodied/index.ts"));
const planned = loadTypeScriptModule(join(root, "app/research-curriculum-manifests.ts"));
const graph = loadTypeScriptModule(join(root, "app/curriculum-graph.ts"));
const architecture = readFileSync(join(root, "docs/CURRICULUM_ARCHITECTURE.md"), "utf8");
const inventory = readFileSync(join(root, "docs/CURRICULUM_INVENTORY.md"), "utf8");
const researchHelpers = readFileSync(join(root, "app/research-courses/helpers.ts"), "utf8");

const releasedRefs = new Set([
  ...llm.lessons.map((lesson) => `llm:${lesson.id}`),
  ...world.worldModelLessons.map((lesson) => `worldmodel:${lesson.id}`),
  ...generative.generativeLessons.map((lesson) => `generative:${lesson.id}`),
  ...rl.rlLessons.map((lesson) => `rl:${lesson.id}`),
  ...embodied.embodiedLessons.map((lesson) => `embodied:${lesson.id}`),
]);
const plannedRefs = new Set(Object.values(planned.plannedCourseManifests).filter((manifest) => !["generative", "rl", "embodied"].includes(manifest.id)).flatMap((manifest) => manifest.lessons.map((lesson) => `${manifest.id}:${lesson.id}`)));
const validRefs = new Set([...releasedRefs, ...plannedRefs]);
const resolvePlannedRef = (courseId, value) => value.includes(":") ? value : `${courseId}:${value}`;

test("the architecture inventories every released and planned lesson", () => {
  assert.equal(llm.lessons.length, 44);
  assert.equal(world.worldModelLessons.length, 46);
  assert.deepEqual(Object.fromEntries(Object.entries(planned.plannedCourseManifests).map(([id, manifest]) => [id, manifest.lessons.length])), { generative: 30, rl: 32, embodied: 30 });
  for (const ref of validRefs) assert.ok(inventory.includes(`\`${ref.split(":")[1]}\``), `inventory is missing ${ref}`);
  assert.match(inventory, /Generative Models — 30 released lessons/);
  assert.match(inventory, /Reinforcement Learning & Control — 32 released lessons/);
  assert.match(inventory, /Embodied AI — 30 released lessons/);
});

test("planned course manifests are contiguous, build-led, and dependency-valid", () => {
  for (const manifest of Object.values(planned.plannedCourseManifests)) {
    assert.deepEqual(manifest.lessons.map((lesson) => lesson.number), Array.from({ length: manifest.lessons.length }, (_, index) => index + 1));
    assert.equal(new Set(manifest.lessons.map((lesson) => lesson.id)).size, manifest.lessons.length);
    assert.deepEqual(manifest.lessons.filter((lesson) => lesson.capstone).map((lesson) => lesson.number), manifest.tracks.map((track) => Math.max(...manifest.lessons.filter((lesson) => lesson.track === track.id).map((lesson) => lesson.number))), `${manifest.id} ends every territory with synthesis`);
    assert.equal(new Set(manifest.lessons.map((lesson) => lesson.build)).size, manifest.lessons.length, `${manifest.id} build increments are authored rather than repeated filler`);
    for (const lesson of manifest.lessons) {
      for (const reuse of lesson.reuses) assert.ok(validRefs.has(resolvePlannedRef(manifest.id, reuse)), `${manifest.id}:${lesson.id} reuses missing ${reuse}`);
      const nextRef = resolvePlannedRef(manifest.id, lesson.nextUse);
      assert.ok(validRefs.has(nextRef) || lesson.nextUse === "research-portfolio", `${manifest.id}:${lesson.id} next use missing ${lesson.nextUse}`);
    }
  }
});

test("the cross-course graph has valid canonical, reinforcement, and future joins", () => {
  const conceptIds = new Set(graph.crossCourseConcepts.map((concept) => concept.id));
  assert.equal(conceptIds.size, graph.crossCourseConcepts.length);
  assert.ok(graph.crossCourseConcepts.length >= 20);
  for (const concept of graph.crossCourseConcepts) {
    assert.ok(validRefs.has(concept.canonical), `${concept.id} canonical ${concept.canonical}`);
    assert.ok(concept.boundary.length >= 80, `${concept.id} needs a precise ownership boundary`);
    assert.ok(concept.artifact.length >= 40, `${concept.id} needs an observable artifact`);
    for (const ref of [...concept.reinforces, ...concept.futureUses]) assert.ok(validRefs.has(ref), `${concept.id} references missing ${ref}`);
  }
  for (const course of graph.programCoursePath) for (const concept of course.requiredConcepts) assert.ok(conceptIds.has(concept), `${course.id} requires missing concept ${concept}`);
  assert.deepEqual(graph.programCoursePath.map((course) => course.id), ["llm", "worldmodel", "generative", "rl", "embodied"]);
});

test("the architecture records ownership, implemented joins, GPU evidence, and release gates", () => {
  for (const heading of ["Canonical concept ownership", "Boundary decisions", "Implemented cross-course joins", "Released research-course manifests", "GPU experiment evidence contract", "Release discipline"]) assert.ok(architecture.includes(`## ${heading}`), heading);
  for (const boundary of ["Autoregressive modeling", "VAEs and latent inference", "Diffusion", "MDPs, planning and RL", "RLHF and agents", "Multimodality and embodiment"]) assert.ok(architecture.includes(`### ${boundary}`), boundary);
  for (const phrase of ["Expected invariants and variable reference observations", "numeric band cannot enter the course", "Existing IDs and progress keys remain stable", "course selector lists only complete registered"]) assert.ok(architecture.toLowerCase().includes(phrase.toLowerCase()), phrase);
  assert.doesNotMatch(architecture, /Planned alignment/);
});

test("research objective coverage joins named learning promises rather than array positions", () => {
  assert.match(researchHelpers, /seed\.objectives\.primary/);
  assert.match(researchHelpers, /seed\.objectives\.decision/);
  assert.doesNotMatch(researchHelpers, /seed\.objectives\[/);
});
