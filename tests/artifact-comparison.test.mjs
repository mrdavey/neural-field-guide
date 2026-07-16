import assert from "node:assert/strict";
import test from "node:test";

import {
  ARTIFACT_FLOAT_TOLERANCE,
  assertArtifactEquivalent,
} from "../scripts/assert-artifact-equivalent.mjs";

const fixture = () => ({
  schema_version: "1.0",
  status: "pass",
  enabled: true,
  optional: null,
  shape: [1, 4, 4],
  metrics: [{ step: 0, loss: 1.3642430504134744 }],
});

test("artifact comparison accepts bounded floating-point drift in nested measurements", () => {
  const expected = fixture();
  const actual = structuredClone(expected);
  actual.metrics[0].loss += ARTIFACT_FLOAT_TOLERANCE.absolute / 2;

  assert.doesNotThrow(() => assertArtifactEquivalent(expected, actual));

  expected.metrics[0].loss = 1_000_000.25;
  actual.metrics[0].loss = expected.metrics[0].loss + 0.0005;
  assert.doesNotThrow(() => assertArtifactEquivalent(expected, actual));
});

test("artifact comparison keeps discrete values and structure exact", () => {
  const expected = fixture();

  for (const [mutate, path] of [
    [(actual) => { actual.shape[1] = 5; }, String.raw`\$\.shape\[1\]`],
    [(actual) => { actual.status = "fail"; }, String.raw`\$\.status`],
    [(actual) => { delete actual.enabled; }, String.raw`\$\.enabled`],
    [(actual) => { actual.extra = "unexpected"; }, String.raw`\$\.extra`],
  ]) {
    const actual = structuredClone(expected);
    mutate(actual);
    assert.throws(() => assertArtifactEquivalent(expected, actual), new RegExp(path));
  }
});

test("artifact comparison rejects meaningful numeric drift with an actionable path and delta", () => {
  const expected = fixture();
  const actual = structuredClone(expected);
  actual.metrics[0].loss += 1e-4;

  assert.throws(
    () => assertArtifactEquivalent(expected, actual),
    (error) => {
      assert.match(error.message, /\$\.metrics\[0\]\.loss/);
      assert.match(error.message, /delta/);
      assert.match(error.message, /allowed/);
      return true;
    },
  );
});

test("artifact comparison rejects non-finite measurements and invalid tolerances", () => {
  const expected = fixture();
  const actual = structuredClone(expected);
  actual.metrics[0].loss = Number.NaN;

  assert.throws(() => assertArtifactEquivalent(expected, actual), /must be finite numbers/);
  assert.throws(() => assertArtifactEquivalent(expected, expected, { absolute: -1, relative: 0 }), /absolute tolerance/);
  assert.throws(() => assertArtifactEquivalent(expected, expected, { absolute: 0, relative: Number.POSITIVE_INFINITY }), /relative tolerance/);
});
