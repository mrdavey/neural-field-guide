"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { animate, createScope, stagger } from "animejs";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type MotionRevealProps = {
  children: ReactNode;
  stateKey: string | number | boolean;
  className?: string;
  effect?: "reveal" | "feedback" | "progress";
  ariaLive?: "polite" | "assertive";
  role?: "status";
  as?: "div" | "article" | "section" | "ol";
};

export function MotionReveal({ children, stateKey, className = "", effect = "reveal", ariaLive, role, as = "div" }: MotionRevealProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const setRoot = useCallback((node: HTMLElement | null) => { rootRef.current = node; }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const scope = createScope({ root, mediaQueries: { reduceMotion: REDUCED_MOTION_QUERY } });
    if (!window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      const targets = Array.from(root.children);
      scope.add(() => {
        animate(targets.length ? targets : root, {
          opacity: [.18, 1],
          y: effect === "progress" ? [0, 0] : [effect === "feedback" ? 8 : 16, 0],
          scale: effect === "progress" ? [.96, 1] : [1, 1],
          duration: effect === "feedback" ? 440 : 620,
          delay: stagger(38),
          ease: "out(4)",
          composition: "replace",
        });
      });
    }
    return () => scope.revert();
  }, [effect, stateKey]);

  const props = {
    ref: setRoot,
    className: `motion-reveal ${className}`.trim(),
    "data-motion-reveal": effect,
    "aria-live": ariaLive,
    role,
  };
  if (as === "article") return <article {...props}>{children}</article>;
  if (as === "section") return <section {...props}>{children}</section>;
  if (as === "ol") return <ol {...props}>{children}</ol>;
  return <div {...props}>{children}</div>;
}
