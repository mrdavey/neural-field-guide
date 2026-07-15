import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseApp } from "../course-app";
import { courseIds, courses, isCourseId } from "../course-catalog";
import { LegacyLessonRedirect } from "../route-redirects";

export const dynamicParams = false;

export function generateStaticParams() {
  return [...courseIds.map((courseId) => ({ courseId })), ...courses.llm.lessons.map((lesson) => ({ courseId: lesson.id }))];
}

export async function generateMetadata({ params }: { params: Promise<{ courseId: string }> }): Promise<Metadata> {
  const { courseId } = await params;
  if (isCourseId(courseId)) return { title: courses[courseId].documentTitle, description: courses[courseId].description };
  const legacyLesson = courses.llm.lessonById[courseId];
  return legacyLesson ? { title: `${legacyLesson.title} — Moved to the LLM course`, description: legacyLesson.simple, robots: { index: false, follow: true } } : {};
}

export default async function CourseLandingPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  if (isCourseId(courseId)) return <CourseApp courseId={courseId} />;
  if (courses.llm.lessonById[courseId]) return <LegacyLessonRedirect lessonId={courseId} />;
  notFound();
}

