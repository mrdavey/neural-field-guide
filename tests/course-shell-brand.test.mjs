import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("the course shell renders the Neural Field Guide header mark through publicPath", async () => {
  const [layout, app, styles] = await Promise.all([
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("app/course-app.tsx", root), "utf8"),
    readFile(new URL("app/brand.css", root), "utf8"),
  ]);

  assert.match(layout, /publicPath\("brand\/neural-field-guide-mark\.png"\)/);
  assert.match(layout, /"--brand-mark-image"/);
  assert.match(styles, /background:\s*var\(--brand-mark-image\) center \/ contain no-repeat/);
  assert.match(styles, /font-size:\s*0/);
  assert.match(app, /<a className="brand" href=\{publicPath\("\/"\)\} aria-label="Go to the all-courses landing page">/);
  assert.match(app, /className="sidebar-course-home" onClick=\{openHome\}/);
  assert.match(styles, /\.brand:focus-visible/);
  assert.match(styles, /\.sidebar-course-home/);
});

test("the header mark is a compact transparent PNG", async () => {
  const png = await readFile(new URL("public/brand/neural-field-guide-mark.png", root));

  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(png.readUInt32BE(16), 256);
  assert.equal(png.readUInt32BE(20), 256);
  assert.equal(png[25], 6, "PNG should use RGBA color type for transparent header placement");
});
