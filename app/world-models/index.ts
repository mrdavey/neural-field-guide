import type { Lesson, TrackId } from "../course-data";
import type { LessonGuide, ObjectiveCoverage } from "../lesson-guides";
import type { LessonMotionStory } from "../lesson-motion";
import { worldModelAdvancedSpecs } from "./sections/advanced";
import { worldModelDeploymentSpecs } from "./sections/deployment";
import { worldModelFoundationModelSpecs } from "./sections/foundation-models";
import { worldModelFoundationSpecs } from "./sections/foundations";
import { worldModelPlanningSpecs } from "./sections/planning";
import { worldModelRepresentationSpecs } from "./sections/representations";
import { worldModelTrainingSpecs } from "./sections/training";
import type { WorldModelLessonSpec, WorldModelTransfer } from "./types";

export const worldModelTracks = [
  { id: "wm-foundations" as const, title: "Foundations", short: "Define the prediction problem", description: "Build the state, probability, control, and sequential reasoning every world model needs.", outcome: "Trace one partially observed controlled transition.", role: "core" as const, color: "#f59eaf" },
  { id: "wm-representations" as const, title: "Representations", short: "Build predictive state", description: "Compress observations into action-conditioned recurrent states without hiding uncertainty.", outcome: "Specify and audit a recurrent state-space model.", role: "core" as const, color: "#ff6b35" },
  { id: "wm-training" as const, title: "Learning Dynamics", short: "Train the simulator", description: "Choose targets, priors, replay, multistep losses, and uncertainty for useful imagined futures.", outcome: "Design an evidence-honest world-model training run.", role: "core" as const, color: "#ffd166" },
  { id: "wm-planning" as const, title: "Planning & Control", short: "Act through imagination", description: "Turn learned dynamics into rollouts, MPC, policies, values, and search under matched budgets.", outcome: "Choose and audit a model-based decision method.", role: "core" as const, color: "#57d6c7" },
  { id: "wm-foundation-models" as const, title: "Video & Foundation Models", short: "Scale predictive experience", description: "Compare token, feature, latent-action, and interactive-video models through their actual contracts.", outcome: "Evaluate a foundation world-model claim by interface and evidence.", role: "core" as const, color: "#67b7ff" },
  { id: "wm-deployment" as const, title: "Evaluation & Deployment", short: "Operate bounded controllers", description: "Measure failures, transfer to robots, enforce constraints, and run versioned release loops.", outcome: "Ship a staged, observable, rollback-ready controller design.", role: "core" as const, color: "#78d67a" },
  { id: "wm-advanced" as const, title: "Advanced Specializations", short: "Choose a research branch", description: "Explore objects, hierarchy, geometry, causality, or multimodal grounding from the shared core.", outcome: "Complete one falsifiable specialization study.", role: "specialization" as const, color: "#a78bfa" },
];

export const worldModelLearningPhases = [
  { id: "wm-sequence", index: "01", title: "Turn experience into a prediction problem", range: "Lessons 1–8", tracks: ["wm-foundations"] as TrackId[], summary: "Define observations, actions, hidden state, uncertainty, return, and belief before introducing learned latent dynamics.", milestone: "Trace one controlled partially observed system" },
  { id: "wm-state", index: "02", title: "Build and train predictive state", range: "Lessons 9–20", tracks: ["wm-representations", "wm-training"] as TrackId[], summary: "Learn representations and objectives together so compression, recurrence, inference, replay, and uncertainty remain inspectable.", milestone: "Audit a recurrent state-space training contract" },
  { id: "wm-decisions", index: "03", title: "Plan and learn inside imagination", range: "Lessons 21–28", tracks: ["wm-planning"] as TrackId[], summary: "Compare shooting, MPC, differentiable planning, actor–critic imagination, and tree search under explicit budgets and error boundaries.", milestone: "Select a decision method from task evidence" },
  { id: "wm-foundation", index: "04", title: "Scale to video and interactive worlds", range: "Lessons 29–34", tracks: ["wm-foundation-models"] as TrackId[], summary: "Separate raw generation, feature prediction, latent actions, planning interfaces, and official release evidence.", milestone: "Build a contract table for foundation world models" },
  { id: "wm-operate", index: "05", title: "Evaluate and operate the control loop", range: "Lessons 35–40", tracks: ["wm-deployment"] as TrackId[], summary: "Expose compounding error, robot transfer, constraint authority, telemetry, release gates, and rollback.", milestone: "Design a bounded world-model operations package" },
  { id: "wm-specialize", index: "06", title: "Choose an advanced research branch", range: "Lessons 41–46", tracks: ["wm-advanced"] as TrackId[], summary: "Object, hierarchy, geometry, causal, and multimodal lessons branch from the same shared core; the capstone requires one branch, not all of them.", milestone: "Run one falsifiable changed-case study" },
];

export const worldModelCapstoneLessonIds = new Set([
  "belief-states-filtering",
  "rssm-planet-case-study",
  "uncertainty-ensembles",
  "dyna-tdmpc-case-study",
  "foundation-world-models-case-study",
  "world-model-operations-case-study",
  "world-model-research-capstone",
]);

export const worldModelSpecs: readonly WorldModelLessonSpec[] = [
  ...worldModelFoundationSpecs,
  ...worldModelRepresentationSpecs,
  ...worldModelTrainingSpecs,
  ...worldModelPlanningSpecs,
  ...worldModelFoundationModelSpecs,
  ...worldModelDeploymentSpecs,
  ...worldModelAdvancedSpecs,
].sort((a, b) => a.lesson.number - b.lesson.number);

export const worldModelLessons: Lesson[] = worldModelSpecs.map(({ lesson }) => worldModelCapstoneLessonIds.has(lesson.id)
  ? {
      ...lesson,
      capstone: {
        question: `How would you use ${lesson.title.toLowerCase()} to produce a reproducible, bounded world-model artifact?`,
        timeline: [
          { stage: "Specify", evidence: "Pin the observation, action, state, target, and evidence contract." },
          { stage: "Build", evidence: "Create the smallest deterministic fixture or explicit executable specification." },
          { stage: "Test", evidence: "Use a changed case, a baseline, local checks, and a real retry path." },
          { stage: "Bound", evidence: "Preserve failures and state what the artifact cannot establish." },
        ],
        decisions: ["Keep model simulation distinct from environment measurement.", "Match budgets before comparing designs.", "Make the conclusion reversible when the predeclared evidence fails."],
      },
    }
  : lesson);

export const worldModelLessonById = Object.fromEntries(worldModelLessons.map((lesson) => [lesson.id, lesson])) as Record<string, Lesson>;
export const worldModelCurriculumMinutes = worldModelLessons.reduce((total, lesson) => total + lesson.duration, 0);

function guideFor(spec: WorldModelLessonSpec): LessonGuide {
  return {
    objectives: [...spec.objectives],
    vocabulary: [...spec.vocabulary],
    sections: [
      { title: `${spec.lesson.title}: mechanism`, paragraphs: [spec.lesson.deep, `Operational trace: ${spec.walkthrough.map(({ title, checkpoint }) => `${title} — ${checkpoint}`).join(" Then ")}`] },
      { title: "Limits and decision evidence", paragraphs: [spec.lesson.misconception, spec.coverage[1].mechanism, spec.coverage[1].boundary] },
    ],
    walkthrough: [...spec.walkthrough],
    guidedExample: {
      title: `Worked trace — ${spec.lesson.title}`,
      setup: spec.coverage[1].workedExample,
      steps: spec.walkthrough.map(({ checkpoint }) => checkpoint),
      result: spec.transfer.worked,
    },
    practice: spec.practice,
    resources: [...spec.resources],
  };
}

export const worldModelLessonGuides = Object.fromEntries(worldModelSpecs.map((spec) => [spec.lesson.id, guideFor(spec)])) as Record<string, LessonGuide>;
export const worldModelObjectiveCoverage = Object.fromEntries(worldModelSpecs.map((spec) => [spec.lesson.id, [...spec.coverage]])) as Record<string, ObjectiveCoverage[]>;
export const worldModelTransferChecks = Object.fromEntries(worldModelSpecs.map((spec) => [spec.lesson.id, spec.transfer])) as Record<string, WorldModelTransfer>;
export const worldModelMotionStories = Object.fromEntries(worldModelSpecs.map((spec) => [spec.lesson.id, spec.motion])) as Record<string, LessonMotionStory>;
