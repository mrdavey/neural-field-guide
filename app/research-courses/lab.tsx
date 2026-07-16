"use client";

import { useState } from "react";
import { ActivityInfo, LearningActivityContract, PredictionGate } from "../activity-info";
import { MathText } from "../math-text";
import type { ResearchLabSpec } from "./types";

export function ResearchCourseLab({ lessonTitle, spec }: { lessonTitle: string; spec: ResearchLabSpec }) {
  const [choice, setChoice] = useState(0);
  const active = spec.cases[choice];
  return <section className="lab-shell research-course-lab" data-lab="research">
    <div className="lab-intro"><div><span className="eyebrow">Interactive mechanism lab</span><h2><MathText>{spec.title}</MathText></h2><ActivityInfo mode="simulated" /></div></div>
    <LearningActivityContract question={<MathText>{spec.question}</MathText>} action={<MathText>{spec.change}</MathText>} observe={<MathText>{spec.observe}</MathText>} explain={<MathText>{spec.explain}</MathText>} complete={<MathText>{spec.complete}</MathText>} boundary={<MathText>{spec.boundary}</MathText>} />
    <PredictionGate prompt={<><MathText>{spec.question}</MathText> Predict which case will produce the strongest diagnostic signal and explain the first causal step before revealing the cases.</>} onRevise={() => setChoice(0)}>
      <div className="research-case-control" role="group" aria-label={`${spec.controlLabel} for ${lessonTitle}`}>
        <span>{spec.controlLabel}</span>
        <div>{spec.cases.map((item, index) => <button type="button" key={item.label} className={choice === index ? "active" : ""} aria-pressed={choice === index} onClick={() => setChoice(index)}>{item.label}</button>)}</div>
      </div>
      <div className="research-case-readout" aria-live="polite">
        <div><span><MathText>{active.resultLabel}</MathText></span><strong><MathText>{active.resultValue}</MathText></strong></div>
        <meter min="0" max="100" value={active.meter}>{active.meter}%</meter>
        <p><MathText>{active.detail}</MathText></p>
      </div>
    </PredictionGate>
  </section>;
}
