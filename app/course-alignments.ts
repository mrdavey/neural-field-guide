export type AlignedCourseId = "llm" | "worldmodel";
export type CourseAlignment = {
  courseId: AlignedCourseId;
  lessonId: string;
  concept: string;
  role: "canonical" | "reinforcement";
  reuses: string;
  boundary: string;
  destination: { courseId: "generative" | "rl" | "embodied"; courseTitle: string; lessonId: string; lessonTitle: string };
  artifact: string;
  prediction: { prompt: string; expected: string; retry: string };
};

const llm = (lessonId: string, value: Omit<CourseAlignment, "courseId" | "lessonId">): CourseAlignment => ({ courseId: "llm", lessonId, ...value });
const wm = (lessonId: string, value: Omit<CourseAlignment, "courseId" | "lessonId">): CourseAlignment => ({ courseId: "worldmodel", lessonId, ...value });

export const courseAlignments: CourseAlignment[] = [
  llm("tensors-shapes", {
    concept: "Tensors, shapes, and coordinate contracts", role: "canonical",
    reuses: "Named axes, compatible dimensions, and explicit input/output shapes remain the first correctness check in every later model and controller.",
    boundary: "A shape-correct computation can still use the wrong coordinate frame, timestamp, probability model, or physical unit; Embodied AI must add those contracts explicitly.",
    destination: { courseId: "embodied", courseTitle: "Embodied AI", lessonId: "coordinate-frames-time", lessonTitle: "Coordinate Frames, Time & Synchronization" },
    artifact: "A tensor-interface card naming every axis, unit, coordinate frame, timestamp convention, and valid range.",
    prediction: { prompt: "A camera point and robot point both have shape [3]. What extra facts must match before subtracting them is meaningful?", expected: "The vectors need compatible coordinate frames, units, and timestamps. Matching shape only establishes that subtraction is numerically defined, not that it represents physical displacement.", retry: "Write the two [3] vectors with frame and time subscripts, then list what a frame transform and synchronization step must establish." },
  }),
  llm("probability-softmax", {
    concept: "Normalized probability distributions", role: "canonical",
    reuses: "Logits, normalization, log-probabilities, and cross-entropy become the common ledger for categorical generative models and stochastic policies.",
    boundary: "Softmax represents a finite categorical distribution. Continuous densities, unnormalized energies, diffusion scores, and trajectory distributions require different machinery.",
    destination: { courseId: "generative", courseTitle: "Generative Models", lessonId: "generation-as-distribution", lessonTitle: "Generation as Distribution Modeling" },
    artifact: "A logits-to-probabilities trace whose probabilities sum to one and whose seeded sample frequencies can be checked.",
    prediction: { prompt: "If every logit increases by 100, should categorical probabilities change? Name a later model family where that invariance is insufficient.", expected: "The probabilities do not change because softmax is shift-invariant. That does not solve normalization for an energy model over a large or continuous space.", retry: "Subtract the largest logit, compare the same ratios, then contrast a finite normalization sum with a continuous integral." },
  }),
  llm("gradients-backprop", {
    concept: "Gradient-based learning", role: "canonical",
    reuses: "Forward values, local derivatives, reverse accumulation, and updates power generative objectives, value functions, policies, and perception-action networks.",
    boundary: "A gradient is local sensitivity of the declared objective. It does not prove the objective represents sample quality, long-horizon reward, safety, or physical success.",
    destination: { courseId: "generative", courseTitle: "Generative Models", lessonId: "score-matching", lessonTitle: "Scores & Denoising Score Matching" },
    artifact: "A forward/backward ledger naming the scalar objective, intermediates, gradient shapes, and a finite-difference check.",
    prediction: { prompt: "Training loss falls while generated samples become less diverse. Is backpropagation broken, or is another diagnosis more likely?", expected: "Backpropagation may be working exactly as specified. The objective, data, weighting, or model family may fail to preserve the desired diversity construct.", retry: "Separate 'is the gradient correct?' from 'is the objective sufficient?' and name one independent check for each question." },
  }),
  llm("learning-to-predict", {
    concept: "Autoregressive factorization", role: "canonical",
    reuses: "Factoring a joint distribution into ordered conditional predictions transfers from tokens to pixels, actions, and other discrete sequences.",
    boundary: "Ordering is a modeling choice that can create slow sequential sampling and order-dependent bias; it is not latent-variable or diffusion generation.",
    destination: { courseId: "generative", courseTitle: "Generative Models", lessonId: "autoregressive-generators", lessonTitle: "Autoregressive Generators Beyond Text" },
    artifact: "A serialization map plus shifted input/target tensors and a per-position negative-log-likelihood trace.",
    prediction: { prompt: "For a 2×2 binary image serialized row-first, which pixels may the third prediction condition on, and what changes column-first?", expected: "It may condition only on the first two serialized positions. Column-first changes which physical pixels those positions denote while preserving the causal rule.", retry: "Number all four cells under both orders and draw arrows only from earlier positions into the third position." },
  }),
  llm("rl-fundamentals", {
    concept: "Policy gradients and credit assignment", role: "reinforcement",
    reuses: "The log-probability-times-advantage idea bridges LLM post-training to systematic derivation and diagnosis of policy-gradient estimators.",
    boundary: "This lesson uses a specialized response setting. The RL course owns trajectories, returns, estimator variance, baselines, actor-critic coupling, and environment evaluation.",
    destination: { courseId: "rl", courseTitle: "Reinforcement Learning & Control", lessonId: "policy-gradients", lessonTitle: "Policy Gradients" },
    artifact: "A trajectory ledger with state, action, log-probability, reward, return, baseline, advantage, and update contribution.",
    prediction: { prompt: "Two actions earn the same return, but one had a higher baseline. Which receives the larger positive policy update, and why?", expected: "The action with the lower baseline has the larger positive advantage, so its log-probability receives a larger reinforcing contribution.", retry: "Compute advantage as return minus baseline for both actions before deciding the sign and relative size of each update." },
  }),
  llm("agent-loops", {
    concept: "Guarded sequential execution", role: "canonical",
    reuses: "Explicit state, legal transitions, receipts, retry limits, and stopping conditions transfer to hierarchical skills and long-horizon embodied tasks.",
    boundary: "A software state machine does not model sensor uncertainty, physical dynamics, control rate, actuator limits, or safe recovery from motion.",
    destination: { courseId: "embodied", courseTitle: "Embodied AI", lessonId: "hierarchical-skills", lessonTitle: "Hierarchical Skills & Long Horizons" },
    artifact: "A transition trace containing preconditions, authority, action, observation, receipt, retry count, termination, and recovery route.",
    prediction: { prompt: "A planner says a grasp is complete, but the force sensor disagrees. Which observation should advance the state machine?", expected: "The declared sensor-based completion condition must control the transition. A proposal is not evidence that the physical transition occurred.", retry: "Separate proposed next state from observed completion evidence, then identify which input the transition guard consumes." },
  }),
  llm("multimodal-models", {
    concept: "Multimodal representation and grounding", role: "canonical",
    reuses: "Modality encoders, token/state interfaces, alignment objectives, and changed-context checks become inputs to language-conditioned embodied policies.",
    boundary: "Aligned image and text representations do not establish physical grounding, calibrated state estimation, action competence, or closed-loop safety.",
    destination: { courseId: "embodied", courseTitle: "Embodied AI", lessonId: "language-grounding", lessonTitle: "Language Grounding" },
    artifact: "A modality-interface map with counterexamples where linguistic similarity and task-relevant physical state disagree.",
    prediction: { prompt: "A model matches 'red cup' to the correct image crop. What additional evidence is needed before safely picking it up?", expected: "It needs spatial calibration, current state and uncertainty, an action policy, feedback, success/failure criteria, and safety constraints.", retry: "Trace the missing steps from crop coordinates to robot coordinates to action to observed outcome, naming one failure at each step." },
  }),
  llm("infrastructure", {
    concept: "Reproducible compute and systems evidence", role: "canonical",
    reuses: "Pinned code, dependencies, hardware, precision, seeds, budgets, checkpoints, and raw measurements form the contract for optional GPU experiments.",
    boundary: "A successful smoke run establishes integration only. Its timing and quality cannot be generalized to another accelerator, workload, revision, or full budget.",
    destination: { courseId: "generative", courseTitle: "Generative Models", lessonId: "reproducible-gpu-experiments", lessonTitle: "Reproducible GPU Experiments" },
    artifact: "A machine-readable run manifest joined to raw logs, checkpoints, environment details, expected invariants, and a bounded conclusion.",
    prediction: { prompt: "A Colab smoke run completes 20 steps and produces a sample. Which claim is supported, and which tempting claim is not?", expected: "It supports integration of the pinned environment and short execution path. It does not support convergence, quality, throughput, or cross-seed reproducibility.", retry: "Write one sentence beginning 'This run establishes' and one beginning 'This run cannot establish,' both tied to the exact budget." },
  }),
  llm("evaluation-design", {
    concept: "Evaluation validity and uncertainty", role: "canonical",
    reuses: "A construct, sampling design, raw cases, uncertainty, slices, confounds, and claim boundary become the evaluation spine for later courses.",
    boundary: "No single likelihood, sample-quality, return, or task-success metric is universal; each measures a declared construct under a protocol.",
    destination: { courseId: "generative", courseTitle: "Generative Models", lessonId: "matched-budget-evaluation", lessonTitle: "Matched-Budget Generative Evaluation" },
    artifact: "An evaluation card naming construct, units, cases, exclusions, aggregation, uncertainty, failure slices, confounds, and decision rule.",
    prediction: { prompt: "Model A has better likelihood while Model B receives better human sample ratings. Is one result necessarily wrong?", expected: "No. They can measure different constructs. Match budgets, inspect uncertainty and failures, and avoid an unsupported universal rank.", retry: "Name the construct each metric measures, then ask whether either construct alone answers the intended deployment decision." },
  }),
  llm("tools-safety", {
    concept: "Safety, authority, and intervention", role: "canonical",
    reuses: "Model proposals, runtime permissions, constraints, monitoring, intervention, fallback, and residual risk remain separate controls in learned controllers.",
    boundary: "Training safe-looking behavior does not grant execution authority. Physical systems also need timing, actuator, workspace, and human-intervention contracts.",
    destination: { courseId: "rl", courseTitle: "Reinforcement Learning & Control", lessonId: "safe-constrained-rl", lessonTitle: "Constraints, Intervention & Safe RL" },
    artifact: "An authority ledger showing proposal, authenticated permission, constraint check, execution or block, fallback, intervention, and residual risk.",
    prediction: { prompt: "A policy gives 0.99 probability to an action its runtime permission does not allow. What happens, and what is logged?", expected: "The action is blocked regardless of confidence. Log the proposal, permission source, failed check, non-execution, fallback, and residual risk.", retry: "Treat probability as model output and permission as external authority; identify which one can authorize the side effect." },
  }),
  wm("sequential-state", {
    concept: "Sequential state and partial observation", role: "canonical",
    reuses: "Observation, hidden state, action, transition, and belief provide the vocabulary needed to define decision processes and embodied estimators.",
    boundary: "A compact state is useful only relative to a task; it need not be uniquely identifiable, physically complete, or safe for a different policy.",
    destination: { courseId: "rl", courseTitle: "Reinforcement Learning & Control", lessonId: "sequential-decision-systems", lessonTitle: "Agents, Environments & Returns" },
    artifact: "A time-indexed trace of observation, internal state or belief, action, next observation, termination, and Markov assumptions.",
    prediction: { prompt: "Two identical observations follow different action histories. When may a memoryless controller choose the wrong action?", expected: "It fails when the observation aliases hidden states with different best actions; history, recurrence, or a belief is then required.", retry: "Construct two histories ending at the same observation but different hidden states, then assign a different best action to each." },
  }),
  wm("stochastic-latents-vaes", {
    concept: "Latent-variable inference", role: "canonical",
    reuses: "Prior, likelihood, posterior, latent sample, reconstruction, and KL terms start the Generative Models treatment of amortized inference and VAEs.",
    boundary: "This course uses latents for predictive state. Generative Models owns density estimation, ELBO derivation, collapse, sample quality, and family comparisons.",
    destination: { courseId: "generative", courseTitle: "Generative Models", lessonId: "amortized-inference-elbo", lessonTitle: "Amortized Inference & the ELBO" },
    artifact: "A prior/posterior parameter trace with sampled latent, reconstruction term, KL term, and the evidence each term consumes.",
    prediction: { prompt: "If reconstruction is good while the posterior matches the prior for every input, what useful role might the latent have lost?", expected: "The latent may carry little input-specific information: posterior collapse. A powerful decoder can model data while ignoring the latent.", retry: "Compare posterior parameters across inputs; if they do not change, ask how the decoder can predict from its own context." },
  }),
  wm("latent-prior-posterior", {
    concept: "Prior versus posterior state inference", role: "reinforcement",
    reuses: "Evidence-conditioned training posteriors and prior-only prediction create a mismatch that later latent generators and model-based agents must diagnose.",
    boundary: "A small KL does not mean useful latents, accurate futures, or calibrated uncertainty; it can instead reflect posterior collapse.",
    destination: { courseId: "generative", courseTitle: "Generative Models", lessonId: "vae-posterior-collapse", lessonTitle: "VAEs & Posterior Collapse" },
    artifact: "A per-example reconstruction/KL ledger with latent-use probes and prior-only versus posterior-conditioned behavior.",
    prediction: { prompt: "ELBO improves as KL falls near zero, but changing the latent no longer changes reconstruction. Improvement or warning?", expected: "It is a warning: the aggregate improves while the intervention indicates collapse and failure of the intended latent mechanism.", retry: "Inspect reconstruction and KL separately, then change z while holding decoder context fixed before interpreting the scalar total." },
  }),
  wm("mdps-bellman", {
    concept: "MDPs, values, and Bellman backups", role: "canonical",
    reuses: "States, actions, transitions, rewards, discounting, policies, and recursive backups are the formal entry point to systematic reinforcement learning.",
    boundary: "World Models owns learned dynamics for prediction and planning. RL owns the progression from dynamic programming to sampled and approximate control.",
    destination: { courseId: "rl", courseTitle: "Reinforcement Learning & Control", lessonId: "dynamic-programming", lessonTitle: "Dynamic Programming" },
    artifact: "A finite MDP table with transition probabilities, rewards, discount, policy, one Bellman target, and updated value.",
    prediction: { prompt: "A transition has reward 2, discount 0.9, and next-state value 5. What target is backed up, and under what assumption?", expected: "The target is 2 + 0.9×5 = 6.5, assuming transition, reward, and next value match the applied policy or optimality operator.", retry: "Write immediate reward plus discounted continuation, then label whether continuation follows a fixed policy or maximizing action." },
  }),
  wm("actor-critic-lambda", {
    concept: "Actor-critic and multi-step credit", role: "reinforcement",
    reuses: "Actors, critics, bootstrapped returns, continuation, and λ targets become inputs to the RL course's bias-variance analysis.",
    boundary: "Here actor-critic operates in imagined learning. RL owns derivation, sampling assumptions, advantage estimation, and estimator comparisons.",
    destination: { courseId: "rl", courseTitle: "Reinforcement Learning & Control", lessonId: "baselines-advantages", lessonTitle: "Baselines, Advantages & GAE" },
    artifact: "A timestep ledger of reward, continuation, value, bootstrap, λ-return, advantage, actor contribution, and critic target.",
    prediction: { prompt: "As λ moves from 0 toward 1, which influence usually grows: critic bootstrap or longer sampled rewards?", expected: "Longer sampled rewards gain influence, usually reducing bootstrap bias while increasing variance; λ near zero relies more on the critic.", retry: "Compare endpoints first: λ=0 is a short bootstrapped target and λ=1 approaches a full sampled return." },
  }),
  wm("model-predictive-control", {
    concept: "Receding-horizon planning and feedback", role: "canonical",
    reuses: "Predict consequences, choose a sequence, execute one action, observe again, and replan: the bridge into RL and robotics control.",
    boundary: "MPC is not a learned policy, and a model-optimal plan is not necessarily safe; model error, deadlines, and constraints remain explicit.",
    destination: { courseId: "rl", courseTitle: "Reinforcement Learning & Control", lessonId: "shooting-mpc", lessonTitle: "Shooting, CEM & Model Predictive Control" },
    artifact: "A candidate-plan ledger with predicted costs, selected sequence, executed first action, observation, model residual, and replan.",
    prediction: { prompt: "Why execute only the first action of a ten-step model-optimal plan instead of committing to all ten?", expected: "One action lets the controller incorporate the next observation, correct model error or disturbance, and replan with feedback.", retry: "Compare execute-all with execute-one-then-observe loops and mark where fresh evidence enters each loop." },
  }),
  wm("autoregressive-diffusion-dynamics", {
    concept: "Diffusion across different modeled variables", role: "reinforcement",
    reuses: "Forward corruption, conditional denoising, schedules, and reverse steps connect learned dynamics to the Generative Models diffusion ladder.",
    boundary: "Observation generation, latent dynamics, and action diffusion share math while modeling different variables, conditions, horizons, and evaluation constructs.",
    destination: { courseId: "generative", courseTitle: "Generative Models", lessonId: "corruption-denoising", lessonTitle: "Corruption & Denoising" },
    artifact: "A forward-noise and reverse-denoise trajectory recording variable, conditioning, schedule, seed, and per-step target.",
    prediction: { prompt: "A video model and action policy both denoise Gaussian noise. What must be named before calling them the same system?", expected: "Name the denoised variable, conditioning, horizon, training target, sampler, and evaluation; shared equations do not make outputs interchangeable.", retry: "Create video and action columns and fill in input, condition, output, and failure consequence for each." },
  }),
  wm("goal-conditioned-robotics", {
    concept: "Goals, dynamics, and embodied task contracts", role: "reinforcement",
    reuses: "Goal representation, action-conditioned prediction, planning, observation feedback, and success criteria become the Embodied AI boundary.",
    boundary: "Simulation success does not establish real-robot competence; sensing, actuation, timing, calibration, recovery, and human authority must be tested.",
    destination: { courseId: "embodied", courseTitle: "Embodied AI", lessonId: "embodied-task-contracts", lessonTitle: "Embodiment, Tasks & Success" },
    artifact: "A task contract naming body, observations, actions, goal, success, failure, horizon, constraints, reset, and evidence boundary.",
    prediction: { prompt: "A simulated agent reaches its goal in 95% of episodes. Which missing details prevent a real-robot success claim?", expected: "Missing matched sensors and actuators, calibration, timing, reset and failure handling, physical constraints, shift tests, and hardware evidence.", retry: "List each simulator-to-physical interface and one plausible mismatch for every sensor, action, timing, and reset boundary." },
  }),
  wm("system-identification-sim-to-real", {
    concept: "System identification and sim-to-real", role: "canonical",
    reuses: "Calibrate simulator parameters from trajectories, inspect residuals, test held-out conditions, and separate simulation from hardware claims.",
    boundary: "Low calibration residual does not identify every parameter or guarantee robustness outside the excited state-action region.",
    destination: { courseId: "embodied", courseTitle: "Embodied AI", lessonId: "sim-to-real-identification", lessonTitle: "System Identification & Sim-to-Real" },
    artifact: "A parameter provenance table, calibration trajectories, residuals, held-out shift tests, identifiability notes, and deployment boundary.",
    prediction: { prompt: "Two parameter settings fit the calibration trajectory equally well. What may be missing before choosing one for transfer?", expected: "The data may not excite dynamics that distinguish them. Collect a safe intervention where the settings predict different outcomes.", retry: "Find a state-action region where the fitted simulators diverge, then design one bounded measurement that reaches it." },
  }),
  wm("safe-constrained-planning", {
    concept: "Constraints, fallback, and intervention", role: "reinforcement",
    reuses: "Separating reward, chance constraints, authority, fallback, monitoring, and residual risk transfers to safe RL and recovery.",
    boundary: "A model-estimated violation chance is useful only when calibrated in-domain; simulated constraint satisfaction is not a safety certificate.",
    destination: { courseId: "embodied", courseTitle: "Embodied AI", lessonId: "recovery-intervention-capstone", lessonTitle: "Recovery, Intervention & Human Control" },
    artifact: "A constraint ledger with estimator provenance, threshold, proposal, allow/block decision, fallback, authority, outcome, and residual risk.",
    prediction: { prompt: "Expected reward rises, but estimated violation chance crosses its allowed threshold. Which branch executes?", expected: "Reject the nominal plan and execute the declared fallback or intervention; reward cannot compensate for a hard constraint.", retry: "Write reward and constraint as separate gates; combine them only if the authority contract says they are compensable." },
  }),
  wm("language-multimodal-world-models", {
    concept: "Language-conditioned predictive state", role: "reinforcement",
    reuses: "Language, perception, latent state, action, and consequence interfaces prepare the contract for multimodal embodied policies.",
    boundary: "Language-conditioned prediction can correlate words with futures without grounding referents, physical affordances, or safe actions.",
    destination: { courseId: "embodied", courseTitle: "Embodied AI", lessonId: "multimodal-policy-encoders", lessonTitle: "Multimodal Policy Encoders" },
    artifact: "A language/vision/state/action interface map with alignment checks, counterfactual instructions, and changed-layout failures.",
    prediction: { prompt: "A model predicts plausible video after 'put the cup left of the plate.' What tests usable grounding?", expected: "Change objects, layout, viewpoint, or wording while preserving the relation, then check geometric and closed-loop outcomes.", retry: "Hold 'left of' fixed while changing surface cues, and specify an observable geometric success check." },
  }),
];

export const courseAlignmentByLesson = Object.fromEntries(courseAlignments.map((item) => [`${item.courseId}:${item.lessonId}`, item])) as Record<string, CourseAlignment>;
