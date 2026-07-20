import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const cache = new Map();

function resolveTypeScriptModule(specifier, parentFile) {
  const candidate = resolve(dirname(parentFile), specifier);
  for (const path of [
    candidate,
    `${candidate}.ts`,
    join(candidate, "index.ts"),
  ])
    if (existsSync(path) && extname(path) === ".ts") return path;
  throw new Error(`Cannot resolve ${specifier} from ${parentFile}`);
}

function loadTypeScriptModule(file) {
  const absolute = resolve(file);
  if (cache.has(absolute)) return cache.get(absolute).exports;
  const moduleRecord = { exports: {} };
  cache.set(absolute, moduleRecord);
  const javascript = ts.transpileModule(readFileSync(absolute, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: absolute,
  }).outputText;
  const localRequire = (specifier) =>
    specifier.startsWith(".")
      ? loadTypeScriptModule(resolveTypeScriptModule(specifier, absolute))
      : require(specifier);
  Function(
    "exports",
    "require",
    "module",
    "__filename",
    "__dirname",
    javascript,
  )(
    moduleRecord.exports,
    localRequire,
    moduleRecord,
    absolute,
    dirname(absolute),
  );
  return moduleRecord.exports;
}

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const world = loadTypeScriptModule(join(root, "app/world-models/index.ts"));
const code = loadTypeScriptModule(
  join(root, "app/world-models/code-examples.ts"),
);
const capstones = loadTypeScriptModule(
  join(root, "app/world-models/capstones.ts"),
);
const lessonLabs = loadTypeScriptModule(
  join(root, "app/world-models/lesson-lab-specs.ts"),
);

test("World Models has 46 stable, prerequisite-respecting lessons across seven territories", () => {
  assert.equal(world.worldModelLessons.length, 46);
  assert.deepEqual(
    world.worldModelLessons.map((lesson) => lesson.number),
    Array.from({ length: 46 }, (_, index) => index + 1),
  );
  assert.equal(
    new Set(world.worldModelLessons.map((lesson) => lesson.id)).size,
    46,
  );
  assert.deepEqual(
    world.worldModelTracks.map((track) => track.id),
    [
      "wm-foundations",
      "wm-representations",
      "wm-training",
      "wm-planning",
      "wm-foundation-models",
      "wm-deployment",
      "wm-advanced",
    ],
  );
  assert.deepEqual(
    world.worldModelTracks.map(
      (track) =>
        world.worldModelLessons.filter((lesson) => lesson.track === track.id)
          .length,
    ),
    [8, 6, 6, 8, 6, 6, 6],
  );

  for (const lesson of world.worldModelLessons) {
    for (const prerequisiteId of lesson.prerequisites ?? []) {
      const prerequisite = world.worldModelLessonById[prerequisiteId];
      assert.ok(
        prerequisite,
        `${lesson.id} references missing ${prerequisiteId}`,
      );
      assert.ok(
        prerequisite.number < lesson.number,
        `${lesson.id} moves ahead of ${prerequisiteId}`,
      );
    }
  }

  const specializationPrerequisites = {
    "object-centric-dynamics": ["action-conditioned-transitions"],
    "hierarchical-multiscale": ["imagined-rollouts"],
    "geometry-physical-priors": ["system-identification-sim-to-real"],
    "causal-counterfactual-models": ["action-conditioned-transitions"],
    "language-multimodal-world-models": [
      "video-tokenization",
      "goal-conditioned-robotics",
    ],
  };
  for (const [lessonId, prerequisites] of Object.entries(
    specializationPrerequisites,
  ))
    assert.deepEqual(
      world.worldModelLessonById[lessonId].prerequisites,
      prerequisites,
      `${lessonId} should reactivate the mechanism its specialization reuses`,
    );
  assert.deepEqual(
    world.worldModelLessonById["world-model-research-capstone"].prerequisites,
    ["world-model-operations-case-study"],
    "the final study still requires the shared operations core before one chosen branch",
  );
});

test("every World Models objective has explicit five-dimensional teaching coverage", async () => {
  assert.deepEqual(
    Object.keys(world.worldModelLessonGuides).sort(),
    Object.keys(world.worldModelObjectiveCoverage).sort(),
  );
  assert.equal(Object.keys(world.worldModelLessonGuides).length, 46);
  let count = 0;
  const prompts = [];
  for (const lesson of world.worldModelLessons) {
    const guide = world.worldModelLessonGuides[lesson.id];
    const coverage = world.worldModelObjectiveCoverage[lesson.id];
    assert.deepEqual(
      coverage.map((item) => item.objective),
      guide.objectives,
      `${lesson.id} exact objective join`,
    );
    assert.equal(
      coverage.length,
      2,
      `${lesson.id} should make two visible promises`,
    );
    for (const [index, item] of coverage.entries()) {
      for (const field of [
        "explanation",
        "mechanism",
        "workedExample",
        "boundary",
      ])
        assert.ok(
          item[field].trim().length >= 50,
          `${lesson.id} objective ${index + 1} ${field}`,
        );
      assert.ok(
        item.check.prompt.trim().length >= 40,
        `${lesson.id} objective ${index + 1} check prompt`,
      );
      assert.ok(
        item.check.expected.trim().length >= 50,
        `${lesson.id} objective ${index + 1} expected reasoning`,
      );
      assert.ok(
        item.check.retry.trim().length >= 40,
        `${lesson.id} objective ${index + 1} retry`,
      );
      prompts.push(item.check.prompt);
      count += 1;
    }
  }
  assert.equal(count, 92);
  assert.equal(new Set(prompts).size, 92);
  const files = await readdir(join(root, "app/world-models/sections"));
  const source = (
    await Promise.all(
      files.map((file) =>
        readFile(join(root, "app/world-models/sections", file), "utf8"),
      ),
    )
  ).join("\n");
  assert.doesNotMatch(
    source,
    /(?<!\\)\\(?!\\)/,
    "learner-facing math must preserve JavaScript backslashes",
  );
});

test("World Models supplies deterministic transfer checks, semantic motion, labs, and code guidance", async () => {
  assert.deepEqual(
    Object.keys(world.worldModelTransferChecks).sort(),
    world.worldModelLessons.map((lesson) => lesson.id).sort(),
  );
  assert.deepEqual(
    Object.keys(world.worldModelMotionStories).sort(),
    world.worldModelLessons.map((lesson) => lesson.id).sort(),
  );
  for (const transfer of Object.values(world.worldModelTransferChecks)) {
    assert.equal(transfer.options.length, 3);
    assert.ok(transfer.answer >= 0 && transfer.answer < 3);
    assert.equal(
      transfer.options.filter((option) => option.feedback.trim().length >= 20)
        .length,
      3,
    );
  }

  const labSource = await readFile(
    join(root, "app/world-models/labs.tsx"),
    "utf8",
  );
  const labSpecSource = await readFile(
    join(root, "app/world-models/lesson-lab-specs.ts"),
    "utf8",
  );
  const styles = await readFile(join(root, "app/globals.css"), "utf8");
  for (const lab of [
    "wm-state",
    "wm-belief",
    "wm-latent",
    "wm-rollout",
    "wm-planner",
    "wm-video",
    "wm-uncertainty",
    "wm-safety",
    "wm-evaluation",
  ]) {
    assert.match(labSource, new RegExp(`"${lab}":\\s*\\{\\s*title:`));
    assert.ok(
      world.worldModelLessons.some((lesson) => lesson.lab === lab),
      `${lab} must be used`,
    );
  }
  for (const phrase of [
    "Learning question:",
    "EXPLAIN",
    "COMPLETE WHEN",
    "Evidence boundary:",
    "Before the readout appears",
  ])
    assert.ok(!labSource.includes(phrase));
  assert.match(
    labSource,
    /<LearningActivityContract[\s\S]*question=[\s\S]*boundary=/,
    "World Model labs keep concise question and scope framing",
  );
  assert.match(
    labSource,
    /<PredictionGate[\s\S]*preview=\{\s*<MotionSurface[\s\S]*wm-lab-instrument/,
    "World Model controls must be supplied as the visible preview",
  );
  assert.match(
    labSource,
    /commitLabel="Compare with the mechanism"/,
    "World Model reflection stays concise",
  );
  assert.match(
    labSource,
    /type="range"[^>]*onInput=/,
    "range labs should update continuously for pointer, touch, and keyboard input",
  );
  assert.match(styles, /\.lesson-breadcrumb button\{[^}]*min-height:44px/);
  assert.match(styles, /\.course-selector select\{[^}]*min-height:44px/);
  assert.match(
    styles,
    /\.learning-objectives,\.objective-map,[^}]*\{max-width:100%;min-width:0\}/,
    "narrow objective cards should be allowed to shrink inside the viewport",
  );

  assert.deepEqual(
    Object.keys(lessonLabs.worldModelLessonLabSpecs).sort(),
    world.worldModelLessons.map((lesson) => lesson.id).sort(),
    "every lesson needs a mechanism-specific lab",
  );
  for (const lesson of world.worldModelLessons) {
    const spec = lessonLabs.worldModelLessonLabSpecs[lesson.id];
    assert.ok(spec.title.trim().length >= 12, `${lesson.id} lab title`);
    for (const field of [
      "question",
      "change",
      "observe",
      "explain",
      "complete",
      "boundary",
    ])
      assert.ok(spec[field].trim().length >= 35, `${lesson.id} lab ${field}`);
    const readout = spec.evaluate(spec.control.initial);
    assert.ok(
      readout.resultLabel.trim().length >= 3,
      `${lesson.id} result label`,
    );
    assert.ok(
      readout.resultValue.trim().length >= 1,
      `${lesson.id} result value`,
    );
    assert.ok(
      readout.detail.trim().length >= 35,
      `${lesson.id} diagnostic feedback`,
    );
    assert.ok(
      readout.meter >= 0 && readout.meter <= 100,
      `${lesson.id} meter range`,
    );
  }
  assert.match(
    labSource,
    /worldModelLessonLabSpecs\[lesson\.id\]/,
    "WorldModelLab must use the lesson-specific contract rather than only a shared type",
  );
  assert.match(
    labSource,
    /<span>\s*<MathText>\{result\.resultLabel\}<\/MathText>\s*<\/span>/,
    "lab result labels must render mathematical notation rather than raw delimiters",
  );
  assert.match(
    labSource,
    /<strong>\s*<MathText>\{result\.resultValue\}<\/MathText>\s*<\/strong>/,
    "lab result values must render mathematical notation rather than raw delimiters",
  );
  assert.doesNotMatch(
    labSpecSource,
    /(?<!\\)\\(?!\\)/,
    "learner-facing lab math must preserve JavaScript backslashes",
  );

  assert.equal(Object.keys(code.worldModelCodeExamples).length, 20);
  assert.deepEqual(
    Object.keys(code.worldModelCodeExamples).sort(),
    Object.keys(code.worldModelCodeGuidance).sort(),
  );
  assert.match(
    code.worldModelCodeExamples["actor-critic-lambda"].code,
    /def lambda_returns\(lam\)/,
  );
  assert.match(
    code.worldModelCodeExamples["actor-critic-lambda"].code,
    /continuations/,
  );
  assert.match(
    code.worldModelCodeExamples["actor-critic-lambda"].observe,
    /\[5\.32, 5\.6, 3\.0\]/,
  );

  const requiredDiagnosticChoices = {
    "latent-prior-posterior": 5,
    "compounding-error-exploitation": 4,
    "hierarchical-multiscale": 6,
    "geometry-physical-priors": 6,
    "causal-counterfactual-models": 5,
  };
  for (const [id, count] of Object.entries(requiredDiagnosticChoices))
    assert.equal(
      lessonLabs.worldModelLessonLabSpecs[id].control.choices.length,
      count,
      `${id} diagnostic cases`,
    );
  const beliefPhases = lessonLabs.worldModelLessonLabSpecs["belief-states-filtering"];
  assert.equal(beliefPhases.evaluate(1).resultValue, "[0.56, 0.44]");
  assert.match(
    beliefPhases.evaluate(1).detail,
    /P\(A'\|A\)=0\.8[\s\S]*0\.8\(0\.60\)\+0\.2\(0\.40\)=0\.56/,
  );
  assert.equal(beliefPhases.evaluate(2).resultValue, "[0.84, 0.16]");
  assert.match(
    beliefPhases.evaluate(2).detail,
    /\[0\.448,0\.088\][\s\S]*0\.536[\s\S]*\[0\.84,0\.16\]/,
  );
  assert.match(
    lessonLabs.worldModelLessonLabSpecs["latent-prior-posterior"].evaluate(2)
      .resultValue,
    /\.68 NATS/,
  );
  assert.match(
    lessonLabs.worldModelLessonLabSpecs[
      "causal-counterfactual-models"
    ].evaluate(3).resultValue,
    /POSITIVITY FAIL/,
  );
  const validationSource = await readFile(
    join(root, "app/world-models/technical-validations.tsx"),
    "utf8",
  );
  assert.equal(
    (
      validationSource.match(
        /^  (?:(?:"[^"]+")|(?:[a-z][\w-]*)): \{ title:/gm,
      ) ?? []
    ).length,
    6,
  );
  for (const phrase of [
    "Contract",
    "Expected observation",
    "Claim boundary",
    "preserved machine-readable dossier",
  ])
    assert.ok(validationSource.includes(phrase));
});

test("audited World Models mechanisms preserve their exact normalization, update, stride, and control contracts", () => {
  const guideText = (id) => JSON.stringify(world.worldModelLessonGuides[id]);

  const slots = guideText("object-centric-dynamics");
  assert.match(slots, /softmax across slots for each input/);
  assert.match(slots, /renormalizes each slot's assignments across inputs/);
  assert.match(slots, /0\.818,0\.182/);
  assert.match(slots, /0\.111,0\.889/);

  const jepa = guideText("jepa-vjepa");
  assert.match(jepa, /Stop-gradient blocks direct prediction-loss gradients/);
  assert.match(
    jepa,
    /exponential-moving-average \(EMA\) target updates only from the online\/context parameters/,
  );
  assert.match(jepa, /does not by itself prove non-collapse/);
  assert.match(
    lessonLabs.worldModelLessonLabSpecs["jepa-vjepa"].explain,
    /Neither stop-gradient nor EMA alone proves/,
  );
  const jepaRisk =
    lessonLabs.worldModelLessonLabSpecs["jepa-vjepa"].evaluate(2);
  assert.equal(jepaRisk.resultLabel, "Risk");
  assert.equal(jepaRisk.resultValue, "TRIVIAL AGREEMENT RISK");
  assert.match(jepaRisk.detail, /does not guarantee collapse/);
  assert.doesNotMatch(jepaRisk.resultValue, /CONSTANT-FEATURE COLLAPSE/);

  const video = guideText("video-tokenization");
  assert.match(video, /zero-based anchor sampling/);
  assert.match(video, /T'=\\\\lceil T\/s\\\\rceil/);
  assert.match(video, /drops or pads a final incomplete window/);
  assert.match(
    lessonLabs.worldModelLessonLabSpecs["video-tokenization"].explain,
    /0,s,2s/,
  );
  const videoCode = code.worldModelCodeExamples["video-tokenization"].code;
  assert.match(videoCode, /range\(0, frames, stride\)/);
  assert.match(videoCode, /ceil\(changed_frames\/changed_stride\) == 3/);
  assert.match(videoCode, /changed_anchors == \[0, 4, 8\]/);
  assert.doesNotMatch(videoCode, /frames\/\/stride/);

  const uncertainty =
    lessonLabs.worldModelLessonLabSpecs["uncertainty-ensembles"];
  const values = [];
  for (
    let value = uncertainty.control.min;
    value <= uncertainty.control.max;
    value += uncertainty.control.step
  ) {
    values.push(uncertainty.evaluate(value).controlValue);
  }
  assert.equal(
    new Set(values).size,
    values.length,
    "every uncertainty control stop must produce a distinct visible probability",
  );
  assert.equal(uncertainty.evaluate(70).resultValue, "0.00");
});

test("World Models source provenance is direct where the lesson makes system-specific claims", async () => {
  const resourceUrls = (id) =>
    world.worldModelLessonGuides[id].resources.map((resource) => resource.url);
  assert.ok(
    resourceUrls("autoregressive-diffusion-dynamics").includes(
      "https://arxiv.org/abs/2204.03458",
    ),
  );
  assert.ok(
    resourceUrls("differentiable-planning").some((url) =>
      url.includes("ba6d843eb4251a4526ce65d1807a9309"),
    ),
  );
  assert.ok(
    resourceUrls("compounding-error-exploitation").some((url) =>
      url.includes("5faf461eff3099671ad63c6f3f094f7f"),
    ),
  );
  assert.ok(
    resourceUrls("compounding-error-exploitation").includes(
      "https://arxiv.org/abs/1812.01129",
    ),
  );
  assert.ok(
    resourceUrls("system-identification-sim-to-real").includes(
      "https://proceedings.mlr.press/v155/mehta21a.html",
    ),
  );
  assert.ok(
    resourceUrls("system-identification-sim-to-real").includes(
      "https://doi.org/10.1016/j.sysconle.2004.09.003",
    ),
  );
  assert.ok(
    resourceUrls("hierarchical-multiscale").includes(
      "https://arxiv.org/abs/2406.00483",
    ),
  );
  assert.ok(
    resourceUrls("geometry-physical-priors").includes(
      "https://proceedings.mlr.press/v162/park22a.html",
    ),
  );
  assert.ok(
    resourceUrls("causal-counterfactual-models").some((url) =>
      url.includes("10.1214/09-SS057"),
    ),
  );
  assert.ok(
    resourceUrls("language-multimodal-world-models").includes(
      "https://proceedings.mlr.press/v235/lin24g.html",
    ),
  );
  assert.ok(
    resourceUrls("world-model-research-capstone").some((url) =>
      url.includes("help.osf.io"),
    ),
  );
  assert.equal(
    world.worldModelLessonGuides["foundation-world-models-case-study"].resources
      .length,
    4,
  );
  assert.equal(
    world.worldModelLessonGuides["dyna-tdmpc-case-study"].resources.length,
    4,
  );

  const simulatorSource = world.worldModelLessonGuides[
    "system-identification-sim-to-real"
  ].resources.find((resource) => resource.url.includes("mehta21a"));
  assert.equal(
    simulatorSource.title,
    "A User’s Guide to Calibrating Robotic Simulators",
  );

  const comparison = JSON.parse(
    await readFile(
      join(
        root,
        "public/capstone-artifacts/worldmodel/foundation-world-models-case-study.json",
      ),
      "utf8",
    ),
  );
  assert.equal(
    comparison.rawRows.filter((row) => row.sourceUrl?.startsWith("http"))
      .length,
    4,
  );
  const research = JSON.parse(
    await readFile(
      join(
        root,
        "public/capstone-artifacts/worldmodel/world-model-research-capstone.json",
      ),
      "utf8",
    ),
  );
  assert.equal(research.decision.startsWith("Not supported"), true);
  assert.equal(research.sourceManifest.length, 2);
  const dynaComparison = JSON.parse(
    await readFile(
      join(
        root,
        "public/capstone-artifacts/worldmodel/dyna-tdmpc-case-study.json",
      ),
      "utf8",
    ),
  );
  assert.deepEqual(
    dynaComparison.sourceManifest.map((source) => source.family),
    ["Dyna", "Dreamer", "MuZero", "TD-MPC"],
  );
  assert.equal(
    dynaComparison.sourceManifest.filter((source) =>
      source.sourceUrl.startsWith("http"),
    ).length,
    4,
  );
});

test("seven World Models capstones have complete local projects and machine-readable references", async () => {
  const expected = [...world.worldModelCapstoneLessonIds];
  assert.equal(expected.length, 7);
  assert.deepEqual(
    Object.keys(capstones.worldModelCapstoneProjects).sort(),
    expected.sort(),
  );
  assert.deepEqual(
    Object.keys(capstones.worldModelCapstoneEvidencePacks).sort(),
    expected.sort(),
  );
  assert.deepEqual(
    Object.keys(capstones.worldModelCapstoneArtifactFiles).sort(),
    expected.sort(),
  );
  for (const id of expected) {
    const project = capstones.worldModelCapstoneProjects[id];
    assert.equal(project.stages.length, 4);
    assert.ok(project.deliverables.length >= 3);
    assert.ok(project.rubric.length >= 4);
    const artifact = JSON.parse(
      await readFile(
        join(root, "public/capstone-artifacts/worldmodel", `${id}.json`),
        "utf8",
      ),
    );
    assert.equal(artifact.course, "worldmodel");
    assert.equal(artifact.lessonId, id);
    assert.ok(artifact.failure.length >= 40);
    assert.ok(artifact.boundary.length >= 40);
  }
});

test("foundation and operations capstones teach their domain-specific decisions rather than a generic model fixture", () => {
  const foundation = JSON.stringify(
    capstones.worldModelCapstoneProjects["foundation-world-models-case-study"],
  );
  for (const phrase of [
    "sourced contract audit",
    "DreamerV3, MuZero, V-JEPA 2, and Genie",
    "interactive visual generation",
    "image-goal robot planning",
    "unknown-cell failure",
  ])
    assert.ok(
      foundation.includes(phrase),
      `foundation capstone should include ${phrase}`,
    );
  assert.doesNotMatch(foundation, /train a generic tensor predictor/i);
  const foundationEvidence = JSON.stringify(
    capstones.worldModelCapstoneEvidencePacks[
      "foundation-world-models-case-study"
    ],
  );
  assert.match(
    foundationEvidence,
    /Complete sourced task-first contract audit/,
  );
  assert.match(foundationEvidence, /unknown required action interface/i);
  assert.doesNotMatch(foundationEvidence, /model-transition budget/i);

  const operations = JSON.stringify(
    capstones.worldModelCapstoneProjects["world-model-operations-case-study"],
  );
  for (const phrase of [
    "semantic normalization and latent-schema revisions",
    "telemetry join",
    "shadow with no actuator authority",
    "actuator-delay incident",
    "atomic known-good bundle",
  ])
    assert.ok(
      operations.includes(phrase),
      `operations capstone should include ${phrase}`,
    );
  assert.match(
    operations,
    /Do not compare generic model-call budgets; test release-specific integrity and authority contracts/,
  );
  const operationsEvidence = JSON.stringify(
    capstones.worldModelCapstoneEvidencePacks[
      "world-model-operations-case-study"
    ],
  );
  assert.match(
    operationsEvidence,
    /Complete staged-release and rollback reference/,
  );
  assert.match(operationsEvidence, /mixed-revision rollback is rejected/);
  assert.doesNotMatch(operationsEvidence, /model-transition budget/i);
});

test("World Models evidence rows recompute the exact teaching claims", async () => {
  const artifact = async (id) =>
    JSON.parse(
      await readFile(
        join(root, "public/capstone-artifacts/worldmodel", `${id}.json`),
        "utf8",
      ),
    );
  const close = (actual, expected, label, tolerance = 1e-9) =>
    assert.ok(
      Math.abs(actual - expected) <= tolerance,
      `${label}: expected ${expected}, received ${actual}`,
    );

  const belief = await artifact("belief-states-filtering");
  assert.equal(belief.rawRows.length, 4);
  let priorA = 0.5;
  for (const row of belief.rawRows) {
    close(row.priorA, priorA, `belief step ${row.step} prior`);
    const predictedA = 0.8 * priorA + 0.2 * (1 - priorA);
    close(row.predictedA, predictedA, `belief step ${row.step} transition`);
    close(
      row.rawA,
      predictedA * row.likelihoodA,
      `belief step ${row.step} raw A`,
    );
    close(
      row.rawB,
      (1 - predictedA) * row.likelihoodB,
      `belief step ${row.step} raw B`,
    );
    close(
      row.evidence,
      row.rawA + row.rawB,
      `belief step ${row.step} evidence`,
    );
    close(
      row.posteriorA,
      row.rawA / row.evidence,
      `belief step ${row.step} posterior A`,
    );
    close(
      row.posteriorA + row.posteriorB,
      1,
      `belief step ${row.step} normalized mass`,
    );
    priorA = row.posteriorA;
  }
  close(
    belief.rawRows[1].posteriorA,
    0.3823529411764706,
    "misleading-observation posterior",
  );
  close(belief.rawRows[3].posteriorA, 0.13577084303679552, "final posterior");
  assert.equal(
    belief.summary.filterStepAccuracy,
    belief.summary.baselineStepAccuracy,
    "fixture must disclose the hard-choice tie",
  );

  const rssm = await artifact("rssm-planet-case-study");
  assert.equal(
    rssm.inputDependencyAudit.find((row) => row.path === "valid-prior")
      .observationAffectsOutput,
    false,
  );
  assert.equal(
    rssm.inputDependencyAudit.find((row) => row.path === "valid-posterior")
      .observationAffectsOutput,
    true,
  );
  const leakedPrior = rssm.inputDependencyAudit.find(
    (row) => row.path === "leaked-prior",
  );
  assert.equal(leakedPrior.observationAffectsOutput, true);
  assert.equal(leakedPrior.accepted, false);
  assert.match(leakedPrior.rejection, /current observation changed/);

  const uncertainty = await artifact("uncertainty-ensembles");
  assert.equal(uncertainty.rawRows.length, 5);
  assert.equal(uncertainty.randomBaselineRows.length, 5);
  assert.equal(
    uncertainty.rawRows.filter(
      (row) =>
        row.case.startsWith("shared-bias") && row.highError && !row.rejected,
    ).length,
    2,
  );
  for (const row of uncertainty.rawRows) {
    close(
      row.spread,
      Math.max(...row.predictions) - Math.min(...row.predictions),
      `${row.case} spread`,
    );
    const mean =
      row.predictions.reduce((sum, value) => sum + value, 0) /
      row.predictions.length;
    close(row.ensembleMean, mean, `${row.case} ensemble mean`);
    close(
      row.absoluteError,
      Math.abs(mean - row.target),
      `${row.case} absolute error`,
    );
  }
  const highErrorCount = uncertainty.rawRows.filter(
    (row) => row.highError,
  ).length;
  const rejected = uncertainty.rawRows.filter((row) => row.rejected);
  close(
    uncertainty.metrics.ensembleGate.highErrorCoverage,
    rejected.filter((row) => row.highError).length / highErrorCount,
    "ensemble-gate high-error coverage",
  );
  close(
    uncertainty.metrics.ensembleGate.rejectionPrecision,
    rejected.filter((row) => row.highError).length / rejected.length,
    "ensemble-gate precision",
  );
  close(
    uncertainty.metrics.ensembleGate.retainedMeanAbsoluteError,
    uncertainty.rawRows
      .filter((row) => !row.rejected)
      .reduce((sum, row) => sum + row.absoluteError, 0) /
      uncertainty.rawRows.filter((row) => !row.rejected).length,
    "ensemble-gate retained MAE",
  );
  assert.equal(
    uncertainty.metrics.equalRateRandomGate.rejectionCount,
    uncertainty.metrics.ensembleGate.rejectionCount,
    "random comparison must reject the same number of cases",
  );

  const dyna = await artifact("dyna-tdmpc-case-study");
  assert.equal(dyna.rawRows.length, 6);
  for (const row of dyna.rawRows)
    assert.equal(
      row.candidates * row.horizon,
      96,
      `${row.scenario}/${row.method} budget`,
    );
  close(
    dyna.rawRows.find(
      (row) => row.scenario === "base" && row.method === "h6-no-value",
    ).predictedReturn,
    0.9 ** 5 * 10,
    "long-horizon return",
  );
  close(
    dyna.rawRows.find(
      (row) => row.scenario === "base" && row.method === "h3-plus-value",
    ).predictedReturn,
    0.9 ** 3 * (0.9 ** 2 * 10),
    "short-horizon bootstrap",
  );
  const biasedShort = dyna.rawRows.find(
    (row) =>
      row.scenario === "biased-terminal" && row.method === "h3-plus-value",
  );
  assert.equal(biasedShort.correctFirstAction, false);
  assert.ok(biasedShort.predictedReturn > biasedShort.realReturn);
  assert.equal(dyna.transitionRows.length, 24);
  const declaredStates = new Set(dyna.fixture.states);
  for (const row of dyna.transitionRows) {
    assert.ok(
      declaredStates.has(row.from),
      `${row.scenario}/${row.branch}/${row.step} declared from-state`,
    );
    assert.ok(
      declaredStates.has(row.to),
      `${row.scenario}/${row.branch}/${row.step} declared to-state`,
    );
  }
  for (const scenario of ["base", "branch-swapped"]) {
    const rows = dyna.transitionRows.filter((row) => row.scenario === scenario);
    assert.equal(rows.length, 6, `${scenario} transition trace`);
    assert.deepEqual(
      rows.map((row) => row.reward),
      [0, 0, 0, 0, 0, 10],
      `${scenario} reward timing`,
    );
  }
  assert.deepEqual(
    dyna.transitionRows
      .filter(
        (row) => row.scenario === "biased-terminal" && row.branch === "left",
      )
      .map((row) => row.reward),
    [0, 0, 0, 0, 0, 0],
  );
  assert.deepEqual(
    dyna.transitionRows
      .filter(
        (row) => row.scenario === "biased-terminal" && row.branch === "right",
      )
      .map((row) => row.reward),
    [0, 0, 0, 0, 0, 10],
  );

  const foundation = await artifact("foundation-world-models-case-study");
  const requiredFields = [
    "observations",
    "actions",
    "target",
    "decisionUse",
    "data",
    "evaluation",
    "evidenceTier",
    "sourceUrl",
    "limits",
  ];
  for (const row of foundation.rawRows)
    for (const field of requiredFields)
      assert.ok(row[field], `${row.system} ${field}`);
  assert.equal(foundation.baselineDecision.result, "INVALID");
  assert.deepEqual(
    foundation.changedTaskDecisions.map((row) => row.conditionalSelection),
    ["Genie", "V-JEPA 2 planning component"],
  );

  const operations = await artifact("world-model-operations-case-study");
  const semanticMismatch = operations.rawRows.find(
    (row) => row.bundle === "wm-17-bad-normalization",
  );
  assert.equal(
    semanticMismatch.encoderWidth,
    semanticMismatch.dynamicsWidth,
    "failure must survive shape compatibility",
  );
  assert.equal(
    semanticMismatch.gate,
    "reject-compatible-shape-semantic-mismatch",
  );
  assert.equal(
    operations.rawRows.find((row) => row.stage === "shadow").gate,
    "reject-alert-rate-tripled",
  );
  assert.equal(
    operations.rawRows.find((row) => row.stage === "canary").gate,
    "rollback-deadline",
  );
  assert.equal(
    operations.rollbackAudit.find((row) => row.attempt === "atomic-wm-16")
      .resumeAllowed,
    true,
  );
  assert.equal(
    operations.rollbackAudit.find((row) => row.attempt === "mixed-revisions")
      .resumeAllowed,
    false,
  );
  const telemetryFields = operations.fixture.telemetryJoinFields;
  assert.equal(operations.telemetryRows.length, 4);
  for (const row of operations.telemetryRows)
    assert.deepEqual(
      Object.keys(row),
      telemetryFields,
      `${row.stage} telemetry values exactly implement the declared join schema`,
    );

  const research = await artifact("world-model-research-capstone");
  assert.equal(research.rawRows.length, 12);
  assert.deepEqual(
    [...new Set(research.rawRows.map((row) => row.seed))],
    [1, 2, 3],
  );
  assert.deepEqual(
    [...new Set(research.rawRows.map((row) => row.angle))],
    [45, 135, 225, 315],
  );
  assert.ok(research.rawRows.every((row) => row.updates === 200));
  assert.equal(research.counterexampleRows.length, 3);
  assert.ok(research.counterexampleRows.every((row) => row.gatePass === false));
  assert.equal(research.diagnosticRetry.resultBySeed.length, 3);
});

test("multi-course URLs, selector, and progress migration are explicit", async () => {
  const [app, landing, lessonRoute, redirects] = await Promise.all([
    readFile(join(root, "app/course-app.tsx"), "utf8"),
    readFile(join(root, "app/[courseId]/page.tsx"), "utf8"),
    readFile(join(root, "app/[courseId]/[lessonId]/page.tsx"), "utf8"),
    readFile(join(root, "app/route-redirects.tsx"), "utf8"),
  ]);
  assert.match(app, /<select value=\{course\.id\}/);
  assert.match(app, /publicPath\(`\/\$\{course\.id\}\/\$\{id\}\/`\)/);
  assert.match(app, /neural-field-guide-progress-v2:\$\{course\.id\}/);
  assert.match(app, /LEGACY_LLM_STORAGE_KEY/);
  assert.match(landing, /LegacyLessonRedirect/);
  assert.match(lessonRoute, /courseIds\.flatMap/);
  assert.match(redirects, /\/llm\/\$\{lessonId\}\//);
});
