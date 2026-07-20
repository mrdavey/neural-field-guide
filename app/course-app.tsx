"use client";

import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { type Lesson, type LlmTrackId } from "./course-data";
import { LessonLab } from "./lesson-labs";
import { LessonFurtherReading, LessonGuideView, LessonNarrativeView } from "./lesson-guide-view";
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
import { CourseMotionOrchestrator } from "./motion/course-motion-orchestrator";
import { MotionReveal } from "./motion/motion-reveal";
import { ResearchCourseLab } from "./research-courses/lab";
import { ExternalExperimentView } from "./external-experiment-view";
import { externalExperiments } from "./external-experiments";
import { LessonConceptPlate } from "./lesson-concept-plate";
import { lessonNarrativeResult } from "./lesson-narrative-handoffs";
import { lessonVisualFor } from "./lesson-visuals";
import {
  continuityRecordForLesson,
  continuityRelationshipFor,
  isWorldModelAdvancedBranch,
  worldModelAdvancedBranchIds,
  worldModelResearchCapstoneId,
} from "./course-continuity";

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

function trackFor(course: CourseDefinition, id: string) {
  return course.tracks.find((track) => track.id === id)!;
}

function asSentence(value: string) {
  const text = value.trim();
  return /[.!?]$/.test(text) ? text : `${text}.`;
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
      <CourseMotionOrchestrator routeKey={current ? `${course.id}:${current.id}` : `${course.id}:home`} completed={completed} />
      <header className="topbar">
        <div className="topbar-primary">
          <button className="brand" onClick={openHome} aria-label="Go to course home">
            <span className="brand-mark">N</span>
            <span><strong>Neural</strong> Field Guide</span>
          </button>
          <label className="course-selector"><span>Course</span><select value={course.id} onChange={(event) => { const target = event.target.value as CourseId; localStorage.setItem(LAST_COURSE_KEY, target); window.location.assign(publicPath(`/${target}/`)); }}>{Object.values(courses).map((option) => <option key={option.id} value={option.id}>{option.selectorLabel}</option>)}</select></label>
        </div>
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
        {current ? <LessonView key={`${course.id}:${current.id}`} course={course} lesson={current} progress={progress} setProgress={setProgress} openLesson={openLesson} /> : <HomeView course={course} completed={completed} nextLesson={nextLesson} openLesson={openLesson} />}
      </main>
    </div>
  );
}

function HomeView({ course, completed, nextLesson, openLesson }: { course: CourseDefinition; completed: number; nextLesson: Lesson; openLesson: (id: string) => void }) {
  const { lessons, tracks, phases: learningPhases, curriculumMinutes, hero, campaign } = course;
  const labCount = lessons.filter((lesson) => lesson.lab).length;
  const codeExampleCount = Object.keys(course.codeExamples).length;
  return <div className="home-view">
    <section className="hero">
      <div className="hero-copy">
        <span className="kicker"><Icon name="spark" /> {course.title} · from first principles</span>
        <h1>{hero.heading}<br /><em>{hero.emphasis}</em></h1>
        <p className="hero-lede">{hero.lede}</p>
        <div className="hero-actions">
          <button className="primary-button" onClick={() => openLesson(nextLesson.id)}>{completed ? "Continue course" : "Start the course"}<span>→</span></button>
          <span className="time-note"><strong>{lessons.length} lessons</strong> · about {Math.round(curriculumMinutes / 60)} hours</span>
        </div>
      </div>
      <div className="hero-machine" aria-label={`A visual map of the ${course.title} learning loop`}>
        <div className="machine-label">{hero.machineLabel}</div>
        <div className="machine-row"><span className="data-chip">{hero.machineInput}</span><b>→</b><span className="data-chip orange">{hero.machineToken}</span></div>
        <div className="neural-grid">{Array.from({ length: 24 }).map((_, index) => <i key={index} style={{ "--delay": `${index * 45}ms` } as React.CSSProperties} />)}</div>
        <div className="machine-output"><span>{hero.machineOutputLabel}</span><strong>{hero.machineOutput}</strong><b>illustrative flow · not a measurement</b></div>
      </div>
    </section>

    <section className="course-pitch" aria-labelledby={`course-pitch-${course.id}`}>
      <header>
        <span className="eyebrow">Why {course.title}</span>
        <h2 id={`course-pitch-${course.id}`}>{campaign.promise}</h2>
        <p>{campaign.why}</p>
      </header>
      <div className="course-payoffs">
        {campaign.payoffs.map((payoff, index) => <article key={payoff.title}>
          <span>{String(index + 1).padStart(2, "0")} · {payoff.label}</span>
          <h3>{payoff.title}</h3>
          <p>{payoff.body}</p>
        </article>)}
      </div>
      <blockquote><span>The finish line</span><p>{campaign.finish}</p></blockquote>
    </section>

    <ScrollStory
      className="home-scroll-story"
      eyebrow="What you will build"
      title={hero.storyTitle}
      intro={<p>{hero.storyIntro}</p>}
      scene="pipeline"
      concept="pipeline"
      sceneLabels={hero.storyLabels}
      chromeLabel="NEURAL FIELD GUIDE / COURSE ARC"
      canvasHint={false}
      steps={learningPhases.map((phase) => ({
        label: `${phase.index} · ${phase.range}`,
        title: phase.title,
        body: <p>{phase.summary}</p>,
        note: <><strong>You unlock</strong><span>{phase.milestone}</span></>,
        signal: phase.range,
      }))}
    />

    <section className="course-manifest">
      <div className="section-heading"><span className="eyebrow">Inside the course</span><h2>One course. {tracks.length} connected frontiers.</h2><p>{hero.manifest}</p></div>
      <div className="track-grid">
        {tracks.map((track, index) => {
          const trackLessons = lessons.filter((lesson) => lesson.track === track.id);
          return <article className="track-card" key={track.id} style={{ "--track": track.color } as React.CSSProperties}>
            <div className="track-top"><span className="track-index">0{index + 1}</span><span className="track-line" /></div>
            <span className="eyebrow">{track.short}</span><h3>{track.title}</h3><p>{track.description}</p>
            <div className="track-outcome"><strong>{track.role === "specialization" ? "Explore when relevant" : "The payoff"}</strong><span>{track.outcome}</span></div>
            <div className="track-meta"><span>{trackLessons.length} lessons</span><span>{trackLessons.reduce((sum, item) => sum + item.duration, 0)} min</span></div>
            <button onClick={() => openLesson(trackLessons[0].id)}>Preview {track.short} <span>↗</span></button>
          </article>;
        })}
      </div>
    </section>

    <section className="learning-promise">
      <div><span className="big-stat">{lessons.length}</span><span>connected lessons</span></div>
      <div><span className="big-stat">{labCount}</span><span>hands-on labs</span></div>
      <div><span className="big-stat">{codeExampleCount}</span><span>code notebooks</span></div>
      <div className="promise-copy"><Icon name="map" /><p><strong>No black boxes.</strong> Build intuition, see the mechanism, then make the real engineering trade-offs.</p></div>
    </section>

    {course.homeSources?.length ? <section className="home-proof" aria-label={`${course.title} source foundation`}>
      <div><span className="eyebrow">Built from the field, not the hype</span><p>Primary work behind the course</p></div>
      <nav>{course.homeSources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><span>{source.claim}</span><strong>{source.title}</strong><b aria-hidden="true">↗</b></a>)}</nav>
    </section> : null}

    <section className="home-finale">
      <div><span className="eyebrow">Ready when you are</span><h2>{campaign.finish}</h2><p>{lessons.length} connected lessons, hands-on labs, and a complete end-to-end build.</p><button className="primary-button" onClick={() => openLesson(nextLesson.id)}>{completed ? "Continue course" : "Start the course"}<span>→</span></button></div>
      <aside><strong>Self-contained by default</strong><p>Browser labs use transparent teaching fixtures. Optional external runs are clearly labeled, and no required work depends on an account or paid service.</p><span>Reviewed {course.reviewedDate}</span></aside>
    </section>
  </div>;
}

function LessonView({ course, lesson, progress, setProgress, openLesson }: { course: CourseDefinition; lesson: Lesson; progress: Progress; setProgress: React.Dispatch<React.SetStateAction<Progress>>; openLesson: (id: string) => void }) {
  const { lessons, lessonById } = course;
  const index = lessons.findIndex((item) => item.id === lesson.id);
  const previous = lessons[index - 1];
  const next = lessons[index + 1];
  const selectedAnswer = progress.quizAnswers[lesson.id];
  const quizPassed = selectedAnswer === lesson.quiz.answer;
  const isComplete = progress.completed.includes(lesson.id);
  const track = trackFor(course, lesson.track);
  const guide = course.guides[lesson.id];
  const motionStory = course.motionStories[lesson.id];
  const lessonVisual = lessonVisualFor(course.id, lesson.id);
  const nextGuide = next ? course.guides[next.id] : undefined;
  const nextTrack = next ? trackFor(course, next.track) : undefined;
  const nextUsesThisLesson = Boolean(next?.prerequisites?.includes(lesson.id));
  const continuity = continuityRecordForLesson(course.id, lesson.id);
  const isSpecializationBranch = course.id === "worldmodel" && isWorldModelAdvancedBranch(lesson.id);
  const isSpecializationEntry = course.id === "worldmodel" && lesson.id === course.sharedCoreLessonId;
  const isSpecializationCapstone = course.id === "worldmodel" && lesson.id === worldModelResearchCapstoneId;
  const showSpecializationChooser = isSpecializationEntry || isSpecializationBranch;
  const specializationChoices = showSpecializationChooser
    ? worldModelAdvancedBranchIds
        .filter((id) => id !== lesson.id)
        .map((id) => lessonById[id])
        .filter(Boolean)
    : [];
  const specializationCapstone = course.id === "worldmodel" ? lessonById[worldModelResearchCapstoneId] : undefined;
  const externalExperiment = Object.values(externalExperiments).find((contract) => contract.courseId === course.id && contract.lessonId === lesson.id);
  const priorKnowledge = <>
    {continuity ? <p><MathText>{continuity.bridge}</MathText></p> : !lesson.prerequisites?.length && !lesson.programPrerequisites?.length ? <p>{lesson.number === 1 ? "No earlier lesson is required. Begin with the familiar situation in the opening paragraph and use it as the thread for the whole chapter." : "This chapter starts a new branch. Bring the shared core ideas and trace each new term from its definition."}</p> : null}
    {!continuity && lesson.prerequisites?.length ? <p><MathText>{`The chapter reuses ${lesson.prerequisites.map((id) => lessonById[id].title).join(" and ")}. In particular, keep this earlier idea available: ${lessonById[lesson.prerequisites.at(-1)!].keyIdeas[0]}`}</MathText></p> : null}
    {lesson.programPrerequisites?.length ? <ul className="program-prerequisite-list">{lesson.programPrerequisites.map((reference) => {
      const prerequisiteCourse = courses[reference.courseId as CourseId];
      const prerequisite = prerequisiteCourse?.lessonById[reference.lessonId];
      return prerequisiteCourse && prerequisite ? <li key={`${reference.courseId}:${reference.lessonId}`}><a href={publicPath(`/${reference.courseId}/${reference.lessonId}/`)}>{prerequisiteCourse.selectorLabel}: {prerequisite.title}</a><p><MathText>{prerequisite.keyIdeas[0]}</MathText></p></li> : null;
    })}</ul> : null}
  </>;
  const nextGoal = next ? nextGuide?.objectives[0] ?? next.keyIdeas[0] : "";
  const currentResult = asSentence(lessonNarrativeResult(course.id, lesson));
  const nextGoalSentence = nextGoal ? asSentence(nextGoal) : "";
  const nextRelationship = next ? continuityRelationshipFor({
    courseId: course.id,
    fromLessonId: lesson.id,
    toLessonId: next.id,
    sameTrack: lesson.track === next.track,
    directDependency: nextUsesThisLesson,
  }) : undefined;
  const nextUseCopy = isSpecializationCapstone
    ? "This completed protocol is the evidence-bearing conclusion of the course: preserve the result, null result, failures, and reproduction boundary together."
    : isSpecializationBranch
      ? "This mechanism can become the chosen branch in the final research study. The other advanced branches remain optional; continue to the capstone after completing one branch."
      : isSpecializationEntry
        ? "The shared spine is complete. Choose one advanced branch below, then carry that mechanism into the final research capstone."
        : next && nextRelationship === "direct reuse"
          ? `The next chapter, ${next.title}, directly reuses this chapter's mechanism for a new goal: ${nextGoalSentence}`
          : next && nextRelationship === "extension"
            ? `The next chapter, ${next.title}, extends this result with one new mechanism: ${nextGoalSentence}`
            : next && nextRelationship === "synthesis"
              ? `The next chapter, ${next.title}, combines this result with earlier interfaces to pursue a larger goal: ${nextGoalSentence}`
              : next
                ? `This chapter closes its present thread with this result: ${currentResult} The next chapter, ${next.title}, begins ${nextTrack?.title ?? "a new section"} with a different goal: ${nextGoalSentence}`
                : `Use this evidence contract when you evaluate a new ${course.subject} design.`;
  const nextUse = <p><MathText>{nextUseCopy}</MathText></p>;

  const answerQuiz = (answer: number) => setProgress((current) => ({ ...current, quizAnswers: { ...current.quizAnswers, [lesson.id]: answer } }));
  const toggleComplete = () => setProgress((current) => ({ ...current, completed: current.completed.includes(lesson.id) ? current.completed.filter((id) => id !== lesson.id) : [...current.completed, lesson.id] }));

  return <article className="lesson-view" style={{ "--track": track.color } as React.CSSProperties}>
    <div className="reading-progress" aria-hidden="true"><i /></div>
    <div className="lesson-breadcrumb"><button onClick={() => openLesson(lessons.find((item) => item.track === lesson.track)!.id)}>{track.title}</button><span>/</span><span>Lesson {String(lesson.number).padStart(2, "0")}</span><span className="lesson-time">{lesson.duration} min</span></div>
    <header className="lesson-header">
      <span className="lesson-index">{String(lesson.number).padStart(2, "0")}</span>
      <div><span className="eyebrow">{track.short}</span><h1>{lesson.title}</h1></div>
    </header>

    {guide && <LessonNarrativeView guide={guide} lessonId={lesson.id} lessonTitle={lesson.title} simple={lesson.simple} priorKnowledge={priorKnowledge} nextUse={nextUse} />}

    <LessonConceptPlate courseId={course.id} lesson={lesson} heading={motionStory.stages[0].title} />

    <ScrollStory
      key={lesson.id}
      className="lesson-motion-story"
      eyebrow={`${motionStory.stages[0].label} → ${motionStory.stages[3].label}`}
      title={<MathText>{motionStory.headline}</MathText>}
      intro={<p><MathText>{motionStory.intro}</MathText></p>}
      scene={course.id === "llm" ? lesson.track as LlmTrackId : "pipeline"}
      concept={motionStory.concept}
      sceneLabels={motionStory.stages.map((stage) => stage.label)}
      steps={motionStory.stages.map((stage, stageIndex) => ({
        label: `STEP ${String(stageIndex + 1).padStart(2, "0")}`,
        title: <MathText>{lessonVisual.labels[stageIndex]}</MathText>,
        body: <p><MathText>{lessonVisual.stageDescriptions[stageIndex]}</MathText></p>,
        signal: stage.label,
      }))}
    />

    {guide && <LessonGuideView guide={guide} lessonId={lesson.id} lessonTitle={lesson.title} coverage={course.objectiveCoverage[lesson.id]} example={course.codeExamples[lesson.id]} guidance={course.codeGuidance[lesson.id]} />}

    {lesson.lab && (lesson.lab === "research" && course.researchLabs?.[lesson.id] ? <ResearchCourseLab lessonTitle={lesson.title} spec={course.researchLabs[lesson.id]} /> : lesson.lab.startsWith("wm-") ? <WorldModelLab type={lesson.lab as WorldModelLabType} lesson={lesson} /> : <LessonLab type={lesson.lab as Exclude<NonNullable<Lesson["lab"]>, `wm-${string}` | "research">} lesson={lesson} />)}

    {guide && (course.transfers?.[lesson.id] ? <WorldModelTransferView lessonId={lesson.id} transfer={course.transfers[lesson.id]} /> : <LessonEvidenceView lesson={lesson} />)}

    {course.id === "llm" ? <TechnicalValidation lessonId={lesson.id} /> : course.id === "worldmodel" ? <WorldModelTechnicalValidation lessonId={lesson.id} /> : null}

    {masteryStudioLessons.has(lesson.id) && <Suspense fallback={<section className="workshop-loading" role="status">Preparing the decision studio…</section>}><MasteryStudio lessonId={lesson.id} /></Suspense>}

    {lesson.capstone && <SynthesisMap course={course} lesson={lesson} openLesson={openLesson} />}

    <section className="knowledge-check">
      <div className="quiz-heading"><span className="eyebrow">Retrieval practice</span><h2>Choose the answer your mechanism predicts.</h2><ActivityInfo mode="checked" title="Graded locally" detail="Feedback appears after your choice." /></div>
      <div className="quiz-card"><p className="quiz-question"><MathText>{lesson.quiz.question}</MathText></p><div className="quiz-options">
        {lesson.quiz.options.map((option, optionIndex) => {
          const answered = selectedAnswer !== undefined;
          const state = answered ? optionIndex === lesson.quiz.answer ? "correct" : optionIndex === selectedAnswer ? "incorrect" : "muted" : "";
          return <button disabled={answered} className={state} key={option} onClick={() => answerQuiz(optionIndex)}><span>{String.fromCharCode(65 + optionIndex)}</span><MathText>{option}</MathText></button>;
        })}
      </div>{selectedAnswer !== undefined && <MotionReveal stateKey={selectedAnswer} effect="feedback" className={`quiz-feedback ${selectedAnswer === lesson.quiz.answer ? "success" : "retry"}`} ariaLive="polite" role="status"><strong>{selectedAnswer === lesson.quiz.answer ? "Exactly right." : "Not quite—here’s the key."}</strong><p><MathText>{lesson.quiz.explanation}</MathText></p><button onClick={() => setProgress((current) => { const answers = { ...current.quizAnswers }; delete answers[lesson.id]; return { ...current, quizAnswers: answers }; })}>Try again</button></MotionReveal>}</div>
    </section>

    <section className="lesson-complete">
      <div><span className="eyebrow">Field note {lesson.number} of {lessons.length}</span><h2>{isComplete ? "Mastery is recorded in this browser." : quizPassed ? "The knowledge check passed." : "Pass the knowledge check to record mastery."}</h2></div>
      <button disabled={!isComplete && !quizPassed} className={isComplete ? "completed-button" : "primary-button"} onClick={toggleComplete}>{isComplete ? <><Icon name="check" /> Mastered</> : quizPassed ? <>Record mastery <span>✓</span></> : <>Mastery locked <span>○</span></>}</button>
    </section>

    {guide && <LessonFurtherReading guide={guide} lessonId={lesson.id} reviewedDate={course.reviewedDate} />}

    {externalExperiment && <ExternalExperimentView contract={externalExperiment} />}

    {lesson.id === "sft" && <Suspense fallback={<section className="workshop-loading" role="status">Preparing the practical fine-tuning workshop…</section>}><FineTuningWorkshop /></Suspense>}

    <CourseDiscussionPrompt lesson={lesson} lessonById={lessonById} subject={course.subject} />
    {showSpecializationChooser ? <section className="specialization-chooser" aria-labelledby={`specialization-chooser-${lesson.id}`}>
      <header><span className="eyebrow">Advanced is a branch, not a ladder</span><h2 id={`specialization-chooser-${lesson.id}`}>Choose the specialization that serves your goal.</h2><p>These topics share the core curriculum, but none is a prerequisite for the others. Continue where the trade-off or research question is useful to you.</p></header>
      <div>{specializationChoices.map((choice) => <button key={choice.id} onClick={() => openLesson(choice.id)}>
        <span>Lesson {String(choice.number).padStart(2, "0")}</span><strong>{choice.title}</strong>
        <small>Builds on {choice.prerequisites?.map((id) => lessonById[id].title).join(" + ") ?? "the shared core"}</small>
        <p><MathText>{course.guides[choice.id]?.objectives[0] ?? choice.keyIdeas[0]}</MathText></p>
      </button>)}</div>
      {specializationCapstone && <footer><div><span className="eyebrow">Synthesize after one branch</span><h3>{specializationCapstone.title}</h3><p>Complete one specialization above, then combine it with the shared operations and evidence contracts in the required final study.</p></div><button onClick={() => openLesson(specializationCapstone.id)}><span>Final synthesis →</span><strong>Open the research capstone</strong></button></footer>}
    </section> : !isSpecializationCapstone && next ? <section className="next-connection">
      <div><span className="eyebrow">{nextRelationship === "direct reuse" ? "Why the next lesson follows" : nextRelationship === "extension" ? "How the next lesson extends this" : nextRelationship === "synthesis" ? "What the next lesson combines" : "A new chapter thread"}</span><h2>Next: {next.title}</h2></div>
      <div className="next-connection-copy">
        <span>{nextRelationship === "new chapter thread" ? "This chapter leaves you with" : "You will carry forward"}</span><p><MathText>{currentResult}</MathText></p>
        <span>{nextRelationship === "new chapter thread" ? "The next question" : nextRelationship === "synthesis" ? "To combine" : "To learn"}</span><p><MathText>{nextGoalSentence}</MathText></p>
      </div>
    </section> : null}
    {showSpecializationChooser ? <nav className="lesson-pagination specialization-pagination" aria-label="Advanced specialization navigation">
      {isSpecializationEntry && previous ? <button onClick={() => openLesson(previous.id)}><span>← Previous</span><strong>{previous.title}</strong></button> : <button onClick={() => openLesson(course.sharedCoreLessonId)}><span>← Shared core</span><strong>{lessonById[course.sharedCoreLessonId].title}</strong></button>}
      <button className="next" onClick={() => document.querySelector(".specialization-chooser")?.scrollIntoView({ behavior: "smooth" })}><span>Advanced branches</span><strong>Choose above ↑</strong></button>
    </nav> : isSpecializationCapstone ? <nav className="lesson-pagination specialization-pagination" aria-label="Research capstone navigation">
      <button onClick={() => openLesson(course.sharedCoreLessonId)}><span>← Review shared core</span><strong>{lessonById[course.sharedCoreLessonId].title}</strong></button>
      <button className="next" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><span>Course complete</span><strong>Return to the top ↑</strong></button>
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
