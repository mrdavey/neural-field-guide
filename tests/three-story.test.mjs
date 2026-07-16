import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  cappedThreePixelRatio,
  seededUnit,
  storySeed,
  threeConceptSemantics,
  threeConceptProfiles,
  threeStoryFrame,
  threeStoryConcepts,
  threeVisualGrammars,
} from "../app/three-story-math.ts";
import { lessonMotionStories } from "../app/lesson-motion.ts";

const [canvas, diagram, scrollStory, styles, pkg] = await Promise.all([
  readFile(new URL("../app/three-story-canvas.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/story-mechanism-diagram.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/scroll-story.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  readFile(new URL("../package.json", import.meta.url), "utf8"),
]);

test("all concept families have bounded 3D profiles", () => {
  assert.equal(threeStoryConcepts.length, 24);
  assert.deepEqual(Object.keys(threeConceptProfiles).sort(), [...threeStoryConcepts].sort());
  for (const concept of threeStoryConcepts) {
    const profile = threeConceptProfiles[concept];
    assert.ok(profile.pointCount >= 80 && profile.pointCount <= 128);
    assert.ok(profile.nodeStride >= 8);
  }
});

test("every concept has a distinct explanatory grammar and honest semantic contract", () => {
  assert.equal(threeVisualGrammars.length, 24);
  assert.deepEqual(Object.keys(threeConceptSemantics).sort(), [...threeStoryConcepts].sort());
  assert.equal(new Set(Object.values(threeConceptSemantics).map((item) => item.grammar)).size, 24);
  for (const concept of threeStoryConcepts) {
    const semantic = threeConceptSemantics[concept];
    assert.ok(threeVisualGrammars.includes(semantic.grammar), `${concept} grammar`);
    assert.ok(semantic.learningQuestion.endsWith("?"), `${concept} learning question`);
    assert.ok(semantic.represents.length >= 55, `${concept} representation`);
    assert.ok(semantic.boundary.length >= 55, `${concept} evidence boundary`);
    assert.match(diagram, new RegExp(`\\b${concept}: <`), `${concept} diagram`);
  }
});

test("every lesson has unique educational motion copy and an explicit concept", () => {
  assert.equal(Object.keys(lessonMotionStories).length, 44);
  const titles = [];
  for (const [lessonId, story] of Object.entries(lessonMotionStories)) {
    assert.ok(threeStoryConcepts.includes(story.concept), `${lessonId} concept`);
    assert.equal(story.stages.length, 4, `${lessonId} stages`);
    assert.equal(new Set(story.stages.map((stage) => stage.label)).size, 4, `${lessonId} labels`);
    assert.ok(story.intro.length >= 100, `${lessonId} visual explanation`);
    titles.push(...story.stages.map((stage) => stage.title));
  }
  assert.equal(new Set(titles).size, titles.length);
  assert.deepEqual(lessonMotionStories["embedding-layer"].stages.map((stage) => stage.label), ["TOKEN ID", "ROW LOOKUP", "DENSE VECTOR", "LEARNED GEOMETRY"]);
  assert.equal(lessonMotionStories["embedding-layer"].concept, "embedding");
});

test("lesson variation and animation frames are deterministic and bounded", () => {
  const seed = storySeed("attention:TOKEN:STATE:ATTEND:LOGIT");
  assert.equal(storySeed("attention:TOKEN:STATE:ATTEND:LOGIT"), seed);
  assert.notEqual(storySeed("rlhf:PROMPT:CANDIDATES:SIGNAL:POLICY"), seed);
  assert.equal(seededUnit(seed, 7, 2), seededUnit(seed, 7, 2));
  assert.ok(seededUnit(seed, 7, 2) >= 0 && seededUnit(seed, 7, 2) <= 1);
  const start = threeStoryFrame("attention", -2, 0, 0, 0, 4);
  const end = threeStoryFrame("attention", 3, 0, 0, 0, 4);
  assert.equal(start.progress, 0);
  assert.equal(end.progress, 1);
  assert.equal(end.stagePosition, 3);
});

test("pixel ratio is capped for mobile and desktop performance", () => {
  assert.equal(cappedThreePixelRatio(3, 390), 1);
  assert.equal(cappedThreePixelRatio(3, 1440), 1.5);
  assert.equal(cappedThreePixelRatio(1, 1440), 1);
});

test("Three.js is progressively wired to every shared story with safe fallbacks", () => {
  assert.equal(JSON.parse(pkg).dependencies.three, "0.185.1");
  assert.match(canvas, /import\("three"\)/);
  assert.match(canvas, /import\("animejs\/adapters\/three"\)/);
  assert.match(canvas, /IntersectionObserver/);
  assert.match(canvas, /prefers-reduced-motion: reduce/);
  assert.match(canvas, /motionPreference\.addEventListener\("change"/);
  assert.match(canvas, /visibilityState !== "hidden"/);
  assert.match(canvas, /webglcontextlost/);
  assert.match(canvas, /pointsGeometry\.dispose\(\)/);
  assert.match(canvas, /renderer\.dispose\(\)/);
  assert.match(canvas, /pointerdown/);
  assert.match(scrollStory, /<ThreeStoryCanvas concept=\{concept\}/);
  assert.match(scrollStory, /<StoryMechanismDiagram concept=\{concept\} active=\{active\}/);
  assert.match(styles, /\.story-mechanism-diagram/);
  assert.match(styles, /\.story-mechanism-diagram~:is\(\.story-effects,\.story-lines,\.story-nodes,\.story-core\)\{display:none\}/);
  assert.match(scrollStory, /dispatchEvent\(new CustomEvent\(STORY_PROGRESS_EVENT/);
  assert.match(styles, /\.three-story-canvas\[data-state="ready"\]/);
  assert.match(styles, /@media\(prefers-reduced-motion:reduce\)[\s\S]*\.three-story-canvas\{display:none!important\}/);
});
