import type { CodeGuidance } from "../activity-info";
import type { LessonCodeExample } from "../code-examples";
import type { Lesson } from "../course-data";
import type { ObjectiveCoverage, ResourceKind } from "../lesson-guides";
import type { ThreeStoryConcept } from "../three-story-math";
import type { WorldModelTransfer } from "../world-models/types";

export type ResearchLabCase = {
  label: string;
  resultLabel: string;
  resultValue: string;
  meter: number;
  detail: string;
};

export type ResearchLabSpec = {
  title: string;
  question: string;
  change: string;
  observe: string;
  explain: string;
  complete: string;
  boundary: string;
  controlLabel: string;
  cases: [ResearchLabCase, ResearchLabCase, ResearchLabCase];
};

export type ResearchLessonSeed = {
  id: string;
  duration?: number;
  plain: string;
  precise: string;
  analogy: string;
  analogyBreak: string;
  ideas: [string, string, string];
  worked: string;
  misconception: string;
  objectives: {
    primary: string;
    decision: string;
  };
  vocabulary: { term: string; meaning: string }[];
  primaryCheck: ObjectiveCoverage["check"];
  decision: Omit<ObjectiveCoverage, "objective">;
  quiz: Lesson["quiz"];
  transfer: WorldModelTransfer;
  lab: ResearchLabSpec;
  motionConcept: ThreeStoryConcept;
  code: LessonCodeExample;
  codeGuidance: CodeGuidance;
  resources: { title: string; url: string; kind: ResourceKind; note: string }[];
};

export type ResearchLessonSpec = {
  lesson: Lesson;
  objectives: [string, string];
  coverage: [ObjectiveCoverage, ObjectiveCoverage];
  vocabulary: ResearchLessonSeed["vocabulary"];
  transfer: WorldModelTransfer;
  lab: ResearchLabSpec;
  motionConcept: ThreeStoryConcept;
  code: LessonCodeExample;
  codeGuidance: CodeGuidance;
  resources: ResearchLessonSeed["resources"];
};
