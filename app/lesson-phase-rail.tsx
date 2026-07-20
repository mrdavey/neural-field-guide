"use client";

import { useEffect, useState } from "react";

const lessonPhases = [
  { id: "orient", label: "Orient" },
  { id: "learn", label: "Learn" },
  { id: "try", label: "Try" },
  { id: "test", label: "Test" },
  { id: "extend", label: "Extend" },
] as const;

type LessonPhaseId = (typeof lessonPhases)[number]["id"];

export function LessonPhaseRail({ lessonId }: { lessonId: string }) {
  const [active, setActive] = useState<LessonPhaseId>("orient");

  const moveToPhase = (phase: LessonPhaseId) => {
    const target = document.getElementById(`lesson-phase-${phase}`);
    if (!target) return;
    const hash = `#lesson-phase-${phase}`;
    if (window.location.hash !== hash) window.history.pushState(null, "", hash);
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
    setActive(phase);
  };

  useEffect(() => {
    const targets = lessonPhases
      .map((phase) => document.getElementById(`lesson-phase-${phase.id}`))
      .filter((target): target is HTMLElement => Boolean(target));
    if (targets.length !== lessonPhases.length) return;

    const syncActivePhase = () => {
      const boundary = Math.min(168, window.innerHeight * .24);
      const target = targets.reduce((current, candidate) =>
        candidate.getBoundingClientRect().top <= boundary ? candidate : current, targets[0]);
      const phase = target.dataset.lessonPhase as LessonPhaseId | undefined;
      if (phase) setActive(phase);
    };

    const requestedPhase = lessonPhases.find((phase) => window.location.hash === `#lesson-phase-${phase.id}`);
    let frame = window.requestAnimationFrame(() => {
      if (requestedPhase) {
        document.getElementById(`lesson-phase-${requestedPhase.id}`)?.scrollIntoView({ behavior: "auto", block: "start" });
      }
      syncActivePhase();
    });
    const queueSync = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(syncActivePhase);
    };
    const observer = new IntersectionObserver(queueSync, { rootMargin: "-168px 0px -70% 0px", threshold: 0 });

    targets.forEach((target) => observer.observe(target));
    window.addEventListener("scroll", queueSync, { passive: true });
    window.addEventListener("resize", queueSync);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", queueSync);
      window.removeEventListener("resize", queueSync);
    };
  }, [lessonId]);

  return <nav className="lesson-phase-rail" aria-label="Lesson stages">
    <ol>{lessonPhases.map((phase, index) => <li key={phase.id}>
      <a
        href={`#lesson-phase-${phase.id}`}
        aria-current={active === phase.id ? "step" : undefined}
        onClick={(event) => {
          event.preventDefault();
          moveToPhase(phase.id);
        }}
      >
        <span>{String(index + 1).padStart(2, "0")}</span>
        <strong>{phase.label}</strong>
      </a>
    </li>)}</ol>
  </nav>;
}
