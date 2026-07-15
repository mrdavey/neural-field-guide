import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const guidance = await readFile(new URL("../AGENTS.md", import.meta.url), "utf8");

test("agent guidance protects the complete learner-centered teaching contract", () => {
  for (const requirement of [
    "Beginner-first, never beginner-only",
    "Orient → Learn → Try → Test → Extend",
    "simple definition",
    "worked example",
    "beginner misconception",
    "Test transfer",
    "self-contained",
  ]) assert.ok(guidance.includes(requirement), `AGENTS.md is missing ${requirement}`);
});

test("agent guidance requires exact objective coverage and an independent semantic gate", () => {
  for (const requirement of [
    "Treat every sentence in “By the end of…” as a learning promise",
    "lessonObjectiveCoverage",
    "beginner-readable explanation",
    "precise causal mechanism",
    "concrete worked value/shape/token/trace/scenario",
    "specific retry route",
    "independent grader",
    "Structural tests alone cannot award that pass",
  ]) assert.ok(guidance.includes(requirement), `AGENTS.md is missing ${requirement}`);
});

test("agent guidance preserves evidence and execution honesty", () => {
  for (const requirement of [
    "Label evidence honestly",
    "Never fabricate citations",
    "deterministic teaching fixture",
    "browser simulation",
    "codeActivityGuidance",
    "pseudocode",
    "optional external",
  ]) assert.match(guidance, new RegExp(requirement, "i"));
});

test("agent guidance protects self-paced assessment, accessibility, and persistence", () => {
  for (const requirement of [
    "No teacher, external grader, API, or account",
    "hover, keyboard focus, and click/tap",
    "visible focus styles",
    "color alone",
    "reduced-motion",
    "localStorage",
    "persistent workspace prompt",
  ]) assert.match(guidance, new RegExp(requirement, "i"));
});

test("agent guidance rejects generic motion and requires concept-specific interaction review", () => {
  for (const requirement of [
    "learning question, not an animation technique",
    "Topic-colored particles, generic node graphs",
    "threeConceptSemantics",
    "Change → Observe → Explain",
    "single readable row flow",
    "Preserve meaning under WebGL failure and reduced motion",
    "docs/INTERACTION_AUDIT.md",
  ]) assert.ok(guidance.includes(requirement), `AGENTS.md is missing ${requirement}`);
});

test("agent guidance documents architecture, static hosting, and verification", () => {
  for (const requirement of [
    "npm run build",
    "npm run build:pages",
    "publicPath",
    "docs/GITHUB_PAGES.md",
    "npm run lint",
    "npm test",
    "EXPECTED_PAGES_BASE_PATH",
    "generated output",
  ]) assert.ok(guidance.includes(requirement), `AGENTS.md is missing ${requirement}`);
});
