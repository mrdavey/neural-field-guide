# Curriculum component grades

## Initial audit

Audit date: 2026-07-13  
Scope: all 44 lessons and all 7 guided synthesis/capstone projects, evaluated as learner-facing components for a beginner starting at Lesson 1. The audit considered the lesson summary, full chapter guide, walkthrough checkpoints, guided example, practice reveal, quiz, interactive lab, prediction-led code notebook, linked sources, and—for synthesis lessons—the persistent guided project.

### Rubric and method

Every component uses the same 100-point rubric:

- **A — Technical accuracy and currentness (25)**
- **C — Beginner clarity and progressive explanation (25)**
- **E — Examples and analogies (15)**
- **I — Active interaction/practice with feedback (15)**
- **D — Depth and transfer to new contexts (10)**
- **S — Assessment and scaffolding (5)**
- **R — Primary further reading/current sources (5)**

Scores of 95+ indicate an excellent, unusually complete beginner learning component—not merely technically correct content. A component below 95 therefore needs a specific teaching improvement, listed after the score tables. Foundational sources are not penalized merely for age when they remain canonical; “currentness” means that changing APIs, model practices, security guidance, and case studies are represented by current primary material. Spot checks included current TRL SFT documentation, the official OLMo 3 release/documentation, and OWASP's 2025 GenAI/LLM guidance.

### Lesson-by-lesson scores

| # | Component | A | C | E | I | D | S | R | Total |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | Introduction | 25 | 25 | 14 | 14 | 8 | 5 | 5 | **96** |
| 2 | Tensors, Shapes & Matrix Multiplication | 25 | 25 | 14 | 14 | 9 | 5 | 4 | **96** |
| 3 | Probability, Softmax & Cross-Entropy | 25 | 25 | 14 | 14 | 9 | 5 | 4 | **96** |
| 4 | Neural Networks, Gradients & Backpropagation | 25 | 25 | 14 | 14 | 9 | 5 | 4 | **96** |
| 5 | Optimizers | 25 | 25 | 14 | 14 | 9 | 5 | 4 | **96** |
| 6 | Tokenization | 24 | 25 | 14 | 14 | 9 | 5 | 4 | **95** |
| 7 | The Embedding Layer | 24 | 24 | 14 | 13 | 9 | 5 | 5 | **94** |
| 8 | Positional Encoding | 25 | 24 | 14 | 14 | 9 | 5 | 4 | **95** |
| 9 | Attention | 25 | 25 | 15 | 14 | 9 | 5 | 4 | **97** |
| 10 | Layers of Understanding | 25 | 24 | 14 | 14 | 9 | 5 | 4 | **95** |
| 11 | Learning to Predict | 25 | 25 | 14 | 14 | 9 | 5 | 4 | **96** |
| 12 | GPT-2 → nanochat: Build the Stack | 25 | 25 | 15 | 14 | 9 | 5 | 4 | **97** |
| 13 | Pre-Training Overview | 24 | 24 | 14 | 13 | 9 | 5 | 5 | **94** |
| 14 | Training Objectives and Architectural Details | 25 | 24 | 14 | 14 | 9 | 5 | 5 | **96** |
| 15 | Scaling Laws and Optimization | 25 | 24 | 14 | 14 | 9 | 5 | 4 | **95** |
| 16 | Training Data Engineering | 24 | 24 | 14 | 11 | 10 | 5 | 5 | **93** |
| 17 | Training Infrastructure and Systems | 25 | 24 | 14 | 13 | 10 | 5 | 4 | **95** |
| 18 | Advanced Pretraining Objectives | 24 | 23 | 14 | 13 | 10 | 5 | 5 | **94** |
| 19 | Evaluation During Pretraining | 25 | 24 | 14 | 13 | 10 | 5 | 4 | **95** |
| 20 | Case Study — OLMo 3 Model Flow | 25 | 25 | 15 | 14 | 9 | 5 | 4 | **97** |
| 21 | Bridge: From Base Model to Assistant | 24 | 24 | 14 | 12 | 10 | 5 | 5 | **94** |
| 22 | Post-Training Overview | 24 | 24 | 14 | 12 | 9 | 5 | 5 | **93** |
| 23 | Supervised Fine-Tuning | 25 | 25 | 15 | 14 | 9 | 5 | 4 | **97** |
| 24 | Preference Optimization | 25 | 24 | 14 | 14 | 9 | 5 | 5 | **96** |
| 25 | RL Fundamentals | 25 | 24 | 14 | 14 | 9 | 5 | 4 | **95** |
| 26 | RLHF | 25 | 24 | 14 | 14 | 9 | 5 | 5 | **96** |
| 27 | Tools and Safety Tuning | 25 | 24 | 14 | 12 | 10 | 5 | 4 | **94** |
| 28 | Case Study — Tülu 3 → DR Tulu | 25 | 25 | 15 | 14 | 9 | 5 | 4 | **97** |
| 29 | Decoding and Sampling | 25 | 25 | 14 | 14 | 9 | 5 | 4 | **96** |
| 30 | The Generation Loop and KV Cache | 25 | 25 | 14 | 14 | 9 | 5 | 4 | **96** |
| 31 | Quantization and Memory | 25 | 24 | 14 | 14 | 10 | 5 | 4 | **96** |
| 32 | Serving: Batching, Throughput and Latency | 25 | 24 | 14 | 14 | 10 | 5 | 4 | **96** |
| 33 | Reasoning and Test-Time Compute | 25 | 24 | 14 | 14 | 10 | 5 | 4 | **96** |
| 34 | Prompting and Context Engineering | 25 | 24 | 14 | 14 | 9 | 5 | 4 | **95** |
| 35 | Embeddings, Semantic Search and RAG | 25 | 24 | 14 | 14 | 10 | 5 | 4 | **96** |
| 36 | Tool Use and Agent Loops | 25 | 24 | 14 | 14 | 10 | 5 | 4 | **96** |
| 37 | LLM Evaluation and LLM-as-a-Judge | 25 | 25 | 14 | 14 | 10 | 5 | 4 | **97** |
| 38 | Security, Privacy and Prompt Injection | 25 | 25 | 14 | 14 | 10 | 5 | 4 | **97** |
| 39 | Production Observability, Cost and Governance | 25 | 24 | 14 | 14 | 10 | 5 | 4 | **96** |
| 40 | Distillation | 25 | 24 | 14 | 14 | 9 | 5 | 4 | **95** |
| 41 | LoRA | 25 | 24 | 14 | 14 | 10 | 5 | 4 | **96** |
| 42 | Mixture of Experts (MoE) | 25 | 24 | 14 | 14 | 10 | 5 | 4 | **96** |
| 43 | Multimodal Language Models | 25 | 24 | 14 | 14 | 9 | 5 | 4 | **95** |
| 44 | Interpretability and Model Editing | 25 | 25 | 14 | 14 | 10 | 5 | 4 | **97** |

### Synthesis/capstone project scores

These are scored separately from their host lessons. A capstone can therefore be excellent even when its lesson loses a point for a narrower interaction, and vice versa.

| Host lesson | Guided synthesis project | A | C | E | I | D | S | R | Total |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Optimizers | Explain one complete learning step | 25 | 25 | 14 | 15 | 10 | 5 | 4 | **98** |
| GPT-2 → nanochat | Build and debug a tiny GPT | 25 | 25 | 14 | 15 | 10 | 5 | 4 | **98** |
| OLMo 3 case study | Audit and redesign an open pre-training flow | 25 | 24 | 14 | 15 | 10 | 5 | 5 | **98** |
| Tülu 3 → DR Tulu | Design a dual-purpose post-training stack | 25 | 24 | 14 | 15 | 10 | 5 | 4 | **97** |
| Test-time compute | Design and benchmark an inference service | 25 | 24 | 14 | 15 | 10 | 5 | 4 | **97** |
| Observability and governance | Ship a source-grounded research agent safely | 25 | 25 | 14 | 15 | 10 | 5 | 4 | **98** |
| Interpretability and editing | Investigate and intervene on a false model claim | 25 | 25 | 14 | 15 | 10 | 5 | 4 | **98** |

### Required changes for components below 95

#### 7. The Embedding Layer — 94

**Missing teaching element:** The 2-D atlas is clear but hand-authored and primarily observational. It does not make the learner calculate similarity or directly confront the difference between the same context-free lookup vector and two different contextualized representations.

**Minimum change to reach 95+:** Add one short interaction that shows the same token ID for “bank” in two sentences, applies a tiny transparent context-mixing step, and asks the learner to predict then check cosine similarities. Give explicit feedback distinguishing lookup embeddings, contextual hidden states, and merely illustrative 2-D projections.

#### 13. Pre-Training Overview — 94

**Missing teaching element:** The pipeline control room identifies stage failures, but the learner does not have to assemble a viable run from a token budget, batch/sequence choice, optimizer steps, evaluation cadence, and checkpoint policy. This limits transfer from “name the stages” to “design the loop.”

**Minimum change to reach 95+:** Add a compact run-planning interaction with a fixed token/compute budget. Require the learner to set batch tokens, accumulation, optimizer steps, evaluation/checkpoint intervals, and a recovery artifact; immediately flag inconsistent totals and explain the trade-off behind each correction.

#### 16. Training Data Engineering — 93

**Missing teaching element:** This important chapter has prediction-led split code but no dedicated interactive audit or feedback loop. Beginners can repeat “deduplicate, filter, decontaminate” without deciding thresholds, detecting document leakage, or seeing how a cleaning decision changes quality, representation, and legal/privacy risk.

**Minimum change to reach 95+:** Add a corpus-audit lab containing a small inspectable manifest with duplicates, near-duplicates, PII/secrets, uncertain licenses, quality variation, benchmark overlap, and related documents. Have learners choose keep/quarantine/remove and a split unit, then provide per-item rationale feedback plus before/after counts for duplication, contamination, and domain/language composition. End with a versioned data-card export or summary.

#### 18. Advanced Pretraining Objectives — 94

**Missing teaching element:** BERT-style masking, span corruption, and fill-in-the-middle are each explained correctly, but the chapter asks a beginner to absorb several objective families before giving a strong selection framework. The objective lab visualizes serialization more than it tests choosing an objective for a new product or capability need.

**Minimum change to reach 95+:** Add a one-screen comparison matrix covering visible context, target, loss locations, inference mismatch, and best-fit use. Follow it with three scenario choices—bidirectional representation, text-to-text denoising, and code infilling—and provide immediate explanation for why each objective fits or fails.

#### 21. Bridge: From Base Model to Assistant — 94

**Missing teaching element:** The conceptual bridge is strong, but its interaction is the generic preference studio and it has no code trace. Learners do not yet trace one prompt through base prediction, SFT, preference/RL shaping, and external runtime controls while separating what each stage can and cannot change.

**Minimum change to reach 95+:** Add a stage-attribution activity for one unsafe or unhelpful response. Ask the learner to assign demonstrations, comparative feedback, verifiable rewards, retrieval/tool access, and permission enforcement to the correct stage, with rationale feedback and a final before/after pipeline trace.

#### 22. Post-Training Overview — 93

**Missing teaching element:** This overview has neither a dedicated lab nor a code notebook. Its practice and quiz assess recognition, but not whether a learner can select among SFT, DPO, RLVR/RLHF, evaluation, and runtime controls under real constraints.

**Minimum change to reach 95+:** Add a post-training pipeline composer with several target behaviors (format following, subjective style, exact math, open-ended research, and permission-sensitive tool use). Require a minimal stage sequence, signal/data type, success metric, and stop/regression rule; give immediate feedback on unnecessary stages and category errors.

#### 27. Tools and Safety Tuning — 94

**Missing teaching element:** The code example correctly keeps authority outside the model, but the chapter lacks a dedicated adversarial trajectory lab. It does not let the learner practice the crucial distinction among learned tool-call syntax, learned refusal behavior, deterministic schema validation, authorization, confirmation, sandboxing, and monitoring.

**Minimum change to reach 95+:** Add a branching tool-use incident with benign, malformed, injected, over-refused, and consequential calls. Have the learner choose the training signal and runtime control at each branch; give immediate feedback on both unsafe compliance and unnecessary blocking, then show the resulting audit trace, cost, and recovery action.

### Shared systematic weaknesses

1. **Most feedback is self-reveal rather than diagnostic.** Every lesson has a hint, worked answer, and one explained multiple-choice item, which is excellent baseline scaffolding. However, the system usually cannot inspect a learner's reasoning, distinguish arithmetic from conceptual errors, or route them to targeted remediation. The seven sub-95 items are where this matters most.

2. **Interactive labs are intentionally illustrative, not authentic measurements.** Clear “toy” and caveat labels prevent overclaiming, but a learner can sometimes move sliders without making a prediction, recording evidence, or explaining a result. A reusable predict → commit → observe → explain pattern would strengthen transfer across the entire site.

3. **Mastery is mostly local, not cumulative.** Prerequisite labels and capstones create a strong progression, but there is little spaced retrieval or interleaving after a learner leaves a lesson. Add a small cumulative checkpoint at each phase boundary that samples earlier concepts and explains which prerequisite to revisit.

4. **Resource quality is high but claim-to-source guidance is inconsistent.** Every guide provides three annotated resources and many use canonical papers or current documentation. To reach a uniformly perfect source score, mark “foundational” versus “current practice,” include a reviewed/version date for mutable documentation, and attach a one-sentence reading question that directs beginners to the relevant section.

5. **Capstone assessment is excellent but self-attested.** Persistent notes, checkpoints, rubrics, exemplars, and reflection are unusually strong. The remaining improvement would be lightweight artifact checks—for example, validating required headings, numeric fields, test results, or trace elements—without pretending an automated check can fully grade the design reasoning.

### Distribution and conclusion

| Score | Components |
|---:|---:|
| 98 | 5 |
| 97 | 10 |
| 96 | 19 |
| 95 | 10 |
| 94 | 5 |
| 93 | 2 |

- **Mean:** 95.9
- **Median:** 96
- **At or above 95:** 44/51 (86.3%)
- **Below 95:** 7/51 (13.7%)
- **Lowest score:** 93

The curriculum is already technically careful, beginner-oriented, example-rich, and substantially more interactive than a conventional self-study syllabus. The shortest path to universal 95+ quality is not more prose. It is to add seven targeted, decision-bearing interactions with immediate rationale feedback, then reuse their predict/commit/observe/explain pattern for cumulative mastery checks.

## Final re-grade after improvements

Re-grade date: 2026-07-13  
Change reviewed: the seven decision studios in `app/mastery-studios.tsx`, their lazy integration into lesson pages, responsive styling, and associated tests. The same seven-part, 100-point rubric from the initial audit was used without lowering the 95 threshold. The production build and all 37 tests passed. Unchanged components retain their initial score because inspection found no integration regression; the seven changed lessons were rescored from their complete learner-facing experience.

### Final lesson scores

| # | Component | Final score |
|---:|---|---:|
| 1 | Introduction | **96** |
| 2 | Tensors, Shapes & Matrix Multiplication | **96** |
| 3 | Probability, Softmax & Cross-Entropy | **96** |
| 4 | Neural Networks, Gradients & Backpropagation | **96** |
| 5 | Optimizers | **96** |
| 6 | Tokenization | **95** |
| 7 | The Embedding Layer | **99** |
| 8 | Positional Encoding | **95** |
| 9 | Attention | **97** |
| 10 | Layers of Understanding | **95** |
| 11 | Learning to Predict | **96** |
| 12 | GPT-2 → nanochat: Build the Stack | **97** |
| 13 | Pre-Training Overview | **99** |
| 14 | Training Objectives and Architectural Details | **96** |
| 15 | Scaling Laws and Optimization | **95** |
| 16 | Training Data Engineering | **100** |
| 17 | Training Infrastructure and Systems | **95** |
| 18 | Advanced Pretraining Objectives | **99** |
| 19 | Evaluation During Pretraining | **95** |
| 20 | Case Study — OLMo 3 Model Flow | **97** |
| 21 | Bridge: From Base Model to Assistant | **99** |
| 22 | Post-Training Overview | **99** |
| 23 | Supervised Fine-Tuning | **97** |
| 24 | Preference Optimization | **96** |
| 25 | RL Fundamentals | **95** |
| 26 | RLHF | **96** |
| 27 | Tools and Safety Tuning | **99** |
| 28 | Case Study — Tülu 3 → DR Tulu | **97** |
| 29 | Decoding and Sampling | **96** |
| 30 | The Generation Loop and KV Cache | **96** |
| 31 | Quantization and Memory | **96** |
| 32 | Serving: Batching, Throughput and Latency | **96** |
| 33 | Reasoning and Test-Time Compute | **96** |
| 34 | Prompting and Context Engineering | **95** |
| 35 | Embeddings, Semantic Search and RAG | **96** |
| 36 | Tool Use and Agent Loops | **96** |
| 37 | LLM Evaluation and LLM-as-a-Judge | **97** |
| 38 | Security, Privacy and Prompt Injection | **97** |
| 39 | Production Observability, Cost and Governance | **96** |
| 40 | Distillation | **95** |
| 41 | LoRA | **96** |
| 42 | Mixture of Experts (MoE) | **96** |
| 43 | Multimodal Language Models | **95** |
| 44 | Interpretability and Model Editing | **97** |

### Final synthesis/capstone scores

| Host lesson | Guided synthesis project | Final score |
|---|---|---:|
| Optimizers | Explain one complete learning step | **98** |
| GPT-2 → nanochat | Build and debug a tiny GPT | **98** |
| OLMo 3 case study | Audit and redesign an open pre-training flow | **98** |
| Tülu 3 → DR Tulu | Design a dual-purpose post-training stack | **97** |
| Test-time compute | Design and benchmark an inference service | **97** |
| Observability and governance | Ship a source-grounded research agent safely | **98** |
| Interpretability and editing | Investigate and intervene on a false model claim | **98** |

### Rubric sub-scores for the seven changed lessons

| Component | A /25 | C /25 | E /15 | I /15 | D /10 | S /5 | R /5 | Final |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| The Embedding Layer | 24 | 25 | 15 | 15 | 10 | 5 | 5 | **99** |
| Pre-Training Overview | 24 | 25 | 15 | 15 | 10 | 5 | 5 | **99** |
| Training Data Engineering | 25 | 25 | 15 | 15 | 10 | 5 | 5 | **100** |
| Advanced Pretraining Objectives | 24 | 25 | 15 | 15 | 10 | 5 | 5 | **99** |
| Bridge: From Base Model to Assistant | 24 | 25 | 15 | 15 | 10 | 5 | 5 | **99** |
| Post-Training Overview | 24 | 25 | 15 | 15 | 10 | 5 | 5 | **99** |
| Tools and Safety Tuning | 25 | 25 | 15 | 15 | 10 | 5 | 4 | **99** |

### Studio-by-studio finding

- **Embedding:** Fully meets the requested change. It preserves one token ID and lookup across two sentences, makes context mixing and cosine comparison inspectable, requires a committed prediction, and explicitly distinguishes a lookup row, contextual hidden state, and illustrative 2-D geometry.
- **Pre-training run planning:** Fully meets the requested change. Token-budget arithmetic, global batch construction, proposed optimizer steps, evaluation/checkpoint cadence, and complete recovery state all produce immediate consistency feedback.
- **Data engineering:** Fully meets the requested change. The manifest covers exact and near duplicates, secrets/PII, uncertain rights, benchmark overlap, minority-language representation, related-document leakage, quarantine versus removal, and a versioned data-card gate. Its before/provisional-after panel accurately reports kept and pending manifest rows, duplication signals, benchmark overlap, language coverage, and domain categories without confusing manifest rows with represented documents.
- **Advanced objectives:** Fully meets the requested change. A compact matrix separates visible context, target/loss, best fit, and mismatch; three realistic scenarios provide option-specific rationale feedback for masked LM, span corruption, and FIM.
- **Base-to-assistant bridge:** Fully meets the requested change. Five requirements are attributed separately to SFT, preference optimization, verifiable-reward RL, retrieval/tools, and runtime authorization, then recombined into a readable pipeline.
- **Post-training overview:** Fully meets the requested change. Five target behaviors require a complete proposal containing stage sequence, signal, metric, and regression/stop rule; distractors expose both unnecessary sophistication and category errors.
- **Tools and safety:** Fully meets the requested change. The staged incident exercise covers benign allowance, schema failure, indirect injection, over-refusal, and consequential action, with explicit training/runtime distinctions plus audit, cost, and recovery evidence.

### Final distribution

| Score | Components |
|---:|---:|
| 100 | 1 |
| 99 | 6 |
| 98 | 5 |
| 97 | 10 |
| 96 | 19 |
| 95 | 10 |

- **Mean:** 96.6
- **Median:** 96
- **At or above 95:** 51/51 (100%)
- **Below 95:** 0/51
- **Lowest score:** 95

### Remaining gaps

No caveat or essential fix remains from this audit. The data-audit metrics now label their counting unit as manifest rows, keep unanswered rows visible as pending in the provisional state, distinguish pending from retained duplication and contamination signals, and continue to block data-card completion until every decision and the leakage-safe split are correct. Training Data Engineering therefore receives the full 25/25 for technical accuracy and 100/100 overall.

## 100-point gap audit

Audit date: 2026-07-13  
Standard: the unchanged seven-part rubric above. This audit does not reinterpret 95 as perfect. A 100 requires direct learner-facing evidence for every rubric point; planned work, adjacent lessons, and the existence of a UI control do not earn credit by themselves.

### Reusable implementation requirements

The codes below make repeated deductions implementable without hiding component-specific requirements.

| Code | Rubric deduction | Reusable requirement for full credit | Required evidence |
|---|---|---|---|
| **TA** | Technical accuracy/currentness −1 | Replace or validate a deliberately simplified mechanism with a current, primary-source-grounded authentic trace. State assumptions and where the teaching model diverges from production behavior. | An executable or inspectable real-model/system artifact, exact version/revision, expected output, and a primary source supporting the claim. |
| **CL** | Beginner clarity/progression −1 | Add the missing novice bridge between the current explanation and the first expert decision: define inputs, label intermediate states, and show why each step follows. | An annotated worked trace or starter scaffold that a beginner can reproduce without importing unstated domain knowledge. |
| **EX** | Examples/analogies −1 | Add a second, contrasting authentic example or a complete artifact. It must expose a boundary case, not merely restate the existing toy example. | Two worked cases with different outcomes, or one complete realistic artifact plus an explicit comparison explaining what changed. |
| **FB** | Active interaction/feedback −1 per point | Use predict → commit → observe → explain, with answer-specific diagnosis, retry, and a recorded mastery condition. A slider/readout or answer reveal alone is insufficient for 15/15. | A learner action whose correctness can be checked, misconception-specific feedback, a corrected retry, and a visible pass condition. Components marked FB−2 additionally need a second independent decision or artifact check. |
| **TR** | Depth/transfer −1 per point | Require application in an unfamiliar context and assess the reasoning with criteria rather than presenting the transfer rule. | A novel scenario, learner-produced decision/calculation, rubric or worked solution, and evidence distinguishing successful transfer from copied pattern matching. Components marked TR−2 need two materially different transfer contexts. |
| **SRC** | Primary/current sources −1 | Make further reading claim-linked and maintenance-ready: identify primary versus explanatory sources, pin mutable documentation to a reviewed version/date, and give a reading question. | At least one primary source tied to the component's central claim, a review/version marker, and a prompt directing the learner to the relevant section or result. For capstones, the source pack must appear inside the project. |

### Per-lesson mapping to 100

| # | Component | Current | Missing points | Minimum component-specific evidence required for 100 |
|---:|---|---:|---|---|
| 1 | Introduction | 96 | EX−1, FB−1, TR−2 | Add an inspectable real next-token trace alongside the toy vocabulary; require a committed prediction with diagnostic feedback; then assess transfer separately on factual answering and a tool-using assistant so the learner distinguishes model prediction from surrounding system behavior. |
| 2 | Tensors, Shapes & Matrix Multiplication | 96 | EX−1, FB−1, TR−1, SRC−1 | Trace shapes from an actual Transformer projection; make the learner diagnose a broadcasting/contraction bug and retry; add a novel multi-head reshape task with worked criteria; link a versioned primary tensor/einsum implementation section. |
| 3 | Probability, Softmax & Cross-Entropy | 96 | EX−1, FB−1, TR−1, SRC−1 | Add a contrasting overflow/calibration case from real logits; check a learner-computed stable-softmax/loss result with error-specific feedback; transfer to temperature calibration or masked-token loss; tie the claims to primary framework documentation and a foundational source. |
| 4 | Neural Networks, Gradients & Backpropagation | 96 | EX−1, FB−1, TR−1, SRC−1 | Add a real autograd-versus-finite-difference trace including a failure; require the learner to localize a sign/scale bug; transfer the chain rule to a small matrix layer; pin the exact autodiff documentation used by the notebook. |
| 5 | Optimizers | 96 | EX−1, FB−1, TR−1, SRC−1 | Compare SGD and Adam on the same noisy or ill-conditioned problem; grade a learner's update/state calculation rather than only moving a learning-rate slider; transfer to choosing an optimizer under memory/precision constraints; attach versioned primary optimizer references. |
| 6 | Tokenization | 95 | TA−1, EX−1, FB−1, TR−1, SRC−1 | Run at least two current production tokenizers on multilingual text, code, whitespace, and invalid/byte-heavy input; require exact encode/decode and cost predictions with feedback; transfer to vocabulary/model selection; pin tokenizer revisions and original algorithm sources. |
| 7 | The Embedding Layer | 99 | TA−1 | Validate the transparent 2-D context-mixing studio with an authentic small Transformer trace: same token ID/lookup, extracted hidden states at named layers, measured cosine change across the two contexts, model revision, code, and expected output. |
| 8 | Positional Encoding | 95 | CL−1, EX−1, FB−1, TR−1, SRC−1 | Bridge the toy rotation to paired RoPE coordinates and attention scores; contrast absolute, relative, and rotary behavior on one sequence; grade a position/relative-distance prediction; transfer to a length-extension failure; link versioned implementation code plus the primary papers. |
| 9 | Attention | 97 | FB−1, TR−1, SRC−1 | Require the learner to calculate or select the correct mask/weight/output for an unseen query with misconception-specific feedback; transfer to diagnosing information routing in a new sequence; link the exact current attention implementation or kernel semantics used by the trace. |
| 10 | Layers of Understanding | 95 | CL−1, EX−1, FB−1, TR−1, SRC−1 | Add an annotated pre-norm residual-block numerical trace; contrast a stable block with a shape/normalization failure; grade the learner's diagnosis; transfer to a different block variant; tie the trace to primary architecture and implementation sources. |
| 11 | Learning to Predict | 96 | EX−1, FB−1, TR−1, SRC−1 | Add a complete shifted-label and masked-loss batch including padding; check learner alignment decisions and off-by-one diagnosis; transfer to packed or multi-turn data; pin the framework loss/collator behavior used. |
| 12 | GPT-2 → nanochat: Build the Stack | 97 | FB−1, TR−1, SRC−1 | Make the shape tracer validate a learner-produced mask/shape test and retry, not only advance stages; require a transfer ablation on an unfamiliar tiny corpus; pin the exact GPT-2/nanochat code revisions used for comparison. |
| 13 | Pre-Training Overview | 99 | TA−1 | Validate planner arithmetic against a real packed/padded dataloader and distributed training configuration, including partial final batches and actual non-padding token accounting; provide the config revision, logged token count, and reconciliation with the estimate. |
| 14 | Training Objectives and Architectural Details | 96 | CL−1, EX−1, FB−1, TR−1 | Add a novice trace from serialized sample through labels and loss mask; contrast causal, prefix, and assistant-only masking on the same text; grade an unseen mask construction; transfer to a new chat/data format. |
| 15 | Scaling Laws and Optimization | 95 | CL−1, EX−1, FB−1, TR−1, SRC−1 | Walk through fitting or reading one empirical scaling curve before the allocation decision; compare two real equal-compute runs; grade a budget allocation with uncertainty; transfer to a deployment-constrained objective; link data/code or tables from primary scaling studies. |
| 16 | Training Data Engineering | 100 | None | Current evidence is sufficient: authentic risk categories, committed per-item decisions, rationale feedback, pending-aware before/after metrics, representation and leakage checks, and a gated versioned data-card summary. |
| 17 | Training Infrastructure and Systems | 95 | CL−1, EX−1, FB−2, SRC−1 | Add a novice ownership/communication trace for data, tensor, pipeline, and sharded state; contrast two measured distributed configurations; independently grade both a memory-partition decision and a communication/recovery diagnosis; link exact primary framework configurations and versioned system documentation. |
| 18 | Advanced Pretraining Objectives | 99 | TA−1 | Add one current decoder-oriented mixed-objective recipe (for example, a documented FIM/causal mixture) with exact serialization, mixture weight, model/code revision, and ablation evidence from a primary release rather than stopping at the three canonical objective families. |
| 19 | Evaluation During Pretraining | 95 | CL−1, EX−1, FB−2, SRC−1 | Bridge raw logs to intrinsic, capability, contamination, and systems conclusions; compare a healthy trace with a confounded/regressing run; independently grade metric selection and diagnosis/stop action; pin benchmark harness/config revisions and primary evaluation protocols. |
| 20 | Case Study — OLMo 3 Model Flow | 97 | FB−1, TR−1, SRC−1 | Require a scored stage-change decision with counterfactual feedback; transfer the audit method to another open model flow; pin exact OLMo 3 checkpoints/config/data-recipe revisions inside the lesson rather than relying on general landing pages. |
| 21 | Bridge: From Base Model to Assistant | 99 | TA−1 | Ground the stage taxonomy in one current, reproducible open assistant recipe with exact revisions and observed artifacts, including where online RL/verifiable reward and runtime controls sit; show the mapping between the studio labels and the release's actual stages. |
| 22 | Post-Training Overview | 99 | TA−1 | Add a current end-to-end post-training recipe that includes modern online/verifiable or agentic training where applicable, exact data/model/code revisions, and measured stage deltas; explicitly separate generally established practice from recipe-specific choices. |
| 23 | Supervised Fine-Tuning | 97 | FB−1, TR−1, SRC−1 | Execute and validate a smoke-test artifact rather than only display code, with diagnostic feedback for template/mask/data failures; transfer the workshop to a second task/domain with a rubric; pin the environment, model revision, and mutable TRL/PEFT documentation. |
| 24 | Preference Optimization | 96 | CL−1, EX−1, FB−1, TR−1 | Add a novice numerical trace from chosen/rejected log-probabilities through the preference update; contrast a clean pair with length bias or label noise; grade an unseen pair diagnosis; transfer method selection to a different preference regime. |
| 25 | RL Fundamentals | 95 | CL−1, EX−1, FB−1, TR−1, SRC−1 | Bridge trajectory, return, baseline, advantage, and policy update with one complete numeric episode; contrast positive reward with negative advantage; grade an unseen update; transfer to delayed credit; pin primary algorithm and implementation references. |
| 26 | RLHF | 96 | CL−1, EX−1, FB−1, TR−1 | Add a novice end-to-end trajectory from preference data to reward, KL-controlled policy update, and evaluation; contrast reward hacking or KL collapse; grade a mitigation choice; transfer to a new subjective task. |
| 27 | Tools and Safety Tuning | 99 | SRC−1 | Add a claim-linked, version-reviewed primary source pack for tool-use training, current LLM application security guidance, and runtime authorization design; include a reading question that asks learners to separate learned behavior from enforced capability. |
| 28 | Case Study — Tülu 3 → DR Tulu | 97 | FB−1, TR−1, SRC−1 | Score a learner-designed SFT/DPO/RLVR/RLER allocation with failure-specific feedback; transfer the recipe to a non-research tool task; pin exact paper/code/model/data revisions in the case-study workspace. |
| 29 | Decoding and Sampling | 96 | EX−1, FB−1, TR−1, SRC−1 | Add a contrasting structured-output or degeneration case; grade a decoding-policy choice and observed distribution; transfer to a different risk/creativity contract; pin current generation API semantics and the primary degeneration study. |
| 30 | The Generation Loop and KV Cache | 96 | EX−1, FB−1, TR−1, SRC−1 | Add an actual prefill/decode/cache tensor trace and measured memory; grade a cache-shape/memory diagnosis; transfer to GQA, prefix sharing, or eviction; pin the serving implementation revision used. |
| 31 | Quantization and Memory | 96 | CL−1, EX−1, FB−1, SRC−1 | Bridge group scales/zero points/outliers to reconstruction with a labeled numeric example; compare measured quality and memory for two real schemes; grade a method choice; pin library/kernel/model revisions and primary method papers. |
| 32 | Serving: Batching, Throughput and Latency | 96 | CL−1, EX−1, FB−1, SRC−1 | Add an annotated request timeline defining TTFT, inter-token latency, queueing, goodput, and tail latency; compare measured static versus continuous batching; grade a scheduler/SLO decision; pin benchmark tool and server revisions. |
| 33 | Reasoning and Test-Time Compute | 96 | CL−1, EX−1, FB−1, SRC−1 | Add a beginner trace separating candidate generation, diversity, verifier selection, and final accuracy; compare a success with verifier failure at matched budget; grade a budget allocation; cite exact primary experiments and settings. |
| 34 | Prompting and Context Engineering | 95 | CL−1, EX−1, FB−1, TR−1, SRC−1 | Walk through authority, evidence, examples, and token budgeting in one annotated prompt; contrast a clean context with conflict/injection; grade an unseen context edit; transfer to another task; pin current provider/security guidance. |
| 35 | Embeddings, Semantic Search and RAG | 96 | CL−1, EX−1, FB−1, SRC−1 | Add a novice end-to-end trace from chunk to embedding/retrieval/rerank/citation entailment; compare retrieval failure with generation failure; grade stage diagnosis; pin embedding model, index, reranker, dataset, and evaluation revisions. |
| 36 | Tool Use and Agent Loops | 96 | CL−1, EX−1, FB−1, SRC−1 | Add an annotated state/event schema before the loop; contrast successful recovery with an idempotency or termination failure; grade a transition/authority decision; pin an executable orchestration implementation and primary agent method. |
| 37 | LLM Evaluation and LLM-as-a-Judge | 97 | EX−1, FB−1, SRC−1 | Add a complete calibrated evaluation artifact with raw labels, agreement, uncertainty, and a changed ship decision; grade a learner's judge-bias diagnosis; pin judge prompts/model versions and primary benchmark protocol. |
| 38 | Security, Privacy and Prompt Injection | 97 | EX−1, FB−1, SRC−1 | Add a second complete threat model showing assets, boundaries, exploit, containment, and overblocking trade-off; grade a learner-authored control placement; pin the exact current OWASP/NIST version and a primary attack/defense result. |
| 39 | Production Observability, Cost and Governance | 96 | CL−1, EX−1, FB−1, SRC−1 | Bridge traces, metrics, SLOs, owners, and rollback with an annotated incident timeline; compare two root causes with similar aggregate symptoms; grade the response; pin telemetry schema/tool and governance guidance versions. |
| 40 | Distillation | 95 | CL−1, EX−1, FB−1, TR−1, SRC−1 | Walk through temperature, softened targets, loss mixture, and student update numerically; compare successful transfer with teacher-error propagation; grade a design choice; transfer to sequence-level generation; pin primary method and current implementation references. |
| 41 | LoRA | 96 | CL−1, EX−1, FB−1, SRC−1 | Add a labeled matrix-shape/initialization/merge trace; compare measured rank/target-module choices on one real adapter; grade a deployment decision; pin PEFT/model/base revisions and primary LoRA/QLoRA sources. |
| 42 | Mixture of Experts (MoE) | 96 | CL−1, EX−1, FB−1, SRC−1 | Bridge router logits, top-k dispatch, capacity, communication, combine, and auxiliary loss with a full token trace; contrast balanced routing with overflow; grade a capacity/routing diagnosis; pin an implementation and primary system/model revision. |
| 43 | Multimodal Language Models | 95 | CL−1, EX−1, FB−1, TR−1, SRC−1 | Add a novice processor-to-patch/projector/token trace; contrast perception/OCR failure with language-prior failure on real artifacts; grade diagnosis; transfer to audio or video; pin model/processor/evaluation revisions and primary sources. |
| 44 | Interpretability and Model Editing | 97 | EX−1, FB−1, SRC−1 | Add a complete reproducible intervention result with matched/sham controls, effect sizes, locality, and persistence; grade the strongest defensible claim; pin model, hook/library, dataset, and primary method revisions. |

### Per-capstone mapping to 100

| Host lesson | Guided synthesis project | Current | Missing points | Minimum component-specific evidence required for 100 |
|---|---|---:|---|---|
| Optimizers | Explain one complete learning step | 98 | EX−1, SRC−1 | Provide one complete downloadable learner artifact including calculations, finite-difference check, and a diagnosed failure—not only the compact exemplar summary—and embed versioned primary references for the numerical/optimizer conventions used. |
| GPT-2 → nanochat | Build and debug a tiny GPT | 98 | EX−1, SRC−1 | Provide a runnable reference artifact with tests, logs, curves, samples, checkpoint/resume evidence, and the controlled ablation; pin every upstream code/data revision inside the project. |
| OLMo 3 case study | Audit and redesign an open pre-training flow | 98 | CL−1, EX−1 | Add an annotated starter model-flow table that defines each evidence field for a novice, plus a complete worked mini-replication proposal with control, treatment, budget, metrics, risks, and stop rule. |
| Tülu 3 → DR Tulu | Design a dual-purpose post-training stack | 97 | CL−1, EX−1, SRC−1 | Add a novice-ready signal/stage starter scaffold, a full worked dual-purpose design artifact with evaluation and runtime boundaries, and a project-local pack of exact Tülu/DR Tulu paper, code, model, and data revisions. |
| Test-time compute | Design and benchmark an inference service | 97 | CL−1, EX−1, SRC−1 | Add an annotated service/SLO starter worksheet, a complete reproducible benchmark report with raw measurements and falsification decision, and pinned server/model/benchmark-tool revisions inside the project. |
| Observability and governance | Ship a source-grounded research agent safely | 98 | EX−1, SRC−1 | Provide a complete reference package—threat model, trace schema, evaluation table, attack outcomes, gates, rollback, and incident drill—and embed versioned primary security, telemetry, and retrieval sources in the project. |
| Interpretability and editing | Investigate and intervene on a false model claim | 98 | EX−1, SRC−1 | Provide a reproducible reference notebook/report with prompts, activations, sham/neighbor controls, effect sizes, locality/persistence results, and bounded claim; pin model, dataset, library, and method revisions inside the project. |

### Systematic gap counts

Counts overlap because one component can miss points in several rubric dimensions.

| Gap category | Affected components | Missing rubric points |
|---|---:|---:|
| TA — authentic/current technical validation | 6 | 6 |
| CL — missing novice bridge | 23 | 23 |
| EX — insufficient contrasting/authentic example | 39 | 39 |
| FB — interaction lacks full diagnostic mastery evidence | 37 | 39 |
| TR — transfer is presented rather than assessed | 24 | 25 |
| SRC — sources are not fully claim-linked/version-pinned | 40 | 40 |
| Assessment/scaffolding | 0 | 0 |

- **Components already at a legitimate 100:** 1/51 — Training Data Engineering.
- **Components with at least one remaining gap:** 50/51.
- **Total missing rubric points across the curriculum:** 172/5,100.
- **Current aggregate:** 4,928/5,100, or 96.6/100 mean.

The largest reusable opportunity is not additional exposition. It is to pair the existing strong teaching surfaces with authentic artifacts, diagnostic mastery checks, claim-linked versioned sources, and assessed transfer. Implementing EX, FB, and SRC as shared content contracts would address 118 of the 172 missing points while preserving component-specific evidence.

## Independent re-grade of the final implementation

Audit date: 2026-07-13  
Scope: all 44 lessons and all 7 capstones in the current implementation, including lesson evidence, evidence rendering, guide interaction, six technical validations, seven mastery studios, the SFT workshop, capstone evidence packs, project rendering, labs, guides, and tests. The unchanged rubric and the strict evidence standards from the preceding 100-point gap audit were used.

The required verification instruction was applied literally: “Previously you came up with the following implementation plan. Carefully check if every aspect of your plan was implemented correctly, and that each implemented part improves our pipeline. If there is anything missing, incorrect, or not implemented fully, then detail how you will fix it. If no fixes are required, say so.”

The production build and all 44 tests pass. Those tests establish coverage, wiring, structure, and rendering; they do not by themselves establish that a learner's answer was diagnosed correctly or that a described experiment was actually run.

### What the implementation genuinely recovered

- The component-specific contrast records are accurate, useful boundary cases. Together with the existing guided examples, they earn the missing example point for all 44 lessons.
- The mechanism bridge labels input, intermediate state checks, and output, which closes the novice-progression gap in the affected lessons.
- Every lesson now has a genuinely unfamiliar transfer prompt, three criteria, and a worked solution. This earns the depth/transfer point because the task exists and is well designed, even where its UI does not independently validate the answer.
- Further-reading cards now identify source role, provide a claim-directed reading question, include a limitation prompt, and carry a maintenance date. Capstones have project-local revision markers and reading questions. These changes earn the source point.
- The seven prior mastery studios continue to provide answer-specific rationale feedback. Data Engineering and Tools/Safety now satisfy every rubric dimension.

### What remains incomplete or incorrect

Three evidence gaps remain; deductions below refer only to these codes.

| Code | Deduction | Current implementation problem | Required fix and proof |
|---|---|---|---|
| **A−1** | Technical accuracy/currentness −1 | A “Pinned technical validation” renders a proposed artifact, expected evidence, and sources, but no preserved execution result. Tokenization omits the promised exact ten output rows; pretraining has only a loop snippet; advanced objectives and the two Tülu mappings contain no executed course result/filled ledger. The embedding example additionally calls `padding=True` with an unmodified GPT-2 tokenizer, which has no padding token and will fail before producing hidden states. | Execute each pinned validation and ship its immutable result artifact beside the lesson: raw output/log/table, environment lock, command, hash, and interpretation. For embedding, tokenize separately or explicitly configure and mask a pad token, then preserve the actual cosines. Tests must run cheap fixtures or validate checked-in outputs against a generating script. |
| **I−1** | Active interaction/practice with feedback −1 | In 37 lessons, `LessonEvidenceView` declares transfer passed when the learner manually checks all three criteria. `LessonGuideView` likewise asks the learner to select “matched/partial/missed.” The response text is never examined, so an empty or irrelevant explanation can be called correct after the minimum-length gate. This is structured self-assessment, not diagnostic feedback or recorded mastery evidence. | Give every affected lesson at least one objectively checkable component-specific response: numeric fields, ordered steps, classified decisions, selected evidence, or constrained construction. Validate it against answer-specific rules, identify the first failed criterion, require correction, and record pass only from validation state. Keep free-text reflection, but do not derive a success claim solely from learner checkboxes. |
| **E−1** | Examples/analogies −1 for capstones | Each “Complete worked artifact” is four prose paragraphs describing what a complete package should contain. It does not include the promised actual calculations/notebook, raw metrics, test output, model-flow table, evaluation rows, threat-model diagram/trace, or intervention results. Keyword checks can confirm that words occur in a draft but cannot substitute for an inspectable reference artifact. | Ship one complete project-local reference artifact per capstone, with real filled tables/numbers, raw or machine-readable evidence, commands/code where relevant, and reproducibility metadata. Render or link the artifact from the project and verify its required fields/files in tests. |

### Exact lesson scores

For compactness, a row with `I−1` has subscores **25/25 accuracy, 25/25 clarity, 15/15 examples, 14/15 interaction, 10/10 depth, 5/5 assessment, 5/5 sources**. A row with `A−1` has 24/25 accuracy and full credit elsewhere. Tokenization has both deductions.

| # | Lesson | Exact score | Rubric deduction and required evidence |
|---:|---|---:|---|
| 1 | Introduction | **99** | I−1 — validate the weather/evidence/action boundary response rather than allowing three self-checked criteria to create a pass. |
| 2 | Tensors, Shapes & Matrix Multiplication | **99** | I−1 — objectively validate the GQA head mapping and final score shape, with feedback on the first wrong axis. |
| 3 | Probability, Softmax & Cross-Entropy | **99** | I−1 — collect numeric raw/masked losses and diagnose denominator, masking, or logarithm errors. |
| 4 | Neural Networks, Gradients & Backpropagation | **99** | I−1 — validate all three gradient shapes/products and identify the first incorrect chain-rule edge. |
| 5 | Optimizers | **99** | I−1 — check optimizer-state counts, feasibility, and the proposed controlled comparison independently. |
| 6 | Tokenization | **98** | A−1 — preserve the exact ten pinned tokenizer result rows; I−1 — validate the four-case test design and decision rule rather than trusting self-checks. |
| 7 | The Embedding Layer | **99** | A−1 — fix GPT-2 batching/padding, execute the hidden-state script, and preserve actual token IDs, layer cosines, environment, and output. |
| 8 | Positional Encoding | **99** | I−1 — validate that the learner supplies both a positional diagnostic and a task-level falsifier. |
| 9 | Attention | **99** | I−1 — check causal/bidirectional allowed-key sets and reject causal claims inferred only from weights. |
| 10 | Layers of Understanding | **99** | I−1 — validate post-norm operation order, residual widths, and checkpoint incompatibility reasoning. |
| 11 | Learning to Predict | **99** | I−1 — let the learner construct a visible label mask/boundary and validate each contributing position. |
| 12 | GPT-2 → nanochat: Build the Stack | **99** | I−1 — validate the treatment/control, fixed-budget fields, and falsifier in the proposed code-domain ablation. |
| 13 | Pre-Training Overview | **99** | A−1 — run the counter in the pinned loader and ship ordinary plus partial/padded raw batch logs and the reconciled distributed total. |
| 14 | Training Objectives and Architectural Details | **99** | I−1 — provide an editable role/token mask and validate both defensible policies token by token. |
| 15 | Scaling Laws and Optimization | **99** | I−1 — validate distinct research/edge objective, measurement, uncertainty, and decision fields. |
| 16 | Training Data Engineering | **100** | None. Per-item decisions, rationale feedback, pending-aware metrics, split validation, authentic trade-off, assessed transfer, and sources meet the rubric. |
| 17 | Training Infrastructure and Systems | **99** | I−1 — validate topology placement, ownership/communication choices, and complete recovery state independently. |
| 18 | Advanced Pretraining Objectives | **99** | A−1 — execute the declared 50/50 StarCoder2-derived course probe and preserve serialized IDs, equal-token manifest, paired metrics, uncertainty, and regression result. |
| 19 | Evaluation During Pretraining | **99** | I−1 — validate metric classification, stop/continue action, and minimum diagnostic slices against the mixed trace. |
| 20 | Case Study — OLMo 3 Model Flow | **99** | I−1 — validate required artifacts and causal evidence in the transferred open-model audit instead of accepting learner checkboxes. |
| 21 | Bridge: From Base Model to Assistant | **99** | A−1 — ship the filled pinned Tülu stage/runtime ledger with actual artifact IDs and observed stage evidence, not only its expected schema. |
| 22 | Post-Training Overview | **99** | A−1 — ship the completed Tülu 3.1 ledger with matched stage metrics, costs, regressions, and keep/remove decisions. |
| 23 | Supervised Fine-Tuning | **99** | I−1 — independently validate the medical-summary transfer's data boundary, evaluation suite, and stop/regression rules; the workshop planner alone does not grade them. |
| 24 | Preference Optimization | **99** | I−1 — validate rubric differences, normalization decisions, and bias diagnostics for both application contexts. |
| 25 | RL Fundamentals | **99** | I−1 — check the delayed-credit path and variance source in structured trajectory fields. |
| 26 | RLHF | **99** | I−1 — validate that factual safety is a non-compensable gate and that reward/preference design cannot trade it away. |
| 27 | Tools and Safety Tuning | **100** | None. The five-stage incident studio supplies answer-specific feedback, retry, benign/unsafe slices, audit evidence, cost/recovery, transfer, and current sources. |
| 28 | Case Study — Tülu 3 → DR Tulu | **99** | I−1 — validate exact versus open-ended reward assignment and the external authorization boundary for service restarts. |
| 29 | Decoding and Sampling | **99** | I−1 — validate both decoding contracts and require the medication extractor's blocking metric. |
| 30 | The Generation Loop and KV Cache | **99** | I−1 — check cache options, tenant isolation/invalidation, and uncached-reference correctness evidence. |
| 31 | Quantization and Memory | **99** | I−1 — validate that the rare medical regression blocks deployment and that the next measurement localizes quantization sensitivity. |
| 32 | Serving: Batching, Throughput and Latency | **99** | I−1 — check scheduling policy and separate short/long TTFT, ITL, p95/p99, goodput, and starvation gates. |
| 33 | Reasoning and Test-Time Compute | **99** | I−1 — validate adaptive budget, verifier limits, stop/fallback rule, and refusal to equate budget coverage with accuracy. |
| 34 | Prompting and Context Engineering | **99** | I−1 — make the learner place/label concrete context blocks and validate authority, conflict, relevance, and uncertainty choices. |
| 35 | Embeddings, Semantic Search and RAG | **99** | I−1 — validate oracle-retrieval comparisons and the earliest failing Arabic pipeline stage. |
| 36 | Tool Use and Agent Loops | **99** | I−1 — check the minimal state/event schema, deterministic steps, optional model branch, retries, idempotency, and terminal state. |
| 37 | LLM Evaluation and LLM-as-a-Judge | **99** | I−1 — validate the regulated-slice release decision, uncertainty, calibration, and adjudication plan. |
| 38 | Security, Privacy and Prompt Injection | **99** | I−1 — validate threat boundaries and controls for injection, sensitive attributes, tenant leakage, and overblocking. |
| 39 | Production Observability, Cost and Governance | **99** | I−1 — check rollback/pause action, privacy-safe evidence, version localization, ownership, and regression-test conversion. |
| 40 | Distillation | **99** | I−1 — validate loss choices under API constraints plus teacher-error detection and held-out gates. |
| 41 | LoRA | **99** | I−1 — validate tenant isolation, merge/runtime trade-off, benchmark evidence, rollback, and base revision. |
| 42 | Mixture of Experts (MoE) | **99** | I−1 — validate router/capacity/batch/network diagnostic ordering and the evidence that separates them. |
| 43 | Multimodal Language Models | **99** | I−1 — validate the audio encoder/alignment/temporal-position/token-budget mapping and failure-specific tests. |
| 44 | Interpretability and Model Editing | **99** | I−1 — validate the bounded claim, locality/paraphrase failures, matched controls, and persistence/robustness next test. |

### Exact capstone scores

All seven capstones earn full credit in accuracy, clarity, interaction, depth, scaffolding, and source quality. Each remains at 14/15 for examples because the rendered “complete reference” is a prose specification, not the complete artifact promised by the preceding audit.

| Host lesson | Capstone | Exact score | Rubric deduction and required evidence |
|---|---|---:|---|
| Optimizers | Explain one complete learning step | **99** | E−1 — ship the filled numerical field note, calculations, finite-difference output, diagnosed failure, and machine-checkable companion—not only four descriptive sections. |
| GPT-2 → nanochat | Build and debug a tiny GPT | **99** | E−1 — ship runnable code/tests plus actual raw logs, curves, samples, checkpoint/resume record, and ablation results at the pinned revisions. |
| OLMo 3 case study | Audit and redesign an open pre-training flow | **99** | E−1 — ship a filled model-flow table and completed mini-replication proposal with actual or explicitly labeled simulated result rows. |
| Tülu 3 → DR Tulu | Design a dual-purpose post-training stack | **99** | E−1 — ship the full task records, training ledger, matched checkpoint evaluation table, cost/safety gates, and launch memo as inspectable artifacts. |
| Test-time compute | Design and benchmark an inference service | **99** | E−1 — ship benchmark configuration, request data, raw results, percentile/goodput calculations, quality gates, and the resulting accept/reject memo. |
| Observability and governance | Ship a source-grounded research agent safely | **99** | E−1 — ship an actual threat-model diagram/table, trace fixture, evaluation/attack results, gate table, rollback record, and incident drill evidence. |
| Interpretability and editing | Investigate and intervene on a false model claim | **99** | E−1 — ship a runnable notebook/report with raw prompt sets, intervention/sham outputs, effect-size table, locality/persistence results, and bounded conclusion. |

### Score distribution

| Score | Components |
|---:|---:|
| 100 | 2 |
| 99 | 48 |
| 98 | 1 |

- **Mean:** 99.0
- **Median:** 99
- **At 100:** 2/51
- **Below 100:** 49/51
- **Total remaining gap:** 50 rubric points — A: 6, I: 37, E: 7.

### Prioritized implementation list

1. **P0 — Repair and execute the six technical validations.** Fix GPT-2 padding in the embedding script first. Add generators plus checked-in immutable outputs for tokenization, embedding, and the loader audit; execute the FIM probe; fill and preserve the two Tülu ledgers. Include commands, environment hashes, raw results, and tests that compare regenerated cheap fixtures or validate artifact schemas/hashes. This recovers 6 points and removes the only incorrect executable example.
2. **P1 — Replace learner-declared mastery with component-specific validation in 37 lessons.** Keep prose drafts, but derive “passed” from structured checkable subanswers. Report the first failed criterion, allow correction, and persist verified completion. Do not say “Your draft covers…” merely because the learner checked boxes. This recovers 37 points and is the largest human-learning improvement.
3. **P2 — Turn seven capstone reference outlines into complete artifacts.** Add project-local files or data-backed views containing filled numbers/tables, raw evidence, reproducibility metadata, and runnable code where appropriate. Test the files and render/link them after an attempt. This recovers 7 points.

Fixes are required; the plan was implemented broadly and improved examples, progression, transfer design, and source use, but the three evidence gaps above prevent a legitimate all-100 result.

## Exact re-grade after second evidence pass — 2026-07-13

**Verification question:** “Did we implement the whole plan, effectively and accurately teach every component of the provided curriculum, and achieve a legitimate 100% on every lesson and capstone?”

**Answer:** No. The second pass legitimately closes the two Tülu accuracy gaps and four capstone example gaps. It does not close the four remaining technical-execution gaps, the 37 lesson mastery-validation gaps, or three capstone evidence gaps. The exact current score is **5,055/5,100 = 99.117647…%** (reported to one decimal only as **99.1%**; every component score below is an unrounded integer).

### Strict evidence rules used

- **I−1:** The new automatic checkpoint does not inspect the learner's transfer draft. Its diagnostic asks the learner to recognize the principle displayed immediately above; its transfer question makes the complete three-criterion option visibly distinguishable from incomplete distractors; and its final criteria remain learner-checked boxes. A pass therefore demonstrates recognition and self-attestation, not successful performance of the component-specific transfer task.
- **A−1 (lesson):** `tokenizer-contract-result.json` contains no executed ten-row token/offset payload; `embedding-hidden-state-result.json` explicitly reports the heavyweight output as unbundled and blocked; `pretraining-token-accounting-result.json` is an executed course fixture rather than a run through the pinned OLMo loader; and `fim-causal-ablation-result.json` labels the metric rows simulated rather than preserving an executed 50/50 model probe.
- **A−1 and E−1 (Tiny GPT capstone):** `tiny-gpt-reference-run.json` claims an executed run with precise results, but the referenced trainer, tests, config, dataset, checkpoints, and logs are absent. The values are not labeled simulated/reference outputs. The capstone is therefore both unsupported as an accuracy claim and incomplete as a runnable worked artifact.
- **E−1 (inference capstone):** Four raw request rows cannot support or reproduce the reported 300-request-per-arm aggregates; hardware/model/client remain placeholders and no runnable benchmark or calculation asset is bundled.
- **E−1 (interpretability capstone):** The artifact is transparently a filled reference fixture, but no runnable notebook/code, raw intervention outputs, or exact library revision is bundled.
- The artifact verifier hashes and validates the internal structure of 13 JSON files. It does not execute the tokenizer/model/OLMo/FIM generators, prove the Tiny GPT run, derive the inference aggregates, or run the interpretability intervention.

### Exact lesson scores

| # | Curriculum component | Exact score | Remaining deduction and exact completion condition |
|---:|---|---:|---|
| 1 | Introduction | **99** | I−1 — validate the weather/evidence/action boundary response rather than accepting principle recognition plus learner-checked criteria. |
| 2 | Tensors, Shapes & Matrix Multiplication | **99** | I−1 — objectively validate the GQA head mapping and final score shape, with feedback on the first wrong axis. |
| 3 | Probability, Softmax & Cross-Entropy | **99** | I−1 — collect numeric raw/masked losses and diagnose denominator, masking, or logarithm errors. |
| 4 | Neural Networks, Gradients & Backpropagation | **99** | I−1 — validate all three gradient shapes/products and identify the first incorrect chain-rule edge. |
| 5 | Optimizers | **99** | I−1 — check optimizer-state counts, feasibility, and the proposed controlled comparison independently. |
| 6 | Tokenization | **98** | A−1 — preserve the exact ten pinned tokenizer result rows with token IDs/offsets; I−1 — validate the four-case test design and decision rule from learner input. |
| 7 | The Embedding Layer | **99** | A−1 — execute the corrected hidden-state script and preserve actual token IDs, positions, layer cosines, environment, and raw output. |
| 8 | Positional Encoding | **99** | I−1 — validate that the learner supplies both a positional diagnostic and a task-level falsifier. |
| 9 | Attention | **99** | I−1 — check causal/bidirectional allowed-key sets and reject causal claims inferred only from weights. |
| 10 | Layers of Understanding | **99** | I−1 — validate post-norm operation order, residual widths, and checkpoint-incompatibility reasoning. |
| 11 | Learning to Predict | **99** | I−1 — let the learner construct a visible label mask/boundary and validate each contributing position. |
| 12 | GPT-2 → nanochat: Build the Stack | **99** | I−1 — validate the treatment/control, fixed-budget fields, and falsifier in the proposed code-domain ablation. |
| 13 | Pre-Training Overview | **99** | A−1 — run the counter in the pinned OLMo loader and preserve ordinary plus partial/padded raw batch logs and the reconciled distributed total. |
| 14 | Training Objectives and Architectural Details | **99** | I−1 — provide an editable role/token mask and validate both defensible policies token by token. |
| 15 | Scaling Laws and Optimization | **99** | I−1 — validate distinct research/edge objective, measurement, uncertainty, and decision fields. |
| 16 | Training Data Engineering | **100** | None. Its mastery studio independently assesses the transfer task, and its content/evidence meet all rubric dimensions. |
| 17 | Training Infrastructure and Systems | **99** | I−1 — validate topology placement, ownership/communication choices, and complete recovery state independently. |
| 18 | Advanced Pretraining Objectives | **99** | A−1 — execute the declared 50/50 StarCoder2-derived probe and preserve IDs, equal-token manifest, paired metrics, uncertainty, and regression result. |
| 19 | Evaluation During Pretraining | **99** | I−1 — validate metric classification, stop/continue action, and minimum diagnostic slices against the mixed trace. |
| 20 | Case Study — OLMo 3 Model Flow | **99** | I−1 — validate required artifacts and causal evidence in the transferred open-model audit. |
| 21 | Bridge: From Base Model to Assistant | **100** | None. The filled Tülu stage/runtime ledger now supplies pinned checkpoint IDs, observed stage evidence, and a clear runtime boundary. |
| 22 | Post-Training Overview | **100** | None. The completed matched Tülu ledger now supplies stage metrics, regressions, costs, and keep/remove decisions. |
| 23 | Supervised Fine-Tuning | **99** | I−1 — independently validate the medical-summary transfer's data boundary, evaluation suite, and stop/regression rules. |
| 24 | Preference Optimization | **99** | I−1 — validate rubric differences, normalization decisions, and bias diagnostics for both application contexts. |
| 25 | RL Fundamentals | **99** | I−1 — check the delayed-credit path and variance source in structured trajectory fields. |
| 26 | RLHF | **99** | I−1 — validate that factual safety is a non-compensable gate and that reward/preference design cannot trade it away. |
| 27 | Tools and Safety Tuning | **100** | None. The five-stage incident studio independently assesses the transfer task; the lesson meets every rubric dimension. |
| 28 | Case Study — Tülu 3 → DR Tulu | **99** | I−1 — validate exact versus open-ended reward assignment and the external authorization boundary for service restarts. |
| 29 | Decoding and Sampling | **99** | I−1 — validate both decoding contracts and require the medication extractor's blocking metric. |
| 30 | The Generation Loop and KV Cache | **99** | I−1 — check cache options, tenant isolation/invalidation, and uncached-reference correctness evidence. |
| 31 | Quantization and Memory | **99** | I−1 — validate that the rare medical regression blocks deployment and that the next measurement localizes quantization sensitivity. |
| 32 | Serving: Batching, Throughput and Latency | **99** | I−1 — check scheduling policy and separate short/long TTFT, ITL, p95/p99, goodput, and starvation gates. |
| 33 | Reasoning and Test-Time Compute | **99** | I−1 — validate adaptive budget, verifier limits, stop/fallback rule, and refusal to equate budget coverage with accuracy. |
| 34 | Prompting and Context Engineering | **99** | I−1 — require concrete context-block placement and validate authority, conflict, relevance, and uncertainty choices. |
| 35 | Embeddings, Semantic Search and RAG | **99** | I−1 — validate oracle-retrieval comparisons and the earliest failing Arabic pipeline stage. |
| 36 | Tool Use and Agent Loops | **99** | I−1 — check the minimal state/event schema, deterministic steps, optional model branch, retries, idempotency, and terminal state. |
| 37 | LLM Evaluation and LLM-as-a-Judge | **99** | I−1 — validate the regulated-slice release decision, uncertainty, calibration, and adjudication plan. |
| 38 | Security, Privacy and Prompt Injection | **99** | I−1 — validate threat boundaries and controls for injection, sensitive attributes, tenant leakage, and overblocking. |
| 39 | Production Observability, Cost and Governance | **99** | I−1 — check rollback/pause action, privacy-safe evidence, version localization, ownership, and regression-test conversion. |
| 40 | Distillation | **99** | I−1 — validate loss choices under API constraints plus teacher-error detection and held-out gates. |
| 41 | LoRA | **99** | I−1 — validate tenant isolation, merge/runtime trade-off, benchmark evidence, rollback, and base revision. |
| 42 | Mixture of Experts (MoE) | **99** | I−1 — validate router/capacity/batch/network diagnostic ordering and the evidence that separates them. |
| 43 | Multimodal Language Models | **99** | I−1 — validate the audio encoder/alignment/temporal-position/token-budget mapping and failure-specific tests. |
| 44 | Interpretability and Model Editing | **99** | I−1 — validate the bounded claim, locality/paraphrase failures, matched controls, and persistence/robustness next test. |

### Exact capstone scores

| Host lesson | Capstone | Exact score | Remaining deduction and exact completion condition |
|---|---|---:|---|
| Optimizers | Explain one complete learning step | **100** | None. The filled numerical field note, finite-difference check, failure diagnosis, and machine-checkable calculations are inspectable and internally consistent. |
| GPT-2 → nanochat | Build and debug a tiny GPT | **98** | A−1 and E−1 — bundle the referenced runnable implementation/tests/config/data plus raw logs, checkpoints, resume and ablation evidence; preserve execution provenance, or explicitly label any fixture values simulated. |
| OLMo 3 case study | Audit and redesign an open pre-training flow | **100** | None. The filled flow audit and explicitly labeled mini-replication rows satisfy the promised worked artifact. |
| Tülu 3 → DR Tulu | Design a dual-purpose post-training stack | **100** | None. The task records, training ledger, matched evaluation, attack results, gates, and launch memo form a complete inspectable reference fixture. |
| Test-time compute | Design and benchmark an inference service | **99** | E−1 — bundle the full request-level dataset, exact model/hardware/client configuration, reproducible percentile/goodput calculations, and runnable benchmark. |
| Observability and governance | Ship a source-grounded research agent safely | **100** | None. Threat boundaries, a trace fixture, evaluation/attack evidence, gates, rollback, and incident drill are all filled and inspectable. |
| Interpretability and editing | Investigate and intervene on a false model claim | **99** | E−1 — bundle a runnable notebook/code, raw prompt/intervention/sham outputs, exact library revision, and reproducible effect/locality/persistence calculations. |

### Exact score distribution

| Score | Components |
|---:|---:|
| 100 | 8 |
| 99 | 41 |
| 98 | 2 |

- **Total:** 5,055/5,100
- **Mean:** 99.117647… (99.1 to one decimal)
- **Median:** 99
- **At 100:** 8/51
- **Below 100:** 43/51
- **Total remaining gap:** 45 rubric points — A: 5, I: 37, E: 3.

### Prioritized remaining work

1. **P0 — Replace claimed or simulated technical results with preserved executions.** Bundle the exact tokenizer rows; run and preserve the corrected GPT-2 hidden-state outputs; run token accounting through the pinned OLMo loader; execute the declared FIM model probe. For Tiny GPT, bundle the referenced executable project and provenance-backed outputs rather than a standalone result claim.
2. **P1 — Make 37 transfer checkpoints assess the task itself.** Replace the “complete criteria” multiple-choice pattern and learner self-checks with component-specific structured answers. Compute pass/fail from those answers, identify the first failed criterion, provide corrective feedback, and persist only verified mastery.
3. **P2 — Complete the two remaining reproducibility capstones.** For inference, ship all request rows/configuration plus the aggregation script. For interpretability, ship runnable code/notebook and raw intervention outputs. Extend the artifact verifier to reproduce or derive these results, not only validate their JSON schemas.

`npm test` passes after this implementation pass: the production build, all 13 artifact schema/hash checks, and all 44 structural lesson tests are green. This is useful regression evidence, but it does not override the execution, provenance, and learner-performance gaps above. Further fixes are required for a legitimate 100 on every component.

## Exact third re-grade — 2026-07-13

**Implementation-loop question:** “Previously you came up with the following implementation plan. Carefully check if every aspect of your plan was implemented correctly, and that each implemented part improves our pipeline. If there is anything missing, incorrect, or not implemented fully, then detail how you will fix it. If no fixes are required, say so.”

**Answer:** The three capstone evidence fixes are complete and improve the pipeline. The revised lesson transfer UI improves specificity, diagnosis, retry, and solution locking, but its objective matcher still accepts ordinary, plausible misconceptions that reverse the relationship being assessed. The four technical-execution gaps are also unchanged. Fixes remain required.

### Evidence judgment

- `app/lesson-transfer-checks.ts` contains exactly 132 rules: three component-specific fields for each of 44 lessons. `LessonEvidenceView` locks the original response, reports the first failed field, permits correction/retry, removes criterion checkboxes, and withholds the worked solution until all three fields pass.
- However, every field is graded only by unordered, case-insensitive substring presence: every required group must contribute any one substring. The matcher does not validate which concept maps to which role, quantity, direction, or conclusion. Consequently, the following materially wrong answers pass: **“Momentum has two state tensors; Adam has one,” “the unmasked mean is 0.223 and the masked mean is 0.916,” “the lookup is contextual and the hidden state is context-free,”** and **“a causal query uses the past through ‘it’ and the future after it.”** These are direct reversals of the target concepts, not exotic prompt injection or meaningless keyword salad. The UI then reports “Structured transfer passed” and “Transfer checkpoint passed.” Under the unchanged rubric, none of the prior 37 I−1 deductions can legitimately close.
- The seven lessons with independent decision/mastery studios retain full interaction credit, as in the prior grades; those studios do not rely on this matcher for their assessed task.
- `node scripts/tiny-gpt-reference.mjs --verify` passes. The script now implements and trains a dependency-free causal one-block model, tests shifting/masking/shape/overfit/resume, runs an ablation, reproduces the preserved JSON exactly, and explicitly limits the claim to a correctness fixture rather than GPT-2 capability. Both prior Tiny GPT deductions close.
- `node scripts/inference-benchmark-fixture.mjs --verify` passes. All 20 request rows are bundled, aggregates are derived with the declared percentile/goodput contract, and the scope explicitly disclaims hardware/vLLM performance. The prior inference capstone E−1 closes as a complete, transparent teaching fixture.
- `node scripts/interpretability-intervention-fixture.mjs --verify` passes. The generator preserves 24 raw condition rows, sham comparisons, locality/persistence rows, calculations, falsifiers, and a bounded claim that explicitly disclaims measured GPT-2 activations. The prior interpretability capstone E−1 closes as a complete, transparent analysis fixture.
- The remaining lesson accuracy artifacts are unchanged in the relevant sense: tokenizer output rows are still absent; embedding numeric execution output is still absent; token accounting still uses a course fixture rather than the pinned OLMo loader; and FIM task metrics remain explicitly simulated rather than an executed paired model probe.

### Exact lesson scores

| # | Curriculum component | Exact score | Remaining deduction and exact completion condition |
|---:|---|---:|---|
| 1 | Introduction | **99** | I−1 — validate the direction of the model/evidence/runtime mapping, not merely the presence of those words. |
| 2 | Tensors, Shapes & Matrix Multiplication | **99** | I−1 — reject reversed GQA head mappings and validate the actual contraction/shape relationship. |
| 3 | Probability, Softmax & Cross-Entropy | **99** | I−1 — bind each numeric loss to raw/unmasked/masked meaning; the current matcher accepts swapped means. |
| 4 | Neural Networks, Gradients & Backpropagation | **99** | I−1 — parse or separately construct the matrix products instead of accepting operands, “transpose,” and a shape in any relation. |
| 5 | Optimizers | **99** | I−1 — bind one state to momentum and two to AdamW; the current matcher accepts the exact reversal. |
| 6 | Tokenization | **98** | A−1 — preserve the executed ten pinned tokenizer rows with IDs/offsets; I−1 — validate the four-case design and pairwise decision relationships, not unordered vocabulary. |
| 7 | The Embedding Layer | **99** | A−1 — execute and preserve actual hidden-state outputs, token IDs/positions, layer cosines, and environment. |
| 8 | Positional Encoding | **99** | I−1 — validate that capacity does not imply effective use; reversed claim language currently passes. |
| 9 | Attention | **99** | I−1 — validate exclusion of future keys; the current causal-key field accepts explicitly including them. |
| 10 | Layers of Understanding | **99** | I−1 — validate operation order and checkpoint conclusion rather than unordered formula terms. |
| 11 | Learning to Predict | **99** | I−1 — validate which roles are scored/masked and how the boundary is treated; reversed mappings can pass. |
| 12 | GPT-2 → nanochat: Build the Stack | **99** | I−1 — validate a coherent single treatment, controlled budget, and genuinely falsifying outcome rather than term presence. |
| 13 | Pre-Training Overview | **99** | A−1 — execute token accounting in the pinned OLMo loader and preserve ordinary plus partial/padded raw logs and distributed reconciliation. |
| 14 | Training Objectives and Architectural Details | **99** | I−1 — validate role-to-loss assignments token by token; unordered role/mask terms are insufficient. |
| 15 | Scaling Laws and Optimization | **99** | I−1 — validate separate research/edge decisions and the direction of uncertainty/extrapolation constraints. |
| 16 | Training Data Engineering | **100** | None. Its independent mastery studio and supporting evidence meet the unchanged rubric. |
| 17 | Training Infrastructure and Systems | **99** | I−1 — validate topology ownership/communication mappings and recovery state, not a bag of infrastructure terms. |
| 18 | Advanced Pretraining Objectives | **99** | A−1 — execute the declared paired FIM probe and preserve real paired metrics/uncertainty; current task metrics are simulated. |
| 19 | Evaluation During Pretraining | **99** | I−1 — validate each signal's class and the action caused by the observed regression/confound. |
| 20 | Case Study — OLMo 3 Model Flow | **99** | I−1 — validate a coherent artifact-to-causal-claim audit rather than unordered control/treatment terms. |
| 21 | Bridge: From Base Model to Assistant | **100** | None. The independent stage studio and filled Tülu ledger meet the unchanged rubric. |
| 22 | Post-Training Overview | **100** | None. The independent post-training studio and matched Tülu ledger meet the unchanged rubric. |
| 23 | Supervised Fine-Tuning | **99** | I−1 — validate permissible data, target/severe-slice evidence, and stop rules as related decisions. |
| 24 | Preference Optimization | **99** | I−1 — validate context-specific rubric mappings and bias controls, not only their vocabulary. |
| 25 | RL Fundamentals | **99** | I−1 — validate the ordered trajectory and the direction of advantage; reversed relations can pass. |
| 26 | RLHF | **99** | I−1 — validate preference-to-reward-to-policy direction and a truly non-compensable safety gate. |
| 27 | Tools and Safety Tuning | **100** | None. Its independent incident studio and evidence meet the unchanged rubric. |
| 28 | Case Study — Tülu 3 → DR Tulu | **99** | I−1 — validate exact-versus-rubric allocation and the runtime authorization relationship. |
| 29 | Decoding and Sampling | **99** | I−1 — validate which decoding contract belongs to which task and that dosage error is blocking. |
| 30 | The Generation Loop and KV Cache | **99** | I−1 — validate shared/private cache mapping, invalidation, and equivalence to the uncached oracle. |
| 31 | Quantization and Memory | **99** | I−1 — validate that the medical regression blocks deployment and connect localization evidence to mitigation. |
| 32 | Serving: Batching, Throughput and Latency | **99** | I−1 — validate scheduler choice and bind metrics/gates to short versus long request classes. |
| 33 | Reasoning and Test-Time Compute | **99** | I−1 — validate the ordered attempt/escalation/stop policy and hard fallback rather than its terms. |
| 34 | Prompting and Context Engineering | **99** | I−1 — validate authority ordering, explicit conflict representation, and uncertainty action. |
| 35 | Embeddings, Semantic Search and RAG | **99** | I−1 — validate what each oracle replacement isolates and which earliest stage should be fixed. |
| 36 | Tool Use and Agent Loops | **99** | I−1 — validate workflow order, bounded optional branch, and terminal/idempotent safety relations. |
| 37 | LLM Evaluation and LLM-as-a-Judge | **99** | I−1 — validate the release decision and bind uncertainty/raw evidence/judge checks to that decision. |
| 38 | Security, Privacy and Prompt Injection | **99** | I−1 — validate assets-to-boundaries-to-controls mappings rather than unordered security terms. |
| 39 | Production Observability, Cost and Governance | **99** | I−1 — validate rollback action, privacy-safe localization, ownership, and durable control as a causal sequence. |
| 40 | Distillation | **99** | I−1 — validate that response-only access excludes logits and correctly maps defenses/gates; reversed statements pass today. |
| 41 | LoRA | **99** | I−1 — validate base-revision/adapter/tenant mappings and benchmark-to-rollback reasoning. |
| 42 | Mixture of Experts (MoE) | **99** | I−1 — validate diagnostic ordering and distinguish router, kernel, and network evidence. |
| 43 | Multimodal Language Models | **99** | I−1 — validate the ordered audio-to-encoder-to-LM mapping and what each failure test isolates. |
| 44 | Interpretability and Model Editing | **99** | I−1 — validate bounded claim polarity and control-to-causality/persistence relationships; negated/reversed claims can pass. |

### Exact capstone scores

| Host lesson | Capstone | Exact score | Remaining deduction |
|---|---|---:|---|
| Optimizers | Explain one complete learning step | **100** | None. |
| GPT-2 → nanochat | Build and debug a tiny GPT | **100** | None. The executable generator, tests, preserved run, resume equivalence, and ablation now support the bounded accuracy claim and complete example. |
| OLMo 3 case study | Audit and redesign an open pre-training flow | **100** | None. |
| Tülu 3 → DR Tulu | Design a dual-purpose post-training stack | **100** | None. |
| Test-time compute | Design and benchmark an inference service | **100** | None. The executable deterministic fixture derives every reported aggregate and clearly disclaims hardware-performance claims. |
| Observability and governance | Ship a source-grounded research agent safely | **100** | None. |
| Interpretability and editing | Investigate and intervene on a false model claim | **100** | None. The executable analysis fixture preserves raw rows and calculations while clearly delimiting simulated from measured-model evidence. |

### Exact score distribution

| Score | Components |
|---:|---:|
| 100 | 11 |
| 99 | 39 |
| 98 | 1 |

- **Total:** 5,059/5,100
- **Mean:** 99.196078… (99.2 to one decimal)
- **Median:** 99
- **At 100:** 11/51
- **Below 100:** 40/51
- **Total remaining gap:** 41 rubric points — A: 4, I: 37.

### Every remaining condition preventing exact 100

1. **Tokenization accuracy:** run the two pinned tokenizers and preserve the exact ten result rows, including strings, IDs, offsets, decode/round-trip outcomes, counts, environment, and command.
2. **Embedding accuracy:** execute the corrected pinned GPT-2 hidden-state probe and preserve actual token IDs/positions, per-layer cosines, raw output, environment, and command.
3. **Pre-training accounting accuracy:** execute the counter through the pinned OLMo loader, including ordinary and partial/padded batches, and preserve raw per-rank plus reconciled totals.
4. **FIM accuracy:** execute the declared paired causal/FIM model probe at the pinned recipe and preserve real serialized IDs, equal-token manifest, paired metrics, uncertainty, and regression decision.
5. **Transfer interaction in 37 lessons:** replace unordered substring-group matching with relation-aware validation. For finite calculations/shapes/mappings, use typed fields or a structured graph/table with exact parsing. For design tasks, require separately labeled choices and justifications, reject contradictory assignments, and test known misconception cases. Keep first-failure feedback, retry, locked solutions, and verified persistence.

`npm test` passes in this third audit, including the production build, 13 artifact checks, all three executable capstone verifiers, and all 44 structural tests. The tests currently assert that 132 rules and a substring matcher exist; they do not include negative assessment cases, so this green result does not establish valid mastery grading.

## Exact fourth re-grade — 2026-07-13

**Implementation-loop question:** “Previously you came up with the following implementation plan. Carefully check if every aspect of your plan was implemented correctly, and that each implemented part improves our pipeline. If there is anything missing, incorrect, or not implemented fully, then detail how you will fix it. If no fixes are required, say so.”

**Answer:** Fixes remain required. Ordered matching is a real improvement over unordered term presence and the four named reversal tests pass. It still does not validate semantic polarity or relations, and it incorrectly treats unordered evidence lists as ordered sentences. The unchanged rubric therefore does not permit any of the prior 37 I−1 deductions to close. The four honest A−1 deductions also remain.

### Matcher audit

- The explicit regressions correctly reject the exact strings **“momentum two states; Adam one state,” “unmasked 0.223; masked 0.916,” “lookup contextual; hidden state context-free,”** and **“through it and include future.”** The added safety-gate regression also rejects its named false answer.
- `matchesOrderedGroups` still performs only normalized substring search with a moving cursor. It has no representation of subject, predicate, object, polarity, quantity binding, alternatives, or unordered sets.
- Direct materially false claims still pass, including **“Momentum does not have one state; Adam does not have two,” “Only through it? No: do not exclude future keys,” “Assistant, user, and system tokens are all masked and ignored,” “Residual width is not the same; branches may have 2d,”** and **“Helpfulness reward cannot compensate for factual safety failure, but this is not a blocking gate.”** These are ordinary misconceptions about the assessed relationship, not hidden prompt injection or random keyword salad.
- Correct answers also fail where declared sequence is arbitrary or conflicts with the mathematical/correction wording. Confirmed failures include the exact input-gradient expression **`(dL/dY)W^T, yielding [2,2]`**, a correct reordered tokenizer evidence list, the published test-time-compute escalation correction, the published bounded-agent-branch correction, and the published multimodal failure-isolation correction.
- Because the UI converts these shallow matches into **“Structured transfer passed”** and **“Transfer checkpoint passed,”** the false positives are false mastery claims. Because feedback supplies correction text that can itself fail, the false negatives also undermine correction/retry.
- The four accuracy dossiers have the same preserved hashes and evidence boundaries as the third audit: no executed ten-row tokenizer output, no executed GPT-2 hidden-state numeric output, no run through the pinned OLMo loader, and simulated rather than executed FIM model metrics.

### Exact lesson scores

| # | Curriculum component | Exact score | Remaining deduction |
|---:|---|---:|---|
| 1 | Introduction | **99** | I−1 — subject→role polarity is not validated; negated model/evidence/runtime mappings pass. |
| 2 | Tensors, Shapes & Matrix Multiplication | **99** | I−1 — order does not validate contraction polarity or axis semantics; false feature/token claims can pass. |
| 3 | Probability, Softmax & Cross-Entropy | **99** | I−1 — the named swap fails, but negated quantity bindings and arbitrary wording still yield false pass/fail results. |
| 4 | Neural Networks, Gradients & Backpropagation | **99** | I−1 — the exact correct input-gradient formula fails because the rule declares the factors in the opposite textual sequence. |
| 5 | Optimizers | **99** | I−1 — the named swap fails, but explicit negation of both correct state-count relations passes. |
| 6 | Tokenization | **98** | A−1 — executed ten-row pinned tokenizer output remains absent; I−1 — correct evidence/case lists fail when supplied in a different valid order. |
| 7 | The Embedding Layer | **99** | A−1 — executed hidden-state IDs/positions/cosines/raw output remain absent. Its independent studio retains full I credit. |
| 8 | Positional Encoding | **99** | I−1 — positive/negative claim polarity is not parsed and valid diagnostic lists are forced into an arbitrary order. |
| 9 | Attention | **99** | I−1 — “do not exclude future” passes the strengthened “exclude future” phrase rule and triggers false mastery. |
| 10 | Layers of Understanding | **99** | I−1 — single-character substring matching and unparsed negation allow a false residual-width claim to pass. |
| 11 | Learning to Predict | **99** | I−1 — “assistant, user, and system are all masked” passes because role-to-loss assignments are not represented. |
| 12 | GPT-2 → nanochat: Build the Stack | **99** | I−1 — valid control fields can fail under arbitrary sequence, while coherent treatment/falsifier relationships are not parsed. |
| 13 | Pre-Training Overview | **99** | A−1 — the token counter still has not run through the pinned OLMo loader with preserved raw per-rank reconciliation. Its independent planner retains full I credit. |
| 14 | Training Objectives and Architectural Details | **99** | I−1 — role visibility and role-to-loss/mask assignments remain ordered word lists rather than validated mappings. |
| 15 | Scaling Laws and Optimization | **99** | I−1 — valid edge constraints in a different order fail, while decision/uncertainty polarity remains unchecked. |
| 16 | Training Data Engineering | **100** | None. Its independent mastery studio and evidence meet the unchanged rubric. |
| 17 | Training Infrastructure and Systems | **99** | I−1 — placement requires names in sequence but never validates the actual partition-to-topology mapping. |
| 18 | Advanced Pretraining Objectives | **99** | A−1 — paired FIM task metrics remain explicitly simulated rather than an executed model probe. Its independent studio retains full I credit. |
| 19 | Evaluation During Pretraining | **99** | I−1 — metric families/slices are unordered sets and causal action boundaries are not semantically validated. |
| 20 | Case Study — OLMo 3 Model Flow | **99** | I−1 — artifact requirements are arbitrarily ordered and control/treatment attribution is not represented as a relation. |
| 21 | Bridge: From Base Model to Assistant | **100** | None. Its independent stage studio and filled Tülu evidence meet the rubric. |
| 22 | Post-Training Overview | **100** | None. Its independent post-training studio and matched Tülu ledger meet the rubric. |
| 23 | Supervised Fine-Tuning | **99** | I−1 — permissible-data and evaluation requirements are unordered sets; correct reordered answers can fail. |
| 24 | Preference Optimization | **99** | I−1 — rubric/context and normalization/bias mappings remain term sequences rather than checked relationships. |
| 25 | RL Fundamentals | **99** | I−1 — ordering improves trajectory checking, but polarity can still be negated while the required sequence remains present. |
| 26 | RLHF | **99** | I−1 — the safety phrase was hardened, but a final “not a blocking gate” still passes after all required phrases. |
| 27 | Tools and Safety Tuning | **100** | None. Its independent incident studio and evidence meet the rubric. |
| 28 | Case Study — Tülu 3 → DR Tulu | **99** | I−1 — exact-versus-rubric and runtime authorization phrases can be negated without invalidating the ordered match. |
| 29 | Decoding and Sampling | **99** | I−1 — decoding-to-task and error-to-release relationships are not polarity-aware. |
| 30 | The Generation Loop and KV Cache | **99** | I−1 — shared/private and cached/uncached mappings can be contradicted while retaining accepted sequence. |
| 31 | Quantization and Memory | **99** | I−1 — the hardened medical gate still accepts a later negation of the blocking decision; localization lists remain order-sensitive. |
| 32 | Serving: Batching, Throughput and Latency | **99** | I−1 — TTFT/ITL/percentile/request-class requirements are an unordered metric set but the matcher mandates one textual order. |
| 33 | Reasoning and Test-Time Compute | **99** | I−1 — the published correct escalation correction fails because “measured” precedes “signals” rather than following “value.” |
| 34 | Prompting and Context Engineering | **99** | I−1 — authority, conflict, and abstention relationships can be explicitly negated and still pass. |
| 35 | Embeddings, Semantic Search and RAG | **99** | I−1 — oracle-stage isolation and earliest-failure conclusions are not semantically bound; negated conclusions pass. |
| 36 | Tool Use and Agent Loops | **99** | I−1 — the published correct bounded-retrieval correction fails its own declared order. |
| 37 | LLM Evaluation and LLM-as-a-Judge | **99** | I−1 — release, uncertainty, and adjudication decisions can be negated after the accepted terms without detection. |
| 38 | Security, Privacy and Prompt Injection | **99** | I−1 — assets/boundaries/controls are unordered sets and their actual mappings are not checked. |
| 39 | Production Observability, Cost and Governance | **99** | I−1 — valid privacy-safe trace wording can fail when “privacy” precedes “trace”; decision polarity remains unchecked. |
| 40 | Distillation | **99** | I−1 — the published teacher-error correction uses a different valid order and fails; signal availability can also be contradicted. |
| 41 | LoRA | **99** | I−1 — valid provenance/benchmark/rollback lists can fail in natural orders and compatibility relations remain shallow. |
| 42 | Mixture of Experts (MoE) | **99** | I−1 — the hardened FLOPs boundary does not repair the compute/network field, whose published correction places “batch” before “kernel” and fails. |
| 43 | Multimodal Language Models | **99** | I−1 — the published “transcription separately from question answering” correction fails because “separately” appears before “question.” |
| 44 | Interpretability and Model Editing | **99** | I−1 — bounded-claim polarity and control conclusions can be negated, and the control list is arbitrarily ordered. |

### Exact capstone scores

| Host lesson | Capstone | Exact score | Remaining deduction |
|---|---|---:|---|
| Optimizers | Explain one complete learning step | **100** | None. |
| GPT-2 → nanochat | Build and debug a tiny GPT | **100** | None. |
| OLMo 3 case study | Audit and redesign an open pre-training flow | **100** | None. |
| Tülu 3 → DR Tulu | Design a dual-purpose post-training stack | **100** | None. |
| Test-time compute | Design and benchmark an inference service | **100** | None. |
| Observability and governance | Ship a source-grounded research agent safely | **100** | None. |
| Interpretability and editing | Investigate and intervene on a false model claim | **100** | None. |

### Exact score distribution

| Score | Components |
|---:|---:|
| 100 | 11 |
| 99 | 39 |
| 98 | 1 |

- **Total:** 5,059/5,100
- **Mean:** 99.196078… (displayed to one decimal only as 99.2; component scores are unrounded)
- **Median:** 99
- **At 100:** 11/51
- **Below 100:** 40/51
- **Total remaining gap:** 41 rubric points — A: 4, I: 37.

### Exact remaining fixes

1. Replace generic ordered-substring rules with typed assessment schemas: ordered sequences only for genuinely sequential processes; order-insensitive sets for required evidence lists; explicit subject/predicate/object fields for mappings; numeric/formula parsers for calculations; and enumerated decisions plus separate justification fields for claim boundaries.
2. Add positive, alternate-correct, misconception, negation, contradiction, and correction-text regressions for every rule. A rule must accept its own correction and common correct paraphrases, while rejecting reversed and later-contradicted conclusions. Do not derive mastery from free-form substring search.
3. Preserve the four execution fixes from the prior audit: actual pinned tokenizer rows, executed GPT-2 hidden-state outputs, token accounting through the pinned OLMo loader, and an executed paired FIM model probe.

`npm test` passes in this fourth audit, including the new named reversal regressions. Those regressions are too narrow to detect the confirmed false-positive and false-negative classes above, so the green suite does not justify interaction credit.

## Exact fifth re-grade — 2026-07-13

**Implementation-loop question:** “Previously you came up with the following implementation plan. Carefully check if every aspect of your plan was implemented correctly, and that each implemented part improves our pipeline. If there is anything missing, incorrect, or not implemented fully, then detail how you will fix it. If no fixes are required, say so.”

**Answer:** The parser-removal plan is implemented correctly and eliminates the prior substring false-positive/false-negative class. It does not complete the learning-assessment plan: the replacement objectively grades recognition of three displayed solution claims, not the learner's constructed solution to the unfamiliar case. Fixes remain required, so the same 37 I−1 deductions and four A−1 deductions remain.

### Current interaction evidence

- `app/ordered-transfer-match.mjs` is deleted, `LessonEvidenceView` has no free-text parser, and the 132 correction claims are unique.
- The answer bank is rotated, each claim can be selected only once, and mastery is computed with exact typed identity: `structuredChoices[index] === index`. This is deterministic and cannot be defeated by negation, contradiction, formula order, paraphrase, or reordered sets.
- Reflective guide comparisons are now explicitly labeled **“Self-check only”** and no longer claim independently verified mastery. This is an honest improvement.
- The assessed-transfer draft still needs only 24 characters and is never read after being locked. A learner can enter arbitrary filler and receive all three exact correct claims in the answer bank.
- Each prompt has no same-job misconception distractors: all three options are correct claims, one for each visibly labeled prompt. Once two are mapped, the one-use constraint forces the third. On a wrong attempt, the first-field feedback prints the exact correction claim that remains selectable.
- This is a valid task-specific matching/recognition exercise, but it does not demonstrate the advertised calculation, construction, decision, design, or causal explanation. For example, the probability learner selects already-computed losses rather than computing them; the gradient learner selects displayed formulas rather than constructing them; and design lessons select a complete prewritten plan rather than making and defending design choices.
- The browser-facing copy still says **“Solve an unfamiliar case,” “Your decision, calculation, or design,” “OBJECTIVELY CHECKED CONSTRUCTION,”** and finally **“Transfer checkpoint passed.”** Those claims overstate what exact claim mapping verifies. Under the unchanged interaction rubric, recognition cannot substitute for assessed transfer performance.
- The four technical accuracy artifacts are unchanged: the exact pinned tokenizer rows, executed GPT-2 hidden-state outputs, pinned OLMo-loader accounting run, and executed paired FIM model probe remain absent.

### Exact lesson scores

| # | Curriculum component | Exact score | Remaining deduction |
|---:|---|---:|---|
| 1 | Introduction | **99** | I−1 — maps three displayed boundary claims but does not assess the learner's weather/evidence/action construction. |
| 2 | Tensors, Shapes & Matrix Multiplication | **99** | I−1 — selects displayed head/contraction/shape claims rather than constructing and checking the mapping. |
| 3 | Probability, Softmax & Cross-Entropy | **99** | I−1 — selects already-computed losses and means; no learner calculation is assessed. |
| 4 | Neural Networks, Gradients & Backpropagation | **99** | I−1 — selects displayed gradient formulas/shapes rather than deriving them. |
| 5 | Optimizers | **99** | I−1 — maps prewritten state/feasibility/evidence claims rather than assessing the learner's recommendation. |
| 6 | Tokenization | **98** | A−1 — executed ten-row pinned tokenizer output remains absent; I−1 — selects a prewritten test design and decision rule rather than designing them. |
| 7 | The Embedding Layer | **99** | A−1 — executed hidden-state IDs/positions/cosines/raw output remain absent. Its independent studio retains full I credit. |
| 8 | Positional Encoding | **99** | I−1 — maps prewritten diagnostics and claim boundary rather than proposing and defending falsifiers. |
| 9 | Attention | **99** | I−1 — selects displayed causal/bidirectional key claims rather than constructing the allowed-key sets. |
| 10 | Layers of Understanding | **99** | I−1 — selects the supplied post-norm equation, width, and conversion claim rather than tracing the block. |
| 11 | Learning to Predict | **99** | I−1 — selects supplied masking/boundary/verification claims rather than constructing a label mask. |
| 12 | GPT-2 → nanochat: Build the Stack | **99** | I−1 — selects a supplied ablation contract rather than defining the treatment, controls, and falsifier. |
| 13 | Pre-Training Overview | **99** | A−1 — no preserved run through the pinned OLMo loader with per-rank reconciliation. Its independent planner retains full I credit. |
| 14 | Training Objectives and Architectural Details | **99** | I−1 — maps supplied role/mask/trade-off claims rather than constructing either token-level policy. |
| 15 | Scaling Laws and Optimization | **99** | I−1 — selects supplied research/edge/uncertainty claims rather than allocating and defending the budget. |
| 16 | Training Data Engineering | **100** | None. Its independent mastery studio and evidence meet the rubric. |
| 17 | Training Infrastructure and Systems | **99** | I−1 — maps supplied placement/communication/recovery claims rather than proposing a topology and recovery test. |
| 18 | Advanced Pretraining Objectives | **99** | A−1 — paired FIM task metrics remain simulated rather than executed. Its independent studio retains full I credit. |
| 19 | Evaluation During Pretraining | **99** | I−1 — maps supplied metric/action claims rather than diagnosing the mixed trace and choosing an action. |
| 20 | Case Study — OLMo 3 Model Flow | **99** | I−1 — selects a supplied audit contract rather than evaluating transferred evidence. |
| 21 | Bridge: From Base Model to Assistant | **100** | None. Its independent stage studio and filled Tülu evidence meet the rubric. |
| 22 | Post-Training Overview | **100** | None. Its independent post-training studio and matched Tülu ledger meet the rubric. |
| 23 | Supervised Fine-Tuning | **99** | I−1 — maps supplied data/evaluation/stop claims rather than designing the medical-summary transfer. |
| 24 | Preference Optimization | **99** | I−1 — selects supplied rubric/normalization/diagnostic claims rather than designing both preference policies. |
| 25 | RL Fundamentals | **99** | I−1 — maps supplied trajectory/advantage/variance statements rather than tracing credit through the new case. |
| 26 | RLHF | **99** | I−1 — selects supplied pipeline/KL/gate claims rather than constructing the release design. |
| 27 | Tools and Safety Tuning | **100** | None. Its independent incident studio and evidence meet the rubric. |
| 28 | Case Study — Tülu 3 → DR Tulu | **99** | I−1 — maps supplied stage/reward/runtime claims rather than allocating the proposed system. |
| 29 | Decoding and Sampling | **99** | I−1 — selects supplied poetry/extractor/release claims rather than defining both decoding contracts. |
| 30 | The Generation Loop and KV Cache | **99** | I−1 — maps supplied cache/isolation/oracle claims rather than designing and validating the cache policy. |
| 31 | Quantization and Memory | **99** | I−1 — selects supplied deployment/localization/mitigation claims rather than making the release decision. |
| 32 | Serving: Batching, Throughput and Latency | **99** | I−1 — maps supplied scheduler/metric/gate claims rather than designing the scheduling and measurement plan. |
| 33 | Reasoning and Test-Time Compute | **99** | I−1 — selects supplied initial/escalation/stop claims rather than constructing an adaptive budget policy. |
| 34 | Prompting and Context Engineering | **99** | I−1 — maps supplied authority/conflict/uncertainty claims rather than arranging and labeling concrete context blocks. |
| 35 | Embeddings, Semantic Search and RAG | **99** | I−1 — selects supplied retrieval/oracle/failure claims rather than diagnosing the earliest Arabic pipeline failure. |
| 36 | Tool Use and Agent Loops | **99** | I−1 — maps supplied workflow/branch/safety claims rather than constructing the state machine. |
| 37 | LLM Evaluation and LLM-as-a-Judge | **99** | I−1 — selects supplied release/evidence/judge claims rather than deciding and defending the regulated release. |
| 38 | Security, Privacy and Prompt Injection | **99** | I−1 — maps supplied boundary/control/appeal claims rather than threat-modeling the unfamiliar case. |
| 39 | Production Observability, Cost and Governance | **99** | I−1 — selects supplied action/evidence/ownership claims rather than constructing the incident response. |
| 40 | Distillation | **99** | I−1 — maps supplied signal/defense/gate claims rather than designing the response-only distillation plan. |
| 41 | LoRA | **99** | I−1 — selects supplied compatibility/trade-off/rollback claims rather than making the multi-tenant serving design. |
| 42 | Mixture of Experts (MoE) | **99** | I−1 — maps supplied router/compute/network claims rather than diagnosing the bottleneck in order. |
| 43 | Multimodal Language Models | **99** | I−1 — selects supplied representation/interface/evaluation claims rather than designing the audio-to-LM system. |
| 44 | Interpretability and Model Editing | **99** | I−1 — maps supplied claim/failure/control statements rather than constructing the bounded intervention conclusion. |

### Exact capstone scores

| Host lesson | Capstone | Exact score | Remaining deduction |
|---|---|---:|---|
| Optimizers | Explain one complete learning step | **100** | None. |
| GPT-2 → nanochat | Build and debug a tiny GPT | **100** | None. |
| OLMo 3 case study | Audit and redesign an open pre-training flow | **100** | None. |
| Tülu 3 → DR Tulu | Design a dual-purpose post-training stack | **100** | None. |
| Test-time compute | Design and benchmark an inference service | **100** | None. |
| Observability and governance | Ship a source-grounded research agent safely | **100** | None. |
| Interpretability and editing | Investigate and intervene on a false model claim | **100** | None. |

### Exact score distribution

| Score | Components |
|---:|---:|
| 100 | 11 |
| 99 | 39 |
| 98 | 1 |

- **Total:** **5,059/5,100**
- **Mean:** **5,059/51 = 99.1960784313725490196078431372549…**
- **Median:** **99**
- **At 100:** **11/51**
- **Below 100:** **40/51**
- **Exact remaining gap:** **41 points — A: 4, I: 37.**

### Exact remaining fixes

1. Keep the exact mapping quiz as low-stakes scaffolding, but do not use it to certify transfer mastery.
2. Assess a structured construction derived from each unfamiliar case: numeric inputs for calculations; selectable entities plus explicit relations for shapes/masks/graphs; ordered state or pipeline builders for processes; and separate decision, evidence, boundary, and falsifier fields for designs. Grade those typed values deterministically and show misconception-specific feedback.
3. Alternatively, relabel the interaction honestly as a claim-matching knowledge check and remove “objectively checked construction” and “transfer passed”; verified completion would then need a separate assessment.
4. Complete the four pinned executions: tokenizer rows, GPT-2 hidden-state outputs, OLMo-loader accounting, and paired FIM model results.

`npm test` passes in this fifth audit: production build, 13 artifact checks, three executable capstone verifiers, and all 44 structural tests. The tests prove the claim-mapping implementation exists and is deterministic; they do not prove that matching displayed solutions assesses the locked constructed response.

## Exact sixth re-grade — 2026-07-13

**Implementation-loop question:** “Previously you came up with the following implementation plan. Carefully check if every aspect of your plan was implemented correctly, and that each implemented part improves our pipeline. If there is anything missing, incorrect, or not implemented fully, then detail how you will fix it. If no fixes are required, say so.”

**Answer:** The three fields are now independent, the forced-answer defect is removed, and the UI more accurately calls them decisions. The asserted component-specific misconception bank is not implemented: two global template distractors are reused for all 132 fields, and both advertise their own invalidity. Consequently, the correct detailed claim is identifiable without solving the quantitative, causal, or design problem. The unchanged rubric therefore retains the 37 I−1 deductions and four A−1 deductions.

### Current assessment evidence

- Each field independently stores `"correct"`, `"unchanged"`, or `"unbound"`; all three must equal `"correct"`. Option order varies per lesson/field and no field forces another. First-failed-field correction, retry, and solution locking work.
- There are 132 distinct correct claims but only **two misconception templates** in `LessonEvidenceView`, instantiated mechanically for every field.
- The `unchanged` option always says to apply Case A unchanged even though the changed assumption is irrelevant. The boundary comparison and diagnostic immediately above have already taught that this is the invalid move.
- The `unbound` option literally says that repeating prompt terms is sufficient **even when quantities, roles, formula order, or decision polarity are reversed**. It does not instantiate a plausible reversed calculation or misconception; it tells the learner to accept obviously invalid reasoning.
- Therefore the correct option is the only domain-specific substantive answer in every radio group. Selecting it demonstrates recognition of a detailed answer versus two self-disqualifying meta-statements, not mastery of the field's calculation, mapping, diagnosis, or design decision.
- The free construction remains a locked reflection artifact and is now described more honestly, but any 24-character filler still unlocks the scored radios. The final status still says **“Transfer passed”** and the feedback still says **“all three task-specific construction rules passed,”** although only recognition decisions were checked.
- A scenario-specific recognition assessment could legitimately earn the I point if each field supplied plausible, component-specific alternatives that instantiate the actual misconception: swapped numeric results, wrong tensor axes/formulas, incorrect role assignments, incomplete evidence packages, or a defensible-looking but wrong decision boundary. The current global templates do not do that.
- The four accuracy dossiers retain their prior hashes and boundaries; no new pinned execution appeared.

### Exact lesson scores

| # | Curriculum component | Exact score | Remaining deduction |
|---:|---|---:|---|
| 1 | Introduction | **99** | I−1 — the correct boundary claim is contrasted only with two self-disqualifying generic templates. |
| 2 | Tensors, Shapes & Matrix Multiplication | **99** | I−1 — no distractor instantiates a wrong GQA mapping, contraction axis, or score shape. |
| 3 | Probability, Softmax & Cross-Entropy | **99** | I−1 — no distractor supplies plausible swapped/miscalculated raw or masked losses. |
| 4 | Neural Networks, Gradients & Backpropagation | **99** | I−1 — no distractor instantiates a wrong product order, transpose, or gradient shape. |
| 5 | Optimizers | **99** | I−1 — no distractor supplies a plausible state-count, memory, or matched-run misconception. |
| 6 | Tokenization | **98** | A−1 — executed ten-row pinned tokenizer output remains absent; I−1 — no plausible incomplete coverage/evidence/deployment alternative is assessed. |
| 7 | The Embedding Layer | **99** | A−1 — executed hidden-state IDs/positions/cosines/raw output remain absent. Its independent studio retains full I credit. |
| 8 | Positional Encoding | **99** | I−1 — no plausible capacity-versus-effective-use or diagnostic-design alternative is instantiated. |
| 9 | Attention | **99** | I−1 — no concrete future-key set, bidirectional set, or causal-overclaim distractor is offered. |
| 10 | Layers of Understanding | **99** | I−1 — no plausible pre/post-norm equation, residual-width, or conversion error is instantiated. |
| 11 | Learning to Predict | **99** | I−1 — no concrete wrong role mask, boundary label, or verification output is assessed. |
| 12 | GPT-2 → nanochat: Build the Stack | **99** | I−1 — no confounded ablation, unequal budget, or non-falsifying result alternative is supplied. |
| 13 | Pre-Training Overview | **99** | A−1 — no preserved run through the pinned OLMo loader with raw per-rank reconciliation. Its independent planner retains full I credit. |
| 14 | Training Objectives and Architectural Details | **99** | I−1 — no concrete incorrect token/role mask or trade-off claim is supplied. |
| 15 | Scaling Laws and Optimization | **99** | I−1 — no plausible research/edge objective or extrapolation misconception is instantiated. |
| 16 | Training Data Engineering | **100** | None. Its independent mastery studio and evidence meet the rubric. |
| 17 | Training Infrastructure and Systems | **99** | I−1 — no wrong topology placement, communication path, or incomplete checkpoint alternative is instantiated. |
| 18 | Advanced Pretraining Objectives | **99** | A−1 — paired FIM task metrics remain simulated rather than executed. Its independent studio retains full I credit. |
| 19 | Evaluation During Pretraining | **99** | I−1 — no plausible single-metric, confounded-slice, or continue-training error is instantiated. |
| 20 | Case Study — OLMo 3 Model Flow | **99** | I−1 — no plausible incomplete provenance, unmatched comparison, or scope-creep decision is offered. |
| 21 | Bridge: From Base Model to Assistant | **100** | None. Its independent stage studio and filled Tülu evidence meet the rubric. |
| 22 | Post-Training Overview | **100** | None. Its independent post-training studio and matched Tülu ledger meet the rubric. |
| 23 | Supervised Fine-Tuning | **99** | I−1 — no plausible private-data, insufficient-evaluation, or weak-stop-rule alternative is instantiated. |
| 24 | Preference Optimization | **99** | I−1 — no concrete shared-rubric, length/order-bias, or invalid-signal alternative is supplied. |
| 25 | RL Fundamentals | **99** | I−1 — no plausible wrong trajectory order, advantage sign, or variance remedy is instantiated. |
| 26 | RLHF | **99** | I−1 — no concrete reversed preference pipeline, missing KL control, or compensable-safety alternative is supplied. |
| 27 | Tools and Safety Tuning | **100** | None. Its independent incident studio and evidence meet the rubric. |
| 28 | Case Study — Tülu 3 → DR Tulu | **99** | I−1 — no plausible wrong stage/reward allocation or model-owned restart authority is instantiated. |
| 29 | Decoding and Sampling | **99** | I−1 — no concrete unsuitable poetry/extractor policy or compensable dosage-error alternative is supplied. |
| 30 | The Generation Loop and KV Cache | **99** | I−1 — no plausible unsafe sharing, stale-prefix, or non-equivalent-cache alternative is instantiated. |
| 31 | Quantization and Memory | **99** | I−1 — no concrete aggregate-perplexity release error or weak localization/mitigation alternative is supplied. |
| 32 | Serving: Batching, Throughput and Latency | **99** | I−1 — no plausible blocking scheduler, aggregate-only metric set, or starvation-tolerant gate is instantiated. |
| 33 | Reasoning and Test-Time Compute | **99** | I−1 — no concrete unconditional budget, invalid escalation signal, or missing-stop policy is supplied. |
| 34 | Prompting and Context Engineering | **99** | I−1 — no plausible authority inversion, hidden conflict, or unjustified-answer alternative is instantiated. |
| 35 | Embeddings, Semantic Search and RAG | **99** | I−1 — no concrete wrong retrieval metric, oracle interpretation, or later-stage-first diagnosis is supplied. |
| 36 | Tool Use and Agent Loops | **99** | I−1 — no plausible nondeterministic spine, unbounded branch, or non-idempotent loop alternative is instantiated. |
| 37 | LLM Evaluation and LLM-as-a-Judge | **99** | I−1 — no concrete aggregate-only release, missing uncertainty, or unvalidated-judge alternative is supplied. |
| 38 | Security, Privacy and Prompt Injection | **99** | I−1 — no plausible collapsed trust boundary, cross-tenant exposure, or missing appeal alternative is instantiated. |
| 39 | Production Observability, Cost and Governance | **99** | I−1 — no concrete continue-canary, privacy-leaking trace, or ownerless incident alternative is supplied. |
| 40 | Distillation | **99** | I−1 — no plausible unavailable-logit plan, teacher-only data plan, or latency-compensates-quality gate is instantiated. |
| 41 | LoRA | **99** | I−1 — no concrete base mismatch, unsafe adapter sharing, or rollback/provenance omission is supplied. |
| 42 | Mixture of Experts (MoE) | **99** | I−1 — no plausible FLOPs-only conclusion, router-only diagnosis, or network/kernel confusion is instantiated. |
| 43 | Multimodal Language Models | **99** | I−1 — no concrete temporal-order loss, interface mismatch, or perception/reasoning conflation is supplied. |
| 44 | Interpretability and Model Editing | **99** | I−1 — no plausible knowledge-deletion overclaim, ignored locality failure, or unmatched intervention control is supplied. |

### Exact capstone scores

| Host lesson | Capstone | Exact score | Remaining deduction |
|---|---|---:|---|
| Optimizers | Explain one complete learning step | **100** | None. |
| GPT-2 → nanochat | Build and debug a tiny GPT | **100** | None. |
| OLMo 3 case study | Audit and redesign an open pre-training flow | **100** | None. |
| Tülu 3 → DR Tulu | Design a dual-purpose post-training stack | **100** | None. |
| Test-time compute | Design and benchmark an inference service | **100** | None. |
| Observability and governance | Ship a source-grounded research agent safely | **100** | None. |
| Interpretability and editing | Investigate and intervene on a false model claim | **100** | None. |

### Exact score distribution

| Score | Components |
|---:|---:|
| 100 | 11 |
| 99 | 39 |
| 98 | 1 |

- **Total:** **5,059/5,100**
- **Mean:** **5,059/51 = 99.1960784313725490196078431372549…**
- **Median:** **99**
- **At 100:** **11/51**
- **Below 100:** **40/51**
- **Exact remaining gap:** **41 points — A: 4, I: 37.**

### Exact remaining fixes

1. Extend each `TransferRule` with two authored, field-specific misconception claims. They must state a concrete wrong answer that a novice could reasonably choose, not describe generic bad reasoning.
2. For quantitative/formula fields, use the actual common wrong number, transpose, axis, mask, or sign. For design fields, omit or reverse one consequential boundary while keeping the alternative otherwise credible. For evidence fields, offer a realistic but insufficient evidence package.
3. Add tests that every field has three unique authored claims and that no global misconception template appears. Review all 264 distractors for plausibility and diagnostic value.
4. Update success copy from “construction rules passed” to “three scenario decisions passed” unless a separate typed construction is added.
5. Complete the four pinned executions: tokenizer rows, GPT-2 hidden-state outputs, OLMo-loader accounting, and paired FIM model results.

`npm test` passes in this sixth audit: production build, 13 artifact checks, three executable capstone verifiers, and all 44 structural tests. The tests assert that two generic misconception IDs exist; they do not verify 264 component-specific misconception claims because those claims do not exist.

## Exact seventh re-grade — 2026-07-13

**Implementation-loop question:** “Previously you came up with the following implementation plan. Carefully check if every aspect of your plan was implemented correctly, and that each implemented part improves our pipeline. If there is anything missing, incorrect, or not implemented fully, then detail how you will fix it. If no fixes are required, say so.”

**Answer:** The requested interaction fix is fully implemented and materially improves assessment validity. All 37 prior I−1 deductions close. Four technical A−1 deductions remain because the pinned executions are still absent; those are the only conditions preventing an exact all-100 result.

### Interaction audit

- `app/lesson-transfer-distractors.ts` contains 44 lesson entries, 132 distractor pairs, 264 unique authored misconception strings, and no generic-template fallback.
- Every field independently combines its correct claim with two field-specific alternatives. The alternatives instantiate actual novice errors: reversed quantities and optimizer states; wrong contraction axes, products, transposes, and tensor shapes; role/mask inversions; confounded controls; invalid causal claims; missing provenance; unsafe authorization/release trade-offs; leakage; aggregate-only decisions; and unsupported interpretability conclusions.
- Full-file review found no distractor that is defensibly correct for its prompt and no pair whose alternatives collapse into generic warnings. The wrong claims are plausible enough to require component knowledge while remaining unambiguously incorrect under the lesson's stated assumptions.
- Options are independently randomized per field; no choice forces another. Exact IDs determine correctness, first-failed-field feedback supports correction/retry, and the worked solution remains locked until all three decisions pass.
- The UI accurately labels the scored portion **“OBJECTIVELY CHECKED DECISIONS”** and success says **“The boundary diagnosis and all three task-specific decisions passed.”** The learner's free prose remains an explicitly locked comparison artifact rather than a falsely parsed answer.
- Under the unchanged rubric, a well-authored scenario-specific recognition/decision assessment is legitimate interaction evidence. It directly discriminates the key quantitative, causal, evidence, and safety decisions for every transfer case, supplies answer-specific feedback, and supports retry. Construction is additionally practiced in the locked draft, guided examples, labs, and capstones; the UI no longer claims that prose construction itself was machine-graded.

### Exact lesson scores

| # | Curriculum component | Exact score | Remaining deduction |
|---:|---|---:|---|
| 1 | Introduction | **100** | None. |
| 2 | Tensors, Shapes & Matrix Multiplication | **100** | None. |
| 3 | Probability, Softmax & Cross-Entropy | **100** | None. |
| 4 | Neural Networks, Gradients & Backpropagation | **100** | None. |
| 5 | Optimizers | **100** | None. |
| 6 | Tokenization | **99** | A−1 — execute the two pinned tokenizers and preserve the exact ten result rows with strings, IDs, offsets, decode/round-trip outcomes, counts, environment, and command. |
| 7 | The Embedding Layer | **99** | A−1 — execute the corrected pinned GPT-2 hidden-state probe and preserve token IDs/positions, layer cosines, raw output, environment, and command. |
| 8 | Positional Encoding | **100** | None. |
| 9 | Attention | **100** | None. |
| 10 | Layers of Understanding | **100** | None. |
| 11 | Learning to Predict | **100** | None. |
| 12 | GPT-2 → nanochat: Build the Stack | **100** | None. |
| 13 | Pre-Training Overview | **99** | A−1 — execute the counter through the pinned OLMo loader and preserve ordinary plus partial/padded per-rank raw logs and reconciled totals. |
| 14 | Training Objectives and Architectural Details | **100** | None. |
| 15 | Scaling Laws and Optimization | **100** | None. |
| 16 | Training Data Engineering | **100** | None. |
| 17 | Training Infrastructure and Systems | **100** | None. |
| 18 | Advanced Pretraining Objectives | **99** | A−1 — execute the declared paired causal/FIM model probe and preserve real serialized IDs, equal-token manifest, paired metrics, uncertainty, and regression decision. |
| 19 | Evaluation During Pretraining | **100** | None. |
| 20 | Case Study — OLMo 3 Model Flow | **100** | None. |
| 21 | Bridge: From Base Model to Assistant | **100** | None. |
| 22 | Post-Training Overview | **100** | None. |
| 23 | Supervised Fine-Tuning | **100** | None. |
| 24 | Preference Optimization | **100** | None. |
| 25 | RL Fundamentals | **100** | None. |
| 26 | RLHF | **100** | None. |
| 27 | Tools and Safety Tuning | **100** | None. |
| 28 | Case Study — Tülu 3 → DR Tulu | **100** | None. |
| 29 | Decoding and Sampling | **100** | None. |
| 30 | The Generation Loop and KV Cache | **100** | None. |
| 31 | Quantization and Memory | **100** | None. |
| 32 | Serving: Batching, Throughput and Latency | **100** | None. |
| 33 | Reasoning and Test-Time Compute | **100** | None. |
| 34 | Prompting and Context Engineering | **100** | None. |
| 35 | Embeddings, Semantic Search and RAG | **100** | None. |
| 36 | Tool Use and Agent Loops | **100** | None. |
| 37 | LLM Evaluation and LLM-as-a-Judge | **100** | None. |
| 38 | Security, Privacy and Prompt Injection | **100** | None. |
| 39 | Production Observability, Cost and Governance | **100** | None. |
| 40 | Distillation | **100** | None. |
| 41 | LoRA | **100** | None. |
| 42 | Mixture of Experts (MoE) | **100** | None. |
| 43 | Multimodal Language Models | **100** | None. |
| 44 | Interpretability and Model Editing | **100** | None. |

### Exact capstone scores

| Host lesson | Capstone | Exact score | Remaining deduction |
|---|---|---:|---|
| Optimizers | Explain one complete learning step | **100** | None. |
| GPT-2 → nanochat | Build and debug a tiny GPT | **100** | None. |
| OLMo 3 case study | Audit and redesign an open pre-training flow | **100** | None. |
| Tülu 3 → DR Tulu | Design a dual-purpose post-training stack | **100** | None. |
| Test-time compute | Design and benchmark an inference service | **100** | None. |
| Observability and governance | Ship a source-grounded research agent safely | **100** | None. |
| Interpretability and editing | Investigate and intervene on a false model claim | **100** | None. |

### Exact score distribution

| Score | Components |
|---:|---:|
| 100 | 47 |
| 99 | 4 |

- **Total:** **5,096/5,100**
- **Mean:** **5,096/51 = 99.921568627450980392156862745098039215686274509803…**
- **Median:** **100**
- **At 100:** **47/51**
- **Below 100:** **4/51**
- **Exact remaining gap:** **4 points — A: 4.**

### Every remaining condition preventing exact 100

1. **Tokenization:** preserve actual output from both pinned tokenizers for all ten rows, not only the reproduction contract.
2. **Embedding:** run the corrected pinned GPT-2 probe and preserve its numeric outputs, not only the blocked/unbundled dossier.
3. **Pre-training accounting:** run the counter through the pinned OLMo loader and preserve actual ordinary and partial/padded per-rank logs, not only the deterministic course fixture.
4. **FIM:** execute the paired model ablation and preserve measured task results, not explicitly simulated metrics.

`npm test` passes in this seventh audit: production build, all 13 artifact checks, all three executable capstone verifiers, and all 44 tests. The new tests enforce the authored distractor count, uniqueness, lesson coverage, and absence of the prior generic fallback. No interaction fix remains under the unchanged rubric; only the four honest execution gaps remain.
