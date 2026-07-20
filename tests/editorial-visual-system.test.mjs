import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [
  packageJson,
  layout,
  styles,
  catalog,
  courseApp,
  guideView,
  evidenceView,
  phaseRail,
  motion,
  fingerprint,
  interactionAudit,
] = await Promise.all([
  readFile(new URL("../package.json", import.meta.url), "utf8"),
  readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  readFile(new URL("../app/course-catalog.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/course-app.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/lesson-guide-view.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/lesson-evidence-view.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/lesson-phase-rail.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/motion/course-motion-orchestrator.tsx", import.meta.url), "utf8"),
  readFile(new URL("../scripts/course-grade-fingerprint.mjs", import.meta.url), "utf8"),
  readFile(new URL("../docs/INTERACTION_AUDIT.md", import.meta.url), "utf8"),
]);

test("editorial fonts are pinned, self-hosted, and exposed through shared roles", () => {
  const manifest = JSON.parse(packageJson);
  assert.equal(manifest.dependencies["@fontsource-variable/fraunces"], "5.3.0");
  assert.equal(manifest.dependencies["@fontsource-variable/source-sans-3"], "5.3.0");
  for (const fontImport of [
    '@fontsource-variable/fraunces/wght.css',
    '@fontsource-variable/fraunces/wght-italic.css',
    '@fontsource-variable/source-sans-3/wght.css',
    '@fontsource-variable/source-sans-3/wght-italic.css',
  ]) assert.ok(layout.includes(fontImport), `missing local font import ${fontImport}`);
  assert.match(styles, /--font-display:"Fraunces Variable"/);
  assert.match(styles, /--font-body:"Source Sans 3 Variable"/);
  assert.match(styles, /body \{[^}]*font-family:var\(--font-body\)/);
  assert.doesNotMatch(`${styles}\n${layout}`, /font-geist|Georgia/);
});

test("five typed course themes drive unique palettes and code-native motifs", () => {
  assert.match(catalog, /export type CourseTheme = \{/);
  assert.match(catalog, /theme: CourseTheme;/);
  const themes = [...catalog.matchAll(/theme: \{ accent: "(#[0-9a-f]{6})", secondary: "(#[0-9a-f]{6})", paperTint: "(#[0-9a-f]{6})", motif: "([a-z-]+)" \}/gi)];
  assert.equal(themes.length, 5);
  assert.equal(new Set(themes.map((match) => match[1])).size, 5, "each course has a distinct primary accent");
  assert.deepEqual(new Set(themes.map((match) => match[4])), new Set(["token-grid", "trajectory", "distribution", "control-loop", "coordinate"]));
  assert.match(courseApp, /data-course=\{course\.id\}/);
  assert.match(courseApp, /data-course-motif=\{course\.theme\.motif\}/);
  for (const property of ["--course-accent", "--course-secondary", "--course-paper-tint"]) assert.ok(courseApp.includes(`"${property}"`));
  for (const motif of ["token-grid", "trajectory", "distribution", "control-loop", "coordinate"]) assert.ok(styles.includes(`[data-course-motif="${motif}"]`));
});

test("shared lesson renderers expose editorial tiers and meaning-labeled content forms", () => {
  for (const tier of ["narrative", "anchor", "practice", "support", "metadata"]) assert.ok(guideView.includes(`data-surface-tier="${tier}"`), `missing ${tier} surface tier`);
  for (const role of ["definition", "mechanism", "worked-case", "boundary", "evidence", "check", "practice"]) {
    assert.ok(`${guideView}\n${evidenceView}`.includes(`data-content-role="${role}"`), `missing ${role} content role`);
    assert.ok(styles.includes(`[data-content-role="${role}"]`), `missing ${role} visual grammar`);
  }
  assert.match(styles, /--measure-prose:72ch/);
  assert.match(styles, /--measure-narrow:62ch/);
});

test("every shared lesson exposes ordered, accessible phase navigation", () => {
  const declaredPhases = [...phaseRail.matchAll(/\{ id: "([a-z]+)", label: "([A-Za-z]+)" \}/g)].map((match) => match[1]);
  assert.deepEqual(declaredPhases, ["orient", "learn", "try", "test", "extend"]);
  assert.match(phaseRail, /<nav className="lesson-phase-rail" aria-label="Lesson stages">/);
  assert.match(phaseRail, /aria-current=\{active === phase\.id \? "step" : undefined\}/);
  assert.match(phaseRail, /href=\{`#lesson-phase-\$\{phase\.id\}`\}/);
  assert.match(phaseRail, /new IntersectionObserver/);
  assert.match(phaseRail, /window\.addEventListener\("scroll", queueSync, \{ passive: true \}\)/);
  assert.match(phaseRail, /window\.history\.pushState\(null, "", hash\)/);
  assert.match(phaseRail, /target\.scrollIntoView\(\{/);
  assert.match(phaseRail, /prefers-reduced-motion: reduce/);
  assert.match(phaseRail, /event\.preventDefault\(\)/);
  assert.match(phaseRail, /observer\.disconnect\(\)/);
  assert.match(courseApp, /id="lesson-phase-orient" data-lesson-phase="orient"/);
  assert.match(guideView, /id="lesson-phase-learn" data-lesson-phase="learn"/);
  assert.match(guideView, /id="lesson-phase-try" data-lesson-phase="try"/);
  assert.match(courseApp, /id="lesson-phase-test" data-lesson-phase="test"/);
  assert.match(courseApp, /id="lesson-phase-extend" data-lesson-phase="extend"/);
  assert.match(styles, /\.lesson-phase-rail a\[aria-current="step"\]/);
  assert.match(styles, /@media\(prefers-reduced-motion:reduce\)[\s\S]*\.lesson-phase-rail\{backdrop-filter:none\}/);
  assert.match(styles, /\.lesson-vocabulary\[data-surface-tier="support"\] dl\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important\}/);
  assert.match(styles, /\.lesson-vocabulary\[data-surface-tier="support"\]\{[^}]*grid-template-columns:minmax\(0,1fr\)!important/);
  assert.match(styles, /\.lesson-phase-rail ol\{min-width:360px\}/);
  assert.match(styles, /\.lesson-view button\{min-width:44px\}/);
});

test("motion emphasizes semantic landmarks without dimming the prose spine", () => {
  assert.match(motion, /const landmarkSelector = "\.hero-machine,\.scroll-story,\.lesson-concept-plate/);
  assert.doesNotMatch(motion, /\.home-view>section|\.lesson-view>section|sectionSelector/);
  assert.doesNotMatch(motion, /\.hero-machine>\*/);
  assert.match(motion, /duration: feedback \? 280 : 340/);
  assert.doesNotMatch(styles, /field-section-arrival|hero-arrival|machine-arrival/);
  assert.match(styles, /@keyframes course-content-in\{from\{opacity:\.86/);
  assert.match(interactionAudit, /Ordinary lesson prose is now fully legible on first paint/);
});

test("grade fingerprints cover every new shared learner-facing source", () => {
  for (const path of ["app/layout.tsx", "app/lesson-evidence-view.tsx", "app/lesson-phase-rail.tsx"]) assert.ok(fingerprint.includes(`"${path}"`), `fingerprint omits ${path}`);
});
