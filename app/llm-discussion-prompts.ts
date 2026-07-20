import type { Lesson } from "./course-data";

type DiscussionPromptInput = {
  lesson: Lesson;
  lessonById: Record<string, Lesson>;
  subject?: string;
};

type ParagraphDiscussionPromptInput = {
  lessonTitle: string;
  selectedText: string;
  subject?: string;
};

function prerequisiteContext(lesson: Lesson, lessonById: Record<string, Lesson>) {
  const prerequisiteTitles = lesson.prerequisites?.map((id) => lessonById[id]?.title).filter(Boolean) ?? [];
  return prerequisiteTitles.length
    ? `Prerequisite context I already have: ${prerequisiteTitles.join(", ")}.`
    : "This is an introductory topic, so define any technical term before relying on it.";
}

export function buildCourseDiscussionPrompt({ lesson, lessonById, subject = "large language models" }: DiscussionPromptInput) {
  return [
    `I am studying “${lesson.title}” as part of a from-first-principles course on ${subject}.`,
    prerequisiteContext(lesson, lessonById),
    `Working definition: ${lesson.simple}`,
    `Important mechanisms and distinctions:\n${lesson.keyIdeas.map((idea) => `- ${idea}`).join("\n")}`,
    "Help me connect the definition to a concrete mechanism and a changed example.",
    `Misconception to avoid: ${lesson.misconception}`,
    "Use this context without giving me a generic recap. Diagnose the exact gap in my question, explain it in plain language first, then give the precise mechanism, notation or shapes when useful, one worked example, one boundary case, and a short check question that tests whether I can transfer the idea. If my premise is wrong, correct it directly.",
    "My question or point of confusion:\n[ADD YOUR QUESTION HERE]",
  ].join("\n\n");
}

export function buildParagraphDiscussionPrompt({ lessonTitle, selectedText, subject = "large language models" }: ParagraphDiscussionPromptInput) {
  return [
    `I'm learning about “${lessonTitle}” in a course about ${subject}.`,
    `Here is an excerpt:\n\n${selectedText}`,
    "Please help me understand this more.",
  ].join("\n\n");
}
