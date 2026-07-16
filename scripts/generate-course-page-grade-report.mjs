import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import { courseGradeFingerprint } from "./course-grade-fingerprint.mjs";

const root = resolve(import.meta.dirname, "..");
const courseIds = ["llm", "worldmodel", "generative", "rl", "embodied"];
const maxima = { A: 25, C: 25, E: 15, I: 15, D: 10, S: 5, R: 5 };
const floors = { A: 24, C: 23, E: 14, I: 14, D: 9, S: 5, R: 4 };
const escapeCell = (value) => String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
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
for (const record of records) {
  assert.equal(courseIds.includes(record.courseId), true, `unknown course ${record.courseId}`);
  assert.equal(record.pages.length, record.population, `${record.courseId} population mismatch`);
  assert.equal(record.grader?.role, "independent semantic grader", `${record.courseId} grader role`);
  assert.ok(record.grader?.method?.length >= 60, `${record.courseId} grader method`);
  assert.match(record.gradedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, `${record.courseId} graded timestamp`);
  assert.equal(record.sourceFingerprint, await courseGradeFingerprint(record.courseId), `${record.courseId} grade is stale relative to its learner-facing source bundle`);
  for (const page of record.pages) {
    const key = `${record.courseId}:${page.id}`;
    assert.equal(pageKeys.has(key), false, `duplicate page ${key}`);
    pageKeys.add(key);
    const total = Object.entries(maxima).reduce((sum, [dimension, maximum]) => {
      assert.ok(Number.isInteger(page[dimension]) && page[dimension] >= 0 && page[dimension] <= maximum, `${key} invalid ${dimension}`);
      return sum + page[dimension];
    }, 0);
    assert.equal(page.total, total, `${key} total mismatch`);
    const passes = total >= 95 && Object.entries(floors).every(([dimension, minimum]) => page[dimension] >= minimum);
    assert.equal(page.pass, passes, `${key} pass/floor mismatch`);
    assert.deepEqual(page.blockingDefects, [], `${key} cannot pass with an unresolved blocking defect`);
  }
}
const finalPopulation = records.reduce((sum, record) => sum + record.pages.length, 0);
const finalPassing = records.reduce((sum, record) => sum + record.pages.filter((page) => page.pass).length, 0);
assert.equal(finalPopulation, 187, "final grader population must contain 187 pages");
assert.equal(finalPassing, finalPopulation, "report generation is blocked until every independent row passes");

const lines = [
  "# Course page grades",
  "",
  "Reviewed: 16 July 2026",
  "",
  "This report applies the independent rubric in `docs/COURSE_PAGE_GRADING_RUBRIC.md` to the complete composed home and lesson pages. Semantic scores come from independent grader passes; repository tests validate population, arithmetic, thresholds, and evidence-file integrity but do not award points.",
  "",
  "## Initial independent audit",
  "",
  "The first pass graded all 187 canonical pages and found that **45 pages failed** the page threshold or a non-compensable dimension floor. The original page IDs, diagnoses, and implemented remedies remain below rather than being overwritten by the final regrade.",
  "",
  "| Course | Pages | Initial pass | Initial fail | Main findings |",
  "| --- | ---: | ---: | ---: | --- |",
];
for (const courseId of courseIds) {
  const record = records.find((item) => item.courseId === courseId);
  const failures = initialRecord.failures.filter((item) => item.courseId === courseId);
  lines.push(`| ${courseId} | ${record.population} | ${record.population - failures.length} | ${failures.length} | ${escapeCell(failures.map((item) => item.id).join(", "))} |`);
}

lines.push("", "### Initial page-level diagnoses and remedies", "", "| Course | Page ID | Initial diagnosis | Implemented remedy |", "| --- | --- | --- | --- |");
for (const failure of initialRecord.failures) lines.push(`| ${failure.courseId} | ${escapeCell(failure.id)} | ${escapeCell(failure.issue)} | ${escapeCell(failure.remedy)} |`);

lines.push("", "## Final independent regrade", "", `Final status: **${finalPassing}/${finalPopulation} pages pass** the 95-point threshold and every dimension floor.`, "", "| Course | Pages | Passing | Minimum | Mean |", "| --- | ---: | ---: | ---: | ---: |");
for (const record of records) {
  const passing = record.pages.filter((page) => page.pass).length;
  const minimum = Math.min(...record.pages.map((page) => page.total));
  const mean = record.pages.reduce((sum, page) => sum + page.total, 0) / record.pages.length;
  lines.push(`| ${record.courseId} | ${record.pages.length} | ${passing} | ${minimum} | ${mean.toFixed(2)} |`);
}

lines.push("", "## Complete final page record", "", "A/C/E/I/D/S/R are accuracy, coverage, examples, interaction, depth/transfer, deterministic scaffolding, and provenance. Each rationale records the grader's page-level evidence or remaining bounded deduction.", "", "| Course | Page ID | Route | A | C | E | I | D | S | R | Total | Result | Evidence |", "| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |");
for (const record of records) for (const page of record.pages) {
  lines.push(`| ${record.courseId} | ${escapeCell(page.id)} | ${escapeCell(page.route)} | ${page.A} | ${page.C} | ${page.E} | ${page.I} | ${page.D} | ${page.S} | ${page.R} | ${page.total} | ${page.pass ? "PASS" : "FAIL"} | ${escapeCell(page.rationale)} |`);
}

lines.push("", "## Grading provenance and interpretation boundary", "", "Each course record identifies an independent semantic grader, an exact UTC grading timestamp, and a SHA-256 fingerprint over its learner-facing source bundle. The generator refuses a stale fingerprint, a missing canonical page, a score below the gate, or any non-empty blocking-defect list.", "", "A 95+ grade means the current page satisfies this course's reviewed teaching contract. It is not proof that every learner will master the topic, that optional external runs will reproduce a particular numeric outcome, or that simulator evidence transfers to production or physical deployment. New content, changed objectives, dependencies, or implementation revisions require a fresh semantic grade.", "");

const reportPath = join(root, "docs/COURSE_PAGE_GRADES.md");
const report = `${lines.join("\n")}\n`;
if (process.argv.includes("--check")) {
  assert.equal(await readFile(reportPath, "utf8"), report, "grade report is stale; run npm run generate:grades after an independent regrade");
  console.log(`Verified ${finalPopulation} page rows in docs/COURSE_PAGE_GRADES.md`);
} else {
  await writeFile(reportPath, report);
  console.log(`Wrote ${finalPopulation} page rows to docs/COURSE_PAGE_GRADES.md`);
}
