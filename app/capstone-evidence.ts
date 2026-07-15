import { publicPath } from "./public-path";

export type CapstoneEvidencePack = {
  starter: { title: string; fields: { field: string; help: string; example: string }[] };
  reference: { title: string; sections: { heading: string; content: string }[] };
  checks: { label: string; terms: string[] }[];
  sources: { label: string; revision: string; url: string; readFor: string; kind?: string }[];
};

export const capstoneEvidencePacks: Record<string, CapstoneEvidencePack> = {
  optimizers: {
    starter: { title: "Learning-step calculation sheet", fields: [
      { field: "Model contract", help: "Name inputs, parameters, target, equations, and every shape.", example: "$x[2]=[1,2]$, $w[2]=[0.2,-0.1]$, $y=1$, $z=x\\cdot w$, $p=\\sigma(z)$." },
      { field: "Forward evidence", help: "Record logit, probability, loss, and one interpretation.", example: "$z=0$, $p=0.5$, $L=0.693$: the target is 1, so confidence is insufficient." },
      { field: "Backward/update", help: "Show local derivatives, gradient sign, optimizer state, and new parameters.", example: "$dL/dz=-0.5$, $dL/dw=[-0.5,-1]$, $w'=[0.25,0]$ at $\\eta=0.1$." },
      { field: "Independent check", help: "Use a second forward pass and centered finite difference; diagnose any discrepancy.", example: "$p'=0.562$, $L'=0.576$; finite difference at $\\epsilon=10^{-3}$ should closely match each analytic gradient." },
    ]},
    reference: { title: "Complete reference field note", sections: [
      { heading: "1 · Forward and shapes", content: "The supplied vectors both have shape $[2]$ and contract to scalar $z=1(0.2)+2(-0.1)=0$. Sigmoid gives $p=0.5$; binary cross-entropy for $y=1$ is $-\\log(0.5)=0.693147$. Every number is reproducible from the stated contract." },
      { heading: "2 · Chain rule and update", content: "$\\partial L/\\partial z=p-y=-0.5$. Because $\\partial z/\\partial w=x$, $\\nabla_wL=(-0.5)[1,2]=[-0.5,-1]$. SGD at $\\eta=0.1$ gives $w'=[0.25,0]$. Both coordinates rise because positive inputs should increase the target-one logit." },
      { heading: "3 · Verification", content: "The new logit is 0.25, so $p'=0.562177$ and $L'=0.575939$: the sufficiently small local step lowered loss. For each coordinate, compute $[L(w_i+0.001)-L(w_i-0.001)]/0.002$ and compare absolute/relative error with the analytic gradient." },
      { heading: "4 · Diagnosed failure", content: "If the update uses $w'=w+\\eta g$, loss rises because gradient descent's sign was reversed. If $\\eta$ becomes 10 or 100 times larger, a first step may still lower loss, but that never proves stability: repeat steps and plot loss before claiming the larger rate is better." },
    ]},
    checks: [{ label: "Shapes and equations are explicit", terms: ["shape", "z", "p"] }, { label: "A numerical gradient and tolerance are reported", terms: ["finite", "epsilon", "gradient"] }, { label: "A failure is diagnosed causally", terms: ["sign", "learning rate", "loss"] }],
    sources: [
      { label: "PyTorch SGD convention", revision: "PyTorch 2.9 documentation", url: "https://docs.pytorch.org/docs/2.9/generated/torch.optim.SGD.html", readFor: "Find the parameter-update sign and momentum-state definition; compare them with your equation." },
      { label: "Autograd gradcheck", revision: "PyTorch 2.9 documentation", url: "https://docs.pytorch.org/docs/2.9/generated/torch.autograd.gradcheck.gradcheck.html", readFor: "Identify the numerical/analytical comparison and precision assumptions; explain why float64 is commonly used." },
    ],
  },
  "gpt2-from-scratch": {
    starter: { title: "Tiny-GPT experiment manifest", fields: [
      { field: "Immutable run identity", help: "Record repository commit, environment lock, seed, dataset hash/license, tokenizer artifact, and hardware.", example: "Reference comparison: nanochat@a825e63; learner run: your own commit plus `uv.lock` hash." },
      { field: "Correctness dossier", help: "List shift, padding, causal-mask, shape, overfit-one-batch, and resume-equivalence tests.", example: "Changing token $t+1$ must not change logits at positions $\\le t$." },
      { field: "Training evidence", help: "Log train/validation loss, tokens, throughput, memory, fixed-seed samples, and checkpoints.", example: "Evaluate every 200 steps and preserve raw CSV/JSON, not screenshots alone." },
      { field: "Controlled ablation", help: "Change one treatment at matched token/compute budget and write the falsifier first.", example: "Position embeddings on/off; same initialization family, data split, steps, and evaluator." },
    ]},
    reference: { title: "Runnable reference-package specification", sections: [
      { heading: "Repository and commands", content: "A credible package contains `model.py`, `data.py`, `train.py`, `sample.py`, `tests/`, an environment lock, a public-domain corpus hash/license, `config.json`, and `README` commands for `pytest`, one-batch overfit, training, resume, evaluation, and fixed-seed sampling." },
      { heading: "Invariant-test report", content: "The decoded input/label fixture proves one-token shifting. The causal test mutates a future token and records zero earlier-logit change within tolerance. The overfit fixture drives one tiny batch near zero loss. Resume runs N+M steps continuously and N then M from checkpoint; weights/optimizer/data cursor agree within the declared determinism tolerance." },
      { heading: "Run log and curves", content: "The report includes machine-readable step, trained tokens, train loss, validation loss, learning rate, tokens/s, memory, elapsed time, and checkpoint ID. Curves are generated from that file. Samples use fixed prompts/seeds at fixed checkpoints and are evidence secondary to held-out metrics." },
      { heading: "Ablation conclusion", content: "Control and treatment differ only in the named position mechanism. Report paired held-out loss, order-sensitive probes, uncertainty across seeds, cost, and the predeclared decision. If the treatment fails, preserve the negative result and narrow the claim to this scale/data/budget." },
    ]},
    checks: [{ label: "All six correctness tests are named", terms: ["causal", "overfit", "resume", "shift"] }, { label: "Raw metrics and samples are reproducible", terms: ["seed", "validation", "tokens", "checkpoint"] }, { label: "Ablation has control and falsifier", terms: ["control", "treatment", "fals"] }],
    sources: [
      { label: "nanochat reference speedrun", revision: "commit a825e63 (14 Mar 2026 leaderboard entry)", url: "https://github.com/karpathy/nanochat/tree/a825e63", readFor: "Inspect `runs/speedrun.sh`, the metric definitions, and environment before adapting—not copying—the reference." },
      { label: "GPT-2 released checkpoint", revision: "openai-community/gpt2@607a30d", url: "https://huggingface.co/openai-community/gpt2/tree/607a30d", readFor: "Compare architecture/config and weight shapes with your implementation; do not treat a matching sample as a weight-level reproduction." },
      { label: "GPT-2 primary report", revision: "2019 report", url: "https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf", readFor: "Locate the causal language-model objective and model-size table; state which training details your tiny run does not reproduce." },
    ],
  },
  "olmo3-case-study": {
    starter: { title: "Annotated model-flow audit table", fields: [
      { field: "Incoming artifact", help: "Exact checkpoint/config/data revision entering a stage.", example: "OLMo-core v2.4.0 official OLMo3 base script and entering checkpoint manifest." },
      { field: "Treatment and hypothesis", help: "What changes, why it should work, and what is held fixed.", example: "Increase verified-code mixture at equal tokens; hypothesis: execution rises without unacceptable broad-loss regression." },
      { field: "Evidence and strength", help: "Separate reported, reproduced, inferred, and unknown evidence.", example: "Reported config + checkpoint; learner reproduction planned; causal attribution remains unknown without control." },
      { field: "Decision rule", help: "Metrics, uncertainty, risk, stop rule, and next action.", example: "Ship only if paired execution gain clears uncertainty and held-out broad loss stays within gate." },
    ]},
    reference: { title: "Worked mini-replication proposal", sections: [
      { heading: "Question and provenance", content: "Question: does a targeted verified-code mid-training mixture improve small-model execution without broad forgetting? Pin OLMo-core v2.4.0, the learner dataset manifests/hashes, tokenizer, environment, base checkpoint, and evaluator revision. Label published OLMo facts separately from this course-scale experiment." },
      { heading: "Control and treatment", content: "Branch one 50M–150M parameter checkpoint into equal 200M-token runs. Control continues the base mixture; treatment uses 40% license-reviewed, deduplicated, executable code and 60% base mix. Freeze optimizer, schedule, batch, sequence length, seeds, checkpoint cadence, and total loss-bearing tokens." },
      { heading: "Measurements and analysis", content: "At entering/intermediate/final checkpoints report held-out base loss, decontaminated code loss, execution pass rate with raw outputs, memorization checks, slice retention, throughput, failures, and three-seed uncertainty. Inspect data mixture realization rather than trusting configured percentages." },
      { heading: "Risks and stop rule", content: "Stop for non-finite loss, license/provenance failure, duplicated evaluation data, or broad-loss regression beyond the declared bound. Keep the treatment only if execution gain clears uncertainty and cost/regression gates. A null result rejects this mixture claim at this scale; it does not disprove targeted mid-training generally." },
    ]},
    checks: [{ label: "Every flow row names an artifact and hypothesis", terms: ["checkpoint", "config", "hypothesis"] }, { label: "Proposal has equal-budget control/treatment", terms: ["control", "treatment", "token"] }, { label: "Metrics, risks, and stop rule are operational", terms: ["uncertainty", "stop", "risk"] }],
    sources: [
      { label: "Official OLMo 3 scripts", revision: "OLMo-core v2.4.0 / commit 1ed8900", url: "https://github.com/allenai/OLMo-core/tree/v2.4.0/src/scripts/official/OLMo3", readFor: "Locate the exact model/data/trainer fields feeding each stage and record what the release does not expose." },
      { label: "OLMo-core release record", revision: "v2.4.0", url: "https://github.com/allenai/OLMo-core/releases/tag/v2.4.0", readFor: "Find the OLMo 3 pretraining, midtraining, and long-context additions plus the fixes affecting reproduction." },
    ],
  },
  "tulu3-case-study": {
    starter: { title: "Signal-to-stage design ledger", fields: [
      { field: "Behavior and evidence", help: "Define the desired observable behavior and available supervision.", example: "Exact tool task: parsed result can be verified; research synthesis: evidence quality needs a multidimensional rubric." },
      { field: "Training stage", help: "Name incoming model, records, objective, intended delta, and regression.", example: "SFT learns valid trajectories; DPO refines relative quality; RLVR is limited to stable verifiers." },
      { field: "Runtime boundary", help: "Name permissions, budgets, confirmation, provenance, and termination enforced outside weights.", example: "Model proposes a call; deterministic runtime validates schema, credential scope, user confirmation, and receipt." },
      { field: "Evaluation gate", help: "Compare checkpoints with target, safety, general, cost, and attack slices.", example: "A reward gain cannot compensate for an unauthorized-action failure." },
    ]},
    reference: { title: "Complete dual-purpose assistant design", sections: [
      { heading: "Task/data specification", content: "Create five exact tasks with stable parsers/verifiers, five source-grounded research tasks with dated evidence rubrics, and ambiguity cases requiring clarification. Each record has provenance, rights, split group, role-serialized messages, tool schema, success, severe failure, and maximum cost." },
      { heading: "Training ledger", content: "Start from a pinned base. SFT covers ideal answers, valid tool trajectories, abstention, and recovery. DPO uses blinded chosen/rejected pairs with length/source audits. RLVR is used only for exact outcomes resistant to spoofing. Online research reward, if used, is calibrated against human/source audits and cannot authorize actions." },
      { heading: "Runtime and attacks", content: "Search/browse are read-only by default; credentials are scoped; arguments and outputs are schema-validated; retrieved text is untrusted; consequential calls require confirmation; every action has idempotency key, budget, timeout, provenance, receipt, and termination reason. Test indirect injection, citation non-entailment, repeated writes, and tool-result spoofing." },
      { heading: "Results and launch memo", content: "Compare base/SFT/DPO/RL checkpoints on identical prompts/decoding. Report exact pass and spoof rate; research claim coverage, citation entailment/source quality, synthesis, evaluator agreement; broad capability, over-refusal, invalid actions, latency, tokens/tools, cost, and uncertainty. Ship only if all non-compensable safety gates pass; record rollback checkpoint and triggers." },
    ]},
    checks: [{ label: "All signals are tied to behaviors and data", terms: ["sft", "dpo", "rlvr", "data"] }, { label: "Authorization remains a runtime control", terms: ["permission", "credential", "confirmation"] }, { label: "Evaluation compares stages and attacks", terms: ["base", "attack", "rollback"] }],
    sources: [
      { label: "Tülu 3/3.1 reproduction", revision: "open-instruct@745bf58d321c", url: "https://github.com/allenai/open-instruct/blob/745bf58d321c/docs/tulu3.md", readFor: "Map exact commands, datasets, checkpoints, DPO settings, verifier changes, and legacy-script warnings into your ledger." },
      { label: "Pinned Open Instruct code", revision: "commit 745bf58d321c", url: "https://github.com/allenai/open-instruct/tree/745bf58d321c", readFor: "Identify which behavior comes from training code and which controls are absent because they belong to deployment." },
      { label: "Tülu 3 primary paper", revision: "arXiv:2411.15124", url: "https://arxiv.org/abs/2411.15124", readFor: "Find the stage-wise evaluations and limitations; note where the evidence is recipe-specific." },
    ],
  },
  "test-time-compute": {
    starter: { title: "Service and SLO worksheet", fields: [
      { field: "Workload contract", help: "Model/revision, prompt/output distributions, concurrency, priority, hardware, and duration.", example: "vLLM v0.23.0; pinned model; 70% short chat/30% long reasoning; 1–32 concurrent; warm + cold runs." },
      { field: "SLO and budget", help: "Set p50/p95 TTFT, inter-token latency, end-to-end latency, goodput, memory, quality, and cost gates.", example: "p95 TTFT ≤1.2s, p95 TPOT ≤45ms, ≥95% requests meet both, quality regression ≤1 point." },
      { field: "Experiment matrix", help: "Define one-factor treatments, repetitions, warmup, synchronization, and raw schema.", example: "Continuous batching on/off at fixed model/requests; 3 repetitions; preserve every request trace." },
      { field: "Falsification decision", help: "State expected win, uncertainty, regression gate, and rollback before testing.", example: "Reject continuous batching if throughput rises but goodput or tail SLO falls." },
    ]},
    reference: { title: "Reproducible benchmark report", sections: [
      { heading: "Manifest", content: "Record server vLLM v0.23.0, container digest, driver/CUDA, accelerator and count, model/tokenizer IDs and revisions, quantization, cache dtype, max lengths, scheduler flags, client commit, prompt-set hash/license, seeds, clocks, and background load." },
      { heading: "Raw measurement schema", content: "One row per request: request/trace ID, arrival/queue/start/first-token/end timestamps, input/output/reasoning tokens, status/error, batch/cache events, memory, energy/cost allocation, and quality item ID. Derive TTFT, TPOT, E2E, throughput, goodput, p50/p95/p99, OOM/error rate from raw rows." },
      { heading: "Controlled results", content: "Compare static versus continuous batching and one test-time-compute budget at matched workload. Use warmup, randomized order, at least three repetitions, confidence intervals, load curves, and quality evaluation. Separate capacity, goodput, and tail behavior; show individual outliers." },
      { heading: "Decision and falsifier", content: "Adopt a treatment only when its interval clears the predeclared quality/SLO/cost gate. A treatment that raises tokens/s but violates p95 or quality is rejected. Preserve config, raw CSV, analysis code, plots, failed requests, and a rerun command." },
    ]},
    checks: [{ label: "Manifest pins server, model, tool, and hardware", terms: ["vllm", "revision", "hardware"] }, { label: "Raw data supports tail and goodput metrics", terms: ["ttft", "p95", "goodput"] }, { label: "Decision uses a predeclared falsifier", terms: ["reject", "quality", "slo"] }],
    sources: [
      { label: "vLLM server release", revision: "v0.23.0 / commit 91df0fa", url: "https://github.com/vllm-project/vllm/releases/tag/v0.23.0", readFor: "Record scheduler/cache/version behavior relevant to the benchmark and any breaking dependency assumptions." },
      { label: "vLLM primary systems paper", revision: "SOSP 2023", url: "https://arxiv.org/abs/2309.06180", readFor: "Locate PagedAttention and serving evaluation assumptions; distinguish paper configuration from your pinned release." },
    ],
  },
  "observability-governance": {
    starter: { title: "Safe-agent evidence package", fields: [
      { field: "System/threat boundary", help: "Assets, actors, trust boundaries, data flows, allowed effects, and owners.", example: "Retrieved documents are untrusted; search is read-only; no private corpus crosses tenant boundary." },
      { field: "Trace and evaluation", help: "Define privacy-aware spans plus groundedness, retrieval, action, safety, latency, and cost slices.", example: "Trace prompt hash, retrieved IDs/scores, claims/citations, proposed/authorized calls, policy decision, receipt—not raw secrets." },
      { field: "Attack results", help: "Preserve each attack input, expected control, observed outcome, severity, and fix.", example: "Indirect source asks for exfiltration; runtime denies unavailable write capability while benign search still succeeds." },
      { field: "Operations", help: "Set SLOs, gates, owner, alert, rollback, deletion, and incident drill.", example: "Critical authorization violation blocks launch and triggers credential revoke + trace preservation." },
    ]},
    reference: { title: "Complete source-grounded agent package", sections: [
      { heading: "Threat model and architecture", content: "Assets include user queries, private sources, credentials, outputs, logs, and downstream effects. Boundaries separate user, model, retrieval index, untrusted documents, policy engine, tool executor, and telemetry store. The model proposes; deterministic code authorizes. Document least privilege, tenancy, encryption, retention, deletion, and human confirmation." },
      { heading: "Trace schema and evaluation table", content: "Use OpenTelemetry semantic conventions v1.41.1 and record versioned prompt/model/retriever/reranker/policy IDs; hashed/redacted inputs; retrieved document IDs/scores; claims/citations; proposed/authorized tool calls; latency/tokens/cost; evaluation events; errors; termination and rollback linkage. Evaluation includes retrieval recall, citation entailment, answer coverage, abstention, action validity, attack success, overblocking, tail latency, and cost with uncertainty." },
      { heading: "Attack campaign and gates", content: "Run direct and indirect injection, malicious metadata, cross-tenant retrieval, citation laundering, tool-argument smuggling, repeated/idempotency failures, secret requests, and denial-of-wallet. Preserve raw outcomes. Critical unauthorized effect or secret disclosure is non-compensable; excessive benign blocking also fails usefulness." },
      { heading: "Rollback and incident drill", content: "Launch progressively with owner and on-call. Roll back prompt/model/index/policy independently using version IDs. On a simulated exfiltration alert: disable affected tool, revoke credential, preserve redacted trace, identify blast radius, notify owner, remediate, replay attacks, document root cause and deletion obligations, then require gate approval before restore." },
    ]},
    checks: [{ label: "Threat model names assets and boundaries", terms: ["asset", "boundary", "credential"] }, { label: "Trace schema supports evidence and privacy", terms: ["trace", "redact", "citation"] }, { label: "Attacks, gates, rollback, and incident owner exist", terms: ["attack", "rollback", "owner"] }],
    sources: [
      { label: "OpenTelemetry GenAI conventions", revision: "semantic-conventions v1.41.1", url: "https://github.com/open-telemetry/semantic-conventions/tree/v1.41.1/docs/gen-ai", readFor: "Map the versioned GenAI spans/metrics to the proposed trace and note which content fields are opt-in due to sensitivity." },
      { label: "OWASP LLM Top 10", revision: "2025 edition; reviewed 13 Jul 2026", url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/", readFor: "Connect each relevant risk to a concrete trust boundary and test; do not use the list as the threat model itself." },
      { label: "NIST AI RMF", revision: "AI 100-1", url: "https://www.nist.gov/itl/ai-risk-management-framework", readFor: "Locate governance, measurement, management, and documentation responsibilities that must have named owners." },
    ],
  },
  "interpretability-editing": {
    starter: { title: "Intervention notebook schema", fields: [
      { field: "Bounded claim", help: "Name model/revision, prompts/dataset, layer/site, metric, and scope.", example: "At one named residual-stream site, a direction predicts this prompt-set contrast; no claim of a human-readable universal concept." },
      { field: "Controls", help: "Define matched, random/sham, neighbor, layer, magnitude, and no-intervention controls.", example: "Same-norm random directions and nearby layers distinguish specificity from generic disruption." },
      { field: "Effect/locality/persistence", help: "Report paired effect sizes and intervals on target, neighbors, broad tasks, and after reload/further context.", example: "Target logit-difference change, KL/perplexity, unrelated factual QA, paraphrases, and multi-turn persistence." },
      { field: "Decision", help: "State strongest defensible conclusion, falsifier, failure modes, and rollback.", example: "Reject causal-specific claim if sham effects overlap or broad degradation explains the target change." },
    ]},
    reference: { title: "Reproducible intervention report", sections: [
      { heading: "Manifest and prompts", content: "Pin GPT-2@607a30d or another licensed model, TransformerLens/library and environment versions, tokenizer, prompt/dataset hashes, hook names, seeds, dtype/device, and all preprocessing. Preserve target, paraphrase, neighbor, counterfactual, and broad-control prompts before inspecting results." },
      { heading: "Observation and intervention", content: "First measure activation/logit associations at a named layer/site. Then apply a predeclared zero/ablate/add/edit intervention at matched magnitudes. Include no-op, same-norm random/sham directions, neighboring layers, unrelated token positions, and dose response. Never infer causality from a probe or attention pattern alone." },
      { heading: "Results table", content: "For every condition report N, target logit-difference/accuracy before and after, paired effect and interval, KL/perplexity, neighbor/paraphrase effects, unrelated-task regression, specificity versus sham, locality across prompts, and persistence after additional context/reload. Include failed examples and raw outputs." },
      { heading: "Bounded conclusion", content: "A strong result permits: ‘this intervention causally changes the measured behavior at these prompts/sites more than matched shams, within reported side effects.’ It does not permit: ‘the model stores the fact only here’ or ‘this neuron means X.’ Reject the claim if controls overlap, effect vanishes on paraphrases, or broad damage explains it." },
    ]},
    checks: [{ label: "Model, site, data, and intervention are pinned", terms: ["revision", "layer", "hook"] }, { label: "Matched/sham and neighbor controls are present", terms: ["sham", "neighbor", "control"] }, { label: "Effect size, locality, persistence, and bounded claim are reported", terms: ["effect", "locality", "persistence"] }],
    sources: [
      { label: "TransformerLens implementation", revision: "record installed release/commit in notebook; source reviewed 13 Jul 2026", url: "https://github.com/TransformerLensOrg/TransformerLens", readFor: "Pin the exact hook/cache behavior used and link the relevant implementation line in the report." },
      { label: "GPT-2 model artifact", revision: "openai-community/gpt2@607a30d", url: "https://huggingface.co/openai-community/gpt2/tree/607a30d", readFor: "Verify the exact model/tokenizer files and architecture before naming layers or comparing checkpoints." },
      { label: "Causal tracing / model editing method", revision: "ROME primary paper, 2022", url: "https://arxiv.org/abs/2202.05262", readFor: "Identify the intervention, controls, efficacy, generalization, and specificity metrics; state which claim your smaller experiment can support." },
    ],
  },
};

export const capstoneArtifactFiles: Record<string, { label: string; url: string; contents: string[] }> = {
  optimizers: { label: "Complete numerical field note · JSON", url: publicPath("capstone-artifacts/optimizer-learning-step.json"), contents: ["inputs and shapes", "forward/backward/update numbers", "finite-difference tolerance", "diagnosed sign failure"] },
  "gpt2-from-scratch": { label: "Executable Tiny-GPT run · JSON", url: publicPath("capstone-artifacts/tiny-gpt-reference-run.json"), contents: ["dependency-free generator", "five recomputed tests", "training metrics", "checkpoint/resume equivalence", "position ablation"] },
  "olmo3-case-study": { label: "OLMo flow audit · JSON", url: publicPath("capstone-artifacts/olmo3-flow-audit.json"), contents: ["filled flow table", "control/treatment/budget", "explicitly simulated result rows", "decision and stop rules"] },
  "tulu3-case-study": { label: "Dual-purpose design · JSON", url: publicPath("capstone-artifacts/tulu-dual-purpose-design.json"), contents: ["task records", "stage ledger", "matched evaluation", "attack outcomes", "launch memo"] },
  "test-time-compute": { label: "Executable service fixture · JSON", url: publicPath("capstone-artifacts/inference-service-benchmark.json"), contents: ["exact simulator manifest and SLO", "every raw request row", "recomputed percentiles/goodput", "accept/reject decision"] },
  "observability-governance": { label: "Safe-agent operations package · JSON", url: publicPath("capstone-artifacts/safe-agent-operations.json"), contents: ["threat boundaries", "trace fixture", "evaluation and attacks", "gates", "incident drill"] },
  "interpretability-editing": { label: "Executable intervention analysis · JSON", url: publicPath("capstone-artifacts/interpretability-intervention.json"), contents: ["24 raw condition rows", "recomputed effect and interval", "locality/persistence rows", "matched sham controls", "bounded fixture claim"] },
};
