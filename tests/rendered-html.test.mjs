import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("the static root forwards while all five course homes render the finished experience", async () => {
  const [root, llm, worldmodel, generative, rl, embodied] = await Promise.all([
    readFile(new URL("../out/index.html", import.meta.url), "utf8"),
    readFile(new URL("../out/llm/index.html", import.meta.url), "utf8"),
    readFile(new URL("../out/worldmodel/index.html", import.meta.url), "utf8"),
    readFile(new URL("../out/generative/index.html", import.meta.url), "utf8"),
    readFile(new URL("../out/rl/index.html", import.meta.url), "utf8"),
    readFile(new URL("../out/embodied/index.html", import.meta.url), "utf8"),
  ]);
  assert.match(root, /Opening your course/);
  for (const html of [llm, worldmodel, generative, rl, embodied]) {
    assert.match(html, /Neural Field Guide/);
    assert.match(html, /connected frontiers/);
    assert.match(html, /The finish line/);
    assert.match(html, /Start the course/);
    assert.match(html, /Course lessons/);
    assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/);
  }
  assert.match(llm, /Understand the machine/);
  assert.match(worldmodel, /Predict the world/);
  assert.match(generative, /Model possibility/);
  assert.match(rl, /Learn to decide/);
  assert.match(embodied, /Ground intelligence/);
});

test("every lesson has a directly rendered canonical static URL and LLM legacy forward", async () => {
  const [source, sectionNames] = await Promise.all([
    readFile(new URL("../app/course-data.ts", import.meta.url), "utf8"),
    import("node:fs/promises").then(({ readdir }) => readdir(new URL("../app/world-models/sections/", import.meta.url))),
  ]);
  const lessons = [...source.matchAll(/\n    id: "([^"]+)", track: "[^"]+", title: "([^"]+)"/g)]
    .map((match) => ({ id: match[1], title: match[2] }));
  assert.equal(lessons.length, 44);

  for (const lesson of lessons) {
    const html = await readFile(new URL(`../out/llm/${lesson.id}/index.html`, import.meta.url), "utf8");
    const readableHtml = html.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#x27;", "'");
    assert.ok(readableHtml.includes(lesson.title), `/llm/${lesson.id}/ should render ${lesson.title}`);
    const legacy = await readFile(new URL(`../out/${lesson.id}/index.html`, import.meta.url), "utf8");
    assert.match(legacy, /This lesson moved into the LLM course/);
  }

  const worldSource = (await Promise.all(sectionNames.map((name) => readFile(new URL(`../app/world-models/sections/${name}`, import.meta.url), "utf8")))).join("\n");
  const worldLessons = [...worldSource.matchAll(/\n    id: "([^"]+)", track: "wm-[^"]+", title: "([^"]+)"/g)].map((match) => ({ id: match[1], title: match[2] }));
  assert.equal(worldLessons.length, 46);
  for (const lesson of worldLessons) {
    const html = await readFile(new URL(`../out/worldmodel/${lesson.id}/index.html`, import.meta.url), "utf8");
    assert.ok(html.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#x27;", "'").includes(lesson.title), `/worldmodel/${lesson.id}/ should render ${lesson.title}`);
  }
});

test("starter preview is removed and metadata is course-specific", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8")
  ]);
  assert.match(page, /CourseRootRedirect/);
  assert.match(layout, /Neural Field Guide/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});

test("lesson navigation updates real URLs and supports browser history", async () => {
  const [app, route, helper] = await Promise.all([
    readFile(new URL("../app/course-app.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/[courseId]/[lessonId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/public-path.ts", import.meta.url), "utf8"),
  ]);
  assert.match(route, /generateStaticParams/);
  assert.match(route, /dynamicParams = false/);
  assert.match(app, /window\.history\.pushState/);
  assert.match(app, /window\.addEventListener\("popstate"/);
  assert.match(app, /publicPath\(`\/\$\{course\.id\}\/\$\{id\}\/`\)/);
  assert.match(helper, /NEXT_PUBLIC_BASE_PATH/);
});
