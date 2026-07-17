import { plannedCourseManifests } from "../../research-curriculum-manifests";
import { defineResearchLesson } from "../../research-courses/helpers";
import { embodiedSeed, py } from "../seed";
const m = plannedCourseManifests.embodied;

export const embodiedDataSpecs = [
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "teleoperation-demonstrations",
      plain:
        "Teleoperation records a human or expert controlling the body, including what they saw, commanded, corrected, and handed over—not just successful final trajectories.",
      precise:
        "A capture protocol synchronizes observation packets, requested/applied actions, operator input device, control-mode mapping, intervention, task events, episode boundaries, operator/session/robot revisions, latency, calibration, and consent/rights metadata. Pilot trials measure controllability and operator burden before scaling collection.",
      mentalModel:
        "A demonstration is a timed flight-recorder trace of expert decisions, body motion, and corrections.",
      ideas: [
        "Calibrate operator input to applied robot command and log both.",
        "Preserve corrections, failures, interventions, and reset causes.",
        "Measure operator/session coverage, latency, quality, and rights.",
      ],
      worked:
        "Joystick x=.8 maps to requested tool delta 4 cm, workspace limiter applies 3 cm, and 70 ms capture-to-actuation latency is logged; the next observation is paired with applied 3 cm, not raw joystick .8.",
      boundary:
        "Human demonstration is not ground truth: operators vary, adapt to latency, make errors, and may avoid difficult but important states.",
      objectives: {
        primary: "Design and validate a teleoperation demonstration protocol",
        decision:
          "Audit operator latency, interventions, quality, and provenance",
      },
      vocabulary: [
        {
          term: "Teleoperation",
          meaning:
            "A person controlling a remote or simulated robot through a mapped input interface.",
        },
        {
          term: "Demonstration",
          meaning:
            "A recorded observation-action trajectory intended to show task behavior.",
        },
        {
          term: "Operator burden",
          meaning:
            "Time, effort, attention, fatigue, and correction cost imposed on the demonstrator.",
        },
      ],
      primaryCheck: {
        prompt:
          "Joystick input .8 requests 4 cm but limiter applies 3 cm. Which value owns the resulting transition and what else is retained?",
        expected:
          "Applied 3 cm caused the next state; store it as causal action while retaining joystick .8, requested 4 cm, limiter reason, timing, and operator provenance.",
        retry:
          "Follow the signal from input device through mapping and limiter to the command actually received by the simulator.",
      },
      decision: {
        explanation:
          "Collection quality is a joint property of operator, interface, timing, coverage, corrections, and provenance rather than success rate alone.",
        mechanism:
          "Stratify by operator/session/task/initial state, measure latency and dropped packets, review interventions and failure taxonomy, inspect action/scene coverage, sample annotation audits, and compare repeat trials without discarding difficult sessions.",
        workedExample:
          "Operator A succeeds 90% on easy starts while B succeeds 70% on balanced starts; unstratified success would rank operators while actually measuring different task mixtures.",
        boundary:
          "Reviewed samples and high success cannot establish label correctness or sufficient coverage for every learned-policy state.",
        check: {
          prompt:
            "Operator A appears better but receives only easy starts. What comparison repairs the claim?",
          expected:
            "Match or stratify by initial-state/task difficulty and report operator/session uncertainty, latency, interventions, and coverage before attributing the difference to operator quality.",
          retry:
            "Build a row for each operator × task slice rather than pooling all episodes.",
        },
      },
      quiz: {
        question: "Which action should train transition-aligned supervision?",
        options: [
          "The applied command that caused the next state, with requested input retained",
          "Only the input-device value",
          "Only success",
          "No action",
        ],
        answer: 0,
        explanation:
          "Physical consequence follows the applied command after mapping and limits.",
      },
      transfer: {
        prompt: "Failed demonstrations are deleted. What is lost?",
        correct:
          "Failure/recovery coverage and an honest collection denominator",
        wrong: ["Nothing; only success teaches", "Only file size"],
        worked:
          "Retain failure, correction, reset, and intervention rows with review labels.",
        retry:
          "Ask which states a learned policy will encounter after its own mistakes.",
      },
      lab: {
        title: "Demonstration recorder audit",
        question:
          "Which record preserves causal action, timing, and collection difficulty?",
        controlLabel: "Capture record",
        boundary:
          "The sessions are constructed evidence examples, not human-subject measurements.",
        cases: [
          {
            label: "raw joystick only",
            resultLabel: "transition",
            resultValue: "MISALIGNED",
            meter: 90,
            detail:
              "Input mapping and applied saturation are missing from causal supervision.",
          },
          {
            label: "request + applied",
            resultLabel: "trace",
            resultValue: "VALID",
            meter: 20,
            detail:
              "Mapping, limits, timestamps, and next-state ownership remain visible.",
          },
          {
            label: "easy-only success",
            resultLabel: "quality",
            resultValue: "CONFOUNDED",
            meter: 100,
            detail:
              "Operator and start-distribution effects cannot be separated.",
          },
        ],
      },
      motionConcept: "pipeline",
      code: {
        title: "Record requested and applied commands",
        language: "Python 3",
        setup:
          "A compact mapping fixture retains the whole control provenance.",
        predict: "What command owns the next state?",
        code: py(
          "joystick=.8; scale_m=.05; limit_m=.03",
          "requested=joystick*scale_m",
          "applied=max(-limit_m,min(limit_m,requested))",
          "row={'input':joystick,'requested_m':requested,'applied_m':applied}",
          "print(row); assert applied==.03",
        ),
        observe:
          "The applied 3 cm command owns the transition while operator intent remains inspectable.",
        tryIt:
          "Add capture and actuation timestamps and reject excessive latency.",
      },
      sourceKeys: ["dagger", "robotics"],
    }),
  ),
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "trajectory-datasets",
      plain:
        "A trajectory dataset stores complete episodes in a versioned schema so every observation, action, event, split, and use condition can be traced.",
      precise:
        "An episode table includes stable episode/step IDs, synchronized observation references, requested/applied actions, rewards or task events, termination/truncation, interventions, calibration and embodiment revision, collector, timestamps, checksums, and rights. Dataset cards record purpose, collection mixture, exclusions, known gaps, risks, splits, preprocessing, and licenses; splits occur before windowing.",
      mentalModel:
        "Treat the dataset as a chain-of-custody archive, not a folder of convenient arrays.",
      ideas: [
        "Version schema, manifests, checksums, and transformation lineage.",
        "Split whole episodes, operators, scenes, or robots according to the claim.",
        "Write coverage, exclusions, rights, and known limitations in the dataset card.",
      ],
      worked:
        "Episode E7 has steps 0–42, then terminal success; all windows derived from E7 stay in train. E8 from held-out operator and layout stays in evaluation, preventing adjacent frames and operator style from leaking.",
      boundary:
        "A complete dataset card makes gaps inspectable but cannot make a biased, unsafe, or unconsented collection suitable for every use.",
      objectives: {
        primary: "Implement a versioned episode and trajectory schema",
        decision:
          "Write leakage-resistant splits and a decision-useful dataset card",
      },
      vocabulary: [
        {
          term: "Dataset card",
          meaning:
            "A structured document describing dataset purpose, composition, collection, processing, uses, limits, and governance.",
        },
        {
          term: "Lineage",
          meaning:
            "The recorded chain from source episode through each transformation to a training or evaluation example.",
        },
        {
          term: "Checksum",
          meaning:
            "A content-derived identifier used to detect changed or corrupted files.",
        },
      ],
      primaryCheck: {
        prompt:
          "Which minimum identifiers let a shuffled training window be traced back to the action that caused its next observation, and how do you prove no raw source sample appears in both train and evaluation after windowing?",
        expected:
          "Retain dataset/schema revision, episode and step IDs, observation references, requested/applied action, timestamps, ending flags, collector/embodiment/calibration revisions, and transformation lineage. Derive a stable episode:step key for every source sample in every window, union those keys per split, and require the train/evaluation intersection to be empty; split labels alone are not an overlap audit.",
        retry:
          "Start from each derived example, walk backward to every exact raw episode:step key and manifest, group those keys by split, then compute the set intersection.",
      },
      decision: {
        explanation:
          "A split is valid only for the promised generalization axis and must be assigned before overlapping windows or derived features are created.",
        mechanism:
          "Choose held-out operator, scene, object, task, embodiment, or time according to the claim; assign whole source groups, generate windows afterward, hash for overlap, and document mixture counts, exclusions, licenses, risks, and unsupported uses.",
        workedExample:
          "In a constructed leakage fixture, random windows score 98% because E7 frames appear in both sets; an episode-and-operator split scores 74%. These are teaching values, not a measured robot-policy result, and they show why the lower number is the honest evidence for the stated new-operator claim.",
        boundary:
          "One held-out axis does not establish transfer across untested objects, robots, tasks, or real-world conditions.",
        check: {
          prompt:
            "Overlapping windows are randomly split before checking episode IDs. What leakage occurs and how is it repaired?",
          expected:
            "Near-identical temporal context from one episode crosses train/evaluation; assign whole episodes or claim-relevant groups first, then construct windows and verify hashes.",
          retry:
            "Map each derived window to all raw episode steps and require each source group to belong to one split.",
        },
      },
      quiz: {
        question: "When should episode splits be assigned?",
        options: [
          "Before creating overlapping windows",
          "After selecting the best metric",
          "Per frame at random",
          "Never",
        ],
        answer: 0,
        explanation:
          "Source-group separation prevents nearly identical context from crossing the boundary.",
      },
      transfer: {
        prompt:
          "A robot ID appears in train and a claimed new-robot test. Is that split valid?",
        correct: "No; hold out complete embodiment IDs and dependent episodes",
        wrong: ["Yes if filenames differ", "Only reward matters"],
        worked:
          "Rebuild the split at robot/source-group level and regenerate all derived examples.",
        retry:
          "Identify the independent entity named by the generalization claim.",
      },
      lab: {
        title: "Trajectory lineage gate",
        question:
          "Which schema or split supports reproducibility and the declared transfer claim?",
        controlLabel: "Dataset artifact",
        boundary:
          "The cards classify data contracts and do not measure policy quality.",
        cases: [
          {
            label: "frame shuffle",
            resultLabel: "leakage",
            resultValue: "HIGH",
            meter: 100,
            detail: "Adjacent episode context crosses the evaluation boundary.",
          },
          {
            label: "episode split",
            resultLabel: "lineage",
            resultValue: "TRACEABLE",
            meter: 25,
            detail:
              "Every derived window maps to one source group and revision.",
          },
          {
            label: "missing rights",
            resultLabel: "release",
            resultValue: "BLOCK",
            meter: 100,
            detail:
              "Unknown consent or license prevents a defensible use claim.",
          },
        ],
      },
      motionConcept: "data",
      code: {
        title: "Implement a versioned trajectory record and lineage check",
        language: "Python 3",
        setup:
          "A dependency-free schema validates IDs, actions, endings, checksum, transformation lineage, and whole-episode splits before windows exist.",
        predict:
          "Does the episode validate, and can every derived window be traced to one source split?",
        code: py(
          "import hashlib,json",
          "episode={'schema_version':'1.0','dataset_revision':'robot-traj-v3','episode_id':'E1','operator_id':'O1','robot_id':'R1','calibration_revision':'cam-v2','rights':'consented-research','steps':[{'step_id':0,'captured_ms':1000,'observation_ref':'rgb/E1/0.png','requested_action_m':.04,'applied_action_m':.03,'terminated':False,'truncated':False},{'step_id':1,'captured_ms':1050,'observation_ref':'rgb/E1/1.png','requested_action_m':0.,'applied_action_m':0.,'terminated':True,'truncated':False}]} ",
          "required={'schema_version','dataset_revision','episode_id','operator_id','robot_id','calibration_revision','rights','steps'}",
          "assert required<=episode.keys() and [s['step_id'] for s in episode['steps']]==list(range(len(episode['steps'])))",
          "assert all({'captured_ms','observation_ref','requested_action_m','applied_action_m','terminated','truncated'}<=s.keys() for s in episode['steps'])",
          "assert episode['steps'][-1]['terminated'] != episode['steps'][-1]['truncated']",
          "payload=json.dumps(episode,sort_keys=True,separators=(',',':')).encode(); checksum=hashlib.sha256(payload).hexdigest()",
          "lineage={'source_checksum':checksum,'transform':'window-v1','source_episode':'E1','source_steps':[0,1]} ",
          "splits={'train':{'E1','E2'},'test':{'E3'}}; assert not splits['train'] & splits['test']",
          "raw_episodes={'E1':episode,'E2':{'episode_id':'E2','steps':[{'step_id':0},{'step_id':1},{'step_id':2}]},'E3':{'episode_id':'E3','steps':[{'step_id':0},{'step_id':1},{'step_id':2}]}}",
          "def derive_windows(split,episode_id,width=2):",
          "    steps=[row['step_id'] for row in raw_episodes[episode_id]['steps']]",
          "    return [{'split':split,'episode':episode_id,'source_samples':[f'{episode_id}:{s}' for s in steps[i:i+width]]} for i in range(len(steps)-width+1)]",
          "windows=[w for split,ids in splits.items() for eid in sorted(ids) for w in derive_windows(split,eid)]",
          "def sample_keys(rows,split): return {key for row in rows if row['split']==split for key in row['source_samples']}",
          "train_samples=sample_keys(windows,'train'); test_samples=sample_keys(windows,'test'); overlap=train_samples & test_samples",
          "assert not overlap and all(w['episode'] in splits[w['split']] for w in windows) and lineage['source_episode']=='E1'",
          "leaked=windows+[{'split':'test','episode':'E3','source_samples':['E3:2','E1:1']}]",
          "detected_leak=sample_keys(leaked,'train') & sample_keys(leaked,'test')",
          "assert detected_leak=={'E1:1'}",
          "print(episode['schema_version'],checksum[:12],lineage,len(windows),overlap,detected_leak)",
        ),
        observe:
          "The schema and SHA-256 lineage validate, windows inherit preassigned episode splits, and an audit over actual episode:step source keys finds no normal overlap while detecting the injected E1:1 leak even though that row is labeled test.",
        tryIt:
          "Change the injected leak to a differently named derived feature that still cites E1:1 and confirm source-lineage intersection catches it; then change one applied action and observe the checksum change.",
      },
      sourceKeys: ["oxemb", "rt1"],
    }),
  ),
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "robot-data-quality",
      plain:
        "Robot data quality asks whether the recorded episodes cover the decisions a policy must make without leakage, corrupted timing, hidden rights problems, or misleading success mixtures.",
      precise:
        "Audit schema validity, sensor/action alignment, duplicate and near-duplicate episodes, class/action/scene/operator/robot coverage, critical recovery support, outcome and intervention balance, train-evaluation contamination, annotation consistency, privacy/rights, and transformation drift. Quality gates are slice-specific and preserve rejection reasons.",
      mentalModel:
        "Inspect the map for blank and duplicated regions before trusting a route learned from it.",
      ideas: [
        "Measure coverage at decision-relevant joint state-action slices.",
        "Detect duplicates and shared demonstrations across evaluation boundaries.",
        "Preserve rejection, rights, privacy, and failure evidence in the manifest.",
      ],
      worked:
        "Dataset has 10,000 steps but only 12 recovery actions, all from one operator and one layout; raw size is large while critical effective coverage is thin and cannot support new-layout recovery.",
      boundary:
        "Coverage counts do not reveal unobserved outcomes or prove causal usefulness; more low-diversity data can repeat the same blind spot.",
      objectives: {
        primary:
          "Compute decision-relevant robot-data coverage and quality slices",
        decision:
          "Diagnose leakage, duplication, imbalance, and governance failures",
      },
      vocabulary: [
        {
          term: "Coverage",
          meaning:
            "The represented range and frequency of decision-relevant states, actions, outcomes, and conditions.",
        },
        {
          term: "Near duplicate",
          meaning:
            "A highly similar episode or window that can inflate sample counts and leak context across splits.",
        },
        {
          term: "Governance",
          meaning:
            "Rules and evidence for lawful, ethical, documented collection, access, retention, and use.",
        },
      ],
      primaryCheck: {
        prompt:
          "A dataset has 10,000 steps but 12 recovery actions from one operator/layout. What coverage claim is supported?",
        expected:
          "Only thin recovery evidence in that one collection slice; total step count cannot support robust recovery or transfer to other operators and layouts.",
        retry:
          "Cross-tabulate critical action by operator, layout, initial state, outcome, and episode rather than reporting total rows.",
      },
      decision: {
        explanation:
          "A quality audit applies separate gates for technical validity, evaluation leakage, decision coverage, and allowed use.",
        mechanism:
          "Validate schemas/timing, hash exact and perceptual duplicates, join source groups across splits, compare critical slice counts and outcomes, inspect collection imbalance and exclusions, then verify consent/license/privacy and document every repair.",
        workedExample:
          "Removing cross-split duplicates lowers apparent success from 92% to 71%; separately, missing operator consent blocks release even though technical metrics pass.",
        boundary:
          "Passing known quality gates cannot establish missing-state outcomes or eliminate all privacy and collection bias.",
        check: {
          prompt:
            "After deduplication performance falls, and several sessions lack documented consent. Which conclusions follow?",
          expected:
            "The earlier evaluation was inflated by leakage/duplication, and governance independently blocks those sessions from use; neither issue can be repaired by model tuning.",
          retry:
            "Apply technical, coverage, leakage, and allowed-use gates as separate non-substitutable checks.",
        },
      },
      quiz: {
        question: "Does total transition count establish coverage?",
        options: [
          "No; coverage must be sliced by decisions and conditions",
          "Yes always",
          "Only on GPU",
          "Only when rewards are positive",
        ],
        answer: 0,
        explanation:
          "Many rows can repeat one easy region while critical states remain absent.",
      },
      transfer: {
        prompt: "All failures are filtered as bad data. What bias appears?",
        correct:
          "The dataset overstates success and removes recovery/failure evidence",
        wrong: ["Quality always improves", "No denominator changes"],
        worked:
          "Retain and label failures unless a documented integrity or rights rule excludes them.",
        retry:
          "Compare the original collection denominator with the released mixture.",
      },
      lab: {
        title: "Robot data audit",
        question:
          "Which evidence distinguishes volume, critical coverage, leakage, and allowed use?",
        controlLabel: "Audit row",
        boundary:
          "Counts are constructed fixtures rather than a real dataset audit.",
        cases: [
          {
            label: "10k total / 12 recovery",
            resultLabel: "coverage",
            resultValue: "THIN",
            meter: 85,
            detail:
              "Critical recovery evidence is sparse and concentrated in one slice.",
          },
          {
            label: "cross-split duplicates",
            resultLabel: "evaluation",
            resultValue: "INVALID",
            meter: 100,
            detail: "Repeated source content inflates held-out performance.",
          },
          {
            label: "missing consent",
            resultLabel: "use",
            resultValue: "BLOCK",
            meter: 100,
            detail:
              "Technical quality cannot substitute for documented collection rights.",
          },
        ],
      },
      motionConcept: "evaluation",
      code: {
        title: "Slice recovery coverage",
        language: "Python 3",
        setup: "A tiny count table exposes concentration behind a large total.",
        predict: "What percentage of rows are recovery actions?",
        code: py(
          "total=10000; recovery=12",
          "share=recovery/total",
          "print(share, f'{100*share:.2f}%')",
          "assert share==.0012",
        ),
        observe:
          "Recovery rows are only .12% and still require operator/layout slicing.",
        tryIt:
          "Group the recovery rows by operator and layout and add a minimum evidence gate.",
      },
      sourceKeys: ["oxemb", "dagger"],
    }),
  ),
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "action-representations-chunking",
      plain:
        "An action representation chooses what the policy predicts—joint commands, end-effector changes, or short action chunks—and therefore changes control frequency, ambiguity, and error recovery.",
      precise:
        "Map embodiment-specific commands into typed absolute/delta joint or Cartesian actions with units, frames, rate, bounds, and gripper semantics. An action chunk predicts $a_{t:t+H-1}$; execution may use all, a prefix, or temporal aggregation before replanning. Training targets, padding masks, overlap, latency, and requested/applied logging define correctness.",
      mentalModel:
        "Choose whether to write one steering correction at a time or a short maneuver, while keeping feedback points explicit.",
      ideas: [
        "Compare absolute, delta, joint, and task-space semantics through forward effects.",
        "Align chunk inputs/targets and mask padding across episode ends.",
        "Measure smoothness, latency, compounding error, and recovery as chunk length changes.",
      ],
      worked:
        "At 20 Hz, H=4 predicts 200 ms of actions. Executing all four open-loop delays visual correction by 200 ms; executing first two replans after 100 ms while retaining the remaining predictions only as unused intent.",
      boundary:
        "Longer executed prefixes can smooth motion, but they also delay feedback and can compound one bad prediction. Predicting several futures together does not itself create multimodality: the decoder and training objective must explicitly represent distinct plausible action sequences.",
      objectives: {
        primary: "Implement and validate typed action and chunk targets",
        decision:
          "Choose chunk execution from latency, smoothness, and recovery evidence",
      },
      vocabulary: [
        {
          term: "Action chunk",
          meaning:
            "A sequence of future actions predicted together from one policy input.",
        },
        {
          term: "Delta action",
          meaning:
            "A command expressed as a change relative to the current state or pose.",
        },
        {
          term: "Temporal aggregation",
          meaning:
            "Combining overlapping action-chunk predictions for the same execution time.",
        },
        {
          term: "Multimodality",
          meaning:
            "Representing more than one distinct plausible action sequence for the same observation instead of averaging them into one sequence.",
        },
      ],
      primaryCheck: {
        prompt:
          "A 20 Hz policy predicts H=4 with two episode steps left. Its decoder contract is (delta_joint, 2, rad, joint, 20 Hz, binary_open0_close1), but an adapter advertises absolute_joint with the same numeric values and defines gripper 1 as open. What duration, target mask, and compatibility decisions follow?",
        expected:
          "The chunk spans 4/20=.20 seconds and uses mask [1,1,0,0]. The adapter is incompatible twice: absolute_joint differs from delta_joint even when dimensions/units/frame/rate match, and gripper 1=open reverses the required 0=open,1=close semantics. Reject it before conversion or execution.",
        retry:
          "Compute H/rate and valid remaining targets, then compare the full ordered tuple—kind, dimension, unit, frame, rate, and gripper semantics—rather than checking numeric shape alone.",
      },
      decision: {
        explanation:
          "Chunk choice trades temporal coherence and policy-call cost against feedback delay and recovery after changed observations.",
        mechanism:
          "At matched data/updates, vary H and executed prefix, report action error, smoothness, policy calls, observation-to-action latency, intervention, perturbation recovery, constraints, and requested/applied divergence.",
        workedExample:
          "H=8 lowers jerk 30% in the fixture but a perturbation at step 2 is not corrected for six more actions; H=4 with two-action execution replans sooner and meets the recovery gate.",
        boundary:
          "A chunk setting is tied to control frequency, body dynamics, inference latency, and task timescale; it is not a universal policy default, and H alone says nothing about whether the output distribution has one or several modes.",
        check: {
          prompt:
            "H=8 is smoother but misses a recovery deadline after a step-2 perturbation. Is smoothness sufficient?",
          expected:
            "No. Feedback delay violates the recovery gate; shorten the executed prefix or chunk and compare smoothness, latency, and constraints under matched evidence.",
          retry:
            "Mark the first new observation time and count how many precomputed actions execute before it can change control.",
        },
      },
      quiz: {
        question: "What must padding do in an action-chunk loss?",
        options: [
          "Contribute zero loss beyond the real episode",
          "Become expert actions",
          "Change the frame",
          "Increase reward",
        ],
        answer: 0,
        explanation:
          "Padded slots have no demonstrated future action and must not train the decoder.",
      },
      transfer: {
        prompt:
          "Two robots share chunk length but different control rates. Is duration equal?",
        correct: "No; duration is chunk length divided by control frequency",
        wrong: ["Yes, H alone defines seconds", "Only action units matter"],
        worked:
          "Report both H and Hz, then compare physical horizon and latency.",
        retry: "Convert each discrete step to seconds.",
      },
      lab: {
        title: "Action chunk frontier",
        question:
          "How do chunk length and executed prefix change feedback and masking?",
        controlLabel: "Chunk case",
        boundary:
          "Durations and recovery cases are deterministic design fixtures.",
        cases: [
          {
            label: "H1 @20Hz",
            resultLabel: "open-loop",
            resultValue: "50 ms",
            meter: 20,
            detail:
              "Every action can respond to the next observation at policy-call cost.",
          },
          {
            label: "H4 execute2",
            resultLabel: "replan",
            resultValue: "100 ms",
            meter: 50,
            detail: "A short prefix balances coherence with earlier feedback.",
          },
          {
            label: "H8 execute8",
            resultLabel: "replan",
            resultValue: "400 ms",
            meter: 100,
            detail:
              "Smooth open-loop action delays correction after changed evidence.",
          },
        ],
      },
      motionConcept: "pipeline",
      code: {
        title: "Validate typed absolute, delta, task-space, and chunk actions",
        language: "Python 3",
        setup:
          "A dependency-free adapter maps every legal action kind to one exact dimension, unit, frame, rate, and bound schema, then validates the gripper contract and episode-tail mask separately.",
        predict:
          "Which typed actions validate, what absolute joint target results, and which chunk targets contribute to loss?",
        code: py(
          "rate_hz=20",
          "action_schemas={'delta_joint':{'dimension':2,'unit':'rad','frame':'joint','rate_hz':20,'bounds':(-.2,.2)},'absolute_joint':{'dimension':2,'unit':'rad','frame':'joint','rate_hz':20,'bounds':(-1.,1.)},'delta_task':{'dimension':3,'unit':'m','frame':'base','rate_hz':20,'bounds':(-.05,.05)}}",
          "gripper_contract={'kind':'binary_open0_close1','meanings':{0:'open',1:'close'}}",
          "joint_state=[.30,-.20]",
          "gripper={'kind':'binary_open0_close1','value':1}",
          "joint_delta={'kind':'delta_joint','values':[.05,-.02],'unit':'rad','frame':'joint','rate_hz':rate_hz,'gripper':gripper}",
          "joint_absolute={'kind':'absolute_joint','values':[q+d for q,d in zip(joint_state,joint_delta['values'])],'unit':'rad','frame':'joint','rate_hz':rate_hz,'gripper':gripper}",
          "task_delta={'kind':'delta_task','values':[.01,0.,0.],'unit':'m','frame':'base','rate_hz':rate_hz,'gripper':gripper}",
          "def signature(action): return (action['kind'],len(action['values']),action['unit'],action['frame'],action['rate_hz'],action['gripper']['kind'])",
          "decoder_contract=('delta_joint',2,'rad','joint',20,'binary_open0_close1')",
          "def validate(action):",
          "    spec=action_schemas.get(action.get('kind'))",
          "    if spec is None: return False",
          "    lo,hi=spec['bounds']; grip=action.get('gripper',{})",
          "    return len(action.get('values',[]))==spec['dimension'] and action.get('unit')==spec['unit'] and action.get('frame')==spec['frame'] and action.get('rate_hz')==spec['rate_hz'] and all(lo<=v<=hi for v in action['values']) and grip.get('kind')==gripper_contract['kind'] and grip.get('value') in gripper_contract['meanings']",
          "assert all(validate(action) for action in (joint_delta,joint_absolute,task_delta))",
          "assert signature(joint_delta)==decoder_contract and signature(joint_absolute)!=decoder_contract",
          "assert gripper_contract['meanings'][joint_delta['gripper']['value']]=='close'",
          "cross_wired=dict(joint_delta,unit='m',frame='base')",
          "wrong_dimension=dict(task_delta,values=[.01,0.])",
          "reversed_gripper=dict(joint_delta,gripper={'kind':'binary_open1_close0','value':1})",
          "assert not validate(cross_wired) and not validate(wrong_dimension) and not validate(reversed_gripper)",
          "H=4; steps_left=2; chunk=[joint_delta,joint_delta,None,None]; mask=[int(i<steps_left) for i in range(H)]",
          "loss_targets=[a for a,m in zip(chunk,mask) if m]; duration_s=H/rate_hz",
          "print(joint_absolute,task_delta,duration_s,mask,len(loss_targets))",
          "assert joint_absolute['values']==[.35,-.22] and mask==[1,1,0,0] and len(loss_targets)==2",
        ),
        observe:
          "The complete kind-to-schema map admits all three legal representations, while the decoder tuple rejects the absolute-joint substitute. Cross-wired joint units/frames, a two-value task delta, and reversed gripper semantics all fail before execution. The .2 s chunk contributes only its two real targets.",
        tryIt:
          "Add absolute_task only by declaring its complete dimension/unit/frame/rate/bounds schema; then prove an undeclared camera-frame variant and one out-of-bound value both fail.",
      },
      sourceKeys: ["act", "oxemb"],
    }),
  ),
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "behavior-cloning-capstone",
      duration: 40,
      plain:
        "The behavior-cloning capstone trains a typed trajectory policy and tests whether imitation survives its own closed-loop state distribution.",
      precise:
        "Build episode-level splits, synchronized observation encoder, typed action or chunk decoder, masked supervised loss, normalization manifest, optimizer/checkpoint, requested/applied logger, and simulator evaluator. Acceptance covers shape/units, leakage, one-batch fit, action scaling, ending masks, deterministic resume, rare slices, perturbed starts, compounding error, intervention, and constraints.",
      mentalModel:
        "Train the apprentice on recorded expert traces, then deliberately nudge it off the expert path and watch whether it can return.",
      ideas: [
        "Prove dataset lineage, targets, masks, and action scaling before training.",
        "Compare aggregate and critical-slice imitation evidence.",
        "Run closed-loop perturbations and retain first divergence and recovery traces.",
      ],
      worked:
        "Baseline validates on nominal episodes; treatment starts 2 cm left. Action loss changes little, but the policy never observed corrective right actions and exits the workspace after six steps; failure remains in the artifact.",
      boundary:
        "A behavior-cloning policy passing one simulator does not establish causal recovery, real-world control, or competence beyond demonstration support.",
      objectives: {
        primary: "Build and locally verify a complete behavior-cloning policy",
        decision: "Run a controlled compounding-error and recovery experiment",
      },
      vocabulary: [
        {
          term: "Closed-loop rollout",
          meaning:
            "Evaluation where policy actions alter the observations used for later actions.",
        },
        {
          term: "Compounding error",
          meaning:
            "Small action errors creating future states with still larger policy errors.",
        },
        {
          term: "Critical slice",
          meaning:
            "A subset such as recovery, rare action, object, or layout whose failure is operationally important.",
        },
      ],
      primaryCheck: {
        prompt:
          "Which tests must pass before a low cloning validation loss is treated as a working policy?",
        expected:
          "Verify episode split, tensor/action shapes and units, masks, scaling, one-batch fit, requested/applied logging, deterministic resume, critical slices, and closed-loop outcomes.",
        retry:
          "Separate supervised pipeline invariants from policy behavior and require evidence for both.",
      },
      decision: {
        explanation:
          "A compounding-error experiment changes one start or disturbance and locates the first point where policy occupancy leaves demonstrated support.",
        mechanism:
          "Pair seeds and scenes, perturb one pose/object/sensor factor, hold policy and evaluator fixed, record action error, support, state deviation, recovery time, constraints, intervention, and the earliest causal divergence.",
        workedExample:
          "A +2 cm start shift produces an unsupported observation at step 2, wrong left action at step 3, and workspace exit at step 6; adding recovery demonstrations is a new intervention, not hidden repair.",
        boundary:
          "Recovery on enumerated perturbations cannot establish robustness to all policy-induced states or physical disturbances.",
        check: {
          prompt:
            "Treatment changes start pose and adds recovery data before comparison. Does it isolate compounding error of the baseline?",
          expected:
            "No. First evaluate the unchanged policy on the changed start; then treat added recovery data as a separately declared training intervention.",
          retry:
            "Hold policy revision fixed for the state-distribution test and change only one initial condition.",
        },
      },
      quiz: {
        question:
          "Why does held-out action loss not prove closed-loop success?",
        options: [
          "The policy can create observations absent from fixed logged data",
          "Loss is never useful",
          "Actions do not affect state",
          "Only reward matters",
        ],
        answer: 0,
        explanation:
          "Sequential errors change future inputs and can move evaluation outside demonstration support.",
      },
      transfer: {
        prompt:
          "A policy recovers only because the simulator resets it automatically. What should be reported?",
        correct: "The reset is an external intervention, not learned recovery",
        wrong: ["Count it as autonomous success", "Hide reset events"],
        worked:
          "Log intervention owner and compute success with and without assisted recovery.",
        retry:
          "Identify which component changed the state back toward the task.",
      },
      lab: {
        title: "Cloning release dossier",
        question:
          "Which artifact proves supervised correctness, reveals compounding error, or overclaims autonomy?",
        controlLabel: "Policy artifact",
        boundary:
          "The cases classify simulator evidence, not physical competence.",
        cases: [
          {
            label: "one-batch fit",
            resultLabel: "evidence",
            resultValue: "PIPELINE",
            meter: 25,
            detail:
              "The encoder, targets, loss, and optimizer can fit a tiny known batch.",
          },
          {
            label: "+2cm rollout",
            resultLabel: "evidence",
            resultValue: "RECOVERY FAIL",
            meter: 85,
            detail:
              "The first unsupported state and subsequent action divergence remain traceable.",
          },
          {
            label: "auto reset",
            resultLabel: "claim",
            resultValue: "ASSISTED",
            meter: 100,
            detail:
              "External reset authority cannot be counted as autonomous policy recovery.",
          },
        ],
      },
      motionConcept: "evaluation",
      code: {
        title: "Locate first support departure",
        language: "Python 3",
        setup:
          "A fixed rollout trace separates state shift from later task failure.",
        predict: "At which step does support first fail?",
        code: py(
          "support=[True,True,False,False,False,False]",
          "first=next(i for i,ok in enumerate(support) if not ok)",
          "workspace_exit=5",
          "print(first,workspace_exit)",
          "assert first==2 and workspace_exit==5",
        ),
        observe:
          "Support fails at zero-based step 2 before workspace exit at step 5.",
        tryIt:
          "Attach each later action and intervention to build the causal failure trace.",
      },
      sourceKeys: ["dagger", "act"],
    }),
  ),
];
