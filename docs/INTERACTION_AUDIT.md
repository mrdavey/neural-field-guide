# Instructional interaction audit

Reviewed: 14 July 2026

This audit asks one question of every animated or manipulable surface: **what learner-visible mechanism becomes easier to reason about because this moves?** Motion that cannot answer that question is decorative and does not pass.

## Shared live traces

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

The course has 34 lab types. Repeated lab types are deliberate when two lessons ask the same mechanistic question; the lesson copy and changed-case assessment supply the new context. Every required lab runs in the browser and is labeled as a simulation.

| Lab | Learner-controlled variable | Representation and decision exposed | Evidence boundary | Audit verdict |
| --- | --- | --- | --- | --- |
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

Nine deterministic lab modes cover the 46 lessons. Each mode visibly states its learning question, **Change → Observe → Explain** cycle, completion condition, and evidence boundary. Reuse is deliberate when several lessons need the same controllable mechanism.

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

## Changes made from the audit

- Replaced the track-themed shared overlay with 24 concept-specific diagrams that progress through the four lesson stages.
- Kept Three.js as progressive enhancement instead of making WebGL the only carrier of meaning.
- Reflowed live-trace headings and stage explanations into rows and kept the visual sticky at desktop widths.
- Reflowed interactive-lab instructions into readable **Change** and **Observe** rows.
- Preserved reduced-motion behavior: the diagrams show the current state without continuous animation, and the instructional copy remains complete.
- Added World Models stories by reusing semantic grammars rather than track-themed motion, plus nine audited control modes and six preserved deterministic validation dossiers.

## Review rule

A new interaction passes only when its learning question, learner-controlled variable, expected observation, completion condition, and evidence boundary are explicit. It must depict a causal quantity or decision from the lesson; topic-colored particles, generic node graphs, and motion added only for novelty fail this audit.
