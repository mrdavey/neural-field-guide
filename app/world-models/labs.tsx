"use client";

import { useMemo, useState } from "react";
import {
  ActivityInfo,
  LearningActivityContract,
  PredictionGate,
} from "../activity-info";
import type { Lesson } from "../course-data";
import { MathText } from "../math-text";
import { MotionSurface } from "../motion/motion-surface";
import { worldModelLessonLabSpecs } from "./lesson-lab-specs";

export type WorldModelLabType = Extract<
  NonNullable<Lesson["lab"]>,
  `wm-${string}`
>;

const labCopy: Record<
  WorldModelLabType,
  {
    title: string;
    question: string;
    change: string;
    observe: string;
    explain: string;
    complete: string;
    boundary: string;
  }
> = {
  "wm-state": {
    title: "Controlled-state trace",
    question: "How does an action change the next-state distribution?",
    change: "Change the signed action applied to the same scalar state.",
    observe:
      "The predicted mean moves with action while the uncertainty band remains visible.",
    explain:
      "The transition conditions on state and action; the fixture uses $z_{t+1}=0.8z_t+0.6a_t$.",
    complete:
      "Predict the sign of the next-state change before moving the control, then test both action directions.",
    boundary:
      "This deterministic browser fixture demonstrates a transition contract; it is not a learned or measured physical system.",
  },
  "wm-belief": {
    title: "Belief-update bench",
    question: "How does new evidence redistribute belief over hidden state?",
    change:
      "Change the likelihood that the observation would occur in hidden state A.",
    observe:
      "The normalized posterior moves away from the fixed prior according to relative likelihood.",
    explain:
      "Bayes filtering multiplies prior mass by observation likelihood, then normalizes across alternatives.",
    complete:
      "Find one likelihood that raises belief in A above 75% and explain the normalization.",
    boundary:
      "The two-state likelihoods are teaching fixtures; real filtering also predicts through dynamics and must calibrate observation models.",
  },
  "wm-latent": {
    title: "Latent bottleneck",
    question: "What does a narrower representation force the model to discard?",
    change:
      "Change latent width for a fixed observation with 128 input features.",
    observe:
      "Compression increases as width shrinks, while the retained-detail indicator falls.",
    explain:
      "A capacity bottleneck can encourage reusable structure but does not know which small features matter for control.",
    complete:
      "Compare widths 16 and 96, then name one control-relevant detail a pixel-dominated loss might lose.",
    boundary:
      "The retained-detail score is illustrative, not a measured reconstruction or planning result.",
  },
  "wm-rollout": {
    title: "Rollout drift tracer",
    question: "How can small transition bias change a long imagined future?",
    change: "Change rollout horizon while holding signed per-step bias fixed.",
    observe:
      "The approximate drift grows with repeated composition and the evidence label moves farther from observation.",
    explain:
      "Free-running predictions become inputs to later predictions, so systematic residuals accumulate.",
    complete:
      "Find the first horizon whose approximate drift exceeds 0.5 and state why feedback could change the result.",
    boundary:
      "Linear drift assumes near-unit sensitivity; nonlinear dynamics can amplify, cancel, or redirect error.",
  },
  "wm-planner": {
    title: "Planner budget desk",
    question:
      "How do search breadth and horizon consume model-transition budget?",
    change: "Change the number of candidate sequences.",
    observe:
      "Total model transitions and an illustrative exploit-pressure indicator increase together.",
    explain:
      "Each candidate requires one model transition per horizon step; stronger optimization can also select more extreme model errors.",
    complete:
      "Keep the horizon at 8 and find the largest population under 1,000 model transitions.",
    boundary:
      "The exploit-pressure indicator is a deterministic teaching signal, not an empirical failure probability.",
  },
  "wm-video": {
    title: "Video-token budget",
    question:
      "How do spatial patches and temporal stride determine a video model's token load?",
    change:
      "Change temporal stride for a fixed 16-frame, $64\\times64$ clip with $8\\times8$ patches.",
    observe: "Encoded time steps and total tokens fall as stride rises.",
    explain:
      "Spatial tokens equal $(64/8)^2=64$ per anchor; this fixture keeps zero-based anchors $0,s,2s,\\ldots<T$, so the temporal count is $\\lceil T/s\\rceil$ even when $s$ does not divide $T$.",
    complete:
      "Produce exactly 256 tokens, explain which temporal information was skipped, and predict the anchors for 10 frames at stride 4.",
    boundary:
      "This fixture drops non-anchor frames rather than padding a final tube. Token count estimates the interface, not model accuracy, compression quality, or actual latency.",
  },
  "wm-uncertainty": {
    title: "Ensemble disagreement gate",
    question: "When should disagreement change a planner's authority?",
    change: "Change the spread between three model predictions.",
    observe:
      "The disagreement score crosses a fixed review threshold while their mean can stay plausible.",
    explain:
      "Diverse model predictions can expose limited knowledge, but shared bias can produce confident agreement.",
    complete:
      "Trigger review once, then explain why a below-threshold plan can still be unsafe outside data support.",
    boundary:
      "This spread is illustrative and is not a calibrated probability of failure.",
  },
  "wm-safety": {
    title: "Constraint and fallback gate",
    question: "Why must feasibility be checked before reward ranking?",
    change:
      "Change a candidate's estimated violation probability under a fixed chance limit of 0.05.",
    observe:
      "Authority routes from nominal execution to fallback as soon as the limit is crossed.",
    explain:
      "A chance constraint filters feasibility; task reward may rank only the candidates that pass a calibrated gate.",
    complete:
      "Test values just below and above 0.05 and name the fallback authority.",
    boundary:
      "The probability is supplied by a fixture. A real chance constraint needs calibration and an operational-domain contract.",
  },
  "wm-evaluation": {
    title: "Evaluation slice mixer",
    question: "Which failure can an aggregate metric hide?",
    change:
      "Change performance on a rare safety-critical slice while common-case performance stays fixed.",
    observe:
      "The aggregate remains high even as the critical-slice gate fails.",
    explain:
      "Frequency-weighted averages can hide low-frequency failures whose consequence dominates a deployment decision.",
    complete:
      "Create an aggregate above 90% while the critical slice stays below its 80% gate.",
    boundary:
      "These counts demonstrate aggregation; they are not benchmark or deployment measurements.",
  },
};

export function WorldModelLab({
  type,
  lesson,
}: {
  type: WorldModelLabType;
  lesson: Lesson;
}) {
  const lessonSpec = worldModelLessonLabSpecs[lesson.id];
  const copy = lessonSpec ?? labCopy[type];
  const fallbackInitial =
    type === "wm-state"
      ? 0
      : type === "wm-belief"
        ? 60
        : type === "wm-latent"
          ? 64
          : type === "wm-rollout"
            ? 5
            : type === "wm-planner"
              ? 64
              : type === "wm-video"
                ? 2
                : type === "wm-uncertainty"
                  ? 20
                  : type === "wm-safety"
                    ? 4
                    : 50;
  const [value, setValue] = useState(
    lessonSpec?.control.initial ?? fallbackInitial,
  );
  const fallbackResult = useMemo(() => calculate(type, value), [type, value]);
  const result = lessonSpec?.evaluate(value) ?? fallbackResult;
  const control = lessonSpec?.control ?? {
    label: fallbackResult.controlLabel,
    min: fallbackResult.min,
    max: fallbackResult.max,
    step: fallbackResult.step,
    initial: fallbackInitial,
  };

  return (
    <section
      className="lab-shell world-model-lab"
      data-lab={type}
      data-lesson-lab={lesson.id}
    >
      <div className="lab-intro">
        <div>
          <span className="eyebrow">
            Interactive lab · deterministic simulation
          </span>
          <h2>
            <MathText>{copy.title}</MathText>
          </h2>
          <ActivityInfo mode="simulated" />
        </div>
      </div>
      <LearningActivityContract
        question={<MathText>{copy.question}</MathText>}
        action={<MathText>{copy.change}</MathText>}
        observe="Compare contrasting control values and track the first result label, value, or meter state that changes."
        explain="After testing, connect the changed input to the readout through the lesson's transition, inference, planning, or evaluation mechanism."
        complete={<MathText>{copy.complete}</MathText>}
        boundary={<MathText>{copy.boundary}</MathText>}
      />
      <PredictionGate
        title="Explain the result"
        prompt="What changed when you moved the control, and which mechanism connects that input to the readout?"
        placeholder="Explain the change you observed and the mechanism that caused it…"
        commitLabel="Compare with the mechanism"
        reviseLabel="Revise explanation"
        responseLabel="Your explanation"
        preview={
          <MotionSurface kind={type} stateKey={`${value}:${result.meter}`}>
            <div
              className="lab-instrument wm-lab-instrument"
              data-visual-control={value}
              data-visual-meter={result.meter}
            >
              {control.choices ? (
                <fieldset className="wm-lab-choices">
                  <legend>
                    <MathText>{control.label}</MathText>
                  </legend>
                  <div>
                    {control.choices.map((choice, index) => (
                      <button
                        type="button"
                        className={Math.round(value) === index ? "active" : ""}
                        aria-pressed={Math.round(value) === index}
                        key={choice}
                        onClick={() => setValue(index)}
                      >
                        <MathText>{choice}</MathText>
                      </button>
                    ))}
                  </div>
                </fieldset>
              ) : (
                <>
                  <label htmlFor={`${lesson.id}-control`}>
                    <span>
                      <MathText>{control.label}</MathText>
                    </span>
                    <strong>{result.controlValue}</strong>
                  </label>
                  <input
                    id={`${lesson.id}-control`}
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={value}
                    onInput={(event) =>
                      setValue(Number(event.currentTarget.value))
                    }
                  />
                </>
              )}
              <div className="wm-lab-readout" aria-live="polite">
                <span>
                  <MathText>{result.resultLabel}</MathText>
                </span>
                <strong>
                  <MathText>{result.resultValue}</MathText>
                </strong>
                <meter min={0} max={100} value={result.meter} />
              </div>
              {"detail" in result && (
                <p className="wm-lab-detail" aria-live="polite">
                  <MathText>{result.detail}</MathText>
                </p>
              )}
            </div>
          </MotionSurface>
        }
      >
        <div className="lab-observation-guide">
          <span>Mechanism</span>
          <p>
            <MathText>{`${copy.observe} ${copy.explain}`}</MathText>
          </p>
        </div>
      </PredictionGate>
    </section>
  );
}

function calculate(type: WorldModelLabType, value: number) {
  switch (type) {
    case "wm-state": {
      const next = 0.8 * 2 + 0.6 * value;
      return {
        min: -2,
        max: 2,
        step: 0.25,
        controlLabel: "Action $a_t$",
        controlValue: value.toFixed(2),
        resultLabel: "Predicted mean $z_{t+1}$",
        resultValue: next.toFixed(2),
        meter: ((next + 1.2) / 4.8) * 100,
      };
    }
    case "wm-belief": {
      const likelihoodA = value / 100;
      const posterior = (0.5 * likelihoodA) / (0.5 * likelihoodA + 0.5 * 0.25);
      return {
        min: 5,
        max: 95,
        step: 5,
        controlLabel: "$P(o\\mid A)$",
        controlValue: likelihoodA.toFixed(2),
        resultLabel: "Posterior $P(A\\mid o)$",
        resultValue: `${Math.round(posterior * 100)}%`,
        meter: posterior * 100,
      };
    }
    case "wm-latent": {
      const detail = Math.min(100, 25 + value * 0.7);
      return {
        min: 8,
        max: 128,
        step: 8,
        controlLabel: "Latent width",
        controlValue: String(value),
        resultLabel: "Illustrative retained-detail index",
        resultValue: `${Math.round(detail)} / 100`,
        meter: detail,
      };
    }
    case "wm-rollout": {
      const drift = value * 0.08;
      return {
        min: 1,
        max: 20,
        step: 1,
        controlLabel: "Free-running horizon",
        controlValue: `${value} steps`,
        resultLabel: "Approximate signed drift",
        resultValue: `+${drift.toFixed(2)}`,
        meter: Math.min(100, (drift / 1.6) * 100),
      };
    }
    case "wm-planner": {
      const transitions = value * 8;
      return {
        min: 8,
        max: 256,
        step: 8,
        controlLabel: "Candidate sequences",
        controlValue: String(value),
        resultLabel: "Model-transition budget",
        resultValue: `${transitions}`,
        meter: Math.min(100, (transitions / 2048) * 100),
      };
    }
    case "wm-video": {
      const steps = Math.ceil(16 / value);
      const tokens = steps * 64;
      return {
        min: 1,
        max: 8,
        step: 1,
        controlLabel: "Temporal stride",
        controlValue: String(value),
        resultLabel: "Visual tokens",
        resultValue: `${steps} × 64 = ${tokens}`,
        meter: Math.min(100, (tokens / 1024) * 100),
      };
    }
    case "wm-uncertainty": {
      const spread = value / 100;
      return {
        min: 0,
        max: 60,
        step: 2,
        controlLabel: "Prediction spread",
        controlValue: spread.toFixed(2),
        resultLabel: "Authority",
        resultValue:
          spread > 0.25 ? "REVIEW / FALLBACK" : "NOMINAL, WITH SUPPORT CHECK",
        meter: Math.min(100, (spread / 0.6) * 100),
      };
    }
    case "wm-safety": {
      const risk = value / 100;
      return {
        min: 0,
        max: 12,
        step: 1,
        controlLabel: "Estimated violation probability",
        controlValue: risk.toFixed(2),
        resultLabel: "Constraint route",
        resultValue: risk < 0.05 ? "FEASIBLE" : "FALLBACK",
        meter: Math.min(100, (risk / 0.12) * 100),
      };
    }
    case "wm-evaluation": {
      const critical = value;
      const aggregate = (900 * 0.95 + (100 * critical) / 100) / 10;
      return {
        min: 20,
        max: 100,
        step: 5,
        controlLabel: "Critical-slice accuracy",
        controlValue: `${value}%`,
        resultLabel: "Overall accuracy / critical gate",
        resultValue: `${aggregate.toFixed(1)}% / ${critical >= 80 ? "PASS" : "FAIL"}`,
        meter: aggregate,
      };
    }
  }
}
