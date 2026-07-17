import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import sharp from "sharp";

const [courseId, lessonId, sourceFile] = process.argv.slice(2);

if (!courseId || !lessonId || !sourceFile) {
  throw new Error("Usage: node scripts/process-lesson-visual.mjs <course-id> <lesson-id> <source-image>");
}

const root = resolve(import.meta.dirname, "..");
const manifestPath = join(root, "docs/lesson-visual-prompts.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const record = manifest.find((visual) => visual.courseId === courseId && visual.lessonId === lessonId);

if (!record) throw new Error(`Unknown lesson visual: ${courseId}:${lessonId}`);
if (record.kind !== "raster" || !record.assetBase) throw new Error(`${courseId}:${lessonId} is not a raster visual`);

const metadata = await sharp(sourceFile).metadata();
if (!metadata.width || !metadata.height || metadata.width < 1536 || metadata.height < 1024) {
  throw new Error(`Source must be at least 1536×1024; received ${metadata.width ?? "?"}×${metadata.height ?? "?"}`);
}
if (Math.abs(metadata.width / metadata.height - 1.5) > 0.02) {
  throw new Error(`Source must use a 3:2 landscape ratio; received ${metadata.width}×${metadata.height}`);
}

const outputBase = join(root, "public", record.assetBase);
await mkdir(dirname(outputBase), { recursive: true });

const outputs = [
  { width: 1536, height: 1024, quality: 84 },
  { width: 768, height: 512, quality: 80 },
];

for (const output of outputs) {
  await sharp(sourceFile)
    .resize(output.width, output.height, { fit: "cover" })
    .webp({ quality: output.quality, smartSubsample: true })
    .toFile(`${outputBase}-${output.width}.webp`);
}

record.provenance = {
  ...record.provenance,
  status: "generated",
  generatedOn: new Date().toISOString().slice(0, 10),
  sourceDimensions: `${metadata.width}x${metadata.height}`,
  outputs: outputs.map(({ width }) => `${record.assetBase}-${width}.webp`),
};

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`${courseId}:${lessonId} -> ${record.provenance.outputs.join(", ")}\n`);
