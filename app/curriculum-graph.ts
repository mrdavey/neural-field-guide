import { plannedCourseManifests, type PlannedCourseId } from "./research-curriculum-manifests";

export type ProgramCourseId = "llm" | "worldmodel" | PlannedCourseId;
export type LessonRef = `${ProgramCourseId}:${string}`;

export type CrossCourseConcept = {
  id: string;
  title: string;
  canonical: LessonRef;
  reinforces: LessonRef[];
  futureUses: LessonRef[];
  boundary: string;
  artifact: string;
};

export const programCoursePath: Array<{
  id: ProgramCourseId;
  role: "entry" | "bridge" | "decision" | "synthesis";
  requiredConcepts: string[];
  recommendedAfter: ProgramCourseId[];
}> = [
  { id: "llm", role: "entry", requiredConcepts: [], recommendedAfter: [] },
  { id: "worldmodel", role: "entry", requiredConcepts: ["numerical-foundations"], recommendedAfter: ["llm"] },
  { id: "generative", role: "bridge", requiredConcepts: ["numerical-foundations", "probability-objectives", "optimization"], recommendedAfter: ["llm", "worldmodel"] },
  { id: "rl", role: "decision", requiredConcepts: ["numerical-foundations", "sequential-state", "mdps-values", "optimization"], recommendedAfter: ["worldmodel", "generative"] },
  { id: "embodied", role: "synthesis", requiredConcepts: ["multimodal-representation", "state-estimation", "generative-conditioning", "policy-learning", "planning-control", "evaluation-measurement"], recommendedAfter: ["llm", "worldmodel", "generative", "rl"] },
];

export const crossCourseConcepts: CrossCourseConcept[] = [
  {
    id: "numerical-foundations", title: "Tensors, shapes and linear transformations", canonical: "llm:tensors-shapes",
    reinforces: ["worldmodel:dynamics-tensors", "generative:change-of-variables", "embodied:coordinate-frames-time"],
    futureUses: ["rl:function-approximation", "embodied:multimodal-policy-encoders"],
    boundary: "The LLM lesson owns axis naming and matrix mechanics; later courses reactivate those mechanics with domain-specific axes rather than reteaching generic tensor algebra.",
    artifact: "A shape ledger that names every axis, contraction, broadcast and unit.",
  },
  {
    id: "probability-objectives", title: "Probability, likelihood and predictive loss", canonical: "llm:probability-softmax",
    reinforces: ["llm:learning-to-predict", "generative:likelihood-cross-entropy", "worldmodel:prediction-targets"],
    futureUses: ["rl:policy-gradients", "embodied:language-grounding"],
    boundary: "Softmax and cross-entropy establish normalized categorical prediction; generative modeling generalizes the objective families and RL distinguishes likelihood-ratio gradients from supervised likelihood.",
    artifact: "Per-example log-probability and loss decomposition with declared units.",
  },
  {
    id: "optimization", title: "Gradients, backpropagation and updates", canonical: "llm:gradients-backprop",
    reinforces: ["llm:optimizers", "worldmodel:learning-dynamics", "generative:vae-posterior-collapse"],
    futureUses: ["rl:dqn", "rl:actor-critic", "embodied:behavior-cloning-capstone"],
    boundary: "The LLM foundation owns differentiation and optimizer mechanics; later courses own estimator bias, target construction and stability in their learning setting.",
    artifact: "A one-step parameter update trace with gradients, optimizer state and before/after loss.",
  },
  {
    id: "autoregressive-modeling", title: "Autoregressive factorization", canonical: "llm:introduction",
    reinforces: ["llm:learning-to-predict", "llm:gpt2-from-scratch", "generative:autoregressive-generators"],
    futureUses: ["rl:sequence-policy-capstone", "embodied:transformer-action-policies"],
    boundary: "LLMs own causal token modeling; Generative Models generalizes the factorization to other domains; RL and Embodied AI use sequence policies without claiming every action policy is a language model.",
    artifact: "A causal factorization trace with shifted inputs, targets and sampling order.",
  },
  {
    id: "representation", title: "Learned representations", canonical: "llm:embedding-layer",
    reinforces: ["worldmodel:sensor-representations", "worldmodel:autoencoders-latents", "embodied:spatial-object-representations"],
    futureUses: ["generative:latent-variable-models", "rl:function-approximation", "embodied:multimodal-policy-encoders"],
    boundary: "Token lookup, sensor encoding and latent state solve different input contracts; geometry may be useful without individual coordinates having stable human meanings.",
    artifact: "A representation contract naming input, shape, invariances, information losses and downstream consumer.",
  },
  {
    id: "attention-sequence", title: "Attention and sequence computation", canonical: "llm:attention",
    reinforces: ["llm:gpt2-from-scratch", "generative:autoregressive-generators", "rl:sequence-policy-capstone"],
    futureUses: ["embodied:transformer-action-policies", "embodied:multimodal-policy-encoders"],
    boundary: "Attention routes information; it does not by itself define an objective, a world model, a policy or a causal explanation.",
    artifact: "A mask, tensor-shape and information-route trace.",
  },
  {
    id: "latent-inference", title: "Latent variables, priors and posteriors", canonical: "worldmodel:stochastic-latents-vaes",
    reinforces: ["worldmodel:latent-prior-posterior", "generative:amortized-inference-elbo", "generative:vae-posterior-collapse"],
    futureUses: ["worldmodel:rssm-planet-case-study", "embodied:state-estimator-capstone"],
    boundary: "World Models first uses latent inference to track hidden state; Generative Models owns the complete ELBO, amortized-inference and posterior-collapse treatment.",
    artifact: "Prior/posterior samples and an ELBO decomposition with reconstruction and KL terms.",
  },
  {
    id: "sequential-state", title: "State, transition and observation", canonical: "worldmodel:sequential-state",
    reinforces: ["worldmodel:action-conditioned-transitions", "rl:sequential-decision-systems", "embodied:observation-action-spaces"],
    futureUses: ["rl:learned-dynamics-control", "embodied:world-model-robot-planning"],
    boundary: "World Models owns predictive state and observation dynamics; RL adds preferences over consequences; Embodied AI binds the variables to timed sensors and actuators.",
    artifact: "A typed transition row containing state, action, next state, observation and termination fields.",
  },
  {
    id: "state-estimation", title: "Belief-state estimation under partial observation", canonical: "worldmodel:belief-states-filtering",
    reinforces: ["worldmodel:recurrent-state-space", "rl:partial-observation", "embodied:sensor-fusion-tracking"],
    futureUses: ["embodied:state-estimator-capstone", "embodied:feedback-control"],
    boundary: "A belief is an evidence-conditioned state estimate, not a guarantee that hidden reality is identifiable from available sensors.",
    artifact: "Prediction, evidence update, normalization and recovery trace.",
  },
  {
    id: "generative-density", title: "Density modeling and sampling", canonical: "generative:generation-as-distribution",
    reinforces: ["generative:normalizing-flows", "generative:energy-based-models", "generative:diffusion-model-capstone"],
    futureUses: ["rl:policies-occupancy", "embodied:diffusion-policies"],
    boundary: "A model that samples plausible observations is not automatically calibrated, controllable or useful for decisions.",
    artifact: "Common sampler/evaluator interface with raw samples and probability or score metadata where available.",
  },
  {
    id: "diffusion", title: "Score-based and diffusion generation", canonical: "generative:corruption-denoising",
    reinforces: ["generative:score-matching", "generative:ddpm-objective", "worldmodel:autoregressive-diffusion-dynamics"],
    futureUses: ["embodied:diffusion-policies"],
    boundary: "Diffusion in observation space, latent world dynamics and action-space policies share denoising ideas but use different variables, conditioning and evaluation contracts.",
    artifact: "Forward corruption and reverse denoising trajectory with schedule and seed.",
  },
  {
    id: "generative-conditioning", title: "Conditional generation and controllability", canonical: "generative:conditional-generation",
    reinforces: ["generative:classifier-free-guidance", "llm:multimodal-models", "embodied:language-grounding"],
    futureUses: ["embodied:vla-policy-capstone"],
    boundary: "Condition adherence must be evaluated separately from fidelity, diversity, memorization and downstream safety.",
    artifact: "Condition/sample matrix with adherence, diversity and failure labels.",
  },
  {
    id: "mdps-values", title: "MDPs, rewards and Bellman values", canonical: "worldmodel:mdps-bellman",
    reinforces: ["worldmodel:rewards-returns-policies", "rl:mdps-rewards", "rl:dynamic-programming"],
    futureUses: ["rl:sarsa-q-learning", "rl:actor-critic", "embodied:embodied-task-contracts"],
    boundary: "World Models introduces the decision vocabulary needed for planning; the RL course owns the systematic learning algorithms, estimator trade-offs and evaluation practice.",
    artifact: "Finite MDP table with transitions, rewards, discount, policy and value backups.",
  },
  {
    id: "policy-learning", title: "Policy gradients and actor-critic learning", canonical: "rl:policy-gradients",
    reinforces: ["llm:rl-fundamentals", "worldmodel:actor-critic-lambda", "rl:actor-critic"],
    futureUses: ["llm:rlhf", "embodied:feedback-control"],
    boundary: "LLM post-training uses a specialized policy setting; World Models uses actors and critics inside imagination; RL owns estimator derivation and controlled comparison.",
    artifact: "Trajectory-level log-probability, return, advantage, actor loss and critic loss ledger.",
  },
  {
    id: "planning-control", title: "Planning, search and feedback control", canonical: "worldmodel:model-predictive-control",
    reinforces: ["worldmodel:shooting-cem", "worldmodel:muzero-tree-search", "rl:shooting-mpc", "embodied:feedback-control"],
    futureUses: ["embodied:world-model-robot-planning", "embodied:recovery-intervention-capstone"],
    boundary: "Open-loop search, receding-horizon planning, learned policy execution and low-level feedback control are related but not interchangeable.",
    artifact: "Candidate, predicted consequence, selection, executed action and observed correction trace.",
  },
  {
    id: "imitation-offline", title: "Imitation and offline policy learning", canonical: "rl:behavior-cloning",
    reinforces: ["rl:covariate-shift-dagger", "rl:offline-rl-coverage", "embodied:behavior-cloning-capstone"],
    futureUses: ["embodied:vla-policy-capstone"],
    boundary: "Supervised imitation matches logged actions; offline RL additionally reasons about value under incomplete action coverage and can extrapolate unsafely.",
    artifact: "Versioned trajectory dataset, behavior-policy summary, coverage audit and evaluation episodes.",
  },
  {
    id: "multimodal-representation", title: "Multimodal alignment and grounding", canonical: "llm:multimodal-models",
    reinforces: ["worldmodel:language-multimodal-world-models", "embodied:multimodal-policy-encoders", "embodied:language-grounding"],
    futureUses: ["embodied:transformer-action-policies", "embodied:diffusion-policies"],
    boundary: "Representations can align modalities without establishing physical grounding, action competence or closed-loop safety.",
    artifact: "Modality-to-token/state mapping with alignment and changed-context checks.",
  },
  {
    id: "robotics-transfer", title: "Robotics, identification and sim-to-real transfer", canonical: "worldmodel:system-identification-sim-to-real",
    reinforces: ["worldmodel:goal-conditioned-robotics", "embodied:sim-to-real-identification"],
    futureUses: ["embodied:recovery-intervention-capstone", "embodied:embodied-research-capstone"],
    boundary: "Simulation evidence supports mechanism and controlled comparison; it does not establish real-world reliability without matched hardware and deployment evidence.",
    artifact: "Simulator parameter, calibration residual, shift test and real/sim boundary record.",
  },
  {
    id: "systems-evidence", title: "Training and inference systems evidence", canonical: "llm:infrastructure",
    reinforces: ["llm:serving-systems", "llm:observability-governance", "generative:generative-data-systems", "embodied:latency-safety-operations"],
    futureUses: ["generative:reproducible-gpu-experiments", "rl:reproducible-rl-gpu", "embodied:reproducible-embodied-gpu"],
    boundary: "A runtime measurement belongs to its exact code, hardware, precision, workload and revision; a fixture validates arithmetic, not throughput or model quality.",
    artifact: "Pinned environment, resource ledger, raw timing rows, checkpoint and failure log.",
  },
  {
    id: "evaluation-measurement", title: "Evaluation, validity and uncertainty", canonical: "llm:evaluation-design",
    reinforces: ["worldmodel:world-model-evaluation", "generative:matched-budget-evaluation", "rl:rl-evaluation-seeds", "embodied:embodied-evaluation-suites"],
    futureUses: ["embodied:embodied-research-capstone"],
    boundary: "A metric is evidence for a declared construct under a sampling design, not a universal ranking or a substitute for failure analysis.",
    artifact: "Construct definition, cases, raw rows, uncertainty, confounds, alternatives and claim boundary.",
  },
  {
    id: "safety-authority", title: "Safety, authority and intervention", canonical: "llm:tools-safety",
    reinforces: ["llm:security-privacy", "worldmodel:safe-constrained-planning", "rl:safe-constrained-rl", "embodied:recovery-intervention-capstone"],
    futureUses: ["embodied:latency-safety-operations", "embodied:embodied-research-capstone"],
    boundary: "Training preferences, planning constraints, runtime permissions, monitoring and human intervention are distinct controls with distinct failure modes.",
    artifact: "Allowed/blocked action, authority source, intervention, recovery and residual-risk ledger.",
  },
  {
    id: "research-method", title: "Reproduction and original intervention", canonical: "generative:reproducible-gpu-experiments",
    reinforces: ["generative:generative-research-capstone", "rl:reproducible-rl-gpu", "rl:rl-research-capstone", "embodied:reproducible-embodied-gpu"],
    futureUses: ["embodied:embodied-research-capstone"],
    boundary: "An original result begins after a baseline is reproduced; one environment, seed or favorable run cannot support a general conclusion.",
    artifact: "Question, hypothesis, baseline, intervention, matched budgets, raw evidence, uncertainty, failures and bounded conclusion.",
  },
];

export const plannedLessonRefs = new Set<LessonRef>(Object.values(plannedCourseManifests).flatMap((course) => course.lessons.map((lesson) => `${course.id}:${lesson.id}` as LessonRef)));
