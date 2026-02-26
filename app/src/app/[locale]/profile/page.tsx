import type { Metadata } from 'next'
import { Twitter, Github, Trophy, BookOpen, Award } from 'lucide-react'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { XPBar } from '@/components/gamification/XPBar'

export const metadata: Metadata = { title: 'Profile' }

const SKILL_DATA = [
    { subject: 'Rust', value: 65 },
    { subject: 'Anchor', value: 45 },
    { subject: 'Frontend', value: 80 },
    { subject: 'Security', value: 30 },
    { subject: 'DeFi', value: 55 },
    { subject: 'Infrastructure', value: 40 },
]

const MOCK_XP = 2700
const MOCK_CREDENTIALS = [
    { id: '1', trackName: 'Solana Fundamentals', level: 1, xp: 1500, issuedAt: '2024-01-15', emoji: '⚡' },
    { id: '2', trackName: 'Token Development', level: 1, xp: 900, issuedAt: '2024-02-10', emoji: '🪙' },
]

export default function ProfilePage() {
    return (
        <div className="min-h-screen px-4 py-10">
            <div className="mx-auto max-w-4xl space-y-8">
                {/* Profile Header */}
                <div className="card-glass rounded-2xl p-8">
                    <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="h-20 w-20 rounded-full border-2 border-sol-green/40 bg-gradient-to-br from-sol-purple to-sol-blue flex items-center justify-center text-3xl font-bold text-background">
                                A
                            </div>
                            <LevelBadge xp={MOCK_XP} size="sm" className="absolute -bottom-1 -right-1" />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h1 className="font-display text-2xl font-bold">AliceDev</h1>
                            <p className="mt-1 text-sm text-foreground-muted">Building on Solana. One instruction at a time. 🦀</p>
                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-foreground-subtle">
                                <span>Joined Jan 2024</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5 text-xp-gold" /> Rank #3</span>
                            </div>
                            <div className="mt-3 flex gap-3">
                                <a href="#" className="text-foreground-muted hover:text-sol-green transition-colors"><Twitter className="h-4 w-4" /></a>
                                <a href="#" className="text-foreground-muted hover:text-sol-green transition-colors"><Github className="h-4 w-4" /></a>
                            </div>
                        </div>

                        {/* XP panel */}
                        <div className="w-full sm:w-48">
                            <div className="mb-1 flex items-center justify-between">
                                <span className="text-xs text-foreground-muted">Total XP</span>
                                <span className="font-mono text-sm font-bold text-sol-green">{MOCK_XP.toLocaleString()}</span>
                            </div>
                            <XPBar xp={MOCK_XP} showDetails={false} />
                        </div>
                    </div>
                </div>

                {/* Skills */}
                <div className="card-glass rounded-2xl p-6">
                    <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
                        Skills Breakdown
                    </h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {SKILL_DATA.map(({ subject, value }) => (
                            <div key={subject} className="rounded-xl border border-border bg-white/5 p-3">
                                <div className="mb-1 flex justify-between text-xs">
                                    <span className="text-foreground-muted">{subject}</span>
                                    <span className="font-mono text-sol-green">{value}%</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                                    <div className="h-full rounded-full" style={{ width: `${value}%`, background: 'linear-gradient(90deg, #14f195, #9945ff)' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Credentials */}
                <div>
                    <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
                        <Award className="h-5 w-5 text-xp-gold" /> On-Chain Credentials
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {MOCK_CREDENTIALS.map(c => (
                            <div key={c.id} className="card-glass relative overflow-hidden rounded-2xl p-5">
                                <div className="absolute inset-0 bg-gradient-to-br from-sol-purple/20 to-sol-green/10" />
                                <div className="relative">
                                    <div className="mb-2 text-3xl">{c.emoji}</div>
                                    <div className="font-bold">{c.trackName}</div>
                                    <div className="mt-1 text-xs text-foreground-muted">Level {c.level} · {c.xp.toLocaleString()} XP · Issued {c.issuedAt}</div>
                                    <div className="mt-3 inline-flex items-center gap-1 rounded border border-sol-green/30 bg-sol-green/10 px-2 py-0.5 text-xs text-sol-green">
                                        ✓ Verified On-Chain
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
