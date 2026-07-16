import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [app, activity, guide, objectiveCoverage, labs, evidence, validations, studios, workshop, capstone, discussion, scrollStory, motion, code, styles] = await Promise.all([
  readFile(new URL("../app/course-app.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/activity-info.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/lesson-guide-view.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/lesson-objective-coverage.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/lesson-labs.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/lesson-evidence-view.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/technical-validations.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/mastery-studios.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/fine-tuning-workshop.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/capstone-project-view.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/llm-discussion-prompt.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/scroll-story.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/lesson-motion.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/code-examples.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

const codeIds = [...code.matchAll(/^  (?:(?:"([^"]+)")|([a-z][\w-]*)): \{/gm)].map((match) => match[1] ?? match[2]).sort();
const guidanceBlock = activity.slice(activity.indexOf("export const codeActivityGuidance"), activity.indexOf("export const technicalActivityGuidance"));
const guidanceIds = [...guidanceBlock.matchAll(/^  (?:(?:"([^"]+)")|([a-z][\w-]*)): (?:run|adapt|pseudo)\(/gm)].map((match) => match[1] ?? match[2]).sort();

test("every code notebook has explicit run, adapt, or pseudocode guidance", () => {
  assert.equal(codeIds.length, 40);
  assert.deepEqual(guidanceIds, codeIds);
  assert.match(guide, /codeActivityGuidance\[lessonId\]/);
  assert.match(guide, /<ActivityInfo mode=\{codeGuidance\.mode\}/);
  assert.match(guide, /<details className="code-sample-disclosure"/);
});

test("all non-reading learning surfaces explain their execution mode", () => {
  assert.match(labs, /<ActivityInfo mode="simulated"/);
  assert.match(evidence, /<ActivityInfo mode="checked"/);
  assert.match(validations, /technicalActivityGuidance\[lessonId\]/);
  assert.equal((activity.match(/^  (?:(?:"(?:embedding-layer|pretraining-overview|advanced-objectives|instruction-tuning-rlhf|posttraining-overview)")|tokenization): \{ mode:/gm) ?? []).length, 6);
  assert.match(studios, /<ActivityInfo mode="simulated"/);
  assert.match(workshop, /mode="external"/);
  assert.match(workshop, /mode="simulated"/);
  assert.match(capstone, /<ActivityInfo mode="project"/);
  assert.match(app, /<ActivityInfo mode="checked" title="This quiz is graded locally"/);
});

test("instruction disclosure supports hover, keyboard, and click or tap", () => {
  for (const phrase of ["aria-expanded={pinned}", "aria-describedby={id}", "onClick={() => setPinned", "role=\"tooltip\""]) assert.ok(activity.includes(phrase), phrase);
  assert.match(styles, /\.activity-info:hover \.activity-info-popover/);
  assert.match(styles, /\.activity-info:focus-within \.activity-info-popover/);
  assert.match(styles, /\.activity-info\[data-pinned="true"\] \.activity-info-popover/);
  assert.match(styles, /\.activity-info-trigger:focus-visible/);
});

test("course selection sits in the left brand cluster", () => {
  const topbar = app.slice(app.indexOf('<header className="topbar">'), app.indexOf("</header>", app.indexOf('<header className="topbar">')));
  assert.match(topbar, /className="topbar-primary"[^]*className="brand"[^]*className="course-selector"/);
  assert.ok(topbar.indexOf('className="course-selector"') < topbar.indexOf('className="topbar-actions"'));
  assert.match(styles, /\.topbar-primary \{[^}]*display:flex[^}]*gap:20px/);
  assert.match(styles, /@media\(max-width:520px\)\{\.brand>span:last-child\{display:none\}/);
});

test("lesson order follows orient, learn, try, test, extend", () => {
  const lessonView = app.slice(app.indexOf("function LessonView"), app.indexOf("function SynthesisMap"));
  const positions = [
    lessonView.indexOf('className="definition-card"'),
    lessonView.indexOf("<LessonGuideView"),
    lessonView.indexOf("<LessonLab"),
    lessonView.indexOf("<LessonEvidenceView"),
    lessonView.indexOf("<TechnicalValidation"),
    lessonView.indexOf('className="knowledge-check"'),
    lessonView.indexOf("<LessonFurtherReading"),
  ];
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  assert.doesNotMatch(app, /One idea, five deliberate passes|lesson-route/);
});

test("content pages use readable single-column prose and generous spacing", () => {
  assert.match(styles, /\.chapter-narrative\{[^}]*grid-template-columns:1fr!important/);
  assert.match(styles, /\.walkthrough-steps\{[^}]*grid-template-columns:1fr!important/);
  assert.match(styles, /\.chapter-narrative p\{[^}]*font-size:1rem!important[^}]*line-height:1\.82!important/);
  assert.match(styles, /\.lab-shell,.lesson-evidence-lab,.technical-validation,.mastery-studio,.fine-tuning-workshop,.synthesis-map,.knowledge-check\{margin-top:96px!important/);
  assert.match(styles, /\.scroll-story-header\{[^}]*grid-template-columns:minmax\(0,1fr\)/);
  assert.match(styles, /\.lab-intro\{[^}]*grid-template-columns:minmax\(0,1fr\)!important/);
  assert.match(styles, /\.lab-intro \.lab-prompt\{[^}]*grid-template-columns:minmax\(96px,150px\) minmax\(0,680px\)/);
  assert.match(styles, /@media\(max-width:780px\)[\s\S]*\.llm-discussion\{margin:72px -8px 0\}/);
});

test("post-objective teaching connects outcomes to mechanisms and observable checks", () => {
  assert.match(guide, /className="objective-map"/);
  assert.match(guide, /lessonObjectiveCoverage\[lessonId\]/);
  assert.doesNotMatch(guide, /index % guide\.walkthrough\.length/);
  assert.match(guide, /className="objective-teaching-sequence"/);
  assert.match(guide, /className="objective-evidence"/);
  for (const phrase of ["Plain-language meaning", "How it works", "Worked trace", "Boundary or failure case", "Check this outcome", "Commit before comparison", "Expected reasoning", "Retry route"]) assert.ok(guide.includes(phrase), phrase);
  assert.equal((objectiveCoverage.match(/^    cover\(/gm) ?? []).length, 132);
  assert.match(styles, /\.objective-evidence button\{min-height:44px\}/);
  assert.doesNotMatch(guide, /Build the concept carefully|Follow the idea one step at a time/);
  assert.match(styles, /\.objective-map>li\{[^}]*grid-template-columns:48px minmax\(0,1fr\)/);
});

test("shared lesson surfaces use topic-specific headings instead of repeated filler", () => {
  for (const phrase of [
    "Hold the whole mechanism in one picture.",
    "Track the distinctions that control the result.",
    "Follow one concrete case from input to outcome.",
    "Separate the mechanism from a tempting misconception.",
    "Check your understanding",
    "Predict before you reveal",
    "Words you should now own",
    "See the same idea another way",
  ]) assert.ok(!`${app}\n${guide}`.includes(phrase), phrase);
  assert.match(app, /motionStory\.stages\[0\]\.title/);
  for (const phrase of [
    "By the end, you can…",
    "Commit your reasoning before comparing.",
    "Use each term precisely.",
    "Choose the answer your mechanism predicts.",
    "Trace the mechanism, then transfer it.",
  ]) assert.ok(`${app}\n${guide}\n${evidence}`.includes(phrase), phrase);
  for (const pattern of [
    /Test your model of \{lesson\.title\}/,
    /By the end of \{objectiveLessonTitle\}/,
    /Apply \{lessonTitle\} before/,
    /Use the language of \{lessonTitle\}/,
    /Use \{lesson\.title\}, then transfer/,
  ]) assert.doesNotMatch(`${app}\n${guide}\n${evidence}`, pattern);
  assert.match(motion, /"embedding-layer": motion\([\s\S]*"ROW LOOKUP"/);
});

test("scroll storytelling is wired across home, every lesson, and capstones", () => {
  const lessonView = app.slice(app.indexOf("function LessonView"), app.indexOf("function SynthesisMap"));
  assert.match(app, /className="home-scroll-story"/);
  assert.match(app, /steps=\{learningPhases\.map/);
  assert.match(lessonView, /className="lesson-motion-story"/);
  assert.match(lessonView, /scene=\{course\.id === "llm" \? lesson\.track as LlmTrackId : "pipeline"\}/);
  assert.match(lessonView, /concept=\{motionStory\.concept\}/);
  assert.match(lessonView, /motionStory\.stages\.map\(\(stage\) => stage\.label\)/);
  assert.doesNotMatch(lessonView, /className="lesson-grid"/);
  assert.match(capstone, /className="capstone-assembly"/);
  assert.match(capstone, /draft\.completedStages\.includes\(item\.id\)/);
});

test("scroll storytelling remains progressive, controllable, and motion-safe", () => {
  for (const phrase of ["requestAnimationFrame", "ResizeObserver", "{ passive: true }", "storyStagePosition(centers, anchor)", "activeStoryStage(stagePosition", "aria-pressed={index === active}", "scrollIntoView", "prefers-reduced-motion: reduce", "aria-hidden=\"true\""]) assert.ok(scrollStory.includes(phrase), phrase);
  assert.doesNotMatch(scrollStory, /IntersectionObserver/);
  assert.match(scrollStory, /<ThreeStoryCanvas concept=\{concept\}/);
  assert.match(scrollStory, /<StoryMechanismDiagram concept=\{concept\} active=\{active\}/);
  assert.match(scrollStory, /STORY_PROGRESS_EVENT/);
  assert.match(styles, /\.scroll-story-stage\{[^}]*position:sticky/);
  assert.match(styles, /@supports \(animation-timeline:view\(\)\)/);
  assert.match(styles, /@property --story-progress/);
  assert.match(styles, /animation-timeline:--story-journey/);
  assert.match(styles, /animation-timeline:view\(block\)/);
  assert.match(styles, /linear\(0,.36 16%/);
  assert.match(styles, /@media\(prefers-reduced-motion:reduce\)[\s\S]*\.story-particles/);
  assert.match(styles, /@media\(max-width:780px\)[\s\S]*\.scroll-story-stage\{[^}]*position:relative/);
});

test("course navigation uses progressive same-document view transitions", () => {
  for (const phrase of ["startViewTransition", "flushSync", "prefers-reduced-motion: reduce", "updateCourseView"]) assert.ok(app.includes(phrase), phrase);
  assert.match(styles, /view-transition-name:course-content/);
  assert.match(styles, /::view-transition-old\(course-content\)/);
  assert.match(styles, /::view-transition-new\(course-content\)/);
});

test("every lesson ends with a copyable context-rich optional AI discussion prompt", () => {
  const lessonView = app.slice(app.indexOf("function LessonView"), app.indexOf("function SynthesisMap"));
  assert.match(lessonView, /<CourseDiscussionPrompt lesson=\{lesson\} objectives=\{guide\?\.objectives\}/);
  assert.ok(lessonView.indexOf("<CourseDiscussionPrompt") > lessonView.indexOf("<LessonFurtherReading"));
  for (const phrase of ["Working definition", "Important mechanisms and distinctions", "Misconception to avoid", "[ADD YOUR QUESTION HERE]", "navigator.clipboard.writeText", "Copy prompt"]) assert.ok(discussion.includes(phrase), phrase);
  assert.match(discussion, /aria-live="polite"/);
});

test("all grading and project feedback is self-contained", () => {
  for (const phrase of ["No teacher, external grader, API, or account is involved", "There is nothing to submit and no external assessor is required", "No course assessment depends on the external run"]) assert.ok(activity.includes(phrase));
  assert.doesNotMatch(capstone, /What you will submit/);
  assert.match(capstone, /What you will produce/);
  assert.match(capstone, /Live artifact validation/);
  assert.match(capstone, /Worked reference evidence/);
  assert.match(capstone, /executed observations, deterministic fixtures, or planned null-measurement cells/);
  assert.match(guide, /Guided reflection, not a grade|mode="reflect"/);
  assert.match(app, /Try again/);
});

test("specialized instructions retain the baseline self-contained safeguard", () => {
  assert.match(activity, /requirements \? <>\{requirements\} <span>\{copy\.requirements\}<\/span><\/> : copy\.requirements/);
  assert.match(activity, /No course assessment depends on the external run/);
  assert.match(activity, /No teacher, external grader, API, or account is involved/);
});
