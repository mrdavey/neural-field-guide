# Independent curriculum grading report — second pass

Reviewed after revision: `app/course-data.ts`, `app/lesson-labs.tsx`, `app/course-app.tsx`, and `app/globals.css`  
Scope: all 28 lessons, the 18 distinct lab designs used across 24 lesson placements, case-study sources/synthesis maps, quiz behavior, and mastery tracking.  
Threshold: **85.0 overall**; a score below 85.0 is not rounded up.

## Rubric and calculation

Every overall score is calculated as:

`0.40 × accuracy/technical nuance + 0.35 × pedagogical clarity/scaffolding + 0.15 × examples/active recall/interactivity + 0.10 × misconception handling`

“Accuracy” and “Teaching” are the two requested headline dimensions. The two remaining component scores are shown so every overall result is reproducible. Evaluation assumes a motivated beginner using the site without an instructor.

## Second-pass scores

| # | Lesson | Accuracy | Teaching | Examples / active learning | Misconceptions | Overall | Result |
|---:|---|---:|---:|---:|---:|---:|---|
| 1 | Introduction | 94 | 89 | 89 | 92 | **91.3** | Pass |
| 2 | Tokenization | 91 | 88 | 92 | 92 | **90.2** | Pass |
| 3 | The Embedding Layer | 90 | 85 | 88 | 90 | **88.0** | Pass |
| 4 | Positional Encoding | 94 | 89 | 91 | 92 | **91.6** | Pass |
| 5 | Attention | 92 | 90 | 92 | 93 | **91.4** | Pass |
| 6 | Layers of Understanding | 92 | 90 | 90 | 93 | **91.1** | Pass |
| 7 | Learning to Predict | 91 | 87 | 88 | 90 | **89.1** | Pass |
| 8 | Instruction Tuning and RLHF | 90 | 85 | 84 | 91 | **87.5** | Pass |
| 9 | GPT-2 from Scratch | 94 | 91 | 92 | 91 | **92.4** | Pass |
| 10 | Pre-Training: Overview | 91 | 89 | 91 | 90 | **90.2** | Pass |
| 11 | Training Objectives and Architectural Details | 92 | 89 | 90 | 90 | **90.5** | Pass |
| 12 | Scaling Laws and Optimization | 90 | 87 | 92 | 90 | **89.3** | Pass |
| 13 | Training Data Engineering | 92 | 86 | 77 | 91 | **87.6** | Pass |
| 14 | Training Infrastructure and Systems | 93 | 89 | 91 | 94 | **91.4** | Pass |
| 15 | Advanced Pretraining Objectives | 92 | 89 | 91 | 93 | **90.9** | Pass |
| 16 | Evaluation During Pretraining | 93 | 90 | 90 | 94 | **91.6** | Pass |
| 17 | Case Study — LLaMA 3 | 94 | 88 | 84 | 92 | **90.2** | Pass |
| 18 | Post-Training: Overview | 90 | 84 | 76 | 89 | **85.7** | Pass |
| 19 | Supervised Fine-Tuning | 91 | 85 | 76 | 88 | **86.4** | Pass |
| 20 | Preference Optimization | 92 | 87 | 90 | 91 | **89.9** | Pass |
| 21 | Tools and Safety Tuning | 94 | 88 | 78 | 94 | **89.5** | Pass |
| 22 | Case Study on Tulu 3 | 93 | 88 | 85 | 94 | **90.2** | Pass |
| 23 | Distillation | 90 | 86 | 89 | 89 | **88.4** | Pass |
| 24 | LoRA | 94 | 90 | 92 | 92 | **92.1** | Pass |
| 25 | Mixture of Experts (MoE) | 92 | 88 | 92 | 93 | **90.7** | Pass |
| 26 | Optimizers | 90 | 85 | 89 | 88 | **87.9** | Pass |
| 27 | RL Fundamentals | 92 | 89 | 93 | 92 | **91.1** | Pass |
| 28 | RLHF | 91 | 86 | 80 | 91 | **87.6** | Pass |

Minimum: **85.7**, Post-Training Overview.  
Mean overall: **89.8**.  
Lessons below 85: **none (0 of 28)**.

## Individual audit notes

### 1. Introduction — 91.3

The revised simple definition now correctly separates likely-next-token modeling from usefulness shaped by decoding and post-training. The autoregressive factorization, logits/softmax/decoding pipeline, generation example, sampling lab, and fluency/truth caveat form an effective first lesson.

### 2. Tokenization — 90.2

Strong explanation of subwords, IDs, reversibility, vocabulary/sequence trade-offs, multilingual effects, and token≠word. The editable toy tokenizer makes segmentation tangible. Its generated IDs and whitespace behavior remain invented and simplified, but “toy subword tokenizer” is stated in the lab instruction and no lesson claim depends on those exact IDs.

### 3. The Embedding Layer — 88.0

Technically accurate distinction between lookup embeddings and later contextual states, including matrix shape and tied output embeddings. The 2-D atlas is clearly presented as a compression of a richer geometry. A literal row-lookup/gradient exercise would deepen implementation transfer, but the current explanation meets the threshold.

### 4. Positional Encoding — 91.6

The prior lab defect is resolved: one fixed token moves independently between positions. The interface explicitly labels one illustrative RoPE frequency pair and explains that real RoPE rotates many pairs at different frequencies. This now aligns with the written discussion of permutation equivariance, relative displacement, and extrapolation.

### 5. Attention — 91.4

The prior causal contradiction is fully resolved. Future keys are zeroed, visibly marked `MASK`, and the remaining weights renormalize. The lab now exposes the sequence score → scale → mask → softmax → weighted values, lets the learner change contrast, labels scores as hand-authored, and repeats that attention weights are not a complete causal explanation. The prose and equation are accurate.

### 6. Layers of Understanding — 91.1

The new residual-stream walkthrough materially changes this from an abstract summary into a traceable block lesson. It preserves `[B,T,d]`, separates norm/attention/MLP/residual operations, compares pre-norm with post-norm, and uses a sequencing quiz. The distributed-capability misconception remains well calibrated.

### 7. Learning to Predict — 89.1

Excellent compact treatment of teacher forcing, per-token cross-entropy, backpropagation, and the gap between prediction loss and truthfulness. The numerical NLL example remains especially effective. The reused lab emphasizes decoding rather than gradient learning, but the example and retrieval question adequately cover the lesson objective.

### 8. Instruction Tuning and RLHF — 87.5

Accurate introductory bridge through SFT, reward-model/PPO RLHF, DPO, reference constraints, proxy failure, and annotator assumptions. It overlaps later lessons by design. The preference comparison supplies relevant active engagement and the alignment misconception is strong.

### 9. GPT-2 from Scratch — 92.4

The title is now supported by an explicit forward path, final LayerNorm, shifted-label construction, minimal training-loop pseudocode, train/eval distinction, KV-cache note, exact tensor arithmetic, shape-tracing lab, and stronger quiz. It accurately distinguishes GPT-2’s learned absolute positions, pre-norm blocks, GELU MLPs, and causal decoder structure from generic generation.

### 10. Pre-Training Overview — 90.2

The new control-room lab traces sampling/tokenization through forward, loss, backward, synchronization, update, checkpoint, and evaluation, with stage-specific failures. Requiring the learner to calculate 1T/4M = 250,000 optimizer steps turns the former displayed fact into retrieval/calculation practice. The whole-system framing is now taught rather than merely listed.

### 11. Training Objectives and Architectural Details — 90.5

The revision clearly contrasts causal, masked, and span-corruption visibility/targets; explains teacher-forced parallelism; and connects residual width, head count, and head dimension through an explicit calculation and quiz. The final masked example is now internally consistent in both content and lab: `Birds [MASK] long distances` supplies context on both sides and correctly targets `fly`.

### 12. Scaling Laws and Optimization — 89.3

The written lesson already handled regimes, irreducible floors, Chinchilla-style compute balance, and deployment-vs-training objectives well. The lab now prominently says its 50/50 curve is illustrative, not universal, and that parameter/token percentages are not literally commensurate. The earlier mislearning risk is addressed.

### 13. Training Data Engineering — 87.6

Accurate, responsible treatment of collection, filtering, redaction, deduplication, mixing, contamination, provenance, rights, and bias. The reweighting example is useful, but active practice is still limited to one recognition question; a future mixture or near-duplicate decision task would improve transfer.

### 14. Training Infrastructure and Systems — 91.4

The expanded memory ledger and distinction among compute partitioning, model-state sharding, and activation checkpointing are accurate. The eight-device DP/TP/PP visualization makes ownership and communication concrete, while the recovery question correctly requires model/optimizer/scheduler, RNG, and data-position state for an equivalent continuation.

### 15. Advanced Pretraining Objectives — 90.9

The previous taxonomy problem is resolved. The lesson now identifies inputs, targets, loss-bearing positions, loss types, and stages; distinguishes token CE, contrastive retrieval, routing auxiliaries, teacher-logit KL, and outcome reward; gives concrete FIM serialization; explains that FIM remains causal over a reordered sequence; and introduces negative transfer. The multi-objective lab and selection quiz reinforce the distinctions.

### 16. Evaluation During Pretraining — 91.6

The new NLL→perplexity calculation, healthy/overfit/spike traces, diagnosis interaction, contamination caveat, confidence-interval warning, and intrinsic/capability/systems-health distinction turn the dashboard list into diagnostic teaching. For maximal rigor the overfit trace could draw train and validation curves together, but the text explicitly states the assumed falling train loss.

### 17. Case Study — LLaMA 3 — 90.2

The release-boundary issue is fixed. April 2024 Llama 3 8B/70B facts are explicitly separated from July 2024 Llama 3.1’s 405B/128K-context herd. The 32-query/8-KV-head calculation correctly demonstrates a 4× reduction in cached K/V elements for those projections. Primary Meta sources are linked and the quiz tests version attribution. The UI title retains the older stylization “LLaMA,” while the content consistently uses Meta’s “Llama”; changing the title would improve naming consistency but not technical accuracy.

### 18. Post-Training Overview — 85.7

This is the minimum-scoring lesson but passes. It accurately frames concentrated policy shaping, SFT/preferences/safety/tool trajectories/rejection sampling, forgetting, and iterative evaluation. Its example and misconception are strong; it remains less interactive than neighboring lessons and uses only one recognition check. A pipeline-ordering or before/after behavior task would create more margin above threshold.

### 19. Supervised Fine-Tuning — 86.4

Accurate coverage of assistant-output loss masking, data origins/quality, conversation formatting, lower learning rates, replay, forgetting, and the policy region inherited by preference training. It passes, but an interactive multi-turn loss mask would be a worthwhile next improvement because the current lesson has no dedicated lab.

### 20. Preference Optimization — 89.9

Accurate Bradley–Terry reward-model framing, PPO/KL pipeline, DPO policy/reference ratio, variant caveats, and preference bias. The paired-response interaction is highly relevant and misconception handling is excellent.

### 21. Tools and Safety Tuning — 89.5

Excellent defense-in-depth lesson: schemas, action choice, argument validation, observations, safe completion, over-/under-refusal, prompt injection, excessive agency, exfiltration, side effects, and runtime permissions are all correctly distinguished. It could benefit from a schema/authorization simulator, but it already teaches the essential security boundary accurately.

### 22. Case Study on Tulu 3 — 90.2

The previous omissions are resolved. The lesson now names RLVR, contrasts a programmatic verifier with a learned preference reward model, lays out curation → SFT → on-policy/length-normalized DPO → RLVR, explains length bias, and demonstrates both a valid checker and a false-positive verifier. Primary Ai2 sources are linked. The generic preference lab is less case-specific than the prose, but the case now has enough concrete evidence and active recall to pass comfortably.

### 23. Distillation — 88.4

Accurate treatment of logit, sequence, hidden-state, and mixed teacher/ground-truth distillation, plus the student capacity frontier and error inheritance. The temperature lab effectively demonstrates soft-target information. The deeper path could add the standard temperature-scaled KL and common `T²` compensation, but this omission does not impair the core teaching.

### 24. LoRA — 92.1

Still one of the strongest lessons. Matrix dimensions, `ΔW=BA`, `α/r` scaling, frozen-base caveat, parameter arithmetic, adapter portability/merging, target-module choices, and QLoRA are mutually reinforcing. The rank slider makes the capacity/memory trade-off concrete.

### 25. Mixture of Experts (MoE) — 90.7

Accurate sparse activation, routing, load balance, capacity, token dropping, communication, serving, and specialization caveats. The lab now labels its routes as hand-authored and its expert names as a teaching aid, eliminating the prior risk of implying that real experts acquire neat human-readable roles.

### 26. Optimizers — 87.9

Accurate progression from SGD/momentum to Adam/AdamW, plus warmup, decay, clipping, precision, and optimizer-state memory. The quadratic loss interaction effectively demonstrates learning-rate stability, although it implements plain gradient descent rather than the adaptive methods described. A momentum/Adam comparison would deepen the lesson but is not required for threshold.

### 27. RL Fundamentals — 91.1

The previous reward/advantage conflation is resolved. The sandbox exposes return and baseline independently, computes `A=R−b`, parameterizes a Bernoulli policy by a logit, and uses the correct selected-action gradient factor `1−π(a)` for the demonstrated action. Labels clearly mark the model as a toy. The prose covers state/action/policy, discounted return, values, advantages, credit assignment, exploration, and reward misspecification.

### 28. RLHF — 87.6

Accurate classic SFT → comparisons → reward model → PPO pipeline, with clipping/KL intuition, online sampling, reward overoptimization, annotator disagreement, distribution shift, evaluator gaming, and held-out evaluation. Its generic preference lab does not demonstrate PPO ratios or clipping, leaving active learning thinner than the strongest lessons, but the lesson passes.

## Previously identified factual issues: closure audit

| Prior issue | Second-pass status | Evidence |
|---|---|---|
| Attention lab allowed future attention | **Resolved** | Future positions are zeroed before normalization and displayed as `MASK`. |
| Positional lab changed token and position together | **Resolved** | A fixed token is moved while content remains constant. |
| RL lab conflated reward and advantage | **Resolved** | Return and baseline are separate; advantage and selected-action logit update are explicit. |
| Advanced-objective stages/losses were conflated | **Resolved** | CE, contrastive, routing, KL, and outcome-reward signals are assigned explicit roles/stages. |
| Llama 3 and 3.1 facts were mixed | **Resolved** | April and July 2024 releases are separated and sourced. |
| Introduction called the next token inherently useful | **Resolved** | Likelihood prediction is separated from usefulness shaping. |
| Toy labs looked like empirical model outputs | **Substantially resolved** | Attention, position, scaling, MoE, and RL carry explicit toy/illustrative labels. The tokenizer’s instruction also says “toy.” |
| Masked example claimed right context without a right-hand token | **Resolved** | Content and lab now use `Birds [MASK] long distances` with target `fly`. |

## Outstanding factual issues

**None found in this grading pass.** The last masked-context inconsistency is resolved in both the lesson content and shared objectives lab.

## Course-wide assessment

- All 28 lessons now meet the 85% effectiveness/accuracy threshold under the requested rubric.
- Correct-quiz gating materially improves the integrity of progress: a new lesson cannot be recorded as mastered until the knowledge check is answered correctly. This addresses the first-pass concern that progress measured unchecked self-attestation.
- A correct four-option recognition question is still a weak definition of full mastery. The strongest future enhancement would be adding prediction-before-reveal, short calculation, ordering, or diagnosis prompts to the remaining no-lab lessons—especially Post-Training Overview and SFT.
- The consistent two-depth explanation, mental model, key ideas, worked example, misconception correction, lab where applicable, delayed quiz feedback, and gated mastery now form a coherent pedagogical loop.
- Named case studies now expose primary sources and version-aware claims. Their synthesis maps remain navigation/review tools rather than graded synthesis exercises, but the revised case-study content itself is sufficient.

## Primary sources used for case-study verification

- Meta, “Introducing Meta Llama 3”: https://ai.meta.com/blog/meta-llama-3/
- Meta, “The Llama 3 Herd of Models”: https://ai.meta.com/research/publications/the-llama-3-herd-of-models/
- Ai2, Tülu project: https://allenai.org/tulu
- Ai2, “Tülu 3: The next era in open post-training”: https://allenai.org/blog/tulu-3-technical
