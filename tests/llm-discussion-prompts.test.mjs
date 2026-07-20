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

test("paragraph discussion prompt adds concise lesson context around the hovered paragraph", () => {
  const paragraphText = "The softmax turns each row of scores into non-negative weights that sum to one.";
  const prompt = buildParagraphDiscussionPrompt({ lessonTitle: lesson.title, paragraphText, subject: "large language models" });

  assert.equal(prompt, [
    "I'm learning about “Attention” in a course about large language models.",
    `Here is an excerpt:\n\n${paragraphText}`,
    "Please help me understand this more.",
  ].join("\n\n"));
});

test("full discussion prompt retains the deeper lesson-wide context", () => {
  const prompt = buildCourseDiscussionPrompt({ lesson, lessonById });
  assert.match(prompt, /Important mechanisms and distinctions:\n- Queries score keys\.\n- Weights mix values\./);
  assert.match(prompt, /Misconception to avoid: Attention weights are not causal explanations\./);
  assert.match(prompt, /\[ADD YOUR QUESTION HERE\]/);
});
