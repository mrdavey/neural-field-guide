import type { Lesson } from "../course-data";
import type { ObjectiveCoverage, ResourceKind } from "../lesson-guides";
import type { LessonMotionStory } from "../lesson-motion";

export type WorldModelTransfer = {
  prompt: string;
  options: { text: string; feedback: string }[];
  answer: number;
  worked: string;
  retry: string;
};

export type WorldModelLessonSpec = {
  lesson: Lesson;
  objectives: [string, string];
  coverage: [ObjectiveCoverage, ObjectiveCoverage];
  vocabulary: [
    { term: string; meaning: string },
    { term: string; meaning: string },
    { term: string; meaning: string },
  ];
  walkthrough: [
    { title: string; body: string; checkpoint: string },
    { title: string; body: string; checkpoint: string },
    { title: string; body: string; checkpoint: string },
  ];
  practice: { prompt: string; hint: string; answer: string };
  resources: { title: string; url: string; kind: ResourceKind; note: string }[];
  transfer: WorldModelTransfer;
  motion: LessonMotionStory;
};
