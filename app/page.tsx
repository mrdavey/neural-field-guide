import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./landing.css";
import { courseIds, courses, type CourseId } from "./course-catalog";
import { LandingCourseFinder, type LandingCourseProfile } from "./landing-course-finder";
import { publicPath } from "./public-path";

export const metadata: Metadata = {
  title: "Neural Field Guide — Understand intelligent systems from first principles",
  description: "Five self-contained, interactive courses in large language models, world models, generative models, reinforcement learning, and embodied AI.",
};

const coursePositioning: Record<CourseId, { code: string; goal: string; mechanism: string }> = {
  llm: {
    code: "LANGUAGE",
    goal: "I want to understand how language models actually work.",
    mechanism: "Text → tokens → representations → predictions",
  },
  worldmodel: {
    code: "IMAGINATION",
    goal: "I want to build systems that predict and plan.",
    mechanism: "Observation + action → possible futures",
  },
  generative: {
    code: "CREATION",
    goal: "I want to understand how models generate and control media.",
    mechanism: "Randomness + structure → controlled samples",
  },
  rl: {
    code: "DECISIONS",
    goal: "I want agents that learn from consequences.",
    mechanism: "Experience + reward → better decisions",
  },
  embodied: {
    code: "ACTION",
    goal: "I want to connect AI to robots and the physical world.",
    mechanism: "Perception + language → safe physical action",
  },
};

const totalLessons = courseIds.reduce((sum, courseId) => sum + courses[courseId].lessons.length, 0);
const totalMinutes = courseIds.reduce((sum, courseId) => sum + courses[courseId].curriculumMinutes, 0);
const totalLabs = courseIds.reduce((sum, courseId) => sum + courses[courseId].lessons.filter((lesson) => lesson.lab).length, 0);

const courseProfiles: LandingCourseProfile[] = courseIds.map((courseId) => {
  const course = courses[courseId];
  return {
    id: course.id,
    title: course.title,
    goal: coursePositioning[courseId].goal,
    promise: course.campaign.promise,
    description: course.description,
    lessons: course.lessons.length,
    hours: Math.round(course.curriculumMinutes / 60),
    accent: course.theme.accent,
    href: publicPath(`/${course.id}/`),
  };
});

const learningSequence = [
  ["Orient", "Know the outcome, prerequisites, and why the idea matters."],
  ["Learn", "See the plain-language intuition and the precise mechanism."],
  ["Try", "Change an input, trace the state, and explain what moved."],
  ["Test", "Commit to a changed-case answer and get specific feedback."],
  ["Extend", "Connect the idea to primary sources and a larger build."],
] as const;

export default function Home() {
  return (
    <div className="landing-shell">
      <a className="landing-skip-link" href="#landing-main">Skip to main content</a>
      <header className="landing-header">
        <a className="landing-brand" href={publicPath("/")} aria-label="Neural Field Guide home">
          <span className="landing-brand-mark" aria-hidden="true" />
          <span><strong>Neural</strong> Field Guide</span>
        </a>
        <nav aria-label="Landing page">
          <a href="#courses">Courses</a>
          <a href="#approach">How it works</a>
          <a className="landing-header-cta" href="#find-your-course">Find your course <span aria-hidden="true">↘</span></a>
        </nav>
      </header>

      <main id="landing-main">
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-copy">
            <span className="landing-kicker"><i aria-hidden="true" /> Five courses · one connected field guide</span>
            <h1 id="landing-title">Understand intelligent systems.<br /><em>From first principles.</em></h1>
            <p>Build a durable mental model of the ideas behind language, imagination, generation, decisions, and embodied action—then test that understanding in the browser.</p>
            <div className="landing-hero-actions">
              <a className="landing-primary-action" href="#courses">Explore all courses <span aria-hidden="true">↓</span></a>
              <span><strong>No account required.</strong> Learn at your own pace.</span>
            </div>
            <dl className="landing-hero-stats" aria-label="Course collection at a glance">
              <div><dt>Courses</dt><dd>{courseIds.length}</dd></div>
              <div><dt>Connected lessons</dt><dd>{totalLessons}</dd></div>
              <div><dt>Guided hours</dt><dd>{Math.round(totalMinutes / 60)}+</dd></div>
            </dl>
          </div>

          <div className="landing-field-map" aria-label="Five connected areas of intelligent systems">
            <div className="landing-map-grid" aria-hidden="true" />
            <div className="landing-map-core"><span>THE</span><strong>NEURAL</strong><span>FIELD</span></div>
            {courseIds.map((courseId, index) => {
              const course = courses[courseId];
              return <a
                className="landing-map-node"
                href={publicPath(`/${courseId}/`)}
                key={courseId}
                style={{ "--landing-accent": course.theme.accent } as CSSProperties}
              >
                <span>{String(index + 1).padStart(2, "0")} · {coursePositioning[courseId].code}</span>
                <strong>{course.selectorLabel}</strong>
                <small>{coursePositioning[courseId].mechanism}</small>
              </a>;
            })}
            <p>Interactive course map · select a field to enter</p>
          </div>
        </section>

        <section className="landing-trust-strip" aria-label="Learning commitments">
          <span>Mechanisms before abstractions</span>
          <span>Prediction before reveal</span>
          <span>Local, deterministic checks</span>
          <span>Primary sources over hype</span>
        </section>

        <section className="landing-courses" id="courses" aria-labelledby="courses-title">
          <header className="landing-section-heading">
            <span className="landing-eyebrow">Choose a field</span>
            <h2 id="courses-title">Five ways into the machinery.</h2>
            <p>Each course is complete on its own. Together they form a map of how modern intelligent systems represent, predict, create, decide, and act.</p>
          </header>
          <div className="landing-course-grid">
            {courseIds.map((courseId, index) => {
              const course = courses[courseId];
              const visibleTracks = course.tracks.slice(0, 3);
              return <article
                className="landing-course-card"
                key={courseId}
                style={{ "--landing-accent": course.theme.accent, "--landing-tint": course.theme.paperTint } as CSSProperties}
              >
                <a href={publicPath(`/${courseId}/`)} aria-label={`Explore the ${course.title} course`}>
                  <div className="landing-card-topline"><span>{String(index + 1).padStart(2, "0")} / 05</span><b>{coursePositioning[courseId].code}</b></div>
                  <h3>{course.title}</h3>
                  <p className="landing-card-promise">{course.campaign.promise}</p>
                  <p className="landing-card-description">{course.description}</p>
                  <ul aria-label={`${course.title} topics`}>
                    {visibleTracks.map((track) => <li key={track.id}>{track.title}</li>)}
                    {course.tracks.length > visibleTracks.length ? <li>+ {course.tracks.length - visibleTracks.length} more frontiers</li> : null}
                  </ul>
                  <footer>
                    <span><strong>{course.lessons.length}</strong> lessons</span>
                    <span><strong>{Math.round(course.curriculumMinutes / 60)}</strong> hours</span>
                    <b>Explore course <i aria-hidden="true">↗</i></b>
                  </footer>
                </a>
              </article>;
            })}
          </div>
        </section>

        <section className="landing-finder-section" id="find-your-course" aria-labelledby="finder-title">
          <header>
            <span className="landing-eyebrow">A useful place to begin</span>
            <h2 id="finder-title">Start with the question you cannot stop asking.</h2>
            <p>You do not need to take the courses in a fixed order. Choose the system you want to understand, then follow the cross-course links when your curiosity expands.</p>
          </header>
          <LandingCourseFinder profiles={courseProfiles} />
        </section>

        <section className="landing-approach" id="approach" aria-labelledby="approach-title">
          <header className="landing-section-heading">
            <span className="landing-eyebrow">The learning loop</span>
            <h2 id="approach-title">Understanding is something you do.</h2>
            <p>Every lesson moves from orientation to mechanism, from mechanism to action, and from action to evidence that your understanding transfers.</p>
          </header>
          <ol className="landing-learning-sequence">
            {learningSequence.map(([title, description], index) => <li key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h3>{title}</h3><p>{description}</p></div>
              {index < learningSequence.length - 1 ? <b aria-hidden="true">→</b> : null}
            </li>)}
          </ol>
          <div className="landing-proof-grid">
            <article className="landing-proof-lead">
              <span className="landing-eyebrow">Not completion theatre</span>
              <h3>See it. Change it. Explain it.</h3>
              <p>Invisible mechanisms become worked traces, inspectable diagrams, controlled simulations, and changed-case assessments. A click is never mistaken for mastery.</p>
              <div className="landing-proof-signal" aria-label="Change, observe, explain learning loop"><span>CHANGE</span><i aria-hidden="true" /><span>OBSERVE</span><i aria-hidden="true" /><span>EXPLAIN</span></div>
            </article>
            <article><strong>{totalLabs}</strong><span>browser-based labs</span><p>Small teaching fixtures make state and causality visible without a paid API.</p></article>
            <article><strong>100%</strong><span>self-contained core</span><p>Required explanations, practice, checks, hints, and answers work without an account.</p></article>
            <article><strong>Local</strong><span>assessment feedback</span><p>Deterministic checks diagnose the choice and offer a concrete retry path.</p></article>
            <article><strong>Real</strong><span>capstone evidence</span><p>Build cumulative artifacts with observable criteria, failure logs, and worked references.</p></article>
          </div>
        </section>

        <section className="landing-finale" aria-labelledby="finale-title">
          <div>
            <span className="landing-eyebrow">Your next question is the trailhead</span>
            <h2 id="finale-title">The machines are complex.<br />Your path in does not have to be.</h2>
            <p>Choose one field, begin with one concrete mechanism, and leave with a mental model you can use to build, evaluate, and challenge intelligent systems.</p>
            <a className="landing-primary-action" href="#courses">Choose your course <span aria-hidden="true">↑</span></a>
          </div>
          <nav aria-label="All courses">
            {courseIds.map((courseId, index) => <a key={courseId} href={publicPath(`/${courseId}/`)}>
              <span>{String(index + 1).padStart(2, "0")}</span><strong>{courses[courseId].title}</strong><b aria-hidden="true">↗</b>
            </a>)}
          </nav>
        </section>
      </main>

      <footer className="landing-footer">
        <a className="landing-brand" href={publicPath("/")} aria-label="Neural Field Guide home">
          <span className="landing-brand-mark" aria-hidden="true" />
          <span><strong>Neural</strong> Field Guide</span>
        </a>
        <p>Five courses for building durable understanding of intelligent systems.</p>
        <a href="#courses">Back to courses ↑</a>
      </footer>
    </div>
  );
}
