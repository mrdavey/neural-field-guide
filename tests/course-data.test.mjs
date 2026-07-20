import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../app/course-data.ts", import.meta.url), "utf8");

const expectedTopics = [
  "From Text to Tensors: Shapes & Matrix Multiplication", "Probability, Softmax & Cross-Entropy", "Neural Networks, Gradients & Backpropagation",
  "Introduction", "Tokenization", "The Embedding Layer", "Positional Encoding", "Attention",
  "Layers of Understanding", "Learning to Predict", "Bridge: From Base Model to Assistant", "GPT-2 → nanochat: Build the Stack",
  "Overview", "Training Objectives and Architectural Details", "Scaling Laws and Optimization",
  "Training Data Engineering", "Training Infrastructure and Systems", "Advanced Pretraining Objectives",
  "Evaluation During Pretraining", "Case Study — OLMo 3 Model Flow", "Overview", "Supervised Fine-Tuning",
  "Preference Optimization", "Tools and Safety Tuning", "Case Study — Tülu 3 → DR Tulu", "Distillation", "LoRA",
  "Mixture of Experts (MoE)", "Optimizers", "RL Fundamentals", "RLHF",
  "Decoding and Sampling", "The Generation Loop and KV Cache", "Quantization and Memory",
  "Serving: Batching, Throughput and Latency", "Reasoning and Test-Time Compute",
  "Prompting and Context Engineering", "Embeddings, Semantic Search and RAG", "Tool Use and Agent Loops",
  "LLM Evaluation and LLM-as-a-Judge", "Security, Privacy and Prompt Injection", "Production Observability, Cost and Governance",
  "Multimodal Language Models", "Interpretability and Model Editing"
];

test("curriculum models every supplied topic", () => {
  const lessonObjects = source.match(/id: "[^"]+", track:/g) ?? [];
  assert.equal(lessonObjects.length, expectedTopics.length);
  for (const title of expectedTopics) assert.ok(source.includes(`title: "${title}"`), `Missing ${title}`);
  assert.equal((source.match(/title: "Overview"/g) ?? []).length, 2);
  for (const track of ["foundations", "architecture", "pretraining", "posttraining", "inference", "applications", "advanced"]) {
    assert.ok(source.includes(`id: "${track}" as const`));
  }
});

test("every lesson follows the complete teaching schema", () => {
  for (const field of ["simple:", "deep:", "mentalModel:", "keyIdeas:", "example:", "misconception:", "quiz:"]) {
    assert.equal((source.match(new RegExp(`\\n    ${field}`, "g")) ?? []).length, expectedTopics.length, `${field} count`);
  }
  assert.equal((source.match(/quiz: \{ question:/g) ?? []).length, expectedTopics.length);
  assert.equal((source.match(/explanation: "/g) ?? []).length, expectedTopics.length);
});

test("the difficult concepts are wired to interactive labs", async () => {
  const labs = await readFile(new URL("../app/lesson-labs.tsx", import.meta.url), "utf8");
  for (const type of ["tensors", "softmax", "gradient", "tokens", "vectors", "positions", "attention", "prediction", "scaling", "optimizer", "preference", "lora", "moe", "distillation", "rl", "decoding", "kvcache", "quantization", "serving", "testtime", "context", "rag", "agents", "evaldesign", "security", "observability", "multimodal", "interpretability"]) {
    assert.ok(source.includes(`lab: "${type}"`), `Missing ${type} lesson wiring`);
    assert.ok(labs.includes(`${type}: { title:`), `Missing ${type} teaching metadata`);
  }
  assert.doesNotMatch(labs, /instruments are being calibrated|lab-placeholder/);
});

test("mastery system covers every lesson and capstone", async () => {
  const app = await readFile(new URL("../app/course-app.tsx", import.meta.url), "utf8");
  const catalog = await readFile(new URL("../app/course-catalog.ts", import.meta.url), "utf8");
  assert.match(app, /STORAGE_KEY/);
  assert.match(app, /Reset course progress/);
  assert.match(app, /lesson\.quiz\.options/);
  assert.match(app, /lesson\.quiz\.explanation/);
  assert.match(app, /Record mastery/);
  assert.match(app, /quizPassed/);
  for (const capstone of ["gpt2-from-scratch", "olmo3-case-study", "tulu3-case-study"]) assert.match(catalog, new RegExp(`"${capstone}"`));
  assert.equal((source.match(/capstone: \{ question:/g) ?? []).length, 7);
});

test("capstone opening descriptions explain the project work", () => {
  for (const id of ["optimizers", "gpt2-from-scratch", "olmo3-case-study", "tulu3-case-study", "test-time-compute", "observability-governance", "interpretability-editing"]) {
    const start = source.indexOf(`id: "${id}"`);
    const end = source.indexOf("\n  },", start);
    const block = source.slice(start, end);
    assert.match(block, /simple: "In this capstone, you will/);
    assert.match(block, /deep: "The project/);
    assert.doesNotMatch(block, /better .* capstone|right transparent architecture target|clearest open general post-training recipe/i);
  }
});

test("lesson numbers and prerequisites form one valid learning path", () => {
  const headers = [...source.matchAll(/id: "([^"]+)", track: "([^"]+)", title: "([^"]+)", number: (\d+)/g)]
    .map((match) => ({ id: match[1], track: match[2], title: match[3], number: Number(match[4]), index: match.index }));
  assert.deepEqual([...headers].sort((a, b) => a.number - b.number).map((lesson) => lesson.number), Array.from({ length: expectedTopics.length }, (_, index) => index + 1));
  assert.equal(new Set(headers.map((lesson) => lesson.id)).size, headers.length, "lesson ids must be unique");
  assert.match(source, /export const lessons = lessonDefinitions\.sort\(\(a, b\) => a\.number - b\.number\)/, "learner-facing lessons must use canonical numeric order");
  for (let index = 0; index < headers.length; index++) {
    const lesson = headers[index];
    const block = source.slice(lesson.index, headers[index + 1]?.index ?? source.indexOf("\n];", lesson.index));
    const prerequisiteText = block.match(/prerequisites: \[([^\]]*)\]/)?.[1] ?? "";
    for (const prerequisite of [...prerequisiteText.matchAll(/"([^"]+)"/g)].map((match) => match[1])) {
      const parent = headers.find((candidate) => candidate.id === prerequisite);
      assert.ok(parent, `${lesson.id} references missing prerequisite ${prerequisite}`);
      assert.ok(parent.number < lesson.number, `${lesson.id} prerequisite ${prerequisite} must occur earlier`);
    }
  }
});

test("source links and interactive lab dispatch are complete", async () => {
  const labs = await readFile(new URL("../app/lesson-labs.tsx", import.meta.url), "utf8");
  const wired = new Set([...source.matchAll(/lab: "([^"]+)"/g)].map((match) => match[1]));
  for (const lab of wired) {
    assert.ok(labs.includes(`${lab}: { title:`), `Missing metadata for ${lab}`);
    assert.ok(labs.includes(`case "${lab}":`), `Missing render dispatch for ${lab}`);
  }
  for (const url of [...source.matchAll(/url: "([^"]+)"/g)].map((match) => match[1])) assert.match(url, /^https:\/\//);
});

test("each core section ends with its synthesis case study", () => {
  const headers = [...source.matchAll(/id: "([^"]+)", track: "([^"]+)", title: "([^"]+)", number: (\d+)/g)]
    .map((match) => ({ id: match[1], track: match[2], number: Number(match[4]) }));
  for (const [track, capstone] of [["architecture", "gpt2-from-scratch"], ["pretraining", "olmo3-case-study"], ["posttraining", "tulu3-case-study"]]) {
    const trackLessons = headers.filter((lesson) => lesson.track === track);
    const last = trackLessons.sort((a, b) => b.number - a.number)[0];
    assert.equal(last.id, capstone, `${track} should culminate in ${capstone}`);
  }
});
