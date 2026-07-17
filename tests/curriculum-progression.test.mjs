import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  course: "../app/course-data.ts",
  courseView: "../app/course-app.tsx",
  guideView: "../app/lesson-guide-view.tsx",
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
    "knowledge-bridge",
    "next-connection",
    "You already know",
    "You will reuse",
    "To learn",
  ]) {
    assert.ok(source.courseView.includes(phrase), `missing progression cue: ${phrase}`);
  }
  assert.match(source.courseView, /prerequisite\.keyIdeas\[0\]/);
  assert.match(source.courseView, /nextGuide\?\.objectives\[0\]/);
  assert.match(source.guideView, /aria-label="Lesson outcomes and checks"/);
  assert.doesNotMatch(source.guideView, /By the end, you can/);
  assert.doesNotMatch(source.courseView, /By the end, you can/);
});

test("advanced lessons branch by goal instead of inventing a linear dependency", () => {
  assert.match(source.courseView, /const specializationChoices = lesson\.track === course\.specializationTrackId/);
  assert.match(source.courseView, /Advanced is a branch, not a ladder/);
  assert.match(source.courseView, /Choose the specialization that serves your goal\./);
  assert.match(source.courseView, /aria-label="Advanced specialization navigation"/);
  assert.match(source.courseView, /openLesson\(course\.sharedCoreLessonId\)/);
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
