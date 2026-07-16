import type { LessonGuide } from "../lesson-guides";
import type { PlannedCourseManifest } from "../research-curriculum-manifests";
import type { LessonMotionStory } from "../lesson-motion";
import type { ResearchLessonSeed, ResearchLessonSpec } from "./types";

export function defineResearchLesson(manifest: PlannedCourseManifest, seed: ResearchLessonSeed): ResearchLessonSpec {
  const planned = manifest.lessons.find((lesson) => lesson.id === seed.id);
  if (!planned) throw new Error(`${manifest.id}:${seed.id} is not in the reviewed curriculum manifest`);
  const lesson = {
    id: seed.id,
    track: planned.track,
    title: planned.title,
    number: planned.number,
    duration: seed.duration ?? 24,
    simple: seed.plain,
    deep: seed.precise,
    mentalModel: `${seed.analogy} Where the analogy breaks: ${seed.analogyBreak}`,
    keyIdeas: seed.ideas,
    example: seed.worked,
    misconception: seed.misconception,
    quiz: seed.quiz,
    lab: "research" as const,
    prerequisites: planned.reuses.flatMap((reference) => !reference.includes(":") ? [reference] : reference.startsWith(`${manifest.id}:`) ? [reference.slice(manifest.id.length + 1)] : []),
    programPrerequisites: planned.reuses.flatMap((reference) => {
      const separator = reference.indexOf(":");
      if (separator < 0 || reference.startsWith(`${manifest.id}:`)) return [];
      return [{ courseId: reference.slice(0, separator), lessonId: reference.slice(separator + 1) }];
    }),
    sources: seed.resources.map((resource) => ({ label: resource.title, url: resource.url })),
    ...(planned.capstone ? { capstone: {
      question: `How will you turn ${planned.build.toLowerCase()} into a reproducible build-and-learn artifact?`,
      timeline: [
        { stage: "Specify", evidence: "Pin interfaces, assumptions, invariants, and the baseline before implementation." },
        { stage: "Build", evidence: `Implement and inspect ${planned.build.toLowerCase()} with assertions and a failure log.` },
        { stage: "Test", evidence: "Use a changed case, deterministic checks, and matched evidence rather than one favorable sample." },
        { stage: "Bound", evidence: "Preserve raw evidence and state what the course-scale result cannot establish." },
      ],
      decisions: ["Keep deterministic fixtures separate from measured runs.", "Hold relevant budgets fixed before comparing treatments.", "Report failures and alternative explanations with the result."],
    } } : {}),
  } satisfies ResearchLessonSpec["lesson"];

  return {
    lesson,
    objectives: [seed.objectives.primary, seed.objectives.decision],
    coverage: [
      { objective: seed.objectives.primary, explanation: seed.plain, mechanism: seed.precise, workedExample: seed.worked, boundary: seed.misconception, check: seed.primaryCheck },
      { objective: seed.objectives.decision, ...seed.decision },
    ],
    vocabulary: seed.vocabulary,
    transfer: seed.transfer,
    lab: seed.lab,
    motionConcept: seed.motionConcept,
    code: seed.code,
    codeGuidance: seed.codeGuidance,
    resources: seed.resources,
  };
}

export function researchGuide(spec: ResearchLessonSpec, build: string, nextUse: string): LessonGuide {
  return {
    objectives: [...spec.objectives],
    vocabulary: [...spec.vocabulary],
    sections: [
      { title: `${spec.lesson.title}: mechanism`, paragraphs: [spec.lesson.deep, `Build increment: ${build}. This implementation is reused by ${nextUse}.`] },
      { title: "Limits and decision evidence", paragraphs: [spec.lesson.misconception, spec.coverage[1].mechanism, spec.coverage[1].boundary] },
    ],
    walkthrough: spec.lesson.keyIdeas.map((body, index) => ({ title: ["Name the contract", "Trace the transformation", "Interrogate the evidence"][index], body, checkpoint: [spec.coverage[0].check.prompt, spec.coverage[1].check.retry, spec.transfer.retry][index] })),
    guidedExample: {
      title: `Mechanism-to-transfer ladder — ${spec.lesson.title}`,
      setup: "The three items below are deliberately separate evidence cases: first reproduce the lesson's numerical or state trace, then inspect its causal mechanism, then test a changed case. Do not read them as one continuous experimental run.",
      steps: [
        `Worked case: ${spec.lesson.example}`,
        `Mechanism to apply: ${spec.coverage[0].mechanism}`,
        `Changed case: ${spec.transfer.worked}`,
      ],
      result: `The cases support the lesson objective within their declared fixtures. Decision boundary: ${spec.coverage[1].boundary}`,
    },
    practice: { prompt: spec.transfer.prompt, hint: spec.transfer.retry, answer: spec.transfer.worked },
    resources: [...spec.resources],
  };
}

export function researchMotion(spec: ResearchLessonSpec): LessonMotionStory {
  return {
    concept: spec.motionConcept,
    headline: `${spec.lesson.title} becomes an inspectable build, not a black box.`,
    intro: spec.lab.question,
    stages: [
      { label: "CONTRACT", title: spec.lesson.keyIdeas[0] },
      { label: "TRANSFORM", title: spec.lesson.keyIdeas[1] },
      { label: "OBSERVE", title: spec.lesson.keyIdeas[2] },
      { label: "BOUND", title: spec.lab.boundary },
    ],
  };
}
