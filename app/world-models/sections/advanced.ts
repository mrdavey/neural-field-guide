import { defineWorldModelLesson } from "../helpers";
import { wmSources } from "../sources";

export const worldModelAdvancedSpecs = [
  defineWorldModelLesson({
    id: "object-centric-dynamics",
    track: "wm-advanced",
    title: "Object-Centric Dynamics",
    number: 41,
    plain:
      "Object-centric world models represent a scene as a set of interacting slots so motion and relations can be predicted per entity instead of only across one global vector.",
    precise:
      "An encoder gives each input feature $x_i$ a key—the coordinates used to measure which slot it matches—and a value—the information a matched slot will collect. Each of $K$ slots carries a query, a compact request describing the evidence it currently seeks. Query–key similarity produces one score per feature/slot pair. Slot Attention first applies a softmax across slots for each input, yielding competitive assignments $w_{ik}$. It then renormalizes each slot's assignments across inputs, $\\tilde w_{ik}=w_{ik}/\\sum_j w_{jk}$ (with a small numerical stabilizer), before taking that slot's weighted mean of values. The first normalization makes slots compete for each input; the second makes each slot update from a normalized aggregation rather than a mass-dependent sum. Interaction dynamics then transform the slot set plus action into predicted attributes, and a decoder renders or scores observations. Because slot indices are exchangeable, permutation-aware cost matches predicted and target sets before comparison.",
    analogy:
      "It is moving labeled pieces on a board instead of redrawing the entire board for every turn.",
    analogyBreak:
      "the learned pieces can split one object, merge several objects, switch identity, or encode background texture.",
    ideas: [
      "Trace pixels or features through competitive slot assignment and permutation-aware matching.",
      "Model interactions and actions explicitly rather than assuming independent object motion.",
      "Test identity, occlusion, count shifts, novel combinations, and interventions before using object language.",
    ],
    worked:
      "Two feature values are red-at-$x=1$ and blue-at-$x=4$. After competition across slots, red has weights $[0.9,0.1]$ and blue has $[0.2,0.8]$. Renormalizing across inputs gives slot 1 aggregation weights $[0.9/1.1,0.2/1.1]\\approx[0.818,0.182]$ and slot 2 weights $[0.1/0.9,0.8/0.9]\\approx[0.111,0.889]$, so slot 1 summarizes mostly red/left and slot 2 mostly blue/right. A push-right action adds 2 only to the red slot, predicting attributes `[red,x=3]` and `[blue,x=4]`; the decoder renders those positions. If targets arrive ordered `[blue,x=4],[red,x=3]`, minimum-cost permutation swaps the comparison and yields zero attribute error instead of an index-based mismatch.",
    misconception:
      "A colorful slot mask does not prove stable object identity, causal interaction, or compositional generalization.",
    quiz: {
      question: "Why is permutation-aware matching needed for slots?",
      options: [
        "Slots are always sorted by color",
        "Slot indices are exchangeable and may represent the same entities in a different order",
        "Objects have no features",
        "It increases image resolution",
      ],
      answer: 1,
      explanation: "The set representation has no guaranteed semantic order.",
    },
    lab: "wm-latent",
    prerequisites: ["action-conditioned-transitions"],
    sources: [
      wmSources.slotAttention,
      wmSources.objectWorldModels,
      wmSources.mbrlSurvey,
    ],
    objectives: [
      "Trace a scene through slot assignment, interaction dynamics, and permutation-aware decoding",
      "Design evidence that separates object segmentation from identity and intervention claims",
    ],
    vocabulary: [
      {
        term: "Slot",
        meaning:
          "One exchangeable vector intended to capture a part or entity hypothesis.",
      },
      {
        term: "Permutation symmetry",
        meaning: "Reordering slots does not change the represented set.",
      },
      {
        term: "Binding",
        meaning:
          "Associating features such as color, position, and motion with the same entity hypothesis.",
      },
    ],
    stages: ["Assign slots", "Predict interactions", "Align and test"],
    checkpoints: [
      "Inspect attention/masks and count unused or merged slots.",
      "Apply action and relation updates with explicit sender/receiver roles.",
      "Match sets, test occlusion and swaps, and retain failure cases.",
    ],
    primaryCheck: {
      prompt:
        "Trace red-at-$x=1$ and blue-at-$x=4$ through two slots with competitive weights red $[0.9,0.1]$, blue $[0.2,0.8]$: renormalize each slot across inputs, then apply a push-right that moves only red by +2, decode, and match reversed-order targets.",
      expected:
        "Competition is normalized across slots per feature. Aggregation is then normalized across inputs per slot: slot 1 uses $[0.818,0.182]$ and slot 2 uses $[0.111,0.889]$, so their summaries are predominantly red/left and blue/right. Interaction dynamics condition on push-right and update red to $x=3$ while blue remains $x=4$. The decoder predicts those attributes, and permutation-aware matching pairs blue with blue and red with red regardless of indices; only matched errors count.",
      retry:
        "Normalize once across slots for each feature, normalize again across features for each slot's weighted mean, apply the named action, decode both entities, and solve both target pairings before scoring.",
    },
    decision: {
      explanation:
        "Object claims need progressively stronger tests from decomposition to intervention.",
      mechanism:
        "Measure reconstruction/decomposition, attribute consistency, identity through occlusion, relational prediction, novel-count/composition transfer, and controlled object-specific interventions in separate rows.",
      workedExample:
        "Masks align with objects, but swapping one slot changes the entire background. Decomposition evidence passes while localized intervention evidence fails.",
      boundary:
        "Even localized visual effects may not correspond to independently manipulable physical causes.",
      check: {
        prompt:
          "A slot tracks a car until occlusion, then binds to a tree. Which claim fails?",
        expected:
          "Identity persistence fails even if per-frame segmentation remains good; diagnose temporal binding and evaluate set matching across the occlusion.",
        retry:
          "Compare what the slot represented before and after the hidden interval.",
      },
    },
    transfer: {
      prompt: "Which result best supports compositional dynamics?",
      options: [
        {
          text: "Sharp reconstruction on training scenes",
          feedback: "This can memorize global appearance.",
        },
        {
          text: "Correct interactions for new object combinations and counts with stable identities",
          feedback: "Correct: it tests recombination beyond seen scenes.",
        },
        {
          text: "Fixed slot colors",
          feedback: "Display color does not establish semantics.",
        },
      ],
      answer: 1,
      worked:
        "Report each evidence tier separately and include split/merge/identity-switch examples.",
      retry: "Ask whether the test changes which entities coexist or interact.",
    },
    motion: {
      concept: "routing",
      headline:
        "Object-centric dynamics route scene evidence into exchangeable entity hypotheses and their interactions.",
      intro:
        "Slots compete for input, exchange messages, then realign as a set rather than a fixed list.",
      labels: ["SCENE", "SLOTS", "INTERACT", "MATCH"],
      titles: [
        "Observations contain overlapping entity and background evidence.",
        "Competitive assignment forms an unordered set of hypotheses.",
        "Actions and relations update selected slots.",
        "Permutation-aware tests compare identity, attributes, and outcomes.",
      ],
    },
  }),
  defineWorldModelLesson({
    id: "hierarchical-multiscale",
    track: "wm-advanced",
    title: "Hierarchical and Multi-Scale World Models",
    number: 42,
    plain:
      "Hierarchical world models predict fast local changes and slower abstract events at different time scales.",
    precise:
      "A multi-scale model may update a low-level latent each step while a high-level latent, skill, option, or event state persists for several steps. Temporal abstraction reduces long-horizon depth and can support planning over subgoals, but boundary discovery, duration, information flow, and credit assignment become additional learned mechanisms. Evaluation compares matched compute at short and long horizons and tests whether abstract states preserve decision-relevant detail without leaking future information.",
    analogy:
      "It is planning a trip with cities at the top level and individual turns at the street level.",
    analogyBreak:
      "learned event boundaries may not match human concepts, and a bad high-level route cannot be repaired by precise local turns.",
    ideas: [
      "Define update rates, boundary signals, information paths, and actions for every level.",
      "Trace how a high-level subgoal expands into lower-level predictions and returns evidence upward.",
      "Compare matched-budget flat and hierarchical models across horizon, boundary shift, and recovery.",
    ],
    worked:
      "A slow state emits subgoal `cross room` with a four-step duration. Fast transitions execute right, then forward; the second transition predicts free space but observes collision, so surprise flows upward and the boundary detector terminates the subgoal after step two. In a matched fixture, both planners receive 10 model calls: the hierarchy spends 2 on slow states and 8 on fast transitions and covers an eight-step candidate in 22 ms, while a flat branching planner uses all 10 calls on one-step expansions and covers four steps in 35 ms. Those fixture numbers expose the compute/latency ledger; they do not prove hierarchy is generally faster or better.",
    misconception:
      "A hierarchy is not automatically interpretable; its slow variables may encode arbitrary predictive features rather than named skills.",
    quiz: {
      question: "What new failure does temporal abstraction introduce?",
      options: [
        "No latent states",
        "Incorrect boundaries or durations can preserve a stale high-level plan",
        "Actions disappear",
        "All prediction becomes exact",
      ],
      answer: 1,
      explanation:
        "The model must decide when abstract states begin, persist, and terminate.",
    },
    lab: "wm-rollout",
    prerequisites: ["imagined-rollouts"],
    sources: [
      wmSources.hierarchicalWorldModels,
      wmSources.dreamer,
      wmSources.mbrlSurvey,
    ],
    objectives: [
      "Trace information and control across a two-level temporal world model",
      "Evaluate whether hierarchy improves long-horizon decisions under matched compute",
    ],
    vocabulary: [
      {
        term: "Temporal abstraction",
        meaning:
          "Representing actions or states that persist across multiple lower-level steps.",
      },
      {
        term: "Option",
        meaning:
          "A temporally extended behavior with initiation, internal policy, and termination.",
      },
      {
        term: "Boundary detector",
        meaning:
          "A rule or learned mechanism that identifies transitions between abstract events.",
      },
    ],
    stages: ["Choose abstraction", "Expand locally", "Update boundary"],
    checkpoints: [
      "State each level's time unit, inputs, state, and output.",
      "Track low-level actions and whether they fulfill the high-level condition.",
      "Propagate surprises upward and test termination/replanning.",
    ],
    primaryCheck: {
      prompt:
        "Trace a two-level controller whose high-level state chooses subgoal `cross room` for three steps, while low-level actions produce rewards [2,1,4] and an unexpected collision after step two. Include the outcome/surprise path and boundary decision.",
      expected:
        "The high-level state emits a persistent `cross room` subgoal and duration/context. The low level conditions on it to choose each environment action and returns state, reward, and prediction error. After two steps, collision/surprise flows upward; the boundary detector should terminate or revise the stale high-level choice immediately rather than blindly take step three. If no surprise occurred, the three-step discounted reward would be $2+0.9(1)+0.9^2(4)=6.14$ and the boundary state would start after step three.",
      retry:
        "Draw the downward path high state → subgoal → low actions, then the upward path outcome/error → boundary detector → continue, terminate, or replan.",
    },
    decision: {
      explanation:
        "Hierarchy earns its complexity only if it improves a stated horizon/compute trade-off or transfer.",
      mechanism:
        "Match model transitions, planner latency, parameters, data, and starts; measure short/long return, boundary accuracy, recovery, abstract-state reuse, and failures when event timing changes.",
      workedExample:
        "The hierarchy reaches 100-step goals with half the model calls but loses on 5-step reaction tasks. It supports a long-horizon efficiency claim, not universal superiority.",
      boundary:
        "Matched model calls may still hide different parallelism or memory costs; report wall-clock and hardware too.",
      check: {
        prompt:
          "A hierarchy wins only when allowed twice the planning latency. What can you conclude?",
        expected:
          "Only that the hierarchy-plus-larger latency budget performed better. Match budgets before attributing the gain to temporal abstraction.",
        retry:
          "Count both internal model transitions and real elapsed planning time.",
      },
    },
    transfer: {
      prompt: "Which observation argues for revising a boundary detector?",
      options: [
        {
          text: "High-level state remains fixed after a low-level failure invalidates its subgoal",
          feedback:
            "Correct: the abstraction persists past evidence that should terminate it.",
        },
        {
          text: "The decoder has many pixels",
          feedback: "Pixel count does not diagnose boundaries.",
        },
        {
          text: "A short task succeeds",
          feedback: "This does not test persistence under surprise.",
        },
      ],
      answer: 0,
      worked:
        "Log boundary probabilities, low-level surprise, option termination, and replanning latency around failures.",
      retry:
        "Find the moment the abstract plan stopped being valid and compare it with the model's boundary.",
    },
    motion: {
      concept: "layers",
      headline:
        "A hierarchy lets slow plans persist while fast dynamics resolve their local consequences.",
      intro:
        "Two clocks remain visible: abstract events span several steps, but surprises can still flow upward and terminate them.",
      labels: ["SLOW STATE", "SUBGOAL", "FAST STEPS", "BOUNDARY"],
      titles: [
        "A persistent latent summarizes longer-range intent or event context.",
        "The upper level conditions a lower-level target.",
        "Fast dynamics predicts and acts at the environment rate.",
        "Evidence decides whether to continue, terminate, or replan.",
      ],
    },
  }),
  defineWorldModelLesson({
    id: "geometry-physical-priors",
    track: "wm-advanced",
    title: "Geometry and Physical Priors",
    number: 43,
    plain:
      "Geometric and physical priors build known symmetries, coordinates, conservation hints, or continuous-time structure into a world model.",
    precise:
      "A prior restricts functions or representations before data: equivariant layers transform predictably under rotations/translations; coordinate frames expose pose; graph structure encodes interactions; neural differential equations parameterize $dz/dt=f_θ(z,a,t)$ and use a numerical solver. Priors can improve sample efficiency and extrapolation when assumptions match, but introduce bias when contacts, dissipation, discontinuities, sensors, or topology violate them. Evaluation transforms inputs, changes step sizes, and tests out-of-range regimes under matched budgets.",
    analogy:
      "It is giving the learner graph paper and conservation rules before asking it to infer motion.",
    analogyBreak:
      "real systems can violate simplified rules through friction, control, measurement error, or missing forces.",
    ideas: [
      "State the symmetry, coordinate frame, conservation rule, or time assumption mathematically.",
      "Trace which transformations the architecture guarantees and which it only learns statistically.",
      "Test the assumption directly with transformed, discontinuous, and out-of-range cases.",
    ],
    worked:
      "If a 2-D position rotates by matrix $R$, an equivariant velocity predictor should satisfy $f(Rx,Ra)=R f(x,a)$ within numerical tolerance. For $dz/dt=-z$, $z(0)=1$, and one second of Euler integration, step 0.5 gives $0.5^2=0.25$ while step 0.1 gives $0.9^{10}≈0.349$; the exact value $e^{-1}≈0.368$ reveals solver error separately from model error. A floor contact is a different counterexample: a smooth step predicting height -0.1 crosses the physical boundary and needs an explicit contact/event rule rather than a smaller tolerance alone.",
    misconception:
      "Calling a model 'physics-informed' does not establish physical correctness; the encoded equations and residual evidence must be inspectable.",
    quiz: {
      question: "What does rotation equivariance require?",
      options: [
        "Rotating the input leaves a vector output unchanged",
        "Rotating inputs rotates the vector output consistently",
        "All coordinates become zero",
        "The model memorizes every angle",
      ],
      answer: 1,
      explanation:
        "Equivariance means output transforms according to the corresponding representation.",
    },
    lab: "wm-state",
    prerequisites: ["system-identification-sim-to-real"],
    sources: [
      wmSources.equivariantWorldModels,
      wmSources.egnn,
      wmSources.neuralOde,
      wmSources.controlSuite,
    ],
    objectives: [
      "Test a stated geometric or continuous-time prior with a numerical counterexample",
      "Choose a prior by matching its assumptions to the system and failure costs",
    ],
    vocabulary: [
      {
        term: "Invariance",
        meaning:
          "A transformation of input leaves the represented output unchanged.",
      },
      {
        term: "Equivariance",
        meaning:
          "A transformation of input produces a predictable corresponding transformation of output.",
      },
      {
        term: "Inductive prior",
        meaning:
          "A structural assumption that restricts what a model learns before seeing all data.",
      },
    ],
    stages: ["Declare assumption", "Encode structure", "Transform and falsify"],
    checkpoints: [
      "Write the transformation, frame, time unit, and expected relation.",
      "Identify guaranteed versus loss-encouraged behavior.",
      "Evaluate transformed inputs, solver tolerances, contacts, and broken assumptions.",
    ],
    primaryCheck: {
      prompt:
        "A vector predictor outputs [1,0]. After rotating its inputs 90°, it still outputs [1,0]. Is it rotation-equivariant?",
      expected:
        "No. A 90° equivariant output should rotate to [0,1] under the standard counterclockwise convention.",
      retry:
        "Apply the same rotation matrix to the original vector and compare.",
    },
    decision: {
      explanation:
        "A useful prior is a bias whose assumptions and failure consequences fit the target domain.",
      mechanism:
        "List known symmetries/dynamics, measurement frames, discontinuities, data scarcity, compute, and safety cost; compare unconstrained and prior-based models on in-range and assumption-breaking slices.",
      workedExample:
        "A rigid-body equivariant model improves free-flight extrapolation but fails at deformable contact. Route free-flight prediction to it and use a contact-capable model or explicit boundary for the other regime.",
      boundary:
        "Approximate symmetries can still help, but hard guarantees may be harmful when the approximation breaks.",
      check: {
        prompt:
          "Camera coordinates rotate but gravity remains world-fixed. Should all features share one rotation rule?",
        expected:
          "No. Define frames and transformation types separately; gravity and camera-relative vectors follow different coordinate contracts.",
        retry:
          "Label every quantity with its coordinate frame before applying a symmetry.",
      },
    },
    transfer: {
      prompt: "Which experiment tests a symmetry claim?",
      options: [
        {
          text: "Add more untransformed training samples",
          feedback: "This does not directly test the relation.",
        },
        {
          text: "Transform matched inputs and compare output with the mathematically transformed reference",
          feedback:
            "Correct: the equivariance equation is directly falsifiable.",
        },
        { text: "Inspect model name", feedback: "A label is not evidence." },
      ],
      answer: 1,
      worked:
        "Publish transformations, tolerances, frames, and counterexamples rather than only average loss.",
      retry:
        "Turn the verbal prior into an input-output equality and test both sides.",
    },
    motion: {
      concept: "coordinates",
      headline:
        "A geometric prior constrains how predicted states move when the coordinate system changes.",
      intro:
        "Matched points rotate through input, latent, and output frames while violations remain visible as misaligned vectors.",
      labels: ["FRAME", "TRANSFORM", "PREDICT", "COMPARE"],
      titles: [
        "Assign every quantity a coordinate frame and unit.",
        "Apply a declared symmetry or continuous-time step.",
        "Run the same model under transformed evidence.",
        "Compare with the mathematically transformed reference and stress failures.",
      ],
    },
  }),
  defineWorldModelLesson({
    id: "causal-counterfactual-models",
    track: "wm-advanced",
    title: "Causal and Counterfactual World Models",
    number: 44,
    plain:
      "A causal world-model claim says how an intervention changes outcomes, while a counterfactual asks what would have happened to the same case under a different intervention.",
    precise:
      "A structural causal model writes each variable as $X_i := f_i(PA_i,U_i)$: $PA_i$ means the parent variables that directly enter $X_i$'s mechanism, and $U_i$ means unobserved background factors for that case. Observation conditions on evidence; intervention $do(A=a)$ replaces the mechanism for $A$; a unit-level counterfactual first infers the same case's $U$ from factual evidence, then changes the action while holding that inferred background fixed. Predictive sequences remain correlational unless assumptions or intervention evidence identify effects.",
    analogy:
      "Observation watches which switches and lights co-occur; intervention flips one switch while holding the wiring fixed.",
    analogyBreak:
      "learned latent variables may not correspond to real switches, and the same observations can fit multiple causal wirings.",
    ideas: [
      "Keep observation, intervention, and unit-level counterfactual queries distinct.",
      "Draw variables, mechanisms, hidden causes, action assignment, and measurement process before estimating effects.",
      "State identifiability assumptions and seek randomized or multi-environment evidence with falsification tests.",
    ],
    worked:
      "In a 200-drive fixture, severity $S$ causes both braking $A$ and collision $Y$. Among 100 severe drives, 80 brake and 20 of those crash (25%); among 100 mild drives, 20 brake and none crash (0%). Thus $P(Y\\mid A=brake)=20/100=0.20$. Within severity strata, no-brake crash rates are 8/20=0.40 and 4/80=0.05. Standardizing both actions to the 50/50 target population gives $$P(Y\\mid do(brake))=0.5(0.25)+0.5(0)=0.125$$ and $$P(Y\\mid do(no\\ brake))=0.5(0.40)+0.5(0.05)=0.225$$ The observational association reverses after adjustment. If every black-ice drive brakes, the no-brake effect in that stratum lacks positivity and is not identified. A same-drive counterfactual additionally reuses that episode's inferred background $U$ after replacing its action.",
    misconception:
      "Accurate next-state prediction under the logged policy does not prove correct predictions for actions rarely or never taken.",
    quiz: {
      question: "What distinguishes an intervention from merely observing the same action?",
      options: [
        "Observe cases where the action happened to have that value",
        "Actively set the action while leaving the outcome mechanisms in place",
        "Delete every parent of outcomes",
        "Sample a language description",
      ],
      answer: 1,
      explanation:
        "An intervention sets the variable rather than conditioning on its natural causes.",
    },
    lab: "wm-belief",
    prerequisites: ["action-conditioned-transitions"],
    sources: [
      wmSources.causalInferenceOverview,
      wmSources.causalRepresentation,
      wmSources.mbrlSurvey,
    ],
    objectives: [
      "Distinguish observational, interventional, and counterfactual queries in one dynamics scenario",
      "Audit whether data and assumptions identify a proposed action-effect claim",
    ],
    vocabulary: [
      {
        term: "Intervention",
        meaning:
          "An operation that sets a variable by replacing its usual generating mechanism.",
      },
      {
        term: "Confounder",
        meaning:
          "A cause of both treatment/action assignment and outcome that can create a misleading association.",
      },
      {
        term: "Identifiability",
        meaning:
          "Whether a causal quantity is uniquely determined from available data plus assumptions.",
      },
    ],
    stages: ["Draw mechanisms", "Name query", "Test identification"],
    checkpoints: [
      "Include actions, outcomes, context, hidden causes, and selection.",
      "Mark conditioning, mechanism replacement, or factual-context reuse.",
      "List assumptions, intervention coverage, alternatives, and falsifiers.",
    ],
    primaryCheck: {
      prompt:
        "In one obstacle scenario, distinguish these three queries: collisions among naturally braking logs; collision risk if braking were forced for the population; and what would have happened to this same crashed episode had it braked earlier.",
      expected:
        "The first is observational conditioning $P(Y\\mid A=brake)$ and retains the logged policy's severity confounding. The second is interventional $P(Y\\mid do(A=brake))$, replacing the action mechanism while averaging over the target population. The third is a unit counterfactual: infer this episode's background $U$ from its factual trace, replace action with earlier braking, and simulate the outcome under that same inferred case context.",
      retry:
        "Ask in order: are we filtering observed rows, replacing a mechanism for a population, or reusing one factual case's inferred background after replacing its action?",
    },
    decision: {
      explanation:
        "An action-effect claim is usable only within identified interventions and represented conditions.",
      mechanism:
        "First check positivity: for every represented condition where an effect is claimed, each compared action must have nonzero usable probability/support. Then audit measured confounders, temporal order, consistency, invariance across environments, latent alignment, and alternative causal graphs; bound or abstain when identification fails.",
      workedExample:
        "No training trajectory applies high torque on wet surfaces, so positivity fails in that cell. The model's predicted effect there is extrapolation, not identified evidence; a planner must reject it or collect safe experimental data.",
      boundary:
        "Randomization identifies effects only for the assigned interventions, population, compliance, measurements, and horizons tested.",
      check: {
        prompt:
          "Two causal graphs fit all observational trajectories but disagree under a new action. What should the model report?",
        expected:
          "The effect is not identified by those data alone. Preserve the alternatives, check whether the action has support in each relevant condition, collect discriminating intervention evidence, or bound/abstain.",
        retry:
          "Ask whether both actions occur with usable probability in the relevant condition and whether any observed/interventional distribution distinguishes the two mechanisms.",
      },
    },
    transfer: {
      prompt: "Which statement is causally careful?",
      options: [
        {
          text: "The predictor is accurate, so every intervention is correct",
          feedback:
            "Observational accuracy does not identify unseen interventions.",
        },
        {
          text: "Under these assumptions and intervention ranges, the data support this bounded effect estimate",
          feedback: "Correct: assumptions and scope remain attached.",
        },
        {
          text: "A latent coordinate is automatically a cause",
          feedback:
            "Representation axes need intervention and identification evidence.",
        },
      ],
      answer: 1,
      worked:
        "Deliver graph, query, assumptions, coverage table, estimate/bound, and a falsifying experiment.",
      retry:
        "Attach every effect claim to the intervention data or assumptions that identify it.",
    },
    motion: {
      concept: "pipeline",
      headline:
        "Causal reasoning changes a mechanism; it does not merely filter observations.",
      intro:
        "The diagram separates conditioning paths from an intervention cut and a factual-context counterfactual branch.",
      labels: ["MECHANISMS", "OBSERVE", "INTERVENE", "COUNTERFACT"],
      titles: [
        "Variables arise from parents and unobserved context.",
        "Conditioning updates beliefs without changing the system.",
        "An intervention replaces one generating mechanism.",
        "A counterfactual reuses inferred context under the changed mechanism.",
      ],
    },
  }),
  defineWorldModelLesson({
    id: "language-multimodal-world-models",
    track: "wm-advanced",
    title: "Language and Multimodal World Models",
    number: 45,
    plain:
      "A multimodal world model connects language, vision, audio, state, and actions so predictions or plans can be conditioned on more than one kind of evidence.",
    precise:
      "Modal encoders map inputs with different rates, units, noise, and missingness into aligned or cross-attended representations; a dynamics model predicts selected future modalities or latent targets conditioned on actions and instructions; decoders or task heads recover outputs. Alignment losses do not guarantee temporal grounding or causal control. Evaluation needs synchronization, modality ablation, contradictory cues, missing-input behavior, action intervention, grounding, calibration, and safety checks.",
    analogy:
      "It is a control room combining camera feeds, sensor gauges, spoken instructions, and actuator commands on one timeline.",
    analogyBreak:
      "shared embeddings can align labels and appearances while confusing timing, reference, or physical consequence.",
    ideas: [
      "Define every modality's clock, coordinate frame, tokenization, uncertainty, and missing-data marker.",
      "Trace fusion and prediction without letting future or answer modalities leak into context.",
      "Test whether language changes grounded action consequences rather than only generated descriptions.",
    ],
    worked:
      "At timestamp 2.0 s, language says `put the red block left of the cup`; the 10 Hz camera supplies frame $v_{20}$, and 50 Hz robot telemetry supplies states/actions $s_{100},a_{100:104}$ for that camera interval. Alignment binds `red block` and `cup` to tracked entities and fuses them with current proprioception into belief $z_t$. Candidate action `move left 2 cm` enters dynamics, which predicts the red-block pose relative to the cup, contact risk, and uncertainty at $t+1$; the planner accepts it only if the grounded relation improves and safety passes.",
    misconception:
      "Adding a language encoder to a video predictor does not by itself create a grounded planner or a more accurate physical model.",
    quiz: {
      question:
        "What test checks whether a model uses language grounding rather than visual shortcuts?",
      options: [
        "Use the same instruction every time",
        "Swap the instruction while holding the scene fixed and verify the predicted action/outcome changes appropriately",
        "Measure only caption fluency",
        "Remove actions",
      ],
      answer: 1,
      explanation:
        "A controlled instruction intervention tests its causal role in the decision.",
    },
    lab: "wm-video",
    prerequisites: ["video-tokenization", "goal-conditioned-robotics"],
    sources: [wmSources.dynalang, wmSources.vjepa2, wmSources.genie],
    objectives: [
      "Trace synchronized language, sensory, state, and action inputs through a multimodal prediction contract",
      "Design interventions that test grounding, missing-modality robustness, and leakage",
    ],
    vocabulary: [
      {
        term: "Grounding",
        meaning:
          "Connecting a symbol or instruction to observable entities, states, actions, or consequences.",
      },
      {
        term: "Modality",
        meaning:
          "A kind of signal with its own representation and measurement process.",
      },
      {
        term: "Temporal alignment",
        meaning:
          "Relating signals from different sources to the correct times or intervals.",
      },
    ],
    stages: ["Synchronize", "Fuse and predict", "Intervene and ablate"],
    checkpoints: [
      "Record clocks, frames, masks, uncertainty, and permitted context.",
      "Inspect cross-modal paths and exact prediction/action targets.",
      "Swap instructions, remove modalities, contradict cues, and check grounded outcomes.",
    ],
    primaryCheck: {
      prompt:
        "Trace a timestamped instruction `red block left of cup`, a 10 Hz frame at 2.0 s, 50 Hz state/action telemetry, and candidate `move left 2 cm` through one multimodal prediction.",
      expected:
        "The 0.1 s camera interval aligns with five 0.02 s telemetry/action intervals after clock-offset correction. Language entities ground to visual tracks; synchronized vision and proprioception form current state/belief; the candidate action conditions dynamics; outputs include the predicted red-block/cup relation, contact/safety consequence, and uncertainty at the next time. No sensor value recorded after that predicted outcome may enter the context.",
      retry:
        "Put every modality on one timeline, bind language references to current tracks, fuse only decision-time evidence, then pass the candidate action to the future-consequence heads.",
    },
    decision: {
      explanation:
        "Multimodal value is established by controlled contribution and safe degradation, not the number of encoders.",
      mechanism:
        "Compare full model with synchronized ablations, shuffled timing, contradictory cues, missingness, instruction swaps, and action interventions under the same task; measure calibration and fallback behavior.",
      workedExample:
        "Removing language has no effect on chosen action across differently worded goals. The language branch may be ignored even if caption loss is low; grounding evidence fails.",
      boundary:
        "Ablation can underestimate value if training adapts to missing modalities; include trained baselines and test-time removal with clear interpretation.",
      check: {
        prompt:
          "Performance falls when audio is removed. Does that prove correct audio grounding?",
        expected:
          "No. Audio may carry shortcuts or timing cues. Use controlled content swaps, synchronization tests, and outcome-specific interventions to identify what information is used.",
        retry:
          "Change audio meaning while preserving nuisance properties and predict the grounded consequence.",
      },
    },
    transfer: {
      prompt: "Which failure most clearly indicates temporal leakage?",
      options: [
        {
          text: "The model performs worse without color",
          feedback: "That could be ordinary feature use.",
        },
        {
          text: "Training input includes a sensor value recorded after the target action outcome",
          feedback: "Correct: future evidence leaks the answer.",
        },
        {
          text: "Text and images have different widths",
          feedback: "Representation width alone is not leakage.",
        },
      ],
      answer: 1,
      worked:
        "Audit timestamps and masks at the serialized-example level, then rerun after cutting future channels.",
      retry:
        "For every input, ask whether it would exist at the real decision time.",
    },
    motion: {
      concept: "multimodal",
      headline:
        "A multimodal world model aligns different evidence streams on one causal decision timeline.",
      intro:
        "Language, vision, sensors, and actions enter distinct lanes before grounded fusion and future prediction.",
      labels: ["CLOCKS", "ALIGN", "CONDITION", "TEST"],
      titles: [
        "Each modality arrives with its own rate, units, and missingness.",
        "Synchronization and masks establish what co-occurs without leakage.",
        "Fusion conditions dynamics, goals, or action consequences.",
        "Swaps and ablations test grounding and safe degradation.",
      ],
    },
  }),
  defineWorldModelLesson({
    id: "world-model-research-capstone",
    track: "wm-advanced",
    title: "Research Capstone — A Falsifiable World-Model Study",
    number: 46,
    duration: 50,
    plain:
      "The final capstone asks you to choose one specialization and produce a small, reproducible study whose claim could genuinely fail.",
    precise:
      "A complete study defines a learner outcome and hypothesis; pins data generation, observation/action schema, model and baseline, seeds, budgets, metrics, and evidence tier; implements a deterministic local fixture; preregisters decision rules; records failures and artifacts; and separates fixture conclusions from published or real-system claims. The study may investigate objects, hierarchy, geometry, causality, or multimodality without pretending these branches form one mandatory chain.",
    analogy:
      "It is a wind-tunnel experiment: small enough to inspect, strict enough to reject an attractive but wrong design.",
    analogyBreak:
      "a course-scale result can validate a mechanism and workflow but cannot establish production performance or a field-wide conclusion.",
    ideas: [
      "Choose one branch and write a falsifiable changed-case hypothesis before implementing.",
      "Build the smallest deterministic generator, baseline, intervention, metric, and failure log that answers it.",
      "Package code/specification, artifacts, provenance, result, null result, limitations, and next discriminating experiment.",
    ],
    worked:
      "Choose the geometry branch. Here `rotation-equivariant` means rotating input position/action by $R$ should rotate the predicted velocity by the same $R$: $f(Rx,Ra)=Rf(x,a)$. Preregister: with four training angles, four held-out rotations, seeds [1,2,3], and 200 matched updates, the equivariant rule is supported only if mean held-out vector error improves by at least 0.05 over lookup and every equation residual is below 0.02. Raw fixture results are errors 0.12 versus 0.13 (improvement 0.01) and maximum residual 0.018, so the primary improvement threshold fails: report the hypothesis as not supported despite passing the equation-residual gate.",
    misconception:
      "A capstone is not complete when a demo runs; it needs a committed question, baseline, falsification rule, changed-case test, and evidence boundary.",
    quiz: {
      question: "Which capstone question is falsifiable?",
      options: [
        "Are world models interesting?",
        "Under matched data and update budgets, does an equivariant transition reduce held-out rotation error below the preregistered threshold?",
        "Can I make a nice animation?",
        "Is my model intelligent?",
      ],
      answer: 1,
      explanation:
        "It names the comparison, budget, changed case, metric, and decision threshold.",
    },
    lab: "wm-evaluation",
    prerequisites: ["world-model-operations-case-study"],
    sources: [
      wmSources.osfPreregistration,
      wmSources.mbrlSurvey,
      wmSources.worldModels,
    ],
    objectives: [
      "Design and execute a self-contained world-model study with a falsifiable changed-case hypothesis",
      "Package evidence, failures, limitations, and a next experiment without overstating the result",
    ],
    vocabulary: [
      {
        term: "Preregistration",
        meaning:
          "Committing hypotheses, metrics, exclusions, and decision rules before observing final results.",
      },
      {
        term: "Null result",
        meaning:
          "A result that does not meet the predeclared evidence threshold for the proposed effect.",
      },
      {
        term: "Reproduction boundary",
        meaning:
          "The exact environment, artifacts, and claims another person can recreate.",
      },
    ],
    stages: ["Commit question", "Run matched study", "Package and bound"],
    checkpoints: [
      "Choose one branch, baseline, changed case, threshold, and stop rule.",
      "Pin fixture, seeds, budgets, checks, failures, and raw outputs.",
      "Apply the rule, preserve nulls, state scope, and propose the next discriminator.",
    ],
    primaryCheck: {
      prompt:
        "Using the provided geometry fixture results—equivariant error 0.12, lookup error 0.13, max equation residual 0.018—apply the preregistered rule of at least 0.05 error improvement and residual below 0.02. State protocol, arithmetic, and decision.",
      expected:
        "The study selected one branch and pinned four train/four held-out angles, seeds [1,2,3], 200 updates per model, lookup baseline, vector-error metric, and equivariance residual. Improvement is $0.13-0.12=0.01<0.05$ while residual $0.018<0.02$. Because both committed gates are required, the hypothesis is not supported; the result remains a valid null for this deterministic fixture.",
      retry:
        "List fixture, baseline, seeds/budget, changed rotations, and both thresholds before reading values; then apply the predeclared conjunction without moving it.",
    },
    decision: {
      explanation:
        "The conclusion must follow the preregistered rule and the evidence source even when the result is disappointing.",
      mechanism:
        "Verify artifacts, exclusions, and budgets; compute declared metrics and uncertainty; inspect counterexamples; compare with the threshold; report support, non-support, or invalidation; then name one experiment that separates leading explanations.",
      workedExample:
        "A complete handoff includes hypothesis/protocol, generator and model/baseline specification, environment/package versions, seeds and budgets, raw per-case JSON, verifier output, a failed-run log, counterexamples, null decision, limitations, and a preregistered next test adding eight held-out rotations to separate low power from no useful advantage.",
      boundary:
        "Repeatedly changing thresholds after seeing results converts a confirmatory claim into exploratory analysis and must be labeled.",
      check: {
        prompt:
          "The primary threshold fails and an unplanned slice looks strong. Specify the complete handoff and one next discriminating experiment.",
        expected:
          "Package the committed question/rule, pinned fixture and schema, implementation or exact spec, baseline, versions, seeds/budgets, raw outcomes including the strong slice, deterministic checks, failure/counterexample log, and artifact hashes/paths. State `not supported` for the primary claim; label the slice exploratory; limit conclusions to this fixture. Next, preregister a powered changed-case run that isolates a leading explanation—for example eight new rotations under the same budget rule—before observing it.",
        retry:
          "Imagine a skeptical learner reproducing the null: list every missing input, raw output, failure, and decision field, then propose one future manipulation that would make two explanations predict different results.",
      },
    },
    transfer: {
      prompt: "Which handoff is complete?",
      options: [
        {
          text: "A screenshot and success claim",
          feedback: "It lacks runnable evidence and a boundary.",
        },
        {
          text: "Question, pinned fixture/spec, baseline, budgets, raw artifact, checks, failures, decision, limits, and next experiment",
          feedback:
            "Correct: another learner can audit and reproduce the study.",
        },
        {
          text: "Only the best seed",
          feedback: "Seed selection hides variability.",
        },
      ],
      answer: 1,
      worked:
        "Deliver the machine-readable artifact plus a readable report that links every conclusion to a recorded field.",
      retry:
        "Imagine a skeptical learner rebuilding the result without asking you any questions; list what they still need.",
    },
    motion: {
      concept: "evaluation",
      headline:
        "A research capstone closes the loop from a committed hypothesis to inspectable bounded evidence.",
      intro:
        "The final scorecard cannot reveal its result until the changed case, baseline, budget, and decision rule are fixed.",
      labels: ["HYPOTHESIS", "PROTOCOL", "EVIDENCE", "BOUNDARY"],
      titles: [
        "Write a claim and threshold that can fail.",
        "Pin the matched fixture, intervention, baseline, and checks.",
        "Preserve raw results, failures, uncertainty, and artifacts.",
        "Apply the rule, state scope, and propose a discriminating next test.",
      ],
    },
  }),
] as const;
