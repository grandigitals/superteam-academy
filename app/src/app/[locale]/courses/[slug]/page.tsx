import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, BookOpen, Award, Users, CheckCircle, Lock, ChevronRight, ArrowLeft } from 'lucide-react'
import { EnrollButton } from '@/components/courses/EnrollButton'

interface Props {
    params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    return { title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }
}

// Mock modules for the demo course
const MOCK_MODULES = [
    {
        id: 'm1',
        title: 'Solana Basics',
        lessons: [
            { id: 'l1', title: 'What is Solana?', type: 'content', xp: 50, completed: true },
            { id: 'l2', title: 'Accounts and Ownership', type: 'content', xp: 50, completed: true },
            { id: 'l3', title: 'Transactions and Instructions', type: 'content', xp: 50, completed: false },
        ],
    },
    {
        id: 'm2',
        title: 'Wallet & Transactions',
        lessons: [
            { id: 'l4', title: 'Connecting a Wallet', type: 'content', xp: 50, completed: false },
            { id: 'l5', title: 'Sending SOL', type: 'content', xp: 75, completed: false },
            { id: 'l6', title: 'Challenge: Build a Transfer', type: 'challenge', xp: 200, completed: false },
        ],
    },
    {
        id: 'm3',
        title: 'Your First Program',
        lessons: [
            { id: 'l7', title: 'Hello World on-chain', type: 'content', xp: 75, completed: false },
            { id: 'l8', title: 'Challenge: Counter Program', type: 'challenge', xp: 300, completed: false },
            { id: 'l9', title: 'Challenge: Increment & Decrement', type: 'challenge', xp: 300, completed: false },
        ],
    },
]

export default async function CourseDetailPage({ params }: Props) {
    const { slug } = await params
    const title = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    const totalLessons = MOCK_MODULES.flatMap(m => m.lessons).length
    const completedCount = MOCK_MODULES.flatMap(m => m.lessons).filter(l => l.completed).length

    return (
        <div className="min-h-screen px-4 py-10">
            <div className="mx-auto max-w-4xl">
                {/* Back */}
                <Link href="/courses" className="mb-6 inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-sol-green transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Courses
                </Link>

                {/* Header */}
                <div className="mb-10 rounded-2xl border border-border bg-background-surface p-8">
                    <div className="mb-3 inline-flex rounded-lg border border-sol-green/30 bg-sol-green/10 px-3 py-1 text-xs font-semibold text-sol-green">Beginner</div>
                    <h1 className="mb-3 font-display text-3xl font-bold sm:text-4xl">{title}</h1>
                    <p className="mb-6 text-foreground-muted">Learn the Solana programming model: accounts, transactions, programs, and the runtime. Build your foundation for everything that follows.</p>

                    {/* Stats */}
                    <div className="mb-6 flex flex-wrap gap-6 text-sm text-foreground-muted">
                        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> 2 hours</span>
                        <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {totalLessons} lessons</span>
                        <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> 1,284 enrolled</span>
                        <span className="flex items-center gap-1.5 text-xp-gold"><Award className="h-4 w-4" /> 500 XP reward</span>
                    </div>

                    {/* Progress */}
                    <div className="mb-6">
                        <div className="mb-1.5 flex justify-between text-xs text-foreground-subtle">
                            <span>{completedCount} / {totalLessons} lessons</span>
                            <span>{Math.round((completedCount / totalLessons) * 100)}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${Math.round((completedCount / totalLessons) * 100)}%`, background: 'linear-gradient(90deg, #14f195, #00c2ff)' }}
                            />
                        </div>
                    </div>

                    <EnrollButton courseId={slug} />
                </div>

                {/* Modules */}
                <div className="space-y-4">
                    <h2 className="font-display text-xl font-bold">Course Content</h2>
                    {MOCK_MODULES.map((module, mi) => (
                        <div key={module.id} className="rounded-2xl border border-border bg-background-surface overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4">
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
                                            {lesson.completed ? (
                                                <CheckCircle className="h-4 w-4 flex-shrink-0 text-sol-green" />
                                            ) : (
                                                <div className="h-4 w-4 flex-shrink-0 rounded-full border border-border-strong" />
                                            )}
                                            <span className={lesson.completed ? 'text-foreground-muted line-through' : 'text-foreground group-hover:text-sol-green transition-colors'}>
                                                {lesson.title}
                                            </span>
                                            {lesson.type === 'challenge' && (
                                                <span className="ml-auto rounded border border-sol-purple/30 bg-sol-purple/10 px-2 py-0.5 text-xs text-sol-purple">Challenge</span>
                                            )}
                                            <span className="ml-auto flex items-center gap-0.5 text-xs text-xp-gold">
                                                <Award className="h-3 w-3" />{lesson.xp}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
