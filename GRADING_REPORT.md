# Independent curriculum grading report — long-form course and guided capstones

Final long-form pass: 44 expanded lesson chapters and seven guided capstone projects, independently re-graded after implementation and correction.

Threshold: **85 for teaching effectiveness and technical accuracy on every item**. Result: **51/51 pass**.

- Lesson overall scores: **93–97**
- Capstone overall scores: **95–97**
- Automated result: production build plus **12/12 tests pass**
- Grader conclusion: no further remediation required

## Final capstone scores

| Guided project | Effectiveness | Accuracy | Overall |
|---|---:|---:|---:|
| Explain one complete learning step | 96 | 98 | 97 |
| Build and debug a tiny GPT | 97 | 97 | 97 |
| Audit and redesign OLMo 3’s flow | 96 | 96 | 96 |
| Design a Tülu/DR Tulu post-training stack | 97 | 96 | 97 |
| Design and benchmark an inference service | 95 | 96 | 95 |
| Ship a source-grounded research agent safely | 97 | 97 | 97 |
| Investigate and intervene on a false model claim | 96 | 97 | 96 |

## Corrections triggered by the long-form grading pass

- Rebuilt the OLMo 3 synthesis around Dolma 3 Mix → Dolmino → Longmino, real stage budgets, systems evidence, checkpoint controls, and open artifacts; score improved from 84 to 96.
- Rebuilt the Tülu/DR Tulu synthesis around SFT → length-normalized off/on-policy DPO → RLVR → Qwen3/MCP/RLER, including exact-verifier versus evolving-rubric decisions; score improved from 84 to 97.
- Replaced the stale `llama3-case-study` identifier with `olmo3-case-study` and made canonical numeric ordering explicit and tested.
- Converted all seven short synthesis briefs into four-stage, persistent project workspaces with deliverables, checkpoints, hints, rubrics, delayed exemplars, and reflection.

## Earlier curriculum baseline

Final pass: 44 lessons across seven tracks, graded after the skeptical curriculum expansion and two correction rounds.

Threshold: **85.0 per lesson**. Result: **44/44 pass**. Overall curriculum score: **90.4**. Minimum: **85**, Bridge: From Base Model to Assistant.

## Rubric

`0.40 × accuracy/technical nuance + 0.35 × pedagogical clarity/scaffolding + 0.15 × examples/active learning + 0.10 × misconception handling`

## Lesson scores

| # | Lesson | Score |
|---:|---|---:|
| 1 | Introduction | 90 |
| 2 | Tensors, Shapes & Matrix Multiplication | 91 |
| 3 | Probability, Softmax & Cross-Entropy | 94 |
| 4 | Neural Networks, Gradients & Backpropagation | 92 |
| 5 | Optimizers | 89 |
| 6 | Tokenization | 90 |
| 7 | The Embedding Layer | 88 |
| 8 | Positional Encoding | 92 |
| 9 | Attention | 91 |
| 10 | Layers of Understanding | 91 |
| 11 | Learning to Predict | 89 |
| 12 | GPT-2 → nanochat: Build the Stack | 95 |
| 13 | Pre-Training Overview | 90 |
| 14 | Training Objectives and Architectural Details | 91 |
| 15 | Scaling Laws and Optimization | 89 |
| 16 | Training Data Engineering | 88 |
| 17 | Training Infrastructure and Systems | 91 |
| 18 | Advanced Pretraining Objectives | 91 |
| 19 | Evaluation During Pretraining | 92 |
| 20 | OLMo 3 Model Flow | 95 |
| 21 | Post-Training Overview | 86 |
| 22 | Bridge: From Base Model to Assistant | 85 |
| 23 | Supervised Fine-Tuning | 86 |
| 24 | Preference Optimization | 90 |
| 25 | RL Fundamentals | 87 |
| 26 | RLHF | 86 |
| 27 | Tools and Safety Tuning | 90 |
| 28 | Tülu 3 → DR Tulu | 95 |
| 29 | Decoding and Sampling | 92 |
| 30 | The Generation Loop and KV Cache | 93 |
| 31 | Quantization and Memory | 90 |
| 32 | Serving: Batching, Throughput and Latency | 91 |
| 33 | Reasoning and Test-Time Compute | 93 |
| 34 | Prompting and Context Engineering | 86 |
| 35 | Embeddings, Semantic Search and RAG | 91 |
| 36 | Tool Use and Agent Loops | 92 |
| 37 | LLM Evaluation and LLM-as-a-Judge | 86 |
| 38 | Security, Privacy and Prompt Injection | 94 |
| 39 | Production Observability, Cost and Governance | 90 |
| 40 | Distillation | 88 |
| 41 | LoRA | 92 |
| 42 | Mixture of Experts | 91 |
| 43 | Multimodal Language Models | 91 |
| 44 | Interpretability and Model Editing | 92 |

## Track scores

| Track | Score |
|---|---:|
| Foundations | 91.2 |
| Architecture | 90.9 |
| Pre-Training | 90.9 |
| Post-Training | 88.1 |
| Inference & Serving | 91.8 |
| Applications & Reliability | 89.8 |
| Advanced | 90.8 |

## Corrections triggered by grading

- Moved RL Fundamentals and RLHF before tools/safety and the final Tülu/DR Tulu post-training capstone.
- Replaced a fabricated test-time “success” percentage with budget coverage, diversity, and verifier bottlenecks.
- Enforced legal agent-state transitions, retry budgets, checkpoints, authorization, idempotency, receipts, and termination.
- Separated instruction provenance from authenticated runtime capability and explicit user confirmation.
- Removed false dependency chains and displayed genuine prerequisite links in lessons.
- Labeled multimodal highlighted patches as teaching annotations and made the grid respond to resolution.
- Removed universal interpretability-strength rankings; added editing, locality, paraphrase, persistence, and unlearning distinctions.
- Added synthesis capstones to all seven tracks.

The grader confirmed every declared prerequisite exists and points backward, each track ends in synthesis, and all 44 lessons meet the requested 85+ threshold.
