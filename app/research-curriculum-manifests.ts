export type PlannedCourseId = "generative" | "rl" | "embodied";

export type PlannedTrack = {
  id: string;
  title: string;
  short: string;
  outcome: string;
  color: string;
};

export type PlannedLesson = {
  id: string;
  number: number;
  track: string;
  title: string;
  build: string;
  reuses: string[];
  nextUse: string;
  capstone?: true;
};

export type PlannedCourseManifest = {
  id: PlannedCourseId;
  title: string;
  selectorLabel: string;
  outcome: string;
  recommendedAfter: string[];
  tracks: PlannedTrack[];
  lessons: PlannedLesson[];
};

const lessons = (track: string, start: number, entries: Array<[string, string, string, string[], string, boolean?]>): PlannedLesson[] =>
  entries.map(([id, title, build, reuses, nextUse, capstone], index) => ({ id, title, build, reuses, nextUse, number: start + index, track, ...(capstone ? { capstone: true as const } : {}) }));

const generativeTracks: PlannedTrack[] = [
  { id: "gen-foundations", title: "Probability to Generation", short: "Model a distribution", outcome: "Build and evaluate an inspectable distribution workbench.", color: "#ff8a5b" },
  { id: "gen-latents", title: "Autoregressive & Latent Models", short: "Infer hidden causes", outcome: "Build and diagnose autoregressive and variational generators.", color: "#f5b942" },
  { id: "gen-energy", title: "Flows & Energy Models", short: "Transform and sample", outcome: "Implement exact-density transforms and energy-based sampling.", color: "#67c7b8" },
  { id: "gen-diffusion", title: "Score & Diffusion Models", short: "Denoise into samples", outcome: "Build a diffusion model and trace its complete sampling path.", color: "#64a8ff" },
  { id: "gen-conditional", title: "Conditional Generation", short: "Steer the process", outcome: "Control generation while measuring fidelity, diversity, and failure.", color: "#a88bfa" },
  { id: "gen-research", title: "Generative Research", short: "Compare with evidence", outcome: "Run a matched-budget, reproducible model-family study.", color: "#f277a6" },
];

const generativeLessons: PlannedLesson[] = [
  ...lessons("gen-foundations", 1, [
    ["generation-as-distribution", "What Is a Generative Model?", "Input-to-variation story with visible choices", [], "sampling-randomness"],
    ["sampling-randomness", "Sampling, Seeds & Random Variables", "Inverse-CDF and ancestral samplers", ["worldmodel:stochastic-futures"], "likelihood-cross-entropy"],
    ["likelihood-cross-entropy", "Likelihood as Feedback for a Generator", "Sequence log-likelihood ledger", ["sampling-randomness", "llm:learning-to-predict"], "divergences-distance"],
    ["divergences-distance", "How Two Distributions Differ", "Two-distribution divergence explorer", ["likelihood-cross-entropy", "worldmodel:stochastic-latents-vaes"], "distribution-workbench-capstone"],
    ["distribution-workbench-capstone", "Build a Distribution Workbench", "Tested sampler/evaluator package", ["generation-as-distribution", "likelihood-cross-entropy", "sampling-randomness", "divergences-distance"], "autoregressive-generators", true],
  ]),
  ...lessons("gen-latents", 6, [
    ["autoregressive-generators", "Autoregressive Generators Beyond Text", "Masked categorical image generator", ["llm:learning-to-predict", "llm:gpt2-from-scratch"], "latent-variable-models"],
    ["latent-variable-models", "Latent-Variable Models", "Observed/latent joint-probability tracer", ["worldmodel:sequential-state"], "amortized-inference-elbo"],
    ["amortized-inference-elbo", "Amortized Inference & the ELBO", "ELBO term-by-term calculator", ["worldmodel:stochastic-latents-vaes"], "vae-posterior-collapse"],
    ["vae-posterior-collapse", "VAEs & Posterior Collapse", "Minimal VAE with KL/reconstruction probes", ["llm:gradients-backprop", "worldmodel:latent-prior-posterior"], "latent-models-capstone"],
    ["latent-models-capstone", "Build and Diagnose a VAE", "VAE/VQ-style latent comparison dossier", ["amortized-inference-elbo", "vae-posterior-collapse"], "change-of-variables", true],
  ]),
  ...lessons("gen-energy", 11, [
    ["change-of-variables", "Change of Variables", "Jacobian determinant workbench", ["llm:tensors-shapes", "generative:divergences-distance"], "normalizing-flows"],
    ["normalizing-flows", "Normalizing Flows", "Invertible coupling flow on 2D data", ["change-of-variables"], "energy-based-models"],
    ["energy-based-models", "Energy-Based Models", "Energy landscape and unnormalized density", ["generative:likelihood-cross-entropy"], "mcmc-langevin-sampling"],
    ["mcmc-langevin-sampling", "MCMC & Langevin Sampling", "Markov-chain mixing diagnostic", ["generative:sampling-randomness", "energy-based-models"], "flow-energy-capstone"],
    ["flow-energy-capstone", "Flows vs Energies: Sampling Lab", "Matched-target flow/EBM comparison", ["normalizing-flows", "mcmc-langevin-sampling"], "corruption-denoising", true],
  ]),
  ...lessons("gen-diffusion", 16, [
    ["corruption-denoising", "Corruption & Denoising", "Forward noising chain with signal-to-noise trace", ["worldmodel:stochastic-futures"], "score-matching"],
    ["score-matching", "Scores & Denoising Score Matching", "Analytic score-field estimator", ["llm:gradients-backprop", "corruption-denoising"], "ddpm-objective"],
    ["ddpm-objective", "The DDPM Training Objective", "Noise-prediction loss with timestep conditioning", ["score-matching", "llm:learning-to-predict"], "diffusion-samplers-schedules"],
    ["diffusion-samplers-schedules", "Diffusion Samplers & Schedules", "DDPM/DDIM-style step comparison", ["ddpm-objective"], "diffusion-model-capstone"],
    ["diffusion-model-capstone", "Build a Diffusion Model", "Small image diffusion model with sampling trace", ["corruption-denoising", "diffusion-samplers-schedules"], "conditional-generation", true],
  ]),
  ...lessons("gen-conditional", 21, [
    ["conditional-generation", "Conditional Generation", "Label-conditional generator", ["llm:multimodal-models", "generative:diffusion-model-capstone"], "classifier-free-guidance"],
    ["classifier-free-guidance", "Classifier-Free Guidance", "Conditional/unconditional score mixer", ["conditional-generation"], "inverse-problems-editing"],
    ["inverse-problems-editing", "Inverse Problems & Editing", "Masked reconstruction loop", ["worldmodel:reconstruction-feature-prediction", "classifier-free-guidance"], "compositional-control"],
    ["compositional-control", "Composition, Control & Trade-offs", "Constraint composition matrix", ["conditional-generation", "generative:distribution-workbench-capstone"], "conditional-safety-capstone"],
    ["conditional-safety-capstone", "Conditional Generation Safety Audit", "Fidelity/diversity/memorization audit", ["inverse-problems-editing", "compositional-control"], "generative-data-systems", true],
  ]),
  ...lessons("gen-research", 26, [
    ["generative-data-systems", "Data & Systems for Generative Models", "Throughput/memory/data provenance ledger", ["llm:data-engineering", "llm:infrastructure"], "memorization-privacy"],
    ["memorization-privacy", "Memorization, Privacy & Misuse", "Nearest-neighbor and canary audit", ["llm:security-privacy", "conditional-safety-capstone"], "matched-budget-evaluation"],
    ["matched-budget-evaluation", "Matched-Budget Generative Evaluation", "Likelihood/sample/coverage evaluation matrix", ["llm:evaluation-design", "worldmodel:world-model-evaluation"], "reproducible-gpu-experiments"],
    ["reproducible-gpu-experiments", "Reproducible GPU Experiments", "Portable smoke/full run and evidence artifact", ["llm:observability-governance", "matched-budget-evaluation"], "generative-research-capstone"],
    ["generative-research-capstone", "Matched-Family Research Study", "Reproduced baseline plus controlled original ablation", ["reproducible-gpu-experiments", "matched-budget-evaluation"], "rl:sequential-decision-systems", true],
  ]),
];

const rlTracks: PlannedTrack[] = [
  { id: "rl-foundations", title: "Sequential Decisions", short: "Define the loop", outcome: "Specify and solve a small decision process.", color: "#ff8a5b" },
  { id: "rl-value", title: "Values & Temporal Difference", short: "Back up outcomes", outcome: "Implement Monte Carlo, TD, SARSA, and Q-learning.", color: "#f5b942" },
  { id: "rl-deep-value", title: "Deep Value Learning", short: "Stabilize approximation", outcome: "Build and diagnose a DQN-style agent.", color: "#67c7b8" },
  { id: "rl-policy", title: "Policy Gradients", short: "Differentiate behavior", outcome: "Build policy-gradient and actor-critic agents.", color: "#64a8ff" },
  { id: "rl-model-based", title: "Planning & Model-Based RL", short: "Learn then imagine", outcome: "Combine learned dynamics, search, and policy learning.", color: "#a88bfa" },
  { id: "rl-offline", title: "Imitation & Offline RL", short: "Learn from logged behavior", outcome: "Diagnose coverage and build an offline policy pipeline.", color: "#f277a6" },
  { id: "rl-research", title: "Reliable RL Research", short: "Measure policies honestly", outcome: "Reproduce a baseline and run a seed-level intervention study.", color: "#e66f61" },
];

const rlLessons: PlannedLesson[] = [
  ...lessons("rl-foundations", 1, [
    ["sequential-decision-systems", "What Is Reinforcement Learning?", "Inspectable learn-from-consequences loop", [], "partial-observation"],
    ["partial-observation", "What the Agent Can and Cannot Observe", "Belief-state controller", ["worldmodel:sequential-state", "worldmodel:belief-states-filtering"], "policies-occupancy"],
    ["policies-occupancy", "Policies: How Behavior Chooses Actions", "Policy occupancy calculator", ["partial-observation", "generative:sampling-randomness"], "mdps-rewards"],
    ["mdps-rewards", "Formalizing the Decision Loop", "Finite MDP ledger", ["sequential-decision-systems", "policies-occupancy", "worldmodel:mdps-bellman"], "tabular-control-capstone"],
    ["tabular-control-capstone", "Build a Tabular Control Workbench", "Tested MDP solver and rollout evaluator", ["mdps-rewards", "policies-occupancy"], "dynamic-programming", true],
  ]),
  ...lessons("rl-value", 6, [
    ["dynamic-programming", "Dynamic Programming", "Policy/value iteration implementation", ["tabular-control-capstone", "worldmodel:mdps-bellman"], "monte-carlo-estimation"],
    ["monte-carlo-estimation", "Monte Carlo Estimation", "Episode-return estimator", ["rl:policies-occupancy"], "temporal-difference-learning"],
    ["temporal-difference-learning", "Temporal-Difference Learning", "TD(0) prediction trace", ["dynamic-programming", "monte-carlo-estimation"], "sarsa-q-learning"],
    ["sarsa-q-learning", "SARSA, Q-Learning & Off-Policy Targets", "Side-by-side control learners", ["temporal-difference-learning"], "value-methods-capstone"],
    ["value-methods-capstone", "Build a Value-Learning Agent", "Changed-environment value-method comparison", ["dynamic-programming", "sarsa-q-learning"], "function-approximation", true],
  ]),
  ...lessons("rl-deep-value", 11, [
    ["function-approximation", "Function Approximation", "Linear and neural value approximators", ["llm:gradients-backprop", "rl:value-methods-capstone"], "replay-target-networks"],
    ["replay-target-networks", "Replay Buffers & Target Networks", "Replay age and target-lag instrument", ["function-approximation", "sarsa-q-learning", "worldmodel:trajectory-data-replay"], "dqn"],
    ["dqn", "Deep Q-Networks", "Minimal DQN training loop", ["function-approximation", "replay-target-networks"], "exploration-deep-rl"],
    ["exploration-deep-rl", "Exploration in Deep RL", "Epsilon/bonus/uncertainty comparison", ["dqn", "worldmodel:uncertainty-ensembles"], "deep-value-capstone"],
    ["deep-value-capstone", "Build and Diagnose a DQN", "Pinned DQN reproduction and failure dossier", ["dqn", "exploration-deep-rl"], "policy-gradients", true],
  ]),
  ...lessons("rl-policy", 16, [
    ["policy-gradients", "Policy Gradients", "Likelihood-ratio gradient estimator", ["policies-occupancy", "monte-carlo-estimation", "llm:rl-fundamentals", "generative:likelihood-cross-entropy"], "baselines-advantages"],
    ["baselines-advantages", "Baselines, Advantages & GAE", "Variance and bias explorer", ["policy-gradients", "worldmodel:actor-critic-lambda"], "actor-critic"],
    ["actor-critic", "Actor-Critic Methods", "Shared rollout with actor and critic updates", ["baselines-advantages", "worldmodel:actor-critic-lambda"], "on-policy-capstone"],
    ["on-policy-capstone", "Build an On-Policy Agent", "Policy-gradient/actor-critic comparison", ["policy-gradients", "actor-critic"], "learned-dynamics-control", true],
  ]),
  ...lessons("rl-model-based", 20, [
    ["learned-dynamics-control", "Learned Dynamics for Control", "Action-conditioned model and rollout loss", ["worldmodel:action-conditioned-transitions", "worldmodel:prediction-targets"], "shooting-mpc"],
    ["shooting-mpc", "Shooting, CEM & Model Predictive Control", "CEM/MPC planner", ["worldmodel:shooting-cem", "worldmodel:model-predictive-control"], "dyna-imagination"],
    ["dyna-imagination", "Dyna & Imagination Learning", "Real/imagined update scheduler", ["worldmodel:imagined-rollouts", "worldmodel:dyna-tdmpc-case-study"], "model-uncertainty-exploitation"],
    ["model-uncertainty-exploitation", "Model Uncertainty & Exploitation", "Ensemble disagreement guard", ["worldmodel:compounding-error-exploitation", "worldmodel:uncertainty-ensembles"], "model-based-capstone"],
    ["model-based-capstone", "Build a Model-Based Agent", "Matched-budget planner/policy study", ["learned-dynamics-control", "model-uncertainty-exploitation"], "behavior-cloning", true],
  ]),
  ...lessons("rl-offline", 25, [
    ["behavior-cloning", "Behavior Cloning", "Supervised trajectory policy", ["llm:sft", "worldmodel:trajectory-data-replay"], "covariate-shift-dagger"],
    ["covariate-shift-dagger", "Covariate Shift & Dataset Aggregation", "Compounding-error intervention", ["worldmodel:compounding-error-exploitation", "behavior-cloning"], "offline-rl-coverage"],
    ["offline-rl-coverage", "Offline RL, Coverage & Conservatism", "Support-aware value/policy audit", ["rl:sarsa-q-learning", "worldmodel:trajectory-data-replay"], "sequence-policy-capstone"],
    ["sequence-policy-capstone", "Sequence Policies from Logged Data", "Decision-sequence policy and coverage dossier", ["llm:gpt2-from-scratch", "offline-rl-coverage"], "rl-evaluation-seeds", true],
  ]),
  ...lessons("rl-research", 29, [
    ["rl-evaluation-seeds", "RL Evaluation, Seeds & Uncertainty", "Seed-level curve and interval report", ["llm:evaluation-design", "worldmodel:world-model-evaluation"], "safe-constrained-rl"],
    ["safe-constrained-rl", "Constraints, Intervention & Safe RL", "Reward/constraint/intervention ledger", ["worldmodel:safe-constrained-planning", "llm:tools-safety"], "reproducible-rl-gpu"],
    ["reproducible-rl-gpu", "Reproducible GPU RL", "Portable smoke/full run with episode artifacts", ["generative:reproducible-gpu-experiments", "rl:rl-evaluation-seeds"], "rl-research-capstone"],
    ["rl-research-capstone", "Reproduced Baseline + Original Intervention", "Seed-level controlled RL study", ["reproducible-rl-gpu", "safe-constrained-rl"], "embodied:embodied-task-contracts", true],
  ]),
];

const embodiedTracks: PlannedTrack[] = [
  { id: "emb-foundations", title: "Embodied Problems", short: "Specify body and task", outcome: "Write a complete observation-action-task contract.", color: "#ff8a5b" },
  { id: "emb-perception", title: "Perception & State", short: "Turn sensors into state", outcome: "Build a calibrated multimodal state estimator.", color: "#f5b942" },
  { id: "emb-data", title: "Demonstrations & Data", short: "Record behavior", outcome: "Create and audit trajectory data for policy learning.", color: "#67c7b8" },
  { id: "emb-policies", title: "Language-Conditioned Policies", short: "Map intent to action", outcome: "Build transformer and diffusion-style action policies.", color: "#64a8ff" },
  { id: "emb-control", title: "Planning, Control & Transfer", short: "Close the loop", outcome: "Operate a controller with feedback, recovery, and transfer evidence.", color: "#a88bfa" },
  { id: "emb-research", title: "Embodied Evaluation & Research", short: "Test the whole system", outcome: "Run a bounded, reproducible embodied-system intervention study.", color: "#f277a6" },
];

const embodiedLessons: PlannedLesson[] = [
  ...lessons("emb-foundations", 1, [
    ["embodied-task-contracts", "What Is Embodied AI?", "Inspectable sense-think-act task story", [], "observation-action-spaces"],
    ["observation-action-spaces", "Observation & Action Spaces", "Sensor/action schema inspector", ["worldmodel:sequential-state", "rl:mdps-rewards"], "embodied-partial-observation"],
    ["embodied-partial-observation", "Partial Observation in the Physical Loop", "History/belief estimator comparison", ["observation-action-spaces", "worldmodel:belief-states-filtering", "rl:partial-observation"], "coordinate-frames-time"],
    ["coordinate-frames-time", "Frames and Timing Give Commands Meaning", "Frame-transform and timestamp workbench", ["observation-action-spaces", "embodied-partial-observation", "worldmodel:geometry-physical-priors"], "task-contract-capstone"],
    ["task-contract-capstone", "Build an Embodied Task Contract", "Simulation task with assertions and evidence boundary", ["embodied-task-contracts", "observation-action-spaces", "coordinate-frames-time", "embodied-partial-observation"], "cameras-proprioception", true],
  ]),
  ...lessons("emb-perception", 6, [
    ["cameras-proprioception", "Cameras, Proprioception & Sensor Noise", "Multisensor observation packet", ["observation-action-spaces", "coordinate-frames-time", "worldmodel:sensor-representations"], "calibration-transforms"],
    ["calibration-transforms", "Calibration & Spatial Transforms", "Camera/robot frame calibration", ["coordinate-frames-time"], "spatial-object-representations"],
    ["spatial-object-representations", "Spatial & Object Representations", "Object/scene state encoder", ["calibration-transforms", "worldmodel:object-centric-dynamics", "worldmodel:geometry-physical-priors"], "sensor-fusion-tracking"],
    ["sensor-fusion-tracking", "Sensor Fusion & Tracking", "Filter with uncertainty and dropout", ["cameras-proprioception", "calibration-transforms", "spatial-object-representations", "worldmodel:belief-states-filtering", "worldmodel:uncertainty-ensembles"], "state-estimator-capstone"],
    ["state-estimator-capstone", "Build a Multimodal State Estimator", "Calibrated estimator with changed-sensor tests", ["cameras-proprioception", "calibration-transforms", "spatial-object-representations", "sensor-fusion-tracking"], "teleoperation-demonstrations", true],
  ]),
  ...lessons("emb-data", 11, [
    ["teleoperation-demonstrations", "Teleoperation & Demonstrations", "Demonstration capture protocol", ["rl:behavior-cloning"], "trajectory-datasets"],
    ["trajectory-datasets", "Trajectory Schemas & Dataset Cards", "Versioned episode dataset", ["teleoperation-demonstrations", "worldmodel:trajectory-data-replay", "llm:data-engineering"], "robot-data-quality"],
    ["robot-data-quality", "Robot Data Quality & Coverage", "Coverage/leakage/rights audit", ["trajectory-datasets", "llm:data-engineering", "rl:offline-rl-coverage"], "action-representations-chunking"],
    ["action-representations-chunking", "Action Representations & Chunking", "Joint/delta/chunk decoder", ["observation-action-spaces", "trajectory-datasets", "worldmodel:latent-actions-passive-video"], "behavior-cloning-capstone"],
    ["behavior-cloning-capstone", "Build a Behavior-Cloning Policy", "Trajectory policy with compounding-error test", ["trajectory-datasets", "robot-data-quality", "action-representations-chunking", "rl:behavior-cloning"], "language-grounding", true],
  ]),
  ...lessons("emb-policies", 16, [
    ["language-grounding", "Language Grounding", "Instruction-to-task binding evaluator", ["spatial-object-representations", "llm:multimodal-models", "llm:context-engineering"], "multimodal-policy-encoders"],
    ["multimodal-policy-encoders", "Multimodal Policy Encoders", "Vision-language-state token interface", ["cameras-proprioception", "language-grounding", "llm:embedding-layer", "worldmodel:language-multimodal-world-models"], "transformer-action-policies"],
    ["transformer-action-policies", "Transformer Action Policies", "Causal action-chunk transformer", ["multimodal-policy-encoders", "action-representations-chunking", "llm:gpt2-from-scratch"], "diffusion-policies"],
    ["diffusion-policies", "Diffusion Policies", "Conditional action denoiser", ["action-representations-chunking", "generative:diffusion-model-capstone", "generative:conditional-generation"], "vla-policy-capstone"],
    ["vla-policy-capstone", "Build a Language-Conditioned Action Policy", "Transformer/diffusion policy comparison", ["language-grounding", "multimodal-policy-encoders", "transformer-action-policies", "diffusion-policies"], "feedback-control", true],
  ]),
  ...lessons("emb-control", 21, [
    ["feedback-control", "Feedback Control for Learned Policies", "Closed-loop error controller", ["worldmodel:model-predictive-control", "rl:actor-critic"], "world-model-robot-planning"],
    ["world-model-robot-planning", "World-Model Planning for Robots", "Latent rollout planner", ["worldmodel:dyna-tdmpc-case-study", "rl:model-based-capstone"], "hierarchical-skills"],
    ["hierarchical-skills", "Hierarchical Skills & Long Horizons", "Skill selector and termination conditions", ["worldmodel:hierarchical-multiscale", "llm:agent-loops"], "sim-to-real-identification"],
    ["sim-to-real-identification", "System Identification & Sim-to-Real", "Parameter calibration and shift audit", ["worldmodel:system-identification-sim-to-real"], "recovery-intervention-capstone"],
    ["recovery-intervention-capstone", "Recovery, Intervention & Human Control", "Closed-loop controller with safe fallback", ["feedback-control", "world-model-robot-planning", "hierarchical-skills", "sim-to-real-identification", "worldmodel:safe-constrained-planning"], "embodied-evaluation-suites", true],
  ]),
  ...lessons("emb-research", 26, [
    ["embodied-evaluation-suites", "Embodied Evaluation Suites", "Task/generalization/intervention matrix", ["worldmodel:world-model-evaluation", "rl:rl-evaluation-seeds"], "robustness-generalization"],
    ["robustness-generalization", "Robustness & Generalization", "Object/layout/instruction shift tests", ["worldmodel:compounding-error-exploitation", "embodied-evaluation-suites"], "latency-safety-operations"],
    ["latency-safety-operations", "Latency, Safety & Operations", "Deadline/constraint/rollback ledger", ["llm:observability-governance", "worldmodel:world-model-operations-case-study"], "reproducible-embodied-gpu"],
    ["reproducible-embodied-gpu", "Reproducible Embodied GPU Runs", "Portable simulation training and rollout artifacts", ["embodied-evaluation-suites", "latency-safety-operations", "rl:reproducible-rl-gpu", "generative:reproducible-gpu-experiments"], "embodied-research-capstone"],
    ["embodied-research-capstone", "Original Embodied-System Study", "Reproduced policy plus controlled cross-course intervention", ["reproducible-embodied-gpu", "latency-safety-operations"], "research-portfolio", true],
  ]),
];

export const plannedCourseManifests: Record<PlannedCourseId, PlannedCourseManifest> = {
  generative: { id: "generative", title: "Generative Models", selectorLabel: "Generative Models", outcome: "Build, compare, and investigate multiple generative model families from first principles.", recommendedAfter: ["llm:optimizers", "worldmodel:stochastic-latents-vaes"], tracks: generativeTracks, lessons: generativeLessons },
  rl: { id: "rl", title: "Reinforcement Learning & Control", selectorLabel: "RL & Control", outcome: "Build agents that learn decisions from rewards, demonstrations, logged data, and learned models.", recommendedAfter: ["worldmodel:mdps-bellman", "worldmodel:dyna-tdmpc-case-study", "generative:distribution-workbench-capstone"], tracks: rlTracks, lessons: rlLessons },
  embodied: { id: "embodied", title: "Embodied AI", selectorLabel: "Embodied AI", outcome: "Build and evaluate a bounded perception-language-action system in simulation.", recommendedAfter: ["llm:multimodal-models", "worldmodel:world-model-operations-case-study", "generative:conditional-safety-capstone", "rl:rl-research-capstone"], tracks: embodiedTracks, lessons: embodiedLessons },
};

for (const manifest of Object.values(plannedCourseManifests)) {
  if (manifest.lessons.some((lesson, index) => lesson.number !== index + 1)) throw new Error(`${manifest.id} lesson numbers must remain contiguous`);
  if (new Set(manifest.lessons.map((lesson) => lesson.id)).size !== manifest.lessons.length) throw new Error(`${manifest.id} lesson IDs must be unique`);
  const trackIds = new Set(manifest.tracks.map((track) => track.id));
  if (manifest.lessons.some((lesson) => !trackIds.has(lesson.track))) throw new Error(`${manifest.id} lesson references an unknown track`);
}
