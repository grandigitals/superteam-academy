import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, BookOpen, Award, Users, CheckCircle, ChevronRight, ArrowLeft } from 'lucide-react'
import { EnrollButton } from '@/components/courses/EnrollButton'
import { fetchCourseBySlug } from '@/services/CourseService'

interface Props {
    params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const course = await fetchCourseBySlug(slug)
    if (!course) return { title: 'Course Not Found' }
    return {
        title: course.title,
        description: course.description,
    }
}

const DIFFICULTY_COLOR: Record<string, string> = {
    beginner: 'border-sol-green/30 bg-sol-green/10 text-sol-green',
    intermediate: 'border-sol-blue/30 bg-sol-blue/10 text-sol-blue',
    advanced: 'border-sol-purple/30 bg-sol-purple/10 text-sol-purple',
}

export default async function CourseDetailPage({ params }: Props) {
    const { slug } = await params
    const course = await fetchCourseBySlug(slug)

    if (!course) notFound()

    const modules = course.modules ?? []
    const allLessons = modules.flatMap(m => m.lessons)
    const totalLessons = allLessons.length || course.lessonCount
    const completedCount = 0 // real progress comes from wallet-connected client

    const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

    return (
        <div className="min-h-screen px-4 py-10">
            <div className="mx-auto max-w-4xl">
                {/* Back */}
                <Link href="/courses" className="mb-6 inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-sol-green transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Courses
                </Link>

                {/* Hero Card */}
                <div className="mb-10 rounded-2xl border border-border bg-background-surface p-8">
                    <div className={`mb-3 inline-flex rounded-lg border px-3 py-1 text-xs font-semibold capitalize ${DIFFICULTY_COLOR[course.difficulty] ?? ''}`}>
                        {course.difficulty}
                    </div>
                    <h1 className="mb-3 font-display text-3xl font-bold sm:text-4xl">{course.title}</h1>
                    <p className="mb-6 text-foreground-muted leading-relaxed">{course.description}</p>

                    {/* Stats */}
                    <div className="mb-6 flex flex-wrap gap-6 text-sm text-foreground-muted">
                        <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" /> {course.durationMinutes} min
                        </span>
                        <span className="flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4" /> {totalLessons} lessons
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Users className="h-4 w-4" /> By {course.instructorName}
                        </span>
                        <span className="flex items-center gap-1.5 text-xp-gold">
                            <Award className="h-4 w-4" /> {course.xpReward.toLocaleString()} XP
                        </span>
                    </div>

                    {/* Progress bar (shows 0 for guests; client can hydrate) */}
                    {totalLessons > 0 && (
                        <div className="mb-6">
                            <div className="mb-1.5 flex justify-between text-xs text-foreground-subtle">
                                <span>{completedCount} / {totalLessons} lessons</span>
                                <span>{progressPct}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #14f195, #00c2ff)' }}
                                />
                            </div>
                        </div>
                    )}

                    <EnrollButton courseId={course.id} />
                </div>

                {/* Course Content */}
                <div className="space-y-4">
                    <h2 className="font-display text-xl font-bold">Course Content</h2>

                    {modules.length === 0 ? (
                        /* No modules from CMS yet — show a placeholder lesson list */
                        <div className="rounded-2xl border border-border bg-background-surface p-6 text-center text-foreground-muted">
                            <BookOpen className="mx-auto mb-3 h-8 w-8 opacity-40" />
                            <p className="text-sm">Course content is being prepared. Check back soon!</p>
                        </div>
                    ) : (
                        modules.map((module, mi) => (
                            <div key={module.id} className="rounded-2xl border border-border bg-background-surface overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                                    <h3 className="font-semibold text-foreground">
                                        Module {mi + 1}: {module.title}
                                    </h3>
                                    <span className="text-xs text-foreground-subtle">{module.lessons.length} lessons</span>
                                </div>
                                <ul className="divide-y divide-border">
                                    {module.lessons.map((lesson) => (
                                        <li key={lesson.id}>
                                            <Link
                                                href={`/courses/${slug}/lessons/${lesson.id}`}
                                                className="flex items-center gap-3 px-5 py-3.5 text-sm transition-colors hover:bg-white/5 group"
                                            >
                                                <div className="h-4 w-4 flex-shrink-0 rounded-full border border-border-strong" />
                                                <span className="flex-1 text-foreground group-hover:text-sol-green transition-colors">
                                                    {lesson.title}
                                                </span>
                                                {lesson.type === 'challenge' && (
                                                    <span className="rounded border border-sol-purple/30 bg-sol-purple/10 px-2 py-0.5 text-xs text-sol-purple">
                                                        Challenge
                                                    </span>
                                                )}
                                                {lesson.type === 'quiz' && (
                                                    <span className="rounded border border-sol-blue/30 bg-sol-blue/10 px-2 py-0.5 text-xs text-sol-blue">
                                                        Quiz
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-0.5 text-xs text-xp-gold">
                                                    <Award className="h-3 w-3" />{lesson.xpReward}
                                                </span>
                                                <ChevronRight className="h-3.5 w-3.5 text-foreground-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
