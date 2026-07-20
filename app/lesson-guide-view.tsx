"use client";

import { useState, type ReactNode } from "react";
import type { LessonGuide, ObjectiveCoverage } from "./lesson-guides";
import { lessonCodeExamples, type LessonCodeExample } from "./code-examples";
import { lessonObjectiveCoverage } from "./lesson-objective-coverage";
import { MathText } from "./math-text";
import { ActivityInfo, codeActivityGuidance, type CodeGuidance } from "./activity-info";
import { MotionReveal } from "./motion/motion-reveal";

type LessonNarrativeViewProps = {
  guide: LessonGuide;
  lessonId: string;
  lessonTitle: string;
  simple: string;
  priorKnowledge: ReactNode;
  nextUse: ReactNode;
};

function headingPhrase(value: string) {
  return value.trim().replace(/[.!?]+$/, "");
}

export function LessonNarrativeView({ guide, lessonId, lessonTitle, simple, priorKnowledge, nextUse }: LessonNarrativeViewProps) {
  const [opening, ...chapters] = guide.sections;
  if (!opening) throw new Error(`Missing narrative sections for ${lessonId}`);

  return <section className="lesson-narrative" data-surface-tier="narrative" aria-labelledby={`${lessonId}-narrative-title`}>
    <header className="lesson-narrative-opening">
      <span className="eyebrow">Learn · one connected explanation</span>
      <h2 id={`${lessonId}-narrative-title`}><MathText>{opening.title}</MathText></h2>
      <p className="lesson-narrative-lede"><MathText>{simple}</MathText></p>
      <aside className="lesson-narrative-context">
        <div><strong>Where this chapter begins</strong>{priorKnowledge}</div>
        <div><strong>Where the idea leads</strong>{nextUse}</div>
      </aside>
    </header>

    <section className="lesson-vocabulary" id="lesson-phase-learn" data-lesson-phase="learn" data-surface-tier="support" aria-labelledby={`${lessonId}-vocabulary-title`}>
      <div><span className="eyebrow">Words used in this chapter</span><h3 id={`${lessonId}-vocabulary-title`}>A small vocabulary for the argument</h3></div>
      <dl>{guide.vocabulary.map((item) => <div key={item.term}><dt><MathText>{item.term}</MathText></dt><dd><MathText>{item.meaning}</MathText></dd></div>)}</dl>
    </section>

    <div className="lesson-opening-explanation">
      {opening.paragraphs.map((paragraph) => <p key={paragraph}><MathText>{paragraph}</MathText></p>)}
    </div>

    {chapters.length > 0 && <section className="chapter-narrative" aria-label={`${lessonTitle} explanation`}>{chapters.map((section, index) => <article key={section.title}>
      <span className="chapter-index">{String(index + 2).padStart(2, "0")}</span><h3><MathText>{section.title}</MathText></h3>
      {section.paragraphs.map((paragraph) => <p key={paragraph}><MathText>{paragraph}</MathText></p>)}
    </article>)}</section>}

    <section className="concept-walkthrough" data-surface-tier="anchor" data-content-role="mechanism" aria-labelledby={`${lessonId}-walkthrough-title`}>
      <header className="walkthrough-heading"><span className="eyebrow">Follow the mechanism</span><div><h3 id={`${lessonId}-walkthrough-title`}>Trace the evidence, change, and conclusion</h3><p>Each step continues the chapter’s argument. Use the state check to make sure the present result is sound before carrying it into the next step.</p></div></header>
      <div className="walkthrough-steps">{guide.walkthrough.map((step, index) => <article key={step.title}>
        <span>{String(index + 1).padStart(2, "0")}</span><div><h4><MathText>{step.title}</MathText></h4><p><MathText>{step.body}</MathText></p><div><strong>State check</strong><MathText>{step.checkpoint}</MathText></div></div>
      </article>)}</div>
    </section>

    <footer className="lesson-narrative-handoff" data-surface-tier="metadata">
      <span className="eyebrow">See the same mechanism from another angle</span>
      <p><MathText>{`The illustration and scrolling trace follow the same path from “${headingPhrase(guide.walkthrough[0].title)}” to “${headingPhrase(guide.walkthrough.at(-1)!.title)}.” As you read them, connect each visible change to the causal step that produced it.`}</MathText></p>
    </footer>
  </section>;
}

function ObjectiveCoverageCard({ item, index }: { item: import("./lesson-guides").ObjectiveCoverage; index: number }) {
  const [draft, setDraft] = useState("");
  const [committed, setCommitted] = useState(false);

  return <li>
    <span>{String(index + 1).padStart(2, "0")}</span>
    <h4><MathText>{item.objective}</MathText></h4>
    <div className="objective-evidence" data-content-role="check">
      <strong>Explain the chapter in your own words</strong>
      <p><MathText>{item.check.prompt}</MathText></p>
      <label><span>Your explanation</span><textarea rows={4} value={draft} disabled={committed} onChange={(event) => setDraft(event.target.value)} placeholder="State the decision or result and trace the causal mechanism…" /></label>
      {!committed ? <button disabled={draft.trim().length < 18} onClick={() => setCommitted(true)}>Commit before comparison</button> : <MotionReveal stateKey="objective-committed" effect="feedback">
        <div className="objective-check-answer"><strong>Expected reasoning</strong><p><MathText>{item.check.expected}</MathText></p></div>
        <div className="objective-check-retry"><strong>Retry route</strong><p><MathText>{item.check.retry}</MathText></p></div>
        <button onClick={() => setCommitted(false)}>Revise and retry</button>
      </MotionReveal>}
    </div>
    <details className="objective-reference">
      <summary>Stuck? Revisit the relevant explanation</summary>
      <div className="objective-teaching-sequence">
        <article data-content-role="definition"><strong>Plain-language anchor</strong><p><MathText>{item.explanation}</MathText></p></article>
        <article data-content-role="mechanism"><strong>Causal mechanism</strong><p><MathText>{item.mechanism}</MathText></p></article>
        <article data-content-role="worked-case"><strong>Concrete trace</strong><p><MathText>{item.workedExample}</MathText></p></article>
        <aside data-content-role="boundary"><strong>Limit to preserve</strong><p><MathText>{item.boundary}</MathText></p></aside>
      </div>
    </details>
  </li>;
}

export function LessonGuideView({ guide, lessonId, lessonTitle, coverage, example, guidance }: { guide: LessonGuide; lessonId: string; lessonTitle: string; coverage?: ObjectiveCoverage[]; example?: LessonCodeExample; guidance?: CodeGuidance }) {
  const codeExample = example ?? lessonCodeExamples[lessonId];
  const codeGuidance = guidance ?? codeActivityGuidance[lessonId];
  const objectiveCoverage = coverage ?? lessonObjectiveCoverage[lessonId];
  if (!objectiveCoverage) throw new Error(`Missing objective coverage for ${lessonId}`);
  const [codePrediction, setCodePrediction] = useState("");
  const [codeCommitted, setCodeCommitted] = useState(false);
  const [codeAssessment, setCodeAssessment] = useState<"matched" | "partial" | "missed">();
  const [codeChangePrediction, setCodeChangePrediction] = useState("");
  const [codeChangeCommitted, setCodeChangeCommitted] = useState(false);
  const [guidedPrediction, setGuidedPrediction] = useState("");
  const [guidedCommitted, setGuidedCommitted] = useState(false);
  const [guidedAssessment, setGuidedAssessment] = useState<"matched" | "partial" | "missed">();
  const [practiceDraft, setPracticeDraft] = useState("");
  const [practiceCommitted, setPracticeCommitted] = useState(false);
  const [practiceAssessment, setPracticeAssessment] = useState<"matched" | "partial" | "missed">();
  const resetGuidedExample = () => {
    setGuidedPrediction("");
    setGuidedCommitted(false);
    setGuidedAssessment(undefined);
  };

  return <section className="chapter-guide lesson-practice-chapter" id="lesson-phase-try" data-lesson-phase="try" data-surface-tier="practice" aria-label={`${lessonTitle} guided practice`}>
    <header className="chapter-guide-header"><span className="eyebrow">Try · use the idea before the final test</span><p>The explanation above supplied the model. The next activities make you predict, trace, change, and explain so the mechanism becomes something you can use rather than wording you only recognize.</p></header>
    <section className="guided-example" data-content-role="worked-case" aria-labelledby={`guided-example-${lessonId}`}>
      <div className="guided-example-intro"><div><span className="eyebrow">Worked trace</span><h3 id={`guided-example-${lessonId}`}><MathText>{guide.guidedExample.title}</MathText></h3></div><ActivityInfo mode="reflect" title="Worked example" detail="Predict the result, then compare with the trace." /></div>
      <div className="guided-example-setup"><span>Case setup</span><p><MathText>{guide.guidedExample.setup}</MathText></p></div>
      {!guidedCommitted ? <div className="guided-prediction-entry"><label><span>Your prediction</span><textarea rows={4} value={guidedPrediction} onChange={(event) => setGuidedPrediction(event.target.value)} placeholder="I expect… because…" /></label><button disabled={guidedPrediction.trim().length < 18} onClick={() => setGuidedCommitted(true)}>Compare with trace</button></div> : <>
        <div className="guided-prediction-locked"><div><span>Your committed prediction</span><p>{guidedPrediction}</p></div><button onClick={resetGuidedExample}>Restart example</button></div>
        <MotionReveal as="ol" stateKey="worked-trace" className="guided-example-steps">{guide.guidedExample.steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><div><p><MathText>{step}</MathText></p></div></li>)}</MotionReveal>
        <div className="guided-result"><span>Conclusion</span><p><MathText>{guide.guidedExample.result}</MathText></p></div>
        <div className="guided-diagnosis"><span>How did your reasoning compare?</span><div>{(["matched", "partial", "missed"] as const).map((result) => <button key={result} className={guidedAssessment === result ? "active" : ""} onClick={() => setGuidedAssessment(result)}>{result === "matched" ? "Result and mechanism matched" : result === "partial" ? "Result matched; mechanism differed" : "An earlier step needs repair"}</button>)}</div>{guidedAssessment && <p className={guidedAssessment === "matched" ? "reflection" : "retry"}>{guidedAssessment === "matched" ? "Explain the trace once without looking, then try the changed case." : guidedAssessment === "partial" ? "Find the first causal link that differed, then revise your explanation." : "Restart from the case setup and repair the first incorrect transformation."}</p>}</div>
      </>}
    </section>
    {codeExample && codeGuidance && <section className="code-walkthrough" aria-labelledby={`code-example-${lessonId}`}>
      <header>
        <div><span className="eyebrow">Code notebook · {codeExample.language}</span><h3 id={`code-example-${lessonId}`}><MathText>{codeExample.title}</MathText></h3></div>
        <div><p><MathText>{codeExample.setup}</MathText></p><ActivityInfo mode={codeGuidance.mode} requirements={codeGuidance.requirements} /></div>
      </header>
      <div className="code-prediction"><span>Predict before running</span><p><MathText>{codeExample.predict}</MathText></p></div>
      <details className="code-sample-disclosure"><summary>Open the code example</summary><pre tabIndex={0} aria-label={`${codeExample.title} code example`}><code>{codeExample.code}</code></pre></details>
      <div className="prediction-commit"><label><span>Your prediction</span><textarea rows={3} value={codePrediction} onChange={(event) => setCodePrediction(event.target.value)} disabled={codeCommitted} placeholder="State the output or mechanism, and why…" /></label>{codeCommitted ? <button onClick={() => { setCodeCommitted(false); setCodeAssessment(undefined); setCodeChangePrediction(""); setCodeChangeCommitted(false); }}>Revise prediction</button> : <button disabled={codePrediction.trim().length < 12} onClick={() => setCodeCommitted(true)}>Commit prediction</button>}</div>
      {codeCommitted && <><div className="code-reflection">
        <article><span>Expected observation</span><p><MathText>{codeExample.observe}</MathText></p></article>
        <article><span>Comparison method</span><p>Check the output, then trace backward to the first line whose value, shape, or branch differs from your committed reasoning.</p></article>
      </div><div className="prediction-diagnosis"><span>Self-check only: compare your reasoning—not just the final word.</span><div>{(["matched", "partial", "missed"] as const).map((result) => <button key={result} className={codeAssessment === result ? "active" : ""} onClick={() => { setCodeAssessment(result); setCodeChangePrediction(""); setCodeChangeCommitted(false); }}>{result === "matched" ? "My mechanism matched" : result === "partial" ? "Result matched; reason differed" : "Prediction missed"}</button>)}</div>{codeAssessment && <p className={codeAssessment === "matched" ? "reflection" : "retry"}>{codeAssessment === "matched" ? "Self-check recorded. Now make the requested change and predict again; the assessed transfer lab below verifies mastery independently." : codeAssessment === "partial" ? "Return to the mechanism walkthrough, identify the first step where your explanation diverged, then revise the prediction before attempting the changed case." : "Use the expected observation to locate the mistaken assumption, revise your response, and recommit before continuing."}</p>}</div>{codeAssessment && <div className="code-change-challenge"><div><span>Second pass · Change one thing</span><p><MathText>{codeExample.tryIt}</MathText></p></div><label><span>Your changed-case prediction</span><textarea rows={3} value={codeChangePrediction} disabled={codeChangeCommitted} onChange={(event) => setCodeChangePrediction(event.target.value)} placeholder="After this change, I expect… because line…" /></label>{!codeChangeCommitted ? <button disabled={codeChangePrediction.trim().length < 12} onClick={() => setCodeChangeCommitted(true)}>Commit changed-case prediction</button> : <div className="code-change-committed"><p><strong>Now run or trace the changed case.</strong> Compare the first changed value with your locked prediction. If it differs, return to the exact line that transformed the changed input; do not revise only the final sentence.</p><button onClick={() => setCodeChangeCommitted(false)}>Revise changed-case prediction</button></div>}</div>}</>}
      {codeExample.caveat && <p className="code-caveat"><strong>Scope note:</strong> <MathText>{codeExample.caveat}</MathText></p>}
    </section>}
    <section className="practice-station" data-content-role="practice">
      <div><span className="eyebrow">Changed-case practice</span><p><MathText>{guide.practice.prompt}</MathText></p><ActivityInfo mode="reflect" /></div>
      <div className="practice-reveals"><label className="practice-draft"><span>Your reasoning</span><textarea rows={5} value={practiceDraft} disabled={practiceCommitted} onChange={(event) => setPracticeDraft(event.target.value)} placeholder="Make a decision and explain the mechanism…" /></label>{practiceCommitted ? <button onClick={() => { setPracticeCommitted(false); setPracticeAssessment(undefined); }}>Revise answer</button> : <button disabled={practiceDraft.trim().length < 18} onClick={() => setPracticeCommitted(true)}>Commit before reveal</button>}<details><summary>Need a hint?</summary><p><MathText>{guide.practice.hint}</MathText></p></details>{practiceCommitted && <details open><summary>Worked answer</summary><p><MathText>{guide.practice.answer}</MathText></p></details>}{practiceCommitted && <div className="practice-diagnosis"><span>Self-check only: which comparison is honest?</span><div>{(["matched", "partial", "missed"] as const).map((result) => <button key={result} className={practiceAssessment === result ? "active" : ""} onClick={() => setPracticeAssessment(result)}>{result === "matched" ? "My decision + reason matched" : result === "partial" ? "Decision only matched" : "Needs another attempt"}</button>)}</div>{practiceAssessment && <p className={practiceAssessment === "matched" ? "reflection" : "retry"}>{practiceAssessment === "matched" ? "Self-check recorded. The assessed transfer lab below independently verifies the component-specific transfer." : practiceAssessment === "partial" ? "Name the causal step missing from your explanation, then revise; recognition without mechanism is not yet transfer." : "Use the hint to find the first wrong assumption, then revise without copying the worked wording."}</p>}</div>}</div>
    </section>
    <section className="learning-objectives" data-content-role="evidence" aria-label="Lesson outcomes and checks">
      <header><span className="eyebrow">Explain · consolidate the chapter</span><h3>Can you reconstruct the argument without rereading it?</h3><p>Each prompt refers back to the continuous explanation above. Write first; open the reminder only if you cannot locate the missing causal step.</p></header>
      <ol className="objective-map">{objectiveCoverage.map((item, index) => <ObjectiveCoverageCard key={item.objective} item={item} index={index} />)}</ol>
    </section>
  </section>;
}

export function LessonFurtherReading({ guide, lessonId, reviewedDate = "13 Jul 2026" }: { guide: LessonGuide; lessonId: string; reviewedDate?: string }) {
  return <section className="further-reading lesson-extension" data-surface-tier="metadata" aria-labelledby={`${lessonId}-further-reading-title`}>
    <div className="further-reading-heading">
      <div><span className="eyebrow">Optional extension</span><h2 id={`${lessonId}-further-reading-title`}>Verify the claims in primary and official sources.</h2></div>
      <div className="further-reading-intro"><p>The lesson and its assessments are complete without these links. Open one only when a second explanation, implementation, or primary source would help.</p><ActivityInfo mode="optional" /></div>
    </div>
    <div className="resource-grid">{guide.resources.map((resource) => <a href={resource.url} target="_blank" rel="noreferrer" key={resource.url}>
      <span>{resource.kind === "Paper" ? "Primary / foundational source" : resource.kind === "Documentation" ? "Current practice documentation" : `Explanatory ${resource.kind.toLowerCase()}`}</span><strong><MathText>{resource.title}</MathText></strong><p><MathText>{resource.note}</MathText></p><div className="resource-reading-question"><b>Read for</b><MathText>{`Find the exact section, result, or example that supports this lesson use: ${resource.note} Then note one limit on applying it elsewhere.`}</MathText></div><small>{resource.kind === "Documentation" ? `Reviewed ${reviewedDate} · verify current version ↗` : `Source checked ${reviewedDate} · open resource ↗`}</small>
    </a>)}</div>
  </section>;
}
