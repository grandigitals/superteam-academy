'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { LayoutDashboard, Flame, Award, BookOpen } from 'lucide-react'
import { XPBar } from '@/components/gamification/XPBar'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { CourseGrid } from '@/components/courses/CourseGrid'
import { WalletGate } from '@/components/wallet/WalletGate'
import { useAuthStore } from '@/store/useAuthStore'
import { useXP } from '@/hooks/useXP'
import { getEnrollmentsAction } from '@/app/actions/enrollment'
import { getStreakDataAction, getSkillsBreakdownAction, getTotalCompletedLessonsAction } from '@/app/actions/learning-progress'
import type { Enrollment } from '@/services/types'
import type { StreakData } from '@/services/types'
import { MOCK_COURSES } from '@/services/CourseService'

// Achievement definitions — only display when earned
const ALL_ACHIEVEMENTS = [
    {
        id: 'first-lesson',
        name: 'First Steps',
        icon: '🎯',
        xp: 100,
        desc: 'Completed your first lesson',
        earned: (totalLessons: number, _streak: number) => totalLessons >= 1,
    },
    {
        id: 'lessons-5',
        name: 'Getting Serious',
        icon: '📚',
        xp: 250,
        desc: 'Completed 5 lessons',
        earned: (totalLessons: number, _streak: number) => totalLessons >= 5,
    },
    {
        id: 'streak-3',
        name: '3-Day Streak',
        icon: '🔥',
        xp: 150,
        desc: '3 days in a row',
        earned: (_total: number, streak: number) => streak >= 3,
    },
    {
        id: 'streak-7',
        name: '7-Day Streak',
        icon: '⚡',
        xp: 500,
        desc: '7 days in a row',
        earned: (_total: number, streak: number) => streak >= 7,
    },
    {
        id: 'first-course',
        name: 'Course Complete',
        icon: '🏆',
        xp: 1000,
        desc: 'First course finished',
        earned: (totalLessons: number, _streak: number) => totalLessons >= 9,
    },
]

export default function DashboardPage() {
    const { publicKey } = useWallet()
    const { xp, isAuthenticated } = useAuthStore()
    const { refreshXP } = useXP()

    const [enrollments, setEnrollments] = useState<Enrollment[]>([])
    const [streak, setStreak] = useState<StreakData | null>(null)
    const [skills, setSkills] = useState<Array<{ subject: string; value: number }>>([])
    const [totalCompletedLessons, setTotalCompletedLessons] = useState(0)
    const [loadingData, setLoadingData] = useState(true)

    useEffect(() => {
        if (!publicKey || !isAuthenticated) { setLoadingData(false); return }
        const wallet = publicKey.toBase58()

        Promise.all([
            getEnrollmentsAction(wallet).then(res => res.enrollments),
            getStreakDataAction(wallet).then(res => res.streak),
            getSkillsBreakdownAction(wallet).then(res => res.skills),
            getTotalCompletedLessonsAction(wallet).then(res => res.count),
            refreshXP(),
        ]).then(([e, s, sk, count]) => {
            setEnrollments(e)
            setStreak(s ?? null)
            setSkills(sk)
            setTotalCompletedLessons(count)
        }).catch(console.warn).finally(() => setLoadingData(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publicKey, isAuthenticated])


    // Map enrollments to courses for CourseGrid
    const enrolledCourses = enrollments
        .map(e => MOCK_COURSES.find(c => c.id === e.courseId || c.slug === e.courseId))
        .filter(Boolean) as typeof MOCK_COURSES

    const currentStreak = streak?.currentStreak ?? 0
    const streakHistory = streak?.history ?? Array.from({ length: 7 }, () => ({ date: '', completed: false }))

    // Only show achievements the user has actually earned
    const earnedAchievements = ALL_ACHIEVEMENTS.filter(a => a.earned(totalCompletedLessons, currentStreak))

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
                            <div className="mt-2 font-display text-2xl font-bold text-foreground">
                                {loadingData ? '—' : earnedAchievements.length}
                            </div>
                            <div className="mt-1 flex gap-1">
                                {earnedAchievements.slice(0, 3).map(a => (
                                    <span key={a.id} className="text-base" title={a.name}>{a.icon}</span>
                                ))}
                                {earnedAchievements.length === 0 && !loadingData && (
                                    <span className="text-xs text-foreground-subtle">Complete lessons to earn!</span>
                                )}
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
                                    <Link href="/courses" className="text-sol-green hover:underline">Browse courses →</Link>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Skills Breakdown — same real data as the public profile */}
                    <div className="card-glass rounded-2xl p-6">
                        <h2 className="mb-4 font-display text-xl font-bold">Skills Breakdown</h2>
                        {loadingData ? (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="animate-pulse rounded-xl border border-border bg-white/5 h-16" />
                                ))}
                            </div>
                        ) : skills.length === 0 ? (
                            <div className="flex h-24 items-center justify-center rounded-xl border border-border bg-white/5 text-sm text-foreground-muted">
                                Enroll in courses to start tracking your skills!
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {skills.map(({ subject, value }) => (
                                    <div key={subject} className="rounded-xl border border-border bg-white/5 p-3">
                                        <div className="mb-1 flex justify-between text-xs">
                                            <span className="text-foreground-muted">{subject}</span>
                                            <span className="font-mono text-sol-green">{value}%</span>
                                        </div>
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                                            <div className="h-full rounded-full" style={{ width: `${value}%`, background: 'linear-gradient(90deg, #ffd23f, #008c4c)' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Achievements — only show EARNED ones */}
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <Award className="h-5 w-5 text-xp-gold" />
                            <h2 className="font-display text-xl font-bold">Achievements</h2>
                        </div>
                        {loadingData ? (
                            <div className="grid gap-3 sm:grid-cols-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="card-glass animate-pulse rounded-xl h-20" />
                                ))}
                            </div>
                        ) : earnedAchievements.length === 0 ? (
                            <div className="flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-white/5 text-foreground-muted">
                                <Award className="h-8 w-8 opacity-30" />
                                <p className="text-sm">No achievements yet — complete your first lesson!</p>
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-3">
                                {earnedAchievements.map(a => (
                                    <div key={a.id} className="card-glass flex items-center gap-3 rounded-xl p-4 border border-xp-gold/20 bg-xp-gold/5">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-xp-gold/10 text-xl flex-shrink-0">{a.icon}</div>
                                        <div>
                                            <div className="font-semibold text-sm">{a.name}</div>
                                            <div className="text-xs text-foreground-muted">{a.desc}</div>
                                            <div className="text-xs text-xp-gold">+{a.xp} XP</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </WalletGate>
    )
}
