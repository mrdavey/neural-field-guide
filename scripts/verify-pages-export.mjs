import assert from "node:assert/strict";
import { lstat, readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.cwd();
const outputDirectory = join(root, "out");
const requestedBasePath = process.env.EXPECTED_PAGES_BASE_PATH ?? "";
const basePath = requestedBasePath.replace(/\/$/, "");

assert(
  basePath === "" || (basePath.startsWith("/") && !basePath.includes("//")),
  "EXPECTED_PAGES_BASE_PATH must be empty or a single absolute URL path such as /llms-from-scratch.",
);

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    const metadata = await lstat(path);
    assert(!metadata.isSymbolicLink(), `Pages artifact contains a symbolic link: ${relative(root, path)}`);
    if (entry.isDirectory()) files.push(...await collectFiles(path));
    else files.push({ path, size: metadata.size });
  }

  return files;
}

const files = await collectFiles(outputDirectory);
const relativeFiles = new Set(files.map(({ path }) => relative(outputDirectory, path)));
const courseSource = await readFile(join(root, "app/course-data.ts"), "utf8");
const lessonIds = [...courseSource.matchAll(/\n    id: "([^"]+)", track:/g)].map((match) => match[1]);
const sectionCourses = { worldmodel: 46, generative: 30, rl: 32, embodied: 30 };
const sectionLessonIds = {};
for (const [courseId, expectedCount] of Object.entries(sectionCourses)) {
  const directory = join(root, "app", courseId === "worldmodel" ? "world-models" : courseId, "sections");
  const sectionFiles = (await readdir(directory)).filter((file) => file.endsWith(".ts"));
  const source = (await Promise.all(sectionFiles.map((file) => readFile(join(directory, file), "utf8")))).join("\n");
  sectionLessonIds[courseId] = [...source.matchAll(/\bid:\s*"([^"]+)"/g)].map((match) => match[1]);
  assert.equal(sectionLessonIds[courseId].length, expectedCount, `The route verifier must cover every ${courseId} lesson.`);
}

assert.equal(lessonIds.length, 44, "The route verifier must cover every curriculum lesson.");

for (const requiredFile of [
  "index.html",
  "404.html",
  "favicon.svg",
  "capstone-artifacts/tiny-gpt-reference-run.json",
  "validation-artifacts/tokenizer-contract-result.json",
  "llm/index.html",
  "worldmodel/index.html",
  "generative/index.html",
  "rl/index.html",
  "embodied/index.html",
  "capstone-artifacts/worldmodel/world-model-research-capstone.json",
  "capstone-artifacts/generative/generative-research-capstone.json",
  "capstone-artifacts/rl/rl-research-capstone.json",
  "capstone-artifacts/embodied/embodied-research-capstone.json",
  "experiment-runbooks/EMBODIED_POLICY.md",
]) {
  assert(relativeFiles.has(requiredFile), `Static export is missing ${requiredFile}.`);
}

for (const lessonId of lessonIds) {
  assert(relativeFiles.has(`llm/${lessonId}/index.html`), `Static export is missing the /llm/${lessonId}/ lesson route.`);
  assert(relativeFiles.has(`${lessonId}/index.html`), `Static export is missing the legacy /${lessonId}/ forward route.`);
}
for (const [courseId, ids] of Object.entries(sectionLessonIds)) {
  for (const lessonId of ids) assert(relativeFiles.has(`${courseId}/${lessonId}/index.html`), `Static export is missing the /${courseId}/${lessonId}/ lesson route.`);
}

assert(
  !files.some(({ path }) => relative(outputDirectory, path).split("/").some((part) => part.startsWith(".env"))),
  "A .env file was copied into the public Pages artifact.",
);

const textFiles = files.filter(({ path }) => /\.(?:html|js|css)$/.test(path));
const searchableOutput = (await Promise.all(textFiles.map(({ path }) => readFile(path, "utf8")))).join("\n");
const prefix = basePath || "";

for (const publicUrl of ["/_next/static/", "/favicon.svg"]) {
  assert(
    searchableOutput.includes(`${prefix}${publicUrl}`),
    `Static output does not contain the expected Pages URL prefix: ${prefix}${publicUrl}`,
  );
}

for (const artifactDirectory of ["capstone-artifacts/", "validation-artifacts/", "experiment-runbooks/"]) {
  assert(
    searchableOutput.includes(artifactDirectory),
    `Static output does not reference ${artifactDirectory}.`,
  );
}

if (basePath) assert(searchableOutput.includes(basePath), `Static output does not contain its declared base path: ${basePath}`);

if (basePath) {
  for (const rootOnlyUrl of ["\"/favicon.svg\"", "\"/capstone-artifacts/", "\"/validation-artifacts/", "\"/experiment-runbooks/"]) {
    assert(!searchableOutput.includes(rootOnlyUrl), `Found a root-only URL that will break below ${basePath}: ${rootOnlyUrl}`);
  }
}

const totalBytes = files.reduce((total, file) => total + file.size, 0);
assert(totalBytes < 1_000_000_000, "The Pages artifact exceeds GitHub Pages' 1 GB published-site limit.");

console.log(
  `Verified GitHub Pages static export: ${lessonIds.length + Object.values(sectionLessonIds).flat().length} canonical lesson routes plus ${lessonIds.length} legacy forwards, ${files.length} files, ${(totalBytes / 1_000_000).toFixed(2)} MB, base path ${basePath || "/"}.`,
);
