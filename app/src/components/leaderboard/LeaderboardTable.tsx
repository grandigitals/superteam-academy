'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { LeaderboardEntry, LeaderboardTimeframe } from '@/services/types'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeaderboardTableProps {
    weekly: LeaderboardEntry[]
    monthly: LeaderboardEntry[]
    allTime: LeaderboardEntry[]
}

const TABS: { key: LeaderboardTimeframe; labelKey: string }[] = [
    { key: 'weekly', labelKey: 'weekly' },
    { key: 'monthly', labelKey: 'monthly' },
    { key: 'all-time', labelKey: 'allTime' },
]

const RANK_MEDALS = ['🥇', '🥈', '🥉']

export function LeaderboardTable({ weekly, monthly, allTime }: LeaderboardTableProps) {
    const t = useTranslations('leaderboard')
    const [tab, setTab] = useState<LeaderboardTimeframe>('weekly')

    const data = tab === 'weekly' ? weekly : tab === 'monthly' ? monthly : allTime

    return (
        <div>
            {/* Tabs */}
            <div className="mb-6 flex gap-2 rounded-xl border border-border bg-background-surface p-1">
                {TABS.map(({ key, labelKey }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={cn(
                            'flex-1 rounded-lg py-2 text-sm font-medium transition-all',
                            tab === key
                                ? 'bg-sol-green text-background shadow-lg'
                                : 'text-foreground-muted hover:text-foreground'
                        )}
                    >
                        {t(labelKey)}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="space-y-2">
                {data.map((entry, idx) => (
                    <div
                        key={entry.wallet}
                        className={cn(
                            'card-glass flex items-center gap-4 rounded-xl px-5 py-4 transition-all',
                            idx === 0 && 'border-xp-gold/30 bg-xp-gold/5'
                        )}
                    >
                        {/* Rank */}
                        <div className="w-8 flex-shrink-0 text-center">
                            {idx < 3 ? (
                                <span className="text-xl">{RANK_MEDALS[idx]}</span>
                            ) : (
                                <span className="font-mono text-sm font-bold text-foreground-subtle">#{entry.rank}</span>
                            )}
                        </div>

                        {/* Avatar placeholder */}
                        <div
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-background"
                            style={{ background: 'linear-gradient(135deg, #9945ff, #14f195)' }}
                        >
                            {(entry.displayName ?? entry.wallet)[0]?.toUpperCase()}
                        </div>

                        {/* Name + wallet */}
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-foreground truncate">{entry.displayName ?? `${entry.wallet.slice(0, 8)}...`}</div>
                            {entry.displayName && (
                                <div className="text-xs text-foreground-subtle truncate font-mono">{entry.wallet.slice(0, 12)}...</div>
                            )}
                        </div>

                        {/* Level */}
                        <LevelBadge xp={entry.xp} size="sm" />

                        {/* Streak */}
                        {entry.streak && (
                            <div className="hidden items-center gap-1 text-sm text-xp-gold sm:flex">
                                <Flame className="h-4 w-4" fill="currentColor" /> {entry.streak}
                            </div>
                        )}

                        {/* XP */}
                        <div className="font-mono text-sm font-bold text-sol-green">
                            {entry.xp.toLocaleString()} XP
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
