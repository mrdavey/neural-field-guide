import manifest from "./lesson-visual-manifest.json";
import type { CourseId } from "./course-catalog";
import type { ThreeStoryConcept } from "./three-story-math";

export type LessonVisualKind = "raster" | "deterministic";

export type LessonVisual = {
  courseId: CourseId;
  lessonId: string;
  kind: LessonVisualKind;
  concept: ThreeStoryConcept;
  labels: [string, string, string, string];
  stageDescriptions: [string, string, string, string];
  assetBase: string | null;
};

export const lessonVisuals = manifest as LessonVisual[];

export const lessonVisualByKey = Object.fromEntries(
  lessonVisuals.map((visual) => [`${visual.courseId}:${visual.lessonId}`, visual]),
) as Record<string, LessonVisual>;

export function lessonVisualFor(courseId: CourseId, lessonId: string): LessonVisual {
  const visual = lessonVisualByKey[`${courseId}:${lessonId}`];
  if (!visual) throw new Error(`Missing lesson visual for ${courseId}:${lessonId}`);
  return visual;
}
