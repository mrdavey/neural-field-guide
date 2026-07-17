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
  {
    id: "wm-foundations" as const,
    title: "Foundations",
    short: "Define the prediction problem",
    description:
      "Build the state, probability, control, and sequential reasoning every world model needs.",
    outcome: "Trace one partially observed controlled transition.",
    role: "core" as const,
    color: "#f59eaf",
  },
  {
    id: "wm-representations" as const,
    title: "Representations",
    short: "Build predictive state",
    description:
      "Compress observations into action-conditioned recurrent states without hiding uncertainty.",
    outcome: "Specify and audit a recurrent state-space model.",
    role: "core" as const,
    color: "#ff6b35",
  },
  {
    id: "wm-training" as const,
    title: "Learning Dynamics",
    short: "Train the simulator",
    description:
      "Choose targets, priors, replay, multistep losses, and uncertainty for useful imagined futures.",
    outcome: "Design an evidence-honest world-model training run.",
    role: "core" as const,
    color: "#ffd166",
  },
  {
    id: "wm-planning" as const,
    title: "Planning & Control",
    short: "Act through imagination",
    description:
      "Turn learned dynamics into rollouts, MPC, policies, values, and search under matched budgets.",
    outcome: "Choose and audit a model-based decision method.",
    role: "core" as const,
    color: "#57d6c7",
  },
  {
    id: "wm-foundation-models" as const,
    title: "Video & Foundation Models",
    short: "Scale predictive experience",
    description:
      "Compare token, feature, latent-action, and interactive-video models through their actual contracts.",
    outcome:
      "Evaluate a foundation world-model claim by interface and evidence.",
    role: "core" as const,
    color: "#67b7ff",
  },
  {
    id: "wm-deployment" as const,
    title: "Evaluation & Deployment",
    short: "Operate bounded controllers",
    description:
      "Measure failures, transfer to robots, enforce constraints, and run versioned release loops.",
    outcome: "Ship a staged, observable, rollback-ready controller design.",
    role: "core" as const,
    color: "#78d67a",
  },
  {
    id: "wm-advanced" as const,
    title: "Advanced Specializations",
    short: "Choose a research branch",
    description:
      "Explore objects, hierarchy, geometry, causality, or multimodal grounding from the shared core.",
    outcome: "Complete one falsifiable specialization study.",
    role: "specialization" as const,
    color: "#a78bfa",
  },
];

export const worldModelLearningPhases = [
  {
    id: "wm-sequence",
    index: "01",
    title: "Turn experience into a prediction problem",
    range: "Lessons 1–8",
    tracks: ["wm-foundations"] as TrackId[],
    summary:
      "Define observations, actions, hidden state, uncertainty, return, and belief before introducing learned latent dynamics.",
    milestone: "Trace one controlled partially observed system",
  },
  {
    id: "wm-state",
    index: "02",
    title: "Build and train predictive state",
    range: "Lessons 9–20",
    tracks: ["wm-representations", "wm-training"] as TrackId[],
    summary:
      "Learn representations and objectives together so compression, recurrence, inference, replay, and uncertainty remain inspectable.",
    milestone: "Audit a recurrent state-space training contract",
  },
  {
    id: "wm-decisions",
    index: "03",
    title: "Plan and learn inside imagination",
    range: "Lessons 21–28",
    tracks: ["wm-planning"] as TrackId[],
    summary:
      "Compare shooting, MPC, differentiable planning, actor–critic imagination, and tree search under explicit budgets and error boundaries.",
    milestone: "Select a decision method from task evidence",
  },
  {
    id: "wm-foundation",
    index: "04",
    title: "Scale to video and interactive worlds",
    range: "Lessons 29–34",
    tracks: ["wm-foundation-models"] as TrackId[],
    summary:
      "Separate raw generation, feature prediction, latent actions, planning interfaces, and official release evidence.",
    milestone: "Build a contract table for foundation world models",
  },
  {
    id: "wm-operate",
    index: "05",
    title: "Evaluate and operate the control loop",
    range: "Lessons 35–40",
    tracks: ["wm-deployment"] as TrackId[],
    summary:
      "Expose compounding error, robot transfer, constraint authority, telemetry, release gates, and rollback.",
    milestone: "Design a bounded world-model operations package",
  },
  {
    id: "wm-specialize",
    index: "06",
    title: "Choose an advanced research branch",
    range: "Lessons 41–46",
    tracks: ["wm-advanced"] as TrackId[],
    summary:
      "Object, hierarchy, geometry, causal, and multimodal lessons branch from the same shared core; the capstone requires one branch, not all of them.",
    milestone: "Run one falsifiable changed-case study",
  },
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

export const worldModelLessons: Lesson[] = worldModelSpecs.map(({ lesson }) =>
  worldModelCapstoneLessonIds.has(lesson.id)
    ? {
        ...lesson,
        capstone: {
          question: `How would you use ${lesson.title.toLowerCase()} to produce a reproducible, bounded world-model artifact?`,
          timeline: [
            {
              stage: "Specify",
              evidence:
                "Pin the observation, action, state, target, and evidence contract.",
            },
            {
              stage: "Build",
              evidence:
                "Create the smallest deterministic fixture or explicit executable specification.",
            },
            {
              stage: "Test",
              evidence:
                "Use a changed case, a baseline, local checks, and a real retry path.",
            },
            {
              stage: "Bound",
              evidence:
                "Preserve failures and state what the artifact cannot establish.",
            },
          ],
          decisions: [
            "Keep model simulation distinct from environment measurement.",
            "Match budgets before comparing designs.",
            "Make the conclusion reversible when the predeclared evidence fails.",
          ],
        },
      }
    : lesson,
);

export const worldModelLessonById = Object.fromEntries(
  worldModelLessons.map((lesson) => [lesson.id, lesson]),
) as Record<string, Lesson>;
export const worldModelCurriculumMinutes = worldModelLessons.reduce(
  (total, lesson) => total + lesson.duration,
  0,
);

function sentenceFragment(value: string) {
  const trimmed = value.trim().replace(/[.!?]+$/, "");
  const match = trimmed.match(/^([“”'\"]*)([A-Za-z][A-Za-z0-9]*)/);
  if (!match) return trimmed;
  const [, prefix, firstWord] = match;
  const isNameOrAcronym =
    (firstWord.length > 1 && firstWord === firstWord.toUpperCase()) ||
    /[A-Z]/.test(firstWord.slice(1));
  if (isNameOrAcronym) return trimmed;
  return `${prefix}${firstWord.charAt(0).toLowerCase()}${trimmed.slice(prefix.length + 1)}`;
}

function completeSentence(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  const capitalized = trimmed.replace(
    /^([“”'\"]*)([a-z])/,
    (_, prefix: string, letter: string) => `${prefix}${letter.toUpperCase()}`,
  );
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

function workedTraceSteps(
  spec: WorldModelLessonSpec,
): [string, string, string] {
  const pieces = spec.coverage[0].check.expected
    .split(/(?<=[.!?])\s+(?=(?:[A-Z$]|\\))|;\s+/)
    .map((piece) => piece.trim())
    .filter(Boolean);
  const trace: [string, string, string] =
    pieces.length >= 3
      ? [pieces[0], pieces[1], pieces.slice(2).map(completeSentence).join(" ")]
      : pieces.length === 2
        ? [
            pieces[0],
            pieces[1],
            `Use that result to ${sentenceFragment(spec.objectives[0])}.`,
          ]
        : [
            pieces[0] ?? spec.walkthrough[0].body,
            spec.walkthrough[1].body,
            spec.walkthrough[2].body,
          ];
  return [
    `Start from the stated values or evidence. ${completeSentence(trace[0])}`,
    `Carry the mechanism into the next quantity or state. ${completeSentence(trace[1])}`,
    `Interpret the result before generalizing it. ${completeSentence(trace[2])}`,
  ];
}

function narrativePracticeFor(
  spec: WorldModelLessonSpec,
): LessonGuide["practice"] {
  const decisionCheck = spec.coverage[1].check;
  return {
    prompt: `${decisionCheck.prompt} Then change one assumption from the running case and state whether the same conclusion still follows.`,
    hint: `${decisionCheck.retry} Keep the changed assumption separate from every quantity or condition that stays fixed.`,
    answer: `${decisionCheck.expected} For the changed case, keep this limit explicit: ${spec.coverage[1].boundary}`,
  };
}

function guideFor(spec: WorldModelLessonSpec): LessonGuide {
  if (spec.lesson.id === "world-models") {
    return {
      objectives: [...spec.objectives],
      vocabulary: [...spec.vocabulary],
      sections: [
        {
          title: "Why imagine before acting?",
          paragraphs: [spec.lesson.deep, spec.lesson.mentalModel],
        },
        {
          title: "What makes a prediction useful?",
          paragraphs: [
            spec.lesson.misconception,
            spec.coverage[1].mechanism,
            spec.coverage[1].boundary,
          ],
        },
      ],
      walkthrough: [...spec.walkthrough],
      guidedExample: {
        title: "One hallway decision",
        setup:
          "A delivery robot reaches a hallway where a box blocks the direct route. It can continue straight or turn left.",
        steps: [
          "The real hallway supplies the starting evidence: a box blocks the route ahead.",
          "The world model imagines straight ending at the box and left reaching an open passage.",
          "A separate chooser selects left; the robot moves; its sensors check what actually happened.",
        ],
        result:
          "The prediction helped because it preserved the route difference that mattered to the choice. One correct hallway prediction still does not prove that every obstacle or new building will be handled correctly.",
      },
      practice: spec.practice,
      resources: [...spec.resources],
    };
  }

  const [firstStep, secondStep, finalStep] = spec.walkthrough;
  const primaryTrace = workedTraceSteps(spec);
  return {
    objectives: [...spec.objectives],
    vocabulary: [...spec.vocabulary],
    sections: [
      {
        title: spec.objectives[0],
        paragraphs: [
          `Here is the thread to follow through the chapter: ${spec.motion.intro}`,
          spec.lesson.deep,
        ],
      },
      {
        title: "The mechanism in one concrete case",
        paragraphs: [
          spec.lesson.example,
          `Read the example as a chain rather than three isolated facts: “${firstStep.title}” establishes the starting evidence, “${secondStep.title}” exposes the change, and “${finalStep.title}” determines what the result supports.`,
        ],
      },
      {
        title: "Where the conclusion stops—and what to test next",
        paragraphs: [
          `The worked case supports a bounded conclusion, not this tempting shortcut: ${spec.lesson.misconception}`,
          `${spec.coverage[1].explanation} Use this decision protocol: ${spec.coverage[1].mechanism} A useful comparison is this: ${spec.coverage[1].workedExample}`,
          `${spec.coverage[1].boundary} The next useful evidence is a changed case that could reverse the decision, not another repetition of the original example.`,
        ],
      },
    ],
    walkthrough: [...spec.walkthrough],
    guidedExample: {
      title: `Work a new ${spec.lesson.title} case`,
      setup: spec.coverage[0].check.prompt,
      steps: primaryTrace,
      result: `The trace is enough to ${sentenceFragment(spec.objectives[0])}. It does not, by itself, settle whether you can ${sentenceFragment(spec.objectives[1])}; that claim needs the changed-case evidence and boundary above.`,
    },
    practice: narrativePracticeFor(spec),
    resources: [...spec.resources],
  };
}

export const worldModelLessonGuides = Object.fromEntries(
  worldModelSpecs.map((spec) => [spec.lesson.id, guideFor(spec)]),
) as Record<string, LessonGuide>;
export const worldModelObjectiveCoverage = Object.fromEntries(
  worldModelSpecs.map((spec) => [spec.lesson.id, [...spec.coverage]]),
) as Record<string, ObjectiveCoverage[]>;
export const worldModelTransferChecks = Object.fromEntries(
  worldModelSpecs.map((spec) => [spec.lesson.id, spec.transfer]),
) as Record<string, WorldModelTransfer>;
export const worldModelMotionStories = Object.fromEntries(
  worldModelSpecs.map((spec) => [spec.lesson.id, spec.motion]),
) as Record<string, LessonMotionStory>;
