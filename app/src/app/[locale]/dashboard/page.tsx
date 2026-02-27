'use client'

import { useEffect, useState } from 'react'
import type { Metadata } from 'next'
import { useWallet } from '@solana/wallet-adapter-react'
import { LayoutDashboard, Flame, Award, BookOpen } from 'lucide-react'
import { XPBar } from '@/components/gamification/XPBar'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { CourseGrid } from '@/components/courses/CourseGrid'
import { WalletGate } from '@/components/wallet/WalletGate'
import { useAuthStore } from '@/store/useAuthStore'
import { useXP } from '@/hooks/useXP'
import { createEnrollmentService, createLearningProgressService } from '@/services/factory'
import type { Enrollment } from '@/services/types'
import type { StreakData } from '@/services/types'
import { MOCK_COURSES } from '@/services/CourseService'

const ACHIEVEMENTS = [
    { id: 'first-lesson', name: 'First Steps', icon: '🎯', xp: 100, desc: 'Completed your first lesson' },
    { id: 'streak-7', name: '7-Day Streak', icon: '🔥', xp: 500, desc: '7 days in a row' },
    { id: 'first-course', name: 'Course Complete', icon: '🏆', xp: 1000, desc: 'First course finished' },
]

export default function DashboardPage() {
    const { publicKey } = useWallet()
    const { xp, isAuthenticated } = useAuthStore()
    const { refreshXP } = useXP()

    const [enrollments, setEnrollments] = useState<Enrollment[]>([])
    const [streak, setStreak] = useState<StreakData | null>(null)
    const [loadingData, setLoadingData] = useState(true)

    useEffect(() => {
        if (!publicKey || !isAuthenticated) { setLoadingData(false); return }
        const wallet = publicKey.toBase58()

        Promise.all([
            createEnrollmentService().getEnrollments(wallet),
            createLearningProgressService().getStreakData(wallet),
            refreshXP(),
        ]).then(([e, s]) => {
            setEnrollments(e)
            setStreak(s)
        }).catch(console.warn).finally(() => setLoadingData(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publicKey, isAuthenticated])

    // Map enrollments to courses for CourseGrid
    const enrolledCourses = enrollments
        .map(e => MOCK_COURSES.find(c => c.id === e.courseId || c.slug === e.courseId))
        .filter(Boolean) as typeof MOCK_COURSES

    const currentStreak = streak?.currentStreak ?? 0
    const streakHistory = streak?.history ?? Array.from({ length: 7 }, (_, i) => ({ date: '', completed: false }))

    return (
        <WalletGate requireAuth message="Connect your wallet to access your dashboard.">
            <div className="min-h-screen px-4 py-10">
                <div className="mx-auto max-w-7xl space-y-8">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <LayoutDashboard className="h-6 w-6 text-sol-green" />
                        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
                    </div>

                    {/* Stats row */}
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                        <div className="card-glass rounded-2xl p-5">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs text-foreground-muted uppercase tracking-wide">Total XP</span>
                                <LevelBadge xp={xp} size="sm" />
                            </div>
                            <div className="font-display text-2xl font-bold text-sol-green">{xp.toLocaleString()}</div>
                            <XPBar xp={xp} className="mt-2" showDetails={false} />
                        </div>

                        <div className="card-glass rounded-2xl p-5">
                            <span className="text-xs text-foreground-muted uppercase tracking-wide">Current Streak</span>
                            <div className="mt-2 flex items-end gap-2">
                                <span className="font-display text-2xl font-bold text-xp-gold">{currentStreak}</span>
                                <Flame className="mb-0.5 h-5 w-5 text-xp-gold" fill="currentColor" />
                                <span className="mb-0.5 text-sm text-foreground-muted">days</span>
                            </div>
                            <div className="mt-2 flex gap-1">
                                {streakHistory.map((day, i) => (
                                    <div
                                        key={i}
                                        className="h-4 w-4 rounded-sm"
                                        title={day.date}
                                        style={{ background: day.completed ? 'rgba(20,241,149,0.7)' : 'rgba(255,255,255,0.08)' }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="card-glass rounded-2xl p-5">
                            <span className="text-xs text-foreground-muted uppercase tracking-wide">Courses Active</span>
                            <div className="mt-2 font-display text-2xl font-bold text-foreground">
                                {loadingData ? '—' : enrolledCourses.length || enrollments.length}
                            </div>
                            <p className="mt-1 text-xs text-foreground-muted">
                                {enrollments.length > 0 ? 'Enrolled courses' : 'No courses yet'}
                            </p>
                        </div>

                        <div className="card-glass rounded-2xl p-5">
                            <span className="text-xs text-foreground-muted uppercase tracking-wide">Achievements</span>
                            <div className="mt-2 font-display text-2xl font-bold text-foreground">{ACHIEVEMENTS.length}</div>
                            <div className="mt-1 flex gap-1">
                                {ACHIEVEMENTS.slice(0, 3).map(a => (
                                    <span key={a.id} className="text-base">{a.icon}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Active Courses */}
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-sol-green" />
                            <h2 className="font-display text-xl font-bold">Active Courses</h2>
                        </div>
                        {loadingData ? (
                            <div className="flex h-32 items-center justify-center text-sm text-foreground-muted">
                                Loading your courses…
                            </div>
                        ) : enrolledCourses.length > 0 ? (
                            <CourseGrid courses={enrolledCourses} />
                        ) : (
                            <div className="flex h-32 flex-col items-center justify-center gap-2 text-foreground-muted">
                                <BookOpen className="h-8 w-8 opacity-30" />
                                <p className="text-sm">
                                    No courses enrolled yet.{' '}
                                    <a href="/courses" className="text-sol-green hover:underline">Browse courses →</a>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Recent Achievements */}
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <Award className="h-5 w-5 text-xp-gold" />
                            <h2 className="font-display text-xl font-bold">Achievements</h2>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            {ACHIEVEMENTS.map(a => (
                                <div key={a.id} className="card-glass flex items-center gap-3 rounded-xl p-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-xp-gold/10 text-xl">{a.icon}</div>
                                    <div>
                                        <div className="font-semibold text-sm">{a.name}</div>
                                        <div className="text-xs text-foreground-muted">{a.desc}</div>
                                        <div className="text-xs text-xp-gold">+{a.xp} XP</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </WalletGate>
    )
}
