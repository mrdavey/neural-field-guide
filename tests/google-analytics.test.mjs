import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const measurementId = "G-ZLJDBH230K";
const scriptSource = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(entryPath));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(entryPath);
  }
  return files;
}

test("the root layout installs the Google tag at the start of head", async () => {
  const layout = await readFile(path.join(root, "app/layout.tsx"), "utf8");
  const headStart = layout.indexOf("<head>");
  const loader = layout.indexOf(scriptSource);
  const config = layout.indexOf(`gtag('config', '${measurementId}')`);
  const headEnd = layout.indexOf("</head>");

  assert.ok(headStart >= 0 && headStart < loader, "Google tag loader should follow the opening head tag");
  assert.ok(loader < config && config < headEnd, "Google tag initialization should stay inside head");
});

test("every exported HTML page includes the Google tag inside head", async () => {
  const files = await htmlFiles(path.join(root, "out"));
  assert.ok(files.length >= 187, "expected the complete static course export");

  for (const file of files) {
    const html = await readFile(file, "utf8");
    const headStart = html.indexOf("<head>");
    const loader = html.indexOf(scriptSource);
    const config = html.indexOf(`gtag('config', '${measurementId}')`);
    const headEnd = html.indexOf("</head>");
    assert.ok(headStart >= 0 && headStart < loader && loader < config && config < headEnd, `${path.relative(root, file)} should load and configure Google Analytics inside head`);
  }
});
