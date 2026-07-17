import type { LessonGuide } from "../lesson-guides";
import type { PlannedCourseManifest } from "../research-curriculum-manifests";
import type { LessonMotionStory } from "../lesson-motion";
import type { ResearchLessonSeed, ResearchLessonSpec } from "./types";

export function defineResearchLesson(
  manifest: PlannedCourseManifest,
  seed: ResearchLessonSeed,
): ResearchLessonSpec {
  const planned = manifest.lessons.find((lesson) => lesson.id === seed.id);
  if (!planned)
    throw new Error(
      `${manifest.id}:${seed.id} is not in the reviewed curriculum manifest`,
    );
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
    prerequisites: planned.reuses.flatMap((reference) =>
      !reference.includes(":")
        ? [reference]
        : reference.startsWith(`${manifest.id}:`)
          ? [reference.slice(manifest.id.length + 1)]
          : [],
    ),
    programPrerequisites: planned.reuses.flatMap((reference) => {
      const separator = reference.indexOf(":");
      if (separator < 0 || reference.startsWith(`${manifest.id}:`)) return [];
      return [
        {
          courseId: reference.slice(0, separator),
          lessonId: reference.slice(separator + 1),
        },
      ];
    }),
    sources: seed.resources.map((resource) => ({
      label: resource.title,
      url: resource.url,
    })),
    ...(planned.capstone
      ? {
          capstone: {
            question: `How will you turn ${planned.build.toLowerCase()} into a reproducible build-and-learn artifact?`,
            timeline: [
              {
                stage: "Specify",
                evidence:
                  "Pin interfaces, assumptions, invariants, and the baseline before implementation.",
              },
              {
                stage: "Build",
                evidence: `Implement and inspect ${planned.build.toLowerCase()} with assertions and a failure log.`,
              },
              {
                stage: "Test",
                evidence:
                  "Use a changed case, deterministic checks, and matched evidence rather than one favorable sample.",
              },
              {
                stage: "Bound",
                evidence:
                  "Preserve raw evidence and state what the course-scale result cannot establish.",
              },
            ],
            decisions: [
              "Keep deterministic fixtures separate from measured runs.",
              "Hold relevant budgets fixed before comparing treatments.",
              "Report failures and alternative explanations with the result.",
            ],
          },
        }
      : {}),
  } satisfies ResearchLessonSpec["lesson"];

  return {
    lesson,
    objectives: [seed.objectives.primary, seed.objectives.decision],
    coverage: [
      {
        objective: seed.objectives.primary,
        explanation: seed.plain,
        mechanism: seed.precise,
        workedExample: seed.worked,
        boundary: seed.misconception,
        check: seed.primaryCheck,
      },
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

function withoutTerminalPunctuation(value: string) {
  return value.trim().replace(/[.!?]+$/, "");
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
  expected: string,
  ideas: readonly string[],
): [string, string, string] {
  const [firstIdea = "frame the evidence", secondIdea = "trace the change", thirdIdea = "test the conclusion"] = ideas;
  const pieces = expected
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
            `Ask whether you can ${sentenceFragment(thirdIdea)}.`,
          ]
        : [
            pieces[0] ??
              `Begin by checking whether you can ${sentenceFragment(firstIdea)}.`,
            `Now use the result to ${sentenceFragment(secondIdea)}.`,
            `Finally, ask whether you can ${sentenceFragment(thirdIdea)}.`,
          ];
  return [
    `Start from the stated values or evidence. ${completeSentence(trace[0])}`,
    `Carry the mechanism into the next quantity or state. ${completeSentence(trace[1])}`,
    `Interpret the result before generalizing it. ${completeSentence(trace[2])}`,
  ];
}

function nextUsePhrase(nextUse: string, nextUseTitle?: string) {
  if (nextUseTitle) return `the “${nextUseTitle}” chapter`;
  const separator = nextUse.indexOf(":");
  const maybeCourse = separator >= 0 ? nextUse.slice(0, separator) : undefined;
  const rawLesson = separator >= 0 ? nextUse.slice(separator + 1) : nextUse;
  const acronyms: Record<string, string> = { ddpm: "DDPM", gpu: "GPU", jepa: "JEPA", mcmc: "MCMC", rl: "RL", vae: "VAE", vla: "VLA" };
  const lesson = rawLesson.split("-").map((word) => acronyms[word] ?? word).join(" ");
  return maybeCourse
    ? `the next course's ${lesson} chapter`
    : `the ${lesson} chapter`;
}

export function researchGuide(
  spec: ResearchLessonSpec,
  nextUse: string,
  nextUseTitle?: string,
): LessonGuide {
  if (spec.lesson.number === 1) {
    return {
      objectives: [...spec.objectives],
      vocabulary: [...spec.vocabulary],
      sections: [
        {
          title: "Why this subject is worth learning",
          paragraphs: [
            spec.lesson.deep,
            "This opening lesson uses familiar examples first. The next lessons introduce the formal tools and notation needed to explain the mechanism in detail.",
          ],
        },
        {
          title: "What to trust—and what to test",
          paragraphs: [
            spec.lesson.misconception,
            spec.coverage[1].mechanism,
            spec.coverage[1].boundary,
          ],
        },
      ],
      walkthrough: spec.lesson.keyIdeas.map((body, index) => ({
        title: ["Name the question", "Follow one example", "Check the result"][
          index
        ],
        body,
        checkpoint: [
          spec.coverage[0].check.prompt,
          spec.coverage[1].check.retry,
          spec.transfer.retry,
        ][index],
      })),
      guidedExample: {
        title: `Three ways to inspect the idea — ${spec.lesson.title}`,
        setup:
          "These are three separate cases. Predict what each one can establish, then compare how the same idea survives the change in evidence.",
        steps: [
          `Familiar example: ${spec.lesson.example}`,
          `First changed case: ${spec.coverage[0].check.prompt} ${spec.coverage[0].check.expected}`,
          `Decision case: ${spec.coverage[1].workedExample}`,
        ],
        result: `Together, the cases show how to ${sentenceFragment(spec.objectives[0])} and then ${sentenceFragment(spec.objectives[1])}. Keep this limit in view: ${spec.coverage[1].boundary}`,
      },
      practice: {
        prompt: spec.transfer.prompt,
        hint: spec.transfer.retry,
        answer: spec.transfer.worked,
      },
      resources: [...spec.resources],
    };
  }

  const [frameIdea, traceIdea, evidenceIdea] = spec.lesson.keyIdeas;
  const primaryTrace = workedTraceSteps(
    spec.coverage[0].check.expected,
    spec.lesson.keyIdeas,
  );

  return {
    objectives: [...spec.objectives],
    vocabulary: [...spec.vocabulary],
    sections: [
      {
        title: spec.lab.question,
        paragraphs: [spec.lesson.deep],
      },
      {
        title: "Follow the mechanism through one worked case",
        paragraphs: [
          spec.lesson.example,
          `${completeSentence(frameIdea)} ${completeSentence(traceIdea)} ${completeSentence(evidenceIdea)} These are not three separate tips: each statement supplies the evidence needed by the next one.`,
        ],
      },
      {
        title: "Decide what the evidence supports",
        paragraphs: [
          `The calculation establishes the mechanism under the stated conditions, but it does not license a shortcut. ${completeSentence(spec.lesson.misconception)}`,
          `${completeSentence(spec.coverage[1].explanation)} In practice, the decision follows this protocol: ${completeSentence(spec.coverage[1].mechanism)} The following comparison makes the rule concrete: ${completeSentence(spec.coverage[1].workedExample)}`,
          `${completeSentence(spec.coverage[1].boundary)} ${completeSentence(`${nextUsePhrase(nextUse, nextUseTitle)} reuses the result developed here: ${completeSentence(frameIdea)} ${completeSentence(traceIdea)}`)}`,
        ],
      },
    ],
    walkthrough: [
      {
        title: "Frame the evidence",
        body: frameIdea,
        checkpoint: spec.coverage[0].check.prompt,
      },
      {
        title: "Trace the change",
        body: traceIdea,
        checkpoint: spec.coverage[0].check.retry,
      },
      {
        title: "Test the conclusion",
        body: evidenceIdea,
        checkpoint: spec.coverage[1].check.prompt,
      },
    ],
    guidedExample: {
      title: "Test the mechanism on a changed case",
      setup: spec.coverage[0].check.prompt,
      steps: primaryTrace,
      result: `This trace is enough to ${sentenceFragment(spec.objectives[0])}. It is not, by itself, enough to ${sentenceFragment(spec.objectives[1])}; that broader decision still needs the comparison rule and boundary developed above.`,
    },
    practice: {
      prompt: `A reviewer challenges the worked conclusion: ${completeSentence(spec.lesson.misconception)} Which assumption or comparison should you inspect first, and what narrower conclusion can the existing evidence still support?`,
      hint: `Find the first place where the reviewer's concern enters the evidence chain. Keep the observed result, but do not preserve a conclusion that depended on the challenged assumption.`,
      answer: `Begin at the challenged assumption, then apply the decision protocol: ${completeSentence(spec.coverage[1].mechanism)} The evidence remains inside this boundary: ${completeSentence(spec.coverage[1].boundary)}`,
    },
    resources: [...spec.resources],
  };
}

export function researchMotion(spec: ResearchLessonSpec): LessonMotionStory {
  if (spec.lesson.number === 1) {
    return {
      concept: spec.motionConcept,
      headline: `${spec.lesson.title} begins with one question you can inspect.`,
      intro: spec.lab.question,
      stages: [
        { label: "QUESTION", title: spec.lesson.keyIdeas[0] },
        { label: "EXAMPLE", title: spec.lesson.keyIdeas[1] },
        { label: "COMPARE", title: spec.lesson.keyIdeas[2] },
        { label: "LIMIT", title: spec.lab.boundary },
      ],
    };
  }

  return {
    concept: spec.motionConcept,
    headline: `${withoutTerminalPunctuation(spec.objectives[0])}. Then ${sentenceFragment(spec.objectives[1])}.`,
    intro: `Follow one case through the chapter's three moves: ${completeSentence(spec.lesson.keyIdeas[0])} ${completeSentence(spec.lesson.keyIdeas[1])} ${completeSentence(spec.lesson.keyIdeas[2])}`,
    stages: [
      { label: "CONTRACT", title: spec.lesson.keyIdeas[0] },
      { label: "TRANSFORM", title: spec.lesson.keyIdeas[1] },
      { label: "OBSERVE", title: spec.lesson.keyIdeas[2] },
      { label: "BOUND", title: spec.lab.boundary },
    ],
  };
}
