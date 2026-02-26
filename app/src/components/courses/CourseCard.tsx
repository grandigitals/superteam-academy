import Link from 'next/link'
import { Award, Clock, BookOpen, ChevronRight } from 'lucide-react'
import type { Course } from '@/services/types'
import { cn } from '@/lib/utils'

interface CourseCardProps {
    course: Course
    progress?: number
}

const DIFFICULTY_STYLES = {
    beginner: 'text-sol-green border-sol-green/30 bg-sol-green/10',
    intermediate: 'text-sol-blue border-sol-blue/30 bg-sol-blue/10',
    advanced: 'text-sol-purple border-sol-purple/30 bg-sol-purple/10',
}

export function CourseCard({ course, progress }: CourseCardProps) {
    return (
        <Link
            href={`/courses/${course.slug}`}
            className="card-glass card-glow-green group flex flex-col rounded-2xl transition-all duration-300 hover:scale-[1.01]"
        >
            {/* Thumbnail */}
            <div className="relative h-40 overflow-hidden rounded-t-2xl bg-gradient-to-br from-sol-purple/30 to-sol-blue/20">
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <BookOpen className="h-16 w-16" />
                </div>
                <div className={cn('absolute top-3 left-3 rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize', DIFFICULTY_STYLES[course.difficulty])}>
                    {course.difficulty}
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-sol-green transition-colors">
                    {course.title}
                </h3>
                <p className="flex-1 text-sm text-foreground-muted line-clamp-2">{course.description}</p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-foreground-subtle">
                    <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {course.durationMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {course.lessonCount} lessons
                    </span>
                    <span className="flex items-center gap-1 text-xp-gold">
                        <Award className="h-3.5 w-3.5" />
                        {course.xpReward.toLocaleString()} XP
                    </span>
                </div>

                {/* Progress bar */}
                {progress !== undefined && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-foreground-subtle">
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #14f195, #00c2ff)' }}
                            />
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-1 text-xs font-medium text-sol-green opacity-0 group-hover:opacity-100 transition-opacity">
                    View course <ChevronRight className="h-3.5 w-3.5" />
                </div>
            </div>
        </Link>
    )
}
