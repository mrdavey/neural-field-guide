import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseApp } from "../../course-app";
import { courseIds, courses, isCourseId } from "../../course-catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return courseIds.flatMap((courseId) => courses[courseId].lessons.map((lesson) => ({ courseId, lessonId: lesson.id })));
}

export async function generateMetadata({ params }: { params: Promise<{ courseId: string; lessonId: string }> }): Promise<Metadata> {
  const { courseId, lessonId } = await params;
  if (!isCourseId(courseId)) return {};
  const lesson = courses[courseId].lessonById[lessonId];
  if (!lesson) return {};
  return { title: `${lesson.title} — ${courses[courseId].title} — Neural Field Guide`, description: lesson.simple };
}

export default async function CourseLessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = await params;
  if (!isCourseId(courseId) || !courses[courseId].lessonById[lessonId]) notFound();
  return <CourseApp courseId={courseId} initialLessonId={lessonId} />;
}

