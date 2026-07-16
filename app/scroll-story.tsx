"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { activeStoryStage, clampStoryValue, storyStagePosition } from "./scroll-story-progress";
import { STORY_PROGRESS_EVENT, ThreeStoryCanvas } from "./three-story-canvas";
import type { ThreeStoryConcept, ThreeStoryScene } from "./three-story-math";
import { StoryMechanismDiagram } from "./story-mechanism-diagram";
import { createStoryTimeline } from "./motion/story-timeline";

export type ScrollStoryScene = ThreeStoryScene;

export type ScrollStoryStep = {
  label: string;
  title: ReactNode;
  body: ReactNode;
  note?: ReactNode;
  signal?: string;
};

type ScrollStoryProps = {
  eyebrow: string;
  title: ReactNode;
  intro: ReactNode;
  scene: ScrollStoryScene;
  concept: ThreeStoryConcept;
  sceneLabels: string[];
  steps: ScrollStoryStep[];
  className?: string;
  chromeLabel?: string;
  canvasHint?: string | false;
};

export function ScrollStory({ eyebrow, title, intro, scene, concept, sceneLabels, steps, className = "", chromeLabel = "NEURAL FIELD GUIDE / LIVE TRACE", canvasHint }: ScrollStoryProps) {
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const visualRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const layout = layoutRef.current;
    const visual = visualRef.current;
    const nodes = stepRefs.current.filter((node): node is HTMLElement => Boolean(node));
    if (!layout || !visual || !nodes.length) return;

    let frame = 0;
    let previousStage = 0;
    const storyTimeline = createStoryTimeline(visual, concept, nodes.length);
    const nodeVisuals = Array.from(visual.querySelectorAll<HTMLElement>(".story-node"));
    const lineVisuals = Array.from(visual.querySelectorAll<HTMLElement>(".story-lines i"));
    const renderProgress = () => {
      frame = 0;
      const anchor = window.innerHeight * .5;
      const centers = nodes.map((node) => {
        const bounds = node.getBoundingClientRect();
        return bounds.top + bounds.height / 2;
      });
      const lastIndex = centers.length - 1;
      const stagePosition = storyStagePosition(centers, anchor);
      const progress = lastIndex > 0 ? clampStoryValue(stagePosition / lastIndex) : 0;
      const nextActive = activeStoryStage(stagePosition, centers.length);
      const direction = stagePosition >= previousStage ? "forward" : "backward";
      previousStage = stagePosition;

      visual.dataset.direction = direction;
      visual.style.setProperty("--story-progress", progress.toFixed(4));
      visual.style.setProperty("--story-shift", `${(progress * 100).toFixed(2)}%`);
      visual.style.setProperty("--story-turn", `${(progress * .72).toFixed(4)}turn`);
      visual.style.setProperty("--story-turn-reverse", `${(progress * -.72).toFixed(4)}turn`);
      visual.style.setProperty("--story-grid-x", `${(progress * -24).toFixed(2)}px`);
      visual.style.setProperty("--story-grid-y", `${(progress * 14).toFixed(2)}px`);
      visual.style.setProperty("--story-glow", `${(18 + progress * 34).toFixed(2)}%`);
      visual.style.setProperty("--story-wave-a", (.46 + Math.sin(progress * Math.PI * 3) * .24).toFixed(3));
      visual.style.setProperty("--story-wave-b", (.58 + Math.sin(progress * Math.PI * 3 + 1.9) * .26).toFixed(3));
      visual.style.setProperty("--story-wave-c", (.5 + Math.sin(progress * Math.PI * 3 + 3.8) * .22).toFixed(3));
      visual.style.setProperty("--story-pulse", (.84 + Math.sin(progress * Math.PI * 4) * .12).toFixed(3));
      visual.style.setProperty("--story-reveal", `${(12 + progress * 76).toFixed(2)}%`);
      storyTimeline?.seek(progress);
      visual.dispatchEvent(new CustomEvent(STORY_PROGRESS_EVENT, { detail: {
        progress,
        stagePosition,
        active: nextActive,
        stageCount: centers.length,
        direction,
      } }));

      nodeVisuals.forEach((node, index) => {
        const activation = clampStoryValue(1 - Math.abs(index - stagePosition));
        const past = index < stagePosition ? clampStoryValue((stagePosition - index) / Math.max(1, lastIndex)) : 0;
        node.style.setProperty("--node-opacity", (.24 + activation * .76 + past * .18).toFixed(3));
        node.style.setProperty("--node-y", `${(12 - activation * 24).toFixed(2)}px`);
        node.style.setProperty("--node-scale", (.86 + activation * .19 + past * .04).toFixed(3));
        node.style.setProperty("--node-halo", `${(activation * 12).toFixed(2)}px`);
      });

      lineVisuals.forEach((line, index) => {
        const activation = clampStoryValue(stagePosition - index);
        line.style.setProperty("--line-scale", activation.toFixed(3));
        line.style.setProperty("--line-opacity", (.18 + activation * .82).toFixed(3));
      });

      if (nextActive !== activeRef.current) {
        activeRef.current = nextActive;
        setActive(nextActive);
      }
    };

    const scheduleProgress = () => {
      if (!frame) frame = window.requestAnimationFrame(renderProgress);
    };

    const resizeObserver = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(scheduleProgress);
    resizeObserver?.observe(layout);
    nodes.forEach((node) => resizeObserver?.observe(node));
    window.addEventListener("scroll", scheduleProgress, { passive: true });
    window.addEventListener("resize", scheduleProgress, { passive: true });
    scheduleProgress();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      storyTimeline?.revert();
      window.removeEventListener("scroll", scheduleProgress);
      window.removeEventListener("resize", scheduleProgress);
    };
  }, [concept, steps.length]);

  const moveToStep = (index: number) => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    stepRefs.current[index]?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  };

  const activeStep = steps[active] ?? steps[0];

  return <section className={`scroll-story ${className}`.trim()} data-concept={concept} data-scene={scene} aria-labelledby={`scroll-story-${scene}-${steps.length}`}>
    <header className="scroll-story-header">
      <span className="eyebrow">{eyebrow}</span>
      <h2 id={`scroll-story-${scene}-${steps.length}`}>{title}</h2>
      <div className="scroll-story-intro">{intro}</div>
    </header>
    <div className="scroll-story-layout" ref={layoutRef}>
      <div className="scroll-story-stage">
        <div className="scroll-story-visual" data-active={active} ref={visualRef}>
          <div className="story-chrome"><span>{chromeLabel}</span><b>{String(active + 1).padStart(2, "0")} · {String(steps.length).padStart(2, "0")}</b></div>
          <div className="story-scene" aria-hidden="true">
            <div className="story-grid" />
            <ThreeStoryCanvas concept={concept} storyKey={`${eyebrow}:${sceneLabels.join(":")}`} stageCount={steps.length} hint={canvasHint} />
            <StoryMechanismDiagram concept={concept} active={active} />
            <div className="story-effects"><i /><i /><i /><b /><span /></div>
            <div className="story-particles">{Array.from({ length: 16 }, (_, index) => <i key={index} style={{
              "--particle-x": `${3 + index * 6}%`,
              "--particle-y": `${8 + index * 4.8}%`,
              "--particle-alt-y": `${78 - index * 3.2}%`,
              "--particle-duration": `${3.4 + index * .09}s`,
              "--particle-delay": `${index * -.16}s`,
              "--particle-opacity": .14 + index * .025,
              "--particle-opacity-low": (.14 + index * .025) * .55,
              "--particle-opacity-end": (.14 + index * .025) * .45,
              "--particle-dx": `${((index % 4) - 1.5) * 18}px`,
              "--particle-dy": `${-30 - (index % 5) * 10}px`,
            } as React.CSSProperties} />)}</div>
            <div className="story-lines">{sceneLabels.slice(0, -1).map((label, index) => <i key={`${label}-${index}`} />)}</div>
            <div className="story-nodes">{sceneLabels.map((label, index) => <i className={`story-node ${index === active ? "is-active" : ""} ${index < active ? "is-past" : ""}`} key={`${label}-${index}`} style={{ "--node": index } as React.CSSProperties}><span>{label}</span></i>)}</div>
            <div className="story-core"><span>{String(active + 1).padStart(2, "0")}</span><i /></div>
            <div className="story-signal"><span>{activeStep.signal ?? activeStep.label}</span><b>{sceneLabels[Math.min(active, sceneLabels.length - 1)]}</b></div>
          </div>
          <div className="story-stage-controls" role="group" aria-label="Scroll story stages">
            {steps.map((step, index) => <button key={`${step.label}-${index}`} className={index === active ? "active" : ""} aria-pressed={index === active} onClick={() => moveToStep(index)}><span>{String(index + 1).padStart(2, "0")}</span><b>{step.label}</b></button>)}
          </div>
        </div>
      </div>
      <div className="scroll-story-copy">
        {steps.map((step, index) => <article key={`${step.label}-${index}`} data-story-step={index} ref={(node) => { stepRefs.current[index] = node; }} className={index === active ? "active" : ""}>
          <span>{String(index + 1).padStart(2, "0")} / {step.label}</span>
          <h3>{step.title}</h3>
          <div className="story-step-body">{step.body}</div>
          {step.note && <div className="story-step-note">{step.note}</div>}
        </article>)}
      </div>
    </div>
  </section>;
}
