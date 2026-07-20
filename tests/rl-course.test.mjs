import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { mkdtemp, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, extname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const cache = new Map();

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

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const course = loadTypeScriptModule(join(root, "app/rl/index.ts"));
const external = loadTypeScriptModule(join(root, "app/external-experiments.ts"));
const catalogSource = readFileSync(join(root, "app/course-catalog.ts"), "utf8");

test("RL & Control ships the reviewed 32-lesson agent-building ladder", () => {
  assert.equal(course.rlLessons.length, 32);
  assert.deepEqual(course.rlLessons.map((lesson) => lesson.number), Array.from({ length: 32 }, (_, index) => index + 1));
  assert.equal(new Set(course.rlLessons.map((lesson) => lesson.id)).size, 32);
  assert.deepEqual(course.rlTracks.map((track) => track.id), ["rl-foundations", "rl-value", "rl-deep-value", "rl-policy", "rl-model-based", "rl-offline", "rl-research"]);
  assert.deepEqual(course.rlTracks.map((track) => course.rlLessons.filter((lesson) => lesson.track === track.id).length), [5, 5, 5, 4, 5, 4, 4]);
  assert.deepEqual(course.rlLessons.filter((lesson) => lesson.capstone).map((lesson) => lesson.number), [5, 10, 15, 19, 24, 28, 32]);
  for (const lesson of course.rlLessons) {
    for (const prerequisite of lesson.prerequisites ?? []) {
      assert.ok(course.rlLessonById[prerequisite].number < lesson.number, `${lesson.id} prerequisite ${prerequisite}`);
    }
  }
  assert.match(catalogSource, /courseIds = \["llm", "worldmodel", "generative", "rl", "embodied"\]/);
  assert.match(catalogSource, /rl: \{/);
  assert.deepEqual(course.rlLessonById["sequential-decision-systems"].programPrerequisites, []);
});

test("every RL objective has five authored teaching dimensions and a unique committed check", () => {
  assert.equal(Object.keys(course.rlLessonGuides).length, 32);
  assert.deepEqual(Object.keys(course.rlLessonGuides).sort(), Object.keys(course.rlObjectiveCoverage).sort());
  const prompts = [];
  for (const lesson of course.rlLessons) {
    const guide = course.rlLessonGuides[lesson.id];
    const coverage = course.rlObjectiveCoverage[lesson.id];
    assert.equal(coverage.length, 2, lesson.id);
    assert.deepEqual(coverage.map((item) => item.objective), guide.objectives, `${lesson.id} exact objective join`);
    assert.ok(guide.vocabulary.length >= 3, `${lesson.id} vocabulary`);
    for (const item of coverage) {
      for (const field of ["explanation", "mechanism", "workedExample", "boundary"]) {
        assert.ok(item[field].length >= 50, `${lesson.id} ${item.objective} ${field}`);
      }
      assert.ok(item.check.prompt.length >= 40, `${lesson.id} check prompt`);
      assert.ok(item.check.expected.length >= 50, `${lesson.id} check expected`);
      assert.ok(item.check.retry.length >= 40, `${lesson.id} check retry`);
      prompts.push(item.check.prompt);
    }
  }
  assert.equal(prompts.length, 64);
  assert.equal(new Set(prompts).size, 64);
});

test("every RL lesson exposes Change → Observe → Explain, transfer, motion, and guided code", () => {
  for (const registry of [course.rlResearchLabs, course.rlTransferChecks, course.rlMotionStories, course.rlCodeExamples, course.rlCodeGuidance]) {
    assert.deepEqual(Object.keys(registry).sort(), course.rlLessons.map((lesson) => lesson.id).sort());
  }
  for (const lesson of course.rlLessons) {
    const lab = course.rlResearchLabs[lesson.id];
    for (const field of ["question", "change", "observe", "explain", "complete", "boundary"]) {
      assert.ok(lab[field].length >= 35, `${lesson.id} lab ${field}`);
    }
    assert.equal(lab.cases.length, 3, `${lesson.id} cases`);
    assert.ok(lab.cases.every((item) => item.detail.length >= 35 && item.meter >= 0 && item.meter <= 100), `${lesson.id} case semantics`);
    const transfer = course.rlTransferChecks[lesson.id];
    assert.equal(transfer.options.length, 3, `${lesson.id} transfer options`);
    assert.ok(transfer.options.every((option) => option.feedback.length >= 20), `${lesson.id} transfer feedback`);
    assert.ok(course.rlCodeExamples[lesson.id].code.includes("\n"), `${lesson.id} code is substantive`);
  }
});

test("audited RL lessons execute learned dynamics, behavior cloning, and paired intervals", () => {
  for (const id of ["learned-dynamics-control", "behavior-cloning", "rl-evaluation-seeds", "rl-research-capstone"]) {
    const run = spawnSync("python3", ["-c", course.rlCodeExamples[id].code], { encoding: "utf8" });
    assert.equal(run.status, 0, `${id}: ${run.stderr}`);
  }
  assert.match(course.rlCodeExamples["learned-dynamics-control"].code, /def fit\(target,logistic=False\)/);
  assert.match(course.rlCodeExamples["behavior-cloning"].code, /for _ in range\(2500\)/);
  const evaluation = course.rlLessonById["rl-evaluation-seeds"];
  assert.match(evaluation.deep, /paired percentile-bootstrap 95% interval/);
  assert.match(evaluation.example, /\[−31\.0,4\.6\]/);
  assert.match(course.rlCodeExamples["rl-evaluation-seeds"].code, /random\.Random\(2026\)/);
  const sourceText = readFileSync(join(root, "app/rl/sources.ts"), "utf8");
  assert.match(sourceText, /2108\.13264/);
});

test("RL estimator, ending, and tabular-environment contracts remain internally consistent", async () => {
  const monteCarlo = course.rlLessonById["monte-carlo-estimation"];
  assert.match(monteCarlo.deep, /first-visit[\s\S]*unbiased/i);
  assert.match(monteCarlo.deep, /every-visit[\s\S]*finite-sample mean biased/i);
  assert.match(course.rlCodeExamples["monte-carlo-estimation"].observe, /does not make the every-visit finite-sample mean unbiased/);

  const control = course.rlLessonById["sarsa-q-learning"];
  assert.match(control.deep, /\\gamma\(1-d_t\)/);
  assert.match(course.rlCodeExamples["sarsa-q-learning"].code, /continuation=int\(not terminated\)/);

  const valueLedger = course.rlCodeExamples["value-methods-capstone"].code;
  for (const target of ["td_target", "sarsa_target", "q_target"]) {
    assert.match(valueLedger, new RegExp(`${target}=reward\\+gamma\\*continuation\\*`), target);
  }
  assert.match(course.rlCodeExamples["value-methods-capstone"].observe, /same true-termination mask/);

  const replay = course.rlLessonById["replay-target-networks"];
  assert.match(replay.deep, /\\gamma\(1-d\)/);
  assert.match(course.rlCodeExamples["replay-target-networks"].code, /\('terminal',True,False\)/);
  assert.match(course.rlCodeExamples["replay-target-networks"].observe, /terminal 1\.0/);

  const projectText = JSON.stringify(course.rlCapstoneProjects["tabular-control-capstone"]);
  assert.match(projectText, /five-state chain MDP/);
  assert.doesNotMatch(projectText, /three-state MDP/);
  const artifact = JSON.parse(await readFile(join(root, "public/capstone-artifacts/rl/tabular-control-capstone.json"), "utf8"));
  assert.deepEqual(
    {
      environmentId: artifact.manifest.environmentId,
      stateCount: artifact.manifest.stateCount,
      startState: artifact.manifest.startState,
      terminalStates: artifact.manifest.terminalStates,
    },
    { environmentId: "five-state-chain-v1", stateCount: 5, startState: 2, terminalStates: [0, 4] },
  );
});

test("RL CPU baselines and research budgets match executable paths", async () => {
  const starter = readFileSync(join(root, "public/capstone-artifacts/rl/rl_capstone_starter.py"), "utf8");
  for (const implementation of ["train_dqn", "train_actor_critic", "fit_tabular_dynamics", "fit_cloning_policy", "rl_research"]) {
    assert.ok(starter.includes(`def ${implementation}`), implementation);
  }
  for (const id of course.rlLessons.filter((lesson) => lesson.capstone).map((lesson) => lesson.id)) {
    const projectText = JSON.stringify(course.rlCapstoneProjects[id]);
    assert.match(projectText, /--profile smoke/, id);
    assert.match(projectText, /--profile full/, id);
    assert.doesNotMatch(projectText, /Replace the named fixture/, id);
  }
  const research = course.rlLessonById["rl-research-capstone"];
  assert.match(research.deep, /19,937 post-warmup updates/);
  assert.match(research.example, /20,000 interactions/);
  const artifact = JSON.parse(await readFile(join(root, "public/capstone-artifacts/rl/rl-research-capstone.json"), "utf8"));
  assert.equal(artifact.manifest.primitiveBudget.optimizerUpdates, 19937);
  assert.ok(artifact.rawRows.every((row) => row.budget.optimizerUpdates === 19937));
});

test("seven RL capstones include complete projects and honest downloadable fixtures", async () => {
  const ids = course.rlLessons.filter((lesson) => lesson.capstone).map((lesson) => lesson.id);
  assert.equal(ids.length, 7);
  for (const registry of [course.rlCapstoneProjects, course.rlCapstoneEvidencePacks, course.rlCapstoneArtifactFiles, course.rlSynthesisMaps]) {
    assert.deepEqual(Object.keys(registry).sort(), [...ids].sort());
  }
  for (const id of ids) {
    const project = course.rlCapstoneProjects[id];
    assert.equal(project.stages.length, 4, id);
    assert.ok(project.deliverables.length >= 3 && project.rubric.length >= 4, id);
    const artifact = JSON.parse(await readFile(join(root, "public/capstone-artifacts/rl", `${id}.json`), "utf8"));
    assert.equal(artifact.course, "rl");
    assert.equal(artifact.lessonId, id);
    assert.match(artifact.evidenceKind, /fixture/);
    assert.ok(artifact.failure.length >= 60 && artifact.boundary.length >= 60, id);
    assert.ok(Array.isArray(artifact.rawRows));
    const axes = artifact.manifest.matrixAxes;
    assert.deepEqual(axes.seed, artifact.manifest.seeds, `${id} seed axis`);
    assert.deepEqual(axes.arm, artifact.manifest.arms, `${id} arm axis`);
    const expectedCells = axes.seed.flatMap((seed) => axes.arm.map((arm) => `${seed}|${arm}`)).sort();
    const actualCells = artifact.rawRows.map((row) => `${row.seed}|${row.arm}`).sort();
    assert.deepEqual(actualCells, expectedCells, `${id} exact seed-by-arm evidence matrix`);
  }
});

test("RL capstone references match canonical five-seed budgets and all starter modes execute", async () => {
  const contracts = JSON.parse(await readFile(join(root, "app/capstone-reference-contracts.json"), "utf8")).rl;
  const work = await mkdtemp(join(tmpdir(), "rl-starters-"));
  try {
    for (const [id, contract] of Object.entries(contracts)) {
      const projectText = JSON.stringify(course.rlCapstoneProjects[id]);
      const artifact = JSON.parse(await readFile(join(root, "public/capstone-artifacts/rl", `${id}.json`), "utf8"));
      assert.deepEqual(artifact.manifest.matrixAxes, contract.matrixAxes, `${id} source-contract axes`);
      assert.deepEqual(artifact.manifest.primitiveBudget, contract.primitiveBudget, `${id} source-contract primitive budget`);
      assert.deepEqual(artifact.manifest.metric, contract.metric, `${id} named metric contract`);
      assert.ok(artifact.rawRows.every((row) => Number.isFinite(row[contract.metric.field]) && !("score" in row)), `${id} named finite row values`);
      assert.equal(artifact.rawRows.length, 10, `${id} five seeds × two arms`);
      for (const row of artifact.rawRows) assert.deepEqual(row.budget, contract.primitiveBudget, `${id} ${row.seed}/${row.arm} row budget`);
      const output = join(work, `${id}.json`);
      const run = spawnSync("python3", [join(root, "public/capstone-artifacts/rl/rl_capstone_starter.py"), "--project", id, "--output", output], { encoding: "utf8" });
      assert.equal(run.status, 0, `${id} starter: ${run.stderr}`);
      const dossier = JSON.parse(await readFile(output, "utf8"));
      assert.equal(dossier.lessonId, id);
      assert.ok(Object.values(dossier.checks).every(Boolean), `${id} starter checks`);
      assert.equal(dossier.manifest.profile, "smoke");
      assert.match(dossier.evidenceKind, /real local CPU execution/);
      assert.match(dossier.boundary, /not trained-agent performance on an external benchmark/);
      if (id === "tabular-control-capstone") {
        assert.equal(dossier.manifest.environmentId, "five-state-chain-v1");
        assert.equal(dossier.manifest.states, 5);
        assert.deepEqual(dossier.manifest.terminalStates, [0, 4]);
      }
      if (["deep-value-capstone", "on-policy-capstone", "model-based-capstone", "sequence-policy-capstone", "rl-research-capstone"].includes(id)) {
        assert.match(dossier.boundary, /training or planning evidence/);
      }
      assert.match(projectText, /five canonical seed|5 canonical seed|Canonical 5-seed/, `${id} project must expose the canonical seed count`);
    }
    const tabular = JSON.parse(await readFile(join(root, "public/capstone-artifacts/rl/tabular-control-capstone.json"), "utf8"));
    assert.deepEqual(tabular.manifest.intervention, { factor: "slipProbability", baseline: 0.1, changed: 0.3 });
    assert.deepEqual(new Set(tabular.rawRows.map((row) => row.slipProbability)), new Set([0.1, 0.3]));
    const valueMethods = JSON.parse(await readFile(join(root, "public/capstone-artifacts/rl/value-methods-capstone.json"), "utf8"));
    assert.ok(valueMethods.rawRows.every((row) => row.baselineSlipProbability === 0.1 && row.evaluationSlipProbability === 0.3));
  } finally {
    await rm(work, { recursive: true, force: true });
  }
});

test("audited RL traces agree across explanation, interaction, and code", () => {
  const mdp = course.rlLessonById["mdps-rewards"];
  assert.match(mdp.deep, /1\/\(1-\\gamma\)/);
  assert.match(mdp.example, /2\.5/);
  assert.match(mdp.example, /8\.1/);
  assert.match(course.rlCodeExamples["mdps-rewards"].code, /isclose\(returns\[\.9\],8\.1\)/);
  assert.doesNotMatch(course.rlCodeExamples["mdps-rewards"].code, /returns==\{/);

  const beliefLab = course.rlResearchLabs["partial-observation"];
  assert.match(beliefLab.cases[0].resultValue, /\.787/);
  assert.match(course.rlCodeExamples["partial-observation"].code, /transition/);
  assert.match(course.rlCodeExamples["partial-observation"].observe, /\.213,.787/);

  const dynamicLab = course.rlResearchLabs["dynamic-programming"];
  assert.equal(dynamicLab.cases[0].resultValue, ".596");
  assert.match(course.rlCodeExamples["dynamic-programming"].observe, /1\.9933 left/);

  const sarsa = course.rlLessonById["sarsa-q-learning"];
  assert.match(sarsa.deep, /ordinary one-step SARSA is on-policy/);
  assert.doesNotMatch(sarsa.deep, /Both are off-policy-capable/);

  const actor = course.rlLessonById["actor-critic"];
  assert.match(actor.example, /\.6\/\.4=1\.5/);
  assert.match(course.rlCodeExamples["actor-critic"].code, /new_policy,action,adv,eps=\.4,\[\.6,\.4\]/);

  const sequence = course.rlLessonById["sequence-policy-capstone"];
  assert.match(sequence.example, /predicts target `a0`/);
  assert.match(course.rlCodeExamples["sequence-policy-capstone"].code, /replace_future_a1/);

  const offline = course.rlLessonById["offline-rl-coverage"];
  assert.match(offline.example, /zero-based labels, action index 1 is the second action/);

  const research = course.rlLessonById["rl-research-capstone"];
  assert.match(research.example, /11\/23\/41\/53\/67/);
  assert.doesNotMatch(research.example, /11–15/);
});

test("the DQN GPU extension is portable, bounded, and promises only invariants", async () => {
  const contract = external.externalExperiments["dqn-target-copy-ablation"];
  assert.equal(contract.courseId, "rl");
  assert.equal(contract.lessonId, "reproducible-rl-gpu");
  assert.equal(contract.expected.reviewedReference, null);
  assert.deepEqual(contract.providers.map((provider) => provider.id), ["colab", "compatible-service", "local"]);
  assert.ok(contract.expected.invariants.length >= 4 && contract.expected.observations.length >= 3);
  assert.match(contract.boundary, /synthetic five-state/);
  assert.equal(contract.runbook.publicUrl, "experiment-runbooks/RL_DQN.md");
  const runbook = await readFile(join(root, "external-executions/RL_DQN.md"), "utf8");
  for (const heading of ["Record the environment", "Run the bounded smoke profile", "Run the full paired profile", "Troubleshoot without hiding changes", "Interpret and preserve"]) {
    assert.ok(runbook.includes(heading), heading);
  }
  assert.match(runbook, /no expected numeric performance band/i);
  assert.match(runbook, /`schema_version`/);
  const runner = await readFile(join(root, "external-executions/rl_dqn_target_ablation.py"), "utf8");
  assert.match(runner, /"steps":200/);
  assert.match(runner, /"steps":20000/);
  assert.match(runner, /"seeds":\[11,23,41,53,67\]/);
  assert.match(runner, /nn\.Linear\(5,32\)/);
  assert.match(runner, /runner_sha256/);
  assert.match(runner, /requirements_sha256/);
  for (const field of ["target_copies", "matched_gradient_updates", "treatment_exercised", "repository_revision", "hardware", "driver_version"]) assert.ok(runner.includes(field), field);
});
