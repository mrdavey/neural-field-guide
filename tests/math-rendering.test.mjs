import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  renderer: "../app/math-text.tsx",
  styles: "../app/globals.css",
  courseView: "../app/course-app.tsx",
  guideView: "../app/lesson-guide-view.tsx",
  capstoneView: "../app/capstone-project-view.tsx",
  labs: "../app/lesson-labs.tsx",
  course: "../app/course-data.ts",
  foundations: "../app/lesson-guides/foundations-architecture.ts",
  training: "../app/lesson-guides/training.ts",
  systems: "../app/lesson-guides/systems.ts",
  capstones: "../app/capstone-projects.ts",
};

const source = Object.fromEntries(await Promise.all(Object.entries(files).map(async ([key, path]) => [
  key,
  await readFile(new URL(path, import.meta.url), "utf8"),
])));

test("math renderer is local, semantic, accessible, and resilient", () => {
  for (const tag of ["math", "mrow", "mfrac", "msqrt", "msub", "msup", "msubsup"]) {
    assert.ok(source.renderer.includes(`"${tag}"`), `missing MathML ${tag}`);
  }
  assert.match(source.renderer, /aria-label/);
  assert.match(source.renderer, /splitMathText/);
  assert.match(source.renderer, /splitImplicitMath/);
  assert.match(source.renderer, /balanced/);
  assert.doesNotMatch(source.renderer + source.styles, /https?:\/\/|cdn|MathJax|katex/i);
});

test("every learner-facing content surface uses math-aware rendering", () => {
  for (const key of ["courseView", "guideView", "capstoneView"]) {
    assert.match(source[key], /import \{ MathText \}/, `${key} does not import MathText`);
    assert.match(source[key], /<MathText>/, `${key} does not render MathText`);
  }
  assert.match(source.labs, /import \{ MathExpression, MathText \}/);
  assert.ok((source.labs.match(/<MathExpression/g) ?? []).length >= 20, "interactive lab equations are under-covered");
});

test("curriculum explicitly covers representative mathematical notation", () => {
  const content = [source.course, source.foundations, source.training, source.systems, source.capstones].join("\n");
  for (const notation of [
    "\\\\frac",
    "\\\\sqrt",
    "\\\\sum",
    "\\\\nabla",
    "\\\\partial",
    "\\\\mathbb",
    "\\\\times",
    "\\\\operatorname",
    "[B,T,d]",
    "\\\\Delta W",
  ]) {
    assert.ok(content.includes(notation), `missing representative notation ${notation}`);
  }
  assert.ok((content.match(/\$\$/g) ?? []).length >= 20, "too few display-math delimiters");
  assert.ok((content.match(/(?<!\$)\$(?!\$)/g) ?? []).length >= 100, "too few inline-math delimiters");
});

test("math layout distinguishes inline and display notation and protects narrow screens", () => {
  assert.match(source.styles, /\.math-inline\{/);
  assert.match(source.styles, /\.math-display\{/);
  assert.match(source.styles, /overflow-x:auto/);
  assert.match(source.styles, /Cambria Math/);
  assert.match(source.styles, /vertical-align/);
});
