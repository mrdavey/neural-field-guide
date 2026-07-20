# Lesson objective coverage review

Reviewed: 17 July 2026

Scope: all five released courses — 182 lessons and 408 exact visible outcomes

| Course | Lessons | Exact objectives | Final independent semantic gate |
| --- | ---: | ---: | --- |
| Large Language Models | 44 | 132 | 132 pass, 0 partial, 0 fail |
| World Models | 46 | 92 | 92 pass, 0 partial, 0 fail |
| Generative Models | 30 | 60 | 60 pass, 0 partial, 0 fail |
| Reinforcement Learning & Control | 32 | 64 | 64 pass, 0 partial, 0 fail |
| Embodied AI | 30 | 60 | 60 pass, 0 partial, 0 fail |
| **Program** | **182** | **408** | **408 pass, 0 partial, 0 fail** |

## What changed

Every lesson outcome has an explicit record in its course registry. The LLM records live in `app/lesson-objective-coverage.ts`; World Models and the three research courses own equivalent course-specific records. Each record is joined to the exact objective text and contains five required teaching dimensions:

1. a plain-language explanation;
2. the causal mechanism or decision process;
3. a concrete worked trace, calculation, or scenario;
4. a boundary, failure case, or misconception;
5. an observable check with expected reasoning and a retry route.

The lesson renderer places this sequence immediately after each visible outcome. A learner must write and commit an explanation before expected reasoning appears. Existing long-form sections, guided examples, changed-case practice, and deterministic transfer labs remain later in the lesson, so the objective sequence is a map into deeper teaching rather than a replacement for it.

The course-specific curriculum tests load the real TypeScript registries and fail when a lesson is missing, objective text/order diverges, a coverage field is empty, a check is reused, or an exact count changes. The LLM resolver also fails at application startup on unknown lessons, missing objectives, duplicate indices, empty source lists, or out-of-range content pointers. These checks protect structure; they do not award the semantic grades summarized above.

## Review standard

A mention does not count as coverage. An outcome is ready for grading only when its record lets a learner answer all of these questions:

- What does this mean in ordinary language?
- Given named inputs, what changes them into which outputs, or which evidence drives the decision?
- Can I follow at least one case with real shapes, values, tokens, stages, or operational constraints?
- Where does the explanation fail, become unsafe, or stop supporting the claim?
- What must I produce without seeing the answer, and where do I return after an incorrect or incomplete attempt?

The `3/3` entries in the LLM inventory below mean three explicit records exist and exactly join the three source objectives. They are an inventory, not a claim that automated structure checks can replace an independent content grader. The other courses use two exact records per lesson and keep their executable inventories in their course registries and tests.

## Remediation pass 1

The first independent semantic grade found 73 complete objectives and 59 partial objectives. Structure was already complete; the partials were semantic gaps: a related example used in place of the promised trace, a generic reveal that did not answer the changed case, missing input evidence, or a mechanism that relied on vocabulary taught later.

Remediation pass 1 adds one keyed, independently authored override for each of those 59 objectives. The override changes only the dimensions the grader identified:

- 7 mechanisms now state the exact inputs, transformation/decision process, and output without relying on later-course vocabulary;
- 41 worked examples now contain the required values, shapes, token IDs, stage artifacts, timelines, evidence tables, or case results;
- 41 checks now reveal an answer to the exact changed case and point to a concrete reconstruction strategy for retry;
- all three prerequisite leaks were repaired in both the objective record and the underlying guide prose/practice;
- decoding now supplies the four promised logits and works stable softmax through selection and the next context;
- quantization now supplies a clearly labelled decision fixture with latency, throughput, memory, quality deltas, kernel support, acceptance gates, and a threshold-based choice. The values are a teaching scenario, not a claimed course hardware measurement;
- the objective-check button now has a 44px minimum touch target after narrow-screen QA measured the prior control at 41px.

At the end of pass 1, the focused test locked the exact 59-key remediation set, the 7/41/41 dimension assignments, the two formerly missing-evidence cases, and the prerequisite-leak repairs. This is still an authoring record rather than a self-awarded semantic pass; the independent grader must re-grade all 132 resolved records and may reopen any objective whose revised content remains incomplete.

## Remediation pass 2

The second independent semantic grade found 129 complete objectives and three remaining partial objectives. This authoring pass repairs only those three dimensions:

- both positional-encoding mechanisms now define query and key before first use and stand alone; the comparison explicitly names each design’s input, insertion point, and changed representation or score;
- the infrastructure trace now describes pipeline stages as owners of assigned layer weights with scheduled microbatches, rather than calling stage-local execution replicated;
- the infrastructure trace and expected answer distinguish Megatron-style sequence parallelism for selected LayerNorm/dropout activations from context parallelism across all layer activations;
- the four parallelism answers now use the same observable schema: partitioned object, retained or replicated object, communication, and benefit.

Focused assertions lock these three repairs, including query/key definition order, the position-design comparison fields, pipeline ownership and scheduling, and the sequence-versus-context boundary. The independent grader must still perform the next semantic pass; this review does not award its own pass.

## Independent gate closure

The independent grader completed three full semantic passes over all 44 lessons and all 132 exact objectives. Pass 1 found 73 complete and 59 partial objectives. After the first remediation, pass 2 found 129 complete and three partial objectives. After the targeted second remediation, pass 3 found **132 pass, 0 partial, and 0 fail**. Each of the five dimensions passed for every objective: 132 explanations, 132 mechanisms, 132 worked examples, 132 boundaries, and 132 committed checks with expected reasoning and retry routes.

The remediation history below records the findings needed to understand the final decision; superseded row-by-row snapshots were removed so this file remains the canonical objective-review record. This result closes the current review; it is not a permanent score. Any future objective, guide, example, assessment, prerequisite, or coverage-record change reopens the affected rows and requires the author → independent grader → remediation loop in `AGENTS.md` before handoff. Structural checks remain required for joins and regressions, but only semantic review can decide whether learner-facing content fulfills the promise. The separate generated [`COURSE_PAGE_GRADES.md`](COURSE_PAGE_GRADES.md) records current whole-page grading evidence.

## Introduction re-review — 17 July 2026

The first lesson of every released course was rewritten as a prerequisite-free orientation. The affected set contains 11 exact objectives: three for Large Language Models and two each for World Models, Generative Models, Reinforcement Learning & Control, and Embodied AI. Each introduction now begins with a familiar use or decision, explains why the field is worth learning, defers later notation and machinery, and keeps a concrete activity, changed-case check, and honest trust boundary.

The first independent pass found the World Models second objective partial because its guided example began with a hallway decision and concluded with an unrelated weather case. It also graded four whole introductions partial because shared research-guide and compact-lab copy exposed internal lesson IDs and authoring phrases. Remediation made the World Models trace one coherent hallway scenario, added orientation-specific learner language to the shared research guide and motion story, and gave the RL and Embodied labs concrete actions, observations, explanations, and completion conditions.

The independent regrade reports **11 pass, 0 partial, and 0 fail**, with all five dimensions passing for every changed objective. Its whole-introduction result is **5 pass, 0 partial, and 0 fail**. `tests/course-introductions.test.mjs` protects prerequisite-free and notation-free openings, exact objective joins, motivating and bounded copy, coherent worked scenarios, concrete introductory interactions, and the absence of raw lesson IDs or internal authoring language.

## Lesson 02 continuity revision — 20 July 2026

Learner feedback reopened the first `tensors-shapes` objective. The previous promise, “Read common LLM tensor shapes without guessing,” taught axis arithmetic but did not require the page to explain why an LLM needs those arrays or how matrix multiplication participates in response generation. The revised exact promise is “Explain why LLMs represent many text positions with tensors and read their common shapes.”

The authoring pass now begins from the Introduction's piece-by-piece response model; declares already-divided text as the input boundary; traces two prompts, three positions, and four features into $X[2,3,4]$; applies one learned projection at every position; and identifies attention, MLP, and vocabulary-output reuse. The boundary explicitly defers tokenizer choice to Lesson 6 and separates valid shape arithmetic from learned meaning or factuality. The objective record, guide narrative, deterministic trace, quiz, runnable NumPy example, browser lab, evidence transfer, visual record, curriculum inventory, and continuity regression test were updated together.

Independent semantic and whole-page regrading is required after this authoring pass. Until that grader reports no partial or failed dimension, the affected objective and page remain reopened rather than inheriting the 17 July score.

## World Models extension and independent gate

The World Models course adds 46 lessons with two exact outcomes per lesson. Its 92 explicit records are authored from the same five-dimensional contract and rendered through the same commit-before-reveal objective component. World Models content is not inferred from the LLM registry: `app/world-models/index.ts` joins every exact objective to a course-specific explanation, mechanism, worked trace, boundary, and check/retry record.

The first independent semantic pass found **65 pass, 27 partial, and 0 fail**. The partial rows were concentrated in incomplete numerical traces, checks that covered only one half of a compound outcome, and four local definition leaks. After remediation, a second full pass found **88 pass, 4 partial, and 0 fail**. Two residual rows were repaired during the final audit, producing **90 pass and 2 partial**; defining the slot query/key/value assignment mechanism and expanding expected calibration error closed the last two.

The independent grader’s final pass reports **92 pass, 0 partial, and 0 fail**. All five dimensions pass 92/92: explanations, mechanisms, worked traces, boundaries, and committed checks with expected reasoning and specific retry routes. Identifiability, $PA_i/U$, positivity, and rotation equivariance are now defined before the affected objective relies on them.

`tests/world-model-curriculum.test.mjs` verifies the 46-lesson/92-objective joins and other course contracts. As with the LLM structural test, it did not award the semantic pass; the independent review did.

## Generative Models extension and independent gate

The Generative Models course adds 30 lessons with two exact outcomes per lesson. Its 60 course-specific records are defined in `app/generative/` and rendered through the same commit-before-reveal contract.

The first independent semantic pass found **50 pass, 10 partial, and 0 fail**. Remediation made the promised operations observable: API interface distinctions, both KL directions, divergence selection, serialization trade-offs, reparameterized gradient paths, flow expressivity, diffusion and condition tensor paths, exact composition-gap arithmetic, and three-class GPU evidence interpretation. The second pass found a UI-level prerequisite problem: seven lessons with both local and cross-course dependencies rendered only the local branch. It also required the GPU evidence explanation and mechanism—not only its worked check—to define the three evidence classes.

After rendering local and program prerequisites independently and repairing that interpretation procedure, the final independent pass reports **60 pass, 0 partial, and 0 fail**. Vocabulary now appears in the early Orient block before the definition and mechanism.

## Reinforcement Learning & Control extension and independent gate

The Reinforcement Learning & Control course adds 32 lessons with two exact outcomes per lesson. Its 64 course-specific records are defined in `app/rl/` and rendered through the same commit-before-reveal contract.

The first independent semantic pass found **43 pass, 21 partial, and 0 fail**. Remediation expanded compound estimator, policy, support, planning, constraint, and evidence promises into observable traces; added missing prerequisite edges; and defined importance ratio, effective sample size, PPO, Polyak averaging, and OOM before reliance. A second pass found **52 pass, 12 partial, and 0 fail** because twelve learner-facing mathematical commands were being damaged by single-backslash JavaScript escaping rather than rendered as notation.

After correcting every affected math string and repeating the complete review, the independent gate reports **64 pass, 0 partial, and 0 fail**. Structural tests verify joins and ordering but did not award the semantic pass.

## Embodied AI extension and independent gate

The Embodied AI course adds 30 lessons with two exact outcomes per lesson. Its 60 course-specific records cover typed physical interfaces, perception and state, robot data, language-conditioned policies, feedback and planning, transfer, operations, and original experiments.

The first independent semantic pass found **51 pass, 9 partial, and 0 fail**. Remediation added explicit action/reference-frame terms, transform inversion and round-trip checks, calibration fit/release evidence, predict-associate-update tracking, reverse diffusion arithmetic, consistent spatial thresholds, complete external GPU commands and artifact gates, prerequisite activation, and definitions for abbreviations used in mechanisms. The second pass found **59 pass, 1 partial, and 0 fail** because the diffusion condition width symbol remained undefined.

After defining that symbol and replacing the shared research helper's positional objective join with named `primary` and `decision` promises across all 92 added-course seeds, the final independent gate reports **60 pass, 0 partial, and 0 fail**. Structural tests verify joins, ordering, and named objective ownership but did not award the semantic pass.

## Complete LLM inventory

| Lesson ID | Exact visible objectives | Coverage records |
|---|---|---:|
| `introduction` | 1. Explain in everyday language what an LLM can help with and why it is worth understanding<br>2. Trace how a prompt becomes a response without assuming human-like understanding<br>3. Choose when an LLM response can be used directly and when outside evidence or authority is required | 3/3 |
| `tensors-shapes` | 1. Explain why LLMs represent many text positions with tensors and read their common shapes<br>2. Predict the output of a matrix multiplication<br>3. Explain broadcasting and why silent shape errors are dangerous | 3/3 |
| `probability-softmax` | 1. Convert logits into probabilities conceptually and numerically<br>2. Interpret cross-entropy as surprise assigned to the target<br>3. Distinguish entropy, cross-entropy, perplexity, and calibration | 3/3 |
| `gradients-backprop` | 1. Trace a forward and backward computation graph<br>2. Apply the chain rule to a simple parameter<br>3. Explain why backpropagation and optimization are separate | 3/3 |
| `optimizers` | 1. Turn a gradient into an explicit parameter update<br>2. Compare SGD, momentum, Adam, and AdamW conceptually<br>3. Diagnose learning-rate and optimizer-state problems | 3/3 |
| `tokenization` | 1. Explain why models use tokens instead of raw words<br>2. Trace encode and decode through a subword vocabulary<br>3. Predict how tokenization affects cost, languages, and model behavior | 3/3 |
| `embedding-layer` | 1. Explain an embedding lookup as a learned table row<br>2. Distinguish static token embeddings from contextual hidden states<br>3. Interpret similarity cautiously in a high-dimensional space | 3/3 |
| `positional-encoding` | 1. Explain why content-only attention cannot determine order<br>2. Compare absolute, relative, and rotary position signals<br>3. Describe how position design affects long-context behavior | 3/3 |
| `attention` | 1. Trace query-key-value attention from shapes to weighted output<br>2. Explain causal masking and multi-head specialization<br>3. Avoid treating attention weights as complete explanations | 3/3 |
| `layers-of-understanding` | 1. Trace data through a pre-norm Transformer block<br>2. Explain residual streams and MLP contributions<br>3. Describe why capabilities emerge across layers rather than one location | 3/3 |
| `learning-to-predict` | 1. Construct shifted input-target pairs for causal language modeling<br>2. Explain teacher forcing and parallel token loss<br>3. Connect token loss to gradients without confusing prediction with truth | 3/3 |
| `gpt2-from-scratch` | 1. Trace every major tensor through a decoder-only Transformer<br>2. Separate enduring GPT design ideas from implementation-era choices<br>3. Design and debug a tiny end-to-end training run | 3/3 |
| `pretraining-overview` | 1. Explain what a base model learns during pre-training<br>2. Trace one batch through the training loop<br>3. Identify the main sources of cost and failure | 3/3 |
| `objectives-details` | 1. Derive causal next-token loss from shifted sequences<br>2. Explain why masking and architecture must agree<br>3. Relate normalization, residuals, and initialization to trainability | 3/3 |
| `scaling-laws` | 1. Interpret empirical scaling curves without treating them as physical laws<br>2. Balance parameters, tokens, and compute<br>3. Diagnose optimization choices that can invalidate a scaling experiment | 3/3 |
| `data-engineering` | 1. Design a governed text-data pipeline<br>2. Explain deduplication, filtering, and mixture trade-offs<br>3. Prevent contamination and document data lineage | 3/3 |
| `infrastructure` | 1. Explain data, tensor, pipeline, and sequence parallelism<br>2. Connect communication patterns to performance<br>3. Design failure recovery and numerical monitoring | 3/3 |
| `advanced-objectives` | 1. Compare causal, masked, span-corruption, and infilling objectives<br>2. Explain when auxiliary objectives help or conflict<br>3. Choose an objective that matches the desired interface | 3/3 |
| `pretraining-evaluation` | 1. Distinguish training diagnostics from capability evaluations<br>2. Design clean, reproducible benchmark protocols<br>3. Use learning curves to make stop, continue, or repair decisions | 3/3 |
| `olmo3-case-study` | 1. Trace Dolma 3 Mix → Dolmino → Longmino through the OLMo 3 model flow<br>2. Connect concrete data, systems, objective, and evaluation decisions to earlier lessons<br>3. Design a controlled stage-level ablation using open checkpoints | 3/3 |
| `posttraining-overview` | 1. Explain why a capable base model is not yet a useful assistant<br>2. Map the stages of a post-training pipeline<br>3. Recognize capability, behavior, and safety trade-offs | 3/3 |
| `instruction-tuning-rlhf` | 1. Connect base-model pre-training to assistant post-training<br>2. Distinguish SFT, preference optimization, RL, and tool/safety tuning<br>3. Select the minimum training stage for a behavior gap | 3/3 |
| `sft` | 1. Construct high-quality conversational demonstrations<br>2. Implement assistant-only supervised loss<br>3. Diagnose imitation artifacts and capability regressions | 3/3 |
| `preference-optimization` | 1. Turn comparisons into a learning signal<br>2. Explain DPO’s chosen/rejected and reference terms<br>3. Detect label bias, reward hacking, and over-optimization | 3/3 |
| `rl-fundamentals` | 1. Model language generation as states, actions, rewards, and returns<br>2. Explain policy gradients and credit assignment<br>3. Separate online exploration from supervised imitation | 3/3 |
| `rlhf` | 1. Trace the classic RLHF pipeline<br>2. Explain reward modeling, PPO-style updates, and KL control<br>3. Diagnose reward hacking and evaluation blind spots | 3/3 |
| `tools-safety` | 1. Represent tool calls as constrained actions<br>2. Design safety tuning around capabilities and threat models<br>3. Evaluate useful compliance, invalid actions, and over-refusal separately | 3/3 |
| `tulu3-case-study` | 1. Trace Tülu 3 from curation through SFT, length-normalized DPO, and RLVR<br>2. Explain how DR Tulu adds Qwen3, MCP tools, and evolving-rubric RL<br>3. Choose exact verifiers, preferences, evolving rubrics, and runtime controls for different tasks | 3/3 |
| `decoding-sampling` | 1. Convert logits into controlled token choices<br>2. Predict the effects of temperature, top-k, and top-p<br>3. Match decoding policy to task and evaluation | 3/3 |
| `generation-kv-cache` | 1. Trace prefill and decode phases<br>2. Compute how a KV cache avoids repeated attention work<br>3. Explain cache memory, batching, and context trade-offs | 3/3 |
| `quantization-memory` | 1. Account for inference memory beyond parameter count<br>2. Explain weight and activation quantization<br>3. Choose precision using measured quality, speed, and hardware support | 3/3 |
| `serving-systems` | 1. Distinguish latency, throughput, utilization, and goodput<br>2. Explain static, dynamic, and continuous batching<br>3. Design capacity and overload controls around an SLO | 3/3 |
| `test-time-compute` | 1. Explain how extra inference computation can improve outcomes<br>2. Compare sampling, self-consistency, search, critique, and verifiers<br>3. Allocate reasoning budgets using value-of-compute evidence | 3/3 |
| `context-engineering` | 1. Design prompts as complete information and control interfaces<br>2. Explain context priority, placement, and token budgets<br>3. Test prompts against variation, injection, and missing information | 3/3 |
| `rag` | 1. Build a retrieval-augmented generation pipeline<br>2. Choose chunking, embedding, retrieval, and reranking strategies<br>3. Evaluate retrieval separately from grounded answer generation | 3/3 |
| `agent-loops` | 1. Distinguish workflows from autonomous agent loops<br>2. Design observe-decide-act transitions and termination<br>3. Contain tool errors, permissions, and runaway cost | 3/3 |
| `evaluation-design` | 1. Turn product requirements into an evaluation portfolio<br>2. Use deterministic, human, and model-based graders appropriately<br>3. Measure uncertainty, slices, and regressions instead of one headline score | 3/3 |
| `security-privacy` | 1. Threat-model an LLM application across data, model, tools, and users<br>2. Explain prompt injection and why prompting alone cannot solve it<br>3. Apply least privilege, data minimization, and layered controls | 3/3 |
| `observability-governance` | 1. Design traces and metrics for an LLM production system<br>2. Attribute quality, latency, and cost to pipeline stages<br>3. Create release, incident, and governance controls tied to evidence | 3/3 |
| `distillation` | 1. Explain response, logit, and feature distillation<br>2. Balance teacher quality, student capacity, and data coverage<br>3. Evaluate compression gains against cost and inherited errors | 3/3 |
| `lora` | 1. Derive LoRA’s low-rank weight update<br>2. Choose rank, target modules, and adapter deployment strategy<br>3. Compare LoRA with full fine-tuning and quantized variants | 3/3 |
| `moe` | 1. Explain sparse expert routing and top-k execution<br>2. Compute capacity and load-balancing constraints<br>3. Separate parameter scale from active compute and serving cost | 3/3 |
| `multimodal-models` | 1. Trace visual or audio inputs into a language-model token space<br>2. Compare projection, cross-attention, and unified-token designs<br>3. Evaluate grounding and modality-specific failure modes | 3/3 |
| `interpretability-editing` | 1. Distinguish behavioral, attribution, probing, and causal interpretability<br>2. Use activation interventions to test hypotheses<br>3. Evaluate model edits for efficacy, specificity, generalization, and side effects | 3/3 |

## Maintenance rule

When an objective changes, update its explicit coverage record in the same change. Do not infer coverage from array position, reuse a generic check, or count a vocabulary definition as a worked mechanism. Run `node --test tests/objective-coverage.test.mjs` during authoring, then the repository's required `npm run lint` and `npm test` before handoff. An independent content reviewer must still compare the meaning of each objective with its explanation, mechanism, example, boundary, and check; structure alone cannot certify instructional quality.
