import type { LessonGuide } from "./types";

export const systemsGuides: Record<string, LessonGuide> = {
  "decoding-sampling": {
    objectives: ["Convert logits into controlled token choices", "Predict the effects of temperature, top-k, and top-p", "Match decoding policy to task and evaluation"],
    vocabulary: [
      { term: "Logit", meaning: "An unnormalized score for a possible next token." },
      { term: "Temperature", meaning: "A divisor applied to logits before softmax that controls distribution sharpness." },
      { term: "Top-p sampling", meaning: "Sampling only from the smallest high-probability token set whose cumulative mass reaches p." },
      { term: "Beam search", meaning: "Keeping several high-scoring partial sequences while expanding generation." },
    ],
    sections: [
      { title: "The model scores; the decoder decides", paragraphs: [
        "At each generation step, the model outputs one logit per vocabulary item. Softmax creates probabilities, but a decoding algorithm still chooses the token. Greedy decoding takes the maximum. Sampling draws randomly. Temperature below 1 sharpens logit differences; above 1 flattens them. Top-k truncates to a fixed number of candidates, while top-p uses a variable set whose total probability reaches a threshold.",
        "These controls do not add knowledge or reasoning. They change how the model’s uncertainty becomes text. Deterministic choices aid reproducible extraction and evaluation; sampling can improve diversity and explore multiple solutions. Very aggressive truncation can remove the correct low-probability continuation, while high temperature can amplify weak alternatives.",
      ] },
      { title: "Sequences need more than token-wise probability", paragraphs: [
        "A locally likely token can lead to a poor complete answer. Beam search tracks multiple prefixes and is useful when sequence likelihood correlates with quality, such as constrained transcription, but can favor short or generic text without length handling. Repetition penalties, stop sequences, minimum lengths, schema constraints, and banned-token rules further shape the search space.",
        "Choose settings through task-level evaluation. For factual question answering, measure correctness and calibration across temperatures. For creative writing, measure diversity plus coherence. For code, sample several candidates and run tests. Always record seed and decoding configuration: two evaluations with different sampling are different experiments.",
      ] },
    ],
    walkthrough: [
      { title: "Transform logits", body: "Apply allowed biases or constraints, divide by temperature, then compute softmax in a numerically stable way.", checkpoint: "At temperature approaching zero, selection approaches argmax rather than uniform sampling." },
      { title: "Truncate and renormalize", body: "Keep top-k or the top-p nucleus, zero excluded probabilities, and renormalize the remainder.", checkpoint: "Top-p candidate count changes with how concentrated the distribution is." },
      { title: "Sample and stop", body: "Draw using a seeded generator, append the token, and stop on EOS, a validated sequence, or a length limit.", checkpoint: "A textual stop substring can split across tokens and needs careful handling." },
    ],
    guidedExample: { title: "Turn a logit gap into behavior", setup: "Tokens A, B, C have logits [2, 1, 0].", steps: [
      "At temperature 1, probabilities are about [0.67, 0.24, 0.09].",
      "At temperature 0.5, logits become [4, 2, 0], sharpening probabilities to about [0.87, 0.12, 0.02].",
      "With top-p 0.8 at temperature 1, A and B are kept because A alone is below 0.8 and A+B exceed it; C is excluded.",
    ], result: "Temperature changes relative odds before truncation, so the order of decoding operations matters." },
    practice: { prompt: "A team raises temperature and gets more diverse but less accurate answers. Should it retrain the model to undo the change?", hint: "Identify whether parameters or selection policy changed.", answer: "No retraining is required to restore the prior behavior; reset the decoding settings. Retraining may improve the underlying distribution, but the observed shift was caused directly by sampling policy." },
    resources: [
      { title: "Generation strategies", url: "https://huggingface.co/docs/transformers/generation_strategies", kind: "Documentation", note: "Practical definitions and code for greedy, sampling, beam, and constrained decoding." },
      { title: "The Curious Case of Neural Text Degeneration", url: "https://arxiv.org/abs/1904.09751", kind: "Paper", note: "Introduces nucleus sampling and analyzes repetition and blandness in decoding." },
      { title: "How to generate text", url: "https://huggingface.co/blog/how-to-generate", kind: "Article", note: "A visual, code-oriented comparison of common decoding strategies." },
    ],
  },

  "generation-kv-cache": {
    objectives: ["Trace prefill and decode phases", "Compute how a KV cache avoids repeated attention work", "Explain cache memory, batching, and context trade-offs"],
    vocabulary: [
      { term: "Prefill", meaning: "Processing all prompt tokens to create initial hidden states and key/value cache entries." },
      { term: "Decode", meaning: "Generating subsequent tokens one step at a time using the existing cache." },
      { term: "KV cache", meaning: "Stored attention keys and values for earlier positions in every layer." },
      { term: "Time to first token", meaning: "Latency between request arrival and the first generated token." },
    ],
    sections: [
      { title: "Generation has two different performance regimes", paragraphs: [
        "During prefill, the model processes the whole prompt in parallel and builds keys and values for every layer and position. This phase performs large matrix multiplications and attention over the prompt; its cost grows quickly with context length. During decode, only the newest token is passed through the stack, but it attends to all cached prior keys and values. Decode is sequential and often limited by repeatedly reading model weights and cache memory.",
        "Without a KV cache, generating token t would recompute representations for the entire prefix even though causal keys and values for older tokens cannot change. Caching trades memory for computation. Queries are not cached because each old query’s output was already used; future tokens need the old keys for matching and values for retrieval.",
      ] },
      { title: "The cache becomes a serving resource", paragraphs: [
        "Cache size is roughly proportional to $$L \\times T \\times B \\times H_{kv} \\times d_{head} \\times 2 \\times \\text{bytes}.$$ Multi-query and grouped-query attention reduce KV heads and therefore cache size. Quantized caches and paged allocation can reduce waste, while prefix caching reuses identical prompt regions across requests.",
        "Serving schedulers mix requests at different decode positions. Continuous batching inserts new work as others finish; paged attention stores non-contiguous cache blocks without requiring one huge contiguous allocation. Cancellations, maximum context, and output limits are capacity controls as much as API features.",
      ] },
    ],
    walkthrough: [
      { title: "Prefill once", body: "Process T prompt tokens, write one K and V per relevant layer/head/position, and produce logits for the final position.", checkpoint: "The first sampled continuation comes after prefill, so long prompts increase first-token latency." },
      { title: "Decode one", body: "Embed the newest token, compute only its Q/K/V, append new K/V, and attend its query over all cached positions.", checkpoint: "Decode avoids recomputing old projections but still reads an ever-growing cache." },
      { title: "Schedule many", body: "Allocate cache blocks and batch active decode steps while admitting prefill without causing unacceptable latency spikes.", checkpoint: "Maximizing throughput can worsen per-user inter-token latency." },
    ],
    guidedExample: { title: "Estimate one cache", setup: "A model has 32 layers, 8 KV heads, head dimension 128, context 4,096, bf16 values, and batch 1.", steps: [
      "Each token stores $K$ and $V$: $2 \\times 8 \\times 128 = 2{,}048$ elements per layer.",
      "Across layers and context: $2{,}048 \\times 32 \\times 4{,}096 \\approx 268$ million elements.",
      "At 2 bytes each, the cache is about 537 MB, before allocator overhead. Batch 8 would need roughly eight times as much.",
    ], result: "Long context can consume substantial memory even when model weights fit comfortably." },
    practice: { prompt: "Why can prefix caching help repeated system prompts but not two prompts that merely mean the same thing?", hint: "Cache entries are computed from exact token positions and values.", answer: "The cached keys and values correspond to an exact tokenized prefix (and position/configuration). Semantically similar wording produces different tokens and activations, so it cannot safely reuse the same cache without a specialized approximation." },
    resources: [
      { title: "The Illustrated GPT-2", url: "https://jalammar.github.io/illustrated-gpt2/", kind: "Article", note: "A visual explanation of autoregressive generation and attention state reuse." },
      { title: "PagedAttention", url: "https://arxiv.org/abs/2309.06180", kind: "Paper", note: "Explains virtual-memory-style KV-cache management and continuous batching in vLLM." },
      { title: "vLLM documentation", url: "https://docs.vllm.ai/", kind: "Documentation", note: "Concrete serving concepts including paged caches, prefix caching, and scheduling." },
    ],
  },

  "quantization-memory": {
    objectives: ["Account for inference memory beyond parameter count", "Explain weight and activation quantization", "Choose precision using measured quality, speed, and hardware support"],
    vocabulary: [
      { term: "Quantization", meaning: "Representing values with fewer bits and a scale/zero-point mapping." },
      { term: "Calibration set", meaning: "Representative examples used to choose quantization scales or estimate error." },
      { term: "Outlier", meaning: "A value whose magnitude is far from most values and can dominate a quantization range." },
      { term: "Dequantization", meaning: "Reconstructing approximate higher-precision values for computation or interpretation." },
    ],
    sections: [
      { title: "Precision is a systems choice with numerical consequences", paragraphs: [
        "A 7B-parameter model uses about 14 GB for bf16 weights, 7 GB at 8-bit, or 3.5 GB at ideal 4-bit before scales, metadata, and padding. Inference also needs KV cache, temporary activations, kernel workspace, runtime overhead, and sometimes multiple replicas. Reducing weight bytes may allow a model to fit, increase batch size, or reduce memory bandwidth per generated token.",
        "Quantization maps groups of real values to a limited integer grid. Per-tensor scaling is cheap but vulnerable to outliers; per-channel or groupwise scales adapt locally at metadata and kernel cost. Symmetric schemes center around zero; asymmetric schemes include a zero point. The useful configuration is the one supported by fast kernels on the target hardware.",
      ] },
      { title: "Weight-only, activation, cache, and training-aware methods", paragraphs: [
        "Weight-only post-training quantization stores low-bit weights and combines dequantization with matrix operations. Weight-plus-activation quantization can reduce more bandwidth but activations vary by input and contain outliers. SmoothQuant redistributes scale between activations and weights; GPTQ and AWQ use calibration information to protect important behavior. Quantization-aware training simulates low precision during updates.",
        "Measure perplexity and target tasks, but also latency by prompt/output length, throughput, peak memory, energy, and numerical failures. Small average quality changes can hide severe regressions in rare languages, code, arithmetic, or long context. Never infer speed from bit width alone: an unsupported 4-bit format may dequantize slowly and lose to optimized 8-bit or bf16.",
      ] },
    ],
    walkthrough: [
      { title: "Profile the baseline", body: "Measure weight bytes, cache growth, peak runtime memory, latency, throughput, and quality on representative traffic.", checkpoint: "Optimize the actual bottleneck; quantized weights cannot fix a cache-dominated workload." },
      { title: "Calibrate and convert", body: "Choose representative sequences, group size, clipping/scales, and a hardware-supported kernel path.", checkpoint: "A narrow calibration set can preserve one domain while damaging another." },
      { title: "Evaluate end to end", body: "Compare quality slices, prompt/output regimes, concurrency, startup time, and memory under identical service settings.", checkpoint: "A smaller file is not proof of faster or better serving." },
    ],
    guidedExample: { title: "Quantize four values", setup: "Map $[-1.0,-0.2,0.3,0.9]$ to a zero-centered signed 3-bit grid $[-3,\\ldots,3]$ with scale $s=\\max|x|/3=1/3$. One of the eight bit patterns is unused so positive and negative endpoints remain symmetric.", steps: [
      "Divide by $s$ and round, then clip to $[-3,3]$: $q=[-3,-1,1,3]$.",
      "Dequantize with $\\hat{x}=sq$: $[-1.0,-0.333,0.333,1.0]$.",
      "Absolute reconstruction errors are $[0,0.133,0.033,0.100]$; even an in-range endpoint such as 0.9 need not be preserved exactly when the shared scale is set by −1.0.",
    ], result: "Quantization error depends on the exact integer grid, range, granularity, and distribution—not just the advertised bit count." },
    practice: { prompt: "A 4-bit model is smaller but slower than bf16 on your GPU. Give two plausible reasons.", hint: "Storage format and compute kernel are different layers.", answer: "The GPU may lack an optimized kernel for that 4-bit format, causing costly unpacking/dequantization, or the workload may be compute/cache/launch limited rather than weight-bandwidth limited. Small batches and conversion overhead can also erase the bandwidth gain." },
    resources: [
      { title: "LLM.int8()", url: "https://arxiv.org/abs/2208.07339", kind: "Paper", note: "Explains activation outliers and mixed-precision decomposition for large models." },
      { title: "GPTQ", url: "https://arxiv.org/abs/2210.17323", kind: "Paper", note: "A widely used one-shot weight quantization method for generative Transformers." },
      { title: "Transformers quantization overview", url: "https://huggingface.co/docs/transformers/quantization/overview", kind: "Documentation", note: "A practical map of formats, backends, and configuration trade-offs." },
    ],
  },

  "serving-systems": {
    objectives: ["Distinguish latency, throughput, utilization, and goodput", "Explain static, dynamic, and continuous batching", "Design capacity and overload controls around an SLO"],
    vocabulary: [
      { term: "Throughput", meaning: "Work completed per unit time, often tokens or requests per second." },
      { term: "Latency", meaning: "Time experienced by one request, including queueing and computation." },
      { term: "Goodput", meaning: "Useful completed work that satisfies the service-level objective." },
      { term: "Tail latency", meaning: "Slow-end latency such as the 95th or 99th percentile." },
    ],
    sections: [
      { title: "Serving optimizes a queue, not a single benchmark", paragraphs: [
        "User experience includes queue time, time to first token, inter-token latency, and total completion time. Throughput measures aggregate work, but batching requests to maximize tokens per second can delay an interactive user. Goodput counts only completions meeting latency and correctness constraints, making it a better optimization target for production.",
        "Static batching waits for a fixed group; dynamic batching waits briefly to gather compatible requests; continuous batching adds and removes sequences at decode boundaries. Prompts and outputs have variable lengths, so naive padded batches waste computation. Chunked prefill can prevent one enormous prompt from blocking many decode steps.",
      ] },
      { title: "Scheduling is product policy", paragraphs: [
        "A scheduler balances prefill and decode, model variants, priority tiers, context lengths, and cache memory. Admission control rejects or degrades work before overload causes an unbounded queue. Limits on tokens, concurrency, and tenant quotas protect capacity. Autoscaling must consider startup time and weight-loading cost, not just CPU-style utilization.",
        "Benchmark with a realistic arrival process and input/output distribution. Report p50/p95/p99 first-token and inter-token latency, throughput, goodput, errors, cancellations, memory, and cost. Open-loop load generation exposes queue collapse; closed-loop clients can hide it by slowing their own requests when the server is slow.",
      ] },
    ],
    walkthrough: [
      { title: "Define the SLO", body: "Specify percentile first-token, inter-token, total latency, availability, and quality by request class.", checkpoint: "An average latency target does not protect users in the slow tail." },
      { title: "Schedule representative work", body: "Use continuous batching, cache-aware allocation, and prefill/decode budgets suited to the measured traffic mix.", checkpoint: "A throughput-optimal batch may violate interactive latency." },
      { title: "Control overload", body: "Set bounded queues, admission rules, token budgets, fallbacks, and autoscaling triggers, then run burst and failure tests.", checkpoint: "Overload should fail predictably rather than time out every request." },
    ],
    guidedExample: { title: "Why goodput beats throughput", setup: "Configuration A produces 2,000 tokens/s but only 60% of requests meet the 1-second first-token SLO. B produces 1,700 tokens/s and 95% meet it.", steps: [
      "Raw throughput favors A.",
      "If requests have similar size, SLO-satisfying goodput is roughly 1,200 token/s for A versus 1,615 for B.",
      "B also provides a more predictable user experience; exact goodput should be computed per completed request and class.",
    ], result: "The fastest saturated server can deliver less useful work than a deliberately constrained one." },
    practice: { prompt: "Why can p99 latency rise while average accelerator utilization remains only 55%?", hint: "Utilization averages devices; latency includes queues and uneven work.", answer: "Bursty arrivals, long prompts, head-of-line blocking, cache fragmentation, stragglers, network stalls, or one overloaded replica can create tail queues despite moderate average utilization. Break metrics down by stage, replica, and request shape." },
    resources: [
      { title: "Orca: A Distributed Serving System for Transformer-Based Generative Models", url: "https://www.usenix.org/conference/osdi22/presentation/yu", kind: "Paper", note: "Introduces iteration-level scheduling and selective batching for autoregressive serving." },
      { title: "vLLM", url: "https://docs.vllm.ai/", kind: "Documentation", note: "A practical system for continuous batching, paged cache management, and high-throughput serving." },
      { title: "NVIDIA GenAI-Perf", url: "https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/perf_analyzer/genai-perf/README.html", kind: "Documentation", note: "A workload tool and metric vocabulary for realistic generative-model serving tests." },
    ],
  },

  "test-time-compute": {
    objectives: ["Explain how extra inference computation can improve outcomes", "Compare sampling, self-consistency, search, critique, and verifiers", "Allocate reasoning budgets using value-of-compute evidence"],
    vocabulary: [
      { term: "Test-time compute", meaning: "Additional computation spent after training to improve a particular prediction or decision." },
      { term: "Self-consistency", meaning: "Sampling multiple reasoning paths and aggregating their answers." },
      { term: "Verifier", meaning: "A model or deterministic procedure that scores candidate solutions." },
      { term: "Adaptive budget", meaning: "Allocating more computation to examples estimated to benefit from it." },
    ],
    sections: [
      { title: "More attempts create opportunities, not guarantees", paragraphs: [
        "A system can spend inference compute by generating longer reasoning, sampling several candidates, critiquing and revising, searching a tree of intermediate states, calling tools, or scoring candidates with a verifier. These methods exploit different sources of diversity and feedback. They help most when the model sometimes reaches a correct answer and the system can recognize or aggregate it.",
        "Longer text alone is not deeper reasoning. A model can repeat, rationalize an early error, or consume tokens without improving the answer. Self-consistency fails when samples share the same systematic misconception. A learned verifier can be gamed; an exact test can still have loopholes. Report quality as a function of tokens, candidates, wall time, and money.",
      ] },
      { title: "Compute should follow expected value", paragraphs: [
        "Easy prompts often need one short answer; difficult or high-stakes prompts may justify multiple attempts and checks. A router can estimate uncertainty or task type, then assign a budget. Early stopping ends search when candidates agree, a verifier is confident, or marginal improvement falls below cost. Cascades can try a small model first and escalate.",
        "Evaluation must include a single-sample baseline, equal-compute alternatives, and pass@k or best-of-n metrics only when a realistic selector exists. Oracle selection—counting an answer correct if any hidden sample is correct—overstates deployable quality unless users or verifiers can actually identify it.",
      ] },
    ],
    walkthrough: [
      { title: "Generate diversity", body: "Sample independent candidates, vary decompositions, or expand promising intermediate states under an explicit budget.", checkpoint: "Near-duplicate candidates provide little extra information." },
      { title: "Evaluate candidates", body: "Use exact checks, tools, cross-sample agreement, or a separately tested verifier; preserve uncertainty.", checkpoint: "A selector must be evaluated independently of the generator it ranks." },
      { title: "Stop or escalate", body: "Terminate on verified success or diminishing returns; route uncertain/high-value cases to more compute or human review.", checkpoint: "Budget policy is part of the model system and needs its own metrics." },
    ],
    guidedExample: { title: "Compute self-consistency", setup: "Five independent arithmetic traces produce answers [42, 42, 41, 42, 39].", steps: [
      "Majority vote selects 42 with three votes, while a single sample could have returned any listed value.",
      "Agreement is evidence only if samples are sufficiently diverse and the task has one well-defined answer.",
      "An external calculation tool could verify 42 more strongly and might make five long traces unnecessary.",
    ], result: "Aggregation converts stochastic variation into a signal, but deterministic verification is preferable when available and trusted." },
    practice: { prompt: "pass@16 rises sharply, but best-of-16 with your deployed verifier does not. What does that reveal?", hint: "Separate candidate generation from candidate selection.", answer: "The generator can sometimes produce a correct answer, but the verifier cannot reliably recognize it. Oracle pass@16 is not deployable performance; improve selection or use a different verification strategy before spending more samples." },
    resources: [
      { title: "Self-Consistency Improves Chain of Thought Reasoning", url: "https://arxiv.org/abs/2203.11171", kind: "Paper", note: "Introduces sampling diverse reasoning paths and aggregating their answers." },
      { title: "Tree of Thoughts", url: "https://arxiv.org/abs/2305.10601", kind: "Paper", note: "Frames reasoning as search over intermediate textual states with evaluation and backtracking." },
      { title: "Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters", url: "https://arxiv.org/abs/2408.03314", kind: "Paper", note: "Studies how inference budgets and selection strategies interact with prompt difficulty." },
    ],
  },

  "context-engineering": {
    objectives: ["Design prompts as complete information and control interfaces", "Explain context priority, placement, and token budgets", "Test prompts against variation, injection, and missing information"],
    vocabulary: [
      { term: "Context window", meaning: "The maximum token sequence the model can process in one request." },
      { term: "System instruction", meaning: "High-priority application guidance supplied outside ordinary user content." },
      { term: "Few-shot example", meaning: "An input/output demonstration placed in the current context rather than learned in weights." },
      { term: "Context rot", meaning: "Degraded use of relevant information as context becomes long, noisy, conflicting, or poorly organized." },
    ],
    sections: [
      { title: "A prompt is a temporary program and dataset", paragraphs: [
        "Context engineering decides which instructions, examples, evidence, conversation state, tool schemas, and output constraints the model receives. A useful prompt states the task, supplies necessary facts, distinguishes trusted instructions from untrusted data, defines the output contract, and includes examples only when they clarify difficult boundaries. More context is not automatically better.",
        "Models do not execute natural-language instructions with formal guarantees. They infer patterns across tokens and may underweight distant, conflicting, or buried details. Structure with clear delimiters and labels; place critical constraints where they are salient; remove redundant history; summarize state with provenance; and validate schema outside the model.",
      ] },
      { title: "Context has a finite attention and risk budget", paragraphs: [
        "Long contexts increase prefill latency, cache memory, and opportunity for distraction. Retrieved documents and web pages are untrusted content that may contain prompt injection. Quote them as evidence, specify that embedded instructions are data, and enforce permissions in code. Never place secrets in context merely because the model was told not to reveal them.",
        "Evaluate a prompt as software: maintain versioned cases, vary paraphrase and order, include missing/contradictory evidence, measure format validity and correctness, and inspect failures. Separate prompt changes from model or decoder changes. Favor the shortest prompt that preserves robust behavior and leaves space for the actual task.",
      ] },
    ],
    walkthrough: [
      { title: "Write the contract", body: "Specify goal, audience, allowed evidence, constraints, uncertainty behavior, and a machine-checkable output format.", checkpoint: "If the user omits required information, the contract should say whether to ask or abstain." },
      { title: "Assemble trusted layers", body: "Place application instructions separately from user input and clearly delimit retrieved/tool content with source metadata.", checkpoint: "Delimiters communicate intent but do not replace permission enforcement." },
      { title: "Test perturbations", body: "Reorder evidence, paraphrase requests, add irrelevant text, inject conflicts, and compare results under fixed settings.", checkpoint: "One successful demo is not a prompt evaluation." },
    ],
    guidedExample: { title: "Repair an underspecified summarizer", setup: "Prompt: ‘Summarize this report.’ Outputs vary wildly and invent recommendations.", steps: [
      "Define audience, maximum length, required sections, and whether recommendations are allowed.",
      "Delimit the report and require every claim to come from it, with ‘Not stated’ for missing fields.",
      "Validate the structure and test long, contradictory, empty, and adversarial reports.",
    ], result: "The improved prompt reduces degrees of freedom and makes success observable without pretending natural language is a security boundary." },
    practice: { prompt: "A 100-page document fits in the context window. Why might retrieval plus a shorter prompt still perform better?", hint: "Capacity to fit is different from ability to use and cost to process.", answer: "Retrieval can surface the relevant passages, reduce distraction and context rot, lower prefill/cache cost, and attach source metadata. It can also fail by missing evidence, so compare both approaches on representative tasks." },
    resources: [
      { title: "Prompt Engineering Guide", url: "https://www.promptingguide.ai/", kind: "Course", note: "A broad, example-rich catalog of prompting patterns and limitations." },
      { title: "Lost in the Middle", url: "https://arxiv.org/abs/2307.03172", kind: "Paper", note: "Shows that models may use long-context information unevenly depending on position." },
      { title: "OWASP LLM Prompt Injection Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html", kind: "Documentation", note: "Practical defenses and the limits of prompt-only controls." },
    ],
  },

  rag: {
    objectives: ["Build a retrieval-augmented generation pipeline", "Choose chunking, embedding, retrieval, and reranking strategies", "Evaluate retrieval separately from grounded answer generation"],
    vocabulary: [
      { term: "Embedding", meaning: "A vector representation used to compare semantic similarity." },
      { term: "Chunk", meaning: "A retrievable segment of a source document plus metadata." },
      { term: "Reranker", meaning: "A second-stage model that scores query-candidate relevance more precisely." },
      { term: "Grounding", meaning: "Constraining and attributing an answer to supplied evidence." },
    ],
    sections: [
      { title: "RAG moves some knowledge outside the weights", paragraphs: [
        "Documents are parsed, cleaned, split into chunks, embedded, and indexed with source metadata and access controls. At query time, the system may rewrite the query, retrieve candidates using dense similarity, lexical search, or both, rerank them, and place selected evidence in the model context. The generator then answers with citations or abstains when evidence is inadequate.",
        "Chunking sets the unit of recall. Tiny chunks may miss surrounding definitions; huge chunks dilute relevance and waste context. Overlap can preserve boundary information but increases duplicates. Tables, headings, code, and time-sensitive documents often need structure-aware parsing. Embedding similarity is not truth and not permission.",
      ] },
      { title: "Two systems can fail independently", paragraphs: [
        "Retrieval failure means the required evidence never reaches the model. Generation failure means the evidence is present but ignored, misread, or supplemented with unsupported claims. Measure retrieval recall@k and ranking metrics using labeled relevant passages, then measure answer correctness, citation precision, citation completeness, faithfulness, and abstention using the actual retrieved context.",
        "Hybrid lexical+dense retrieval handles exact identifiers and semantic paraphrases. Reranking improves precision at added latency. Filters enforce tenant, date, language, and document-type constraints before results reach the model. Log document versions so a citation can be reproduced after the index changes.",
      ] },
    ],
    walkthrough: [
      { title: "Ingest with provenance", body: "Parse source structure, create meaningful chunks, attach stable IDs/version/permissions, and index both lexical and vector representations.", checkpoint: "A chunk without source identity cannot support a trustworthy citation." },
      { title: "Retrieve and rerank", body: "Construct the search query, apply permission filters, gather diverse candidates, rerank, and fit the best evidence into the context budget.", checkpoint: "Increasing k can raise recall while lowering generator focus." },
      { title: "Answer or abstain", body: "Ask for evidence-bounded claims and citations, validate citations against chunks, and abstain when support is missing.", checkpoint: "A citation string is not proof that the cited passage entails the sentence." },
    ],
    guidedExample: { title: "Diagnose a wrong policy answer", setup: "The correct leave policy is in the index, but the assistant cites an old policy and answers incorrectly.", steps: [
      "Check retrieval: the old chunk may rank higher because metadata date filters were absent or the query missed a policy identifier.",
      "Check versioning and permissions: deactivate superseded documents or rerank current authoritative sources.",
      "Check generation: require the model to compare effective dates and cite the controlling clause, then evaluate with retrieved context held fixed.",
    ], result: "Fixing RAG begins by locating the failure stage; prompt edits cannot recover evidence that was never retrieved." },
    practice: { prompt: "Answer accuracy is 60%, but rises to 90% when evaluators manually insert the correct passage. What is the primary bottleneck?", hint: "Compare normal retrieval with oracle context.", answer: "Retrieval is the main bottleneck: the generator can often use correct evidence when given it. Improve ingestion, queries, hybrid search, filters, or reranking before focusing mainly on generation." },
    resources: [
      { title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", url: "https://arxiv.org/abs/2005.11401", kind: "Paper", note: "The foundational RAG formulation combining retrieved passages with generation." },
      { title: "Sentence Transformers semantic search", url: "https://www.sbert.net/examples/sentence_transformer/applications/semantic-search/README.html", kind: "Documentation", note: "Practical dense retrieval, asymmetric search, and reranking patterns." },
      { title: "RAG evaluation best practices", url: "https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/", kind: "Documentation", note: "A useful catalog of retrieval, faithfulness, and answer-quality measurements." },
    ],
  },

  "agent-loops": {
    objectives: ["Distinguish workflows from autonomous agent loops", "Design observe-decide-act transitions and termination", "Contain tool errors, permissions, and runaway cost"],
    vocabulary: [
      { term: "Agent loop", meaning: "A repeated cycle in which a model observes state, chooses an action, receives results, and continues." },
      { term: "Workflow", meaning: "A mostly predetermined sequence or graph of model and tool steps." },
      { term: "State", meaning: "The durable information needed to make the next decision and recover the run." },
      { term: "Termination condition", meaning: "A rule that ends execution on success, failure, budget, or human decision." },
    ],
    sections: [
      { title: "Use the least autonomy that solves the task", paragraphs: [
        "A workflow encodes known steps in code and uses models inside them. An agent chooses its next action dynamically. Workflows are easier to test, predict, and secure; agents help when the path cannot be enumerated in advance and the environment supplies feedback. Many useful products are hybrids: deterministic routing and permissions around a bounded model-driven loop.",
        "A basic loop observes the goal and state, proposes an action, validates authorization and schema, executes a tool, stores the result, and decides whether to continue. State must distinguish facts from plans, record tool provenance, and survive retries. Termination must include task success, unrecoverable error, no progress, time/token/money limits, and requests for human approval.",
      ] },
      { title: "Reliability lives at the boundaries", paragraphs: [
        "Tool calls can time out, partially succeed, return stale data, or be non-idempotent. Use operation IDs, retry policies, compensating actions, and explicit confirmation for consequential writes. Prevent loops by detecting repeated actions and unchanged state. Compress history carefully so critical constraints and results are not lost.",
        "Evaluate whole trajectories: task completion, unnecessary steps, invalid calls, permission violations, recovery, latency, cost, and human intervention. Build simulated environments for repeatable tests and replay production traces with secrets removed. A strong language benchmark does not imply safe or efficient agency.",
      ] },
    ],
    walkthrough: [
      { title: "Bound the objective", body: "Define success evidence, allowed tools and scopes, budgets, approval points, and failure states.", checkpoint: "An open-ended goal without a stop rule is not deployable." },
      { title: "Execute one validated action", body: "Have the model propose structured intent; code checks schema, policy, idempotency, and authorization before execution.", checkpoint: "Reasoning text should never bypass the action validator." },
      { title: "Update state and decide", body: "Record observed results, compare progress with success criteria, then continue, recover, escalate, or stop.", checkpoint: "A tool’s returned text is evidence from that tool, not a new high-priority instruction." },
    ],
    guidedExample: { title: "Stop a booking loop", setup: "A travel agent retries the same sold-out flight five times, spending money on search calls.", steps: [
      "Store normalized action arguments and outcomes; detect that the state and proposed action are repeating.",
      "A retry policy allows transient-error retries but treats ‘sold out’ as a state change requiring alternatives.",
      "After a bounded search, present options or ask the user to relax constraints instead of looping.",
    ], result: "Loop control is explicit software: the model proposes, but state machines and budgets decide what may continue." },
    practice: { prompt: "When should a three-step document process be a fixed workflow rather than an agent?", hint: "Ask whether the path truly needs dynamic planning.", answer: "Use a workflow when the steps, tools, and transitions are known and failures can be handled explicitly. It is cheaper, easier to test, and more predictable; add agentic choice only for genuinely variable branches." },
    resources: [
      { title: "Building Effective Agents", url: "https://www.anthropic.com/research/building-effective-agents", kind: "Article", note: "Clear distinctions among prompt chains, routing, parallel workflows, evaluators, and autonomous agents." },
      { title: "ReAct", url: "https://arxiv.org/abs/2210.03629", kind: "Paper", note: "A foundational pattern interleaving model reasoning with environment actions and observations." },
      { title: "OpenAI Agents SDK guide", url: "https://openai.github.io/openai-agents-python/", kind: "Documentation", note: "Concrete primitives for tools, handoffs, guardrails, tracing, and bounded agent runs." },
    ],
  },

  "evaluation-design": {
    objectives: ["Turn product requirements into an evaluation portfolio", "Use deterministic, human, and model-based graders appropriately", "Measure uncertainty, slices, and regressions instead of one headline score"],
    vocabulary: [
      { term: "Construct validity", meaning: "How well a measurement represents the capability or outcome it claims to measure." },
      { term: "Golden set", meaning: "A carefully reviewed, versioned collection of evaluation cases and expected judgments." },
      { term: "LLM-as-a-judge", meaning: "Using a language model to score or compare another model’s output." },
      { term: "Inter-rater agreement", meaning: "The degree to which independent evaluators make consistent judgments." },
    ],
    sections: [
      { title: "Begin with decisions, not benchmarks", paragraphs: [
        "Write the user outcome and failure costs first. Decompose them into observable dimensions such as task success, factual support, instruction adherence, format validity, safety, latency, and cost. Choose cases from real task distributions plus deliberate edge and adversarial slices. A public benchmark can provide context, but it rarely matches a product’s users and failure severity.",
        "Use deterministic graders for exact answers, schemas, calculations, execution, and citations when possible. Human review is essential for nuanced quality and policy boundaries but needs rubrics, calibration, blinding, and disagreement analysis. Model judges offer scale and explanations, yet inherit bias toward style, verbosity, self-preference, prompt position, and their own factual errors.",
      ] },
      { title: "An evaluator must itself be evaluated", paragraphs: [
        "Calibrate an LLM judge against high-quality human labels on representative outputs, including close calls and adversarial attempts to influence the judge. Randomize answer order for pairwise tests, hide model identity, separate criteria, and require evidence. Measure agreement, false-positive/negative costs, and stability across judge prompts or models.",
        "Report confidence intervals and paired differences. Slice by task, language, difficulty, length, and user segment. Keep a small frozen set for regression and an evolving set for new failures; do not repeatedly tune against the hidden release gate. Store raw prompts, outputs, tool traces, scores, and evaluator versions for reproducibility.",
      ] },
    ],
    walkthrough: [
      { title: "Define the claim", body: "State exactly what shipping decision the evaluation will inform and which failures matter most.", checkpoint: "‘Better model’ is too broad to measure." },
      { title: "Triangulate graders", body: "Combine executable checks, source validation, calibrated judge rubrics, and sampled human review.", checkpoint: "Independent methods reduce shared blind spots." },
      { title: "Analyze paired slices", body: "Compare the same cases, calculate uncertainty, inspect disagreements and severe failures, and record evaluator versions.", checkpoint: "A statistically significant average can still hide an unacceptable safety regression." },
    ],
    guidedExample: { title: "Audit a biased judge", setup: "An LLM judge prefers answer A 65% of the time. When answer order is swapped, it still prefers the first position 64% of the time.", steps: [
      "The judge has a strong position bias, so the original win rate is not valid evidence of A’s quality.",
      "Randomize order, evaluate both orientations, or use position-debiased aggregation and a stricter rubric.",
      "Calibrate the corrected judge against blinded human labels and inspect cases where they disagree.",
    ], result: "Model grading is a measurement instrument; uncontrolled order effects can overwhelm the signal it is meant to detect." },
    practice: { prompt: "A new model gains 3 points on an aggregate judge score but loses 12 points on a rare high-risk slice. Should the average decide?", hint: "Weight failure severity, not only frequency.", answer: "No. Apply predefined release criteria and risk weights. The high-risk regression may block shipping even if the average improves; investigate and remediate it, and report both results transparently." },
    resources: [
      { title: "HELM", url: "https://crfm.stanford.edu/helm/latest/", kind: "Documentation", note: "A transparent, multi-metric approach to scenarios, prompts, and model evaluation." },
      { title: "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena", url: "https://arxiv.org/abs/2306.05685", kind: "Paper", note: "A foundational study of model-based judging and observed biases." },
      { title: "OpenAI Evals design guide", url: "https://platform.openai.com/docs/guides/evals-design", kind: "Documentation", note: "A practical framework for defining tasks, datasets, graders, and continuous evaluation." },
    ],
  },

  "security-privacy": {
    objectives: ["Threat-model an LLM application across data, model, tools, and users", "Explain prompt injection and why prompting alone cannot solve it", "Apply least privilege, data minimization, and layered controls"],
    vocabulary: [
      { term: "Threat model", meaning: "A structured account of assets, actors, trust boundaries, attack paths, and mitigations." },
      { term: "Indirect prompt injection", meaning: "Malicious instructions embedded in external content the model reads." },
      { term: "Data exfiltration", meaning: "Unauthorized transfer of secrets or sensitive information outside its allowed boundary." },
      { term: "Data minimization", meaning: "Collecting, retaining, and exposing only information necessary for the task." },
    ],
    sections: [
      { title: "The model cannot reliably separate instructions from data", paragraphs: [
        "All text becomes tokens, including system instructions, user requests, retrieved documents, emails, web pages, and tool output. Labels and delimiters help but do not create an unbreakable privilege boundary inside the model. An attacker can plant instructions in content that a high-privilege agent later reads, attempting to redirect tools or reveal context.",
        "Map assets such as credentials, private documents, tool permissions, user data, and model outputs. Draw trust boundaries among users, retrieval stores, plugins, models, and external services. Consider injection, insecure output handling, denial of service, poisoned data, model or dependency supply chains, sensitive information disclosure, and excessive agency.",
      ] },
      { title: "Security is enforced by architecture", paragraphs: [
        "Keep secrets outside model context unless strictly needed. Retrieve with user-scoped authorization before the model sees data. Give tools narrow, temporary capabilities; validate arguments and outputs; sandbox code; require confirmation for irreversible or external actions; and use allowlists where feasible. Treat generated SQL, HTML, shell, and links as untrusted input to downstream systems.",
        "Privacy also requires retention limits, purpose limitation, deletion, access logging, redaction, regional/legal review, and careful telemetry. Test canary secrets, cross-tenant access, injection corpora, data reconstruction, and output handling. Incident plans should support revoking credentials, disabling tools, tracing affected requests, and notifying stakeholders.",
      ] },
    ],
    walkthrough: [
      { title: "Map assets and boundaries", body: "List sensitive data and actions, who may access them, and every place untrusted content crosses into a privileged component.", checkpoint: "If the model has both secrets and unrestricted outbound tools, exfiltration is a foreseeable path." },
      { title: "Remove ambient authority", body: "Minimize context, scope retrieval and tools per user/task, validate calls, sandbox effects, and add approval for consequential writes.", checkpoint: "A policy prompt is defense-in-depth, not the permission system." },
      { title: "Attack and monitor", body: "Run direct/indirect injections, encoded payloads, cross-tenant probes, resource abuse, and output-injection tests; alert on anomalous actions.", checkpoint: "Testing must include the complete application path." },
    ],
    guidedExample: { title: "Block cross-tenant retrieval", setup: "A user asks, ‘Summarize all customer contracts.’ The vector database contains every tenant’s documents.", steps: [
      "Authenticate the user and derive authorized tenant/document filters before semantic search.",
      "Apply those filters in the retrieval system, not as a model instruction after documents are fetched.",
      "Return only authorized passages with IDs, log access, and test adversarial queries that mention other tenants by name.",
    ], result: "Authorization must constrain the data path before generation; the model should never receive documents it is expected to ‘promise not to reveal.’" },
    practice: { prompt: "Why is ‘Ignore instructions inside documents’ insufficient against indirect prompt injection?", hint: "Natural-language priority is interpreted by the same fallible model reading the attack.", answer: "The model can still be confused or persuaded, and a successful injection could trigger real tools. Use untrusted-data labeling plus deterministic authorization, least privilege, isolation, validation, confirmation, and monitoring so a model mistake has limited impact." },
    resources: [
      { title: "OWASP Top 10 for LLM Applications", url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/", kind: "Documentation", note: "A practical taxonomy of major LLM application risks and mitigations." },
      { title: "NIST AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework", kind: "Documentation", note: "A broader governance framework for mapping, measuring, managing, and governing AI risks." },
      { title: "Prompt Injection Attacks and Defenses in LLM-Integrated Applications", url: "https://arxiv.org/abs/2310.12815", kind: "Paper", note: "A systematic treatment of injection threats and defense limitations." },
    ],
  },

  "observability-governance": {
    objectives: ["Design traces and metrics for an LLM production system", "Attribute quality, latency, and cost to pipeline stages", "Create release, incident, and governance controls tied to evidence"],
    vocabulary: [
      { term: "Trace", meaning: "A linked record of one request across model, retrieval, tools, validators, and retries." },
      { term: "Service-level objective", meaning: "A measurable reliability or performance target over a defined period." },
      { term: "Drift", meaning: "A change in inputs, outputs, dependencies, or performance over time." },
      { term: "Governance", meaning: "Roles, policies, evidence, and decisions that control a system across its lifecycle." },
    ],
    sections: [
      { title: "Observe the system users actually experience", paragraphs: [
        "A request may include classification, retrieval, reranking, generation, tool calls, retries, validation, and fallback. A trace links these spans with model/version, prompt template, decoding, token counts, cache status, documents and versions, tool arguments/results, latency, errors, safety decisions, and cost. Sensitive content should be minimized, redacted, access-controlled, and retained only as justified.",
        "Operational metrics include availability, queue time, first-token and inter-token latency, throughput, cache hit rate, tool failures, invalid outputs, timeouts, and cost per successful task. Quality monitoring uses sampled review, user corrections, groundedness checks, policy flags, and continuous evaluation. Proxy shifts are alerts for investigation, not automatic proof of harm.",
      ] },
      { title: "Governance turns telemetry into accountable decisions", paragraphs: [
        "Maintain a system card listing intended use, prohibited use, model/data dependencies, evaluations, limitations, owners, and rollback path. Release gates require minimum quality and safety slices, latency/cost budgets, security review, privacy assessment, and sign-off. Canary deployment and shadow traffic limit blast radius; versioned prompts and indexes make rollback possible.",
        "Incident response needs severity definitions, on-call ownership, containment controls, evidence preservation, communication, root-cause analysis, and regression tests. Cost governance assigns budgets by feature/tenant, prevents unbounded agents, and evaluates cheaper models, caching, retrieval, or batching. The goal is not paperwork—it is the ability to know what changed, who decided, and how to recover.",
      ] },
    ],
    walkthrough: [
      { title: "Instrument a request", body: "Create a trace ID and structured spans for routing, retrieval, prompts, model calls, tools, validation, and user-visible outcome.", checkpoint: "Logs without versioned inputs and dependencies are hard to reproduce." },
      { title: "Connect metrics to decisions", body: "Define SLOs and quality/safety gates by slice, alerts with owners, and budgets for tokens, retries, and tool actions.", checkpoint: "Every alert needs a diagnosis path and response action." },
      { title: "Release and learn safely", body: "Run offline gates, canary a version, compare paired telemetry, roll back on thresholds, and convert incidents into tests.", checkpoint: "A rollback that has never been rehearsed is a hypothesis." },
    ],
    guidedExample: { title: "Find a hidden cost regression", setup: "Cost per request rises 40% while model price and traffic volume are unchanged.", steps: [
      "Break cost down by stage and tokens; traces reveal retrieval now inserts twice as many chunks and prompts are longer.",
      "Check why: a reranker threshold changed, reducing precision and triggering more answer retries.",
      "Restore the version, add a maximum evidence budget and cost-per-success release gate, then replay affected traces.",
    ], result: "End-to-end attribution converts a surprising bill into a reproducible pipeline change and a preventable regression." },
    practice: { prompt: "Why is raw token cost per request weaker than cost per successful task?", hint: "A cheap failed request may require retries or user repetition.", answer: "Token cost ignores whether the request achieved its goal. Cost per successful task combines spend with usefulness and reveals systems that appear cheap only because they fail, retry, or shift work to users." },
    resources: [
      { title: "OpenTelemetry tracing", url: "https://opentelemetry.io/docs/concepts/signals/traces/", kind: "Documentation", note: "Vendor-neutral concepts for spans, context propagation, and distributed request traces." },
      { title: "NIST AI RMF Playbook", url: "https://airc.nist.gov/airmf-resources/playbook/", kind: "Documentation", note: "Action-oriented governance practices across map, measure, manage, and govern functions." },
      { title: "Google SRE Workbook", url: "https://sre.google/workbook/table-of-contents/", kind: "Course", note: "Practical guidance on SLOs, monitoring, alerting, canaries, and incident response." },
    ],
  },

  distillation: {
    objectives: ["Explain response, logit, and feature distillation", "Balance teacher quality, student capacity, and data coverage", "Evaluate compression gains against cost and inherited errors"],
    vocabulary: [
      { term: "Teacher", meaning: "The stronger model or ensemble whose outputs guide a smaller student." },
      { term: "Student", meaning: "The model trained to imitate selected behavior of the teacher." },
      { term: "Soft target", meaning: "A probability distribution that contains more information than a single hard label." },
      { term: "Distillation temperature", meaning: "A softmax temperature used to expose relative probabilities among teacher alternatives." },
    ],
    sections: [
      { title: "Compression by transferring behavior", paragraphs: [
        "Response distillation generates prompts and teacher answers, then trains the student with ordinary supervised loss. Logit distillation matches the teacher’s full token distribution, revealing that several alternatives may be plausible. Feature distillation aligns internal representations but usually requires compatible architectures and extra plumbing. Sequence-level and on-policy variants expose the student to its own states.",
        "The student cannot copy everything if its capacity, context, tokenizer, or data is limited. Choose target domains and behavior explicitly. Teacher-generated rationales may improve task learning but can contain errors, verbosity, hidden assumptions, or artifacts the student imitates. Filter with verifiers, human review, diversity controls, and source data where possible.",
      ] },
      { title: "Distillation has an upstream bill", paragraphs: [
        "A cheaper deployed student may require millions of expensive teacher tokens. Include generation, filtering, storage, student training, evaluation, and periodic refresh in total cost. Cache teacher outputs and record teacher version, prompt, decoder, and provenance. If teacher APIs change, dataset lineage matters.",
        "Compare with training the same student on hard labels or original data, using equal compute. Measure quality by slice, calibration, safety, latency, throughput, memory, and cost per successful task. A student can inherit teacher bias and lose rare capabilities while matching average scores.",
      ] },
    ],
    walkthrough: [
      { title: "Define the behavior slice", body: "Select tasks, prompts, quality constraints, teacher settings, and a baseline student before generating data.", checkpoint: "A broad teacher does not imply a broad student dataset." },
      { title: "Generate and validate supervision", body: "Collect responses or logits, verify correctness, diversify outputs, remove leakage, and preserve provenance.", checkpoint: "Teacher confidence is not an independent correctness check." },
      { title: "Train and compare total value", body: "Tune hard/soft loss weights and evaluate quality plus end-to-end generation/training/serving cost.", checkpoint: "Compression ratio alone ignores whether the student meets the task." },
    ],
    guidedExample: { title: "Read a soft target", setup: "For a token, the teacher assigns cat 0.55, dog 0.35, car 0.06, other 0.04; the hard label is cat.", steps: [
      "Hard-label SFT only says ‘increase cat.’",
      "Soft distillation also teaches that dog is a plausible alternative and car is much less plausible.",
      "A higher distillation temperature can reveal relative low-probability structure, but loss scaling and calibration must be handled deliberately.",
    ], result: "Soft targets transfer similarity information that a one-hot label discards." },
    practice: { prompt: "A student matches teacher accuracy but becomes overconfident. Which evaluation and training signals should you inspect?", hint: "Accuracy ignores probability quality.", answer: "Measure calibration such as reliability curves/Brier or log loss, inspect teacher calibration and distillation temperature, and tune the balance between hard labels and soft targets. Matching decisions does not guarantee matching uncertainty." },
    resources: [
      { title: "Distilling the Knowledge in a Neural Network", url: "https://arxiv.org/abs/1503.02531", kind: "Paper", note: "The classic formulation of soft-target knowledge distillation." },
      { title: "DistilBERT", url: "https://arxiv.org/abs/1910.01108", kind: "Paper", note: "A concrete example combining language-model, distillation, and representation losses." },
      { title: "MiniLLM", url: "https://arxiv.org/abs/2306.08543", kind: "Paper", note: "Explores generative-model distillation while addressing exposure bias and distribution mismatch." },
    ],
  },

  lora: {
    objectives: ["Derive LoRA’s low-rank weight update", "Choose rank, target modules, and adapter deployment strategy", "Compare LoRA with full fine-tuning and quantized variants"],
    vocabulary: [
      { term: "Low rank", meaning: "A matrix structure expressible as the product of two thinner matrices." },
      { term: "Adapter", meaning: "A small set of task-specific trainable parameters attached to a frozen base model." },
      { term: "Rank", meaning: "The inner dimension r controlling a LoRA update’s capacity and parameter count." },
      { term: "QLoRA", meaning: "Training LoRA adapters through a frozen quantized base model to reduce memory." },
    ],
    sections: [
      { title: "Learn a structured update instead of every weight", paragraphs: [
        "For a frozen linear weight $W$ with shape $d_{out} \\times d_{in}$, LoRA learns $\\Delta W=BA$ where $B$ is $d_{out} \\times r$ and $A$ is $r \\times d_{in}$. The forward pass becomes $$Wx+(\\alpha/r)BAx.$$ When $r$ is much smaller than both widths, trainable parameters fall from $d_{out}d_{in}$ to $r(d_{out}+d_{in})$, and optimizer-state memory falls with them.",
        "The low-rank assumption says useful task adaptation often lives in a smaller subspace than the full matrix. A common zero-delta initialization samples $A$ at small nonzero values and sets $B=0$: the first forward delta is zero, but $B$ receives a gradient. Setting both $A$ and $B$ to zero makes each factor multiply the other's zero value, so neither receives a first gradient and the adapter cannot start learning. The method does not make the base model free: forward/backward still move activations through it, and long contexts still consume memory.",
      ] },
      { title: "Adapters change operations as well as training", paragraphs: [
        "Attention query/value projections are common targets, but adapting key, output, MLP, or all linear modules can improve demanding tasks at added size. Per-layer rank allocation can focus capacity. Adapters can be merged into weights for simple deployment or kept separate so many tenants share one base; dynamic adapter serving adds scheduling and memory complexity.",
        "QLoRA stores the base in a low-bit format while computing gradients for higher-precision adapters, enabling large-model fine-tuning on smaller hardware. Evaluate against prompt-only baselines, full fine-tuning where feasible, and equal-data controls. Test base capability retention, target quality, catastrophic forgetting, latency, and adapter switching behavior.",
      ] },
    ],
    walkthrough: [
      { title: "Choose target and rank", body: "Identify matrices most connected to the task, estimate adapter parameters, and begin with a small rank before scaling.", checkpoint: "Rank is a capacity hyperparameter, not a direct percentage of model knowledge." },
      { title: "Train the delta", body: "Freeze base weights, optimize A/B under the same template and loss rules as careful SFT, and checkpoint adapter plus base identity.", checkpoint: "An adapter is not portable across unrelated base checkpoints even if shapes match." },
      { title: "Merge or route", body: "Benchmark merged weights versus runtime adapters, verify numerical equivalence within tolerance, and govern tenant/version selection.", checkpoint: "Merging simplifies inference but removes instant adapter switching." },
    ],
    guidedExample: { title: "Count the savings", setup: "Adapt a $4{,}096 \\times 4{,}096$ projection with rank $r=16$.", steps: [
      "Full fine-tuning updates $4{,}096^2 = 16{,}777{,}216$ weights for this matrix.",
      "LoRA learns $16\\times4{,}096 + 4{,}096\\times16 = 131{,}072$ parameters.",
      "That is about $128\\times$ fewer trainable parameters for the matrix, though the frozen 16.8M base weights still must be stored and used.",
    ], result: "LoRA primarily reduces trainable and optimizer state, not the underlying model’s compute or all memory." },
    practice: { prompt: "A rank-8 adapter underfits a new technical domain. Should you immediately set rank to 256?", hint: "Several bottlenecks can look like insufficient adapter capacity.", answer: "First audit data quality/coverage, template and loss masking, learning rate, target modules, and base-model capability. Then run controlled rank/target ablations; a larger rank increases capacity and memory but cannot fix incorrect supervision." },
    resources: [
      { title: "LoRA", url: "https://arxiv.org/abs/2106.09685", kind: "Paper", note: "The original low-rank adaptation formulation and empirical motivation." },
      { title: "QLoRA", url: "https://arxiv.org/abs/2305.14314", kind: "Paper", note: "Combines 4-bit frozen bases with LoRA for memory-efficient fine-tuning." },
      { title: "PEFT LoRA guide", url: "https://huggingface.co/docs/peft/main/en/conceptual_guides/lora", kind: "Documentation", note: "Practical configuration, targeting, initialization, merging, and adapter usage." },
    ],
  },

  moe: {
    objectives: ["Explain sparse expert routing and top-k execution", "Compute capacity and load-balancing constraints", "Separate parameter scale from active compute and serving cost"],
    vocabulary: [
      { term: "Expert", meaning: "A feed-forward subnetwork selected for some token representations." },
      { term: "Router", meaning: "A learned function assigning tokens to experts, often using top-k scores." },
      { term: "Capacity factor", meaning: "Extra per-expert token slots above perfectly balanced routing." },
      { term: "Expert parallelism", meaning: "Distributing different experts across devices and exchanging routed tokens between them." },
    ],
    sections: [
      { title: "Many parameters, few active per token", paragraphs: [
        "A sparse mixture-of-experts Transformer replaces some dense MLPs with E expert MLPs. A router scores each token representation and sends it to the top one or few experts; their outputs are weighted and returned to the residual stream. Total parameter capacity grows with E, while active arithmetic per token grows mainly with selected k. Attention usually remains dense.",
        "Experts are not guaranteed to become human-readable specialties. The router and experts co-adapt to minimize loss. Without regularization, popular experts receive too many tokens while others starve. Auxiliary load-balancing losses, router z-loss, capacity limits, noise, and careful initialization encourage stable utilization.",
      ] },
      { title: "Sparsity trades FLOPs for communication and memory", paragraphs: [
        "Expert parallelism places experts on different devices. Tokens must be grouped, exchanged with all-to-all communication, processed, and returned every MoE layer. Uneven routing creates stragglers; capacity overflow may drop tokens or reroute them. Network topology and batch size strongly affect efficiency.",
        "Serving must store or stream the full expert set even though each token uses a subset. Small batches may activate many experts with little work each, reducing hardware efficiency. Report total and active parameters, training FLOPs, routing balance, overflow, communication, memory, throughput, and quality. ‘A trillion parameters at the cost of a small model’ is too simplistic.",
      ] },
    ],
    walkthrough: [
      { title: "Score routes", body: "The router maps each token state to E logits, converts them to weights, and selects top-k experts.", checkpoint: "Routing occurs per token and can differ across positions in one sequence." },
      { title: "Dispatch under capacity", body: "Group tokens by destination, enforce slot limits, exchange them, and run expert MLPs.", checkpoint: "Overflow policy changes both correctness and load." },
      { title: "Combine and balance", body: "Return expert outputs, weight and sum them, then optimize language loss plus routing regularizers.", checkpoint: "Perfectly uniform routing is not the goal if it harms task loss; stable useful balance is." },
    ],
    guidedExample: { title: "Estimate expert capacity", setup: "A batch has 1,024 token positions, 8 experts, top-1 routing, and capacity factor 1.25.", steps: [
      "Perfect balance sends $1{,}024/8 = 128$ tokens to each expert.",
      "Capacity is $128\\times1.25 = 160$ slots per expert, so total allocated slots are $1{,}280$.",
      "If one expert receives 210 tokens, 50 exceed its capacity and must be dropped, rerouted, or otherwise handled.",
    ], result: "Extra capacity absorbs imbalance but consumes memory and does not eliminate pathological routing." },
    practice: { prompt: "An MoE has 8× more parameters than a dense model but similar active FLOPs. Why might it still be slower in production?", hint: "Active multiply-adds are only one systems cost.", answer: "It may require all expert weights in memory, token all-to-all communication, routing/sorting kernels, load imbalance, expert capacity padding, and inefficient small per-expert batches. Measure end-to-end latency and throughput." },
    resources: [
      { title: "Switch Transformers", url: "https://arxiv.org/abs/2101.03961", kind: "Paper", note: "A clear top-1 sparse-expert design with routing and load-balancing analysis." },
      { title: "GShard", url: "https://arxiv.org/abs/2006.16668", kind: "Paper", note: "Shows conditional computation and expert parallelism at very large scale." },
      { title: "Mixture of Experts Explained", url: "https://huggingface.co/blog/moe", kind: "Article", note: "A readable walkthrough of routing, capacity, training, and inference trade-offs." },
    ],
  },

  "multimodal-models": {
    objectives: ["Trace visual or audio inputs into a language-model token space", "Compare projection, cross-attention, and unified-token designs", "Evaluate grounding and modality-specific failure modes"],
    vocabulary: [
      { term: "Modality", meaning: "A type of signal such as text, image, audio, or video." },
      { term: "Vision encoder", meaning: "A network that converts image patches into feature vectors." },
      { term: "Connector", meaning: "A projection or resampling module aligning modality features with language-model representations." },
      { term: "Grounding", meaning: "Connecting generated claims or actions to specific evidence in the input modality." },
    ],
    sections: [
      { title: "Different signals need a common interface", paragraphs: [
        "An image is split into patches and encoded into vectors; audio becomes frames or learned acoustic tokens; video adds a time dimension. A connector projects or resamples these features into the language model’s width. The decoder may treat them as prefix tokens, attend through dedicated cross-attention, or participate in a unified token sequence. Output can remain text or be decoded back into another modality.",
        "Training often begins with contrastive or paired alignment, then caption/instruction data, and sometimes preference or task-specific tuning. Freezing the modality encoder and language model reduces compute but limits adaptation; joint training can improve integration while risking catastrophic forgetting and requiring more data.",
      ] },
      { title: "Fluent descriptions can be visually unsupported", paragraphs: [
        "A multimodal model can rely on language priors and name an object that is common in similar scenes but absent from the image. Spatial relationships, counting, tiny text, charts, long video dependencies, and audio noise expose distinct weaknesses. Resolution and token budgets determine what detail is even represented.",
        "Evaluate perception separately from reasoning and generation. Use localized questions, bounding/pointing evidence where supported, OCR and chart suites, counterfactual image edits, modality ablations, accessibility cases, and subgroup analysis. Test whether answers change when the relevant region changes while the prompt stays constant.",
      ] },
    ],
    walkthrough: [
      { title: "Encode the signal", body: "Normalize the modality, create patches/frames, and produce feature vectors with position or time information.", checkpoint: "Downsampling can permanently remove fine detail before the language model sees it." },
      { title: "Align representations", body: "Project, resample, or cross-attend modality features into the decoder and train on paired/aligned objectives.", checkpoint: "Matching dimensions is necessary but does not guarantee semantic alignment." },
      { title: "Generate and ground", body: "Condition output on modality features, require evidence where possible, and test with controlled input changes.", checkpoint: "Text fluency is not evidence of perception." },
    ],
    guidedExample: { title: "Count the visual tokens", setup: "A $224\\times224$ image uses $16\\times16$ non-overlapping patches plus one class token.", steps: [
      "There are $224/16 = 14$ patches along each axis.",
      "That yields $14\\times14 = 196$ patch tokens, or 197 with the class token.",
      "Halving patch size to 8 creates $28\\times28 = 784$ patches—four times as many attention positions and much higher cost.",
    ], result: "Visual resolution and sequence cost are coupled; a larger context window does not make fine-grained perception free." },
    practice: { prompt: "A model correctly answers image questions even after the image is replaced with gray noise. What does that imply?", hint: "The text prompt and dataset may contain predictive shortcuts.", answer: "The model is likely exploiting language priors, question artifacts, or memorized dataset patterns rather than visual evidence. Use image ablations, counterfactual pairs, and balanced questions to measure true grounding." },
    resources: [
      { title: "CLIP", url: "https://arxiv.org/abs/2103.00020", kind: "Paper", note: "A foundational contrastive text-image representation model." },
      { title: "LLaVA", url: "https://arxiv.org/abs/2304.08485", kind: "Paper", note: "A clear vision-encoder, projection, and language-model instruction-tuning recipe." },
      { title: "Visual Instruction Tuning", url: "https://llava-vl.github.io/", kind: "Article", note: "Project examples and artifacts that make the multimodal pipeline tangible." },
    ],
  },

  "interpretability-editing": {
    objectives: ["Distinguish behavioral, attribution, probing, and causal interpretability", "Use activation interventions to test hypotheses", "Evaluate model edits for efficacy, specificity, generalization, and side effects"],
    vocabulary: [
      { term: "Probe", meaning: "A model trained to predict information from internal activations." },
      { term: "Activation patching", meaning: "Replacing internal states between runs to test their causal effect on an output." },
      { term: "Sparse autoencoder", meaning: "A model that decomposes activations into a larger set of sparse learned features." },
      { term: "Model editing", meaning: "Changing parameters or activations to alter a targeted behavior or fact." },
    ],
    sections: [
      { title: "Seeing a pattern is not yet a mechanism", paragraphs: [
        "Behavioral analysis maps inputs to outputs. Attention visualization and attribution methods associate components with a prediction. Probes test whether information is decodable from activations, but a probe may recover information the model does not use. Causal interventions—ablation, activation patching, steering, or weight changes—ask whether manipulating a component predictably changes behavior.",
        "Neural representations are distributed and often superposed: one direction can participate in several concepts, and one concept can span many features. Sparse autoencoders attempt to learn more interpretable feature dictionaries, but feature naming, completeness, and causal faithfulness remain research questions. Interpretability evidence should state method, layer, dataset, controls, and alternative explanations.",
      ] },
      { title: "Editing is an intervention with a blast radius", paragraphs: [
        "A model edit may insert or correct a fact, suppress behavior, or steer style using low-rank weight updates, localized parameter changes, activation vectors, or external memory. Evaluate efficacy on the target, paraphrase generalization, locality on unrelated prompts, consistency across contexts, durability after further training, and downstream side effects.",
        "Editing weights is not always the right operational choice. Frequently changing facts belong in retrieval; safety-critical actions need runtime controls; a narrow behavior may use an adapter. Interpretability can guide hypotheses, but a convincing mechanism requires causal tests and replication. The responsible endpoint is an auditable decision, not a colorful activation plot.",
      ] },
    ],
    walkthrough: [
      { title: "Form a contrast", body: "Choose matched prompts where a target behavior changes while irrelevant factors remain controlled; record layers and token positions.", checkpoint: "Unmatched examples can make topic, length, or syntax look like the mechanism." },
      { title: "Locate then intervene", body: "Use attribution or probes to nominate components, then ablate or patch them between clean and corrupted runs.", checkpoint: "Correlation becomes causal evidence only when intervention changes the predicted outcome with controls." },
      { title: "Edit and map side effects", body: "Apply the smallest intervention and test target efficacy, paraphrases, related knowledge, unrelated controls, and adversarial contexts.", checkpoint: "A successful memorized prompt is not a successful edit." },
    ],
    guidedExample: { title: "Patch a factual prediction", setup: "The clean prompt ‘The Eiffel Tower is in’ predicts Paris; a corrupted subject predicts Rome.", steps: [
      "Run both prompts and save activations at aligned token positions and layers.",
      "Replace one corrupted-run activation with the clean-run activation and measure the change in the Paris-vs-Rome logit difference.",
      "Repeat across controls and layers; a localized causal effect nominates a component, but does not prove a complete human-readable representation.",
    ], result: "Activation patching tests whether information carried at a specific site is causally sufficient to restore part of the behavior." },
    practice: { prompt: "A linear probe predicts sentiment from layer 8 with 99% accuracy. Can you conclude layer 8 uses sentiment to generate the answer?", hint: "Decodability and causal use are different claims.", answer: "No. The information is linearly decodable, but the model may not use that direction. Test causal relevance with interventions, matched controls, and downstream effects before claiming a mechanism." },
    resources: [
      { title: "A Mathematical Framework for Transformer Circuits", url: "https://transformer-circuits.pub/2021/framework/index.html", kind: "Article", note: "A foundational vocabulary for residual streams, attention heads, and circuit-level reasoning." },
      { title: "Locating and Editing Factual Associations in GPT", url: "https://arxiv.org/abs/2202.05262", kind: "Paper", note: "Introduces causal tracing and ROME-style factual model editing." },
      { title: "Scaling Monosemanticity", url: "https://transformer-circuits.pub/2024/scaling-monosemanticity/index.html", kind: "Article", note: "A large-scale sparse-autoencoder investigation with interactive feature examples and limitations." },
    ],
  },
};
