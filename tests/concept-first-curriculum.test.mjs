import assert from "node:assert/strict";
import test from "node:test";

import { buildCoursePageReaderSnapshots } from "../scripts/course-page-reader-snapshot.mjs";

const lessons = buildCoursePageReaderSnapshots().filter((snapshot) => snapshot.pageType === "lesson");
const mathNotation = /(?:^|[^\\])\$(?!\d)|\\(?:frac|sqrt|log|sum|times|nabla|partial|operatorname|mathbb|mathcal|begin)|[A-Za-z][A-Za-z0-9_]*\s*=\s*[A-Za-z][A-Za-z0-9_]*(?:\s*[+*/^×−-])|[≈±]/i;
const block = (lesson, surface) => lesson.blocks.find((item) => item.surface === surface);

test("all 182 released lessons put notation, calculation, and code after core mastery", () => {
  assert.equal(lessons.length, 182);
  let optionalCodeCount = 0;
  for (const lesson of lessons) {
    const completion = block(lesson, "lesson.completion");
    const technical = block(lesson, "lesson.technicalDepth");
    assert.ok(completion, `${lesson.courseId}:${lesson.id} completion`);
    assert.ok(technical.order > completion.order, `${lesson.courseId}:${lesson.id} technical placement`);
    assert.equal(technical.initiallyCollapsed, true, `${lesson.courseId}:${lesson.id} collapsed`);
    assert.equal(technical.completionImpact, "none", `${lesson.courseId}:${lesson.id} non-gating`);
    assert.equal(block(lesson, "lesson.code"), undefined, `${lesson.courseId}:${lesson.id} no core code`);
    if (block(lesson, "lesson.technicalDepth.code")) {
      optionalCodeCount += 1;
      assert.ok(block(lesson, "lesson.technicalDepth.code").order > completion.order, `${lesson.courseId}:${lesson.id} optional code`);
    }

    const core = lesson.blocks.filter((item) => item.order <= completion.order);
    assert.doesNotMatch(JSON.stringify(core), mathNotation, `${lesson.courseId}:${lesson.id} formula-free core`);
    assert.doesNotMatch(JSON.stringify(core), /\b(?:a a|an an|the the|local change maps? (?:determinant|correction)|local volume corrections is|a local volume corrections|a triangular local change maps?)\b/i, `${lesson.courseId}:${lesson.id} readable transformed language`);
    if (block(lesson, "lesson.technicalDepth.objectiveChecks")) {
      assert.doesNotMatch(JSON.stringify(core), /The required path focuses on the causal operation|Read the example as a chain|the named (?:quantity|relationship|implementation detail)|the worked relationship/i, `${lesson.courseId}:${lesson.id} topic-specific core prose`);
    }
    assert.doesNotMatch(JSON.stringify(block(lesson, "lesson.quiz")), mathNotation, `${lesson.courseId}:${lesson.id} formula-free mastery quiz`);
    assert.doesNotMatch(block(lesson, "lesson.quiz").prose[0], /^(?:calculate|compute|derive|differentiate|solve)\b/i, `${lesson.courseId}:${lesson.id} explanation-led mastery quiz`);
    for (const item of lesson.blocks.filter((candidate) => candidate.surface.startsWith("lesson.technicalDepth."))) {
      assert.ok(item.order > completion.order, `${lesson.courseId}:${lesson.id}:${item.surface} follows mastery`);
    }
  }
  assert.equal(optionalCodeCount, 152, "every existing lesson notebook moved to optional technical depth");
});

test("all lessons expose one operation check before their original objectives", () => {
  const deferred = lessons.filter((lesson) => block(lesson, "lesson.technicalDepth.objectiveChecks"));
  assert.equal(deferred.length, 182, "the shared rule applies to every released lesson rather than a pilot subset");
  for (const lesson of deferred) {
    const coreChecks = block(lesson, "lesson.coreOperationCheck").checks;
    const deferredObjectives = block(lesson, "lesson.technicalDepth.objectiveChecks").objectives;
    assert.equal(coreChecks.length, 1, `${lesson.courseId}:${lesson.id} one concept check`);
    assert.equal("objective" in coreChecks[0], false, `${lesson.courseId}:${lesson.id} derived practice is not presented as an authored outcome`);
    assert.doesNotMatch(JSON.stringify(coreChecks), mathNotation, `${lesson.courseId}:${lesson.id} operation check`);
    assert.ok(deferredObjectives.length >= 1, `${lesson.courseId}:${lesson.id} original objectives retained`);
  }
});

test("every course opening delays its formal abstraction until the mechanism is visible", () => {
  const openings = {
    llm: ["introduction", "tokenization", "embedding-layer", "positional-encoding", "attention"],
    worldmodel: ["world-models", "sequential-state", "stochastic-futures", "rewards-returns-policies", "mdps-bellman"],
    generative: ["generation-as-distribution", "sampling-randomness", "likelihood-cross-entropy", "divergences-distance", "distribution-workbench-capstone"],
    rl: ["sequential-decision-systems", "partial-observation", "policies-occupancy", "mdps-rewards", "tabular-control-capstone"],
    embodied: ["embodied-task-contracts", "observation-action-spaces", "embodied-partial-observation", "coordinate-frames-time", "task-contract-capstone"],
  };
  for (const [courseId, expected] of Object.entries(openings)) {
    assert.deepEqual(lessons.filter((lesson) => lesson.courseId === courseId).slice(0, 5).map((lesson) => lesson.id), expected, courseId);
  }
});
