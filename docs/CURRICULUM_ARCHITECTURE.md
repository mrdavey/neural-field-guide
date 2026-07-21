# Neural Field Guide curriculum architecture

Reviewed: 2026-07-21

## Decision

Neural Field Guide is a five-course personal research program whose primary outcome is explaining and using system mechanisms from understandable primitives and whose secondary outcome is conducting controlled original experiments.

The visible recommended sequence is:

1. Large Language Models
2. World Models
3. Generative Models
4. Reinforcement Learning & Control
5. Embodied AI

This list is guidance, not an invented total order. Every course begins from an observable mechanism and defers notation, hand calculation, and code until after the learner can explain the core operation. LLMs and World Models then supply shared numerical foundations as optional technical depth. Generative Models bridges explicit density, latent inference, energy, flow and diffusion families. RL reuses state, decision, and optimization concepts; completing every generative topic is recommended but not required for tabular RL. Embodied AI is the cumulative synthesis and names its concept-level prerequisites explicitly.

The exact released lesson inventory lives in `docs/CURRICULUM_INVENTORY.md`. The machine-readable ownership graph lives in `app/curriculum-graph.ts`; the reviewed manifests that back the three added courses live in `app/research-curriculum-manifests.ts`.

## Concept-first delivery contract

All 182 released lessons use the same two-layer contract; this is not a pilot or a course-specific exception.

1. The required **Orient → Learn → Try → Test** path explains inputs, the operation, its result, and a failure boundary without requiring formulas, hand calculation, or code.
2. The deterministic core quiz checks explanation, prediction, diagnosis, comparison, or decision-making. Passing it is the only assessment dependency for recording lesson mastery.
3. **Extend** begins after the mastery control. A collapsed **Optional technical depth** disclosure retains the precise mechanism, every exact authored objective and its worked check, the code notebook, technical validation, and any calculation-led lab, transfer, or capstone.
4. Opening sequences make the mechanism visible before formalization: text generation before LLM tensor algebra; trajectories and alternative futures before World Model tensors; sampling before likelihood arithmetic; partial observation and policy choice before the formal RL ledger; physical interfaces and hidden state before coordinate transforms.
5. Stable lesson IDs, routes, storage keys, exact released counts, evidence boundaries, and static-export behavior remain unchanged. The ordering change affects lesson numbers and phase membership, not persistence identity.

`app/concept-first-curriculum.ts` is the shared policy, and `app/concept-first-operation-traces.ts` owns the explicit lesson-specific operation records consumed across all required surfaces. `tests/concept-first-curriculum.test.mjs` inspects all canonical lesson dossiers and rejects formula-bearing core blocks, malformed transformed language, code before mastery, gating technical depth, or a course opening that reverts to formal abstraction first.

## Canonical concept ownership

| Shared concept | Canonical teaching location | Reinforcement and next use | Ownership boundary |
|---|---|---|---|
| Tensors, shapes and linear transforms | `llm:tensors-shapes` | dynamics tensors, change of variables, coordinate frames, policy networks | Later courses name domain axes and units; they do not repeat generic tensor algebra. |
| Probability, likelihood and predictive loss | `llm:probability-softmax` | next-token loss, generative likelihood, world-model targets, policy gradients | RL likelihood-ratio gradients and generative objective families are not presented as ordinary supervised cross-entropy. |
| Gradients and optimization | `llm:gradients-backprop`, then `llm:optimizers` | world-model learning, VAEs, DQN, actor-critic, behavior cloning | Later courses own estimator and target stability; the shared foundation owns differentiation and update mechanics. |
| Autoregressive factorization | `llm:learning-to-predict` | tiny GPT, non-text generators, sequence policies, action transformers | Causal factorization transfers; tokenizer, objective, variable and evaluation contracts do not automatically transfer. |
| Learned representations | `llm:embedding-layer` | sensor encoding, latent state, multimodal policies | Token lookup, sensor encoders and latent state have different interfaces and information-loss boundaries. |
| Attention and causal sequence computation | `llm:attention` | GPT, autoregressive generation, sequence policies, action transformers | Attention routes information; it does not define the task objective, policy or causal explanation. |
| Latent priors and posteriors | `worldmodel:stochastic-latents-vaes` | prior/posterior dynamics, ELBO, VAE diagnosis, filtering | World Models introduces latent state for dynamics; Generative Models owns complete variational inference and posterior-collapse treatment. |
| State, transition and observation | `worldmodel:sequential-state` | action-conditioned dynamics, RL loop, embodied observations/actions | World Models owns predictive state; RL adds preferences over consequences; Embodied AI binds state to timed sensors and actuators. |
| Belief-state estimation | `worldmodel:belief-states-filtering` | recurrent states, POMDP policies, sensor fusion | A belief is evidence-conditioned state, not proof that hidden reality is identifiable. |
| Density evaluation and sampling | `generative:sampling-randomness`, then `generative:likelihood-cross-entropy` | flows, EBMs, diffusion, policy/action sampling | Plausible samples do not by themselves establish calibration, controllability or decision usefulness. |
| Score and diffusion models | `generative:corruption-denoising` | score matching, DDPMs, world dynamics, diffusion policies | Observation, latent-dynamics and action diffusion share denoising mathematics but not variables, conditions or evaluation. |
| Conditional generation | `generative:conditional-generation` | guidance, multimodal conditioning, language-grounded policies | Condition adherence is measured separately from fidelity, diversity, memorization and safety. |
| MDPs, rewards and Bellman values | `worldmodel:mdps-bellman` | RL foundations, dynamic programming, value learning | World Models supplies decision vocabulary for planning; RL owns the systematic learning algorithms and estimator comparisons. |
| Policy learning | `rl:policy-gradients` | LLM post-training, imagination actor-critic, embodied policies | LLM RL and imagination learning are specialized settings; the RL course owns derivation, bias/variance and evaluation. |
| Planning and feedback control | `worldmodel:model-predictive-control` | shooting/CEM, tree search, model-based RL, robot feedback | Open-loop search, receding-horizon planning, learned policies and low-level feedback are distinguished. |
| Imitation and offline learning | `rl:behavior-cloning` | dataset aggregation, conservative offline learning, robot demonstrations | Supervised imitation matches logged actions; offline RL also estimates value under incomplete coverage. |
| Multimodal alignment and grounding | `llm:multimodal-models` | multimodal world models, policy encoders, language grounding | Cross-modal alignment does not establish physical grounding, action competence or closed-loop safety. |
| Robotics and sim-to-real | `worldmodel:system-identification-sim-to-real` | goal-conditioned robotics, embodied calibration and transfer | Simulation is authentic execution in its own environment, not evidence of real-hardware reliability. |
| Systems evidence | `llm:infrastructure` | serving, observability, GPU generative/RL/embodied runs | Measurements belong to exact code, hardware, workload, precision and revision. Fixtures validate arithmetic, not performance. |
| Evaluation and uncertainty | `llm:evaluation-design` | world-model evaluation, generative matched budgets, seed-level RL, embodied suites | A metric measures a declared construct under a sampling design; it is not a universal ranking. |
| Safety, authority and intervention | `llm:tools-safety` | security, planning constraints, safe RL, human intervention | Preference training, constraints, permissions, monitoring and intervention are separate controls. |
| Reproduction and original research | `generative:reproducible-gpu-experiments` | generative, RL and embodied research capstones | Original intervention begins after baseline reproduction; one seed or favorable example cannot support a general claim. |

Every row above has an executable counterpart in `crossCourseConcepts`; tests reject missing canonical or reuse references.

## Boundary decisions

### Autoregressive modeling

LLMs retain the canonical causal factorization, tensor shift, tokenizer and decoder implementation. Generative Models reuses factorization with non-text variables and compares it with latent, flow, energy and diffusion families. RL sequence policies and Embodied action transformers must state when their conditioning and return variables differ from next-token modeling.

### VAEs and latent inference

World Models retains the first use of stochastic latent state, priors, posteriors and belief updating. Generative Models owns the derivation and implementation of amortized inference, the ELBO, reparameterization, posterior collapse, and discrete/hierarchical latent variants. Notation is shared: observed $x$, latent $z$, prior $p(z)$ or $p(z_t\mid h_t)$, approximate posterior $q(z\mid x)$, and a visibly decomposed reconstruction/likelihood plus KL objective.

### Diffusion

Generative Models owns forward corruption, score matching, DDPM objectives, schedules, guidance and sampling. World Models retains a comparison of autoregressive and diffusion dynamics but links to the canonical derivation. Embodied AI owns action-space consequences such as temporal consistency, chunking and closed-loop latency.

### MDPs, planning and RL

World Models retains MDP/Bellman vocabulary because planning cannot be explained without outcomes and values. RL owns dynamic programming, Monte Carlo, TD, Q learning, policy gradients, actor-critic, imitation and offline learning as a systematic course. World Models continues to own learned predictive state, imagination and planning interfaces. The two courses use shared symbols and explicitly name different training distributions and error sources.

### RLHF and agents

LLM post-training remains a specialized application of contextual and trajectory optimization. It links to RL derivations instead of compressing the entire field. Agent loops remain runtime orchestration and authority contracts; they are not relabeled as reinforcement learning unless a policy is actually updated from a declared signal.

### Multimodality and embodiment

LLMs own token-side modality projection and alignment. World Models own multimodal predictive state and latent action interfaces. Generative Models owns conditional density modeling and guidance. Embodied AI owns grounding in timed observation/action loops, data capture, control, intervention and task-level evaluation.

### Systems, evaluation and safety

These remain embedded in every course. The LLM lessons provide canonical patterns; each later course instantiates them with domain-specific artifacts. A separate course may be added later only if the personal project needs greater depth than the embedded research contracts provide.

## Implemented cross-course joins

| Existing lesson or surface | Current alignment | Joined surfaces kept consistent |
|---|---|---|
| `llm:tensors-shapes`, `probability-softmax`, `gradients-backprop`, `optimizers` | These are canonical shared prerequisites with later-course reuse statements. | Course guide narrative, prerequisite/next-use UI, cross-course graph tests. |
| `llm:learning-to-predict`, `gpt2-from-scratch` | Autoregressive modeling is transferred beyond language through a bounded causal trace. | Guide, capstone evidence, artifact schema, sources when claims change. |
| `llm:rl-fundamentals`, `preference-optimization`, `rlhf` | Bandit and sequence assumptions stay separate and point to the complete RL derivations. | Exact objectives when promises change, coverage, examples, quiz/transfer, review doc. |
| `llm:agent-loops` | The course explicitly distinguishes runtime orchestration from learned control. | Guide, evidence contrast, transfer distractor. |
| `llm:multimodal-models` | The language-side mechanism bridges to conditional generation and closed-loop embodiment. | Guide, next-use, transfer assessment. |
| `llm:infrastructure`, `evaluation-design`, `security-privacy`, `observability-governance` | Reusable systems, evaluation, and safety artifact contracts transfer across courses. | Capstone evidence, validations, public artifact schemas, verifier. |
| `worldmodel:stochastic-latents-vaes`, `latent-prior-posterior` | Variational notation is aligned while complete VAE diagnosis remains owned by Generative Models. | Objectives only if wording changes, coverage, guides, math tests. |
| `worldmodel:autoregressive-diffusion-dynamics` | The comparison links to the canonical diffusion derivation while retaining world-dynamics scope. | Guide, resources, transfer boundary. |
| `worldmodel:mdps-bellman`, `rewards-returns-policies`, `actor-critic-lambda` | Shared symbols distinguish the introductory planning use from full RL ownership. | Guide, objective coverage where changed, code guidance, transfers. |
| `worldmodel:dyna-tdmpc-case-study` and planning lessons | Planner/model/policy comparison artifacts are available for RL reuse. | Capstone evidence, artifact JSON, verifier, synthesis links. |
| `worldmodel:goal-conditioned-robotics`, `system-identification-sim-to-real`, `safe-constrained-planning` | Trajectory, calibration, constraint, and intervention contracts transfer to Embodied AI. | Guides, capstone evidence, artifact files, public-path links. |
| `worldmodel:language-multimodal-world-models`, `world-model-research-capstone` | The Embodied AI bridge and standardized final research dossier are implemented. | Guide, capstone project/evidence, objective coverage, research artifact. |

Any objective text change triggers the full exact-coverage update and independent semantic review required by `AGENTS.md`. No objective is changed merely to add a link.

## LLM section continuity audit — 21 July 2026

The learner-reported discontinuity at the beginning was genuine: the course asked for shape and matrix fluency before a beginner had seen the text-generation mechanism those tools support. The repaired opening now follows the visible system first—Introduction → Tokenization → Embedding → Position → Attention → Layers → Learning to Predict. Only then do Lessons 08–11 formalize representation, feedback, responsibility, and parameter updates; the tiny GPT synthesis remains Lesson 12.

The mathematical content was not removed. On every affected lesson, the required page explains the operation and tests it with a formula-free decision, then places the complete authored objectives, worked arithmetic, browser lab, changed-case transfer, code, validation, and numerical capstone after mastery in optional technical depth.

| Audited seam | Knowledge carried forward | Continuity decision |
| --- | --- | --- |
| Conceptual text loop → optional numerical foundations | The learner has already watched text become pieces, representations, contextual states, and next-piece feedback before tensors name how those states are carried. | `learning-to-predict` → `tensors-shapes` is direct reuse; tensor notation begins at Lesson 08 and does not gate the preceding conceptual loop. |
| Numerical foundations → pre-training | Representation, feedback, responsibility, updates, and the tiny complete stack are available before the course scales the training system. | `gpt2-from-scratch` → `pretraining-overview` remains direct reuse. |
| Pre-training → post-training | The audited pre-training recipe produces a base model that continues text but is not yet a dependable assistant policy. | The bridge defines the behavior change before method names. |
| Post-training → inference and serving | Post-training shapes the policy; runtime decoding still decides which next-piece scores become visible text. | Honest new chapter thread with an explicit carry-forward result. |
| Inference and serving → applications and reliability | Inference-time processing uses the instructions and evidence supplied through context. | Direct-reuse handoff retained. |
| Applications and reliability → advanced branches | The dependable-system spine is complete; later topics are goal-driven specializations. | New-thread relationship plus branch chooser retained; no artificial prerequisite chain was added. |

`tests/llm-curriculum-continuity.test.mjs` protects the twelve-lesson opening order, the concept-first tensors page, and the later course seams. `tests/concept-first-curriculum.test.mjs` separately protects the delivery split across all five courses.

## Cross-course continuity audit — 21 July 2026

This was a complete semantic review of the current learner-facing reader dossiers, not a sample or a structural proxy. It inspected 138 canonical handoffs: course home to first lesson, every ordinary next-lesson edge, and every World Models advanced branch entry. Because those advanced lessons are parallel choices rather than a ladder, the parallel advanced branches are counted from their shared entry prerequisite, `world-model-operations-case-study`.

Each handoff was graded on four questions: does the destination reactivate the result that matters, explain why the new idea is needed, classify the relationship honestly, and preview the mechanism being added? A pass satisfies all four. A partial handoff has a coherent destination lesson but leaves at least one of those connections implicit or labels it inaccurately. A fail would be impossible to follow without an untaught prerequisite; none met that threshold.

| Course | Canonical handoffs | Pass | Partial | Fail |
| --- | ---: | ---: | ---: | ---: |
| World Models | 46 | 30 | 16 | 0 |
| Generative Models | 30 | 20 | 10 | 0 |
| Reinforcement Learning & Control | 32 | 22 | 10 | 0 |
| Embodied AI | 30 | 18 | 12 | 0 |
| **Total** | **138** | **90 pass** | **48 partial** | **0 fail** |

### Section and branch boundaries

All 31 course-home, track, and advanced-branch entry boundaries were classified independently of lesson numbering. World Models' Foundations → Representation → Learning → Planning and Foundation Models → Evaluation joins are direct reuse; Planning → Video is an honest new chapter thread. Its five specialization entries are parallel extensions, while the research capstone is a synthesis after a chosen specialization, not a sixth peer choice. Generative Models has deliberate new threads at Autoregressive/Latent, Flows, Diffusion, and Research; Diffusion → Conditional is an extension. RL's first two territory changes directly reuse their capstones, while Policy Gradients, Model-Based RL, Imitation/Offline RL, and Reliable Research begin new method or evidence threads. Embodied AI deliberately opens new threads at Perception, Demonstrations, Language-Conditioned Policies, Planning/Control, and Evaluation. The partial boundary rows below need better bridges, but none requires reordering the curriculum.

### World Models findings

| Handoff | Severity | Why it is partial | Scoped repair |
| --- | --- | --- | --- |
| `world-models` → `sequential-state` | High | The introduction's situation–action–consequence story needs a stable ordered experience before any formal model representation. | Turn the story into observation, state, action, and consequence roles without notation. |
| `sequential-state` → `stochastic-futures` | Medium | One observed sequence can suggest one forced future even when the same apparent situation has several outcomes. | Hold the situation fixed and contrast multiple possible consequences before assigning probability. |
| `stochastic-futures` → `rewards-returns-policies` | Medium | Possible futures alone do not tell a decision-maker which consequence to prefer. | Add consequences, goals, and an action rule while keeping prediction separate from preference. |
| `rewards-returns-policies` → `mdps-bellman` | High | Immediate consequences and longer-term policy outcomes need one reusable decision-plus-future operation. | Join them conceptually first; retain the Bellman arithmetic in optional technical depth. |
| `differentiable-planning` → `actor-critic-lambda` | High | Both optimize imagined return, but the learner is not told that planning changes actions while actor–critic changes policy and value parameters. | Contrast the optimized variables and reuse the same imagined rollout to introduce actor and critic targets. |
| `dyna-tdmpc-case-study` → `video-tokenization` | High | A planning case study is mislabeled as direct reuse even though video starts a representation-and-scale thread. | Mark a new chapter thread and explain why raw high-dimensional frames first need predictive visual units. |
| `latent-actions-passive-video` → `jepa-vjepa` | High | Action-conditioned latent dynamics abruptly become action-free representation prediction. | Present JEPA as an alternative foundation-model contract and reactivate feature prediction without pretending actions carry forward. |
| `jepa-vjepa` → `genie-interactive-worlds` | High | The join is labeled direct even though Genie synthesizes video tokens, autoregression, and learned latent actions. | Mark synthesis and name the three earlier interfaces being combined. |
| `goal-conditioned-robotics` → `system-identification-sim-to-real` | Medium | Goal representations do not motivate mass, friction, delay, gain, or bias estimation. | Start from a controller that misses its goal under model mismatch and turn the residual into identification hypotheses. |
| `system-identification-sim-to-real` → `safe-constrained-planning` | Medium | Calibrating dynamics uncertainty is not explicitly connected to robust or chance-constrained action selection. | Carry the calibrated uncertainty into constraint margins, then distinguish planning from independent intervention authority. |
| `world-model-operations-case-study` → `object-centric-dynamics` | High | Release-bundle operations are treated as the conceptual prerequisite for an optional object-centric specialization. | Label the parallel branch and reactivate predictive entities, states, interactions, and action-conditioned transitions. |
| `world-model-operations-case-study` → `hierarchical-multiscale` | Low | The shared operations prior does not explain why temporal or spatial abstraction is needed. | Reuse long-horizon rollout error and introduce multiple update scales as the branch's new mechanism. |
| `world-model-operations-case-study` → `geometry-physical-priors` | Low | Evidence packaging does not motivate coordinate, equivariance, or conservation structure. | Reuse out-of-distribution dynamics errors and ask which geometric or physical invariants should constrain prediction. |
| `world-model-operations-case-study` → `causal-counterfactual-models` | Low | Operations artifacts do not distinguish observed correlations from intervention questions. | Reactivate learned transitions, then show how an intervention changes the query and evidence requirement. |
| `world-model-operations-case-study` → `language-multimodal-world-models` | Low | The branch opens without connecting predictive state to language or multimodal conditions. | Reuse the model input/output contract and add modality alignment and grounding as explicit new interfaces. |
| `world-model-operations-case-study` → `world-model-research-capstone` | High | The required final synthesis is presented as a peer specialization and inherits an irrelevant single prior. | Move it after the chooser and require one selected branch plus operations, evaluation, and evidence contracts. |

### Generative Models findings

| Handoff | Severity | Why it is partial | Scoped repair |
| --- | --- | --- | --- |
| `generation-as-distribution` → `sampling-randomness` | High | The set of possible outputs should become observable before the learner is asked to score it formally. | Draw repeated outcomes first and distinguish replayable randomness from determinism. |
| `sampling-randomness` → `likelihood-cross-entropy` | Medium | Varied draws need a complementary explanation of how an observed example supplies learning feedback. | Reuse one probability table for sampling and scoring while deferring likelihood arithmetic. |
| `likelihood-cross-entropy` → `divergences-distance` | Medium | Per-example feedback must broaden to a distribution-level comparison without conflating sampling noise and model mismatch. | Compare repeated frequencies with the target before opening the optional divergence calculations. |
| `latent-variable-models` → `amortized-inference-elbo` | High | The intractable posterior motivates $q(z\mid x)$, but the next page treats $q$ and the ELBO as a fresh formalism. | Make the relationship direct, define the approximate posterior, and derive the tractable bound from the blocked inference query. |
| `amortized-inference-elbo` → `vae-posterior-collapse` | High | The reconstruction/KL ledger is not used to explain how an expressive decoder can ignore the latent variable. | Trace an optimization path where $q(z\mid x)$ approaches the prior while likelihood remains competitive. |
| `latent-models-capstone` → `change-of-variables` | Medium | The activated KL argument order is unused as the course starts an exact-density family. | Mark a new thread and carry forward density normalization and support rather than an irrelevant formula. |
| `diffusion-model-capstone` → `conditional-generation` | Medium | The claimed direct reuse does not show where a condition $c$ enters the denoiser or generator. | Keep the diffusion input/output trace and add one visible conditioning path with a changed prediction. |
| `classifier-free-guidance` → `inverse-problems-editing` | Medium | The edge claims direct reuse, while the destination begins from $y=A(x)+n$ and Bayesian conditioning rather than CFG. | Classify the broader conditioning relationship honestly and map guidance to an optional solver, not a prerequisite identity. |
| `generative-data-systems` → `memorization-privacy` | Medium | Immutable data, rights, and provenance decisions are not carried into the privacy threat model. | Reuse dataset lineage to define exposure, deletion limits, query access, and auditable mitigations. |
| `memorization-privacy` → `matched-budget-evaluation` | Medium | A privacy attack setup jumps to general comparison without naming memorization as one measured construct. | Carry its query and attack budgets into a multi-construct evaluation matrix alongside quality and diversity. |

### Reinforcement Learning & Control findings

| Handoff | Severity | Why it is partial | Scoped repair |
| --- | --- | --- | --- |
| `sequential-decision-systems` → `partial-observation` | High | The plain-language loop can imply that the agent always knows the true situation. | Hold the task fixed, hide one state variable, and introduce observations and beliefs before formal notation. |
| `partial-observation` → `policies-occupancy` | Medium | Estimating an information state and choosing actions under it are conflated as one direct progression. | State the shift explicitly: belief or history is the policy input; policy and occupancy describe decisions and visitation. |
| `policies-occupancy` → `mdps-rewards` | Medium | Once action choice and visitation are visible, the loop needs precise names for analysis. | Formalize the already-understood operation after the policy mechanism has sunk in. |
| `dynamic-programming` → `monte-carlo-estimation` | Medium | Exact known-model backups switch to sampled returns without explaining why the table is unavailable. | Compare the same value target computed from $P$ and $R$ with an empirical episode return. |
| `learned-dynamics-control` → `shooting-mpc` | High | The destination uses the learned model to score candidate action sequences but is labeled as a separate thread. | Mark direct extension and trace one candidate sequence through the learned transition model and objective. |
| `shooting-mpc` → `dyna-imagination` | Medium | Planning with a model and learning from a model are adjacent without contrasting their outputs. | Reuse one imagined transition, showing MPC uses it to choose an action while Dyna uses it as a learning update. |
| `dyna-imagination` → `model-uncertainty-exploitation` | High | Imagined targets inherit model error, but that causal risk does not motivate uncertainty controls. | Show one confidently wrong synthetic transition, then gate admission, penalize uncertainty, or fall back to real data. |
| `covariate-shift-dagger` → `offline-rl-coverage` | Medium | Learner-visited expert queries change abruptly into a fixed-dataset support problem. | Contrast interactive coverage repair with the no-new-query constraint and resulting extrapolation risk. |
| `rl-evaluation-seeds` → `safe-constrained-rl` | Medium | Average-return evidence is not explicitly shown to be insufficient for constraint feasibility. | Extend the evaluation table with per-seed costs, violations, feasibility gates, and worst-case evidence. |
| `safe-constrained-rl` → `reproducible-rl-gpu` | Medium | Declared rewards, costs, and permissions do not visibly become run invariants or failure artifacts. | Carry them into smoke/full-run checks, provenance, stop criteria, and failure rows. |

### Embodied AI findings

| Handoff | Severity | Why it is partial | Scoped repair |
| --- | --- | --- | --- |
| `embodied-task-contracts` → `observation-action-spaces` | Low | The sense–decide–act–check loop is not explicitly converted into typed interfaces. | Map each loop step to observation fields, action fields, timing, and success checks. |
| `observation-action-spaces` → `embodied-partial-observation` | Medium | A valid sensor packet can still omit the hidden physical condition a controller needs. | Add history and belief before teaching coordinate-transform notation. |
| `embodied-partial-observation` → `coordinate-frames-time` | Low | Evidence across sensors and moments is useless unless its physical meanings line up. | Reuse the history, then annotate frame, units, timestamp, and synchronization; defer transform arithmetic. |
| `cameras-proprioception` → `calibration-transforms` | Low | A synchronized sensor packet still lacks the camera-to-robot mapping needed for control. | Reuse the packet and apply a versioned calibration transform to one point. |
| `state-estimator-capstone` → `teleoperation-demonstrations` | Medium | The estimator output and control commands are not named as the observation/action fields of a demonstration row. | Convert one timed estimator packet plus requested/applied commands into a trajectory record. |
| `robot-data-quality` → `action-representations-chunking` | Low | Trustworthy rows do not yet specify what the learning target means. | Define end-effector and joint-space targets, frames, horizons, and the effect of chunking on the same data. |
| `behavior-cloning-capstone` → `language-grounding` | Medium | Observation-to-action imitation lacks an interface for instruction-selected objects, relations, and goals. | Add instruction and grounded referent fields before changing the policy architecture. |
| `transformer-action-policies` → `diffusion-policies` | Medium | Diffusion is introduced without framing it as a parallel action decoder under the same conditions and control budget. | Hold conditioning, action chunks, latency, and closed-loop evaluation fixed while changing the decoder family. |
| `feedback-control` → `world-model-robot-planning` | Low | The relation between a planned action sequence and feedback correction of its executed prefix is implicit. | Trace plan, execute, observe error, correct, and replan as one loop. |
| `world-model-robot-planning` → `hierarchical-skills` | Low | A flat action sequence jumps to skills without defining subgoal and termination interfaces. | Compress a repeated segment into a skill with parameters, success condition, and handoff. |
| `hierarchical-skills` → `sim-to-real-identification` | Low | The course starts transfer without saying that reusable skills still assume particular dynamics. | Hold a skill fixed, perturb mass or latency, and use system identification to repair the model/controller. |
| `robustness-generalization` → `latency-safety-operations` | Low | Offline shift failures do not become runtime timing and authority requirements. | Turn each failure mode into a latency budget, constraint, provenance field, watchdog, or rollback condition. |

`tests/cross-course-continuity.test.mjs` fixes the audit population, verifies that every finding is a real canonical seam, and protects the explicit boundary classifications. The findings are an implementation backlog, not a claim that lengthier prose alone will repair continuity: each destination must make the carried artifact and new mechanism observable.

### Repair disposition

All 48 partial handoffs were repaired without changing a lesson ID, number, route, visible objective, or persistence key. Each affected destination now begins with an authored bridge that names the earlier artifact, the limitation or new question that makes the destination necessary, and the mechanism being added. The renderer and reader dossier share a four-way relationship classifier—direct reuse, extension, synthesis, or new chapter thread—so same-track continuations no longer claim to “begin” the track and conceptually distinct chapters no longer claim direct reuse.

A subsequent blind review of all 138 current handoffs passed 135 and found three additional gaps that the initial audit had classified as passing: autoregressive generators to latent-variable models, normalizing flows to energy-based models, and inverse-problem editing to compositional control. Each now explicitly carries the preceding scoring, sampling, or constraint artifact into the new mechanism. A fresh blind regrade passed all three repairs, closing the continuity gate at **138 pass, 0 partial, and 0 fail**. The maintained implementation therefore contains **51 authored bridges**: the original 48 repairs plus these three independent-review remediations.

World Models now exposes its five advanced specializations from the shared operations entry. The research capstone is excluded from the peer branch list and rendered as a separate final synthesis after one chosen branch. The canonical audit remains above as dated before-state evidence; the maintained test requires all **48 repaired** destinations to carry substantial non-generic bridge text and the relationship recorded by the repair.

## Released research-course manifests

### Generative Models — 30 lessons

Six territories of five lessons: Probability to Generation; Autoregressive & Latent Models; Flows & Energy Models; Score & Diffusion Models; Conditional Generation; Generative Research. Each territory ends with a build or audit. The implementation ladder is categorical sampler → autoregressive generator → VAE → flow → EBM sampler → diffusion model → conditional generator. The final project reproduces a baseline and compares model families under matched data, parameter, update, seed and evaluation budgets.

### Reinforcement Learning & Control — 32 lessons

Seven territories with counts `[5, 5, 5, 4, 5, 4, 4]`: Sequential Decisions; Values & TD; Deep Value Learning; Policy Gradients; Planning & Model-Based RL; Imitation & Offline RL; Reliable RL Research. The implementation ladder is finite MDP solver → TD/Q agent → DQN → policy gradient → actor-critic → model-based agent → offline/sequence policy. The final project reports raw seed-level evidence and one controlled intervention after reproducing a pinned baseline.

### Embodied AI — 30 lessons

Six territories of five lessons: Embodied Problems; Perception & State; Demonstrations & Data; Language-Conditioned Policies; Planning, Control & Transfer; Embodied Evaluation & Research. The implementation ladder is task contract → frame transform → state estimator → trajectory dataset → behavior-cloning policy → language-conditioned transformer/diffusion policy → closed-loop simulator with recovery. Simulation is authentic execution for the declared simulator; real hardware remains optional and separately evidenced.

The exact title, stable ID, track, reused lessons, build increment, next use and capstone flag for all 92 added lessons is recorded in the internally named `plannedCourseManifests` registry and the generated released-course inventory.

## GPU experiment evidence contract

Every external run must declare:

1. experiment/course/lesson IDs and observable learner outcome;
2. repository, dependency, model, dataset and environment revisions;
3. Colab plus service-neutral/local instructions where practical;
4. minimum/reference hardware, memory, storage, download, runtime and potential cost;
5. seed policy and known nondeterminism;
6. bounded smoke and full-run commands with stop criteria;
7. invariant checks that should always hold;
8. provenance-backed reviewed observations or qualitative expectations when no reviewed numeric run exists;
9. diagnostic feedback and a retry route;
10. a versioned machine-readable artifact and claim boundary.

Expected invariants and variable reference observations must render as separate categories. A numeric band cannot enter the course until a reviewed raw artifact supports it.

## Release discipline

- New manifests may exist in source before release, but the course selector lists only complete registered `CourseDefinition` values.
- Each new course is implemented territory by territory and released only after its whole teaching, assessment, artifact, accessibility, performance and static-export contract passes.
- Existing IDs and progress keys remain stable. New courses receive isolated progress keys through the existing per-course storage pattern.
- Counts remain exact per released course. Tests must be deliberately updated rather than weakened into “at least” assertions.
- Every visual must define its learning question, changed variable, observable state, causal explanation, completion condition and evidence boundary before motion is selected.

## Decisions that remain intentionally open

- Colab is the default documentation target, but exact GPU SKUs and maximum run budgets are pinned per experiment when reference runs exist.
- Embodied AI is simulation-first; physical hardware integrations can be added as optional extensions after a supported platform is selected.
- Small images and inspectable trajectories are the first authentic generative/embodied datasets. Audio, 3D and scientific modalities remain later branches.
- The current lesson counts are released and persistence-sensitive. Future draft lessons may be merged before their IDs become learner-visible when prose and interaction would otherwise duplicate one another.
