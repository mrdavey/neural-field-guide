# Course page grading rubric

Reviewed: 17 July 2026

## Population and grading unit

Grade all 187 canonical released course pages: five course homes and 182 lesson pages. Root and legacy redirects are routing artifacts and are verified separately.

The grading unit is **one complete page read from top to bottom**. A lesson is not a collection of independently scored components. Its opening, prerequisite bridge, long-form explanation, vocabulary, worked mechanism, visual representations, guided activities, lab, transfer work, assessment, capstone material, and sources must form one coherent learning narrative. A technically strong lab cannot repair an unexplained chapter, and polished prose cannot compensate for an inaccurate mechanism.

The grader must use one reader snapshot produced by `scripts/course-page-reader-snapshot.mjs`. The snapshot places every learner-facing surface in its intended reading order and excludes previous grades. The grader reads the complete dossier before assigning any score or writing feedback.

## Four whole-page scores

Each dimension receives an integer score from 0 to 100. Scores describe the complete page, not averages of component scores.

| Record field | Whole-page dimension | What a 95–100 page demonstrates |
| --- | --- | --- |
| `accuracy` | Accuracy | The central mechanism, terminology, notation, arithmetic, shapes, interfaces, examples, limitations, and assessment answers agree. Evidence strength matches provenance; simulations and fixtures are labeled honestly; time-sensitive claims are current or pinned. |
| `writtenNarrative` | Written narrative | The page reads like a strong textbook chapter in plain English. It opens with a meaningful question or situation, develops ideas in complete connected paragraphs, defines terms before relying on them, sustains examples long enough to build intuition, and closes or hands off the argument without sounding assembled from cards. |
| `flow` | Flow | Prior knowledge is activated where it is needed; each section earns the next; headings describe the concept being learned; transitions prepare visuals and activities and debrief their observations; repetition consolidates rather than restarts; the next-use statement follows naturally from the chapter. |
| `learningContent` | Learning content | Every visible outcome is actually taught with a plain explanation, precise causal mechanism, concrete worked case, boundary or misconception, and an observable check. Learners predict or decide before reveal, receive diagnostic feedback and a retry route, and transfer the mechanism to a changed case without needing an account, teacher, or external grader. |

Course homes use the same four dimensions with page-appropriate evidence. A home must accurately motivate the subject, make a credible promise, show a coherent course arc, preserve evidence boundaries, and lead to a useful next action. It does not need to reproduce lesson-level prerequisite or assessment detail.

## Passing gate

A page passes only when all of the following are true:

- `accuracy >= 95`;
- `writtenNarrative >= 95`;
- `flow >= 95`;
- `learningContent >= 95`;
- `overall`, the arithmetic mean of the four scores, is at least 95;
- `blockingDefects` is empty; and
- `pass` is `true` and exactly reflects those conditions.

No course average and no exceptional section can compensate for a weak page or dimension.

## Blocking defects

Record a blocking defect when the page contains any of the following, regardless of its numerical scores:

- a material technical falsehood, contradictory calculation, or incorrect answer;
- an unmet visible objective or a prerequisite idea required but never introduced;
- an incoherent or contradictory narrative that prevents the mechanism from being followed top to bottom;
- a required interaction whose instructions, result, or evidence boundary makes its learning claim misleading;
- no meaningful commit-before-answer changed-case check for a lesson; or
- required learning content that cannot be completed with the page's declared self-contained path.

Each blocker is one concise page-level diagnosis. Do not split one underlying narrative problem into repeated component defects.

## Blind whole-page grading procedure

1. Generate a current dossier with `node scripts/course-page-reader-snapshot.mjs --route /course/page/ --pretty` or the equivalent course/page filters. To start a course record, run `node scripts/course-page-reader-snapshot.mjs --course COURSE_ID --grade-draft --pretty`; this creates canonical page identities, current dossier hashes, the current source fingerprint, and null judgment fields without reading an earlier grade file. The draft is intentionally invalid as a final record until a grader fills every judgment field after a blind read.
2. Give the independent grader only that one dossier and this rubric. Do not provide earlier grades, rationales, feedback, revision notes, or the scores of adjacent pages.
3. Read every block once in ascending `order` before taking scoring notes. Within a block, follow any `readingSequence` or `interactionSequence` in array order and keep `disclosureContent` at its labeled reveal point. Read revealed answers, feedback, alternate lab results, and capstone references as part of the page while respecting their commit-before-reveal sequence.
4. Recalculate important arithmetic and inspect the complete input → transformation → output chain. Check prerequisite and next-use context for ordering, not as substitutes for missing teaching.
5. Judge whether the page forms one sustained explanation. Pay particular attention to abrupt restarts, duplicated definitions, generic transitions, activities introduced before their purpose is clear, and late sections that do not resolve or extend the opening question.
6. Assign the four whole-page scores. Do not create or average component-level grades.
7. Write one consolidated `wholePageReview`, then identify no more than three ordered page-level revision priorities.
8. After revisions, use a fresh blind dossier and a fresh independent read. Do not edit the old score upward from memory.

Structural tests can verify population, hashes, schema, arithmetic, and thresholds. They cannot award semantic scores or certify narrative quality.

## Required grader record

Each course JSON record uses rubric revision `2026-07-17` and records:

- an independent whole-page grader declaration with `input: "course-page-reader-snapshot"`, `blind: true`, and `priorGradesSeen: false`;
- the current learner-facing `sourceFingerprint`;
- one row for every canonical route in registry order; and
- the row's current `readerSnapshotHash`, so a score cannot silently survive a changed reading dossier.

The course record contains only `rubricRevision`, `gradedAt`, `sourceFingerprint`, `grader`, `courseId`, `population`, and `pages`. The grader declaration contains only `role`, `method`, `input`, `blind`, and `priorGradesSeen`. Parallel component-feedback collections are invalid at both levels.

Each page row contains only identity fields, the four scores, `overall`, `pass`, `blockingDefects`, and exactly one `wholePageReview` object:

```json
{
  "pageType": "lesson",
  "id": "example-lesson",
  "route": "/course/example-lesson/",
  "readerSnapshotHash": "sha256:…",
  "accuracy": 96,
  "writtenNarrative": 95,
  "flow": 97,
  "learningContent": 96,
  "overall": 96,
  "pass": true,
  "blockingDefects": [],
  "wholePageReview": {
    "synopsis": "A concise account of the complete page's learning journey.",
    "feedback": "One consolidated assessment of accuracy, narrative, flow, and learning value across the page.",
    "revisionPriorities": [
      "At most three ordered page-level improvements, stated once each."
    ]
  }
}
```

`overall` is the exact arithmetic mean of the four integer scores. `revisionPriorities` may contain zero to three non-duplicative items; a failing page must name at least one.

The grader must not add per-component scores, card-by-card comments, repeated feedback arrays, or a separate rationale. A visual, lab, paragraph, or assessment may be cited as evidence for a whole-page diagnosis, but feedback must explain how it affects the page's accuracy, narrative, flow, or learning journey rather than reviewing that component in isolation.
