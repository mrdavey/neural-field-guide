import { plannedCourseManifests } from "../../research-curriculum-manifests";
import { defineResearchLesson } from "../../research-courses/helpers";
import { embodiedSeed, py } from "../seed";
const m = plannedCourseManifests.embodied;

export const embodiedPerceptionSpecs = [
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "cameras-proprioception",
      plain:
        "An embodied observation packet joins external sensors such as cameras with proprioception—measurements of the robot's own joints and motion—without hiding noise, age, or missing data.",
      precise:
        "At decision time t, package image/depth arrays, joint position $q_t$, velocity $\\dot q_t$, effort, gripper state, base state, device timestamps, calibration revision, validity masks, and uncertainty. A calibration revision is the version identifier for the sensor-to-body mapping used to interpret spatial values; changing it changes the meaning of downstream coordinates. Convert timestamps into the declared decision-clock domain and accept a modality only when $0 \\leq age \\leq limit$; a negative age is a future timestamp or clock-domain failure, not exceptional freshness. Resample or synchronize within declared tolerance, preserve raw units, and model sensor noise and dropout separately from normalization or augmentation.",
      mentalModel:
        "The packet is a synchronized medical chart: images show the scene while proprioception reports the body's internal posture and effort.",
      ideas: [
        "Keep device timestamps, units, validity, and calibration revision with every modality.",
        "Distinguish measurement noise, missingness, normalization, and training augmentation.",
        "Test single-sensor dropout and disagreement before policy learning.",
      ],
      worked:
        "At decision time 2.000 s, a typed packet records RGB shape [480,640,3] in uint8 camera pixels at 1.982 s under calibration cam-base-v3; joints shape [7] in radians at 1.996 s in the robot frame; force shape [6] in newtons at 1.993 s in the tool frame; and depth shape [480,640] in metres at 1.939 s. RGB, joints, and force have ages 18/4/7 ms and pass a 25 ms limit. Depth age is 61 ms, so it is stale. A second RGB timestamp of 2.006 s has age −6 ms and is rejected as future-dated or in the wrong clock domain. Neither invalid packet may be silently reused.",
      boundary:
        "A synchronized packet can still be wrong through common clock error, calibration drift, saturation, or a shared physical disturbance.",
      objectives: {
        primary:
          "Construct and validate a synchronized camera-proprioception packet",
        decision:
          "Diagnose sensor noise, dropout, saturation, and disagreement",
      },
      vocabulary: [
        {
          term: "Proprioception",
          meaning:
            "Measurements of the robot body's own configuration, motion, effort, or internal state.",
        },
        {
          term: "Sensor packet",
          meaning:
            "A decision-time record joining modality values with timestamps, units, frames, validity, and provenance.",
        },
        {
          term: "Calibration revision",
          meaning:
            "A version identifier for the sensor-to-body mapping used to interpret spatial measurements.",
        },
        {
          term: "Saturation",
          meaning:
            "A sensor reaching its representable limit so additional physical change is not reflected numerically.",
        },
      ],
      primaryCheck: {
        prompt:
          "RGB/joint/force ages are 18/4/7 ms and depth age is 61 ms under a 25 ms gate. Another RGB capture is timestamped 6 ms after the decision clock. The manifest requires RGB/depth cam-base-v3, joints joint-zero-v2, and force ft-v4; an otherwise fresh RGB packet reports cam-base-v2. Which fields pass the complete packet contract?",
        expected:
          "Joints and force pass both schema and age checks. Depth has the expected revision but is stale, so it must be masked or trigger recovery. The 6 ms future RGB has age −6 ms and fails the required 0 <= age <= 25 ms interval; diagnose an unconverted clock domain or invalid future timestamp. The other RGB is fresh but fails exact calibration-revision equality: a nonempty cam-base-v2 string is not the required cam-base-v3 and must be rejected before fusion.",
        retry:
          "Check each modality twice: require exact shape/unit/frame/revision equality with the manifest, then subtract capture time from decision time and compare age with the declared maximum.",
      },
      decision: {
        explanation:
          "Sensor diagnosis separates random noise, missing packets, clipped values, and cross-modal contradiction because each requires a different recovery.",
        mechanism:
          "Track per-modality age and validity, estimate noise on stationary/repeated cases, detect rail values and dropouts, compare redundant geometric or motion predictions, and test policy/state-estimator outcomes under one injected failure at a time.",
        workedExample:
          "Joint velocity predicts +2 cm motion, vision reports −3 cm, and force is at its maximum analog-to-digital converter (ADC) value; the system flags disagreement plus force saturation instead of averaging three incompatible signals.",
        boundary:
          "Agreement among sensors can reflect common-mode bias and cannot prove ground truth without an independent reference.",
        check: {
          prompt:
            "A force reading stays at exactly its maximum while vision and joints show continued contact motion. Is this ordinary Gaussian noise?",
          expected:
            "No. Repeated rail value indicates likely saturation; mark force magnitude unreliable, preserve the event, and use a declared fallback or independent reference.",
          retry:
            "Check whether values vary around a mean, disappear, or remain pinned at a representable boundary.",
        },
      },
      quiz: {
        question: "What should happen to a stale depth frame?",
        options: [
          "Mark invalid and invoke the declared estimator/controller response",
          "Relabel it fresh",
          "Remove all timestamps",
          "Treat it as ground truth",
        ],
        answer: 0,
        explanation:
          "Silent reuse makes stale evidence indistinguishable from a current measurement.",
      },
      transfer: {
        prompt:
          "All modalities share one wrong host clock. Does low measured skew prove synchronization?",
        correct:
          "No; a common clock error can make aligned timestamps jointly wrong",
        wrong: [
          "Yes, skew proves physical simultaneity",
          "Only image shape matters",
        ],
        worked:
          "Validate clock conversion against an independent timing event and retain device clocks.",
        retry:
          "Distinguish relative skew from absolute capture-to-actuation latency.",
      },
      lab: {
        title: "Multisensor packet triage",
        question:
          "Which packet is fresh, missing, saturated, or contradictory?",
        controlLabel: "Packet",
        boundary:
          "The packet ages and signals are constructed fixtures, not sensor measurements.",
        cases: [
          {
            label: "18/4/7 ms",
            resultLabel: "fusion",
            resultValue: "VALID",
            meter: 20,
            detail: "All included fields meet the declared 25 ms age gate.",
          },
          {
            label: "depth 61 ms",
            resultLabel: "depth",
            resultValue: "MASK",
            meter: 80,
            detail:
              "The stale modality is explicit and cannot masquerade as fresh evidence.",
          },
          {
            label: "force rail",
            resultLabel: "force",
            resultValue: "SATURATED",
            meter: 100,
            detail:
              "A pinned maximum loses magnitude information and triggers recovery.",
          },
        ],
      },
      motionConcept: "multimodal",
      code: {
        title: "Validate a multisensor packet",
        language: "Python 3",
        setup:
          "A complete typed packet exposes shapes, units, frames, calibration revisions, timestamps, ages, and modality-specific validity.",
        predict: "Which modality is rejected, and which schema checks pass?",
        code: py(
          "decision_ms=2000; limit_ms=25",
          "packet={'rgb':{'shape':(480,640,3),'captured_ms':1982,'unit':'uint8','frame':'camera','calibration':'cam-base-v3'},'joints':{'shape':(7,),'captured_ms':1996,'unit':'rad','frame':'robot','calibration':'joint-zero-v2'},'force':{'shape':(6,),'captured_ms':1993,'unit':'N','frame':'tool','calibration':'ft-v4'},'depth':{'shape':(480,640),'captured_ms':1939,'unit':'m','frame':'camera','calibration':'cam-base-v3'}}",
          "expected={'rgb':((480,640,3),'uint8','camera','cam-base-v3'),'joints':((7,),'rad','robot','joint-zero-v2'),'force':((6,),'N','tool','ft-v4'),'depth':((480,640),'m','camera','cam-base-v3')}",
          "for name,field in packet.items():",
          "    shape,unit,frame,revision=expected[name]",
          "    assert (field['shape'],field['unit'],field['frame'],field['calibration'])==(shape,unit,frame,revision)",
          "    field['age_ms']=decision_ms-field['captured_ms']",
          "    field['valid']=0<=field['age_ms']<=limit_ms",
          "    field['reason']='future_or_clock_domain_failure' if field['age_ms']<0 else 'stale' if field['age_ms']>limit_ms else 'accepted'",
          "assert packet['depth']['valid'] is False and all(packet[k]['valid'] for k in ('rgb','joints','force'))",
          "future_rgb=dict(packet['rgb'],captured_ms=2006); future_rgb['age_ms']=decision_ms-future_rgb['captured_ms']",
          "future_rgb['valid']=0<=future_rgb['age_ms']<=limit_ms; future_rgb['reason']='future_or_clock_domain_failure' if future_rgb['age_ms']<0 else 'accepted'",
          "assert future_rgb['age_ms']==-6 and future_rgb['valid'] is False and future_rgb['reason']=='future_or_clock_domain_failure'",
          "corrupt_rgb=dict(packet['rgb'],calibration='cam-base-v2')",
          "assert (corrupt_rgb['shape'],corrupt_rgb['unit'],corrupt_rgb['frame'],corrupt_rgb['calibration']) != expected['rgb']",
          "print({k:(v['shape'],v['age_ms'],v['valid']) for k,v in packet.items()})",
        ),
        observe:
          "Every declared shape, unit, frame, calibration revision, timestamp, age, and validity flag is checked. Depth is stale, while the negative-age RGB is separately diagnosed as future-dated or in the wrong clock domain.",
        tryIt:
          "Move the joint capture 1 ms after the decision clock and require the same future/clock-domain failure before fusion; then change its unit and add a force-rail saturation flag.",
      },
      sourceKeys: ["probabilistic", "robotics"],
    }),
  ),
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "calibration-transforms",
      plain:
        "Calibration estimates the numeric relationship between sensor readings and physical frames, then records enough uncertainty and revision data to know when that relationship no longer holds.",
      precise:
        "Intrinsic calibration maps pixels to rays using focal lengths, principal point, and distortion; extrinsic calibration estimates rigid transform between camera and robot frames. Fit parameters from independent correspondences, reserve validation poses, report residuals in physical units, propagate uncertainty into downstream points, version the transform, and monitor drift with check targets.",
      mentalModel:
        "Calibration aligns two rulers and writes down both the mapping and how uncertain each mark remains.",
      ideas: [
        "Separate camera intrinsics from camera-to-robot extrinsics.",
        "Fit on one pose set and validate on held-out spatial coverage.",
        "Propagate transform uncertainty and trigger recalibration on drift.",
      ],
      worked:
        "Fit camera-to-base revision cam-base-v3 on 24 spatial correspondences: training residual is .002 m. Eight held-out edge/depth poses give root-mean-square error .004 m under a .006 m release gate, so v3 is accepted. After a camera bump the held-out error rises to .011 m, so the same revision is invalidated.",
      boundary:
        "Low reprojection error on narrow calibration poses can coexist with large 3-D or workspace-edge error and does not establish mechanical rigidity over time.",
      objectives: {
        primary: "Fit, validate, and version camera-to-robot calibration",
        decision: "Propagate calibration uncertainty into a spatial decision",
      },
      vocabulary: [
        {
          term: "Intrinsic calibration",
          meaning:
            "Camera parameters mapping 3-D rays to image pixels, including focal scale and lens distortion.",
        },
        {
          term: "Extrinsic calibration",
          meaning:
            "A rigid spatial transform between a sensor frame and another physical frame.",
        },
        {
          term: "Reprojection error",
          meaning:
            "Pixel distance between observed calibration points and points projected by fitted parameters.",
        },
        {
          term: "Root-mean-square error (RMSE)",
          meaning:
            "The square root of the average squared residual, reported here in physical units on held-out poses.",
        },
      ],
      primaryCheck: {
        prompt:
          "Revision cam-base-v3 has .002 m training residual and .004 m RMSE on eight held-out edge/depth poses under a .006 m gate. Is it releasable, and what happens if post-bump RMSE becomes .011 m?",
        expected:
          "The declared held-out coverage passes because .004 m is below .006 m, so v3 may be released for that operating domain. A post-bump .011 m exceeds the gate, invalidating v3 until recalibration or verification.",
        retry:
          "Separate fit and held-out pose rows, compare held-out physical-unit RMSE with the release gate, then bind the accept or invalidate decision to the revision ID.",
      },
      decision: {
        explanation:
          "Calibration uncertainty becomes decision evidence when it is propagated into thresholds rather than discarded after fitting.",
        mechanism:
          "Transform measurement mean and covariance through the calibrated mapping, combine independent uncertainty terms, declare a confidence multiplier before the decision, compare that interval with grasp/workspace clearance, and abstain or reobserve when the required margin crosses the available clearance.",
        workedExample:
          "A .42 m point with .006 m transform and .008 m measurement standard uncertainty has combined .010 m. Under the declared two-standard-uncertainty rule, the required clearance is .020 m; a grasp with only .012 m clearance to the nearest obstacle is therefore rejected pending re-observation.",
        boundary:
          "Root-sum-square assumes the stated errors are approximately independent and locally linear; shared bias can make the interval optimistic.",
        check: {
          prompt:
            "Independent translation and measurement standard uncertainties are .006 m and .008 m. With a predeclared multiplier k=2 and only .012 m obstacle clearance, what are the combined uncertainty, required clearance, and grasp decision?",
          expected:
            "Root-sum-square gives sqrt(.006²+.008²)=.010 m. The k=2 rule therefore requires .020 m clearance. Because .012 m is less than .020 m, reject the grasp and reobserve or recalibrate rather than discarding the multiplier.",
          retry:
            "Square the independent standard uncertainties, add, take the square root, multiply that .010 m result by k=2, and compare the resulting .020 m requirement with .012 m.",
        },
      },
      quiz: {
        question: "What does extrinsic calibration estimate?",
        options: [
          "The transform between physical frames",
          "Only image brightness",
          "Policy reward",
          "Action entropy",
        ],
        answer: 0,
        explanation:
          "Extrinsics locate and orient one sensor/body frame relative to another.",
      },
      transfer: {
        prompt:
          "Held-out calibration RMSE is .004 m before a camera bump and .008 m afterward; the predeclared release gate is .006 m. What should occur?",
        correct:
          "Invalidate the revision, stop dependent actions, and recalibrate or verify",
        wrong: ["Keep using the old transform silently", "Increase reward"],
        worked:
          "The post-bump .008 m RMSE exceeds the .006 m gate by .002 m, so the transform revision loses validity and dependent actions remain stopped until recalibration or a fresh held-out verification passes.",
        retry:
          "Compare the post-bump .008 m held-out RMSE directly with the .006 m gate, then bind that pass/fail result to the revision used by every dependent observation.",
      },
      lab: {
        title: "Calibration release gate",
        question:
          "Which evidence supports fitting, held-out validity, or recalibration?",
        controlLabel: "Calibration record",
        boundary:
          "Uncertainty arithmetic is illustrative and not a calibrated camera run.",
        cases: [
          {
            label: "center-only fit",
            resultLabel: "coverage",
            resultValue: "WEAK",
            meter: 80,
            detail:
              "Low fit residual does not test workspace edges or depth variation.",
          },
          {
            label: "held-out poses",
            resultLabel: "revision",
            resultValue: "ACCEPT",
            meter: 25,
            detail:
              "Independent spatial coverage passes physical-unit error gates.",
          },
          {
            label: "post-bump drift",
            resultLabel: "transform",
            resultValue: "INVALIDATE",
            meter: 100,
            detail:
              "Changed mounting breaks the released extrinsic relationship.",
          },
        ],
      },
      motionConcept: "coordinates",
      code: {
        title: "Fit, validate, version, and gate a calibration",
        language: "Python 3",
        setup:
          "A one-dimensional extrinsic fixture exposes fitting, held-out validation, revisioning, and a declared uncertainty margin.",
        predict:
          "Does cam-base-v3 pass held-out validation, and is .012 m clearance enough?",
        code: py(
          "import math",
          "train_camera=[0.,.2,.5,.8]; train_base=[.101,.299,.602,.899]",
          "offset=sum(b-c for b,c in zip(train_base,train_camera))/len(train_camera)",
          "held_camera=[.1,.4,.7]; held_base=[.201,.501,.801]",
          "residuals=[(c+offset)-b for c,b in zip(held_camera,held_base)]",
          "rmse=math.sqrt(sum(r*r for r in residuals)/len(residuals)); revision='cam-base-v3'; release_gate=.006",
          "combined=math.sqrt(.006**2+.008**2); confidence_k=2.; required_clearance=confidence_k*combined",
          "released=rmse<=release_gate; grasp_allowed=released and .012>=required_clearance",
          "print(revision,round(offset,5),round(rmse,5),released,round(required_clearance,3),grasp_allowed)",
          "assert released and not grasp_allowed",
        ),
        observe:
          "The fitted offset is about .10025 m, held-out RMSE is below .006 m, and v3 releases; the declared 2σ rule requires .020 m clearance, so .012 m is rejected.",
        tryIt:
          "Move one held-out base point by .011 m and confirm the same revision is invalidated before any grasp decision.",
      },
      sourceKeys: ["probabilistic"],
    }),
  ),
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "spatial-object-representations",
      plain:
        "A spatial representation turns sensor pixels and points into objects, geometry, relationships, and uncertainty that a controller can query.",
      precise:
        "Represent each entity with identity hypothesis, class/attributes, pose distribution in a named frame, extent/shape, timestamp, visibility, and relations such as inside, supported-by, or reachable. Scene graphs expose discrete relations; voxel/point fields expose occupancy; object slots expose entity-centric features. The action consumer determines needed invariances and resolution.",
      mentalModel:
        "Replace a photograph with a measured stage diagram: actors, poses, extents, relationships, and unknown regions are all explicit.",
      ideas: [
        "Choose representation from the control query, not visual novelty.",
        "Attach frame, time, extent, visibility, identity, and uncertainty to objects.",
        "Test permutation, occlusion, and relation changes without leaking simulator truth.",
      ],
      worked:
        "Cup center is [.40,.10] m with radius .04; gripper center [.34,.10] has point reach .05. Center distance .06 exceeds the point-only .05 threshold, but it passes the declared extent-aware contact threshold .05+.04=.09. The decision changes only because object extent and the contact rule are explicit.",
      boundary:
        "Object labels and scene relations are estimates; a crisp graph can hide occlusion, identity swaps, deformable geometry, or uncertainty between objects.",
      objectives: {
        primary: "Build a control-oriented object and scene representation",
        decision:
          "Test geometric relations, invariances, and representation failures",
      },
      vocabulary: [
        {
          term: "Scene graph",
          meaning:
            "A graph whose nodes represent entities and whose edges represent spatial or semantic relations.",
        },
        {
          term: "Occupancy",
          meaning:
            "A representation of which spatial regions are free, filled, or unknown.",
        },
        {
          term: "Object permanence",
          meaning:
            "Maintaining an identity hypothesis for an object while it is temporarily unobserved.",
        },
      ],
      primaryCheck: {
        prompt:
          "Which fields beyond class and center are needed to decide whether a partially occluded cup can be grasped?",
        expected:
          "Use pose uncertainty, extent/shape, frame, timestamp, visibility, identity, gripper geometry, and the exact reach/collision relation rather than class and center alone.",
        retry:
          "Write the action's geometric predicate, then list every object and body quantity it consumes.",
      },
      decision: {
        explanation:
          "Representation tests change one physical or indexing relationship and require the resulting decision to change for the right causal reason.",
        mechanism:
          "Permute object order, transform all poses consistently between frames, alter one relation or occlusion, preserve uncertainty, and compare reachable/collision/support predictions plus downstream action choice against reviewed fixture truth.",
        workedExample:
          "Swapping object array order must not change which ID is targeted; moving the blocker across the gripper path must change collision=true while leaving cup identity unchanged.",
        boundary:
          "Passing finite geometric fixtures does not prove perception on unseen objects, clutter, or deformable contacts.",
        check: {
          prompt:
            "Permuting two object rows changes the selected object even though IDs and geometry are unchanged. Which invariance failed?",
          expected:
            "The policy/representation depends on array position rather than entity identity or permutation-invariant aggregation, creating a spurious ordering dependency.",
          retry:
            "Apply the same permutation to all object fields and require the selected physical entity ID to remain unchanged.",
        },
      },
      quiz: {
        question: "What makes a representation control-oriented?",
        options: [
          "It answers action-relevant spatial queries with explicit frames and uncertainty",
          "It is visually attractive",
          "It stores only class names",
          "It removes timestamps",
        ],
        answer: 0,
        explanation:
          "A controller needs geometry and uncertainty tied to its decision predicates.",
      },
      transfer: {
        prompt: "Unknown space is encoded free. What risk appears?",
        correct: "The planner can route through unobserved occupied regions",
        wrong: ["No risk; unknown equals empty", "Only language changes"],
        worked:
          "Keep free, occupied, and unknown distinct and route uncertain paths through a declared policy.",
        retry: "Ask what direct sensor evidence established each free region.",
      },
      lab: {
        title: "Scene representation probe",
        question:
          "Which representation preserves identity, geometry, and unknown space under control queries?",
        controlLabel: "Scene case",
        boundary:
          "The geometric cases are fixed fixtures, not perception outputs.",
        cases: [
          {
            label: "center only",
            resultLabel: "grasp",
            resultValue: "AMBIGUOUS",
            meter: 75,
            detail:
              "Extent, uncertainty, and contact rule are missing from the relation.",
          },
          {
            label: "order permuted",
            resultLabel: "target ID",
            resultValue: "SAME",
            meter: 20,
            detail:
              "Entity identity and invariant aggregation preserve the physical target.",
          },
          {
            label: "unknown as free",
            resultLabel: "planning",
            resultValue: "UNSAFE",
            meter: 100,
            detail:
              "Missing evidence is converted into an unjustified collision-free claim.",
          },
        ],
      },
      motionConcept: "coordinates",
      code: {
        title: "Test a geometric reach predicate",
        language: "Python 3",
        setup: "A 2-D fixture includes object radius and gripper reach.",
        predict: "Does the gripper contact the cup extent?",
        code: py(
          "import math",
          "cup=(.40,.10); radius=.04",
          "gripper=(.34,.10); reach=.05",
          "center_distance=math.dist(cup,gripper)",
          "contact=center_distance<=reach+radius",
          "print(round(center_distance,2),contact)",
        ),
        observe:
          "Distance .06 lies within combined reach .09, so the declared extent-aware predicate passes.",
        tryIt: "Add pose uncertainty and an intervening obstacle segment.",
      },
      sourceKeys: ["probabilistic", "rt1"],
    }),
  ),
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "sensor-fusion-tracking",
      plain:
        "Sensor fusion combines complementary evidence over time while a tracker preserves object hypotheses, uncertainty, and identity through noise and dropout.",
      precise:
        "A filter predicts state and covariance through motion and applied action, then associates observations with tracks. Its innovation is $y=z-H\\hat x$: $z$ is the incoming measurement, $\\hat x$ is the predicted hidden state, and observation matrix $H$ maps that state into measurement coordinates. Innovation covariance is $S=HPH^T+R$, combining predicted covariance $P$ with measurement covariance $R$. A normalized gate uses squared Mahalanobis distance $d^2=y^TS^{-1}y$ against a predeclared threshold; a raw distance threshold is not uncertainty-scaled. Only accepted candidates may be ranked. If none passes, the track records a missed detection and performs prediction without correction; unmatched detections may start new tracks under a separate birth rule. Calibration, timestamp alignment, correlated errors, and identity assignment still bound the posterior.",
      mentalModel:
        "Each track is a hypothesis with an uncertainty bubble that motion expands and reliable observations shrink.",
      ideas: [
        "Predict before associating and correcting observations.",
        "Use uncertainty-scaled innovation gates rather than nearest point alone.",
        "Measure identity swaps, calibration, dropout recovery, and decision effects.",
      ],
      worked:
        "Prior x=.35/variance .03 plus applied +.05 motion and .01 process variance predicts x=.40/variance .04. In the scalar case $H=1$ with measurement variance .01, $S=.05$. Candidate detections .50 and .90 have innovations .10 and .50, so $d^2=.10^2/.05=.20$ and $.50^2/.05=5.00$. A declared one-dimensional 95% chi-square gate of 3.84 accepts .50 and rejects .90. Gain is .04/.05=.8, producing posterior mean .48 and variance .008. If both distances exceeded 3.84, the track would record a miss and remain at predicted .40/.04 rather than forcing an association.",
      boundary:
        "A filter can be confidently wrong when motion and sensor models share bias, association is incorrect, or reported covariance is uncalibrated.",
      objectives: {
        primary: "Compute a predict-associate-update tracking step",
        decision:
          "Evaluate fusion calibration, dropout recovery, and identity errors",
      },
      vocabulary: [
        {
          term: "Observation matrix H",
          meaning:
            "The mapping that predicts what a sensor should measure from the track's hidden state; it is 1 in this lesson's scalar position trace.",
        },
        {
          term: "Innovation",
          meaning:
            "The residual between an incoming measurement and its predicted value under the current track.",
        },
        {
          term: "Data association",
          meaning:
            "Assigning sensor detections to existing tracks, new objects, or clutter.",
        },
        {
          term: "Kalman gain",
          meaning:
            "A weight derived from predicted and measurement uncertainty that controls the correction size in a linear Gaussian filter.",
        },
        {
          term: "Negative log likelihood (NLL)",
          meaning:
            "The score $-\\log p(z)$ assigned to an observed measurement by the predicted distribution; lower is better, but only under a suitable probabilistic model.",
        },
      ],
      primaryCheck: {
        prompt:
          "Prior mean .35/variance .03 receives applied +.05 motion and .01 process variance. Measurement variance is .01, detections are .50 and .90, and the normalized gate is $d^2\\le3.84$. Trace prediction, innovation covariance, association, and update.",
        expected:
          "Prediction gives mean .40 and variance .04. With scalar H=1, innovation covariance is $S=.04+.01=.05$. Innovations .10 and .50 give squared Mahalanobis distances .20 and 5.00, so .50 is associated and .90 is rejected. Gain is .04/.05=.8; posterior mean is .48 and variance .008. If no candidate passed, prediction would continue without correction.",
        retry:
          "Apply action and process noise, compute $S=HPH^T+R$, divide each squared innovation by $S$, keep only candidates inside 3.84, and update only if that accepted set is nonempty.",
      },
      decision: {
        explanation:
          "Fusion quality includes whether uncertainty predicts errors and whether object identity survives changed observation sequences.",
        mechanism:
          "Run paired ground-truth fixtures with dropout, crossing tracks, outliers, and calibration shift. Report residual coverage; negative log likelihood, $-\\log p(z)$ (NLL), where lower means the predictive distribution assigned more probability to the observation; identity switches; recovery time; task decisions; and abstentions by slice.",
        workedExample:
          "On 10 held-out residuals, only 8 fall inside the declared two-standard-deviation interval: 80% coverage misses a 90% gate. Mean NLL also worsens from .20 to .60. Starting from posterior variance .008, three missed measurements add .010 process variance each, reaching .038; a fresh measurement with variance .010 updates it to about .00792. The tracker restores the old ID only after two consecutive accepted detections, so recovery is two fresh steps even though covariance tightens on the first.",
        boundary:
          "Good calibration or low NLL on simulated noise does not establish performance under physical occlusion, reflections, unmodeled correlation, or a misspecified probability family.",
        check: {
          prompt:
            "Ten held-out residuals have 8 inside the declared 2σ interval against a 9/10 gate; mean NLL changes from .20 to .60. Posterior variance starts at .008, three missed steps each add .010, and a fresh measurement has variance .010. Identity is restored only after two consecutive accepted detections. Compute the coverage, NLL change, pre-update and post-update variances, recovery time, and release decision.",
          expected:
            "Coverage is 8/10=80%, below the 90% gate, and mean NLL worsens by .40. Dropout expands variance to .008+3(.010)=.038. The fresh scalar update has gain .038/(.038+.010), leaving posterior variance about .00792. Identity recovery takes two accepted fresh detections. The calibration gate therefore fails even though uncertainty tightens after reacquisition; retain the two-step identity recovery and do not release on low RMSE alone.",
          retry:
            "Count interval hits, subtract the NLLs, add process variance once per missed step, apply $(1-K)P$ with $K=P/(P+R)$, then count consecutive accepted detections separately from the first covariance update.",
        },
      },
      quiz: {
        question:
          "What happens to covariance during prediction without measurement?",
        options: [
          "It generally grows from process uncertainty",
          "It always becomes zero",
          "It becomes an action",
          "It is deleted",
        ],
        answer: 0,
        explanation:
          "Unobserved evolution adds uncertainty even when the mean is propagated.",
      },
      transfer: {
        prompt:
          "Two sensors share the same calibration bias. Does fusion remove it?",
        correct:
          "No; correlated common bias can survive and make confidence optimistic",
        wrong: ["Yes, averaging guarantees truth", "Only track ID matters"],
        worked:
          "Model correlation or validate against an independent reference and keep common-mode risk explicit.",
        retry: "Ask whether the two error sources are actually independent.",
      },
      lab: {
        title: "Fusion and identity clinic",
        question:
          "How do measurement precision, dropout, and association affect a track?",
        controlLabel: "Tracking case",
        boundary:
          "The scalar Gaussian update and swap scenario are deterministic fixtures.",
        cases: [
          {
            label: "precise measurement",
            resultLabel: "mean/variance",
            resultValue: ".48 / .008",
            meter: 30,
            detail:
              "The lower-variance observation strongly corrects and tightens the track.",
          },
          {
            label: "three-step dropout",
            resultLabel: "uncertainty",
            resultValue: "GROWS",
            meter: 75,
            detail:
              "Motion propagates the mean while process noise expands covariance.",
          },
          {
            label: "crossing swap",
            resultLabel: "identity",
            resultValue: "FAIL",
            meter: 100,
            detail:
              "Low position error cannot compensate for the wrong persistent object ID.",
          },
        ],
      },
      motionConcept: "distribution",
      code: {
        title: "Trace normalized association, update, and no-match",
        language: "Python 3",
        setup:
          "A dependency-free scalar Kalman step derives the gate from innovation covariance rather than raw distance.",
        predict:
          "Which detection passes, and what happens if no candidate passes?",
        code: py(
          "mean,var=.35,.03; mean += .05; var += .01  # predict to .40/.04",
          "measurement_var=.01; S=var+measurement_var; gate_d2=3.84",
          "detections=[.50,.90]; candidates=[(z,(z-mean)**2/S) for z in detections]",
          "accepted=[item for item in candidates if item[1]<=gate_d2]",
          "if accepted:",
          "    measurement,d2=min(accepted,key=lambda item:item[1]); gain=var/S",
          "    mean += gain*(measurement-mean); var *= 1-gain; event='update'",
          "else: event='missed_detection'",
          "print(candidates,round(mean,3),round(var,3),event)",
          "assert candidates[0][1]<gate_d2<candidates[1][1] and event=='update'",
          "assert not [(z,(z-.40)**2/.05) for z in (1.0,1.2) if (z-.40)**2/.05<=gate_d2]",
          "inside_2sigma=[True]*8+[False]*2; coverage=sum(inside_2sigma)/len(inside_2sigma); coverage_gate=.90",
          "mean_nll_before,mean_nll_after=.20,.60; nll_change=mean_nll_after-mean_nll_before",
          "dropout_var=.008+3*.010; fresh_var=.010; reacquire_gain=dropout_var/(dropout_var+fresh_var)",
          "reacquired_var=(1-reacquire_gain)*dropout_var; accepted_fresh=[True,True]; recovery_steps=2 if all(accepted_fresh) else None",
          "release=coverage>=coverage_gate and nll_change<=0 and recovery_steps<=2",
          "assert coverage==.8 and abs(nll_change-.4)<1e-12 and abs(dropout_var-.038)<1e-12",
          "assert abs(reacquired_var-.007916666666666667)<1e-12 and recovery_steps==2 and not release",
        ),
        observe:
          "The .50 detection updates the track to .48/.008 and .90 is rejected. The changed audit then exposes 80% coverage, +.40 NLL, variance growth to .038 during dropout, shrinkage to about .00792 on fresh evidence, two-step identity recovery, and a failed release gate.",
        tryIt:
          "Change one interval miss to a hit and decide which other gate still blocks release; then make the second reacquisition detection fail and reset the consecutive-recovery counter.",
      },
      sourceKeys: ["probabilistic"],
    }),
  ),
  defineResearchLesson(
    m,
    embodiedSeed({
      id: "state-estimator-capstone",
      duration: 38,
      plain:
        "The state-estimator capstone builds a synchronized multimodal tracker whose state, covariance, identity, calibration, and recovery can be inspected under changed sensors.",
      precise:
        "Implement packet validation; transform each camera-frame position with $p_w=Rp_c+t$ and its covariance with $\\Sigma_w=R\\Sigma_cR^\\top$; then perform motion prediction, normalized association, measurement update, persistent object/scene output, validity and covariance propagation, checkpoint/replay, and evaluation against simulator truth that never enters the estimator. Acceptance covers hand updates, transform direction, anisotropic covariance rotation, future/stale packets, dropout, no-match outliers, crossing identities, calibration shift, and downstream control predicates.",
      mentalModel:
        "Build a glass-box perception instrument whose estimate and uncertainty can be challenged before it steers a policy.",
      ideas: [
        "Verify each transform and filter operation against hand-computable fixtures.",
        "Keep hidden simulator truth available only to the evaluator.",
        "Change one sensor or calibration factor and preserve failure/recovery evidence.",
      ],
      worked:
        "Baseline fuses camera and joints; treatment adds 80 ms camera delay at matched trajectories. Position error and identity switches rise, stale-packet gate holds action, and recovery time after fresh data is reported for every seed.",
      boundary:
        "A calibrated estimator in one simulator and noise suite does not establish physical perception, contact state, or general object understanding.",
      objectives: {
        primary: "Build and verify an end-to-end multimodal state estimator",
        decision:
          "Run a controlled changed-sensor estimation and recovery study",
      },
      vocabulary: [
        {
          term: "Ground-truth channel",
          meaning:
            "Privileged simulator state reserved for evaluation and never supplied to the policy or estimator.",
        },
        {
          term: "Recovery time",
          meaning:
            "Steps or seconds after a disturbance until declared estimation and decision gates pass again.",
        },
        {
          term: "Calibration curve",
          meaning:
            "A comparison between predicted uncertainty levels and observed error frequencies.",
        },
      ],
      primaryCheck: {
        prompt:
          "A 90-degree camera-to-world rotation receives camera covariance diag(.04,.01). What world covariance must the estimator use, and where may hidden simulator truth appear?",
        expected:
          "Apply $R\\Sigma R^\\top$, which swaps the anisotropic axes to world covariance diag(.01,.04); translating the point does not change covariance. Hidden truth may join only after estimation in the evaluator for error, calibration, identity, and recovery checks, never as an estimator or policy input.",
        retry:
          "Write the mean and covariance transform separately, multiply the 2-by-2 matrices, then draw estimator-input and evaluator-only interfaces and list which truth fields cross neither control boundary.",
      },
      decision: {
        explanation:
          "A changed-sensor study isolates one degradation and asks whether uncertainty, control gates, and recovery respond before task failure.",
        mechanism:
          "Replay paired trajectories, change one delay/noise/dropout/calibration factor, hold estimator revision and seeds fixed, report error/calibration/identity/validity, downstream decisions, abstention, and time to recover after evidence returns.",
        workedExample:
          "Adding 80 ms camera delay increases median error from fixture .01 to .07 m; the age gate abstains, then the tracker returns below .02 m three fresh packets later without deleting the failure rows.",
        boundary:
          "One injected failure cannot enumerate unknown correlations, hardware faults, or simulator-to-real perception gaps.",
        check: {
          prompt:
            "Treatment changes camera delay and measurement noise simultaneously. Can increased recovery time be attributed to latency?",
          expected:
            "No. The intervention is confounded; restore noise or run a factorial comparison, then preserve per-seed validity, error, and recovery traces.",
          retry:
            "Diff the complete packet and estimator manifests and permit only the predeclared sensor change.",
        },
      },
      quiz: {
        question: "What evidence makes estimator uncertainty useful?",
        options: [
          "Calibration against actual errors and decisions",
          "Its numeric precision alone",
          "A lower training loss only",
          "A larger covariance always",
        ],
        answer: 0,
        explanation:
          "Uncertainty must correspond to observed errors and support a declared action or abstention rule.",
      },
      transfer: {
        prompt:
          "Estimator RMSE improves but wrong-object grasps rise. What follows?",
        correct:
          "Identity/task evidence fails despite lower average position error",
        wrong: ["Accept because RMSE dominates", "Delete identity metrics"],
        worked:
          "Apply identity and downstream task gates before treating aggregate spatial error as improvement.",
        retry:
          "Join each estimate to the physical object identity and selected action.",
      },
      lab: {
        title: "Estimator evidence gate",
        question:
          "Which artifact proves arithmetic, exposes changed-sensor recovery, or overclaims transfer?",
        controlLabel: "Estimator artifact",
        boundary:
          "The gate classifies simulator evidence and does not validate hardware.",
        cases: [
          {
            label: "hand-update tests",
            resultLabel: "evidence",
            resultValue: "LOCAL INVARIANT",
            meter: 20,
            detail:
              "Transforms and covariance arithmetic match inspectable fixtures.",
          },
          {
            label: "80 ms delay",
            resultLabel: "evidence",
            resultValue: "CHANGED SENSOR",
            meter: 65,
            detail:
              "Paired error, abstention, identity, and recovery rows support a bounded conclusion.",
          },
          {
            label: "real perception",
            resultLabel: "claim",
            resultValue: "OVERREACH",
            meter: 100,
            detail:
              "Simulator noise and objects cannot establish physical perception robustness.",
          },
        ],
      },
      motionConcept: "evaluation",
      code: {
        title: "Rotate estimator covariance and measure recovery",
        language: "Python 3",
        setup:
          "A dependency-free fixture applies one 90-degree camera-to-world transform to both mean and anisotropic covariance, then joins evaluator-only errors after estimation.",
        predict:
          "Which covariance axis becomes large in world coordinates, and how many fresh packets satisfy the error gate?",
        code: py(
          "def matmul(a,b): return [[sum(a[i][k]*b[k][j] for k in range(len(b))) for j in range(len(b[0]))] for i in range(len(a))]",
          "def transpose(a): return list(map(list,zip(*a)))",
          "R=[[0.,-1.],[1.,0.]]; translation=[.1,.2]",
          "camera_point=[[.3],[.1]]; camera_cov=[[.04,0.],[0.,.01]]",
          "rotated=matmul(R,camera_point); world_point=[rotated[i][0]+translation[i] for i in range(2)]",
          "world_cov=matmul(matmul(R,camera_cov),transpose(R))",
          "assert world_point==[0.,.5] and world_cov==[[.01,0.],[0.,.04]]",
          "errors_after_fresh=[.07,.04,.018,.012]",
          "gate=.02",
          "recovery=next(i+1 for i,e in enumerate(errors_after_fresh) if e<=gate)",
          "evaluator_only={'truth_position':[0.,.5],'errors_m':errors_after_fresh}",
          "print(world_point,world_cov,recovery,evaluator_only)",
          "assert recovery==3",
        ),
        observe:
          "The 90-degree rotation maps camera variance diag(.04,.01) to world variance diag(.01,.04), and the evaluator-only error trace passes the recovery gate on the third fresh packet.",
        tryIt:
          "Add a nonzero off-diagonal covariance and require both position and persistent-identity gates before recovery.",
      },
      sourceKeys: ["probabilistic", "robotics"],
    }),
  ),
];
