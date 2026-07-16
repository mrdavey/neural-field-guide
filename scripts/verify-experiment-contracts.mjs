import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const cache = new Map();

function resolveTypeScriptModule(specifier, parentFile) {
  const candidate = resolve(dirname(parentFile), specifier);
  for (const path of [candidate, `${candidate}.ts`, join(candidate, "index.ts")]) if (existsSync(path) && extname(path) === ".ts") return path;
  throw new Error(`Cannot resolve ${specifier} from ${parentFile}`);
}

function loadTypeScriptModule(file) {
  const absolute = resolve(file);
  if (cache.has(absolute)) return cache.get(absolute).exports;
  const moduleRecord = { exports: {} };
  cache.set(absolute, moduleRecord);
  const javascript = ts.transpileModule(readFileSync(absolute, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }, fileName: absolute }).outputText;
  const localRequire = (specifier) => specifier.startsWith(".") ? loadTypeScriptModule(resolveTypeScriptModule(specifier, absolute)) : require(specifier);
  Function("exports", "require", "module", "__filename", "__dirname", javascript)(moduleRecord.exports, localRequire, moduleRecord, absolute, dirname(absolute));
  return moduleRecord.exports;
}

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const { externalExperiments } = loadTypeScriptModule(join(root, "app/external-experiments.ts"));

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

for (const [key, contract] of Object.entries(externalExperiments)) {
  invariant(key === contract.id, `${key}: registry key must match contract ID`);
  invariant(contract.schemaVersion === "1.0" && contract.executionLabel === "external", `${key}: schema and label`);
  invariant(contract.objective.length >= 50 && contract.boundary.length >= 80, `${key}: outcome and boundary must be substantive`);
  invariant(Object.keys(contract.revisions.dependencies).length > 0, `${key}: dependency pins`);
  invariant(contract.providers.some((provider) => provider.id === "colab"), `${key}: Colab instructions`);
  invariant(contract.providers.some((provider) => provider.id === "local" || provider.id === "compatible-service"), `${key}: portable fallback`);
  invariant(/requirements-/.test(contract.commands.install), `${key}: pinned install command`);
  invariant(/smoke/.test(contract.commands.smoke), `${key}: bounded smoke command`);
  invariant(/--device cuda/.test(contract.commands.full), `${key}: full accelerator command`);
  invariant(contract.providers.every((provider) => provider.setup.length >= 2 && provider.run.length >= 2), `${key}: complete provider steps`);
  invariant(contract.expected.invariants.length >= 3 && contract.expected.observations.length >= 2, `${key}: expected results split`);
  invariant(contract.diagnostics.length >= 2 && contract.diagnostics.every((item) => item.retry.length >= 20), `${key}: diagnostic retry routes`);
  invariant(contract.output.requiredFields.length >= 4, `${key}: output schema fields`);

  if (contract.runbook) {
    const runbook = join(root, contract.runbook.repositoryPath);
    invariant(existsSync(runbook), `${key}: missing repository runbook`);
    invariant(contract.runbook.publicUrl.length >= 8, `${key}: public runbook URL`);
  }

  if (contract.expected.reviewedReference) {
    invariant(contract.expected.reviewedReference.evidenceTier === "measured-external-run", `${key}: reviewed reference evidence tier`);
    invariant(contract.expected.reviewedReference.rawRows > 0, `${key}: reviewed reference raw rows`);
  }

  if (contract.expected.teachingFixture) {
    const relative = contract.expected.teachingFixture.artifact.replace(/^\//, "public/");
    const path = join(root, relative);
    invariant(existsSync(path), `${key}: missing teaching fixture ${relative}`);
    const digest = createHash("sha256").update(readFileSync(path)).digest("hex");
    invariant(digest === contract.expected.teachingFixture.sha256, `${key}: teaching fixture checksum drift`);
    invariant(/simulat|fixture|not .*measur/i.test(contract.expected.teachingFixture.boundary), `${key}: teaching fixture boundary`);
  }
}

console.log(`Verified ${Object.keys(externalExperiments).length} portable external experiment contract(s).`);
