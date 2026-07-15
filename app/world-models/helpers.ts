import type { ThreeStoryConcept } from "../three-story-math";
import type { WorldModelLessonSpec } from "./types";

type LessonSeed = {
  id: string;
  track: WorldModelLessonSpec["lesson"]["track"];
  title: string;
  number: number;
  duration?: number;
  plain: string;
  precise: string;
  analogy: string;
  analogyBreak: string;
  ideas: [string, string, string];
  worked: string;
  misconception: string;
  quiz: WorldModelLessonSpec["lesson"]["quiz"];
  lab: NonNullable<WorldModelLessonSpec["lesson"]["lab"]>;
  prerequisites?: string[];
  sources: WorldModelLessonSpec["resources"];
  objectives: [string, string];
  vocabulary: WorldModelLessonSpec["vocabulary"];
  stages: [string, string, string];
  checkpoints: [string, string, string];
  primaryCheck: { prompt: string; expected: string; retry: string };
  decision: {
    explanation: string;
    mechanism: string;
    workedExample: string;
    boundary: string;
    check: { prompt: string; expected: string; retry: string };
  };
  transfer: WorldModelLessonSpec["transfer"];
  motion: {
    concept: ThreeStoryConcept;
    headline: string;
    intro: string;
    labels: [string, string, string, string];
    titles: [string, string, string, string];
  };
};

export function defineWorldModelLesson(seed: LessonSeed): WorldModelLessonSpec {
  const lesson = {
    id: seed.id,
    track: seed.track,
    title: seed.title,
    number: seed.number,
    duration: seed.duration ?? 22,
    simple: seed.plain,
    deep: seed.precise,
    mentalModel: `${seed.analogy} Where the analogy breaks: ${seed.analogyBreak}`,
    keyIdeas: seed.ideas,
    example: seed.worked,
    misconception: seed.misconception,
    quiz: seed.quiz,
    lab: seed.lab,
    prerequisites: seed.prerequisites,
    sources: seed.sources.map(({ title, url }) => ({ label: title, url })),
  } satisfies WorldModelLessonSpec["lesson"];

  return {
    lesson,
    objectives: seed.objectives,
    coverage: [
      {
        objective: seed.objectives[0],
        explanation: seed.plain,
        mechanism: seed.precise,
        workedExample: seed.worked,
        boundary: seed.misconception,
        check: seed.primaryCheck,
      },
      {
        objective: seed.objectives[1],
        explanation: seed.decision.explanation,
        mechanism: seed.decision.mechanism,
        workedExample: seed.decision.workedExample,
        boundary: seed.decision.boundary,
        check: seed.decision.check,
      },
    ],
    vocabulary: seed.vocabulary,
    walkthrough: seed.stages.map((title, index) => ({
      title,
      body: seed.ideas[index],
      checkpoint: seed.checkpoints[index],
    })) as WorldModelLessonSpec["walkthrough"],
    practice: {
      prompt: `Construct or choose a changed case that would expose this misconception: ${seed.misconception} State what you change, what you observe, and which conclusion the evidence permits.`,
      hint: `Start from the decision boundary, then change one variable while holding the competing explanation fixed: ${seed.decision.boundary}`,
      answer: `One defensible reference case is: ${seed.decision.workedExample} The general decision rule for the changed case is: ${seed.transfer.worked}`,
    },
    resources: seed.sources,
    transfer: seed.transfer,
    motion: {
      concept: seed.motion.concept,
      headline: seed.motion.headline,
      intro: seed.motion.intro,
      stages: seed.motion.labels.map((label, index) => ({ label, title: seed.motion.titles[index] })) as WorldModelLessonSpec["motion"]["stages"],
    },
  };
}
