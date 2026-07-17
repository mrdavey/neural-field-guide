"use client";

import { useState } from "react";
import type { Lesson } from "./course-data";
import { lessonEvidence } from "./lesson-evidence";
import { lessonTransferChecks } from "./lesson-transfer-checks";
import { lessonTransferDistractors } from "./lesson-transfer-distractors";
import { MathText } from "./math-text";
import { ActivityInfo } from "./activity-info";

export function LessonEvidenceView({ lesson }: { lesson: Lesson }) {
  const evidence = lessonEvidence[lesson.id];
  const [draft, setDraft] = useState("");
  const [committed, setCommitted] = useState(false);
  const [diagnosticChoice, setDiagnosticChoice] = useState<number>();
  const [structuredChoices, setStructuredChoices] = useState<Array<string | undefined>>([undefined, undefined, undefined]);
  const [structuredAttempted, setStructuredAttempted] = useState(false);

  if (!evidence) return null;

  const diagnosticOptions = [
    { text: evidence.contrast.principle, correct: true },
    { text: `Because ${evidence.contrast.left.label} succeeds, the same mechanism is sufficient in every setting; the second outcome needs no extra boundary.`, correct: false },
    { text: `The outcomes differ only because “${evidence.contrast.right.label}” uses different surface wording; inputs, authority, and system assumptions are unchanged.`, correct: false },
  ].sort((a, b) => ((lesson.number * 17 + a.text.length) % 11) - ((lesson.number * 17 + b.text.length) % 11));
  const diagnosticPassed = diagnosticChoice !== undefined && diagnosticOptions[diagnosticChoice].correct;
  const transferRules = lessonTransferChecks[lesson.id];
  const answerOptions = transferRules.map((item, index) => [
    { id: "correct", text: item.correction },
    { id: "misconception-a", text: lessonTransferDistractors[lesson.id][index][0] },
    { id: "misconception-b", text: lessonTransferDistractors[lesson.id][index][1] },
  ].sort((a, b) => ((lesson.number * 13 + index * 7 + a.text.length) % 17) - ((lesson.number * 13 + index * 7 + b.text.length) % 17)));
  const structuredResults = transferRules.map((_, index) => structuredChoices[index] === "correct");
  const firstFailed = structuredResults.findIndex((result) => !result);
  const transferPassed = structuredAttempted && structuredResults.length === 3 && structuredResults.every(Boolean);
  const passed = diagnosticPassed && transferPassed;
  const revise = () => {
    setCommitted(false);
    setStructuredChoices([undefined, undefined, undefined]);
    setStructuredAttempted(false);
  };

  return <section className="lesson-evidence-lab" aria-labelledby={`evidence-title-${lesson.id}`}>
    <header className="evidence-lab-header">
      <div><span className="eyebrow">Evidence & transfer lab</span><h2 id={`evidence-title-${lesson.id}`}>Test the chapter’s mechanism at its boundary.</h2><ActivityInfo mode="checked" title="Three decisions are checked locally" detail="Write your explanation first. The page then checks the boundary diagnosis and three lesson-specific decisions, gives first-error feedback, and unlocks the worked solution only after the decisions pass." /></div>
      <p>The explanation, worked trace, and practice above established the mechanism. Now hold it fixed while one assumption changes, then decide whether your original conclusion survives.</p>
    </header>

    <section className="authentic-contrast" aria-labelledby={`contrast-title-${lesson.id}`}>
      <header><span className="eyebrow">Boundary-case comparison</span><h3 id={`contrast-title-${lesson.id}`}><MathText>{evidence.contrast.title}</MathText></h3><p>Hold the central mechanism in mind and identify the one assumption that changes the result.</p></header>
      <div className="contrast-cases">
        {[evidence.contrast.left, evidence.contrast.right].map((item, index) => <article key={item.label}>
          <span>CASE {index === 0 ? "A" : "B"}</span><h4><MathText>{item.label}</MathText></h4><p><MathText>{item.situation}</MathText></p><div><b>Observed outcome</b><MathText>{item.outcome}</MathText></div>
        </article>)}
      </div>
      <div className="contrast-principle"><span>PAUSE BEFORE THE OPTIONS</span><p>Name the one changed assumption that could explain both observed outcomes. Keep that prediction in mind; the causal principle remains hidden until your diagnosis passes.</p></div>
    </section>

    <section className="diagnostic-decision" aria-labelledby={`diagnostic-${lesson.id}`}>
      <header><span className="eyebrow">Automatically checked diagnosis</span><h3 id={`diagnostic-${lesson.id}`}>Which explanation survives both cases?</h3><p>Choose the causal principle, not the option that merely sounds fluent. A wrong answer identifies the assumption to revisit before transfer can pass.</p></header>
      <div>{diagnosticOptions.map((option, index) => <button key={option.text} className={diagnosticChoice === index ? option.correct ? "selected correct" : "selected incorrect" : ""} onClick={() => setDiagnosticChoice(index)} disabled={diagnosticPassed}><span>{String.fromCharCode(65 + index)}</span><MathText>{option.text}</MathText></button>)}</div>
      {diagnosticChoice !== undefined && <div className={`diagnostic-feedback ${diagnosticPassed ? "pass" : "retry"}`} role="status"><strong>{diagnosticPassed ? "Mechanism diagnosis passed." : "That explanation fails Case B."}</strong><p><MathText>{diagnosticPassed ? `Correct principle: ${evidence.contrast.principle} This accounts for both “${evidence.contrast.left.label}” and “${evidence.contrast.right.label}” without erasing their boundary.` : `Reinspect “${evidence.contrast.right.label}”: ${evidence.contrast.right.outcome} The selected explanation ignores that changed assumption. Choose again.`}</MathText></p>{!diagnosticPassed && <button onClick={() => setDiagnosticChoice(undefined)}>Correct the diagnosis</button>}</div>}
    </section>

    <section className="assessed-transfer" aria-labelledby={`transfer-title-${lesson.id}`}>
      <header><div><span className="eyebrow">Assessed transfer</span><h3 id={`transfer-title-${lesson.id}`}>Apply the mechanism in an unfamiliar case.</h3></div><span className={`mastery-status ${passed ? "passed" : ""}`}>{passed ? "✓ Transfer passed" : !diagnosticPassed ? "Boundary diagnosis required" : "Structured transfer required"}</span></header>
      <p className="transfer-prompt"><MathText>{evidence.transfer.prompt}</MathText></p>
      <label className="transfer-draft"><span>Your decision, calculation, or design</span><textarea rows={7} value={draft} disabled={committed} onChange={(event) => setDraft(event.target.value)} placeholder="Commit to an answer and explain the causal mechanism. A correct conclusion without a reason does not pass." /></label>
      {!committed ? <button className="commit-transfer" disabled={draft.trim().length < 24} onClick={() => setCommitted(true)}>Commit answer and check transfer</button> : <div className="transfer-feedback">
        <section className="transfer-structured-check" aria-labelledby={`transfer-check-${lesson.id}`}>
          <div><span>OBJECTIVELY CHECKED DECISIONS</span><h4 id={`transfer-check-${lesson.id}`}>Resolve three independent decisions.</h4><p>Your original explanation is locked for comparison. Each field has its own causal or quantitative answer and two explicit misconceptions. Select the claim that preserves the required quantities, roles, formula, evidence boundary, and decision polarity.</p></div>
          <div className="structured-transfer-fields">{transferRules.map((item, index) => <fieldset key={item.label}><legend>{String(index + 1).padStart(2, "0")} · {item.label}</legend><small><MathText>{item.prompt}</MathText></small><div>{answerOptions[index].map((option) => <label key={option.id} className={structuredChoices[index] === option.id ? "selected" : ""}><input type="radio" name={`transfer-${lesson.id}-${index}`} value={option.id} checked={structuredChoices[index] === option.id} disabled={transferPassed} onChange={() => { setStructuredChoices((current) => current.map((choice, choiceIndex) => choiceIndex === index ? option.id : choice)); setStructuredAttempted(false); }} /><MathText>{option.text}</MathText></label>)}</div></fieldset>)}</div>
          <button className="check-structured-transfer" disabled={structuredChoices.some((choice) => choice === undefined)} onClick={() => setStructuredAttempted(true)}>{structuredAttempted && !transferPassed ? "Check corrected decisions" : "Check the three decisions"}</button>
          {structuredAttempted && <div className={`transfer-choice-feedback ${transferPassed ? "pass" : "retry"}`} role="status"><strong>{transferPassed ? "Structured transfer passed." : `Field ${firstFailed + 1} needs correction.`}</strong><p><MathText>{transferPassed ? "All three component-specific rules passed. The worked solution is now available for comparison." : transferRules[firstFailed].correction}</MathText></p></div>}
        </section>
        {transferPassed && <><div className="worked-transfer"><span>WORKED SOLUTION</span><p><MathText>{evidence.transfer.solution}</MathText></p></div>
          <div className={`transfer-diagnosis ${passed ? "pass" : "retry"}`} role="status"><strong>{passed ? "Transfer decision checkpoint passed." : "Boundary diagnosis required."}</strong><p>{passed ? "The boundary diagnosis and all three task-specific decisions passed. Compare the worked solution with your locked response, then explain the reasoning aloud." : "Correct the automatically checked boundary diagnosis above; the transfer decisions are already verified."}</p></div></>}
        <button onClick={revise}>{passed ? "Try a stronger explanation" : "Revise and retry"}</button>
      </div>}
    </section>
  </section>;
}
