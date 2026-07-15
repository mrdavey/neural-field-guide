export type WorldModelLessonLabReadout = {
  controlValue: string;
  resultLabel: string;
  resultValue: string;
  meter: number;
  detail: string;
};

type LabCopy = {
  title: string;
  question: string;
  change: string;
  observe: string;
  explain: string;
  complete: string;
  boundary: string;
};

export type WorldModelLessonLabSpec = LabCopy & {
  control: { label: string; min: number; max: number; step: number; initial: number; choices?: string[] };
  evaluate: (value: number) => WorldModelLessonLabReadout;
};

type DiscreteState = Omit<WorldModelLessonLabReadout, "controlValue"> & { label: string };

function discrete(copy: LabCopy, controlLabel: string, states: DiscreteState[], initial = 0): WorldModelLessonLabSpec {
  return {
    ...copy,
    control: { label: controlLabel, min: 0, max: states.length - 1, step: 1, initial, choices: states.map(({ label }) => label) },
    evaluate: (value) => {
      const state = states[Math.max(0, Math.min(states.length - 1, Math.round(value)))];
      return { ...state, controlValue: state.label };
    },
  };
}

function numeric(copy: LabCopy, control: WorldModelLessonLabSpec["control"], evaluate: WorldModelLessonLabSpec["evaluate"]): WorldModelLessonLabSpec {
  return { ...copy, control, evaluate };
}

export const worldModelLessonLabSpecs: Record<string, WorldModelLessonLabSpec> = {
  "world-models": discrete(
    { title: "World-model contract sorter", question: "Which predictor has the action interface required for decision-making?", change: "Compare two systems that both produce plausible next frames.", observe: "Only one exposes how a proposed action changes a distribution of consequences.", explain: "A decision-useful world model conditions on state/history and candidate action; an uncontrolled generator predicts continuation without an intervention slot.", complete: "Classify both systems and name the input, transformation, output, and decision that consumes it.", boundary: "An action slot is necessary for this planning contract but does not prove that the learned consequences are accurate." },
    "Candidate system",
    [
      { label: "Action-conditioned", resultLabel: "Contract", resultValue: "STATE + ACTION → CONSEQUENCES", meter: 92, detail: "The planner can compare interventions, subject to validation and support." },
      { label: "Uncontrolled video", resultLabel: "Contract", resultValue: "HISTORY → PLAUSIBLE CONTINUATION", meter: 38, detail: "This may be a useful sequence model, but it cannot answer which candidate action caused a future." },
    ],
  ),
  "dynamics-tensors": discrete(
    { title: "Transition-pair and mask builder", question: "Which adjacent tensor rows are genuine within-episode transitions?", change: "Inspect a normal edge, a reset crossing, and a padded edge with identical shapes.", observe: "Shape checks pass all three, while the continuation mask admits only the real action edge.", explain: "The pair $(z_t,a_t)$ targets $z_{t+1}$ only when an environment action connects them inside the same episode.", complete: "Accept the valid edge and reject both semantically invalid edges before computing loss.", boundary: "This fixture checks alignment and masking; it does not establish long-horizon predictive accuracy." },
    "Proposed pair",
    [
      { label: "Within episode", resultLabel: "Loss mask", resultValue: "1 · INCLUDE", meter: 100, detail: "Shapes align and the action physically connects the two states." },
      { label: "Across reset", resultLabel: "Loss mask", resultValue: "0 · EXCLUDE", meter: 0, detail: "The repeated array is contiguous, but the environment reset breaks the transition." },
      { label: "Into padding", resultLabel: "Loss mask", resultValue: "0 · EXCLUDE", meter: 0, detail: "A padded target has a valid shape but no measured next-state meaning." },
    ],
  ),
  "stochastic-futures": discrete(
    { title: "Two-mode risk desk", question: "When does a distribution change the action decision even if its mean looks acceptable?", change: "Increase the probability of a catastrophic branch while keeping an ordinary outcome visible.", observe: "Expected cost and the non-compensable chance gate can recommend different actions.", explain: "A distribution preserves mutually exclusive outcomes; a declared tail-risk constraint is applied before average performance.", complete: "Compare risk-neutral and chance-constrained decisions at all three probabilities.", boundary: "The listed probabilities are fixtures, not calibrated estimates from a learned model." },
    "Catastrophic branch probability",
    [
      { label: "0%", resultLabel: "Decision", resultValue: "EXPECTED COST + GATE PASS", meter: 5, detail: "Both average cost and the 0.5% chance limit permit the action." },
      { label: "0.5%", resultLabel: "Decision", resultValue: "AT LIMIT · REVIEW", meter: 50, detail: "Boundary conventions must be explicit; a strict ‘below 0.5%’ rule rejects equality." },
      { label: "2%", resultLabel: "Decision", resultValue: "CHANCE GATE FAIL", meter: 100, detail: "A good mean cannot compensate for exceeding the declared catastrophic-risk limit." },
    ],
  ),
  "learning-dynamics": numeric(
    { title: "Shared-weight unroll", question: "How do temporal uses of one dynamics weight accumulate gradient evidence?", change: "Change how many recurrent transition steps contribute to the loss.", observe: "The same parameter receives a contribution through every unrolled use, while free-running bias grows with depth.", explain: "Reverse-mode differentiation adds gradient paths through the shared temporal computation graph; one-step fit can hide later control error.", complete: "Compare one and three steps, then explain why lower one-step loss is not a control guarantee.", boundary: "The linear contribution and drift values are deterministic teaching approximations, not a trained recurrent network." },
    { label: "Unroll depth", min: 1, max: 4, step: 1, initial: 1 },
    (value) => ({ controlValue: `${value} shared uses`, resultLabel: "Gradient paths / free-run drift", resultValue: `${value} paths / +${(0.08 * value).toFixed(2)}`, meter: value / 4 * 100, detail: `Weight w is reused ${value} time${value === 1 ? "" : "s"}; later losses add paths that a one-step objective cannot see.` }),
  ),
  "sequential-state": discrete(
    { title: "Observation-aliasing test", question: "Can the latest observation alone predict the next temperature?", change: "Hold the observed 20°C frame fixed and reveal or hide recent heater history.", observe: "The same observation maps to opposite futures until action/history separates the hidden states.", explain: "An observation is evidence; a predictive state must retain enough history to distinguish futures under the same proposed action.", complete: "Explain why two identical frames require different information states.", boundary: "One successful history feature does not prove the representation is Markov for every disturbance." },
    "Available information",
    [
      { label: "Current frame only", resultLabel: "Next-temperature prediction", resultValue: "ALIASED: WARM OR COOL", meter: 35, detail: "Hidden heater momentum makes the observation insufficient." },
      { label: "+ recent heater action", resultLabel: "Next-temperature prediction", resultValue: "SEPARATED", meter: 88, detail: "Recent control history distinguishes the two otherwise identical observations." },
      { label: "+ momentum sensor", resultLabel: "Next-temperature prediction", resultValue: "DIRECTLY INFORMED", meter: 96, detail: "A new sensor exposes the hidden variable for this fixture." },
    ],
  ),
  "rewards-returns-policies": numeric(
    { title: "Policy-conditioned return calculator", question: "How do discount and future policy choices change a state’s value?", change: "Change $\\gamma$ for rewards [1,2,3] produced by one policy branch.", observe: "Immediate reward stays 1 while discounted return changes because later outcomes receive different weight.", explain: "Reward labels one transition; return aggregates a trajectory; value averages returns under a named policy.", complete: "Compute the endpoints and state which policy generated the future rewards.", boundary: "This finite deterministic trace omits policy and transition uncertainty." },
    { label: "Discount $\\gamma$", min: 0, max: 1, step: 0.1, initial: 0.5 },
    (value) => { const total = 1 + value * 2 + value * value * 3; return { controlValue: value.toFixed(1), resultLabel: "Return $G_0$", resultValue: total.toFixed(2), meter: total / 6 * 100, detail: `The current reward remains 1; the named policy’s later rewards contribute ${(total - 1).toFixed(2)}.` }; },
  ),
  "mdps-bellman": numeric(
    { title: "Two-successor Bellman table", question: "How does transition probability change a backed-up action value?", change: "Change the probability of reaching state B with $V(B)=5$ rather than C with $V(C)=0$.", observe: "The expectation changes before discount is applied; immediate reward remains fixed at 1.", explain: "The backup is $1+0.9[pV(B)+(1-p)V(C)]$ for this action.", complete: "Reproduce the value at $p=0$, $0.8$, and $1$, then name the learned-model quantity that could bias it.", boundary: "A correct arithmetic backup can still use an incorrect transition model or value estimate." },
    { label: "$P(B\\mid s,a)$", min: 0, max: 1, step: 0.1, initial: 0.8 },
    (value) => { const backup = 1 + 0.9 * value * 5; return { controlValue: value.toFixed(1), resultLabel: "Backed-up action value", resultValue: backup.toFixed(2), meter: backup / 5.5 * 100, detail: `Expected next value is ${(value * 5).toFixed(2)} before the 0.9 discount.` }; },
  ),
  "belief-states-filtering": discrete(
    { title: "Predict-then-correct Bayes filter", question: "Why must an action update the prior before sensor evidence is applied?", change: "Step through prior belief, action-conditioned prediction, and observation correction.", observe: "Probability mass first moves through the transition table, then likelihood reweights and normalizes it.", explain: "Filtering composes a dynamics prediction with an observation update; multiplying the old prior by likelihood skips the action’s effect.", complete: "State the normalized distribution at each phase and verify that mass sums to one.", boundary: "The exact two-state table is a deterministic fixture, not a learned or calibrated filter." },
    "Filter phase",
    [
      { label: "Prior", resultLabel: "Belief [A,B]", resultValue: "[0.60, 0.40]", meter: 60, detail: "This is uncertainty before the new action and observation." },
      { label: "After action prediction", resultLabel: "Predicted belief [A,B]", resultValue: "[0.46, 0.54]", meter: 46, detail: "The declared transition table moves mass before seeing the sensor." },
      { label: "After observation", resultLabel: "Posterior [A,B]", resultValue: "[0.77, 0.23]", meter: 77, detail: "Likelihood [0.8,0.2] reweights the predicted belief and normalization restores total mass 1." },
    ],
  ),
  "sensor-representations": discrete(
    { title: "Predictive-feature contrast", question: "Which sensor difference must a representation preserve for future control?", change: "Compare a nuisance-only change with a small state change that reverses the action consequence.", observe: "A good predictive feature may ignore texture but must separate the hidden switch state.", explain: "Representation quality is judged by retained distinctions that alter future outcomes under controlled actions.", complete: "Classify both changes and justify the feature that must survive compression.", boundary: "The selected task slice does not prove that every future task-relevant variable is retained." },
    "Matched sensor pair",
    [
      { label: "Background texture", resultLabel: "Required separation", resultValue: "OPTIONAL NUISANCE", meter: 25, detail: "The same state and action lead to the same next outcome." },
      { label: "Tiny key present", resultLabel: "Required separation", resultValue: "PRESERVE", meter: 95, detail: "The key changes whether the door opens under the same action." },
      { label: "Camera brightness", resultLabel: "Required separation", resultValue: "TEST INVARIANCE", meter: 45, detail: "Ignore it only after checking that it does not change state estimation or action consequence." },
    ],
  ),
  "autoencoders-latents": discrete(
    { title: "Compression and task gate", question: "Can lower reconstruction error still produce a worse control representation?", change: "Compare two bottlenecks using both decoded error and key-detection recall.", observe: "The model with better average pixels can fail the non-compensable task feature.", explain: "Reconstruction measures the chosen observation loss; control requires separate task-critical retention checks.", complete: "Apply the key gate first, then compare reconstruction among passing bottlenecks.", boundary: "The metrics are fixed teaching rows, not a measured autoencoder experiment." },
    "Bottleneck",
    [
      { label: "Width 16", resultLabel: "MSE / key recall", resultValue: "0.018 / 60% · FAIL", meter: 60, detail: "Low average MSE hides frequent loss of the small control feature." },
      { label: "Width 32", resultLabel: "MSE / key recall", resultValue: "0.020 / 98% · PASS", meter: 98, detail: "Slightly worse pixel average preserves the decision-critical key." },
      { label: "Width 96", resultLabel: "MSE / key recall", resultValue: "0.012 / 99% · PASS", meter: 99, detail: "It passes but costs more capacity; task and resource requirements decide between passing models." },
    ],
  ),
  "stochastic-latents-vaes": numeric(
    { title: "VAE information-balance bench", question: "How does $\\beta$ trade observation information against prior compatibility?", change: "Change the weight on a fixed KL term of 0.818 beside reconstruction loss 0.05.", observe: "The total objective and collapse pressure rise even though the sampled latent arithmetic is unchanged.", explain: "Reparameterization carries gradients through $\\mu$ and $\\sigma$; $\\beta$ controls the relative KL pressure, not sample randomness itself.", complete: "Compute totals at $\\beta=0$, 1, and 2 and identify the high-pressure collapse risk.", boundary: "A scalar objective value cannot diagnose collapse without latent usage and downstream evidence." },
    { label: "KL weight $\\beta$", min: 0, max: 2, step: 0.25, initial: 1 },
    (value) => { const total = 0.05 + value * 0.818; return { controlValue: value.toFixed(2), resultLabel: "Reconstruction + weighted KL", resultValue: total.toFixed(3), meter: Math.min(100, total / 1.686 * 100), detail: value > 1.25 ? "High KL pressure: inspect posterior information before accepting a smaller KL." : value === 0 ? "No prior pressure: samples may be informative but imagination can become poorly matched." : "Balance both terms with latent-usage and rollout checks." }; },
  ),
  "action-conditioned-transitions": discrete(
    { title: "Matched-state action coverage", question: "Does the model learn an intervention or merely follow behavior-policy correlations?", change: "Inspect how many examples each action has from the same start-state cell.", observe: "A prediction contrast is unsupported when one action never occurs in that state.", explain: "Holding state fixed isolates action response; coverage determines whether the contrast is learned evidence or extrapolation.", complete: "Mark the supported and unsupported action contrasts, then state what data would close the gap.", boundary: "Observed support does not remove hidden confounding or guarantee calibrated outcomes." },
    "State-action cell",
    [
      { label: "Dry + straight", resultLabel: "Examples / status", resultValue: "9,800 · SUPPORTED", meter: 98, detail: "The behavior policy supplies many examples for this ordinary action." },
      { label: "Rain + sharp turn", resultLabel: "Examples / status", resultValue: "12 · SPARSE", meter: 18, detail: "The planner should treat this query as weakly supported and use uncertainty/fallback." },
      { label: "Ice + hard brake", resultLabel: "Examples / status", resultValue: "0 · EXTRAPOLATION", meter: 0, detail: "No action contrast in this state cell identifies the consequence." },
    ],
  ),
  "recurrent-state-space": discrete(
    { title: "RSSM information-boundary trace", question: "Which state path may use the current observation, and what changes at reset?", change: "Switch among posterior filtering, prior-only imagination, and a new-episode reset.", observe: "Observation corrects only the posterior; imagination uses the prior; reset erases previous-episode memory.", explain: "A recurrent state-space model separates deterministic memory, predictive prior, observation posterior, and reset boundaries.", complete: "Name legal inputs and expected equality/invariance for all three paths.", boundary: "The scalar states test information flow, not the quality of a trained RSSM." },
    "Execution path",
    [
      { label: "Filter real step", resultLabel: "Legal inputs", resultValue: "h + action + current observation", meter: 100, detail: "The posterior may correct the prior after measured evidence arrives." },
      { label: "Imagine future", resultLabel: "Legal inputs", resultValue: "h + proposed action only", meter: 72, detail: "Future observations do not exist; current/future target leakage is forbidden." },
      { label: "Episode reset", resultLabel: "Required state", resultValue: "FIXED h₀,z₀", meter: 100, detail: "Different previous histories must produce the same declared reset state." },
    ],
  ),
  "rssm-planet-case-study": discrete(
    { title: "World Models ↔ PlaNet architecture audit", question: "Where do observation inference, latent dynamics, reward prediction, and planning live in each system?", change: "Switch between the two published system contracts.", observe: "Both learn latent dynamics, while their state construction and controller/planner roles differ.", explain: "The comparison follows information flow rather than treating one paper as a version number of the other.", complete: "Trace one real observation and one imagined action through both columns.", boundary: "This course trace does not reproduce either paper’s benchmark results or implementation details." },
    "System",
    [
      { label: "World Models (2018)", resultLabel: "Flow", resultValue: "VAE z → MDN-RNN → small controller", meter: 72, detail: "Frames are encoded separately; recurrent latent dynamics supplies controller features and dreamed rollouts." },
      { label: "PlaNet (2019)", resultLabel: "Flow", resultValue: "RSSM prior/posterior → reward → MPC", meter: 88, detail: "Filtering and latent dynamics are integrated; online planning executes one action and replans." },
    ],
  ),
  "prediction-targets": discrete(
    { title: "Multi-head target alignment", question: "Which targets remain valid at a terminal edge?", change: "Inspect observation, reward, continuation, and padded-next-step heads at the same timestamp.", observe: "Reward and continuation remain supervised on the terminal transition; padding after it is masked.", explain: "Each head has its own time convention and valid-element denominator before loss weights combine them.", complete: "Assign every target and mask without shifting reward or training on padding.", boundary: "Correct alignment does not prove that a shared latent contains the information each head needs." },
    "Target head",
    [
      { label: "Observation at t", resultLabel: "Target", resultValue: "o_t · VALID", meter: 100, detail: "The filtered latent at t reconstructs or predicts the declared observation target." },
      { label: "Reward + continue on edge", resultLabel: "Target", resultValue: "r_t=1, c_t=0 · VALID", meter: 100, detail: "The terminal action still produced its reward and continuation label." },
      { label: "Padded state after terminal", resultLabel: "Target", resultValue: "MASK 0 · INVALID", meter: 0, detail: "No environment transition produced this padded row." },
    ],
  ),
  "reconstruction-feature-prediction": discrete(
    { title: "Pixel, feature, and collapse comparison", question: "Which objective preserves controllable structure without spending capacity on nuisance pixels?", change: "Compare pixel reconstruction, stopped-target feature prediction, and a constant-feature failure.", observe: "Different objectives win different metrics; the collapsed solution fails variance and task checks despite low matching loss.", explain: "Feature prediction inherits the target encoder’s invariances and needs an anti-collapse information boundary.", complete: "Choose the objective only after applying collapse and task-relevance gates.", boundary: "One toy nuisance/key split cannot establish which objective works best across domains." },
    "Objective path",
    [
      { label: "Pixel reconstruction", resultLabel: "Outcome", resultValue: "NOISE FIT HIGH · KEY RETAINED", meter: 65, detail: "Visible detail is covered, but unpredictable nuisance consumes loss and capacity." },
      { label: "Stopped feature target", resultLabel: "Outcome", resultValue: "NOISE IGNORED · KEY RETAINED", meter: 92, detail: "This passes only because the fixed target representation preserves the key in this fixture." },
      { label: "Constant features", resultLabel: "Outcome", resultValue: "LOSS LOW · COLLAPSE FAIL", meter: 8, detail: "Agreement without input-dependent variance is a trivial solution, not predictive representation learning." },
    ],
  ),
  "multistep-overshooting": discrete(
    { title: "Horizon-loss selector", question: "Which training path exposes error after the model consumes its own predictions?", change: "Score the same trajectory with teacher-forced one-step, free-running multi-step, and overshooting targets.", observe: "Only the latter paths reveal accumulated drift beyond corrected states.", explain: "Overshooting starts from an inferred state, rolls the prior without intermediate observations, and matches a later inferred target.", complete: "Identify the model inputs and target at every loss path.", boundary: "Longer horizons can add ambiguous targets and difficult gradients; they are not automatically better." },
    "Training path",
    [
      { label: "One-step teacher forced", resultLabel: "Visible bias", resultValue: "+0.10", meter: 20, detail: "Every input is corrected, so repeated composition is hidden." },
      { label: "Five-step free run", resultLabel: "Visible bias", resultValue: "+0.50", meter: 70, detail: "The prior consumes its own imperfect state for five transitions." },
      { label: "Five-step overshoot", resultLabel: "Training target", resultValue: "PRIOR z₅ ↔ POSTERIOR z₅", meter: 90, detail: "The later informed state supplies a target without leaking observations into the rollout path." },
    ],
  ),
  "latent-prior-posterior": discrete(
    { title: "KL route, free bits, and failure diagnosis", question: "Which parameters receive each KL gradient, what penalty remains after free bits, and which telemetry distinguishes collapse from prior lag?", change: "Switch among stopped KL routes, a numerical free-bit calculation, and two intervention signatures.", observe: "Gradient ownership, charged KL, posterior information use, and prior-only drift answer different questions.", explain: "Prior fitting moves the observation-free prior toward a fixed posterior target; posterior regularization limits observation-only information; interventions then test whether information exists and whether the prior can predict it.", complete: "Name every input and gradient receiver, calculate charged excess per dimension, then diagnose both telemetry cases without using KL magnitude alone.", boundary: "Small KL can mean agreement, collapse, or shared error; free bits and telemetry thresholds depend on parameterization and loss scale." },
    "KL or telemetry case",
    [
      { label: "sg(q) || p", resultLabel: "Gradient receiver", resultValue: "PRIOR PARAMETERS", meter: 70, detail: "The posterior is a fixed informed target; the prior learns to predict it from history." },
      { label: "q || sg(p)", resultLabel: "Gradient receiver", resultValue: "POSTERIOR PARAMETERS", meter: 70, detail: "The fixed prior regularizes how much current-observation information the posterior carries." },
      { label: "KL [.02,.18,.70], τ=.10", resultLabel: "Charged excess", resultValue: "[0,.08,.60] = .68 NATS", meter: 68, detail: "Apply max(KLᵢ−τ,0) per dimension: the full KL is .90 nats, but only .68 lies above the declared allowance." },
      { label: "KL≈0; shuffle unchanged", resultLabel: "Diagnosis", resultValue: "POSTERIOR COLLAPSE", meter: 10, detail: "The posterior carries no decision-used observation information: shuffling or zeroing z changes neither reconstruction nor prediction." },
      { label: "z used; prior drifts", resultLabel: "Diagnosis", resultValue: "PRIOR LAG", meter: 88, detail: "Latent intervention damages reconstruction, so the posterior is informative; immediate prior-only failure locates the deficient observation-free predictor." },
    ],
  ),
  "trajectory-data-replay": discrete(
    { title: "Replay window and support audit", question: "Can a large replay buffer still provide an invalid sequence or unsupported planner query?", change: "Inspect a valid window, a reset-crossing window, and a rare state-action cell.", observe: "Total transition count stays large while temporal validity and decision coverage change independently.", explain: "Replay preserves episode order, masks, policy/version provenance, and state-action coverage—not merely rows.", complete: "Reject the reset crossing and flag the sparse planner cell before training or planning.", boundary: "Counts do not measure hidden-state similarity or guarantee that the logged policy explored every relevant intervention." },
    "Replay audit case",
    [
      { label: "One-episode window", resultLabel: "Admission", resultValue: "VALID SEQUENCE", meter: 100, detail: "Episode ID, timestamps, actions, rewards, and continuation remain contiguous." },
      { label: "Cross-reset window", resultLabel: "Admission", resultValue: "REJECT / SPLIT", meter: 0, detail: "Array adjacency invents a transition between independent episodes." },
      { label: "Rain + sharp turn", resultLabel: "Coverage", resultValue: "12 OF 1,000,000 · SPARSE", meter: 12, detail: "The global buffer size hides weak support for the planner’s proposed state-action cell." },
    ],
  ),
  "uncertainty-ensembles": numeric(
    { title: "Calibration-bin check", question: "Does a predicted confidence correspond to observed frequency on held-out cases?", change: "Change the stated probability while the observed success rate stays at 70%.", observe: "The calibration gap and Brier contribution grow as stated confidence moves away from outcomes.", explain: "Ensemble spread can flag model disagreement; calibration separately compares probabilistic claims with frequencies using proper scores or reliability bins.", complete: "Find the calibrated point and explain why confident ensemble agreement can still share bias.", boundary: "One bin with 100 fixtures is not a complete calibration curve or a safety probability." },
    { label: "Predicted success probability", min: 0.1, max: 0.95, step: 0.05, initial: 0.7 },
    (value) => { const gap = Math.abs(value - 0.7); return { controlValue: value.toFixed(2), resultLabel: "Observed 0.70 · calibration gap", resultValue: gap.toFixed(2), meter: Math.min(100, gap / 0.6 * 100), detail: gap < 0.01 ? "This bin is calibrated to the observed frequency, though it may still be wrong on important slices." : "The stated confidence does not match the held-out frequency in this bin." }; },
  ),
  "imagined-rollouts": discrete(
    { title: "Imagined-return ledger", question: "Which reward and terminal-value terms survive continuation and discounting?", change: "Step through three predicted rewards and a terminal continuation flag.", observe: "Each row shows state source, action, reward, survival weight, and whether bootstrap is permitted.", explain: "An imagined return is a model-dependent sum; termination zeros later reward/value contribution.", complete: "Reproduce 6.14 and explain why no terminal value is added after $c=0$.", boundary: "The arithmetic is exact for the fixture; the predicted rewards and termination can still be wrong in the environment." },
    "Ledger row",
    [
      { label: "k=0", resultLabel: "Contribution", resultValue: "2.00", meter: 32, detail: "The filtered start enters the learned prior under the first candidate action." },
      { label: "k=1", resultLabel: "Contribution", resultValue: "0.90", meter: 47, detail: "Reward 1 is discounted once by 0.9 while continuation remains 1." },
      { label: "k=2 terminal", resultLabel: "Contribution / total", resultValue: "3.24 / 6.14", meter: 100, detail: "Reward 4 is discounted twice; continuation 0 blocks any later reward or terminal bootstrap." },
    ],
  ),
  "shooting-cem": numeric(
    { title: "Visible CEM refit", question: "How does the elite set change the next action proposal?", change: "Change the number of elites retained from fixed actions [-1,0,1,2] with scores [0,3,5,1].", observe: "The elite actions determine the refitted mean and spread; too few can collapse exploration.", explain: "CEM samples, scores, selects elites, and refits a bounded proposal rather than updating world-model weights.", complete: "Compute elite membership, mean, and why a variance floor may be needed.", boundary: "One scalar iteration does not represent stochastic outcome sampling or high-dimensional action smoothing." },
    { label: "Elite count", min: 1, max: 4, step: 1, initial: 2 },
    (value) => { const actions = [-1, 0, 1, 2], scores = [0, 3, 5, 1]; const elite = actions.map((a, i) => ({ a, score: scores[i] })).sort((a, b) => b.score - a.score).slice(0, value).map(({ a }) => a); const mean = elite.reduce((sum, a) => sum + a, 0) / elite.length; return { controlValue: String(value), resultLabel: "Elite actions / next mean", resultValue: `[${elite.join(",")}] / ${mean.toFixed(2)}`, meter: value / 4 * 100, detail: value === 1 ? "One elite sets zero empirical spread; retain a variance floor or smoothing." : "The refit concentrates the next sampler on high-scoring regions while preserving declared exploration." }; },
  ),
  "model-predictive-control": discrete(
    { title: "Two-cycle receding horizon", question: "What happens to the unused action tail after a real observation contradicts the rollout?", change: "Advance from planned sequence to first execution and then an unexpected slip.", observe: "Only action one reaches the environment; the new observation updates state before the tail is reconsidered.", explain: "MPC closes the loop by observe → plan → act once → observe → replan.", complete: "Identify the stale action and produce the new feasible first action.", boundary: "Replanning limits open-loop exposure but cannot undo a hazardous first action or repair unobserved state." },
    "Control-cycle stage",
    [
      { label: "Plan [R,R,U]", resultLabel: "Authority", resultValue: "ONLY FIRST R", meter: 35, detail: "The remaining R,U actions are proposals, not committed commands." },
      { label: "Observe slip", resultLabel: "State relation", resultValue: "MODEL ≠ REAL", meter: 70, detail: "The measured next state invalidates blind continuation of the old tail." },
      { label: "Replan [U,R,U]", resultLabel: "Next authority", resultValue: "FIRST U", meter: 100, detail: "A warm start may reuse the tail, but every candidate is rescored from the corrected state." },
    ],
  ),
  "differentiable-planning": numeric(
    { title: "Action-gradient and support surface", question: "Where does gradient ascent move a continuous candidate action, and when should support block it?", change: "Move action $a$ in $s'=a$ with objective $J=-(a-3)^2$ and a trained-support bound $|a|\\le2$.", observe: "The gradient points toward 3, but projection stops at the declared support/action boundary.", explain: "Differentiable planning changes action variables through fixed model derivatives; constraints and restarts are separate safeguards.", complete: "Predict the gradient sign on both sides of 3 and explain why $a>2$ is not admitted.", boundary: "This convex one-step surface omits local optima, stochasticity, exploding gradients, and learned-model derivative errors." },
    { label: "Candidate action $a$", min: -1, max: 4, step: 0.25, initial: 1 },
    (value) => { const objective = -Math.pow(value - 3, 2); const gradient = -2 * (value - 3); const supported = Math.abs(value) <= 2; return { controlValue: value.toFixed(2), resultLabel: "$J$ / $dJ/da$ / gate", resultValue: `${objective.toFixed(2)} / ${gradient.toFixed(2)} / ${supported ? "SUPPORTED" : "PROJECT"}`, meter: Math.max(0, Math.min(100, (objective + 16) / 16 * 100)), detail: supported ? "Gradient ascent may update this candidate, then project back into action bounds." : "The attractive model gradient lies outside declared action/data support and is not authorized." }; },
  ),
  "actor-critic-lambda": numeric(
    { title: "Recursive λ-return mixer", question: "How does $\\lambda$ change the balance between a critic bootstrap and a longer sampled return?", change: "Change $\\lambda$ for $r=1$, $\\gamma=0.9$, $V'=4$, and longer target 3.8.", observe: "The target shifts continuously between the one-step bootstrap and longer return.", explain: "$G_t^\\lambda=1+0.9[(1-\\lambda)4+\\lambda3.8]$; the stopped target trains the critic while actor updates follow imagined action quality.", complete: "Compute $\\lambda=0$, 0.5, and 1 and keep actor, critic, and world-model roles separate.", boundary: "This one recursion level does not reveal model bias, critic drift, or variance over full trajectories." },
    { label: "$\\lambda$", min: 0, max: 1, step: 0.1, initial: 0.5 },
    (value) => { const target = 1 + 0.9 * ((1 - value) * 4 + value * 3.8); return { controlValue: value.toFixed(1), resultLabel: "$G_t^\\lambda$", resultValue: target.toFixed(2), meter: (target - 4.42) / 0.18 * 100, detail: value === 0 ? "Pure one-step value bootstrap." : value === 1 ? "The longer sampled target receives all continuation weight." : "A declared mixture trades bootstrap bias against longer-return variance/model error." }; },
  ),
  "dreamer-imagination": discrete(
    { title: "Dreamer information-and-gradient loop", question: "Where do real observations stop and imagined behavior updates begin?", change: "Step through replay filtering, prior imagination, λ-target construction, and actor/critic updates.", observe: "Posterior states anchor the rollout; future observations never enter imagination; reward/value gradients train behavior, not the replay data.", explain: "Dreamer alternates grounded world-model learning with model-generated behavior learning before collecting more real experience.", complete: "Name the inputs and updated parameters at every stage.", boundary: "The trace describes the algorithmic contract and not DreamerV3’s benchmark performance or exact implementation." },
    "Dreamer stage",
    [
      { label: "Filter replay", resultLabel: "Evidence / update", resultValue: "REAL o,a → WORLD MODEL", meter: 25, detail: "Posterior filtering uses recorded observations and trains dynamics/prediction heads." },
      { label: "Imagine prior", resultLabel: "Evidence / update", resultValue: "z + ACTOR a → PREDICTED FUTURE", meter: 55, detail: "No future observation is available; the prior supplies states, rewards, and continuation." },
      { label: "Build λ targets", resultLabel: "Evidence / update", resultValue: "IMAGINED r,c,V → CRITIC TARGET", meter: 78, detail: "Model and value errors enter the behavior target." },
      { label: "Improve actor", resultLabel: "Evidence / update", resultValue: "RETURN GRADIENT → ACTOR", meter: 100, detail: "The improved actor later gathers new real data, closing the loop." },
    ],
  ),
  "muzero-tree-search": discrete(
    { title: "MuZero search trace", question: "How do selection, expansion, evaluation, backup, and visit counts interact?", change: "Advance one simulation through the learned hidden-state tree.", observe: "The dynamics model predicts reward/hidden state; the prediction head supplies policy/value; backup changes visits used as a policy target.", explain: "MuZero learns search-relevant quantities without reconstructing observations.", complete: "Trace one simulation and derive which root action gains probability.", boundary: "A three-node fixture omits player perspective, normalization, exploration noise, and large search budgets." },
    "Search phase",
    [
      { label: "Select", resultLabel: "Chosen edge", resultValue: "ROOT → ACTION B", meter: 20, detail: "Stored value, prior, and visit statistics select an edge." },
      { label: "Expand + evaluate", resultLabel: "Learned outputs", resultValue: "r=2, v=4, policy=[.7,.3]", meter: 55, detail: "Recurrent dynamics creates a hidden child; prediction evaluates it." },
      { label: "Backup", resultLabel: "Edge return", resultValue: "2 + 0.5×4 = 4", meter: 78, detail: "The discounted value travels toward the root and increments visits." },
      { label: "Visit target", resultLabel: "Improved root policy", resultValue: "B: 7/10 VISITS", meter: 100, detail: "Normalized root visit counts, not raw network priors alone, form the improved policy target." },
    ],
  ),
  "dyna-tdmpc-case-study": discrete(
    { title: "Four-family compute/interface matrix", question: "Where does each family spend model compute and what does its learned model predict?", change: "Select Dyna, Dreamer, MuZero, or TD-MPC under the same decision question.", observe: "The families differ in targets, training-time imagination, online search, and terminal-value use.", explain: "A useful comparison normalizes interface and expensive units before ranking performance.", complete: "Fill model target, training use, and per-action online compute for all four rows.", boundary: "The matrix is a taxonomy; it does not equate data, architecture, or benchmark budgets across papers." },
    "Family",
    [
      { label: "Dyna", resultLabel: "Model use", resultValue: "SYNTHETIC LEARNING UPDATES", meter: 45, detail: "A transition/reward model generates extra update experience; final online cost depends on the attached policy/planner." },
      { label: "Dreamer", resultLabel: "Model use", resultValue: "IMAGINED ACTOR/CRITIC TRAINING", meter: 55, detail: "Behavior normally acts directly online after latent imagination training." },
      { label: "MuZero", resultLabel: "Model use", resultValue: "PER-ACTION TREE SEARCH", meter: 88, detail: "Hidden dynamics, reward, policy, and value are repeatedly queried online." },
      { label: "TD-MPC", resultLabel: "Model use", resultValue: "SHORT ONLINE SEARCH + VALUE", meter: 75, detail: "Local latent rollouts are closed by a terminal value estimate." },
    ],
  ),
  "video-tokenization": numeric(
    { title: "Token count plus event-retention gate", question: "When does temporal stride erase a one-frame control event?", change: "Change stride for a 16-frame clip whose button press occurs only at frame 6.", observe: "Token count falls with stride, but the event-retention gate can fail independently of reconstruction averages.", explain: "Spatial and temporal token boundaries define what the dynamics model can observe and align with actions.", complete: "Find a low-token setting that loses frame 6 and a setting that preserves it.", boundary: "The retention rule samples fixed frame anchors; real tokenizers learn representations and require measured event tests." },
    { label: "Temporal stride", min: 1, max: 8, step: 1, initial: 2 },
    (value) => { const steps = Math.ceil(16 / value), tokens = steps * 64, retained = 6 % value === 0; return { controlValue: String(value), resultLabel: "Tokens / frame-6 event", resultValue: `${tokens} / ${retained ? "RETAINED" : "MISSED"}`, meter: retained ? 95 : 30, detail: `Encoded anchors occur every ${value} frame${value === 1 ? "" : "s"}; cost and event fidelity must be gated separately.` }; },
  ),
  "autoregressive-diffusion-dynamics": numeric(
    { title: "Fixed-output generator comparison", question: "Why are autoregressive token decisions and diffusion denoising passes not the same compute unit?", change: "Change diffusion passes for the same 512-token future block while AR remains 512 ordered decisions.", observe: "Both generate the same output contract but allocate sequential model evaluations differently.", explain: "AR conditions each later token on generated predecessors; diffusion repeatedly revises a noisy whole block under context.", complete: "Compare latency only after fixing output, quality gates, hardware, conditioning, and seeds.", boundary: "Counts alone do not measure wall-clock latency, parallelism, memory, controllability, or sample quality." },
    { label: "Diffusion denoising passes", min: 5, max: 60, step: 5, initial: 30 },
    (value) => ({ controlValue: String(value), resultLabel: "AR ordered decisions / diffusion block passes", resultValue: `512 / ${value}`, meter: value / 60 * 100, detail: "A full-block denoiser evaluation and one token decision perform different work; raw step counts cannot rank speed." }),
  ),
  "latent-actions-passive-video": discrete(
    { title: "Latent-code intervention", question: "Does an inferred action code represent controllable change or a correlated nuisance?", change: "Swap learned codes from the same starting frame and include a camera-pan confound.", observe: "True control-like codes change the agent trajectory; the nuisance code moves pixels without moving the agent.", explain: "An inverse model can absorb any recurrent transition factor when ground-truth actions are absent.", complete: "Separate direction codes from camera motion using matched-start interventions.", boundary: "Distinct generated outcomes do not align codes with physical motor commands without downstream/action evidence." },
    "Injected latent code",
    [
      { label: "Code 0", resultLabel: "Predicted change", resultValue: "AGENT MOVES LEFT", meter: 85, detail: "From the matched start, the code consistently changes agent position left." },
      { label: "Code 1", resultLabel: "Predicted change", resultValue: "AGENT MOVES RIGHT", meter: 85, detail: "A code swap produces a distinct agent consequence." },
      { label: "Code 2", resultLabel: "Predicted change", resultValue: "CAMERA PANS · AGENT FIXED", meter: 25, detail: "This transition code captured exogenous camera motion, not agent control." },
    ],
  ),
  "jepa-vjepa": discrete(
    { title: "JEPA branch and gradient boundary", question: "What does the predictor see, what is hidden, and which target branch is prevented from chasing the prediction?", change: "Switch among context encoding, target encoding, and an illegal jointly-collapsing path.", observe: "Masks separate visible context from hidden targets; stop-gradient/EMA preserves a stable target role.", explain: "The predictor maps context plus mask/position information to target-encoder features rather than raw pixels.", complete: "Trace inputs, outputs, and gradients for all branches and identify the collapse failure.", boundary: "A legal gradient graph does not prove the representation supports action-conditioned planning." },
    "Branch",
    [
      { label: "Context encoder", resultLabel: "Receives / emits", resultValue: "VISIBLE TUBES → CONTEXT FEATURES", meter: 70, detail: "Masked target regions are withheld from the predictor input." },
      { label: "Target encoder", resultLabel: "Receives / emits", resultValue: "TARGET TUBES → STOPPED FEATURES", meter: 90, detail: "The target representation supplies the objective without direct predictor-loss updates through this path." },
      { label: "Both chase loss", resultLabel: "Failure", resultValue: "CONSTANT-FEATURE COLLAPSE", meter: 5, detail: "If both sides can move together without other constraints, trivial agreement can erase information." },
    ],
  ),
  "genie-interactive-worlds": numeric(
    { title: "Latent-action interaction loop", question: "Does repeated control produce responsive and consistent futures over the tested horizon?", change: "Extend a deterministic repeated-right rollout whose fixture begins drifting after step 6.", observe: "Action response can pass early while identity/geometry consistency fails later.", explain: "Interactivity requires a prompt/start state, action input, generated consequence, and repeated closed-loop response—not video quality alone.", complete: "Locate the first failure horizon and keep it separate from official throughput claims.", boundary: "This browser fixture is not Genie, a learned generator, or a throughput/reliability measurement." },
    { label: "Repeated action horizon", min: 1, max: 10, step: 1, initial: 4 },
    (value) => ({ controlValue: `${value} steps`, resultLabel: "Control response / consistency", resultValue: value <= 6 ? "RIGHT / STABLE" : "RIGHT / IDENTITY DRIFT", meter: value <= 6 ? 90 : 45, detail: value <= 6 ? "The generated fixture responds to each code and preserves the tracked object." : "The direction remains responsive, but long-horizon identity consistency fails and must be reported." }),
  ),
  "foundation-world-models-case-study": discrete(
    { title: "Task-first contract selector", question: "Which published family has the closest demonstrated interface after task requirements are fixed?", change: "Change the task from interactive visual generation to image-goal robot planning.", observe: "The conditional selection changes because observations, actions, targets, and decision use differ.", explain: "A contract table excludes missing interfaces and preserves unknown evidence instead of averaging incompatible scores.", complete: "Make both selections and name at least one unresolved deployment gate.", boundary: "The selected family is a starting point under released evidence, not a universal ranking or deployment approval." },
    "Task",
    [
      { label: "Interactive visual world", resultLabel: "Closest demonstrated interface", resultValue: "GENIE FAMILY", meter: 78, detail: "Latent controls and interactive generation match the task; reliability and agent utility remain open gates." },
      { label: "Image-goal robot planning", resultLabel: "Closest demonstrated interface", resultValue: "V-JEPA 2-AC / CONTROL FAMILY", meter: 82, detail: "Action-conditioned robot post-training and image-goal planning are directly relevant; safety, latency, and target-robot evidence remain missing." },
    ],
  ),
  "world-model-evaluation": discrete(
    { title: "Decision-specific protocol builder", question: "Which evaluation row can support admission to constrained closed-loop planning?", change: "Compare an aggregate prediction score, horizon slices, and a fixed-budget closed-loop protocol.", observe: "A high average is diagnostic evidence; the deployment decision requires matched conditions and non-compensable gates.", explain: "Evaluation follows the consuming decision: data/support, horizon calibration, planner budget, constraints, seeds, and real outcomes remain explicit.", complete: "Choose the admissible protocol and state what each rejected row still helps diagnose.", boundary: "A passing offline/fixture protocol is not a safety certificate for an untested real system." },
    "Evaluation row",
    [
      { label: "Aggregate one-step MSE", resultLabel: "Decision use", resultValue: "DIAGNOSTIC ONLY", meter: 45, detail: "It can hide rare critical slices and does not measure planner exploitation." },
      { label: "Per-horizon calibration", resultLabel: "Decision use", resultValue: "MODEL HORIZON GATE", meter: 72, detail: "This bounds where imagined predictions remain usable but still omits control outcomes." },
      { label: "Matched closed loop", resultLabel: "Decision use", resultValue: "ADMISSION EVIDENCE", meter: 95, detail: "Fixed starts, budgets, seeds, constraint violations, returns, and uncertainty match the consuming decision." },
    ],
  ),
  "compounding-error-exploitation": discrete(
    { title: "Separate horizon drift from planner overfitting", question: "Does a failure grow because one plan is composed farther, because more candidates increase extreme selection, or both?", change: "Hold population fixed while increasing horizon, then hold horizon fixed while increasing population.", observe: "The first comparison changes rollout composition error; the second changes optimizer selection pressure without changing the path length.", explain: "Compounding error shifts the states seen by later transitions, while planner overfitting selects an extreme false positive from a larger set of model-scored candidates.", complete: "Name the isolated cause in both matched pairs and choose a cause-specific mitigation.", boundary: "All scores are deterministic teaching fixtures; they illustrate diagnostic controls rather than an empirical failure law." },
    "Matched planner case",
    [
      { label: "H=4, N=16", resultLabel: "Imagined / reference gap", resultValue: "0.20 · BASELINE", meter: 12, detail: "This is the shared low-pressure baseline for both controlled comparisons." },
      { label: "H=12, N=16", resultLabel: "Isolated change", resultValue: "+1.10 · HORIZON DRIFT", meter: 62, detail: "Population stays at 16; repeated model-generated inputs and signed transition bias create the larger gap. Shorten or replan." },
      { label: "H=4, N=256", resultLabel: "Isolated change", resultValue: "+1.35 · ELITE SELECTION", meter: 76, detail: "Horizon stays at 4; broader search finds an unsupported optimistic false positive. Gate support/uncertainty and replay elites." },
      { label: "H=12, N=256", resultLabel: "Combined gap", resultValue: "+2.70 · BOTH CAUSES", meter: 100, detail: "Long composition reaches shifted states and broad selection chooses the most favorable model error; change one factor at a time before assigning cause." },
    ],
  ),
  "goal-conditioned-robotics": discrete(
    { title: "Goal metric versus physical contract", question: "Which trajectory should execute when visual similarity conflicts with safety or the operational success predicate?", change: "Compare two candidate plans and a visually attractive false success.", observe: "Learned goal distance ranks only candidates that pass physical relation and safety gates.", explain: "A goal-conditioned controller joins belief, candidate action consequences, task predicate, constraints, and one executed action.", complete: "Reject the unsafe and false-success plans before ranking the feasible plan.", boundary: "The fixed distances and collision flags are fixtures, not robot measurements." },
    "Candidate",
    [
      { label: "A: distance .10", resultLabel: "Physical checks", resultValue: "COLLISION · REJECT", meter: 10, detail: "Better embedding similarity cannot compensate for a predicted constraint violation." },
      { label: "B: distance .20", resultLabel: "Physical checks", resultValue: "RELATION + SAFETY PASS", meter: 95, detail: "This candidate improves cup-left-of-plate and remains feasible, so it may execute one action." },
      { label: "C: matching image", resultLabel: "Physical checks", resultValue: "WRONG OBJECT RELATION", meter: 25, detail: "Visual similarity alone does not satisfy the declared physical success predicate." },
    ],
  ),
  "system-identification-sim-to-real": numeric(
    { title: "Excitation and gain identification", question: "When does an input-response trace distinguish actuator gain?", change: "Increase action magnitude in $\\Delta v=ga+0.02$ with true fixture gain 0.4 and fixed measurement offset 0.02.", observe: "Zero action is unidentifiable; weak excitation magnifies the offset; stronger safe excitation approaches the fixture gain.", explain: "Identification requires inputs whose effects differ across parameter values, followed by held-out residual and transfer checks.", complete: "Compare zero, weak, and strong safe excitation and state what remains confounded.", boundary: "The one-parameter linear fixture omits friction, delay, noise distributions, and real-system safety constraints." },
    { label: "Excitation action $a$", min: 0, max: 1, step: 0.05, initial: 0.5 },
    (value) => { const estimate = value === 0 ? undefined : (0.4 * value + 0.02) / value; return { controlValue: value.toFixed(2), resultLabel: "Estimated gain", resultValue: estimate === undefined ? "UNIDENTIFIABLE" : estimate.toFixed(2), meter: estimate === undefined ? 0 : Math.max(0, 100 - Math.abs(estimate - 0.4) / 0.4 * 100), detail: estimate === undefined ? "Every gain predicts the same no-input response inside the declared model." : "Validate this estimate on held-out excitation; structured residuals imply noise, timing, or missing dynamics." }; },
  ),
  "safe-constrained-planning": discrete(
    { title: "Calibrated feasibility and fallback", question: "How do calibration, feasibility, reward ranking, and monitor authority combine?", change: "Inspect a calibrated feasible plan, a miscalibrated estimate, and a monitor override.", observe: "Reward is considered only after feasibility; unknown calibration and runtime threshold violations both route away from nominal execution.", explain: "A chance constraint consumes calibrated probability, while an independent monitor owns final timely fallback authority.", complete: "Trace all three cases to the exact actuator command.", boundary: "Passing this fixture does not certify unmodeled hazards or operation outside the tested fallback envelope." },
    "Runtime case",
    [
      { label: "p=.02 calibrated", resultLabel: "Route", resultValue: "FEASIBLE → REWARD RANK", meter: 85, detail: "The plan may compete among candidates below the 0.05 limit." },
      { label: "p=.02 uncalibrated OOD", resultLabel: "Route", resultValue: "ABSTAIN / FALLBACK", meter: 20, detail: "A small number without calibration/support cannot satisfy the chance constraint." },
      { label: "Distance .25m < .30m", resultLabel: "Route", resultValue: "MONITOR OVERRIDE → STOP", meter: 0, detail: "The 20 ms independent monitor blocks the learned command regardless of nominal reward." },
    ],
  ),
  "world-model-operations-case-study": discrete(
    { title: "Release-bundle rollback rehearsal", question: "Which gate catches schema incompatibility, authority overreach, or a deadline regression?", change: "Advance a candidate through manifest, shadow, canary, and rollback cases.", observe: "Authority grows only after compatible evidence; rollback restores the complete known-good bundle.", explain: "Operational correctness joins model/schema/planner/safeguard versions with telemetry, stop rules, and atomic recovery.", complete: "Reject the incompatible bundle and execute the deadline-triggered rollback.", boundary: "The deterministic manifest validates release logic, not production reliability or physical safety." },
    "Release event",
    [
      { label: "Width mismatch", resultLabel: "Gate", resultValue: "MANIFEST REJECT", meter: 0, detail: "Encoder/dynamics schema mismatch blocks evaluation before the planner receives authority." },
      { label: "Shadow pass", resultLabel: "Authority", resultValue: "LOG ONLY · NO ACTUATOR", meter: 45, detail: "Proposals and outcomes can be compared without execution authority." },
      { label: "Canary p99=63ms", resultLabel: "Stop rule", resultValue: "FAIL > 50ms", meter: 15, detail: "Expansion stops and the release incident is preserved." },
      { label: "Rollback", resultLabel: "Restored output", resultValue: "FULL wm-16 BUNDLE", meter: 100, detail: "Encoder, dynamics, planner, schemas, calibration, constraints, and fallback return together." },
    ],
  ),
  "object-centric-dynamics": discrete(
    { title: "Slot matching and identity audit", question: "Does an exchangeable slot preserve entity identity through order changes and occlusion?", change: "Compare index matching, permutation matching, and an identity switch after occlusion.", observe: "Set matching fixes order only; it cannot excuse a slot that binds to the wrong entity over time.", explain: "Competitive slots form unordered hypotheses; dynamics and temporal evidence must preserve interactions and identity separately.", complete: "Choose the correct pairing and diagnose the occlusion failure.", boundary: "A localized decoded region still need not represent an independently manipulable physical object." },
    "Slot case",
    [
      { label: "Targets reversed", resultLabel: "Index loss", resultValue: "FALSE MISMATCH", meter: 30, detail: "Slot indices are exchangeable; fixed-index comparison penalizes the correct set." },
      { label: "Permutation match", resultLabel: "Set loss", resultValue: "ZERO ATTRIBUTE ERROR", meter: 95, detail: "Minimum-cost pairing aligns red with red and blue with blue regardless of order." },
      { label: "After occlusion", resultLabel: "Identity check", resultValue: "CAR SLOT → TREE · FAIL", meter: 10, detail: "Per-frame segmentation passes while temporal binding and identity persistence fail." },
    ],
  ),
  "hierarchical-multiscale": discrete(
    { title: "Two-level trace and matched-compute audit", question: "How do slow state, subgoal, fast transitions, surprise, and boundary decisions interact—and what remains after matching compute with a flat planner?", change: "Step through the two-clock trace, then compare hierarchy and flat planning at 10 model calls.", observe: "Information travels downward as a subgoal and upward as outcomes/surprise; matched calls still leave different latency and horizon coverage.", explain: "A boundary detector ends or revises a persistent abstraction when fast evidence invalidates it. A fair benefit claim keeps calls, latency, data, starts, and decision metrics visible.", complete: "Trace both directions at collision and state only the bounded conclusion allowed by the matched fixture.", boundary: "The call counts, latency, and coverage are deterministic examples—not measurements of any published implementation." },
    "Trace or budget row",
    [
      { label: "Slow state", resultLabel: "Upper-level output", resultValue: "CROSS ROOM · DURATION 4", meter: 15, detail: "The slow latent summarizes context and emits a persistent subgoal plus declared duration." },
      { label: "Fast step 1", resultLabel: "Downward path", resultValue: "SUBGOAL → ACTION RIGHT", meter: 32, detail: "The low-level dynamics conditions on current fast state and the slow subgoal, then returns the observed outcome upward." },
      { label: "Fast step 2 collision", resultLabel: "Upward path", resultValue: "SURPRISE → BOUNDARY", meter: 50, detail: "Observed contact contradicts free-space prediction; error and outcome must reach the boundary detector immediately." },
      { label: "Boundary decision", resultLabel: "Authority", resultValue: "TERMINATE + REPLAN", meter: 68, detail: "Continuing to step 3 would apply a stale high-level choice after its success conditions became false." },
      { label: "Hierarchy: 10 calls", resultLabel: "Fixture cost / reach", resultValue: "22 ms / 8 FAST STEPS", meter: 88, detail: "Two slow-state calls plus eight fast-transition calls consume the complete matched budget in this teaching fixture." },
      { label: "Flat: 10 calls", resultLabel: "Fixture cost / reach", resultValue: "35 ms / 4 FAST STEPS", meter: 72, detail: "The flat brancher uses the same 10 calls but different sequential work. This supports only the fixture trade-off; measured hardware and decision quality are still required." },
    ],
  ),
  "geometry-physical-priors": discrete(
    { title: "Geometry, solver, and assumption stress test", question: "Does a failure come from an equivariance violation, a frame conversion, numerical integration, or a broken smooth-dynamics assumption?", change: "Switch among matched rotation, frame, step-size, and contact cases.", observe: "Each row has a different reference relation and therefore a different valid diagnosis or repair.", explain: "Symmetry constrains transformations, frames define coordinates, solvers approximate continuous dynamics, and contacts introduce events that a smooth ODE may not represent.", complete: "Compute both sides of the rotation equality, compare two Euler step sizes, and reject the below-floor smooth prediction.", boundary: "Passing any one row does not establish conservation, all coordinate contracts, solver convergence, or physical correctness outside tested regimes." },
    "Stress-test row",
    [
      { label: "Rotate 0°", resultLabel: "Required / predicted residual", resultValue: "[1,0] / [1,0] = 0", meter: 100, detail: "The fixed-vector fixture happens to pass when the transformation is the identity." },
      { label: "Rotate 90°", resultLabel: "Required / predicted residual", resultValue: "[0,1] / [1,0] = 1.41", meter: 18, detail: "The transformed reference rotates but the flawed prediction does not, directly falsifying equivariance." },
      { label: "World → robot frame", resultLabel: "Coordinate contract", resultValue: "[1,0]W → [0,-1]R", meter: 82, detail: "A robot frame rotated 90° counterclockwise from world coordinates requires the inverse rotation for coordinate conversion; frame labels prevent a false equality." },
      { label: "Euler Δt=.5", resultLabel: "z(1) / exact / error", resultValue: ".250 / .368 / .118", meter: 42, detail: "For dz/dt=−z, two coarse Euler steps create numerical error even when the derivative model is exact." },
      { label: "Euler Δt=.1", resultLabel: "z(1) / exact / error", resultValue: ".349 / .368 / .019", meter: 88, detail: "Ten smaller steps reduce this fixture's integration error; a convergence sweep is evidence about the solver, not learned physics." },
      { label: "Floor contact", resultLabel: "Smooth prediction / admissible", resultValue: "HEIGHT −.10 / 0", meter: 5, detail: "The smooth free-flight prior crosses the floor. Contact needs an event, complementarity/projection rule, or separately validated contact-capable model." },
    ],
  ),
  "causal-counterfactual-models": discrete(
    { title: "Condition, intervene, counterfact, or abstain", question: "How can severity reverse an observational braking association, and when does a missing action cell block identification?", change: "Inspect the logged association, two standardized interventions, a positivity failure, and a same-unit counterfactual.", observe: "The observed 20% brake risk differs from the 12.5% standardized intervention risk; an unsupported black-ice action has no identified estimate.", explain: "Conditioning retains severity-dependent policy selection; adjustment estimates a population intervention only under the stated graph/assumptions; a counterfactual reuses one case's inferred background.", complete: "Reproduce all three fractions, identify the empty support cell, and name the target population or unit for each query.", boundary: "The table is a deterministic identified-fixture calculation. Hidden confounding, measurement error, consistency violations, or different target populations can invalidate the adjustment." },
    "Query or support cell",
    [
      { label: "Observed: natural brake", resultLabel: "$P(Y|A=brake)$", resultValue: "20 / 100 = .200", meter: 35, detail: "Braking rows contain 80 severe and only 20 mild drives, so this filtered association retains severity confounding." },
      { label: "Intervene: brake", resultLabel: "$P(Y|do(brake))$", resultValue: ".5(.25)+.5(0)=.125", meter: 72, detail: "Standardize the stratum-specific brake risks to a 50/50 severe/mild target population under the stated adjustment assumptions." },
      { label: "Intervene: no brake", resultLabel: "$P(Y|do(no brake))$", resultValue: ".5(.40)+.5(.05)=.225", meter: 82, detail: "The adjusted fixture says forced braking lowers population risk even though the natural-braking association looked worse." },
      { label: "Black ice: no-brake n=0", resultLabel: "Identification", resultValue: "POSITIVITY FAIL · ABSTAIN", meter: 0, detail: "No logged no-brake action exists in this represented condition, so its effect cannot be recovered by this adjustment table." },
      { label: "This crash, brake earlier", resultLabel: "Unit query", resultValue: "SAME INFERRED U + NEW ACTION", meter: 92, detail: "The counterfactual reuses this episode's inferred severity/grip background after replacing its action; that is stronger than a population intervention." },
    ],
  ),
  "language-multimodal-world-models": discrete(
    { title: "Grounding, clock, and missing-modality audit", question: "Does language change a grounded action consequence using only decision-time evidence?", change: "Hold the scene fixed while swapping the instruction, shifting telemetry time, or removing language.", observe: "A grounded branch changes the target relation; clock errors create leakage/misalignment; safe degradation is explicit.", explain: "Multimodal prediction aligns clocks, grounds references, conditions dynamics on actions/instructions, and tests each modality by intervention.", complete: "Pass the instruction swap and identify the timing and missing-language failures.", boundary: "A response change can still use shortcuts; controlled nuisance-preserving swaps and real outcome tests remain necessary." },
    "Audit case",
    [
      { label: "Swap left ↔ right", resultLabel: "Predicted relation", resultValue: "CHANGES WITH INSTRUCTION", meter: 92, detail: "The scene is fixed; grounded language changes the candidate consequence appropriately." },
      { label: "+120ms clock offset", resultLabel: "Timeline", resultValue: "FUTURE SENSOR LEAK", meter: 5, detail: "A telemetry value recorded after the target outcome enters context and invalidates the test." },
      { label: "Language missing", resultLabel: "Fallback", resultValue: "ASK / SAFE NO-OP", meter: 70, detail: "The task goal is ambiguous, so the controller does not invent a relation or execute blindly." },
    ],
  ),
  "world-model-research-capstone": discrete(
    { title: "Preregistered study gate", question: "Which study decision remains valid after the primary threshold fails?", change: "Compare a protocol fixed before results, a post-hoc threshold change, and an exploratory slice.", observe: "Only the preregistered rule controls the confirmatory conclusion; the slice can motivate a new study.", explain: "A falsifiable capstone pins branch, baseline, changed case, budget, seeds, metrics, threshold, failures, and evidence tier before final rows.", complete: "Report the null, label exploration, and define one next discriminating experiment.", boundary: "Preregistration reduces analytic flexibility; it does not make a tiny fixture representative or eliminate implementation errors." },
    "Decision path",
    [
      { label: "Apply fixed ≥.05 gate", resultLabel: "Observed improvement", resultValue: ".01 · NOT SUPPORTED", meter: 20, detail: "Residual passes, but the required improvement gate fails; preserve the null result." },
      { label: "Lower gate after result", resultLabel: "Status", resultValue: "POST-HOC · INVALID CONFIRMATION", meter: 0, detail: "Changing the threshold after reading results converts the claim to exploratory analysis." },
      { label: "Strong unplanned slice", resultLabel: "Status", resultValue: "EXPLORATORY → PREREGISTER NEXT", meter: 60, detail: "Publish the slice as a hypothesis and test it on new changed cases under a fixed protocol." },
    ],
  ),
};
