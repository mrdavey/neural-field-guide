"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { Lesson } from "./course-data";
import { buildCourseDiscussionPrompt, buildParagraphDiscussionPrompt } from "./llm-discussion-prompts";
import selectionStyles from "./llm-discussion-prompt.module.css";

type ParagraphSelection = {
  left: number;
  placement: "above" | "below";
  text: string;
  top: number;
};

function selectionElement(node: Node | null) {
  return node instanceof Element ? node : node?.parentElement ?? null;
}

function normalizeSelection(value: string) {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

async function copyToClipboard(value: string) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const fallback = document.createElement("textarea");
    fallback.value = value;
    fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed";
    fallback.style.opacity = "0";
    document.body.appendChild(fallback);
    fallback.select();
    const succeeded = document.execCommand("copy");
    fallback.remove();
    return succeeded;
  }
}

export function CourseDiscussionPrompt({ lesson, lessonById, subject = "large language models" }: { lesson: Lesson; lessonById: Record<string, Lesson>; subject?: string }) {
  const [copied, setCopied] = useState(false);
  const discussionRef = useRef<HTMLElement>(null);
  const resetTimer = useRef<number | undefined>(undefined);
  const prerequisiteTitles = useMemo(() => lesson.prerequisites?.map((id) => lessonById[id].title) ?? [], [lesson.prerequisites, lessonById]);
  const prompt = useMemo(() => buildCourseDiscussionPrompt({ lesson, lessonById, subject }), [lesson, lessonById, subject]);

  useEffect(() => () => {
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
  }, []);

  const copyPrompt = async () => {
    const succeeded = await copyToClipboard(prompt);
    setCopied(succeeded);
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    if (succeeded) resetTimer.current = window.setTimeout(() => setCopied(false), 2400);
  };

  return <section ref={discussionRef} className="llm-discussion" data-llm-selection="disabled" aria-labelledby={`llm-discussion-${lesson.id}`}>
    <div className="llm-discussion-intro">
      <span className="eyebrow">Continue the conversation</span>
      <h2 id={`llm-discussion-${lesson.id}`}>Continue the inquiry with an optional AI tutor.</h2>
      <p>The required lesson is complete without an external service. If you use one, copy this context, replace the final placeholder with your question, and check its answer against the lesson evidence. While reading, you can also select text within any paragraph and choose <strong>Copy for an LLM</strong> (keyboard: Alt+Shift+C) to copy only that passage.</p>
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
    <ParagraphDiscussionPrompt discussionRef={discussionRef} />
  </section>;
}

export function ParagraphDiscussionPrompt({ discussionRef }: { discussionRef: RefObject<HTMLElement | null> }) {
  const [paragraphSelection, setParagraphSelection] = useState<ParagraphSelection>();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const resetTimer = useRef<number | undefined>(undefined);
  const selectedText = useRef("");

  const clearSelectionPrompt = useCallback(() => {
    selectedText.current = "";
    setParagraphSelection(undefined);
    setCopyState("idle");
  }, []);

  const updateSelectionPrompt = useCallback(() => {
    const selection = document.getSelection();
    const scope = discussionRef.current?.closest<HTMLElement>(".lesson-view");
    if (!selection || !scope || selection.isCollapsed || selection.rangeCount === 0) {
      clearSelectionPrompt();
      return;
    }

    const anchor = selectionElement(selection.anchorNode);
    const focus = selectionElement(selection.focusNode);
    const anchorParagraph = anchor?.closest("p");
    const focusParagraph = focus?.closest("p");
    const text = normalizeSelection(selection.toString());
    if (!anchorParagraph || anchorParagraph !== focusParagraph || !scope.contains(anchorParagraph) || anchorParagraph.closest('[data-llm-selection="disabled"]') || text.length < 2) {
      clearSelectionPrompt();
      return;
    }

    const range = selection.getRangeAt(0);
    const bounds = range.getBoundingClientRect();
    if (!bounds.width && !bounds.height) {
      clearSelectionPrompt();
      return;
    }

    const placement = bounds.top < 132 ? "below" : "above";
    const horizontalMargin = Math.min(132, Math.max(72, window.innerWidth / 2 - 12));
    const left = Math.min(window.innerWidth - horizontalMargin, Math.max(horizontalMargin, bounds.left + bounds.width / 2));
    const top = placement === "below" ? bounds.bottom + 10 : bounds.top - 10;
    if (selectedText.current !== text) setCopyState("idle");
    selectedText.current = text;
    setParagraphSelection({ left, placement, text, top });
  }, [clearSelectionPrompt, discussionRef]);

  const copyParagraphPrompt = useCallback(async () => {
    if (!paragraphSelection) return;
    const prompt = buildParagraphDiscussionPrompt(paragraphSelection.text);
    const succeeded = await copyToClipboard(prompt);
    setCopyState(succeeded ? "copied" : "failed");
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    if (succeeded) resetTimer.current = window.setTimeout(() => setCopyState("idle"), 2400);
  }, [paragraphSelection]);

  useEffect(() => {
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        document.getSelection()?.removeAllRanges();
        clearSelectionPrompt();
      } else if (paragraphSelection && event.altKey && event.shiftKey && event.code === "KeyC") {
        event.preventDefault();
        void copyParagraphPrompt();
      }
    };
    document.addEventListener("selectionchange", updateSelectionPrompt);
    document.addEventListener("keydown", dismissOnEscape);
    window.addEventListener("resize", updateSelectionPrompt);
    window.addEventListener("scroll", updateSelectionPrompt, true);
    return () => {
      document.removeEventListener("selectionchange", updateSelectionPrompt);
      document.removeEventListener("keydown", dismissOnEscape);
      window.removeEventListener("resize", updateSelectionPrompt);
      window.removeEventListener("scroll", updateSelectionPrompt, true);
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    };
  }, [clearSelectionPrompt, copyParagraphPrompt, paragraphSelection, updateSelectionPrompt]);

  return paragraphSelection && <div className={`${selectionStyles.popover} ${selectionStyles[copyState]}`} data-placement={paragraphSelection.placement} style={{ left: paragraphSelection.left, top: paragraphSelection.top }} role="toolbar" aria-label="Actions for selected lesson text">
      <button type="button" onPointerDown={(event) => event.preventDefault()} onClick={copyParagraphPrompt} aria-keyshortcuts="Alt+Shift+C" aria-label="Copy selected passage for an LLM">{copyState === "copied" ? "Copied ✓" : copyState === "failed" ? "Copy failed — try again" : "Copy for an LLM"}</button>
      <span className="sr-only" role="status" aria-live="polite">{copyState === "copied" ? "Selected passage copied. Paste it into an LLM and add your question." : copyState === "failed" ? "The selected passage could not be copied. Try again or use your browser copy command." : ""}</span>
    </div>;
}

export const LlmDiscussionPrompt = CourseDiscussionPrompt;
