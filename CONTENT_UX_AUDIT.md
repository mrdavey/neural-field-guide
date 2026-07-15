# Content-page learning and UI audit

## Target learner route

Every lesson should follow one predictable sequence:

1. **Orient** — title, time, prerequisite bridge, lesson route, plain-language definition.
2. **Learn** — mental model, key ideas, misconception, substantial narrative, mechanism trace, guided example.
3. **Try** — code inspection/run, guided practice, interactive local lab.
4. **Test** — boundary diagnosis, unfamiliar transfer decisions, special decision studio or workshop, retrieval quiz.
5. **Extend** — optional primary sources/further reading and next-lesson connection.

Optional sources must not be required to answer the local assessments. Every assessment must provide its own feedback, retry path, hint or worked answer.

## Shared surface audit

| Surface | Learner purpose | Audit finding | Implemented target | Activity status needed |
|---|---|---|---|---|
| Lesson header and prerequisite bridge | Orient and retrieve prior knowledge | Strong hierarchy, but no map of the long page | Add a compact five-stage lesson route and a self-paced-course information disclosure | `self-contained` |
| Plain/technical definition | Establish a low-floor entry and optional depth | Visually strong; keep before long-form content | Preserve depth toggle and increase breathing room below it | Reading only |
| Mental model, key ideas, example, misconception | Build intuition before detail | Good cards, slightly compressed text | Increase body size/line height and card spacing | Reading only |
| Objectives and narrative | Explain the concept carefully | Two-column narrative makes long beginner text small and scanning-heavy | Use a single readable column with a 68–75 character measure | Reading only |
| Mechanism walkthrough | Build a causal sequence | Three dense columns make steps feel simultaneous | Stack steps vertically with generous gaps and visible sequence | Reading only |
| Guided example | Model expert reasoning | Useful but visually close to adjacent sections | Give it its own whitespace and readable measure | Reading only |
| Code notebook | Connect concept to implementation | Run-ready and pseudocode examples look identical; code is always expanded | Add an accessible status disclosure, explicit requirements/result, and collapsible code | `run locally`, `adapt first`, or `pseudocode` |
| Guided practice | Prediction and explanation | Self-check is honest but dense | Keep commit-before-reveal; separate prompt, draft, hint, answer, and reflection with space | `self-check` |
| Interactive lab | Manipulate one variable and observe | Simulations are not consistently announced as local/toy | Add an info disclosure explaining deterministic/toy status and no external model call | `simulated locally` |
| Evidence and transfer lab | Diagnose boundaries and transfer to a new case | Complete and locally checked; long radio groups need more separation | Add explicit self-contained assessment guidance and wider option spacing | `checked on this page` |
| Technical validation | Distinguish evidence from claims | Pinned runs, simulations, and published ledgers can look equivalent | Add per-validation execution status and exact learner action | `external run`, `course fixture`, or `inspect evidence` |
| Decision studios | Practise high-risk decisions | Feedback is local but simulation status is implicit | Add local simulation disclosure to the shared studio frame | `simulated and checked locally` |
| Fine-tuning workshop | Plan and optionally execute QLoRA | Planner estimates and runnable stages share one visual language | Mark planner as simulated; mark each stage as external code with environment/sequence requirements | `planner simulation` + `run externally` |
| Capstone project | Integrate several lessons | Very complete, but “submit” implies an external grader and the page is visually long | Rename outputs, explain local-only storage/evaluation, group stages progressively, and keep exemplar/reference unlocks | `self-contained project` |
| Retrieval quiz/mastery | Check one core distinction | Already deterministic and local | Add explicit local-check disclosure; keep retry and explanation | `checked on this page` |
| Further reading and sources | Extend or verify after mastery | Appears before hands-on work and can feel required | Move after local assessment/mastery and label as optional extension | `optional external` |

## Layout rules

- Default prose measure: 68–75 characters; minimum 16px body text on content surfaces.
- Major learning surfaces: at least 72px vertical separation on desktop and 48px on narrow screens.
- Long explanations and mechanisms use one reading column; grids are reserved for short comparisons and controls.
- Interactive choices have at least 12px internal spacing and 10px separation.
- Code is progressively disclosed and horizontally scrollable; status/instructions remain visible before opening it.
- Information disclosures work with hover, keyboard focus, click/tap, and `aria-describedby`.
- Mobile pages preserve the same semantic order, use one column, and never require hover.
