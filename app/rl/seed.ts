import type { CompactSeedInput } from "../research-courses/compact";
import { compactResearchSeed } from "../research-courses/compact";
import { rlSources } from "./sources";

type SourceKey = keyof typeof rlSources;
type Input = Omit<CompactSeedInput, "resources"> & { sourceKeys: SourceKey[] };

export function rlSeed({ sourceKeys, ...input }: Input) {
  return compactResearchSeed({ ...input, resources: sourceKeys.map((key) => rlSources[key]) });
}

export const py = (...parts: string[]) => parts.join("\n");
