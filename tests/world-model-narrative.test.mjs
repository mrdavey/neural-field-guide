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
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: absolute,
  }).outputText;
  const localRequire = (specifier) => specifier.startsWith(".")
    ? loadTypeScriptModule(resolveTypeScriptModule(specifier, absolute))
    : require(specifier);
  Function("exports", "require", "module", "__filename", "__dirname", javascript)(moduleRecord.exports, localRequire, moduleRecord, absolute, dirname(absolute));
  return moduleRecord.exports;
}

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const world = loadTypeScriptModule(join(root, "app/world-models/index.ts"));
const introduction = world.worldModelSpecs.find((spec) => spec.lesson.id === "world-models");
const rewritten = world.worldModelSpecs.filter((spec) => spec.lesson.id !== "world-models");

test("the World Models introduction keeps its bespoke beginner narrative", () => {
  const guide = world.worldModelLessonGuides[introduction.lesson.id];
  assert.equal(guide.sections.length, 2);
  assert.deepEqual(guide.sections.map((section) => section.title), ["Why imagine before acting?", "What makes a prediction useful?"]);
  assert.equal(guide.guidedExample.title, "One hallway decision");
  assert.equal(guide.practice, introduction.practice);
});

test("lessons 2 through 46 expose three ordered, page-specific narrative sections", () => {
  assert.equal(rewritten.length, 45);
  const openingTitles = [];
  for (const spec of rewritten) {
    const guide = world.worldModelLessonGuides[spec.lesson.id];
    const [opening, runningCase, evidence] = guide.sections;
    assert.equal(guide.sections.length, 3, `${spec.lesson.id} section count`);

    assert.equal(opening.title, spec.objectives[0], `${spec.lesson.id} opening title names the learner's task`);
    assert.equal(opening.paragraphs.length, 2, `${spec.lesson.id} focused opening`);
    assert.ok(!opening.paragraphs[0].includes(spec.lesson.simple), `${spec.lesson.id} displayed definition is not repeated`);
    assert.ok(opening.paragraphs[0].includes(spec.motion.intro), `${spec.lesson.id} lesson question`);
    assert.equal(opening.paragraphs[1], spec.lesson.deep, `${spec.lesson.id} precise mechanism`);

    assert.equal(runningCase.title, "The mechanism in one concrete case", `${spec.lesson.id} case heading describes its teaching purpose`);
    assert.equal(runningCase.paragraphs[0], spec.lesson.example, `${spec.lesson.id} running case`);
    for (const step of spec.walkthrough) assert.ok(runningCase.paragraphs[1].toLowerCase().includes(step.title.toLowerCase()), `${spec.lesson.id} case links ${step.title}`);

    assert.equal(evidence.title, "Where the conclusion stops—and what to test next", `${spec.lesson.id} evidence title`);
    assert.ok(evidence.paragraphs[0].includes(spec.lesson.misconception), `${spec.lesson.id} misconception boundary`);
    assert.ok(evidence.paragraphs[1].includes(spec.coverage[1].explanation), `${spec.lesson.id} decision explanation`);
    assert.ok(evidence.paragraphs[1].includes(spec.coverage[1].mechanism), `${spec.lesson.id} decision mechanism`);
    assert.ok(evidence.paragraphs[1].includes(spec.coverage[1].workedExample), `${spec.lesson.id} decision example`);
    assert.ok(evidence.paragraphs[2].includes(spec.coverage[1].boundary), `${spec.lesson.id} evidence boundary`);
    assert.match(evidence.paragraphs[2], /changed case that could reverse the decision/, `${spec.lesson.id} next evidence`);

    const narrative = guide.sections.flatMap((section) => [section.title, ...section.paragraphs]).join(" ");
    assert.doesNotMatch(narrative, /Operational trace:|: mechanism|Limits and decision evidence/, `${spec.lesson.id} retired generic copy`);
    assert.deepEqual(guide.objectives, [...spec.objectives], `${spec.lesson.id} objectives preserved`);
    assert.deepEqual(guide.vocabulary, [...spec.vocabulary], `${spec.lesson.id} vocabulary preserved`);
    assert.deepEqual(guide.walkthrough, [...spec.walkthrough], `${spec.lesson.id} walkthrough preserved`);
    assert.deepEqual(guide.resources, [...spec.resources], `${spec.lesson.id} resources preserved`);
    openingTitles.push(opening.title);
  }
  assert.equal(new Set(openingTitles).size, rewritten.length, "every rewritten lesson needs its own opening heading");
});

test("every rewritten guided example keeps one setup, ordered trace, and bounded result", () => {
  for (const spec of rewritten) {
    const example = world.worldModelLessonGuides[spec.lesson.id].guidedExample;
    assert.equal(example.setup, spec.coverage[0].check.prompt, `${spec.lesson.id} setup uses a fresh primary-objective case`);
    assert.equal(example.steps.length, 3, `${spec.lesson.id} step count`);
    assert.ok(example.steps.every((step) => step.trim().length > 20), `${spec.lesson.id} trace steps contain reasoning`);
    assert.ok(example.result.includes(spec.objectives[0].charAt(0).toLowerCase() + spec.objectives[0].slice(1)), `${spec.lesson.id} result returns to the promised mechanism`);
    assert.ok(example.result.includes(spec.objectives[1].charAt(0).toLowerCase() + spec.objectives[1].slice(1)), `${spec.lesson.id} result names the remaining decision`);
    assert.notEqual(example.setup, spec.coverage[1].workedExample, `${spec.lesson.id} no unrelated decision setup`);
    assert.notEqual(example.result, spec.transfer.worked, `${spec.lesson.id} no unrelated transfer result`);
  }
});

test("rewritten practice is page-specific and remains distinct from transfer", () => {
  const prompts = [];
  for (const spec of rewritten) {
    const practice = world.worldModelLessonGuides[spec.lesson.id].practice;
    assert.notDeepEqual(practice, spec.practice, `${spec.lesson.id} retires generated misconception practice`);
    assert.ok(practice.prompt.includes(spec.coverage[1].check.prompt), `${spec.lesson.id} practice starts from its decision check`);
    assert.match(practice.prompt, /change one assumption from the running case/, `${spec.lesson.id} practice adds a changed assumption`);
    assert.ok(practice.hint.includes(spec.coverage[1].check.retry), `${spec.lesson.id} practice has a specific retry route`);
    assert.ok(practice.answer.includes(spec.coverage[1].check.expected), `${spec.lesson.id} practice has expected reasoning`);
    assert.ok(practice.answer.includes(spec.coverage[1].boundary), `${spec.lesson.id} practice preserves its boundary`);
    assert.notEqual(practice.prompt, spec.transfer.prompt, `${spec.lesson.id} practice prompt differs from transfer`);
    assert.notEqual(practice.answer, spec.transfer.worked, `${spec.lesson.id} practice answer differs from transfer`);
    assert.equal(practice.answer.includes(spec.transfer.worked), false, `${spec.lesson.id} practice does not paste transfer reasoning`);
    prompts.push(practice.prompt);
  }
  assert.equal(new Set(prompts).size, rewritten.length, "every rewritten lesson needs its own practice prompt");
});
