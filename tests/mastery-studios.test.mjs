import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [studios, app, styles, grades] = await Promise.all([
  readFile(new URL("../app/mastery-studios.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/course-app.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  readFile(new URL("../COMPONENT_GRADES.md", import.meta.url), "utf8"),
]);

const targetIds = ["embedding-layer", "pretraining-overview", "data-engineering", "advanced-objectives", "instruction-tuning-rlhf", "posttraining-overview", "tools-safety"];

test("the audit grades every lesson and capstone independently", () => {
  const initial = grades.slice(grades.indexOf("### Lesson-by-lesson scores"), grades.indexOf("### Required changes"));
  assert.equal((initial.match(/^\| \d+ \|/gm) ?? []).length, 44);
  assert.equal((initial.match(/^\| (?:Optimizers|GPT-2|OLMo|Tülu|Test-time|Observability|Interpretability)/gm) ?? []).length, 7);
  for (const score of ["Embedding Layer — 94", "Training Data Engineering — 93", "Post-Training Overview — 93", "Tools and Safety Tuning — 94"]) {
    assert.ok(grades.includes(score), `missing initial diagnosis for ${score}`);
  }
});

test("the final re-grade keeps all 51 component scores at or above 95", () => {
  const final = grades.slice(grades.indexOf("### Final lesson scores"), grades.indexOf("### Rubric sub-scores for the seven changed lessons"));
  const scores = [...final.matchAll(/\*\*(\d+)\*\*/g)].map((match) => Number(match[1]));
  assert.equal(scores.length, 51, "44 lessons plus seven capstones need final scores");
  assert.ok(scores.every((score) => score >= 95), `final score below 95: ${Math.min(...scores)}`);
  assert.match(grades, /At or above 95:\*\* 51\/51 \(100%\)/);
  assert.match(grades, /Below 95:\*\* 0\/51/);
});

test("all seven sub-95 lessons receive a lazy-loaded decision studio", () => {
  assert.match(app, /lazy\(\(\) => import\("\.\/mastery-studios"\)\)/);
  assert.match(app, /masteryStudioLessons\.has\(lesson\.id\)/);
  assert.match(app, /<MasteryStudio lessonId=\{lesson\.id\}/);
  for (const id of targetIds) {
    assert.ok(app.includes(`"${id}"`), `missing app wiring for ${id}`);
    assert.ok(studios.includes(`case "${id}"`), `missing studio dispatch for ${id}`);
  }
  assert.equal((studios.match(/^      case "/gm) ?? []).length, 7);
});

test("the embedding studio distinguishes lookup, context, and visualization", () => {
  for (const phrase of ["token ID 314", "lookup [1.00, 0.00]", "context mixing", "cosine", "Contextual hidden states", "2-D plot"]) {
    assert.ok(studios.toLowerCase().includes(phrase.toLowerCase()), `missing embedding distinction: ${phrase}`);
  }
  assert.match(studios, /function cosine/);
  assert.match(studios, /Context contribution/);
});

test("the run planner checks token arithmetic, cadence, and complete recovery state", () => {
  for (const phrase of ["Global batch tokens", "Required optimizer steps", "Evaluate every N steps", "Checkpoint every N steps", "random-number state", "data-loader cursor", "optimizer + scheduler"]) {
    assert.ok(studios.includes(phrase), `missing run-planning contract: ${phrase}`);
  }
  assert.match(studios, /proposedSteps === requiredSteps/);
});

test("the corpus audit covers quality, rights, privacy, contamination, representation, and split leakage", () => {
  for (const phrase of ["Exact mirror", "near-duplicate", "API key", "license or permission", "benchmark overlap", "Swahili", "Source/document family", "Versioned data-card preview", "Before", "Provisional after", "Manifest rows", "Language coverage", "Domain categories", "pendingItems.length"]) {
    assert.match(studios, new RegExp(phrase, "i"), `missing corpus risk: ${phrase}`);
  }
  assert.equal((studios.match(/^  \{ id: "/gm) ?? []).length, 7);
});

test("objective, assistant, and post-training studios provide scenario-specific rationale feedback", () => {
  for (const phrase of ["Masked LM", "Span corruption", "FIM causal", "SFT demonstrations", "Verifiable-reward RL", "Runtime authorization", "Strict JSON", "Subjective house style", "Exact mathematics", "Open research", "Permission-sensitive tool"]) {
    assert.ok(studios.includes(phrase), `missing decision option: ${phrase}`);
  }
  assert.equal((studios.match(/title: "(?:Bidirectional representations|Text-to-text denoising|Code infilling)"/g) ?? []).length, 3);
  assert.equal((studios.match(/title: "(?:Strict JSON|Subjective house style|Exact mathematics|Open research|Permission-sensitive tool)"/g) ?? []).length, 5);
});

test("the safety trajectory covers both unsafe compliance and overblocking with an audit trail", () => {
  for (const phrase of ["Benign search", "Malformed call", "Injected document", "Over-refused action", "Consequential refund", "Runtime audit trace", "Cost:", "Recovery:"]) {
    assert.ok(studios.includes(phrase), `missing safety trajectory element: ${phrase}`);
  }
  assert.equal((studios.match(/title: "(?:Benign search|Malformed call|Injected document|Over-refused action|Consequential refund)"/g) ?? []).length, 5);
});

test("decision studios remain usable on narrow screens", () => {
  assert.match(styles, /@media\(max-width:780px\)\{\.mastery-studio/);
  assert.match(styles, /\.objective-matrix\{[^}]*overflow-x:auto/);
  assert.match(styles, /\.incident-layout>nav\{[^}]*overflow-x:auto/);
  assert.match(styles, /\.similarity-table\{overflow-x:auto/);
});
