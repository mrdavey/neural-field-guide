import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";
import { courseGradeFingerprint } from "../scripts/course-grade-fingerprint.mjs";
import {
  buildCoursePageGradeDraft,
  buildCoursePageReaderSnapshot,
  buildCoursePageReaderSnapshots,
  COURSE_PAGE_READER_SNAPSHOT_VERSION,
  readerSnapshotHash,
} from "../scripts/course-page-reader-snapshot.mjs";

const execFileAsync = promisify(execFile);
const snapshots = buildCoursePageReaderSnapshots();
const lessons = snapshots.filter((snapshot) => snapshot.pageType === "lesson");
const expectedPopulations = { llm: 45, worldmodel: 47, generative: 31, rl: 33, embodied: 31 };
const essentialLessonSurfaces = [
  "lesson.header",
  "lesson.narrativeOpening",
  "lesson.vocabulary",
  "lesson.openingExplanation",
  "lesson.narrativeChapters",
  "lesson.mechanismWalkthrough",
  "lesson.narrativeHandoff",
  "lesson.visual",
  "lesson.scrollStory",
  "lesson.guidedExample",
  "lesson.practice",
  "lesson.objectiveChecks",
  "lesson.lab",
  "lesson.transfer",
  "lesson.quiz",
  "lesson.completion",
  "lesson.furtherReading",
  "lesson.discussion",
  "lesson.next",
];

function blockFor(snapshot, surface) {
  return snapshot.blocks.find((block) => block.surface === surface);
}

test("reader snapshots cover all five homes and 182 lessons in canonical route order", () => {
  assert.equal(snapshots.length, 187);
  assert.equal(lessons.length, 182);
  assert.equal(new Set(snapshots.map((snapshot) => snapshot.route)).size, 187);
  assert.deepEqual(Object.fromEntries(Object.keys(expectedPopulations).map((courseId) => [courseId, snapshots.filter((snapshot) => snapshot.courseId === courseId).length])), expectedPopulations);
  for (const courseId of Object.keys(expectedPopulations)) {
    const coursePages = snapshots.filter((snapshot) => snapshot.courseId === courseId);
    assert.equal(coursePages[0].id, "home", `${courseId} home comes first`);
    assert.equal(coursePages[0].route, `/${courseId}/`);
    assert.ok(coursePages.slice(1).every((snapshot) => snapshot.route === `/${courseId}/${snapshot.id}/`), `${courseId} lesson routes`);
  }
});

test("every dossier is blind, complete, and explicitly ordered as one page", () => {
  for (const snapshot of snapshots) {
    const key = `${snapshot.courseId}:${snapshot.id}`;
    assert.equal(snapshot.dossierVersion, COURSE_PAGE_READER_SNAPSHOT_VERSION, `${key} version`);
    assert.deepEqual(snapshot.reviewContract, {
      gradingUnit: "one complete page",
      readingOrder: "blocks in ascending order",
      withinBlockOrder: "prose first, then named fields in serialized order; readingSequence and interactionSequence arrays are sequential, and disclosure content stays at its labeled reveal point",
      priorGradesIncluded: false,
      componentScoresAllowed: false,
    }, `${key} review contract`);
    assert.ok(snapshot.blocks.length >= 6, `${key} page blocks`);
    assert.deepEqual(snapshot.blocks.map((block) => block.order), Array.from({ length: snapshot.blocks.length }, (_, index) => index + 1), `${key} reading order`);
    for (const block of snapshot.blocks) {
      assert.ok(typeof block.surface === "string" && block.surface.length > 0, `${key} block surface`);
      assert.ok(typeof block.heading === "string" && block.heading.trim().length > 0, `${key}:${block.surface} heading`);
      assert.ok(Array.isArray(block.prose), `${key}:${block.surface} prose`);
    }
    for (const forbidden of ["accuracy", "writtenNarrative", "flow", "learningContent", "overall", "pass", "wholePageReview"]) {
      assert.equal(Object.hasOwn(snapshot, forbidden), false, `${key} excludes prior grade field ${forbidden}`);
    }
  }
});

test("lesson dossiers preserve the rendered narrative and learning sequence", () => {
  for (const snapshot of lessons) {
    const key = `${snapshot.courseId}:${snapshot.id}`;
    const positions = essentialLessonSurfaces.map((surface) => {
      const block = blockFor(snapshot, surface);
      assert.ok(block, `${key} includes ${surface}`);
      return block.order;
    });
    assert.deepEqual([...positions].sort((left, right) => left - right), positions, `${key} essential surfaces follow reading order`);
    assert.ok(snapshot.context.prerequisites, `${key} prerequisite context`);
    assert.ok(snapshot.context.nextUse.length >= 20, `${key} next-use context`);
    assert.equal(blockFor(snapshot, "lesson.narrativeOpening").prose.length, 1, `${key} opening definition precedes vocabulary`);
    assert.ok(blockFor(snapshot, "lesson.openingExplanation").prose.length >= 1, `${key} opening prose follows vocabulary`);
    assert.equal(blockFor(snapshot, "lesson.openingExplanation").visibleHeading, false, `${key} opening prose does not invent a visible heading`);
    const walkthrough = blockFor(snapshot, "lesson.mechanismWalkthrough").steps;
    assert.ok(walkthrough.length >= 3, `${key} mechanism steps`);
    assert.equal(blockFor(snapshot, "lesson.mechanismWalkthrough").heading, "Trace the evidence, change, and conclusion", `${key} coherent walkthrough heading`);
    const cleanHeading = (value) => value.trim().replace(/[.!?]+$/, "");
    assert.ok(blockFor(snapshot, "lesson.narrativeHandoff").prose[0].includes(`from “${cleanHeading(walkthrough[0].title)}” to “${cleanHeading(walkthrough.at(-1).title)}.”`), `${key} cleaned walkthrough handoff`);
    const visual = blockFor(snapshot, "lesson.visual");
    assert.equal(visual.initiallyVisible.labels.length, visual.disclosureContent.stageDescriptions.length, `${key} visual label descriptions`);
    assert.ok(visual.initiallyVisible.mentalModel.length >= 20, `${key} visible visual mental model`);
    assert.ok(visual.disclosureContent.importantLimit.length >= 20, `${key} disclosure-only misconception boundary`);
    const story = blockFor(snapshot, "lesson.scrollStory");
    assert.equal(story.steps.length, 4, `${key} scroll story stages`);
    assert.deepEqual(story.steps.map((step) => step.label), ["STEP 01", "STEP 02", "STEP 03", "STEP 04"], `${key} scroll reading labels`);
    assert.deepEqual(story.steps.map((step) => step.title), visual.initiallyVisible.labels, `${key} scroll titles reuse concise visual labels`);
    assert.deepEqual(story.steps.map((step) => step.body), visual.disclosureContent.stageDescriptions.map((stage) => stage.description), `${key} scroll bodies reuse the full stage explanations`);
    assert.deepEqual(blockFor(snapshot, "lesson.guidedExample").interactionSequence.map((item) => item.phase), ["commitBeforeReveal", "revealAfterCommit", "selfDiagnosis"], `${key} guided-example reveal order`);
    assert.deepEqual(blockFor(snapshot, "lesson.practice").interactionSequence.map((item) => item.phase), ["draft", "optionalHint", "revealAfterCommit", "selfDiagnosis"], `${key} practice reveal order`);
    const practiceDiagnosis = blockFor(snapshot, "lesson.practice").interactionSequence.find((item) => item.phase === "selfDiagnosis");
    assert.ok(practiceDiagnosis.choices.length === 3 && practiceDiagnosis.choices.every((choice) => choice.label && choice.feedback), `${key} practice choice-specific feedback`);
    const code = blockFor(snapshot, "lesson.code");
    if (code) {
      const codeDiagnosis = code.interactionSequence.find((item) => item.phase === "selfDiagnosis");
      assert.ok(codeDiagnosis.choices.length === 3 && codeDiagnosis.choices.every((choice) => choice.label && choice.feedback), `${key} code choice-specific feedback`);
    }
    const objectiveChecks = blockFor(snapshot, "lesson.objectiveChecks").objectives;
    assert.ok(objectiveChecks.length >= 1, `${key} objective checks`);
    assert.ok(objectiveChecks.every((objective) => {
      const [commit, reveal, disclosure] = objective.interactionSequence;
      return commit.prompt && reveal.expectedReasoning && reveal.retry && disclosure.explanation && disclosure.mechanism && disclosure.workedExample && disclosure.boundary;
    }), `${key} complete objective feedback and disclosure content`);
    const transfer = blockFor(snapshot, "lesson.transfer");
    if (snapshot.courseId === "llm") {
      assert.deepEqual(transfer.interactionSequence.map((item) => item.phase), ["boundaryContrast", "diagnosticDecision", "commitUnfamiliarCase", "structuredDecisionsAfterCommit", "workedSolutionAfterPass"], `${key} boundary-to-transfer order`);
      assert.ok(transfer.interactionSequence[1].correctFeedback && transfer.interactionSequence[1].incorrectFeedback, `${key} diagnostic branch feedback`);
      assert.ok(transfer.interactionSequence[3].checks.every((check) => check.options.length === 3 && check.firstErrorFeedback), `${key} deterministic structured feedback`);
      assert.ok(transfer.interactionSequence[4].solution && transfer.interactionSequence[4].passFeedback && transfer.interactionSequence[4].retryFeedback, `${key} gated worked transfer feedback`);
      assert.equal(Object.hasOwn(transfer, "mechanismTrace"), false, `${key} does not repeat the chapter walkthrough`);
    } else {
      assert.deepEqual(transfer.interactionSequence.map((item) => item.phase), ["commitBeforeOptions", "optionsAfterCommit", "feedbackAfterChoice"], `${key} changed-case reveal order`);
      assert.ok(transfer.interactionSequence[2].optionSpecificFeedback.length >= 2 && transfer.interactionSequence[2].workedReasoning && transfer.interactionSequence[2].retryAfterIncorrectChoice, `${key} option-specific transfer feedback`);
    }
    const [quizChoices, quizFeedback] = blockFor(snapshot, "lesson.quiz").interactionSequence;
    assert.ok(quizChoices.options.length >= 2, `${key} quiz choices`);
    assert.ok(Number.isInteger(quizFeedback.correctOption) && quizFeedback.explanation && quizFeedback.retry, `${key} quiz feedback`);
    assert.ok(blockFor(snapshot, "lesson.furtherReading").resources.length >= 1, `${key} source-backed extension`);
    const external = blockFor(snapshot, "lesson.externalExperiment");
    if (external) assert.ok(external.order > blockFor(snapshot, "lesson.furtherReading").order, `${key} optional external run follows the required assessment and sources`);
    const workshop = blockFor(snapshot, "lesson.fineTuningWorkshop");
    if (workshop) assert.ok(workshop.order > blockFor(snapshot, "lesson.furtherReading").order, `${key} optional workshop follows the required assessment and sources`);
    const next = blockFor(snapshot, "lesson.next");
    if (next.relationship) {
      assert.ok(["direct reuse", "new chapter thread"].includes(next.relationship), `${key} names the next-page relationship honestly`);
      assert.ok(next.reuse && next.toLearn && next.reuseLabel && next.nextLabel, `${key} next-page handoff carries the current result and next goal`);
    }
  }
});

test("lab dossiers include instructions, boundaries, and inspectable results for every lab family", () => {
  for (const snapshot of lessons) {
    const lab = blockFor(snapshot, "lesson.lab");
    const key = `${snapshot.courseId}:${snapshot.id}`;
    assert.ok(lab.activity.change && lab.activity.observe && lab.activity.explain && lab.activity.complete && lab.activity.boundary, `${key} Change → Observe → Explain contract`);
    assert.ok(Array.isArray(lab.results) && lab.results.length >= 2, `${key} contrasting lab results`);
    const phases = lab.interactionSequence.map((item) => item.phase);
    assert.equal(phases[0], "instructions", `${key} lab begins with instructions`);
    assert.ok(phases.some((phase) => phase.startsWith("commitBefore")), `${key} lab requires a committed explanation`);
    assert.ok(phases.at(-1).startsWith("revealAfter"), `${key} lab reveals its mechanism only after commitment`);
  }
  const llmLab = blockFor(buildCoursePageReaderSnapshot("llm", "introduction"), "lesson.lab");
  assert.equal(llmLab.results.length, 2);
  assert.ok(llmLab.results[0].renderedInstrument.includes("Rewrite notes"));
  assert.ok(llmLab.results[0].renderedInstrument.includes("SUPPLIED TEXT"));
  assert.notEqual(llmLab.results[0].renderedInstrument, llmLab.results[1].renderedInstrument, "LLM lab evaluates a contrasting control state");
  const numericWorldModelLab = blockFor(buildCoursePageReaderSnapshot("worldmodel", "learning-dynamics"), "lesson.lab");
  assert.deepEqual(numericWorldModelLab.results.map((result) => result.input), [1, 2, 3, 4], "world-model dossier includes every authored completion value");
  const worldModelLab = blockFor(buildCoursePageReaderSnapshot("worldmodel", "world-models"), "lesson.lab");
  assert.ok(worldModelLab.results.length >= 2, "world-model control has contrasting evaluated states");
  const researchLab = blockFor(buildCoursePageReaderSnapshot("generative", "generation-as-distribution"), "lesson.lab");
  assert.equal(researchLab.results.length, 3, "research lab exposes all three authored cases");
});

test("capstone dossiers retain the complete build, evidence, source, reflection, and review order", () => {
  const capstones = lessons.filter((snapshot) => blockFor(snapshot, "lesson.capstoneOverview"));
  assert.ok(capstones.length >= 30);
  for (const snapshot of capstones) {
    const key = `${snapshot.courseId}:${snapshot.id}`;
    const ordered = ["lesson.capstoneSynthesis", "lesson.capstoneOverview", "lesson.capstoneStages", "lesson.capstoneRubric", "lesson.capstoneExemplar", "lesson.capstoneReflection", "lesson.capstoneReview"].map((surface) => {
      const item = blockFor(snapshot, surface);
      assert.ok(item, `${key} includes ${surface}`);
      return item.order;
    });
    assert.deepEqual([...ordered].sort((left, right) => left - right), ordered, `${key} capstone reading order`);
    assert.ok(blockFor(snapshot, "lesson.capstoneStages").stages.length >= 1, `${key} capstone stages`);
    const exemplar = blockFor(snapshot, "lesson.capstoneExemplar");
    assert.deepEqual(exemplar.interactionSequence.map((item) => item.phase), ["attemptGate", "revealAfterAttempt"], `${key} exemplar attempt gate`);
    assert.ok(exemplar.interactionSequence[1].summary && exemplar.interactionSequence[1].decisions, `${key} exemplar reveal content`);
    const reference = blockFor(snapshot, "lesson.capstoneReference");
    if (reference) {
      assert.deepEqual(reference.interactionSequence.map((item) => item.phase), ["attemptGate", "revealAfterAttempt"], `${key} reference attempt gate`);
      assert.ok(reference.interactionSequence[1].sections && reference.interactionSequence[1].artifact, `${key} reference reveal content`);
    }
    assert.ok(blockFor(snapshot, "lesson.capstoneReview").reviewLinks.length >= 1, `${key} synthesis review links`);
  }
});

test("reader hashes are deterministic and sensitive to changed learner-facing copy", () => {
  const first = buildCoursePageReaderSnapshot("embodied", "observation-action-spaces");
  const second = buildCoursePageReaderSnapshot("embodied", "observation-action-spaces");
  assert.equal(readerSnapshotHash(first), readerSnapshotHash(second));
  const changed = structuredClone(first);
  changed.blocks[1].prose[0] += " Changed copy.";
  assert.notEqual(readerSnapshotHash(first), readerSnapshotHash(changed));
});

test("the snapshot CLI emits one filtered dossier with its hash", async () => {
  const { stdout } = await execFileAsync(process.execPath, ["scripts/course-page-reader-snapshot.mjs", "--route", "/rl/mdps-rewards/"], {
    cwd: new URL("..", import.meta.url),
    maxBuffer: 8 * 1024 * 1024,
  });
  const result = JSON.parse(stdout);
  assert.equal(result.population, 1);
  assert.equal(result.dossiers[0].route, "/rl/mdps-rewards/");
  assert.equal(result.dossiers[0].readerSnapshotHash, readerSnapshotHash(buildCoursePageReaderSnapshot("rl", "mdps-rewards")));
});

test("the grade-draft command creates a fresh blind course record without prior judgments", async () => {
  const directDraft = await buildCoursePageGradeDraft("llm");
  const { stdout } = await execFileAsync(process.execPath, ["scripts/course-page-reader-snapshot.mjs", "--course", "llm", "--grade-draft"], {
    cwd: new URL("..", import.meta.url),
    maxBuffer: 8 * 1024 * 1024,
  });
  const draft = JSON.parse(stdout);
  assert.deepEqual(draft, directDraft);
  assert.equal(draft.population, 45);
  assert.equal(draft.sourceFingerprint, await courseGradeFingerprint("llm"), "draft fingerprints the current learner-facing source");
  assert.deepEqual(draft.pages.map(({ pageType, id, route }) => ({ pageType, id, route })), snapshots.filter((snapshot) => snapshot.courseId === "llm").map(({ pageType, id, route }) => ({ pageType, id, route })));
  assert.ok(draft.pages.every((page) => page.readerSnapshotHash === readerSnapshotHash(buildCoursePageReaderSnapshot("llm", page.id))), "draft pins every canonical reader dossier");
  assert.ok(draft.pages.every((page) => [page.accuracy, page.writtenNarrative, page.flow, page.learningContent, page.overall, page.pass, page.blockingDefects, page.wholePageReview.synopsis, page.wholePageReview.feedback, page.wholePageReview.revisionPriorities].every((value) => value === null)), "draft contains no inherited judgment");
  assert.deepEqual(draft.grader, { role: "independent whole-page grader", method: null, input: "course-page-reader-snapshot", blind: true, priorGradesSeen: false });
});
