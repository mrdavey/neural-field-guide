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

test("the difficult concepts are wired to interactive labs", async () => {
  const labs = await readFile(new URL("../app/lesson-labs.tsx", import.meta.url), "utf8");
  for (const type of ["tokens", "vectors", "positions", "attention", "prediction", "scaling", "optimizer", "preference", "lora", "moe", "distillation", "rl"]) {
    assert.ok(source.includes(`lab: "${type}"`), `Missing ${type} lesson wiring`);
    assert.ok(labs.includes(`${type}: { title:`), `Missing ${type} teaching metadata`);
  }
  assert.doesNotMatch(labs, /instruments are being calibrated|lab-placeholder/);
});

test("mastery system covers every lesson and capstone", async () => {
  const app = await readFile(new URL("../app/course-app.tsx", import.meta.url), "utf8");
  assert.match(app, /STORAGE_KEY/);
  assert.match(app, /Reset course progress/);
  assert.match(app, /lesson\.quiz\.options/);
  assert.match(app, /lesson\.quiz\.explanation/);
  assert.match(app, /Record mastery/);
  assert.match(app, /quizPassed/);
  for (const capstone of ["gpt2-from-scratch", "llama3-case-study", "tulu3-case-study"]) assert.match(app, new RegExp(`"${capstone}"`));
});
