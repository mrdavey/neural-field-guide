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
      change: input.lab.change ?? `Select each ${input.lab.controlLabel.toLowerCase()} case while holding the displayed fixture contract fixed.`,
      observe: input.lab.observe ?? "Compare the result label, value, meter, and diagnostic explanation across all three cases.",
      explain: input.lab.explain ?? `Use the mechanism from ${input.lab.question} to identify the first causal step that changes the readout.`,
      complete: input.lab.complete ?? "Commit a prediction, inspect all three deliberately contrasting cases, and explain why one case crosses the diagnostic boundary.",
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
