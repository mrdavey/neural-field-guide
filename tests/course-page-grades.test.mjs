import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, rmdir, unlink, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { courseGradeFingerprint, isFingerprintSource } from "../scripts/course-grade-fingerprint.mjs";
import {
  buildCoursePageReaderSnapshots,
  COURSE_PAGE_READER_SNAPSHOT_VERSION,
  readerSnapshotHash,
} from "../scripts/course-page-reader-snapshot.mjs";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const cache = new Map();
function resolveTypeScriptModule(specifier, parentFile) { const candidate = resolve(dirname(parentFile), specifier); for (const path of [candidate, `${candidate}.ts`, join(candidate, "index.ts")]) if (existsSync(path) && extname(path) === ".ts") return path; throw new Error(`Cannot resolve ${specifier} from ${parentFile}`); }
function loadTypeScriptModule(file) { const absolute = resolve(file); if (cache.has(absolute)) return cache.get(absolute).exports; const moduleRecord = { exports: {} }; cache.set(absolute, moduleRecord); const javascript = ts.transpileModule(readFileSync(absolute, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, fileName: absolute }).outputText; const localRequire = (specifier) => specifier.startsWith(".") ? loadTypeScriptModule(resolveTypeScriptModule(specifier, absolute)) : require(specifier); Function("exports", "require", "module", "__filename", "__dirname", javascript)(moduleRecord.exports, localRequire, moduleRecord, absolute, dirname(absolute)); return moduleRecord.exports; }

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const registries = {
  llm: loadTypeScriptModule(join(root, "app/course-data.ts")).lessons,
  worldmodel: loadTypeScriptModule(join(root, "app/world-models/index.ts")).worldModelLessons,
  generative: loadTypeScriptModule(join(root, "app/generative/index.ts")).generativeLessons,
  rl: loadTypeScriptModule(join(root, "app/rl/index.ts")).rlLessons,
  embodied: loadTypeScriptModule(join(root, "app/embodied/index.ts")).embodiedLessons,
};

const [rubric, inventory, catalog, fingerprintSource] = await Promise.all([
  readFile(new URL("../docs/COURSE_PAGE_GRADING_RUBRIC.md", import.meta.url), "utf8"),
  readFile(new URL("../docs/CURRICULUM_INVENTORY.md", import.meta.url), "utf8"),
  readFile(new URL("../app/course-catalog.ts", import.meta.url), "utf8"),
  readFile(new URL("../scripts/course-grade-fingerprint.mjs", import.meta.url), "utf8"),
]);

const expectedPopulations = { llm: 45, worldmodel: 47, generative: 31, rl: 33, embodied: 31 };
const dimensions = ["accuracy", "writtenNarrative", "flow", "learningContent"];
const recordFields = ["courseId", "gradedAt", "grader", "pages", "population", "rubricRevision", "sourceFingerprint"].sort();
const graderFields = ["blind", "input", "method", "priorGradesSeen", "role"].sort();
const pageFields = ["accuracy", "blockingDefects", "flow", "id", "learningContent", "overall", "pageType", "pass", "readerSnapshotHash", "route", "wholePageReview", "writtenNarrative"].sort();
const reviewFields = ["feedback", "revisionPriorities", "synopsis"].sort();
const readerSnapshots = buildCoursePageReaderSnapshots();

test("the page-grade population covers five homes and all 182 released lessons", () => {
  const released = [...inventory.matchAll(/^## .+ — (\d+) released lessons$/gm)].map((match) => Number(match[1]));
  assert.deepEqual(released, [44, 46, 30, 32, 30]);
  assert.equal(released.reduce((sum, count) => sum + count, 0) + 5, 187);
  assert.match(catalog, /courseIds = \["llm", "worldmodel", "generative", "rl", "embodied"\]/);
});

test("course fingerprints ignore generated caches and transient files", async () => {
  for (const sharedSource of [
    "app/contrast.css",
    "app/course-continuity.ts",
    "app/lesson-concept-plate.tsx",
    "app/lesson-narrative-handoffs.ts",
    "app/lesson-visual-manifest.json",
    "app/lesson-visuals.ts",
    "app/scroll-story-progress.ts",
  ]) assert.ok(fingerprintSource.includes(`\"${sharedSource}\"`), `${sharedSource} must invalidate stale shared page grades`);
  assert.doesNotMatch(fingerprintSource, /course-alignment-bridge|course-alignments/);
  for (const path of [
    "public/capstone-artifacts/rl/__pycache__/starter.pyc",
    "app/.pytest_cache/rows.json",
    "app/.DS_Store",
    "app/component.tsx.swp",
    "app/component.tsx~",
    "tsconfig.tsbuildinfo",
  ]) assert.equal(isFingerprintSource(path), false, path);
  for (const path of [
    "app/rl/index.ts",
    "public/capstone-artifacts/rl/rl_capstone_starter.py",
    "public/capstone-artifacts/rl/value-methods-capstone.json",
    "external-executions/RL_DQN.md",
  ]) assert.equal(isFingerprintSource(path), true, path);

  const cacheDirectory = join(root, "public/capstone-artifacts/rl/__pycache__");
  const cacheFile = join(cacheDirectory, `fingerprint-regression-${process.pid}.pyc`);
  const before = await courseGradeFingerprint("rl");
  await mkdir(cacheDirectory, { recursive: true });
  try {
    await writeFile(cacheFile, Buffer.from([0x42, 0x0d, 0x0a, 0xff]));
    assert.equal(await courseGradeFingerprint("rl"), before, "generated bytecode must not invalidate an independent semantic grade");
  } finally {
    await unlink(cacheFile).catch((error) => { if (error.code !== "ENOENT") throw error; });
    await rmdir(cacheDirectory).catch((error) => { if (!["ENOENT", "ENOTEMPTY"].includes(error.code)) throw error; });
  }
});

test("all five course homes expose distinct authored campaign promises", () => {
  const promises = [...catalog.matchAll(/^    promise: "([^"]+)",$/gm)].map((match) => match[1]);
  const reasons = [...catalog.matchAll(/^    why: "([^"]+)",$/gm)].map((match) => match[1]);
  const finishes = [...catalog.matchAll(/^    finish: "([^"]+)",$/gm)].map((match) => match[1]);
  const payoffs = [...catalog.matchAll(/^      \{ label: "([^"]+)", title: "([^"]+)", body: "([^"]+)" \},$/gm)];
  assert.equal(promises.length, 5);
  assert.equal(new Set(promises).size, 5, "home promises must be course-specific");
  assert.equal(reasons.length, 5);
  assert.ok(reasons.every((reason) => reason.length >= 150));
  assert.equal(finishes.length, 5);
  assert.equal(payoffs.length, 15);
  const storyLabelCounts = [...catalog.matchAll(/storyLabels: \[([^\]]+)\]/g)].map((match) => (match[1].match(/"[^"]+"/g) ?? []).length);
  assert.deepEqual(storyLabelCounts, [5, 6, 6, 7, 6], "each home story needs one node per course phase");
  for (const [, label, title, body] of payoffs) {
    assert.ok(label.length >= 5, label);
    assert.ok(title.length >= 15, title);
    assert.ok(body.length >= 80, title);
  }
  const app = readFileSync(join(root, "app/course-app.tsx"), "utf8");
  for (const field of ["promise", "why", "payoffs", "finish"]) assert.match(app, new RegExp(`campaign\\.${field}`));
  assert.doesNotMatch(app.slice(app.indexOf("function HomeView"), app.indexOf("function LessonView")), /hero\.trace/);
  assert.equal((catalog.match(/claim: "(?:Family map|Denoising mechanism|Research evidence|Decision-and-value spine|Deep value learning|Constraint boundary)"/g) ?? []).length, 6, "Generative and RL homes each have three claim-linked sources");
  for (const field of ["source.claim", "source.title"]) assert.ok(app.includes(field), `home source renderer includes ${field}`);
  assert.doesNotMatch(app.slice(app.indexOf("function HomeView"), app.indexOf("function LessonView")), /source\.readFor/);
});

test("the independent rubric grades one complete page on four non-compensable 0–100 dimensions", () => {
  for (const dimension of dimensions) assert.ok(rubric.includes(`| \`${dimension}\` |`), dimension);
  for (const requirement of [
    "`accuracy >= 95`",
    "`writtenNarrative >= 95`",
    "`flow >= 95`",
    "`learningContent >= 95`",
    "arithmetic mean of the four scores",
    "`blockingDefects` is empty",
  ]) assert.ok(rubric.includes(requirement), requirement);
  assert.match(rubric, /one complete page read from top to bottom/i);
  assert.match(rubric, /read every block once in ascending `order` before taking scoring notes/i);
  assert.match(rubric, /Do not provide earlier grades, rationales, feedback, revision notes, or the scores of adjacent pages/i);
  assert.match(rubric, /exactly one `wholePageReview` object/i);
  assert.match(rubric, /no more than three ordered page-level revision priorities/i);
  assert.match(rubric, /must not add per-component scores, card-by-card comments, repeated feedback arrays, or a separate rationale/i);
  assert.match(rubric, /Structural tests can verify population, hashes, schema, arithmetic, and thresholds\. They cannot award semantic scores/i);
  assert.match(rubric, /Course homes use the same four dimensions with page-appropriate evidence/i);
});

test("the independent final grade records cover and pass all 187 blind whole-page dossiers", async () => {
  const records = await Promise.all(Object.keys(expectedPopulations).map(async (courseId) =>
    JSON.parse(await readFile(new URL(`../docs/course-page-grades/${courseId}.json`, import.meta.url), "utf8"))
  ));
  const snapshotsByCourse = Object.fromEntries(Object.keys(expectedPopulations).map((courseId) => [courseId, readerSnapshots.filter((snapshot) => snapshot.courseId === courseId)]));
  const allKeys = new Set();
  let totalPages = 0;
  for (const record of records) {
    assert.deepEqual(Object.keys(record).sort(), recordFields, `${record.courseId} course record excludes parallel component feedback`);
    assert.equal(record.rubricRevision, "2026-07-17", `${record.courseId} requires a fresh blind whole-page regrade`);
    assert.equal(record.population, expectedPopulations[record.courseId], `${record.courseId} declared population`);
    assert.equal(record.pages.length, expectedPopulations[record.courseId], `${record.courseId} page rows`);
    assert.equal(record.pages.filter((page) => page.pageType === "home").length, 1, `${record.courseId} home row`);
    assert.deepEqual(Object.keys(record.grader).sort(), graderFields, `${record.courseId} grader declaration fields`);
    assert.equal(record.grader.role, "independent whole-page grader", `${record.courseId} grader role`);
    assert.equal(record.grader.input, "course-page-reader-snapshot", `${record.courseId} grader input`);
    assert.equal(record.grader.blind, true, `${record.courseId} blind declaration`);
    assert.equal(record.grader.priorGradesSeen, false, `${record.courseId} prior-grade declaration`);
    assert.ok(record.grader.method.length >= 80, `${record.courseId} grader method`);
    assert.match(record.gradedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, `${record.courseId} grade timestamp`);
    assert.equal(record.sourceFingerprint, await courseGradeFingerprint(record.courseId), `${record.courseId} source fingerprint`);
    const canonical = snapshotsByCourse[record.courseId];
    assert.deepEqual(record.pages.map(({ id, pageType, route }) => ({ id, pageType, route })), canonical.map(({ id, pageType, route }) => ({ id, pageType, route })), `${record.courseId} rows must exactly follow the live course registry`);
    for (const [index, page] of record.pages.entries()) {
      const key = `${record.courseId}:${page.id}`;
      assert.ok(!allKeys.has(key), `duplicate grade row ${key}`);
      allKeys.add(key);
      assert.deepEqual(Object.keys(page).sort(), pageFields, `${key} has one whole-page record and no component feedback fields`);
      assert.ok(["home", "lesson"].includes(page.pageType), `${key} page type`);
      assert.match(page.route, /^\//, `${key} route`);
      assert.equal(canonical[index].dossierVersion, COURSE_PAGE_READER_SNAPSHOT_VERSION, `${key} dossier version`);
      assert.equal(page.readerSnapshotHash, readerSnapshotHash(canonical[index]), `${key} complete reading-order dossier hash`);
      const scores = dimensions.map((dimension) => {
        assert.ok(Number.isInteger(page[dimension]), `${key} ${dimension} integer`);
        assert.ok(page[dimension] >= 0 && page[dimension] <= 100, `${key} ${dimension} range`);
        return page[dimension];
      });
      const calculatedOverall = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      assert.equal(page.overall, calculatedOverall, `${key} overall equals four-score mean`);
      const meetsGate = scores.every((score) => score >= 95) && calculatedOverall >= 95 && page.blockingDefects.length === 0;
      assert.equal(page.pass, meetsGate, `${key} pass reflects all four floors, mean, and blockers`);
      assert.equal(page.pass, true, `${key} independently passes the 95+ page gate`);
      assert.deepEqual(page.blockingDefects, [], `${key} has no unresolved blocker`);
      assert.deepEqual(Object.keys(page.wholePageReview).sort(), reviewFields, `${key} exactly one consolidated review shape`);
      assert.ok(page.wholePageReview.synopsis.length >= 40, `${key} whole-page synopsis`);
      assert.ok(page.wholePageReview.feedback.length >= 60, `${key} whole-page feedback`);
      assert.ok(Array.isArray(page.wholePageReview.revisionPriorities) && page.wholePageReview.revisionPriorities.length <= 3, `${key} maximum three revision priorities`);
      assert.equal(new Set(page.wholePageReview.revisionPriorities.map((priority) => priority.trim().toLowerCase())).size, page.wholePageReview.revisionPriorities.length, `${key} non-duplicate revision priorities`);
      assert.ok(page.wholePageReview.revisionPriorities.every((priority) => priority.trim().length >= 20), `${key} actionable page-level priorities`);
      totalPages += 1;
    }
  }
  assert.equal(totalPages, 187);
  assert.equal(allKeys.size, 187);
});

test("the initial audit preserves all 45 page-level diagnoses and remedies", async () => {
  const initial = JSON.parse(await readFile(new URL("../docs/course-page-grades/initial-failures.json", import.meta.url), "utf8"));
  assert.equal(initial.population, 187);
  assert.equal(initial.failures.length, 45);
  assert.deepEqual(Object.fromEntries(Object.keys(expectedPopulations).map((courseId) => [courseId, initial.failures.filter((item) => item.courseId === courseId).length])), { llm: 8, worldmodel: 2, generative: 11, rl: 13, embodied: 11 });
  const keys = new Set();
  for (const failure of initial.failures) {
    const key = `${failure.courseId}:${failure.id}`;
    assert.ok(!keys.has(key), `${key} duplicate initial failure`);
    keys.add(key);
    assert.ok(failure.issue.length >= 40, `${key} issue`);
    assert.ok(failure.remedy.length >= 40, `${key} remedy`);
    assert.ok(failure.id === "home" || registries[failure.courseId].some((lesson) => lesson.id === failure.id), `${key} must join the live registry`);
  }
});

test("the published report preserves history and summarizes every final whole-page row", async () => {
  const report = await readFile(new URL("../docs/COURSE_PAGE_GRADES.md", import.meta.url), "utf8");
  assert.match(report, /Historical independent audit/);
  assert.match(report, /45 page-level failures/);
  assert.match(report, /Blind whole-page regrade/);
  assert.match(report, /187\/187/);
  assert.match(report, /Historical diagnoses and remedies/);
  assert.match(report, /Accuracy \| Written narrative \| Flow \| Learning content \| Overall/);
  assert.match(report, /one consolidated whole-page review/);
  assert.match(report, /reader-snapshot hash/);
  assert.equal([...report.matchAll(/^\| (llm|worldmodel|generative|rl|embodied) \| [^|]+ \| \/[^|]+ \|/gm)].length, 187);
});
