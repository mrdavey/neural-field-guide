export const threeStoryScenes = [
  "pipeline",
  "foundations",
  "architecture",
  "pretraining",
  "posttraining",
  "inference",
  "applications",
  "advanced",
] as const;

export type ThreeStoryScene = (typeof threeStoryScenes)[number];

export const threeStoryConcepts = [
  "pipeline",
  "coordinates",
  "distribution",
  "optimization",
  "segmentation",
  "embedding",
  "position",
  "attention",
  "layers",
  "training",
  "data",
  "systems",
  "preference",
  "decoding",
  "memory",
  "retrieval",
  "agent",
  "evaluation",
  "security",
  "compression",
  "adapter",
  "routing",
  "multimodal",
  "interpretability",
] as const;

export type ThreeStoryConcept = (typeof threeStoryConcepts)[number];

export const threeVisualGrammars = [
  "flow",
  "vector",
  "distribution",
  "landscape",
  "token-boundaries",
  "lookup",
  "waves",
  "attention-matrix",
  "residual-stack",
  "training-loop",
  "data-filter",
  "device-mesh",
  "preference-margin",
  "probability-tree",
  "cache-ledger",
  "retrieval-space",
  "state-machine",
  "scorecard",
  "trust-boundary",
  "quantization-levels",
  "low-rank-path",
  "expert-router",
  "modality-fusion",
  "causal-intervention",
] as const;

export type ThreeVisualGrammar = (typeof threeVisualGrammars)[number];

export type ThreeConceptSemantic = {
  grammar: ThreeVisualGrammar;
  learningQuestion: string;
  represents: string;
  boundary: string;
};

export const threeConceptSemantics: Record<ThreeStoryConcept, ThreeConceptSemantic> = {
  pipeline: { grammar: "flow", learningQuestion: "How does one representation become the next?", represents: "A staged flow whose active transformation advances with the lesson trace.", boundary: "The path is conceptual; it is not a runtime trace or timing measurement." },
  coordinates: { grammar: "vector", learningQuestion: "How do coordinates locate one object in a space?", represents: "Axes, components, and a resultant vector tied to the same point.", boundary: "Two drawn axes stand in for spaces that may have many dimensions." },
  distribution: { grammar: "distribution", learningQuestion: "How does changing scores redistribute probability mass?", represents: "A normalized set of bars whose mass is compared rather than read independently.", boundary: "The values are deterministic teaching fixtures, not model probabilities." },
  optimization: { grammar: "landscape", learningQuestion: "How does a gradient update move parameters toward lower loss?", represents: "A point descending across loss contours in several bounded steps.", boundary: "A two-dimensional smooth surface omits saddle points, noise, and high-dimensional geometry." },
  segmentation: { grammar: "token-boundaries", learningQuestion: "Where does text become discrete token units?", represents: "Characters regrouping into token spans with explicit boundaries and IDs.", boundary: "The spans are illustrative; exact splits depend on a pinned tokenizer vocabulary and algorithm." },
  embedding: { grammar: "lookup", learningQuestion: "How does a token ID become a learned dense vector?", represents: "A selected table row turning into coordinates and then a point in learned space.", boundary: "The projection shows only a few dimensions of a much larger learned vector." },
  position: { grammar: "waves", learningQuestion: "How can token order alter otherwise similar representations?", represents: "Position-indexed phase changes across paired waves and a moving token marker.", boundary: "The wave drawing explains sinusoidal structure; learned and rotary schemes differ in implementation." },
  attention: { grammar: "attention-matrix", learningQuestion: "Which keys receive weight for one query, and how is the result mixed?", represents: "A query-to-key score row, normalized weights, and a weighted value route.", boundary: "A small matrix is one head for one example, not a claim that attention alone explains behavior." },
  layers: { grammar: "residual-stack", learningQuestion: "What changes inside a block while the residual path preserves information?", represents: "A stacked sequence of sublayers plus a bypass that rejoins after each transformation.", boundary: "The blocks omit implementation variants such as pre-norm, post-norm, and parallel residuals." },
  training: { grammar: "training-loop", learningQuestion: "How does prediction error become a parameter update?", represents: "Forward prediction, loss, backward gradients, and update as a closed causal loop.", boundary: "One loop icon compresses minibatches, optimizer state, accumulation, and distributed execution." },
  data: { grammar: "data-filter", learningQuestion: "Which examples enter training, and which are rejected or reweighted?", represents: "Multiple sources passing through filters into a documented mixture with a reject branch.", boundary: "The funnel encodes decisions, not dataset quality or coverage measurements." },
  systems: { grammar: "device-mesh", learningQuestion: "Which values must devices exchange to produce one valid update or response?", represents: "Shards, collective links, and synchronized device state across a mesh.", boundary: "The mesh does not imply one topology or communication library." },
  preference: { grammar: "preference-margin", learningQuestion: "How does a relative preference change the gap between two responses?", represents: "Chosen and rejected branches separating around a shared prompt and reference point.", boundary: "A preference label is noisy relative evidence, not an absolute truth or universal reward." },
  decoding: { grammar: "probability-tree", learningQuestion: "How do truncation and sampling commit to one token path?", represents: "A branching distribution with removed candidates and one continuing branch.", boundary: "The tree is a tiny fixture; real vocabularies are large and probabilities change after every token." },
  memory: { grammar: "cache-ledger", learningQuestion: "What is stored once and appended at every decode step?", represents: "Layer key/value slots growing by position while a new query reuses prior entries.", boundary: "The ledger omits allocator overhead, batching, eviction, and cache-sharing strategies." },
  retrieval: { grammar: "retrieval-space", learningQuestion: "How does a query select evidence from a larger corpus?", represents: "A query moving through embedded document clusters before selected items enter context.", boundary: "Distance is illustrative and does not establish relevance, entailment, or answer correctness." },
  agent: { grammar: "state-machine", learningQuestion: "Which state transition is legal, and when should the loop stop?", represents: "Plan, act, observe, verify, retry, and stop states with explicit guarded edges.", boundary: "The model proposes actions; the surrounding orchestrator owns authorization and transition rules." },
  evaluation: { grammar: "scorecard", learningQuestion: "Which slice or failure is hidden by an aggregate score?", represents: "Several metric lanes, subgroup slices, uncertainty marks, and a regression flag.", boundary: "The bars are teaching fixtures and cannot be read as benchmark results." },
  security: { grammar: "trust-boundary", learningQuestion: "Which instruction or action may cross the authority boundary?", represents: "Untrusted content stopped outside a capability boundary while an authorized path is checked.", boundary: "The diagram illustrates control placement; it does not certify a production system as secure." },
  compression: { grammar: "quantization-levels", learningQuestion: "What error appears when continuous values snap to fewer levels?", represents: "Floating values moving onto discrete representable levels with visible residual distance.", boundary: "The scalar view omits grouping, calibration, outliers, kernels, and downstream quality evaluation." },
  adapter: { grammar: "low-rank-path", learningQuestion: "How can a small trainable path alter a frozen transformation?", represents: "A frozen main matrix plus low-rank down/up projections that rejoin as an update.", boundary: "The path shows structure, not a guarantee of equal quality or memory savings in every workload." },
  routing: { grammar: "expert-router", learningQuestion: "Which experts receive each token, and what happens to the others?", represents: "Token-specific router scores selecting a sparse top-k subset of expert paths.", boundary: "The drawing omits capacity limits, load-balancing loss, communication, and dropped-token policy." },
  multimodal: { grammar: "modality-fusion", learningQuestion: "Where do visual and text representations enter a shared prediction path?", represents: "Patch tokens and text tokens encoded separately, projected, then fused for generation.", boundary: "Highlighted patches are schematic and are not learned attention or a causal attribution." },
  interpretability: { grammar: "causal-intervention", learningQuestion: "Does the evidence show correlation, decodability, or a causal contribution?", represents: "A probe reading an activation beside an ablation/patch intervention that changes an output.", boundary: "One intervention supports only its measured setting; mechanism claims require controls and replication." },
};

export type ThreeSceneProfile = {
  pointCount: number;
  nodeStride: number;
  turns: number;
  depth: number;
  tilt: number;
  phase: number;
};

export const threeConceptProfiles: Record<ThreeStoryConcept, ThreeSceneProfile> = {
  pipeline: { pointCount: 104, nodeStride: 10, turns: 1.15, depth: .72, tilt: .08, phase: .2 },
  coordinates: { pointCount: 90, nodeStride: 9, turns: .58, depth: .48, tilt: .2, phase: .8 },
  distribution: { pointCount: 96, nodeStride: 8, turns: .48, depth: .56, tilt: .08, phase: 1.1 },
  optimization: { pointCount: 108, nodeStride: 9, turns: .64, depth: .72, tilt: .24, phase: 1.4 },
  segmentation: { pointCount: 88, nodeStride: 8, turns: .34, depth: .46, tilt: .05, phase: 1.7 },
  embedding: { pointCount: 112, nodeStride: 8, turns: .86, depth: .9, tilt: .12, phase: 2 },
  position: { pointCount: 100, nodeStride: 10, turns: .92, depth: .68, tilt: .1, phase: 2.3 },
  attention: { pointCount: 116, nodeStride: 8, turns: .74, depth: .96, tilt: .15, phase: 2.6 },
  layers: { pointCount: 120, nodeStride: 10, turns: .82, depth: .88, tilt: .18, phase: 2.9 },
  training: { pointCount: 118, nodeStride: 10, turns: .42, depth: .62, tilt: .19, phase: 3.2 },
  data: { pointCount: 110, nodeStride: 10, turns: .38, depth: .74, tilt: .12, phase: 3.5 },
  systems: { pointCount: 108, nodeStride: 9, turns: .56, depth: .82, tilt: .2, phase: 3.8 },
  preference: { pointCount: 96, nodeStride: 8, turns: .68, depth: .76, tilt: .14, phase: 4.1 },
  decoding: { pointCount: 92, nodeStride: 8, turns: .54, depth: .52, tilt: .07, phase: 4.4 },
  memory: { pointCount: 108, nodeStride: 9, turns: .98, depth: .52, tilt: .07, phase: 4.7 },
  retrieval: { pointCount: 104, nodeStride: 8, turns: .88, depth: .82, tilt: .16, phase: 5 },
  agent: { pointCount: 98, nodeStride: 8, turns: 1.12, depth: .78, tilt: .14, phase: 5.3 },
  evaluation: { pointCount: 90, nodeStride: 9, turns: .3, depth: .52, tilt: .08, phase: 5.6 },
  security: { pointCount: 114, nodeStride: 9, turns: .66, depth: .9, tilt: .18, phase: 5.9 },
  compression: { pointCount: 124, nodeStride: 11, turns: .44, depth: .68, tilt: .16, phase: 6.2 },
  adapter: { pointCount: 102, nodeStride: 9, turns: .52, depth: .7, tilt: .18, phase: 6.5 },
  routing: { pointCount: 112, nodeStride: 8, turns: .7, depth: .86, tilt: .15, phase: 6.8 },
  multimodal: { pointCount: 118, nodeStride: 10, turns: .92, depth: .9, tilt: .2, phase: 7.1 },
  interpretability: { pointCount: 124, nodeStride: 11, turns: 1.48, depth: 1, tilt: .23, phase: 7.4 },
};

export function clampThreeValue(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function storySeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededUnit(seed: number, index: number, salt = 0) {
  let value = seed ^ Math.imul(index + 1, 0x45d9f3b) ^ Math.imul(salt + 11, 0x27d4eb2d);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

export function cappedThreePixelRatio(devicePixelRatio: number, viewportWidth: number) {
  const limit = viewportWidth < 780 ? 1 : 1.5;
  return clampThreeValue(devicePixelRatio || 1, 1, limit);
}

export function threeStoryFrame(concept: ThreeStoryConcept, progress: number, pointerX: number, pointerY: number, pulse: number, stageCount: number) {
  const profile = threeConceptProfiles[concept];
  const normalized = clampThreeValue(progress);
  const stagePosition = normalized * Math.max(1, stageCount - 1);
  const wave = Math.sin(normalized * Math.PI * 2 + profile.phase);
  const stageWave = Math.sin(stagePosition * Math.PI);
  const safePulse = clampThreeValue(pulse);

  return {
    progress: normalized,
    stagePosition,
    rotationX: profile.tilt + pointerY * .13 + wave * .025,
    rotationY: normalized * profile.turns + pointerX * .24,
    rotationZ: stageWave * .035 * profile.depth,
    cameraX: pointerX * .32,
    cameraY: pointerY * .22,
    cameraZ: 8.2 + profile.depth * .65 - safePulse * .18,
    coreScale: 1 + stageWave * .07 + safePulse * .26,
    lightEnergy: .72 + normalized * .34 + safePulse * .5,
  };
}
