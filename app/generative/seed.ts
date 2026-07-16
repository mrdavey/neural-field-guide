import type { CodeGuidance } from "../activity-info";
import type { LessonCodeExample } from "../code-examples";
import type { ResearchLessonSeed } from "../research-courses/types";
import { generativeSources } from "./sources";

type SourceKey = keyof typeof generativeSources;
type CodeInput = Omit<LessonCodeExample, "language" | "setup"> & { language?: string; setup: string; mode?: CodeGuidance["mode"]; requirements?: string };
type SeedInput = Omit<ResearchLessonSeed, "code" | "codeGuidance" | "resources"> & { code: CodeInput; sources: SourceKey[] };

export const lines = (...parts: string[]) => parts.join("\n");

export function generativeSeed(input: SeedInput): ResearchLessonSeed {
  const { code, sources, ...seed } = input;
  const mode = code.mode ?? "run";
  return {
    ...seed,
    code: { title: code.title, language: code.language ?? "Python 3 · standard library", setup: code.setup, predict: code.predict, code: code.code, observe: code.observe, tryIt: code.tryIt, caveat: code.caveat },
    codeGuidance: { mode, requirements: code.requirements ?? (mode === "run" ? "Python 3 standard library only; run the complete deterministic fixture as shown." : "No runtime is required; trace the responsibilities and supply the named surrounding system before execution.") },
    resources: sources.map((key) => generativeSources[key]),
  };
}
