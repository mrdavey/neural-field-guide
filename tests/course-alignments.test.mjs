import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const cache = new Map();

function resolveTypeScriptModule(specifier, parentFile) {
  const candidate = resolve(dirname(parentFile), specifier);
  for (const path of [candidate, `${candidate}.ts`, join(candidate, "index.ts")]) if (existsSync(path) && extname(path) === ".ts") return path;
  throw new Error(`Cannot resolve ${specifier} from ${parentFile}`);
}

function loadTypeScriptModule(file) {
  const absolute = resolve(file);
  if (cache.has(absolute)) return cache.get(absolute).exports;
  const moduleRecord = { exports: {} };
  cache.set(absolute, moduleRecord);
  const javascript = ts.transpileModule(readFileSync(absolute, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }, fileName: absolute }).outputText;
  const localRequire = (specifier) => specifier.startsWith(".") ? loadTypeScriptModule(resolveTypeScriptModule(specifier, absolute)) : require(specifier);
  Function("exports", "require", "module", "__filename", "__dirname", javascript)(moduleRecord.exports, localRequire, moduleRecord, absolute, dirname(absolute));
  return moduleRecord.exports;
}

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const llm = loadTypeScriptModule(join(root, "app/course-data.ts"));
const world = loadTypeScriptModule(join(root, "app/world-models/index.ts"));
const planned = loadTypeScriptModule(join(root, "app/research-curriculum-manifests.ts"));
const alignments = loadTypeScriptModule(join(root, "app/course-alignments.ts"));
const appSource = readFileSync(join(root, "app/course-app.tsx"), "utf8");
const bridgeSource = readFileSync(join(root, "app/course-alignment-bridge.tsx"), "utf8");
const audit = readFileSync(join(root, "docs/INTERACTION_AUDIT.md"), "utf8");

test("selected released lessons have explicit and valid later-course handoffs", () => {
  const released = { llm: new Set(llm.lessons.map((lesson) => lesson.id)), worldmodel: new Set(world.worldModelLessons.map((lesson) => lesson.id)) };
  const seen = new Set();
  assert.ok(alignments.courseAlignments.length >= 20);
  for (const alignment of alignments.courseAlignments) {
    const key = `${alignment.courseId}:${alignment.lessonId}`;
    assert.ok(released[alignment.courseId].has(alignment.lessonId), `${key} released source`);
    assert.ok(!seen.has(key), `${key} duplicate`);
    seen.add(key);
    assert.ok(planned.plannedCourseManifests[alignment.destination.courseId].lessons.some((lesson) => lesson.id === alignment.destination.lessonId), `${key} destination`);
    for (const field of [alignment.reuses, alignment.boundary, alignment.artifact, alignment.prediction.prompt, alignment.prediction.expected, alignment.prediction.retry]) assert.ok(field.trim().length >= 60, `${key} needs authored transfer reasoning`);
  }
  assert.ok(alignments.courseAlignments.some((item) => item.courseId === "llm" && item.destination.courseId === "generative"));
  assert.ok(alignments.courseAlignments.some((item) => item.courseId === "llm" && item.destination.courseId === "embodied"));
  assert.ok(alignments.courseAlignments.some((item) => item.courseId === "worldmodel" && item.destination.courseId === "rl"));
  assert.ok(alignments.courseAlignments.some((item) => item.courseId === "worldmodel" && item.destination.courseId === "embodied"));
});

test("the bridge requires prediction and preserves release and evidence boundaries", () => {
  assert.match(appSource, /courseAlignmentByLesson\[`\$\{course\.id\}:\$\{lesson\.id\}`\]/);
  assert.match(appSource, /<CourseAlignmentBridge alignment=\{courseAlignment\}/);
  assert.match(bridgeSource, /<PredictionGate/);
  assert.match(bridgeSource, /guided transfer practice/i);
  assert.match(bridgeSource, /not automatically graded/i);
  assert.match(bridgeSource, /Activates when the complete/);
  assert.match(bridgeSource, /Artifact handoff/);
  assert.match(audit, /## Cross-course transfer bridges/);
  assert.match(audit, /Reduced motion removes that emphasis without changing content/);
});

test("alignment is additive: stable lesson IDs and objective promises remain intact", () => {
  assert.equal(llm.lessons.length, 44);
  assert.equal(world.worldModelLessons.length, 46);
  assert.equal(Object.keys(llm.lessonById).length, 44);
  assert.equal(Object.keys(world.worldModelLessonGuides).length, 46);
});
