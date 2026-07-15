"use client";

import { useEffect } from "react";
import { publicPath } from "./public-path";
import type { CourseId } from "./course-catalog";

const LAST_COURSE_KEY = "neural-field-guide-last-course-v1";

export function CourseRootRedirect() {
  useEffect(() => {
    const saved = localStorage.getItem(LAST_COURSE_KEY);
    const course: CourseId = saved === "worldmodel" ? "worldmodel" : "llm";
    window.location.replace(publicPath(`/${course}/`));
  }, []);
  return <main className="route-forward" role="status"><p>Opening your course…</p><noscript><a href={publicPath("/llm/")}>Open the LLM course</a></noscript></main>;
}

export function LegacyLessonRedirect({ lessonId }: { lessonId: string }) {
  useEffect(() => {
    window.location.replace(publicPath(`/llm/${lessonId}/`));
  }, [lessonId]);
  return <main className="route-forward" role="status"><p>This lesson moved into the LLM course. Forwarding…</p><a href={publicPath(`/llm/${lessonId}/`)}>Continue to the canonical lesson URL</a></main>;
}

