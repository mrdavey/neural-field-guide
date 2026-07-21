import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { access, chmod, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
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
  const [workflow, activeWorkflow] = await Promise.all([
    read("docs/github-pages/deploy-pages.yml"),
    read(".github/workflows/deploy-pages.yml"),
  ]);
  assert.equal(activeWorkflow, workflow, "the active Pages workflow must stay synchronized with its reviewed template");
  for (const required of [
    "schedule:",
    'cron: "17 3 * * 1"',
    "ubuntu-24.04",
    "node-version: 22.13.0",
    "actions/setup-python@v6",
    'python-version: "3.12"',
    "cache: pip",
    "requirements-ci.txt",
    "public/capstone-artifacts/*/requirements-capstones.txt",
    "npm run ci:verify",
    "actions/configure-pages@v6",
    "steps.pages.outputs.base_path",
    "path: out",
    "actions/deploy-pages@v4",
  ]) assert.ok(workflow.includes(required), `Workflow is missing ${required}`);
  assert.doesNotMatch(workflow, /ubuntu-latest/);
  assert.doesNotMatch(workflow, /python -m pip install|run: npm test|run: npm ci/, "workflow setup and verification must not drift from ci:verify");
  const configure = workflow.indexOf("Configure GitHub Pages");
  const verify = workflow.indexOf("Verify the direct-main release contract");
  const upload = workflow.indexOf("Upload Pages artifact");
  assert.ok(configure < verify && verify < upload, "Pages base path must feed the shared verifier before upload");
  assert.ok((workflow.match(/if: github\.event_name != 'schedule'/g) ?? []).length >= 3, "scheduled verification must skip configuration, upload, and deployment");
});

test("direct pushes use the same isolated verification contract as GitHub Actions", async () => {
  const [packageJsonText, hook, installer, verifier, guide, hookInfo] = await Promise.all([
    read("package.json"),
    read(".githooks/pre-push"),
    read("scripts/install-git-hooks.mjs"),
    read("scripts/ci-verify.mjs"),
    read("docs/GITHUB_PAGES.md"),
    stat(new URL("../.githooks/pre-push", import.meta.url)),
  ]);
  const packageJson = JSON.parse(packageJsonText);
  assert.equal(packageJson.scripts["ci:verify"], "node scripts/ci-verify.mjs");
  assert.equal(packageJson.scripts["hooks:install"], "node scripts/install-git-hooks.mjs");
  assert.equal(packageJson.scripts.prepare, "node scripts/install-git-hooks.mjs", "npm install must activate the repository hooks automatically");
  assert.match(hook, /npm run ci:verify/);
  assert.doesNotMatch(hook, /--no-verify/);
  assert.ok((hookInfo.mode & 0o111) !== 0, "pre-push hook must be executable");
  assert.match(installer, /core\.hooksPath/);
  assert.match(installer, /\.githooks/);
  for (const required of [
    'run("npm", ["ci"]',
    '"-m", "venv"',
    "PYTHONNOUSERSITE",
    '"-r", ciRequirements',
    'run("npm", ["run", "lint"]',
    'run("npm", ["test"]',
    'run("npm", ["run", "build:pages"]',
    'run("npm", ["run", "verify:pages"]',
  ]) assert.ok(verifier.includes(required), `shared verifier is missing ${required}`);
  assert.match(guide, /git push --no-verify/);
  assert.match(guide, /direct push to `main`/);
});

test("the pre-push hook propagates a failed shared verification", async () => {
  const fakeBin = await mkdtemp(join(tmpdir(), "neural-field-guide-hook-"));
  const fakeNpm = join(fakeBin, "npm");
  try {
    await writeFile(fakeNpm, "#!/bin/sh\nexit 73\n");
    await chmod(fakeNpm, 0o755);
    const run = spawnSync(fileURLToPath(new URL("../.githooks/pre-push", import.meta.url)), [], {
      cwd: fileURLToPath(new URL("..", import.meta.url)),
      encoding: "utf8",
      env: { ...process.env, PATH: `${fakeBin}:${process.env.PATH ?? ""}` },
    });
    assert.equal(run.status, 73, `hook must preserve verifier failure; stderr: ${run.stderr}`);
  } finally {
    await rm(fakeBin, { recursive: true, force: true });
  }
});

test("the aggregate Python CI lock covers every capstone runtime lock", async () => {
  const aggregate = await read("requirements-ci.txt");
  const entries = await readdir(new URL("../public/capstone-artifacts/", import.meta.url), { withFileTypes: true });
  const discovered = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const path = `public/capstone-artifacts/${entry.name}/requirements-capstones.txt`;
    try {
      await access(new URL(`../${path}`, import.meta.url));
      discovered.push(path);
    } catch {
      // This capstone family has no Python runtime lock.
    }
  }
  const listed = [...aggregate.matchAll(/^(?:-r|--requirement)\s+(.+)$/gm)].map((match) => match[1].trim()).sort();
  assert.deepEqual(listed, discovered.sort());
  for (const path of discovered) assert.match(await read(path), /^\S+==\S+/m, `${path} must pin its runtime dependency`);
});

test("the minimum supported Node runtime can execute TypeScript-importing tests", async () => {
  const packageJson = JSON.parse(await read("package.json"));
  assert.equal(packageJson.engines.node, ">=22.13.0");
  assert.match(packageJson.scripts.test, /node --experimental-strip-types --test tests\/\*\.test\.mjs/);
});

test("Pages build is static-export and public assets are base-path aware", async () => {
  const [config, pagesConfig, helper, capstones, validations] = await Promise.all([
    read("next.config.ts"),
    read("tsconfig.pages.json"),
    read("app/public-path.ts"),
    read("app/capstone-evidence.ts"),
    read("app/validation-artifacts.ts"),
  ]);
  assert.match(config, /output: "export"/);
  assert.match(config, /basePath: pagesBasePath/);
  assert.match(pagesConfig, /\.next\/cache\/tsconfig\.pages\.tsbuildinfo/, "Pages type cache must remain ignored during pre-push verification");
  assert.match(helper, /NEXT_PUBLIC_BASE_PATH/);
  assert.ok((capstones.match(/publicPath\(/g) ?? []).length >= 7);
  assert.ok((validations.match(/publicPath\(/g) ?? []).length >= 6);
});

test("GitHub Pages is the only configured deployment target", async () => {
  const [readme, guidance, packageJson, gitignore] = await Promise.all([
    read("README.md"),
    read("AGENTS.md"),
    read("package.json"),
    read(".gitignore"),
  ]);
  assert.match(readme, /GitHub Pages is the supported target/);
  assert.match(guidance, /GitHub Pages is the only planned deployment target/);
  assert.match(gitignore, /^\*\.tsbuildinfo$/m, "generated TypeScript caches must stay untracked");
  for (const removedPackage of ["vinext", "wrangler", "@cloudflare/vite-plugin", "drizzle-kit", "drizzle-orm"]) {
    assert.ok(!packageJson.includes(`"${removedPackage}"`), `${removedPackage} should not remain in the dependency graph`);
  }
  await assert.rejects(access(new URL("../.openai/hosting.json", import.meta.url)));
  await assert.rejects(access(new URL("../vite.config.ts", import.meta.url)));
  await assert.rejects(access(new URL("../worker/index.ts", import.meta.url)));
  await assert.rejects(access(new URL("../app/chatgpt-auth.ts", import.meta.url)));
  await assert.rejects(access(new URL("../drizzle/meta/_journal.json", import.meta.url)));
});
