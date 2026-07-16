"use client";

import { useEffect, useMemo, useState } from "react";
import type { CapstoneProject } from "./capstone-projects";
import { capstoneArtifactFiles, capstoneEvidencePacks } from "./capstone-evidence";
import { MathText } from "./math-text";
import { MotionReveal } from "./motion/motion-reveal";
import { ActivityInfo } from "./activity-info";
import type { CapstoneEvidencePack } from "./capstone-evidence";
import type { CourseId } from "./course-catalog";

type CapstoneDraft = {
  answers: Record<string, string>;
  completedStages: string[];
  deliverables: number[];
  reflections: Record<string, string>;
};

const emptyDraft: CapstoneDraft = { answers: {}, completedStages: [], deliverables: [], reflections: {} };

function MaterialItem({ item }: { item: string }) {
  const match = item.match(/^(Downloadable )?Dependency-free starter: (.+)$/i);
  if (!match) return <MathText>{item}</MathText>;
  return <a className="capstone-starter-download" href={match[2]} download><span>Dependency-free starter</span><small>Download the executable Python scaffold <span aria-hidden="true">↓</span></small></a>;
}

export function CapstoneProjectView({ project, courseId = "llm", evidencePack: suppliedEvidencePack, artifactFile: suppliedArtifactFile }: { project: CapstoneProject; courseId?: CourseId; evidencePack?: CapstoneEvidencePack; artifactFile?: { label: string; url: string; contents: string[] } }) {
  const [draft, setDraft] = useState<CapstoneDraft>(emptyDraft);
  const [activeStage, setActiveStage] = useState(0);
  const [ready, setReady] = useState(false);
  const [showExemplar, setShowExemplar] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const storageKey = `neural-field-guide-capstone-v2:${courseId}:${project.lessonId}`;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        let stored = localStorage.getItem(storageKey);
        if (!stored && courseId === "llm") {
          stored = localStorage.getItem(`neural-field-guide-capstone-v1:${project.lessonId}`);
          if (stored) localStorage.setItem(storageKey, stored);
        }
        if (stored) setDraft({ ...emptyDraft, ...JSON.parse(stored) });
      } catch { /* A local draft is a convenience, not a requirement. */ }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [courseId, project.lessonId, storageKey]);

  useEffect(() => {
    if (ready) localStorage.setItem(storageKey, JSON.stringify(draft));
  }, [draft, ready, storageKey]);

  const totalChecks = project.stages.length + project.deliverables.length;
  const completeChecks = draft.completedStages.length + draft.deliverables.length;
  const progress = Math.round((completeChecks / totalChecks) * 100);
  const stage = project.stages[activeStage];
  const evidencePack = suppliedEvidencePack ?? capstoneEvidencePacks[project.lessonId];
  const artifactFile = suppliedArtifactFile ?? capstoneArtifactFiles[project.lessonId];
  const wordCount = useMemo(() => (draft.answers[stage.id] ?? "").trim().split(/\s+/).filter(Boolean).length, [draft.answers, stage.id]);
  const combinedDraft = Object.values(draft.answers).join(" ").toLowerCase();
  const totalWords = combinedDraft.trim().split(/\s+/).filter(Boolean).length;
  const artifactChecks = evidencePack?.checks.map((check) => ({ ...check, passed: check.terms.every((term) => combinedDraft.includes(term.toLowerCase())) })) ?? [];
  const attempted = totalWords >= 40 || draft.completedStages.length > 0;

  const toggleStage = (id: string) => setDraft((current) => ({
    ...current,
    completedStages: current.completedStages.includes(id) ? current.completedStages.filter((item) => item !== id) : [...current.completedStages, id],
  }));

  const toggleDeliverable = (index: number) => setDraft((current) => ({
    ...current,
    deliverables: current.deliverables.includes(index) ? current.deliverables.filter((item) => item !== index) : [...current.deliverables, index],
  }));

  return <section className="guided-capstone" aria-labelledby={`capstone-${project.lessonId}`}>
    <header className="capstone-project-header">
      <div><span className="eyebrow">Guided build · {project.estimatedTime}</span><h2 id={`capstone-${project.lessonId}`}><MathText>{project.title}</MathText></h2><p><MathText>{project.outcome}</MathText></p><ActivityInfo mode="project" /></div>
      <div className="capstone-progress" aria-label={`${progress}% of project checklist complete`}><strong>{progress}%</strong><span>project progress</span><i><b style={{ width: `${progress}%` }} /></i>
        <div className="capstone-assembly" role="img" aria-label={`Project assembly: stage ${activeStage + 1} of ${project.stages.length} is active; ${draft.completedStages.length} stages complete.`}>
          {project.stages.map((item, index) => <span key={item.id} className={`${activeStage === index ? "active" : ""} ${draft.completedStages.includes(item.id) ? "complete" : ""}`} aria-hidden="true"><i>{draft.completedStages.includes(item.id) ? "✓" : String(index + 1).padStart(2, "0")}</i><b>{item.title}</b></span>)}
        </div>
      </div>
    </header>

    <div className="capstone-start-kit">
      <section><span className="eyebrow">Required knowledge</span><h3>What you need before you begin</h3><ul>{project.prerequisites.map((item) => <li key={item}>✓ <MathText>{item}</MathText></li>)}</ul></section>
      <section><span className="eyebrow">Gather</span><h3>Materials and working tools</h3><ul>{project.materials.map((item) => <li key={item}><MaterialItem item={item} /></li>)}</ul></section>
      <section className="capstone-deliverables"><span className="eyebrow">What you will produce</span><h3>Your evidence package</h3>{project.deliverables.map((item, index) => <label key={item.title}><input type="checkbox" checked={draft.deliverables.includes(index)} onChange={() => toggleDeliverable(index)} /><span><strong><MathText>{item.title}</MathText></strong><small><MathText>{item.description}</MathText></small></span></label>)}</section>
    </div>

    {evidencePack && <section className="capstone-starter-scaffold" aria-labelledby={`starter-${project.lessonId}`}>
      <header><div><span className="eyebrow">Starter evidence frame</span><h3 id={`starter-${project.lessonId}`}><MathText>{evidencePack.starter.title}</MathText></h3></div><p>Copy these field names into your notes. The examples show the required specificity; replace them with your own evidence.</p></header>
      <div>{evidencePack.starter.fields.map((item, index) => <article key={item.field}><span>{String(index + 1).padStart(2, "0")}</span><h4><MathText>{item.field}</MathText></h4><p><MathText>{item.help}</MathText></p><div><b>Example field entry</b><MathText>{item.example}</MathText></div></article>)}</div>
    </section>}

    <div className="capstone-studio">
      <nav className="capstone-stage-nav" aria-label="Project stages">{project.stages.map((item, index) => <button key={item.id} className={activeStage === index ? "active" : ""} onClick={() => setActiveStage(index)} aria-current={activeStage === index ? "step" : undefined}><span>{draft.completedStages.includes(item.id) ? "✓" : String(index + 1).padStart(2, "0")}</span><strong><MathText>{item.title}</MathText></strong></button>)}</nav>
      <MotionReveal stateKey={activeStage} className="capstone-stage-panel">
        <div className="stage-heading"><div><span className="eyebrow">Stage {activeStage + 1} of {project.stages.length}</span><h3><MathText>{stage.title}</MathText></h3><p><MathText>{stage.goal}</MathText></p></div><span className="autosave-note">{ready ? "Saved in this browser" : "Loading draft…"}</span></div>
        <ol className="stage-instructions">{stage.instructions.map((instruction, index) => <li key={instruction}><span>{index + 1}</span><p><MathText>{instruction}</MathText></p></li>)}</ol>
        <div className="stage-checkpoint"><span>CHECKPOINT</span><p><MathText>{stage.checkpoint}</MathText></p></div>
        <details className="capstone-hint"><summary>Need a nudge?</summary><p><MathText>{stage.hint}</MathText></p></details>
        <label className="capstone-workspace"><span>Your working notes</span><small><MathText>{stage.workspacePrompt}</MathText></small><textarea value={draft.answers[stage.id] ?? ""} onChange={(event) => setDraft((current) => ({ ...current, answers: { ...current.answers, [stage.id]: event.target.value } }))} placeholder="Draft your answer here. It stays in this browser…" rows={10} /><i>{wordCount} words</i></label>
        <div className="stage-actions"><label><input type="checkbox" checked={draft.completedStages.includes(stage.id)} onChange={() => toggleStage(stage.id)} /> I completed the checkpoint and recorded evidence.</label>{activeStage < project.stages.length - 1 && <button onClick={() => setActiveStage(activeStage + 1)}>Continue to stage {activeStage + 2} →</button>}</div>
      </MotionReveal>
    </div>

    {evidencePack && <section className="capstone-artifact-checks" aria-labelledby={`artifact-checks-${project.lessonId}`}>
      <header><div><span className="eyebrow">Live artifact validation</span><h3 id={`artifact-checks-${project.lessonId}`}>Can another person inspect and reproduce the work?</h3><p>These are lightweight completeness checks, not a quality oracle. A check turns green only when all named evidence terms appear somewhere in your stage notes.</p></div><strong>{artifactChecks.filter((item) => item.passed).length}/{artifactChecks.length} checks</strong></header>
      <div>{artifactChecks.map((check) => <article className={check.passed ? "passed" : ""} key={check.label}><span>{check.passed ? "✓" : "○"}</span><div><strong><MathText>{check.label}</MathText></strong><small>Look for: {check.terms.join(" · ")}</small></div></article>)}</div>
    </section>}

    <section className="capstone-rubric"><div><span className="eyebrow">Self-assessment</span><h2>Grade the evidence, not the effort.</h2><p>Proficient is the target. Excellent requires stronger evidence, controls, and communication—not merely more words.</p></div><div className="rubric-table" role="table" aria-label={`Assessment rubric for ${project.title}`}><div className="rubric-row rubric-head" role="row"><span>Criterion</span><span>Developing</span><span>Proficient</span><span>Excellent</span></div>{project.rubric.map((row) => <div className="rubric-row" role="row" key={row.criterion}><strong><MathText>{row.criterion}</MathText></strong><p><MathText>{row.developing}</MathText></p><p><MathText>{row.proficient}</MathText></p><p><MathText>{row.excellent}</MathText></p></div>)}</div></section>

    <section className="capstone-exemplar"><div><span className="eyebrow">Compare after attempting</span><h2><MathText>{project.exemplar.title}</MathText></h2><p>The exemplar is one defensible route, not a template to copy. Write at least 40 words or complete one stage before comparison unlocks.</p></div>{showExemplar ? <div className="exemplar-reveal"><p><MathText>{project.exemplar.summary}</MathText></p><ul>{project.exemplar.decisions.map((decision) => <li key={decision}><MathText>{decision}</MathText></li>)}</ul><button onClick={() => setShowExemplar(false)}>Hide exemplar</button></div> : <div className="capstone-exemplar-gate"><span>{attempted ? "Attempt recorded · comparison unlocked" : "Make an attempt before revealing the example"}</span><button className="reveal-button" disabled={!attempted} onClick={() => setShowExemplar(true)}>Reveal exemplar approach</button></div>}</section>

    {evidencePack && <section className="capstone-reference-package" aria-labelledby={`reference-${project.lessonId}`}>
      <header><div><span className="eyebrow">Worked reference evidence</span><h2 id={`reference-${project.lessonId}`}><MathText>{evidencePack.reference.title}</MathText></h2><p>Compare this complete evidence shape with your own after you have made an attempt. Its JSON evidence kind and boundary say whether rows are executed observations, deterministic fixtures, or planned null-measurement cells.</p></div><span>{attempted ? `${totalWords} draft words · comparison unlocked` : "Write 40 words or complete one stage to unlock"}</span></header>
      {showReference ? <><div className="reference-sections">{evidencePack.reference.sections.map((section) => <article key={section.heading}><h3><MathText>{section.heading}</MathText></h3><p><MathText>{section.content}</MathText></p></article>)}<button onClick={() => setShowReference(false)}>Hide worked reference</button></div>{artifactFile && <a className="reference-artifact-file" href={artifactFile.url} target="_blank" rel="noreferrer"><span>INSPECT THE MACHINE-READABLE REFERENCE ARTIFACT</span><strong>{artifactFile.label}</strong><small>{artifactFile.contents.join(" · ")} ↗</small></a>}</> : <button className="reveal-button" disabled={!attempted} onClick={() => setShowReference(true)}>Reveal worked reference package</button>}
    </section>}

    {evidencePack && <section className="capstone-source-pack" aria-labelledby={`sources-${project.lessonId}`}>
      <header><span className="eyebrow">Project-local sources</span><h2 id={`sources-${project.lessonId}`}>Pin every claim to its evidence.</h2><p>Each card labels its evidence kind, and every mutable artifact has a revision marker. Open the source to answer its reading question before citing it in your project.</p></header>
      <div>{evidencePack.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.kind ?? "PRIMARY / OFFICIAL"}</span><strong><MathText>{source.label}</MathText></strong><small><MathText>{source.revision}</MathText></small><p><b>Read for:</b> <MathText>{source.readFor}</MathText></p></a>)}</div>
    </section>}

    <section className="capstone-reflection"><div><span className="eyebrow">Learning transfer</span><h2>Keep a decision and reflection log.</h2><p>Write for your future self: what changed in your mental model, and what would you test next?</p></div><div>{project.reflection.map((prompt, index) => <label key={prompt}><span><MathText>{prompt}</MathText></span><textarea rows={4} value={draft.reflections[String(index)] ?? ""} onChange={(event) => setDraft((current) => ({ ...current, reflections: { ...current.reflections, [String(index)]: event.target.value } }))} /></label>)}</div></section>

    <footer className="capstone-draft-tools"><span>{ready ? "Drafts save automatically to local storage on this device." : "Loading your local draft…"}</span>{resetConfirm ? <div><button onClick={() => { setDraft(emptyDraft); localStorage.removeItem(storageKey); setResetConfirm(false); }}>Yes, clear project</button><button onClick={() => setResetConfirm(false)}>Cancel</button></div> : <button onClick={() => setResetConfirm(true)}>Clear project draft</button>}</footer>
  </section>;
}
