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
const worldSectionFiles = await readdir(join(root, "app/world-models/sections"));
const worldSource = (await Promise.all(worldSectionFiles.map((file) => readFile(join(root, "app/world-models/sections", file), "utf8")))).join("\n");
const worldLessonIds = [...worldSource.matchAll(/\n    id: "([^"]+)", track: "wm-/g)].map((match) => match[1]);

assert.equal(lessonIds.length, 44, "The route verifier must cover every curriculum lesson.");
assert.equal(worldLessonIds.length, 46, "The route verifier must cover every World Models lesson.");

for (const requiredFile of [
  "index.html",
  "404.html",
  "favicon.svg",
  "capstone-artifacts/tiny-gpt-reference-run.json",
  "validation-artifacts/tokenizer-contract-result.json",
  "llm/index.html",
  "worldmodel/index.html",
  "capstone-artifacts/worldmodel/world-model-research-capstone.json",
]) {
  assert(relativeFiles.has(requiredFile), `Static export is missing ${requiredFile}.`);
}

for (const lessonId of lessonIds) {
  assert(relativeFiles.has(`llm/${lessonId}/index.html`), `Static export is missing the /llm/${lessonId}/ lesson route.`);
  assert(relativeFiles.has(`${lessonId}/index.html`), `Static export is missing the legacy /${lessonId}/ forward route.`);
}
for (const lessonId of worldLessonIds) assert(relativeFiles.has(`worldmodel/${lessonId}/index.html`), `Static export is missing the /worldmodel/${lessonId}/ lesson route.`);

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

for (const artifactDirectory of ["capstone-artifacts/", "validation-artifacts/"]) {
  assert(
    searchableOutput.includes(artifactDirectory),
    `Static output does not reference ${artifactDirectory}.`,
  );
}

if (basePath) assert(searchableOutput.includes(basePath), `Static output does not contain its declared base path: ${basePath}`);

if (basePath) {
  for (const rootOnlyUrl of ["\"/favicon.svg\"", "\"/capstone-artifacts/", "\"/validation-artifacts/"]) {
    assert(!searchableOutput.includes(rootOnlyUrl), `Found a root-only URL that will break below ${basePath}: ${rootOnlyUrl}`);
  }
}

const totalBytes = files.reduce((total, file) => total + file.size, 0);
assert(totalBytes < 1_000_000_000, "The Pages artifact exceeds GitHub Pages' 1 GB published-site limit.");

console.log(
  `Verified GitHub Pages static export: ${lessonIds.length + worldLessonIds.length} canonical lesson routes plus ${lessonIds.length} legacy forwards, ${files.length} files, ${(totalBytes / 1_000_000).toFixed(2)} MB, base path ${basePath || "/"}.`,
);
