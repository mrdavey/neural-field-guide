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
const generative = loadTypeScriptModule(join(root, "app/generative/index.ts"));
const rl = loadTypeScriptModule(join(root, "app/rl/index.ts"));
const embodied = loadTypeScriptModule(join(root, "app/embodied/index.ts"));

const courses = [
  {
    name: "generative",
    lessons: generative.generativeLessons,
    specs: generative.generativeSpecs,
    guides: generative.generativeLessonGuides,
    motion: generative.generativeMotionStories,
    transfers: generative.generativeTransferChecks,
  },
  {
    name: "rl",
    lessons: rl.rlLessons,
    specs: rl.rlSpecs,
    guides: rl.rlLessonGuides,
    motion: rl.rlMotionStories,
    transfers: rl.rlTransferChecks,
  },
  {
    name: "embodied",
    lessons: embodied.embodiedLessons,
    specs: embodied.embodiedSpecs,
    guides: embodied.embodiedLessonGuides,
    motion: embodied.embodiedMotionStories,
    transfers: embodied.embodiedTransferChecks,
  },
];

const authoringLanguage = /Build increment|Mechanism-to-transfer ladder|numerical or state trace|declared fixtures|Decision boundary|three items below are deliberately separate|becomes an inspectable build|not a black box/i;
const malformedAcronym = /\b(?:aI|dDPM|dDIM|dQN|eBM|eLBO|gPU|mCMC|mPC|rL|vAE|vAEs)\b/;

test("shared research-course introductions retain their familiar-example narrative", () => {
  for (const course of courses) {
    const introduction = course.lessons[0];
    const guide = course.guides[introduction.id];
    assert.equal(guide.sections.length, 2, `${course.name} introduction sections`);
    assert.equal(guide.guidedExample.title, `Three ways to inspect the idea — ${introduction.title}`);
    assert.match(guide.guidedExample.setup, /three separate cases/i);
    assert.equal(guide.guidedExample.steps.length, 3);
    assert.ok(!guide.guidedExample.steps.join(" ").includes(introduction.deep), `${course.name} introduction does not paste its long explanation into the worked cases`);
    assert.equal(course.motion[introduction.id].headline, `${introduction.title} begins with one question you can inspect.`);
  }
});

test("every later research-course lesson reads as three connected sections around one anchor case", () => {
  let lessonCount = 0;
  for (const course of courses) {
    const headlines = new Set();
    for (const [lessonIndex, lesson] of course.lessons.slice(1).entries()) {
      lessonCount += 1;
      const guide = course.guides[lesson.id];
      const spec = course.specs.find((item) => item.lesson.id === lesson.id);
      const transfer = course.transfers[lesson.id];
      const motion = course.motion[lesson.id];
      assert.equal(guide.sections.length, 3, `${course.name}:${lesson.id} narrative sections`);
      assert.equal(guide.sections[0].title, spec.lab.question, `${course.name}:${lesson.id} opening learning question`);
      assert.equal(guide.sections[1].title, "Follow the mechanism through one worked case", `${course.name}:${lesson.id} worked-case heading`);
      assert.equal(guide.sections[2].title, "Decide what the evidence supports", `${course.name}:${lesson.id} evidence heading`);

      const guideCopy = [
        ...guide.sections.flatMap((section) => [section.title, ...section.paragraphs]),
        ...guide.walkthrough.flatMap((step) => [step.title, step.body, step.checkpoint]),
        guide.guidedExample.title,
        guide.guidedExample.setup,
        ...guide.guidedExample.steps,
        guide.guidedExample.result,
        guide.practice.prompt,
        guide.practice.hint,
        guide.practice.answer,
      ].join("\n");
      assert.doesNotMatch(guideCopy, authoringLanguage, `${course.name}:${lesson.id} learner-facing guide language`);
      assert.doesNotMatch(guideCopy, malformedAcronym, `${course.name}:${lesson.id} acronyms remain readable`);
      assert.equal(guide.sections[0].paragraphs[0], lesson.deep, `${course.name}:${lesson.id} opening proceeds from the displayed definition to the precise mechanism`);
      assert.ok(!guide.sections[0].paragraphs[0].includes(lesson.simple), `${course.name}:${lesson.id} opening does not repeat the displayed definition`);
      assert.equal(guideCopy.split(lesson.deep).length - 1, 1, `${course.name}:${lesson.id} long mechanism is explained once rather than pasted into the worked trace`);
      assert.equal(guide.sections[1].paragraphs[0], lesson.example, `${course.name}:${lesson.id} narrative anchor`);
      assert.ok(guide.sections[2].paragraphs.join(" ").includes(lesson.misconception), `${course.name}:${lesson.id} misconception is interpreted after the worked case`);
      assert.ok(guide.sections[2].paragraphs.join(" ").includes(spec.coverage[1].mechanism), `${course.name}:${lesson.id} decision mechanism follows the worked case`);
      assert.ok(guide.sections[2].paragraphs.join(" ").includes(spec.coverage[1].workedExample), `${course.name}:${lesson.id} decision receives a concrete comparison`);
      assert.ok(guide.sections[2].paragraphs.join(" ").includes(spec.coverage[1].boundary), `${course.name}:${lesson.id} decision remains bounded`);
      const nextLesson = course.lessons[lessonIndex + 2];
      if (nextLesson) assert.ok(guide.sections[2].paragraphs.at(-1).includes(`“${nextLesson.title}”`), `${course.name}:${lesson.id} names the next chapter without exposing a slug`);
      assert.equal(guideCopy.split(lesson.example).length - 1, 1, `${course.name}:${lesson.id} worked case is stated once rather than restarted`);
      assert.equal(guide.guidedExample.setup, spec.coverage[0].check.prompt, `${course.name}:${lesson.id} guided setup uses a fresh primary-objective case`);
      assert.equal(guide.guidedExample.steps.length, 3, `${course.name}:${lesson.id} guided steps`);
      assert.ok(guide.guidedExample.steps.every((step) => step.trim().length > 20), `${course.name}:${lesson.id} guided steps contain reasoning`);
      assert.doesNotMatch(guide.guidedExample.steps.join(" "), /\.8 posterior mean|\b(?:true|false) [a-z]+ is\b/i, `${course.name}:${lesson.id} semicolon-delimited trace clauses remain separate sentences`);
      assert.ok(guide.guidedExample.result.includes(guide.objectives[0].charAt(0).toLowerCase() + guide.objectives[0].slice(1)), `${course.name}:${lesson.id} worked result returns to the primary objective`);
      assert.ok(guide.guidedExample.result.includes(guide.objectives[1].charAt(0).toLowerCase() + guide.objectives[1].slice(1)), `${course.name}:${lesson.id} worked result names the remaining decision`);

      assert.notEqual(guide.practice.prompt, transfer.prompt, `${course.name}:${lesson.id} practice prompt differs from transfer`);
      assert.notEqual(guide.practice.answer, transfer.worked, `${course.name}:${lesson.id} practice answer differs from transfer`);
      assert.ok(!guide.practice.prompt.includes(transfer.prompt), `${course.name}:${lesson.id} practice does not wrap transfer prompt`);
      assert.ok(!guide.practice.answer.includes(transfer.worked), `${course.name}:${lesson.id} practice does not wrap transfer answer`);
      assert.ok(guide.practice.prompt.includes(lesson.misconception), `${course.name}:${lesson.id} practice challenges the worked conclusion with the lesson boundary`);

      assert.doesNotMatch(motion.headline, authoringLanguage, `${course.name}:${lesson.id} motion headline`);
      assert.doesNotMatch(motion.headline, malformedAcronym, `${course.name}:${lesson.id} motion acronym casing`);
      assert.ok(motion.headline.includes(guide.objectives[0]), `${course.name}:${lesson.id} headline starts from primary objective`);
      assert.ok(motion.headline.toLowerCase().includes(guide.objectives[1].toLowerCase()), `${course.name}:${lesson.id} headline reaches decision objective`);
      assert.notEqual(motion.intro, spec.lab.question, `${course.name}:${lesson.id} visual handoff does not repeat the opening question`);
      assert.ok(spec.lesson.keyIdeas.every((idea) => motion.intro.includes(idea.replace(/[.!?]+$/, ""))), `${course.name}:${lesson.id} visual handoff carries the chapter mechanism`);
      headlines.add(motion.headline);
    }
    assert.equal(headlines.size, course.lessons.length - 1, `${course.name} motion headlines are page-specific`);
  }
  assert.equal(lessonCount, 89);
});

test("generated next-use prose names the next chapter and carries the taught mechanism", () => {
  for (const { name: courseId, guides } of courses) {
    for (const [lessonId, guide] of Object.entries(guides)) {
      const prose = guide.sections.flatMap((section) => section.paragraphs).join(" ");
      assert.doesNotMatch(prose, /while building [a-z]|build described as|mechanism developed here: “/, `${courseId}:${lessonId} must not substitute a component label for the concept handoff`);
      if (lessonId !== Object.keys(guides)[0]) assert.match(prose, /reuses the result developed here:/, `${courseId}:${lessonId} gives its concept a grammatical next-use handoff`);
    }
  }
});

test("compact RL and Embodied labs derive each instruction from authored lesson evidence", () => {
  for (const [courseName, specs] of [["rl", rl.rlSpecs], ["embodied", embodied.embodiedSpecs]]) {
    const fieldValues = { change: new Set(), observe: new Set(), explain: new Set(), complete: new Set() };
    for (const spec of specs.slice(1)) {
      const lab = spec.lab;
      assert.ok(lab.change.includes(lab.question), `${courseName}:${spec.lesson.id} change uses question`);
      assert.ok(lab.cases.every((item) => lab.observe.includes(item.label) && lab.observe.includes(item.resultValue)), `${courseName}:${spec.lesson.id} observation follows cases`);
      assert.ok(lab.explain.includes(spec.coverage[1].mechanism), `${courseName}:${spec.lesson.id} explanation uses decision mechanism`);
      assert.ok(lab.complete.includes(lab.boundary), `${courseName}:${spec.lesson.id} completion uses boundary`);
      assert.doesNotMatch([lab.change, lab.observe, lab.explain, lab.complete].join("\n"), /displayed fixture contract|result label, value, meter|diagnostic boundary/i, `${courseName}:${spec.lesson.id} old compact defaults`);
      for (const field of Object.keys(fieldValues)) fieldValues[field].add(lab[field]);
    }
    for (const [field, values] of Object.entries(fieldValues)) assert.equal(values.size, specs.length - 1, `${courseName} ${field} instructions are page-specific`);
  }
});
