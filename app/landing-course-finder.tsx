"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

export type LandingCourseProfile = {
  id: string;
  title: string;
  goal: string;
  promise: string;
  description: string;
  lessons: number;
  hours: number;
  accent: string;
  href: string;
};

export function LandingCourseFinder({ profiles }: { profiles: LandingCourseProfile[] }) {
  const [selectedId, setSelectedId] = useState(profiles[0]?.id ?? "");
  const selected = profiles.find((profile) => profile.id === selectedId) ?? profiles[0];

  if (!selected) return null;

  return (
    <div className="landing-course-finder" style={{ "--landing-accent": selected.accent } as CSSProperties}>
      <div className="landing-finder-choices" role="group" aria-label="Choose the question that best matches your goal">
        {profiles.map((profile, index) => <button
          type="button"
          key={profile.id}
          aria-pressed={profile.id === selected.id}
          onClick={() => setSelectedId(profile.id)}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{profile.goal}</strong>
          <i aria-hidden="true">{profile.id === selected.id ? "●" : "○"}</i>
        </button>)}
      </div>
      <article className="landing-finder-result" aria-live="polite">
        <span>Recommended starting point</span>
        <h3>{selected.title}</h3>
        <blockquote>{selected.promise}</blockquote>
        <p>{selected.description}</p>
        <div><span><strong>{selected.lessons}</strong> lessons</span><span><strong>{selected.hours}</strong> hours</span></div>
        <a href={selected.href}>Enter the course <span aria-hidden="true">→</span></a>
      </article>
    </div>
  );
}
