import { plannedCourseManifests } from "../../research-curriculum-manifests";
import { defineResearchLesson } from "../../research-courses/helpers";
import { embodiedSeed, py } from "../seed";
const m = plannedCourseManifests.embodied;

export const embodiedPolicySpecs = [
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "language-grounding",
      plain:
        "Language grounding connects words such as ‘red cup’ or ‘put inside’ to observable entities, relations, task state, and feasible skills in the current environment.",
      precise:
        "Parse an instruction into referents, spatial relations, temporal order, constraints, and goal predicates; bind candidates from the current scene representation; score language compatibility separately from embodied affordance; ask or abstain under ambiguity; and evaluate reference, relation, sequence, negation, and changed-scene slices.",
      mentalModel:
        "Translate a verbal request into pointers and testable conditions on the robot's current map.",
      ideas: [
        "Turn language into explicit referents, relations, goals, and constraints.",
        "Separate semantic match from physical affordance and current feasibility.",
        "Ask, abstain, or recover when multiple bindings remain plausible.",
      ],
      worked:
        "Instruction ‘place the red cup inside the blue bowl’ yields cup candidates C1/C2; C1 is red with score .9 but unreachable, C2 is orange .4 and reachable. Neither satisfies both language and affordance, so the system abstains rather than choosing one score alone.",
      boundary:
        "A correct noun phrase does not imply the object exists, is reachable, or can be manipulated safely; language-model fluency is not grounded evidence.",
      objectives: {
        primary:
          "Bind language instructions to scene entities, relations, and goal predicates",
        decision:
          "Resolve ambiguity using semantic, affordance, and abstention evidence",
      },
      vocabulary: [
        {
          term: "Grounding",
          meaning:
            "Linking language symbols to entities, relations, states, actions, or outcomes in the current world.",
        },
        {
          term: "Referent",
          meaning:
            "The entity or region that a phrase denotes in a specific context.",
        },
        {
          term: "Affordance",
          meaning:
            "Evidence that an action is feasible for a particular body, object, and state.",
        },
      ],
      primaryCheck: {
        prompt:
          "Translate ‘put the red cup inside the blue bowl’ into the minimum grounded task fields before acting.",
        expected:
          "Bind a red-cup referent and blue-bowl referent, define the inside relation as a goal predicate, retain current poses/uncertainty, test reach/grasp/place affordances, and preserve constraints.",
        retry:
          "Underline noun phrases, relation, action, and constraints, then map each to a scene field or executable predicate.",
      },
      decision: {
        explanation:
          "Ambiguity resolution requires joint semantic and embodied evidence plus a threshold for asking or abstaining.",
        mechanism:
          "Enumerate candidate bindings, score language attributes/relations and current affordance separately, reject constraint violations, compare calibrated margins, and ask a discriminating question or choose no action when no candidate passes all gates.",
        workedExample:
          "C1 semantic .9/affordance 0 and C2 semantic .4/affordance .8 leave no valid red reachable cup; ‘which cup?’ or a new view is preferable to forced argmax.",
        boundary:
          "Thresholds calibrated in one vocabulary, scene generator, and perception system may fail after new objects, wording, or occlusion.",
        check: {
          prompt:
            "Best language match is unreachable while the reachable object violates the requested color. Which action is justified?",
          expected:
            "No manipulation is grounded under both requirements; abstain, reobserve, or ask a clarification instead of trading away one non-negotiable predicate.",
          retry:
            "Apply semantic, affordance, and constraint gates before ranking remaining candidates.",
        },
      },
      quiz: {
        question: "What does an affordance score add to language match?",
        options: [
          "Evidence that the body can execute the relevant action in the current state",
          "A synonym list only",
          "A reward guarantee",
          "A new object",
        ],
        answer: 0,
        explanation:
          "Grounded choice must be physically feasible for this embodiment and scene.",
      },
      transfer: {
        prompt:
          "‘Grab it’ follows two mentioned objects. What should the system do?",
        correct:
          "Resolve discourse with calibrated evidence or ask which object",
        wrong: ["Choose the nearest silently", "Ignore earlier context"],
        worked:
          "Retain both referent hypotheses and ask the smallest question that distinguishes them when the margin is inadequate.",
        retry: "List all compatible referents before selecting one.",
      },
      lab: {
        title: "Grounding and affordance gate",
        question:
          "Which candidate satisfies language, physical feasibility, and ambiguity rules?",
        controlLabel: "Binding",
        boundary:
          "The scores are fixed teaching values, not calibrated perception or language outputs.",
        cases: [
          {
            label: "semantic .9 / affordance 0",
            resultLabel: "decision",
            resultValue: "REJECT",
            meter: 90,
            detail:
              "The noun phrase matches but the body cannot reach the candidate.",
          },
          {
            label: "semantic .4 / affordance .8",
            resultLabel: "decision",
            resultValue: "REJECT",
            meter: 75,
            detail: "The reachable object violates the requested attribute.",
          },
          {
            label: "both .85",
            resultLabel: "decision",
            resultValue: "BIND",
            meter: 25,
            detail:
              "Semantic, relation, affordance, and constraint gates pass together.",
          },
        ],
      },
      motionConcept: "multimodal",
      code: {
        title: "Apply semantic and affordance gates",
        language: "Python 3",
        setup:
          "A candidate table prevents one score from overriding the other.",
        predict: "Which candidates remain?",
        code: py(
          "candidates=[{'id':'C1','semantic':.9,'affordance':0},{'id':'C2','semantic':.4,'affordance':.8}]",
          "valid=[x['id'] for x in candidates if x['semantic']>=.7 and x['affordance']>=.7]",
          "print(valid)",
          "assert valid==[]",
        ),
        observe:
          "No candidate passes both gates, so the correct state is abstention.",
        tryIt: "Add relation confidence and a clarification rule.",
      },
      sourceKeys: ["saycan", "rt1"],
    }),
  ),
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "multimodal-policy-encoders",
      plain:
        "A multimodal policy encoder turns images, language, proprioception, and task state into aligned tokens while preserving modality identity, timing, masks, and geometry.",
      precise:
        "Image patches $[B,N_v,D]$, language tokens $[B,N_l,D]$, proprioceptive tokens, goal/state tokens, modality and position embeddings, timestamps, validity masks, and attention masks enter a fusion stack. Projection layers align width, not meaning. Early fusion, cross-attention, and pooled bottlenecks trade computation, locality, and information loss.",
      mentalModel:
        "Seat several specialists at one table, give each notes with a name and timestamp, then control who may read whose notes.",
      ideas: [
        "Assert every modality's source shape, projected width, mask, and time semantics.",
        "Preserve spatial/temporal position and modality identity through fusion.",
        "Use ablations, shuffles, and counterfactual changes to test reliance.",
      ],
      worked:
        "Image yields 64 tokens, language 12, proprioception 1, goal 1: concatenation gives 78 tokens of width 128 and attention score shape [B,H,78,78]; masking one missing proprio token leaves 77 valid keys.",
      boundary:
        "A shared token width or attention weight does not establish alignment, grounding, causal reliance, or robustness to a missing modality.",
      objectives: {
        primary: "Construct and trace a vision-language-state token interface",
        decision:
          "Test multimodal fusion with masks, ablations, and counterfactual inputs",
      },
      vocabulary: [
        {
          term: "Projection",
          meaning:
            "A learned mapping that converts modality features into a shared hidden width.",
        },
        {
          term: "Modality embedding",
          meaning:
            "A learned marker telling the model which sensor or source produced a token.",
        },
        {
          term: "Cross-attention",
          meaning:
            "Attention where queries from one stream read keys and values from another stream.",
        },
      ],
      primaryCheck: {
        prompt:
          "Image/language/proprio/goal contribute 64/12/1/1 tokens of width 128. What fused and attention shapes result?",
        expected:
          "The sequence has 78 tokens, shape [B,78,128]. With H heads, the full score tensor is [B,H,78,78]. A key-validity mask may remain compact as [B,1,1,78] and broadcast across heads and query positions; a combined query/key or pairwise mask may be [B,1,78,78] and broadcast across heads. It need not be physically expanded to [B,H,78,78].",
        retry:
          "Add token counts across modalities while keeping batch/width, place sequence length on both score axes, then label which mask axes are explicit and which broadcast.",
      },
      decision: {
        explanation:
          "Fusion evidence asks whether action changes follow task-relevant modality changes and remain stable to irrelevant ones.",
        mechanism:
          "Mask missing inputs, shuffle language-image pairing, replace one modality with matched noise, change one object/instruction/joint value, and compare action, attention-independent probes, task success, calibration, and constraints by slice.",
        workedExample:
          "Changing ‘red’ to ‘blue’ should switch the bound target; shuffling background texture should not. A policy that changes only for texture fails the counterfactual reliance test.",
        boundary:
          "Finite ablations can miss redundant or distributed shortcuts and do not prove human-interpretable internal alignment.",
        check: {
          prompt:
            "Actions remain identical when instruction target changes but flip when irrelevant background changes. What diagnosis follows?",
          expected:
            "The encoder/policy ignores or weakly grounds language while relying on a visual shortcut; inspect pairing, masks, representations, and changed-scene training evidence.",
          retry:
            "Pair one task-relevant and one irrelevant counterfactual while holding every other token fixed.",
        },
      },
      quiz: {
        question: "What does projection to shared width guarantee?",
        options: [
          "Only compatible tensor width, not semantic alignment",
          "Perfect grounding",
          "Causal attention",
          "No missing data",
        ],
        answer: 0,
        explanation:
          "Semantic use must be tested with behavior and counterfactual evidence.",
      },
      transfer: {
        prompt:
          "A missing camera token is zero-filled but unmasked. What risk appears?",
        correct: "The model may treat the placeholder as real evidence",
        wrong: [
          "No risk because zero means absent universally",
          "Only batch size changes",
        ],
        worked:
          "Carry an explicit validity mask and test missing-modality behavior.",
        retry:
          "Ask whether the fusion layer can distinguish absent from a legitimate zero feature.",
      },
      lab: {
        title: "Multimodal token inspector",
        question:
          "Which shape, mask, or counterfactual exposes a valid fusion interface?",
        controlLabel: "Fusion record",
        boundary:
          "Token counts and actions are teaching fixtures, not model measurements.",
        cases: [
          {
            label: "78 tokens",
            resultLabel: "shape",
            resultValue: "[B,78,128]",
            meter: 25,
            detail: "All modality counts and shared width are explicit.",
          },
          {
            label: "missing unmasked",
            resultLabel: "validity",
            resultValue: "FAIL",
            meter: 100,
            detail: "Placeholder content can enter attention as if observed.",
          },
          {
            label: "target word swap",
            resultLabel: "action",
            resultValue: "MUST RESPOND",
            meter: 70,
            detail:
              "A relevant language counterfactual should alter target-dependent behavior.",
          },
        ],
      },
      motionConcept: "attention",
      code: {
        title: "Construct multimodal tokens, embeddings, and masks",
        language: "Python 3",
        setup:
          "A dependency-free fixture projects each source to one shared width, adds modality/time/position markers, and constructs compact broadcastable validity masks.",
        predict:
          "What token and mask shapes result after batch 1 loses proprioception?",
        code: py(
          "B,D,H=2,128,4; counts={'vision':64,'language':12,'proprio':1,'goal':1}",
          "modality_id={'vision':1,'language':2,'proprio':3,'goal':4}",
          "def make_token(modality,position,time_s,source_value):",
          "    projected=[source_value]*(D); projected[0]+=modality_id[modality]; projected[1]+=position/100; projected[2]+=time_s",
          "    return {'value':projected,'modality':modality,'position':position,'time_s':time_s}",
          "tokens=[]",
          "for batch in range(B):",
          "    row=[]",
          "    for modality,count in counts.items(): row += [make_token(modality,i,2.0,i+batch) for i in range(count)]",
          "    tokens.append(row)",
          "N=len(tokens[0]); valid=[[True]*N for _ in range(B)]; proprio_index=counts['vision']+counts['language']; valid[1][proprio_index]=False",
          "key_mask=[[[[flag for flag in row]]] for row in valid]  # [B,1,1,N], broadcasts over H and queries",
          "pair_mask=[[[[valid[b][q] and valid[b][k] for k in range(N)] for q in range(N)]] for b in range(B)]  # [B,1,N,N]",
          "assert N==78 and all(len(token['value'])==D for row in tokens for token in row)",
          "assert sum(valid[0])==78 and sum(valid[1])==77 and len(key_mask)==B and len(pair_mask[0][0])==N",
          "print({'tokens':(B,N,D),'scores':(B,H,N,N),'key_mask':(B,1,1,N),'pair_mask':(B,1,N,N),'valid':list(map(sum,valid))})",
        ),
        observe:
          "The interface contains [2,78,128] projected-and-marked tokens. Scores are [2,4,78,78], while the missing-proprio key mask remains [2,1,1,78] or combines with query validity as [2,1,78,78] and broadcasts over heads.",
        tryIt:
          "Drop vision in batch 0 and verify that both compact key validity and pairwise query/key masks block the correct indices without allocating an unnecessary [B,H,N,N] copy.",
      },
      sourceKeys: ["rt1", "oxemb"],
    }),
  ),
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "transformer-action-policies",
      plain:
        "A transformer action policy predicts the next action or action chunk from a causal sequence of grounded observations, instructions, states, and earlier applied actions.",
      precise:
        "Serialize context into token groups with position/time/modality markers. Place each action logit at an instruction/observation state position whose prefix excludes its target, then apply a causal or block-causal mask so prediction at t cannot read future observations or action targets. Decode discrete bins or continuous distribution parameters for $a_{t:t+H-1}$. Shift targets onto those earlier prediction positions, mask episode padding in both attention and loss, preserve action units, and evaluate autoregressive error and closed-loop execution.",
      mentalModel:
        "Write a decision timeline where each prediction may read only pages already available at that physical instant, and print the answer on the previous page rather than handing it the answer page.",
      ideas: [
        "Specify token order, prediction position, and attention permission for every action target.",
        "Shift targets onto pre-action positions and mask episode padding without crossing episode boundaries.",
        "Compare teacher-forced likelihood with free-running and chunked control.",
      ],
      worked:
        "Serialize `[instruction,o0,a0,o1,a1]`. The hidden state at o0 predicts target a0 from `[instruction,o0]`; the hidden state at o1 predicts a1 from `[instruction,o0,a0,o1]`. With batch 2, five positions, width 32, and four action bins, hidden states are `[2,5,32]`, the attention mask is `[2,1,5,5]`, and logits are `[2,5,4]` before selecting o0/o1 prediction rows. Putting the a1 logit at the a1 token with a diagonal causal mask leaks the answer because that position can read itself.",
      boundary:
        "Correct target shifting prevents one leakage path but does not solve exposure bias, action discretization error, unsupported states, or closed-loop instability.",
      objectives: {
        primary:
          "Implement a causal transformer action-policy serialization and loss",
        decision:
          "Diagnose leakage, teacher-forcing gaps, and closed-loop action error",
      },
      vocabulary: [
        {
          term: "Causal mask",
          meaning:
            "An attention rule preventing a prediction from reading future or target-only tokens.",
        },
        {
          term: "Target shift",
          meaning:
            "Training an earlier, causally valid prediction position against the later action token it must predict.",
        },
        {
          term: "Teacher forcing",
          meaning:
            "Training with recorded previous actions or tokens rather than model-generated ones.",
        },
        {
          term: "Action discretization",
          meaning:
            "Mapping continuous command values into finite bins or tokens.",
        },
      ],
      primaryCheck: {
        prompt:
          "For `[instruction,o0,a0,o1,a1]`, where should the a1 logit live, and which tokens may it read?",
        expected:
          "Use the hidden state at o1 (or an equivalent pre-action query) as the a1 predictor. It may read instruction, o0, earlier applied a0, and current o1; it must not read target a1 or later tokens. Padded keys are blocked and padded predictor rows contribute zero loss.",
        retry:
          "Mark each action target, move its prediction row to the latest position available before that action, then shade every later token and every padded cell.",
      },
      decision: {
        explanation:
          "Transformer policy evaluation separates correct causal training from the gap between expert prefixes and model-generated closed-loop prefixes.",
        mechanism:
          "Run target-shift and future-token invariance tests, episode permutation/split checks, teacher-forced and autoregressive action metrics, chunk masks, perturbed rollouts, support, constraints, and first-divergence traces at matched horizons.",
        workedExample:
          "Teacher-forced action accuracy is 95%, but after one wrong gripper token the autoregressive policy enters an unseen state and success drops to 40%; causal loss correctness did not solve exposure bias.",
        boundary:
          "A finite rollout suite cannot establish long-horizon recovery or safe behavior outside the tested simulator distribution.",
        check: {
          prompt:
            "Teacher-forced accuracy stays 95% while autoregressive success is 40%. What evidence explains the gap?",
          expected:
            "Model-generated actions alter later context, so errors compound outside expert prefixes; inspect first divergence, occupancy support, and recovery rather than treating fixed-prefix accuracy as control success.",
          retry:
            "Replay once with expert previous actions and once with model-applied actions, then locate the first context difference.",
        },
      },
      quiz: {
        question: "May a0 be used when predicting a1?",
        options: [
          "Yes, if it was the applied earlier action in the causal prefix",
          "No earlier action may ever be used",
          "Only if a1 is visible",
          "Only at evaluation",
        ],
        answer: 0,
        explanation:
          "Past applied actions are available history; future/current targets are not.",
      },
      transfer: {
        prompt:
          "Changing future a2 alters earlier a0 logits during a leakage test. What failed?",
        correct: "The attention/serialization path leaks future targets",
        wrong: ["Expected causal behavior", "Only optimizer state"],
        worked:
          "Repair mask, token placement, or target shift until future-target edits leave earlier logits invariant.",
        retry:
          "Trace all embedding and attention paths into the earlier prediction row.",
      },
      lab: {
        title: "Causal action sequence gate",
        question:
          "Which target placement is causal, leaked, or closed-loop unsupported?",
        controlLabel: "Sequence case",
        boundary:
          "The token examples are serialization fixtures rather than trained-policy results.",
        cases: [
          {
            label: "o1 row predicts a1",
            resultLabel: "target shift",
            resultValue: "CAUSAL",
            meter: 20,
            detail:
              "The pre-action row sees current evidence and earlier applied a0, but not target a1.",
          },
          {
            label: "a1 row reads diagonal",
            resultLabel: "loss",
            resultValue: "LEAKED",
            meter: 100,
            detail:
              "A standard diagonal causal mask lets the answer token enter its own prediction state.",
          },
          {
            label: "model-prefix drift",
            resultLabel: "rollout",
            resultValue: "TEST RECOVERY",
            meter: 80,
            detail:
              "Autoregressive context leaves the teacher-forced data distribution.",
          },
        ],
      },
      motionConcept: "attention",
      code: {
        title: "Specify target-shifted causal action loss",
        language: "Python 3",
        setup:
          "A dependency-free serializer constructs key/query-aware causal masks, shifts action targets, and excludes padding using target validity rather than predictor validity alone.",
        predict: "Can the o1 prediction row read target a1?",
        code: py(
          "import math",
          "tokens=['instruction','o0','a0','o1','a1']; T=len(tokens)",
          "predict_rows=[1,3]; target_rows=[2,4]",
          "valid=[[True,True,True,True,True],[True,True,True,True,False]]  # batch 1 pads target a1",
          "mask=[[[[valid[b][q] and valid[b][k] and k<=q for k in range(T)] for q in range(T)]] for b in range(2)]  # [B,1,T,T]",
          "target_bins=[[None,None,2,None,1],[None,None,0,None,None]]",
          "logits={(0,1):[0.,0.,3.,0.],(0,3):[0.,2.,0.,0.],(1,1):[3.,0.,0.,0.],(1,3):[0.,0.,0.,0.]}",
          "loss_terms=[]",
          "for b in range(2):",
          "    for predictor,target in zip(predict_rows,target_rows):",
          "        loss_valid=valid[b][predictor] and valid[b][target]",
          "        if loss_valid:",
          "            scores=logits[(b,predictor)]; y=target_bins[b][target]; m=max(scores)",
          "            loss_terms.append(-(scores[y]-m-math.log(sum(math.exp(s-m) for s in scores))))",
          "prefix=lambda seq,row: tuple(seq[:row+1])",
          "edited=tokens.copy(); edited[4]='different_future_a1'",
          "assert not mask[0][0][3][4] and not any(mask[1][0][4])  # future key and padded query blocked",
          "assert len(loss_terms)==3 and prefix(tokens,1)==prefix(edited,1)",
          "print({'mask_shape':(2,1,T,T),'valid_losses':len(loss_terms),'mean_loss':sum(loss_terms)/len(loss_terms)})",
        ),
        observe:
          "The a1 logit lives at o1 and cannot read later target a1. Validity blocks padded keys and padded query rows; shifted target validity removes batch 1's padded a1 from loss, leaving three real action targets.",
        tryIt:
          "Mark batch 1 target a1 valid without supplying its label and confirm the target-validity contract fails; then move a1 prediction to row 4 and show the diagonal would expose the answer token.",
      },
      codeGuidance: {
        mode: "run",
        requirements:
          "Python 3 standard library only; this complete fixture executes serialization, mask, target-shift, loss, and future-prefix invariants, not transformer training or simulator evaluation.",
      },
      sourceKeys: ["act", "rt1"],
    }),
  ),
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "diffusion-policies",
      plain:
        "A diffusion policy generates an action sequence by repeatedly denoising random action noise while conditioning on the current observation and task.",
      precise:
        "Normalize an expert action chunk $a^0$, sample timestep k and noise $\\epsilon$, form $a^k=\\alpha_k a^0+\\sigma_k\\epsilon$, and train a conditional network to predict noise, clean actions, or velocity. At control time start from noise, run a declared sampler, denormalize/bound actions, execute a prefix, and replan. Schedule, sample count, condition freshness, multimodality, latency, and constraints define use.",
      mentalModel:
        "Sculpt a coherent short maneuver from noise while repeatedly consulting the current scene and task.",
      ideas: [
        "Trace action, noise, timestep, condition, and prediction shapes through training.",
        "Separate denoising iterations from real control steps and policy calls.",
        "Measure action multimodality, sampling latency, prefix execution, and recovery.",
      ],
      worked:
        "For one batch, horizon 2, and scalar action, clean chunk [1,−1] has shape [1,2,1]; condition has shape [1,C], where C is the condition-feature width, and timestep has shape [1]. With alpha=.8, sigma=.6, noise [.5,.5], corruption gives [1.1,−.5]. If predicted noise is [.4,.2], one clean estimate is [(1.1−.6×.4)/.8,(−.5−.6×.2)/.8]=[1.075,−.775].",
      boundary:
        "Diffusion can represent multiple action modes but does not guarantee they are feasible, safe, grounded, or fast enough for the control deadline.",
      objectives: {
        primary:
          "Compute and implement conditional action-chunk corruption and denoising",
        decision:
          "Choose diffusion sampling and execution settings from mode, latency, and recovery evidence",
      },
      vocabulary: [
        {
          term: "Action diffusion",
          meaning:
            "A conditional generative process that iteratively denoises action sequences.",
        },
        {
          term: "Denoising step",
          meaning:
            "One model evaluation that updates a noisy action sample toward a cleaner sample.",
        },
        {
          term: "Receding-horizon execution",
          meaning:
            "Executing only a prefix of a predicted action sequence before conditioning and planning again.",
        },
      ],
      primaryCheck: {
        prompt:
          "For clean [1,−1], alpha=.8, sigma=.6, noise [.5,.5], and predicted noise [.4,.2], compute the corrupted chunk and the one-step clean estimate; which shapes stay fixed?",
        expected:
          "Corruption gives [1.1,−.5]. The clean estimate is [(1.1−.6×.4)/.8,(−.5−.6×.2)/.8]=[1.075,−.775]. Action tensors remain [1,2,1], condition [1,C], where C is the condition-feature width, and timestep [1]; this sampler update is not an environment action.",
        retry:
          "First compute forward corruption coordinate by coordinate; then subtract scaled predicted noise and divide by alpha, while retaining batch, horizon, action, condition, and timestep axes.",
      },
      decision: {
        explanation:
          "Sampler and executed-prefix choices trade multimodal action quality against model-call latency and feedback delay.",
        mechanism:
          "At matched data and environment steps, vary denoising count or prefix separately; record model calls, deadline misses, action error/distribution coverage, smoothness, task success, constraints, perturbation recovery, and all sampled candidates.",
        workedExample:
          "20 denoising steps improve fixture action likelihood but take 120 ms against a 50 ms deadline; a 5-step sampler meets timing and recovers earlier despite slightly worse open-loop fit.",
        boundary:
          "A setting chosen on one GPU, schedule, action scale, and task frequency may not transfer to another controller or provider.",
        check: {
          prompt:
            "A 20-step sampler improves action likelihood but misses the 50 ms control deadline. Can it be selected on likelihood alone?",
          expected:
            "No. It fails an operational timing gate; compare a faster sampler, cached/pipelined design, or lower-rate controller with task, safety, and recovery evidence.",
          retry:
            "Convert denoising steps into measured policy latency and compare with the action-application deadline before quality ranking.",
        },
      },
      quiz: {
        question: "Do ten denoising steps equal ten environment actions?",
        options: [
          "No; they refine one action sample before execution",
          "Yes always",
          "Only during training",
          "They are rewards",
        ],
        answer: 0,
        explanation:
          "Sampler computation and physical control steps are separate budgets.",
      },
      transfer: {
        prompt:
          "The condition is 200 ms stale during denoising. What risk appears?",
        correct: "The sampled chunk may be coherent for an obsolete scene",
        wrong: ["No risk because more denoising helps", "Only noise changes"],
        worked:
          "Carry condition timestamp through sampling and reject or recondition beyond the latency gate.",
        retry:
          "Ask which observation every denoising evaluation conditions upon.",
      },
      lab: {
        title: "Diffusion action sampler frontier",
        question:
          "How do denoising count, condition age, and executed prefix change control evidence?",
        controlLabel: "Sampler",
        boundary:
          "Corruption and latency values are deterministic teaching fixtures.",
        cases: [
          {
            label: "5 steps",
            resultLabel: "latency",
            resultValue: "30 ms",
            meter: 30,
            detail:
              "The sampler meets a 50 ms deadline with fewer model evaluations.",
          },
          {
            label: "20 steps",
            resultLabel: "latency",
            resultValue: "120 ms",
            meter: 100,
            detail: "Higher sampling cost misses the declared control period.",
          },
          {
            label: "stale condition",
            resultLabel: "action",
            resultValue: "REJECT",
            meter: 100,
            detail:
              "A coherent chunk can target a scene that no longer exists.",
          },
        ],
      },
      motionConcept: "distribution",
      code: {
        title: "Corrupt and denoise an action chunk",
        language: "Python 3",
        setup: "A two-action fixture exposes the diffusion training input.",
        predict: "What noisy chunk is produced?",
        code: py(
          "clean=[1.0,-1.0]; noise=[.5,.5]; predicted_noise=[.4,.2]",
          "alpha=.8; sigma=.6",
          "corrupted=[alpha*a+sigma*e for a,e in zip(clean,noise)]",
          "estimate=[(x-sigma*e)/alpha for x,e in zip(corrupted,predicted_noise)]",
          "print(corrupted,estimate)",
          "assert corrupted==[1.1,-.5]",
        ),
        observe:
          "The corrupted chunk is [1.1,−.5]; one predicted-noise clean estimate is [1.075,−.775] at the same action-chunk shape.",
        tryIt:
          "Change predicted noise and inspect how the reverse clean estimate moves while shapes remain fixed.",
      },
      sourceKeys: ["diffusionPolicy"],
    }),
  ),
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "vla-policy-capstone",
      duration: 42,
      plain:
        "The language-conditioned policy capstone builds one grounded multimodal interface and compares causal transformer and diffusion-style action decoders under matched data and control evidence.",
      precise:
        "Implement scene/language bindings, vision-language-state tokens, validity/time masks, typed action chunks, a causal transformer whose lower-triangular self-attention and action head actually execute, a diffusion decoder, normalization, checkpoints, inference timing, support and constraint gates, and a simulator evaluator. Acceptance includes shape/corruption tests, direct inspection of attention weights, future-token edits that cannot alter earlier transformer outputs, tiny-fit, deterministic smoke/full reproduction, grounding counterfactuals, closed-loop perturbations, latency, and seed rows.",
      mentalModel:
        "Give two action composers the same grounded score, sensors, rehearsal time, and stage, then compare what they do when the scene changes.",
      ideas: [
        "Share data, encoder contract, action semantics, seeds, and evaluation across decoders.",
        "Prove causal masks and diffusion corruption before long training.",
        "Apply grounding, deadline, support, and safety gates before task-success trade-offs.",
      ],
      worked:
        "Transformer and diffusion use identical episodes/updates. Diffusion improves multimodal action coverage but misses 50 ms deadline on one device; transformer passes latency but fails a changed-word grounding slice, so neither wins unconditionally.",
      boundary:
        "A matched simulator comparison cannot establish a universal VLA architecture ranking or safe real-robot behavior.",
      objectives: {
        primary:
          "Build and verify a grounded vision-language-action policy stack",
        decision:
          "Conduct a matched transformer-versus-diffusion action-policy experiment",
      },
      vocabulary: [
        {
          term: "VLA policy",
          meaning:
            "A vision-language-action policy mapping visual and linguistic context into embodied commands.",
        },
        {
          term: "Matched decoder comparison",
          meaning:
            "A study sharing data, encoder contract, action space, training exposure, and evaluation while changing the action decoder.",
        },
        {
          term: "Deadline miss",
          meaning:
            "An inference or control result arriving too late for its declared application time.",
        },
      ],
      primaryCheck: {
        prompt:
          "Which shared contracts must be identical before comparing transformer and diffusion action decoders?",
        expected:
          "Match source episodes/splits, multimodal encoder inputs, action units/chunks/masks, normalization, training examples/updates, seeds, evaluator, control frequency, constraints, and artifact rules.",
        retry:
          "Diff manifests and classify every field as shared, the one intended decoder change, or a reported cost consequence.",
      },
      decision: {
        explanation:
          "The comparison is a multi-gate decision over grounding, closed-loop task behavior, distribution coverage, latency, constraints, and compute.",
        mechanism:
          "Reproduce both baselines, pair seeds/scenes, keep data/updates fixed, record action loss/distribution, counterfactual grounding, success/recovery, deadline misses, model calls/runtime, constraints, failures, and choose only among configurations passing hard gates.",
        workedExample:
          "Diffusion covers two valid grasp modes but has 60 ms latency; transformer takes 20 ms but ignores ‘blue’ in a color swap. Under 50 ms and grounding gates, both current configurations fail for different reasons.",
        boundary:
          "The decision belongs to one task suite, embodiment, accelerator, sampler, data mixture, and budget.",
        check: {
          prompt:
            "Diffusion has higher success but misses deadline; transformer meets deadline but fails grounding. Which is selected?",
          expected:
            "Neither passes all hard gates. Preserve both failure dossiers, revise one mechanism at a time, and avoid compensating deadline or grounding failure with aggregate success.",
          retry:
            "Apply deadline, grounding, and safety gates before ranking task success among feasible policies.",
        },
      },
      quiz: {
        question:
          "What makes the decoder comparison causal enough to interpret?",
        options: [
          "One intended decoder change with matched data, interfaces, budgets, seeds, and evaluator",
          "Different data and tasks",
          "Best seed only",
          "Unreported latency",
        ],
        answer: 0,
        explanation:
          "Shared evidence isolates the architectural intervention more credibly.",
      },
      transfer: {
        prompt:
          "Diffusion receives twice the training updates. Is success comparable at matched compute?",
        correct: "No; match updates or show a quality-cost frontier",
        wrong: ["Yes, updates are free", "Only parameters matter"],
        worked:
          "Report examples, updates, model calls, time, and device separately.",
        retry: "Count primitive optimization and inference work for both arms.",
      },
      lab: {
        title: "VLA decoder decision gate",
        question:
          "Which evidence supports a shared baseline, hard failure, or bounded comparison?",
        controlLabel: "Decoder artifact",
        boundary: "The cards classify course-scale simulator evidence.",
        cases: [
          {
            label: "matched manifests",
            resultLabel: "comparison",
            resultValue: "VALID",
            meter: 25,
            detail:
              "Data, encoder, actions, updates, seeds, and evaluator agree.",
          },
          {
            label: "60 ms @50 ms",
            resultLabel: "diffusion",
            resultValue: "DEADLINE FAIL",
            meter: 100,
            detail:
              "Success cannot compensate for late control under the declared gate.",
          },
          {
            label: "word-swap ignored",
            resultLabel: "transformer",
            resultValue: "GROUNDING FAIL",
            meter: 100,
            detail:
              "The policy does not respond to a task-relevant language intervention.",
          },
        ],
      },
      motionConcept: "evaluation",
      code: {
        title: "Apply VLA release gates",
        language: "Python 3",
        setup:
          "A deterministic ledger keeps non-compensable failures separate from success.",
        predict: "Does either candidate pass?",
        code: py(
          "arms={'diffusion':{'success':.8,'latency_ms':60,'grounding':True},'transformer':{'success':.7,'latency_ms':20,'grounding':False}}",
          "valid={k:v for k,v in arms.items() if v['latency_ms']<=50 and v['grounding']}",
          "print(valid)",
          "assert valid=={}",
        ),
        observe: "Neither candidate passes both deadline and grounding gates.",
        tryIt: "Add constraint and recovery gates before ranking success.",
      },
      sourceKeys: ["act", "diffusionPolicy", "rt1"],
    }),
  ),
];
