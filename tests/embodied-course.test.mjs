import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
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
      target: ts.ScriptTarget.ES2022,
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
const course = loadTypeScriptModule(join(root, "app/embodied/index.ts"));
const external = loadTypeScriptModule(
  join(root, "app/external-experiments.ts"),
);
const catalogSource = readFileSync(join(root, "app/course-catalog.ts"), "utf8");

test("Embodied AI ships the reviewed 30-lesson perception-language-action ladder", () => {
  assert.equal(course.embodiedLessons.length, 30);
  assert.deepEqual(
    course.embodiedLessons.map((lesson) => lesson.number),
    Array.from({ length: 30 }, (_, index) => index + 1),
  );
  assert.equal(
    new Set(course.embodiedLessons.map((lesson) => lesson.id)).size,
    30,
  );
  assert.deepEqual(
    course.embodiedTracks.map((track) => track.id),
    [
      "emb-foundations",
      "emb-perception",
      "emb-data",
      "emb-policies",
      "emb-control",
      "emb-research",
    ],
  );
  assert.deepEqual(
    course.embodiedTracks.map(
      (track) =>
        course.embodiedLessons.filter((lesson) => lesson.track === track.id)
          .length,
    ),
    [5, 5, 5, 5, 5, 5],
  );
  assert.deepEqual(
    course.embodiedLessons
      .filter((lesson) => lesson.capstone)
      .map((lesson) => lesson.number),
    [5, 10, 15, 20, 25, 30],
  );
  for (const lesson of course.embodiedLessons)
    for (const prerequisite of lesson.prerequisites ?? [])
      assert.ok(
        course.embodiedLessonById[prerequisite].number < lesson.number,
        `${lesson.id} prerequisite ${prerequisite}`,
      );
  assert.match(
    catalogSource,
    /courseIds = \["llm", "worldmodel", "generative", "rl", "embodied"\]/,
  );
  assert.match(catalogSource, /embodied: \{/);
  assert.deepEqual(
    course.embodiedLessonById["embodied-task-contracts"].programPrerequisites,
    [],
  );
});

test("the Embodied opening sustains its physical case and calibration transfer is numerically determined", () => {
  const opening = course.embodiedLessonById["embodied-task-contracts"];
  assert.match(opening.deep, /every command a claim about the current world/);
  assert.match(opening.example, /current camera frame[\s\S]*force[\s\S]*continue, retry, or stop/);
  assert.match(
    course.embodiedObjectiveCoverage["embodied-task-contracts"][1].workedExample,
    /second attempt[\s\S]*authorize a low lift[\s\S]*re-observe or stop/,
  );

  const calibrationTransfer = course.embodiedTransferChecks["calibration-transforms"];
  assert.match(calibrationTransfer.prompt, /\.004 m[\s\S]*\.008 m[\s\S]*\.006 m/);
  assert.match(calibrationTransfer.options[0].feedback, /\.008 m[\s\S]*exceeds[\s\S]*\.006 m/);
  assert.match(calibrationTransfer.worked, /exceeds the \.006 m gate by \.002 m/);
  assert.match(calibrationTransfer.retry, /Compare the post-bump \.008 m[\s\S]*\.006 m gate/);
});

test("every Embodied AI objective has five authored teaching dimensions and a unique committed check", () => {
  assert.equal(Object.keys(course.embodiedLessonGuides).length, 30);
  assert.deepEqual(
    Object.keys(course.embodiedLessonGuides).sort(),
    Object.keys(course.embodiedObjectiveCoverage).sort(),
  );
  const prompts = [];
  for (const lesson of course.embodiedLessons) {
    const guide = course.embodiedLessonGuides[lesson.id];
    const coverage = course.embodiedObjectiveCoverage[lesson.id];
    assert.equal(coverage.length, 2, lesson.id);
    assert.deepEqual(
      coverage.map((item) => item.objective),
      guide.objectives,
      `${lesson.id} exact objective join`,
    );
    assert.ok(guide.vocabulary.length >= 3, `${lesson.id} vocabulary`);
    for (const item of coverage) {
      for (const field of [
        "explanation",
        "mechanism",
        "workedExample",
        "boundary",
      ])
        assert.ok(
          item[field].length >= 50,
          `${lesson.id} ${item.objective} ${field}`,
        );
      assert.ok(item.check.prompt.length >= 40, `${lesson.id} check prompt`);
      assert.ok(
        item.check.expected.length >= 50,
        `${lesson.id} check expected`,
      );
      assert.ok(item.check.retry.length >= 40, `${lesson.id} check retry`);
      prompts.push(item.check.prompt);
    }
  }
  assert.equal(prompts.length, 60);
  assert.equal(new Set(prompts).size, 60);
});

test("every Embodied AI lesson exposes Change → Observe → Explain, transfer, motion, and guided code", () => {
  for (const registry of [
    course.embodiedResearchLabs,
    course.embodiedTransferChecks,
    course.embodiedMotionStories,
    course.embodiedCodeExamples,
    course.embodiedCodeGuidance,
  ]) {
    assert.deepEqual(
      Object.keys(registry).sort(),
      course.embodiedLessons.map((lesson) => lesson.id).sort(),
    );
  }
  for (const lesson of course.embodiedLessons) {
    const lab = course.embodiedResearchLabs[lesson.id];
    for (const field of [
      "question",
      "change",
      "observe",
      "explain",
      "complete",
      "boundary",
    ])
      assert.ok(lab[field].length >= 35, `${lesson.id} lab ${field}`);
    assert.equal(lab.cases.length, 3, `${lesson.id} cases`);
    assert.ok(
      lab.cases.every(
        (item) =>
          item.detail.length >= 35 && item.meter >= 0 && item.meter <= 100,
      ),
      `${lesson.id} case semantics`,
    );
    const transfer = course.embodiedTransferChecks[lesson.id];
    assert.equal(transfer.options.length, 3, `${lesson.id} transfer options`);
    assert.ok(
      transfer.options.every((option) => option.feedback.length >= 20),
      `${lesson.id} transfer feedback`,
    );
    assert.ok(
      course.embodiedCodeExamples[lesson.id].code.includes("\n"),
      `${lesson.id} code is substantive`,
    );
  }
});

test("six Embodied AI capstones include complete projects and honest downloadable fixtures", async () => {
  const ids = course.embodiedLessons
    .filter((lesson) => lesson.capstone)
    .map((lesson) => lesson.id);
  assert.equal(ids.length, 6);
  for (const registry of [
    course.embodiedCapstoneProjects,
    course.embodiedCapstoneEvidencePacks,
    course.embodiedCapstoneArtifactFiles,
    course.embodiedSynthesisMaps,
  ])
    assert.deepEqual(Object.keys(registry).sort(), [...ids].sort());
  for (const id of ids) {
    const project = course.embodiedCapstoneProjects[id];
    assert.equal(project.stages.length, 4, id);
    assert.ok(
      project.deliverables.length >= 3 && project.rubric.length >= 4,
      id,
    );
    const artifact = JSON.parse(
      await readFile(
        join(root, "public/capstone-artifacts/embodied", `${id}.json`),
        "utf8",
      ),
    );
    assert.equal(artifact.course, "embodied");
    assert.equal(artifact.lessonId, id);
    assert.match(artifact.evidenceKind, /fixture/);
    assert.ok(
      artifact.failure.length >= 60 && artifact.boundary.length >= 60,
      id,
    );
    assert.ok(Array.isArray(artifact.rawRows));
    assert.match(artifact.starter.command, new RegExp(id));
    assert.ok(
      artifact.implementation.requiredComponents.length >= 6,
      `${id} working-system components`,
    );
    assert.ok(
      artifact.implementation.buildOrder.length >= 5,
      `${id} build order`,
    );
    assert.ok(artifact.acceptanceChecks.length >= 3, `${id} acceptance checks`);
    assert.ok(
      artifact.acceptanceChecks.every(
        (check) => check.action.length >= 45 && check.expected.length >= 45,
      ),
      `${id} observable acceptance`,
    );
    const axes = Object.entries(artifact.manifest.matrixAxes);
    const expectedCells = axes.reduce(
      (cells, [field, values]) =>
        cells.flatMap((cell) =>
          values.map((value) => ({ ...cell, [field]: value })),
        ),
      [{}],
    );
    const key = (row) => JSON.stringify(axes.map(([field]) => row[field]));
    assert.deepEqual(
      new Set(artifact.rawRows.map(key)),
      new Set(expectedCells.map(key)),
      `${id} complete declared evidence matrix`,
    );
  }
});

test("Embodied capstone instructions invoke each project-specific executable contract", () => {
  const focusedTests = {
    "task-contract-capstone": ["test_task_fixture.py"],
    "state-estimator-capstone": ["test_estimator.py"],
    "behavior-cloning-capstone": [
      "test_dataset.py",
      "test_policy.py",
      "test_resume.py",
    ],
    "vla-policy-capstone": [
      "test_serializer.py",
      "test_causal_targets.py",
      "test_diffusion_actions.py",
    ],
    "recovery-intervention-capstone": [
      "test_watchdog.py",
      "test_authority.py",
      "test_rollback.py",
    ],
    "embodied-research-capstone": ["test_research_study.py"],
  };
  for (const [id, testFiles] of Object.entries(focusedTests)) {
    const project = JSON.stringify(course.embodiedCapstoneProjects[id]);
    assert.match(
      project,
      /python3 -m pip install -r requirements-capstones\.txt/,
    );
    assert.ok(
      project.includes(
        `--project ${id} --profile smoke --output ${id}-smoke.json`,
      ),
      `${id} smoke command`,
    );
    assert.match(
      project,
      /schemaVersion, course, lessonId, evidenceKind, execution, manifest, checks, rawRows, artifacts, decision, and boundary/,
    );
    assert.match(
      project,
      /Acceptance requires every value in checks to be true/,
    );
    for (const testFile of testFiles)
      assert.ok(project.includes(`tests/${testFile}`), `${id} ${testFile}`);
    if (id !== "embodied-research-capstone")
      assert.ok(
        project.includes(`--verify-dossier ${id}-smoke.json`),
        `${id} evidence verifier command`,
      );
  }
  const allProjects = JSON.stringify(course.embodiedCapstoneProjects);
  assert.match(allProjects, /Downloadable NumPy-backed starter/);
  assert.doesNotMatch(allProjects, /dependency-free starter/);
  const behavior = JSON.stringify(
    course.embodiedCapstoneProjects["behavior-cloning-capstone"],
  );
  assert.match(behavior, /behavior-cloning-capstone-smoke-bc-checkpoint\.npz/);
  const research = JSON.stringify(
    course.embodiedCapstoneProjects["embodied-research-capstone"],
  );
  assert.match(research, /portable-linear-reach-v1/);
  assert.match(research, /controller gain \.35 to \.55 only/);
  assert.match(
    research,
    /--profile full --output embodied-research-capstone-full\.json/,
  );
  assert.match(
    research,
    /--verify-study embodied-research-capstone-smoke\.json/,
  );
  assert.match(
    research,
    /recomputation of every trajectory and summary metric/,
  );
  assert.match(research, /every paired effect/);

  const task = JSON.stringify(
    course.embodiedCapstoneProjects["task-contract-capstone"],
  );
  assert.match(
    task,
    /containment before position, velocity, sequence, terminal, or RNG state changes/,
  );
  const estimator = JSON.stringify(
    course.embodiedCapstoneProjects["state-estimator-capstone"],
  );
  assert.match(estimator, /anisotropic-covariance transformation/);
  const recovery = JSON.stringify(
    course.embodiedCapstoneProjects["recovery-intervention-capstone"],
  );
  assert.match(
    recovery,
    /monotonic timestamps inside the declared freshness window/,
  );
  const vla = JSON.stringify(
    course.embodiedCapstoneProjects["vla-policy-capstone"],
  );
  assert.match(vla, /causal-transformer-versus-diffusion/);
  assert.match(vla, /one-head causal self-attention decoder/);
  assert.match(vla, /future-token edit.*earlier model outputs/);
  assert.match(
    vla,
    /--project vla-policy-capstone --profile full --output vla-policy-capstone-full\.json/,
  );
  assert.match(vla, /--verify-dossier vla-policy-capstone-full\.json/);
  assert.doesNotMatch(vla, /causal linear/);
});

test("the Embodied AI capstone starter executes every project with explicit expected checks", async () => {
  const script = join(
    root,
    "public/capstone-artifacts/embodied/embodied_capstone_starter.py",
  );
  const outputDir = await mkdtemp(join(tmpdir(), "embodied-capstones-"));
  try {
    for (const id of course.embodiedLessons
      .filter((lesson) => lesson.capstone)
      .map((lesson) => lesson.id)) {
      const output = join(outputDir, `${id}.json`);
      execFileSync("python3", [script, "--project", id, "--output", output], {
        stdio: "pipe",
      });
      const dossier = JSON.parse(await readFile(output, "utf8"));
      assert.equal(dossier.lessonId, id);
      assert.match(dossier.evidenceKind, /real local execution/);
      assert.ok(Object.keys(dossier.checks).length >= 3, id);
      assert.ok(Object.values(dossier.checks).every(Boolean), id);
      assert.ok(dossier.rawRows.length >= 2, id);
      assert.match(dossier.boundary, /not a learned-policy result/i);
      const reference = JSON.parse(
        await readFile(
          join(root, "public/capstone-artifacts/embodied", `${id}.json`),
          "utf8",
        ),
      );
      assert.deepEqual(
        dossier.manifest.matrixAxes,
        reference.manifest.matrixAxes,
        `${id} CLI/reference matrix axes`,
      );
      assert.deepEqual(
        Object.keys(dossier.checks),
        Object.keys(reference.checks),
        `${id} CLI/reference check schema`,
      );
      if (id === "recovery-intervention-capstone") {
        assert.equal(
          dossier.manifest.matrixIdentity,
          reference.manifest.matrixIdentity,
        );
        assert.deepEqual(
          dossier.rawRows.map((row) => row.rowIndex),
          reference.rawRows.map((row) => row.rowIndex),
        );
      }
      if (id === "vla-policy-capstone") {
        assert.equal(dossier.rawRows[0].arm, "causal_transformer_decoder");
        assert.match(dossier.rawRows[0].architecture, /masked self-attention/);
        assert.equal(
          dossier.checks
            .causal_transformer_uses_lower_triangular_masked_self_attention,
          true,
        );
        assert.equal(
          dossier.checks
            .future_action_edit_cannot_change_earlier_transformer_outputs,
          true,
        );
        assert.equal(
          dossier.artifacts.transformerEvidence.initialParameterSha256.length,
          64,
        );
        assert.equal(
          dossier.artifacts.transformerEvidence.trainedParameterSha256.length,
          64,
        );
      }
    }
  } finally {
    await rm(outputDir, { recursive: true, force: true });
  }
});

test("audited Embodied AI traces preserve physical and statistical semantics", () => {
  const partial = course.embodiedLessonById["embodied-partial-observation"];
  assert.match(partial.example, /confirmed rigidly grasped/);
  assert.match(partial.example, /different dynamics hypothesis/);
  assert.match(
    course.embodiedCodeExamples["embodied-partial-observation"].code,
    /grasp_valid/,
  );

  const transformer = course.embodiedLessonById["transformer-action-policies"];
  assert.match(transformer.example, /hidden state at o1 predicts a1/);
  assert.match(
    course.embodiedCodeExamples["transformer-action-policies"].code,
    /predict_rows=\[1,3\]/,
  );
  assert.match(
    course.embodiedCodeExamples["transformer-action-policies"].code,
    /valid\[b\]\[predictor\] and valid\[b\]\[target\]/,
  );
  assert.match(
    course.embodiedCodeExamples["transformer-action-policies"].code,
    /not any\(mask\[1\]\[0\]\[4\]\)/,
  );
  assert.match(
    course.embodiedCodeExamples["transformer-action-policies"].code,
    /edited\[4\]='different_future_a1'/,
  );

  const evaluation = course.embodiedLessonById["embodied-evaluation-suites"];
  assert.match(evaluation.deep, /Wilson interval/);
  assert.match(evaluation.example, /\[\.60,\.98\]/);
  assert.match(
    course.embodiedCodeExamples["embodied-evaluation-suites"].code,
    /def wilson/,
  );

  const latency = course.embodiedLessonById["latency-safety-operations"];
  assert.match(latency.deep, /release SLO requires p99 latency at most 50 ms/);
  assert.doesNotMatch(latency.example, /average passes/);
  assert.match(latency.example, /median/);
  assert.match(latency.example, /window decision and command decision/);
  assert.match(
    course.embodiedCodeExamples["latency-safety-operations"].code,
    /release_decision = 'block_promotion_and_review'/,
  );
  assert.match(
    course.embodiedCodeExamples["latency-safety-operations"].code,
    /receipts\[0\]\['applied'\] == 'move' and receipts\[1\]\['applied'\] == 'hold'/,
  );
  assert.match(
    course.embodiedCodeExamples["latency-safety-operations"].code,
    /OPERATING_MODE='degraded_review_existing_revision'/,
  );
  assert.match(
    course.embodiedCodeExamples["latency-safety-operations"].code,
    /receipts\[0\]\['authority'\]=='active_controller' and receipts\[1\]\['authority'\]=='independent_watchdog'/,
  );

  const fusion = course.embodiedLessonById["sensor-fusion-tracking"];
  assert.match(fusion.deep, /observation matrix \$H\$ maps/);
  assert.match(
    course.embodiedObjectiveCoverage["sensor-fusion-tracking"][1].mechanism,
    /negative log likelihood, \$-\\log p\(z\)\$ \(NLL\)/,
  );
  assert.match(fusion.example, /scalar case \$H=1\$/);
  assert.match(
    course.embodiedCodeExamples["sensor-fusion-tracking"].code,
    /gate_d2=3\.84/,
  );
  assert.match(
    course.embodiedCodeExamples["sensor-fusion-tracking"].code,
    /\(z-mean\)\*\*2\/S/,
  );
  assert.match(
    course.embodiedCodeExamples["sensor-fusion-tracking"].code,
    /coverage==\.8.*nll_change-\.4/,
  );
  assert.match(
    course.embodiedCodeExamples["sensor-fusion-tracking"].code,
    /reacquired_var-\.007916666666666667/,
  );

  const chunks = course.embodiedLessonById["action-representations-chunking"];
  assert.match(chunks.misconception, /does not itself create multimodality/);
  assert.match(chunks.misconception, /decoder and training objective/);
  assert.match(
    course.embodiedCodeExamples["action-representations-chunking"].code,
    /'kind':'delta_joint'/,
  );
  assert.match(
    course.embodiedCodeExamples["action-representations-chunking"].code,
    /'kind':'absolute_joint'/,
  );
  assert.match(
    course.embodiedCodeExamples["action-representations-chunking"].code,
    /'unit':'m','frame':'base'/,
  );
  assert.match(
    course.embodiedCodeExamples["action-representations-chunking"].code,
    /def signature\(action\)/,
  );
  assert.match(
    course.embodiedCodeExamples["action-representations-chunking"].code,
    /binary_open0_close1/,
  );
  assert.match(
    course.embodiedCodeExamples["action-representations-chunking"].code,
    /signature\(joint_absolute\)!=decoder_contract/,
  );
  assert.match(
    course.embodiedCodeExamples["action-representations-chunking"].code,
    /action_schemas=.*'delta_joint':\{'dimension':2,'unit':'rad','frame':'joint'/,
  );
  assert.match(
    course.embodiedCodeExamples["action-representations-chunking"].code,
    /'delta_task':\{'dimension':3,'unit':'m','frame':'base'/,
  );
  assert.match(
    course.embodiedCodeExamples["action-representations-chunking"].code,
    /gripper_contract=.*0:'open',1:'close'/,
  );
  assert.match(
    course.embodiedCodeExamples["action-representations-chunking"].code,
    /not validate\(cross_wired\).*not validate\(wrong_dimension\).*not validate\(reversed_gripper\)/,
  );

  const cameras = course.embodiedCodeExamples["cameras-proprioception"].code;
  for (const field of [
    "shape",
    "captured_ms",
    "unit",
    "frame",
    "calibration",
    "age_ms",
    "valid",
  ])
    assert.match(cameras, new RegExp(field));
  assert.match(cameras, /'cam-base-v3'\),/);
  assert.match(
    cameras,
    /corrupt_rgb=dict\(packet\['rgb'\],calibration='cam-base-v2'\)/,
  );
  assert.match(cameras, /0<=field\['age_ms'\]<=limit_ms/);
  assert.match(cameras, /future_rgb\['age_ms'\]==-6/);
  assert.match(cameras, /future_or_clock_domain_failure/);
  assert.match(
    course.embodiedObjectiveCoverage["cameras-proprioception"][0].check
      .expected,
    /fails exact calibration-revision equality/,
  );

  const taskCapstone =
    course.embodiedCodeExamples["task-contract-capstone"].code;
  assert.match(taskCapstone, /action_from_future/);
  assert.match(taskCapstone, /stale_state==initial and future_state==initial/);
  assert.match(taskCapstone, /repaired_state\['sequence'\]==1/);

  const calibration =
    course.embodiedCodeExamples["calibration-transforms"].code;
  assert.match(calibration, /train_camera/);
  assert.match(calibration, /held_camera/);
  assert.match(calibration, /rmse/);
  assert.match(calibration, /confidence_k=2/);
  assert.match(
    course.embodiedObjectiveCoverage["calibration-transforms"][1].check
      .expected,
    /requires \.020 m clearance.*reject the grasp/,
  );

  const estimatorCapstone =
    course.embodiedCodeExamples["state-estimator-capstone"].code;
  assert.match(
    estimatorCapstone,
    /world_cov=matmul\(matmul\(R,camera_cov\),transpose\(R\)\)/,
  );
  assert.match(estimatorCapstone, /world_cov==\[\[\.01,0\.\],\[0\.,\.04\]\]/);
  assert.match(estimatorCapstone, /evaluator_only/);

  const trajectories = course.embodiedCodeExamples["trajectory-datasets"].code;
  assert.match(trajectories, /schema_version/);
  assert.match(trajectories, /hashlib\.sha256/);
  assert.match(trajectories, /source_checksum/);
  assert.match(trajectories, /not splits\['train'\] & splits\['test'\]/);
  assert.match(trajectories, /def sample_keys\(rows,split\)/);
  assert.match(trajectories, /raw_episodes\[episode_id\]\['steps'\]/);
  assert.match(trajectories, /detected_leak==\{'E1:1'\}/);

  const multimodal =
    course.embodiedCodeExamples["multimodal-policy-encoders"].code;
  assert.match(multimodal, /'tokens':\(B,N,D\)/);
  assert.match(multimodal, /key_mask=.*\[B,1,1,N\]/);
  assert.match(multimodal, /pair_mask=.*\[B,1,N,N\]/);

  const feedback = course.embodiedCodeExamples["feedback-control"].code;
  assert.match(feedback, /plant_command/);
  assert.match(feedback, /drives_farther/);
  assert.match(
    feedback,
    /protected\[20\]\['applied'\] < 0\. < unprotected\[20\]\['applied'\]/,
  );
  assert.match(feedback, /DT, LIMIT, X0, PRIOR_APPLIED = \.1, \.5, 0\., 0\./);
  assert.match(feedback, /queue=\[0\.\].*declared one-tick delay queue/);
  assert.match(feedback, /cycle == \[\.8,1\.0,1\.2,1\.2,1\.0,\.8\]/);

  const planning =
    course.embodiedCodeExamples["world-model-robot-planning"].code;
  assert.match(planning, /def rollout/);
  assert.match(planning, /model_calls/);
  assert.match(planning, /realized_x = 0\.\+\.75\*executed/);
  assert.match(planning, /second\['name'\] == 'C'/);
  assert.match(planning, /'name':'FALLBACK_HOLD'/);
  assert.match(planning, /'authority':'independent_safety_controller'/);
  assert.match(planning, /fallback\['applied'\]=='hold'/);

  const skills = course.embodiedCodeExamples["hierarchical-skills"].code;
  for (const field of [
    "argument_types",
    "preconditions",
    "invariants",
    "effect_template",
    "termination",
    "recovery",
  ])
    assert.match(skills, new RegExp(field));
  assert.match(skills, /'status':'timeout','next':'reobserve','effects':\[\]/);
  assert.match(
    skills,
    /tick_state=\{\*\*state,\*\*observations\[tick\]\.get\('state',\{\}\)\}/,
  );
  assert.match(skills, /'failed_guard':'workspace_clear'/);

  const identification =
    course.embodiedCodeExamples["sim-to-real-identification"].code;
  assert.match(identification, /calibration = \[/);
  assert.match(identification, /held_out/);
  assert.match(identification, /residual_rmse/);
  assert.match(
    identification,
    /single_row_design_rank < len\(confounded_unknowns\)/,
  );

  const gpuGate = course.embodiedCodeExamples["reproducible-embodied-gpu"].code;
  assert.match(gpuGate, /def derive\(raw\)/);
  assert.match(gpuGate, /episode_spec/);
  assert.match(
    gpuGate,
    /corrupted_invariants\['identical_episode_specs_within_pair'\]/,
  );

  const research = course.embodiedLessonById["embodied-research-capstone"];
  assert.match(research.deep, /portable-linear-reach-v1/);
  assert.match(research.deep, /gain \$\.35\$/);
  assert.match(research.deep, /gain \$\.55\$/);
  assert.match(
    course.embodiedCodeExamples["embodied-research-capstone"].code,
    /forged\['trace'\]\[0\]\['post_x'\]=12345/,
  );
  assert.match(
    course.embodiedCodeExamples["embodied-research-capstone"].code,
    /not verify\(forged\)/,
  );

  const recovery =
    course.embodiedCodeExamples["recovery-intervention-capstone"].code;
  assert.match(
    recovery,
    /priority=\{'policy':1,'fallback':2,'human':3,'watchdog_stop':4\}/,
  );
  assert.match(recovery, /\[1,2,0,1,2,3\]/);
  assert.match(recovery, /state\['rng_state'\]=='rng-53'/);
});

test("future timestamps and cross-wired action schemas fail in executable lesson cases", () => {
  for (const lessonId of [
    "cameras-proprioception",
    "action-representations-chunking",
  ]) {
    execFileSync(
      "python3",
      ["-c", course.embodiedCodeExamples[lessonId].code],
      { stdio: "pipe" },
    );
  }
});

test("the action-chunk GPU extension is portable, bounded, and promises only invariants", async () => {
  const contract =
    external.externalExperiments["action-chunk-feedback-ablation"];
  assert.equal(contract.courseId, "embodied");
  assert.equal(contract.lessonId, "reproducible-embodied-gpu");
  assert.equal(contract.expected.reviewedReference, null);
  assert.deepEqual(
    contract.providers.map((provider) => provider.id),
    ["colab", "compatible-service", "local"],
  );
  assert.ok(
    contract.expected.invariants.length >= 4 &&
      contract.expected.observations.length >= 3,
  );
  assert.match(contract.boundary, /synthetic one-dimensional/);
  const runbook = await readFile(
    join(root, "external-executions/EMBODIED_POLICY.md"),
    "utf8",
  );
  const publicRunbook = await readFile(
    join(root, "public/experiment-runbooks/EMBODIED_POLICY.md"),
    "utf8",
  );
  assert.equal(
    publicRunbook,
    runbook,
    "downloadable and repository runbooks stay identical",
  );
  assert.match(contract.commands.smoke, /--profile smoke --device auto/);
  assert.match(contract.commands.full, /--profile full --device auto/);
  assert.match(JSON.stringify(contract), /requested_device/);
  assert.match(JSON.stringify(contract), /resolved_device/);
  assert.match(JSON.stringify(contract), /optional explicit override/);
  assert.equal(
    contract.runbook.publicUrl,
    "experiment-runbooks/EMBODIED_POLICY.md",
  );
  for (const heading of [
    "Record the environment",
    "Run the bounded smoke profile",
    "Run the full profile",
    "Troubleshoot without hiding changes",
    "Interpret and preserve",
  ])
    assert.ok(runbook.includes(heading), heading);
  assert.match(runbook, /no expected numeric performance band/i);
  const runner = await readFile(
    join(root, "external-executions/embodied_action_chunk_ablation.py"),
    "utf8",
  );
  assert.match(runner, /def numeric_leaves_are_finite/);
  assert.match(runner, /def row_episode_spec/);
  assert.match(runner, /def derive_invariants/);
  assert.match(runner, /def verify_dossier/);
  assert.match(runner, /"required_raw_fields": required_fields/);
  assert.match(runner, /"all_losses_finite"/);
  assert.match(runner, /pair\["training"\]\["all_losses_finite"\]/);
  assert.match(runner, /"requested_device": args\.device/);
  assert.match(runner, /"resolved_device": str\(device\)/);
  assert.match(runner, /requested_and_resolved_device_are_recorded/);
  assert.doesNotMatch(runner, /"shared_checkpoint_within_pair": True/);
});
