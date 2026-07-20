import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { buildCoursePageReaderSnapshot } from "../scripts/course-page-reader-snapshot.mjs";

const [courseData, codeExamples, labs, handoffs, architecture] = await Promise.all([
  readFile(new URL("../app/course-data.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/code-examples.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/lesson-labs.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/lesson-narrative-handoffs.ts", import.meta.url), "utf8"),
  readFile(new URL("../docs/CURRICULUM_ARCHITECTURE.md", import.meta.url), "utf8"),
]);

const block = (snapshot, surface) => snapshot.blocks.find((item) => item.surface === surface);

test("Lesson 02 starts from the introduction's response-building model before introducing notation", () => {
  const introduction = buildCoursePageReaderSnapshot("llm", "introduction");
  const tensors = buildCoursePageReaderSnapshot("llm", "tensors-shapes");
  const opening = block(tensors, "lesson.openingExplanation").prose.join("\n");
  const objectives = block(tensors, "lesson.objectiveChecks").objectives;
  const visual = block(tensors, "lesson.visual");

  assert.equal(tensors.title, "From Text to Tensors: Shapes & Matrix Multiplication");
  assert.equal(tensors.context.prerequisites.internal[0].priorIdea, "A prompt supplies the task and context for a response built piece by piece");
  assert.match(tensors.context.nextUse, /Probability, Softmax & Cross-Entropy[\s\S]*Convert logits into probabilities/);
  assert.match(introduction.context.nextUse, /represent many text positions with tensors/);
  assert.match(block(introduction, "lesson.next").reuse, /response one piece at a time[\s\S]*numerical representation/);

  for (const phrase of [
    "The introduction said that an LLM builds a response one piece at a time",
    "A tensor is the container",
    "two prompts have already been divided into three text positions",
    "attention later mixes information among positions",
    "an MLP transforms features within each position",
    "output head",
    "not a detached mathematics detour",
  ]) assert.ok(opening.includes(phrase), phrase);

  assert.equal(objectives[0].objective, "Explain why LLMs represent many text positions with tensors and read their common shapes");
  const [commit, reveal, disclosure] = objectives[0].interactionSequence;
  assert.match(disclosure.mechanism, /prompt[\s\S]*position[\s\S]*feature[\s\S]*attention[\s\S]*MLP[\s\S]*output/);
  assert.match(disclosure.workedExample, /red[\s\S]*fox[\s\S]*\[1,2,3\]/);
  assert.match(disclosure.boundary, /tokenizer[\s\S]*does not by itself explain what a feature means or whether an output is true/i);
  assert.match(commit.prompt, /hidden-state shape[\s\S]*every axis[\s\S]*useful to an LLM/);
  assert.match(reveal.expectedReasoning, /\$X\[2,3,4\]\$[\s\S]*six current positions[\s\S]*attention, MLP, and output projections/);
  assert.match(reveal.retry, /Why a language model needs tensors at all[\s\S]*\[prompt, position, feature\]/);
  assert.deepEqual(visual.initiallyVisible.labels, ["TEXT POSITIONS", "HIDDEN FEATURES", "LEARNED PROJECTION", "NEXT LLM STATE"]);
  assert.match(visual.disclosureContent.stageDescriptions.at(-1).description, /attention, an MLP, or the output head/);

  const next = block(tensors, "lesson.next");
  assert.match(next.reuse, /\$X\[B,T,d\]\$[\s\S]*\$W\[d,V\]\$[\s\S]*logits[\s\S]*final \$V\$ axis/);
  const probability = buildCoursePageReaderSnapshot("llm", "probability-softmax");
  assert.match(probability.context.prerequisites.internal[0].priorIdea, /hidden states[\s\S]*raw vocabulary scores/);
  assert.match(block(probability, "lesson.openingExplanation").prose[0], /\$X\[B,T,d\]\$[\s\S]*\$W\[d,V\]\$[\s\S]*\$\[B,T,V\]\$[\s\S]*Softmax runs over the final \$V\$ axis/);
});

test("Lesson 02 practice and interaction keep the LLM application visible", () => {
  for (const phrase of [
    "Project an LLM hidden-state batch",
    "one feature vector per prompt position",
    "Attention, MLP, and output projections reuse this pattern",
  ]) assert.ok(codeExamples.includes(phrase), phrase);

  for (const phrase of [
    "LLM hidden-state shape tracer",
    "Prompts in batch",
    "Text positions per prompt",
    "Features per position",
    "one learned LLM projection",
  ]) assert.ok(labs.includes(phrase), phrase);

  assert.match(courseData, /Why does an LLM repeatedly multiply hidden states/);
  assert.match(courseData, /Attention, MLPs, and output projections reuse this pattern/);
});

test("all LLM track boundaries were reviewed and carry an honest relationship", () => {
  const seams = [
    { from: "optimizers", to: "tokenization", relationship: "new chapter thread", opening: /Neural networks operate on numbers/ },
    { from: "gpt2-from-scratch", to: "pretraining-overview", relationship: "direct reuse", reuse: /assembled decoder maps position IDs[\s\S]*pre-training/ },
    { from: "olmo3-case-study", to: "instruction-tuning-rlhf", relationship: "direct reuse", reuse: /base model[\s\S]*not yet been shaped into a dependable assistant policy/ },
    { from: "tulu3-case-study", to: "decoding-sampling", relationship: "new chapter thread", reuse: /runtime decoding[\s\S]*next-token scores/ },
    { from: "test-time-compute", to: "context-engineering", relationship: "direct reuse", reuse: /instructions and evidence enter that computation as context/ },
    { from: "observability-governance", to: "distillation", relationship: "new chapter thread", opening: /Response distillation generates prompts and teacher answers/ },
  ];

  for (const seam of seams) {
    const from = buildCoursePageReaderSnapshot("llm", seam.from);
    const next = block(from, "lesson.next");
    assert.equal(next.next.lessonId, seam.to, `${seam.from} next lesson`);
    assert.equal(next.relationship, seam.relationship, `${seam.from} relationship`);
    if (seam.reuse) assert.match(next.reuse, seam.reuse, `${seam.from} carry-forward result`);
    if (seam.opening) {
      const to = buildCoursePageReaderSnapshot("llm", seam.to);
      assert.match(block(to, "lesson.openingExplanation").prose.join("\n"), seam.opening, `${seam.to} opening context`);
    }
  }

  const posttrainingBridge = buildCoursePageReaderSnapshot("llm", "instruction-tuning-rlhf");
  assert.match(posttrainingBridge.context.prerequisites.internal[0].priorIdea, /auditable base continuation model[\s\S]*not yet a dependable assistant policy/);
  assert.match(block(posttrainingBridge, "lesson.openingExplanation").prose[0], /base model that assigns probabilities to plausible continuations[\s\S]*does not say which continuation should answer a request directly/);

  for (const phrase of [
    "Introduction → numerical foundations",
    "Numerical foundations → decoder architecture",
    "Decoder architecture → pre-training",
    "Pre-training → post-training",
    "Post-training → inference and serving",
    "Inference and serving → applications and reliability",
    "Applications and reliability → advanced branches",
  ]) assert.ok(architecture.includes(phrase), phrase);

  for (const id of ["introduction", "gpt2-from-scratch", "olmo3-case-study", "tulu3-case-study", "test-time-compute"]) {
    assert.ok(handoffs.includes(`"llm:${id}"`), `${id} authored handoff`);
  }
});
