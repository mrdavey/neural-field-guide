import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const courseIds = ["llm", "worldmodel", "generative", "rl", "embodied"];
const common = [
  "app/activity-info.tsx",
  "app/capstone-project-view.tsx",
  "app/course-alignment-bridge.tsx",
  "app/course-alignments.ts",
  "app/course-app.tsx",
  "app/course-catalog.ts",
  "app/external-experiment-view.tsx",
  "app/external-experiments.ts",
  "app/globals.css",
  "app/learning-activities.css",
  "app/lesson-guide-view.tsx",
  "app/math-text.tsx",
  "app/motion",
  "app/research-courses",
  "app/scroll-story.tsx",
  "app/three-story-canvas.tsx",
  "docs/COURSE_PAGE_GRADING_RUBRIC.md",
];
const scoped = {
  llm: [
    "app/activity-info.tsx", "app/capstone-evidence.ts", "app/capstone-projects.ts", "app/code-examples.ts", "app/course-data.ts", "app/fine-tuning-workshop.tsx", "app/lesson-evidence.ts", "app/lesson-guides", "app/lesson-labs.tsx", "app/lesson-objective-coverage.ts", "app/lesson-transfer-checks.ts", "app/lesson-transfer-distractors.ts", "app/mastery-studios.tsx", "app/technical-validations.tsx", "app/validation-artifacts.ts", "public/capstone-artifacts/inference-service-benchmark.json", "public/capstone-artifacts/interpretability-intervention.json", "public/capstone-artifacts/olmo3-flow-audit.json", "public/capstone-artifacts/optimizer-learning-step.json", "public/capstone-artifacts/safe-agent-operations.json", "public/capstone-artifacts/tiny-gpt-reference-run.json", "public/capstone-artifacts/tulu-dual-purpose-design.json", "public/validation-artifacts"
  ],
  worldmodel: ["app/world-models", "public/capstone-artifacts/worldmodel"],
  generative: ["app/generative", "app/capstone-reference-contracts.json", "external-executions/GENERATIVE_DIFFUSION.md", "external-executions/generative_diffusion_ablation.py", "external-executions/requirements-generative.txt", "public/capstone-artifacts/generative", "public/experiment-runbooks/GENERATIVE_DIFFUSION.md"],
  rl: ["app/rl", "app/capstone-reference-contracts.json", "external-executions/RL_DQN.md", "external-executions/rl_dqn_target_ablation.py", "external-executions/requirements-rl.txt", "public/capstone-artifacts/rl", "public/experiment-runbooks/RL_DQN.md"],
  embodied: ["app/embodied", "external-executions/EMBODIED_POLICY.md", "external-executions/embodied_action_chunk_ablation.py", "external-executions/requirements-embodied.txt", "public/capstone-artifacts/embodied", "public/experiment-runbooks/EMBODIED_POLICY.md"],
};

async function filesUnder(path) {
  const absolute = join(root, path);
  const info = await stat(absolute);
  if (info.isFile()) return [absolute];
  const entries = await readdir(absolute, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = join(absolute, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(relative(root, child)));
    else if (entry.isFile()) files.push(child);
  }
  return files;
}

export async function courseGradeFingerprint(courseId) {
  if (!courseIds.includes(courseId)) throw new Error(`Unknown course ${courseId}`);
  const files = [...new Set((await Promise.all([...common, ...scoped[courseId]].map(filesUnder))).flat())].sort();
  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(relative(root, file));
    hash.update("\0");
    hash.update(await readFile(file));
    hash.update("\0");
  }
  return `sha256:${hash.digest("hex")}`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = Object.fromEntries(await Promise.all(courseIds.map(async (courseId) => [courseId, await courseGradeFingerprint(courseId)])));
  console.log(JSON.stringify(result, null, 2));
}
