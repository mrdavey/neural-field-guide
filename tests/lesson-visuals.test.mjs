import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const cache = new Map();
const root = resolve(fileURLToPath(new URL("..", import.meta.url)));

function resolveTypeScriptModule(specifier, parentFile) {
  const candidate = resolve(dirname(parentFile), specifier);
  for (const path of [candidate, `${candidate}.ts`, join(candidate, "index.ts")]) {
    if (existsSync(path) && extname(path) === ".ts") return path;
  }
  throw new Error(`Cannot resolve ${specifier} from ${parentFile}`);
}

function loadTypeScriptModule(file) {
  const absolute = resolve(file);
  if (cache.has(absolute)) return cache.get(absolute).exports;
  const moduleRecord = { exports: {} };
  cache.set(absolute, moduleRecord);
  const javascript = ts.transpileModule(readFileSync(absolute, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: absolute,
  }).outputText;
  const localRequire = (specifier) => specifier.startsWith(".")
    ? loadTypeScriptModule(resolveTypeScriptModule(specifier, absolute))
    : require(specifier);
  Function("exports", "require", "module", "__filename", "__dirname", javascript)(moduleRecord.exports, localRequire, moduleRecord, absolute, dirname(absolute));
  return moduleRecord.exports;
}

const llm = loadTypeScriptModule(join(root, "app/course-data.ts"));
const worldmodel = loadTypeScriptModule(join(root, "app/world-models/index.ts"));
const generative = loadTypeScriptModule(join(root, "app/generative/index.ts"));
const rl = loadTypeScriptModule(join(root, "app/rl/index.ts"));
const embodied = loadTypeScriptModule(join(root, "app/embodied/index.ts"));
const clientManifest = JSON.parse(await readFile(join(root, "app/lesson-visual-manifest.json"), "utf8"));
const promptManifest = JSON.parse(await readFile(join(root, "docs/lesson-visual-prompts.json"), "utf8"));
const [courseApp, component, styles, atlas] = await Promise.all([
  readFile(join(root, "app/course-app.tsx"), "utf8"),
  readFile(join(root, "app/lesson-concept-plate.tsx"), "utf8"),
  readFile(join(root, "app/globals.css"), "utf8"),
  readFile(join(root, "docs/LESSON_VISUAL_ATLAS.md"), "utf8"),
]);

const canonicalCourses = {
  llm: llm.lessons,
  worldmodel: worldmodel.worldModelLessons,
  generative: generative.generativeLessons,
  rl: rl.rlLessons,
  embodied: embodied.embodiedLessons,
};
const canonicalKeys = Object.entries(canonicalCourses).flatMap(([courseId, lessons]) => lessons.map(({ id }) => `${courseId}:${id}`));
const canonicalLessonByKey = new Map(Object.entries(canonicalCourses).flatMap(([courseId, lessons]) => lessons.map((lesson) => [`${courseId}:${lesson.id}`, lesson])));

test("every one of the 182 released lessons owns exactly one static concept visual", () => {
  assert.equal(canonicalKeys.length, 182);
  assert.equal(clientManifest.length, 182);
  assert.deepEqual(clientManifest.map(({ courseId, lessonId }) => `${courseId}:${lessonId}`).sort(), canonicalKeys.sort());
  assert.equal(new Set(clientManifest.map(({ courseId, lessonId }) => `${courseId}:${lessonId}`)).size, 182);
  assert.deepEqual(Object.fromEntries(Object.keys(canonicalCourses).map((courseId) => [courseId, clientManifest.filter((visual) => visual.courseId === courseId).length])), {
    llm: 44,
    worldmodel: 46,
    generative: 30,
    rl: 32,
    embodied: 30,
  });
});

test("the completed visual mix is 130 generated rasters and 52 exact code-native diagrams", () => {
  assert.equal(clientManifest.filter(({ kind }) => kind === "raster").length, 130);
  assert.equal(clientManifest.filter(({ kind }) => kind === "deterministic").length, 52);
  assert.deepEqual(Object.fromEntries(Object.keys(canonicalCourses).map((courseId) => [courseId, [
    clientManifest.filter((visual) => visual.courseId === courseId && visual.kind === "raster").length,
    clientManifest.filter((visual) => visual.courseId === courseId && visual.kind === "deterministic").length,
  ]])), {
    llm: [29, 15],
    worldmodel: [34, 12],
    generative: [23, 7],
    rl: [20, 12],
    embodied: [24, 6],
  });

  for (const visual of clientManifest) {
    const key = `${visual.courseId}:${visual.lessonId}`;
    const lesson = canonicalLessonByKey.get(key);
    assert.ok(lesson?.simple.trim().length > 30, `${key} canonical concept explanation`);
    assert.equal(visual.labels.length, 4, `${visual.courseId}:${visual.lessonId} labels`);
    assert.equal(visual.stageDescriptions.length, 4, `${visual.courseId}:${visual.lessonId} descriptions`);
    assert.ok(!("learningQuestion" in visual), `${key} must not ship a generic learner-facing heading`);
    if (visual.kind === "raster") assert.match(visual.assetBase, new RegExp(`^lesson-visuals/${visual.courseId}/${visual.lessonId}$`));
    else assert.equal(visual.assetBase, null);
  }
});

test("prompt and provenance records preserve accuracy and evidence boundaries", () => {
  assert.equal(promptManifest.length, 182);
  for (const visual of promptManifest) {
    assert.ok(visual.depiction.length > 80, `${visual.courseId}:${visual.lessonId} depiction`);
    assert.ok(visual.alt.length > 50, `${visual.courseId}:${visual.lessonId} alt`);
    assert.ok(visual.longDescription.length > 140, `${visual.courseId}:${visual.lessonId} long description`);
    assert.ok(visual.boundary.length > 70, `${visual.courseId}:${visual.lessonId} boundary`);
    assert.match(visual.learningQuestion, /^What must happen between /, `${visual.courseId}:${visual.lessonId} historical generation question`);
    if (visual.kind === "raster") {
      assert.equal(visual.provenance.generator, "OpenAI built-in image generation");
      assert.equal(visual.provenance.status, "generated");
      assert.deepEqual(visual.provenance.outputs, [`${visual.assetBase}-1536.webp`, `${visual.assetBase}-768.webp`]);
      assert.match(visual.prompt, /no text, letters, numbers, equations, arrows, labels, logos, UI screenshots, or watermark/i);
    } else {
      assert.equal(visual.provenance.generator, "deterministic SVG/HTML");
      assert.equal(visual.provenance.status, "code-native");
    }
  }
});

test("the shared plate is accessible, responsive, and placed before the lesson scroll story", () => {
  assert.equal((courseApp.match(/<LessonConceptPlate /g) ?? []).length, 1);
  assert.match(courseApp, /<LessonNarrativeView[\s\S]*<LessonConceptPlate courseId=\{course\.id\} lesson=\{lesson\} heading=\{motionStory\.stages\[0\]\.title\} \/>[\s\S]*<ScrollStory[\s\S]{0,100}className="lesson-motion-story"/);
  assert.match(component, /publicPath\(`\$\{asset\}-768\.webp`\)/);
  assert.match(component, /publicPath\(`\$\{asset\}-1536\.webp`\)/);
  assert.match(component, /loading="lazy" decoding="async"/);
  assert.match(component, /<details className="lesson-visual-description">/);
  assert.match(component, /Concept in one view/);
  assert.match(component, /<MathText>\{heading\}<\/MathText>/);
  assert.doesNotMatch(component, /visual\.learningQuestion|What must happen between/);
  assert.match(component, /A useful mental model/);
  assert.match(component, /Important limit/);
  assert.match(component, /Read a text-only explanation/);
  assert.match(component, /visual\.stageDescriptions\.map/);
  assert.match(component, /Generated concept illustration · exact labels are code-rendered · not a measurement/);
  assert.match(component, /Deterministic SVG\/HTML diagram · exact labels, illustrative layout/);
  assert.match(styles, /@media\(max-width:780px\)[^{]*\{\.lesson-concept-plate/);
  assert.match(styles, /\.lesson-visual-exact\{[^}]*grid-template-columns:repeat\(4/);
  assert.match(styles, /\.lesson-visual-stage\{[^}]*grid-template-rows/);
});

test("the maintained atlas documents the all-at-once coverage and reproducible workflow", () => {
  assert.match(atlas, /all 182 released lessons/i);
  assert.match(atlas, /130 generated raster/i);
  assert.match(atlas, /52 deterministic SVG\/HTML/i);
  assert.match(atlas, /No pilot or separate review gate/i);
  assert.match(atlas, /process-lesson-visual\.mjs/);
  assert.match(atlas, /verify:lesson-visuals/);
});
