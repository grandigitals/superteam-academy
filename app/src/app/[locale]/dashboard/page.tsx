import type { Metadata } from 'next'
import { LayoutDashboard, Flame, Award, BookOpen, TrendingUp } from 'lucide-react'
import { XPBar } from '@/components/gamification/XPBar'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { CourseGrid } from '@/components/courses/CourseGrid'
import { WalletGate } from '@/components/wallet/WalletGate'

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'Your Superteam Academy learning dashboard',
}

const ACTIVE_COURSES = [
    { id: '1', slug: 'intro-to-solana', title: 'Introduction to Solana', description: 'Learn the basics', difficulty: 'beginner' as const, durationMinutes: 120, xpReward: 500, thumbnailUrl: '', instructorName: 'Superteam', moduleCount: 3, lessonCount: 9 },
    { id: '4', slug: 'solana-token-2022', title: 'Token-2022 Deep Dive', description: 'Token extensions', difficulty: 'intermediate' as const, durationMinutes: 180, xpReward: 900, thumbnailUrl: '', instructorName: 'Superteam', moduleCount: 4, lessonCount: 14 },
]

const ACHIEVEMENTS = [
    { id: 'first-lesson', name: 'First Steps', icon: '🎯', xp: 100, desc: 'Completed your first lesson' },
    { id: 'streak-7', name: '7-Day Streak', icon: '🔥', xp: 500, desc: '7 days in a row' },
    { id: 'first-course', name: 'Course Complete', icon: '🏆', xp: 1000, desc: 'First course finished' },
]

export default function DashboardPage() {
    const MOCK_XP = 2700
    const MOCK_STREAK = 4

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
                                <LevelBadge xp={MOCK_XP} size="sm" />
                            </div>
                            <div className="font-display text-2xl font-bold text-sol-green">{MOCK_XP.toLocaleString()}</div>
                            <XPBar xp={MOCK_XP} className="mt-2" showDetails={false} />
                        </div>

                        <div className="card-glass rounded-2xl p-5">
                            <span className="text-xs text-foreground-muted uppercase tracking-wide">Current Streak</span>
                            <div className="mt-2 flex items-end gap-2">
                                <span className="font-display text-2xl font-bold text-xp-gold">{MOCK_STREAK}</span>
                                <Flame className="mb-0.5 h-5 w-5 text-xp-gold" fill="currentColor" />
                                <span className="mb-0.5 text-sm text-foreground-muted">days</span>
                            </div>
                            {/* Mini streak calendar */}
                            <div className="mt-2 flex gap-1">
                                {Array.from({ length: 7 }, (_, i) => (
                                    <div
                                        key={i}
                                        className="h-4 w-4 rounded-sm"
                                        style={{
                                            background: i >= 7 - MOCK_STREAK ? 'rgba(20,241,149,0.7)' : 'rgba(255,255,255,0.08)',
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="card-glass rounded-2xl p-5">
                            <span className="text-xs text-foreground-muted uppercase tracking-wide">Courses Active</span>
                            <div className="mt-2 font-display text-2xl font-bold text-foreground">{ACTIVE_COURSES.length}</div>
                            <p className="mt-1 text-xs text-foreground-muted">In progress</p>
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
                        <CourseGrid
                            courses={ACTIVE_COURSES}
                            showProgress
                            progressMap={{ '1': 44, '4': 12 }}
                        />
                    </div>

                    {/* Recent Achievements */}
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <Award className="h-5 w-5 text-xp-gold" />
                            <h2 className="font-display text-xl font-bold">Recent Achievements</h2>
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
