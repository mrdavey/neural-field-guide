import type { CodeGuidance } from "./activity-info";
import { capstoneEvidencePacks, capstoneArtifactFiles, type CapstoneEvidencePack } from "./capstone-evidence";
import { capstoneProjects, type CapstoneProject } from "./capstone-projects";
import { lessonCodeExamples, type LessonCodeExample } from "./code-examples";
import { curriculumMinutes, learningPhases, lessonById, lessons, tracks, type Lesson } from "./course-data";
import { codeActivityGuidance } from "./activity-info";
import { lessonGuides, type LessonGuide, type ObjectiveCoverage } from "./lesson-guides";
import { lessonMotionStories, type LessonMotionStory } from "./lesson-motion";
import { lessonObjectiveCoverage } from "./lesson-objective-coverage";
import { worldModelCapstoneArtifactFiles, worldModelCapstoneEvidencePacks, worldModelCapstoneProjects } from "./world-models/capstones";
import { worldModelCodeExamples, worldModelCodeGuidance } from "./world-models/code-examples";
import {
  worldModelCurriculumMinutes,
  worldModelLearningPhases,
  worldModelLessonById,
  worldModelLessonGuides,
  worldModelLessons,
  worldModelMotionStories,
  worldModelObjectiveCoverage,
  worldModelTracks,
  worldModelTransferChecks,
} from "./world-models";
import type { WorldModelTransfer } from "./world-models/types";
import type { ResearchLabSpec } from "./research-courses/types";
import {
  generativeCapstoneArtifactFiles,
  generativeCapstoneEvidencePacks,
  generativeCapstoneProjects,
  generativeCodeExamples,
  generativeCodeGuidance,
  generativeCurriculumMinutes,
  generativeLearningPhases,
  generativeLessonById,
  generativeLessonGuides,
  generativeLessons,
  generativeMotionStories,
  generativeObjectiveCoverage,
  generativeResearchLabs,
  generativeSynthesisMaps,
  generativeTracks,
  generativeTransferChecks,
} from "./generative";
import {
  rlCapstoneArtifactFiles,
  rlCapstoneEvidencePacks,
  rlCapstoneProjects,
  rlCodeExamples,
  rlCodeGuidance,
  rlCurriculumMinutes,
  rlLearningPhases,
  rlLessonById,
  rlLessonGuides,
  rlLessons,
  rlMotionStories,
  rlObjectiveCoverage,
  rlResearchLabs,
  rlSynthesisMaps,
  rlTracks,
  rlTransferChecks,
} from "./rl";
import {
  embodiedCapstoneArtifactFiles,
  embodiedCapstoneEvidencePacks,
  embodiedCapstoneProjects,
  embodiedCodeExamples,
  embodiedCodeGuidance,
  embodiedCurriculumMinutes,
  embodiedLearningPhases,
  embodiedLessonById,
  embodiedLessonGuides,
  embodiedLessons,
  embodiedMotionStories,
  embodiedObjectiveCoverage,
  embodiedResearchLabs,
  embodiedSynthesisMaps,
  embodiedTracks,
  embodiedTransferChecks,
} from "./embodied";
import { generativeSources } from "./generative/sources";
import { rlSources } from "./rl/sources";

export const courseIds = ["llm", "worldmodel", "generative", "rl", "embodied"] as const;
export type CourseId = (typeof courseIds)[number];

export type CourseTrack = { id: string; title: string; short: string; description: string; outcome: string; role: "core" | "specialization"; color: string };
export type CoursePhase = { id: string; index: string; title: string; range: string; tracks: string[]; summary: string; milestone: string; lessonIds: string[] };
export type SynthesisDefinition = { title: string; intro: string; links: string[] };
export type CourseTheme = {
  accent: string;
  secondary: string;
  paperTint: string;
  motif: "token-grid" | "trajectory" | "distribution" | "control-loop" | "coordinate";
};

export type CourseDefinition = {
  id: CourseId;
  title: string;
  selectorLabel: string;
  subject: string;
  description: string;
  documentTitle: string;
  theme: CourseTheme;
  tracks: readonly CourseTrack[];
  phases: readonly CoursePhase[];
  lessons: Lesson[];
  lessonById: Record<string, Lesson>;
  curriculumMinutes: number;
  guides: Record<string, LessonGuide>;
  objectiveCoverage: Record<string, ObjectiveCoverage[]>;
  motionStories: Record<string, LessonMotionStory>;
  codeExamples: Record<string, LessonCodeExample>;
  codeGuidance: Record<string, CodeGuidance>;
  transfers?: Record<string, WorldModelTransfer>;
  researchLabs?: Record<string, ResearchLabSpec>;
  capstoneProjects: Record<string, CapstoneProject>;
  capstoneEvidencePacks: Record<string, CapstoneEvidencePack>;
  capstoneArtifactFiles: Record<string, { label: string; url: string; contents: string[] }>;
  synthesisMaps: Record<string, SynthesisDefinition>;
  sharedCoreLessonId: string;
  specializationTrackId: string;
  recommendedAfter: CourseId[];
  recommendedNext: CourseId[];
  maturity: "released";
  reviewedDate: string;
  homeSources?: { title: string; url: string; claim: string; readFor: string }[];
  campaign: {
    promise: string;
    why: string;
    payoffs: { label: string; title: string; body: string }[];
    finish: string;
  };
  hero: {
    heading: string;
    emphasis: string;
    lede: string;
    machineLabel: string;
    machineInput: string;
    machineToken: string;
    machineOutputLabel: string;
    machineOutput: string;
    storyTitle: string;
    storyIntro: string;
    storyLabels: string[];
    manifest: string;
    trace: {
      question: string;
      input: string;
      transformation: string;
      output: string;
      failure: string;
    };
  };
};

const llmSynthesisMaps: Record<string, SynthesisDefinition> = {
  optimizers: { title: "Explain one complete learning step", intro: "Connect representations, prediction feedback, responsibility, and the optimizer into one causal explanation of learning. The arithmetic trace is optional technical depth.", links: ["introduction", "tensors-shapes", "probability-softmax", "gradients-backprop"] },
  "gpt2-from-scratch": { title: "From diagram to running system", intro: "GPT-2 keeps the machinery legible; nanochat shows what seven years of systems progress changes around it.", links: ["tokenization", "embedding-layer", "positional-encoding", "attention", "learning-to-predict"] },
  "olmo3-case-study": { title: "Audit an open pre-training flow", intro: "OLMo 3 connects data mixtures, objectives, distributed training, checkpoints, and evaluations with inspectable evidence.", links: ["objectives-details", "scaling-laws", "data-engineering", "infrastructure", "pretraining-evaluation"] },
  "tulu3-case-study": { title: "Design the post-training stack", intro: "Tülu 3 establishes the general assistant recipe; DR Tulu extends it into tools, trajectories, and open-ended research rewards.", links: ["sft", "preference-optimization", "rl-fundamentals", "rlhf", "tools-safety"] },
  "test-time-compute": { title: "Design an inference service", intro: "Turn trained weights into a measurable generation system with explicit quality, memory, latency, and cost budgets.", links: ["decoding-sampling", "generation-kv-cache", "quantization-memory", "serving-systems"] },
  "observability-governance": { title: "Ship a dependable LLM system", intro: "Connect context, retrieval, tool execution, evaluation, security, tracing, and accountable operations.", links: ["context-engineering", "rag", "agent-loops", "evaluation-design", "security-privacy"] },
  "interpretability-editing": { title: "Make a defensible internal claim", intro: "Choose evidence and interventions that match the claim, then test whether a targeted edit changes anything else.", links: ["layers-of-understanding", "attention", "evaluation-design", "multimodal-models"] },
};

function phasesWithLessons(phases: readonly Omit<CoursePhase, "lessonIds">[], lessons: readonly Lesson[]): CoursePhase[] {
  return phases.map((phase) => {
    const match = phase.range.match(/Lessons (\d+)(?:–(\d+))?/);
    if (!match) throw new Error(`Course phase ${phase.id} needs a numeric lesson range`);
    const start = Number(match[1]);
    const end = Number(match[2] ?? match[1]);
    return { ...phase, lessonIds: lessons.filter((lesson) => lesson.number >= start && lesson.number <= end).map((lesson) => lesson.id) };
  });
}

const worldModelSynthesisMaps: Record<string, SynthesisDefinition> = {
  "belief-states-filtering": { title: "Build a partially observed tracker", intro: "Connect hidden state, action prediction, noisy evidence, normalization, and recovery in one inspectable filter.", links: ["sequential-state", "stochastic-futures", "mdps-bellman"] },
  "rssm-planet-case-study": { title: "Trace a recurrent state-space model", intro: "Join sensor encoding, deterministic memory, stochastic prior, posterior filtering, and prior-only imagination.", links: ["sensor-representations", "stochastic-latents-vaes", "action-conditioned-transitions", "recurrent-state-space"] },
  "uncertainty-ensembles": { title: "Design a world-model training run", intro: "Make targets, multistep learning, prior–posterior balance, replay coverage, and uncertainty visible in one evidence package.", links: ["prediction-targets", "multistep-overshooting", "latent-prior-posterior", "trajectory-data-replay"] },
  "dyna-tdmpc-case-study": { title: "Choose a planning architecture", intro: "Compare rollout depth, online search, terminal values, policy learning, and model exploitation under matched budgets.", links: ["imagined-rollouts", "shooting-cem", "model-predictive-control", "dreamer-imagination", "muzero-tree-search"] },
  "foundation-world-models-case-study": { title: "Audit foundation world-model contracts", intro: "Compare video tokens, future-generation objectives, latent actions, feature prediction, and interactive worlds without a false universal ranking.", links: ["video-tokenization", "autoregressive-diffusion-dynamics", "latent-actions-passive-video", "jepa-vjepa", "genie-interactive-worlds"] },
  "world-model-operations-case-study": { title: "Operate a bounded controller", intro: "Join evaluation, compounding error, robot transfer, identification, constraints, telemetry, and rollback.", links: ["world-model-evaluation", "compounding-error-exploitation", "goal-conditioned-robotics", "system-identification-sim-to-real", "safe-constrained-planning"] },
  "world-model-research-capstone": { title: "Publish one falsifiable specialization study", intro: "Choose one branch from the shared core and package its changed-case evidence, failure trace, and reproduction boundary.", links: ["object-centric-dynamics", "hierarchical-multiscale", "geometry-physical-priors", "causal-counterfactual-models", "language-multimodal-world-models"] },
};

const courseCampaigns: Record<CourseId, CourseDefinition["campaign"]> = {
  llm: {
    promise: "Stop treating language models like magic.",
    why: "Language models now shape how we write software, search knowledge, create media, and automate work. Understanding what happens beneath the chat box turns you from a spectator into someone who can build, evaluate, and challenge these systems with confidence.",
    payoffs: [
      { label: "See inside", title: "Trace every transformation", body: "Follow text through tokens, vectors, attention, logits, sampling, and the feedback loops that shape model behavior." },
      { label: "Build the stack", title: "Connect model to system", body: "Join training, post-training, inference, retrieval, tools, evaluation, and serving into one coherent engineering picture." },
      { label: "Think clearly", title: "Know what evidence can prove", body: "Separate fluent demos from reliable capability, benchmark movement from real usefulness, and model behavior from system safety." },
    ],
    finish: "Leave with a working mental model of the entire LLM stack—and the judgment to use it well.",
  },
  worldmodel: {
    promise: "Learn how machines imagine before they act.",
    why: "A world model gives an agent something more powerful than reflex: a way to represent hidden state, rehearse possible futures, and compare actions before reality pays the price. It is the bridge between prediction and purposeful behavior.",
    payoffs: [
      { label: "Represent", title: "Turn experience into state", body: "Build compact predictive state from partial, noisy observations without confusing a reconstruction with the world itself." },
      { label: "Imagine", title: "Plan inside learned futures", body: "Compare rollouts, search, control, and uncertainty while keeping model error and exploitation visible." },
      { label: "Operate", title: "Connect research to reality", body: "Reason about video models, robotics, constraints, telemetry, release gates, and the evidence needed for a defensible claim." },
    ],
    finish: "Finish able to design, interrogate, and safely operate systems that learn a world well enough to plan in it.",
  },
  generative: {
    promise: "Turn randomness into controlled creation.",
    why: "Generative models do more than produce striking samples: they offer different ways to represent probability, compress structure, transform noise, and steer what is possible. Learning the families side by side reveals which tool fits which creative or scientific problem.",
    payoffs: [
      { label: "Understand", title: "See the families as one map", body: "Connect likelihood models, latent variables, flows, energy methods, and diffusion through their probability and sampling interfaces." },
      { label: "Create", title: "Control what gets generated", body: "Work with conditions, guidance, inverse problems, multimodal signals, and the trade-offs between fidelity, diversity, and speed." },
      { label: "Research", title: "Move beyond attractive samples", body: "Design matched experiments, preserve seeds and budgets, diagnose missing modes or sampler bias, and make claims the evidence earns." },
    ],
    finish: "Complete the course with a principled generative toolkit and an original experiment you can defend.",
  },
  rl: {
    promise: "Teach systems to improve through consequences.",
    why: "Reinforcement learning is where prediction becomes decision-making. It explains how an agent can value delayed outcomes, explore an uncertain world, improve from experience, and still respect constraints that reward alone cannot express.",
    payoffs: [
      { label: "Reason", title: "See the decision loop clearly", body: "Separate state, action, reward, return, value, policy, and data so every update has an inspectable meaning." },
      { label: "Build", title: "Move from tables to deep agents", body: "Implement value methods, DQN, actor-critic, planning, offline learning, and model-based control as connected systems." },
      { label: "Evaluate", title: "Know when an agent truly improved", body: "Use matched budgets, multiple seeds, support checks, constraints, and failure evidence instead of trusting one impressive run." },
    ],
    finish: "Finish with the tools to build learning agents—and the discipline to tell progress from noise.",
  },
  embodied: {
    promise: "Bring intelligence out of the screen.",
    why: "Embodied AI forces every abstract capability to meet time, geometry, uncertainty, and consequence. A robot must connect language to perception, perception to state, state to action, and action to a physical outcome that can fail in ways a text demo never reveals.",
    payoffs: [
      { label: "Ground", title: "Connect language to the world", body: "Define tasks, frames, objects, state estimates, and success predicates precisely enough for a machine to act on them." },
      { label: "Control", title: "Close the loop under uncertainty", body: "Build policies, feedback, recovery, authority handoffs, and timing contracts that respond to what actually happened." },
      { label: "Prove", title: "Evaluate the system, not the demo", body: "Track requested versus applied actions, interventions, failures, latency, and matched experiments in a bounded simulation." },
    ],
    finish: "Complete the full perception–language–action loop and learn what it takes to make intelligence survive contact with reality.",
  },
};

export const courses: Record<CourseId, CourseDefinition> = {
  llm: {
    campaign: courseCampaigns.llm,
    id: "llm", title: "Large Language Models", selectorLabel: "LLMs", subject: "large language models", description: "From text pieces and attention to learning, alignment, and dependable language-model systems.", documentTitle: "Neural Field Guide — LLMs from First Token to Alignment",
    theme: { accent: "#ff7a45", secondary: "#ffd166", paperTint: "#f6e8de", motif: "token-grid" },
    tracks, phases: phasesWithLessons(learningPhases, lessons), lessons, lessonById, curriculumMinutes, guides: lessonGuides, objectiveCoverage: lessonObjectiveCoverage, motionStories: lessonMotionStories, codeExamples: lessonCodeExamples, codeGuidance: codeActivityGuidance,
    capstoneProjects, capstoneEvidencePacks, capstoneArtifactFiles, synthesisMaps: llmSynthesisMaps, sharedCoreLessonId: "observability-governance", specializationTrackId: "advanced", recommendedAfter: [], recommendedNext: ["worldmodel", "generative"], maturity: "released", reviewedDate: "13 Jul 2026",
    hero: { heading: "Understand the machine.", emphasis: "From first principles.", lede: "Start with the visible text-to-prediction loop, then add architecture, learning, serving, and safety. Formal mathematics stays available as optional depth after the mechanism is clear.", machineLabel: "THE LLM PIPELINE", machineInput: "“language”", machineToken: "tok_1842", machineOutputLabel: "next token", machineOutput: "model", storyTitle: "From a next-token rule to a dependable LLM system.", storyIntro: "Five cumulative phases add one layer of machinery at a time. The active diagram shows where each phase changes the system.", storyLabels: ["PREDICT", "REPRESENT", "TRAIN", "ALIGN", "DEPLOY"], manifest: "Lessons 01–40 form the cumulative foundations-to-deployment spine. Lessons 41–44 are parallel advanced specializations: choose them for your goal rather than treating their order as a prerequisite chain.", trace: { question: "How does one prefix become a checked next-token prediction?", input: "Prefix tokens [the, cat] enter as IDs with shape [1, 2].", transformation: "The decoder maps them to two vocabulary-logit rows; only the final row is normalized, for example P(sat)=0.62 and P(slept)=0.21.", output: "The sampler may choose sat, while evaluation compares the whole distribution with the actual next token—not merely the chosen word.", failure: "A missing causal mask can leak the target token during training; a fluent sample alone cannot prove correctness or safety." } },
  },
  worldmodel: {
    campaign: courseCampaigns.worldmodel,
    id: "worldmodel", title: "World Models", selectorLabel: "World Models", subject: "world models", description: "From observations, actions, and possible futures to imagination, planning, robotics, and bounded deployment.", documentTitle: "Neural Field Guide — World Models from State to Imagination",
    theme: { accent: "#63b3ff", secondary: "#57d6c7", paperTint: "#e7eff3", motif: "trajectory" },
    tracks: worldModelTracks, phases: phasesWithLessons(worldModelLearningPhases, worldModelLessons), lessons: worldModelLessons, lessonById: worldModelLessonById, curriculumMinutes: worldModelCurriculumMinutes, guides: worldModelLessonGuides, objectiveCoverage: worldModelObjectiveCoverage, motionStories: worldModelMotionStories, codeExamples: worldModelCodeExamples, codeGuidance: worldModelCodeGuidance, transfers: worldModelTransferChecks,
    capstoneProjects: worldModelCapstoneProjects, capstoneEvidencePacks: worldModelCapstoneEvidencePacks, capstoneArtifactFiles: worldModelCapstoneArtifactFiles, synthesisMaps: worldModelSynthesisMaps, sharedCoreLessonId: "world-model-operations-case-study", specializationTrackId: "wm-advanced", recommendedAfter: ["llm"], recommendedNext: ["generative", "rl"], maturity: "released", reviewedDate: "14 Jul 2026",
    hero: { heading: "Predict the world.", emphasis: "Act through imagination.", lede: "Start with observations, actions, and possible futures, then add learned state, planning, robotics, and operational evidence. Formal probability and control notation arrive only after the mechanism is familiar.", machineLabel: "THE WORLD-MODEL LOOP", machineInput: "observation", machineToken: "state + action", machineOutputLabel: "predicted consequence", machineOutput: "next-state distribution", storyTitle: "From one controlled transition to an operated world-model system.", storyIntro: "Six cumulative phases build predictive state, imagination, decision-making, foundation models, and deployment evidence before advanced branches.", storyLabels: ["STATE", "LEARN", "IMAGINE", "SCALE", "OPERATE", "SPECIALIZE"], manifest: "Lessons 01–40 form the shared spine through safe operation. Lessons 41–45 are parallel research specializations; Lesson 46 turns one chosen branch into a falsifiable final study.", trace: { question: "How can a candidate action change a prediction before it is executed?", input: "At position x=2.0 m, compare actions a=+0.5 m and a=-0.5 m.", transformation: "A declared transition x′=x+a predicts 2.5 m versus 1.5 m; a planner scores both imagined consequences against the goal at 2.4 m.", output: "The +0.5 m branch has 0.1 m predicted error and is conditionally preferred before actuator authority is granted.", failure: "Omitting the action makes both futures identical; model error or an out-of-support action can still make the imagined ranking wrong." } },
  },
  generative: {
    campaign: courseCampaigns.generative,
    id: "generative", title: "Generative Models", selectorLabel: "Generative Models", subject: "generative models", description: "From familiar randomness and sampling choices to latent models, diffusion, control, and original experiments.", documentTitle: "Neural Field Guide — Generative Models from Distributions to Research",
    theme: { accent: "#b59cff", secondary: "#ff8a5b", paperTint: "#eee8f5", motif: "distribution" },
    tracks: generativeTracks, phases: phasesWithLessons(generativeLearningPhases, generativeLessons), lessons: generativeLessons, lessonById: generativeLessonById, curriculumMinutes: generativeCurriculumMinutes, guides: generativeLessonGuides, objectiveCoverage: generativeObjectiveCoverage, motionStories: generativeMotionStories, codeExamples: generativeCodeExamples, codeGuidance: generativeCodeGuidance, transfers: generativeTransferChecks, researchLabs: generativeResearchLabs,
    capstoneProjects: generativeCapstoneProjects, capstoneEvidencePacks: generativeCapstoneEvidencePacks, capstoneArtifactFiles: generativeCapstoneArtifactFiles, synthesisMaps: generativeSynthesisMaps, sharedCoreLessonId: "generative-research-capstone", specializationTrackId: "__none__", recommendedAfter: ["llm", "worldmodel"], recommendedNext: ["rl", "embodied"], maturity: "released", reviewedDate: "15 Jul 2026",
    homeSources: [
      { title: generativeSources.deepLearning.title, url: generativeSources.deepLearning.url, claim: "Family map", readFor: "Verify why likelihood, latent-variable, and implicit sampling interfaces require different evidence." },
      { title: generativeSources.ddpm.title, url: generativeSources.ddpm.url, claim: "Denoising mechanism", readFor: "Trace the forward corruption objective and the assumptions behind reverse sampling." },
      { title: generativeSources.reproducibility.title, url: generativeSources.reproducibility.url, claim: "Research evidence", readFor: "Audit the code, data, compute, evaluation, and reporting fields required for the final original experiment." },
    ],
    hero: { heading: "Model possibility.", emphasis: "Then sample it.", lede: "Start with the familiar act of drawing different outcomes, then compare how model families create, steer, and evaluate them. Formal probability and implementation remain optional depth after the sampling idea is clear.", machineLabel: "THE GENERATIVE LOOP", machineInput: "data + condition", machineToken: "randomness + model", machineOutputLabel: "generated sample", machineOutput: "bounded evidence", storyTitle: "From a probability table to a controlled generative research system.", storyIntro: "Six build territories expose a different generative interface, then connect implementation, sampling, evaluation, safety, and research evidence.", storyLabels: ["DISTRIBUTION", "LATENT", "ENERGY", "DENOISE", "CONTROL", "RESEARCH"], manifest: "Lessons 01–30 build selected core families—autoregressive, latent-variable, flow, energy-based, and diffusion systems—then culminate in a matched original study. GANs and several specialized families are outside this course's current scope.", trace: { question: "How does randomness become a sample from a learned distribution?", input: "Draw z=0.25 from a declared base distribution and condition on class c=spiral.", transformation: "A generator maps (z,c) through its learned transformation; density-based families also track probability change, while diffusion repeatedly removes scheduled noise.", output: "The result is one conditional sample, so evaluation must aggregate many seeds and compare the resulting distribution with held-out data.", failure: "One attractive output cannot reveal missing modes, memorization, sampler bias, or whether the conditioning caused the change." } },
  },
  rl: {
    campaign: courseCampaigns.rl,
    id: "rl", title: "Reinforcement Learning & Control", selectorLabel: "RL & Control", subject: "reinforcement learning and control", description: "From action, consequence, and partial observation to deep, model-based, offline, safe, and original agent experiments.", documentTitle: "Neural Field Guide — Reinforcement Learning from Returns to Research",
    theme: { accent: "#e7bd4f", secondary: "#78d67a", paperTint: "#f2ecd9", motif: "control-loop" },
    tracks: rlTracks, phases: phasesWithLessons(rlLearningPhases, rlLessons), lessons: rlLessons, lessonById: rlLessonById, curriculumMinutes: rlCurriculumMinutes, guides: rlLessonGuides, objectiveCoverage: rlObjectiveCoverage, motionStories: rlMotionStories, codeExamples: rlCodeExamples, codeGuidance: rlCodeGuidance, transfers: rlTransferChecks, researchLabs: rlResearchLabs,
    capstoneProjects: rlCapstoneProjects, capstoneEvidencePacks: rlCapstoneEvidencePacks, capstoneArtifactFiles: rlCapstoneArtifactFiles, synthesisMaps: rlSynthesisMaps, sharedCoreLessonId: "rl-research-capstone", specializationTrackId: "__none__", recommendedAfter: ["llm", "worldmodel", "generative"], recommendedNext: ["embodied"], maturity: "released", reviewedDate: "15 Jul 2026",
    homeSources: [
      { title: rlSources.book.title, url: rlSources.book.url, claim: "Decision-and-value spine", readFor: "Verify the return, Bellman, temporal-difference, control, policy-gradient, and planning mechanisms that organize the course." },
      { title: rlSources.dqn.title, url: rlSources.dqn.url, claim: "Deep value learning", readFor: "Inspect why replay and a delayed target network enter the DQN system and which claims the original experiment can support." },
      { title: rlSources.safety.title, url: rlSources.safety.url, claim: "Constraint boundary", readFor: "Check why safety, risk, and exploration constraints remain separate from reward maximization in the course milestones." },
    ],
    hero: { heading: "Learn to decide.", emphasis: "Measure every consequence.", lede: "Start with action, consequence, and partial observation, then build value learning, policies, planning, safety, and research evidence. Formal equations follow the decision mechanism instead of leading it.", machineLabel: "THE CONTROL LOOP", machineInput: "observation", machineToken: "policy + action", machineOutputLabel: "consequence", machineOutput: "reward + next state", storyTitle: "From one transition to an evidence-bounded learning agent.", storyIntro: "Seven territories expose values, policies, models, logged behavior, constraints, and independent-run evidence as one cumulative control system.", storyLabels: ["LOOP", "VALUE", "DEEP Q", "POLICY", "IMAGINE", "OFFLINE", "RESEARCH"], manifest: "Lessons 01–32 build working tabular, deep-value, actor-critic, model-based, and offline agents, then culminate in a seed-level original study.", trace: { question: "How does a consequence change a later decision?", input: "In state s, action right yields reward 1 and next-state value 4; use discount γ=0.9.", transformation: "The one-step target is 1+0.9×4=4.6; a value or policy update assigns credit while keeping the behavior policy and data source explicit.", output: "The updated estimate can increase the probability of right on a later visit, but only within the evidence and support supplied by experience.", failure: "Treating reward as a supervised label hides delayed credit; one seed or off-policy data without support cannot establish a reliable improvement." } },
  },
  embodied: {
    campaign: courseCampaigns.embodied,
    id: "embodied", title: "Embodied AI", selectorLabel: "Embodied AI", subject: "embodied artificial intelligence", description: "From sensor-to-action tasks and partial observation to demonstrations, closed-loop control, and original embodied-system experiments.", documentTitle: "Neural Field Guide — Embodied AI from Sensors to Action",
    theme: { accent: "#ff8a5b", secondary: "#57d6c7", paperTint: "#f5e9e0", motif: "coordinate" },
    tracks: embodiedTracks, phases: phasesWithLessons(embodiedLearningPhases, embodiedLessons), lessons: embodiedLessons, lessonById: embodiedLessonById, curriculumMinutes: embodiedCurriculumMinutes, guides: embodiedLessonGuides, objectiveCoverage: embodiedObjectiveCoverage, motionStories: embodiedMotionStories, codeExamples: embodiedCodeExamples, codeGuidance: embodiedCodeGuidance, transfers: embodiedTransferChecks, researchLabs: embodiedResearchLabs,
    capstoneProjects: embodiedCapstoneProjects, capstoneEvidencePacks: embodiedCapstoneEvidencePacks, capstoneArtifactFiles: embodiedCapstoneArtifactFiles, synthesisMaps: embodiedSynthesisMaps, sharedCoreLessonId: "embodied-research-capstone", specializationTrackId: "__none__", recommendedAfter: ["llm", "worldmodel", "generative", "rl"], recommendedNext: [], maturity: "released", reviewedDate: "15 Jul 2026",
    hero: { heading: "Ground intelligence.", emphasis: "Close the physical loop.", lede: "Start with a concrete sensor-to-action task, then add perception, demonstrations, feedback control, recovery, and evidence. Frame notation and implementation stay optional until the physical loop is clear.", machineLabel: "THE EMBODIED LOOP", machineInput: "sensors + instruction", machineToken: "state + policy", machineOutputLabel: "applied action", machineOutput: "observed consequence", storyTitle: "From one sensor-action contract to an operated embodied research system.", storyIntro: "Six territories make task semantics, state estimation, data lineage, policy decoding, feedback, authority, and experimental evidence observable before any physical-world claim.", storyLabels: ["TASK", "PERCEIVE", "RECORD", "ACT", "CONTROL", "RESEARCH"], manifest: "Lessons 01–30 build a bounded perception-language-action system from first principles, finish each territory with an inspectable synthesis, and culminate in an original matched intervention study.", trace: { question: "How does a requested action become a verified physical consequence?", input: "At t=0, the camera estimates cube x=0.40 m and the instruction requests a grasp at x=0.42 m.", transformation: "The policy proposes +0.02 m; safety and actuator limits produce an applied command, then a fresh observation tests the grasp predicate and cube motion.", output: "Success requires the gripper and cube state to satisfy the declared task predicates—not merely a plausible requested trajectory.", failure: "Stale calibration, an ungrasped cube, clipped actuation, or a missed deadline can separate requested action from physical outcome." } },
  },
};

export const allLessonObjectiveCoverage = {
  llm: lessonObjectiveCoverage,
  worldmodel: worldModelObjectiveCoverage,
  generative: generativeObjectiveCoverage,
  rl: rlObjectiveCoverage,
  embodied: embodiedObjectiveCoverage,
} satisfies Record<CourseId, Record<string, ObjectiveCoverage[]>>;

export function isCourseId(value: string): value is CourseId {
  return (courseIds as readonly string[]).includes(value);
}
