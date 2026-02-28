/**
 * SupabaseLeaderboardService
 *
 * Reads the leaderboard from a Supabase view `leaderboard_all_time`
 * (also computes weekly/monthly on the fly using date filters on xp_ledger).
 *
 * Fallback: if the view doesn't exist yet, aggregates from xp_ledger directly.
 */

import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { LeaderboardService } from '../interfaces'
import type { LeaderboardEntry, LeaderboardTimeframe } from '../types'
import { deriveLevel } from '@/lib/solana/xp'

export class SupabaseLeaderboardService implements LeaderboardService {
    async getLeaderboard(timeframe: LeaderboardTimeframe, limit = 10): Promise<LeaderboardEntry[]> {
        const db = getSupabaseAdmin()

        // Date filter for non-all-time timeframes
        let since: string | null = null
        if (timeframe === 'weekly') {
            const d = new Date(); d.setDate(d.getDate() - 7)
            since = d.toISOString()
        } else if (timeframe === 'monthly') {
            const d = new Date(); d.setMonth(d.getMonth() - 1)
            since = d.toISOString()
        }

        // Query xp_ledger grouped by wallet, LEFT joined to users for display_name
        // Using left join so wallets with no users row still appear on the leaderboard
        let query = db
            .from('xp_ledger')
            .select('wallet, amount, users(display_name)')

        if (since) {
            query = query.gte('created_at', since)
        }

        const { data, error } = await query

        if (error || !data) {
            console.warn('[SupabaseLeaderboardService] query error:', error?.message)
            return []
        }

        // Aggregate XP by wallet
        const totals = new Map<string, { xp: number; displayName: string | null }>()
        for (const row of data as Array<Record<string, unknown>>) {
            const wallet = String(row.wallet)
            const amount = Number(row.amount ?? 0)
            const userRecord = row.users as Record<string, unknown> | null
            const displayName = userRecord ? (String(userRecord.display_name ?? '') || null) : null

            const existing = totals.get(wallet) ?? { xp: 0, displayName }
            totals.set(wallet, { xp: existing.xp + amount, displayName: existing.displayName ?? displayName })
        }

        // Sort and rank
        return Array.from(totals.entries())
            .sort((a, b) => b[1].xp - a[1].xp)
            .slice(0, limit)
            .map(([wallet, { xp, displayName }], i) => ({
                rank: i + 1,
                wallet,
                displayName: displayName ?? undefined,
                xp,
                level: deriveLevel(xp),
            }))
    }

    async getUserRank(wallet: string, timeframe: LeaderboardTimeframe): Promise<number | null> {
        const all = await this.getLeaderboard(timeframe, 1000)
        const entry = all.find(e => e.wallet === wallet)
        return entry?.rank ?? null
    }
}
