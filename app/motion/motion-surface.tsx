"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate, createScope, stagger, type Scope } from "animejs";
import { allLabMotionContracts, type LabMotionId, type MotionContract, type MotionEffect } from "./semantic-motion";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type MotionSurfaceProps = {
  kind: LabMotionId;
  children: ReactNode;
  stateKey?: string | number;
  className?: string;
};

const effectFrames: Record<MotionEffect, Record<string, unknown>> = {
  flow: { x: [-16, 0], opacity: [.34, 1], scale: [.96, 1] },
  mass: { y: [10, 0], opacity: [.3, 1], scaleY: [.72, 1] },
  orbit: { rotate: [-9, 0], opacity: [.38, 1], scale: [.9, 1] },
  route: { x: [-10, 0], y: [7, 0], opacity: [.28, 1] },
  snap: { scale: [.82, 1], opacity: [.3, 1] },
  gate: { x: [-14, 0], opacity: [.3, 1], scale: [.97, 1] },
  trace: { y: [14, 0], opacity: [.24, 1] },
  field: { scale: [.9, 1], opacity: [.26, 1] },
};

function playContract(scope: Scope, root: HTMLElement, contract: MotionContract, sweep: HTMLElement | null, reduceMotion: boolean) {
  if (reduceMotion) {
    root.dataset.motionState = "static";
    return;
  }

  root.dataset.motionState = "active";
  const targets = Array.from(root.querySelectorAll<HTMLElement | SVGElement>(contract.targets));
  const fallback = Array.from(root.querySelectorAll<HTMLElement>(".memory-ledger>div,.foundation-readouts>div,.decision-panel,.lab-readout,.wm-lab-readout"));
  const resolved = targets.length ? targets : fallback;

  scope.execute(() => {
    if (resolved.length) {
      animate(resolved, {
        ...effectFrames[contract.effect],
        duration: 620,
        delay: stagger(38, { from: "first" }),
        ease: "out(4)",
        composition: "replace",
      });
    }
    if (sweep) {
      animate(sweep, {
        x: ["-115%", "115%"],
        opacity: [0, .72, 0],
        duration: 780,
        ease: "inOut(3)",
        composition: "replace",
      });
    }
  });
}

export function MotionSurface({ kind, children, stateKey, className = "" }: MotionSurfaceProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const scopeRef = useRef<Scope | null>(null);
  const frameRef = useRef(0);
  const contract = allLabMotionContracts[kind];

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const scope = createScope({
      root,
      mediaQueries: { reduceMotion: REDUCED_MOTION_QUERY },
    });
    scopeRef.current = scope;
    const sweep = root.querySelector<HTMLElement>(".semantic-motion-sweep");

    const schedule = () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = 0;
        playContract(scope, root, contract, sweep, window.matchMedia(REDUCED_MOTION_QUERY).matches);
      });
    };

    const onInteraction = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.closest("button,input,select,summary,[role='button'],[role='tab']")) return;
      schedule();
    };

    root.addEventListener("input", onInteraction);
    root.addEventListener("change", onInteraction);
    root.addEventListener("click", onInteraction);
    schedule();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      root.removeEventListener("input", onInteraction);
      root.removeEventListener("change", onInteraction);
      root.removeEventListener("click", onInteraction);
      scope.revert();
      scopeRef.current = null;
    };
  }, [contract]);

  useEffect(() => {
    const root = rootRef.current;
    const scope = scopeRef.current;
    if (!root || !scope || stateKey === undefined) return;
    const sweep = root.querySelector<HTMLElement>(".semantic-motion-sweep");
    playContract(scope, root, contract, sweep, window.matchMedia(REDUCED_MOTION_QUERY).matches);
  }, [contract, stateKey]);

  return <div
    ref={rootRef}
    className={`semantic-motion-surface ${className}`.trim()}
    data-motion={kind}
    data-motion-effect={contract.effect}
    data-motion-question={contract.question}
    data-motion-representation={contract.represents}
    data-motion-boundary={contract.boundary}
  >
    <span className="semantic-motion-sweep" aria-hidden="true" />
    {children}
  </div>;
}
