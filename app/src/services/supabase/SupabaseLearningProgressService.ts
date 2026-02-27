/**
 * SupabaseLearningProgressService
 *
 * Reads/writes lesson progress and XP to Supabase.
 * Tables used:
 *   lesson_completions(id, wallet, course_id, lesson_index, completed_at)
 *   xp_ledger(id, wallet, amount, reason, course_id, lesson_index, created_at)
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

        // Idempotent insert — ignore if already completed
        await db.from('lesson_completions').upsert(
            { wallet, course_id: courseId, lesson_index: lessonIndex, completed_at: new Date().toISOString() },
            { onConflict: 'wallet,course_id,lesson_index', ignoreDuplicates: true }
        )

        // Insert XP ledger entry (idempotent via same unique constraint)
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

        const totalXP = await this.getXPBalance(wallet)
        return { xpEarned: XP_PER_LESSON, totalXP }
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
            totalLessons: 0, // loaded from CourseService
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

        // Group by courseId
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

        // Get last 30 days of activity
        const since = new Date()
        since.setDate(since.getDate() - 30)

        const { data } = await db
            .from('lesson_completions')
            .select('completed_at')
            .eq('wallet', wallet)
            .gte('completed_at', since.toISOString())
            .order('completed_at', { ascending: false })

        const activeDates = new Set(
            (data as Record<string, unknown>[] ?? []).map(r =>
                new Date(String(r.completed_at)).toISOString().split('T')[0]
            )
        )

        // Build 7-day history
        const history: StreakDay[] = Array.from({ length: 7 }, (_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - (6 - i))
            const dateStr = d.toISOString().split('T')[0] ?? ''
            return { date: dateStr, completed: activeDates.has(dateStr) }
        })

        // Calculate current streak
        let currentStreak = 0
        let longestStreak = 0
        let checking = new Date()
        let tempStreak = 0

        for (let i = 0; i < 365; i++) {
            const dateStr = checking.toISOString().split('T')[0] ?? ''
            if (activeDates.has(dateStr)) {
                tempStreak++
                currentStreak = i === 0 ? tempStreak : currentStreak
                longestStreak = Math.max(longestStreak, tempStreak)
            } else {
                if (i === 0) currentStreak = 0
                break
            }
            checking.setDate(checking.getDate() - 1)
        }

        const lastActivity = data && (data as Record<string, unknown>[]).length > 0
            ? new Date(String((data as Record<string, unknown>[])[0]?.completed_at))
            : null

        return { currentStreak, longestStreak, lastActivity, history }
    }
}
