#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));

function git(args) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr.trim() || `git ${args.join(" ")} failed`);
  return result.stdout.trim();
}

git(["config", "core.hooksPath", ".githooks"]);
assert.equal(git(["config", "--get", "core.hooksPath"]), ".githooks");
console.log("Installed repository hooks from .githooks. Direct pushes now run npm run ci:verify.");
