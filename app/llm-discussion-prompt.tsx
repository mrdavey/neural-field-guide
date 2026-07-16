"use client";

import { useMemo, useRef, useState } from "react";
import type { Lesson } from "./course-data";

export function CourseDiscussionPrompt({ lesson, lessonById, subject = "large language models" }: { lesson: Lesson; lessonById: Record<string, Lesson>; subject?: string }) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);
  const prerequisiteTitles = useMemo(() => lesson.prerequisites?.map((id) => lessonById[id].title) ?? [], [lesson.prerequisites, lessonById]);
  const prompt = useMemo(() => [
    `I am studying “${lesson.title}” as part of a from-first-principles course on ${subject}.`,
    prerequisiteTitles.length ? `Prerequisite context I already have: ${prerequisiteTitles.join(", ")}.` : "This is an introductory topic, so define any technical term before relying on it.",
    `Working definition: ${lesson.simple}`,
    `Important mechanisms and distinctions:\n${lesson.keyIdeas.map((idea) => `- ${idea}`).join("\n")}`,
    "Help me connect the definition to a concrete mechanism and a changed example.",
    `Misconception to avoid: ${lesson.misconception}`,
    "Use this context without giving me a generic recap. Diagnose the exact gap in my question, explain it in plain language first, then give the precise mechanism, notation or shapes when useful, one worked example, one boundary case, and a short check question that tests whether I can transfer the idea. If my premise is wrong, correct it directly.",
    "My question or point of confusion:\n[ADD YOUR QUESTION HERE]",
  ].join("\n\n"), [lesson, prerequisiteTitles, subject]);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopied(false), 2400);
    } catch {
      const fallback = document.createElement("textarea");
      fallback.value = prompt;
      fallback.setAttribute("readonly", "");
      fallback.style.position = "fixed";
      fallback.style.opacity = "0";
      document.body.appendChild(fallback);
      fallback.select();
      const succeeded = document.execCommand("copy");
      fallback.remove();
      setCopied(succeeded);
    }
  };

  return <section className="llm-discussion" aria-labelledby={`llm-discussion-${lesson.id}`}>
    <div className="llm-discussion-intro">
      <span className="eyebrow">Continue the conversation</span>
      <h2 id={`llm-discussion-${lesson.id}`}>Continue the inquiry with an optional AI tutor.</h2>
      <p>The required lesson is complete without an external service. If you use one, copy this context, replace the final placeholder with your question, and check its answer against the lesson evidence.</p>
      <div className="prompt-context" aria-label="Prompt context included">
        <span>{prerequisiteTitles.length || 1} context layer{prerequisiteTitles.length === 1 ? "" : "s"}</span>
        <span>{lesson.keyIdeas.length} key distinctions</span>
        <span>worked explanation requested</span>
      </div>
    </div>
    <div className="prompt-console">
      <div className="prompt-console-bar"><span aria-hidden="true"><i /><i /><i /></span><strong>DISCUSSION PROMPT</strong></div>
      <textarea readOnly value={prompt} aria-label={`Copyable discussion prompt for ${lesson.title}`} rows={16} onFocus={(event) => event.currentTarget.select()} />
      <div className="prompt-console-actions">
        <span role="status" aria-live="polite">{copied ? "Prompt copied. Add your question at the end." : "The final line is ready for your question."}</span>
        <button type="button" onClick={copyPrompt} className={copied ? "copied" : ""}>{copied ? "Copied ✓" : "Copy prompt"}</button>
      </div>
    </div>
  </section>;
}

export const LlmDiscussionPrompt = CourseDiscussionPrompt;
