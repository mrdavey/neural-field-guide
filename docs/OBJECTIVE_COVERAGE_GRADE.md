# Independent objective-coverage grade — pass 1

Reviewed: 14 July 2026  
Scope: all 44 lessons and all 132 exact learner-visible outcomes

## Result

This pass does **not** clear the semantic authoring gate.

- Overall objective grades: **73 PASS, 59 PARTIAL, 0 FAIL**.
- Plain-language explanation: **132 pass, 0 partial, 0 fail**.
- Causal mechanism or decision process: **125 pass, 7 partial, 0 fail**.
- Concrete worked value, shape, token, stage, or scenario: **91 pass, 41 partial, 0 fail**.
- Boundary, failure case, or misconception: **132 pass, 0 partial, 0 fail**.
- Committed check, expected reasoning, and useful retry: **91 pass, 39 partial, 2 fail**.

The two failed check dimensions are not empty fields. They are unusable changed cases: `decoding-sampling` objective 1 says “given four logits” without supplying the logits, and `quantization-memory` objective 3 asks the learner to choose between 8-bit and 4-bit without supplying any measured quality, latency, memory, throughput, or kernel-support evidence. Both objectives are therefore PARTIAL overall because their other dimensions remain meaningful.

## Method

I independently read `AGENTS.md`, the complete lesson-guide registry and all three guide source files, the resolved objective-coverage registry, the lesson renderer, and the existing inventory review. I treated the rendered content after “By the end of…” as the evidence: each objective card, the later narrative, walkthrough, guided example, and changed-case practice. A later passage counted only when it actually taught the exact outcome; shared vocabulary, a related example, or a pointer to another objective did not count.

For each exact objective I graded:

1. **E — explanation:** understandable ordinary-language meaning without relying on unexplained jargon;
2. **M — mechanism:** named inputs/evidence, transformation or decision process, and output/decision;
3. **W — worked evidence:** a concrete value, shape, token trace, staged case, or decision scenario that actually exercises this objective;
4. **B — boundary:** a genuine limitation, failure case, confound, or misconception;
5. **C — check/retry:** enough case data to attempt the task, revealed reasoning that answers that exact case, and a retry route to relevant teaching.

Legend: **P** = pass, **△** = partial, **F** = fail. Overall PASS requires five P grades. A row with any △ or F is PARTIAL. No objective receives credit merely because its strings are long or structurally present.

The focused structural test passed:

```text
node --test tests/objective-coverage.test.mjs
1 test passed
```

That test did not determine any semantic grade. It verifies lesson/objective counts, exact string joins, minimum field lengths, unique check prompts, and the presence of a retry phrase. It cannot detect an SGD answer that omits `2.8`, a QKV shape answer with no shapes, an example borrowed from a different objective, undefined later-course terms, or a changed-case prompt with missing evidence.

## Foundations and architecture

| Lesson | # | Exact objective | E | M | W | B | C | Overall | Required revision for every non-pass |
|---|---:|---|:---:|:---:|:---:|:---:|:---:|---|---|
| `introduction` | 1 | Describe an LLM as a conditional next-token model | P | P | P | P | P | PASS | — |
| `introduction` | 2 | Separate training, inference, decoding, and post-training | P | P | △ | P | P | PARTIAL | **W:** replace the reused probability/sampling fragment with one staged case that names the parameter-changing pre-training/post-training events, fixed-parameter inference, and token selection during decoding. |
| `introduction` | 3 | Explain why fluent output can still be wrong | P | P | P | P | P | PASS | — |
| `tensors-shapes` | 1 | Read common LLM tensor shapes without guessing | P | P | P | P | P | PASS | — |
| `tensors-shapes` | 2 | Predict the output of a matrix multiplication | P | P | P | P | △ | PARTIAL | **C:** reveal the changed-case result explicitly: `[2,5,4] × [4,7] → [2,5,7]`, with four products summed for each output feature; do not leave the learner to substitute into a generic formula. |
| `tensors-shapes` | 3 | Explain broadcasting and why silent shape errors are dangerous | P | P | △ | P | P | PARTIAL | **W / prerequisite leak:** keep the bias example, but replace or fully define the attention-mask example. “Query rows” and “key columns” are used before attention is taught and are absent from this lesson’s vocabulary. |
| `probability-softmax` | 1 | Convert logits into probabilities conceptually and numerically | P | P | P | P | P | PASS | — |
| `probability-softmax` | 2 | Interpret cross-entropy as surprise assigned to the target | P | △ | P | P | P | PARTIAL | **M / prerequisite leak:** remove the unexplained `p-y`/backprop sentence or define both symbols and explain the correction in beginner language; gradients and backpropagation are taught only in the next lesson. |
| `probability-softmax` | 3 | Distinguish entropy, cross-entropy, perplexity, and calibration | P | P | P | P | P | PASS | — |
| `gradients-backprop` | 1 | Trace a forward and backward computation graph | P | P | P | P | P | PASS | — |
| `gradients-backprop` | 2 | Apply the chain rule to a simple parameter | P | P | P | P | P | PASS | — |
| `gradients-backprop` | 3 | Explain why backpropagation and optimization are separate | P | P | △ | P | P | PARTIAL | **W:** extend the `dL/dw=48` trace through at least two optimizer step sizes, showing that the same correct local derivative can yield a safe small update or a loss-increasing overshoot. |
| `optimizers` | 1 | Turn a gradient into an explicit parameter update | P | P | △ | P | △ | PARTIAL | **W, C:** work the requested case all the way through: `θ' = 3 - 0.1×2 = 2.8`; explain the sign using local loss increase. The current ravine example and revealed generic formula never perform the explicit update. |
| `optimizers` | 2 | Compare SGD, momentum, Adam, and AdamW conceptually | P | P | P | P | P | PASS | — |
| `optimizers` | 3 | Diagnose learning-rate and optimizer-state problems | P | P | P | P | P | PASS | — |
| `tokenization` | 1 | Explain why models use tokens instead of raw words | P | P | P | P | P | PASS | — |
| `tokenization` | 2 | Trace encode and decode through a subword vocabulary | P | P | △ | P | △ | PARTIAL | **W, C:** assign actual toy IDs to `un`, `play`, and the pieces for `able`; show normalization, piece selection, the ID list, and decoding back to text. The current toy vocabulary has no IDs, so the requested ID trace cannot be completed or checked. |
| `tokenization` | 3 | Predict how tokenization affects cost, languages, and model behavior | P | P | P | P | P | PASS | — |
| `embedding-layer` | 1 | Explain an embedding lookup as a learned table row | P | P | △ | P | △ | PARTIAL | **W, C:** show a small ID tensor or explicitly resolve the supplied shapes: eight IDs select eight rows from `E[50,000,768]`, producing `[2,4,768]`. The current `E[bat]` fragment and generic reveal omit the changed-case result. |
| `embedding-layer` | 2 | Distinguish static token embeddings from contextual hidden states | P | △ | P | P | P | PARTIAL | **M / prerequisite leak:** replace undefined “attention and MLP blocks” with a locally defined context-mixing process, or briefly define both before relying on them; these mechanisms are taught in later lessons. |
| `embedding-layer` | 3 | Interpret similarity cautiously in a high-dimensional space | P | P | P | P | △ | PARTIAL | **C:** reveal two distinct limits requested by the prompt—lossy 2-D projection and type-level/raw-vs-contextual mismatch (or metric/data bias)—then name the controlled contextual comparison. The current answer effectively gives only one reason. |
| `positional-encoding` | 1 | Explain why content-only attention cannot determine order | P | P | △ | P | P | PARTIAL | **W:** replace the isolated trophy-token sentence with a worked two-token permutation showing identical content projections, permuted scores/outputs, and the absence of an order-identifying signal; define query/key locally if retained. |
| `positional-encoding` | 2 | Compare absolute, relative, and rotary position signals | P | P | △ | P | P | PARTIAL | **W:** add one shared two-position example and show where each method enters: an added index vector, a distance-dependent score bias, and a Q/K rotation whose dot product depends on displacement. The pronoun sentence does not compare the three methods. |
| `positional-encoding` | 3 | Describe how position design affects long-context behavior | P | P | △ | P | △ | PARTIAL | **W, C:** use a genuine 2K→16K case with positions near the start/middle/end. Reveal one order-sensitive test and one retrieval-sensitive test, their failure criteria, and why the current short pronoun example does not establish long-context use. |
| `attention` | 1 | Trace query-key-value attention from shapes to weighted output | P | △ | △ | P | △ | PARTIAL | **M, W, C:** add the full shape trace: `Q,K,V [B,h,T,d_h]`; scores/weights `[B,h,T,T]` with softmax over the key axis; weighted values `[B,h,T,d_h]`; concatenation `[B,T,h·d_h]`; output projection/residual `[B,T,d]`. Reveal those exact shapes in the check answer. |
| `attention` | 2 | Explain causal masking and multi-head specialization | P | P | P | P | P | PASS | — |
| `attention` | 3 | Avoid treating attention weights as complete explanations | P | P | P | P | P | PASS | — |
| `layers-of-understanding` | 1 | Trace data through a pre-norm Transformer block | P | P | P | P | P | PASS | — |
| `layers-of-understanding` | 2 | Explain residual streams and MLP contributions | P | P | P | P | P | PASS | — |
| `layers-of-understanding` | 3 | Describe why capabilities emerge across layers rather than one location | P | P | P | P | P | PASS | — |
| `learning-to-predict` | 1 | Construct shifted input-target pairs for causal language modeling | P | P | P | P | P | PASS | — |
| `learning-to-predict` | 2 | Explain teacher forcing and parallel token loss | P | P | P | P | P | PASS | — |
| `learning-to-predict` | 3 | Connect token loss to gradients without confusing prediction with truth | P | P | P | P | P | PASS | — |
| `gpt2-from-scratch` | 1 | Trace every major tensor through a decoder-only Transformer | P | P | △ | P | △ | PARTIAL | **W, C:** replace the contamination fragment with the requested shape trace: IDs `[2,32]`, token/position and both block states `[2,32,d]`, final norm `[2,32,d]`, logits `[2,32,50,000]`, and aligned next-token targets. Reveal the instantiated shapes. |
| `gpt2-from-scratch` | 2 | Separate enduring GPT design ideas from implementation-era choices | P | P | P | P | △ | PARTIAL | **C:** explicitly classify each requested item: causal masking is the enduring left-to-right contract; learned absolute positions, GELU, and grouped-query attention are implementation choices, with one-sentence justification for each. |
| `gpt2-from-scratch` | 3 | Design and debug a tiny end-to-end training run | P | P | P | P | △ | PARTIAL | **C:** reveal a concrete protocol: same tiny batch overfits; a document-level clean holdout stays separate; mask/shift unit cases prevent target leakage; saved weights, optimizer, scheduler, RNG, and sampler position reproduce the uninterrupted next steps. |

## Training and post-training

| Lesson | # | Exact objective | E | M | W | B | C | Overall | Required revision for every non-pass |
|---|---:|---|:---:|:---:|:---:|:---:|:---:|---|---|
| `pretraining-overview` | 1 | Explain what a base model learns during pre-training | P | P | △ | P | P | PARTIAL | **W:** replace the duplicated definition with one corpus-to-parameter-to-continuation scenario, for example how mixed “Explain photosynthesis” continuations reduce next-token loss yet do not select an assistant contract. |
| `pretraining-overview` | 2 | Trace one batch through the training loop | P | P | △ | P | △ | PARTIAL | **W, C:** trace one small packed batch through IDs, shifted labels/masks, logits, scalar loss, synchronized gradients, and updated parameters. Reveal which padding/document positions are masked and which gradients or optimizer states are synchronized/sharded. |
| `pretraining-overview` | 3 | Identify the main sources of cost and failure | P | P | P | P | P | PASS | — |
| `objectives-details` | 1 | Derive causal next-token loss from shifted sequences | P | P | P | P | P | PASS | — |
| `objectives-details` | 2 | Explain why masking and architecture must agree | P | P | P | P | P | PASS | — |
| `objectives-details` | 3 | Relate normalization, residuals, and initialization to trainability | P | P | P | P | △ | PARTIAL | **C:** reveal discriminating evidence: residual/update norms growing with depth for bad scaling, activation/norm statistics for unstable normalization, and a tiny causal-mask/target-leak test for the masking bug. The current answer only restates component roles. |
| `scaling-laws` | 1 | Interpret empirical scaling curves without treating them as physical laws | P | P | P | P | P | PASS | — |
| `scaling-laws` | 2 | Balance parameters, tokens, and compute | P | P | P | P | P | PASS | — |
| `scaling-laws` | 3 | Diagnose optimization choices that can invalidate a scaling experiment | P | P | P | P | P | PASS | — |
| `data-engineering` | 1 | Design a governed text-data pipeline | P | P | P | P | P | PASS | — |
| `data-engineering` | 2 | Explain deduplication, filtering, and mixture trade-offs | P | P | P | P | P | PASS | — |
| `data-engineering` | 3 | Prevent contamination and document data lineage | P | P | P | P | P | PASS | — |
| `infrastructure` | 1 | Explain data, tensor, pipeline, and sequence parallelism | P | P | △ | P | △ | PARTIAL | **W, C:** use a four-way comparison that states, for each method, what is partitioned, what is replicated, its main collective/transfer, and the memory/throughput benefit. The 7B Adam memory example motivates sharding but does not teach all four forms. |
| `infrastructure` | 2 | Connect communication patterns to performance | P | P | P | P | P | PASS | — |
| `infrastructure` | 3 | Design failure recovery and numerical monitoring | P | P | P | P | P | PASS | — |
| `advanced-objectives` | 1 | Compare causal, masked, span-corruption, and infilling objectives | P | P | P | P | P | PASS | — |
| `advanced-objectives` | 2 | Explain when auxiliary objectives help or conflict | P | P | P | P | P | PASS | — |
| `advanced-objectives` | 3 | Choose an objective that matches the desired interface | P | P | P | P | P | PASS | — |
| `pretraining-evaluation` | 1 | Distinguish training diagnostics from capability evaluations | P | P | P | P | △ | PARTIAL | **C:** reveal the case-specific conclusion: lower held-out loss establishes better next-token prediction on that distribution; 62%→57% establishes an arithmetic regression under the frozen suite; neither cancels the other. |
| `pretraining-evaluation` | 2 | Design clean, reproducible benchmark protocols | P | P | P | P | P | PASS | — |
| `pretraining-evaluation` | 3 | Use learning curves to make stop, continue, or repair decisions | P | P | P | P | △ | PARTIAL | **C:** make and justify one decision under a declared arithmetic gate (for example pause and repair the mixture), then name evidence that would reverse it, such as a confidence interval spanning zero or arithmetic being outside the intended-use contract. |
| `olmo3-case-study` | 1 | Trace Dolma 3 Mix → Dolmino → Longmino through the OLMo 3 model flow | P | P | P | P | P | PASS | — |
| `olmo3-case-study` | 2 | Connect concrete data, systems, objective, and evaluation decisions to earlier lessons | P | P | P | P | P | PASS | — |
| `olmo3-case-study` | 3 | Design a controlled stage-level ablation using open checkpoints | P | P | P | P | △ | PARTIAL | **C:** use the already-authored treatment/control literal as the revealed answer: same entering checkpoint, tokens, optimizer/schedule, compute, and evaluator; only mixture changes; predeclare a regression falsifier and preserve configs/logs/checkpoints. |
| `posttraining-overview` | 1 | Explain why a capable base model is not yet a useful assistant | P | P | △ | P | △ | PARTIAL | **W, C:** show two actual continuations of the same prompt—one corpus-like base continuation and one direct assistant answer—and reveal that post-training changes the interaction distribution, not a factuality guarantee. |
| `posttraining-overview` | 2 | Map the stages of a post-training pipeline | P | P | P | P | △ | PARTIAL | **C:** choose one behavior gap and reveal its minimum ordered stages, naming the new artifact at each handoff (demonstration, comparison, verifier/reward, tool/safety trajectory, regression evidence). The generic iteration loop does not answer that exact task. |
| `posttraining-overview` | 3 | Recognize capability, behavior, and safety trade-offs | P | P | △ | P | P | PARTIAL | **W:** add a concrete before/after table with at least one behavior gain, factual/capability result, harmful-compliance result, and benign-refusal regression, followed by a release decision. |
| `instruction-tuning-rlhf` | 1 | Connect base-model pre-training to assistant post-training | P | P | P | P | △ | PARTIAL | **C:** reveal which broad language/domain patterns came from pre-training and which role following, formatting, ranking, tool, and boundary behaviors are reshaped during post-training; the current answer merely lists post-training methods. |
| `instruction-tuning-rlhf` | 2 | Distinguish SFT, preference optimization, RL, and tool/safety tuning | P | P | P | P | △ | PARTIAL | **C:** answer every requested mapping explicitly: format imitation→SFT; subtle ranking→preferences; executable success→verifiable reward/RL when exploration is useful; authorization→runtime controls, with tool/safety tuning only shaping proposals. |
| `instruction-tuning-rlhf` | 3 | Select the minimum training stage for a behavior gap | P | △ | P | P | △ | PARTIAL | **M, C:** replace the generic “base ceiling” paragraph with a decision process based on available supervision. Reveal malformed JSON→SFT/parser check, preferred tone→preference data only if demonstrations are insufficient, unit-tested math→verifier/RL if exploration is needed, and unauthorized calls→runtime authorization plus targeted safety/tool data. |
| `sft` | 1 | Construct high-quality conversational demonstrations | P | P | △ | P | △ | PARTIAL | **W, C:** provide a complete two-turn serialized example with role/end markers, assistant targets, source/provenance, factual review, diversity/dedup checks, and the exact deployment-template match. The token-count example teaches masking, not demonstration construction. |
| `sft` | 2 | Implement assistant-only supervised loss | P | △ | △ | P | △ | PARTIAL | **M, W, C:** show a serialized system/user/tool-result/assistant sequence, shifted labels or `ignore_index`, and a per-token mask. Explain that all prior roles remain visible as inputs while only policy-designated assistant tokens score loss; reveal the actual mask. |
| `sft` | 3 | Diagnose imitation artifacts and capability regressions | P | P | P | P | △ | PARTIAL | **C:** give a controlled repair, not only causes: select/rollback a checkpoint, rebalance long answers, add concise counterexamples/base replay, lower update strength, and re-run fixed format, verbosity, completion-quality, and safety slices. |
| `preference-optimization` | 1 | Turn comparisons into a learning signal | P | P | P | P | P | PASS | — |
| `preference-optimization` | 2 | Explain DPO’s chosen/rejected and reference terms | P | P | △ | P | △ | PARTIAL | **W, C:** replace the verbosity-cleanup example with one numeric policy/reference log-probability gap. Reveal chosen minus rejected for both models and state the direction in which changing `beta` alters the strength of the reference/KL constraint under the course’s convention. |
| `preference-optimization` | 3 | Detect label bias, reward hacking, and over-optimization | P | P | P | P | P | PASS | — |
| `rl-fundamentals` | 1 | Model language generation as states, actions, rewards, and returns | P | P | △ | P | △ | PARTIAL | **W, C:** map a concrete code-solving episode: prompt/prefix state, token or test-tool action, transition, termination, terminal test reward, and return assigned to an early action. The `[1,1,0,0]` baseline example belongs to policy gradients. |
| `rl-fundamentals` | 2 | Explain policy gradients and credit assignment | P | P | P | P | P | PASS | — |
| `rl-fundamentals` | 3 | Separate online exploration from supervised imitation | P | P | P | P | P | PASS | — |
| `rlhf` | 1 | Trace the classic RLHF pipeline | P | P | △ | P | P | PARTIAL | **W:** add one prompt with two sampled responses, a human chosen/rejected label, the reward-model training artifact, an on-policy rollout score/advantage, and the KL-constrained policy update. The reward-hacking case is a later objective. |
| `rlhf` | 2 | Explain reward modeling, PPO-style updates, and KL control | P | P | △ | P | P | PARTIAL | **W:** work a small rollout with reward, baseline/advantage, old/new probability ratio and clipping, plus reference KL, so the learner can see which term solves which problem. The current exploit-repair fragment does not show these mechanisms. |
| `rlhf` | 3 | Diagnose reward hacking and evaluation blind spots | P | P | P | P | P | PASS | — |
| `tools-safety` | 1 | Represent tool calls as constrained actions | P | P | △ | P | △ | PARTIAL | **W, C:** provide a concrete email schema and proposed arguments, authorization decision, confirmation token, execution result, idempotency key/error, and recovery. The current example only states that email authority should be absent. |
| `tools-safety` | 2 | Design safety tuning around capabilities and threat models | P | P | P | P | P | PASS | — |
| `tools-safety` | 3 | Evaluate useful compliance, invalid actions, and over-refusal separately | P | P | P | P | P | PASS | — |
| `tulu3-case-study` | 1 | Trace Tülu 3 from curation through SFT, length-normalized DPO, and RLVR | P | P | △ | P | P | PARTIAL | **W:** extend the exact-arithmetic fragment into an end-to-end stage trace with one curated/SFT artifact, one length-normalized chosen/rejected pair, and one RLVR rollout/verifier result, plus the SFT-only and DPO controls. |
| `tulu3-case-study` | 2 | Explain how DR Tulu adds Qwen3, MCP tools, and evolving-rubric RL | P | P | P | P | P | PASS | — |
| `tulu3-case-study` | 3 | Choose exact verifiers, preferences, evolving rubrics, and runtime controls for different tasks | P | P | P | P | P | PASS | — |

## Inference, applications, safety, and specialization

| Lesson | # | Exact objective | E | M | W | B | C | Overall | Required revision for every non-pass |
|---|---:|---|:---:|:---:|:---:|:---:|:---:|---|---|
| `decoding-sampling` | 1 | Convert logits into controlled token choices | P | P | △ | P | F | PARTIAL | **W, C:** supply the promised four logits and a decoding policy; calculate stable softmax, filter/renormalize, select one token under a stated seed/rule, append it, and show the next context. A prompt cannot say “given four logits” without providing them. |
| `decoding-sampling` | 2 | Predict the effects of temperature, top-k, and top-p | P | P | P | P | △ | PARTIAL | **C:** reveal the changed-case result: top-k=2 keeps the 0.5 and 0.3 tokens; top-p=0.8 also keeps exactly those two under the stated inclusive convention; lower temperature sharpens their relative odds. |
| `decoding-sampling` | 3 | Match decoding policy to task and evaluation | P | P | △ | P | P | PARTIAL | **W:** add a three-row decision example: deterministic/schema-constrained extraction with exact validity, diverse seeded ideation with diversity/coherence, and multi-sample code generation selected by tests. The operation-order sentence is not a task-policy case. |
| `generation-kv-cache` | 1 | Trace prefill and decode phases | P | P | △ | P | △ | PARTIAL | **W, C:** resolve the 1,000+20 case: prefill processes 1,000 positions once and creates their K/V; each of 20 sequential decode steps computes one new token’s Q/K/V, appends K/V, and reads a growing cache of 1,000…1,019 positions. |
| `generation-kv-cache` | 2 | Compute how a KV cache avoids repeated attention work | P | △ | △ | P | △ | PARTIAL | **M, W, C:** quantify the contrast for a short generation: without cache, old layer projections/states are recomputed for every longer prefix; with cache, only the new token’s projections are computed while its query scores all stored keys. State the relevant projection and attention-growth counts or complexities. The current worked numbers calculate memory, not avoided work. |
| `generation-kv-cache` | 3 | Explain cache memory, batching, and context trade-offs | P | P | P | P | P | PASS | — |
| `quantization-memory` | 1 | Account for inference memory beyond parameter count | P | P | P | P | P | PASS | — |
| `quantization-memory` | 2 | Explain weight and activation quantization | P | P | P | P | P | PASS | — |
| `quantization-memory` | 3 | Choose precision using measured quality, speed, and hardware support | P | P | △ | P | F | PARTIAL | **W, C:** provide an 8-bit/4-bit benchmark table with latency, throughput, peak memory, rare-language/task deltas, and supported kernels, plus acceptance thresholds. Ask for a choice only after supplying evidence, then reveal the threshold-based decision and retry route. |
| `serving-systems` | 1 | Distinguish latency, throughput, utilization, and goodput | P | P | P | P | P | PASS | — |
| `serving-systems` | 2 | Explain static, dynamic, and continuous batching | P | P | △ | P | P | PARTIAL | **W:** replace the reused goodput arithmetic with a small arrival/decode timeline showing fixed-batch waiting/padding, dynamic collection delay, and continuous slot replacement as uneven sequences finish. |
| `serving-systems` | 3 | Design capacity and overload controls around an SLO | P | P | △ | P | △ | PARTIAL | **W, C:** give concrete interactive and batch SLOs, arrival rates, queue bounds, token/concurrency limits, rejection/degradation rules, and autoscaling thresholds. Reveal separate tier behavior rather than a generic list of controls. |
| `test-time-compute` | 1 | Explain how extra inference computation can improve outcomes | P | P | P | P | P | PASS | — |
| `test-time-compute` | 2 | Compare sampling, self-consistency, search, critique, and verifiers | P | P | △ | P | △ | PARTIAL | **W, C:** add matched cases covering all five methods. Reveal why exact math favors sampling plus an external verifier, while an open plan may use diverse candidates, critique/revision, or bounded search with a separately evaluated rubric; the current answer covers only voting and a calculator. |
| `test-time-compute` | 3 | Allocate reasoning budgets using value-of-compute evidence | P | P | P | P | P | PASS | — |
| `context-engineering` | 1 | Design prompts as complete information and control interfaces | P | P | P | P | P | PASS | — |
| `context-engineering` | 2 | Explain context priority, placement, and token budgets | P | P | △ | P | △ | PARTIAL | **W, C:** supply a token budget and sizes for instructions, history, and ten documents; work the keep/summarize/retrieve/drop decision while preserving source and trust labels. The current reveal discusses risk but never performs the prioritization. |
| `context-engineering` | 3 | Test prompts against variation, injection, and missing information | P | P | P | P | △ | PARTIAL | **C:** reveal observable pass criteria for every perturbation: required fields, `Not stated` on missing evidence, contradiction handling, citation support, injection non-execution, and stable output validity under reordering/length. |
| `rag` | 1 | Build a retrieval-augmented generation pipeline | P | P | P | P | P | PASS | — |
| `rag` | 2 | Choose chunking, embedding, retrieval, and reranking strategies | P | P | P | P | P | PASS | — |
| `rag` | 3 | Evaluate retrieval separately from grounded answer generation | P | P | P | P | P | PASS | — |
| `agent-loops` | 1 | Distinguish workflows from autonomous agent loops | P | P | P | P | △ | PARTIAL | **C:** explicitly classify both cases. The fixed three-step process is a workflow; open-ended research may justify a bounded agent because the next query depends on observations, with deterministic permissions/budgets around it. The reveal answers only the workflow half. |
| `agent-loops` | 2 | Design observe-decide-act transitions and termination | P | P | P | P | P | PASS | — |
| `agent-loops` | 3 | Contain tool errors, permissions, and runaway cost | P | P | △ | P | △ | PARTIAL | **W, C:** use the requested ambiguous timeout after a non-idempotent write. Show lookup by operation ID before retry, compensation/escalation if status is unknown, scoped permission, and token/time/money/repetition stops. The sold-out-search example is idempotent and does not resolve this failure. |
| `evaluation-design` | 1 | Turn product requirements into an evaluation portfolio | P | P | △ | P | △ | PARTIAL | **W, C:** replace the judge-position example with a support-product case: declare the ship decision, task-success/factual-support/safety/latency/cost measures, critical customer slices, failure severity, uncertainty, and an explicit release gate. |
| `evaluation-design` | 2 | Use deterministic, human, and model-based graders appropriately | P | P | P | P | P | PASS | — |
| `evaluation-design` | 3 | Measure uncertainty, slices, and regressions instead of one headline score | P | P | P | P | P | PASS | — |
| `security-privacy` | 1 | Threat-model an LLM application across data, model, tools, and users | P | P | P | P | P | PASS | — |
| `security-privacy` | 2 | Explain prompt injection and why prompting alone cannot solve it | P | P | P | P | P | PASS | — |
| `security-privacy` | 3 | Apply least privilege, data minimization, and layered controls | P | P | P | P | P | PASS | — |
| `observability-governance` | 1 | Design traces and metrics for an LLM production system | P | P | P | P | P | PASS | — |
| `observability-governance` | 2 | Attribute quality, latency, and cost to pipeline stages | P | P | P | P | P | PASS | — |
| `observability-governance` | 3 | Create release, incident, and governance controls tied to evidence | P | P | P | P | P | PASS | — |
| `distillation` | 1 | Explain response, logit, and feature distillation | P | P | P | P | P | PASS | — |
| `distillation` | 2 | Balance teacher quality, student capacity, and data coverage | P | P | △ | P | P | PARTIAL | **W:** replace the reused cat/dog soft-target fragment with a narrow-student data plan showing covered and missing domains, teacher error/confidence checks, student context/capacity limits, and the resulting transfer boundary. |
| `distillation` | 3 | Evaluate compression gains against cost and inherited errors | P | P | P | P | P | PASS | — |
| `lora` | 1 | Derive LoRA’s low-rank weight update | P | P | P | P | P | PASS | — |
| `lora` | 2 | Choose rank, target modules, and adapter deployment strategy | P | P | P | P | P | PASS | — |
| `lora` | 3 | Compare LoRA with full fine-tuning and quantized variants | P | △ | △ | P | △ | PARTIAL | **M, W, C:** add one comparison table for full tuning, LoRA, and QLoRA covering trainable parameters/optimizer state, base-weight storage, activation/backward compute, numerical risk, quality capacity, merging/routing, and measured hardware constraints. The current mechanism explains only QLoRA and the reveal never completes the three-way comparison. |
| `moe` | 1 | Explain sparse expert routing and top-k execution | P | P | △ | P | △ | PARTIAL | **W, C:** supply router logits/weights for one token, select top-2, show both expert outputs and their weighted sum, then add the result to the residual stream. The capacity arithmetic belongs to objective 2 and the check has no values to trace. |
| `moe` | 2 | Compute capacity and load-balancing constraints | P | P | P | P | P | PASS | — |
| `moe` | 3 | Separate parameter scale from active compute and serving cost | P | P | P | P | P | PASS | — |
| `multimodal-models` | 1 | Trace visual or audio inputs into a language-model token space | P | P | P | P | P | PASS | — |
| `multimodal-models` | 2 | Compare projection, cross-attention, and unified-token designs | P | P | △ | P | P | PARTIAL | **W:** replace the patch-count scaling fragment with one input represented three ways, showing where modality features live, which component reads them, sequence/memory implications, and one integration trade-off per design. |
| `multimodal-models` | 3 | Evaluate grounding and modality-specific failure modes | P | P | P | P | P | PASS | — |
| `interpretability-editing` | 1 | Distinguish behavioral, attribution, probing, and causal interpretability | P | P | △ | P | P | PARTIAL | **W:** use one sentiment case and show the distinct observation from output behavior, attribution, a 99% probe, and an intervention. The Eiffel activation-save fragment does not work through the four evidence types. |
| `interpretability-editing` | 2 | Use activation interventions to test hypotheses | P | P | P | P | P | PASS | — |
| `interpretability-editing` | 3 | Evaluate model edits for efficacy, specificity, generalization, and side effects | P | P | △ | P | P | PARTIAL | **W:** add a concrete edit result table for target prompts, paraphrases, neighboring facts, unrelated controls, adversarial contexts, and rollback, then compare with retrieval. The current worked fragment is activation patching, not model-edit evaluation. |

## Factual and prerequisite findings

No direct factual contradiction was found in the reviewed objective content. I rechecked the date-sensitive synthesis claims against Ai2’s primary OLMo 3, Tülu 3, and DR Tulu release materials on 14 July 2026. The stated OLMo 3 data stages and budgets (5.9T Dolma 3 Mix, 100B Dolmino, about 50B Longmino), up-to-1,024-H100 / 7.7K-token-per-device-second systems claim, Tülu 3 SFT→length-normalized DPO→RLVR flow, and DR Tulu Qwen3-8B / MCP / RLER description are supported by those sources:

- <https://allenai.org/blog/olmo3>
- <https://allenai.org/blog/tulu-3-technical>
- <https://github.com/allenai/open-instruct/blob/main/docs/tulu3.md>
- <https://allenai.org/blog/dr-tulu>

Three prerequisite leaks do need repair and are reflected in the grades:

1. `tensors-shapes` objective 3 uses “query rows” and “key columns” in its silent-broadcast example before attention or those roles are defined.
2. `probability-softmax` objective 2 introduces backpropagation and the unexplained expression `p-y` before the gradients lesson.
3. `embedding-layer` objective 2 relies on “attention and MLP blocks” before either mechanism is introduced; a beginner-safe local description is needed.

Several positional-encoding passages also use query/key language before the full attention lesson. Because the positional objectives themselves require discussing attention, this can be repaired locally with a two-sentence definition rather than by reordering the curriculum.

## Gate decision

Pass 1 remains **open**. Revise every △ and F dimension, then run another independent semantic pass. Re-running the structural test alone cannot close the gate: all 59 partial objectives already satisfy that test.


# Independent objective-coverage grade — pass 2

**Reviewed:** 14 July 2026  
**Scope:** all 132 current resolved `lessonObjectiveCoverage` records, not only the 59 keyed remediations  
**Result:** **129 PASS, 3 PARTIAL, 0 FAIL**

Pass 1 above is preserved as the historical baseline. For pass 2, I re-read every resolved record, all 59 keyed remediations, and the guide passages needed to judge teaching order and local prerequisite definitions. I did not promote an objective merely because it had an override or passed a structural test. Each row was judged again for a beginner-readable explanation (E), causal mechanism (M), executable worked reasoning (W), honest boundary (B), and committed, case-specific check with a useful retry (C).

## Pass-2 totals

| Level | PASS | PARTIAL | FAIL |
|---|---:|---:|---:|
| Objectives | **129** | **3** | **0** |

| Dimension | PASS | PARTIAL | FAIL |
|---|---:|---:|---:|
| E — explanation | **132** | **0** | **0** |
| M — mechanism | **130** | **2** | **0** |
| W — worked case | **131** | **1** | **0** |
| B — boundary | **132** | **0** | **0** |
| C — committed check/retry | **131** | **1** | **0** |

Of the 59 pass-1 partial objectives with keyed remediations, **56 now pass** and **3 remain partial**. All **73 pass-1 PASS** rows were independently reconfirmed. The two pass-1 failed checks (`decoding-sampling#1` and `quantization-memory#3`) now pass because their inputs and decision evidence are explicit.

## Pass-2 row-by-row disposition

The exact objective text is repeated so this table can be audited without assuming array position. “Pass-1 result independently reconfirmed” means the row was re-read, not carried forward automatically.

| Lesson | # | Exact objective (as graded in pass 1) | E | M | W | B | C | Pass-2 result | Row-by-row disposition |
|---|---:|---|:---:|:---:|:---:|:---:|:---:|---|---|
| `introduction` | 1 | Describe an LLM as a conditional next-token model | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `introduction` | 2 | Separate training, inference, decoding, and post-training | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `introduction` | 3 | Explain why fluent output can still be wrong | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `tensors-shapes` | 1 | Read common LLM tensor shapes without guessing | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `tensors-shapes` | 2 | Predict the output of a matrix multiplication | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `tensors-shapes` | 3 | Explain broadcasting and why silent shape errors are dangerous | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `probability-softmax` | 1 | Convert logits into probabilities conceptually and numerically | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `probability-softmax` | 2 | Interpret cross-entropy as surprise assigned to the target | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `probability-softmax` | 3 | Distinguish entropy, cross-entropy, perplexity, and calibration | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `gradients-backprop` | 1 | Trace a forward and backward computation graph | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `gradients-backprop` | 2 | Apply the chain rule to a simple parameter | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `gradients-backprop` | 3 | Explain why backpropagation and optimization are separate | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `optimizers` | 1 | Turn a gradient into an explicit parameter update | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `optimizers` | 2 | Compare SGD, momentum, Adam, and AdamW conceptually | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `optimizers` | 3 | Diagnose learning-rate and optimizer-state problems | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `tokenization` | 1 | Explain why models use tokens instead of raw words | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `tokenization` | 2 | Trace encode and decode through a subword vocabulary | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `tokenization` | 3 | Predict how tokenization affects cost, languages, and model behavior | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `embedding-layer` | 1 | Explain an embedding lookup as a learned table row | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `embedding-layer` | 2 | Distinguish static token embeddings from contextual hidden states | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `embedding-layer` | 3 | Interpret similarity cautiously in a high-dimensional space | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `positional-encoding` | 1 | Explain why content-only attention cannot determine order | P | △ | P | P | P | PARTIAL | Worked/check repair verified; M reopened because query/key are defined only after their first mechanism use. |
| `positional-encoding` | 2 | Compare absolute, relative, and rotary position signals | P | △ | P | P | P | PARTIAL | Worked/check repair verified; M reopened because query/key are defined only after their first mechanism use. |
| `positional-encoding` | 3 | Describe how position design affects long-context behavior | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `attention` | 1 | Trace query-key-value attention from shapes to weighted output | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `attention` | 2 | Explain causal masking and multi-head specialization | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `attention` | 3 | Avoid treating attention weights as complete explanations | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `layers-of-understanding` | 1 | Trace data through a pre-norm Transformer block | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `layers-of-understanding` | 2 | Explain residual streams and MLP contributions | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `layers-of-understanding` | 3 | Describe why capabilities emerge across layers rather than one location | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `learning-to-predict` | 1 | Construct shifted input-target pairs for causal language modeling | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `learning-to-predict` | 2 | Explain teacher forcing and parallel token loss | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `learning-to-predict` | 3 | Connect token loss to gradients without confusing prediction with truth | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `gpt2-from-scratch` | 1 | Trace every major tensor through a decoder-only Transformer | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `gpt2-from-scratch` | 2 | Separate enduring GPT design ideas from implementation-era choices | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `gpt2-from-scratch` | 3 | Design and debug a tiny end-to-end training run | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `pretraining-overview` | 1 | Explain what a base model learns during pre-training | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `pretraining-overview` | 2 | Trace one batch through the training loop | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `pretraining-overview` | 3 | Identify the main sources of cost and failure | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `objectives-details` | 1 | Derive causal next-token loss from shifted sequences | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `objectives-details` | 2 | Explain why masking and architecture must agree | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `objectives-details` | 3 | Relate normalization, residuals, and initialization to trainability | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `scaling-laws` | 1 | Interpret empirical scaling curves without treating them as physical laws | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `scaling-laws` | 2 | Balance parameters, tokens, and compute | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `scaling-laws` | 3 | Diagnose optimization choices that can invalidate a scaling experiment | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `data-engineering` | 1 | Design a governed text-data pipeline | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `data-engineering` | 2 | Explain deduplication, filtering, and mixture trade-offs | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `data-engineering` | 3 | Prevent contamination and document data lineage | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `infrastructure` | 1 | Explain data, tensor, pipeline, and sequence parallelism | P | P | △ | P | △ | PARTIAL | Comparison expanded, but W/C still blur or omit replicated state for pipeline and sequence parallelism. |
| `infrastructure` | 2 | Connect communication patterns to performance | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `infrastructure` | 3 | Design failure recovery and numerical monitoring | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `advanced-objectives` | 1 | Compare causal, masked, span-corruption, and infilling objectives | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `advanced-objectives` | 2 | Explain when auxiliary objectives help or conflict | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `advanced-objectives` | 3 | Choose an objective that matches the desired interface | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `pretraining-evaluation` | 1 | Distinguish training diagnostics from capability evaluations | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `pretraining-evaluation` | 2 | Design clean, reproducible benchmark protocols | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `pretraining-evaluation` | 3 | Use learning curves to make stop, continue, or repair decisions | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `olmo3-case-study` | 1 | Trace Dolma 3 Mix → Dolmino → Longmino through the OLMo 3 model flow | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `olmo3-case-study` | 2 | Connect concrete data, systems, objective, and evaluation decisions to earlier lessons | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `olmo3-case-study` | 3 | Design a controlled stage-level ablation using open checkpoints | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `posttraining-overview` | 1 | Explain why a capable base model is not yet a useful assistant | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `posttraining-overview` | 2 | Map the stages of a post-training pipeline | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `posttraining-overview` | 3 | Recognize capability, behavior, and safety trade-offs | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `instruction-tuning-rlhf` | 1 | Connect base-model pre-training to assistant post-training | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `instruction-tuning-rlhf` | 2 | Distinguish SFT, preference optimization, RL, and tool/safety tuning | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `instruction-tuning-rlhf` | 3 | Select the minimum training stage for a behavior gap | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `sft` | 1 | Construct high-quality conversational demonstrations | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `sft` | 2 | Implement assistant-only supervised loss | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `sft` | 3 | Diagnose imitation artifacts and capability regressions | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `preference-optimization` | 1 | Turn comparisons into a learning signal | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `preference-optimization` | 2 | Explain DPO’s chosen/rejected and reference terms | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `preference-optimization` | 3 | Detect label bias, reward hacking, and over-optimization | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `rl-fundamentals` | 1 | Model language generation as states, actions, rewards, and returns | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `rl-fundamentals` | 2 | Explain policy gradients and credit assignment | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `rl-fundamentals` | 3 | Separate online exploration from supervised imitation | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `rlhf` | 1 | Trace the classic RLHF pipeline | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `rlhf` | 2 | Explain reward modeling, PPO-style updates, and KL control | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `rlhf` | 3 | Diagnose reward hacking and evaluation blind spots | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `tools-safety` | 1 | Represent tool calls as constrained actions | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `tools-safety` | 2 | Design safety tuning around capabilities and threat models | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `tools-safety` | 3 | Evaluate useful compliance, invalid actions, and over-refusal separately | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `tulu3-case-study` | 1 | Trace Tülu 3 from curation through SFT, length-normalized DPO, and RLVR | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `tulu3-case-study` | 2 | Explain how DR Tulu adds Qwen3, MCP tools, and evolving-rubric RL | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `tulu3-case-study` | 3 | Choose exact verifiers, preferences, evolving rubrics, and runtime controls for different tasks | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `decoding-sampling` | 1 | Convert logits into controlled token choices | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `decoding-sampling` | 2 | Predict the effects of temperature, top-k, and top-p | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `decoding-sampling` | 3 | Match decoding policy to task and evaluation | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `generation-kv-cache` | 1 | Trace prefill and decode phases | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `generation-kv-cache` | 2 | Compute how a KV cache avoids repeated attention work | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `generation-kv-cache` | 3 | Explain cache memory, batching, and context trade-offs | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `quantization-memory` | 1 | Account for inference memory beyond parameter count | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `quantization-memory` | 2 | Explain weight and activation quantization | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `quantization-memory` | 3 | Choose precision using measured quality, speed, and hardware support | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `serving-systems` | 1 | Distinguish latency, throughput, utilization, and goodput | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `serving-systems` | 2 | Explain static, dynamic, and continuous batching | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `serving-systems` | 3 | Design capacity and overload controls around an SLO | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `test-time-compute` | 1 | Explain how extra inference computation can improve outcomes | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `test-time-compute` | 2 | Compare sampling, self-consistency, search, critique, and verifiers | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `test-time-compute` | 3 | Allocate reasoning budgets using value-of-compute evidence | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `context-engineering` | 1 | Design prompts as complete information and control interfaces | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `context-engineering` | 2 | Explain context priority, placement, and token budgets | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `context-engineering` | 3 | Test prompts against variation, injection, and missing information | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `rag` | 1 | Build a retrieval-augmented generation pipeline | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `rag` | 2 | Choose chunking, embedding, retrieval, and reranking strategies | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `rag` | 3 | Evaluate retrieval separately from grounded answer generation | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `agent-loops` | 1 | Distinguish workflows from autonomous agent loops | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `agent-loops` | 2 | Design observe-decide-act transitions and termination | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `agent-loops` | 3 | Contain tool errors, permissions, and runaway cost | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `evaluation-design` | 1 | Turn product requirements into an evaluation portfolio | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `evaluation-design` | 2 | Use deterministic, human, and model-based graders appropriately | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `evaluation-design` | 3 | Measure uncertainty, slices, and regressions instead of one headline score | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `security-privacy` | 1 | Threat-model an LLM application across data, model, tools, and users | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `security-privacy` | 2 | Explain prompt injection and why prompting alone cannot solve it | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `security-privacy` | 3 | Apply least privilege, data minimization, and layered controls | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `observability-governance` | 1 | Design traces and metrics for an LLM production system | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `observability-governance` | 2 | Attribute quality, latency, and cost to pipeline stages | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `observability-governance` | 3 | Create release, incident, and governance controls tied to evidence | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `distillation` | 1 | Explain response, logit, and feature distillation | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `distillation` | 2 | Balance teacher quality, student capacity, and data coverage | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `distillation` | 3 | Evaluate compression gains against cost and inherited errors | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `lora` | 1 | Derive LoRA’s low-rank weight update | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `lora` | 2 | Choose rank, target modules, and adapter deployment strategy | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `lora` | 3 | Compare LoRA with full fine-tuning and quantized variants | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `moe` | 1 | Explain sparse expert routing and top-k execution | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `moe` | 2 | Compute capacity and load-balancing constraints | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `moe` | 3 | Separate parameter scale from active compute and serving cost | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `multimodal-models` | 1 | Trace visual or audio inputs into a language-model token space | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `multimodal-models` | 2 | Compare projection, cross-attention, and unified-token designs | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `multimodal-models` | 3 | Evaluate grounding and modality-specific failure modes | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `interpretability-editing` | 1 | Distinguish behavioral, attribution, probing, and causal interpretability | P | P | P | P | P | PASS | PASS — keyed remediation verified. |
| `interpretability-editing` | 2 | Use activation interventions to test hypotheses | P | P | P | P | P | PASS | PASS — pass-1 result independently reconfirmed. |
| `interpretability-editing` | 3 | Evaluate model edits for efficacy, specificity, generalization, and side effects | P | P | P | P | P | PASS | PASS — keyed remediation verified. |

## Remaining partials and exact repairs

1. **`positional-encoding#1` — “Explain why content-only attention cannot determine order” (M).** The resolved mechanism first says that self-attention compares token-derived “queries and keys”; those terms are not defined in the lesson vocabulary and are defined only at the end of the later worked example. Because the mechanism is rendered before the example and the attention lesson follows this lesson, the definitions arrive after first use. **Exact repair:** begin this objective’s mechanism with: “A query is a vector describing what the current position is looking for; a key is a vector describing what each candidate position offers for matching.” Then retain the current permutation-equivariance explanation.

2. **`positional-encoding#2` — “Compare absolute, relative, and rotary position signals” (M).** Its independently rendered mechanism uses “queries,” “keys,” query-key coordinates, and their dot product before defining either role. The definition at the end of the replacement worked example is too late. **Exact repair:** put the same local query/key definitions at the beginning of this objective’s mechanism, then explain, for each design, the input, where the position transformation enters, and the resulting score or representation. Do not rely on objective 1’s card having been expanded.

3. **`infrastructure#1` — “Explain data, tensor, pipeline, and sequence parallelism” (W, C).** The comparison is substantially better, but “replicates stage-local execution across microbatches” is not a valid replicated object: pipeline stages own layer partitions and schedule microbatches through them. The expected answer also omits the “what remains replicated” cell for pipeline and sequence parallelism even though the retry explicitly requires that cell for every method. **Exact repair:** use a scoped four-column table for one named/common implementation. For pipeline parallelism, say that layer weights are partitioned by stage, each stage retains only its assigned weights, microbatches are scheduled (not replicated), and activations/backward gradients cross stage boundaries. For Megatron-style sequence parallelism, say that token-axis LayerNorm/dropout activations are partitioned while the relevant small parameters remain present across the tensor-parallel group and their gradients are reduced; distinguish this from context parallelism, which partitions all activations along sequence length. Make the expected answer fill partitioned object, retained/replicated object, communication, and benefit for all four methods.

The infrastructure distinction was checked against NVIDIA’s official [Megatron Core parallelism guide](https://docs.nvidia.com/megatron-core/developer-guide/latest/user-guide/parallelism-guide.html) and [context-parallel documentation](https://docs.nvidia.com/megatron-core/developer-guide/latest/user-guide/features/context_parallel.html).

## Accuracy, evidence, and prerequisite disposition

No additional contradiction or unlabeled fabricated measurement was found outside the infrastructure wording graded partial above. New numerical values are either inspectable arithmetic inputs, explicitly labeled teaching/decision fixtures, or predeclared evaluation gates; they are not presented as model or hardware measurements. The earlier tensor, probability, and embedding prerequisite leaks are repaired in the resolved records. The remaining two prerequisite-order defects are the positional query/key definitions listed above.

## Pass-2 gate decision

Pass 2 remains **open** with exactly three partial objectives and no fails. Repair the four remaining partial dimensions (two M, one W, one C), then request a targeted independent pass. Structural test success remains necessary evidence of record completeness, not semantic proof.


# Independent objective-coverage grade — pass 3

**Reviewed:** 14 July 2026  
**Scope:** all 132 current resolved `lessonObjectiveCoverage` records across E/M/W/B/C  
**Result:** **132 PASS, 0 PARTIAL, 0 FAIL**

Passes 1 and 2 above remain the audit history. Pass 3 regraded every current resolved objective, not only the three pass-2 partials. I rechecked the explanation, causal mechanism, worked reasoning, boundary, committed expected reasoning, retry route, local prerequisite order, and evidence labels for every row. No prior PASS regressed.

## Pass-3 totals

| Level | PASS | PARTIAL | FAIL |
|---|---:|---:|---:|
| Objectives | **132** | **0** | **0** |

| Dimension | PASS | PARTIAL | FAIL |
|---|---:|---:|---:|
| E — explanation | **132** | **0** | **0** |
| M — mechanism | **132** | **0** | **0** |
| W — worked case | **132** | **0** | **0** |
| B — boundary | **132** | **0** | **0** |
| C — committed check/retry | **132** | **0** | **0** |

## Learner-visible merge and targeted repair findings

The override merge is learner-visible. `lessonObjectiveCoverage` constructs each base record, applies the keyed remediation, and exports the resolved record. `LessonGuideView` imports that resolved map and renders each objective card in this order: plain explanation → mechanism → worked trace → boundary → committed check → expected reasoning/retry. Runtime extraction of the three repaired records confirms the rendered fields contain the new override text rather than the older guide pointer content.

- **`positional-encoding#1` now passes M.** Its mechanism begins by defining query, key, and value before relying on them. It then names the input transformation, traces how reordering permutes query/key/value vectors, score-table axes, and outputs, names permutation equivariance, and explains why the absence of index/direction information prevents recovering which content came first. The mechanism is understandable without expanding another objective card or waiting for the later attention lesson.
- **`positional-encoding#2` now passes M.** Its standalone mechanism defines query and key first. It then distinguishes all three designs with explicit inputs, insertion points, transformations, and outputs: $x_i+p_i$ before query/key projections for absolute encoding; an $i-j$ bias in the query-key score before softmax for relative bias; and index-dependent coordinate rotations after query/key projection but before their dot product for RoPE. It closes with the exact comparison the objective promises.
- **`infrastructure#1` now passes W and C.** The worked comparison explicitly scopes the four axes in isolation. Every method names the partitioned object, retained/replicated object, communication, benefit, and an important cost where relevant. Pipeline microbatches are scheduled rather than described as replicated execution, and a pipeline stage retains only its assigned layer weights along that axis. Megatron-style sequence parallelism is accurately limited to the token axis of selected LayerNorm/dropout activations, with the corresponding small parameters present across tensor-parallel ranks and their gradients reduced. The text separately identifies context parallelism as partitioning all layer activations along sequence length and communicating the key/value information required by attention. The distinction remains consistent with NVIDIA’s official [Megatron Core parallelism guide](https://docs.nvidia.com/megatron-core/developer-guide/latest/user-guide/parallelism-guide.html) and [context-parallel documentation](https://docs.nvidia.com/megatron-core/developer-guide/latest/user-guide/features/context_parallel.html).

No new contradiction, prerequisite leak, or unlabeled fabricated measurement was found. Numerical teaching values remain inspectable arithmetic, explicitly declared fixtures, or predeclared decision gates rather than claimed external measurements.

## Pass-3 row-by-row disposition

| Lesson | # | Exact objective | E | M | W | B | C | Pass-3 result | Row-by-row disposition |
|---|---:|---|:---:|:---:|:---:|:---:|:---:|---|---|
| `introduction` | 1 | Describe an LLM as a conditional next-token model | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `introduction` | 2 | Separate training, inference, decoding, and post-training | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `introduction` | 3 | Explain why fluent output can still be wrong | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `tensors-shapes` | 1 | Read common LLM tensor shapes without guessing | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `tensors-shapes` | 2 | Predict the output of a matrix multiplication | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `tensors-shapes` | 3 | Explain broadcasting and why silent shape errors are dangerous | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `probability-softmax` | 1 | Convert logits into probabilities conceptually and numerically | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `probability-softmax` | 2 | Interpret cross-entropy as surprise assigned to the target | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `probability-softmax` | 3 | Distinguish entropy, cross-entropy, perplexity, and calibration | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `gradients-backprop` | 1 | Trace a forward and backward computation graph | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `gradients-backprop` | 2 | Apply the chain rule to a simple parameter | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `gradients-backprop` | 3 | Explain why backpropagation and optimization are separate | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `optimizers` | 1 | Turn a gradient into an explicit parameter update | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `optimizers` | 2 | Compare SGD, momentum, Adam, and AdamW conceptually | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `optimizers` | 3 | Diagnose learning-rate and optimizer-state problems | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `tokenization` | 1 | Explain why models use tokens instead of raw words | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `tokenization` | 2 | Trace encode and decode through a subword vocabulary | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `tokenization` | 3 | Predict how tokenization affects cost, languages, and model behavior | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `embedding-layer` | 1 | Explain an embedding lookup as a learned table row | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `embedding-layer` | 2 | Distinguish static token embeddings from contextual hidden states | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `embedding-layer` | 3 | Interpret similarity cautiously in a high-dimensional space | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `positional-encoding` | 1 | Explain why content-only attention cannot determine order | P | P | P | P | P | PASS | PASS — query/key/value are defined before use; the permutation-equivariance mechanism is complete. |
| `positional-encoding` | 2 | Compare absolute, relative, and rotary position signals | P | P | P | P | P | PASS | PASS — standalone definitions precede input → insertion point → output comparisons for all three designs. |
| `positional-encoding` | 3 | Describe how position design affects long-context behavior | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `attention` | 1 | Trace query-key-value attention from shapes to weighted output | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `attention` | 2 | Explain causal masking and multi-head specialization | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `attention` | 3 | Avoid treating attention weights as complete explanations | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `layers-of-understanding` | 1 | Trace data through a pre-norm Transformer block | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `layers-of-understanding` | 2 | Explain residual streams and MLP contributions | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `layers-of-understanding` | 3 | Describe why capabilities emerge across layers rather than one location | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `learning-to-predict` | 1 | Construct shifted input-target pairs for causal language modeling | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `learning-to-predict` | 2 | Explain teacher forcing and parallel token loss | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `learning-to-predict` | 3 | Connect token loss to gradients without confusing prediction with truth | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `gpt2-from-scratch` | 1 | Trace every major tensor through a decoder-only Transformer | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `gpt2-from-scratch` | 2 | Separate enduring GPT design ideas from implementation-era choices | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `gpt2-from-scratch` | 3 | Design and debug a tiny end-to-end training run | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `pretraining-overview` | 1 | Explain what a base model learns during pre-training | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `pretraining-overview` | 2 | Trace one batch through the training loop | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `pretraining-overview` | 3 | Identify the main sources of cost and failure | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `objectives-details` | 1 | Derive causal next-token loss from shifted sequences | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `objectives-details` | 2 | Explain why masking and architecture must agree | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `objectives-details` | 3 | Relate normalization, residuals, and initialization to trainability | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `scaling-laws` | 1 | Interpret empirical scaling curves without treating them as physical laws | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `scaling-laws` | 2 | Balance parameters, tokens, and compute | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `scaling-laws` | 3 | Diagnose optimization choices that can invalidate a scaling experiment | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `data-engineering` | 1 | Design a governed text-data pipeline | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `data-engineering` | 2 | Explain deduplication, filtering, and mixture trade-offs | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `data-engineering` | 3 | Prevent contamination and document data lineage | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `infrastructure` | 1 | Explain data, tensor, pipeline, and sequence parallelism | P | P | P | P | P | PASS | PASS — scoped four-way comparison is accurate and fills partition/retention/communication/benefit, with context parallelism distinguished. |
| `infrastructure` | 2 | Connect communication patterns to performance | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `infrastructure` | 3 | Design failure recovery and numerical monitoring | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `advanced-objectives` | 1 | Compare causal, masked, span-corruption, and infilling objectives | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `advanced-objectives` | 2 | Explain when auxiliary objectives help or conflict | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `advanced-objectives` | 3 | Choose an objective that matches the desired interface | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `pretraining-evaluation` | 1 | Distinguish training diagnostics from capability evaluations | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `pretraining-evaluation` | 2 | Design clean, reproducible benchmark protocols | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `pretraining-evaluation` | 3 | Use learning curves to make stop, continue, or repair decisions | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `olmo3-case-study` | 1 | Trace Dolma 3 Mix → Dolmino → Longmino through the OLMo 3 model flow | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `olmo3-case-study` | 2 | Connect concrete data, systems, objective, and evaluation decisions to earlier lessons | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `olmo3-case-study` | 3 | Design a controlled stage-level ablation using open checkpoints | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `posttraining-overview` | 1 | Explain why a capable base model is not yet a useful assistant | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `posttraining-overview` | 2 | Map the stages of a post-training pipeline | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `posttraining-overview` | 3 | Recognize capability, behavior, and safety trade-offs | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `instruction-tuning-rlhf` | 1 | Connect base-model pre-training to assistant post-training | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `instruction-tuning-rlhf` | 2 | Distinguish SFT, preference optimization, RL, and tool/safety tuning | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `instruction-tuning-rlhf` | 3 | Select the minimum training stage for a behavior gap | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `sft` | 1 | Construct high-quality conversational demonstrations | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `sft` | 2 | Implement assistant-only supervised loss | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `sft` | 3 | Diagnose imitation artifacts and capability regressions | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `preference-optimization` | 1 | Turn comparisons into a learning signal | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `preference-optimization` | 2 | Explain DPO’s chosen/rejected and reference terms | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `preference-optimization` | 3 | Detect label bias, reward hacking, and over-optimization | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `rl-fundamentals` | 1 | Model language generation as states, actions, rewards, and returns | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `rl-fundamentals` | 2 | Explain policy gradients and credit assignment | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `rl-fundamentals` | 3 | Separate online exploration from supervised imitation | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `rlhf` | 1 | Trace the classic RLHF pipeline | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `rlhf` | 2 | Explain reward modeling, PPO-style updates, and KL control | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `rlhf` | 3 | Diagnose reward hacking and evaluation blind spots | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `tools-safety` | 1 | Represent tool calls as constrained actions | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `tools-safety` | 2 | Design safety tuning around capabilities and threat models | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `tools-safety` | 3 | Evaluate useful compliance, invalid actions, and over-refusal separately | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `tulu3-case-study` | 1 | Trace Tülu 3 from curation through SFT, length-normalized DPO, and RLVR | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `tulu3-case-study` | 2 | Explain how DR Tulu adds Qwen3, MCP tools, and evolving-rubric RL | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `tulu3-case-study` | 3 | Choose exact verifiers, preferences, evolving rubrics, and runtime controls for different tasks | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `decoding-sampling` | 1 | Convert logits into controlled token choices | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `decoding-sampling` | 2 | Predict the effects of temperature, top-k, and top-p | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `decoding-sampling` | 3 | Match decoding policy to task and evaluation | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `generation-kv-cache` | 1 | Trace prefill and decode phases | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `generation-kv-cache` | 2 | Compute how a KV cache avoids repeated attention work | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `generation-kv-cache` | 3 | Explain cache memory, batching, and context trade-offs | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `quantization-memory` | 1 | Account for inference memory beyond parameter count | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `quantization-memory` | 2 | Explain weight and activation quantization | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `quantization-memory` | 3 | Choose precision using measured quality, speed, and hardware support | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `serving-systems` | 1 | Distinguish latency, throughput, utilization, and goodput | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `serving-systems` | 2 | Explain static, dynamic, and continuous batching | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `serving-systems` | 3 | Design capacity and overload controls around an SLO | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `test-time-compute` | 1 | Explain how extra inference computation can improve outcomes | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `test-time-compute` | 2 | Compare sampling, self-consistency, search, critique, and verifiers | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `test-time-compute` | 3 | Allocate reasoning budgets using value-of-compute evidence | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `context-engineering` | 1 | Design prompts as complete information and control interfaces | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `context-engineering` | 2 | Explain context priority, placement, and token budgets | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `context-engineering` | 3 | Test prompts against variation, injection, and missing information | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `rag` | 1 | Build a retrieval-augmented generation pipeline | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `rag` | 2 | Choose chunking, embedding, retrieval, and reranking strategies | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `rag` | 3 | Evaluate retrieval separately from grounded answer generation | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `agent-loops` | 1 | Distinguish workflows from autonomous agent loops | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `agent-loops` | 2 | Design observe-decide-act transitions and termination | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `agent-loops` | 3 | Contain tool errors, permissions, and runaway cost | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `evaluation-design` | 1 | Turn product requirements into an evaluation portfolio | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `evaluation-design` | 2 | Use deterministic, human, and model-based graders appropriately | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `evaluation-design` | 3 | Measure uncertainty, slices, and regressions instead of one headline score | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `security-privacy` | 1 | Threat-model an LLM application across data, model, tools, and users | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `security-privacy` | 2 | Explain prompt injection and why prompting alone cannot solve it | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `security-privacy` | 3 | Apply least privilege, data minimization, and layered controls | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `observability-governance` | 1 | Design traces and metrics for an LLM production system | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `observability-governance` | 2 | Attribute quality, latency, and cost to pipeline stages | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `observability-governance` | 3 | Create release, incident, and governance controls tied to evidence | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `distillation` | 1 | Explain response, logit, and feature distillation | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `distillation` | 2 | Balance teacher quality, student capacity, and data coverage | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `distillation` | 3 | Evaluate compression gains against cost and inherited errors | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `lora` | 1 | Derive LoRA’s low-rank weight update | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `lora` | 2 | Choose rank, target modules, and adapter deployment strategy | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `lora` | 3 | Compare LoRA with full fine-tuning and quantized variants | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `moe` | 1 | Explain sparse expert routing and top-k execution | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `moe` | 2 | Compute capacity and load-balancing constraints | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `moe` | 3 | Separate parameter scale from active compute and serving cost | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `multimodal-models` | 1 | Trace visual or audio inputs into a language-model token space | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `multimodal-models` | 2 | Compare projection, cross-attention, and unified-token designs | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `multimodal-models` | 3 | Evaluate grounding and modality-specific failure modes | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `interpretability-editing` | 1 | Distinguish behavioral, attribution, probing, and causal interpretability | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `interpretability-editing` | 2 | Use activation interventions to test hypotheses | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |
| `interpretability-editing` | 3 | Evaluate model edits for efficacy, specificity, generalization, and side effects | P | P | P | P | P | PASS | PASS — pass-2 PASS independently regraded; no semantic regression. |

## Pass-3 gate decision

The independent semantic objective-coverage gate is **closed: 132/132 objectives PASS with all 660 E/M/W/B/C dimensions passing**. There are no remaining objective-level repairs from this audit.

The structural test was necessary because it verifies the 44-lesson/132-objective join, exact objective text, unique committed checks, required field presence, remediation-key coverage, and selected regression invariants. It was not sufficient to close this gate: string length and regex assertions cannot decide whether a mechanism is causally complete, a worked case is executable, a boundary is honest, terminology is introduced before use, a retry is diagnostically useful, or a systems claim is technically accurate. Those judgments required the independent row-by-row semantic review recorded here.
