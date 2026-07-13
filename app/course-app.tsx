"use client";

import { useEffect, useMemo, useState } from "react";
import { curriculumMinutes, lessonById, lessons, tracks, type Lesson, type TrackId } from "./course-data";
import { LessonLab } from "./lesson-labs";

const STORAGE_KEY = "neural-field-guide-progress-v1";

type Progress = { completed: string[]; quizAnswers: Record<string, number> };
type View = { kind: "home" } | { kind: "lesson"; id: string };

const emptyProgress: Progress = { completed: [], quizAnswers: {} };

function trackFor(id: TrackId) {
  return tracks.find((track) => track.id === id)!;
}

function Icon({ name }: { name: "spark" | "map" | "search" | "check" | "book" }) {
  const glyph = { spark: "✦", map: "⌘", search: "⌕", check: "✓", book: "▤" }[name];
  return <span className="icon" aria-hidden="true">{glyph}</span>;
}

export function CourseApp() {
  const [view, setView] = useState<View>({ kind: "home" });
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setProgress({ ...emptyProgress, ...JSON.parse(saved) });
      } catch { /* Local progress is optional. */ }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress, ready]);

  const current = view.kind === "lesson" ? lessonById[view.id] : undefined;
  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return lessons;
    return lessons.filter((lesson) => `${lesson.title} ${lesson.simple} ${trackFor(lesson.track).title}`.toLowerCase().includes(normalized));
  }, [query]);

  const openLesson = (id: string) => {
    setView({ kind: "lesson", id });
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const completed = progress.completed.length;
  const percent = Math.round((completed / lessons.length) * 100);
  const nextLesson = lessons.find((lesson) => !progress.completed.includes(lesson.id)) ?? lessons[0];

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setView({ kind: "home" })} aria-label="Go to course home">
          <span className="brand-mark">N</span>
          <span><strong>Neural</strong> Field Guide</span>
        </button>
        <div className="topbar-actions">
          <span className="top-progress"><strong>{completed}</strong> / {lessons.length} mastered</span>
          <button className="nav-toggle" onClick={() => setMobileNav(!mobileNav)} aria-expanded={mobileNav} aria-controls="course-navigation">Course map</button>
        </div>
      </header>

      <aside className={`sidebar ${mobileNav ? "is-open" : ""}`} id="course-navigation">
        <div className="sidebar-progress">
          <div className="progress-orbit" style={{ "--progress": `${percent * 3.6}deg` } as React.CSSProperties}><span>{percent}%</span></div>
          <div><span className="eyebrow">Your expedition</span><strong>{completed === 0 ? "Base camp" : `${completed} lessons complete`}</strong></div>
        </div>
        <label className="search-box">
          <Icon name="search" /><span className="sr-only">Search lessons</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the field guide…" />
          {query && <button onClick={() => setQuery("")} aria-label="Clear search">×</button>}
        </label>
        <nav aria-label="Course lessons" className="lesson-nav">
          {tracks.map((track) => {
            const trackLessons = filtered.filter((lesson) => lesson.track === track.id);
            const fullTrack = lessons.filter((lesson) => lesson.track === track.id);
            const trackDone = fullTrack.filter((lesson) => progress.completed.includes(lesson.id)).length;
            if (!trackLessons.length) return null;
            return <section key={track.id} className="nav-track" style={{ "--track": track.color } as React.CSSProperties}>
              <div className="nav-track-heading"><span>{track.title}</span><small>{trackDone}/{fullTrack.length}</small></div>
              {trackLessons.map((lesson) => <button key={lesson.id} onClick={() => openLesson(lesson.id)} className={`nav-lesson ${current?.id === lesson.id ? "active" : ""}`} aria-current={current?.id === lesson.id ? "page" : undefined}>
                <span className="nav-number">{progress.completed.includes(lesson.id) ? <Icon name="check" /> : String(lesson.number).padStart(2, "0")}</span>
                <span>{lesson.title}</span>
              </button>)}
            </section>;
          })}
          {filtered.length === 0 && <p className="empty-search">No trail found. Try a broader search.</p>}
        </nav>
        <div className="progress-reset">
          {resetConfirm ? <><p>Erase completed lessons and quiz answers?</p><button onClick={() => { setProgress(emptyProgress); setResetConfirm(false); }}>Yes, reset</button><button onClick={() => setResetConfirm(false)}>Cancel</button></> : <button onClick={() => setResetConfirm(true)}>Reset course progress</button>}
        </div>
      </aside>

      <main className="main-stage">
        {current ? <LessonView key={current.id} lesson={current} progress={progress} setProgress={setProgress} openLesson={openLesson} /> : <HomeView completed={completed} nextLesson={nextLesson} openLesson={openLesson} />}
      </main>
    </div>
  );
}

function HomeView({ completed, nextLesson, openLesson }: { completed: number; nextLesson: Lesson; openLesson: (id: string) => void }) {
  return <div className="home-view">
    <section className="hero">
      <div className="hero-copy">
        <span className="kicker"><Icon name="spark" /> Interactive learning expedition</span>
        <h1>Understand the machine.<br /><em>From first principles.</em></h1>
        <p className="hero-lede">No black boxes. Build a durable mental model of language models—from the first token split to trillion-token training runs and human feedback.</p>
        <div className="hero-actions">
          <button className="primary-button" onClick={() => openLesson(nextLesson.id)}>{completed ? "Continue your journey" : "Start with the first token"}<span>→</span></button>
          <span className="time-note"><strong>{Math.round(curriculumMinutes / 60)} hours</strong> · learn at your pace</span>
        </div>
      </div>
      <div className="hero-machine" aria-label="A visual map from text to an aligned language model">
        <div className="machine-label">THE LLM PIPELINE</div>
        <div className="machine-row"><span className="data-chip">“language”</span><b>→</b><span className="data-chip orange">tok_1842</span></div>
        <div className="neural-grid">{Array.from({ length: 24 }).map((_, index) => <i key={index} style={{ "--delay": `${index * 45}ms` } as React.CSSProperties} />)}</div>
        <div className="machine-output"><span>next token</span><strong>model</strong><b>37%</b></div>
      </div>
    </section>

    <section className="course-manifest">
      <div className="section-heading"><span className="eyebrow">The complete map</span><h2>Four territories. One connected story.</h2><p>Every lesson starts in plain English, then opens the hood when you’re ready.</p></div>
      <div className="track-grid">
        {tracks.map((track, index) => {
          const trackLessons = lessons.filter((lesson) => lesson.track === track.id);
          return <article className="track-card" key={track.id} style={{ "--track": track.color } as React.CSSProperties}>
            <div className="track-top"><span className="track-index">0{index + 1}</span><span className="track-line" /></div>
            <span className="eyebrow">{track.short}</span><h3>{track.title}</h3><p>{track.description}</p>
            <div className="track-meta"><span>{trackLessons.length} lessons</span><span>{trackLessons.reduce((sum, item) => sum + item.duration, 0)} min</span></div>
            <button onClick={() => openLesson(trackLessons[0].id)}>Enter territory <span>↗</span></button>
          </article>;
        })}
      </div>
    </section>

    <section className="learning-promise">
      <div><span className="big-stat">28</span><span>connected lessons</span></div>
      <div><span className="big-stat">12</span><span>hands-on labs</span></div>
      <div><span className="big-stat">2×</span><span>depth in every topic</span></div>
      <div className="promise-copy"><Icon name="map" /><p><strong>Built for the curious beginner.</strong> Plain language first. Mathematics, trade-offs, and implementation details when they become useful.</p></div>
    </section>
  </div>;
}

function LessonView({ lesson, progress, setProgress, openLesson }: { lesson: Lesson; progress: Progress; setProgress: React.Dispatch<React.SetStateAction<Progress>>; openLesson: (id: string) => void }) {
  const [depth, setDepth] = useState<"simple" | "deep">("simple");
  const index = lessons.findIndex((item) => item.id === lesson.id);
  const previous = lessons[index - 1];
  const next = lessons[index + 1];
  const selectedAnswer = progress.quizAnswers[lesson.id];
  const isComplete = progress.completed.includes(lesson.id);
  const track = trackFor(lesson.track);

  const answerQuiz = (answer: number) => setProgress((current) => ({ ...current, quizAnswers: { ...current.quizAnswers, [lesson.id]: answer } }));
  const toggleComplete = () => setProgress((current) => ({ ...current, completed: current.completed.includes(lesson.id) ? current.completed.filter((id) => id !== lesson.id) : [...current.completed, lesson.id] }));

  return <article className="lesson-view" style={{ "--track": track.color } as React.CSSProperties}>
    <div className="lesson-breadcrumb"><button onClick={() => openLesson(lessons.find((item) => item.track === lesson.track)!.id)}>{track.title}</button><span>/</span><span>Lesson {String(lesson.number).padStart(2, "0")}</span><span className="lesson-time">{lesson.duration} min</span></div>
    <header className="lesson-header">
      <span className="lesson-index">{String(lesson.number).padStart(2, "0")}</span>
      <div><span className="eyebrow">{track.short}</span><h1>{lesson.title}</h1></div>
    </header>

    <section className="definition-card">
      <div className="depth-toggle" role="group" aria-label="Explanation depth">
        <button className={depth === "simple" ? "active" : ""} onClick={() => setDepth("simple")}><span>01</span> Plain English</button>
        <button className={depth === "deep" ? "active" : ""} onClick={() => setDepth("deep")}><span>02</span> Under the hood</button>
      </div>
      <div className="definition-content" key={`${lesson.id}-${depth}`}>
        <span className="eyebrow">{depth === "simple" ? "The 30-second definition" : "The technical definition"}</span>
        <p className={depth === "simple" ? "simple-definition" : "deep-definition"}>{depth === "simple" ? lesson.simple : lesson.deep}</p>
        {depth === "deep" && <div className="technical-note"><span>TECHNICAL LENS</span><p>Read for the relationships first; revisit the notation after the mental model and example below.</p></div>}
      </div>
    </section>

    <section className="lesson-grid">
      <div className="mental-model panel"><span className="panel-icon">◇</span><div><span className="eyebrow">Mental model</span><h2>Make it stick</h2><p>{lesson.mentalModel}</p></div></div>
      <div className="key-ideas panel"><span className="eyebrow">Three things to remember</span><ol>{lesson.keyIdeas.map((idea, ideaIndex) => <li key={idea}><span>{ideaIndex + 1}</span><p>{idea}</p></li>)}</ol></div>
      <div className="worked-example panel"><span className="eyebrow">Worked example</span><h2>See it in motion</h2><p>{lesson.example}</p></div>
      <aside className="misconception panel"><span className="stamp">MYTH → REALITY</span><p>{lesson.misconception}</p></aside>
    </section>

    {lesson.lab && <LessonLab type={lesson.lab} lesson={lesson} />}

    {(["gpt2-from-scratch", "llama3-case-study", "tulu3-case-study"] as string[]).includes(lesson.id) && <SynthesisMap lesson={lesson} openLesson={openLesson} />}

    <section className="knowledge-check">
      <div className="quiz-heading"><span className="eyebrow">Retrieval practice</span><h2>Check your understanding</h2><p>Choose first. Explanations appear after you commit.</p></div>
      <div className="quiz-card"><p className="quiz-question">{lesson.quiz.question}</p><div className="quiz-options">
        {lesson.quiz.options.map((option, optionIndex) => {
          const answered = selectedAnswer !== undefined;
          const state = answered ? optionIndex === lesson.quiz.answer ? "correct" : optionIndex === selectedAnswer ? "incorrect" : "muted" : "";
          return <button disabled={answered} className={state} key={option} onClick={() => answerQuiz(optionIndex)}><span>{String.fromCharCode(65 + optionIndex)}</span>{option}</button>;
        })}
      </div>{selectedAnswer !== undefined && <div className={`quiz-feedback ${selectedAnswer === lesson.quiz.answer ? "success" : "retry"}`} role="status"><strong>{selectedAnswer === lesson.quiz.answer ? "Exactly right." : "Not quite—here’s the key."}</strong><p>{lesson.quiz.explanation}</p><button onClick={() => setProgress((current) => { const answers = { ...current.quizAnswers }; delete answers[lesson.id]; return { ...current, quizAnswers: answers }; })}>Try again</button></div>}</div>
    </section>

    <section className="lesson-complete">
      <div><span className="eyebrow">Field note {lesson.number} of {lessons.length}</span><h2>{isComplete ? "Filed in your field guide." : "Ready to mark this lesson complete?"}</h2></div>
      <button className={isComplete ? "completed-button" : "primary-button"} onClick={toggleComplete}>{isComplete ? <><Icon name="check" /> Completed</> : <>Mark as understood <span>✓</span></>}</button>
    </section>
    <nav className="lesson-pagination" aria-label="Lesson pagination">
      {previous ? <button onClick={() => openLesson(previous.id)}><span>← Previous</span><strong>{previous.title}</strong></button> : <span />}
      {next ? <button className="next" onClick={() => openLesson(next.id)}><span>Next →</span><strong>{next.title}</strong></button> : <button className="next" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><span>Course complete</span><strong>Return to the top ↑</strong></button>}
    </nav>
  </article>;
}

function SynthesisMap({ lesson, openLesson }: { lesson: Lesson; openLesson: (id: string) => void }) {
  const maps: Record<string, { title: string; intro: string; links: string[] }> = {
    "gpt2-from-scratch": { title: "Assemble the architecture", intro: "GPT-2 is where the individual mechanisms become one executable forward pass.", links: ["tokenization", "embedding-layer", "positional-encoding", "attention", "learning-to-predict"] },
    "llama3-case-study": { title: "Trace a pre-training program", intro: "Llama 3 connects model design to the data, compute, and evaluation system around it.", links: ["objectives-details", "scaling-laws", "data-engineering", "infrastructure", "pretraining-evaluation"] },
    "tulu3-case-study": { title: "Trace a post-training recipe", intro: "Tülu 3 connects demonstrations, preferences, tool/safety behavior, and measurable outcomes.", links: ["sft", "preference-optimization", "tools-safety", "rl-fundamentals", "rlhf"] }
  };
  const map = maps[lesson.id];
  return <section className="synthesis-map"><div><span className="eyebrow">Capstone synthesis</span><h2>{map.title}</h2><p>{map.intro}</p></div><div className="synthesis-links">{map.links.map((id, index) => <button key={id} onClick={() => openLesson(id)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{lessonById[id].title}</strong><small>Review concept ↗</small></button>)}</div></section>;
}
