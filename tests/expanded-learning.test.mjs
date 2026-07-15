import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [course, foundations, training, systems, capstones, capstoneView] = await Promise.all([
  readFile(new URL("../app/course-data.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/lesson-guides/foundations-architecture.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/lesson-guides/training.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/lesson-guides/systems.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/capstone-projects.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/capstone-project-view.tsx", import.meta.url), "utf8"),
]);

const guides = [foundations, training, systems].join("\n");
const lessonIds = [...course.matchAll(/id: "([^"]+)", track: "[^"]+", title:/g)].map((match) => match[1]).sort();
const guideIds = [...guides.matchAll(/^  (?:"([^"]+)"|([a-z][\w-]*)): \{/gm)].map((match) => match[1] ?? match[2]).sort();

test("every lesson has one substantial guide with the complete teaching contract", () => {
  assert.equal(lessonIds.length, 44);
  assert.deepEqual(guideIds, lessonIds);
  for (const field of ["objectives:", "vocabulary:", "sections:", "walkthrough:", "guidedExample:", "practice:", "resources:"]) {
    assert.equal((guides.match(new RegExp(`^    ${field}`, "gm")) ?? []).length, 44, `${field} coverage`);
  }
  assert.equal((guides.match(/^      \{ title: .*checkpoint:/gm) ?? []).length, 132, "three checkpointed mechanism steps per lesson");
  assert.equal((guides.match(/^      \{ title: .*url: "https:\/\//gm) ?? []).length, 132, "three HTTPS resources per lesson");
  assert.doesNotMatch(guides, /TODO|placeholder|lorem ipsum/i);
});

test("all seven synthesis lessons are implemented as guided persistent projects", () => {
  const expected = ["optimizers", "gpt2-from-scratch", "olmo3-case-study", "tulu3-case-study", "test-time-compute", "observability-governance", "interpretability-editing"].sort();
  const projectMap = capstones.slice(capstones.indexOf("export const capstoneProjects"));
  const ids = [...projectMap.matchAll(/^  (?:"([^"]+)"|([a-z][\w-]*)): \{/gm)].map((match) => match[1] ?? match[2]).sort();
  assert.deepEqual(ids, expected);
  assert.equal((capstones.match(/^    stages: \[/gm) ?? []).length, 7);
  assert.equal((capstones.match(/^    rubric: \[/gm) ?? []).length, 7);
  assert.equal((capstones.match(/^    exemplar:/gm) ?? []).length, 7);
  assert.equal((capstones.match(/^    reflection: \[/gm) ?? []).length, 7);
  assert.equal((capstones.match(/^      \{ id:/gm) ?? []).length, 28, "four guided stages per capstone");
  for (const feature of ["localStorage.getItem", "localStorage.setItem", "textarea", "Need a nudge?", "Self-assessment", "Reveal exemplar approach", "Clear project draft"]) {
    assert.ok(capstoneView.includes(feature), `missing capstone workspace feature: ${feature}`);
  }
});

test("case-study guides use current cumulative flows", () => {
  for (const phrase of ["5.9 trillion", "100 billion", "50 billion", "1,024 H100", "7.7K tokens", "length-normalized DPO", "off-policy", "on-policy", "RLVR", "Qwen3-based 8B", "MCP-connected", "Evolving Rubrics"]) {
    assert.ok(training.includes(phrase), `case-study synthesis missing ${phrase}`);
  }
  assert.doesNotMatch(course + training, /llama3-case-study/);
});
