import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("GitHub Pages runbook covers the complete publication lifecycle", async () => {
  const guide = await read("docs/GITHUB_PAGES.md");
  for (const required of [
    "pre-publication audit",
    "Dry-run the static export",
    "Activate the deployment workflow",
    "Enable Pages in repository settings",
    "live acceptance check",
    "Updating or rolling back",
    "Optional custom domain",
    "Troubleshooting",
  ]) assert.match(guide, new RegExp(required, "i"));
});

test("Pages deployment stays inert until the learner deliberately activates it", async () => {
  const [guide, workflow] = await Promise.all([
    read("docs/GITHUB_PAGES.md"),
    read("docs/github-pages/deploy-pages.yml"),
  ]);
  assert.match(guide, /cp docs\/github-pages\/deploy-pages\.yml \.github\/workflows\/deploy-pages\.yml/);
  assert.match(workflow, /Inert template/);
});

test("Pages workflow tests, prefixes, verifies, and uploads only static output", async () => {
  const workflow = await read("docs/github-pages/deploy-pages.yml");
  for (const required of [
    "npm test",
    "actions/configure-pages@v6",
    "steps.pages.outputs.base_path",
    "npm run build:pages",
    "npm run verify:pages",
    "path: out",
    "actions/deploy-pages@v4",
  ]) assert.ok(workflow.includes(required), `Workflow is missing ${required}`);
});

test("the minimum supported Node runtime can execute TypeScript-importing tests", async () => {
  const packageJson = JSON.parse(await read("package.json"));
  assert.equal(packageJson.engines.node, ">=22.13.0");
  assert.match(packageJson.scripts.test, /node --experimental-strip-types --test tests\/\*\.test\.mjs/);
});

test("Pages build is static-export and public assets are base-path aware", async () => {
  const [config, helper, capstones, validations] = await Promise.all([
    read("next.config.ts"),
    read("app/public-path.ts"),
    read("app/capstone-evidence.ts"),
    read("app/validation-artifacts.ts"),
  ]);
  assert.match(config, /output: "export"/);
  assert.match(config, /basePath: pagesBasePath/);
  assert.match(helper, /NEXT_PUBLIC_BASE_PATH/);
  assert.ok((capstones.match(/publicPath\(/g) ?? []).length >= 7);
  assert.ok((validations.match(/publicPath\(/g) ?? []).length >= 6);
});

test("GitHub Pages is the only configured deployment target", async () => {
  const [readme, guidance, packageJson] = await Promise.all([
    read("README.md"),
    read("AGENTS.md"),
    read("package.json"),
  ]);
  assert.match(readme, /GitHub Pages is the supported target/);
  assert.match(guidance, /GitHub Pages is the only planned deployment target/);
  for (const removedPackage of ["vinext", "wrangler", "@cloudflare/vite-plugin", "drizzle-kit", "drizzle-orm"]) {
    assert.ok(!packageJson.includes(`"${removedPackage}"`), `${removedPackage} should not remain in the dependency graph`);
  }
  await assert.rejects(access(new URL("../.openai/hosting.json", import.meta.url)));
  await assert.rejects(access(new URL("../vite.config.ts", import.meta.url)));
  await assert.rejects(access(new URL("../worker/index.ts", import.meta.url)));
});
