import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const clientManifest = JSON.parse(await readFile(join(root, "app/lesson-visual-manifest.json"), "utf8"));
const promptManifest = JSON.parse(await readFile(join(root, "docs/lesson-visual-prompts.json"), "utf8"));
const expectedCounts = { llm: 44, worldmodel: 46, generative: 30, rl: 32, embodied: 30 };

assert.equal(clientManifest.length, 182, "client manifest must cover 182 lessons");
assert.equal(promptManifest.length, 182, "prompt manifest must cover 182 lessons");
assert.equal(clientManifest.filter(({ kind }) => kind === "raster").length, 130, "raster count");
assert.equal(clientManifest.filter(({ kind }) => kind === "deterministic").length, 52, "deterministic count");

const keys = clientManifest.map(({ courseId, lessonId }) => `${courseId}:${lessonId}`);
assert.equal(new Set(keys).size, 182, "visual keys must be unique");
assert.deepEqual(Object.fromEntries(Object.keys(expectedCounts).map((courseId) => [courseId, clientManifest.filter((visual) => visual.courseId === courseId).length])), expectedCounts);

for (const visual of clientManifest) {
  const promptRecord = promptManifest.find((record) => record.courseId === visual.courseId && record.lessonId === visual.lessonId);
  assert.ok(promptRecord, `missing prompt record ${visual.courseId}:${visual.lessonId}`);
  assert.equal(promptRecord.kind, visual.kind, `kind mismatch ${visual.courseId}:${visual.lessonId}`);
  assert.deepEqual(promptRecord.labels, visual.labels, `labels mismatch ${visual.courseId}:${visual.lessonId}`);
  assert.deepEqual(promptRecord.stageDescriptions, visual.stageDescriptions, `stage descriptions mismatch ${visual.courseId}:${visual.lessonId}`);
  assert.equal(visual.labels.length, 4, `${visual.courseId}:${visual.lessonId} stage count`);

  if (visual.kind === "deterministic") {
    assert.equal(visual.assetBase, null, `${visual.courseId}:${visual.lessonId} deterministic asset base`);
    assert.equal(promptRecord.provenance.status, "code-native", `${visual.courseId}:${visual.lessonId} deterministic provenance`);
    continue;
  }

  assert.equal(promptRecord.provenance.status, "generated", `${visual.courseId}:${visual.lessonId} generation status`);
  assert.match(promptRecord.prompt, /no text, letters, numbers, equations, arrows, labels, logos, UI screenshots, or watermark/i);
  for (const [width, height] of [[1536, 1024], [768, 512]]) {
    const file = join(root, "public", `${visual.assetBase}-${width}.webp`);
    const fileStat = await stat(file);
    assert.ok(fileStat.size > 12_000, `${relative(root, file)} must contain a substantive image`);
    const metadata = await sharp(file).metadata();
    assert.deepEqual([metadata.format, metadata.width, metadata.height], ["webp", width, height], `${relative(root, file)} delivery format`);
  }
}

async function collectWebp(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectWebp(path));
    else if (entry.name.endsWith(".webp")) files.push(relative(join(root, "public"), path));
  }
  return files;
}

const actualAssets = (await collectWebp(join(root, "public", "lesson-visuals"))).sort();
const expectedAssets = clientManifest
  .filter(({ kind }) => kind === "raster")
  .flatMap(({ assetBase }) => [`${assetBase}-1536.webp`, `${assetBase}-768.webp`])
  .sort();
assert.deepEqual(actualAssets, expectedAssets, "lesson visual assets must have no gaps or orphans");

console.log(`Verified ${clientManifest.length} lesson visuals: 130 raster plates (260 WebPs) and 52 deterministic diagrams.`);
