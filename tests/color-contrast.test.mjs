import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [globalStyles, learningActivityStyles, contrastStyles, layout, catalog, llmData, worldModelData, researchCourseData, llmLabs, worldModelLabs, researchLabs] = await Promise.all([
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  readFile(new URL("../app/learning-activities.css", import.meta.url), "utf8"),
  readFile(new URL("../app/contrast.css", import.meta.url), "utf8"),
  readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/course-catalog.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/course-data.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/world-models/index.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/research-curriculum-manifests.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/lesson-labs.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/world-models/labs.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/research-courses/lab.tsx", import.meta.url), "utf8"),
]);
const styles = `${globalStyles}\n${learningActivityStyles}\n${contrastStyles}`;

const rgb = (hex) => [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));
const luminance = (hex) => rgb(hex).map((channel) => {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}).reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
const contrast = (foreground, background) => {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
};
const mix = (foreground, background, foregroundShare) => {
  const foregroundRgb = rgb(foreground);
  const backgroundRgb = rgb(background);
  return `#${foregroundRgb.map((channel, index) => Math.round(channel * foregroundShare + backgroundRgb[index] * (1 - foregroundShare)).toString(16).padStart(2, "0")).join("")}`;
};

test("light surfaces explicitly reset foregrounds inherited from dark teaching panels", () => {
  for (const selector of [
    ".prediction-commit",
    ".vector-map button",
    ".wm-lab-choices button",
    ".wm-lab-detail",
  ]) assert.match(styles, new RegExp(`[^}]*${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^}]*\\{[^}]*color:var\\(--ink\\)`), selector);
  assert.match(styles, /\.prompt-console-actions button[^}]*\{[^}]*color:var\(--ink\)/);
  assert.match(styles, /\.technical-validation>header \.eyebrow\{color:var\(--ink\)\}/);
  assert.match(styles, /\.prediction-diagnosis button,\.practice-diagnosis button\{color:var\(--ink\)\}/);
});

test("track accents have a separate AA text color on light course surfaces", () => {
  assert.match(styles, /\.lesson-view\{--muted:#555d6d;--track-text:color-mix\(in srgb,var\(--track\) 32%,var\(--ink\)\)\}/);
  const trackColors = [...new Set(`${llmData}\n${worldModelData}\n${researchCourseData}`.match(/color: "#[0-9a-f]{6}"/gi)?.map((entry) => entry.slice(8, -1).toLowerCase()))];
  assert.equal(trackColors.length, 14);
  for (const track of trackColors) {
    const textColor = mix(track, "#0b1020", 0.32);
    assert.ok(contrast(textColor, "#f3f0e8") >= 4.5, `${textColor} from ${track} must contrast with paper`);
    assert.ok(contrast(textColor, "#e8e4da") >= 4.5, `${textColor} from ${track} must contrast with cream`);
    assert.ok(contrast(textColor, "#ffd166") >= 4.5, `${textColor} from ${track} must contrast with yellow callouts`);
    assert.ok(contrast("#0b1020", track) >= 4.5, `ink must contrast with ${track} when the accent is a background`);
  }
});

test("course identity palettes keep ink readable on every accent and paper tint", () => {
  assert.match(globalStyles, /--course-accent-text:color-mix\(in srgb,var\(--course-accent\) 52%,var\(--ink\)\)/);
  const themes = [...catalog.matchAll(/theme: \{ accent: "(#[0-9a-f]{6})", secondary: "(#[0-9a-f]{6})", paperTint: "(#[0-9a-f]{6})"/gi)];
  assert.equal(themes.length, 5);
  for (const [, accent, secondary, paperTint] of themes) {
    assert.ok(contrast("#0b1020", accent) >= 4.5, `ink must contrast with course accent ${accent}`);
    assert.ok(contrast("#0b1020", secondary) >= 4.5, `ink must contrast with course secondary ${secondary}`);
    assert.ok(contrast("#0b1020", paperTint) >= 4.5, `ink must contrast with paper tint ${paperTint}`);
    assert.ok(contrast(mix(accent, "#0b1020", 0.52), "#f3f0e8") >= 4.5, `mixed accent text from ${accent} must contrast with paper`);
  }
});

test("interactive contrast safeguards load last and preserve disabled labels", () => {
  assert.ok(layout.indexOf('import "./learning-activities.css"') < layout.indexOf('import "./contrast.css"'), "contrast safeguards must load after component styles");
  assert.match(contrastStyles, /\.lesson-view button:disabled\{opacity:1\}/);
  const dimmedTextControls = [...styles.matchAll(/([^{}]*(?:button[^{}]*:disabled|button\.muted)[^{}]*)\{[^{}]*opacity:(?:0?\.)\d+/g)].map((match) => match[1].trim());
  assert.deepEqual(dimmedTextControls, [], `disabled or muted text controls must not reduce whole-control opacity: ${dimmedTextControls.join(", ")}`);
  assert.match(styles, /\.quiz-options button\.muted\{background:var\(--paper-2\);color:#555d6d\}/);
  assert.ok(contrast("#0b1020", "#ff8a5b") >= 4.5, "disabled accent actions retain readable ink labels");
  assert.ok(contrast("#ffffff", "#0b1020") >= 4.5, "disabled ink actions retain readable white labels");
  assert.ok(contrast("#555d6d", "#e8e4da") >= 4.5, "muted quiz options retain readable labels");
});

test("placeholders use explicit AA colors on light and dark editing surfaces", () => {
  assert.match(contrastStyles, /input::placeholder,textarea::placeholder\{color:#555d6d;opacity:1\}/);
  assert.match(contrastStyles, /\.search-box input::placeholder,[^}]*\.objective-evidence textarea::placeholder\{color:#aeb5c6;opacity:1\}/);
  for (const background of ["#fffdf7", "#fbfaf6", "#f3f0e8"]) {
    assert.ok(contrast("#555d6d", background) >= 4.5, `light-surface placeholder must contrast with ${background}`);
  }
  for (const background of ["#171d2e", "#151d30", "#182137", "#101729", "#10182a"]) {
    assert.ok(contrast("#aeb5c6", background) >= 4.5, `dark-surface placeholder must contrast with ${background}`);
  }
});

test("dark panels use readable companion colors for labels and secondary copy", () => {
  assert.match(styles, /\.machine-label,\.machine-row b,\.machine-output span\{color:#aeb5c6\}/);
  assert.match(styles, /\.capstone-artifact-checks article small\{color:#aeb5c6\}/);
  for (const background of ["#111827", "#11182a", "#16382f"]) {
    assert.ok(contrast("#aeb5c6", background) >= 4.5, `secondary dark-panel text must contrast with ${background}`);
  }
  assert.ok(contrast("#b7bfce", "#0b1020") >= 4.5, "dark-panel muted text must contrast with ink");
});

test("every interactive lab family shares an explicit dark/light color contract", () => {
  assert.match(llmLabs, /<section className="lab-shell" data-lab=\{type\}>/);
  assert.match(worldModelLabs, /<section\s+className="lab-shell world-model-lab"\s+data-lab=\{type\}/);
  assert.match(researchLabs, /<section className="lab-shell research-course-lab" data-lab="research">/);
  for (const token of ["--lab-surface:#13192a", "--lab-instrument:#0c1221", "--lab-panel:#182137", "--lab-control:#172035", "--lab-text:#f7f8fb", "--lab-muted:#b7bfce", "--lab-on-light:#0b1020", "--lab-accent-text:#0b1020"]) {
    assert.ok(globalStyles.includes(token), `missing shared lab token ${token}`);
  }
  assert.match(contrastStyles, /\.lab-shell \.lab-instrument\{[^}]*color:var\(--lab-text\)/);
  assert.match(contrastStyles, /:where\(\.lab-shell \.lab-instrument\) :where\(p,label,legend,small\)\{color:var\(--lab-muted\)\}/);
  assert.match(contrastStyles, /:where\(\.lab-shell \.lab-instrument button\)\{[^}]*color:var\(--lab-text\)/);
  assert.match(contrastStyles, /\.lab-shell :is\(\.learning-activity-contract,\.activity-prediction-gate,\.research-case-control\)\{color:var\(--lab-on-light\)\}/);
  assert.ok(contrast("#f7f8fb", "#0c1221") >= 4.5, "primary lab text must contrast with the instrument");
  assert.ok(contrast("#b7bfce", "#0c1221") >= 4.5, "secondary lab text must contrast with the instrument");
  assert.ok(contrast("#f7f8fb", "#172035") >= 4.5, "lab control text must contrast with controls");
  assert.ok(contrast("#ffffff", "#4a2028") >= 4.5, "risk-state text must contrast with its control");
});
