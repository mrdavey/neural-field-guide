import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { courseGradeFingerprint } from "./course-grade-fingerprint.mjs";
import {
  buildCoursePageReaderSnapshots,
  COURSE_PAGE_READER_SNAPSHOT_VERSION,
  readerSnapshotHash,
} from "./course-page-reader-snapshot.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const courseIds = ["llm", "worldmodel", "generative", "rl", "embodied"];
const dimensions = ["accuracy", "writtenNarrative", "flow", "learningContent"];
const recordFields = ["courseId", "gradedAt", "grader", "pages", "population", "rubricRevision", "sourceFingerprint"].sort();
const graderFields = ["blind", "input", "method", "priorGradesSeen", "role"].sort();
const pageFields = [
  "accuracy",
  "blockingDefects",
  "flow",
  "id",
  "learningContent",
  "overall",
  "pageType",
  "pass",
  "readerSnapshotHash",
  "route",
  "wholePageReview",
  "writtenNarrative",
].sort();
const reviewFields = ["feedback", "revisionPriorities", "synopsis"].sort();
const escapeCell = (value) => String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

function assertExactFields(value, expected, label) {
  assert.deepEqual(Object.keys(value).sort(), expected, `${label} fields`);
}

function assertReview(review, key, passing) {
  assert.ok(review && typeof review === "object" && !Array.isArray(review), `${key} requires exactly one wholePageReview object`);
  assertExactFields(review, reviewFields, `${key} wholePageReview`);
  assert.ok(typeof review.synopsis === "string" && review.synopsis.trim().length >= 40, `${key} whole-page synopsis`);
  assert.ok(typeof review.feedback === "string" && review.feedback.trim().length >= 60, `${key} consolidated whole-page feedback`);
  assert.notEqual(review.synopsis.trim(), review.feedback.trim(), `${key} synopsis and feedback must serve different purposes`);
  assert.ok(Array.isArray(review.revisionPriorities) && review.revisionPriorities.length <= 3, `${key} has at most three page-level revision priorities`);
  if (!passing) assert.ok(review.revisionPriorities.length >= 1, `${key} failing page requires a revision priority`);
  const priorities = new Set();
  for (const [index, priority] of review.revisionPriorities.entries()) {
    assert.ok(typeof priority === "string" && priority.trim().length >= 20, `${key} revision priority ${index + 1}`);
    const normalized = priority.trim().toLowerCase();
    assert.equal(priorities.has(normalized), false, `${key} duplicate revision priority`);
    priorities.add(normalized);
  }
}

function validatePage(page, snapshot, courseId) {
  const key = `${courseId}:${page?.id ?? "missing-id"}`;
  assert.ok(page && typeof page === "object" && !Array.isArray(page), `${key} page row`);
  assertExactFields(page, pageFields, key);
  assert.deepEqual(
    { pageType: page.pageType, id: page.id, route: page.route },
    { pageType: snapshot.pageType, id: snapshot.id, route: snapshot.route },
    `${key} identity must follow the canonical reader dossier`,
  );
  assert.equal(snapshot.dossierVersion, COURSE_PAGE_READER_SNAPSHOT_VERSION, `${key} reader dossier version`);
  assert.deepEqual(snapshot.reviewContract, {
    gradingUnit: "one complete page",
    readingOrder: "blocks in ascending order",
    withinBlockOrder: "prose first, then named fields in serialized order; readingSequence and interactionSequence arrays are sequential, and disclosure content stays at its labeled reveal point",
    priorGradesIncluded: false,
    componentScoresAllowed: false,
  }, `${key} blind whole-page reader contract`);
  assert.equal(page.readerSnapshotHash, readerSnapshotHash(snapshot), `${key} grade is stale relative to its complete reading-order dossier`);

  for (const dimension of dimensions) {
    assert.ok(Number.isInteger(page[dimension]) && page[dimension] >= 0 && page[dimension] <= 100, `${key} ${dimension} must be an integer from 0 to 100`);
  }
  const calculatedOverall = mean(dimensions.map((dimension) => page[dimension]));
  assert.equal(page.overall, calculatedOverall, `${key} overall must be the arithmetic mean of the four whole-page scores`);
  assert.ok(Array.isArray(page.blockingDefects), `${key} blockingDefects`);
  const blockerSet = new Set();
  for (const [index, defect] of page.blockingDefects.entries()) {
    assert.ok(typeof defect === "string" && defect.trim().length >= 20, `${key} blocking defect ${index + 1}`);
    const normalized = defect.trim().toLowerCase();
    assert.equal(blockerSet.has(normalized), false, `${key} duplicate blocking defect`);
    blockerSet.add(normalized);
  }
  const passes = dimensions.every((dimension) => page[dimension] >= 95)
    && calculatedOverall >= 95
    && page.blockingDefects.length === 0;
  assert.equal(page.pass, passes, `${key} pass must reflect all four 95+ floors, the 95+ mean, and no blockers`);
  assertReview(page.wholePageReview, key, passes);
  return passes;
}

const snapshots = buildCoursePageReaderSnapshots();
assert.equal(snapshots.length, 187, "reader-dossier population");
const snapshotsByCourse = Object.fromEntries(courseIds.map((courseId) => [courseId, snapshots.filter((snapshot) => snapshot.courseId === courseId)]));
const [records, initialRecord] = await Promise.all([
  Promise.all(courseIds.map(async (courseId) => JSON.parse(await readFile(join(root, "docs/course-page-grades", `${courseId}.json`), "utf8")))),
  readFile(join(root, "docs/course-page-grades/initial-failures.json"), "utf8").then(JSON.parse),
]);

assert.equal(initialRecord.population, 187, "initial audit population");
assert.equal(initialRecord.failures.length, 45, "initial page-level failures");
const initialKeys = new Set();
for (const failure of initialRecord.failures) {
  const key = `${failure.courseId}:${failure.id}`;
  assert.ok(courseIds.includes(failure.courseId), `${key} course`);
  assert.equal(initialKeys.has(key), false, `${key} duplicate initial failure`);
  initialKeys.add(key);
  assert.ok(failure.issue.length >= 40, `${key} initial issue`);
  assert.ok(failure.remedy.length >= 40, `${key} initial remedy`);
}

const pageKeys = new Set();
let finalPassing = 0;
for (const record of records) {
  assert.ok(record && typeof record === "object" && !Array.isArray(record), "course grade record");
  assertExactFields(record, recordFields, `${record.courseId ?? "unknown-course"} course record`);
  assert.equal(courseIds.includes(record.courseId), true, `unknown course ${record.courseId}`);
  assert.equal(record.rubricRevision, "2026-07-17", `${record.courseId} requires a fresh blind whole-page regrade`);
  assert.ok(record.grader && typeof record.grader === "object" && !Array.isArray(record.grader), `${record.courseId} grader declaration`);
  assertExactFields(record.grader, graderFields, `${record.courseId} grader declaration`);
  assert.equal(record.grader?.role, "independent whole-page grader", `${record.courseId} grader role`);
  assert.equal(record.grader?.input, "course-page-reader-snapshot", `${record.courseId} grader input`);
  assert.equal(record.grader?.blind, true, `${record.courseId} grading must be blind`);
  assert.equal(record.grader?.priorGradesSeen, false, `${record.courseId} grader must not see prior grades`);
  assert.ok(record.grader?.method?.length >= 80, `${record.courseId} grader method`);
  assert.match(record.gradedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, `${record.courseId} graded timestamp`);
  assert.equal(record.sourceFingerprint, await courseGradeFingerprint(record.courseId), `${record.courseId} grade is stale relative to its learner-facing source bundle`);
  const canonical = snapshotsByCourse[record.courseId];
  assert.equal(record.population, canonical.length, `${record.courseId} population mismatch`);
  assert.equal(record.pages.length, canonical.length, `${record.courseId} page-row mismatch`);
  for (const [index, page] of record.pages.entries()) {
    const key = `${record.courseId}:${page.id}`;
    assert.equal(pageKeys.has(key), false, `duplicate page ${key}`);
    pageKeys.add(key);
    if (validatePage(page, canonical[index], record.courseId)) finalPassing += 1;
  }
}

const finalPopulation = records.reduce((sum, record) => sum + record.pages.length, 0);
assert.equal(finalPopulation, 187, "final grader population must contain 187 pages");
assert.equal(pageKeys.size, finalPopulation, "every canonical page has one grade row");
assert.equal(finalPassing, finalPopulation, "report generation is blocked until every page passes the blind whole-page gate");

const lines = [
  "# Course page grades",
  "",
  "Reviewed: 17 July 2026",
  "",
  "This report applies `docs/COURSE_PAGE_GRADING_RUBRIC.md` to each complete page as one reading journey. Independent graders read a blind top-to-bottom dossier before assigning four whole-page scores. Repository tests validate population, hashes, schema, arithmetic, and thresholds; they do not award semantic grades.",
  "",
  "## Historical independent audit",
  "",
  "The earlier rubric found **45 page-level failures** across the same 187 canonical routes. Those historical diagnoses remain below for audit continuity; they are not inputs to the blind regrade.",
  "",
  "| Course | Pages | Historical pass | Historical fail | Affected pages |",
  "| --- | ---: | ---: | ---: | --- |",
];
for (const courseId of courseIds) {
  const record = records.find((item) => item.courseId === courseId);
  const failures = initialRecord.failures.filter((item) => item.courseId === courseId);
  lines.push(`| ${courseId} | ${record.population} | ${record.population - failures.length} | ${failures.length} | ${escapeCell(failures.map((item) => item.id).join(", "))} |`);
}

lines.push("", "### Historical diagnoses and remedies", "", "| Course | Page ID | Historical diagnosis | Implemented remedy |", "| --- | --- | --- | --- |");
for (const failure of initialRecord.failures) lines.push(`| ${failure.courseId} | ${escapeCell(failure.id)} | ${escapeCell(failure.issue)} | ${escapeCell(failure.remedy)} |`);

lines.push("", "## Blind whole-page regrade", "", `Final status: **${finalPassing}/${finalPopulation} pages pass** all four 95-point floors, the 95-point overall mean, and the no-blocker gate.`, "", "| Course | Pages | Passing | Lowest dimension | Mean overall |", "| --- | ---: | ---: | ---: | ---: |");
for (const record of records) {
  const passing = record.pages.filter((page) => page.pass).length;
  const lowest = Math.min(...record.pages.flatMap((page) => dimensions.map((dimension) => page[dimension])));
  const overallMean = mean(record.pages.map((page) => page.overall));
  lines.push(`| ${record.courseId} | ${record.pages.length} | ${passing} | ${lowest} | ${overallMean.toFixed(2)} |`);
}

lines.push("", "## Complete final page record", "", "Accuracy, written narrative, flow, and learning content are each scored from 0–100 over the complete page. Every row contains one consolidated whole-page review and no component-by-component score or feedback record.", "", "| Course | Page ID | Route | Accuracy | Written narrative | Flow | Learning content | Overall | Result | Synopsis | Consolidated feedback | Revision priorities |", "| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- |");
for (const record of records) for (const page of record.pages) {
  const priorities = page.wholePageReview.revisionPriorities.map((priority, index) => `${index + 1}) ${priority}`).join(" ");
  lines.push(`| ${record.courseId} | ${escapeCell(page.id)} | ${escapeCell(page.route)} | ${page.accuracy} | ${page.writtenNarrative} | ${page.flow} | ${page.learningContent} | ${page.overall.toFixed(2)} | ${page.pass ? "PASS" : "FAIL"} | ${escapeCell(page.wholePageReview.synopsis)} | ${escapeCell(page.wholePageReview.feedback)} | ${escapeCell(priorities)} |`);
}

lines.push("", "## Grading provenance and interpretation boundary", "", `Every score is tied to reader dossier version ${COURSE_PAGE_READER_SNAPSHOT_VERSION}, the page's SHA-256 reader-snapshot hash, and the course's learner-facing source fingerprint. The generator rejects stale dossiers, prior-schema rows, component feedback fields, arithmetic errors, any score below 95, or any unresolved blocker.`, "", "A 95+ grade means the current complete page satisfies this course's reviewed teaching contract. It is not proof that every learner will master the topic, that an optional external run will reproduce a particular result, or that teaching fixtures transfer to production or physical deployment. Changed learner-facing content requires a fresh blind whole-page read.", "");

const reportPath = join(root, "docs/COURSE_PAGE_GRADES.md");
const report = `${lines.join("\n")}\n`;
if (process.argv.includes("--check")) {
  assert.equal(await readFile(reportPath, "utf8"), report, "grade report is stale; run npm run generate:grades after an independent blind regrade");
  console.log(`Verified ${finalPopulation} whole-page rows in docs/COURSE_PAGE_GRADES.md`);
} else {
  await writeFile(reportPath, report);
  console.log(`Wrote ${finalPopulation} whole-page rows to docs/COURSE_PAGE_GRADES.md`);
}
