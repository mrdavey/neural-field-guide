# Lesson visual atlas

Reviewed: 17 July 2026

The Neural Field Guide supplies one static concept plate for all 182 released lessons. These plates add a second visual explanation between the lesson definition and the interactive scroll story; they do not replace the prose, worked trace, lab, changed-case assessment, or existing semantic animation. No pilot or separate review gate divides the release: the maintained contract is the complete five-course set.

## Complete inventory

| Course | Lessons | Generated raster plates | Deterministic SVG/HTML diagrams |
| --- | ---: | ---: | ---: |
| Large Language Models | 44 | 29 | 15 |
| World Models | 46 | 34 | 12 |
| Generative Models | 30 | 23 | 7 |
| Reinforcement Learning & Control | 32 | 20 | 12 |
| Embodied AI | 30 | 24 | 6 |
| **Program** | **182** | **130** | **52** |

The five course homes are orientation pages and are not part of this lesson-only count. The 34 section anchors are included in the 182 plates rather than added on top.

The completed split is 130 generated raster plates and 52 deterministic SVG/HTML diagrams.

## Representation choice

Generated raster plates are used when a concrete scene, physical analogy, comparison, or systems metaphor gives a beginner another way to form a mental model. They are 3:2 editorial illustrations with no required text embedded in the pixels. The canonical plain-language lesson definition is reused as the concept heading; four exact stage labels, the lesson boundary, and the long description remain code-rendered.

Deterministic SVG/HTML diagrams are used when correctness depends on exact axes, normalized mass, optimization steps, token boundaries, loops, branches, memory slots, device relationships, compression levels, or state transitions. The SVG glyph supplies the shape; HTML supplies the exact stage name and explanation. These diagrams remain meaningful under reduced motion, WebGL failure, narrow layouts, keyboard navigation, and static export.

Every lesson therefore exposes the same reading sequence:

1. the lesson's canonical plain-language concept explanation;
2. one still representation of the four-stage mechanism;
3. exact code-rendered labels and stage explanations;
4. a misconception or evidence boundary;
5. a complete text description; and
6. a provenance label distinguishing generated illustration from deterministic diagram.

## Shared visual language

The complete set uses warm paper (`#F3F0E8`), dark ink (`#0B1020`), flat gouache and cut-paper fills, sparse hatching, subtle paper grain, generous whitespace, and one course/track accent. Yellow and teal are restrained secondary accents. Raster plates use a fresh composition for each lesson rather than a repeated four-panel template. Code-native labels use the existing mono utility; headings use the existing serif display face.

Generated text, equations, measurements, benchmark values, UI screenshots, logos, and watermarks are not trusted as teaching content. The prompt forbids them; the renderer still assumes only the HTML/SVG layer is exact. Some outputs contain simple unlabeled direction marks despite the no-arrow prompt, so those marks are treated as illustrative rather than authoritative. A generated picture is labeled as an illustration, never a measurement. Exact stage order, mathematical relationships, and state relationships stay deterministic.

## Efficient and accurate generation workflow

`docs/lesson-visual-prompts.json` is the complete authoring and provenance record. Each entry names the course and lesson IDs, title, track color, representation kind, historical generation question, mental-model depiction, alternative text, long description, misconception boundary, four labels, four stage explanations, output base, generation prompt, and status. That historical question records how an existing asset was commissioned; it is not displayed to learners. `app/lesson-visual-manifest.json` is the smaller client runtime projection and deliberately omits it. The shared renderer obtains the learner-facing heading from the canonical lesson `simple` field, so all 182 plates stay aligned when lesson explanations are revised.

For a new or intentionally regenerated raster plate:

1. confirm the lesson mechanism, worked example, and boundary in the course source;
2. update the one lesson-specific record without changing its canonical IDs;
3. make one built-in image-generation call using that record's prompt and the shared style paragraph;
4. keep exact words and notation out of the image; use HTML/SVG for them;
5. process the 1536×1024 source with `node scripts/process-lesson-visual.mjs <course-id> <lesson-id> <source-image>`;
6. inspect the lesson plate and a cross-course contact sheet for mechanism clarity, crop safety, unwanted text-like marks, subject repetition, and palette consistency; and
7. run `npm run verify:lesson-visuals`.

The processor rejects an unknown lesson, a deterministic record, a source smaller than 1536×1024, or a source outside the 3:2 tolerance. It writes quality-controlled 1536×1024 and 768×512 WebPs, then records the output paths, source dimensions, date, generator, and prompt revision. The verifier checks all 182 mappings, the 130/52 split, per-course counts, both dimensions for every raster, substantive file sizes, generated/code-native provenance, and missing or orphaned files.

## Delivery and accessibility

`LessonConceptPlate` resolves both image sizes through `publicPath(...)`, so root and repository-subpath GitHub Pages exports use the same manifest. Raster images reserve their 3:2 space, load lazily, and expose lesson-specific alternative text. The complete description is available in a native details element. Deterministic stage text remains in the accessibility tree; decorative SVG paths are hidden. Meaning never depends on color, generated marks, animation, hover, or WebGL.

Public lesson imagery currently occupies about 45 MB across 260 responsive WebPs. Only the selected size is requested on a lesson route; no course page eagerly downloads the complete atlas.
