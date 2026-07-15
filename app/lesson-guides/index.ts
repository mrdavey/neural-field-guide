import type { LessonGuide } from "./types";
import { foundationsArchitectureGuides } from "./foundations-architecture";
import { trainingGuides } from "./training";
import { systemsGuides } from "./systems";

export type { LessonGuide, ObjectiveCoverage, ResourceKind } from "./types";

export const lessonGuides: Record<string, LessonGuide> = {
  ...foundationsArchitectureGuides,
  ...trainingGuides,
  ...systemsGuides,
};
