"use client";

import type { Lesson } from "./course-data";

export function LessonLab({ type }: { type: NonNullable<Lesson["lab"]>; lesson: Lesson }) {
  return <section className="lab-shell" data-lab={type}>
    <div className="lab-intro"><span className="eyebrow">Interactive lab</span><h2>Concept workbench</h2><p>Use the controls to change the system, observe the output, and connect cause to effect.</p></div>
    <div className="lab-placeholder"><span>LAB {type.toUpperCase()}</span><p>The instruments are being calibrated for this concept.</p></div>
  </section>;
}
