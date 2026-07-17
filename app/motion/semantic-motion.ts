import type { ThreeStoryConcept } from "../three-story-math";

export type MotionEffect = "flow" | "mass" | "orbit" | "route" | "snap" | "gate" | "trace" | "field";

export type MotionContract = {
  effect: MotionEffect;
  targets: string;
  question: string;
  represents: string;
  boundary: string;
};

export type StoryMotionContract = MotionContract & {
  stages: readonly [string, string, string, string];
  routes: string;
};

export const llmLabMotionIds = [
  "orientation", "tokens", "vectors", "positions", "attention", "prediction", "scaling", "optimizer", "preference", "lora", "moe", "distillation", "rl",
  "block", "gpt", "pipeline", "objectives", "systems", "evaluation", "tensors", "softmax", "gradient", "decoding", "kvcache", "quantization",
  "serving", "testtime", "context", "rag", "agents", "evaldesign", "security", "observability", "multimodal", "interpretability",
] as const;

export type LlmLabMotionId = (typeof llmLabMotionIds)[number];

export const worldModelLabMotionIds = [
  "wm-state", "wm-belief", "wm-latent", "wm-rollout", "wm-planner", "wm-video", "wm-uncertainty", "wm-safety", "wm-evaluation",
] as const;

export type WorldModelLabMotionId = (typeof worldModelLabMotionIds)[number];
export type LabMotionId = LlmLabMotionId | WorldModelLabMotionId;

const contract = (effect: MotionEffect, targets: string, question: string, represents: string, boundary: string): MotionContract => ({ effect, targets, question, represents, boundary });

export const llmLabMotionContracts: Record<LlmLabMotionId, MotionContract> = {
  orientation: contract("gate", ".objective-tabs button,.objective-grid>div,.toy-badge", "What check does this language task require before reliance?", "Supplied text, changing evidence, and consequential authority entering distinct verification paths.", "The cards teach responsibility boundaries; they do not verify a real source or execute an action."),
  tokens: contract("snap", ".token-output span", "Where does text become a discrete token sequence?", "Characters regrouping into bounded token spans and stable teaching IDs.", "The split is a toy tokenizer fixture, not a production vocabulary trace."),
  vectors: contract("field", ".vector-map button,.similarity-list div", "How does the selected anchor change every visible comparison?", "One anchor and its relative distances to the same fixed points.", "The two-dimensional points are a hand-authored projection."),
  positions: contract("orbit", ".rotation-ring,.position-sequence button,.rotation-readout", "What changes when identity stays fixed but position changes?", "A position-indexed rotation and the selected token marker.", "The plane is a small coordinate illustration, not a full model representation."),
  attention: contract("route", ".attention-bars span,.attention-bars i,.query-picker button", "Which keys receive mass from the selected query?", "Query-specific score routes, causal masking, and normalized weights.", "The fixed scores represent one teaching head, not a behavioral explanation."),
  prediction: contract("mass", ".distribution i,.sample-stream span,.sampler-controls", "How does temperature reshape selection without retraining?", "Probability mass changing before one sampled outcome is emphasized.", "The logits are fixed teaching values and sampled tokens are local fixtures."),
  scaling: contract("mass", ".budget-bar span,.scaling-meters>div", "Where does a fixed compute budget go?", "A conserved budget moving between model and token allocations.", "The relationship illustrates imbalance and is not a fitted scaling law."),
  optimizer: contract("trace", ".optimizer-ball,.loss-curve,.optimizer-controls", "Which step size moves toward or beyond the minimum?", "The exact deterministic optimizer position over bounded steps.", "The two-dimensional surface omits stochastic high-dimensional optimization."),
  preference: contract("route", ".response-pair>button,.preference-signal,.policy-choice", "Which learning signal follows a relative choice?", "Chosen and rejected branches feeding the selected post-training method.", "One preference pair is noisy evidence, not universal quality."),
  lora: contract("route", ".factor,.full-matrix,.lora-stats>div", "How does rank change the trainable side path?", "Frozen full weights beside low-rank down/up projections.", "Parameter arithmetic does not guarantee equal downstream quality."),
  moe: contract("route", ".routed-token,.router-lines i,.expert-pool>div", "Which experts execute for this token?", "Token-specific top-k routes through a fixed expert pool.", "Capacity, dispatch communication, and dropped-token policy are simplified."),
  distillation: contract("mass", ".teacher-student>div,.distill-arrow,.distribution i", "Which teacher beliefs survive beyond the top class?", "Soft probability mass moving from teacher targets toward a student.", "The fixed logits do not measure student quality."),
  rl: contract("route", ".reward-controls,.policy-choice,.lab-readout", "How do reward and baseline become a policy update?", "Reward minus baseline controlling direction and strength.", "The Bernoulli fixture omits trajectories, clipping, and value learning."),
  block: contract("flow", ".step-track button,.step-readout", "What changes while the residual width stays invariant?", "A state packet advancing through norm, sublayer, and residual additions.", "The walkthrough shows one pre-norm architecture variant."),
  gpt: contract("flow", ".step-track button,.step-readout", "Where do tensor axes change in the GPT path?", "Token IDs advancing through width-preserving blocks to vocabulary logits.", "This is a shape trace, not an executed GPT-2 run."),
  pipeline: contract("flow", ".pipeline-stations button,.failure-card", "Which subsystem owns the selected optimizer-step failure?", "An ordered dependency chain with one active station and failure signature.", "The control room is a systems walkthrough, not distributed telemetry."),
  objectives: contract("snap", ".objective-tabs button,.objectives-lab code,.objective-grid>div", "Where are input, targets, and loss for each objective?", "Serialization and loss positions regrouping under an objective choice.", "The examples are deliberately small constructed sequences."),
  systems: contract("route", ".device-grid>div,.objective-tabs button", "What does each device own and exchange?", "Devices regrouping under data, tensor, or pipeline parallelism.", "The eight-device topology omits many production layouts."),
  evaluation: contract("trace", ".metric-trace i,.diagnosis", "Which trace shape changes the diagnosis?", "A deterministic metric sequence and its decisive region.", "The values are fixtures, not recorded training measurements."),
  tensors: contract("snap", ".shape-grid i,.shape-equation span,.foundation-readouts>div", "Which axes survive the projection?", "Tensor cells regrouping as the final feature axis changes.", "The grid validates shape arithmetic, not kernel performance."),
  softmax: contract("mass", ".probability-bars b,.foundation-readouts>div", "How does one relative logit move probability mass and loss?", "Conserved probability mass, entropy, loss, and gradient sign.", "Three fixed logits do not represent a model vocabulary."),
  gradient: contract("route", ".backprop-chain span,.lab-action,.lab-caption", "How does error travel backward before the optimizer moves a weight?", "Forward values, local sensitivities, and one explicit update.", "The scalar quadratic is not a neural-network training measurement."),
  decoding: contract("gate", ".probability-bars>div,.objective-tabs button", "Which branches survive truncation and how are they renormalized?", "Candidate removal followed by probability-mass redistribution.", "The five-token distribution is fixed and illustrative."),
  kvcache: contract("flow", ".memory-ledger>div,.foundation-controls label", "What persists and what appends during decoding?", "A cache ledger scaling with layers, heads, positions, and bytes.", "The formula excludes weights, allocator overhead, and sharing."),
  quantization: contract("snap", ".quantized-wave i,.memory-ledger>div", "Where do continuous values land when precision shrinks?", "Values snapping to fewer levels beside memory and error readouts.", "The error proxy is illustrative and not a quality result."),
  serving: contract("flow", ".request-lanes>div,.request-lanes i,.memory-ledger>div", "Which decode slots are useful and which are idle?", "Request lanes advancing through a fixed scheduling fixture.", "The lane diagram is not a latency benchmark."),
  testtime: contract("route", ".budget-map i,.memory-ledger>div,.foundation-controls label", "Does more generation or better selection remove the bottleneck?", "Candidate compute fanning out and returning through a verifier gate.", "Coverage is a toy budget index and never predicted accuracy."),
  context: contract("snap", ".context-stack button,.memory-ledger>div", "Which context blocks add signal and which add clutter?", "Evidence, examples, and distractors entering a bounded stack.", "The score is illustrative and needs representative evaluation."),
  rag: contract("route", ".retrieval-results>div,.memory-ledger>div", "Which retrieved items enter context and why?", "A ranked top-k route with relevant and distracting evidence.", "The curves are teaching fixtures rather than universal retrieval optima."),
  agents: contract("route", ".agent-loop button,.permission-toggle,.decision-panel", "Which transition is legal and who authorizes a side effect?", "A guarded state machine with retry, receipt, and stop paths.", "No external tool executes in this browser simulation."),
  evaldesign: contract("mass", ".objective-tabs button,.judge-card,.decision-panel", "Which slice or scorer changes the deployment conclusion?", "Aggregate and subgroup evidence changing under protocol choices.", "Fixed pass rates expose confounding and are not benchmark results."),
  security: contract("gate", ".injection-card,.permission-toggle,.decision-panel", "Which instruction may cross the authority boundary?", "Untrusted text stopping while authenticated scope follows a checked route.", "The visual demonstrates control placement, not security certification."),
  observability: contract("trace", ".trace-waterfall>button,.decision-panel", "Where does the failing request first diverge?", "A subsystem waterfall leading to one owned incident hypothesis.", "The deterministic trace is not production telemetry."),
  multimodal: contract("flow", ".patch-image i,.multimodal-flow b,.memory-ledger>div", "Which visual regions and tokens enter the shared task path?", "Patch groups joining a projector and text model interface.", "Highlights are teaching annotations, not learned attention."),
  interpretability: contract("route", ".evidence-band span,.decision-panel,.objective-tabs button", "Does the method show observation, causality, or an edit?", "Distinct probe, intervention, and behavior-change evidence paths.", "One illustrated intervention cannot establish a universal mechanism."),
};

export const worldModelLabMotionContracts: Record<WorldModelLabMotionId, MotionContract> = {
  "wm-state": contract("trace", ".wm-lab-readout,.wm-lab-detail,meter", "How does action move the next-state prediction?", "A fixed current state, signed action, and resulting next-state quantity.", "The transition is deterministic teaching arithmetic, not learned dynamics."),
  "wm-belief": contract("mass", ".wm-lab-readout,.wm-lab-detail,meter", "How does evidence redistribute hidden-state belief?", "Prior mass multiplied by likelihood and normalized into posterior mass.", "The two-state likelihood fixture is not a calibrated sensor model."),
  "wm-latent": contract("snap", ".wm-lab-readout,.wm-lab-detail,meter", "What is retained or discarded by the bottleneck?", "Input capacity compressing into a controlled latent width.", "The detail index is illustrative, not measured reconstruction quality."),
  "wm-rollout": contract("trace", ".wm-lab-readout,.wm-lab-detail,meter", "How does signed residual error compose with horizon?", "Observed and imagined state paths diverging across repeated transitions.", "The linear drift approximation omits nonlinear feedback."),
  "wm-planner": contract("route", ".wm-lab-readout,.wm-lab-detail,meter", "How do breadth and horizon spend transition budget?", "Candidate futures fanning out through a fixed search budget.", "Exploit pressure is illustrative and not a failure probability."),
  "wm-video": contract("snap", ".wm-lab-readout,.wm-lab-detail,meter", "Which frames and patches become model tokens?", "Temporal sampling compacting a spatiotemporal token grid.", "Token count does not establish latency or model quality."),
  "wm-uncertainty": contract("gate", ".wm-lab-readout,.wm-lab-detail,meter", "When should prediction spread change authority?", "Several predictions separating around a review threshold.", "Disagreement is uncalibrated and can miss shared bias."),
  "wm-safety": contract("gate", ".wm-lab-readout,.wm-lab-detail,meter", "Which candidates remain feasible before reward ranking?", "A chance constraint routing candidates to nominal execution or fallback.", "The supplied risk is a fixture, not a calibrated safety estimate."),
  "wm-evaluation": contract("mass", ".wm-lab-readout,.wm-lab-detail,meter", "Which critical failure can the aggregate hide?", "Common and rare slice counts combining while a separate gate remains.", "The counts demonstrate aggregation and are not benchmark results."),
};

const story = (effect: MotionEffect, targets: string, stages: StoryMotionContract["stages"], routes: string, question: string, represents: string, boundary: string): StoryMotionContract => ({ effect, targets, stages, routes, question, represents, boundary });

export const storyMotionContracts: Record<ThreeStoryConcept, StoryMotionContract> = {
  pipeline: story("flow", ".mechanism-step", [".mechanism-step:nth-of-type(1)", ".mechanism-step:nth-of-type(2)", ".mechanism-step:nth-of-type(3)", ".mechanism-step:nth-of-type(4)"], ".mechanism-route", "Which representation becomes the next?", "Four ordered transformations with explicit handoffs.", "The flow is conceptual rather than a recorded execution."),
  coordinates: story("route", ".mechanism-axis,.mechanism-vector,.mechanism-component,.mechanism-marker", [".mechanism-axis", ".mechanism-vector", ".mechanism-component", ".mechanism-marker"], ".mechanism-vector,.mechanism-component", "How do components locate one vector?", "Axes, components, and a final point.", "Only a small coordinate example is shown."),
  distribution: story("mass", ".mechanism-bar,.mechanism-brace", [".mechanism-axis", ".mechanism-bar", ".mechanism-bar.is-selected", ".mechanism-brace"], ".mechanism-brace", "Where does normalized mass move?", "Mutually constrained outcome bars whose total remains one.", "The values are a deterministic teaching distribution."),
  optimization: story("trace", ".mechanism-contour,.mechanism-descent,.mechanism-marker", [".mechanism-contour", ".mechanism-descent", ".mechanism-marker:nth-of-type(-n+2)", ".mechanism-marker"], ".mechanism-descent", "How does a bounded update reduce loss?", "A parameter point descending across contours.", "The surface is two-dimensional and smooth."),
  segmentation: story("snap", ".mechanism-token,.mechanism-brace", [".mechanism-token:nth-of-type(1)", ".mechanism-token:nth-of-type(2)", ".mechanism-token", ".mechanism-brace"], ".mechanism-route,.mechanism-brace", "Where does text become discrete?", "Characters regrouped into token spans and IDs.", "Exact splits depend on a pinned tokenizer."),
  embedding: story("flow", ".mechanism-token,.mechanism-table,.mechanism-vector-stack,.mechanism-cluster", [".mechanism-token", ".mechanism-table", ".mechanism-vector-stack", ".mechanism-cluster"], ".mechanism-route", "How does an ID become geometry?", "Lookup, dense vector, and learned neighborhood.", "The projection omits most embedding dimensions."),
  position: story("orbit", ".mechanism-wave,.mechanism-position-marker,.mechanism-marker", [".wave-a", ".wave-b", ".mechanism-position-marker", ".mechanism-marker"], ".mechanism-wave", "How can order alter a representation?", "Paired phase waves and a moving position marker.", "Different position schemes use different mechanisms."),
  attention: story("route", ".mechanism-token,.mechanism-attention-cell,.mechanism-output", [".mechanism-token", ".mechanism-attention-cell", ".mechanism-attention-cell:nth-of-type(3)", ".mechanism-output"], ".mechanism-attention-line,.mechanism-route", "Which keys receive this query's weight?", "Scores, normalized emphasis, and a weighted value sum.", "One head is not a complete causal explanation."),
  layers: story("flow", ".mechanism-layer,.mechanism-bypass,.mechanism-marker", [".mechanism-layer:nth-of-type(1)", ".mechanism-layer:nth-of-type(2)", ".mechanism-layer:nth-of-type(3)", ".mechanism-marker"], ".mechanism-route,.mechanism-bypass", "What changes while the residual path persists?", "Sublayer updates rejoining a preserved stream.", "Implementation variants are omitted."),
  training: story("route", ".mechanism-loop-node,.mechanism-loop-route", [".mechanism-loop-node:nth-of-type(1)", ".mechanism-loop-node:nth-of-type(2)", ".mechanism-loop-node:nth-of-type(3)", ".mechanism-loop-node:nth-of-type(4)"], ".mechanism-loop-route", "How does error become an update?", "Prediction, loss, gradient, and update as one loop.", "Minibatching and distributed state are compressed."),
  data: story("gate", ".mechanism-sources,.mechanism-filter,.mechanism-reject,.mechanism-output", [".mechanism-sources", ".mechanism-filter", ".mechanism-reject", ".mechanism-output"], ".mechanism-route,.mechanism-reject", "Which examples enter training?", "Sources passing through filters into a documented mixture.", "The diagram does not measure dataset quality."),
  systems: story("route", ".mechanism-device,.mechanism-mesh-route,.mechanism-marker", [".mechanism-device", ".mechanism-mesh-route", ".mechanism-device.is-on", ".mechanism-marker"], ".mechanism-mesh-route", "Which values cross device boundaries?", "Shards and collective communication across devices.", "No single topology or library is implied."),
  preference: story("route", ".mechanism-token,.mechanism-choice,.mechanism-margin,.mechanism-tether", [".mechanism-token", ".mechanism-choice", ".mechanism-margin", ".mechanism-tether"], ".mechanism-route,.mechanism-margin", "How does relative preference alter a margin?", "Two responses separating around a shared prompt.", "Preference labels are noisy relative evidence."),
  decoding: story("gate", ".mechanism-tree-node", [".mechanism-tree-node:first-of-type", ".mechanism-tree-node", ".mechanism-tree-node.is-pruned", ".mechanism-tree-node.is-selected"], ".mechanism-tree-route", "Which branches survive and continue?", "Truncation, sampling, and one committed token path.", "Real vocabularies are much larger."),
  memory: story("flow", ".mechanism-cache-cell,.mechanism-query", [".mechanism-cache-cell:nth-of-type(-n+3)", ".mechanism-cache-cell.is-on", ".mechanism-cache-cell.is-current", ".mechanism-query"], ".mechanism-query", "What persists and what appends?", "Layer key/value slots growing one position at a time.", "Allocator and batching effects are omitted."),
  retrieval: story("route", ".mechanism-query-node,.mechanism-doc,.mechanism-context", [".mechanism-query-node", ".mechanism-doc", ".mechanism-doc.is-selected", ".mechanism-context"], ".mechanism-retrieval-ray,.mechanism-route", "Which evidence reaches context?", "A query selecting documents from neighborhoods.", "Distance does not establish entailment."),
  agent: story("route", ".mechanism-state,.mechanism-stop-route", [".mechanism-state:nth-of-type(1)", ".mechanism-state:nth-of-type(-n+3)", ".mechanism-state", ".mechanism-stop-route"], ".mechanism-loop-route,.mechanism-stop-route", "Which transition is legal and when does it stop?", "Plan, act, observe, verify, retry, and stop states.", "Runtime code owns authorization."),
  evaluation: story("mass", ".mechanism-score", [".mechanism-score:first-of-type", ".mechanism-score:nth-of-type(2)", ".mechanism-score:nth-of-type(3)", ".mechanism-score"], ".mechanism-errorbar", "Which failure is hidden by an aggregate?", "Aggregate and subgroup score lanes with uncertainty.", "The bars are teaching fixtures."),
  security: story("gate", ".mechanism-boundary,.mechanism-untrusted,.mechanism-authorized", [".mechanism-untrusted", ".mechanism-blocked-route", ".mechanism-authorized", ".mechanism-allowed-route"], ".mechanism-blocked-route,.mechanism-allowed-route", "Which path may cross the authority boundary?", "Untrusted content blocked and authenticated scope checked.", "The diagram is not a security certification."),
  compression: story("snap", ".mechanism-float,.mechanism-quantized,.mechanism-level", [".mechanism-float", ".mechanism-level", ".mechanism-quantize-route", ".mechanism-quantized"], ".mechanism-quantize-route", "Where do values land with fewer levels?", "Continuous points snapping to discrete levels.", "Grouping and downstream quality are omitted."),
  adapter: story("route", ".mechanism-frozen,.mechanism-adapter,.mechanism-marker", [".mechanism-frozen", ".mechanism-adapter rect:first-of-type", ".mechanism-adapter", ".mechanism-marker"], ".mechanism-route", "How does a low-rank update rejoin frozen weights?", "A small trainable side path around a frozen matrix.", "Structure does not guarantee equal quality."),
  routing: story("route", ".mechanism-token,.mechanism-router,.mechanism-expert", [".mechanism-token", ".mechanism-router", ".mechanism-expert.is-selected", ".mechanism-expert"], ".mechanism-route", "Which experts receive the token?", "Router scores selecting a sparse top-k subset.", "Capacity and communication are simplified."),
  multimodal: story("flow", ".mechanism-patches,.mechanism-text-tokens,.mechanism-projector,.mechanism-output", [".mechanism-patches,.mechanism-text-tokens", ".mechanism-projector", ".mechanism-projector", ".mechanism-output"], ".mechanism-route", "Where do image and text streams fuse?", "Patch and text tokens projected into a shared sequence.", "Highlights are not learned attribution."),
  interpretability: story("route", ".mechanism-model,.mechanism-probe,.mechanism-ablation,.mechanism-output", [".mechanism-model", ".mechanism-probe", ".mechanism-ablation", ".mechanism-output"], ".mechanism-route", "Does the evidence show decoding or causality?", "A probe beside a controlled intervention and output change.", "One intervention supports only its measured setting."),
};

export const allLabMotionContracts: Record<LabMotionId, MotionContract> = {
  ...llmLabMotionContracts,
  ...worldModelLabMotionContracts,
};

export function motionStageTime(progress: number, stageCount: number, stageDuration = 1000) {
  const bounded = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  return bounded * Math.max(1, stageCount - 1) * stageDuration;
}
