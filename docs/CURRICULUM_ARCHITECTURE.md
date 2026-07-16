# Neural Field Guide curriculum architecture

Reviewed: 2026-07-15

## Decision

Neural Field Guide is a five-course personal research program whose primary outcome is building working systems from understandable primitives and whose secondary outcome is conducting controlled original experiments.

The visible recommended sequence is:

1. Large Language Models
2. World Models
3. Generative Models
4. Reinforcement Learning & Control
5. Embodied AI

This list is guidance, not an invented total order. LLMs and World Models are parallel applications after shared numerical foundations. Generative Models bridges explicit density, latent inference, energy, flow and diffusion families. RL depends on numerical foundations plus state, MDP and optimization concepts; completing every generative topic is recommended but not required for tabular RL. Embodied AI is the cumulative synthesis and names its concept-level prerequisites explicitly.

The exact released lesson inventory lives in `docs/CURRICULUM_INVENTORY.md`. The machine-readable ownership graph lives in `app/curriculum-graph.ts`; the reviewed manifests that back the three added courses live in `app/research-curriculum-manifests.ts`.

## Canonical concept ownership

| Shared concept | Canonical teaching location | Reinforcement and next use | Ownership boundary |
|---|---|---|---|
| Tensors, shapes and linear transforms | `llm:tensors-shapes` | dynamics tensors, change of variables, coordinate frames, policy networks | Later courses name domain axes and units; they do not repeat generic tensor algebra. |
| Probability, likelihood and predictive loss | `llm:probability-softmax` | next-token loss, generative likelihood, world-model targets, policy gradients | RL likelihood-ratio gradients and generative objective families are not presented as ordinary supervised cross-entropy. |
| Gradients and optimization | `llm:gradients-backprop`, then `llm:optimizers` | world-model learning, VAEs, DQN, actor-critic, behavior cloning | Later courses own estimator and target stability; the shared foundation owns differentiation and update mechanics. |
| Autoregressive factorization | `llm:introduction` | tiny GPT, non-text generators, sequence policies, action transformers | Causal factorization transfers; tokenizer, objective, variable and evaluation contracts do not automatically transfer. |
| Learned representations | `llm:embedding-layer` | sensor encoding, latent state, multimodal policies | Token lookup, sensor encoders and latent state have different interfaces and information-loss boundaries. |
| Attention and causal sequence computation | `llm:attention` | GPT, autoregressive generation, sequence policies, action transformers | Attention routes information; it does not define the task objective, policy or causal explanation. |
| Latent priors and posteriors | `worldmodel:stochastic-latents-vaes` | prior/posterior dynamics, ELBO, VAE diagnosis, filtering | World Models introduces latent state for dynamics; Generative Models owns complete variational inference and posterior-collapse treatment. |
| State, transition and observation | `worldmodel:sequential-state` | action-conditioned dynamics, RL loop, embodied observations/actions | World Models owns predictive state; RL adds preferences over consequences; Embodied AI binds state to timed sensors and actuators. |
| Belief-state estimation | `worldmodel:belief-states-filtering` | recurrent states, POMDP policies, sensor fusion | A belief is evidence-conditioned state, not proof that hidden reality is identifiable. |
| Density modeling and sampling | `generative:generation-as-distribution` | flows, EBMs, diffusion, policy/action sampling | Plausible samples do not by themselves establish calibration, controllability or decision usefulness. |
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
| `llm:introduction`, `learning-to-predict`, `gpt2-from-scratch` | Autoregressive modeling is transferred beyond language through a bounded causal trace. | Guide, capstone evidence, artifact schema, sources when claims change. |
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
