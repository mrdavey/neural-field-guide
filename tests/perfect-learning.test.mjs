import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [course, evidence, transferChecks, transferDistractors, evidenceView, guideView, validations, validationArtifacts, capstoneEvidence, capstoneView, app, styles] = await Promise.all([
  readFile(new URL("../app/course-data.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/lesson-evidence.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/lesson-transfer-checks.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/lesson-transfer-distractors.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/lesson-evidence-view.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/lesson-guide-view.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/technical-validations.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/validation-artifacts.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/capstone-evidence.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/capstone-project-view.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/course-app.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

const validationAssetNames = ["tokenizer-contract-result", "embedding-hidden-state-result", "pretraining-token-accounting-result", "fim-causal-ablation-result", "tulu-stage-runtime-ledger", "tulu-posttraining-result-ledger"];
const validationAssets = await Promise.all(validationAssetNames.map(async (name) => JSON.parse(await readFile(new URL(`../public/validation-artifacts/${name}.json`, import.meta.url), "utf8"))));
const capstoneAssetNames = ["optimizer-learning-step", "tiny-gpt-reference-run", "olmo3-flow-audit", "tulu-dual-purpose-design", "inference-service-benchmark", "safe-agent-operations", "interpretability-intervention"];
const capstoneAssets = await Promise.all(capstoneAssetNames.map(async (name) => JSON.parse(await readFile(new URL(`../public/capstone-artifacts/${name}.json`, import.meta.url), "utf8"))));

const lessonIds = [...course.matchAll(/id: "([^"]+)", track: "[^"]+", title:/g)].map((match) => match[1]).sort();
const evidenceIds = [...evidence.matchAll(/^  (?:(?:"([^"]+)")|([a-z][\w-]*)): evidence\(/gm)].map((match) => match[1] ?? match[2]).sort();
const capstoneIds = ["optimizers", "gpt2-from-scratch", "olmo3-case-study", "tulu3-case-study", "test-time-compute", "observability-governance", "interpretability-editing"].sort();

test("every lesson receives a component-specific contrast and assessed transfer", () => {
  assert.equal(lessonIds.length, 44);
  assert.deepEqual(evidenceIds, lessonIds);
  assert.equal((evidence.match(/: evidence\(/g) ?? []).length, 44);
  assert.equal((evidence.match(/\["[^"]+", "[^"]+", "[^"]+"\],\n    "[^"]+",\n    "[^"]+",\n    \[/g) ?? []).length, 44, "each contract has two cases, a principle, and transfer prompt");
  assert.match(evidenceView, /guide\.walkthrough\.slice\(0, 3\)/);
  assert.match(evidenceView, /evidence\.contrast\.left/);
  assert.match(evidenceView, /evidence\.contrast\.right/);
  assert.match(evidenceView, /Commit answer and check transfer/);
  assert.match(evidenceView, /Transfer decision checkpoint passed/);
  assert.match(evidenceView, /Resolve three independent decisions\./);
  assert.doesNotMatch(evidenceView, /Resolve three independent \{lesson\.title\} decisions/);
  assert.match(evidenceView, /structuredChoices\[index\] === "correct"/);
  assert.match(evidenceView, /two explicit misconceptions/);
  assert.match(evidenceView, /id: "misconception-a"/);
  assert.match(evidenceView, /id: "misconception-b"/);
  assert.match(evidenceView, /lessonTransferDistractors\[lesson\.id\]\[index\]/);
  assert.match(evidenceView, /type="radio"/);
  assert.match(evidenceView, /Field \$\{firstFailed \+ 1\} needs correction/);
  assert.match(evidenceView, /transferPassed && <><div className="worked-transfer"/);
  assert.doesNotMatch(evidenceView, /criteria\.every\(Boolean\)/);
  assert.doesNotMatch(evidenceView, /matchesOrderedGroups|structuredAnswers/);
  const checkMap = transferChecks.slice(transferChecks.indexOf("export const lessonTransferChecks"));
  const checkIds = [...checkMap.matchAll(/^  (?:(?:"([^"]+)")|([a-z][\w-]*)): \[/gm)].map((match) => match[1] ?? match[2]).sort();
  assert.deepEqual(checkIds, lessonIds);
  assert.equal((checkMap.match(/rule\("/g) ?? []).length, 132, "three objectively checked fields per lesson");
  const distractorPairs = [...transferDistractors.matchAll(/^    \["([^"]+)", "([^"]+)"\],$/gm)];
  assert.equal(distractorPairs.length, 132, "two authored misconceptions for every transfer decision");
  const distractorTexts = distractorPairs.flatMap((match) => [match[1], match[2]]);
  assert.equal(new Set(distractorTexts).size, 264, "all misconception choices are independently authored");
  assert.doesNotMatch(transferDistractors, /changed assumption is irrelevant|repeating the prompt's terms is sufficient/);
  assert.match(app, /<LessonEvidenceView lesson=\{lesson\} guide=\{guide\}/);
});

test("code and guided practice enforce prediction before reveal without claiming self-assessed mastery", () => {
  for (const phrase of ["Commit prediction", "My mechanism matched", "Prediction missed", "Commit before reveal", "My decision + reason matched", "Needs another attempt", "Revise answer", "assessed transfer lab below"]) {
    assert.ok(guideView.includes(phrase), `missing diagnostic learning state: ${phrase}`);
  }
  assert.doesNotMatch(guideView, /Prediction checkpoint passed|Transfer checkpoint passed/);
  assert.match(guideView, /codeCommitted &&/);
  assert.match(guideView, /practiceCommitted &&/);
  assert.match(guideView, /disabled=\{codePrediction\.trim\(\)\.length < 12\}/);
  assert.match(guideView, /disabled=\{practiceDraft\.trim\(\)\.length < 18\}/);
});

test("all lesson resources are claim-linked and maintenance dated", () => {
  for (const phrase of ["Primary / foundational source", "Current practice documentation", "Read for", 'reviewedDate = "13 Jul 2026"', "Source checked ${reviewedDate}", "Reviewed ${reviewedDate}"]) {
    assert.ok(guideView.includes(phrase), `missing source-contract feature: ${phrase}`);
  }
  assert.match(app, /course\.id === "worldmodel" \? "14 Jul 2026" : "13 Jul 2026"/);
  assert.match(guideView, /supports this lesson use/);
  assert.match(guideView, /one limit on applying it elsewhere/);
});

test("the six accuracy gaps have pinned authentic validation artifacts", () => {
  const expected = ["tokenization", "embedding-layer", "pretraining-overview", "advanced-objectives", "instruction-tuning-rlhf", "posttraining-overview"].sort();
  const validationMap = validations.slice(validations.indexOf("export const technicalValidations"));
  const ids = [...validationMap.matchAll(/^  (?=\S)(?:(?:"([^"]+)")|([a-z][\w-]*)): \{/gm)].map((match) => match[1] ?? match[2]).sort();
  assert.deepEqual(ids, expected);
  assert.equal((validations.match(/^    revision:/gm) ?? []).length, 6);
  assert.equal((validations.match(/^    expected:/gm) ?? []).length, 6);
  assert.equal((validations.match(/^    boundary:/gm) ?? []).length, 6);
  for (const pin of ["607a30d", "1eef1f4", "v0.23.1", "v2.4.0", "733247c", "745bf58d321c"]) {
    assert.ok(validations.includes(pin), `missing exact validation pin ${pin}`);
  }
  assert.ok(validations.includes('b"bad:\\\\xff".decode'), "the rendered Python must preserve the invalid-byte escape");
  assert.ok(validations.includes("tok.pad_token = tok.eos_token"), "GPT-2 batched probe must define a padding token");
  assert.equal((validationArtifacts.match(/^  (?:(?:"[^"]+")|(?:[a-z][\w-]*)): \{/gm) ?? []).length, 6);
  assert.equal(validationAssets.length, 6);
  for (const asset of validationAssets) {
    assert.equal(asset.schema_version, "1.0");
    assert.equal(typeof asset.artifact, "string");
  }
  assert.match(validations, /INSPECT THE PRESERVED RESULT DOSSIER/);
  assert.match(app, /<TechnicalValidation lessonId=\{lesson\.id\}/);
});

test("all capstones contain starter scaffolds, complete references, checks, and local source packs", () => {
  const evidenceMap = capstoneEvidence.slice(capstoneEvidence.indexOf("export const capstoneEvidencePacks"), capstoneEvidence.indexOf("export const capstoneArtifactFiles"));
  const ids = [...evidenceMap.matchAll(/^  (?=\S)(?:(?:"([^"]+)")|([a-z][\w-]*)): \{/gm)].map((match) => match[1] ?? match[2]).sort();
  assert.deepEqual(ids, capstoneIds);
  assert.equal((capstoneEvidence.match(/^    starter:/gm) ?? []).length, 7);
  assert.equal((capstoneEvidence.match(/^    reference:/gm) ?? []).length, 7);
  assert.equal((capstoneEvidence.match(/^    checks:/gm) ?? []).length, 7);
  assert.equal((capstoneEvidence.match(/^    sources:/gm) ?? []).length, 7);
  assert.equal((evidenceMap.match(/\{ heading:/g) ?? []).length, 28, "four reference sections per capstone");
  assert.ok((evidenceMap.match(/url: "https:\/\//g) ?? []).length >= 16, "project-local primary sources");
  for (const feature of ["Starter evidence frame", "Live artifact validation", "Complete worked artifact", "Project-local sources", "Each card labels its evidence kind", "comparison unlocked", "Reveal complete reference package"]) {
    assert.ok(capstoneView.includes(feature), `missing capstone learning feature: ${feature}`);
  }
  assert.match(capstoneView, /check\.terms\.every/);
  assert.match(capstoneView, /disabled=\{!attempted\}/);
  assert.match(capstoneView, /INSPECT THE FILLED MACHINE-READABLE ARTIFACT/);
  assert.equal(capstoneAssets.length, 7);
  for (const asset of capstoneAssets) {
    assert.equal(asset.schema_version, "1.0");
    assert.equal(typeof asset.artifact, "string");
  }
});

test("new learning surfaces remain readable and operable on narrow screens", () => {
  for (const [name, content] of [["lesson evidence", evidence], ["transfer checks", transferChecks], ["capstone evidence", capstoneEvidence], ["technical validation", validations]]) {
    assert.doesNotMatch(content, /(?<!\\)\\(?!\\)/, `${name} contains a single backslash that JavaScript will consume before rendering`);
  }
  for (const selector of [".lesson-evidence-lab", ".technical-validation", ".capstone-starter-scaffold", ".capstone-reference-package"]) {
    assert.ok(styles.includes(selector), `missing styles for ${selector}`);
  }
  assert.match(styles, /@media\(max-width:780px\)\{\.prediction-commit,\.evidence-lab-header/);
  assert.match(styles, /@media\(max-width:780px\)\{\.technical-validation/);
  assert.match(styles, /@media\(max-width:780px\)\{\.capstone-starter-scaffold/);
  assert.match(styles, /\.technical-validation pre\{[^}]*overflow:auto/);
});
