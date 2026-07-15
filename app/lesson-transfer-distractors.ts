export type LessonDistractors = [[string, string], [string, string], [string, string]];

// Every pair encodes two plausible, lesson-specific misconceptions for the
// corresponding rule in lesson-transfer-checks.ts. Keeping these authored and
// separate makes the assessment reviewable instead of hiding pedagogy in a
// generic text mutation.
export const lessonTransferDistractors: Record<string, LessonDistractors> = {
  introduction: [
    ["The model supplies a verified current fact, because high probability is evidence of truth.", "The model directly performs the external action once it emits a plausible tool call."],
    ["The weather fact should come from the model's pre-training weights, which are current at inference time.", "Raising temperature refreshes the model's weather knowledge without retrieval."],
    ["Well-formed booking JSON is sufficient authorization; the model can approve its own call.", "The proposed tool call itself is the execution receipt, even before a runtime runs it."],
  ],
  "tensors-shapes": [
    ["Each query head needs four separate KV heads, so the sharing ratio is one-to-four.", "All query heads share one global KV head regardless of the stated head counts."],
    ["Contract the two token axes in QKᵀ, leaving the head feature dimension in the output.", "Contract the batch and head axes so every sequence shares one attention map."],
    ["The score tensor is [B, T, h_q, T], because the query-head axis follows the first token axis.", "The score tensor is [B, h_q, T, d_h], because keys leave their feature width uncontracted."],
  ],
  "probability-softmax": [
    ["Use −log(0.8) ≈ 1.609 and −log(0.2) ≈ 0.223; lower probability gives lower loss.", "Use linear errors 1−0.8=0.2 and 1−0.2=0.8 instead of negative log-likelihood."],
    ["The unmasked mean is 0.223 and the masked mean is 0.916 because masking raises the loss.", "The masked mean is 0.112 because the excluded padding loss must remain in the denominator."],
    ["Padding should receive a zero-valued target but still count in the training-loss denominator.", "Padding is a useful target class, so its gradient should teach the model when to emit padding."],
  ],
  "gradients-backprop": [
    ["For L=ΣY², dL/dY=Y with shape [2,3]; the square does not change the derivative scale.", "dL/dY is the scalar 2 because summation removes the elementwise gradient."],
    ["Use (dL/dY)Xᵀ, yielding [2,2], because gradients multiply in forward order.", "Use X(dL/dY)ᵀ, yielding [2,2], so the weight gradient has the input-batch shape."],
    ["Use Wᵀ(dL/dY), yielding [3,3], because W must appear before the upstream gradient.", "Use (dL/dY)W, yielding [2,3], without transposing the forward weight matrix."],
  ],
  optimizers: [
    ["Momentum keeps two moment tensors, while AdamW keeps only one velocity tensor.", "Both momentum and AdamW are stateless once gradients have been computed."],
    ["Parameter bytes alone decide whether AdamW fits; gradients and optimizer state can be ignored.", "AdamW has a fixed memory cost independent of precision, sharding, and optimizer-state placement."],
    ["Choose whichever optimizer has the lower early training loss, even if it saw fewer tokens.", "AdamW is universally better, so a matched-token held-out comparison is unnecessary."],
  ],
  tokenization: [
    ["English prose and one average sentence are enough because tokenizer behavior transfers across scripts and bytes.", "Use only valid Unicode prose; code whitespace and replacement-character cases are tokenizer implementation details."],
    ["Preserve token counts only; exact IDs, offsets, and decoded text cannot affect an audit.", "Preserve the decoded string only; matching text proves the IDs and offsets were identical."],
    ["Deploy the tokenizer with the fewest tokens on the sample, regardless of its paired model's task quality.", "Choose the model first and swap in any tokenizer later because model/tokenizer compatibility is not consequential."],
  ],
  "embedding-layer": [
    ["The embedding-table lookup is contextual, while the block hidden state is a fixed token-ID row.", "Both the lookup row and every later hidden state are context-free because the token ID is unchanged."],
    ["A 2-D projection preserves all high-dimensional distances, so its nearest neighbors are definitive.", "Projection can rotate a plot but cannot create or remove apparent neighborhoods."],
    ["Compare different token IDs in the two sentences; lexical variation is needed to reveal context.", "Compare only 2-D projected endpoints and infer the full-dimensional cosine from their screen distance."],
  ],
  "positional-encoding": [
    ["Successfully allocating a 16K input tensor measures the positional mechanism's long-range fidelity.", "A single aggregate perplexity at 16K identifies whether phase and relative-distance behavior remain stable."],
    ["Use random short prompts without controlled distance, order, or distractors; any correct answer proves long context.", "Use a bag-of-words classification task whose label is unchanged when token order is shuffled."],
    ["Loading 16K tokens proves the model uses all 16K effectively on order-sensitive tasks.", "A successful memory allocation establishes both long-context capacity and long-range retrieval quality."],
  ],
  attention: [
    ["The query ‘it’ may attend to later keys such as ‘was fragile’ because the whole sentence is available during training.", "The query ‘it’ may attend only to its own key; earlier context would leak the answer."],
    ["A bidirectional encoder uses the same past-only key set as a causal decoder.", "A bidirectional encoder may see earlier tokens but must still mask all later visible tokens."],
    ["A large attention weight proves that token is causally responsible for the output.", "Attention visualization alone is an intervention because changing the color scale tests causality."],
  ],
  "layers-of-understanding": [
    ["Use h = x + Attn(Norm(x)), which is the post-norm residual operation.", "Use h = Norm(x) + Attn(x), normalizing only the skip branch before addition."],
    ["An MLP branch may return width 2d directly into a residual addition because broadcasting restores d.", "The two residual operands may use unrelated widths as long as their token axes match."],
    ["Pre-norm weights can be relabeled as post-norm weights directly because normalization placement is cosmetic.", "Only the layer names change between pre-norm and post-norm; their training dynamics and activations are identical."],
  ],
  "learning-to-predict": [
    ["Train system, user, and assistant tokens equally so the model learns the entire transcript as an answer.", "Mask assistant tokens and train only user/system tokens because those contain the instructions."],
    ["Pack conversations back-to-back without a terminal token; the attention mask will infer their boundaries.", "Padding between conversations is enough even when padding is removed by sequence packing."],
    ["Print only the raw input IDs; decoded text and label positions add no information.", "Inspect the final scalar loss only; a plausible value proves the role mask is aligned."],
  ],
  "gpt2-from-scratch": [
    ["Change tokenizer, depth, and positional encoding together so any improvement is easier to observe.", "Compare two runs that differ in both architecture and data order, then attribute the result to the preferred treatment."],
    ["Match optimizer steps even if the tokenizer changes tokens per example and total training tokens.", "Use a fresh evaluation split for each treatment so both runs are tested on data suited to them."],
    ["Choose the falsifier after seeing the curves so it reflects whichever metric changed most.", "Training loss alone overturns or confirms the hypothesis even if held-out syntax and behavior disagree."],
  ],
  "pretraining-overview": [
    ["Only drop-last can change the token total; padding, packing, and partial batches cannot.", "A learning-rate schedule explains a loader accounting gap even when the loaded labels differ."],
    ["Count every input ID on each rank, including padding and ignored labels, then multiply by world size.", "Reduce the nominal sequence-length × batch-size estimate rather than the actual loss-bearing labels."],
    ["Restore model weights only and restart the sampler at the beginning; duplicate data is harmless.", "Reset the data cursor whenever the step count changes so checkpoint metadata stays simple."],
  ],
  "objectives-details": [
    ["Only assistant tokens may remain visible; system, user, and tool-result spans must be removed from context.", "Masking a role's loss also removes that role from the attention context automatically."],
    ["Score user and tool-result text, but mask the assistant call because tool syntax is supplied at runtime.", "Score only the final assistant prose; the model will infer call syntax without loss on call tokens."],
    ["Final-answer-only loss improves tool-call syntax by removing every direct tool-call training signal.", "There is no trade-off: masking call tokens preserves exactly the same call-selection competence."],
  ],
  "scaling-laws": [
    ["Maximize parameter count under the budget; nearby empirical loss points and uncertainty are unnecessary.", "Use the fitted asymptote as an exact capability prediction even when the measured points are sparse."],
    ["Optimize training loss only; edge latency, memory, and lifetime inference volume are deployment details.", "Choose the smallest model by memory alone, even if latency and total inference cost are worse."],
    ["Let the fitted curve decide far outside the measured range because scaling exponents remain exact.", "Ignore uncertainty bands when extrapolating; only the point estimate matters for model selection."],
  ],
  "data-engineering": [
    ["Ship on the aggregate validation gain; a 60% Swahili regression is too narrow to block release.", "Average the Swahili slice into the global score so the larger English slice can compensate for it."],
    ["Let the same language-ID classifier audit its own removals; human domain review would add noise.", "Use English-only reviewers to decide whether removed Swahili examples are false positives."],
    ["Permanently delete all flagged data and change thresholds, sampling, and weights in one irreversible run.", "Adjust the filter without versioning it, then evaluate only aggregate validation loss."],
  ],
  infrastructure: [
    ["Place data, tensor, and pipeline parallel groups randomly because topology does not affect communication.", "Put every parallel dimension across the slowest inter-node links to maximize device independence."],
    ["Each rank owns all parameters, activations, and gradients, so tensor/pipeline parallelism needs no communication.", "Count collective calls but do not identify which tensors or ownership boundaries they move."],
    ["Restore weights alone; optimizer, scheduler, RNG, and data cursor can safely restart from defaults.", "Restore optimizer state but reseed randomness and rewind the loader to the first batch."],
  ],
  "advanced-objectives": [
    ["Serialize <fim_middle> middle <fim_prefix> prefix <fim_suffix> suffix.", "Keep prefix, middle, suffix in natural order and append all three FIM markers at the end."],
    ["Match the number of source examples, even if FIM and causal runs have different loss-bearing token counts.", "Change optimizer and schedule for the FIM arm so it can adapt to the harder objective."],
    ["Keep FIM whenever infilling improves, even if ordinary completion breaches its regression gate.", "Keep FIM on a point-estimate gain smaller than its uncertainty interval because any positive number is sufficient."],
  ],
  "pretraining-evaluation": [
    ["Use one blended benchmark average; loss, capability, contamination, and throughput need not be separated.", "Treat lower training loss as direct evidence that benchmark integrity and system throughput are valid."],
    ["Inspect aggregate scores only; domain, exposure, and hardware slices would make causes harder to compare.", "Attribute a throughput drop to data contamination without checking system telemetry."],
    ["Continue training until the compute budget ends even after a predeclared contamination gate fires.", "Stop on any single noisy metric fluctuation, even when it stays inside the declared uncertainty band."],
  ],
  "olmo3-case-study": [
    ["A mutable ‘latest’ model tag and prose model card are sufficient to reproduce the flow.", "Pin only the final checkpoint; configs, data recipe, and code revision can be inferred from its name."],
    ["Compare unmatched before/after checkpoints and attribute every difference to the named stage.", "Change data, compute, and evaluator with the treatment, then use the largest metric gain as causal evidence."],
    ["Expand scope whenever an interim average looks attractive; set regression gates after the run.", "A fixed budget alone is a stop rule, so success and risk thresholds are unnecessary."],
  ],
  "instruction-tuning-rlhf": [
    ["SFT learns from preference pairs, DPO from demonstrations, and RLVR from unverified prose labels.", "All three stages use the same supervised token labels and differ only in their names."],
    ["All stages update one shared checkpoint in place, so no stage-specific learned artifact is produced.", "Only runtime prompts change after SFT, DPO, and RLVR; model weights remain identical."],
    ["Store credentials and permissions in model weights so the assistant can authorize its own actions.", "A model-generated confirmation sentence is a deterministic receipt and replaces runtime audit controls."],
  ],
  "posttraining-overview": [
    ["Demonstrations, preferences, and online rewards are interchangeable label sets for the same update.", "Online rewards provide expert demonstrations, while SFT supplies pairwise preference comparisons."],
    ["Tülu's exact beta, datasets, verifiers, and episode count are universal defaults for every model.", "Only the model name is recipe-specific; all data and infrastructure choices generalize unchanged."],
    ["Keep a stage whenever a published recipe includes it, without matched ablation or rollback evidence.", "An aggregate target gain always pays for regressions and cost, so remove/keep gates are unnecessary."],
  ],
  sft: [
    ["Public availability makes medical summaries automatically licensed, consented, and privacy-safe.", "De-identification alone supplies data rights and guarantees a leakage-safe train/test split."],
    ["Measure summary fluency only; factuality and severe medical slices are covered by the same average.", "Evaluate the tuned model without a base-model baseline, because absolute scores reveal improvement."],
    ["Stop only when training loss rises; held-out safety regressions should not interrupt optimization.", "Ship on average validation improvement even when a predeclared severe-slice gate fails."],
  ],
  "preference-optimization": [
    ["Use one vague helpfulness rubric for both contexts; task-specific criteria create inconsistent labels.", "Prefer the longer response in every context because verbosity is a context-independent quality signal."],
    ["Leave length, formatting, and answer order uncontrolled so annotators see natural variation.", "Present the same candidate first in every pair; position bias cancels across a large dataset."],
    ["Trust one unblinded judge and report its labels without swaps, agreement, or slice checks.", "High aggregate agreement proves every subgroup is calibrated, so slice audits are redundant."],
  ],
  "rl-fundamentals": [
    ["Trace reward → action → state and treat the immediate reward as the full delayed return.", "Choose the action after observing the return, then define the state from the chosen reward."],
    ["A negative advantage means return exceeded the baseline, so increase the action's log-probability.", "Advantage is the reward's sign; the baseline does not affect the update direction."],
    ["Stochastic sampling does not create gradient variance once rewards are scalar.", "A critic removes all variance exactly, so batch size and sampling coverage no longer matter."],
  ],
  rlhf: [
    ["Preference labels update the policy directly; no reward definition or scored rollout is needed.", "The reward model is itself the deployed policy, so policy optimization is a duplicate stage."],
    ["Maximize KL from the reference to encourage exploration and prevent reward hacking.", "Remove the reference policy after the first update because KL cannot constrain destructive drift."],
    ["A sufficiently high helpfulness reward can compensate for factual-safety failure at release.", "Average safety and helpfulness into one score, allowing strong helpfulness to pass the blocking gate."],
  ],
  "tools-safety": [
    ["Train only denied suspicious writes; legitimate reads are obvious and need no counterexamples.", "Train only allowed examples so refusal behavior disappears without measuring unsafe compliance."],
    ["Put authorization and confirmation instructions in the prompt; learned compliance is deterministic enforcement.", "Let the model choose its own scope and emit an audit receipt before the runtime executes anything."],
    ["Report unsafe compliance only; benign false refusals are always an acceptable safety cost.", "Report one blended error rate so overblocking can compensate for successful attacks."],
  ],
  "tulu3-case-study": [
    ["Use preference optimization alone to teach exact diagnostic/tool trajectories; demonstrations are unnecessary.", "Use SFT only for scalar outcome rewards and let RLVR supply the trajectory text."],
    ["Use subjective rubrics for unit tests and exact string checks for open-ended diagnostic reports.", "Apply one prose judge to both executable fixes and nuanced reports; verifier type need not match outcome."],
    ["Let the model authorize a service restart when its confidence is high.", "A restart needs no scoped approval, rollback, or audit if the proposed command is syntactically valid."],
  ],
  "decoding-sampling": [
    ["Use greedy decoding for every poem and grade creativity with exact string match.", "Maximize temperature without measuring style or human preference; diversity alone defines quality."],
    ["Sample free-form dosage text at high temperature and trust the most frequent unit.", "Allow unconstrained units and validate only that the output is grammatically fluent."],
    ["Stable perplexity can compensate for a severe incorrect dosage in the extractor.", "Permit one malformed dose per release because aggregate extraction accuracy remains high."],
  ],
  "generation-kv-cache": [
    ["Share every request-specific KV block across users when their prefixes are similar.", "Keep immutable common-prefix blocks private but share all generated suffix blocks globally."],
    ["Use one global prefix hash without tenant identity; matching text guarantees safe reuse.", "Rely on time-to-live alone and omit reference counts and explicit invalidation after prefix changes."],
    ["Compare final decoded text only; matching prose proves every cached logit is correct.", "Treat lower cached latency as the correctness oracle even if tokens diverge from full prefill."],
  ],
  "quantization-memory": [
    ["Ship because perplexity is stable; the medical regression is a compensable slice.", "Average the medical failure into global quality so other tasks can override the deployment block."],
    ["Measure total model size only; layer/channel outliers and affected tokens cannot localize quantization error.", "Inspect a random layer's weight histogram and attribute every medical error to that layer."],
    ["Lower precision uniformly again; a stronger compression ratio is the best mitigation.", "Calibrate only on generic web text and assume rare medical outliers will be represented."],
  ],
  "serving-systems": [
    ["Use strict first-come-first-served scheduling so a long prefill always finishes before short chats.", "Increase batch size only; queue separation and chunked prefill cannot affect head-of-line blocking."],
    ["Report mean end-to-end latency for all requests; TTFT, ITL, tails, and shape slices are redundant.", "Combine short and long p95 into one percentile so request classes share the same SLO evidence."],
    ["Accept any aggregate-throughput gain even if long requests starve short chats.", "Use one fleetwide SLO; a class may violate its target when goodput rises overall."],
  ],
  "test-time-compute": [
    ["Send only predicted-hard requests down the expensive path and give them an unlimited first attempt.", "Start every request with the maximum sample/token budget because easy cases finish early anyway."],
    ["Escalate whenever the prompt is long; length is a perfect proxy for difficulty and value.", "Escalate on uncalibrated model confidence alone, without verifier disagreement or measured utility."],
    ["Keep sampling until an answer appears, with no hard cap or fallback.", "Stop after a fixed sample count even when verification already passed or marginal value collapsed."],
  ],
  "context-engineering": [
    ["Place the user's latest request before the application authority contract so recency determines priority.", "Treat retrieved document instructions as higher authority than the system contract."],
    ["Silently choose the longer source when evidence conflicts; provenance and dates add noise.", "Concatenate disagreeing sources without labels so the model can blend them into one answer."],
    ["Retain all conversation history because irrelevant context cannot affect generation.", "Answer confidently when evidence cannot resolve authority; asking or abstaining reduces helpfulness."],
  ],
  rag: [
    ["Measure English retrieval recall and use it as evidence for Arabic ranking quality.", "Evaluate only final answer accuracy; retrieval ranks against labeled Arabic passages are unnecessary."],
    ["Keep the original retrieved passages and call them oracle context, so retrieval remains inside the test.", "If generation fails with correct Arabic evidence, conclude the retriever is the failing stage."],
    ["Fix the generator first because it is the final stage, even when an earlier oracle replacement closes the gap.", "Change embedding, index, reranker, and generator together, then credit the stage with the largest code diff."],
  ],
  "agent-loops": [
    ["Let the model choose ingest, validation, transformation, and approval order on every run.", "Make approval precede validation so the model can decide whether checks are necessary."],
    ["Always invoke model-assisted retrieval, even when evidence is already complete.", "Run retrieval only after approval; missing evidence should not interrupt the deterministic path."],
    ["Allow unlimited retries and rely on unique natural-language wording to prevent duplicate effects.", "Retry side effects without idempotency and omit explicit failure/human terminal states."],
  ],
  "evaluation-design": [
    ["Ship on the aggregate win; a 15-point regulated-slice loss is compensable.", "Remove the high-risk gate after the slice fails because the evaluator may be too strict."],
    ["Report the mean judge score only; paired uncertainty and raw failures would overemphasize outliers.", "Publish judge explanations instead of raw examples and confidence intervals."],
    ["Trust one model judge without calibration; consistency with itself is sufficient validity.", "Delay bias/agreement checks until after release and skip expert adjudication for severe cases."],
  ],
  "security-privacy": [
    ["Put resumes, retrieved documents, the model, tools, and hiring decision in one trusted boundary.", "Delegate final decision authority to the model because humans introduce inconsistency."],
    ["Add a prompt saying ‘ignore injection’ and share candidate context across tenants for efficiency.", "Give retrieval tools broad scope so malicious resume instructions can be investigated automatically."],
    ["Remove explicit sensitive attributes and skip fairness review, audit evidence, and appeals.", "Disallow human appeals because reopened decisions increase prompt-injection exposure."],
  ],
  "observability-governance": [
    ["Continue the canary until the sample is larger; privacy and cost gates should not trigger rollback.", "Roll back only after full deployment so canary behavior matches production scale."],
    ["Log raw prompts and outputs to maximize trace detail; redaction would prevent stage localization.", "Record timestamps without model, prompt, retriever, or policy version IDs."],
    ["Write an informal incident note without an owner or regression test.", "Treat rollback as the durable fix; tenant, privacy, and cost tests need not change."],
  ],
  distillation: [
    ["A response-only API exposes teacher token logits and hidden representations through generated text.", "Infer exact teacher logits from one sampled response and use them as soft targets."],
    ["Train only on teacher outputs; more teacher samples eliminate systematic blind spots.", "Exclude trusted human labels because disagreement with the teacher would confuse the student."],
    ["Ship on latency improvement alone, even if correctness and calibration regress on known teacher-error slices.", "Use student training loss as the only quality gate; held-out sequence behavior is redundant."],
  ],
  lora: [
    ["Load any adapter onto the newest base revision; low-rank shapes guarantee semantic compatibility.", "Share one tenant adapter across all tenants and rely on prompt names for isolation."],
    ["Merged adapters are always faster and better, so benchmark only their mean latency.", "Compare switching latency only; batching throughput, memory, and artifact count cannot affect serving."],
    ["Record the adapter file without its base revision or quality benchmark.", "Rollback the shared base and every tenant whenever one adapter fails."],
  ],
  moe: [
    ["Inspect average router probabilities only; per-expert token counts and overflow are unnecessary.", "Use active parameter count as proof that expert load is balanced."],
    ["Report total step time without separating expert-kernel utilization from all-to-all communication.", "Measure kernel throughput on large synthetic expert batches and infer production network cost from it."],
    ["Active FLOPs alone determine request latency, so router and network evidence can be omitted.", "Add more experts when latency rises; capacity, small-batch kernels, and all-to-all cannot be causal."],
  ],
  "multimodal-models": [
    ["Encode the entire two-minute waveform as one unordered feature vector.", "Send raw waveform samples through the text tokenizer and treat resulting IDs as audio tokens."],
    ["Discard temporal positions after projection; the language model can reconstruct audio order from the question.", "Append audio features after the answer tokens without resampling or a token-budget contract."],
    ["Evaluate end-to-end question accuracy only; it already reveals whether perception or reasoning failed.", "Use transcription score alone to certify question reasoning without an oracle-transcript comparison."],
  ],
  "interpretability-editing": [
    ["Claim the fact was deleted globally when one tested prompt changes after an intervention.", "Treat a changed answer as proof that the edited feature is the unique causal storage location."],
    ["Retest only the original wording and omit unrelated or neighboring prompts.", "Report paraphrase success while hiding locality side effects on unrelated behaviors."],
    ["Repeat the same intervention without sham/random controls or reload tests.", "Test the edited prompt immediately but skip paraphrases, neighbors, and persistence after restart."],
  ],
};
