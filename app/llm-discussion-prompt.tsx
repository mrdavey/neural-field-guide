"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import type { Lesson } from "./course-data";
import { buildCourseDiscussionPrompt, buildParagraphDiscussionPrompt } from "./llm-discussion-prompts";
import selectionStyles from "./llm-discussion-prompt.module.css";

type ParagraphTarget = {
  left: number;
  placement: "above" | "below" | "margin";
  text: string;
  top: number;
};

function eventElement(target: EventTarget | null) {
  return target instanceof Element ? target : null;
}

function normalizeParagraphText(value: string) {
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

  return <section ref={discussionRef} className="llm-discussion" data-paragraph-copy="disabled" aria-labelledby={`llm-discussion-${lesson.id}`}>
    <div className="llm-discussion-intro">
      <span className="eyebrow">Continue the conversation</span>
      <h2 id={`llm-discussion-${lesson.id}`}>Continue the inquiry with an optional AI tutor.</h2>
      <p>The required lesson is complete without an external service. If you use one, copy this context, replace the final placeholder with your question, and check its answer against the lesson evidence. While reading, hover over any paragraph and choose <strong>Copy for LLM</strong> to copy the whole paragraph with a short lesson context. On touch, tap the paragraph first. Keyboard: Alt+Shift+C copies the visible paragraph nearest the middle of the screen.</p>
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
    <ParagraphDiscussionPrompt discussionRef={discussionRef} lessonTitle={lesson.title} subject={subject} />
  </section>;
}

export function ParagraphDiscussionPrompt({ discussionRef, lessonTitle, subject }: { discussionRef: RefObject<HTMLElement | null>; lessonTitle: string; subject: string }) {
  const [paragraphTarget, setParagraphTarget] = useState<ParagraphTarget>();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const activeParagraph = useRef<HTMLParagraphElement | null>(null);
  const dismissTimer = useRef<number | undefined>(undefined);
  const popoverRef = useRef<HTMLDivElement>(null);
  const resetTimer = useRef<number | undefined>(undefined);

  const cancelDismiss = useCallback(() => {
    if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
  }, []);

  const clearParagraphPrompt = useCallback(() => {
    cancelDismiss();
    activeParagraph.current = null;
    setParagraphTarget(undefined);
    setCopyState("idle");
  }, [cancelDismiss]);

  const paragraphFromTarget = useCallback((target: EventTarget | null, scope: HTMLElement) => {
    const paragraph = eventElement(target)?.closest<HTMLParagraphElement>("p");
    if (!paragraph || !scope.contains(paragraph) || paragraph.closest('[data-paragraph-copy="disabled"]')) return null;
    return normalizeParagraphText(paragraph.innerText).length > 1 ? paragraph : null;
  }, []);

  const showParagraphPrompt = useCallback((paragraph: HTMLParagraphElement) => {
    const bounds = paragraph.getBoundingClientRect();
    if (bounds.bottom < 68 || bounds.top > window.innerHeight || (!bounds.width && !bounds.height)) {
      clearParagraphPrompt();
      return;
    }

    cancelDismiss();
    const text = normalizeParagraphText(paragraph.innerText);
    const buttonWidth = 98;
    const gap = 8;
    const lessonBounds = paragraph.closest<HTMLElement>(".lesson-view")?.getBoundingClientRect();
    const reachesOuterReadingEdge = !lessonBounds || lessonBounds.right - bounds.right <= 160;
    const hasRightMargin = reachesOuterReadingEdge && bounds.right + gap + buttonWidth <= window.innerWidth - 2;
    const placement: ParagraphTarget["placement"] = hasRightMargin ? "margin" : bounds.top >= 124 ? "above" : "below";
    const left = hasRightMargin
      ? bounds.right + gap
      : Math.max(12, Math.min(bounds.right - buttonWidth, window.innerWidth - buttonWidth - 12));
    const top = placement === "margin"
      ? Math.max(76, Math.min(bounds.top, window.innerHeight - 48))
      : placement === "above" ? bounds.top - 8 : bounds.bottom + 8;
    if (activeParagraph.current !== paragraph) setCopyState("idle");
    activeParagraph.current = paragraph;
    setParagraphTarget({ left, placement, text, top });
  }, [cancelDismiss, clearParagraphPrompt]);

  const scheduleDismiss = useCallback(() => {
    cancelDismiss();
    dismissTimer.current = window.setTimeout(() => {
      if (!popoverRef.current?.contains(document.activeElement)) clearParagraphPrompt();
    }, 180);
  }, [cancelDismiss, clearParagraphPrompt]);

  const copyParagraphText = useCallback(async (text: string) => {
    const prompt = buildParagraphDiscussionPrompt({ lessonTitle, paragraphText: text, subject });
    const succeeded = await copyToClipboard(prompt);
    setCopyState(succeeded ? "copied" : "failed");
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    if (succeeded) resetTimer.current = window.setTimeout(() => setCopyState("idle"), 2400);
  }, [lessonTitle, subject]);

  const copyParagraphPrompt = useCallback(() => {
    if (paragraphTarget) void copyParagraphText(paragraphTarget.text);
  }, [copyParagraphText, paragraphTarget]);

  useEffect(() => {
    const scope = discussionRef.current?.closest<HTMLElement>(".lesson-view");
    if (!scope) return;

    const nearestVisibleParagraph = () => [...scope.querySelectorAll<HTMLParagraphElement>("p")]
      .filter((paragraph) => !paragraph.closest('[data-paragraph-copy="disabled"]') && normalizeParagraphText(paragraph.innerText).length > 1)
      .map((paragraph) => ({ paragraph, bounds: paragraph.getBoundingClientRect() }))
      .filter(({ bounds }) => bounds.bottom > 68 && bounds.top < window.innerHeight)
      .sort((a, b) => Math.abs((a.bounds.top + a.bounds.bottom) / 2 - window.innerHeight / 2) - Math.abs((b.bounds.top + b.bounds.bottom) / 2 - window.innerHeight / 2))[0]?.paragraph;
    const handleMouseOver = (event: MouseEvent) => {
      const paragraph = paragraphFromTarget(event.target, scope);
      if (paragraph) showParagraphPrompt(paragraph);
    };
    const handleMouseOut = (event: MouseEvent) => {
      if (popoverRef.current?.contains(event.relatedTarget as Node)) return;
      const fromParagraph = paragraphFromTarget(event.target, scope);
      const toParagraph = paragraphFromTarget(event.relatedTarget, scope);
      if (fromParagraph && fromParagraph !== toParagraph && activeParagraph.current === fromParagraph) scheduleDismiss();
    };
    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      const paragraph = paragraphFromTarget(event.target, scope);
      if (paragraph) showParagraphPrompt(paragraph);
    };
    const handleFocusIn = (event: FocusEvent) => {
      const paragraph = paragraphFromTarget(event.target, scope);
      if (paragraph) showParagraphPrompt(paragraph);
    };
    const handleFocusOut = (event: FocusEvent) => {
      const fromParagraph = paragraphFromTarget(event.target, scope);
      const toParagraph = paragraphFromTarget(event.relatedTarget, scope);
      if (fromParagraph && fromParagraph !== toParagraph) scheduleDismiss();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        clearParagraphPrompt();
      } else if (event.altKey && event.shiftKey && event.code === "KeyC") {
        event.preventDefault();
        const paragraph = activeParagraph.current ?? nearestVisibleParagraph();
        if (paragraph) {
          showParagraphPrompt(paragraph);
          void copyParagraphText(normalizeParagraphText(paragraph.innerText));
        }
      }
    };
    const reposition = () => {
      if (activeParagraph.current) showParagraphPrompt(activeParagraph.current);
    };
    scope.addEventListener("mouseover", handleMouseOver);
    scope.addEventListener("mouseout", handleMouseOut);
    scope.addEventListener("pointerup", handlePointerUp);
    scope.addEventListener("focusin", handleFocusIn);
    scope.addEventListener("focusout", handleFocusOut);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      scope.removeEventListener("mouseover", handleMouseOver);
      scope.removeEventListener("mouseout", handleMouseOut);
      scope.removeEventListener("pointerup", handlePointerUp);
      scope.removeEventListener("focusin", handleFocusIn);
      scope.removeEventListener("focusout", handleFocusOut);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
      if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    };
  }, [clearParagraphPrompt, copyParagraphText, discussionRef, paragraphFromTarget, scheduleDismiss, showParagraphPrompt]);

  if (!paragraphTarget || typeof document === "undefined") return null;

  return createPortal(<div ref={popoverRef} className={`${selectionStyles.popover} ${selectionStyles[copyState]}`} data-placement={paragraphTarget.placement} style={{ left: paragraphTarget.left, top: paragraphTarget.top }} role="toolbar" aria-label="Actions for this lesson paragraph" onPointerEnter={cancelDismiss} onPointerLeave={scheduleDismiss} onFocus={cancelDismiss} onBlur={scheduleDismiss}>
      <button type="button" onClick={copyParagraphPrompt} aria-keyshortcuts="Alt+Shift+C" aria-label="Copy this paragraph for an LLM">{copyState === "copied" ? "Copied ✓" : copyState === "failed" ? "Try again" : "Copy for LLM"}</button>
      <span className="sr-only" role="status" aria-live="polite">{copyState === "copied" ? "Paragraph and lesson context copied. Paste it into an LLM." : copyState === "failed" ? "The paragraph could not be copied. Try again or use your browser copy command." : ""}</span>
    </div>, document.body);
}

export const LlmDiscussionPrompt = CourseDiscussionPrompt;
