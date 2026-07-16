"use client";

import { useEffect, useRef } from "react";
import { animate, createScope, stagger } from "animejs";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const sectionSelector = ".home-view>section,.lesson-view>section,.lesson-view>aside,.lesson-view>.scroll-story";
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
        opacity: [.42, 1],
        y: [feedback ? 9 : 18, 0],
        scale: feedback ? [.985, 1] : [1, 1],
        duration: feedback ? 460 : 680,
        ease: "out(4)",
        composition: "replace",
      }));
    };

    const sections = Array.from(root.querySelectorAll(sectionSelector));
    const intersection = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        intersection.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: .06 });
    sections.forEach((section) => intersection.observe(section));

    const mutation = new MutationObserver((records) => {
      records.flatMap((record) => Array.from(record.addedNodes)).forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches(feedbackSelector)) reveal(node, true);
        node.querySelectorAll(feedbackSelector).forEach((target) => reveal(target, true));
      });
    });
    mutation.observe(root, { childList: true, subtree: true });

    const routeTargets = root.querySelectorAll(".lesson-breadcrumb,.lesson-header,.hero-copy>* ,.hero-machine>*");
    if (routeTargets.length) scope.execute(() => animate(routeTargets, {
      opacity: [.24, 1],
      y: [14, 0],
      duration: 620,
      delay: stagger(46),
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
