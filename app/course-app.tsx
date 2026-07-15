"use client";

import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { type Lesson, type TrackId } from "./course-data";
import { LessonLab } from "./lesson-labs";
import { LessonFurtherReading, LessonGuideView } from "./lesson-guide-view";
import { LessonEvidenceView } from "./lesson-evidence-view";
import { CapstoneProjectView } from "./capstone-project-view";
import { MathText } from "./math-text";
import { TechnicalValidation } from "./technical-validations";
import { ActivityInfo } from "./activity-info";
import { publicPath } from "./public-path";
import { CourseDiscussionPrompt } from "./llm-discussion-prompt";
import { ScrollStory } from "./scroll-story";
import { courses, type CourseDefinition, type CourseId } from "./course-catalog";
import { WorldModelLab, type WorldModelLabType } from "./world-models/labs";
import { WorldModelTransferView } from "./world-models/transfer-view";
import { WorldModelTechnicalValidation } from "./world-models/technical-validations";

const FineTuningWorkshop = lazy(() => import("./fine-tuning-workshop"));
const MasteryStudio = lazy(() => import("./mastery-studios"));
const masteryStudioLessons = new Set(["embedding-layer", "pretraining-overview", "data-engineering", "advanced-objectives", "instruction-tuning-rlhf", "posttraining-overview", "tools-safety"]);

const LEGACY_LLM_STORAGE_KEY = "neural-field-guide-progress-v1";
const LAST_COURSE_KEY = "neural-field-guide-last-course-v1";

type Progress = { completed: string[]; quizAnswers: Record<string, number> };
type View = { kind: "home" } | { kind: "lesson"; id: string };
type TransitionDocument = Document & { startViewTransition?: (update: () => void) => unknown };

const emptyProgress: Progress = { completed: [], quizAnswers: {} };

function updateCourseView(update: () => void) {
  const transitionDocument = document as TransitionDocument;
  if (!transitionDocument.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    update();
    return;
  }
  transitionDocument.startViewTransition(() => flushSync(update));
}

function trackFor(course: CourseDefinition, id: TrackId) {
  return course.tracks.find((track) => track.id === id)!;
}

function Icon({ name }: { name: "spark" | "map" | "search" | "check" | "book" }) {
  const glyph = { spark: "✦", map: "⌘", search: "⌕", check: "✓", book: "▤" }[name];
  return <span className="icon" aria-hidden="true">{glyph}</span>;
}

export function CourseApp({ courseId = "llm", initialLessonId }: { courseId?: CourseId; initialLessonId?: string } = {}) {
  const course = courses[courseId];
  const { lessons, tracks, lessonById } = course;
  const storageKey = `neural-field-guide-progress-v2:${course.id}`;
  const [view, setView] = useState<View>(() => initialLessonId && lessonById[initialLessonId] ? { kind: "lesson", id: initialLessonId } : { kind: "home" });
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        let saved = localStorage.getItem(storageKey);
        if (!saved && course.id === "llm") {
          saved = localStorage.getItem(LEGACY_LLM_STORAGE_KEY);
          if (saved) localStorage.setItem(storageKey, saved);
        }
        if (saved) setProgress({ ...emptyProgress, ...JSON.parse(saved) });
        localStorage.setItem(LAST_COURSE_KEY, course.id);
      } catch { /* Local progress is optional. */ }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [course.id, storageKey]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [progress, ready, storageKey]);

  useEffect(() => {
    const syncViewToLocation = () => {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      const relativePath = window.location.pathname.slice(basePath.length).replace(/^\/+|\/+$/g, "");
      const segments = relativePath.split("/").filter(Boolean).map(decodeURIComponent);
      const lessonId = segments[0] === course.id ? segments[1] ?? "" : "";
      updateCourseView(() => {
        setView(lessonId && lessonById[lessonId] ? { kind: "lesson", id: lessonId } : { kind: "home" });
        setMobileNav(false);
        window.scrollTo({ top: 0, behavior: "auto" });
      });
    };

    window.addEventListener("popstate", syncViewToLocation);
    return () => window.removeEventListener("popstate", syncViewToLocation);
  }, [course.id, lessonById]);

  const current = view.kind === "lesson" ? lessonById[view.id] : undefined;
  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return lessons;
    return lessons.filter((lesson) => `${lesson.title} ${lesson.simple} ${trackFor(course, lesson.track).title}`.toLowerCase().includes(normalized));
  }, [course, lessons, query]);

  const openLesson = (id: string) => {
    window.history.pushState({ courseId: course.id, lessonId: id }, "", publicPath(`/${course.id}/${id}/`));
    updateCourseView(() => {
      setView({ kind: "lesson", id });
      setMobileNav(false);
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  };

  const openHome = () => {
    window.history.pushState({ courseId: course.id }, "", publicPath(`/${course.id}/`));
    updateCourseView(() => {
      setView({ kind: "home" });
      setMobileNav(false);
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  };

  useEffect(() => {
    document.title = current ? `${current.title} — ${course.title} — Neural Field Guide` : course.documentTitle;
  }, [course, current]);

  const completed = progress.completed.length;
  const percent = Math.round((completed / lessons.length) * 100);
  const nextLesson = lessons.find((lesson) => !progress.completed.includes(lesson.id)) ?? lessons[0];

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={openHome} aria-label="Go to course home">
          <span className="brand-mark">N</span>
          <span><strong>Neural</strong> Field Guide</span>
        </button>
        <div className="topbar-actions">
          <label className="course-selector"><span>Course</span><select value={course.id} onChange={(event) => { const target = event.target.value as CourseId; localStorage.setItem(LAST_COURSE_KEY, target); window.location.assign(publicPath(`/${target}/`)); }}><option value="llm">LLMs</option><option value="worldmodel">World Models</option></select></label>
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
        {current ? <LessonView key={`${course.id}:${current.id}`} course={course} lesson={current} progress={progress} setProgress={setProgress} openLesson={openLesson} /> : <HomeView course={course} completed={completed} nextLesson={nextLesson} openLesson={openLesson} />}
      </main>
    </div>
  );
}

function HomeView({ course, completed, nextLesson, openLesson }: { course: CourseDefinition; completed: number; nextLesson: Lesson; openLesson: (id: string) => void }) {
  const { lessons, tracks, phases: learningPhases, curriculumMinutes, hero } = course;
  const labCount = lessons.filter((lesson) => lesson.lab).length;
  const codeExampleCount = Object.keys(course.codeExamples).length;
  return <div className="home-view">
    <section className="hero">
      <div className="hero-copy">
        <span className="kicker"><Icon name="spark" /> Interactive learning expedition</span>
        <h1>{hero.heading}<br /><em>{hero.emphasis}</em></h1>
        <p className="hero-lede">{hero.lede}</p>
        <div className="hero-actions">
          <button className="primary-button" onClick={() => openLesson(nextLesson.id)}>{completed ? "Continue your journey" : "Start with the orientation"}<span>→</span></button>
          <span className="time-note"><strong>{Math.round(curriculumMinutes / 60)} hours</strong> · learn at your pace</span>
        </div>
      </div>
      <div className="hero-machine" aria-label={`A visual map of the ${course.title} learning loop`}>
        <div className="machine-label">{hero.machineLabel}</div>
        <div className="machine-row"><span className="data-chip">{hero.machineInput}</span><b>→</b><span className="data-chip orange">{hero.machineToken}</span></div>
        <div className="neural-grid">{Array.from({ length: 24 }).map((_, index) => <i key={index} style={{ "--delay": `${index * 45}ms` } as React.CSSProperties} />)}</div>
        <div className="machine-output"><span>{hero.machineOutputLabel}</span><strong>{hero.machineOutput}</strong><b>{course.id === "llm" ? "37%" : "± uncertainty"}</b></div>
      </div>
    </section>

    <ScrollStory
      className="home-scroll-story"
      eyebrow="Course sequence · scroll to assemble the system"
      title={hero.storyTitle}
      intro={<p>{hero.storyIntro}</p>}
      scene="pipeline"
      concept="pipeline"
      sceneLabels={hero.storyLabels}
      steps={learningPhases.map((phase) => ({
        label: `${phase.index} · ${phase.range}`,
        title: phase.title,
        body: <p>{phase.summary}</p>,
        note: <><strong>Milestone</strong><span>{phase.milestone}</span></>,
        signal: phase.range,
      }))}
    />

    <section className="course-manifest">
      <div className="section-heading"><span className="eyebrow">Curriculum map</span><h2>Seven territories. One connected story.</h2><p>{hero.manifest}</p></div>
      <div className="track-grid">
        {tracks.map((track, index) => {
          const trackLessons = lessons.filter((lesson) => lesson.track === track.id);
          return <article className="track-card" key={track.id} style={{ "--track": track.color } as React.CSSProperties}>
            <div className="track-top"><span className="track-index">0{index + 1}</span><span className="track-line" /></div>
            <span className="eyebrow">{track.short}</span><h3>{track.title}</h3><p>{track.description}</p>
            <div className="track-outcome"><strong>{track.role === "specialization" ? "Choose when relevant" : "You will be able to"}</strong><span>{track.outcome}</span></div>
            <div className="track-meta"><span>{trackLessons.length} lessons</span><span>{trackLessons.reduce((sum, item) => sum + item.duration, 0)} min</span></div>
            <button onClick={() => openLesson(trackLessons[0].id)}>Enter territory <span>↗</span></button>
          </article>;
        })}
      </div>
    </section>

    <section className="learning-promise">
      <div><span className="big-stat">{lessons.length}</span><span>connected lessons</span></div>
      <div><span className="big-stat">{labCount}</span><span>hands-on labs</span></div>
      <div><span className="big-stat">{codeExampleCount}</span><span>code notebooks</span></div>
      <div className="promise-copy"><Icon name="map" /><p><strong>Beginner-first, technically complete.</strong> Definitions lead into mechanisms, worked traces, trade-offs, and implementation details.</p></div>
    </section>
  </div>;
}

function LessonView({ course, lesson, progress, setProgress, openLesson }: { course: CourseDefinition; lesson: Lesson; progress: Progress; setProgress: React.Dispatch<React.SetStateAction<Progress>>; openLesson: (id: string) => void }) {
  const { lessons, lessonById } = course;
  const [depth, setDepth] = useState<"simple" | "deep">("simple");
  const index = lessons.findIndex((item) => item.id === lesson.id);
  const previous = lessons[index - 1];
  const next = lessons[index + 1];
  const selectedAnswer = progress.quizAnswers[lesson.id];
  const quizPassed = selectedAnswer === lesson.quiz.answer;
  const isComplete = progress.completed.includes(lesson.id);
  const track = trackFor(course, lesson.track);
  const guide = course.guides[lesson.id];
  const motionStory = course.motionStories[lesson.id];
  const nextGuide = next ? course.guides[next.id] : undefined;
  const nextBridgeParent = next
    ? lessonById[next.prerequisites?.includes(lesson.id) ? lesson.id : next.prerequisites?.at(-1) ?? lesson.id]
    : undefined;
  const specializationChoices = lesson.track === course.specializationTrackId
    ? lessons.filter((candidate) => candidate.track === course.specializationTrackId && candidate.id !== lesson.id)
    : [];

  const answerQuiz = (answer: number) => setProgress((current) => ({ ...current, quizAnswers: { ...current.quizAnswers, [lesson.id]: answer } }));
  const toggleComplete = () => setProgress((current) => ({ ...current, completed: current.completed.includes(lesson.id) ? current.completed.filter((id) => id !== lesson.id) : [...current.completed, lesson.id] }));

  return <article className="lesson-view" style={{ "--track": track.color } as React.CSSProperties}>
    <div className="reading-progress" aria-hidden="true"><i /></div>
    <div className="lesson-breadcrumb"><button onClick={() => openLesson(lessons.find((item) => item.track === lesson.track)!.id)}>{track.title}</button><span>/</span><span>Lesson {String(lesson.number).padStart(2, "0")}</span><span className="lesson-time">{lesson.duration} min</span></div>
    <header className="lesson-header">
      <span className="lesson-index">{String(lesson.number).padStart(2, "0")}</span>
      <div><span className="eyebrow">{track.short}</span><h1>{lesson.title}</h1></div>
    </header>

    {course.id === "worldmodel" && guide && <section className="world-model-orient" aria-labelledby={`world-model-orient-${lesson.id}`}>
      <header>
        <span className="eyebrow">Orient · outcome, language, and next use</span>
        <h2 id={`world-model-orient-${lesson.id}`}>Know what you are building before opening the mechanism.</h2>
        <p>{track.description}</p>
      </header>
      <div className="world-model-orient-grid">
        <article><span>Observable outcomes</span><ol>{guide.objectives.map((objective) => <li key={objective}><MathText>{objective}</MathText></li>)}</ol></article>
        <article><span>Prerequisite activation</span><p><MathText>{lesson.prerequisites?.length ? `Reuse ${lesson.prerequisites.map((id) => lessonById[id].title).join(" and ")}: ${lessonById[lesson.prerequisites.at(-1)!].keyIdeas[0]}` : "No prior world-model lesson is required. Bring only basic arithmetic and a willingness to trace one state change."}</MathText></p></article>
        <article><span>Where this is used next</span><p><MathText>{lesson.id === "world-model-research-capstone" ? "Use this protocol to package the final changed-case study, null result, and reproduction boundary." : lesson.track === course.specializationTrackId ? "Reuse this branch as the chosen mechanism in the falsifiable research capstone; the other advanced branches remain optional." : next ? `Next, ${next.title} reuses this lesson to ${nextGuide?.objectives[0]?.toLowerCase() ?? next.keyIdeas[0].toLowerCase()}.` : "Reuse this evidence contract when evaluating a new world-model design."}</MathText></p></article>
      </div>
      <div className="world-model-orient-vocabulary"><span>Define before use</span><dl>{guide.vocabulary.map((item) => <div key={item.term}><dt><MathText>{item.term}</MathText></dt><dd><MathText>{item.meaning}</MathText></dd></div>)}</dl></div>
    </section>}

    {lesson.prerequisites?.length ? <section className="knowledge-bridge" aria-labelledby={`knowledge-bridge-${lesson.id}`}>
      <header><span className="eyebrow">Prerequisite connection</span><h2 id={`knowledge-bridge-${lesson.id}`}>Connect prior knowledge to the new mechanism.</h2></header>
      <div className="bridge-flow">
        <div className="bridge-prerequisites">{lesson.prerequisites.map((id) => {
          const prerequisite = lessonById[id];
          return <button key={id} onClick={() => openLesson(id)}>
            <span>From lesson {String(prerequisite.number).padStart(2, "0")}</span>
            <strong>{prerequisite.title}</strong>
            <small>You already know</small>
            <p><MathText>{prerequisite.keyIdeas[0]}</MathText></p>
          </button>;
        })}</div>
        <span className="bridge-arrow" aria-hidden="true">→</span>
        <div className="bridge-new">
          <span>New layer</span>
          <strong>{lesson.title}</strong>
          <small>By the end, you can</small>
          <p><MathText>{guide?.objectives[0] ?? lesson.keyIdeas[0]}</MathText></p>
        </div>
      </div>
    </section> : null}

    <section className="definition-card">
      <div className="depth-toggle" role="group" aria-label="Explanation depth">
        <button className={depth === "simple" ? "active" : ""} onClick={() => setDepth("simple")}><span>01</span> Plain English</button>
        <button className={depth === "deep" ? "active" : ""} onClick={() => setDepth("deep")}><span>02</span> Under the hood</button>
      </div>
      <div className="definition-content" key={`${lesson.id}-${depth}`}>
        <span className="eyebrow">{depth === "simple" ? "Core idea" : "Mechanism and scope"}</span>
        <p className={depth === "simple" ? "simple-definition" : "deep-definition"}><MathText>{depth === "simple" ? lesson.simple : lesson.deep}</MathText></p>
      </div>
    </section>

    <ScrollStory
      className="lesson-motion-story"
      eyebrow={`${motionStory.stages[0].label} → ${motionStory.stages[3].label}`}
      title={<MathText>{motionStory.headline}</MathText>}
      intro={<p><MathText>{motionStory.intro}</MathText></p>}
      scene={course.id === "worldmodel" ? "pipeline" : lesson.track as Exclude<TrackId, `wm-${string}`>}
      concept={motionStory.concept}
      sceneLabels={motionStory.stages.map((stage) => stage.label)}
      steps={[
        {
          label: motionStory.stages[0].label,
          title: <MathText>{motionStory.stages[0].title}</MathText>,
          body: <p><MathText>{lesson.mentalModel}</MathText></p>,
          signal: motionStory.stages[0].label,
        },
        {
          label: motionStory.stages[1].label,
          title: <MathText>{motionStory.stages[1].title}</MathText>,
          body: <ol>{lesson.keyIdeas.map((idea, ideaIndex) => <li key={idea}><span>{String(ideaIndex + 1).padStart(2, "0")}</span><MathText>{idea}</MathText></li>)}</ol>,
          signal: motionStory.stages[1].label,
        },
        {
          label: motionStory.stages[2].label,
          title: <MathText>{motionStory.stages[2].title}</MathText>,
          body: <p><MathText>{lesson.example}</MathText></p>,
          signal: motionStory.stages[2].label,
        },
        {
          label: motionStory.stages[3].label,
          title: <MathText>{motionStory.stages[3].title}</MathText>,
          body: <p><MathText>{lesson.misconception}</MathText></p>,
          signal: motionStory.stages[3].label,
        },
      ]}
    />

    {guide && <LessonGuideView guide={guide} lessonId={lesson.id} lessonTitle={lesson.title} coverage={course.objectiveCoverage[lesson.id]} example={course.codeExamples[lesson.id]} guidance={course.codeGuidance[lesson.id]} showVocabulary={course.id !== "worldmodel"} />}

    {lesson.lab && (lesson.lab.startsWith("wm-") ? <WorldModelLab type={lesson.lab as WorldModelLabType} lesson={lesson} /> : <LessonLab type={lesson.lab as Exclude<NonNullable<Lesson["lab"]>, `wm-${string}`>} lesson={lesson} />)}

    {guide && (course.id === "worldmodel" && course.transfers?.[lesson.id] ? <WorldModelTransferView lessonId={lesson.id} transfer={course.transfers[lesson.id]} /> : <LessonEvidenceView lesson={lesson} guide={guide} />)}

    {course.id === "llm" ? <TechnicalValidation lessonId={lesson.id} /> : <WorldModelTechnicalValidation lessonId={lesson.id} />}

    {masteryStudioLessons.has(lesson.id) && <Suspense fallback={<section className="workshop-loading" role="status">Preparing the decision studio…</section>}><MasteryStudio lessonId={lesson.id} /></Suspense>}

    {lesson.id === "sft" && <Suspense fallback={<section className="workshop-loading" role="status">Preparing the practical fine-tuning workshop…</section>}><FineTuningWorkshop /></Suspense>}

    {lesson.capstone && <SynthesisMap course={course} lesson={lesson} openLesson={openLesson} />}

    <section className="knowledge-check">
      <div className="quiz-heading"><span className="eyebrow">Retrieval practice</span><h2>Choose the answer your mechanism predicts.</h2><p>Choose first. Explanations appear after you commit.</p><ActivityInfo mode="checked" title="This quiz is graded locally" detail="Choose one answer. The page immediately explains the correct distinction and lets you retry; passing unlocks the local mastery record." /></div>
      <div className="quiz-card"><p className="quiz-question"><MathText>{lesson.quiz.question}</MathText></p><div className="quiz-options">
        {lesson.quiz.options.map((option, optionIndex) => {
          const answered = selectedAnswer !== undefined;
          const state = answered ? optionIndex === lesson.quiz.answer ? "correct" : optionIndex === selectedAnswer ? "incorrect" : "muted" : "";
          return <button disabled={answered} className={state} key={option} onClick={() => answerQuiz(optionIndex)}><span>{String.fromCharCode(65 + optionIndex)}</span><MathText>{option}</MathText></button>;
        })}
      </div>{selectedAnswer !== undefined && <div className={`quiz-feedback ${selectedAnswer === lesson.quiz.answer ? "success" : "retry"}`} role="status"><strong>{selectedAnswer === lesson.quiz.answer ? "Exactly right." : "Not quite—here’s the key."}</strong><p><MathText>{lesson.quiz.explanation}</MathText></p><button onClick={() => setProgress((current) => { const answers = { ...current.quizAnswers }; delete answers[lesson.id]; return { ...current, quizAnswers: answers }; })}>Try again</button></div>}</div>
    </section>

    <section className="lesson-complete">
      <div><span className="eyebrow">Field note {lesson.number} of {lessons.length}</span><h2>{isComplete ? "Mastery is recorded in this browser." : quizPassed ? "The knowledge check passed." : "Pass the knowledge check to record mastery."}</h2></div>
      <button disabled={!isComplete && !quizPassed} className={isComplete ? "completed-button" : "primary-button"} onClick={toggleComplete}>{isComplete ? <><Icon name="check" /> Mastered</> : quizPassed ? <>Record mastery <span>✓</span></> : <>Mastery locked <span>○</span></>}</button>
    </section>

    {guide && <LessonFurtherReading guide={guide} lessonId={lesson.id} reviewedDate={course.id === "worldmodel" ? "14 Jul 2026" : "13 Jul 2026"} />}

    {lesson.sources && <aside className="source-notes lesson-extension"><div><span className="eyebrow">Optional source list</span><ActivityInfo mode="optional" /></div><div>{lesson.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}<span>↗</span></a>)}</div><p>The labeled reading cards above preserve whether each item is a paper, documentation, course, or explanatory article. This compact list repeats the links for convenience; use a source only to verify assumptions, scope, publication date, or a changing implementation detail before generalizing it.</p></aside>}
    <CourseDiscussionPrompt lesson={lesson} objectives={guide?.objectives} lessonById={lessonById} subject={course.subject} />
    {lesson.track === course.specializationTrackId ? <section className="specialization-chooser" aria-labelledby={`specialization-chooser-${lesson.id}`}>
      <header><span className="eyebrow">Advanced is a branch, not a ladder</span><h2 id={`specialization-chooser-${lesson.id}`}>Choose the specialization that serves your goal.</h2><p>These topics share the core curriculum, but none is a prerequisite for the others. Continue where the trade-off or research question is useful to you.</p></header>
      <div>{specializationChoices.map((choice) => <button key={choice.id} onClick={() => openLesson(choice.id)}>
        <span>Lesson {String(choice.number).padStart(2, "0")}</span><strong>{choice.title}</strong>
        <small>Builds on {choice.prerequisites?.map((id) => lessonById[id].title).join(" + ") ?? "the shared core"}</small>
        <p><MathText>{course.guides[choice.id]?.objectives[0] ?? choice.keyIdeas[0]}</MathText></p>
      </button>)}</div>
    </section> : next && nextBridgeParent ? <section className="next-connection">
      <div><span className="eyebrow">Why the next lesson follows</span><h2>Next: {next.title}</h2></div>
      <div className="next-connection-copy">
        <span>You will reuse</span><p><MathText>{nextBridgeParent.keyIdeas[0]}</MathText></p>
        <span>To learn</span><p><MathText>{nextGuide?.objectives[0] ?? next.keyIdeas[0]}</MathText></p>
      </div>
    </section> : null}
    {lesson.track === course.specializationTrackId ? <nav className="lesson-pagination specialization-pagination" aria-label="Advanced specialization navigation">
      <button onClick={() => openLesson(course.sharedCoreLessonId)}><span>← Shared core</span><strong>{lessonById[course.sharedCoreLessonId].title}</strong></button>
      <button className="next" onClick={() => document.querySelector(".specialization-chooser")?.scrollIntoView({ behavior: "smooth" })}><span>Advanced branches</span><strong>Choose above ↑</strong></button>
    </nav> : <nav className="lesson-pagination" aria-label="Lesson pagination">
      {previous ? <button onClick={() => openLesson(previous.id)}><span>← Previous</span><strong>{previous.title}</strong></button> : <span />}
      {next ? <button className="next" onClick={() => openLesson(next.id)}><span>Next →</span><strong>{next.title}</strong></button> : <button className="next" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><span>Course complete</span><strong>Return to the top ↑</strong></button>}
    </nav>}
  </article>;
}

function SynthesisMap({ course, lesson, openLesson }: { course: CourseDefinition; lesson: Lesson; openLesson: (id: string) => void }) {
  const map = course.synthesisMaps[lesson.id];
  const project = course.capstoneProjects[lesson.id];
  if (!map) return null;
  return <section className="synthesis-map">
    <div className="synthesis-intro"><span className="eyebrow">Capstone synthesis</span><h2>{map.title}</h2><p>{map.intro}</p></div>
    {project && <CapstoneProjectView project={project} courseId={course.id} evidencePack={course.capstoneEvidencePacks[lesson.id]} artifactFile={course.capstoneArtifactFiles[lesson.id]} />}
    <div className="synthesis-review"><span className="eyebrow">Review the evidence chain</span><div className="synthesis-links">{map.links.map((id, index) => <button key={id} onClick={() => openLesson(id)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{course.lessonById[id].title}</strong><small>Review concept ↗</small></button>)}</div></div>
  </section>;
}
