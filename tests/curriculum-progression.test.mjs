import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  course: "../app/course-data.ts",
  courseView: "../app/course-app.tsx",
  continuity: "../app/course-continuity.ts",
  guideView: "../app/lesson-guide-view.tsx",
  handoffs: "../app/lesson-narrative-handoffs.ts",
  codeExamples: "../app/code-examples.ts",
  styles: "../app/globals.css",
};

const source = Object.fromEntries(await Promise.all(Object.entries(files).map(async ([key, path]) => [
  key,
  await readFile(new URL(path, import.meta.url), "utf8"),
])));

test("the home page sells the destination while preserving the cumulative course arc", () => {
  assert.match(source.course, /export const learningPhases/);
  for (const phase of ["numerical", "decoder", "training", "systems", "specialize"]) {
    assert.match(source.course, new RegExp(`id: "${phase}"`), `missing ${phase} phase`);
  }
  for (const range of ["Lessons 1–5", "Lessons 6–12", "Lessons 13–28", "Lessons 29–39", "Lessons 40–44"]) {
    assert.ok(source.course.includes(range), `missing learning range ${range}`);
  }
  assert.match(source.course, /role: "specialization"/);
  assert.match(source.courseView, /className="home-scroll-story"/);
  assert.match(source.courseView, /steps=\{learningPhases\.map/);
  assert.match(source.courseView, /phase\.milestone/);
  assert.match(source.courseView, /className="course-pitch"/);
  assert.match(source.courseView, /className="course-payoffs"/);
  assert.match(source.courseView, /className="home-finale"/);
  assert.match(source.courseView, /campaign\.promise/);
  assert.doesNotMatch(source.courseView, /readinessChecks|program-position|Recommended preparation|hero\.trace/);
});

test("post-training bridge is ordered into the dependency chain", () => {
  assert.match(source.course, /id: "instruction-tuning-rlhf"[^\n]+number: 21/);
  assert.match(source.course, /id: "posttraining-overview"[^\n]+number: 22/);
  assert.match(source.course, /posttraining-overview[\s\S]{0,2500}prerequisites: \["instruction-tuning-rlhf"\]/);
  assert.match(source.course, /id: "sft"[\s\S]{0,2500}prerequisites: \["posttraining-overview"\]/);
});

test("lesson pages make prior knowledge and the next reuse explicit", () => {
  for (const phrase of [
    "LessonNarrativeView",
    "priorKnowledge",
    "nextUse",
    "next-connection",
    "You will carry forward",
    "To learn",
    "To combine",
    "This chapter leaves you with",
    "The next question",
    "How the next lesson extends this",
  ]) {
    assert.ok(source.courseView.includes(phrase), `missing progression cue: ${phrase}`);
  }
  assert.match(source.courseView, /lessonById\[lesson\.prerequisites\.at\(-1\)!\]\.keyIdeas\[0\]/);
  assert.match(source.courseView, /nextGuide\?\.objectives\[0\]/);
  assert.match(source.courseView, /nextUsesThisLesson = Boolean\(next\?\.prerequisites\?\.includes\(lesson\.id\)\)/);
  assert.match(source.courseView, /lessonNarrativeResult\(course\.id, lesson\)/);
  assert.doesNotMatch(source.courseView, /nextBridgeParent/);
  assert.match(source.guideView, /Where this chapter begins/);
  assert.match(source.guideView, /Where the idea leads/);
  assert.match(source.guideView, /aria-label="Lesson outcomes and checks"/);
  assert.doesNotMatch(source.guideView, /By the end, you can/);
  assert.doesNotMatch(source.courseView, /By the end, you can/);
});

test("audited section seams carry the mechanism that actually prepares the next question", () => {
  for (const phrase of [
    "Keep the executed action separate from the expert label",
    "Separate reward, cost, and non-compensable action permissions",
    "learning distribution and the workload that infrastructure must serve",
    "chosen-versus-rejected gap relative to a fixed reference",
  ]) assert.ok(source.handoffs.includes(phrase), phrase);
});

test("advanced lessons branch by goal instead of inventing a linear dependency", () => {
  assert.match(source.courseView, /const showSpecializationChooser = isSpecializationEntry \|\| isWorldModelSpecializationBranch \|\| isLlmSpecializationBranch/);
  assert.match(source.courseView, /worldModelAdvancedBranchIds[\s\S]*\.filter\(\(id\) => id !== lesson\.id\)/);
  assert.match(source.courseView, /Advanced is a branch, not a ladder/);
  assert.match(source.courseView, /Choose the specialization that serves your goal\./);
  assert.match(source.courseView, /Synthesize after one branch/);
  assert.match(source.courseView, /Open the research capstone/);
  assert.match(source.courseView, /aria-label="Advanced specialization navigation"/);
  assert.match(source.courseView, /openLesson\(course\.sharedCoreLessonId\)/);
  const branchArray = source.continuity.slice(source.continuity.indexOf("export const worldModelAdvancedBranchIds"), source.continuity.indexOf("] as const;"));
  assert.equal((branchArray.match(/^  "[^"]+",$/gm) ?? []).length, 5);
  assert.doesNotMatch(branchArray, /world-model-research-capstone/);
  assert.match(source.styles, /\.specialization-chooser\{/);
});

test("forty prediction-led code notebooks span all seven tracks", () => {
  const objectBody = source.codeExamples.slice(
    source.codeExamples.indexOf("export const lessonCodeExamples"),
    source.codeExamples.indexOf("export const codeExampleCount"),
  );
  const entries = [...objectBody.matchAll(/^  (?:(?:"[^"]+")|(?:[a-z][\w-]*)): \{$/gm)];
  assert.equal(entries.length, 40);

  for (const representative of [
    "introduction",
    "attention",
    "pretraining-overview",
    "sft",
    "decoding-sampling",
    "rag",
    "moe",
  ]) {
    assert.ok(objectBody.includes(`  "${representative}": {`) || objectBody.includes(`  ${representative}: {`), `missing ${representative} notebook`);
  }

  for (const field of ["title", "language", "setup", "predict", "code", "observe", "tryIt"]) {
    assert.equal((objectBody.match(new RegExp(`^    ${field}:`, "gm")) ?? []).length, 40, `${field} is not present for every notebook`);
  }
});

test("code notebooks are integrated, accessible, and safe on narrow screens", () => {
  assert.match(source.guideView, /lessonCodeExamples, type LessonCodeExample/);
  assert.match(source.guideView, /<pre tabIndex=\{0\}/);
  assert.match(source.guideView, /Predict before running/);
  assert.match(source.guideView, /Expected observation/);
  assert.match(source.guideView, /Change one thing/);
  assert.match(source.courseView, /codeExampleCount/);
  assert.match(source.styles, /\.code-walkthrough pre\{[^}]*overflow:auto/);
  assert.match(source.styles, /\.code-walkthrough>header,.code-prediction,.code-reflection\{grid-template-columns:1fr\}/);
});
