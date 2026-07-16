import assert from "node:assert/strict";

// Executable fixtures can accumulate tiny libm differences across operating
// systems. These tolerances apply only to persisted, non-integer measurements;
// fixture invariants remain independently asserted by each generator.
export const ARTIFACT_FLOAT_TOLERANCE = Object.freeze({
  absolute: 1e-9,
  relative: 1e-9,
});

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const pathForKey = (path, key) => /^[A-Za-z_$][\w$]*$/.test(key)
  ? `${path}.${key}`
  : `${path}[${JSON.stringify(key)}]`;

function fail(path, message) {
  assert.fail(`${path}: ${message}`);
}

function compareNumber(expected, actual, path, tolerance) {
  if (!Number.isFinite(expected) || !Number.isFinite(actual)) {
    fail(path, `expected and actual must be finite numbers; expected ${expected}, received ${actual}`);
  }

  // Treat signed zero as the same JSON value. Every other integer represents a
  // discrete contract field (steps, shapes, token counts) and must stay exact.
  if (actual === expected) return;
  if (Number.isInteger(expected) || Number.isInteger(actual)) {
    fail(path, `expected exact integer ${expected}, received ${actual}`);
  }

  const delta = Math.abs(actual - expected);
  const allowed = tolerance.absolute + tolerance.relative * Math.max(Math.abs(expected), Math.abs(actual));
  if (delta > allowed) {
    fail(path, `numeric difference exceeds tolerance; expected ${expected}, received ${actual}, delta ${delta}, allowed ${allowed}`);
  }
}

function compare(expected, actual, path, tolerance) {
  if (typeof expected !== typeof actual) {
    fail(path, `type mismatch; expected ${typeof expected}, received ${typeof actual}`);
  }

  if (typeof expected === "number") {
    compareNumber(expected, actual, path, tolerance);
    return;
  }

  if (expected === null || actual === null) {
    if (expected !== actual) fail(path, `expected ${expected}, received ${actual}`);
    return;
  }

  if (Array.isArray(expected) || Array.isArray(actual)) {
    if (!Array.isArray(expected) || !Array.isArray(actual)) fail(path, "array/object shape mismatch");
    if (expected.length !== actual.length) fail(path, `array length mismatch; expected ${expected.length}, received ${actual.length}`);
    for (let index = 0; index < expected.length; index += 1) compare(expected[index], actual[index], `${path}[${index}]`, tolerance);
    return;
  }

  if (typeof expected === "object") {
    for (const key of Object.keys(expected)) {
      if (!hasOwn(actual, key)) fail(pathForKey(path, key), "missing key in actual artifact");
    }
    for (const key of Object.keys(actual)) {
      if (!hasOwn(expected, key)) fail(pathForKey(path, key), "unexpected key in actual artifact");
    }
    for (const key of Object.keys(expected)) compare(expected[key], actual[key], pathForKey(path, key), tolerance);
    return;
  }

  if (expected !== actual) fail(path, `expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
}

export function assertArtifactEquivalent(expected, actual, tolerance = ARTIFACT_FLOAT_TOLERANCE) {
  if (!Number.isFinite(tolerance.absolute) || tolerance.absolute < 0) throw new TypeError("absolute tolerance must be a non-negative finite number");
  if (!Number.isFinite(tolerance.relative) || tolerance.relative < 0) throw new TypeError("relative tolerance must be a non-negative finite number");
  compare(expected, actual, "$", tolerance);
}
