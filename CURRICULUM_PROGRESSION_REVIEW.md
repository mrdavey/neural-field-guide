# Curriculum progression review

## Verdict

The curriculum now covers the right domains and its broad order is sound: numerical foundations → causal-decoder architecture → pre-training → post-training → inference/serving → applications/reliability → advanced specializations. A complete reorder would create more problems than it solves.

The remaining weaknesses are structural and pedagogical rather than topical:

1. The home page presents seven territories but not the five cumulative learning phases that make their order intelligible.
2. “Bridge: From Base Model to Assistant” appears before detailed post-training lessons, but the prerequisite graph bypasses it.
3. Prerequisite links name earlier lessons without reminding the learner which exact idea is being reused.
4. The course has strong conceptual coverage—short example, long guided example, practice, quiz, and interactive lab—but too little source code connecting equations and diagrams to implementation.
5. The Advanced track is a set of specialization branches. Presenting it as a single linear chain would teach a false dependency.

## Design decisions

- Preserve the seven-track order and surface it as five cumulative phases.
- Put the bridge before the post-training overview, then make the overview depend on the bridge.
- Turn prerequisite lists into knowledge bridges: prior concept → new capability.
- Preview the next lesson’s connection at the end of every lesson.
- Add lesson-specific code notebooks across all seven tracks. Use runnable Python for numerical mechanisms and clearly labelled pseudocode/configuration for systems, security, and operations.
- Keep case studies and capstones as cumulative milestones rather than treating them as ordinary topic lessons.
- Present Advanced as specialization after the shared core, with prerequisites drawn from earlier tracks rather than invented dependencies among advanced topics.

## Definition of “enough examples”

A lesson is considered well-supported when it has:

- a plain-language definition and a technical definition;
- a mental model and misconception correction;
- a short worked example;
- a longer guided example with a result;
- an independent practice prompt with hint and answer;
- an interactive lab where the topic benefits from manipulation;
- a retrieval-practice quiz;
- and, for implementable concepts, a code walkthrough with a prediction, expected observation, and modification task.

This pass therefore prioritizes code and cross-lesson transfer rather than adding more duplicate prose.

## Implemented outcome

- Five cumulative phases and concrete synthesis milestones now explain the seven-track order on the home page.
- Lesson 21 bridges base-model creation into post-training; lesson 22 and SFT now continue that dependency chain.
- Each prerequisite names the exact prior idea being reused, and every core lesson explains why the next lesson follows.
- Forty prediction-first code notebooks span all seven tracks. Runnable numerical mechanisms use NumPy or PyTorch; systems and safety mechanisms use explicitly labelled pseudocode with appropriate scope notes.
- Advanced lessons now branch into goal-based specialization choices rather than implying a false linear sequence.
- The independent curriculum grader scored the completed course 95% overall and 97% for logical ordering, with no required fixes.
- Lint, the production build, all 22 automated tests, and desktop/390px browser checks pass without console errors or horizontal page overflow.
