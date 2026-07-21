"use client";

import { useEffect } from "react";
import { publicPath } from "./public-path";

export function LegacyLessonRedirect({ lessonId }: { lessonId: string }) {
  useEffect(() => {
    window.location.replace(publicPath(`/llm/${lessonId}/`));
  }, [lessonId]);
  return <main className="route-forward" role="status"><p>This lesson moved into the LLM course. Forwarding…</p><a href={publicPath(`/llm/${lessonId}/`)}>Continue to the canonical lesson URL</a></main>;
}
