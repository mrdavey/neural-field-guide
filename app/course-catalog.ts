import type { CodeGuidance } from "./activity-info";
import { capstoneEvidencePacks, capstoneArtifactFiles, type CapstoneEvidencePack } from "./capstone-evidence";
import { capstoneProjects, type CapstoneProject } from "./capstone-projects";
import { lessonCodeExamples, type LessonCodeExample } from "./code-examples";
import { curriculumMinutes, learningPhases, lessonById, lessons, tracks, type Lesson, type TrackId } from "./course-data";
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

export const courseIds = ["llm", "worldmodel"] as const;
export type CourseId = (typeof courseIds)[number];

export type CourseTrack = { id: TrackId; title: string; short: string; description: string; outcome: string; role: "core" | "specialization"; color: string };
export type CoursePhase = { id: string; index: string; title: string; range: string; tracks: TrackId[]; summary: string; milestone: string };
export type SynthesisDefinition = { title: string; intro: string; links: string[] };

export type CourseDefinition = {
  id: CourseId;
  title: string;
  selectorLabel: string;
  subject: string;
  description: string;
  documentTitle: string;
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
  capstoneProjects: Record<string, CapstoneProject>;
  capstoneEvidencePacks: Record<string, CapstoneEvidencePack>;
  capstoneArtifactFiles: Record<string, { label: string; url: string; contents: string[] }>;
  synthesisMaps: Record<string, SynthesisDefinition>;
  sharedCoreLessonId: string;
  specializationTrackId: TrackId;
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
  };
};

const llmSynthesisMaps: Record<string, SynthesisDefinition> = {
  optimizers: { title: "Trace one complete learning step", intro: "Connect shapes, probabilities, gradients, and the optimizer into one numerical explanation of learning.", links: ["introduction", "tensors-shapes", "probability-softmax", "gradients-backprop"] },
  "gpt2-from-scratch": { title: "From diagram to running system", intro: "GPT-2 keeps the machinery legible; nanochat shows what seven years of systems progress changes around it.", links: ["tokenization", "embedding-layer", "positional-encoding", "attention", "learning-to-predict"] },
  "olmo3-case-study": { title: "Audit an open pre-training flow", intro: "OLMo 3 connects data mixtures, objectives, distributed training, checkpoints, and evaluations with inspectable evidence.", links: ["objectives-details", "scaling-laws", "data-engineering", "infrastructure", "pretraining-evaluation"] },
  "tulu3-case-study": { title: "Design the post-training stack", intro: "Tülu 3 establishes the general assistant recipe; DR Tulu extends it into tools, trajectories, and open-ended research rewards.", links: ["sft", "preference-optimization", "rl-fundamentals", "rlhf", "tools-safety"] },
  "test-time-compute": { title: "Design an inference service", intro: "Turn trained weights into a measurable generation system with explicit quality, memory, latency, and cost budgets.", links: ["decoding-sampling", "generation-kv-cache", "quantization-memory", "serving-systems"] },
  "observability-governance": { title: "Ship a dependable LLM system", intro: "Connect context, retrieval, tool execution, evaluation, security, tracing, and accountable operations.", links: ["context-engineering", "rag", "agent-loops", "evaluation-design", "security-privacy"] },
  "interpretability-editing": { title: "Make a defensible internal claim", intro: "Choose evidence and interventions that match the claim, then test whether a targeted edit changes anything else.", links: ["layers-of-understanding", "attention", "evaluation-design", "multimodal-models"] },
};

const worldModelSynthesisMaps: Record<string, SynthesisDefinition> = {
  "belief-states-filtering": { title: "Build a partially observed tracker", intro: "Connect hidden state, action prediction, noisy evidence, normalization, and recovery in one inspectable filter.", links: ["sequential-state", "stochastic-futures", "mdps-bellman"] },
  "rssm-planet-case-study": { title: "Trace a recurrent state-space model", intro: "Join sensor encoding, deterministic memory, stochastic prior, posterior filtering, and prior-only imagination.", links: ["sensor-representations", "stochastic-latents-vaes", "action-conditioned-transitions", "recurrent-state-space"] },
  "uncertainty-ensembles": { title: "Design a world-model training run", intro: "Make targets, multistep learning, prior–posterior balance, replay coverage, and uncertainty visible in one evidence package.", links: ["prediction-targets", "multistep-overshooting", "latent-prior-posterior", "trajectory-data-replay"] },
  "dyna-tdmpc-case-study": { title: "Choose a planning architecture", intro: "Compare rollout depth, online search, terminal values, policy learning, and model exploitation under matched budgets.", links: ["imagined-rollouts", "shooting-cem", "model-predictive-control", "dreamer-imagination", "muzero-tree-search"] },
  "foundation-world-models-case-study": { title: "Audit foundation world-model contracts", intro: "Compare video tokens, future-generation objectives, latent actions, feature prediction, and interactive worlds without a false universal ranking.", links: ["video-tokenization", "autoregressive-diffusion-dynamics", "latent-actions-passive-video", "jepa-vjepa", "genie-interactive-worlds"] },
  "world-model-operations-case-study": { title: "Operate a bounded controller", intro: "Join evaluation, compounding error, robot transfer, identification, constraints, telemetry, and rollback.", links: ["world-model-evaluation", "compounding-error-exploitation", "goal-conditioned-robotics", "system-identification-sim-to-real", "safe-constrained-planning"] },
  "world-model-research-capstone": { title: "Publish one falsifiable specialization study", intro: "Choose one branch from the shared core and package its changed-case evidence, failure trace, and reproduction boundary.", links: ["object-centric-dynamics", "hierarchical-multiscale", "geometry-physical-priors", "causal-counterfactual-models", "language-multimodal-world-models"] },
};

export const courses: Record<CourseId, CourseDefinition> = {
  llm: {
    id: "llm", title: "Large Language Models", selectorLabel: "LLMs", subject: "large language models", description: "From numerical foundations to dependable language-model systems.", documentTitle: "Neural Field Guide — LLMs from First Token to Alignment",
    tracks, phases: learningPhases, lessons, lessonById, curriculumMinutes, guides: lessonGuides, objectiveCoverage: lessonObjectiveCoverage, motionStories: lessonMotionStories, codeExamples: lessonCodeExamples, codeGuidance: codeActivityGuidance,
    capstoneProjects, capstoneEvidencePacks, capstoneArtifactFiles, synthesisMaps: llmSynthesisMaps, sharedCoreLessonId: "observability-governance", specializationTrackId: "advanced",
    hero: { heading: "Understand the machine.", emphasis: "From first principles.", lede: "Start with next-token prediction, then build the mathematical, architectural, training, serving, and safety ideas that make an LLM system work.", machineLabel: "THE LLM PIPELINE", machineInput: "“language”", machineToken: "tok_1842", machineOutputLabel: "next token", machineOutput: "model", storyTitle: "From a next-token rule to a dependable LLM system.", storyIntro: "Five cumulative phases add one layer of machinery at a time. The active diagram shows where each phase changes the system.", storyLabels: ["PREDICT", "REPRESENT", "TRAIN", "ALIGN", "DEPLOY"], manifest: "Lessons 01–44 move from tensor operations and next-token prediction to training, inference, dependable applications, and advanced specializations." },
  },
  worldmodel: {
    id: "worldmodel", title: "World Models", selectorLabel: "World Models", subject: "world models", description: "From controlled prediction and hidden state to imagination, planning, robotics, and bounded deployment.", documentTitle: "Neural Field Guide — World Models from State to Imagination",
    tracks: worldModelTracks, phases: worldModelLearningPhases, lessons: worldModelLessons, lessonById: worldModelLessonById, curriculumMinutes: worldModelCurriculumMinutes, guides: worldModelLessonGuides, objectiveCoverage: worldModelObjectiveCoverage, motionStories: worldModelMotionStories, codeExamples: worldModelCodeExamples, codeGuidance: worldModelCodeGuidance, transfers: worldModelTransferChecks,
    capstoneProjects: worldModelCapstoneProjects, capstoneEvidencePacks: worldModelCapstoneEvidencePacks, capstoneArtifactFiles: worldModelCapstoneArtifactFiles, synthesisMaps: worldModelSynthesisMaps, sharedCoreLessonId: "world-model-operations-case-study", specializationTrackId: "wm-advanced",
    hero: { heading: "Predict the world.", emphasis: "Act through imagination.", lede: "Start with controlled state transitions, then build the representations, training objectives, planners, video models, evaluation, robotics, and safety contracts that make a world model useful.", machineLabel: "THE WORLD-MODEL LOOP", machineInput: "observation", machineToken: "state + action", machineOutputLabel: "predicted consequence", machineOutput: "next state", storyTitle: "From one controlled transition to an operated world-model system.", storyIntro: "Six cumulative phases build predictive state, imagination, decision-making, foundation models, and deployment evidence before advanced branches.", storyLabels: ["STATE", "LEARN", "IMAGINE", "SCALE", "OPERATE"], manifest: "Lessons 01–46 move from hidden-state foundations through latent dynamics, planning, video and foundation models, evaluation, robotics, safe operation, and advanced research branches." },
  },
};

export const allLessonObjectiveCoverage = {
  llm: lessonObjectiveCoverage,
  worldmodel: worldModelObjectiveCoverage,
} satisfies Record<CourseId, Record<string, ObjectiveCoverage[]>>;

export function isCourseId(value: string): value is CourseId {
  return (courseIds as readonly string[]).includes(value);
}

