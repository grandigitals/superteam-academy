import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, BookOpen, Award, Users, ArrowLeft } from 'lucide-react'
import { EnrollButton } from '@/components/courses/EnrollButton'
import { CourseContentClient } from '@/components/courses/CourseContentClient'
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
                                    style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #ffd23f, #008c4c)' }}
                                />
                            </div>
                        </div>
                    )}

                    <EnrollButton courseId={course.id} />
                </div>

                {/* Course Content */}
                {modules.length === 0 ? (
                    <div className="space-y-4">
                        <h2 className="font-display text-xl font-bold">Course Content</h2>
                        <div className="rounded-2xl border border-border bg-background-surface p-6 text-center text-foreground-muted">
                            <BookOpen className="mx-auto mb-3 h-8 w-8 opacity-40" />
                            <p className="text-sm">Course content is being prepared. Check back soon!</p>
                        </div>
                    </div>
                ) : (
                    <CourseContentClient courseId={course.id} slug={slug} modules={modules} />
                )}
            </div>
        </div>
    )
}
