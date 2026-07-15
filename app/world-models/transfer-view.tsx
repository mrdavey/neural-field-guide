"use client";

import { useState } from "react";
import { ActivityInfo } from "../activity-info";
import { MathText } from "../math-text";
import type { WorldModelTransfer } from "./types";

export function WorldModelTransferView({ lessonId, transfer }: { lessonId: string; transfer: WorldModelTransfer }) {
  const [prediction, setPrediction] = useState("");
  const [committed, setCommitted] = useState(false);
  const [choice, setChoice] = useState<number>();
  const attempted = choice !== undefined;

  return <section className="lesson-evidence world-model-transfer" aria-labelledby={`${lessonId}-transfer-title`}>
    <header><span className="eyebrow">Test · changed-case transfer</span><h2 id={`${lessonId}-transfer-title`}>Commit your mechanism, then test it on a new case.</h2><p>The option check is deterministic and local. Your written prediction is guided comparison, not machine-graded prose.</p><ActivityInfo mode="checked" /></header>
    <div className="prediction-commit"><label><span>Your prediction</span><small><MathText>{transfer.prompt}</MathText></small><textarea rows={4} value={prediction} disabled={committed} onChange={(event) => setPrediction(event.target.value)} placeholder="Choose a result and explain the causal mechanism…" /></label>{committed ? <button onClick={() => { setCommitted(false); setChoice(undefined); }}>Revise prediction</button> : <button disabled={prediction.trim().length < 18} onClick={() => setCommitted(true)}>Commit before options</button>}</div>
    {committed && <div className="quiz-card"><p className="quiz-question"><MathText>{transfer.prompt}</MathText></p><div className="quiz-options">{transfer.options.map((option, index) => {
      const state = attempted ? index === transfer.answer ? "correct" : index === choice ? "incorrect" : "muted" : "";
      return <button key={option.text} disabled={attempted} className={state} onClick={() => setChoice(index)}><span>{String.fromCharCode(65 + index)}</span><MathText>{option.text}</MathText></button>;
    })}</div>{attempted && <div className={`quiz-feedback ${choice === transfer.answer ? "success" : "retry"}`} role="status"><strong>{choice === transfer.answer ? "The mechanism transfers." : "That route breaks on this case."}</strong><p><MathText>{transfer.options[choice].feedback}</MathText></p><p><strong>Worked reasoning:</strong> <MathText>{transfer.worked}</MathText></p>{choice !== transfer.answer && <p><strong>Retry route:</strong> <MathText>{transfer.retry}</MathText></p>}<button onClick={() => setChoice(undefined)}>Try another option</button></div>}</div>}
  </section>;
}

