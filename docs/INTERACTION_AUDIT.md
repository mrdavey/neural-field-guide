# Instructional interaction audit

Reviewed: 17 July 2026

This audit asks one question of every animated or manipulable surface: **what learner-visible mechanism becomes easier to reason about because this moves?** Motion that cannot answer that question is decorative and does not pass.

## Static lesson concept plates

All 182 released lessons now place one still concept plate after the plain/deep definition and before the interactive scroll story. The complete atlas is 130 generated raster illustrations plus 52 deterministic SVG/HTML diagrams. The still plate asks which causal change connects its first and fourth stages, provides four exact code-native labels and explanations, states where the picture stops, and exposes a complete text description. Generated plates are explicitly labeled as illustrations rather than measurements; deterministic diagrams are labeled as illustrative layouts. `docs/LESSON_VISUAL_ATLAS.md` owns the full inventory, style, prompt/provenance, generation, accessibility, and verification contract.

This surface is intentionally not manipulable: its role is to give the learner an inspectable picture before motion begins. Raster art carries a concrete analogy or scene, while exact words, notation, state relationships, and evidence boundaries stay in HTML/SVG. Reduced motion and WebGL failure therefore change nothing about the plate. The subsequent story and lab continue to own Change → Observe → Explain.

## Anime.js semantic orchestration

Anime.js 4.5.0 is pinned as the shared orchestration layer. It does not own lesson truth, grading, persistence, or required content. React state and deterministic fixtures continue to own values; Anime.js only emphasizes a change that has already occurred in that state.

The motion system has four explicit layers:

1. `storyMotionContracts` maps all 24 semantic story concepts to a learning question, representation, stage selectors, route selectors, effect grammar, and evidence boundary. The same paused timeline is sought by scroll position on all five course homes and all 182 lesson stories.
2. `llmLabMotionContracts` maps every one of the 34 LLM lab types to the exact readouts or relationships that should respond when a learner changes a control.
3. `worldModelLabMotionContracts` maps all nine World Models lab grammars. Each of the 46 lesson-specific specs supplies structured control and meter values; animation never parses learner-facing strings to infer state.
4. `MotionReveal` and the course orchestrator emphasize committed explanations, newly revealed reasoning, changed feedback, active workshop/capstone stages, route entry, and reading progress. Lesson-lab controls and deterministic readouts remain immediately available; only the compact comparison note is gated.

The Three.js adapter animates only material emphasis on the existing progressive scene. Camera, geometry, scroll state, and rendering remain in the established deterministic draw path, so there is no competing render loop. WebGL failure continues to leave `StoryMechanismDiagram` as the semantic carrier.

For `prefers-reduced-motion: reduce`, shared timelines are not created, lab sweeps are hidden, the app-wide orchestrator identifies itself as static, and Three.js remains disabled. Current labels, states, relationships, instructions, answer/retry paths, and assessment controls remain available. No required meaning depends on opacity, direction, speed, color, or motion.

## LLM live traces

Every one of the 44 lessons uses a lesson-specific four-stage narrative from `app/lesson-motion.ts`. The shared renderer now selects one of 24 semantic visual grammars from `threeConceptSemantics` rather than restyling the same node diagram by track. The Three.js point field remains a progressive depth layer; `StoryMechanismDiagram` carries the explanatory meaning and remains visible when WebGL is unavailable.

| Concept | Visual grammar | Mechanism made visible |
| --- | --- | --- |
| Pipeline | Staged flow | One representation becoming the next through ordered transformations |
| Coordinates | Vector and components | Coordinates, axes, components, and one located point |
| Distribution | Normalized bars | Probability mass moving between mutually constrained outcomes |
| Optimization | Loss contours | A parameter point descending through bounded gradient steps |
| Segmentation | Token boundaries | Characters regrouping into discrete spans and IDs |
| Embedding | Row lookup | Token ID → selected table row → dense vector → learned geometry |
| Position | Paired waves | Position-dependent phase changing a token representation |
| Attention | Score matrix | One query assigning different weights to keys before mixing values |
| Layers | Residual stack | Sublayer updates rejoining a preserved residual path |
| Training | Causal loop | Prediction → loss → gradient → parameter update |
| Data | Filter and reject lane | Sources entering a documented mixture or leaving through rejection |
| Systems | Device mesh | Shards and required collective communication across devices |
| Preference | Relative margin | Chosen and rejected responses separating around one prompt |
| Decoding | Probability tree | Truncation removing branches and sampling committing to one path |
| Memory | Cache ledger | Stored key/value positions persisting while one position appends |
| Retrieval | Clustered search space | A query selecting candidate evidence from document neighborhoods |
| Agent | Guarded state machine | Legal transitions, retry paths, authorization, and stopping |
| Evaluation | Sliced scorecard | Aggregate, subgroup, uncertainty, and regression signals diverging |
| Security | Trust boundary | Untrusted text stopping outside a capability boundary |
| Compression | Quantization levels | Continuous values snapping to a smaller set of representable levels |
| Adapter | Low-rank side path | A small trainable update rejoining a frozen transformation |
| Routing | Sparse expert paths | Per-token scores selecting only top-k experts |
| Multimodal | Two-stream fusion | Image patches and text tokens entering a shared prediction sequence |
| Interpretability | Probe and intervention | Observational decoding separated from causal ablation or patching |

Each registry entry also states its learning question, what the diagram represents, and the inference boundary it must not cross. Tests require exact coverage of all 24 concepts and all 44 lesson stories.

## Manipulable lesson labs

The course has 35 lab types. Repeated lab types are deliberate when two lessons ask the same mechanistic question; the lesson copy and changed-case assessment supply the new context. Every required lab runs in the browser and is labeled as a simulation.

| Lab | Learner-controlled variable | Representation and decision exposed | Evidence boundary | Audit verdict |
| --- | --- | --- | --- | --- |
| `orientation` | Supplied-text, changing-fact, or consequential-action task | Task type routing to source comparison, current evidence, or permission and receipt checks | Responsibility-boundary cards; no source is verified and no action executes | Keep |
| `tensors` | Batch, token, and feature dimensions | Matrix contraction and surviving tensor axes | Shape arithmetic fixture, not a measured kernel | Keep |
| `softmax` | Target logit | Logits, normalized probabilities, entropy, target loss, and gradient sign | Three-class deterministic fixture | Keep |
| `gradient` | Weight and learning rate | Forward value, loss, chain-rule gradient, and optimizer step | One scalar quadratic, not a neural training run | Keep |
| `prediction` | Temperature and repeated samples | Distribution reshaping and stochastic token selection | Fixed toy logits; no model is queried | Keep |
| `tokens` | Input text | Text splitting into subword-like pieces, IDs, and token count | Toy tokenizer; exact production splits require a named tokenizer | Keep |
| `vectors` | Anchor word | Neighborhood distance in an embedding map | Hand-authored 2-D projection, not learned model embeddings | Keep |
| `positions` | Token position | Rotary coordinate phase changing with index | Small coordinate illustration | Keep |
| `attention` | Query token | Query-specific weight distribution over keys | Fixed teaching scores; attention is not a causal explanation | Keep |
| `block` | Transformer sublayer step | Same-width residual updates through a pre-norm block | One architecture variant; post-norm is named separately | Keep |
| `gpt` | Pipeline stage | Tensor shapes from IDs to vocabulary logits and shifted labels | Shape trace, not executed GPT-2 | Keep |
| `pipeline` | Training station | Dependencies and station-specific failure modes in one optimizer step | Systems walkthrough, not a live distributed run | Keep |
| `objectives` | Objective family | Exact visible input, target positions, serialization, and loss | Small constructed examples | Keep |
| `scaling` | Parameter/token budget | Undertraining and data/model imbalance under fixed compute | Illustrative budget relationship, not a scaling-law fit | Keep |
| `systems` | Parallelism strategy | What each device owns and which values communicate | Simplified eight-device topology | Keep |
| `evaluation` | Metric trace | Healthy, overfit, and spike patterns with competing diagnoses | Deterministic traces, not run measurements | Keep |
| `preference` | Response choice and learning method | Demonstration, comparison, and reward signals kept distinct | Finite teaching responses, not human-preference evidence | Keep |
| `distillation` | Teacher temperature | Hard target versus softened teacher distribution | Fixed class logits | Keep |
| `lora` | Adapter rank | Trainable-state growth and low-rank capacity trade-off | Parameter arithmetic, not a quality guarantee | Keep |
| `moe` | Input token | Router scores, top-2 expert selection, and sparse compute | Small fixed router; capacity and communication are simplified | Keep |
| `optimizer` | Learning rate and step count | Crawling, converging, and overshooting on a loss surface | Two-dimensional deterministic surface | Keep |
| `rl` | Reward and baseline | Advantage controlling policy-update direction and strength | One Bernoulli policy, not an environment run | Keep |
| `decoding` | Greedy/top-k/top-p and threshold | Candidate removal and renormalization before sampling | Fixed five-token distribution | Keep |
| `kvcache` | Layers, KV heads, tokens, and bytes | Cache memory scaling and concurrency cost | Formula excludes weights, overhead, sharing, and allocator behavior | Keep |
| `quantization` | Bit width | Footprint, representable levels, and rounding pressure | Error signal is explicitly illustrative | Keep |
| `serving` | Batch mix and sequence length | Useful decode slots versus padding/idle waste | Scheduler fixture, not a latency benchmark | Keep |
| `testtime` | Samples, tokens, diversity, and verifier reliability | Compute coverage separated from selection bottleneck | Coverage is not accuracy | Keep |
| `context` | Evidence, examples, and distractor blocks | Context budget, signal dilution, and next design action | Toy score; real changes require representative evaluation | Keep |
| `rag` | Chunk size and top-k | Recall/precision pressure, retrieved evidence, and context load | Curves are illustrative, not universal optima | Keep |
| `agents` | Legal transition, failure injection, retry, and authorization | State, checkpoint recovery, side-effect gating, receipt, and stop | Browser state machine; no external tool executes | Keep |
| `evaldesign` | Dataset slice and scorer | Deployment conclusion changing with protocol and slice | Fixed pass rates used only to expose confounding | Keep |
| `security` | Instruction provenance and capability checks | Text authority separated from authenticated runtime permission | Control-placement simulation, not a security certification | Keep |
| `observability` | Injected fault location | Request waterfall, subsystem ownership, and incident hypothesis | Deterministic trace, not production telemetry | Keep |
| `multimodal` | Resolution and task | Patch budget, task-relevant regions, and failure diagnosis | Highlights are teaching annotations, not learned attention | Keep |
| `interpretability` | Method and edit magnitude | Observation, decodability, causal intervention, edit efficacy, and locality | Claims remain scoped to the illustrated intervention | Keep |

## World Models interaction extension

Narrow-screen browser QA at 390×844 additionally verified that objective records stay inside the viewport, the course selector and lesson breadcrumb controls retain 44px targets, and range labs update their readouts from the native continuous `input` event used by pointer, touch, and keyboard changes.

The World Models course adds 46 lesson-specific four-stage stories. They deliberately reuse the same 24 semantic grammars when the causal representation is the same: distributions for stochastic futures and belief mass, state machines for observe–plan–act loops, optimization surfaces for action search and exploitation, scorecards for evaluation, and routing boundaries for safety authority. The scene is rendered through the shared `pipeline` layout because track color is not the semantic carrier; `motionStory.concept`, lesson-specific stage copy, and `StoryMechanismDiagram` supply the meaning. This preserves the existing WebGL failure and reduced-motion fallbacks without inventing a decorative world-model graph.

Nine deterministic lab modes cover the 46 lessons. Each lab places its controls and deterministic readout before a concise reflection. The learning question and evidence scope remain visible; detailed Change/Observe/Explain/Complete instructions are retained in the authored audit data but are not repeated as a procedural panel. Reuse is deliberate when several lessons need the same controllable mechanism. The first World Models lesson uses the `wm-state` surface as a qualitative route-sensitive-map versus vivid-video comparison, deferring signed state arithmetic to the lessons that teach it.

| Lab | Learner-controlled variable | Observation and explanation | Completion condition | Evidence boundary | Verdict |
| --- | --- | --- | --- | --- | --- |
| `wm-state` | Signed action or simple dynamics input | Action changes the predicted next-state mean under an explicit transition equation | Test both action directions and predict the sign first | Deterministic transition fixture; not learned or physical dynamics | Keep |
| `wm-belief` | Observation likelihood | Prior mass is multiplied by likelihood and normalized into posterior belief | Raise state-A belief above 75% and explain normalization | Two-state Bayes fixture; no calibrated sensor model | Keep |
| `wm-latent` | Latent width | Compression and an explicitly illustrative retained-detail index trade off | Compare widths 16 and 96 and name a control-relevant loss | Capacity illustration; not reconstruction or planning quality | Keep |
| `wm-rollout` | Free-running horizon | Approximate signed drift grows as a fixed residual is composed | Find the first horizon whose drift exceeds 0.5 and explain feedback | Linear near-unit-sensitivity approximation | Keep |
| `wm-planner` | Candidate population | Model-transition cost and exploit pressure rise with search breadth | Find the largest population below a 1,000-transition budget at horizon 8 | Cost arithmetic plus illustrative pressure; not measured failure probability | Keep |
| `wm-video` | Temporal stride | Encoded time steps and spatiotemporal token count change independently of spatial patches | Produce 256 tokens and name the skipped temporal evidence | Interface arithmetic; not latency or model accuracy | Keep |
| `wm-uncertainty` | Ensemble prediction spread | Disagreement crosses a review threshold while shared-bias risk remains named | Trigger review and explain why low spread is not a safety certificate | Uncalibrated deterministic spread fixture | Keep |
| `wm-safety` | Estimated violation probability | Authority routes from nominal execution to fallback at a fixed chance limit | Test values on both sides of 0.05 and name fallback authority | Supplied probability; real use requires calibration and an operating domain | Keep |
| `wm-evaluation` | Critical-slice accuracy | The aggregate can remain high while a rare non-compensable gate fails | Keep aggregate above 90% while the critical slice fails its 80% gate | Count aggregation fixture; not a benchmark result | Keep |

The World Models course also adds six preserved technical-validation dossiers at its section syntheses. These are labeled inspected deterministic fixtures, link to machine-readable JSON, and state the exact claim boundary; they are never presented as browser model executions or external benchmark reproductions.

The 15 July 2026 evidence re-audit also tightened the six dossiers and the research capstone. Belief filtering now exposes every transition, likelihood, unnormalized mass, evidence term, and posterior; the RSSM case rejects a prior whose output changes with the current observation; ensemble uncertainty preserves two confident shared-bias misses; and the Dyna comparison matches 96 model transitions while making terminal reward timing and value bootstrapping explicit. Foundation-model selection changes with the required interface, operations distinguishes same-shape semantic incompatibility from shadow false alarms and canary latency, and the research case retains a complete $3\times4$ seed-by-angle matrix plus three contact counterexamples. These additions are deterministic audit evidence, not learned-model runs or external reproductions.

## Cross-course transfer bridges

Selected high-leverage LLM and World Models lessons include a program bridge before the new mechanism begins. The learning question is whether a mechanism transfers unchanged into a later system. The learner-controlled variable is the committed written prediction; committing reveals the reusable mechanism, ownership boundary, destination build, and evidence artifact. Completion means comparing the prediction with expected reasoning and a specific retry route. This is labeled guided reflection, not automated grading.

The reveal uses shared motion emphasis only after commitment. Reduced motion removes that emphasis without changing content, order, or access. Unreleased destinations remain labeled as future handoffs and are not linked; the same data activates a static route only after the complete course enters the registry. The interaction establishes conceptual transfer and claim boundaries, not mastery of the later course or evidence that an external experiment ran.

## Course-home causal traces

The five course homes now place a static, inspectable causal trace beside the animated pipeline. Each trace asks a course-specific learning question and provides concrete input values, the transformation, an inspectable output or decision, and a failure boundary: token probabilities for LLMs, action-conditioned position branches for World Models, randomness-to-distribution evidence for Generative Models, a discounted RL target, and requested-versus-applied physical action for Embodied AI. The animation remains an illustrative orientation layer; the authored trace—not motion—carries the mechanism and survives reduced motion or canvas failure in normal reading order.

## Generative Models mechanism cases

All 30 Generative Models lessons use an authored three-case mechanism lab. The three cases and live readout appear immediately; a short reflection below asks for the strongest diagnostic signal and first causal step before revealing the compact mechanism summary. Each lesson separately states what the fixture cannot establish. The shared case-control renderer supplies keyboard/touch buttons, an accessible live readout, and a semantic meter, but lesson data—not animation—owns the result.

The first case compares relevant variation, irrelevant difference, and near-duplicate outputs for one familiar image request before introducing distributions. Later examples include normalized probability mass, ordered KL, VAE collapse probes, flow round-trip and log-determinant failure, EBM hidden energy pockets, Langevin step-size trade-offs, diffusion signal/noise coefficients, classifier-free guidance extrapolation, inverse-problem data consistency, composition gaps, and GPU evidence classes. Reduced motion changes only reveal emphasis; prediction, values, explanations, retries, and boundaries remain in normal document order.

## Reinforcement Learning & Control mechanism cases

All 32 Reinforcement Learning & Control lessons use an authored three-case decision lab. The learning question names one agent, estimator, data, planning, safety, or evidence variable; the three bounded cases, labeled value, and mechanism-specific trace are available immediately. A concise reflection follows the instrument. The renderer provides ordinary keyboard/touch buttons, an accessible live region, and a semantic meter; the lesson specification owns the state and explanation.

The first case exposes the intuitive choice → consequence → later-choice loop and contrasts successful feedback with a score shortcut. Later cases expose concrete decision mechanisms rather than generic agent motion: transition/reward changes in finite MDPs, Bayesian belief updates under partial observation, occupancy shifts, Bellman backups, return and TD targets, on-policy versus greedy control, replay age and target-network lag, exploration coverage, likelihood-ratio clipping, GAE credit, model rollout error, MPC budget, uncertainty exploitation, demonstration covariate shift, offline support, causal trajectory serialization, seed-level uncertainty, constrained decisions, GPU evidence classes, and falsifiable research claims.

Every lab states its evidence boundary. Finite tables and browser meters are deterministic teaching fixtures, not learned-policy measurements; illustrative Q values, returns, support scores, and uncertainty do not establish benchmark performance. The optional DQN runner is separately labeled external execution and reports exact invariants apart from variable observations. Reduced motion removes reveal emphasis only: current state, value, causal explanation, completion rule, retry, and assessment remain in document order.

## Embodied AI mechanism cases

All 30 Embodied AI lessons use an authored three-case physical-loop lab. The learning question names a task, sensor, frame, state, data, policy, control, authority, timing, or evidence variable. The cases, typed value, and mechanism-specific trace appear immediately; a concise reflection follows the instrument. Ordinary buttons, an accessible live region, and a semantic meter preserve keyboard and touch operation; the lesson data owns every result.

The first case makes the introductory sense → decide → act → check loop concrete through a located mug, an unconfirmed grasp, and a person entering the path. Later cases make physical-loop semantics observable without pretending a browser fixture is a robot run: requested versus applied commands, frame direction and sensor age, uncertainty under occlusion, task predicate precedence, calibrated residuals, object identity, leakage and trajectory support, action-chunk feedback delay, language counterfactuals, causal masks, diffusion denoising, feedback saturation, planner exploitation, skill postconditions, system-identification residuals, intervention authority, evaluation cells, robustness onset, latency deadlines, and external-run evidence classes. Each lesson states what the representation cannot establish.

The 15 July 2026 semantic re-audit tightened four cases whose original labels could support an incorrect inference. The partial-observation lab now moves cube state only under an explicit rigid-grasp attachment model and contrasts the ungrasped case; the transformer-policy lab places action logits on pre-action observation rows so a diagonal causal mask cannot expose the target token; the evaluation lab pairs cell rates with Wilson intervals at the independent-episode level; and the operations lab tests an explicit p99-at-most-50-ms SLO while labeling p50 as a median, never an average. These remain deterministic mechanism fixtures, and their changed cases, expected observations, completion rules, and limitations are present without motion.

WebGL and motion remain progressive layers. Labels, values, task instructions, causal explanations, completion rules, retries, and answer feedback survive reduced motion or canvas failure in normal document order. Simulation evidence is explicitly bounded to the declared fixture or simulator; the optional action-chunk runner is separately labeled external execution and promises only checkpoint, episode, budget, finite-value, and schema invariants before a reviewed run exists.

## Changes made from the audit

- Replaced the track-themed shared overlay with 24 concept-specific diagrams that progress through the four lesson stages.
- Kept Three.js as progressive enhancement instead of making WebGL the only carrier of meaning.
- Reflowed live-trace headings and stage explanations into rows and kept the visual sticky at desktop widths.
- Made all 182 lesson labs visible before their compact reflection, and removed the repeated **Do / Observe / Explain / Complete when** panel from the learner-facing flow.
- Preserved reduced-motion behavior: the diagrams show the current state without continuous animation, and the instructional copy remains complete.
- Made the midpoint-selected scroll-story step authoritative for opacity: the active explanation now stays fully visible for its complete scroll interval, while the view timeline only softens non-active steps entering or leaving the viewport.
- Replaced the LLM introduction's temperature sampler with a prerequisite-free trust-boundary comparison, and rewrote the first World Models, Generative Models, RL, and Embodied AI case labs around concrete choices before their later mathematical machinery.
- Added World Models stories by reusing semantic grammars rather than track-themed motion, plus nine audited control modes and six preserved deterministic validation dossiers.
- Added prediction-gated cross-course bridges at canonical and reinforcement joins so learners distinguish reusable mechanisms from invalid claim transfer before seeing later-course artifacts.
- Added 32 RL decision labs whose case changes make backups, credit, support, planning budgets, constraints, and seed-level evidence observable without presenting fixtures as trained-agent results.
- Added 30 Embodied AI physical-loop labs whose case changes expose timing, frames, state estimation, data lineage, grounded policies, feedback, authority, and evidence boundaries without presenting browser fixtures as robot measurements.
- Re-audited the Embodied AI grasp/occlusion, causal action-target, evaluation-uncertainty, and p99 latency cases so their visible state and arithmetic agree with their causal and statistical contracts.

## Review rule

A new interaction passes only when its learning question, learner-controlled variable, expected observation, completion condition, and evidence boundary are explicit. It must depict a causal quantity or decision from the lesson; topic-colored particles, generic node graphs, and motion added only for novelty fail this audit.
