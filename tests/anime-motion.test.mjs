import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { threeStoryConcepts } from "../app/three-story-math.ts";
import {
  allLabMotionContracts,
  llmLabMotionContracts,
  llmLabMotionIds,
  motionStageTime,
  storyMotionContracts,
  worldModelLabMotionContracts,
  worldModelLabMotionIds,
} from "../app/motion/semantic-motion.ts";

const root = new URL("../", import.meta.url);
const files = Object.fromEntries(await Promise.all(Object.entries({
  pkg: "package.json",
  surface: "app/motion/motion-surface.tsx",
  reveal: "app/motion/motion-reveal.tsx",
  orchestrator: "app/motion/course-motion-orchestrator.tsx",
  timeline: "app/motion/story-timeline.ts",
  story: "app/scroll-story.tsx",
  three: "app/three-story-canvas.tsx",
  llmLabs: "app/lesson-labs.tsx",
  worldLabs: "app/world-models/labs.tsx",
  activity: "app/activity-info.tsx",
  guide: "app/lesson-guide-view.tsx",
  workshop: "app/fine-tuning-workshop.tsx",
  capstone: "app/capstone-project-view.tsx",
  styles: "app/learning-activities.css",
}).map(async ([key, path]) => [key, await readFile(new URL(path, root), "utf8")])));

test("Anime.js is pinned and every animation family has an explicit semantic contract", () => {
  assert.equal(JSON.parse(files.pkg).dependencies.animejs, "4.5.0");
  assert.equal(llmLabMotionIds.length, 34);
  assert.equal(worldModelLabMotionIds.length, 9);
  assert.deepEqual(Object.keys(llmLabMotionContracts).sort(), [...llmLabMotionIds].sort());
  assert.deepEqual(Object.keys(worldModelLabMotionContracts).sort(), [...worldModelLabMotionIds].sort());
  assert.deepEqual(Object.keys(allLabMotionContracts).sort(), [...llmLabMotionIds, ...worldModelLabMotionIds].sort());
  assert.deepEqual(Object.keys(storyMotionContracts).sort(), [...threeStoryConcepts].sort());

  for (const [id, contract] of Object.entries({ ...allLabMotionContracts, ...storyMotionContracts })) {
    assert.ok(contract.question.endsWith("?"), `${id}: learning question`);
    assert.ok(contract.targets.length > 4, `${id}: visible target`);
    assert.ok(contract.represents.length > 30, `${id}: representation`);
    assert.ok(contract.boundary.length > 30, `${id}: evidence boundary`);
  }
});

test("story timelines are scroll-seekable, reversible, and preserve reduced-motion output", () => {
  assert.match(files.timeline, /createTimeline\(\{ autoplay: false/);
  assert.match(files.timeline, /prefers-reduced-motion: reduce/);
  assert.match(files.timeline, /timeline\.seek/);
  assert.match(files.timeline, /timeline\.revert/);
  assert.match(files.story, /createStoryTimeline\(visual, concept, nodes\.length\)/);
  assert.match(files.story, /storyTimeline\?\.seek\(progress\)/);
  assert.match(files.story, /storyTimeline\?\.revert\(\)/);
  assert.equal(motionStageTime(-1, 4), 0);
  assert.equal(motionStageTime(.5, 4), 1500);
  assert.equal(motionStageTime(2, 4), 3000);
});

test("Three.js emphasis uses the Anime.js adapter without a duplicate pulse RAF", () => {
  assert.match(files.three, /import\("animejs\/adapters\/three"\)/);
  assert.match(files.three, /host\.dataset\.animator = "animejs-three-adapter"/);
  assert.match(files.three, /materialTimeline\.seek\(current\.progress \* materialTimeline\.duration, true\)/);
  assert.match(files.three, /pulseAnimation = animate\(pulseState/);
  assert.doesNotMatch(files.three, /requestAnimationFrame\(animatePulse\)/);
  assert.match(files.three, /materialTimeline\.revert\(\)/);
});

test("both courses and shared learning surfaces use scoped, state-driven motion", () => {
  assert.match(files.llmLabs, /<MotionSurface kind=\{type as LlmLabMotionId\}>/);
  assert.match(files.worldLabs, /<MotionSurface kind=\{type\} stateKey=\{`\$\{value\}:\$\{result\.meter\}`\}>/);
  assert.match(files.worldLabs, /data-visual-control=\{value\}/);
  assert.match(files.surface, /createScope/);
  assert.match(files.surface, /scope\.revert\(\)/);
  assert.match(files.surface, /prefers-reduced-motion: reduce/);
  assert.match(files.activity, /<MotionReveal stateKey="committed" className="activity-after-commit">/);
  assert.match(files.guide, /<MotionReveal as="ol" stateKey="worked-trace" className="guided-example-steps">/);
  assert.match(files.workshop, /<MotionReveal as="article" stateKey=\{activeStage\} className="runbook-stage">/);
  assert.match(files.capstone, /<MotionReveal stateKey=\{activeStage\} className="capstone-stage-panel">/);
  assert.match(files.orchestrator, /MutationObserver/);
  assert.match(files.orchestrator, /IntersectionObserver/);
  assert.match(files.orchestrator, /root\.dataset\.motionRuntime = motionPreference\.matches \? "static" : "animejs"/);
  assert.match(files.orchestrator, /motionPreference\.addEventListener\("change", syncMotionMode\)/);
  assert.match(files.surface, /window\.matchMedia\(REDUCED_MOTION_QUERY\)\.matches/);
  assert.match(files.reveal, /window\.matchMedia\(REDUCED_MOTION_QUERY\)\.matches/);
  assert.match(files.styles, /\.semantic-motion-surface/);
  assert.match(files.styles, /@media\(prefers-reduced-motion:reduce\)[^]*\.semantic-motion-surface>\.semantic-motion-sweep\{display:none\}/);
});
