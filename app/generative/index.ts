import type { CodeGuidance } from "../activity-info";
import type { LessonCodeExample } from "../code-examples";
import type { Lesson } from "../course-data";
import type { LessonGuide, ObjectiveCoverage } from "../lesson-guides";
import type { LessonMotionStory } from "../lesson-motion";
import { plannedCourseManifests } from "../research-curriculum-manifests";
import { researchGuide, researchMotion } from "../research-courses/helpers";
import type { ResearchLabSpec, ResearchLessonSpec } from "../research-courses/types";
import type { WorldModelTransfer } from "../world-models/types";
import { generativeCapstoneArtifactFiles, generativeCapstoneEvidencePacks, generativeCapstoneProjects } from "./capstones";
import { generativeConditionalSpecs } from "./sections/conditional";
import { generativeDiffusionSpecs } from "./sections/diffusion";
import { generativeEnergySpecs } from "./sections/energy";
import { generativeFoundationSpecs } from "./sections/foundations";
import { generativeLatentSpecs } from "./sections/latents";
import { generativeResearchSpecs } from "./sections/research";

const manifest = plannedCourseManifests.generative;

export const generativeSpecs: readonly ResearchLessonSpec[] = [
  ...generativeFoundationSpecs,
  ...generativeLatentSpecs,
  ...generativeEnergySpecs,
  ...generativeDiffusionSpecs,
  ...generativeConditionalSpecs,
  ...generativeResearchSpecs,
].sort((a, b) => a.lesson.number - b.lesson.number);

export const generativeTracks = manifest.tracks.map((track) => ({ ...track, description: `${track.outcome} Each lesson adds one tested component to the territory build.`, role: "core" as const }));
export const generativeLearningPhases = manifest.tracks.map((track, index) => {
  const trackLessons = manifest.lessons.filter((lesson) => lesson.track === track.id);
  return { id: track.id, index: String(index + 1).padStart(2, "0"), title: track.title, range: `Lessons ${trackLessons[0].number}–${trackLessons.at(-1)!.number}`, tracks: [track.id], summary: track.outcome, milestone: trackLessons.at(-1)!.build };
});
export const generativeLessons: Lesson[] = generativeSpecs.map((spec) => spec.lesson);
export const generativeLessonById = Object.fromEntries(generativeLessons.map((lesson) => [lesson.id, lesson])) as Record<string, Lesson>;
export const generativeCurriculumMinutes = generativeLessons.reduce((sum, lesson) => sum + lesson.duration, 0);
export const generativeLessonGuides = Object.fromEntries(generativeSpecs.map((spec) => {
  const planned = manifest.lessons.find((lesson) => lesson.id === spec.lesson.id)!;
  const nextId = planned.nextUse.includes(":") ? planned.nextUse.split(":").at(-1)! : planned.nextUse;
  const nextTitle = manifest.lessons.find((lesson) => lesson.id === nextId)?.title;
  return [spec.lesson.id, researchGuide(spec, planned.nextUse, nextTitle)];
})) as Record<string, LessonGuide>;
export const generativeObjectiveCoverage = Object.fromEntries(generativeSpecs.map((spec) => [spec.lesson.id, [...spec.coverage]])) as Record<string, ObjectiveCoverage[]>;
export const generativeMotionStories = Object.fromEntries(generativeSpecs.map((spec) => [spec.lesson.id, researchMotion(spec)])) as Record<string, LessonMotionStory>;
export const generativeTransferChecks = Object.fromEntries(generativeSpecs.map((spec) => [spec.lesson.id, spec.transfer])) as Record<string, WorldModelTransfer>;
export const generativeResearchLabs = Object.fromEntries(generativeSpecs.map((spec) => [spec.lesson.id, spec.lab])) as Record<string, ResearchLabSpec>;
export const generativeCodeExamples = Object.fromEntries(generativeSpecs.map((spec) => [spec.lesson.id, spec.code])) as Record<string, LessonCodeExample>;
export const generativeCodeGuidance = Object.fromEntries(generativeSpecs.map((spec) => [spec.lesson.id, spec.codeGuidance])) as Record<string, CodeGuidance>;

export const generativeSynthesisMaps = Object.fromEntries(manifest.lessons.filter((lesson) => lesson.capstone).map((lesson) => {
  const trackLessons = manifest.lessons.filter((candidate) => candidate.track === lesson.track);
  return [lesson.id, { title: lesson.title, intro: `Assemble ${lesson.build.toLowerCase()} and preserve the complete evidence chain.`, links: trackLessons.slice(0, -1).map((candidate) => candidate.id) }];
}));

export { generativeCapstoneArtifactFiles, generativeCapstoneEvidencePacks, generativeCapstoneProjects };
