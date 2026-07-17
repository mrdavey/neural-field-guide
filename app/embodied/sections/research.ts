import { plannedCourseManifests } from "../../research-curriculum-manifests";
import { defineResearchLesson } from "../../research-courses/helpers";
import { embodiedSeed, py } from "../seed";
const m = plannedCourseManifests.embodied;

export const embodiedResearchSpecs = [
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "embodied-evaluation-suites",
      plain:
        "An embodied evaluation suite crosses tasks with object, layout, instruction, dynamics, sensor, intervention, and embodiment conditions instead of hiding them in one success rate.",
      precise:
        "Define independent evaluation episodes and seeds, task predicates, success dwell, constraints, assistance, time/energy/action costs, grounding, calibration, recovery, and latency. Predeclare matrix cells, aggregation, uncertainty method, missing/failure handling, and non-compensable gates; preserve episode traces and policy/environment revisions. For a binary cell, a Wilson interval uses $\\tilde p=(\\hat p+z^2/(2n))/(1+z^2/n)$ with half-width $z\\sqrt{\\hat p(1-\\hat p)/n+z^2/(4n^2)}/(1+z^2/n)$; the independent unit n is the declared episode only when episodes—not frames or repeated timesteps—are independent.",
      mentalModel:
        "Use a wind-tunnel matrix that changes one operating condition at a time, keeps every failed run, and adds error bars to show how little a small cell can resolve.",
      ideas: [
        "Cross task capability with explicit shift and intervention axes.",
        "Separate autonomous, assisted, safe, grounded, and deadline-qualified success.",
        "Report cell-level independent-unit denominators, interval method, failures, and aggregate weights.",
      ],
      worked:
        "Nominal success 9/10 is 90% with an approximate 95% Wilson interval [.60,.98]; novel-layout 2/10 is 20% with interval [.06,.51]. Equal cell weights give macro success $(.90+.20)/2=.55$. The intervals are wide but non-overlapping in this fixture because .51 is below .60; that descriptive separation does not replace a predeclared paired, stratified, or other effect test. Reporting 90% alone still erases the declared layout-transfer question.",
      boundary:
        "A broad simulated suite remains finite, can reflect benchmark design, and does not establish physical deployment validity. A confidence interval quantifies sampling uncertainty under its independent-unit assumptions, not simulator bias or transfer error.",
      objectives: {
        primary: "Design a task-by-shift embodied evaluation matrix",
        decision:
          "Aggregate success, constraints, assistance, latency, and uncertainty without hiding failures",
      },
      vocabulary: [
        {
          term: "Evaluation cell",
          meaning:
            "One predeclared combination of task, shift, intervention, embodiment, and policy revision.",
        },
        {
          term: "Assisted success",
          meaning:
            "Task completion that required fallback, reset, oracle, or human intervention.",
        },
        {
          term: "Denominator",
          meaning:
            "All declared independent attempts that define the rate, including failures and invalid runs under the protocol.",
        },
        {
          term: "Wilson interval",
          meaning:
            "A binomial proportion interval that remains bounded and is more informative than a normal approximation for small success counts.",
        },
        {
          term: "Independent unit",
          meaning:
            "The level, such as a seeded episode or run, that contributes genuinely separate outcome evidence to uncertainty.",
        },
      ],
      primaryCheck: {
        prompt:
          "For one task, nominal is 9/10 and novel layout is 2/10. What macro success and approximate 95% Wilson intervals should be reported, and what is the independent unit?",
        expected:
          "The equal-cell macro rate is (90%+20%)/2=55%. The cell Wilson intervals are about [.60,.98] and [.06,.51]. Here n=10 means ten declared independent evaluation episodes per cell—not frames within those episodes—and raw failures remain visible.",
        retry:
          "Compute each cell rate first, use z=1.96 in the Wilson center and half-width with n=10, then average the two cell rates using the predeclared equal weights.",
      },
      decision: {
        explanation:
          "Aggregation is a declared decision rule that cannot let easy or assisted episodes compensate for hard-gate failures.",
        mechanism:
          "Compute cell rates and independent-unit intervals, label autonomous versus assisted outcomes, apply constraint/grounding/deadline gates, show macro and deployment-weighted aggregates, preserve crashes and zero-denominator cells, and inspect sensitivity to weights and dependence assumptions.",
        workedExample:
          "Nominal 9/10 and novel-layout 2/10 give macro cell mean 55% with wide cell intervals; a claimed 90% reports only the easy cell and is invalid for the full suite.",
        boundary:
          "Any aggregate inherits the chosen cell mixture and any interval inherits its sampling assumptions; neither replaces per-cell evidence.",
        check: {
          prompt:
            "A report treats 1,000 correlated video frames from ten episodes as n=1,000. What fails?",
          expected:
            "The independent unit is inflated: within-episode frames share one trajectory. Compute success and uncertainty from the ten declared episodes or a justified clustered/run-level method, and keep the cell denominators explicit.",
          retry:
            "Ask which observations could change independently under a fresh reset and seed, then aggregate at that level.",
        },
      },
      quiz: {
        question: "Can assisted reset count as autonomous success?",
        options: [
          "No; report assisted and autonomous separately",
          "Yes always",
          "Only if reward is high",
          "Only in nominal cells",
        ],
        answer: 0,
        explanation: "Authority and assistance change the capability claim.",
      },
      transfer: {
        prompt: "One failed seed is removed as unlucky. What happens?",
        correct: "The reliability estimate becomes post hoc biased",
        wrong: ["Accuracy improves validly", "Nothing"],
        worked:
          "Retain the failure or apply a predeclared exclusion with sensitivity analysis.",
        retry: "Compare the exclusion rule with the preregistered protocol.",
      },
      lab: {
        title: "Evaluation matrix and uncertainty reader",
        question:
          "Which summary preserves shift, sampling uncertainty, assistance, and hard gates?",
        controlLabel: "Summary",
        boundary:
          "The rates and Wilson intervals are deterministic calculations from fixed teaching counts, not measured robot capability.",
        cases: [
          {
            label: "nominal 9/10",
            resultLabel: "95% Wilson",
            resultValue: "≈[.60,.98]",
            meter: 90,
            detail:
              "The 90% point estimate has wide uncertainty and describes only the nominal cell.",
          },
          {
            label: "macro two-cell",
            resultLabel: "success",
            resultValue: "55%",
            meter: 55,
            detail:
              "Both nominal and changed-layout cells retain equal weight and separate intervals.",
          },
          {
            label: "assisted pooled",
            resultLabel: "autonomy",
            resultValue: "INVALID",
            meter: 100,
            detail:
              "External intervention cannot be relabeled autonomous or hidden inside uncertainty.",
          },
        ],
      },
      motionConcept: "evaluation",
      code: {
        title: "Aggregate cells with Wilson intervals",
        language: "Python 3",
        setup:
          "A dependency-free calculation keeps cell denominators, uncertainty, and macro weighting explicit.",
        predict: "Which cell has a 95% Wilson lower bound near .06?",
        code: py(
          "from math import sqrt",
          "def wilson(success,n,z=1.96):",
          "    p=success/n; d=1+z*z/n",
          "    center=(p+z*z/(2*n))/d",
          "    half=z*sqrt(p*(1-p)/n+z*z/(4*n*n))/d",
          "    return (center-half,center+half)",
          "cells={'nominal':(9,10),'novel_layout':(2,10)}",
          "rates={k:s/n for k,(s,n) in cells.items()}",
          "intervals={k:tuple(round(x,3) for x in wilson(s,n)) for k,(s,n) in cells.items()}",
          "macro=sum(rates.values())/len(rates)",
          "print(rates,intervals,macro); assert macro==.55",
        ),
        observe:
          "Macro success is 55%; nominal interval is about [.596,.982] and novel-layout interval about [.057,.510], with n=10 independent episodes in each cell.",
        tryIt:
          "Add assisted and constraint-qualified rates, then change the cell weights without pooling away their denominators.",
      },
      sourceKeys: ["libero", "robotics"],
    }),
  ),
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "robustness-generalization",
      plain:
        "Robustness tests controlled perturbations near known conditions; generalization tests new objects, layouts, instructions, or dynamics that were withheld by design.",
      precise:
        "Define transformation families and severity, verify task semantics remain valid, separate nuisance from causal changes, keep source groups out of training, pair scenes/seeds, measure task/grounding/constraint/recovery by severity, and distinguish interpolation, composition, and extrapolation. Inspect shortcuts with counterfactual pairs.",
      mentalModel:
        "Shake the system inside its operating envelope, then test genuinely new combinations outside the examples it memorized.",
      ideas: [
        "Name whether each change is nuisance, task-relevant, compositional, or out-of-range.",
        "Verify no source or derived window leaks across held-out groups.",
        "Use severity curves and counterfactual pairs, not one average shift.",
      ],
      worked:
        "Changing table texture leaves task unchanged and should preserve action; swapping requested red to blue is causal and should change target. A policy doing the opposite reveals texture shortcut and weak grounding.",
      boundary:
        "Passing enumerated shifts cannot establish open-world generalization or rule out all shortcuts and coupled factors.",
      objectives: {
        primary:
          "Design controlled robustness and held-out generalization tests",
        decision:
          "Diagnose shortcuts and failure onset with counterfactual and severity evidence",
      },
      vocabulary: [
        {
          term: "Robustness",
          meaning:
            "Maintaining required behavior under bounded perturbations that preserve task meaning.",
        },
        {
          term: "Generalization",
          meaning:
            "Performing on held-out conditions not used to fit or select the released system.",
        },
        {
          term: "Counterfactual pair",
          meaning:
            "Two cases differing in one intended causal factor while other relevant factors remain fixed.",
        },
      ],
      primaryCheck: {
        prompt:
          "Classify a background texture swap versus changing instruction target red to blue. What response should each cause?",
        expected:
          "Texture is a task-preserving nuisance and should not change target action; the color-word swap changes the grounded goal and should change the bound target.",
        retry:
          "Ask whether the task predicate changes under each intervention before predicting policy behavior.",
      },
      decision: {
        explanation:
          "Failure onset and shortcuts are visible when one factor and its severity are paired with mechanism-specific responses.",
        mechanism:
          "Generate paired cases across severity, verify semantics and held-out lineage, report response sensitivity, task success, grounding, constraints, recovery, and the first severity crossing each gate; test reversed and composed changes.",
        workedExample:
          "Success stays above 80% through 2 cm object shift but drops to 30% at 4 cm while calibration confidence remains high; 4 cm is failure onset and overconfidence is a separate defect.",
        boundary:
          "Synthetic severity may not match physical frequency or correlation and should not be presented as a field failure rate.",
        check: {
          prompt:
            "At 4 cm shift success collapses but confidence stays .95. What two conclusions follow?",
          expected:
            "Robustness gate first fails at that tested severity, and confidence is miscalibrated on the shifted slice; neither proves frequency in deployment.",
          retry:
            "Plot outcome and confidence by severity, then mark the first predeclared gate crossing.",
        },
      },
      quiz: {
        question: "What makes a generalization split valid?",
        options: [
          "The claimed source groups remain untouched during training and selection",
          "Different filenames",
          "More augmentations",
          "Only success",
        ],
        answer: 0,
        explanation:
          "Held-out conditions must not influence the released model or threshold choices.",
      },
      transfer: {
        prompt:
          "Test layouts tune model checkpoints. Are they still final test?",
        correct: "No; they became validation and require a new untouched test",
        wrong: ["Yes because labels were hidden", "Only seeds matter"],
        worked:
          "Record the selection exposure and build a fresh held-out group.",
        retry:
          "Ask whether outcomes influenced model or hyperparameter choice.",
      },
      lab: {
        title: "Robustness and shortcut probe",
        question:
          "Which response indicates invariance, grounding, or a shortcut?",
        controlLabel: "Counterfactual",
        boundary:
          "The shifts are deterministic scenarios, not field statistics.",
        cases: [
          {
            label: "texture swap / same action",
            resultLabel: "nuisance",
            resultValue: "ROBUST",
            meter: 20,
            detail: "Task meaning stays fixed and behavior remains stable.",
          },
          {
            label: "red→blue / target swaps",
            resultLabel: "grounding",
            resultValue: "RESPONDS",
            meter: 35,
            detail: "A causal instruction change alters the selected entity.",
          },
          {
            label: "texture swaps target",
            resultLabel: "shortcut",
            resultValue: "FAIL",
            meter: 100,
            detail: "Behavior depends on irrelevant appearance.",
          },
        ],
      },
      motionConcept: "evaluation",
      code: {
        title: "Find a severity failure onset",
        language: "Python 3",
        setup: "A fixed curve identifies the first gate crossing.",
        predict: "At which shift does success fall below .8?",
        code: py(
          "curve={0:.92,2:.84,4:.30}",
          "gate=.8",
          "onset=next(cm for cm,success in curve.items() if success<gate)",
          "print(onset)",
          "assert onset==4",
        ),
        observe: "Failure onset is the tested 4 cm condition.",
        tryIt: "Add confidence and constraint curves.",
      },
      sourceKeys: ["libero", "domainRandomization"],
    }),
  ),
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "latency-safety-operations",
      plain:
        "Operating an embodied policy means every sensed decision and command must arrive before a deadline, stay within independent constraints, and leave enough evidence to stop, recover, and roll back.",
      precise:
        "Instrument capture, transfer, preprocessing, inference, planning, queueing, actuation, and response timestamps; compute each command's capture-to-application age plus window distributions and deadline misses. Declare both decisions before measurement: for example, a release SLO requires p99 latency at most 50 ms under a named load/window/quantile rule, while the runtime watchdog independently holds any current command whose own age exceeds 50 ms or whose constraint receipt fails. Bind model/config/calibration/data revisions to commands, define stale-input and overload actions, monitor drift, preserve incident traces, and test checkpoint rollback plus authority.",
      mentalModel:
        "Run the controller like a safety-critical service with a stopwatch, circuit breakers, receipts, and a tested previous version.",
      ideas: [
        "Measure end-to-end age and every stage contribution at tail percentiles against a predeclared SLO.",
        "Define deadline, stale-input, overload, constraint, and watchdog actions.",
        "Test rollback, incident replay, authority, and revision provenance.",
      ],
      worked:
        "The declared release SLO is p99 camera-to-applied-command latency $\\le50$ ms. In a 100-command nearest-rank window, 98 commands take 32 ms and two take 88 ms, so p50—the median—is 32 ms and p99 is 88 ms: promotion fails by 38 ms. An active accepted revision may still apply a current 32 ms command under a declared degraded-review policy, but each 88 ms command is individually replaced by hold. The window decision and command decision share evidence but are not interchangeable.",
      boundary:
        "Simulation timing and software gates do not establish physical stop distance, hardware certification, or complete hazard coverage. A percentile SLO also depends on its load, sample window, clock, and quantile method.",
      objectives: {
        primary:
          "Build an end-to-end latency, constraint, and provenance ledger",
        decision:
          "Design watchdog, rollback, incident, and residual-risk operations",
      },
      vocabulary: [
        {
          term: "End-to-end latency",
          meaning:
            "Time from relevant sensor capture to applied actuator command or observed response.",
        },
        {
          term: "Watchdog",
          meaning:
            "An independent monitor that triggers a bounded response when timing or health contracts fail.",
        },
        {
          term: "Rollback",
          meaning:
            "Returning to a previously accepted system revision with verified compatibility and state handling.",
        },
        {
          term: "Service-level objective (SLO)",
          meaning:
            "A predeclared reliability target, here p99 end-to-end latency at or below 50 ms under a named load and measurement window.",
        },
        {
          term: "p99 latency",
          meaning:
            "The 99th percentile: a tail threshold at or below which approximately 99% of measured command latencies fall under the declared sampling rule.",
        },
      ],
      primaryCheck: {
        prompt:
          "The release SLO is p99 latency at most 50 ms. A nearest-rank window has p50 32 ms and p99 88 ms; the current command's own age is 32 ms and its constraint receipt passes. Which window and command decisions follow?",
        expected:
          "The p99 release SLO fails by 38 ms, so block promotion and open review. The current 32 ms command is itself on time and may be applied only if the predeclared active-revision operating policy permits it; an individual command older than 50 ms must be held with a deadline-miss receipt.",
        retry:
          "First compare window p99 with the release threshold. Then compare the current command's capture-to-application age with its deadline and check its constraint receipt.",
      },
      decision: {
        explanation:
          "Operational recovery must reproduce which revision and state produced an unsafe or late command, then restore a compatible accepted system.",
        mechanism:
          "Inject delay, queue overload, stale packet, constraint event, and corrupted checkpoint; verify watchdog latency, applied safe action, event receipt, incident bundle, rollback compatibility, next-step equivalence, human authority, and post-rollback monitoring.",
        workedExample:
          "Model v8 misses deadline; watchdog holds, incident records v8/config/calibration/input hashes, rollback v7 passes state-schema and next-step tests before resuming under review.",
        boundary:
          "A successful rollback rehearsal cannot guarantee availability of valid sensors, actuators, operators, or a safe previous policy during a real incident.",
        check: {
          prompt:
            "Rollback model v7 expects a different observation schema than active state. May it resume immediately?",
          expected:
            "No. Compatibility and state migration or reset must pass before actuation; otherwise remain in fallback and preserve the failed rollback attempt.",
          retry:
            "Compare model, schema, calibration, controller, and hidden-state revisions before the first post-rollback command.",
        },
      },
      quiz: {
        question: "Why is average or median latency insufficient?",
        options: [
          "Rare deadline misses can still issue unsafe stale commands",
          "p50 equals p99",
          "Only GPU matters",
          "Commands have no time",
        ],
        answer: 0,
        explanation:
          "Control decisions depend on tail timing and age, not just a typical or mean value.",
      },
      transfer: {
        prompt:
          "A late command is logged but still applied. Did watchdog contain it?",
        correct:
          "No; detection without bounded actuation response is not containment",
        wrong: ["Yes, logging is enough", "Only success matters"],
        worked:
          "Verify the actual applied action changes to hold or fallback within the stop budget.",
        retry: "Follow the event from detection to actuator receipt.",
      },
      lab: {
        title: "Operations deadline gate",
        question:
          "Which trace meets the p99 SLO, triggers watchdog, or blocks rollback?",
        controlLabel: "Operations trace",
        boundary:
          "Latencies are constructed fixtures, not hardware benchmarks; the p99 estimate assumes the named load and measurement procedure.",
        cases: [
          {
            label: "current age 32 ms",
            resultLabel: "command",
            resultValue: "APPLY IF VALID",
            meter: 32,
            detail:
              "This command is on time; it still needs a valid constraint receipt and an allowed operating mode.",
          },
          {
            label: "p99 88 ms vs SLO<=50",
            resultLabel: "release SLO",
            resultValue: "FAIL / REVIEW",
            meter: 100,
            detail:
              "The window blocks promotion and opens review; it does not prove that every command was late.",
          },
          {
            label: "current age 88 ms",
            resultLabel: "watchdog",
            resultValue: "HOLD",
            meter: 100,
            detail:
              "This command individually exceeds its 50 ms deadline and is replaced before actuation.",
          },
        ],
      },
      motionConcept: "systems",
      code: {
        title: "Separate the window SLO from command admission",
        language: "Python 3",
        setup:
          "Raw stage timestamps produce each command's age; a named nearest-rank rule produces the 100-command release statistic.",
        predict:
          "Does the revision pass its release SLO, and which of the current 32 ms and 88 ms commands reaches actuation?",
        code: py(
          "import math",
          "DEADLINE_MS = 50",
          "window_ms = [32]*98+[88,88]",
          "def nearest_rank(values, percentile):",
          "    ordered = sorted(values)",
          "    return ordered[math.ceil(percentile*len(ordered))-1]",
          "window = {'load':'camera-30Hz','count':len(window_ms),'quantile':'nearest-rank','p50_ms':nearest_rank(window_ms,.50),'p99_ms':nearest_rank(window_ms,.99)}",
          "release_slo_pass = window['p99_ms'] <= DEADLINE_MS",
          "OPERATING_MODE='degraded_review_existing_revision'",
          "MODE_POLICY={'degraded_review_existing_revision':{'apply_on_time_accepted_revision':True,'command_authority':'active_controller','fallback_authority':'independent_watchdog'}}",
          "def assess(trace, operating_mode):",
          "    stages = trace['stage_ms']",
          "    assert list(stages) == ['capture','transfer','preprocess','inference','planning','queue','applied']",
          "    age_ms = stages['applied']-stages['capture']",
          "    revision_complete = set(trace['revision']) == {'model','config','calibration','data'}",
          "    mode_rule=MODE_POLICY[operating_mode]",
          "    admissible = mode_rule['apply_on_time_accepted_revision'] and age_ms <= DEADLINE_MS and trace['constraint_ok'] and revision_complete",
          "    authority=mode_rule['command_authority'] if admissible else mode_rule['fallback_authority']",
          "    return {'command_id':trace['command_id'],'age_ms':age_ms,'requested':trace['requested'],'applied':trace['requested'] if admissible else 'hold','event':None if admissible else 'deadline_or_constraint_miss','operating_mode':operating_mode,'authority':authority,'revision':trace['revision']}",
          "base_revision = {'model':'v7','config':'c4','calibration':'k2','data':'d9'}",
          "on_time = {'command_id':'cmd-32','requested':'move','constraint_ok':True,'revision':base_revision,'stage_ms':{'capture':0,'transfer':5,'preprocess':12,'inference':25,'planning':27,'queue':29,'applied':32}}",
          "late = {'command_id':'cmd-88','requested':'move','constraint_ok':True,'revision':base_revision,'stage_ms':{'capture':100,'transfer':108,'preprocess':120,'inference':150,'planning':164,'queue':174,'applied':188}}",
          "receipts = [assess(on_time,OPERATING_MODE), assess(late,OPERATING_MODE)]",
          "release_decision = 'block_promotion_and_review' if not release_slo_pass else 'eligible_for_promotion'",
          "release_receipt={'authority':'release_gate','operating_mode':OPERATING_MODE,'decision':release_decision,'revision':base_revision}",
          "print(window, release_receipt, receipts)",
          "assert window['p50_ms'] == 32 and window['p99_ms'] == 88",
          "assert release_decision == 'block_promotion_and_review'",
          "assert receipts[0]['applied'] == 'move' and receipts[1]['applied'] == 'hold'",
          "assert receipts[0]['authority']=='active_controller' and receipts[1]['authority']=='independent_watchdog'",
          "assert all(r['operating_mode']==OPERATING_MODE and r['revision']==base_revision for r in receipts)",
          "assert release_receipt['authority']=='release_gate' and release_receipt['operating_mode']==OPERATING_MODE",
        ),
        observe:
          "The release-gate receipt blocks promotion in degraded-review mode. The on-time command is applied by active-controller authority, while the late command is replaced by hold under independent-watchdog authority; both receipts bind the mode and complete revision.",
        tryIt:
          "Set the mode policy's apply-on-time permission to false and require watchdog hold for the 32 ms command; then delete calibration and distinguish mode denial from incomplete provenance in the receipt.",
      },
      sourceKeys: ["robotics"],
    }),
  ),
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "reproducible-embodied-gpu",
      plain:
        "A reproducible embodied accelerator run pins simulator, data, policy, hardware, seeds, budgets, evaluation matrix, video/trajectory artifacts, and stop rules behind portable smoke and full profiles.",
      precise:
        "Install the pinned Python 3.11 environment with python -m pip install -r external-executions/requirements-embodied.txt. Run python external-executions/embodied_action_chunk_ablation.py --profile smoke --device auto --output external-executions/runs/embodied-action-chunk-smoke.json, then inspect checkpoint identity, paired episode specifications, action opportunities, finite rows, required JSON fields, and both the requested and resolved device. Only after those exact checks pass, run the same provider-neutral entry point with --profile full --device auto and output embodied-action-chunk-full.json. The runner resolves CUDA, then Apple MPS, then CPU and records that choice; --device cuda is an optional explicit override only when the learner deliberately requires CUDA and records that protocol choice. Preserve every seed and episode row, environment/software/hardware revision, error, and protocol change; stop on non-finite values, mismatch, missing rows, repeated resource failure, schema failure, or two hours.",
      mentalModel:
        "Package the simulator, policy, evaluator, and flight recorder as one bounded field kit rather than a notebook that merely produced a curve.",
      ideas: [
        "Use one --device auto provider-neutral command for Colab, compatible GPU services, and local CPU/CUDA/MPS runs, then record the resolved backend.",
        "Separate exact smoke invariants from stochastic full-run observations.",
        "Preserve every episode/seed/cell, video, failure, and provenance record.",
      ],
      worked:
        "Smoke trains one shared policy for 30 updates with batch 64 and seed 13, then evaluates prefix 1 versus prefix 4 on the same 12 disturbed 24-step episodes. Full uses 3,000 updates, batch 512, seeds 13/29/47/61/83, and 200 paired episodes per seed. The JSON must contain schema_version, execution, config, pairs, invariants, decision, and scope_boundary; no numeric success band or winner is promised before a matching reviewed run exists.",
      boundary:
        "A successful hosted GPU run is external simulation evidence, not a browser execution, physical robot run, or universal architecture result.",
      objectives: {
        primary:
          "Execute a portable bounded embodied-policy smoke and full profile",
        decision:
          "Classify exact invariants, variable observations, failures, and authentic artifacts",
      },
      vocabulary: [
        {
          term: "Smoke profile",
          meaning:
            "A short bounded run validating integration and exact implementation contracts.",
        },
        {
          term: "Full profile",
          meaning:
            "The declared training and evaluation budget producing all independent rows for the experiment.",
        },
        {
          term: "Episode artifact",
          meaning:
            "A trajectory, event log, optional video, and provenance bundle for one evaluation attempt.",
        },
        {
          term: "OOM",
          meaning:
            "Out of memory: requested process or tensor state exceeds available device memory.",
        },
      ],
      primaryCheck: {
        prompt:
          "After smoke, the JSON has one seed row, equal trained-checkpoint hashes, identical episode IDs/specifications, 24 action opportunities in both arms, finite values, all seven required top-level fields, and every invariant true. Success rates differ. May full begin, and what result is expected exactly?",
        expected:
          "Yes. The smoke artifact passes the exact integration gate, so the provider-neutral full command may begin unchanged with --device auto. Confirm its execution receipt records requested_device=auto and the resolved CPU, CUDA, or MPS backend. Expect the same checkpoint within each pair, identical episodes and action opportunities, finite complete rows, every declared seed, and required fields; treat success, error, clipping, policy calls, runtime, and treatment direction as measured observations that may be positive, null, mixed, or reversed.",
        retry:
          "Open the produced smoke JSON, verify schema_version plus execution/config/pairs/invariants/decision/scope_boundary, then check every paired identity, episode, budget, finite-value, and row-count invariant before interpreting success.",
      },
      decision: {
        explanation:
          "Authentic external evidence requires complete provenance and retains null, mixed, failed, and provider-specific observations.",
        mechanism:
          "Record revisions and hardware, run smoke unchanged, verify invariants, execute all full seeds/cells, preserve raw trajectories/videos/errors, compare paired primitive budgets, classify outcomes versus exact contracts, and stop on non-finite, mismatch, repeated resource failure, or schema error.",
        workedExample:
          "Treatment success is mixed across seeds while all invariants pass; report the measured mixed result and artifact hashes rather than inventing a winner or deleting failed rollouts.",
        boundary:
          "Timing differs by provider and cannot be compared across hardware without a matched rerun; simulator outcomes do not certify hardware.",
        check: {
          prompt:
            "Treatment direction reverses across seeds but all contracts pass. What is the expected result?",
          expected:
            "A mixed measured outcome is valid; retain every seed and uncertainty, state that no winner is resolved, and design the next falsifying run.",
          retry:
            "Verify invariants first, then summarize actual paired rows without an expected direction.",
        },
      },
      quiz: {
        question: "What does smoke prove?",
        options: [
          "Integration and exact contracts only",
          "Final policy quality",
          "Hardware safety",
          "Universal transfer",
        ],
        answer: 0,
        explanation:
          "Its tiny budget is a wiring check, not learning evidence.",
      },
      transfer: {
        prompt:
          "OOM forces smaller batch in treatment only. Is comparison matched?",
        correct:
          "No; apply the same declared change to both arms or start a new protocol",
        wrong: ["Yes, treatment needed it", "Hide the change"],
        worked:
          "Record a new shared configuration and recompute exposure budgets.",
        retry:
          "Diff every arm's batch, updates, examples, and device settings.",
      },
      lab: {
        title: "GPU evidence classifier",
        question:
          "Which artifact is an invariant, variable observation, or invalid claim?",
        controlLabel: "GPU artifact",
        boundary:
          "The browser classifies evidence and does not execute the external runner.",
        cases: [
          {
            label: "paired init hash",
            resultLabel: "class",
            resultValue: "INVARIANT",
            meter: 20,
            detail: "Matching initial parameters can be checked exactly.",
          },
          {
            label: "success .65",
            resultLabel: "class",
            resultValue: "OBSERVATION",
            meter: 60,
            detail:
              "A learned stochastic outcome requires authentic provenance.",
          },
          {
            label: "real robot safe",
            resultLabel: "class",
            resultValue: "OVERREACH",
            meter: 100,
            detail: "A simulator GPU run cannot establish hardware safety.",
          },
        ],
      },
      motionConcept: "systems",
      code: {
        title: "Derive the smoke gate from raw paired rows",
        language: "Python 3",
        setup:
          "A local 12-episode fixture computes every invariant from checkpoint identities, full episode specifications, budgets, fields, and finite row values; it does not trust a self-reported invariant map.",
        predict:
          "Does the intact artifact pass, and does changing one treatment target while retaining its episode ID get caught?",
        code: py(
          "import copy, math",
          "specs = [{'episode_id':f'ep-{i:02d}','start':{'x':0.,'v':0.},'target':{'x':1.},'disturbance':{'step':8,'impulse':(-1)**i*.1}} for i in range(12)]",
          "def rows(prefix):",
          "    return [{'episode_spec':copy.deepcopy(spec),'action_opportunities':24,'success':float(i%2),'error':.2+i/100,'clip_count':i%3,'policy_calls':24//prefix,'runtime_ms':1.5+i/10} for i,spec in enumerate(specs)]",
          "artifact={'schema_version':'1.0','execution':{'profile':'smoke'},'config':{'steps':24},'pairs':[{'seed':13,'checkpoint_hashes':{'prefix_1':'sha256:abc','prefix_4':'sha256:abc'},'arms':{'prefix_1':rows(1),'prefix_4':rows(4)}}],'decision':'smoke_integration_only','scope_boundary':'deterministic_fixture'}",
          "required={'schema_version','execution','config','pairs','invariants','decision','scope_boundary'}",
          "numeric_fields = ('success','error','clip_count','policy_calls','runtime_ms')",
          "def derive(raw):",
          "    pairs = raw.get('pairs', [])",
          "    exact_seeds = {pair.get('seed') for pair in pairs} == {13}",
          "    shared_checkpoint = all(len(set(pair.get('checkpoint_hashes',{}).values())) == 1 for pair in pairs)",
          "    complete_rows = all(set(pair.get('arms',{})) == {'prefix_1','prefix_4'} and all(len(arm) == 12 for arm in pair['arms'].values()) for pair in pairs)",
          "    same_specs = all([row['episode_spec'] for row in pair['arms']['prefix_1']] == [row['episode_spec'] for row in pair['arms']['prefix_4']] for pair in pairs)",
          "    equal_opportunities = all([row['action_opportunities'] for row in pair['arms']['prefix_1']] == [row['action_opportunities'] for row in pair['arms']['prefix_4']] == [24]*12 for pair in pairs)",
          "    finite_rows = all(all(field in row and math.isfinite(float(row[field])) for field in numeric_fields) for pair in pairs for arm in pair['arms'].values() for row in arm)",
          "    return {'exact_seed_rows':exact_seeds,'shared_checkpoint_within_pair':shared_checkpoint,'complete_seed_and_episode_rows':complete_rows,'identical_episode_specs_within_pair':same_specs,'equal_action_opportunities':equal_opportunities,'finite_rows':finite_rows}",
          "artifact['invariants'] = derive(artifact)",
          "gate_pass = required <= artifact.keys() and all(artifact['invariants'].values())",
          "corrupted = copy.deepcopy(artifact)",
          "corrupted['pairs'][0]['arms']['prefix_4'][3]['episode_spec']['target']['x'] = 9.",
          "corrupted_invariants = derive(corrupted)",
          "print(artifact['invariants'], corrupted_invariants)",
          "assert gate_pass",
          "assert not corrupted_invariants['identical_episode_specs_within_pair']",
        ),
        observe:
          "The intact raw rows derive six true invariants; a target mutation with the same episode ID makes the full-specification invariant false.",
        tryIt:
          "Remove one treatment row or replace runtime_ms with NaN, recompute the invariant map, and identify the exact gate that fails.",
      },
      sourceKeys: ["act", "libero", "robotics"],
    }),
  ),
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "embodied-research-capstone",
      duration: 48,
      plain:
        "The final capstone reproduces the pinned portable-linear-reach-v1 controller, then changes only its feedback gain under paired disturbances and hard operational gates.",
      precise:
        "Reproduce portable-linear-reach-v1, implementation revision embodied-starter/2.0: a bounded proportional controller in a deterministic one-dimensional reach environment. Accept baseline gain $.35$ only after the starter's raw-row verifier recomputes the initial state and disturbances from each pinned seed, then recomputes every requested action, clipped action, post-state, final error, success label, deadline receipt, and autonomy label from the trace. Compare treatment gain $.55$ on the same per-seed initial state, disturbance sequence, ten-step horizon, $.20$ action limit, policy-call count, and scheduled-compute deadline. Preserve all smoke seeds 101/202/303, all twelve full-profile seeds 101–112, both arms, traces, assistance, hard gates, paired final-error effects, failures, manifest, decision, verifier receipt, and scope boundary.",
      mentalModel:
        "Complete one small robotics paper whose system, negative cases, and evidence can be independently inspected.",
      ideas: [
        "Reproduce and accept the pinned gain-.35 baseline before branching treatment.",
        "Change only controller gain to .55 while pairing starts, disturbances, horizon, bounds, calls, and cells.",
        "Publish all seeds, failures, assistance, costs, limits, and the next falsifying experiment.",
      ],
      worked:
        "Smoke creates six rows: seeds 101, 202, and 303 crossed with baseline gain .35 and treatment gain .55. Each pair reuses the same initial state and disturbance hash, ten actions, ten policy calls, $.20$ action bound, and 50 scheduled compute ticks. The verifier first checks all six cells and hard gates; only then may paired treatment-minus-baseline final error be interpreted. No direction is promised before execution.",
      boundary:
        "One simulator, embodiment, task matrix, seed set, and budget support only a bounded course-scale conclusion, never a physical deployment claim.",
      objectives: {
        primary: "Reproduce and verify a complete embodied-policy baseline",
        decision:
          "Conduct and report one original controlled embodied-system intervention",
      },
      vocabulary: [
        {
          term: "Baseline acceptance",
          meaning:
            "Predeclared evidence required before a reproduced system can serve as the experimental control.",
        },
        {
          term: "Falsifier",
          meaning:
            "An observable result that would contradict the intervention's stated mechanism or decision claim.",
        },
        {
          term: "Research dossier",
          meaning:
            "The manifest, raw rows, trajectories, failures, analysis, decisions, and boundaries for one study.",
        },
      ],
      primaryCheck: {
        prompt:
          "What must the gain-.35 baseline verifier recompute before the gain-.55 intervention may branch?",
        expected:
          "It must pin the baseline revision, dependency, profile seeds, and full seed-by-arm schema, then derive each initial state and disturbance sequence from its seed and recompute requested/clipped actions, post-states, final error, success, deadline, and autonomy from every raw trace. Otherwise a structurally complete but fabricated baseline could confound the intervention.",
        retry:
          "Start with the pinned seed and controller equation, replay each transition without trusting summary fields, derive the final metrics and hard gates, and branch only when every baseline row agrees.",
      },
      decision: {
        explanation:
          "The original study changes one mechanism and decides through predeclared multi-dimensional evidence rather than a favorable aggregate.",
        mechanism:
          "Run the gain-.35 and gain-.55 arms from each seed's identical start and disturbance sequence. Independently regenerate seeded inputs and replay $u_t=\\operatorname{clip}(K(0.8-x_t),-.2,.2)$ plus the recorded disturbance; reject any mismatch in pre-state, request, applied action, post-state, final error, success, deadline, or autonomy. Only after the Cartesian seed-by-arm matrix, required fields, one-change manifest, horizon/call/action equality, and hard gates pass may per-seed treatment-minus-baseline final error be computed and packaged with commands, rows, verifier receipt, alternatives, and boundary.",
        workedExample:
          "If eleven full-profile treatment rows reduce final error but one misses the scheduled-compute deadline, the zero-miss gate rejects treatment. Preserve that seed and do not let the other eleven paired effects compensate for a hard failure.",
        boundary:
          "A null, negative, or mixed result is complete when protocol passes; it cannot support a claim beyond the tested simulator and intervention.",
        check: {
          prompt:
            "Treatment improves mean success but has one hard deadline failure. What is the decision under a zero-miss gate?",
          expected:
            "Treatment is infeasible and cannot win on mean success; preserve the failing seed, diagnose latency, and test a revised intervention as a new protocol.",
          retry:
            "Apply every hard gate before ranking compensable metrics and keep the full seed/cell row.",
        },
      },
      quiz: {
        question: "What makes a negative result complete?",
        options: [
          "A passed protocol, preserved evidence, bounded conclusion, and next test",
          "A positive rewrite",
          "Deleting failures",
          "More prose only",
        ],
        answer: 0,
        explanation:
          "Research quality comes from the contract and evidence, not desired direction.",
      },
      transfer: {
        prompt:
          "Treatment changes encoder, decoder, and data mixture. Is the mechanism isolated?",
        correct:
          "No; separate interventions or use a declared factorial design",
        wrong: ["Yes because success changed", "Only seeds matter"],
        worked:
          "Return to one factor or explicitly estimate interactions with enough independent evidence.",
        retry: "Diff every manifest field between baseline and treatment.",
      },
      lab: {
        title: "Original study release gate",
        question:
          "Which package is a reproduction, controlled study, or overclaim?",
        controlLabel: "Research package",
        boundary: "The checklist cannot award external scientific validity.",
        cases: [
          {
            label: "baseline accepted",
            resultLabel: "status",
            resultValue: "BRANCH",
            meter: 25,
            detail: "Correctness and behavior gates pass before intervention.",
          },
          {
            label: "one matched change",
            resultLabel: "status",
            resultValue: "ANALYZE",
            meter: 60,
            detail: "All seed/cell rows and primitive budgets remain paired.",
          },
          {
            label: "real-world ready",
            resultLabel: "claim",
            resultValue: "OVERREACH",
            meter: 100,
            detail:
              "Course-scale simulation cannot authorize hardware deployment.",
          },
        ],
      },
      motionConcept: "evaluation",
      code: {
        title: "Recompute the fixed study from raw traces",
        language: "Python 3",
        setup:
          "A dependency-free teaching fixture rebuilds each trace from pinned starts, disturbances, gains, bounds, and deadlines; its numbers are constructed to demonstrate the verifier, not measured performance.",
        predict:
          "Do all six seed-by-arm cells pass mechanics, summary, and hard-gate recomputation, and does a finite post-state forgery get caught?",
        code: py(
          "import copy, math",
          "seeds = (101,202,303)",
          "arms = {'baseline':.35,'treatment':.55}",
          "starts = {101:-.20,202:-.10,303:0.}",
          "disturbances = {seed:[(((seed+step)%5)-2)*.001 for step in range(10)] for seed in seeds}",
          "TARGET, LIMIT, TICKS_PER_STEP = .8, .2, 5",
          "def rollout(seed, arm, gain):",
          "    x, trace = starts[seed], []",
          "    for step, disturbance in enumerate(disturbances[seed]):",
          "        requested = gain*(TARGET-x); applied = max(-LIMIT,min(LIMIT,requested)); post = x+applied+disturbance",
          "        trace.append({'step':step,'pre_x':x,'requested':requested,'applied':applied,'disturbance':disturbance,'post_x':post}); x=post",
          "    error = abs(TARGET-x)",
          "    return {'seed':seed,'arm':arm,'gain':gain,'initial_x':starts[seed],'disturbances':disturbances[seed],'horizon':10,'limit':LIMIT,'policy_calls':10,'scheduled_ticks':50,'deadline_budget':50,'assisted':False,'autonomous':True,'trace':trace,'final_error':error,'success':error<=.06}",
          "rows = [rollout(seed,arm,gain) for seed in seeds for arm,gain in arms.items()]",
          "expected = {(seed,arm) for seed in seeds for arm in arms}",
          "actual = {(row['seed'],row['arm']) for row in rows}",
          "def verify(row):",
          "    x=starts[row['seed']]; gain=arms[row['arm']]; mechanics=True",
          "    for step,(event,disturbance) in enumerate(zip(row['trace'],disturbances[row['seed']])):",
          "        requested=gain*(TARGET-x); applied=max(-LIMIT,min(LIMIT,requested)); post=x+applied+disturbance",
          "        mechanics &= event['step']==step and all(math.isclose(event[k],v,abs_tol=1e-12) for k,v in {'pre_x':x,'requested':requested,'applied':applied,'disturbance':disturbance,'post_x':post}.items()); x=post",
          "    summaries = len(row['trace'])==10 and math.isclose(row['final_error'],abs(TARGET-x),abs_tol=1e-12) and row['success']==(abs(TARGET-x)<=.06)",
          "    gates = row['gain']==gain and row['policy_calls']==10 and row['scheduled_ticks']==row['deadline_budget']==10*TICKS_PER_STEP and row['autonomous']==(not row['assisted'])",
          "    return mechanics and summaries and gates",
          "forged=copy.deepcopy(rows[0]); forged['trace'][0]['post_x']=12345.; forged['final_error']=0.; forged['success']=True",
          "print({'matrix_complete':actual==expected,'all_rows_recompute':all(map(verify,rows)),'forgery_rejected':not verify(forged)})",
          "assert actual==expected and all(map(verify,rows)) and not verify(forged)",
          "assert {row['gain'] for row in rows} == {.35,.55}",
        ),
        observe:
          "The intact matrix replays exactly, while a finite forged post-state and favorable summary are rejected. The fixture still does not assert that either gain is better.",
        tryIt:
          "Change one disturbance without updating its seed-derived receipt, then delete treatment seed 202; identify the mechanics and matrix gates that block interpretation.",
      },
      sourceKeys: ["libero", "act", "diffusionPolicy"],
    }),
  ),
];
