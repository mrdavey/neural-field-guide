import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const cache = new Map();
const root = resolve(fileURLToPath(new URL("..", import.meta.url)));

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

const { lessonGuides } = loadTypeScriptModule(join(root, "app/lesson-guides/index.ts"));
const { worldModelLessonGuides } = loadTypeScriptModule(join(root, "app/world-models/index.ts"));
const { lessonCodeExamples } = loadTypeScriptModule(join(root, "app/code-examples.ts"));
const { worldModelCodeExamples } = loadTypeScriptModule(join(root, "app/world-models/code-examples.ts"));

const sources = Object.fromEntries(await Promise.all(Object.entries({
  activity: "app/activity-info.tsx",
  guide: "app/lesson-guide-view.tsx",
  labs: "app/lesson-labs.tsx",
  worldLabs: "app/world-models/labs.tsx",
  evidence: "app/lesson-evidence-view.tsx",
  validations: "app/technical-validations.tsx",
  worldValidations: "app/world-models/technical-validations.tsx",
  studios: "app/mastery-studios.tsx",
  workshop: "app/fine-tuning-workshop.tsx",
  capstone: "app/capstone-project-view.tsx",
  scrollStory: "app/scroll-story.tsx",
  activityStyles: "app/learning-activities.css",
}).map(async ([name, file]) => [name, await readFile(join(root, file), "utf8")])));

test("all 90 guided examples contain a substantive concrete trace", () => {
  const guides = { ...lessonGuides, ...worldModelLessonGuides };
  assert.equal(Object.keys(guides).length, 90);
  const gaps = [];
  for (const [lessonId, guide] of Object.entries(guides)) {
    const example = guide.guidedExample;
    if (example.title.trim().length < 12) gaps.push(`${lessonId}: title`);
    if (example.setup.trim().length < 35) gaps.push(`${lessonId}: setup`);
    if (example.steps.length < 3) gaps.push(`${lessonId}: fewer than three steps`);
    for (const [index, step] of example.steps.entries()) if (step.trim().length < 24) gaps.push(`${lessonId}: step ${index + 1}`);
    if (example.result.trim().length < 35) gaps.push(`${lessonId}: conclusion`);
  }
  assert.deepEqual(gaps, []);
});

test("every code notebook supplies prediction, observation, and changed-case guidance", () => {
  const examples = { ...lessonCodeExamples, ...worldModelCodeExamples };
  assert.equal(Object.keys(lessonCodeExamples).length, 40);
  assert.equal(Object.keys(worldModelCodeExamples).length, 20);
  assert.equal(Object.keys(examples).length, 60);
  const gaps = [];
  for (const [lessonId, example] of Object.entries(examples)) {
    if (example.setup.trim().length < 30) gaps.push(`${lessonId}: setup`);
    if (example.predict.trim().length < 24) gaps.push(`${lessonId}: prediction`);
    if (example.observe.trim().length < 35) gaps.push(`${lessonId}: expected observation`);
    if (example.tryIt.trim().length < 24) gaps.push(`${lessonId}: changed case`);
  }
  assert.deepEqual(gaps, []);
});

test("guided examples use one prediction before a complete worked trace", () => {
  for (const phrase of [
    "Worked trace",
    "Compare with trace",
    "Conclusion",
    "Restart example",
  ]) assert.ok(sources.guide.includes(phrase), phrase);
  assert.match(sources.guide, /disabled=\{guidedPrediction\.trim\(\)\.length < 18\}/);
  assert.match(sources.guide, /guide\.guidedExample\.steps\.map/);
  for (const phrase of ["Pause before step", "Reveal step", "Your forecast:"]) assert.doesNotMatch(sources.guide, new RegExp(phrase));
});

test("shared activity framing keeps only concise question and scope copy visible", () => {
  for (const phrase of ["<strong>Question:</strong>", "<strong>Scope:</strong>", "Private; not graded."]) assert.ok(sources.activity.includes(phrase), phrase);
  for (const phrase of ["Learning question", "1 · Do", "2 · Observe", "3 · Explain", "4 · Complete when", "Evidence boundary:"]) assert.ok(!sources.activity.includes(phrase), phrase);
  assert.match(sources.activity, /committed && <MotionReveal stateKey="committed" className="activity-after-commit">\{children\}<\/MotionReveal>/);
  assert.match(sources.activity, /disabled=\{draft\.trim\(\)\.length < minLength\}/);
  for (const [name, source] of Object.entries({ labs: sources.labs, worldLabs: sources.worldLabs, validations: sources.validations, worldValidations: sources.worldValidations, workshop: sources.workshop })) {
    assert.ok(source.includes("<LearningActivityContract"), `${name} visible learning contract`);
    assert.ok(source.includes("<PredictionGate"), `${name} prediction gate`);
  }
  assert.ok(sources.studios.includes("<LearningActivityContract"), "decision studios visible learning contract");
  for (const phrase of ["Before moving to the next stage", "Predict which labeled state", "Complete when:"]) assert.ok(!sources.scrollStory.includes(phrase), `scroll story: ${phrase}`);
  assert.match(sources.activityStyles, /textarea:focus-visible\{outline:3px solid var\(--orange\)/, "new written-response controls need visible keyboard focus");
  assert.match(sources.activityStyles, /min-height:44px/, "new activity buttons need touch-sized targets");
  assert.match(sources.activityStyles, /@media\(max-width:780px\)/, "new activity scaffolds need a narrow-screen layout");
  assert.match(sources.activityStyles, /guided-example-intro \.activity-info-popover\{left:auto;right:0\}/, "guided-example help must stay inside the desktop reading column");
  assert.match(sources.activityStyles, /\.capstone-rubric\{min-width:0;overflow:hidden\}[^]*\.rubric-table\{max-width:100%;min-width:0;overflow-x:auto\}/, "wide rubrics must scroll locally instead of widening the page");
});

test("answers and exemplars remain hidden until a meaningful attempt", () => {
  assert.match(sources.evidence, /PAUSE BEFORE THE OPTIONS/);
  assert.match(sources.evidence, /diagnosticPassed \? `Correct principle:/);
  assert.doesNotMatch(sources.evidence, /<div className="contrast-principle"><span>WHAT CHANGED\?<\/span><p><MathText>\{evidence\.contrast\.principle\}/);
  assert.match(sources.validations, /<PredictionGate[^]*EXPECTED EVIDENCE/);
  assert.match(sources.worldValidations, /<PredictionGate[^]*Expected observation/);
  assert.match(sources.capstone, /Reveal exemplar approach<\/button>/);
  assert.match(sources.capstone, /disabled=\{!attempted\} onClick=\{\(\) => setShowExemplar\(true\)\}/);
  assert.match(sources.guide, /Commit changed-case prediction/);
});
