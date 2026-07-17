export type TransferRule = {
  label: string;
  prompt: string;
  groups: string[][];
  correction: string;
};

const rule = (label: string, prompt: string, groups: string[][], correction: string): TransferRule => ({ label, prompt, groups, correction });

export const lessonTransferChecks: Record<string, TransferRule[]> = {
  introduction: [
    rule("Supplied evidence", "What grounds the itinerary summary?", [["itinerary", "attachment", "attached"], ["supplied", "prompt", "source"]], "Point to the attached itinerary and compare the summary with it."),
    rule("Changing evidence", "Where does the current weather fact come from?", [["weather", "current", "live"], ["source", "service", "tool"]], "Use a dated, current weather source rather than the model's fluency."),
    rule("Authorized effect", "What must surround the ticket purchase?", [["permission", "author", "confirm"], ["price", "itinerary", "details"], ["receipt", "record"]], "Require user permission, confirmed purchase details, and an execution receipt."),
  ],
  "tensors-shapes": [
    rule("Head mapping", "How many query heads share each KV head?", [["4", "four"], ["query"], ["kv", "key"]], "State that each KV head serves a group of four query heads."),
    rule("Contraction", "Which axis contracts in QKᵀ?", [["d_h", "head dimension", "feature"], ["contract", "dot"]], "Contract the head-feature axis, never batch, head, or token."),
    rule("Score shape", "Write the final attention-score shape.", [["b"], ["h_q", "query head"], ["t,t", "t, t", "t × t", "t x t"]], "The score tensor is [B, h_q, T, T]."),
  ],
  "probability-softmax": [
    rule("Per-token losses", "Give both raw negative-log losses.", [["0.223"], ["1.609"]], "Use −log(0.8) ≈ 0.223 and −log(0.2) ≈ 1.609."),
    rule("Two means", "Give the unmasked and masked mean losses.", [["0.916"], ["0.223"]], "The unmasked mean is 0.916; excluding padding leaves 0.223."),
    rule("Mask reason", "Why must the padding position be excluded?", [["pad"], ["gradient", "train", "target"], ["exclude", "mask", "ignore"]], "Padding is not a target and must create no training gradient."),
  ],
  "gradients-backprop": [
    rule("Output gradient", "Write the shape and expression for dL/dY.", [["2y", "2*y"], ["2,3", "2, 3"]], "dL/dY = 2Y with shape [2,3]."),
    rule("Weight gradient", "Write the product and shape for dL/dW.", [["x^t", "xᵀ", "transpose"], ["dl/dy", "gradient"], ["2,3", "2, 3"]], "Use Xᵀ(dL/dY), yielding [2,3]."),
    rule("Input gradient", "Write the product and shape for dL/dX.", [["w^t", "wᵀ", "transpose"], ["dl/dy", "gradient"], ["2,2", "2, 2"]], "Use (dL/dY)Wᵀ, yielding [2,2]."),
  ],
  optimizers: [
    rule("State count", "Compare momentum and AdamW optimizer-state tensors.", [["momentum"], ["one", "1"], ["adam"], ["two", "2"]], "Momentum keeps one main state tensor; AdamW commonly keeps first and second moments."),
    rule("Feasibility", "What decides whether AdamW fits?", [["memory"], ["parameter", "state"], ["shard", "precision", "fit"]], "Count parameter, gradient, and optimizer-state bytes under the actual sharding/precision plan."),
    rule("Quality test", "What evidence decides between feasible optimizers?", [["matched", "same"], ["token", "budget"], ["loss", "quality", "held-out"]], "Require matched-token runs and held-out quality rather than a universal optimizer claim."),
  ],
  tokenization: [
    rule("Coverage cases", "Name the four required input families.", [["english"], ["japanese", "multilingual"], ["code", "whitespace"], ["byte", "invalid", "emoji"]], "Include natural language, multilingual text, code/whitespace, and a byte-heavy edge case."),
    rule("Recorded evidence", "What must be preserved for each tokenizer and string?", [["id"], ["decode", "round-trip", "round trip"], ["count", "offset"]], "Preserve exact IDs, decode/round trip, offsets, and token count."),
    rule("Decision rule", "How do you choose the deployed pair?", [["model"], ["tokenizer"], ["quality"], ["cost", "context"]], "Choose the model/tokenizer pair jointly using task quality, context use, and cost."),
  ],
  "embedding-layer": [
    rule("Lookup/state", "State the relationship in this order: lookup → context property → hidden state → context property.", [["lookup", "embedding table"], ["context-free", "fixed"], ["hidden state"], ["contextual"]], "Write the ordered relationship: the embedding-table lookup is context-free/fixed; the block hidden state is contextual."),
    rule("Projection limit", "Why is the 2-D nearest-neighbor plot insufficient?", [["2-d", "2d", "projection"], ["distort", "loss"]], "A lossy 2-D projection can distort full-dimensional neighborhoods."),
    rule("Controlled comparison", "What exact hidden states should be compared?", [["same token", "same id", "bank"], ["layer"], ["river", "finance"], ["full", "cosine"]], "Compare the same token position at named layers across controlled contexts in full dimensions."),
  ],
  "positional-encoding": [
    rule("Mechanism diagnostic", "Name a position-mechanism measurement beyond loading 16K tokens.", [["phase", "position", "relative"], ["attention", "logit"]], "Measure phase/relative-distance behavior or attention/logit stability."),
    rule("Task falsifier", "Name an order- or distance-sensitive task.", [["retrieval", "order"], ["distance", "long"], ["distractor"]], "Use controlled long-range retrieval/order tasks with distractors."),
    rule("Claim boundary", "What does a successful allocation alone establish?", [["capacity", "load", "fit"], ["not", "doesn't", "does not"], ["use", "effective"]], "Loading 16K establishes capacity, not effective use of 16K context."),
  ],
  attention: [
    rule("Causal keys", "Which keys may the query ‘it’ use, and what must it exclude?", [["only", "through", "up to"], ["it"], ["exclude future", "no future", "not future"]], "State the relation in order: only positions through ‘it’; exclude/no future keys."),
    rule("Bidirectional keys", "How does the encoder key set differ?", [["all", "every"], ["fragile", "future"]], "A bidirectional encoder may also use later visible tokens such as ‘was fragile’."),
    rule("Causal claim", "State the evidence boundary in this order: attention weights → claim limit → causal responsibility → required test.", [["attention", "weight"], ["cannot prove", "not proof", "do not prove"], ["caus", "responsib"], ["interven"]], "Write: attention weights do not prove causal responsibility; intervention is required."),
  ],
  "layers-of-understanding": [
    rule("Post-norm order", "Write the first post-norm residual operation.", [["norm"], ["x+", "x +"], ["attn", "attention"]], "Use h = Norm(x + Attn(x)), then the analogous MLP residual."),
    rule("Residual width", "What width must every residual addition preserve?", [["d"], ["same", "width"]], "Both branches must return the residual width d before addition."),
    rule("Checkpoint boundary", "State whether pre-norm weights transfer directly to post-norm, then why.", [["pre-norm"], ["cannot", "not"], ["relabel", "interchange", "direct"], ["post-norm"], ["placement", "dynamics", "normalization"]], "Write that pre-norm weights cannot be directly relabeled/interchanged as post-norm because placement/dynamics differ."),
  ],
  "learning-to-predict": [
    rule("Loss roles", "Which chat roles receive loss?", [["assistant"], ["user", "system"], ["mask", "ignore"]], "Train assistant tokens and mask system/user tokens with the ignore index."),
    rule("Conversation boundary", "How do you stop cross-conversation continuation?", [["end", "boundary", "eos"], ["explicit"]], "Insert an explicit terminal/boundary token and define its loss policy."),
    rule("Visible verification", "What should be printed before training?", [["decode"], ["label", "mask"], ["position", "contribut"]], "Print a decoded packed example with labels and contributing positions."),
  ],
  "gpt2-from-scratch": [
    rule("Single treatment", "Name the one ablation treatment.", [["character", "bpe", "position", "tokenizer"], ["versus", "on", "off"]], "Change exactly one named architecture or tokenizer treatment."),
    rule("Fixed budget", "What must be held comparable?", [["token"], ["budget", "same", "matched"], ["split", "evaluation"]], "Hold training tokens, data split, and evaluator constant."),
    rule("Falsifier", "Which measured result would overturn the hypothesis?", [["held-out", "validation"], ["loss", "syntax", "behavior"], ["reverse", "worse", "fail"]], "Predeclare a held-out loss/syntax/behavior result that would reverse the decision."),
  ],
  "pretraining-overview": [
    rule("Loader fields", "Which loader policies can explain the 3% gap?", [["padding"], ["packing"], ["drop"], ["partial"]], "Inspect padding, packing, drop-last, and partial-batch handling."),
    rule("True counter", "What token quantity must be reduced across ranks?", [["loss"], ["token"], ["mask", "label"], ["rank", "distributed"]], "Reduce labels not equal to the ignore index across ranks."),
    rule("Recovery integrity", "What state must remain consistent if steps change?", [["cursor", "sampler"], ["skip", "repeat", "duplicate"], ["checkpoint", "resume", "recover"]], "Preserve sampler/data cursor and recovery state to avoid repeats or skips."),
  ],
  "objectives-details": [
    rule("Visible roles", "Which roles stay visible in both policies?", [["system"], ["user"], ["tool"], ["assistant"]], "All serialized roles may stay visible as context even when their labels are ignored."),
    rule("Call-training mask", "Which assistant spans receive loss when learning tool syntax?", [["assistant"], ["call"], ["final"], ["mask", "ignore"]], "Score the assistant call and final answer; mask system/user/tool-result text."),
    rule("Final-only trade-off", "What does final-answer-only loss trade away?", [["final"], ["tool", "call"], ["competence", "syntax", "credit"]], "It reduces noisy call credit but may not teach call syntax/selection."),
  ],
  "scaling-laws": [
    rule("Research objective", "What should the reusable research model optimize?", [["capability", "loss"], ["compute", "training"], ["uncertainty"]], "Use nearby empirical scaling points and uncertainty under training compute."),
    rule("Edge objective", "What additional quantities constrain the edge model?", [["latency"], ["memory"], ["lifecycle", "inference", "cost"]], "Include latency, memory, quality, and lifetime inference cost."),
    rule("Extrapolation rule", "When should the fitted curve not decide alone?", [["outside", "extrapolat", "range"], ["measure", "empirical"], ["uncertain"]], "Do not extrapolate far beyond measured scale; validate nearby points."),
  ],
  "data-engineering": [
    rule("Aggregate decision", "Relate the aggregate validation gain to the ship decision and Swahili slice.", [["aggregate", "validation loss"], ["cannot", "not enough", "insufficient"], ["ship"], ["swahili", "slice"], ["regress", "60%"]], "Write that the aggregate gain is insufficient to ship because the Swahili slice regresses."),
    rule("Error audit", "Who/what checks the removed Swahili examples?", [["false positive"], ["review", "language", "domain"]], "Audit false positives with language/domain reviewers."),
    rule("Next treatment", "Name one reversible adjustment and downstream test.", [["threshold", "sample", "weight"], ["downstream", "slice"], ["version", "reversible"]], "Try a versioned threshold/sampling change and re-evaluate downstream slices."),
  ],
  infrastructure: [
    rule("Placement", "Where are data, tensor, and pipeline partitions placed?", [["data"], ["tensor"], ["pipeline"], ["device", "node", "rank"]], "Map each parallel dimension to devices/nodes explicitly."),
    rule("Communication", "Name the key communication/ownership consequence.", [["all-reduce", "all reduce", "all-to-all", "send", "receive"], ["parameter", "activation", "gradient"]], "Identify what each rank owns and communicates."),
    rule("Recovery state", "What must a complete checkpoint restore?", [["model"], ["optimizer"], ["scheduler"], ["rng", "random"], ["data", "cursor"]], "Restore weights, optimizer/scheduler, RNG, and data cursor—not weights alone."),
  ],
  "advanced-objectives": [
    rule("Serialization", "Write the order of FIM segments/tokens.", [["fim_prefix"], ["prefix"], ["fim_suffix"], ["suffix"], ["fim_middle"], ["middle"]], "Serialize <fim_prefix> prefix <fim_suffix> suffix <fim_middle> middle."),
    rule("Equal budget", "What must match the causal-only control?", [["loss", "token"], ["optimizer"], ["schedule"], ["seed"]], "Match loss-bearing tokens, optimizer, schedule, data, and seeds."),
    rule("Decision gates", "What two result families decide whether to keep FIM?", [["infill"], ["completion"], ["uncertainty", "interval"], ["regression"]], "Require an infilling gain beyond uncertainty and no completion regression beyond the gate."),
  ],
  "pretraining-evaluation": [
    rule("Metric classes", "Classify the minimum evidence families.", [["loss", "intrinsic"], ["capability"], ["contamination"], ["system", "throughput"]], "Separate intrinsic loss, capability, contamination, and systems evidence."),
    rule("Confound slices", "What slices distinguish data/benchmark/system causes?", [["domain", "task"], ["data", "contamination"], ["throughput", "hardware", "system"]], "Slice by task/domain/data exposure and inspect system telemetry."),
    rule("Action", "When do you stop rather than continue training?", [["stop", "pause"], ["regress", "confound", "contamin"], ["gate", "threshold"]], "Stop/pause when a predeclared regression or invalid-evaluation gate fires."),
  ],
  "olmo3-case-study": [
    rule("Pinned artifacts", "What must an open-model flow pin?", [["checkpoint"], ["config"], ["data"], ["revision", "hash"]], "Pin checkpoints, configs, data recipe, and code revisions."),
    rule("Causal comparison", "How do you attribute a stage change?", [["control"], ["treatment"], ["matched", "same"], ["metric"]], "Use a matched control/treatment and predeclared metrics."),
    rule("Stop rule", "What prevents an attractive result from expanding scope?", [["budget"], ["stop", "gate"], ["regression", "risk"]], "Set budget, success/regression gates, and a stop rule before running."),
  ],
  "instruction-tuning-rlhf": [
    rule("Stage signals", "Map SFT, DPO, and RLVR to their signals.", [["sft"], ["demonstration"], ["dpo"], ["preference"], ["rlvr"], ["verif", "reward"]], "SFT uses demonstrations, DPO preferences, and RLVR verifiable online rewards."),
    rule("Learned artifacts", "What changes at each learned stage?", [["checkpoint", "weight"], ["sft"], ["dpo"], ["rlvr"]], "Each training stage emits a new learned checkpoint/weights."),
    rule("Runtime boundary", "Which guarantees remain outside weights?", [["credential", "permission", "author"], ["confirm"], ["receipt", "audit"]], "Credentials, authorization, confirmation, and receipts remain runtime controls."),
  ],
  "posttraining-overview": [
    rule("General mechanisms", "What distinct signals do SFT, preferences, and online rewards provide?", [["demonstration"], ["preference"], ["reward"]], "Name the different learning signals rather than treating them as one label set."),
    rule("Recipe-specific", "Name two choices that cannot be generalized from Tülu.", [["data", "dataset"], ["beta", "verifier", "episode", "model"]], "Model/data, beta, verifiers, episodes, and infrastructure are recipe-specific."),
    rule("Keep/remove", "What evidence decides whether a stage stays?", [["matched"], ["metric"], ["regress"], ["cost", "rollback"]], "Use matched target/regression metrics, cost, and a rollback decision."),
  ],
  sft: [
    rule("Data boundary", "What makes the medical-summary data permissible and safe?", [["license", "consent", "right"], ["privacy", "phi", "de-ident"], ["split"]], "Pin rights/privacy handling and a leakage-safe split."),
    rule("Evaluation suite", "Which target and severe-slice evidence must be measured?", [["summary", "task"], ["factual", "halluc"], ["medical", "safety"], ["baseline"]], "Compare with the base model on task quality, factuality, and severe medical slices."),
    rule("Stop rule", "What blocks or stops the run?", [["regression", "gate"], ["validation", "held-out"], ["stop", "rollback"]], "Predeclare held-out/regression gates and stop or roll back when they fail."),
  ],
  "preference-optimization": [
    rule("Rubric change", "How do the preference criteria differ across the two contexts?", [["context", "task"], ["rubric", "criteria"], ["different"]], "Write separate task rubrics rather than reuse one vague helpfulness label."),
    rule("Pair normalization", "What pair-format biases must be controlled?", [["length", "verbosity"], ["order", "position"], ["normal", "match"]], "Normalize/measure length, position/order, and formatting effects."),
    rule("Bias diagnosis", "What evidence shows the preference signal is valid?", [["swap", "counterbalance", "blind"], ["agreement", "human", "calibr"], ["slice"]], "Use swapped/blinded judgments, agreement/calibration, and slice audits."),
  ],
  "rl-fundamentals": [
    rule("Trajectory", "Name state, action, reward, and delayed return in order.", [["state"], ["action"], ["reward"], ["return"], ["later", "delayed"]], "Trace the ordered trajectory and sum delayed rewards into the return."),
    rule("Advantage", "What does a negative advantage mean?", [["return"], ["baseline"], ["below", "less", "negative"]], "The sampled return was below the baseline, so its log-probability should be reduced."),
    rule("Variance", "What causes variance and what reduces it?", [["sample", "stochastic"], ["variance"], ["baseline", "critic", "batch"]], "Sampling makes returns noisy; a baseline/critic and adequate batches reduce variance."),
  ],
  rlhf: [
    rule("Preference-to-policy", "Trace preference data to the policy update.", [["preference"], ["reward model", "reward"], ["policy"], ["update"]], "Preferences train/define a reward, which scores rollouts used in a policy update."),
    rule("KL control", "Why include a KL term/reference policy?", [["kl"], ["reference"], ["drift", "collapse", "hack"]], "KL discourages destructive drift/reward hacking from the reference policy."),
    rule("Non-compensable gate", "Relate helpfulness reward to factual-safety failure and the release decision.", [["helpful", "reward"], ["cannot compensate", "does not override", "must not trade"], ["factual safety", "safety failure"], ["blocking gate", "block release"]], "Write that helpfulness reward cannot compensate for factual-safety failure; safety is a blocking release gate."),
  ],
  "tools-safety": [
    rule("Learned boundary", "What training data repairs legitimate-read versus suspicious-write behavior?", [["allowed", "legitimate"], ["denied", "suspicious"], ["balanced", "counterexample"]], "Use balanced allowed/denied counterexamples."),
    rule("Runtime enforcement", "What stays deterministic outside the model?", [["author"], ["confirm"], ["limit", "scope"], ["audit", "receipt"]], "Enforce authorization, confirmation, limits, and receipts in runtime code."),
    rule("Evaluation slices", "Which two error rates must be reported?", [["unsafe", "attack"], ["false refusal", "overblock"], ["rate", "slice"]], "Measure unsafe compliance and benign false refusals separately."),
  ],
  "tulu3-case-study": [
    rule("Stage allocation", "Which signal trains diagnostic/tool trajectories?", [["sft"], ["trajectory", "demonstration"]], "Use SFT demonstrations for valid diagnostic/tool trajectories."),
    rule("Reward allocation", "Which outcomes get exact checks versus rubrics?", [["test", "log", "exact", "verif"], ["diagnos", "report", "rubric"]], "Use exact verifiers for testable fixes and rubrics for open-ended diagnosis/report quality."),
    rule("Restart boundary", "What must authorize a service restart?", [["runtime"], ["service", "restart"], ["scope", "approval"], ["rollback", "audit"]], "Runtime policy must scope/approve restarts and provide rollback/audit."),
  ],
  "decoding-sampling": [
    rule("Poetry policy", "What decoding/evaluation suits poetry?", [["divers", "temperature", "top-p", "sample"], ["style", "human", "quality"]], "Use measured diversity and style/human evaluation."),
    rule("Extractor policy", "What decoding/evidence contract suits dose extraction?", [["determin", "constrain", "schema"], ["unit"], ["evidence", "validate"]], "Use deterministic/schema-constrained output with unit/evidence validation."),
    rule("Release blocker", "Which metric is non-compensable for the extractor?", [["dose", "dosage"], ["error", "incorrect", "malformed"], ["block", "zero", "severe"]], "Any severe incorrect/malformed dosage is a release blocker."),
  ],
  "generation-kv-cache": [
    rule("Cache accounting", "What can be shared and what remains private?", [["prefix"], ["shared"], ["private"], ["kv", "block"]], "Share immutable prefix KV blocks; keep request-specific blocks private."),
    rule("Isolation/invalidation", "What protects tenants and stale prefixes?", [["tenant"], ["key", "identity", "hash"], ["invalid", "evict", "reference"]], "Use tenant-safe keys, reference counts, and explicit invalidation/eviction."),
    rule("Correctness oracle", "What result must cached decoding match?", [["logit", "token"], ["uncached", "full", "prefill"], ["match", "compare"]], "Compare logits/tokens with a clean uncached full-prefill reference."),
  ],
  "quantization-memory": [
    rule("Ship decision", "Relate stable perplexity to the medical regression and deployment decision.", [["stable perplexity"], ["cannot override", "does not override", "not enough"], ["medical"], ["regress"], ["block deployment", "blocking gate"]], "Write that stable perplexity does not override the medical regression; the slice blocks deployment."),
    rule("Localization", "What should be measured next?", [["layer", "channel", "group"], ["outlier", "scale", "error"], ["token", "slice"]], "Localize reconstruction/activation error by layer/group and affected tokens."),
    rule("Mitigation", "Name a controlled precision alternative.", [["mixed", "selective", "higher"], ["precision"], ["calibration", "exception", "rerun"]], "Test selective higher precision/outlier exceptions with a representative calibration set."),
  ],
  "serving-systems": [
    rule("Scheduler", "How do you prevent long prefills from blocking short chats?", [["continuous", "chunk", "queue"], ["prefill"], ["short", "long"]], "Use continuous/chunked-prefill scheduling or separated queues."),
    rule("Latency slices", "Which metrics must be split by request shape?", [["ttft"], ["itl", "tpot"], ["p95"], ["p99"], ["short", "long"]], "Report TTFT/ITL p95/p99 separately for short and long requests."),
    rule("Fairness gate", "What aggregate win must be rejected?", [["throughput", "goodput"], ["starv", "block"], ["reject", "gate"]], "Reject aggregate throughput gains that starve either class or violate its SLO."),
  ],
  "test-time-compute": [
    rule("Initial budget", "What path do both easy and hard requests start on?", [["cheap", "bounded", "one"], ["pass", "attempt"]], "Start both with a bounded cheap attempt."),
    rule("Escalation", "What justifies more samples/tokens?", [["signal", "uncertain", "verify", "disagree"], ["value", "difficulty"], ["measure"]], "Escalate on measured signals and task value, not assumed perfect difficulty prediction."),
    rule("Stop/fallback", "What ends computation?", [["verif", "agreement", "diminish"], ["cap", "budget"], ["fallback", "escalate"]], "Stop on verification/agreement/diminishing returns with a hard cap and fallback."),
  ],
  "context-engineering": [
    rule("Authority order", "Which block comes first?", [["system", "application", "contract"], ["first", "before"]], "Place the application/system authority contract first."),
    rule("Evidence conflict", "How are conflicting sources represented?", [["source"], ["provenance", "date", "label"], ["conflict", "disagree"]], "Label/date sources and surface the conflict explicitly."),
    rule("Relevance/uncertainty", "What gets removed and when do you abstain/ask?", [["irrelevant", "history", "drop", "remove"], ["uncertain", "ask", "abstain"]], "Remove irrelevant history and ask/abstain where evidence cannot resolve authority."),
  ],
  rag: [
    rule("Retrieval test", "How do you measure the Arabic retrieval stage?", [["arabic"], ["recall", "rank"], ["relevant", "label"]], "Measure Arabic recall/ranks against labeled relevant passages."),
    rule("Oracle test", "What does oracle-context generation isolate?", [["oracle"], ["arabic"], ["generat"], ["retriev"]], "Replacing retrieval with correct Arabic evidence isolates generation from retrieval."),
    rule("Earliest failure", "How do you choose which stage to fix?", [["embedding", "index", "rerank", "generator"], ["earliest", "first"], ["oracle", "replacement"]], "Fix the earliest stage whose oracle replacement closes the gap."),
  ],
  "agent-loops": [
    rule("Deterministic spine", "Write the fixed workflow states.", [["ingest"], ["validate"], ["transform"], ["approve"]], "Keep ingest → validate → transform → approve deterministic."),
    rule("Optional branch", "Where is model choice actually needed?", [["missing evidence"], ["retriev"], ["once", "bounded", "optional"]], "Use a bounded model-assisted retrieval branch only when evidence is missing."),
    rule("Safety state", "What prevents repeated side effects and endless loops?", [["retry"], ["idempot"], ["terminal", "success", "failure", "human"], ["budget", "escalat"]], "Define retry budget, idempotency, and explicit success/failure/human terminal states."),
  ],
  "evaluation-design": [
    rule("Release action", "What happens after the 15-point regulated-slice loss?", [["block", "stop", "no ship"], ["regulated", "high-risk"], ["regress"]], "Block release under the predefined high-risk regression gate."),
    rule("Uncertainty/raw evidence", "What must accompany the aggregate score?", [["paired"], ["interval", "uncertainty"], ["raw", "example", "failure"]], "Report paired uncertainty and raw slice failures."),
    rule("Judge validation", "How is the grader checked before a final claim?", [["calibr", "agreement"], ["bias", "order"], ["human", "adjudicat"]], "Calibrate for bias/agreement and adjudicate severe cases with experts."),
  ],
  "security-privacy": [
    rule("Boundaries", "Name the core assets and trust boundaries.", [["resume", "candidate", "data"], ["model"], ["retriev", "tool"], ["decision", "human"]], "Separate candidate data, untrusted documents, model, tools, and human decision authority."),
    rule("Injection/privacy controls", "Where do injection and cross-candidate leakage controls sit?", [["untrusted"], ["isolate", "tenant", "candidate"], ["least", "minimiz", "scope"]], "Treat resumes as untrusted, isolate candidates, minimize data, and scope tools."),
    rule("Fairness/appeal", "What addresses sensitive attributes and overblocking?", [["sensitive", "fair"], ["review", "audit"], ["appeal", "human"]], "Use fairness review, privacy-minimized audit evidence, and a human appeal path."),
  ],
  "observability-governance": [
    rule("Immediate action", "What happens to the canary?", [["pause", "rollback"], ["canary"], ["privacy", "cost"]], "Pause or roll back the canary under privacy/cost gates."),
    rule("Diagnostic evidence", "What evidence localizes the changed stage without leaking data?", [["trace"], ["redact", "privacy", "hash"], ["version", "stage"]], "Use privacy-safe traces and version IDs to localize the changed stage."),
    rule("Ownership/learning", "How does the incident become a durable control?", [["owner"], ["test", "regression"], ["tenant", "cost"], ["rollback"]], "Assign owners and convert the failure into tenant/privacy/cost regression tests."),
  ],
  distillation: [
    rule("Available signal", "Which distillation signal is available through a response-only API?", [["sequence", "response", "demonstration"], ["not", "unavailable"], ["logit"]], "Use verified sequence responses because token logits/representations are unavailable."),
    rule("Teacher-error defense", "How do you prevent teacher blind spots from propagating?", [["ground truth", "human", "trusted"], ["mix"], ["teacher", "error", "blind"]], "Mix verified human/ground-truth data and audit known teacher-error slices."),
    rule("Held-out gates", "What determines whether the student ships?", [["correct"], ["calibr"], ["sequence", "style"], ["latency"], ["slice", "gate"]], "Gate held-out correctness/calibration/sequence quality and known error slices against latency gains."),
  ],
  lora: [
    rule("Compatibility/isolation", "What binds every tenant adapter to a safe base?", [["base"], ["revision"], ["adapter"], ["tenant", "isolate"]], "Pin each adapter to its base revision and enforce tenant isolation."),
    rule("Serving trade-off", "What is compared between merged and runtime adapters?", [["switch", "latency"], ["throughput", "batch"], ["memory", "artifact"]], "Benchmark switching/batching throughput, memory, and artifact proliferation."),
    rule("Rollback evidence", "What must a deployment record preserve?", [["provenance"], ["base", "adapter"], ["rollback"], ["benchmark", "quality"]], "Preserve base/adapter provenance, quality benchmark, and independent rollback."),
  ],
  moe: [
    rule("Router evidence", "What is the first routing measurement?", [["expert"], ["token count", "load"], ["overflow", "capacity"]], "Inspect per-expert token counts, load balance, and overflow."),
    rule("Compute/network evidence", "What separates small expert batches from network cost?", [["kernel", "util"], ["batch"], ["all-to-all", "network", "communication"]], "Measure expert-batch kernel utilization separately from all-to-all time."),
    rule("Diagnosis order", "Relate active FLOPs to latency, then name the missing diagnostics.", [["active flop"], ["cannot explain", "not enough", "do not determine"], ["latency"], ["router"], ["capacity", "kernel"], ["network"]], "Write that active FLOPs alone do not determine latency; inspect router, capacity/kernel, then network evidence."),
  ],
  "multimodal-models": [
    rule("Audio representation", "How is the two-minute audio divided and encoded?", [["segment", "chunk", "frame"], ["audio", "waveform", "feature"], ["encoder"]], "Segment the waveform into ordered audio features with an audio encoder."),
    rule("LM interface", "How do audio features enter the language model?", [["project", "resample", "align"], ["token", "embedding", "interface"], ["time", "position"]], "Project/resample features into the LM interface while preserving temporal position and token budget."),
    rule("Failure isolation", "Which evaluations separate perception from reasoning?", [["transcri", "perception", "localiz"], ["question", "reason"], ["separate", "oracle"]], "Evaluate transcription/localization separately from question answering/reasoning."),
  ],
  "interpretability-editing": [
    rule("Claim strength", "What is the strongest defensible claim?", [["prompt", "local", "tested"], ["behavior", "suppress", "change"], ["not", "no"], ["knowledge", "unlearn", "delete"]], "Claim only prompt-local behavioral change, not knowledge deletion/unlearning."),
    rule("Observed failures", "Which generalization/locality failures must be reported?", [["paraphrase"], ["unrelated", "neighbor"], ["locality", "side effect"]], "Report paraphrase failure and unrelated/neighbor side effects."),
    rule("Next controls", "What experiment tests causality and persistence next?", [["sham", "random", "control"], ["paraphrase"], ["restart", "reload", "persist"], ["robust"]], "Use matched shams, paraphrases/neighbors, and reload/persistence tests."),
  ],
};
