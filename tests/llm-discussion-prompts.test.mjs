import assert from "node:assert/strict";
import test from "node:test";
import { buildCourseDiscussionPrompt, buildParagraphDiscussionPrompt } from "../app/llm-discussion-prompts.ts";

const prerequisite = { id: "tokens", title: "Tokens", prerequisites: [], simple: "Text is split into token units.", keyIdeas: [], misconception: "", quiz: { question: "", options: [], answer: 0, explanation: "" } };
const lesson = {
  id: "attention",
  title: "Attention",
  prerequisites: ["tokens"],
  simple: "Attention mixes token representations using data-dependent weights.",
  keyIdeas: ["Queries score keys.", "Weights mix values."],
  misconception: "Attention weights are not causal explanations.",
  quiz: { question: "", options: [], answer: 0, explanation: "" },
};
const lessonById = { tokens: prerequisite, attention: lesson };

test("paragraph discussion prompt is exactly the selected passage", () => {
  const selectedText = "The softmax turns each row of scores into non-negative weights that sum to one.";
  const prompt = buildParagraphDiscussionPrompt(selectedText);

  assert.equal(prompt, selectedText);
});

test("full discussion prompt retains the deeper lesson-wide context", () => {
  const prompt = buildCourseDiscussionPrompt({ lesson, lessonById });
  assert.match(prompt, /Important mechanisms and distinctions:\n- Queries score keys\.\n- Weights mix values\./);
  assert.match(prompt, /Misconception to avoid: Attention weights are not causal explanations\./);
  assert.match(prompt, /\[ADD YOUR QUESTION HERE\]/);
});
