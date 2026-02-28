/**
 * SupabaseLearningProgressService
 *
 * Reads/writes lesson progress and XP to Supabase.
 * Tables used:
 *   lesson_completions(id, wallet, course_id, lesson_index, completed_at)
 *   xp_ledger(id, wallet, amount, reason, course_id, lesson_index, created_at)
 *
 * IMPORTANT: All tables use wallet TEXT as FK to users(wallet).
 * Must upsert the user row first before any insert into child tables.
 */

import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { LearningProgressService } from '../interfaces'
import type { CourseProgress, StreakData, StreakDay } from '../types'

export class SupabaseLearningProgressService implements LearningProgressService {
    async completeLesson(
        wallet: string,
        courseId: string,
        lessonIndex: number
    ): Promise<{ xpEarned: number; totalXP: number }> {
        const db = getSupabaseAdmin()
        const XP_PER_LESSON = 50

        // Step 1: Ensure user row exists (FK constraint requirement)
        await db
            .from('users')
            .upsert({ wallet }, { onConflict: 'wallet', ignoreDuplicates: true })

        // Step 2: Idempotent lesson completion
        await db.from('lesson_completions').upsert(
            { wallet, course_id: courseId, lesson_index: lessonIndex, completed_at: new Date().toISOString() },
            { onConflict: 'wallet,course_id,lesson_index', ignoreDuplicates: true }
        )

        // Step 3: Idempotent XP ledger entry
        await db.from('xp_ledger').upsert(
            {
                wallet,
                amount: XP_PER_LESSON,
                reason: 'lesson_complete',
                course_id: courseId,
                lesson_index: lessonIndex,
                created_at: new Date().toISOString(),
            },
            { onConflict: 'wallet,course_id,lesson_index', ignoreDuplicates: true }
        )

        // Step 4: Update streak
        await this.updateStreak(wallet)

        const totalXP = await this.getXPBalance(wallet)
        return { xpEarned: XP_PER_LESSON, totalXP }
    }

    private async updateStreak(wallet: string): Promise<void> {
        const db = getSupabaseAdmin()
        const today = new Date().toISOString().split('T')[0]!

        const { data: streakData } = await db
            .from('streaks')
            .select('*')
            .eq('wallet', wallet)
            .single()

        const lastActive = streakData?.last_active ?? null
        const current = streakData?.current ?? 0
        const longest = streakData?.longest ?? 0

        if (lastActive === today) return // Already updated today

        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]!

        const newCurrent = lastActive === yesterdayStr ? current + 1 : 1
        const newLongest = Math.max(longest, newCurrent)

        await db.from('streaks').upsert({
            wallet,
            current: newCurrent,
            longest: newLongest,
            last_active: today,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'wallet' })
    }

    async getCourseProgress(wallet: string, courseId: string): Promise<CourseProgress | null> {
        const db = getSupabaseAdmin()

        const { data: completions, error } = await db
            .from('lesson_completions')
            .select('lesson_index, completed_at')
            .eq('wallet', wallet)
            .eq('course_id', courseId)

        if (error || !completions) return null

        const { data: xpRows } = await db
            .from('xp_ledger')
            .select('amount')
            .eq('wallet', wallet)
            .eq('course_id', courseId)

        const xpEarned = (xpRows ?? []).reduce((sum: number, r: Record<string, unknown>) => sum + Number(r.amount ?? 0), 0)

        const enrollData = await db
            .from('enrollments')
            .select('enrolled_at, completed_at')
            .eq('wallet', wallet)
            .eq('course_id', courseId)
            .single()

        return {
            courseId,
            completedLessons: completions.map((c: Record<string, unknown>) => Number(c.lesson_index)),
            totalLessons: 0,
            xpEarned,
            enrolledAt: new Date(String(enrollData.data?.enrolled_at ?? Date.now())),
            completedAt: enrollData.data?.completed_at
                ? new Date(String(enrollData.data.completed_at))
                : undefined,
        }
    }

    async getAllProgress(wallet: string): Promise<CourseProgress[]> {
        const db = getSupabaseAdmin()

        const { data, error } = await db
            .from('lesson_completions')
            .select('course_id, lesson_index')
            .eq('wallet', wallet)

        if (error || !data) return []

        const grouped = (data as Record<string, unknown>[]).reduce<Record<string, number[]>>((acc, row) => {
            const cid = String(row.course_id)
            if (!acc[cid]) acc[cid] = []
            acc[cid]!.push(Number(row.lesson_index))
            return acc
        }, {})

        return Object.entries(grouped).map(([courseId, lessons]) => ({
            courseId,
            completedLessons: lessons,
            totalLessons: 0,
            xpEarned: lessons.length * 50,
            enrolledAt: new Date(),
        }))
    }

    async getXPBalance(wallet: string): Promise<number> {
        const db = getSupabaseAdmin()

        const { data, error } = await db
            .from('xp_ledger')
            .select('amount')
            .eq('wallet', wallet)

        if (error || !data) return 0
        return (data as Record<string, unknown>[]).reduce((sum, r) => sum + Number(r.amount ?? 0), 0)
    }

    async getStreakData(wallet: string): Promise<StreakData> {
        const db = getSupabaseAdmin()

        // Get streak record from streaks table
        const { data: streakRecord } = await db
            .from('streaks')
            .select('*')
            .eq('wallet', wallet)
            .single()

        const currentStreak = streakRecord?.current ?? 0
        const longestStreak = streakRecord?.longest ?? 0
        const lastActive = streakRecord?.last_active ? new Date(streakRecord.last_active) : null

        // Get last 7 days for activity history
        const since = new Date()
        since.setDate(since.getDate() - 7)

        const { data: completions } = await db
            .from('lesson_completions')
            .select('completed_at')
            .eq('wallet', wallet)
            .gte('completed_at', since.toISOString())

        const activeDates = new Set(
            (completions as Record<string, unknown>[] ?? []).map(r =>
                new Date(String(r.completed_at)).toISOString().split('T')[0]
            )
        )

        const history: StreakDay[] = Array.from({ length: 7 }, (_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - (6 - i))
            const dateStr = d.toISOString().split('T')[0] ?? ''
            return { date: dateStr, completed: activeDates.has(dateStr) }
        })

        return { currentStreak, longestStreak, lastActivity: lastActive, history }
    }
}
