"use client";

import { useEffect, useRef } from "react";
import { animate, createScope, stagger } from "animejs";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const landmarkSelector = ".hero-machine,.scroll-story,.lesson-concept-plate,.lab-shell,.lesson-evidence-lab,.technical-validation,.mastery-studio,.fine-tuning-workshop,.synthesis-map";
const feedbackSelector = "[role='status'],.item-feedback,.diagnostic-feedback,.transfer-feedback,.objective-check-answer,.guided-result,.code-reflection,.practice-diagnosis,.planner-readout,.exemplar-reveal,.reference-sections";

export function CourseMotionOrchestrator({ routeKey, completed }: { routeKey: string; completed: number }) {
  const hookRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const root = hookRef.current?.parentElement;
    if (!root) return;
    const motionPreference = window.matchMedia(REDUCED_MOTION_QUERY);
    const scope = createScope({ root, mediaQueries: { reduceMotion: REDUCED_MOTION_QUERY } });
    const syncMotionMode = () => { root.dataset.motionRuntime = motionPreference.matches ? "static" : "animejs"; };
    syncMotionMode();
    motionPreference.addEventListener("change", syncMotionMode);
    if (motionPreference.matches) return () => {
      motionPreference.removeEventListener("change", syncMotionMode);
      scope.revert();
    };

    const seen = new WeakSet<Element>();
    const reveal = (target: Element, feedback = false) => {
      if (seen.has(target)) return;
      seen.add(target);
      if (motionPreference.matches) return;
      scope.execute(() => animate(target, {
        opacity: [feedback ? .72 : .84, 1],
        y: [feedback ? 7 : 10, 0],
        scale: feedback ? [.985, 1] : [1, 1],
        duration: feedback ? 280 : 340,
        ease: "out(4)",
        composition: "replace",
      }));
    };

    const landmarks = Array.from(root.querySelectorAll(landmarkSelector));
    const intersection = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        intersection.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: .06 });
    landmarks.forEach((landmark) => intersection.observe(landmark));

    const mutation = new MutationObserver((records) => {
      records.flatMap((record) => Array.from(record.addedNodes)).forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches(feedbackSelector)) reveal(node, true);
        node.querySelectorAll(feedbackSelector).forEach((target) => reveal(target, true));
      });
    });
    mutation.observe(root, { childList: true, subtree: true });

    const routeTargets = root.querySelectorAll(".lesson-breadcrumb,.lesson-header,.hero-copy>*");
    if (routeTargets.length) scope.execute(() => animate(routeTargets, {
      opacity: [.78, 1],
      y: [9, 0],
      duration: 360,
      delay: stagger(30),
      ease: "out(4)",
      composition: "replace",
    }));

    return () => {
      intersection.disconnect();
      mutation.disconnect();
      motionPreference.removeEventListener("change", syncMotionMode);
      scope.revert();
    };
  }, [routeKey]);

  useEffect(() => {
    const root = hookRef.current?.parentElement;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = root.querySelectorAll(".progress-orbit,.top-progress strong");
    if (!targets.length) return;
    const animation = animate(targets, {
      scale: [.92, 1.06, 1],
      duration: 560,
      delay: stagger(55),
      ease: "out(4)",
      composition: "replace",
    });
    return () => { animation.revert(); };
  }, [completed]);

  return <span ref={hookRef} className="course-motion-hook" aria-hidden="true" />;
}
