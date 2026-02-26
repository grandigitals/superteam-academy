import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { Trophy } from 'lucide-react'
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'
import { createLeaderboardService } from '@/services/factory'

export const metadata: Metadata = { title: 'Leaderboard' }

export default async function LeaderboardPage() {
    const service = createLeaderboardService()
    const weekly = await service.getLeaderboard('weekly', 10)
    const monthly = await service.getLeaderboard('monthly', 10)
    const allTime = await service.getLeaderboard('all-time', 10)

    return (
        <div className="min-h-screen px-4 py-10">
            <div className="mx-auto max-w-3xl">
                {/* Header */}
                <div className="mb-8 flex items-center gap-3">
                    <Trophy className="h-7 w-7 text-xp-gold" />
                    <h1 className="font-display text-4xl font-bold">Leaderboard</h1>
                </div>

                <LeaderboardTable
                    weekly={weekly}
                    monthly={monthly}
                    allTime={allTime}
                />
            </div>
        </div>
    )
}
