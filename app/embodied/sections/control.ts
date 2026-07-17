import { plannedCourseManifests } from "../../research-curriculum-manifests";
import { defineResearchLesson } from "../../research-courses/helpers";
import { embodiedSeed, py } from "../seed";
const m = plannedCourseManifests.embodied;

export const embodiedControlSpecs = [
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "feedback-control",
      plain:
        "Feedback control compares desired and observed state, then corrects action repeatedly so disturbances and policy errors do not run open-loop.",
      precise:
        "At tick $t$, a learned policy may provide a target $x^*_t$, feedforward action $u^{policy}_t$, or residual. The feedback path computes $e_t=x^*_t-\\hat x_t$, requests $u^{raw}_t=u^{policy}_t+K_p e_t+K_i I_t$, clips that request to the actuator envelope, advances the declared plant with the delayed applied command, observes again, and repeats. Conditional integration freezes $I_t$ when saturation and the current error would drive it farther into the limit; delay, noise, rate, and safety limits remain explicit controller concerns.",
      mentalModel:
        "Keep steering by comparing where you meant to go with where sensors say you are now.",
      ideas: [
        "Trace reference, estimate, error, raw command, applied command, and next observation.",
        "Measure delay, saturation, overshoot, settling, steady error, and constraint events.",
        "Assign fallback and anti-windup outside the learned policy.",
      ],
      worked:
        "Let the policy target be $x^*=1$, the estimate be $.6$, policy feedforward be $0$, $K_p=2$, and $|u|\\leq .5$. Error $.4$ requests $.8$ and the actuator applies $.5$. For the fixture plant $x_{t+1}=x_t+.1u_t$, the next state is $.65$. If a one-tick delay instead makes the plant receive the prior applied command $.2$, the next state is $.62$ even though the new request is $.8$.",
      boundary:
        "A feedback loop can be unstable with delay, wrong sign, unmodeled dynamics, or saturation; bounded commands alone do not prove stability.",
      objectives: {
        primary:
          "Compute and implement a bounded feedback correction around a learned policy",
        decision:
          "Diagnose delay, saturation, windup, overshoot, and stability evidence",
      },
      vocabulary: [
        {
          term: "Feedback control",
          meaning:
            "Repeatedly adjusting action using the difference between desired and measured state.",
        },
        {
          term: "Saturation",
          meaning:
            "A physical or software limit that clips a controller's requested command.",
        },
        {
          term: "Integral windup",
          meaning:
            "Accumulated integral error growing while an actuator is saturated, often causing later overshoot.",
        },
      ],
      primaryCheck: {
        prompt:
          "Desired x=1, estimate .6, Kp=2, and action limit .5: compute error, raw command, and applied command.",
        expected:
          "Error is .4, raw proportional command is .8, and saturation applies .5 while requested .8 remains logged.",
        retry:
          "Subtract estimate from reference, multiply by gain, then clamp only the applied command.",
      },
      decision: {
        explanation:
          "A controller is evaluated through time-domain response and constraint evidence, not one small instantaneous error.",
        mechanism:
          "Declare the plant equation, tick duration, delay queue, gains, limits, estimator, and anti-windup rule before injecting matched steps and disturbances. Record latency, requested/applied/plant commands, integral state, overshoot, settling, steady error, saturation, sign reversals, constraints, intervention, and sensor-dropout behavior.",
        workedExample:
          "For $x_{t+1}=x_t+.1u_{t-d}$, $x^*=1$, $K_p=12$, $K_i=0$, and $|u|\\leq2$, $d=0$ converges after bounded sign correction. With $d=1$, the deterministic trace repeats $x=.8,1,1.2,1.2,1,.8$ instead of settling. That fixture establishes a delay-induced limit cycle for these settings, not a general stability theorem.",
        boundary:
          "Finite step responses do not prove nonlinear or global stability across every load, contact, and operating point.",
        check: {
          prompt:
            "Error alternates sign without decaying after adding a 100 ms delay. What is the leading diagnosis?",
          expected:
            "The delayed high-gain loop is not settling and is poorly damped or in a limit cycle; hold or fall back, reduce bandwidth, and retest delay margins on the declared plant.",
          retry:
            "Plot error amplitude by cycle and compare phase delay with the control timescale.",
        },
      },
      quiz: {
        question: "Which command causes the next state under saturation?",
        options: [
          "The applied clipped command",
          "The raw request",
          "The reward",
          "The reference",
        ],
        answer: 0,
        explanation:
          "The actuator receives the applied value; the request remains diagnostic evidence.",
      },
      transfer: {
        prompt:
          "A learned residual cancels the safety controller. What failed?",
        correct:
          "The learned path has authority beyond the independent safety envelope",
        wrong: ["Nothing if reward rises", "Only logging failed"],
        worked:
          "Project or replace the combined command at an independent boundary before actuation.",
        retry: "Place authority blocks in causal actuation order.",
      },
      lab: {
        title: "Feedback response bench",
        question:
          "How do gain, delay, and saturation change correction and stability?",
        controlLabel: "Loop case",
        boundary:
          "The scalar traces are fixtures, not a hardware stability proof.",
        cases: [
          {
            label: "Kp2 / limit.5",
            resultLabel: "applied u",
            resultValue: "0.5",
            meter: 50,
            detail:
              "The .8 request saturates while applied action remains bounded.",
          },
          {
            label: "100 ms delay",
            resultLabel: "error",
            resultValue: "LIMIT CYCLE",
            meter: 100,
            detail:
              "In the declared scalar plant, the delayed command sustains a .8-to-1.2 cycle instead of settling.",
          },
          {
            label: "anti-windup",
            resultLabel: "release",
            resultValue: "BOUNDED",
            meter: 25,
            detail:
              "Integrator state stops accumulating beyond achievable actuation.",
          },
        ],
      },
      motionConcept: "optimization",
      code: {
        title: "Simulate delayed feedback and anti-windup",
        language: "Python 3",
        setup:
          "A dependency-free fixture declares its plant, tick, delay queue, learned-policy target, limits, and conditional-integration rule.",
        predict:
          "Does the current request or the delayed applied command advance the plant, and what happens to integral state during sustained saturation?",
        code: py(
          "DT, LIMIT, X0, PRIOR_APPLIED = .1, .5, 0., 0.",
          "POLICY_TARGET, POLICY_FEEDFORWARD = 2., 0.",
          "def run(anti_windup, delay_steps=0, x0=X0, prior_applied=PRIOR_APPLIED):",
          "    x, integral, queue, rows = x0, 0., [prior_applied]*delay_steps, []",
          "    for tick in range(30):",
          "        reference = POLICY_TARGET if tick < 20 else 0.",
          "        error = reference-x",
          "        proposed_integral = integral+DT*error",
          "        requested = POLICY_FEEDFORWARD+2.*error+proposed_integral",
          "        applied = max(-LIMIT, min(LIMIT, requested))",
          "        drives_farther = (applied == LIMIT and error > 0) or (applied == -LIMIT and error < 0)",
          "        if not anti_windup or requested == applied or not drives_farther:",
          "            integral = proposed_integral",
          "        queue.append(applied)",
          "        plant_command = queue.pop(0) if delay_steps else queue.pop()",
          "        x = x+DT*plant_command  # declared plant: x[t+1] = x[t] + DT*u[t-delay]",
          "        rows.append({'tick':tick,'error':error,'requested':requested,'applied':applied,'plant_command':plant_command,'integral':integral,'x_next':x})",
          "    return rows",
          "protected, unprotected = run(True), run(False)",
          "print(protected[0]); print(protected[20]); print(unprotected[20])",
          "assert protected[0]['requested'] == 4.2 and protected[0]['applied'] == .5",
          "assert protected[0]['plant_command'] == .5",
          "assert protected[19]['integral'] == 0.",
          "assert unprotected[19]['integral'] > 2.",
          "assert protected[20]['applied'] < 0. < unprotected[20]['applied']",
          "def delayed_limit_cycle():",
          "    dt,kp,limit,reference,x=.1,12.,2.,1.,.8  # declared x0",
          "    queue=[0.]  # declared one-tick delay queue contains prior applied u[-1]",
          "    x_trace=[]",
          "    for _ in range(6):",
          "        applied=max(-limit,min(limit,kp*(reference-x)))",
          "        queue.append(applied); plant_command=queue.pop(0); x += dt*plant_command; x_trace.append(round(x,10))",
          "    return x_trace",
          "cycle=delayed_limit_cycle()",
          "assert cycle == [.8,1.0,1.2,1.2,1.0,.8]",
        ),
        observe:
          "The plant consumes the declared queue head, the protected integrator stays at zero during positive saturation, and the separate x0=.8, queue=[0] fixture asserts the complete delayed trace [.8,1,1.2,1.2,1,.8].",
        tryIt:
          "Change only the delayed fixture's initial queue from [0] to [.2], recompute the trace, and explain why an undeclared prehistory would make the original trace irreproducible.",
      },
      sourceKeys: ["robotics"],
    }),
  ),
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "world-model-robot-planning",
      plain:
        "World-model robot planning predicts candidate action consequences, then closes the loop with current state, uncertainty, constraints, and real outcome checks.",
      precise:
        "Encode current state, roll candidate sequences through learned dynamics, predict goals, rewards, endings, and constraints, score feasible sequences with uncertainty/support penalties, execute one prefix, observe again, and compare predicted with realized transitions. Horizon, population, model revision, calls, latency, and fallback define the planner.",
      mentalModel:
        "Preview maneuvers in an imperfect simulator, take one bounded step, then correct the preview from new sensors.",
      ideas: [
        "Keep predicted and realized outcome rows paired by action.",
        "Count model calls, latency, horizon, and replanning separately.",
        "Reject plans beyond support, uncertainty, or safety limits.",
      ],
      worked:
        "A predicts 8±1 and realizes 7; B predicts 11±5 and realizes −2. Penalty beta=1 scores 7 and 6, selecting A before execution; after one action the planner replans.",
      boundary:
        "Uncertainty penalties and replanning reduce exposure but cannot prevent shared model bias or guarantee safe contacts.",
      objectives: {
        primary: "Assemble a constrained receding-horizon world-model planner",
        decision:
          "Detect model exploitation using predicted-real action evidence",
      },
      vocabulary: [
        {
          term: "Receding horizon",
          meaning:
            "Planning several future steps but executing only a prefix before replanning.",
        },
        {
          term: "Model exploitation",
          meaning:
            "Selecting actions because prediction error makes them appear better than they are.",
        },
        {
          term: "Fallback controller",
          meaning:
            "An independent controller used when planning evidence or system state is invalid.",
        },
      ],
      primaryCheck: {
        prompt:
          "A/B predict 8±1 and 11±5 with uncertainty penalty beta=1. Which scores and sequence result, and what must the planner emit if every candidate violates a hard constraint before ranking?",
        expected:
          "Penalized scores are 7 and 6, so A is selected despite B's larger unpenalized mean. If every candidate is infeasible, no maximum exists: emit an explicit independently authorized hold/fallback receipt with the all-candidates-infeasible reason and preserve the rejected ledger.",
        retry:
          "Filter hard constraints first, subtract beta times uncertainty only for feasible candidates, and branch to the declared fallback before calling a ranking function on an empty set.",
      },
      decision: {
        explanation:
          "Exploitation evidence compares the ordering that caused planner choice with trusted outcomes for the same candidates.",
        mechanism:
          "Log candidate mean, uncertainty, support, constraint, selected action, calls, latency, and realized outcome; test horizons and high-action regions with paired starts, then trigger fallback on rank reversal.",
        workedExample:
          "B ranks above A in the model but below A when executed; repeated B selection is decision-level exploitation even if average validation loss is low.",
        boundary:
          "Trusted-simulator rankings remain simulator evidence and may not expose physical-model error.",
        check: {
          prompt:
            "Selected actions rank first in prediction but last in realized outcome on repeated starts. What follows?",
          expected:
            "Treat this as model exploitation; preserve reversals, restrict support or horizon, penalize uncertainty, and invoke fallback until revalidated.",
          retry:
            "Compare predicted and realized ordering for the exact candidates, not average state loss.",
        },
      },
      quiz: {
        question: "Why execute only a plan prefix?",
        options: [
          "To incorporate new observations and limit model error",
          "Later actions mean nothing",
          "To remove constraints",
          "To guarantee reward",
        ],
        answer: 0,
        explanation: "Feedback corrects for disturbances and prediction error.",
      },
      transfer: {
        prompt:
          "Treatment doubles horizon and calls. Is higher return caused by horizon alone?",
        correct: "No; match calls or show a cost frontier",
        wrong: ["Yes, calls are irrelevant", "Only reward matters"],
        worked:
          "Trade population and horizon at matched calls or report both factors.",
        retry: "Expand planner settings into primitive model evaluations.",
      },
      lab: {
        title: "Planner exploitation gate",
        question: "Which trace is feasible, uncertain, or model-exploiting?",
        controlLabel: "Planner record",
        boundary: "Scores are deterministic examples, not robot runs.",
        cases: [
          {
            label: "8±1 → 7",
            resultLabel: "rank",
            resultValue: "CONSISTENT",
            meter: 25,
            detail: "Penalized prediction and realized outcome support A.",
          },
          {
            label: "11±5 → −2",
            resultLabel: "rank",
            resultValue: "REVERSED",
            meter: 100,
            detail: "Optimistic prediction becomes the worst realized outcome.",
          },
          {
            label: "constraint hit",
            resultLabel: "authority",
            resultValue: "FALLBACK",
            meter: 100,
            detail: "A hard gate rejects the sequence before ranking.",
          },
        ],
      },
      motionConcept: "agent",
      code: {
        title: "Roll out, constrain, execute one step, and replan",
        language: "Python 3",
        setup:
          "A horizon-three fixture logs every predicted transition, uncertainty increment, constraint decision, and primitive model call.",
        predict:
          "Which sequence wins from x=0, and does the same sequence remain feasible after the first action slips?",
        code: py(
          "GOAL, BETA, X_MAX = 1., .5, 1.2",
          "PLANS = {'A':[.4,.35,.2], 'B':[.7,.7,-.2], 'C':[.2,.2,.2]}",
          "SIGMA = {'A':[.05,.08,.10], 'B':[.20,.25,.25], 'C':[.05,.05,.05]}",
          "def rollout(start_x, name):",
          "    x, uncertainty, path, violation = start_x, 0., [], None",
          "    for step, (action, sigma) in enumerate(zip(PLANS[name], SIGMA[name]), 1):",
          "        x = x+action  # learned-dynamics fixture",
          "        uncertainty += sigma",
          "        ok = 0. <= x <= X_MAX",
          "        path.append({'step':step,'action':action,'predicted_x':x,'sigma_total':uncertainty,'constraint_ok':ok})",
          "        if not ok:",
          "            violation = f'x={x:.2f} outside [0,{X_MAX}]'",
          "            break",
          "    score = None if violation else -abs(GOAL-x)-BETA*uncertainty",
          "    return {'name':name,'path':path,'model_calls':len(path),'violation':violation,'score':score}",
          "def plan(start_x):",
          "    ledger = [rollout(start_x, name) for name in PLANS]",
          "    feasible = [row for row in ledger if row['violation'] is None]",
          "    if not feasible:",
          "        fallback={'name':'FALLBACK_HOLD','path':[],'model_calls':sum(row['model_calls'] for row in ledger),'violation':'all_candidates_infeasible','score':None,'authority':'independent_safety_controller','applied':'hold'}",
          "        return fallback, ledger",
          "    return max(feasible, key=lambda row: row['score']), ledger",
          "first, first_ledger = plan(0.)",
          "executed = first['path'][0]['action']",
          "realized_x = 0.+.75*executed  # measured slip: .30, not predicted .40",
          "second, second_ledger = plan(realized_x)",
          "fallback, rejected_ledger = plan(1.15)",
          "print(first['name'], sum(r['model_calls'] for r in first_ledger), realized_x, second['name'], fallback)",
          "assert first['name'] == 'A' and executed == .4",
          "assert abs(realized_x-.3) < 1e-12",
          "assert first_ledger[1]['violation'] is not None",
          "assert second['name'] == 'C' and second_ledger[0]['violation'] is not None",
          "assert all(row['violation'] is not None for row in rejected_ledger)",
          "assert fallback['applied']=='hold' and fallback['authority']=='independent_safety_controller' and fallback['violation']=='all_candidates_infeasible'",
        ),
        observe:
          "A wins initially, one action executes, and replanning from measured .30 selects C. From x=1.15 every candidate violates the workspace bound, so the planner returns an independently authorized hold receipt instead of ranking an empty feasible set.",
        tryIt:
          "Change B's uncertainty without changing its actions, then make all plans infeasible for a different constraint and require the fallback receipt to preserve that specific rejection reason.",
      },
      sourceKeys: ["robotics", "saycan"],
    }),
  ),
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "hierarchical-skills",
      plain:
        "A hierarchical controller chooses a reusable skill, supplies arguments, watches termination, and recovers when the skill no longer matches the world.",
      precise:
        "A high-level policy emits skill ID, arguments, preconditions, and expected postconditions. A low-level controller acts until success, failure, timeout, guard, or interruption. Interfaces expose authority, resources, observations, effects, invariants, and recovery edges; evaluation separates selection, argument, execution, termination, and composition errors.",
      mentalModel:
        "Plan with named procedures, but require each to declare when it starts, what it promises, and how it stops.",
      ideas: [
        "Specify preconditions, arguments, effects, invariants, and all termination causes.",
        "Keep selection separate from low-level execution evidence.",
        "Replan after violated postconditions or timeouts.",
      ],
      worked:
        "grasp(cup) requires reachable and gripper-empty; after five steps contact is absent and timeout fires. The system records failure, does not mark holding(cup), and routes to reobserve rather than place(cup).",
      boundary:
        "Named skills can hide brittle controllers, ambiguous effects, and errors that compound across long plans.",
      objectives: {
        primary: "Design and execute typed hierarchical skill interfaces",
        decision:
          "Diagnose selection, execution, termination, and recovery failures",
      },
      vocabulary: [
        {
          term: "Skill",
          meaning:
            "A temporally extended controller with parameters, preconditions, termination, and expected effects.",
        },
        {
          term: "Precondition",
          meaning: "A predicate required before a skill may start.",
        },
        {
          term: "Postcondition",
          meaning: "An expected state predicate used to verify a skill result.",
        },
      ],
      primaryCheck: {
        prompt:
          "grasp(cup) times out without contact. Which state and transition are valid?",
        expected:
          "Mark execution failure, do not assert holding(cup), preserve timeout/contact evidence, and take the declared reobserve or recovery edge.",
        retry:
          "Evaluate observed postcondition independently of the command, then follow the failure edge.",
      },
      decision: {
        explanation:
          "Hierarchical diagnosis locates the first layer whose contract diverged before blaming the whole task.",
        mechanism:
          "Record chosen skill/arguments, preconditions, low-level actions, termination, postconditions, recovery, success, constraints, and latency; perturb one object or outcome and trace first invalid transition.",
        workedExample:
          "Correct pick skill is selected but object argument resolves to bowl; this is argument grounding failure, not grasp-control failure.",
        boundary:
          "A clean taxonomy does not prove the skill library covers novel tasks or postcondition sensors are correct.",
        check: {
          prompt:
            "The right skill has the wrong object argument, then executes perfectly on that object. Which layer failed?",
          expected:
            "High-level argument grounding failed; skill type and low-level execution pass narrower contracts while task postcondition fails.",
          retry:
            "Score skill ID, each argument, execution, and task goal separately.",
        },
      },
      quiz: {
        question: "When may a planner assume skill success?",
        options: [
          "After an observed postcondition passes",
          "After issuing its name",
          "When reward is nonzero",
          "After a fixed delay",
        ],
        answer: 0,
        explanation:
          "Commands express intent; postconditions establish resulting state.",
      },
      transfer: {
        prompt: "Timeout leaves a cached success flag. What risk follows?",
        correct: "Later skills act from a false state assumption",
        wrong: ["No effect", "Only rendering changes"],
        worked:
          "Invalidate success on every non-success ending and re-estimate before replanning.",
        retry: "Trace which observed predicate justified each symbolic update.",
      },
      lab: {
        title: "Skill contract debugger",
        question: "Which layer owns selection, argument, or execution failure?",
        controlLabel: "Skill trace",
        boundary: "The traces are deterministic state-machine cases.",
        cases: [
          {
            label: "wrong skill",
            resultLabel: "failure",
            resultValue: "SELECTION",
            meter: 90,
            detail: "The procedure effects cannot meet the current goal.",
          },
          {
            label: "wrong cup ID",
            resultLabel: "failure",
            resultValue: "ARGUMENT",
            meter: 85,
            detail: "Skill type is valid but grounding binds the wrong entity.",
          },
          {
            label: "timeout/no contact",
            resultLabel: "failure",
            resultValue: "EXECUTION",
            meter: 100,
            detail: "Low-level control does not establish its postcondition.",
          },
        ],
      },
      motionConcept: "routing",
      code: {
        title: "Execute a typed skill contract",
        language: "Python 3",
        setup:
          "The skill declares argument types, preconditions, invariants, effects, termination evidence, and recovery edges before execution.",
        predict:
          "Does a timeout without contact create holding(cup), and which recovery edge runs?",
        code: py(
          "GRASP = {",
          "    'id':'grasp',",
          "    'argument_types':{'object_id':str},",
          "    'preconditions':('reachable','gripper_empty'),",
          "    'invariants':('workspace_clear',),",
          "    'effect_template':'holding:{object_id}',",
          "    'termination':{'success':'contact','failure':'timeout'},",
          "    'recovery':{'timeout':'reobserve','invariant_violation':'hold'},",
          "}",
          "def execute(contract, arguments, state, observations, timeout_steps=5):",
          "    for name, expected_type in contract['argument_types'].items():",
          "        if not isinstance(arguments.get(name), expected_type):",
          "            raise TypeError(f'{name} must be {expected_type.__name__}')",
          "    if not all(state.get(p, False) for p in contract['preconditions']):",
          "        return {'status':'precondition_failed','next':'reobserve','effects':[]}",
          "    for tick in range(timeout_steps):",
          "        tick_state={**state,**observations[tick].get('state',{})}",
          "        failed=[p for p in contract['invariants'] if not tick_state.get(p,False)]",
          "        if failed:",
          "            return {'status':'invariant_violation','next':contract['recovery']['invariant_violation'],'effects':[],'tick':tick,'failed_guard':failed[0]}",
          "        if observations[tick].get('contact', False):",
          "            effect = contract['effect_template'].format(**arguments)",
          "            return {'status':'success','next':'done','effects':[effect],'tick':tick}",
          "    return {'status':'timeout','next':contract['recovery']['timeout'],'effects':[]}",
          "state = {'reachable':True,'gripper_empty':True,'workspace_clear':True}",
          "result = execute(GRASP, {'object_id':'cup'}, state, [{'contact':False}]*5)",
          "print(result)",
          "assert result == {'status':'timeout','next':'reobserve','effects':[]}",
          "assert 'holding:cup' not in result['effects']",
          "changing=[{'contact':False,'state':{'workspace_clear':True}},{'contact':False,'state':{'workspace_clear':False}}]+[{'contact':True}]*3",
          "guarded = execute(GRASP, {'object_id':'cup'}, state, changing)",
          "assert guarded == {'status':'invariant_violation','next':'hold','effects':[],'tick':1,'failed_guard':'workspace_clear'}",
          "try:",
          "    execute(GRASP, {'object_id':7}, state, [{'contact':True}]*5)",
          "    raise AssertionError('untyped argument was accepted')",
          "except TypeError:",
          "    pass",
        ),
        observe:
          "The timeout produces no holding effect, the integer identifier is rejected before execution, and a workspace guard that changes from true to false at tick 1 immediately routes to hold before the later contact can create an effect.",
        tryIt:
          "Move the guard failure to tick two, assert the recorded tick and failed_guard receipt, and prove no later contact can create holding(cup).",
      },
      sourceKeys: ["saycan", "rt1"],
    }),
  ),
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "sim-to-real-identification",
      plain:
        "System identification estimates physical parameters from action-response data, while sim-to-real testing asks whether those estimates and randomized simulations support control under changed dynamics.",
      precise:
        "Choose identifiable mass, friction, delay, or actuator parameters; design bounded excitation; fit from synchronized applied-action/state data; validate on held-out trajectories; represent uncertainty; randomize plausible simulator factors; and evaluate nominal, shifted, and target conditions without tuning on final tests.",
      mentalModel:
        "Measure how the machine responds, tune a simulator range, then test controllers within and beyond that range.",
      ideas: [
        "Check identifiability before interpreting fitted values.",
        "Separate calibration trajectories from held-out transfer evaluation.",
        "Report randomized factors, adaptation data, and residual confounds.",
      ],
      worked:
        "Applied force 2 N produces acceleration 1 m/s² in a frictionless fixture, estimating mass 2 kg. With unknown friction, one equation cannot identify mass and friction separately.",
      boundary:
        "Many parameter combinations can explain the same trajectory, and randomization can hide rather than eliminate structural error.",
      objectives: {
        primary:
          "Fit and validate an identifiable dynamics parameter from action-response data",
        decision:
          "Design a bounded domain-randomization and transfer experiment",
      },
      vocabulary: [
        {
          term: "System identification",
          meaning:
            "Estimating dynamics parameters or models from measured input-output trajectories.",
        },
        {
          term: "Identifiability",
          meaning:
            "Whether available experiments can distinguish the parameter values being estimated.",
        },
        {
          term: "Domain randomization",
          meaning:
            "Training across varied simulator factors to reduce reliance on one nominal setting.",
        },
      ],
      primaryCheck: {
        prompt:
          "In a frictionless fixture, force 2 N causes acceleration 1 m/s². What mass is identified, and what if friction is unknown?",
        expected:
          "F=ma gives mass 2 kg. With unknown friction, one equation cannot separately identify mass and friction, so the estimate is confounded.",
        retry:
          "Write every unknown in the force balance and compare with the number of independent equations.",
      },
      decision: {
        explanation:
          "A transfer study declares randomized factors and keeps target conditions untouched until evaluation.",
        mechanism:
          "Fit on calibration trajectories, validate on held-out actions, train with pinned randomization ranges, compare nominal and randomized policies on paired shifts, and log adaptation data, constraints, failures, and evidence outside the envelope.",
        workedExample:
          "Randomizing friction [.2,.8] improves held-out .7 performance but not friction 1.2; the claim is robustness inside the tested range, not universal transfer.",
        boundary:
          "Success in one higher-fidelity simulator or device does not establish transfer to different wear, contacts, sensing, or hardware.",
        check: {
          prompt:
            "Training randomizes friction [.2,.8] and test friction is 1.2. Is that in-range generalization?",
          expected:
            "No. It is out-of-range extrapolation and must be reported separately rather than implying the training range covered it.",
          retry:
            "Place every test parameter beside its exact training interval before labeling transfer.",
        },
      },
      quiz: {
        question: "When may a fitted parameter receive causal meaning?",
        options: [
          "When the experiment makes it identifiable under stated assumptions",
          "When loss is low",
          "When rendering is good",
          "With one trajectory always",
        ],
        answer: 0,
        explanation:
          "Otherwise different parameter combinations may fit the same observations.",
      },
      transfer: {
        prompt: "Final test trajectories retune randomization. What happened?",
        correct:
          "The test became adaptation data and needs a new untouched evaluation",
        wrong: ["Nothing", "Only seeds changed"],
        worked:
          "Record adaptation, freeze the revision, and evaluate a new held-out condition.",
        retry: "Trace whether test outcomes influenced the released system.",
      },
      lab: {
        title: "Identification and transfer gate",
        question:
          "Which evidence identifies a parameter or exposes confounding?",
        controlLabel: "Experiment",
        boundary: "The force values are fixtures, not hardware measurements.",
        cases: [
          {
            label: "F2 / a1",
            resultLabel: "mass",
            resultValue: "2 kg",
            meter: 25,
            detail: "One unknown is identifiable under the frictionless model.",
          },
          {
            label: "unknown friction",
            resultLabel: "fit",
            resultValue: "CONFOUNDED",
            meter: 100,
            detail: "Mass and friction cannot be separated from one equation.",
          },
          {
            label: "friction1.2",
            resultLabel: "transfer",
            resultValue: "OUT OF RANGE",
            meter: 85,
            detail: "Test lies beyond training range [.2,.8].",
          },
        ],
      },
      motionConcept: "optimization",
      code: {
        title: "Fit on calibration points and validate held out",
        language: "Python 3",
        setup:
          "A frictionless fixture fits inverse mass from four force-acceleration pairs, freezes the fit, and checks a fifth pair against a residual-derived tolerance.",
        predict:
          "Is the fitted mass close to 2 kg, and does the untouched 2.5 N case pass the declared two-residual tolerance?",
        code: py(
          "import math",
          "calibration = [(1.,.48),(2.,1.02),(3.,1.49),(4.,2.01)]",
          "held_out = (2.5,1.24)",
          "assumptions = {'friction_n':0., 'synchronized_applied_force':True}",
          "inverse_mass = sum(f*a for f,a in calibration)/sum(f*f for f,_ in calibration)",
          "mass_kg = 1./inverse_mass",
          "residual_rmse = math.sqrt(sum((a-inverse_mass*f)**2 for f,a in calibration)/len(calibration))",
          "held_force, held_acceleration = held_out",
          "held_prediction = inverse_mass*held_force",
          "held_error = abs(held_acceleration-held_prediction)",
          "release_limit = max(.03, 2.*residual_rmse)",
          "released = held_error <= release_limit",
          "print({'mass_kg':mass_kg,'calibration_rmse':residual_rmse,'held_error':held_error,'limit':release_limit,'released':released})",
          "assert 1.95 < mass_kg < 2.05 and released",
          "# If both inverse mass and unknown friction are fitted from one force-balance row, rank 1 < 2 unknowns.",
          "single_row_design_rank, confounded_unknowns = 1, ('inverse_mass','friction_n')",
          "assert single_row_design_rank < len(confounded_unknowns)",
        ),
        observe:
          "The calibration-only fit estimates about 2 kg, and the frozen parameter predicts the held-out acceleration within the declared tolerance; the final assertion separately marks the one-row mass-plus-friction fit as unidentifiable.",
        tryIt:
          "Add signed velocities and both force directions, then state which extra variation distinguishes Coulomb friction from mass.",
      },
      sourceKeys: ["domainRandomization"],
    }),
  ),
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "recovery-intervention-capstone",
      duration: 42,
      plain:
        "This capstone operates a learned controller inside feedback, planning, skill, transfer, and independent recovery boundaries, then tests when control must hand off.",
      precise:
        "Integrate synchronized state estimate, learned policy, bounded feedback, optional planner/skills, constraint monitor, fallback, human intervention, checkpoint/rollback, and event ledger. Derive freshness from packet timestamps rather than a writable counter: reject future or over-age packets, reset the consecutive-fresh count on every invalid packet, and authorize resume only after the declared sequence of validated observations. Acceptance covers timing, saturation, postconditions, plan ranks, invalid sensors/models, injected disturbances, stop latency, recovery, restored controller/RNG state, and authority precedence.",
      mentalModel:
        "Build the cockpit: learned pilot, instruments, alarms, manual override, and recorder must agree who is in control.",
      ideas: [
        "Put runtime authority after every optimizing component.",
        "Inject sensor, model, controller, skill, and dynamics faults separately.",
        "Measure detection, intervention latency, fallback, recovery, and residual risk.",
      ],
      worked:
        "A camera packet aged 80 ms exceeds the 40 ms gate, so a policy request $.08$ is replaced by hold $0$ and fallback takes authority. Two fresh packets raise the consecutive count to 2, a future-dated packet resets it to 0, and only three later validated packets permit a human resume receipt. Completion is assisted recovery, not uninterrupted autonomy.",
      boundary:
        "A tested fallback suite cannot prove absence of unknown hazards or authorize physical deployment.",
      objectives: {
        primary:
          "Build and verify a closed-loop learned controller with independent fallback authority",
        decision: "Run a controlled recovery and human-intervention experiment",
      },
      vocabulary: [
        {
          term: "Safety envelope",
          meaning:
            "Independent limits inside which learned control may operate.",
        },
        {
          term: "Assisted recovery",
          meaning:
            "Continuation achieved through fallback or human action rather than nominal policy alone.",
        },
        {
          term: "Authority precedence",
          meaning:
            "The order deciding which controller, monitor, or person overrides another.",
        },
      ],
      primaryCheck: {
        prompt:
          "Where should constraint projection and emergency stop sit relative to learned policy, planner, and actuator?",
        expected:
          "They independently inspect or replace the combined request immediately before actuation, with human/emergency authority overriding optimizing components.",
        retry:
          "Draw command flow and place hard authority at the final enforceable boundary.",
      },
      decision: {
        explanation:
          "A recovery study measures detection and containment separately from autonomous task success.",
        mechanism:
          "Pair state and fault time, inject one fault, derive each packet's age from capture and decision timestamps, arbitrate requested versus applied actions under fixed authority precedence, and retain owner, fallback path, consecutive-fresh resets, controller/RNG rollback hashes, constraints, recovery time, resumed revision, human receipt, and failures across seeds.",
        workedExample:
          "Stale camera is detected in 20 ms; fallback holds and reobserves for three packets; a human resumes. Task success passes while autonomy fails.",
        boundary:
          "Known fault injections do not establish hazard completeness, human availability, or physical stop distance.",
        check: {
          prompt:
            "The task completes only after a human resets the controller. How are outcome and autonomy labeled?",
          expected:
            "Record task success with assisted intervention, while uninterrupted autonomous success is false; preserve owner, timing, reason, and resumed state.",
          retry:
            "Separate final task outcome from which authority produced recovery.",
        },
      },
      quiz: {
        question: "Can reward override a hard stop?",
        options: [
          "No; stop authority is non-compensable",
          "Yes when average reward is high",
          "Only on GPU",
          "After timeout",
        ],
        answer: 0,
        explanation: "The safety envelope defines feasible actuation first.",
      },
      transfer: {
        prompt: "Fallback uses the same corrupted sensor. What remains?",
        correct: "A common-mode failure can defeat both paths",
        wrong: ["Fallback is independent automatically", "Only reward changes"],
        worked:
          "Use independent evidence or minimal safe action and test shared failures.",
        retry: "List evidence shared by nominal and fallback.",
      },
      lab: {
        title: "Recovery authority dossier",
        question: "Which event is autonomous, assisted, or invalid?",
        controlLabel: "Recovery record",
        boundary: "The cases are simulated authority fixtures.",
        cases: [
          {
            label: "policy recovers",
            resultLabel: "outcome",
            resultValue: "AUTONOMOUS",
            meter: 25,
            detail:
              "Nominal control stays within the independent envelope and restores the declared task state.",
          },
          {
            label: "human reset",
            resultLabel: "outcome",
            resultValue: "ASSISTED",
            meter: 65,
            detail:
              "External human authority owns recovery, so task success cannot be relabeled autonomous.",
          },
          {
            label: "shared sensor fault",
            resultLabel: "fallback",
            resultValue: "INVALID",
            meter: 100,
            detail:
              "Both nominal and fallback paths depend on the same corrupted sensor evidence.",
          },
        ],
      },
      motionConcept: "security",
      code: {
        title: "Trace watchdog, fallback, rollback, and explicit resume",
        language: "Python 3",
        setup:
          "A dependency-free authority fixture derives camera age from timestamps, resets consecutive freshness on a bad packet, restores a snapshot, and requires a human receipt.",
        predict:
          "What action owns the stale command, and can two fresh packets followed by one future packet authorize resume?",
        code: py(
          "MAX_AGE_MS=40; priority={'policy':1,'fallback':2,'human':3,'watchdog_stop':4}",
          "state={'x':.20,'mode':'policy','fresh_count':0,'rng_state':'rng-53'}",
          "snapshot=state.copy(); events=[]",
          "def camera_verdict(captured_ms,now_ms):",
          "    age=now_ms-captured_ms",
          "    return (0<=age<=MAX_AGE_MS),age",
          "def arbitrate(commands): return max(commands,key=lambda row:priority[row['owner']])",
          "requested={'owner':'policy','action':.08,'reason':'reach'}",
          "valid,age=camera_verdict(20,100)",
          "stop=None if valid else {'owner':'watchdog_stop','action':0.,'reason':'stale_or_future_camera'}",
          "selected=arbitrate([requested,{'owner':'fallback','action':0.,'reason':'bounded_hold'},stop])",
          "events.append({'phase':'fault','age_ms':age,'requested':requested['action'],'applied':selected['action'],'owner':selected['owner']})",
          "state['mode']='fallback'; state['x']=.18; state['rng_state']='changed'",
          "state=snapshot.copy(); state['mode']='fallback'  # verified rollback restores x, freshness, and RNG receipt",
          "def observe(captured_ms,now_ms):",
          "    valid,age=camera_verdict(captured_ms,now_ms)",
          "    state['fresh_count']=state['fresh_count']+1 if valid else 0",
          "    events.append({'phase':'freshness','age_ms':age,'accepted':valid,'fresh_count':state['fresh_count']})",
          "for captured,now in [(180,200),(205,230),(260,250),(270,290),(300,325),(330,350)]: observe(captured,now)",
          "assert [row['fresh_count'] for row in events if row['phase']=='freshness']==[1,2,0,1,2,3]",
          "assert state['fresh_count']>=3 and state['mode']=='fallback'",
          "receipt={'owner':'human','reason':'operator-reviewed','from':'fallback'}; state['mode']='human'",
          "task_success=True; autonomous=task_success and state['mode']=='policy'; assisted=task_success and state['mode']!='policy'",
          "print(events[0],receipt,autonomous,assisted)",
          "assert events[0]['owner']=='watchdog_stop' and events[0]['requested']!=events[0]['applied']",
          "assert state['rng_state']=='rng-53' and not autonomous and assisted",
        ),
        observe:
          "Watchdog_stop replaces the stale request, the future packet resets freshness after two accepted packets, rollback restores the RNG receipt, and only the later three-packet sequence permits assisted human resume.",
        tryIt:
          "Remove the future packet or move watchdog_stop below policy in the priority table; identify which acceptance invariant catches each unsafe change.",
      },
      sourceKeys: ["robotics", "domainRandomization"],
    }),
  ),
];
