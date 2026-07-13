import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../app/course-data.ts", import.meta.url), "utf8");

const expectedTopics = [
  "Introduction", "Tokenization", "The Embedding Layer", "Positional Encoding", "Attention",
  "Layers of Understanding", "Learning to Predict", "Instruction Tuning and RLHF", "GPT-2 from Scratch",
  "Overview", "Training Objectives and Architectural Details", "Scaling Laws and Optimization",
  "Training Data Engineering", "Training Infrastructure and Systems", "Advanced Pretraining Objectives",
  "Evaluation During Pretraining", "Case Study — LLaMA 3", "Supervised Fine-Tuning",
  "Preference Optimization", "Tools and Safety Tuning", "Case Study on Tulu 3", "Distillation", "LoRA",
  "Mixture of Experts (MoE)", "Optimizers", "RL Fundamentals", "RLHF"
];

test("curriculum models every supplied topic", () => {
  const lessonObjects = source.match(/id: "[^"]+", track:/g) ?? [];
  assert.equal(lessonObjects.length, 28);
  for (const title of expectedTopics) assert.ok(source.includes(`title: "${title}"`), `Missing ${title}`);
  assert.equal((source.match(/title: "Overview"/g) ?? []).length, 2);
  for (const track of ["architecture", "pretraining", "posttraining", "advanced"]) {
    assert.ok(source.includes(`track: "${track}"`));
  }
});

test("every lesson follows the complete teaching schema", () => {
  for (const field of ["simple:", "deep:", "mentalModel:", "keyIdeas:", "example:", "misconception:", "quiz:"]) {
    assert.equal((source.match(new RegExp(`\\n    ${field}`, "g")) ?? []).length, 28, `${field} count`);
  }
  assert.equal((source.match(/quiz: \{ question:/g) ?? []).length, 28);
  assert.equal((source.match(/explanation: "/g) ?? []).length, 28);
});
