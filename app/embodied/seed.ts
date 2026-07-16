import type { CompactSeedInput } from "../research-courses/compact";
import { compactResearchSeed } from "../research-courses/compact";
import { embodiedSources } from "./sources";

type SourceKey = keyof typeof embodiedSources;
type Input = Omit<CompactSeedInput, "resources"> & { sourceKeys: SourceKey[] };

export function embodiedSeed({ sourceKeys, ...input }: Input) {
  return compactResearchSeed({ ...input, resources: sourceKeys.map((key) => embodiedSources[key]) });
}

export const py = (...parts: string[]) => parts.join("\n");
