#!/usr/bin/env node

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir, platform, release, arch } from "node:os";
import { delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const ciRequirements = "requirements-ci.txt";
const defaultPagesBasePath = "/neural-field-guide";

function commandLabel(command, args) {
  return [command, ...args].map((part) => (/\s/.test(part) ? JSON.stringify(part) : part)).join(" ");
}

function run(command, args, { env = process.env, capture = false, allowFailure = false } = {}) {
  const label = commandLabel(command, args);
  if (!capture) console.log(`\n[ci:verify] ${label}`);
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: capture ? "utf8" : undefined,
    env,
    stdio: capture ? "pipe" : "inherit",
  });
  if (result.error) {
    if (allowFailure) return result;
    throw new Error(`${label}: ${result.error.message}`);
  }
  if (!allowFailure && result.status !== 0) throw new Error(`${label} exited with status ${result.status}`);
  return result;
}

function selectPython() {
  const candidates = [...new Set([process.env.CI_PYTHON, "python3.12", "python3", "python"].filter(Boolean))];
  for (const command of candidates) {
    const probe = run(command, ["-c", "import json,sys; print(json.dumps({'executable': sys.executable, 'version': list(sys.version_info[:3])}))"], { capture: true, allowFailure: true });
    if (probe.status !== 0) continue;
    const info = JSON.parse(probe.stdout.trim());
    if (info.version[0] === 3 && info.version[1] === 12) return { command, ...info };
  }
  throw new Error("ci:verify requires Python 3.12. Install it or set CI_PYTHON to a Python 3.12 executable.");
}

function assertNodeRuntime() {
  const [major, minor] = process.versions.node.split(".").map(Number);
  assert.ok(major > 22 || (major === 22 && minor >= 13), `Node ${process.versions.node} is below the supported 22.13.0 floor`);
  if (process.env.GITHUB_ACTIONS === "true") {
    assert.equal(process.versions.node, "22.13.0", "GitHub Actions must use the pinned Node 22.13.0 runtime");
    assert.equal(process.env.RUNNER_OS, "Linux", "GitHub Actions verification must run on Linux");
  }
}

function dependencyContract() {
  const artifactRoot = join(root, "public", "capstone-artifacts");
  const discovered = readdirSync(artifactRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join("public", "capstone-artifacts", entry.name, "requirements-capstones.txt"))
    .filter((path) => existsSync(join(root, path)))
    .sort();
  const lockText = readFileSync(join(root, ciRequirements), "utf8");
  const listed = [...lockText.matchAll(/^(?:-r|--requirement)\s+(.+)$/gm)].map((match) => match[1].trim()).sort();
  assert.deepEqual(listed, discovered, `${ciRequirements} must include every course capstone requirements file exactly once`);

  const files = [ciRequirements, ...discovered];
  const hash = createHash("sha256");
  for (const path of files) {
    hash.update(path);
    hash.update("\0");
    hash.update(readFileSync(join(root, path)));
    hash.update("\0");
  }
  return { files, hash: hash.digest("hex") };
}

function normalizedBasePath() {
  const value = process.env.CI_PAGES_BASE_PATH?.trim() || defaultPagesBasePath;
  assert.match(value, /^\/[a-zA-Z0-9._-]+$/, "CI_PAGES_BASE_PATH must be one non-root URL segment such as /neural-field-guide");
  return value;
}

function gitRevision() {
  const result = run("git", ["rev-parse", "--short=12", "HEAD"], { capture: true, allowFailure: true });
  return result.status === 0 ? result.stdout.trim() : "unavailable";
}

function main() {
  assertNodeRuntime();
  const python = selectPython();
  const dependencies = dependencyContract();
  const pagesBasePath = normalizedBasePath();
  const venv = mkdtempSync(join(tmpdir(), "neural-field-guide-ci-"));
  const venvPython = process.platform === "win32" ? join(venv, "Scripts", "python.exe") : join(venv, "bin", "python");

  console.log("[ci:verify] environment receipt");
  console.log(`  revision: ${gitRevision()}`);
  console.log(`  operating system: ${platform()} ${release()} ${arch()}`);
  console.log(`  node: ${process.versions.node}`);
  console.log(`  python: ${python.version.join(".")} (${python.executable})`);
  console.log(`  dependency contract: sha256:${dependencies.hash}`);
  console.log(`  dependency files: ${dependencies.files.join(", ")}`);
  console.log(`  project Pages base path: ${pagesBasePath}`);

  try {
    run("npm", ["ci"]);
    run(python.command, ["-m", "venv", venv]);
    const isolatedProbe = run(venvPython, ["-c", "import numpy"], { capture: true, allowFailure: true });
    assert.notEqual(isolatedProbe.status, 0, "the fresh CI virtual environment unexpectedly inherited NumPy");
    run(venvPython, ["-m", "pip", "install", "--disable-pip-version-check", "-r", ciRequirements]);
    const numpyVersion = run(venvPython, ["-c", "import numpy; print(numpy.__version__)"], { capture: true }).stdout.trim();
    console.log(`[ci:verify] isolated NumPy: ${numpyVersion}`);

    const commandEnvironment = {
      ...process.env,
      CI_PYTHON: venvPython,
      PATH: `${dirname(venvPython)}${delimiter}${process.env.PATH ?? ""}`,
      PYTHONNOUSERSITE: "1",
      VIRTUAL_ENV: venv,
    };
    run("npm", ["run", "lint"], { env: commandEnvironment });
    run("npm", ["test"], { env: commandEnvironment });
    run("npm", ["run", "build:pages"], {
      env: { ...commandEnvironment, NEXT_PUBLIC_BASE_PATH: pagesBasePath },
    });
    run("npm", ["run", "verify:pages"], {
      env: { ...commandEnvironment, EXPECTED_PAGES_BASE_PATH: pagesBasePath },
    });
    console.log("\n[ci:verify] complete: isolated dependencies, lint, full tests, and both Pages URL shapes passed.");
  } finally {
    rmSync(venv, { recursive: true, force: true });
  }
}

try {
  main();
} catch (error) {
  console.error(`\n[ci:verify] failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
