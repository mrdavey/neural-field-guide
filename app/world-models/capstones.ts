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

function project(seed: CapstoneSeed): CapstoneProject {
  return {
    lessonId: seed.lessonId,
    title: seed.title,
    outcome: seed.outcome,
    estimatedTime: "2–4 hours",
    prerequisites: [seed.prerequisite, "Tensors, probability, and sequential state", "Evidence labels and deterministic local checks"],
    materials: [seed.fixture, "Paper, spreadsheet, or a dependency-free JavaScript/Python notebook", "The downloadable reference JSON", "Optional primary source for comparison—not required execution"],
    deliverables: [
      { title: "Pinned experiment contract", description: `Question, inputs/actions/targets, ${seed.baseline}, budget, seeds, and stop rule.` },
      { title: "Changed-case artifact", description: `${seed.changedCase}; retain raw values and at least one failed case.` },
      { title: "Decision note", description: `Apply ${seed.metric} and separate fixture evidence from external claims.` },
    ],
    stages: [
      { id: "orient", title: "Commit the learning question", goal: "Make the capstone falsifiable before building it.", instructions: [`Write: ${seed.question}`, `Define ${seed.fixture} including shapes, units, action timing, resets, and evidence label.`, `Set the ${seed.metric} threshold and a condition that rejects the hypothesis.`], checkpoint: "Another learner can predict exactly which result supports, rejects, or invalidates the study.", hint: "A question needs a comparison, changed case, matched budget, metric, and threshold—not a preference word such as better.", workspacePrompt: "Record the question, hypothesis, fixture, evidence tier, baseline, constants, threshold, and stop criteria." },
      { id: "build", title: "Build the inspectable mechanism", goal: "Produce the smallest implementation or explicit calculation that exposes every state change.", instructions: [`Implement or tabulate the target mechanism and ${seed.baseline}.`, "Assert tensor/time alignment, action bounds, termination, seed handling, and output schema.", "Run a hand-checkable example and compare it with an independent arithmetic or invariant check."], checkpoint: "The fixture reproduces from the recorded inputs and fails loudly when a contract is broken.", hint: "Prefer a five-state trace you can inspect over a large opaque training run.", workspacePrompt: "Paste the mechanism trace, assertions, expected values, actual values, and any discrepancy." },
      { id: "test", title: "Test transfer and failure", goal: "Use a changed case and a real comparison instead of replaying the teaching example.", instructions: [`Run ${seed.changedCase}.`, `Compare with ${seed.baseline} under identical samples, horizon, model calls, and evaluator.`, `Force or discover this failure: ${seed.failure} Preserve the raw trace and retry outcome.`], checkpoint: `The report computes ${seed.metric}, includes every trial, and does not remove an inconvenient failure.`, hint: "If the result changes when you alter a hidden constant, the comparison was not matched.", workspacePrompt: "Record raw result rows, metric calculation, uncertainty or range, failure diagnosis, and retry." },
      { id: "bound", title: "Decide, package, and bound", goal: "Turn the evidence into a reproducible course-scale conclusion.", instructions: ["Apply the precommitted decision rule without moving its threshold.", "Complete the artifact manifest: versions, fixture hash/spec, seeds, raw rows, checks, failures, and result.", "State what this deterministic fixture cannot establish and name one external or real-system experiment that would be required next."], checkpoint: "The JSON and readable note agree, a null result remains publishable, and every claim names its evidence source.", hint: "The strongest valid conclusion is often narrower than the original motivation.", workspacePrompt: "Write the decision, bounded claim, limitations, alternative explanation, and next discriminating experiment." },
    ],
    rubric: [
      { criterion: "Contract correctness", developing: "Key shapes, timing, or evidence source are implicit.", proficient: "Inputs, actions, targets, timing, and checks are explicit.", excellent: "Independent invariants catch realistic alignment and leakage failures." },
      { criterion: "Comparison quality", developing: "Shows only one attractive output.", proficient: "Uses a changed case and matched baseline.", excellent: "Predeclares threshold, reports uncertainty, and tests a leading alternative." },
      { criterion: "Failure learning", developing: "Failures are removed or described vaguely.", proficient: "Preserves and causally diagnoses at least one failure.", excellent: "A targeted retry distinguishes competing explanations." },
      { criterion: "Evidence honesty", developing: "Fixture results become model or deployment claims.", proficient: "Conclusion stays within the deterministic artifact.", excellent: "Links every wider claim to primary evidence and defines the next required reproduction." },
    ],
    exemplar: { title: "A complete evidence-contract approach", summary: `The reference specifies ${seed.fixture}, provides recomputable fixture rows comparing the target mechanism with ${seed.baseline}, includes ${seed.changedCase}, demonstrates how to compute ${seed.metric}, and preserves ${seed.failure} It does not claim a learned model or external system was executed.`, decisions: ["The threshold is specified before the final fixture rows.", "The declared expensive unit and every seed/case remain visible.", "The deterministic mechanism check stays separate from model-quality or real-world evidence."] },
    reflection: ["Which observation most strongly changed your prediction?", "What hidden assumption would most easily reverse the result?", "What new evidence would justify one stronger claim?"],
  };
}

const seeds: CapstoneSeed[] = [
  { lessonId: "belief-states-filtering", title: "Build a partially observed tracker", outcome: "Implement a two-state Bayes filter that predicts through actions, updates from noisy observations, and recovers after misleading evidence.", prerequisite: "Belief States and Bayesian Filtering", question: "After one misleading observation, does action-aware filtering preserve calibrated hidden-state mass and recover as later evidence arrives, even when hard choices tie a latest-observation baseline?", fixture: "a two-state hidden-world sequence with declared transition and observation tables", baseline: "the latest-observation classifier", changedCase: "a held-out trajectory whose second observation contradicts the still-hidden state before the state changes", metric: "the complete posterior-mass trace, normalization, hard-choice tie, and final mass on the true state", failure: "Use an observation likelihood of zero and show how smoothing or an explicit impossible-event policy changes recovery.", source: wmSources.planet },
  { lessonId: "rssm-planet-case-study", title: "Specify and trace a tiny RSSM", outcome: "Trace deterministic memory, stochastic prior, observation posterior, decoder, and imagination paths with exact shapes and information boundaries.", prerequisite: "RSSM and PlaNet Case Study", question: "Does posterior filtering correct a perturbed latent start faster than prior-only rollout in the deterministic state-space fixture?", fixture: "a scalar deterministic memory plus two-valued stochastic latent with three observation steps", baseline: "prior-only rollout from the same initial belief", changedCase: "an observation sequence whose second value contradicts the prior's mode", metric: "state error by horizon and prior–posterior gap", failure: "Leak the target observation into the prior once, then show the invariant that detects it.", source: wmSources.planet },
  { lessonId: "uncertainty-ensembles", title: "Calibrate an uncertainty gate", outcome: "Build a small ensemble fixture, separate disagreement from outcome noise, and decide when a planner must abstain.", prerequisite: "Uncertainty and Ensembles", question: "Does a disagreement threshold reject held-out transitions with high error more often than an equal-rate random gate?", fixture: "five hand-authored ensemble prediction sets with reference next states", baseline: "a random gate with the same rejection count", changedCase: "two shared-bias cases where every ensemble member agrees and is wrong", metric: "error coverage, rejection precision, and retained-set error", failure: "Preserve a confident shared-bias miss and explain why disagreement alone cannot certify safety.", source: wmSources.mbrlSurvey },
  { lessonId: "dyna-tdmpc-case-study", title: "Compare short-horizon planning with a terminal value", outcome: "Implement a tiny Dyna/TD-MPC-style planner that combines learned local transitions with a bootstrapped terminal value under a fixed model-call budget.", prerequisite: "Dyna and TD-MPC Case Study", question: "At 96 model transitions, does horizon-3 planning plus a calibrated terminal value choose the optimal first action more often than horizon-6 planning without a terminal value?", fixture: "a two-branch deterministic environment with six transitions per branch and reward only on the sixth transition", baseline: "matched-budget long shooting without terminal value", changedCase: "swap which branch contains the delayed reward without changing immediate rewards", metric: "first-action accuracy, discounted return, and model-transition count", failure: "Bias the terminal value toward the wrong branch and show when a longer rollout becomes preferable.", source: wmSources.tdmpc },
  { lessonId: "foundation-world-models-case-study", title: "Build a foundation-world-model contract audit", outcome: "Create a sourced comparison of DreamerV3, MuZero, V-JEPA 2, and Genie without manufacturing a universal ranking.", prerequisite: "Foundation World Models Case Study", question: "Which family has the closest demonstrated interface for one chosen task after incompatible evidence columns are marked rather than averaged?", fixture: "a contract table with observations, actions, targets, planner, data, evaluation, evidence tier, and limits", baseline: "an aesthetic/scale-only ranking that must fail the contract gate", changedCase: "change the task from interactive video generation to image-goal robot planning and recompute the selection", metric: "required-interface coverage and unresolved deployment gates", failure: "Leave one action-interface cell unknown and show why the decision must abstain or become conditional.", source: wmSources.vjepa2 },
  { lessonId: "world-model-operations-case-study", title: "Design a staged world-model release", outcome: "Produce a versioned release bundle, shadow/canary protocol, telemetry trace, incident diagnosis, and rollback proof for a toy controller.", prerequisite: "Operating a World-Model Controller", question: "Does the staged gate detect a latent-schema or deadline regression before the candidate receives full authority?", fixture: "two versioned controller manifests plus deterministic proposal, monitor, actuator, and outcome traces", baseline: "a weights-only release with task-success monitoring", changedCase: "introduce a compatible-shape normalization change and a separate actuator-delay incident", metric: "gate detection, false alarm, deadline, and rollback compatibility", failure: "Attempt to mix encoder and dynamics versions and preserve the rejected manifest.", source: wmSources.rssmCode },
  { lessonId: "world-model-research-capstone", title: "Run one falsifiable specialization study", outcome: "Choose objects, hierarchy, geometry, causality, or multimodality and publish a reproducible changed-case experiment with a null-result path.", prerequisite: "The shared curriculum through world-model operations plus one chosen specialization", question: "Under a pinned deterministic fixture and matched budget, does the chosen specialization satisfy a predeclared changed-case criterion better than a simpler baseline?", fixture: "one learner-selected dependency-free generator with a complete observation/action/target schema", baseline: "the simplest non-specialized mechanism that can attempt the same task", changedCase: "an unseen composition, horizon, transformation, intervention, or modality ablation chosen before final results", metric: "a predeclared task-specific score, uncertainty summary, and non-compensable failure gate", failure: "Retain the strongest counterexample and run one diagnostic intervention that can separate two causes.", source: wmSources.osfPreregistration },
];

export const worldModelCapstoneProjects = Object.fromEntries(seeds.map((seed) => [seed.lessonId, project(seed)])) as Record<string, CapstoneProject>;

export const worldModelCapstoneEvidencePacks = Object.fromEntries(seeds.map((seed) => [seed.lessonId, {
  starter: { title: `${seed.title} evidence frame`, fields: [
    { field: "Question and falsifier", help: "Commit the comparison and rejection rule before final results.", example: seed.question },
    { field: "Fixture and provenance", help: "Pin schemas, units, revision, seeds, and evidence tier.", example: seed.fixture },
    { field: "Control and changed case", help: "Match budgets and identify the transfer condition.", example: `${seed.baseline}; changed case: ${seed.changedCase}` },
    { field: "Decision and boundary", help: "Apply the metric and state what cannot be inferred.", example: `${seed.metric}; preserve this failure: ${seed.failure}` },
  ]},
  reference: { title: `Complete evidence-contract reference for ${seed.title.toLowerCase()}`, sections: [
    { heading: "1 · Contract", content: `${seed.question} The reference uses ${seed.fixture}, pins every input/action/target and labels all values as deterministic teaching fixtures.` },
    { heading: "2 · Matched fixture comparison", content: `The deterministic target-mechanism and ${seed.baseline} rows use the same declared cases, horizon, model-transition budget, seed policy, and evaluator. Raw fixture rows remain in the downloadable artifact; they are not an external execution claim.` },
    { heading: "3 · Changed-case evidence", content: `The artifact includes this transfer fixture: ${seed.changedCase} It also preserves this diagnostic failure row or explicit decision case: ${seed.failure}` },
    { heading: "4 · Decision boundary", content: `The predeclared evidence is ${seed.metric}. Passing supports only the fixture mechanism; it does not establish learned-model quality, real-system performance, or deployment safety.` },
  ]},
  checks: [{ label: "Question, fixture, and evidence tier are explicit", terms: ["question", "fixture", "deterministic"] }, { label: "Baseline and changed case use matched budgets", terms: ["baseline", "changed", "budget"] }, { label: "Failure, decision, and boundary are preserved", terms: ["failure", "decision", "boundary"] }],
  sources: [{ label: seed.source.title, kind: seed.source.kind === "Paper" ? "PRIMARY / FOUNDATIONAL PAPER" : seed.source.kind === "Documentation" ? "OFFICIAL / MUTABLE DOCUMENTATION" : "SECONDARY / EXPLANATORY SOURCE", revision: `${seed.source.kind} reviewed 14 Jul 2026; pin mutable artifacts before reproduction`, url: seed.source.url, readFor: seed.source.note }],
} satisfies CapstoneEvidencePack])) as Record<string, CapstoneEvidencePack>;

export const worldModelCapstoneArtifactFiles: Record<string, { label: string; url: string; contents: string[] }> = Object.fromEntries(seeds.map((seed) => [seed.lessonId, {
  label: `${seed.title} · JSON`,
  url: publicPath(`capstone-artifacts/worldmodel/${seed.lessonId}.json`),
  contents: ["pinned fixture", "raw changed-case rows", "matched baseline", "failure trace", "bounded decision"],
}])) as Record<string, { label: string; url: string; contents: string[] }>;
