'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { CheckCircle, Award, ChevronRight } from 'lucide-react'
import { createLearningProgressService, createEnrollmentService } from '@/services/factory'
import type { CourseModule, Lesson } from '@/services/types'

interface CourseContentClientProps {
    courseId: string
    slug: string
    modules: CourseModule[]
}

export function CourseContentClient({ courseId, slug, modules }: CourseContentClientProps) {
    const { publicKey } = useWallet()
    const [completedLessons, setCompletedLessons] = useState<number[]>([])
    const [isEnrolled, setIsEnrolled] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!publicKey) {
            setLoading(false)
            return
        }

        const wallet = publicKey.toBase58()
        Promise.all([
            createLearningProgressService().getCourseProgress(wallet, courseId),
            createEnrollmentService().isEnrolled(wallet, courseId)
        ]).then(([progress, enrolled]) => {
            if (progress) {
                setCompletedLessons(progress.completedLessons)
            }
            setIsEnrolled(enrolled)
        }).catch(console.error).finally(() => setLoading(false))

    }, [publicKey, courseId])

    // Helper to find the absolute index of a lesson across all modules (since completion is often stored as absolute index)
    // The current mock/supabase setup might just return lesson.index or absolute index.
    // Assuming lesson.index maps directly to the flags in bitmap.

    return (
        <div className="space-y-4">
            <h2 className="font-display text-xl font-bold">Course Content</h2>

            {modules.map((module, mi) => (
                <div key={module.id} className="rounded-2xl border border-border bg-background-surface overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                        <h3 className="font-semibold text-foreground">
                            Module {mi + 1}: {module.title}
                        </h3>
                        <span className="text-xs text-foreground-subtle">{module.lessons.length} lessons</span>
                    </div>
                    <ul className="divide-y divide-border">
                        {module.lessons.map((lesson: Lesson) => {
                            const isCompleted = completedLessons.includes(lesson.order)

                            return (
                                <li key={lesson.id}>
                                    <Link
                                        href={`/courses/${slug}/lessons/${lesson.id}`}
                                        className="flex items-center gap-3 px-5 py-3.5 text-sm transition-colors hover:bg-white/5 group"
                                    >
                                        <div className="h-5 w-5 flex-shrink-0 flex items-center justify-center">
                                            {isCompleted ? (
                                                <CheckCircle className="h-5 w-5 text-sol-green" />
                                            ) : (
                                                <div className="h-4 w-4 rounded-full border border-border-strong group-hover:border-sol-green/50 transition-colors" />
                                            )}
                                        </div>

                                        <span className={`flex-1 transition-colors ${isCompleted ? 'text-foreground-muted line-through' : 'text-foreground group-hover:text-sol-green'}`}>
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
                                        <span className="flex items-center gap-0.5 text-xs text-xp-gold opacity-80">
                                            <Award className="h-3 w-3" />{lesson.xpReward}
                                        </span>
                                        <ChevronRight className="h-3.5 w-3.5 text-foreground-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            ))}
        </div>
    )
}
