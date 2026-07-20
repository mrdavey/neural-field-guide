export type ContinuityCourseId =
  | "worldmodel"
  | "generative"
  | "rl"
  | "embodied";

export type ContinuityRelationship =
  | "direct reuse"
  | "extension"
  | "synthesis"
  | "new chapter thread";

export type ContinuitySeverity = "high" | "medium" | "low";

export type CourseContinuityRecord = {
  courseId: ContinuityCourseId;
  fromLessonId: string;
  toLessonId: string;
  severity: ContinuitySeverity;
  relationship: ContinuityRelationship;
  bridge: string;
};

export const worldModelAdvancedBranchIds = [
  "object-centric-dynamics",
  "hierarchical-multiscale",
  "geometry-physical-priors",
  "causal-counterfactual-models",
  "language-multimodal-world-models",
] as const;

export const worldModelResearchCapstoneId = "world-model-research-capstone";

export const courseContinuityRecords: readonly CourseContinuityRecord[] = [
  {
    courseId: "worldmodel",
    fromLessonId: "world-models",
    toLessonId: "dynamics-tensors",
    severity: "high",
    relationship: "direct reuse",
    bridge:
      "The introduction left you with a situation, possible actions, predicted consequences, and a reality check. A computer cannot pass those roles between layers as a sketch, so this chapter turns a tiny observation–action record into named arrays: rows for time or examples, columns for features, and a learned matrix that produces the next-state features used by later dynamics models.",
  },
  {
    courseId: "worldmodel",
    fromLessonId: "dynamics-tensors",
    toLessonId: "stochastic-futures",
    severity: "medium",
    relationship: "direct reuse",
    bridge:
      "The previous chapter established the shape of one predicted next-state array. Real systems can reach different next states from the same recorded input, so this chapter keeps those axes fixed but replaces one forced answer with possible futures and explicit probability mass; those distributions become training targets in the following chapter.",
  },
  {
    courseId: "worldmodel",
    fromLessonId: "stochastic-futures",
    toLessonId: "learning-dynamics",
    severity: "high",
    relationship: "direct reuse",
    bridge:
      "You can now represent more than one possible future. Learning asks which model parameters make the observed future less surprising: the small mean-squared-error trace below is deliberately a deterministic point-prediction fixture, while categorical probabilities or Gaussian parameters require their corresponding likelihood loss. Later recurrent models reuse the same prediction–loss–update loop at every time step.",
  },
  {
    courseId: "worldmodel",
    fromLessonId: "learning-dynamics",
    toLessonId: "sequential-state",
    severity: "high",
    relationship: "extension",
    bridge:
      "The last chapter updated parameters from a prediction error. This chapter supplies the time-indexed training row that update was missing: current state and action $(s_t,a_t)$ enter the transition model, predicted $s_{t+1}^{pred}$ is compared with observed $s_{t+1}$, and the process repeats through a sequence. That state–action–next-state contract anchors the rest of the course.",
  },
  {
    courseId: "worldmodel",
    fromLessonId: "differentiable-planning",
    toLessonId: "actor-critic-lambda",
    severity: "high",
    relationship: "extension",
    bridge:
      "Differentiable planning improved an imagined return by changing the candidate action sequence while the world model stayed fixed. Actor–critic imagination reuses the rollout and return, but changes learned parameters instead: an actor proposes actions and a critic estimates remaining value. Keeping the optimized variable explicit prevents a planner update from being mistaken for policy learning.",
  },
  {
    courseId: "worldmodel",
    fromLessonId: "dyna-tdmpc-case-study",
    toLessonId: "video-tokenization",
    severity: "high",
    relationship: "new chapter thread",
    bridge:
      "The planning spine is now complete: learned state, imagined consequences, and a decision rule can be evaluated together. Video begins a new representation-and-scale thread because a raw frame contains far more values than the small states used so far; tokenization asks which compact visual units preserve the changes a future predictor and controller will need.",
  },
  {
    courseId: "worldmodel",
    fromLessonId: "latent-actions-passive-video",
    toLessonId: "jepa-vjepa",
    severity: "high",
    relationship: "new chapter thread",
    bridge:
      "Latent-action models tried to infer an action-like variable so video dynamics could be controlled. JEPA starts an alternative foundation-model contract: it can learn useful predictive features without claiming that those features are actions. The shared idea is feature prediction; the action interface is deliberately set aside until a later interactive system supplies evidence for it.",
  },
  {
    courseId: "worldmodel",
    fromLessonId: "jepa-vjepa",
    toLessonId: "genie-interactive-worlds",
    severity: "high",
    relationship: "synthesis",
    bridge:
      "JEPA showed how predicting features can avoid reconstructing every pixel, but an interactive world also needs controllable progression. This chapter is a synthesis rather than a direct next step: it combines the earlier video-token interface, autoregressive future prediction, and learned latent actions, then asks whether the resulting controls are grounded and stable.",
  },
  {
    courseId: "worldmodel",
    fromLessonId: "goal-conditioned-robotics",
    toLessonId: "system-identification-sim-to-real",
    severity: "medium",
    relationship: "extension",
    bridge:
      "A goal-conditioned controller can represent where it should go and still miss because its model assumes the wrong mass, friction, delay, gain, or sensor bias. System identification turns that repeated goal error into competing parameter hypotheses, using input–response traces to learn which physical mismatch must be repaired before transfer.",
  },
  {
    courseId: "worldmodel",
    fromLessonId: "system-identification-sim-to-real",
    toLessonId: "safe-constrained-planning",
    severity: "medium",
    relationship: "direct reuse",
    bridge:
      "Identification produces a revised dynamics model and evidence about where it remains uncertain. Safe planning reuses both: robust or chance constraints widen margins where predictions are unreliable, while an independent monitor retains authority to stop actions the planner should never execute. Calibration informs the margin; it does not replace intervention authority.",
  },
  {
    courseId: "worldmodel",
    fromLessonId: "world-model-operations-case-study",
    toLessonId: "object-centric-dynamics",
    severity: "high",
    relationship: "extension",
    bridge:
      "The shared curriculum and operations case study are complete; advanced lessons are parallel choices, not prerequisites for one another. This branch asks whether representing persistent entities, their states, and their interactions makes action-conditioned transitions easier to predict and test than one undivided scene state.",
  },
  {
    courseId: "worldmodel",
    fromLessonId: "world-model-operations-case-study",
    toLessonId: "hierarchical-multiscale",
    severity: "low",
    relationship: "extension",
    bridge:
      "The shared curriculum exposed how rollout error grows with horizon. This optional branch tests whether fast local updates and slower abstract states can preserve useful predictions across different time or spatial scales; it does not depend on completing another advanced branch first.",
  },
  {
    courseId: "worldmodel",
    fromLessonId: "world-model-operations-case-study",
    toLessonId: "geometry-physical-priors",
    severity: "low",
    relationship: "extension",
    bridge:
      "The shared curriculum showed that a learned transition can fail when the evaluation situation changes. This optional branch asks which geometric or physical structure—such as rotation behavior or conservation—should constrain the predictor so a changed coordinate or configuration is not treated as unrelated data.",
  },
  {
    courseId: "worldmodel",
    fromLessonId: "world-model-operations-case-study",
    toLessonId: "causal-counterfactual-models",
    severity: "low",
    relationship: "extension",
    bridge:
      "The shared curriculum learned transitions from observed experience. This optional branch changes the question from what usually follows to what would follow under a deliberate intervention, so observational fit, intervention design, and counterfactual evidence must remain separate.",
  },
  {
    courseId: "worldmodel",
    fromLessonId: "world-model-operations-case-study",
    toLessonId: "language-multimodal-world-models",
    severity: "low",
    relationship: "extension",
    bridge:
      "The shared model contract already has evidence inputs, a predictive state, actions, and future targets. This optional branch adds language and other modalities as timed conditions, then tests alignment, grounding, missing inputs, and whether the added channel actually changes the predicted consequence for the right reason.",
  },
  {
    courseId: "worldmodel",
    fromLessonId: "world-model-operations-case-study",
    toLessonId: "world-model-research-capstone",
    severity: "high",
    relationship: "synthesis",
    bridge:
      "This is the required synthesis after the shared operations spine and one advanced branch of your choice—not a sixth specialization. Carry one branch mechanism into a preregistered changed-case comparison, then combine it with the course's baseline, evaluation, provenance, failure-log, and claim-boundary contracts.",
  },

  {
    courseId: "generative",
    fromLessonId: "generation-as-distribution",
    toLessonId: "likelihood-cross-entropy",
    severity: "high",
    relationship: "direct reuse",
    bridge:
      "The introduction treated a generator as a probability distribution over possible outputs. Training now asks how much probability that same distribution assigns to real examples: for a target with probability $0.25$, the negative log-likelihood is $-\\log(0.25)$, and an update tries to reduce it. Scoring and sampling remain two interfaces to one model.",
  },
  {
    courseId: "generative",
    fromLessonId: "likelihood-cross-entropy",
    toLessonId: "sampling-randomness",
    severity: "medium",
    relationship: "direct reuse",
    bridge:
      "Likelihood answered how a model scores an observed outcome. Sampling asks the complementary question—how to draw an outcome from the same probability table—so a high-probability item appears often but is not guaranteed. Later evaluations must distinguish randomness in a finite sample from a wrong underlying distribution.",
  },
  {
    courseId: "generative",
    fromLessonId: "sampling-randomness",
    toLessonId: "divergences-distance",
    severity: "medium",
    relationship: "extension",
    bridge:
      "A handful of random draws can differ from their own source distribution by chance. Before comparing models, this chapter moves from individual samples to distribution-level mass: repeated frequencies estimate each outcome probability, and a divergence measures systematic mismatch after finite-sample noise is accounted for.",
  },
  {
    courseId: "generative",
    fromLessonId: "autoregressive-generators",
    toLessonId: "latent-variable-models",
    severity: "medium",
    relationship: "extension",
    bridge:
      "The autoregressive generator represented $p(x)$ as an ordered product and compared exact log-likelihood with order-sensitive sampling. Latent-variable models keep the same score-and-sample questions but add an unobserved cause $z$, so $p(x)$ is obtained by combining $p(z)$ with $p(x\\mid z)$ and summing or integrating over possible latent values. This extends the model structure; it does not claim that the latent variable is merely the previous autoregressive history.",
  },
  {
    courseId: "generative",
    fromLessonId: "latent-variable-models",
    toLessonId: "amortized-inference-elbo",
    severity: "high",
    relationship: "direct reuse",
    bridge:
      "The latent-variable model introduced an unobserved cause $z$, but the exact posterior $p(z\\mid x)$ is often too expensive to compute for every example. Amortized inference learns one reusable approximation $q_{\\phi}(z\\mid x)$, and the ELBO turns that blocked posterior query into a tractable likelihood-and-KL training objective.",
  },
  {
    courseId: "generative",
    fromLessonId: "amortized-inference-elbo",
    toLessonId: "vae-posterior-collapse",
    severity: "high",
    relationship: "direct reuse",
    bridge:
      "The ELBO ledger balances reconstruction against a KL term that pulls $q(z\\mid x)$ toward the prior. If an expressive decoder can predict $x$ without using $z$, optimization can keep good likelihood while making $q(z\\mid x)\\approx p(z)$; collapse diagnosis therefore inspects both ledger terms and whether changing the latent changes the output.",
  },
  {
    courseId: "generative",
    fromLessonId: "latent-models-capstone",
    toLessonId: "change-of-variables",
    severity: "medium",
    relationship: "new chapter thread",
    bridge:
      "The latent-model capstone handled an intractable marginal density with approximate inference. Normalizing flows begin a new exact-density family: start with a normalized base variable, apply an invertible transform, and correct density for local volume change. The reusable ideas are support and total probability mass, not the previous chapter's KL argument order.",
  },
  {
    courseId: "generative",
    fromLessonId: "normalizing-flows",
    toLessonId: "energy-based-models",
    severity: "medium",
    relationship: "extension",
    bridge:
      "A normalizing flow delivered exact normalized density and direct sampling through an invertible transform, with the Jacobian accounting for local volume change. Energy-based models relax that invertibility contract: they assign an unnormalized score $e^{-E_\\theta(x)}$, then require a partition function for normalized probability and often a Markov-chain sampler for the negative phase. Holding the scored examples fixed makes the trade visible—more flexible energy functions replace the flow's tractable density-and-sampling interface.",
  },
  {
    courseId: "generative",
    fromLessonId: "diffusion-model-capstone",
    toLessonId: "conditional-generation",
    severity: "medium",
    relationship: "extension",
    bridge:
      "The diffusion capstone already mapped a noisy state and time step to a denoising prediction. Conditional generation keeps that input/output contract and adds a condition $c$—such as a class or text embedding—through concatenation, cross-attention, or modulation, so the prediction can change with the requested content while the noise state stays fixed.",
  },
  {
    courseId: "generative",
    fromLessonId: "classifier-free-guidance",
    toLessonId: "inverse-problems-editing",
    severity: "medium",
    relationship: "extension",
    bridge:
      "Classifier-free guidance was one way to strengthen a learned condition. Inverse problems begin from a broader evidence contract, $y=A(x)+n$: the observation operator and noise model define which candidate outputs remain consistent with measured data. Guidance can help a solver, but it is one optional mechanism inside this conditioning problem, not the definition of it.",
  },
  {
    courseId: "generative",
    fromLessonId: "inverse-problems-editing",
    toLessonId: "compositional-control",
    severity: "medium",
    relationship: "extension",
    bridge:
      "An inverse problem kept candidate outputs consistent with one measured observation $y=A(x)+n$ and exposed why insufficient measurements can leave several valid reconstructions. Compositional control reuses measurement consistency as one condition, adds other conditions or constraints, and asks whether they can be satisfied jointly rather than optimized one at a time. Product-style combination supplies the new mechanism, while conflict tests reveal when individually plausible conditions have no reliable joint solution.",
  },
  {
    courseId: "generative",
    fromLessonId: "generative-data-systems",
    toLessonId: "memorization-privacy",
    severity: "medium",
    relationship: "extension",
    bridge:
      "The data-system chapter made source, consent or rights, filtering, duplication, and revision history part of the model artifact. Privacy analysis reuses that lineage to ask which records could be exposed, what an attacker can query, whether deletion can propagate through immutable snapshots, and which mitigations remain auditable.",
  },
  {
    courseId: "generative",
    fromLessonId: "memorization-privacy",
    toLessonId: "matched-budget-evaluation",
    severity: "medium",
    relationship: "extension",
    bridge:
      "The memorization audit defined one construct with a particular attack, query budget, and exposure criterion. Matched evaluation places that construct beside quality, diversity, calibration, and cost, while keeping each metric's sampling unit and budget explicit so a quality win cannot silently erase a privacy regression.",
  },

  {
    courseId: "rl",
    fromLessonId: "sequential-decision-systems",
    toLessonId: "mdps-rewards",
    severity: "high",
    relationship: "direct reuse",
    bridge:
      "The introduction's loop had a situation, an action, a consequence, and an update that changes later choices. An MDP gives those roles precise names: states $S$, actions $A$, transition probabilities $P$, rewards $R$, and a discount for later consequences. The notation is useful because every later value or policy calculation points back to one part of this same loop.",
  },
  {
    courseId: "rl",
    fromLessonId: "mdps-rewards",
    toLessonId: "partial-observation",
    severity: "medium",
    relationship: "extension",
    bridge:
      "The MDP calculation assumed the agent could observe the state that makes future outcomes predictable. Hide a door's lock status or add noisy sensors and that assumption fails: the agent receives an observation, then uses history or a belief distribution to represent what the hidden state might be before choosing an action.",
  },
  {
    courseId: "rl",
    fromLessonId: "partial-observation",
    toLessonId: "policies-occupancy",
    severity: "medium",
    relationship: "extension",
    bridge:
      "Partial observation repaired the information supplied to the agent; it did not yet specify how the agent chooses. A policy maps the available information state—an observation, history, or belief—to action probabilities, and its occupancy measure records which state–action regions those repeated choices actually visit.",
  },
  {
    courseId: "rl",
    fromLessonId: "dynamic-programming",
    toLessonId: "monte-carlo-estimation",
    severity: "medium",
    relationship: "extension",
    bridge:
      "Dynamic programming computed a value backup from a known transition and reward table. When that table is unavailable but episodes can be observed, Monte Carlo replaces the exact expectation with sampled returns from complete trajectories; the target is similar, but its evidence source and variance are different.",
  },
  {
    courseId: "rl",
    fromLessonId: "learned-dynamics-control",
    toLessonId: "shooting-mpc",
    severity: "high",
    relationship: "direct reuse",
    bridge:
      "The learned dynamics model can now predict what follows a state and action. Shooting control uses that model immediately: propose several action sequences, roll each one forward through the learned transitions, score the predicted outcomes, execute only the first action of the best sequence, then observe and plan again.",
  },
  {
    courseId: "rl",
    fromLessonId: "shooting-mpc",
    toLessonId: "dyna-imagination",
    severity: "medium",
    relationship: "extension",
    bridge:
      "MPC used imagined transitions to choose the next real action. Dyna reuses an imagined transition for a different output: it becomes an additional value or policy learning update. Keeping action selection separate from parameter learning makes model bias easier to locate.",
  },
  {
    courseId: "rl",
    fromLessonId: "dyna-imagination",
    toLessonId: "model-uncertainty-exploitation",
    severity: "high",
    relationship: "direct reuse",
    bridge:
      "Dyna can multiply experience only if its synthetic targets are trustworthy. A confidently wrong model can therefore teach the agent an exploit many times; uncertainty estimates are used to reject imagined rows, penalize risky plans, request real data, or fall back when disagreement is high—not to certify that the model is correct.",
  },
  {
    courseId: "rl",
    fromLessonId: "covariate-shift-dagger",
    toLessonId: "offline-rl-coverage",
    severity: "medium",
    relationship: "extension",
    bridge:
      "DAgger repaired covariate shift by visiting learner-induced states and asking an expert for new labels. Offline RL removes that escape hatch: the dataset is fixed, so a target action outside logged support has no trustworthy outcome evidence. Coverage and conservative objectives manage this no-new-query constraint.",
  },
  {
    courseId: "rl",
    fromLessonId: "rl-evaluation-seeds",
    toLessonId: "safe-constrained-rl",
    severity: "medium",
    relationship: "extension",
    bridge:
      "Seed-level return evidence shows performance variability, but an average reward can hide rare or concentrated violations. Safe and constrained RL adds cost signals, feasibility thresholds, per-seed violation rows, and intervention rules so improvement is accepted only when both performance and constraint evidence satisfy the declared decision.",
  },
  {
    courseId: "rl",
    fromLessonId: "safe-constrained-rl",
    toLessonId: "reproducible-rl-gpu",
    severity: "medium",
    relationship: "direct reuse",
    bridge:
      "The safe-RL contract already names rewards, costs, limits, and who may stop an action. A reproducible GPU run turns those declarations into smoke-test invariants, full-run metrics, provenance fields, stop criteria, and preserved failure rows; faster execution does not relax the authority or evidence boundary.",
  },

  {
    courseId: "embodied",
    fromLessonId: "embodied-task-contracts",
    toLessonId: "observation-action-spaces",
    severity: "low",
    relationship: "direct reuse",
    bridge:
      "The task contract's sense–decide–act–check loop now becomes an interface a program can inspect. Observations carry the sensed fields, actions name requested and applied commands, timing aligns the exchange, and success checks define what the loop is trying to change.",
  },
  {
    courseId: "embodied",
    fromLessonId: "observation-action-spaces",
    toLessonId: "coordinate-frames-time",
    severity: "medium",
    relationship: "extension",
    bridge:
      "An array can have the expected shape and still be physically wrong if its position is expressed in the camera frame while the action expects the robot-base frame, or if the values come from different times. This chapter annotates the existing observation/action schema with frame, units, timestamp, and synchronization before control uses it.",
  },
  {
    courseId: "embodied",
    fromLessonId: "coordinate-frames-time",
    toLessonId: "embodied-partial-observation",
    severity: "low",
    relationship: "extension",
    bridge:
      "Aligned frames and timestamps make measurements comparable, but one measurement can still omit occluded objects, contact state, or velocity. History and belief state combine timed evidence to estimate the hidden situation the policy actually needs.",
  },
  {
    courseId: "embodied",
    fromLessonId: "cameras-proprioception",
    toLessonId: "calibration-transforms",
    severity: "low",
    relationship: "direct reuse",
    bridge:
      "The synchronized camera-and-proprioception packet says what arrived and when, not where a camera point lies relative to the robot. Calibration supplies that versioned camera-to-robot transform, so one measured point can become a control-relevant position with uncertainty and revision history.",
  },
  {
    courseId: "embodied",
    fromLessonId: "state-estimator-capstone",
    toLessonId: "teleoperation-demonstrations",
    severity: "medium",
    relationship: "new chapter thread",
    bridge:
      "The perception spine now produces a timed estimator packet suitable for a policy. Demonstration learning begins a new data thread by pairing that packet with the operator's requested action, the command actually applied, and the resulting next observation, creating a trajectory row rather than an isolated sensor estimate.",
  },
  {
    courseId: "embodied",
    fromLessonId: "robot-data-quality",
    toLessonId: "action-representations-chunking",
    severity: "low",
    relationship: "extension",
    bridge:
      "A trajectory row can be trustworthy and still have an ambiguous learning target. This chapter defines whether actions are joint commands or end-effector changes, which frame and units they use, and whether the policy predicts one command or a timed chunk; those choices determine both loss and closed-loop behavior.",
  },
  {
    courseId: "embodied",
    fromLessonId: "behavior-cloning-capstone",
    toLessonId: "language-grounding",
    severity: "medium",
    relationship: "new chapter thread",
    bridge:
      "Behavior cloning completed an observation-to-action policy for one declared task distribution. Language-conditioned control begins a new interface: an instruction must identify an object, relation, or goal in the current observation before it can select the relevant behavior. Grounding is therefore tested before a larger policy architecture is trusted.",
  },
  {
    courseId: "embodied",
    fromLessonId: "transformer-action-policies",
    toLessonId: "diffusion-policies",
    severity: "medium",
    relationship: "extension",
    bridge:
      "The transformer policy established the conditioning inputs, action-chunk target, and closed-loop task. A diffusion policy is a parallel decoder for that same contract: keep observations, language, horizon, execution prefix, and latency budget fixed, then compare iterative denoising with autoregressive action prediction.",
  },
  {
    courseId: "embodied",
    fromLessonId: "feedback-control",
    toLessonId: "world-model-robot-planning",
    severity: "low",
    relationship: "extension",
    bridge:
      "Feedback control corrected error after each executed command. World-model planning adds a predicted action sequence before execution, then keeps the same loop: choose a sequence, execute a short prefix, observe the new error, correct, and replan instead of trusting the whole imagined future open-loop.",
  },
  {
    courseId: "embodied",
    fromLessonId: "world-model-robot-planning",
    toLessonId: "hierarchical-skills",
    severity: "low",
    relationship: "extension",
    bridge:
      "A planner can repeatedly produce the same useful action segment. Hierarchical control packages such a segment as a skill with parameters, a subgoal, a success or termination condition, and a handoff back to the higher-level chooser.",
  },
  {
    courseId: "embodied",
    fromLessonId: "hierarchical-skills",
    toLessonId: "sim-to-real-identification",
    severity: "low",
    relationship: "extension",
    bridge:
      "A reusable skill still assumes particular masses, friction, delays, sensors, and actuator responses. Sim-to-real identification holds the skill goal fixed, measures how real or changed-simulator traces differ, and updates dynamics or controller parameters before claiming transfer.",
  },
  {
    courseId: "embodied",
    fromLessonId: "robustness-generalization",
    toLessonId: "latency-safety-operations",
    severity: "low",
    relationship: "extension",
    bridge:
      "Robustness tests named the shifts and failures that appear away from the training distribution. Operations turns each one into a runtime requirement—a latency budget, logged model and calibration revision, constraint check, watchdog, intervention owner, or rollback trigger—so offline evidence controls what the deployed loop is allowed to do.",
  },
];

const recordByDestination = new Map(
  courseContinuityRecords.map((record) => [
    `${record.courseId}:${record.toLessonId}`,
    record,
  ]),
);

const recordByTransition = new Map(
  courseContinuityRecords.map((record) => [
    `${record.courseId}:${record.fromLessonId}->${record.toLessonId}`,
    record,
  ]),
);

export function continuityRecordForLesson(
  courseId: string,
  lessonId: string,
) {
  return recordByDestination.get(`${courseId}:${lessonId}`);
}

export function continuityRecordForTransition(
  courseId: string,
  fromLessonId: string,
  toLessonId: string,
) {
  return recordByTransition.get(
    `${courseId}:${fromLessonId}->${toLessonId}`,
  );
}

export function continuityRelationshipFor({
  courseId,
  fromLessonId,
  toLessonId,
  sameTrack,
  directDependency,
}: {
  courseId: string;
  fromLessonId: string;
  toLessonId: string;
  sameTrack: boolean;
  directDependency: boolean;
}): ContinuityRelationship {
  const authored = continuityRecordForTransition(
    courseId,
    fromLessonId,
    toLessonId,
  )?.relationship;
  if (authored) return authored;
  if (directDependency) return "direct reuse";
  const auditedCourse = ["worldmodel", "generative", "rl", "embodied"].includes(
    courseId,
  );
  return auditedCourse && sameTrack ? "extension" : "new chapter thread";
}

export function isWorldModelAdvancedBranch(lessonId: string) {
  return worldModelAdvancedBranchIds.includes(
    lessonId as (typeof worldModelAdvancedBranchIds)[number],
  );
}
