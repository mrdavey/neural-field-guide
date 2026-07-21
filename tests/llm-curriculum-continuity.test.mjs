import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { buildCoursePageReaderSnapshot, buildCoursePageReaderSnapshots } from "../scripts/course-page-reader-snapshot.mjs";

const [courseData, handoffs, architecture] = await Promise.all([
  readFile(new URL("../app/course-data.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/lesson-narrative-handoffs.ts", import.meta.url), "utf8"),
  readFile(new URL("../docs/CURRICULUM_ARCHITECTURE.md", import.meta.url), "utf8"),
]);

const block = (snapshot, surface) => snapshot.blocks.find((item) => item.surface === surface);
const llmLessons = buildCoursePageReaderSnapshots().filter((snapshot) => snapshot.courseId === "llm" && snapshot.pageType === "lesson");

test("the LLM opening teaches the visible text loop before the numerical toolkit", () => {
  assert.deepEqual(llmLessons.slice(0, 12).map((lesson) => lesson.id), [
    "introduction",
    "tokenization",
    "embedding-layer",
    "positional-encoding",
    "attention",
    "layers-of-understanding",
    "learning-to-predict",
    "tensors-shapes",
    "probability-softmax",
    "gradients-backprop",
    "optimizers",
    "gpt2-from-scratch",
  ]);
  assert.match(courseData, /title: "See how an LLM builds text"[\s\S]*range: "Lessons 1–7"/);
  assert.match(courseData, /title: "Explain how the loop learns"[\s\S]*range: "Lessons 8–12"/);
  assert.equal(block(buildCoursePageReaderSnapshot("llm", "introduction"), "lesson.next").next.lessonId, "tokenization");
  assert.equal(block(buildCoursePageReaderSnapshot("llm", "learning-to-predict"), "lesson.next").next.lessonId, "tensors-shapes");
});

test("the tensors lesson is operation-led and keeps its complete mathematics after mastery", () => {
  const tensors = buildCoursePageReaderSnapshot("llm", "tensors-shapes");
  assert.equal(tensors.title, "How Models Carry and Transform Representations");
  assert.equal(tensors.context.prerequisites.internal[0].lessonId, "learning-to-predict");
  assert.doesNotMatch(JSON.stringify(tensors.blocks.slice(0, block(tensors, "lesson.completion").order)), /\$|\\frac|\\times/);
  assert.equal(block(tensors, "lesson.coreOperationCheck").checks.length, 1);
  assert.equal("objective" in block(tensors, "lesson.coreOperationCheck").checks[0], false);
  const completionOrder = block(tensors, "lesson.completion").order;
  const technical = block(tensors, "lesson.technicalDepth");
  assert.ok(technical.order > completionOrder);
  assert.equal(technical.initiallyCollapsed, true);
  assert.equal(technical.completionImpact, "none");
  assert.equal(block(tensors, "lesson.technicalDepth.objectiveChecks").objectives.length, 3);
  for (const surface of ["lesson.technicalDepth.code", "lesson.technicalDepth.lab", "lesson.technicalDepth.transfer"]) {
    assert.ok(block(tensors, surface).order > completionOrder, surface);
  }
});

test("the reordered LLM phases preserve the later course seams", () => {
  const seams = [
    { from: "learning-to-predict", to: "tensors-shapes", relationship: "direct reuse" },
    { from: "gpt2-from-scratch", to: "pretraining-overview", relationship: "direct reuse" },
    { from: "olmo3-case-study", to: "instruction-tuning-rlhf", relationship: "direct reuse" },
    { from: "tulu3-case-study", to: "decoding-sampling", relationship: "new chapter thread" },
    { from: "test-time-compute", to: "context-engineering", relationship: "direct reuse" },
    { from: "observability-governance", to: "distillation", relationship: "new chapter thread" },
  ];

  for (const seam of seams) {
    const next = block(buildCoursePageReaderSnapshot("llm", seam.from), "lesson.next");
    assert.equal(next.next.lessonId, seam.to, `${seam.from} next lesson`);
    assert.equal(next.relationship, seam.relationship, `${seam.from} relationship`);
  }

  for (const phrase of [
    "Conceptual text loop → optional numerical foundations",
    "Numerical foundations → pre-training",
    "Pre-training → post-training",
    "Post-training → inference and serving",
    "Inference and serving → applications and reliability",
    "Applications and reliability → advanced branches",
  ]) assert.ok(architecture.includes(phrase), phrase);

  for (const id of ["introduction", "gpt2-from-scratch", "olmo3-case-study", "tulu3-case-study", "test-time-compute"]) {
    assert.ok(handoffs.includes(`"llm:${id}"`), `${id} authored handoff`);
  }
});
