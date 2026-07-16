import { createTimeline, stagger, type Timeline } from "animejs";
import type { ThreeStoryConcept } from "../three-story-math";
import { motionStageTime, storyMotionContracts } from "./semantic-motion";

export const STORY_MOTION_PROGRESS_EVENT = "neural-field-guide:anime-story-progress";

export type StoryTimelineController = {
  seek: (progress: number) => void;
  revert: () => void;
  timeline: Timeline;
};

export function createStoryTimeline(root: HTMLElement, concept: ThreeStoryConcept, stageCount: number): StoryTimelineController | null {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.dataset.animeState = "static";
    return null;
  }

  const contract = storyMotionContracts[concept];
  const timeline = createTimeline({ autoplay: false, defaults: { ease: "out(4)" } });
  const allTargets = Array.from(root.querySelectorAll<SVGElement>(contract.targets));
  const laterTargets = contract.stages.slice(1).flatMap((selector) => Array.from(root.querySelectorAll<SVGElement>(selector)));

  if (allTargets.length) timeline.set(allTargets, { opacity: .16, scale: .92 }, 0);
  const firstTargets = Array.from(root.querySelectorAll<SVGElement>(contract.stages[0]));
  if (firstTargets.length) timeline.set(firstTargets, { opacity: 1, scale: 1 }, 0);
  if (laterTargets.length) timeline.set(laterTargets, { opacity: .16, scale: .92 }, 0);

  contract.stages.slice(1).forEach((selector, index) => {
    const targets = Array.from(root.querySelectorAll<SVGElement>(selector));
    if (!targets.length) return;
    timeline.add(targets, {
      opacity: 1,
      scale: 1,
      duration: 620,
      delay: stagger(34),
      ease: contract.effect === "snap" ? "outBack" : "out(4)",
    }, 360 + index * 1000);
  });

  const routes = Array.from(root.querySelectorAll<SVGElement>(contract.routes));
  if (routes.length) {
    timeline.add(routes, {
      opacity: [.22, 1],
      strokeDashoffset: [42, 0],
      duration: Math.max(900, (stageCount - 1) * 1000),
      delay: stagger(24),
      ease: "linear",
    }, 0);
  }

  root.dataset.animeState = "ready";
  root.dataset.motionQuestion = contract.question;
  root.dataset.motionBoundary = contract.boundary;

  const seek = (progress: number) => {
    const time = motionStageTime(progress, stageCount);
    timeline.seek(Math.min(timeline.duration, time), true);
    root.dispatchEvent(new CustomEvent(STORY_MOTION_PROGRESS_EVENT, { detail: { concept, progress, time } }));
  };

  seek(0);
  return { seek, timeline, revert: () => timeline.revert() };
}
