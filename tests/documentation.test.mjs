import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (path) => readFileSync(resolve(root, path), "utf8");

test("the program overview describes the complete released curriculum", () => {
  const readme = read("README.md");
  for (const [course, count, route] of [
    ["Large Language Models", 44, "/llm/"],
    ["World Models", 46, "/worldmodel/"],
    ["Generative Models", 30, "/generative/"],
    ["Reinforcement Learning & Control", 32, "/rl/"],
    ["Embodied AI", 30, "/embodied/"],
  ]) {
    assert.ok(readme.includes(course), course);
    assert.ok(readme.includes("| " + count + " | `" + route + "`"), `${course} count and route`);
  }
  assert.match(readme, /182 lessons across five complete courses/);
  assert.match(readme, /docs\/README\.md/);
  assert.doesNotMatch(readme, /two complete courses|both courses/i);
});

test("the documentation index owns current and generated evidence explicitly", () => {
  const index = read("docs/README.md");
  for (const name of [
    "CURRICULUM_ARCHITECTURE.md",
    "OBJECTIVE_COVERAGE_REVIEW.md",
    "COURSE_PAGE_GRADING_RUBRIC.md",
    "INTERACTION_AUDIT.md",
    "GITHUB_PAGES.md",
    "COURSE_PAGE_GRADES.md",
    "CURRICULUM_INVENTORY.md",
  ]) assert.ok(index.includes(name), name);
  assert.match(index, /182-lesson/);
  assert.match(index, /187 canonical pages/);
  assert.match(index, /do not hand-edit/i);
});

test("the consolidated objective review accounts for every visible promise", () => {
  const review = read("docs/OBJECTIVE_COVERAGE_REVIEW.md");
  for (const row of [
    /Large Language Models \| 44 \| 132/,
    /World Models \| 46 \| 92/,
    /Generative Models \| 30 \| 60/,
    /Reinforcement Learning & Control \| 32 \| 64/,
    /Embodied AI \| 30 \| 60/,
    /\*\*Program\*\* \| \*\*182\*\* \| \*\*408\*\*/,
  ]) assert.match(review, row);
  assert.match(review, /408 pass, 0 partial, 0 fail/);
});

test("deployment and external runbooks cover all released courses", () => {
  const pages = read("docs/GITHUB_PAGES.md");
  const external = read("external-executions/README.md");
  for (const route of ["/llm/", "/worldmodel/", "/generative/", "/rl/", "/embodied/"]) assert.ok(pages.includes(route), route);
  assert.doesNotMatch(pages, /both courses/i);
  for (const runbook of ["GENERATIVE_DIFFUSION.md", "RL_DQN.md", "EMBODIED_POLICY.md"]) assert.ok(external.includes(runbook), runbook);
  assert.match(external, /seven optional external execution families/i);
});

test("canonical documentation contains no broken repository-relative links", () => {
  const documents = [
    "README.md",
    "docs/README.md",
    "docs/CURRICULUM_ARCHITECTURE.md",
    "docs/OBJECTIVE_COVERAGE_REVIEW.md",
    "docs/COURSE_PAGE_GRADING_RUBRIC.md",
    "docs/INTERACTION_AUDIT.md",
    "docs/GITHUB_PAGES.md",
    "external-executions/README.md",
    "external-executions/GENERATIVE_DIFFUSION.md",
    "external-executions/RL_DQN.md",
    "external-executions/EMBODIED_POLICY.md",
  ];
  for (const document of documents) {
    const source = read(document);
    for (const match of source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1].trim().replace(/^<|>$/g, "").split("#", 1)[0];
      if (!target || /^(?:https?:|mailto:|#|\/)/.test(target)) continue;
      const absolute = resolve(root, dirname(document), decodeURIComponent(target));
      assert.ok(existsSync(absolute), `${document} links to missing ${target}`);
      assert.ok(statSync(absolute).isFile() || statSync(absolute).isDirectory(), `${document} link is not readable: ${target}`);
    }
  }
});

test("superseded reports and one-off task seeds stay retired", () => {
  for (const path of [
    "COMPONENT_GRADES.md",
    "CONTENT_UX_AUDIT.md",
    "CURRICULUM_AUDIT.md",
    "CURRICULUM_PROGRESSION_REVIEW.md",
    "GRADING_REPORT.md",
    "PLAN_LOG.md.backup.20260714T082630Z",
    "curriculum-improvement-seed.json",
    "curriculum-progression-seed.json",
    "learning-expansion-seed.json",
    "math-rendering-seed.json",
    "task-seed.json",
    "docs/OBJECTIVE_COVERAGE_GRADE.md",
    "docs/WORLD_MODEL_OBJECTIVE_COVERAGE_GRADE.md",
    "docs/GENERATIVE_OBJECTIVE_COVERAGE_GRADE.md",
    "docs/RL_OBJECTIVE_COVERAGE_GRADE.md",
    "docs/EMBODIED_OBJECTIVE_COVERAGE_GRADE.md",
    "docs/WORLD_MODEL_CONTENT_GRADES.md",
  ]) assert.equal(existsSync(resolve(root, path)), false, `${path} should not return as a competing source of truth`);
});
