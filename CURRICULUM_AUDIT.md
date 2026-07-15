# Curriculum audit: from strong survey to complete learning system

Status: **implemented and re-audited**. The sections below preserve the original skeptical diagnosis; the outcome records how each gap was resolved.

## Verdict

The original 28-lesson course explained architecture, pre-training, post-training, and several advanced techniques well, but started after hidden prerequisites and ended before common real-world LLM work. The implemented course now contains 44 lessons across seven explicit tracks.

## Implementation outcome

- The course now begins with an eight-minute LLM orientation, followed by tensors, probability/loss, gradients/backpropagation, and optimizers.
- Architecture, pre-training, and post-training each culminate in a case study; RL fundamentals and RLHF now precede the Tülu/DR Tulu capstone.
- Five inference lessons cover decoding, prefill/decode and KV cache, quantization, serving, and test-time compute.
- Six applications/reliability lessons cover context design, RAG, agents, evaluation, security/privacy, and production observability/governance.
- Multimodality and interpretability/model editing extend the advanced track without false dependency chains.
- The site exposes prerequisite links, uses 40 interactive labs, gates completion with knowledge checks, and validates numbering, prerequisites, lab dispatch, sources, builds, and responsive width automatically.
- Independent grading triggered a second iteration on misleading toy simulations: test-time compute no longer displays pseudo-accuracy, security separates text trust from runtime authorization, agent transitions enforce recovery, multimodal highlights are labeled as teaching annotations, and interpretability no longer ranks methods with universal causal-strength numbers.

## Keep and deepen

- Tokenization → embeddings → positions → attention → residual blocks → prediction is the right architecture spine.
- Pre-training data, scaling, infrastructure, objectives, and evaluation form a strong systems sequence.
- SFT → preference optimization → tools/safety → open case study is a strong post-training sequence.
- LoRA, MoE, and distillation remain useful advanced techniques.

## Move or reframe

- Move **Optimizers** beside gradients and backpropagation; it is a prerequisite, not an advanced afterthought.
- Move **RL Fundamentals** and **RLHF** into post-training, where their purpose and dependencies are visible.
- Reframe architecture’s **Instruction Tuning and RLHF** as a short “base model → assistant” bridge to avoid repeating the dedicated post-training lessons.
- Keep GPT-2/nanochat as the architecture capstone, OLMo 3 as the pre-training capstone, and Tülu 3/DR Tulu as the post-training capstone.

## Missing foundations

- Tensors, shapes, matrix multiplication, dot products, and broadcasting.
- Probability distributions, logits, softmax, negative log-likelihood, entropy, and cross-entropy.
- Computation graphs, gradients, chain rule, backpropagation, initialization, and optimization.

## Missing inference and deployment

- Decoding beyond temperature: greedy, top-k, top-p, repetition effects, stopping, and calibration.
- Prefill versus decode, KV caching, memory arithmetic, and long-context limits.
- Quantization and the difference between weight, activation, and KV-cache precision.
- Continuous batching, throughput versus latency, speculative decoding, and serving metrics.
- Reasoning models and test-time compute, including when more tokens fail to help.

## Missing applications and reliability

- Prompting and context engineering as input design, not magic phrases.
- Embedding retrieval, chunking, reranking, RAG grounding, citations, and RAG evaluation.
- Tool schemas, agent loops, state, planning, termination, permissions, and failure recovery.
- Evaluation design, LLM judges, pairwise tests, uncertainty, contamination, and human review.
- Prompt injection, data leakage, privacy, supply-chain risk, and defense in depth.
- Production traces, cost/latency budgets, drift, feedback loops, incident response, and governance.

## Missing modern extensions

- Multimodal token/patch representations, cross-modal alignment, and evaluation.
- Interpretability, probes, causal interventions, attribution limits, model editing, and unlearning.

## Pedagogy gaps

- The course needs a visible prerequisite path and notation help before equations appear.
- More lessons should require prediction, calculation, diagnosis, ordering, or design—not only recognition.
- Interactive labs should end with an explicit transfer claim: what changes, why, and when the toy breaks.
- Completion should remain gated by a correct knowledge check, with capstones requiring synthesis decisions.
