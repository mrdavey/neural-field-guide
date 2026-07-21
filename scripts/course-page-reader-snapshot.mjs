import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { courseGradeFingerprint } from "./course-grade-fingerprint.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const require = createRequire(import.meta.url);
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const moduleCache = new Map();

function resolveTypeScriptModule(specifier, parentFile) {
  const candidate = resolve(dirname(parentFile), specifier);
  for (const path of [candidate, `${candidate}.ts`, `${candidate}.tsx`, join(candidate, "index.ts"), join(candidate, "index.tsx")]) {
    if (existsSync(path) && [".ts", ".tsx"].includes(extname(path))) return path;
  }
  throw new Error(`Cannot resolve ${specifier} from ${parentFile}`);
}

function compileTypeScriptModule(file, source, cacheKey = resolve(file), requireOverrides = {}) {
  const absolute = resolve(file);
  if (moduleCache.has(cacheKey)) return moduleCache.get(cacheKey).exports;
  const moduleRecord = { exports: {} };
  moduleCache.set(cacheKey, moduleRecord);
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    fileName: absolute,
  }).outputText;
  const localRequire = (specifier) => Object.hasOwn(requireOverrides, specifier)
    ? requireOverrides[specifier]
    : specifier.startsWith(".")
      ? loadTypeScriptModule(resolveTypeScriptModule(specifier, absolute))
      : require(specifier);
  Function("exports", "require", "module", "__filename", "__dirname", javascript)(moduleRecord.exports, localRequire, moduleRecord, absolute, dirname(absolute));
  return moduleRecord.exports;
}

function loadTypeScriptModule(file) {
  const absolute = resolve(file);
  return compileTypeScriptModule(absolute, readFileSync(absolute, "utf8"), absolute);
}

function loadPrivateReaderData(file, bindings, options = {}) {
  const absolute = resolve(file);
  const cacheKey = `${absolute}#reader:${options.cacheTag ?? "default"}:${bindings.join(",")}`;
  const source = `${readFileSync(absolute, "utf8")}\nexport const __readerData = { ${bindings.join(", ")} };\n`;
  return compileTypeScriptModule(absolute, source, cacheKey, options.requireOverrides).__readerData;
}

function htmlText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, value) => String.fromCodePoint(Number.parseInt(value, 16)))
    .replace(/&#(\d+);/g, (_, value) => String.fromCodePoint(Number(value)))
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
    .replace(/\s+/g, " ")
    .trim();
}

function renderedText(Component, props) {
  return htmlText(renderToStaticMarkup(React.createElement(Component, props)));
}

function renderedElementText(element) {
  return htmlText(renderToStaticMarkup(element));
}

const alternateStringState = {
  attention: "editing",
  average: "highrisk",
  bfloat16: "float16",
  causal: "masked",
  dp: "tp",
  function: "poetry",
  global: "ocr",
  greedy: "topk",
  healthy: "overfit",
  llm: "exact",
  random: "ranked",
  retrieval: "model",
  system: "user",
  topp: "greedy",
  web: "user",
};

function contrastingState(initial) {
  if (initial === undefined) return 0;
  if (initial === null) return "a";
  if (typeof initial === "boolean") return !initial;
  if (typeof initial === "number") {
    if (initial === 0) return 1;
    if (initial > 1) return initial >= 8 ? Math.max(1, Math.round(initial / 2)) : initial + 1;
    return initial === 1 ? 0.5 : Math.min(1, initial + 0.25);
  }
  if (typeof initial === "string") return alternateStringState[initial] ?? `${initial} contrast`;
  if (Array.isArray(initial)) return initial.length ? [...initial].reverse() : ["contrast"];
  if (initial && typeof initial === "object" && "x" in initial && "y" in initial) return { ...initial, word: `${initial.word ?? "point"}-contrast`, x: 82, y: 18 };
  return initial;
}

function propertyName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text;
  return undefined;
}

function stringValue(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return undefined;
}

function extractLlmLabMeta() {
  const file = join(root, "app/lesson-labs.tsx");
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let initializer;
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === "meta" && ts.isObjectLiteralExpression(node.initializer)) initializer = node.initializer;
    ts.forEachChild(node, visit);
  };
  visit(source);
  if (!initializer) throw new Error("Could not find the LLM lab metadata used by LessonLab");
  return Object.fromEntries(initializer.properties.flatMap((entry) => {
    if (!ts.isPropertyAssignment(entry) || !ts.isObjectLiteralExpression(entry.initializer)) return [];
    const key = propertyName(entry.name);
    if (!key) return [];
    const values = Object.fromEntries(entry.initializer.properties.flatMap((field) => {
      if (!ts.isPropertyAssignment(field)) return [];
      const name = propertyName(field.name);
      const value = stringValue(field.initializer);
      return name && value !== undefined ? [[name, value]] : [];
    }));
    return [[key, values]];
  }));
}

const { courseIds, courses } = loadTypeScriptModule(join(root, "app/course-catalog.ts"));
const { conceptFirstBridgeFor, conceptFirstCoverageFor, conceptFirstGuideFor, conceptFirstPlainText, conceptFirstSummaryFor, hasDeferredTechnicalMaterial: hasFormalTechnicalMaterial } = loadTypeScriptModule(join(root, "app/concept-first-curriculum.ts"));
const { conceptFirstOperationTraceFor } = loadTypeScriptModule(join(root, "app/concept-first-operation-traces.ts"));
const { lessonNarrativeResult } = loadTypeScriptModule(join(root, "app/lesson-narrative-handoffs.ts"));
const {
  continuityRecordForLesson,
  continuityRelationshipFor,
  isWorldModelAdvancedBranch,
  worldModelAdvancedBranchIds,
  worldModelResearchCapstoneId,
} = loadTypeScriptModule(join(root, "app/course-continuity.ts"));
const { externalExperiments } = loadTypeScriptModule(join(root, "app/external-experiments.ts"));
const { lessonEvidence } = loadTypeScriptModule(join(root, "app/lesson-evidence.ts"));
const { lessonTransferChecks } = loadTypeScriptModule(join(root, "app/lesson-transfer-checks.ts"));
const { lessonTransferDistractors } = loadTypeScriptModule(join(root, "app/lesson-transfer-distractors.ts"));
const { worldModelLessonLabSpecs } = loadTypeScriptModule(join(root, "app/world-models/lesson-lab-specs.ts"));
const { technicalValidations } = loadTypeScriptModule(join(root, "app/technical-validations.tsx"));
const { worldModelTechnicalValidations } = loadTypeScriptModule(join(root, "app/world-models/technical-validations.tsx"));
const { MasteryStudio } = loadTypeScriptModule(join(root, "app/mastery-studios.tsx"));
const { FineTuningWorkshop } = loadTypeScriptModule(join(root, "app/fine-tuning-workshop.tsx"));
const llmLabReaderData = loadPrivateReaderData(join(root, "app/lesson-labs.tsx"), ["renderLab"]);
const contrastingReact = {
  ...React,
  useMemo: (factory) => factory(),
  useState: (initial) => {
    const value = typeof initial === "function" ? initial() : initial;
    return [contrastingState(value), () => {}];
  },
};
const contrastingLlmLabReaderData = loadPrivateReaderData(join(root, "app/lesson-labs.tsx"), ["renderLab"], { cacheTag: "contrasting-state", requireOverrides: { react: contrastingReact } });
const masteryReaderData = loadPrivateReaderData(join(root, "app/mastery-studios.tsx"), ["recoveryArtifacts", "auditItems", "objectiveScenarios", "bridgeAssignments", "bridgeStages", "composerCases", "safetyIncidents"]);
const fineTuningReaderData = loadPrivateReaderData(join(root, "app/fine-tuning-workshop.tsx"), ["MODEL_ID", "hardwareProfiles", "readinessItems", "stages", "evaluationRows"]);
const visualByKey = Object.fromEntries(JSON.parse(readFileSync(join(root, "app/lesson-visual-manifest.json"), "utf8")).map((visual) => [`${visual.courseId}:${visual.lessonId}`, visual]));
const llmLabMeta = extractLlmLabMeta();

export const COURSE_PAGE_READER_SNAPSHOT_VERSION = "2026-07-21";
const DOSSIER_VERSION = COURSE_PAGE_READER_SNAPSHOT_VERSION;
const masteryStudioTitles = {
  "embedding-layer": "One word, one lookup, two contextual states",
  "pretraining-overview": "Make a pre-training run internally consistent",
  "data-engineering": "Turn cleaning slogans into defensible data decisions",
  "advanced-objectives": "Match the learning signal to the capability",
  "instruction-tuning-rlhf": "Put each intervention at the layer that can actually solve it",
  "posttraining-overview": "Use the smallest post-training stack that matches the target",
  "tools-safety": "Protect the boundary without breaking legitimate tool use",
};

function textList(...values) {
  return values.flat(Infinity).filter((value) => typeof value === "string" && value.trim().length > 0);
}

function headingPhrase(value) {
  return value.trim().replace(/[.!?]+$/, "");
}

function sentence(value) {
  const text = value.trim();
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function block(surface, kind, heading, prose = [], details = {}) {
  return { surface, kind, heading, prose: textList(prose), ...details };
}

function numberBlocks(blocks) {
  return blocks.map((item, index) => ({ order: index + 1, ...item }));
}

function trackFor(course, lesson) {
  const track = course.tracks.find((item) => item.id === lesson.track);
  if (!track) throw new Error(`Missing track ${lesson.track} for ${course.id}:${lesson.id}`);
  return track;
}

function nextUseText(course, lesson, next) {
  const nextGuide = next ? course.guides[next.id] : undefined;
  const nextCoverage = next ? course.objectiveCoverage[next.id] : undefined;
  const nextGoal = nextCoverage && next ? conceptFirstSummaryFor(next, nextCoverage, nextGuide) : nextGuide?.objectives[0] ?? next?.keyIdeas[0] ?? "the next mechanism";
  const currentCoverage = course.objectiveCoverage[lesson.id];
  const currentGuide = course.guides[lesson.id];
  const currentResult = currentCoverage && conceptFirstCoverageFor(lesson, currentCoverage, currentGuide).technical.length
    ? conceptFirstSummaryFor(lesson, currentCoverage, currentGuide)
    : lessonNarrativeResult(course.id, lesson);
  if (course.id === "worldmodel" && lesson.id === worldModelResearchCapstoneId) return "This completed protocol is the evidence-bearing conclusion of the course: preserve the result, null result, failures, and reproduction boundary together.";
  if (course.id === "worldmodel" && isWorldModelAdvancedBranch(lesson.id)) return "This mechanism can become the chosen branch in the final research study. The other advanced branches remain optional; continue to the capstone after completing one branch.";
  if (course.id === "worldmodel" && lesson.id === course.sharedCoreLessonId) return "The shared spine is complete. Choose one advanced branch, then carry that mechanism into the final research capstone.";
  if (course.id === "llm" && lesson.track === course.specializationTrackId) return "This mechanism can become the chosen branch in the final research study; the other advanced branches remain optional.";
  if (next) {
    const relationship = continuityRelationshipFor({
      courseId: course.id,
      fromLessonId: lesson.id,
      toLessonId: next.id,
      sameTrack: lesson.track === next.track,
      directDependency: Boolean(next.prerequisites?.includes(lesson.id)),
    });
    if (relationship === "direct reuse") return `The next chapter, ${next.title}, directly reuses this chapter's mechanism for a new goal: ${sentence(nextGoal)}`;
    if (relationship === "extension") return `The next chapter, ${next.title}, extends this result with one new mechanism: ${sentence(nextGoal)}`;
    if (relationship === "synthesis") return `The next chapter, ${next.title}, combines this result with earlier interfaces to pursue a larger goal: ${sentence(nextGoal)}`;
    const nextTrack = trackFor(course, next);
    return `This chapter closes its present thread with this result: ${sentence(currentResult)} The next chapter, ${next.title}, begins ${nextTrack.title} with a different goal: ${sentence(nextGoal)}`;
  }
  return `Reuse this evidence contract when evaluating a new ${course.subject} design.`;
}

function prerequisiteRecords(course, lesson) {
  const internal = (lesson.prerequisites ?? []).map((id) => {
    const prerequisite = course.lessonById[id];
    return { courseId: course.id, lessonId: id, title: prerequisite.title, priorIdea: prerequisite.keyIdeas[0], route: `/${course.id}/${id}/` };
  });
  const program = (lesson.programPrerequisites ?? []).map(({ courseId, lessonId }) => {
    const prerequisiteCourse = courses[courseId];
    const prerequisite = prerequisiteCourse?.lessonById[lessonId];
    return prerequisite ? { courseId, lessonId, title: prerequisite.title, priorIdea: prerequisite.keyIdeas[0], route: `/${courseId}/${lessonId}/` } : { courseId, lessonId, missing: true };
  });
  return { internal, program };
}

function prerequisiteContext(course, lesson, prerequisites) {
  const continuity = continuityRecordForLesson(course.id, lesson.id);
  const prose = [];
  if (continuity) prose.push(continuity.bridge);
  else if (!lesson.prerequisites?.length && !lesson.programPrerequisites?.length) prose.push(lesson.number === 1
    ? "No earlier lesson is required. Begin with the familiar situation in the opening paragraph and use it as the thread for the whole chapter."
    : "This chapter starts a new branch. Bring the shared core ideas and trace each new term from its definition.");
  if (!continuity && lesson.prerequisites?.length) prose.push(`The chapter reuses ${lesson.prerequisites.map((id) => course.lessonById[id].title).join(" and ")}. In particular, keep this earlier idea available: ${course.lessonById[lesson.prerequisites.at(-1)].keyIdeas[0]}`);
  return { prose, internalLessons: prerequisites.internal, programLessons: prerequisites.program };
}

function llmLabResults(type) {
  const initial = renderedElementText(llmLabReaderData.renderLab(type));
  const contrasting = renderedElementText(contrastingLlmLabReaderData.renderLab(type));
  if (initial === contrasting) throw new Error(`LLM lab ${type} did not produce a contrasting reader state`);
  return [
    { label: "Initial control state", renderedInstrument: initial },
    { label: "Contrasting control state", renderedInstrument: contrasting },
  ];
}

function numericControlValues(spec) {
  const { min, max, step, initial } = spec.control;
  const values = new Set([min, initial, max]);
  if (Number.isFinite(step) && step > 0) {
    const steps = Math.round((max - min) / step);
    if (steps <= 24) for (let index = 0; index <= steps; index += 1) values.add(min + index * step);
    else for (const candidate of [min + step, initial - step, initial + step, max - step]) if (candidate >= min && candidate <= max) values.add(candidate);
    const authoredNumbers = textList(spec.question, spec.change, spec.observe, spec.explain, spec.complete, spec.boundary)
      .flatMap((value) => value.match(/-?\d+(?:\.\d+)?/g) ?? [])
      .map(Number)
      .filter((value) => value >= min && value <= max && Math.abs((value - min) / step - Math.round((value - min) / step)) < 1e-8);
    authoredNumbers.forEach((value) => values.add(value));
  }
  return [...values].sort((left, right) => left - right);
}

function homeSnapshot(course) {
  const labCount = course.lessons.filter((lesson) => lesson.lab).length;
  const curriculumMinutes = course.lessons.reduce((sum, lesson) => sum + lesson.duration, 0);
  const blocks = [
    block("home.hero", "orient", `${course.hero.heading} ${course.hero.emphasis}`, [course.hero.lede], {
      visualFlow: { label: course.hero.machineLabel, input: course.hero.machineInput, transformation: course.hero.machineToken, outputLabel: course.hero.machineOutputLabel, output: course.hero.machineOutput, boundary: "Illustrative flow; not a measurement." },
      nextAction: "Start or continue the next incomplete lesson",
      duration: `${course.lessons.length} lessons · about ${Math.round(curriculumMinutes / 60)} hours`,
    }),
    block("home.pitch", "narrative", course.campaign.promise, [course.campaign.why], { payoffs: course.campaign.payoffs, finishLine: course.campaign.finish, readingSequence: ["prose", "payoffs", "finishLine"] }),
    block("home.courseArc", "visualStory", course.hero.storyTitle, [course.hero.storyIntro], {
      stages: course.phases.map((phase) => ({ label: `${phase.index} · ${phase.range}`, title: phase.title, explanation: phase.summary, milestone: phase.milestone })),
    }),
    block("home.manifest", "narrative", `One course. ${course.tracks.length} connected frontiers.`, [course.hero.manifest], {
      tracks: course.tracks.map((track) => {
        const lessons = course.lessons.filter((lesson) => lesson.track === track.id);
        return { title: track.title, short: track.short, description: track.description, outcome: track.outcome, role: track.role, lessons: lessons.length, minutes: lessons.reduce((sum, lesson) => sum + lesson.duration, 0) };
      }),
    }),
    block("home.learningPromise", "summary", "What the course contains", ["No black boxes. Build intuition, see the mechanism, then make the real engineering trade-offs."], { lessons: course.lessons.length, labs: labCount, codeNotebooks: Object.keys(course.codeExamples).length }),
    ...(course.homeSources?.length ? [block("home.sources", "sources", "Primary work behind the course", [], { sources: course.homeSources.map(({ title, url, claim }) => ({ title, url, claim })) })] : []),
    block("home.finale", "conclusion", course.campaign.finish, [`${course.lessons.length} connected lessons, hands-on labs, and a complete end-to-end build.`, "Browser labs use transparent teaching fixtures. Optional external runs are clearly labeled, and no required work depends on an account or paid service."], { reviewedDate: course.reviewedDate }),
  ];
  return {
    dossierVersion: DOSSIER_VERSION,
    courseId: course.id,
    pageType: "home",
    id: "home",
    route: `/${course.id}/`,
    title: course.title,
    reviewContract: { gradingUnit: "one complete page", readingOrder: "blocks in ascending order", withinBlockOrder: "prose first, then named fields in serialized order; readingSequence and interactionSequence arrays are sequential, and disclosure content stays at its labeled reveal point", priorGradesIncluded: false, componentScoresAllowed: false },
    context: { courseTitle: course.title, subject: course.subject, reviewedDate: course.reviewedDate },
    blocks: numberBlocks(blocks),
  };
}

function lessonLabBlock(course, lesson) {
  if (!lesson.lab) return undefined;
  if (lesson.lab === "research") {
    const spec = course.researchLabs?.[lesson.id];
    if (!spec) throw new Error(`Missing research lab for ${course.id}:${lesson.id}`);
    return block("lesson.lab", "interactiveLab", spec.title, [spec.question], {
      activity: { change: spec.change, observe: spec.observe, explain: spec.explain, complete: spec.complete, boundary: spec.boundary },
      predictionPrompt: "Which case produces the strongest diagnostic signal, and what is the first causal step?",
      results: spec.cases.map((item) => ({ control: item.label, label: item.resultLabel, value: item.resultValue, meter: item.meter, explanation: item.detail })),
      interactionSequence: [
        { phase: "instructions", contentPath: "activity" },
        { phase: "casePreview", labels: spec.cases.map((item) => item.label) },
        { phase: "commitBeforeReveal", contentPath: "predictionPrompt" },
        { phase: "revealAfterCommit", contentPath: "results", mechanism: `${spec.observe} ${spec.explain}` },
      ],
    });
  }
  if (lesson.lab.startsWith("wm-")) {
    const spec = worldModelLessonLabSpecs[lesson.id];
    if (!spec) throw new Error(`Missing world-model lab for ${lesson.id}`);
    const values = spec.control.choices ? spec.control.choices.map((_, index) => index) : numericControlValues(spec);
    return block("lesson.lab", "interactiveLab", spec.title, [spec.question], {
      activity: { change: spec.change, observe: spec.observe, explain: spec.explain, complete: spec.complete, boundary: spec.boundary },
      control: spec.control,
      predictionPrompt: "What changed when you moved the control, and which mechanism connects that input to the readout?",
      results: values.map((value) => ({ input: value, ...spec.evaluate(value) })),
      interactionSequence: [
        { phase: "instructions", contentPath: "activity" },
        { phase: "controlPreview", contentPaths: ["control", "results"] },
        { phase: "commitBeforeReveal", contentPath: "predictionPrompt" },
        { phase: "revealAfterCommit", mechanism: `${spec.observe} ${spec.explain}` },
      ],
    });
  }
  const copy = llmLabMeta[lesson.lab];
  if (!copy) throw new Error(`Missing LLM lab copy for ${lesson.id}:${lesson.lab}`);
  return block("lesson.lab", "interactiveLab", copy.title, [`How should the visible state or readout change when you use this ${lesson.title} lab, and which mechanism causes that response?`], {
    activity: {
      change: copy.instruction,
      observe: "Compare at least two deliberately contrasting settings. Watch which value, shape, route, or distribution changes and which quantities stay fixed.",
      explain: "Connect the control you changed to the first readout that responded; name the first causal step rather than describing only the visual motion.",
      complete: "Commit a prediction, test two contrasting settings, and explain whether the observed direction matched your prediction and why.",
      boundary: "This browser activity is a teaching representation. It does not measure production-model quality, speed, or reliability.",
    },
    predictionPrompt: "Which readout changed first, and which mechanism caused it?",
    results: llmLabResults(lesson.lab),
    mechanismFeedback: copy.observe,
    interactionSequence: [
      { phase: "instructions", contentPath: "activity" },
      { phase: "controlPreview", contentPath: "results" },
      { phase: "commitBeforeReveal", contentPath: "predictionPrompt" },
      { phase: "revealAfterCommit", contentPath: "mechanismFeedback" },
    ],
  });
}

function masteryStudioData(lessonId) {
  if (lessonId === "pretraining-overview") return { recoveryArtifacts: masteryReaderData.recoveryArtifacts };
  if (lessonId === "data-engineering") return { cases: masteryReaderData.auditItems };
  if (lessonId === "advanced-objectives") return { cases: masteryReaderData.objectiveScenarios };
  if (lessonId === "instruction-tuning-rlhf") return { cases: masteryReaderData.bridgeAssignments, availableStages: masteryReaderData.bridgeStages };
  if (lessonId === "posttraining-overview") return { cases: masteryReaderData.composerCases };
  if (lessonId === "tools-safety") return { cases: masteryReaderData.safetyIncidents };
  return {};
}

function externalExperimentBlock(course, lesson) {
  const experiment = Object.values(externalExperiments).find((item) => item.courseId === course.id && item.lessonId === lesson.id);
  if (!experiment) return undefined;
  return block("lesson.externalExperiment", "optionalExternal", experiment.title, [experiment.objective, experiment.boundary], {
    executionLabel: experiment.executionLabel,
    revisions: experiment.revisions,
    hardware: experiment.hardware,
    budgets: experiment.budgets,
    commands: experiment.commands,
    providers: experiment.providers,
    expectedEvidence: experiment.expected,
    diagnostics: experiment.diagnostics,
    output: experiment.output,
  });
}

function transferBlock(course, lesson) {
  const transfer = course.transfers?.[lesson.id];
  if (transfer) return block("lesson.transfer", "assessedTransfer", "Commit your mechanism, then test it on a new case.", ["The option check is deterministic and local. The written prediction is guided comparison, not machine-graded prose."], {
    interactionSequence: [
      { phase: "commitBeforeOptions", prompt: transfer.prompt },
      { phase: "optionsAfterCommit", prompt: transfer.prompt, options: transfer.options, correctOption: transfer.answer },
      { phase: "feedbackAfterChoice", optionSpecificFeedback: transfer.options.map((option) => option.feedback), workedReasoning: transfer.worked, retryAfterIncorrectChoice: transfer.retry },
    ],
  });
  const evidence = lessonEvidence[lesson.id];
  if (!evidence) return undefined;
  const rules = lessonTransferChecks[lesson.id] ?? [];
  const distractors = lessonTransferDistractors[lesson.id] ?? [];
  const diagnosticOptions = [
    { text: evidence.contrast.principle, correct: true },
    { text: `Because ${evidence.contrast.left.label} succeeds, the same mechanism is sufficient in every setting; the second outcome needs no extra boundary.`, correct: false },
    { text: `The outcomes differ only because “${evidence.contrast.right.label}” uses different surface wording; inputs, authority, and system assumptions are unchanged.`, correct: false },
  ].sort((left, right) => ((lesson.number * 17 + left.text.length) % 11) - ((lesson.number * 17 + right.text.length) % 11));
  const structuredChecks = rules.map((rule, index) => ({
    label: rule.label,
    prompt: rule.prompt,
    options: [
      { id: "correct", text: rule.correction },
      { id: "misconception-a", text: distractors[index]?.[0] },
      { id: "misconception-b", text: distractors[index]?.[1] },
    ].sort((left, right) => ((lesson.number * 13 + index * 7 + left.text.length) % 17) - ((lesson.number * 13 + index * 7 + right.text.length) % 17)),
    correctOption: "correct",
    firstErrorFeedback: rule.correction,
  }));
  return block("lesson.transfer", "assessedTransfer", "Test the chapter’s mechanism at its boundary.", ["The explanation, worked trace, and practice above established the mechanism. Now hold it fixed while one assumption changes, then decide whether your original conclusion survives."], {
    interactionSequence: [
      { phase: "boundaryContrast", contrast: evidence.contrast, predictionInstruction: "Name the one changed assumption that could explain both observed outcomes before using the options." },
      {
        phase: "diagnosticDecision",
        options: diagnosticOptions,
        correctFeedback: `Mechanism diagnosis passed. Correct principle: ${evidence.contrast.principle} This accounts for both “${evidence.contrast.left.label}” and “${evidence.contrast.right.label}” without erasing their boundary.`,
        incorrectFeedback: `That explanation fails Case B. Reinspect “${evidence.contrast.right.label}”: ${evidence.contrast.right.outcome} The selected explanation ignores that changed assumption. Choose again.`,
        retry: "Correct the diagnosis",
      },
      { phase: "commitUnfamiliarCase", prompt: evidence.transfer.prompt, completion: "Commit an answer and causal explanation before the structured decisions appear." },
      {
        phase: "structuredDecisionsAfterCommit",
        instruction: "Resolve three independent decisions while the original explanation remains locked for comparison.",
        checks: structuredChecks,
        passFeedback: "Structured transfer passed. All three component-specific rules passed. The worked solution is now available for comparison.",
        failedFeedback: "The first failed field is named and its correction is shown before retry.",
      },
      {
        phase: "workedSolutionAfterPass",
        criteria: evidence.transfer.criteria,
        solution: evidence.transfer.solution,
        passFeedback: "Transfer decision checkpoint passed. Compare the worked solution with the locked response, then explain the reasoning aloud.",
        retryFeedback: "Correct the automatically checked boundary diagnosis; the transfer decisions remain verified.",
      },
    ],
  });
}

function validationBlock(course, lesson) {
  if (course.id === "llm" && technicalValidations[lesson.id]) {
    const validation = technicalValidations[lesson.id];
    return block("lesson.validation", "technicalValidation", validation.title, [validation.revision, validation.artifact, validation.question, validation.expected, validation.boundary], { observations: validation.observations, code: validation.code, sources: validation.sources });
  }
  if (course.id === "worldmodel" && worldModelTechnicalValidations[lesson.id]) {
    const validation = worldModelTechnicalValidations[lesson.id];
    return block("lesson.validation", "technicalValidation", validation.title, [validation.contract, validation.expected, validation.boundary], { trace: validation.trace, evidence: validation.evidence });
  }
  return undefined;
}

function capstoneBlocks(course, lesson) {
  if (!lesson.capstone) return [];
  const map = course.synthesisMaps[lesson.id];
  const project = course.capstoneProjects[lesson.id];
  const evidence = course.capstoneEvidencePacks[lesson.id];
  const artifact = course.capstoneArtifactFiles[lesson.id];
  const blocks = [];
  if (map) blocks.push(block("lesson.capstoneSynthesis", "capstone", map.title, [map.intro]));
  if (!project) {
    if (map) blocks.push(block("lesson.capstoneReview", "navigation", "Review the evidence chain", [], { reviewLinks: map.links.map((id) => ({ lessonId: id, title: course.lessonById[id].title, route: `/${course.id}/${id}/` })) }));
    return blocks;
  }
  blocks.push(block("lesson.capstoneOverview", "capstone", project.title, [project.outcome], {
    estimatedTime: project.estimatedTime,
    prerequisites: project.prerequisites,
    materials: project.materials,
    deliverables: project.deliverables,
  }));
  if (evidence) blocks.push(block("lesson.capstoneStarter", "capstone", evidence.starter.title, ["The examples show the required specificity and must be replaced with the learner's own evidence."], { fields: evidence.starter.fields }));
  blocks.push(block("lesson.capstoneStages", "capstone", "Build the project in evidence-bearing stages", [], { stages: project.stages }));
  if (evidence) blocks.push(block("lesson.capstoneChecks", "capstoneAssessment", "Can another person inspect and reproduce the work?", ["These are lightweight completeness checks, not a quality oracle."], { checks: evidence.checks }));
  blocks.push(block("lesson.capstoneRubric", "capstoneAssessment", "Grade the evidence, not the effort.", ["Proficient is the target. Excellent requires stronger evidence, controls, and communication—not merely more words."], { rubric: project.rubric }));
  blocks.push(block("lesson.capstoneExemplar", "capstoneReference", project.exemplar.title, ["The exemplar is one defensible route, not a template to copy."], {
    interactionSequence: [
      { phase: "attemptGate", condition: "Write at least 40 words or complete one project stage before comparison unlocks." },
      { phase: "revealAfterAttempt", summary: project.exemplar.summary, decisions: project.exemplar.decisions },
    ],
  }));
  if (evidence) blocks.push(block("lesson.capstoneReference", "capstoneReference", evidence.reference.title, ["Compare this complete evidence shape with your own only after making an attempt."], {
    interactionSequence: [
      { phase: "attemptGate", condition: "Write at least 40 words or complete one project stage before comparison unlocks." },
      { phase: "revealAfterAttempt", sections: evidence.reference.sections, artifact },
    ],
  }));
  if (evidence?.sources?.length) blocks.push(block("lesson.capstoneSources", "sources", "Pin every claim to its evidence.", [], { sources: evidence.sources }));
  blocks.push(block("lesson.capstoneReflection", "reflection", "Keep a decision and reflection log.", ["Write what changed in your mental model and what you would test next."], { prompts: project.reflection }));
  if (map) blocks.push(block("lesson.capstoneReview", "navigation", "Review the evidence chain", [], { reviewLinks: map.links.map((id) => ({ lessonId: id, title: course.lessonById[id].title, route: `/${course.id}/${id}/` })) }));
  return blocks;
}

function asTechnicalDepthBlock(item) {
  return { ...item, surface: item.surface.replace("lesson.", "lesson.technicalDepth.") };
}

function technicalDepthBlocks(course, lesson, guide, coverage, lab, transfer, validation, capstones) {
  const { technical } = conceptFirstCoverageFor(lesson, coverage, guide);
  const deferActivities = hasFormalTechnicalMaterial(lesson, coverage, guide);
  const code = course.codeExamples[lesson.id];
  const guidance = course.codeGuidance[lesson.id];
  const blocks = [block("lesson.technicalDepth", "optionalTechnical", `Formalize and implement ${lesson.title}`, [
    "The core lesson is complete without this section.",
    "Use this layer when you want to calculate the mechanism, read its formal notation, or implement its exact contract.",
    lesson.deep,
  ], {
    placement: "after the core knowledge check and mastery control",
    completionImpact: "none",
    initiallyCollapsed: true,
    vocabulary: technical.length ? guide.vocabulary : [],
  })];
  if (technical.length) blocks.push(block("lesson.technicalDepth.objectiveChecks", "optionalTechnical", "Exact authored objectives", [], {
    objectives: technical.map((item) => ({
      objective: item.objective,
      interactionSequence: [
        { phase: "commitTechnicalAttempt", prompt: item.check.prompt },
        { phase: "revealAfterCommit", workedCase: item.workedExample, expectedReasoning: item.check.expected, retry: item.check.retry, boundary: item.boundary },
      ],
    })),
    additionalExplanation: guide.sections,
  }));
  if (code && guidance) blocks.push(block("lesson.technicalDepth.code", "optionalTechnicalCode", code.title, [code.setup], {
    language: code.language,
    guidance,
    interactionSequence: [
      { phase: "commitBeforeImplementation", prompt: code.predict },
      { phase: "implementationAfterCommit", code: code.code, expectedObservation: code.observe, changedCase: code.tryIt },
      ...(code.caveat ? [{ phase: "scopeBoundary", note: code.caveat }] : []),
    ],
  }));
  if (deferActivities) {
    if (lab) blocks.push(asTechnicalDepthBlock(lab));
    if (transfer) blocks.push(asTechnicalDepthBlock(transfer));
    blocks.push(...capstones.map(asTechnicalDepthBlock));
  }
  if (validation) blocks.push(asTechnicalDepthBlock(validation));
  return blocks;
}

function discussionPrompt(course, lesson) {
  const prerequisiteTitles = (lesson.prerequisites ?? []).map((id) => course.lessonById[id].title);
  return [
    `I am studying “${lesson.title}” as part of a from-first-principles course on ${course.subject}.`,
    prerequisiteTitles.length ? `Prerequisite context I already have: ${prerequisiteTitles.join(", ")}.` : "This is an introductory topic, so define any technical term before relying on it.",
    `Working definition: ${lesson.simple}`,
    `Important mechanisms and distinctions:\n${lesson.keyIdeas.map((idea) => `- ${idea}`).join("\n")}`,
    "Help me connect the definition to a concrete mechanism and a changed example.",
    `Misconception to avoid: ${lesson.misconception}`,
    "Use this context without giving me a generic recap. Diagnose the exact gap in my question, explain it in plain language first, then give the precise mechanism, notation or shapes when useful, one worked example, one boundary case, and a short check question that tests whether I can transfer the idea. If my premise is wrong, correct it directly.",
    "My question or point of confusion:\n[ADD YOUR QUESTION HERE]",
  ].join("\n\n");
}

function lessonSnapshot(course, lesson) {
  const index = course.lessons.findIndex((item) => item.id === lesson.id);
  const previous = course.lessons[index - 1];
  const next = course.lessons[index + 1];
  const track = trackFor(course, lesson);
  const authoredGuide = course.guides[lesson.id];
  const coverage = course.objectiveCoverage[lesson.id];
  const story = course.motionStories[lesson.id];
  const visual = visualByKey[`${course.id}:${lesson.id}`];
  if (!authoredGuide || !coverage || !story || !visual) throw new Error(`Incomplete composed-page data for ${course.id}:${lesson.id}`);
  const guide = conceptFirstGuideFor(lesson, authoredGuide, coverage);
  const coverageSplit = conceptFirstCoverageFor(lesson, coverage, authoredGuide);
  const conceptSummary = conceptFirstSummaryFor(lesson, coverage, authoredGuide);
  const hasConceptFirstCore = coverageSplit.technical.length > 0;
  const deferActivities = hasFormalTechnicalMaterial(lesson, coverage, authoredGuide);
  const operationTrace = conceptFirstOperationTraceFor(lesson.id, lesson.keyIdeas);
  const coreVisual = hasConceptFirstCore ? {
    ...visual,
    labels: ["INPUT", "OPERATION", "RESULT", "LIMIT"],
    stageDescriptions: [operationTrace[0], operationTrace[1], operationTrace[2], lesson.misconception].map(conceptFirstPlainText),
  } : visual;
  const coreStory = hasConceptFirstCore ? {
    ...story,
    headline: `Follow ${lesson.title} as an operation before the notation.`,
    intro: conceptSummary,
    stages: story.stages.map((stage, stageIndex) => ({ ...stage, label: coreVisual.labels[stageIndex], title: coreVisual.stageDescriptions[stageIndex] })),
  } : story;
  const prerequisites = prerequisiteRecords(course, lesson);
  const rawPriorKnowledge = prerequisiteContext(course, lesson, prerequisites);
  const continuity = continuityRecordForLesson(course.id, lesson.id);
  const continuityPrerequisite = continuity ? course.lessonById[continuity.fromLessonId] : undefined;
  const priorKnowledge = hasConceptFirstCore ? {
    ...rawPriorKnowledge,
    prose: continuity && continuityPrerequisite
      ? [conceptFirstBridgeFor(continuity.bridge, continuityPrerequisite, lesson)]
      : rawPriorKnowledge.prose.map(conceptFirstPlainText),
    internalLessons: rawPriorKnowledge.internalLessons.map((item) => {
      const prerequisite = course.lessonById[item.lessonId];
      const prerequisiteCoverage = prerequisite ? course.objectiveCoverage[item.lessonId] : undefined;
      return { ...item, priorIdea: prerequisite && prerequisiteCoverage ? conceptFirstSummaryFor(prerequisite, prerequisiteCoverage, course.guides[item.lessonId]) : conceptFirstPlainText(item.priorIdea) };
    }),
    programLessons: rawPriorKnowledge.programLessons.map((item) => {
      const prerequisiteCourse = courses[item.courseId];
      const prerequisite = prerequisiteCourse?.lessonById[item.lessonId];
      const prerequisiteCoverage = prerequisiteCourse?.objectiveCoverage[item.lessonId];
      return item.priorIdea ? ({ ...item, priorIdea: prerequisite && prerequisiteCoverage ? conceptFirstSummaryFor(prerequisite, prerequisiteCoverage, prerequisiteCourse.guides[item.lessonId]) : conceptFirstPlainText(item.priorIdea) }) : item;
    }),
  } : rawPriorKnowledge;
  const blocks = [
    block("lesson.header", "heading", lesson.title, [`${track.title} · Lesson ${String(lesson.number).padStart(2, "0")} · ${lesson.duration} minutes`]),
  ];
  const [opening, ...chapters] = guide.sections;
  if (!opening) throw new Error(`Missing narrative opening for ${course.id}:${lesson.id}`);
  blocks.push(block("lesson.narrativeOpening", "narrative", opening.title, [conceptSummary], {
    prerequisiteContext: priorKnowledge,
    nextUse: nextUseText(course, lesson, next),
  }));
  blocks.push(block("lesson.vocabulary", "reference", "A small vocabulary for the argument", [], { terms: guide.vocabulary }));
  blocks.push(block("lesson.openingExplanation", "narrativeContinuation", "Opening explanation (continues the chapter opening without a second visible heading)", opening.paragraphs, { visibleHeading: false }));
  if (chapters.length) blocks.push(block("lesson.narrativeChapters", "narrative", `${lesson.title} explanation`, [], { chapters }));
  blocks.push(block("lesson.mechanismWalkthrough", "narrative", "Trace the evidence, change, and conclusion", ["Each step continues the chapter’s argument. Use the state check to make sure the present result is sound before carrying it into the next step."], {
    steps: guide.walkthrough,
  }));
  blocks.push(block("lesson.narrativeHandoff", "transition", "See the same mechanism from another angle", [`The illustration and scrolling trace follow the same path from “${headingPhrase(guide.walkthrough[0].title)}” to “${headingPhrase(guide.walkthrough.at(-1).title)}.” As you read them, connect each visible change to the causal step that produced it.`]));
  blocks.push(block("lesson.visual", "visual", coreStory.stages[0].title, [], {
    visualKind: coreVisual.kind,
    initiallyVisible: {
      representation: coreVisual.kind === "raster" ? `Concept illustration for ${lesson.title}. ${conceptSummary}` : "Four-stage deterministic mechanism diagram",
      labels: coreVisual.labels,
      mentalModel: hasConceptFirstCore ? conceptFirstPlainText(lesson.mentalModel) : lesson.mentalModel,
    },
    disclosureContent: {
      summary: "Read a text-only explanation",
      stageDescriptions: coreVisual.stageDescriptions.map((description, stageIndex) => ({ label: coreVisual.labels[stageIndex], description })),
      importantLimit: hasConceptFirstCore ? conceptFirstPlainText(lesson.misconception) : lesson.misconception,
    },
    evidenceBoundary: coreVisual.kind === "raster" ? "Generated concept illustration; exact labels are code-rendered; not a measurement." : "Deterministic SVG/HTML diagram; exact labels with illustrative layout.",
  }));
  blocks.push(block("lesson.scrollStory", "visualStory", coreStory.headline, [coreStory.intro], {
    steps: coreStory.stages.map((stage, stageIndex) => ({ label: `STEP ${String(stageIndex + 1).padStart(2, "0")}`, title: coreVisual.labels[stageIndex], body: coreVisual.stageDescriptions[stageIndex], signal: stage.label })),
  }));
  blocks.push(block("lesson.guidedExample", "guidedLearning", guide.guidedExample.title, [guide.guidedExample.setup], {
    interactionSequence: [
      { phase: "commitBeforeReveal", prompt: "Predict the result and explain why." },
      { phase: "revealAfterCommit", steps: guide.guidedExample.steps, result: guide.guidedExample.result },
      { phase: "selfDiagnosis", choices: ["Result and mechanism matched", "Result matched; mechanism differed", "An earlier step needs repair"], feedback: ["Explain the trace once without looking, then try the changed case.", "Find the first causal link that differed, then revise your explanation.", "Restart from the case setup and repair the first incorrect transformation."] },
    ],
  }));
  blocks.push(block("lesson.practice", "guidedPractice", "Changed-case practice", [guide.practice.prompt], {
    interactionSequence: [
      { phase: "draft", instruction: "Make a decision and explain the mechanism before revealing the worked answer." },
      { phase: "optionalHint", hint: guide.practice.hint },
      { phase: "revealAfterCommit", answer: guide.practice.answer },
      { phase: "selfDiagnosis", choices: [
        { label: "Decision and reason matched", feedback: "Self-check recorded. The assessed transfer lab below independently verifies the component-specific transfer." },
        { label: "Decision only matched", feedback: "Name the causal step missing from your explanation, then revise; recognition without mechanism is not yet transfer." },
        { label: "Needs another attempt", feedback: "Use the hint to find the first wrong assumption, then revise without copying the worked wording." },
      ] },
    ],
  }));
  const operationOnly = coverageSplit.technical.length > 0;
  blocks.push(block(operationOnly ? "lesson.coreOperationCheck" : "lesson.objectiveChecks", "guidedLearning", operationOnly ? "Can you follow the operation without using a formula?" : "Can you reconstruct the argument without rereading it?", [operationOnly ? "Name the input, the change, the result, and a limit. The lesson's exact authored objectives remain intact in optional technical depth after mastery." : "Each prompt refers back to the continuous explanation above. Write first; open the reminder only if you cannot locate the missing causal step."], {
    [operationOnly ? "checks" : "objectives"]: coverageSplit.core.map((item) => ({
      ...(operationOnly ? {} : { objective: item.objective }),
      interactionSequence: [
        { phase: "commitBeforeComparison", prompt: item.check.prompt },
        { phase: "revealAfterCommit", expectedReasoning: item.check.expected, retry: item.check.retry },
        { phase: "optionalDisclosure", explanation: item.explanation, mechanism: item.mechanism, workedExample: item.workedExample, boundary: item.boundary },
      ],
    })),
  }));
  const lab = lessonLabBlock(course, lesson);
  if (!deferActivities && lab) blocks.push(lab);
  const transfer = transferBlock(course, lesson);
  if (!deferActivities && transfer) blocks.push(transfer);
  const validation = validationBlock(course, lesson);
  if (masteryStudioTitles[lesson.id]) blocks.push(block("lesson.decisionStudio", "interactiveStudio", masteryStudioTitles[lesson.id], ["Read each scenario and commit one decision before using its feedback. Identify the assumption, authority boundary, quantity, or causal step that a correction repairs."], {
    learningContract: {
      action: "Read each scenario and commit one decision before using its feedback. For adjustable controls, predict the direction of change before moving them.",
      observe: "Feedback or calculated state appears only after the relevant decision; compare the mechanism, not merely the correct label.",
      explain: "For every correction, identify the assumption, authority boundary, quantity, or causal step that your first choice missed.",
      complete: "Attempt every scenario or required control state and explain at least one corrected decision without rereading its feedback.",
      boundary: "Fixed transparent teaching cases; not a model measurement or production certification.",
    },
    initialRenderedState: renderedText(MasteryStudio, { lessonId: lesson.id }),
    ...masteryStudioData(lesson.id),
  }));
  const capstones = capstoneBlocks(course, lesson);
  if (!deferActivities) blocks.push(...capstones);
  blocks.push(block("lesson.quiz", "assessment", "Choose the answer your mechanism predicts.", [lesson.quiz.question], {
    interactionSequence: [
      { phase: "choose", options: lesson.quiz.options },
      { phase: "feedbackAfterChoice", correctOption: lesson.quiz.answer, explanation: lesson.quiz.explanation, retry: "Try again after reading the explanation." },
    ],
  }));
  blocks.push(block("lesson.completion", "summary", "Record mastery after the knowledge check", ["The knowledge check must pass before mastery is recorded in this browser."]));
  blocks.push(...technicalDepthBlocks(course, lesson, authoredGuide, coverage, lab, transfer, validation, capstones));
  blocks.push(block("lesson.furtherReading", "sources", "Verify the claims in primary and official sources.", ["The lesson and its assessments are complete without these links."], { reviewedDate: course.reviewedDate, resources: authoredGuide.resources }));
  const external = externalExperimentBlock(course, lesson); if (external) blocks.push(external);
  if (lesson.id === "sft") blocks.push(block("lesson.fineTuningWorkshop", "optionalExternal", "Fine-tune a modern open-weight model—properly", ["Move from demonstrations to a measured QLoRA adapter. The goal is not merely to make training loss fall; it is to change one behavior without hiding regressions.", "The planner is local; training requires a deliberately prepared external Python/GPU environment."], {
    executionBoundary: "Planning estimates do not allocate hardware or measure memory, throughput, convergence, or model quality.",
    initialRenderedState: renderedText(FineTuningWorkshop, {}),
    teachingTarget: fineTuningReaderData.MODEL_ID,
    hardwareProfiles: fineTuningReaderData.hardwareProfiles,
    readinessChecks: fineTuningReaderData.readinessItems,
    runbookStages: fineTuningReaderData.stages,
    evaluationContract: fineTuningReaderData.evaluationRows,
    sources: [
      { title: "Official model card", url: "https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507" },
      { title: "Qwen3.5 model card", url: "https://huggingface.co/Qwen/Qwen3.5-4B" },
      { title: "TRL SFTTrainer", url: "https://huggingface.co/docs/trl/sft_trainer" },
      { title: "TRL + PEFT", url: "https://huggingface.co/docs/trl/main/en/peft_integration" },
      { title: "bitsandbytes", url: "https://huggingface.co/docs/transformers/quantization/bitsandbytes" },
    ],
  }));
  blocks.push(block("lesson.discussion", "optionalExtension", "Continue the inquiry with an optional AI tutor.", ["The required lesson is complete without an external service. Check any answer against the lesson evidence."], { prompt: discussionPrompt(course, lesson) }));
  const isLlmSpecializationBranch = course.id === "llm" && lesson.track === course.specializationTrackId;
  const showWorldModelSpecializationChooser = course.id === "worldmodel" && (lesson.id === course.sharedCoreLessonId || isWorldModelAdvancedBranch(lesson.id));
  if (isLlmSpecializationBranch) {
    const choices = course.lessons.filter((candidate) => candidate.track === course.specializationTrackId && candidate.id !== lesson.id);
    blocks.push(block("lesson.next", "nextUse", "Choose the specialization that serves your goal.", ["Advanced is a branch, not a ladder.", "These topics share the core curriculum, but none is a prerequisite for the others. Continue where the trade-off or research question is useful to you."], { choices: choices.map((choice) => ({ lessonId: choice.id, title: choice.title, buildsOn: choice.prerequisites?.map((id) => course.lessonById[id].title).join(" + ") ?? "the shared core", objective: course.guides[choice.id]?.objectives[0] ?? choice.keyIdeas[0] })) }));
  } else if (showWorldModelSpecializationChooser) {
    const choices = worldModelAdvancedBranchIds.filter((id) => id !== lesson.id).map((id) => course.lessonById[id]);
    const synthesis = course.lessonById[worldModelResearchCapstoneId];
    blocks.push(block("lesson.next", "nextUse", "Choose the specialization that serves your goal.", ["Advanced is a branch, not a ladder.", "These topics share the core curriculum, but none is a prerequisite for the others. Complete one useful branch before the final synthesis."], {
      entryLessonId: course.sharedCoreLessonId,
      choices: choices.map((choice) => ({ lessonId: choice.id, title: choice.title, relationship: "extension", buildsOn: choice.prerequisites?.map((id) => course.lessonById[id].title).join(" + ") ?? "the shared core", objective: course.guides[choice.id]?.objectives[0] ?? choice.keyIdeas[0] })),
      synthesis: { lessonId: synthesis.id, title: synthesis.title, relationship: "synthesis", requirement: "Complete the shared operations spine and one advanced branch of your choice before combining the branch mechanism with evaluation, provenance, failures, and claim boundaries." },
    }));
  } else if (next) {
    const directDependency = Boolean(next.prerequisites?.includes(lesson.id));
    const relationship = continuityRelationshipFor({ courseId: course.id, fromLessonId: lesson.id, toLessonId: next.id, sameTrack: lesson.track === next.track, directDependency });
    const nextCoverage = course.objectiveCoverage[next.id];
    const nextGoal = nextCoverage ? conceptFirstSummaryFor(next, nextCoverage, course.guides[next.id]) : course.guides[next.id]?.objectives[0] ?? next.keyIdeas[0];
    blocks.push(block("lesson.next", "nextUse", `Next: ${next.title}`, [], { relationship, reuseLabel: relationship === "new chapter thread" ? "This chapter leaves you with" : course.id === "llm" && relationship === "direct reuse" ? "You will reuse" : "You will carry forward", reuse: sentence(hasConceptFirstCore ? conceptSummary : lessonNarrativeResult(course.id, lesson)), nextLabel: relationship === "new chapter thread" ? "The next question" : relationship === "synthesis" ? "To combine" : "To learn", toLearn: sentence(nextGoal), previous: previous ? { lessonId: previous.id, title: previous.title } : null, next: { lessonId: next.id, title: next.title } }));
  } else {
    blocks.push(block("lesson.next", "nextUse", "Course complete", ["Return to the top."], { previous: previous ? { lessonId: previous.id, title: previous.title } : null }));
  }
  return {
    dossierVersion: DOSSIER_VERSION,
    courseId: course.id,
    pageType: "lesson",
    id: lesson.id,
    route: `/${course.id}/${lesson.id}/`,
    title: lesson.title,
    reviewContract: { gradingUnit: "one complete page", readingOrder: "blocks in ascending order", withinBlockOrder: "prose first, then named fields in serialized order; readingSequence and interactionSequence arrays are sequential, and disclosure content stays at its labeled reveal point", priorGradesIncluded: false, componentScoresAllowed: false },
    context: { courseTitle: course.title, subject: course.subject, lessonNumber: lesson.number, track: track.title, reviewedDate: course.reviewedDate, prerequisites, nextUse: nextUseText(course, lesson, next) },
    blocks: numberBlocks(blocks),
  };
}

export function buildCoursePageReaderSnapshots() {
  return courseIds.flatMap((courseId) => {
    const course = courses[courseId];
    return [homeSnapshot(course), ...course.lessons.map((lesson) => lessonSnapshot(course, lesson))];
  });
}

export function readerSnapshotHash(snapshot) {
  return `sha256:${createHash("sha256").update(JSON.stringify(snapshot)).digest("hex")}`;
}

export function buildCoursePageReaderSnapshot(courseId, pageId = "home") {
  const snapshot = buildCoursePageReaderSnapshots().find((item) => item.courseId === courseId && item.id === pageId);
  if (!snapshot) throw new Error(`Unknown canonical course page ${courseId}:${pageId}`);
  return snapshot;
}

export async function buildCoursePageGradeDraft(courseId) {
  if (!courseIds.includes(courseId)) throw new Error(`Unknown canonical course ${courseId}`);
  const snapshots = buildCoursePageReaderSnapshots().filter((snapshot) => snapshot.courseId === courseId);
  return {
    rubricRevision: "2026-07-17",
    gradedAt: null,
    sourceFingerprint: await courseGradeFingerprint(courseId),
    grader: {
      role: "independent whole-page grader",
      method: null,
      input: "course-page-reader-snapshot",
      blind: true,
      priorGradesSeen: false,
    },
    courseId,
    population: snapshots.length,
    pages: snapshots.map((snapshot) => ({
      pageType: snapshot.pageType,
      id: snapshot.id,
      route: snapshot.route,
      readerSnapshotHash: readerSnapshotHash(snapshot),
      accuracy: null,
      writtenNarrative: null,
      flow: null,
      learningContent: null,
      overall: null,
      pass: null,
      blockingDefects: null,
      wholePageReview: {
        synopsis: null,
        feedback: null,
        revisionPriorities: null,
      },
    })),
  };
}

function cliArguments(argv) {
  const options = { pretty: false, jsonl: false, gradeDraft: false };
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (item === "--pretty") options.pretty = true;
    else if (item === "--jsonl") options.jsonl = true;
    else if (item === "--grade-draft") options.gradeDraft = true;
    else if (item === "--course") options.courseId = argv[++index];
    else if (item === "--page") options.pageId = argv[++index];
    else if (item === "--route") options.route = argv[++index];
    else if (item === "--help") options.help = true;
    else throw new Error(`Unknown argument ${item}`);
  }
  if (options.pageId && !options.courseId) throw new Error("--page requires --course");
  if (options.gradeDraft && !options.courseId) throw new Error("--grade-draft requires --course");
  if (options.gradeDraft && (options.pageId || options.route || options.jsonl)) throw new Error("--grade-draft cannot be combined with --page, --route, or --jsonl");
  return options;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const options = cliArguments(process.argv.slice(2));
  if (options.help) {
    process.stdout.write("Usage: node scripts/course-page-reader-snapshot.mjs [--course ID] [--page ID|home] [--route /course/page/] [--pretty|--jsonl]\n       node scripts/course-page-reader-snapshot.mjs --course ID --grade-draft [--pretty]\n");
  } else if (options.gradeDraft) {
    process.stdout.write(`${JSON.stringify(await buildCoursePageGradeDraft(options.courseId), null, options.pretty ? 2 : 0)}\n`);
  } else {
    let snapshots = buildCoursePageReaderSnapshots();
    if (options.courseId) snapshots = snapshots.filter((item) => item.courseId === options.courseId);
    if (options.pageId) snapshots = snapshots.filter((item) => item.id === options.pageId);
    if (options.route) snapshots = snapshots.filter((item) => item.route === options.route);
    if (!snapshots.length) throw new Error("No canonical page matched the requested filters");
    if (options.jsonl) process.stdout.write(`${snapshots.map((item) => JSON.stringify({ ...item, readerSnapshotHash: readerSnapshotHash(item) })).join("\n")}\n`);
    else process.stdout.write(`${JSON.stringify({ dossierVersion: DOSSIER_VERSION, population: snapshots.length, dossiers: snapshots.map((item) => ({ ...item, readerSnapshotHash: readerSnapshotHash(item) })) }, null, options.pretty ? 2 : 0)}\n`);
  }
}
