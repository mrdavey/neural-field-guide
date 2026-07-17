import type { CodeGuidance } from "../activity-info";
import type { LessonCodeExample } from "../code-examples";
import type { ResourceKind } from "../lesson-guides";
import type { ThreeStoryConcept } from "../three-story-math";
import type { ResearchLessonSeed } from "./types";

export type CompactSeedInput = {
  id: string;
  duration?: number;
  plain: string;
  precise: string;
  mentalModel: string;
  ideas: [string, string, string];
  worked: string;
  boundary: string;
  objectives: ResearchLessonSeed["objectives"];
  vocabulary: ResearchLessonSeed["vocabulary"];
  primaryCheck: ResearchLessonSeed["primaryCheck"];
  decision: ResearchLessonSeed["decision"];
  quiz: ResearchLessonSeed["quiz"];
  transfer: { prompt: string; correct: string; wrong: [string, string]; worked: string; retry: string };
  lab: {
    title: string;
    question: string;
    controlLabel: string;
    cases: ResearchLessonSeed["lab"]["cases"];
    boundary: string;
    change?: string;
    observe?: string;
    explain?: string;
    complete?: string;
  };
  motionConcept: ThreeStoryConcept;
  code: LessonCodeExample;
  codeGuidance?: CodeGuidance;
  resources: { title: string; url: string; kind: ResourceKind; note: string }[];
};

export function compactResearchSeed(input: CompactSeedInput): ResearchLessonSeed {
  const caseNames = input.lab.cases.map((item) => item.label).join(", ");
  const outcomeSequence = input.lab.cases.map((item) => `${item.label} gives ${item.resultLabel} ${item.resultValue}`).join("; ");

  return {
    id: input.id,
    duration: input.duration,
    plain: input.plain,
    precise: input.precise,
    analogy: input.mentalModel,
    analogyBreak: input.boundary,
    ideas: input.ideas,
    worked: input.worked,
    misconception: input.boundary,
    objectives: input.objectives,
    vocabulary: input.vocabulary,
    primaryCheck: input.primaryCheck,
    decision: input.decision,
    quiz: input.quiz,
    transfer: {
      prompt: input.transfer.prompt,
      options: [
        { text: input.transfer.correct, feedback: `Correct: ${input.transfer.worked}` },
        { text: input.transfer.wrong[0], feedback: `This conflicts with the lesson boundary: ${input.boundary}` },
        { text: input.transfer.wrong[1], feedback: `This does not follow the declared mechanism or evidence. ${input.transfer.retry}` },
      ],
      answer: 0,
      worked: input.transfer.worked,
      retry: input.transfer.retry,
    },
    lab: {
      title: input.lab.title,
      question: input.lab.question,
      change: input.lab.change ?? `Use the ${input.lab.controlLabel.toLowerCase()} control to compare ${caseNames}. Keep this question in view: ${input.lab.question}`,
      observe: input.lab.observe ?? `Follow the outcomes across the same comparison: ${outcomeSequence}. Identify the first result that changes the decision before reading the case explanation.`,
      explain: input.lab.explain ?? `Explain the contrast by applying this reasoning to the selected case: ${input.decision.mechanism}`,
      complete: input.lab.complete ?? `Inspect all three cases, answer “${input.lab.question}”, and explain why this limit still matters: ${input.lab.boundary}`,
      boundary: input.lab.boundary,
      controlLabel: input.lab.controlLabel,
      cases: input.lab.cases,
    },
    motionConcept: input.motionConcept,
    code: input.code,
    codeGuidance: input.codeGuidance ?? { mode: "run", requirements: "Python 3 standard library only; run the complete deterministic fixture as shown." },
    resources: input.resources,
  };
}

export const codeLines = (...parts: string[]) => parts.join("\n");
