"use client";

import { useState } from "react";
import type { LessonGuide, ObjectiveCoverage } from "./lesson-guides";
import { lessonCodeExamples, type LessonCodeExample } from "./code-examples";
import { lessonObjectiveCoverage } from "./lesson-objective-coverage";
import { MathText } from "./math-text";
import { ActivityInfo, codeActivityGuidance, LearningActivityContract, type CodeGuidance } from "./activity-info";

function ObjectiveCoverageCard({ item, index }: { item: import("./lesson-guides").ObjectiveCoverage; index: number }) {
  const [draft, setDraft] = useState("");
  const [committed, setCommitted] = useState(false);

  return <li>
    <span>{String(index + 1).padStart(2, "0")}</span>
    <h4><MathText>{item.objective}</MathText></h4>
    <div className="objective-teaching-sequence">
      <article><strong>Plain-language meaning</strong><p><MathText>{item.explanation}</MathText></p></article>
      <article><strong>How it works</strong><p><MathText>{item.mechanism}</MathText></p></article>
      <article><strong>Worked trace</strong><p><MathText>{item.workedExample}</MathText></p></article>
      <aside><strong>Boundary or failure case</strong><p><MathText>{item.boundary}</MathText></p></aside>
    </div>
    <div className="objective-evidence">
      <strong>Check this outcome</strong>
      <p><MathText>{item.check.prompt}</MathText></p>
      <label><span>Your explanation</span><textarea rows={4} value={draft} disabled={committed} onChange={(event) => setDraft(event.target.value)} placeholder="State the decision or result and trace the causal mechanism…" /></label>
      {!committed ? <button disabled={draft.trim().length < 18} onClick={() => setCommitted(true)}>Commit before comparison</button> : <>
        <div className="objective-check-answer"><strong>Expected reasoning</strong><p><MathText>{item.check.expected}</MathText></p></div>
        <div className="objective-check-retry"><strong>Retry route</strong><p><MathText>{item.check.retry}</MathText></p></div>
        <button onClick={() => setCommitted(false)}>Revise and retry</button>
      </>}
    </div>
  </li>;
}

export function LessonGuideView({ guide, lessonId, lessonTitle, coverage, example, guidance, showVocabulary = true }: { guide: LessonGuide; lessonId: string; lessonTitle: string; coverage?: ObjectiveCoverage[]; example?: LessonCodeExample; guidance?: CodeGuidance; showVocabulary?: boolean }) {
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
  const [guidedRevealedSteps, setGuidedRevealedSteps] = useState(0);
  const [guidedStepNotes, setGuidedStepNotes] = useState<string[]>([]);
  const [guidedAssessment, setGuidedAssessment] = useState<"matched" | "partial" | "missed">();
  const [practiceDraft, setPracticeDraft] = useState("");
  const [practiceCommitted, setPracticeCommitted] = useState(false);
  const [practiceAssessment, setPracticeAssessment] = useState<"matched" | "partial" | "missed">();
  const guidedComplete = guidedRevealedSteps === guide.guidedExample.steps.length;
  const resetGuidedExample = () => {
    setGuidedPrediction("");
    setGuidedCommitted(false);
    setGuidedRevealedSteps(0);
    setGuidedStepNotes([]);
    setGuidedAssessment(undefined);
  };

  return <section className="chapter-guide" aria-label={`${lessonTitle} guided chapter`}>
    <header className="chapter-guide-header">
      <span className="eyebrow">Guided chapter</span>
      <p>Use the outcome map to connect each claim to a mechanism and an observable check. Then work through the explanations and changed-case practice without relying on an external grader.</p>
    </header>
    <section className="learning-objectives" aria-labelledby={`${lessonId}-learning-objectives-title`}>
      <div><span className="chapter-index">01</span><h3 id={`${lessonId}-learning-objectives-title`}>By the end, you can…</h3><p>These are learning promises, not a preview checklist. The teaching sequence beneath each one gives you a plain explanation, causal mechanism, worked trace, failure boundary, and a response you must commit before comparing.</p></div>
      <ol className="objective-map">{objectiveCoverage.map((item, index) => <ObjectiveCoverageCard key={item.objective} item={item} index={index} />)}</ol>
    </section>
    <section className="chapter-narrative">{guide.sections.map((section, index) => <article key={section.title}>
      <span className="chapter-index">{String(index + 2).padStart(2, "0")}</span><h3><MathText>{section.title}</MathText></h3>
      {section.paragraphs.map((paragraph) => <p key={paragraph}><MathText>{paragraph}</MathText></p>)}
    </article>)}</section>
    <section className="guided-example" aria-labelledby={`guided-example-${lessonId}`}>
      <div className="guided-example-intro"><div><span className="eyebrow">Guided example · predict one step at a time</span><h3 id={`guided-example-${lessonId}`}><MathText>{guide.guidedExample.title}</MathText></h3></div><ActivityInfo mode="reflect" title="Worked example with protected thinking time" detail="Commit an overall prediction first. Before each worked step appears, write what should happen next and why. The conclusion remains hidden until every step has been forecast." /></div>
      <LearningActivityContract
        question={<><span>Can you trace this concrete case from its starting values to the conclusion before seeing the worked steps?</span> <MathText>{guide.guidedExample.setup}</MathText></>}
        action="Commit an overall result and reason. Then forecast the next operation before revealing each worked step."
        observe="Compare each locked forecast with the newly revealed operation, value, shape, or decision."
        explain="At the first mismatch, name the assumption or causal link that made your forecast diverge."
        complete="Reveal every step, compare the final result with your first prediction, and record an honest diagnosis."
        boundary="This is a scaffolded teaching trace, not an independently graded transfer assessment; the changed-case activity later in the lesson checks transfer."
      />
      <div className="guided-example-setup"><span>Case setup</span><p><MathText>{guide.guidedExample.setup}</MathText></p></div>
      {!guidedCommitted ? <div className="guided-prediction-entry"><label><span>Your overall prediction</span><small>State the result you expect and the mechanism or calculation that should produce it.</small><textarea rows={4} value={guidedPrediction} onChange={(event) => setGuidedPrediction(event.target.value)} placeholder="I expect… because the first transformation will…" /></label><button disabled={guidedPrediction.trim().length < 18} onClick={() => setGuidedCommitted(true)}>Commit before step 1</button></div> : <>
        <div className="guided-prediction-locked"><div><span>Your committed prediction</span><p>{guidedPrediction}</p></div><button onClick={resetGuidedExample}>Restart example</button></div>
        {guidedRevealedSteps > 0 && <ol className="guided-example-steps">{guide.guidedExample.steps.slice(0, guidedRevealedSteps).map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><div><small><strong>Your forecast:</strong> {guidedStepNotes[index]}</small><p><MathText>{step}</MathText></p></div></li>)}</ol>}
        {!guidedComplete ? <div className="guided-next-step"><label><span>Pause before step {guidedRevealedSteps + 1}</span><small>{guidedRevealedSteps === 0 ? "From the setup, what should the first operation or decision be, and why?" : "Using only the setup and revealed steps, what should happen next, and why?"}</small><textarea rows={3} value={guidedStepNotes[guidedRevealedSteps] ?? ""} onChange={(event) => setGuidedStepNotes((current) => {
          const next = [...current];
          next[guidedRevealedSteps] = event.target.value;
          return next;
        })} placeholder="The next step should… because…" /></label><button disabled={(guidedStepNotes[guidedRevealedSteps] ?? "").trim().length < 12} onClick={() => setGuidedRevealedSteps((current) => current + 1)}>Reveal step {guidedRevealedSteps + 1}</button></div> : <>
          <div className="guided-result"><span>Worked conclusion · now compare</span><p><MathText>{guide.guidedExample.result}</MathText></p></div>
          <div className="guided-diagnosis"><span>Where did your reasoning first diverge?</span><div>{(["matched", "partial", "missed"] as const).map((result) => <button key={result} className={guidedAssessment === result ? "active" : ""} onClick={() => setGuidedAssessment(result)}>{result === "matched" ? "Result and mechanism matched" : result === "partial" ? "Result matched; mechanism differed" : "An earlier step needs repair"}</button>)}</div>{guidedAssessment && <p className={guidedAssessment === "matched" ? "reflection" : "retry"}>{guidedAssessment === "matched" ? "Complete. Explain the trace once without looking, then continue to the changed-case practice." : guidedAssessment === "partial" ? "Return to the first forecast whose causal link differed, revise that link, and run the example again without copying the worked sentence." : "Restart the example. Use the case setup to identify the first required transformation, then reveal only one step after committing your reasoning."}</p>}</div>
        </>}
      </>}
    </section>
    {codeExample && codeGuidance && <section className="code-walkthrough" aria-labelledby={`code-example-${lessonId}`}>
      <header>
        <div><span className="eyebrow">Code notebook · {codeExample.language}</span><h3 id={`code-example-${lessonId}`}><MathText>{codeExample.title}</MathText></h3></div>
        <div><p><MathText>{codeExample.setup}</MathText></p><ActivityInfo mode={codeGuidance.mode} requirements={codeGuidance.requirements} /></div>
      </header>
      <LearningActivityContract
        question={<MathText>{codeExample.predict}</MathText>}
        action="Write the expected output or causal mechanism, inspect the code, then run, adapt, or trace it according to its execution label."
        observe="After committing, compare the real or hand-traced behavior with the expected observation revealed by the notebook."
        explain="Locate the first line where your reasoning and the observed state differ; explain the mismatch using named values, shapes, or control flow."
        complete="Diagnose the first pass, change one requested input, commit a second prediction, and run or trace the changed case."
        boundary={<MathText>{codeExample.caveat ?? "This small notebook exposes one mechanism. It is not evidence about production-scale quality, speed, or reliability."}</MathText>}
      />
      <div className="code-prediction"><span>Predict before running</span><p><MathText>{codeExample.predict}</MathText></p></div>
      <details className="code-sample-disclosure"><summary>Open the code example</summary><pre tabIndex={0} aria-label={`${codeExample.title} code example`}><code>{codeExample.code}</code></pre></details>
      <div className="prediction-commit"><label><span>Your prediction</span><textarea rows={3} value={codePrediction} onChange={(event) => setCodePrediction(event.target.value)} disabled={codeCommitted} placeholder="State the output or mechanism, and why…" /></label>{codeCommitted ? <button onClick={() => { setCodeCommitted(false); setCodeAssessment(undefined); setCodeChangePrediction(""); setCodeChangeCommitted(false); }}>Revise prediction</button> : <button disabled={codePrediction.trim().length < 12} onClick={() => setCodeCommitted(true)}>Commit prediction</button>}</div>
      {codeCommitted && <><div className="code-reflection">
        <article><span>Expected observation</span><p><MathText>{codeExample.observe}</MathText></p></article>
        <article><span>Comparison method</span><p>Check the output, then trace backward to the first line whose value, shape, or branch differs from your committed reasoning.</p></article>
      </div><div className="prediction-diagnosis"><span>Self-check only: compare your reasoning—not just the final word.</span><div>{(["matched", "partial", "missed"] as const).map((result) => <button key={result} className={codeAssessment === result ? "active" : ""} onClick={() => { setCodeAssessment(result); setCodeChangePrediction(""); setCodeChangeCommitted(false); }}>{result === "matched" ? "My mechanism matched" : result === "partial" ? "Result matched; reason differed" : "Prediction missed"}</button>)}</div>{codeAssessment && <p className={codeAssessment === "matched" ? "reflection" : "retry"}>{codeAssessment === "matched" ? "Self-check recorded. Now make the requested change and predict again; the assessed transfer lab below verifies mastery independently." : codeAssessment === "partial" ? "Return to the mechanism walkthrough, identify the first step where your explanation diverged, then revise the prediction before attempting the changed case." : "Use the expected observation to locate the mistaken assumption, revise your response, and recommit before continuing."}</p>}</div>{codeAssessment && <div className="code-change-challenge"><div><span>Second pass · Change one thing</span><p><MathText>{codeExample.tryIt}</MathText></p></div><label><span>Your changed-case prediction</span><textarea rows={3} value={codeChangePrediction} disabled={codeChangeCommitted} onChange={(event) => setCodeChangePrediction(event.target.value)} placeholder="After this change, I expect… because line…" /></label>{!codeChangeCommitted ? <button disabled={codeChangePrediction.trim().length < 12} onClick={() => setCodeChangeCommitted(true)}>Commit changed-case prediction</button> : <div className="code-change-committed"><p><strong>Now run or trace the changed case.</strong> Compare the first changed value with your locked prediction. If it differs, return to the exact line that transformed the changed input; do not revise only the final sentence.</p><button onClick={() => setCodeChangeCommitted(false)}>Revise changed-case prediction</button></div>}</div>}</>}
      {codeExample.caveat && <p className="code-caveat"><strong>Scope note:</strong> <MathText>{codeExample.caveat}</MathText></p>}
    </section>}
    <section className="practice-station">
      <div><span className="eyebrow">Changed-case practice</span><h3>Commit your reasoning before comparing.</h3><p><MathText>{guide.practice.prompt}</MathText></p><ActivityInfo mode="reflect" /></div>
      <div className="practice-reveals"><label className="practice-draft"><span>Your reasoning</span><textarea rows={5} value={practiceDraft} disabled={practiceCommitted} onChange={(event) => setPracticeDraft(event.target.value)} placeholder="Make a decision and explain the mechanism…" /></label>{practiceCommitted ? <button onClick={() => { setPracticeCommitted(false); setPracticeAssessment(undefined); }}>Revise answer</button> : <button disabled={practiceDraft.trim().length < 18} onClick={() => setPracticeCommitted(true)}>Commit before reveal</button>}<details><summary>Need a hint?</summary><p><MathText>{guide.practice.hint}</MathText></p></details>{practiceCommitted && <details open><summary>Worked answer</summary><p><MathText>{guide.practice.answer}</MathText></p></details>}{practiceCommitted && <div className="practice-diagnosis"><span>Self-check only: which comparison is honest?</span><div>{(["matched", "partial", "missed"] as const).map((result) => <button key={result} className={practiceAssessment === result ? "active" : ""} onClick={() => setPracticeAssessment(result)}>{result === "matched" ? "My decision + reason matched" : result === "partial" ? "Decision only matched" : "Needs another attempt"}</button>)}</div>{practiceAssessment && <p className={practiceAssessment === "matched" ? "reflection" : "retry"}>{practiceAssessment === "matched" ? "Self-check recorded. The assessed transfer lab below independently verifies the component-specific transfer." : practiceAssessment === "partial" ? "Name the causal step missing from your explanation, then revise; recognition without mechanism is not yet transfer." : "Use the hint to find the first wrong assumption, then revise without copying the worked wording."}</p>}</div>}</div>
    </section>
    {showVocabulary && <section className="lesson-vocabulary">
      <div><span className="eyebrow">Vocabulary checkpoint</span><h3>Use each term precisely.</h3></div>
      <dl>{guide.vocabulary.map((item) => <div key={item.term}><dt><MathText>{item.term}</MathText></dt><dd><MathText>{item.meaning}</MathText></dd></div>)}</dl>
    </section>}
  </section>;
}

export function LessonFurtherReading({ guide, lessonId, reviewedDate = "13 Jul 2026" }: { guide: LessonGuide; lessonId: string; reviewedDate?: string }) {
  return <section className="further-reading lesson-extension" aria-labelledby={`${lessonId}-further-reading-title`}>
    <div className="further-reading-heading"><span className="eyebrow">Optional extension</span><h2 id={`${lessonId}-further-reading-title`}>Verify the claims in primary and official sources.</h2><p>The lesson and its assessments are complete without these links. Open one only when a second explanation, implementation, or primary source would help.</p><ActivityInfo mode="optional" /></div>
    <div className="resource-grid">{guide.resources.map((resource) => <a href={resource.url} target="_blank" rel="noreferrer" key={resource.url}>
      <span>{resource.kind === "Paper" ? "Primary / foundational source" : resource.kind === "Documentation" ? "Current practice documentation" : `Explanatory ${resource.kind.toLowerCase()}`}</span><strong><MathText>{resource.title}</MathText></strong><p><MathText>{resource.note}</MathText></p><div className="resource-reading-question"><b>Read for</b><MathText>{`Find the exact section, result, or example that supports this lesson use: ${resource.note} Then note one limit on applying it elsewhere.`}</MathText></div><small>{resource.kind === "Documentation" ? `Reviewed ${reviewedDate} · verify current version ↗` : `Source checked ${reviewedDate} · open resource ↗`}</small>
    </a>)}</div>
  </section>;
}
