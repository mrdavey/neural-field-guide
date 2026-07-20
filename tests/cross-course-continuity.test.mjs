import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { buildCoursePageReaderSnapshots } from "../scripts/course-page-reader-snapshot.mjs";

const courseCounts = { worldmodel: 46, generative: 30, rl: 32, embodied: 30 };
const snapshots = buildCoursePageReaderSnapshots();
const architecture = await readFile(new URL("../docs/CURRICULUM_ARCHITECTURE.md", import.meta.url), "utf8");

function handoffsFor(courseId) {
  const pages = snapshots.filter((snapshot) => snapshot.courseId === courseId);
  const lessons = pages.filter((snapshot) => snapshot.pageType === "lesson");
  const handoffs = new Map();
  const add = (from, to, relationship) => handoffs.set(`${from}->${to}`, { from, to, relationship });

  add("home", lessons[0].id, "extension");
  for (const lesson of lessons) {
    const next = lesson.blocks.find((block) => block.surface === "lesson.next");
    if (next?.relationship && next.next) add(lesson.id, next.next.lessonId, next.relationship);
    if (next?.choices) {
      for (const choice of next.choices) add(next.entryLessonId, choice.lessonId, choice.relationship);
      if (next.synthesis) add(next.entryLessonId, next.synthesis.lessonId, next.synthesis.relationship);
    }
  }
  return handoffs;
}

const directReuseFindings = new Set([
  "worldmodel:world-models->dynamics-tensors",
  "worldmodel:dynamics-tensors->stochastic-futures",
  "worldmodel:stochastic-futures->learning-dynamics",
  "worldmodel:system-identification-sim-to-real->safe-constrained-planning",
  "generative:generation-as-distribution->likelihood-cross-entropy",
  "generative:likelihood-cross-entropy->sampling-randomness",
  "generative:latent-variable-models->amortized-inference-elbo",
  "generative:amortized-inference-elbo->vae-posterior-collapse",
  "rl:sequential-decision-systems->mdps-rewards",
  "rl:learned-dynamics-control->shooting-mpc",
  "rl:dyna-imagination->model-uncertainty-exploitation",
  "rl:safe-constrained-rl->reproducible-rl-gpu",
  "embodied:embodied-task-contracts->observation-action-spaces",
  "embodied:cameras-proprioception->calibration-transforms",
]);

const newThreadFindings = new Set([
  "worldmodel:dyna-tdmpc-case-study->video-tokenization",
  "worldmodel:latent-actions-passive-video->jepa-vjepa",
  "generative:latent-models-capstone->change-of-variables",
  "embodied:state-estimator-capstone->teleoperation-demonstrations",
  "embodied:behavior-cloning-capstone->language-grounding",
]);

const synthesisFindings = new Set([
  "worldmodel:jepa-vjepa->genie-interactive-worlds",
  "worldmodel:world-model-operations-case-study->world-model-research-capstone",
]);

function expectedFindingRelationship(finding) {
  const key = `${finding.courseId}:${finding.key}`;
  if (directReuseFindings.has(key)) return "direct reuse";
  if (newThreadFindings.has(key)) return "new chapter thread";
  if (synthesisFindings.has(key)) return "synthesis";
  return "extension";
}

const findings = [
  ["worldmodel", "world-models", "dynamics-tensors", "high"],
  ["worldmodel", "dynamics-tensors", "stochastic-futures", "medium"],
  ["worldmodel", "stochastic-futures", "learning-dynamics", "high"],
  ["worldmodel", "learning-dynamics", "sequential-state", "high"],
  ["worldmodel", "differentiable-planning", "actor-critic-lambda", "high"],
  ["worldmodel", "dyna-tdmpc-case-study", "video-tokenization", "high"],
  ["worldmodel", "latent-actions-passive-video", "jepa-vjepa", "high"],
  ["worldmodel", "jepa-vjepa", "genie-interactive-worlds", "high"],
  ["worldmodel", "goal-conditioned-robotics", "system-identification-sim-to-real", "medium"],
  ["worldmodel", "system-identification-sim-to-real", "safe-constrained-planning", "medium"],
  ["worldmodel", "world-model-operations-case-study", "object-centric-dynamics", "high"],
  ["worldmodel", "world-model-operations-case-study", "hierarchical-multiscale", "low"],
  ["worldmodel", "world-model-operations-case-study", "geometry-physical-priors", "low"],
  ["worldmodel", "world-model-operations-case-study", "causal-counterfactual-models", "low"],
  ["worldmodel", "world-model-operations-case-study", "language-multimodal-world-models", "low"],
  ["worldmodel", "world-model-operations-case-study", "world-model-research-capstone", "high"],

  ["generative", "generation-as-distribution", "likelihood-cross-entropy", "high"],
  ["generative", "likelihood-cross-entropy", "sampling-randomness", "medium"],
  ["generative", "sampling-randomness", "divergences-distance", "medium"],
  ["generative", "latent-variable-models", "amortized-inference-elbo", "high"],
  ["generative", "amortized-inference-elbo", "vae-posterior-collapse", "high"],
  ["generative", "latent-models-capstone", "change-of-variables", "medium"],
  ["generative", "diffusion-model-capstone", "conditional-generation", "medium"],
  ["generative", "classifier-free-guidance", "inverse-problems-editing", "medium"],
  ["generative", "generative-data-systems", "memorization-privacy", "medium"],
  ["generative", "memorization-privacy", "matched-budget-evaluation", "medium"],

  ["rl", "sequential-decision-systems", "mdps-rewards", "high"],
  ["rl", "mdps-rewards", "partial-observation", "medium"],
  ["rl", "partial-observation", "policies-occupancy", "medium"],
  ["rl", "dynamic-programming", "monte-carlo-estimation", "medium"],
  ["rl", "learned-dynamics-control", "shooting-mpc", "high"],
  ["rl", "shooting-mpc", "dyna-imagination", "medium"],
  ["rl", "dyna-imagination", "model-uncertainty-exploitation", "high"],
  ["rl", "covariate-shift-dagger", "offline-rl-coverage", "medium"],
  ["rl", "rl-evaluation-seeds", "safe-constrained-rl", "medium"],
  ["rl", "safe-constrained-rl", "reproducible-rl-gpu", "medium"],

  ["embodied", "embodied-task-contracts", "observation-action-spaces", "low"],
  ["embodied", "observation-action-spaces", "coordinate-frames-time", "medium"],
  ["embodied", "coordinate-frames-time", "embodied-partial-observation", "low"],
  ["embodied", "cameras-proprioception", "calibration-transforms", "low"],
  ["embodied", "state-estimator-capstone", "teleoperation-demonstrations", "medium"],
  ["embodied", "robot-data-quality", "action-representations-chunking", "low"],
  ["embodied", "behavior-cloning-capstone", "language-grounding", "medium"],
  ["embodied", "transformer-action-policies", "diffusion-policies", "medium"],
  ["embodied", "feedback-control", "world-model-robot-planning", "low"],
  ["embodied", "world-model-robot-planning", "hierarchical-skills", "low"],
  ["embodied", "hierarchical-skills", "sim-to-real-identification", "low"],
  ["embodied", "robustness-generalization", "latency-safety-operations", "low"],
].map(([courseId, from, to, severity]) => ({ courseId, from, to, severity, key: `${from}->${to}` }));

const independentReviewGaps = [
  ["generative", "autoregressive-generators", "latent-variable-models", "medium", "extension"],
  ["generative", "normalizing-flows", "energy-based-models", "medium", "extension"],
  ["generative", "inverse-problems-editing", "compositional-control", "medium", "extension"],
].map(([courseId, from, to, severity, relationship]) => ({
  courseId,
  from,
  to,
  severity,
  relationship,
  key: `${from}->${to}`,
}));

const sectionBoundaries = [
  ["worldmodel", "home", "world-models", "extension"],
  ["worldmodel", "belief-states-filtering", "sensor-representations", "direct reuse"],
  ["worldmodel", "rssm-planet-case-study", "prediction-targets", "direct reuse"],
  ["worldmodel", "uncertainty-ensembles", "imagined-rollouts", "direct reuse"],
  ["worldmodel", "dyna-tdmpc-case-study", "video-tokenization", "new chapter thread"],
  ["worldmodel", "foundation-world-models-case-study", "world-model-evaluation", "direct reuse"],
  ["worldmodel", "world-model-operations-case-study", "object-centric-dynamics", "extension"],
  ["worldmodel", "world-model-operations-case-study", "hierarchical-multiscale", "extension"],
  ["worldmodel", "world-model-operations-case-study", "geometry-physical-priors", "extension"],
  ["worldmodel", "world-model-operations-case-study", "causal-counterfactual-models", "extension"],
  ["worldmodel", "world-model-operations-case-study", "language-multimodal-world-models", "extension"],
  ["worldmodel", "world-model-operations-case-study", "world-model-research-capstone", "synthesis"],

  ["generative", "home", "generation-as-distribution", "extension"],
  ["generative", "distribution-workbench-capstone", "autoregressive-generators", "new chapter thread"],
  ["generative", "latent-models-capstone", "change-of-variables", "new chapter thread"],
  ["generative", "flow-energy-capstone", "corruption-denoising", "new chapter thread"],
  ["generative", "diffusion-model-capstone", "conditional-generation", "extension"],
  ["generative", "conditional-safety-capstone", "generative-data-systems", "new chapter thread"],

  ["rl", "home", "sequential-decision-systems", "extension"],
  ["rl", "tabular-control-capstone", "dynamic-programming", "direct reuse"],
  ["rl", "value-methods-capstone", "function-approximation", "direct reuse"],
  ["rl", "deep-value-capstone", "policy-gradients", "new chapter thread"],
  ["rl", "on-policy-capstone", "learned-dynamics-control", "new chapter thread"],
  ["rl", "model-based-capstone", "behavior-cloning", "new chapter thread"],
  ["rl", "sequence-policy-capstone", "rl-evaluation-seeds", "new chapter thread"],

  ["embodied", "home", "embodied-task-contracts", "extension"],
  ["embodied", "task-contract-capstone", "cameras-proprioception", "new chapter thread"],
  ["embodied", "state-estimator-capstone", "teleoperation-demonstrations", "new chapter thread"],
  ["embodied", "behavior-cloning-capstone", "language-grounding", "new chapter thread"],
  ["embodied", "vla-policy-capstone", "feedback-control", "new chapter thread"],
  ["embodied", "recovery-intervention-capstone", "embodied-evaluation-suites", "new chapter thread"],
].map(([courseId, from, to, relationship]) => ({ courseId, from, to, relationship, key: `${from}->${to}` }));

test("the cross-course continuity audit accounts for all 138 canonical handoffs", () => {
  let total = 0;
  for (const [courseId, expected] of Object.entries(courseCounts)) {
    const handoffs = handoffsFor(courseId);
    assert.equal(handoffs.size, expected, `${courseId} handoff population`);
    total += handoffs.size;
  }
  assert.equal(total, 138);
  assert.equal(findings.length, 48);
  assert.equal(138 - findings.length, 90, "all non-finding seams received a semantic pass");
});

test("every initial finding identifies a real unique seam with severity and maintained evidence", () => {
  const keys = new Set();
  for (const finding of findings) {
    assert.equal(handoffsFor(finding.courseId).has(finding.key), true, `${finding.courseId}:${finding.key}`);
    assert.equal(keys.has(`${finding.courseId}:${finding.key}`), false, `duplicate ${finding.courseId}:${finding.key}`);
    assert.ok(["high", "medium", "low"].includes(finding.severity));
    keys.add(`${finding.courseId}:${finding.key}`);
    assert.ok(architecture.includes(`\`${finding.from}\` → \`${finding.to}\``), `architecture evidence for ${finding.courseId}:${finding.key}`);
  }
});

test("all 48 findings now have an authored bridge and an honest relationship", () => {
  for (const finding of findings) {
    const handoff = handoffsFor(finding.courseId).get(finding.key);
    assert.equal(handoff.relationship, expectedFindingRelationship(finding), `${finding.courseId}:${finding.key} relationship`);
    const destination = snapshots.find((snapshot) => snapshot.courseId === finding.courseId && snapshot.id === finding.to);
    const bridge = destination.blocks.find((block) => block.surface === "lesson.narrativeOpening").prerequisiteContext.prose[0];
    assert.ok(bridge.length >= 170, `${finding.courseId}:${finding.to} bridge is substantial`);
    assert.ok((bridge.match(/[.!?](?:\s|$)/g) ?? []).length >= 2, `${finding.courseId}:${finding.to} bridge connects multiple causal claims`);
    assert.doesNotMatch(bridge, /This chapter starts a new branch/, `${finding.courseId}:${finding.to} does not fall back to generic copy`);
  }
});

test("the independent blind review's three additional gaps have explicit repaired handoffs", () => {
  assert.equal(independentReviewGaps.length, 3);
  for (const gap of independentReviewGaps) {
    const handoff = handoffsFor(gap.courseId).get(gap.key);
    assert.ok(handoff, `${gap.courseId}:${gap.key}`);
    assert.equal(handoff.relationship, gap.relationship, `${gap.courseId}:${gap.key} relationship`);
    const destination = snapshots.find((snapshot) => snapshot.courseId === gap.courseId && snapshot.id === gap.to);
    const bridge = destination.blocks.find((block) => block.surface === "lesson.narrativeOpening").prerequisiteContext.prose[0];
    assert.ok(bridge.length >= 170, `${gap.courseId}:${gap.to} bridge is substantial`);
    assert.ok((bridge.match(/[.!?](?:\s|$)/g) ?? []).length >= 2, `${gap.courseId}:${gap.to} bridge connects multiple causal claims`);
    assert.doesNotMatch(bridge, /This chapter starts a new branch/, `${gap.courseId}:${gap.to} does not fall back to generic copy`);
  }
});

test("all home, track, and advanced-branch entry boundaries are explicitly classified", () => {
  assert.equal(sectionBoundaries.length, 31);
  for (const boundary of sectionBoundaries) {
    const handoff = handoffsFor(boundary.courseId).get(boundary.key);
    assert.ok(handoff, `${boundary.courseId}:${boundary.key}`);
    assert.equal(handoff.relationship, boundary.relationship, `${boundary.courseId}:${boundary.key} classification`);
    assert.ok(["direct reuse", "extension", "synthesis", "new chapter thread"].includes(boundary.relationship));
  }
  for (const phrase of ["138 canonical handoffs", "90 pass", "48 partial", "0 fail", "parallel advanced branches are counted from their shared entry prerequisite"]) {
    assert.match(architecture.toLowerCase(), new RegExp(phrase.toLowerCase()), phrase);
  }
  assert.match(architecture, /48 repaired/);
  assert.match(architecture, /three additional gaps/);
  assert.match(architecture, /138 pass, 0 partial, and 0 fail/);
  assert.match(architecture, /51 authored bridges/);
});
