import type { CapstoneEvidencePack } from "../capstone-evidence";
import type { CapstoneProject } from "../capstone-projects";
import { publicPath } from "../public-path";
import { embodiedSources } from "./sources";

type Seed = {
  lessonId: string;
  title: string;
  outcome: string;
  prerequisite: string;
  build: string;
  question: string;
  baseline: string;
  change: string;
  evidence: string;
  failure: string;
  source: keyof typeof embodiedSources;
  time: string;
  focusedTests: string[];
  smokeChecks: string;
};
const seeds: Seed[] = [
  {
    lessonId: "task-contract-capstone",
    title: "Build an embodied task contract",
    outcome:
      "Deliver a typed simulated task, oracle validation, failure injection, and evidence boundary.",
    prerequisite:
      "Task, observation/action, frame/time, and partial-observation contracts",
    build:
      "a versioned simulated task with synchronized packets, bounded actions, executable predicates, and event logs",
    question:
      "Does one injected interface fault trigger the declared containment without changing nominal mechanics?",
    baseline: "nominal oracle trace and replay equivalence",
    change: "one stale sensor, frame, action-bound, or force fault",
    evidence:
      "schemas, transitions, predicate events, requested/applied actions, stop/recovery, and replay hashes",
    failure: "the first assertion, stale packet, or containment miss",
    source: "robotics",
    time: "4–7 hours",
    focusedTests: ["test_task_fixture.py"],
    smokeChecks:
      "typed packet validation, exhaustive malformed-packet errors, replay identity, requested/applied separation, complete terminal-oracle validation, all four future/stale observation/action branches, wrong-frame rejection, and containment before position, velocity, sequence, terminal, or RNG state changes",
  },
  {
    lessonId: "state-estimator-capstone",
    title: "Build a multimodal state estimator",
    outcome:
      "Implement synchronized fusion and test calibration, identity, dropout, and recovery.",
    prerequisite: "Sensors, calibration, spatial representations, and tracking",
    build:
      "a camera-proprioception tracker with frames, validity, covariance, object identity, and evaluator-only truth",
    question:
      "How does one sensor degradation change error, calibration, decisions, and recovery?",
    baseline: "accepted synchronized estimator on held-out trajectories",
    change: "one delay, dropout, noise, outlier, or calibration shift",
    evidence:
      "packet ages, residuals, covariance, identity, calibration, abstention, decisions, and recovery",
    failure: "a confident wrong track or identity swap retained in the dossier",
    source: "probabilistic",
    time: "6–10 hours",
    focusedTests: ["test_estimator.py"],
    smokeChecks:
      "camera-to-world position and anisotropic-covariance transformation, nearest valid association, covariance update, future/stale camera and proprioception rejection, no-match abstention, identity preservation, replay identity, and evaluator-only truth",
  },
  {
    lessonId: "behavior-cloning-capstone",
    title: "Build a behavior-cloning policy",
    outcome:
      "Train a typed trajectory policy and expose compounding error in closed loop.",
    prerequisite:
      "Demonstrations, trajectory schemas, data audits, and action chunks",
    build:
      "an episode-split cloning policy with masked action targets, checkpoints, and simulator rollouts",
    question:
      "Does one recovery-data or chunk intervention improve changed-start behavior at matched training exposure?",
    baseline: "reproduced nominal cloning policy and critical-slice gates",
    change:
      "one start perturbation, recovery-data addition, class weight, or action-chunk setting",
    evidence:
      "loss by slice, support, requested/applied actions, first divergence, recovery, success, and constraints",
    failure: "an unsupported state-action sequence ending in intervention",
    source: "dagger",
    time: "7–12 hours; optional GPU",
    focusedTests: ["test_dataset.py", "test_policy.py", "test_resume.py"],
    smokeChecks:
      "whole-episode split isolation, mask/target shape, scaling round-trip, trainable masked loss, complete checkpoint resume, nominal closed loop, changed-start support departure, and requested/applied action logging",
  },
  {
    lessonId: "vla-policy-capstone",
    title: "Build a language-conditioned action policy",
    outcome:
      "Execute a matched causal-transformer-versus-diffusion action-decoder experiment behind one grounded interface.",
    prerequisite:
      "Grounding, multimodal tokens, causal action policies, and diffusion policies",
    build:
      "a vision-language-state encoder with typed action chunks, a trained one-head causal self-attention decoder with an action head, and a trained diffusion-style decoder",
    question:
      "Which decoder meets grounding, task, recovery, deadline, and safety gates under matched data and updates?",
    baseline:
      "shared encoder/action/evaluator contracts and an accepted masked-self-attention transformer baseline",
    change:
      "causal transformer versus diffusion-style decoder only, with clean targets, update count, action bounds, grounding cases, and evaluator held fixed",
    evidence:
      "lower-triangular attention weights, future-token-edit output invariance, transformer and diffusion losses, grounding counterfactuals, action distribution, calls, latency, success, recovery, and constraints",
    failure:
      "one grounding or deadline failure that aggregate success would hide",
    source: "diffusionPolicy",
    time: "8–14 hours; optional GPU",
    focusedTests: [
      "test_serializer.py",
      "test_causal_targets.py",
      "test_diffusion_actions.py",
    ],
    smokeChecks:
      "typed multimodal serialization, executed lower-triangular masked self-attention, future-token edits leaving earlier transformer outputs invariant, deterministic smoke/full transformer hashes, trainable transformer and diffusion objectives, language counterfactuals, deterministic bounded sampling, and the hard decoder-call gate",
  },
  {
    lessonId: "recovery-intervention-capstone",
    title: "Operate recovery and human control",
    outcome:
      "Operate bounded control with an independent watchdog, fallback, rollback, and explicit human resume.",
    prerequisite:
      "Feedback, model planning, skill contracts, and system identification",
    build:
      "a closed-loop controller with watchdog, safety envelope, fallback, intervention, and rollback ledger",
    question:
      "Does one fault get detected and contained within the predeclared authority and latency budgets?",
    baseline: "accepted nominal and fallback paths with precedence tests",
    change: "one sensor, model, dynamics, skill, deadline, or controller fault",
    evidence:
      "detection/stop latency, requested/applied command, authority, constraints, assisted/autonomous outcome, and recovery",
    failure: "a common-mode or delayed containment trace",
    source: "domainRandomization",
    time: "8–14 hours",
    focusedTests: ["test_watchdog.py", "test_authority.py", "test_rollback.py"],
    smokeChecks:
      "watchdog replacement of unsafe requests, rejection of future/stale camera ages, non-overridable stop precedence, reset on a bad packet, monotonic timestamps inside the declared freshness window, controller/RNG rollback, and a current unexpired human-resume receipt",
  },
  {
    lessonId: "embodied-research-capstone",
    title: "Run an original embodied-system study",
    outcome:
      "Reproduce one bounded policy and publish a controlled cross-course intervention.",
    prerequisite:
      "One complete embodied capstone plus evaluation and portable GPU evidence",
    build:
      "the pinned portable-linear-reach-v1 bounded proportional controller in the deterministic one-dimensional environment, with portable smoke/full profiles",
    question:
      "How does changing only controller gain from .35 to .55 affect final error across paired disturbances while deadline, action, assistance, horizon, and call gates stay fixed?",
    baseline:
      "portable-linear-reach-v1 at controller gain .35, implementation revision embodied-starter/2.0, passing the complete paired-row verifier",
    change:
      "controller gain .35 to .55 only, at matched initial state, disturbance sequence, horizon, action bound, calls, scheduled deadline ticks, seeds, and evaluation cells",
    evidence:
      "all seed/cell trajectories, paired effects, assistance, costs, failures, videos, checkpoints, and alternatives",
    failure:
      "a negative, null, crashed, assisted, or strongest counterexample run",
    source: "libero",
    time: "12–20 hours; optional GPU",
    focusedTests: ["test_research_study.py"],
    smokeChecks:
      "the pinned portable baseline revision, gains .35→.55, numpy==2.4.4 dependency, profile-specific seed matrix, complete paired rows, identical non-intervention conditions, recomputation of every trajectory and summary metric plus every paired effect, hard deadline gates, declared trace lengths, and fixed assistance/autonomy labeling",
  },
];

function project(s: Seed): CapstoneProject {
  return {
    lessonId: s.lessonId,
    title: s.title,
    outcome: s.outcome,
    estimatedTime: s.time,
    prerequisites: [
      s.prerequisite,
      "Python 3 and local deterministic checks",
      "Version control and evidence labels",
    ],
    materials: [
      s.build,
      `Downloadable NumPy-backed starter: ${publicPath("capstone-artifacts/embodied/embodied_capstone_starter.py")}`,
      `Pinned starter requirements: ${publicPath("capstone-artifacts/embodied/requirements-capstones.txt")}`,
      "Lesson code ladder and downloadable reviewed reference artifact",
      "Local CPU environment for required checks",
      "Optional pinned accelerator service for the labeled extension",
    ],
    deliverables: [
      {
        title: "Verified system",
        description: `Implement ${s.build} with manifests, assertions, and a failure log.`,
      },
      {
        title: "Controlled change",
        description: `Specify ${s.baseline}; then execute ${s.change} in your implementation.`,
      },
      {
        title: "Evidence dossier",
        description: `Preserve ${s.evidence} and make a bounded decision.`,
      },
    ],
    stages: [
      {
        id: "specify",
        title: "Specify the embodied decision",
        goal: "Make body, task, authority, and intervention falsifiable.",
        instructions: [
          s.question,
          `Pin ${s.build}.`,
          `Declare seeds/cells, primitive budgets, metrics, hard gates, assistance, stop rules, and falsifier.`,
        ],
        checkpoint:
          "Another learner can predict pass, fail, assisted, and invalid outcomes.",
        hint: "Name what the policy, simulator, evaluator, fallback, and human each own.",
        workspacePrompt:
          "Record question, hypothesis, interfaces, timing, seeds, cells, budgets, gates, authority, and falsifier.",
      },
      {
        id: "build",
        title: "Build and verify",
        goal: "Create the smallest complete system and prove local contracts.",
        instructions: [
          "From public/capstone-artifacts/embodied, install the pinned local dependency with: python3 -m pip install -r requirements-capstones.txt.",
          `Run the project-focused tests: python3 -m unittest ${s.focusedTests.map((name) => `tests/${name}`).join(" ")}. Then run the complete starter suite: python3 -m unittest discover -s tests -p 'test_*.py'.`,
          `Run the project smoke profile: python3 embodied_capstone_starter.py --project ${s.lessonId} --profile smoke --output ${s.lessonId}-smoke.json. Expect ${s.smokeChecks}.`,
          "Open the JSON and confirm schemaVersion, course, lessonId, evidenceKind, execution, manifest, checks, rawRows, artifacts, decision, and boundary are present. Acceptance requires every value in checks to be true and independent evidence recomputation to pass; either command exits nonzero otherwise.",
          `Inspect and extend the project-specific implementation of ${s.baseline}; retain its manifest, raw-row, executable-check, and evidence-boundary contracts.`,
          ...(s.lessonId === "behavior-cloning-capstone"
            ? [
                "Confirm behavior-cloning-capstone-smoke-bc-checkpoint.npz exists beside the JSON and that its hash matches the artifacts receipt before resume or intervention work.",
              ]
            : []),
          ...(s.lessonId === "vla-policy-capstone"
            ? [
                "Inspect the transformerEvidence receipt: verify every attention weight above the diagonal is zero, each row sums to one, a future action-token edit leaves earlier model outputs exactly unchanged, and the trained parameter hash reproduces for the selected smoke or full profile.",
                "After smoke acceptance, execute the deterministic full profile with: python3 embodied_capstone_starter.py --project vla-policy-capstone --profile full --output vla-policy-capstone-full.json. Then independently regenerate it with: python3 embodied_capstone_starter.py --verify-dossier vla-policy-capstone-full.json.",
              ]
            : []),
          ...(s.lessonId === "embodied-research-capstone"
            ? [
                "After smoke acceptance, run the bounded full matrix with: python3 embodied_capstone_starter.py --project embodied-research-capstone --profile full --output embodied-research-capstone-full.json.",
                "Independently recompute the smoke study gates with: python3 embodied_capstone_starter.py --verify-study embodied-research-capstone-smoke.json. Keep the verifier receipt with the dossier.",
              ]
            : [
                `Independently regenerate and verify every smoke check with: python3 embodied_capstone_starter.py --verify-dossier ${s.lessonId}-smoke.json. Keep the verifier receipt with the dossier.`,
              ]),
          `Run schema, shape, timing, action, predicate, leakage, checkpoint, replay, and failure-injection checks relevant to the system.`,
          `Preserve the first implementation failure and repair evidence.`,
        ],
        checkpoint:
          "The starter checks pass, then local system correctness and baseline acceptance pass before branching.",
        hint: "Do not train long while one frame, mask, action unit, replay state, or stop path remains unexplained.",
        workspacePrompt:
          "Record starter command/output, implementation command, invariant outputs, baseline rows, first discrepancy, and repair.",
      },
      {
        id: "intervene",
        title: "Run the changed case",
        goal: "Change one factor under paired evidence.",
        instructions: [
          `Branch from the accepted baseline checkpoint or replay state and execute exactly one change: ${s.change}.`,
          `Reconcile the Cartesian product of declared seeds/cells/arms before analysis; a missing row is a failure row unless a predeclared exclusion applies.`,
          `Preserve every row for ${s.evidence}.`,
          `Retain this failure: ${s.failure}.`,
        ],
        checkpoint:
          "Every declared seed/cell/arm has an artifact or predeclared exclusion, and matched primitive budgets agree.",
        hint: "Count data, interactions, updates, model calls, latency, assistance, and runtime separately.",
        workspacePrompt:
          "Paste the declared matrix, seed/cell rows, trajectories, failures, paired effects, budget reconciliation, and remaining confounds.",
      },
      {
        id: "decide",
        title: "Apply gates and package",
        goal: "Make a reversible evidence-based conclusion.",
        instructions: [
          "Apply constraint, grounding, authority, and deadline gates before task trade-offs.",
          "Write the strongest alternative explanation and next falsifying experiment.",
          "Export manifest, rows, trajectories/video, checkpoints, failures, analysis, and boundary.",
        ],
        checkpoint:
          "Human-readable report and machine-readable artifact agree.",
        hint: "A null or assisted result is complete when the protocol passed.",
        workspacePrompt:
          "Write decision, bounded claim, uncertainty, residual risk, alternatives, and next test.",
      },
    ],
    rubric: [
      {
        criterion: "Working system",
        developing: "Only a diagram or partial loop exists.",
        proficient: "End-to-end interfaces and local checks run.",
        excellent: "Timing, targets, authority, resume, and fault tests pass.",
      },
      {
        criterion: "Experimental control",
        developing: "Several factors or budgets change.",
        proficient: "One change and core budgets match.",
        excellent:
          "Paired seeds/cells, primitive costs, hard gates, and stop rules are predeclared.",
      },
      {
        criterion: "Failure learning",
        developing: "Failed or assisted episodes disappear.",
        proficient: "Failures and assistance remain diagnosed.",
        excellent: "A targeted retry distinguishes competing mechanisms.",
      },
      {
        criterion: "Evidence honesty",
        developing: "Simulation becomes a physical claim.",
        proficient:
          "Claims stay within system, simulator, seeds, cells, and budgets.",
        excellent:
          "Every stronger claim names missing evidence and reproduction.",
      },
    ],
    exemplar: {
      title: "A bounded embodied evidence-contract reference",
      summary: `The reference specifies ${s.build}, supplies an executable deterministic starter, predeclares ${s.baseline} and ${s.change}, and demonstrates how to preserve ${s.evidence} plus ${s.failure}. Its executed rows remain bounded to the local NumPy teaching environment and do not claim external-simulator or physical-robot evidence.`,
      decisions: [
        "Correctness checks required before a future comparison are explicit.",
        ...(s.lessonId === "vla-policy-capstone"
          ? [
              "The reference executes masked self-attention and verifies future-edit invariance on transformer outputs rather than inferring it from shifted inputs.",
            ]
          : ["All fixture rows and authority changes remain visible."]),
        "Hard-gate logic is demonstrated without inventing system performance.",
      ],
    },
    reflection: [
      "Which interface invariant prevented the most expensive mistaken run?",
      "Which simulator, support, timing, or authority confound could reverse the result?",
      "What next intervention most efficiently falsifies the conclusion?",
    ],
  };
}

export const embodiedCapstoneProjects = Object.fromEntries(
  seeds.map((s) => [s.lessonId, project(s)]),
) as Record<string, CapstoneProject>;
export const embodiedCapstoneEvidencePacks = Object.fromEntries(
  seeds.map((s) => [
    s.lessonId,
    {
      starter: {
        title: `${s.title} evidence frame`,
        fields: [
          {
            field: "Question and falsifier",
            help: "Commit before final runs.",
            example: s.question,
          },
          {
            field: "System and provenance",
            help: "Pin simulator, embodiment, policy, revisions, seeds/cells, and budgets.",
            example: s.build,
          },
          {
            field: "Baseline and change",
            help: "Name control and one intervention.",
            example: `${s.baseline}; ${s.change}`,
          },
          {
            field: "Evidence and failure",
            help: "Keep raw units, gates, assistance, and failure.",
            example: `${s.evidence}; ${s.failure}`,
          },
        ],
      },
      reference: {
        title: `Complete ${s.title.toLowerCase()} reference`,
        sections: [
          {
            heading: "1 · Contract",
            content: `${s.question} The fixture is ${s.build}; deterministic checks remain separate from sampled outcomes.`,
          },
          {
            heading: "2 · Runnable start",
            content: `From the artifact directory, install requirements-capstones.txt, run python3 -m unittest ${s.focusedTests.map((name) => `tests/${name}`).join(" ")}, then run python3 embodied_capstone_starter.py --project ${s.lessonId} --profile smoke --output ${s.lessonId}-smoke.json. Recompute it with ${s.lessonId === "embodied-research-capstone" ? "--verify-study" : "--verify-dossier"}.${s.lessonId === "vla-policy-capstone" ? " Repeat the same deterministic execution with --profile full --output vla-policy-capstone-full.json, then regenerate that dossier with --verify-dossier." : ""} The dossier must expose the eleven named top-level fields and every evidence-derived check must be true. This is real local project-specific execution, not external simulator or physical-robot evidence.`,
          },
          {
            heading: "3 · Baseline",
            content: `The baseline is ${s.baseline}. Correctness, replay or resume, and acceptance pass before branching.`,
          },
          {
            heading: "4 · Intervention",
            content: `The change is ${s.change}. Reconcile the full seed/cell/arm matrix and keep every declared row, including ${s.failure}.`,
          },
          {
            heading: "5 · Decision",
            content: `Evidence is ${s.evidence}. Apply hard gates first; the claim stays within the exact simulator, seeds, cells, and budgets.`,
          },
        ],
      },
      checks: [
        {
          label:
            "Question, embodiment, task, and independent unit are explicit",
          terms: ["question", "task", "seed"],
        },
        {
          label:
            "Runnable starter, working-system checks, and replay or resume pass",
          terms: ["starter", "check", "replay"],
        },
        {
          label: "Baseline and treatment primitive budgets match",
          terms: ["baseline", "treatment", "budget"],
        },
        {
          label: "Failure, assistance, uncertainty, and boundary are preserved",
          terms: ["failure", "uncertainty", "boundary"],
        },
      ],
      sources: [
        {
          label: embodiedSources[s.source].title,
          revision:
            "Primary or official source reviewed 15 Jul 2026; pin mutable implementations before execution",
          url: embodiedSources[s.source].url,
          readFor: embodiedSources[s.source].note,
          kind:
            embodiedSources[s.source].kind === "Paper"
              ? "PRIMARY / FOUNDATIONAL PAPER"
              : "OFFICIAL / TECHNICAL SOURCE",
        },
      ],
    } satisfies CapstoneEvidencePack,
  ]),
) as Record<string, CapstoneEvidencePack>;
export const embodiedCapstoneArtifactFiles = Object.fromEntries(
  seeds.map((s) => [
    s.lessonId,
    {
      label: `${s.title} · JSON`,
      url: publicPath(`capstone-artifacts/embodied/${s.lessonId}.json`),
      contents: [
        "starter command + expected checks",
        "implementation and acceptance contract",
        "complete raw seed/cell rows",
        "paired comparison",
        "failure/assistance trace",
        "bounded decision",
      ],
    },
  ]),
) as Record<string, { label: string; url: string; contents: string[] }>;
