import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const referenceContracts = JSON.parse(readFileSync(join(root, "app/capstone-reference-contracts.json"), "utf8"));
const courseArtifacts = {
  generative: ["distribution-workbench-capstone", "latent-models-capstone", "flow-energy-capstone", "diffusion-model-capstone", "conditional-safety-capstone", "generative-research-capstone"],
  rl: ["tabular-control-capstone", "value-methods-capstone", "deep-value-capstone", "on-policy-capstone", "model-based-capstone", "sequence-policy-capstone", "rl-research-capstone"],
  embodied: ["task-contract-capstone", "state-estimator-capstone", "behavior-cloning-capstone", "vla-policy-capstone", "recovery-intervention-capstone", "embodied-research-capstone"],
};

let count = 0;
for (const [course, ids] of Object.entries(courseArtifacts)) for (const id of ids) {
  const artifact = JSON.parse(readFileSync(join(root, "public/capstone-artifacts", course, `${id}.json`), "utf8"));
  assert.equal(artifact.schemaVersion, 1, `${course}:${id} schema`);
  assert.equal(artifact.course, course, `${course}:${id} course`);
  assert.equal(artifact.lessonId, id, `${course}:${id} lesson`);
  assert.match(artifact.evidenceKind, /fixture/, `${course}:${id} evidence kind`);
  assert.ok(Array.isArray(artifact.rawRows), `${course}:${id} raw rows`);
  const canonical = referenceContracts[course]?.[id];
  if (canonical?.matrixAxes) {
    assert.deepEqual(artifact.manifest?.matrixAxes, canonical.matrixAxes, `${course}:${id} artifact axes must match the independent source contract`);
  }
  if (artifact.manifest?.matrixAxes) {
    const axes = Object.entries(artifact.manifest.matrixAxes);
    assert.ok(axes.length >= 1, `${course}:${id} matrix axes`);
    for (const [field, values] of axes) assert.ok(Array.isArray(values) && values.length > 0, `${course}:${id} axis ${field}`);
    const expected = axes.reduce((cells, [field, values]) => cells.flatMap((cell) => values.map((value) => ({ ...cell, [field]: value }))), [{}]);
    const key = (row) => JSON.stringify(axes.map(([field]) => row[field]));
    const actualKeys = artifact.rawRows.map(key);
    assert.equal(new Set(actualKeys).size, actualKeys.length, `${course}:${id} duplicate matrix cell`);
    assert.deepEqual(new Set(actualKeys), new Set(expected.map(key)), `${course}:${id} complete declared matrix`);
  }
  if (canonical?.requiredCells) {
    assert.deepEqual(artifact.manifest?.requiredCells, canonical.requiredCells, `${course}:${id} declared cells must match the independent source contract`);
    const fields = Object.keys(canonical.requiredCells[0]);
    const key = (row) => JSON.stringify(fields.map((field) => row[field]));
    assert.deepEqual(new Set(artifact.rawRows.map(key)), new Set(canonical.requiredCells.map(key)), `${course}:${id} complete canonical required cells`);
  }
  if (canonical?.primitiveBudget) {
    assert.deepEqual(artifact.manifest?.primitiveBudget, canonical.primitiveBudget, `${course}:${id} canonical primitive budget`);
    for (const row of artifact.rawRows) assert.deepEqual(row.budget, canonical.primitiveBudget, `${course}:${id} ${row.seed}/${row.arm} row budget`);
  }
  if (canonical?.metric) {
    assert.deepEqual(artifact.manifest?.metric, canonical.metric, `${course}:${id} canonical metric contract`);
    assert.ok(canonical.metric.field.length >= 5 && canonical.metric.name.length >= 20 && canonical.metric.unit.length >= 12 && canonical.metric.aggregation.length >= 30, `${course}:${id} auditable metric definition`);
    for (const row of artifact.rawRows) {
      assert.ok(Number.isFinite(row[canonical.metric.field]), `${course}:${id} ${row.seed}/${row.arm} finite named metric`);
      assert.equal("score" in row, false, `${course}:${id} cannot retain an undefined generic score`);
    }
  }
  if (canonical?.intervention) assert.deepEqual(artifact.manifest?.intervention, canonical.intervention, `${course}:${id} canonical intervention contract`);
  assert.ok(artifact.decision.length >= 50, `${course}:${id} decision`);
  assert.ok(artifact.failure.length >= 50, `${course}:${id} failure`);
  assert.ok(artifact.boundary.length >= 60, `${course}:${id} boundary`);
  count += 1;
}
console.log(`Verified ${count} research-course capstone artifact(s).`);
