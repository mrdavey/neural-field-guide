import type { CapstoneEvidencePack } from "../capstone-evidence";
import type { CapstoneProject } from "../capstone-projects";
import type { ResourceKind } from "../lesson-guides";
import { publicPath } from "../public-path";
import { wmSources } from "./sources";

type CapstoneSeed = {
  lessonId: string;
  title: string;
  outcome: string;
  prerequisite: string;
  question: string;
  fixture: string;
  baseline: string;
  changedCase: string;
  metric: string;
  failure: string;
  source: { title: string; url: string; note: string; kind: ResourceKind };
};

function sentence(value: string) {
  const trimmed = value.trim();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function specializedProject(
  seed: CapstoneSeed,
): Pick<CapstoneProject, "deliverables" | "stages" | "exemplar"> | undefined {
  if (seed.lessonId === "foundation-world-models-case-study")
    return {
      deliverables: [
        {
          title: "Sourced contract table",
          description:
            "Record each system's observations, actions, target, decision use, data, evaluation, evidence tier, source revision, limits, and explicit unknown cells.",
        },
        {
          title: "Two task-dependent decisions",
          description:
            "Apply separate required-interface gates to interactive visual generation and image-goal robot planning without averaging incompatible evidence.",
        },
        {
          title: "Audit dossier",
          description:
            "Preserve source/date checks, excluded rows, unresolved deployment gates, an unknown-action-interface failure, and the resulting conditional or abstaining decision.",
        },
      ],
      stages: [
        {
          id: "orient",
          title: "Declare the two decision contracts",
          goal: "Make selection conditional on a named task rather than prestige or visual appeal.",
          instructions: [
            "Write the required observations, actions, prediction target, decision use, and non-compensable deployment gates for each task.",
            "Pin the primary or official source and review date for every system row.",
            "Declare that an unknown required interface forces exclusion, abstention, or a conditional decision; it is never imputed.",
          ],
          checkpoint:
            "Another learner can determine whether every table cell is required, optional, incompatible, or unknown.",
          hint: "Do not create a synthetic total score across unlike demonstrations and benchmarks.",
          workspacePrompt:
            "Record both task contracts, source manifest, required columns, unknown-cell rule, and abstention rule.",
        },
        {
          id: "build",
          title: "Build the sourced contract audit",
          goal: "Turn published interfaces into an inspectable table without claiming a local reproduction.",
          instructions: [
            "Populate DreamerV3, MuZero, V-JEPA 2, and Genie rows from the pinned sources.",
            "For every cell, distinguish demonstrated interface, reported evidence, inference, and unknown.",
            "Run schema and source-URL checks and reject an aesthetic/scale-only ranking.",
          ],
          checkpoint:
            "Every non-unknown cell is traceable to a source and every required unknown remains visible.",
          hint: "A paper's strongest benchmark is not automatically relevant to the selected task.",
          workspacePrompt:
            "Paste the table, citations, evidence tiers, unknown cells, and rejected baseline ranking.",
        },
        {
          id: "test",
          title: "Change the task and recompute",
          goal: "Show that the conditional selection follows the task contract.",
          instructions: [
            "Select the closest demonstrated interface for interactive visual generation.",
            "Replace the task with image-goal robot planning and rerun the required-interface gate from scratch.",
            "Delete one required action-interface value in a copy of the table and verify that the audit abstains or becomes explicitly conditional.",
          ],
          checkpoint:
            "The two tasks may select different starting families, and the missing required cell can never silently pass.",
          hint: "Keep unresolved safety, latency, compute, and target-domain evidence as deployment gates after interface selection.",
          workspacePrompt:
            "Record both gate traces, the changed-task decision, the unknown-cell failure, and all unresolved gates.",
        },
        {
          id: "bound",
          title: "Publish a conditional selection",
          goal: "State what the sourced comparison supports and what still requires reproduction.",
          instructions: [
            "Report the closest demonstrated interface for each task, not a universal winner.",
            "List incompatible evidence columns and every unresolved deployment gate.",
            "Name the matched local or external reproduction needed before a stronger performance claim.",
          ],
          checkpoint:
            "The readable decision and JSON table agree, and no unknown or incompatible column contributes a score.",
          hint: "The valid output may be a conditional shortlist or abstention.",
          workspacePrompt:
            "Write the task, selected starting family, excluded rows, unknowns, limits, and next reproduction.",
        },
      ],
      exemplar: {
        title: "A sourced task-first contract audit",
        summary:
          "The reference verifies source URLs and evidence tiers, rejects a scale-only baseline, applies required-interface coverage separately to two tasks, and preserves an unknown action-interface cell that forces a conditional decision. It does not normalize benchmark numbers or claim that any system was locally reproduced.",
        decisions: [
          "Interactive generation and image-goal planning use different required-interface gates.",
          "Unknown required cells remain unknown and can force abstention.",
          "A conditional interface match is only a starting point for matched reproduction and deployment testing.",
        ],
      },
    };
  if (seed.lessonId === "world-model-operations-case-study")
    return {
      deliverables: [
        {
          title: "Versioned release bundle",
          description:
            "Bind encoder, latent schema, dynamics, planner, constraints, calibration, fallback, and authority state into one semantically compatible manifest.",
        },
        {
          title: "Staged telemetry trace",
          description:
            "Join proposal, monitor, applied action, deadline, outcome, and revision identifiers through offline, shadow, and canary gates.",
        },
        {
          title: "Incident and atomic rollback proof",
          description:
            "Preserve the compatible-shape semantic mismatch, alert-rate regression, deadline failure, rejected mixed revision, and accepted full-bundle rollback.",
        },
      ],
      stages: [
        {
          id: "orient",
          title: "Predeclare release authority and stop rules",
          goal: "Make every authority increase and rollback condition testable before rollout.",
          instructions: [
            "Pin the full candidate and known-good manifests, including semantic normalization and latent-schema revisions.",
            "Declare offline, shadow, canary, and expansion authority for proposals, monitors, and actuators.",
            "Set alert-rate, deadline, telemetry-integrity, false-alarm, and rollback-equivalence gates.",
          ],
          checkpoint:
            "Every gate names its input, threshold, authority consequence, and incident record.",
          hint: "Matching tensor width is not semantic compatibility.",
          workspacePrompt:
            "Record candidate/known-good manifests, authority table, telemetry join keys, gates, and stop rules.",
        },
        {
          id: "build",
          title: "Validate the bundle and telemetry join",
          goal: "Catch incompatible or untraceable releases before actuation.",
          instructions: [
            "Check encoder/dynamics width, normalization meaning, planner contract, safeguard revision, and fallback compatibility.",
            "Join each proposal to monitor verdict, applied action, outcome, latency, and complete revision manifest.",
            "Inject a compatible-shape normalization mismatch and require manifest rejection.",
          ],
          checkpoint:
            "No proposal can reach a later stage without semantic compatibility and a complete telemetry receipt.",
          hint: "Validate meanings and units, not only JSON keys and shapes.",
          workspacePrompt:
            "Paste manifest checks, telemetry rows, rejected mismatch, and integrity assertions.",
        },
        {
          id: "test",
          title: "Rehearse shadow, canary, and failure",
          goal: "Exercise gates under the exact authority available at each stage.",
          instructions: [
            "Run shadow with no actuator authority and apply the predeclared alert-rate gate.",
            "Run a bounded canary and inject one actuator-delay incident that exceeds the deadline.",
            "Verify expansion stops, the incident bundle remains complete, and a mixed-revision rollback is rejected.",
          ],
          checkpoint:
            "The deadline incident stops expansion and every decision-to-outcome row remains attributable.",
          hint: "Do not compare generic model-call budgets; test release-specific integrity and authority contracts.",
          workspacePrompt:
            "Record shadow/canary rows, alerts, deadline, applied commands, stop decision, and rejected rollback.",
        },
        {
          id: "bound",
          title: "Restore one atomic known-good bundle",
          goal: "Prove recovery without creating an unreviewed hybrid system.",
          instructions: [
            "Restore encoder, dynamics, planner, schemas, calibration, constraints, and fallback from the same accepted revision.",
            "Check semantic compatibility and next-step output equivalence before authority resumes.",
            "Publish residual risk, false-alarm evidence, the incident timeline, and the next rehearsal.",
          ],
          checkpoint:
            "Only the complete compatible known-good bundle resumes, and the readable incident report matches the telemetry artifact.",
          hint: "Weights-only rollback is incomplete when schemas or safeguards changed.",
          workspacePrompt:
            "Write the restored manifest, equivalence check, authority receipt, incident boundary, and next falsifier.",
        },
      ],
      exemplar: {
        title: "A release-specific operations contract",
        summary:
          "The reference rejects a compatible-shape semantic mismatch, keeps shadow authority at log-only, stops canary expansion on a predeclared deadline, joins proposals to applied outcomes, rejects a mixed-revision rollback, and restores one complete known-good bundle. It validates deterministic release logic rather than production reliability.",
        decisions: [
          "Semantic manifest checks precede evaluation.",
          "Authority and telemetry gates precede expansion.",
          "Rollback restores one compatible bundle and must pass next-step equivalence before resume.",
        ],
      },
    };
  return undefined;
}

function project(seed: CapstoneSeed): CapstoneProject {
  const shared: CapstoneProject = {
    lessonId: seed.lessonId,
    title: seed.title,
    outcome: seed.outcome,
    estimatedTime: "2–4 hours",
    prerequisites: [
      seed.prerequisite,
      "Tensors, probability, and sequential state",
      "Evidence labels and deterministic local checks",
    ],
    materials: [
      seed.fixture,
      "Paper, spreadsheet, or a dependency-free JavaScript/Python notebook",
      "The downloadable reference JSON",
      "Optional primary source for comparison—not required execution",
    ],
    deliverables: [
      {
        title: "Pinned experiment contract",
        description: `Record the question, inputs, actions, targets, ${seed.baseline}, budget, seeds, and stop rule.`,
      },
      {
        title: "Changed-case artifact",
        description: `${sentence(seed.changedCase)} Retain raw values and at least one failed case.`,
      },
      {
        title: "Decision note",
        description: `Apply ${seed.metric}, then separate fixture evidence from external claims.`,
      },
    ],
    stages: [
      {
        id: "orient",
        title: "Commit the learning question",
        goal: "Make the capstone falsifiable before building it.",
        instructions: [
          `Write the learning question: ${sentence(seed.question)}`,
          `Define ${seed.fixture}, including shapes, units, action timing, resets, and evidence label.`,
          `Set a decision rule for ${seed.metric} and name a condition that rejects the hypothesis.`,
        ],
        checkpoint:
          "Another learner can predict exactly which result supports, rejects, or invalidates the study.",
        hint: "A question needs a comparison, changed case, matched budget, metric, and threshold—not a preference word such as better.",
        workspacePrompt:
          "Record the question, hypothesis, fixture, evidence tier, baseline, constants, threshold, and stop criteria.",
      },
      {
        id: "build",
        title: "Build the inspectable mechanism",
        goal: "Produce the smallest implementation or explicit calculation that exposes every state change.",
        instructions: [
          `Implement or tabulate the target mechanism and ${seed.baseline}.`,
          "Assert tensor/time alignment, action bounds, termination, seed handling, and output schema.",
          "Run a hand-checkable example and compare it with an independent arithmetic or invariant check.",
        ],
        checkpoint:
          "The fixture reproduces from the recorded inputs and fails loudly when a contract is broken.",
        hint: "Prefer a five-state trace you can inspect over a large opaque training run.",
        workspacePrompt:
          "Paste the mechanism trace, assertions, expected values, actual values, and any discrepancy.",
      },
      {
        id: "test",
        title: "Test transfer and failure",
        goal: "Use a changed case and a real comparison instead of replaying the teaching example.",
        instructions: [
          `Run this changed case: ${sentence(seed.changedCase)}`,
          `Compare with ${seed.baseline} under identical samples, horizon, model calls, and evaluator.`,
          `Force or discover the following failure: ${sentence(seed.failure)} Preserve its raw trace and retry outcome.`,
        ],
        checkpoint: `The report computes ${seed.metric}, includes every trial, and does not remove an inconvenient failure.`,
        hint: "If the result changes when you alter a hidden constant, the comparison was not matched.",
        workspacePrompt:
          "Record raw result rows, metric calculation, uncertainty or range, failure diagnosis, and retry.",
      },
      {
        id: "bound",
        title: "Decide, package, and bound",
        goal: "Turn the evidence into a reproducible course-scale conclusion.",
        instructions: [
          "Apply the precommitted decision rule without moving its threshold.",
          "Complete the artifact manifest: versions, fixture hash/spec, seeds, raw rows, checks, failures, and result.",
          "State what this deterministic fixture cannot establish and name one external or real-system experiment that would be required next.",
        ],
        checkpoint:
          "The JSON and readable note agree, a null result remains publishable, and every claim names its evidence source.",
        hint: "The strongest valid conclusion is often narrower than the original motivation.",
        workspacePrompt:
          "Write the decision, bounded claim, limitations, alternative explanation, and next discriminating experiment.",
      },
    ],
    rubric: [
      {
        criterion: "Contract correctness",
        developing: "Key shapes, timing, or evidence source are implicit.",
        proficient:
          "Inputs, actions, targets, timing, and checks are explicit.",
        excellent:
          "Independent invariants catch realistic alignment and leakage failures.",
      },
      {
        criterion: "Comparison quality",
        developing: "Shows only one attractive output.",
        proficient: "Uses a changed case and matched baseline.",
        excellent:
          "Predeclares threshold, reports uncertainty, and tests a leading alternative.",
      },
      {
        criterion: "Failure learning",
        developing: "Failures are removed or described vaguely.",
        proficient: "Preserves and causally diagnoses at least one failure.",
        excellent: "A targeted retry distinguishes competing explanations.",
      },
      {
        criterion: "Evidence honesty",
        developing: "Fixture results become model or deployment claims.",
        proficient: "Conclusion stays within the deterministic artifact.",
        excellent:
          "Links every wider claim to primary evidence and defines the next required reproduction.",
      },
    ],
    exemplar: {
      title: "A complete evidence-contract approach",
      summary: `The reference specifies ${seed.fixture}, provides recomputable fixture rows comparing the target mechanism with ${seed.baseline}, and includes this changed case: ${sentence(seed.changedCase)} It demonstrates how to compute ${seed.metric} and preserves this failure: ${sentence(seed.failure)} It does not claim a learned model or external system was executed.`,
      decisions: [
        "The threshold is specified before the final fixture rows.",
        "The declared expensive unit and every seed/case remain visible.",
        "The deterministic mechanism check stays separate from model-quality or real-world evidence.",
      ],
    },
    reflection: [
      "Which observation most strongly changed your prediction?",
      "What hidden assumption would most easily reverse the result?",
      "What new evidence would justify one stronger claim?",
    ],
  };
  const specialized = specializedProject(seed);
  return specialized ? { ...shared, ...specialized } : shared;
}

function specializedEvidencePack(
  seed: CapstoneSeed,
): Pick<CapstoneEvidencePack, "starter" | "reference" | "checks"> | undefined {
  if (seed.lessonId === "foundation-world-models-case-study")
    return {
      starter: {
        title: "Foundation-model task-contract audit frame",
        fields: [
          {
            field: "Two task contracts",
            help: "Commit required observations, actions, targets, decision use, and hard gates before reading system rows.",
            example: "Interactive visual generation; image-goal robot planning",
          },
          {
            field: "Sourced system rows",
            help: "Attach source URL, review date, evidence tier, demonstrated interface, and limits to every row.",
            example: "DreamerV3, MuZero, V-JEPA 2, and Genie",
          },
          {
            field: "Required-interface decisions",
            help: "Apply each task's gate separately; never average incompatible evidence columns.",
            example:
              "Conditional interface match, exclusion, or abstention per task",
          },
          {
            field: "Unknown-cell failure",
            help: "Delete one required action-interface value and preserve the resulting conditional decision.",
            example:
              "Unknown required action interface blocks an unconditional selection",
          },
        ],
      },
      reference: {
        title: "Complete sourced task-first contract audit",
        sections: [
          {
            heading: "1 · Task contracts",
            content:
              "The reference pins separate required-interface gates for interactive visual generation and image-goal robot planning before inspecting any system. Prestige, parameter count, and visual appeal are not decision columns.",
          },
          {
            heading: "2 · Source and evidence table",
            content:
              "Every DreamerV3, MuZero, V-JEPA 2, and Genie cell records its primary or official source, review date, demonstrated interface, evidence tier, limits, and unknown status. The table is a sourced audit, not a local system reproduction.",
          },
          {
            heading: "3 · Changed task and missing cell",
            content:
              "The required-interface gate is recomputed from scratch after the task changes. A copy with one required action-interface value removed must exclude, abstain, or remain explicitly conditional rather than silently imputing support.",
          },
          {
            heading: "4 · Decision boundary",
            content:
              "The output names the closest demonstrated starting interface for each task and every unresolved safety, latency, compute, and target-domain gate. It is not a universal ranking or performance claim.",
          },
        ],
      },
      checks: [
        {
          label: "Both task contracts and hard gates are explicit",
          terms: ["interactive", "robot", "required"],
        },
        {
          label: "Every non-unknown cell has source and evidence tier",
          terms: ["source", "evidence", "unknown"],
        },
        {
          label: "Changed-task and missing-interface decisions recompute",
          terms: ["changed", "abstain", "conditional"],
        },
      ],
    };
  if (seed.lessonId === "world-model-operations-case-study")
    return {
      starter: {
        title: "Staged world-model release evidence frame",
        fields: [
          {
            field: "Candidate and known-good manifests",
            help: "Pin semantic normalization, latent schema, planner, safeguards, calibration, fallback, and authority state.",
            example: "candidate wm-17 and atomic known-good wm-16",
          },
          {
            field: "Stage and authority",
            help: "Name offline, shadow, canary, and expansion permissions before rollout.",
            example: "shadow may log proposals but cannot actuate",
          },
          {
            field: "Joined telemetry and gates",
            help: "Join proposal, monitor verdict, applied action, outcome, deadline, and complete revision receipt.",
            example:
              "alert-rate, telemetry-integrity, false-alarm, and deadline gates",
          },
          {
            field: "Incident and rollback",
            help: "Preserve the semantic mismatch, deadline incident, mixed-revision rejection, and atomic restore proof.",
            example:
              "only the complete compatible wm-16 bundle may resume authority",
          },
        ],
      },
      reference: {
        title: "Complete staged-release and rollback reference",
        sections: [
          {
            heading: "1 · Semantic manifest contract",
            content:
              "The reference checks meanings, units, normalization, latent schema, planner, constraints, calibration, fallback, and authority state. A compatible tensor width cannot override a semantic mismatch.",
          },
          {
            heading: "2 · Telemetry and staged authority",
            content:
              "Each proposal joins to monitor verdict, applied action, outcome, latency, and full revision receipt. Shadow is log-only; canary receives only the predeclared bounded authority.",
          },
          {
            heading: "3 · Incident rehearsal",
            content:
              "An alert-rate regression stops shadow promotion and an injected actuator delay stops canary expansion. The incident bundle stays complete, and a mixed-revision rollback is rejected.",
          },
          {
            heading: "4 · Atomic recovery boundary",
            content:
              "Only one complete known-good encoder/dynamics/planner/schema/calibration/constraint/fallback bundle may resume after semantic compatibility and next-step equivalence pass. The fixture tests release logic, not production reliability.",
          },
        ],
      },
      checks: [
        {
          label: "Semantic bundle compatibility precedes rollout",
          terms: ["semantic", "manifest", "compatible"],
        },
        {
          label: "Telemetry joins decisions to applied outcomes",
          terms: ["proposal", "applied", "outcome"],
        },
        {
          label: "Authority, incident, and atomic rollback gates pass",
          terms: ["authority", "incident", "rollback"],
        },
      ],
    };
  return undefined;
}

const seeds: CapstoneSeed[] = [
  {
    lessonId: "belief-states-filtering",
    title: "Build a partially observed tracker",
    outcome:
      "Implement a two-state Bayes filter that predicts through actions, updates from noisy observations, and recovers after misleading evidence.",
    prerequisite: "Belief States and Bayesian Filtering",
    question:
      "After one misleading observation, does action-aware filtering preserve calibrated hidden-state mass and recover as later evidence arrives, even when hard choices tie a latest-observation baseline?",
    fixture:
      "a two-state hidden-world sequence with declared transition and observation tables",
    baseline: "the latest-observation classifier",
    changedCase:
      "a held-out trajectory whose second observation contradicts the still-hidden state before the state changes",
    metric:
      "the complete posterior-mass trace, normalization, hard-choice tie, and final mass on the true state",
    failure:
      "Use an observation likelihood of zero and show how smoothing or an explicit impossible-event policy changes recovery.",
    source: wmSources.planet,
  },
  {
    lessonId: "rssm-planet-case-study",
    title: "Specify and trace a tiny RSSM",
    outcome:
      "Trace deterministic memory, stochastic prior, observation posterior, decoder, and imagination paths with exact shapes and information boundaries.",
    prerequisite: "RSSM and PlaNet Case Study",
    question:
      "Does posterior filtering correct a perturbed latent start faster than prior-only rollout in the deterministic state-space fixture?",
    fixture:
      "a scalar deterministic memory plus two-valued stochastic latent with three observation steps",
    baseline: "prior-only rollout from the same initial belief",
    changedCase:
      "an observation sequence whose second value contradicts the prior's mode",
    metric: "state error by horizon and prior–posterior gap",
    failure:
      "Leak the target observation into the prior once, then show the invariant that detects it.",
    source: wmSources.planet,
  },
  {
    lessonId: "uncertainty-ensembles",
    title: "Calibrate an uncertainty gate",
    outcome:
      "Build a small ensemble fixture, separate disagreement from outcome noise, and decide when a planner must abstain.",
    prerequisite: "Uncertainty and Ensembles",
    question:
      "Does a disagreement threshold reject held-out transitions with high error more often than an equal-rate random gate?",
    fixture:
      "five hand-authored ensemble prediction sets with reference next states",
    baseline: "a random gate with the same rejection count",
    changedCase:
      "two shared-bias cases where every ensemble member agrees and is wrong",
    metric: "error coverage, rejection precision, and retained-set error",
    failure:
      "Preserve a confident shared-bias miss and explain why disagreement alone cannot certify safety.",
    source: wmSources.mbrlSurvey,
  },
  {
    lessonId: "dyna-tdmpc-case-study",
    title: "Compare short-horizon planning with a terminal value",
    outcome:
      "Implement a tiny Dyna/TD-MPC-style planner that combines learned local transitions with a bootstrapped terminal value under a fixed model-call budget.",
    prerequisite: "Dyna and TD-MPC Case Study",
    question:
      "At 96 model transitions, does horizon-3 planning plus a calibrated terminal value choose the optimal first action more often than horizon-6 planning without a terminal value?",
    fixture:
      "a two-branch deterministic environment with six transitions per branch and reward only on the sixth transition",
    baseline: "matched-budget long shooting without terminal value",
    changedCase:
      "swap which branch contains the delayed reward without changing immediate rewards",
    metric:
      "first-action accuracy, discounted return, and model-transition count",
    failure:
      "Bias the terminal value toward the wrong branch and show when a longer rollout becomes preferable.",
    source: wmSources.tdmpc,
  },
  {
    lessonId: "foundation-world-models-case-study",
    title: "Build a foundation-world-model contract audit",
    outcome:
      "Create a sourced comparison of DreamerV3, MuZero, V-JEPA 2, and Genie without manufacturing a universal ranking.",
    prerequisite: "Foundation World Models Case Study",
    question:
      "Which family has the closest demonstrated interface for one chosen task after incompatible evidence columns are marked rather than averaged?",
    fixture:
      "a contract table with observations, actions, targets, planner, data, evaluation, evidence tier, and limits",
    baseline:
      "an aesthetic/scale-only ranking that must fail the contract gate",
    changedCase:
      "change the task from interactive video generation to image-goal robot planning and recompute the selection",
    metric: "required-interface coverage and unresolved deployment gates",
    failure:
      "Leave one action-interface cell unknown and show why the decision must abstain or become conditional.",
    source: wmSources.vjepa2,
  },
  {
    lessonId: "world-model-operations-case-study",
    title: "Design a staged world-model release",
    outcome:
      "Produce a versioned release bundle, shadow/canary protocol, telemetry trace, incident diagnosis, and rollback proof for a toy controller.",
    prerequisite: "Operating a World-Model Controller",
    question:
      "Does the staged gate detect a latent-schema or deadline regression before the candidate receives full authority?",
    fixture:
      "two versioned controller manifests plus deterministic proposal, monitor, actuator, and outcome traces",
    baseline: "a weights-only release with task-success monitoring",
    changedCase:
      "introduce a compatible-shape normalization change and a separate actuator-delay incident",
    metric: "gate detection, false alarm, deadline, and rollback compatibility",
    failure:
      "Attempt to mix encoder and dynamics versions and preserve the rejected manifest.",
    source: wmSources.rssmCode,
  },
  {
    lessonId: "world-model-research-capstone",
    title: "Run one falsifiable specialization study",
    outcome:
      "Choose objects, hierarchy, geometry, causality, or multimodality and publish a reproducible changed-case experiment with a null-result path.",
    prerequisite:
      "The shared curriculum through world-model operations plus one chosen specialization",
    question:
      "Under a pinned deterministic fixture and matched budget, does the chosen specialization satisfy a predeclared changed-case criterion better than a simpler baseline?",
    fixture:
      "one learner-selected dependency-free generator with a complete observation/action/target schema",
    baseline:
      "the simplest non-specialized mechanism that can attempt the same task",
    changedCase:
      "an unseen composition, horizon, transformation, intervention, or modality ablation chosen before final results",
    metric:
      "a predeclared task-specific score, uncertainty summary, and non-compensable failure gate",
    failure:
      "Retain the strongest counterexample and run one diagnostic intervention that can separate two causes.",
    source: wmSources.osfPreregistration,
  },
];

export const worldModelCapstoneProjects = Object.fromEntries(
  seeds.map((seed) => [seed.lessonId, project(seed)]),
) as Record<string, CapstoneProject>;

export const worldModelCapstoneEvidencePacks = Object.fromEntries(
  seeds.map((seed) => [
    seed.lessonId,
    {
      starter: {
        title: `${seed.title} evidence frame`,
        fields: [
          {
            field: "Question and falsifier",
            help: "Commit the comparison and rejection rule before final results.",
            example: seed.question,
          },
          {
            field: "Fixture and provenance",
            help: "Pin schemas, units, revision, seeds, and evidence tier.",
            example: seed.fixture,
          },
          {
            field: "Control and changed case",
            help: "Match budgets and identify the transfer condition.",
            example: `${seed.baseline}; changed case: ${seed.changedCase}`,
          },
          {
            field: "Decision and boundary",
            help: "Apply the metric and state what cannot be inferred.",
            example: `${seed.metric}; preserve this failure: ${seed.failure}`,
          },
        ],
      },
      reference: {
        title: `Complete evidence-contract reference for ${seed.title.toLowerCase()}`,
        sections: [
          {
            heading: "1 · Contract",
            content: `${seed.question} The reference uses ${seed.fixture}, pins every input/action/target and labels all values as deterministic teaching fixtures.`,
          },
          {
            heading: "2 · Matched fixture comparison",
            content: `The deterministic target-mechanism and ${seed.baseline} rows use the same declared cases, horizon, model-transition budget, seed policy, and evaluator. Raw fixture rows remain in the downloadable artifact; they are not an external execution claim.`,
          },
          {
            heading: "3 · Changed-case evidence",
            content: `The artifact includes this transfer fixture: ${sentence(seed.changedCase)} It also preserves this diagnostic failure row or explicit decision case: ${sentence(seed.failure)}`,
          },
          {
            heading: "4 · Decision boundary",
            content: `The predeclared evidence is ${seed.metric}. Passing supports only the fixture mechanism; it does not establish learned-model quality, real-system performance, or deployment safety.`,
          },
        ],
      },
      checks: [
        {
          label: "Question, fixture, and evidence tier are explicit",
          terms: ["question", "fixture", "deterministic"],
        },
        {
          label: "Baseline and changed case use matched budgets",
          terms: ["baseline", "changed", "budget"],
        },
        {
          label: "Failure, decision, and boundary are preserved",
          terms: ["failure", "decision", "boundary"],
        },
      ],
      sources: [
        {
          label: seed.source.title,
          kind:
            seed.source.kind === "Paper"
              ? "PRIMARY / FOUNDATIONAL PAPER"
              : seed.source.kind === "Documentation"
                ? "OFFICIAL / MUTABLE DOCUMENTATION"
                : "SECONDARY / EXPLANATORY SOURCE",
          revision: `${seed.source.kind} reviewed 14 Jul 2026; pin mutable artifacts before reproduction`,
          url: seed.source.url,
          readFor: seed.source.note,
        },
      ],
      ...specializedEvidencePack(seed),
    } satisfies CapstoneEvidencePack,
  ]),
) as Record<string, CapstoneEvidencePack>;

export const worldModelCapstoneArtifactFiles: Record<
  string,
  { label: string; url: string; contents: string[] }
> = Object.fromEntries(
  seeds.map((seed) => [
    seed.lessonId,
    {
      label: `${seed.title} · JSON`,
      url: publicPath(`capstone-artifacts/worldmodel/${seed.lessonId}.json`),
      contents: [
        ...(seed.lessonId === "foundation-world-models-case-study"
          ? [
              "two task contracts",
              "sourced interface rows",
              "unknown-cell gate",
              "changed-task decisions",
              "conditional selection boundary",
            ]
          : seed.lessonId === "world-model-operations-case-study"
            ? [
                "semantic manifests",
                "joined telemetry rows",
                "staged authority gates",
                "incident and mixed-revision failure",
                "atomic rollback proof",
              ]
            : [
                "pinned fixture",
                "raw changed-case rows",
                "matched baseline",
                "failure trace",
                "bounded decision",
              ]),
      ],
    },
  ]),
) as Record<string, { label: string; url: string; contents: string[] }>;
