"use client";

import { ActivityInfo, PredictionGate } from "./activity-info";
import type { CourseAlignment } from "./course-alignments";
import { courses } from "./course-catalog";
import { MathText } from "./math-text";
import { publicPath } from "./public-path";

export function CourseAlignmentBridge({ alignment }: { alignment: CourseAlignment }) {
  const released = (Object.values(courses) as Array<{ id: string; lessonById: Record<string, unknown> }>).find((course) => course.id === alignment.destination.courseId);
  const canOpen = Boolean(released?.lessonById[alignment.destination.lessonId]);

  return <section className="course-alignment-bridge" aria-labelledby={`course-alignment-${alignment.courseId}-${alignment.lessonId}`}>
    <header>
      <div><span className="eyebrow">Program bridge · {alignment.role === "canonical" ? "canonical mechanism" : "reinforcement"}</span><h2 id={`course-alignment-${alignment.courseId}-${alignment.lessonId}`}>Carry the mechanism forward without carrying the wrong claim.</h2></div>
      <ActivityInfo mode="reflect" title="This bridge is guided transfer practice" detail="Commit what you think transfers before revealing the program boundary and handoff artifact. Compare and revise; this is private and is not automatically graded." />
    </header>
    <PredictionGate prompt={<MathText>{alignment.prediction.prompt}</MathText>} commitLabel="Commit transfer prediction" reviseLabel="Revise transfer prediction">
      <div className="course-alignment-grid">
        <article><span>Mechanism that transfers</span><h3>{alignment.concept}</h3><p><MathText>{alignment.reuses}</MathText></p></article>
        <article className="course-alignment-boundary"><span>Ownership boundary</span><h3>Do not overgeneralize</h3><p><MathText>{alignment.boundary}</MathText></p></article>
        <article><span>Later build</span><h3>{alignment.destination.courseTitle}</h3><p><strong>{alignment.destination.lessonTitle}</strong></p>{canOpen ? <a href={publicPath(`/${alignment.destination.courseId}/${alignment.destination.lessonId}/`)}>Open the connected lesson <span aria-hidden="true">→</span></a> : <small>Activates when the complete {alignment.destination.courseTitle} course is released.</small>}</article>
        <article><span>Artifact handoff</span><h3>Preserve this evidence</h3><p><MathText>{alignment.artifact}</MathText></p></article>
      </div>
      <div className="course-alignment-reasoning">
        <div><span>Expected reasoning</span><p><MathText>{alignment.prediction.expected}</MathText></p></div>
        <div><span>Retry route</span><p><MathText>{alignment.prediction.retry}</MathText></p></div>
      </div>
    </PredictionGate>
  </section>;
}
