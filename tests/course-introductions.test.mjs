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

function resolveTypeScriptModule(specifier, parentFile) {
  const candidate = resolve(dirname(parentFile), specifier);
  for (const path of [candidate, candidate + ".ts", candidate + ".tsx", join(candidate, "index.ts")]) {
    if (existsSync(path) && [".ts", ".tsx"].includes(extname(path))) return path;
  }
  throw new Error("Cannot resolve " + specifier + " from " + parentFile);
}

function loadTypeScriptModule(file) {
  const absolute = resolve(file);
  if (cache.has(absolute)) return cache.get(absolute).exports;
  const moduleRecord = { exports: {} };
  cache.set(absolute, moduleRecord);
  const javascript = ts.transpileModule(readFileSync(absolute, "utf8"), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: absolute,
  }).outputText;
  const localRequire = (specifier) => specifier.startsWith(".")
    ? loadTypeScriptModule(resolveTypeScriptModule(specifier, absolute))
    : require(specifier);
  Function("exports", "require", "module", "__filename", "__dirname", javascript)(moduleRecord.exports, localRequire, moduleRecord, absolute, dirname(absolute));
  return moduleRecord.exports;
}

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const llmData = loadTypeScriptModule(join(root, "app/course-data.ts"));
const llmGuides = loadTypeScriptModule(join(root, "app/lesson-guides/index.ts"));
const llmCoverage = loadTypeScriptModule(join(root, "app/lesson-objective-coverage.ts"));
const world = loadTypeScriptModule(join(root, "app/world-models/index.ts"));
const generative = loadTypeScriptModule(join(root, "app/generative/index.ts"));
const rl = loadTypeScriptModule(join(root, "app/rl/index.ts"));
const embodied = loadTypeScriptModule(join(root, "app/embodied/index.ts"));

const introductions = [
  { course: "llm", lesson: llmData.lessons.find((lesson) => lesson.number === 1), guide: llmGuides.lessonGuides.introduction, coverage: llmCoverage.lessonObjectiveCoverage.introduction },
  { course: "worldmodel", lesson: world.worldModelLessons.find((lesson) => lesson.number === 1), guide: world.worldModelLessonGuides["world-models"], coverage: world.worldModelObjectiveCoverage["world-models"] },
  { course: "generative", lesson: generative.generativeLessons.find((lesson) => lesson.number === 1), guide: generative.generativeLessonGuides["generation-as-distribution"], coverage: generative.generativeObjectiveCoverage["generation-as-distribution"] },
  { course: "rl", lesson: rl.rlLessons.find((lesson) => lesson.number === 1), guide: rl.rlLessonGuides["sequential-decision-systems"], coverage: rl.rlObjectiveCoverage["sequential-decision-systems"] },
  { course: "embodied", lesson: embodied.embodiedLessons.find((lesson) => lesson.number === 1), guide: embodied.embodiedLessonGuides["embodied-task-contracts"], coverage: embodied.embodiedObjectiveCoverage["embodied-task-contracts"] },
];

function guideCopy(guide) {
  return [
    ...guide.objectives,
    ...guide.sections.flatMap((section) => [section.title, ...section.paragraphs]),
    ...guide.walkthrough.flatMap((item) => [item.title, item.body, item.checkpoint]),
    guide.guidedExample.title,
    guide.guidedExample.setup,
    ...guide.guidedExample.steps,
    guide.guidedExample.result,
  ].join("\n");
}

test("every course begins with a prerequisite-free, notation-free orientation", () => {
  assert.deepEqual(introductions.map(({ lesson }) => lesson.title), [
    "Introduction",
    "What Is a World Model?",
    "What Is a Generative Model?",
    "What Is Reinforcement Learning?",
    "What Is Embodied AI?",
  ]);

  for (const { course, lesson, guide, coverage } of introductions) {
    assert.equal(lesson.number, 1, course + " first lesson number");
    assert.deepEqual(lesson.prerequisites ?? [], [], course + " local prerequisites");
    assert.deepEqual(lesson.programPrerequisites ?? [], [], course + " program prerequisites");
    assert.deepEqual(coverage.map((item) => item.objective), guide.objectives, course + " exact objective join");

    const orientationCopy = [
      lesson.simple,
      lesson.deep,
      lesson.mentalModel,
      lesson.example,
      lesson.misconception,
      ...guide.objectives,
      ...coverage.flatMap((item) => [item.explanation, item.mechanism, item.workedExample, item.boundary, item.check.prompt]),
    ].join("\n");
    assert.doesNotMatch(orientationCopy, /\$|\\(?:frac|sum|theta|pi|gamma)\b/, course + " should defer notation");
    assert.doesNotMatch(orientationCopy, /\b(?:logits?|softmax|inverse-CDF|discounted return|bootstrapping|predicate|timestamped packet)\b/i, course + " should defer later-course machinery");
    assert.match(orientationCopy, /\b(?:why|worth|exciting|useful|improve|create|imagine|body|world)\b/i, course + " should establish motivation");
    assert.match(orientationCopy, /\b(?:check|checked|evidence|limit|boundary|fail|mistake|unsafe|wrong|accurate)\b/i, course + " should establish an honest limit");
  }
});

test("introductory interactions compare concrete cases before formal machinery", async () => {
  const [courseApp, llmLabs, worldLabs, generativeSource, rlSource, embodiedSource] = await Promise.all([
    readFile(join(root, "app/course-app.tsx"), "utf8"),
    readFile(join(root, "app/lesson-labs.tsx"), "utf8"),
    readFile(join(root, "app/world-models/lesson-lab-specs.ts"), "utf8"),
    readFile(join(root, "app/generative/sections/foundations.ts"), "utf8"),
    readFile(join(root, "app/rl/sections/foundations.ts"), "utf8"),
    readFile(join(root, "app/embodied/sections/foundations.ts"), "utf8"),
  ]);

  assert.match(courseApp, /lesson\.number === 1 \? "No earlier lesson is required\. Bring one familiar example and a question about what this field might make possible\."/);
  assert.match(llmLabs, /orientation: \{ title: "Trust-boundary explorer"/);
  assert.match(llmLabs, /Rewrite notes[\s\S]*Report train delay[\s\S]*Buy a ticket/);
  assert.match(worldLabs, /"world-models": discrete\([\s\S]*Route-sensitive map[\s\S]*Vivid hallway video/);
  assert.match(generativeSource, /id: "generation-as-distribution"[\s\S]*relevant variation[\s\S]*irrelevant difference[\s\S]*near copies/);
  assert.match(rlSource, /id: "sequential-decision-systems"[\s\S]*left → dead end[\s\S]*right → exit[\s\S]*spin → points/);
  assert.match(embodiedSource, /id:"embodied-task-contracts"[\s\S]*mug located[\s\S]*grasp not confirmed[\s\S]*person enters path/);
});

test("introductory guides use learner-facing language and coherent examples", () => {
  const authoringLanguage = /Build increment|Mechanism-to-transfer ladder|numerical or state trace|declared fixtures|Decision boundary|displayed fixture contract|diagnostic boundary|likelihood-cross-entropy|mdps-rewards|observation-action-spaces/i;

  for (const { course, guide } of introductions) {
    assert.doesNotMatch(guideCopy(guide), authoringLanguage, course + " introduction should not expose internal authoring language or lesson IDs");
  }

  const worldExample = world.worldModelLessonGuides["world-models"].guidedExample;
  assert.match([worldExample.setup, ...worldExample.steps, worldExample.result].join("\n"), /hallway[\s\S]*straight[\s\S]*left/i);
  assert.doesNotMatch([worldExample.setup, ...worldExample.steps, worldExample.result].join("\n"), /weather|storm|rain/i);

  for (const [course, lab] of [
    ["rl", rl.rlResearchLabs["sequential-decision-systems"]],
    ["embodied", embodied.embodiedResearchLabs["embodied-task-contracts"]],
  ]) {
    assert.doesNotMatch([lab.change, lab.observe, lab.explain, lab.complete].join("\n"), /displayed fixture contract|readout|diagnostic boundary/i, course + " introduction lab should use concrete learner language");
  }
});
