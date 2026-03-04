'use server'

/**
 * Server actions for learning progress operations.
 * These run on the server and have access to SUPABASE_SERVICE_ROLE_KEY.
 */

import { createLearningProgressService } from '@/services/factory'
import type { CourseProgress, StreakData } from '@/services/types'
import { fetchAllCourses } from '@/services/CourseService'
import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const COURSE_COMPLETE_XP = 1000

export async function completeLessonAction(
    wallet: string,
    courseId: string,
    lessonIndex: number
): Promise<{ success: boolean; xpEarned?: number; totalXP?: number; courseCompleted?: boolean; error?: string }> {
    try {
        const service = createLearningProgressService()
        const result = await service.completeLesson(wallet, courseId, lessonIndex)

        // Check if the course is now fully completed (all lessons done)
        let courseCompleted = false
        try {
            const progress = await service.getCourseProgress(wallet, courseId)
            const courses = await fetchAllCourses()
            const course = courses.find(c => c.id === courseId || c.slug === courseId)
            const totalLessons = course?.modules?.flatMap(m => m.lessons).length ?? course?.lessonCount ?? 0

            if (
                progress &&
                totalLessons > 0 &&
                progress.completedLessons.length >= totalLessons
            ) {
                // Award course complete bonus XP (idempotent — unique constraint prevents double award)
                const db = getSupabaseAdmin()
                const { error: xpErr } = await db.from('xp_ledger').upsert(
                    {
                        wallet,
                        amount: COURSE_COMPLETE_XP,
                        reason: 'course_complete',
                        course_id: courseId,
                        lesson_index: -1, // sentinel for course-level reward
                        created_at: new Date().toISOString(),
                    },
                    { onConflict: 'wallet,course_id,lesson_index', ignoreDuplicates: true }
                )
                if (!xpErr) {
                    courseCompleted = true
                    // Mark enrollment as completed
                    await db.from('enrollments').update({
                        completed_at: new Date().toISOString(),
                        progress_pct: 100,
                        xp_earned: progress.completedLessons.length * 50 + COURSE_COMPLETE_XP,
                    }).eq('wallet', wallet).eq('course_id', courseId)
                }
            }
        } catch (bonusErr) {
            console.warn('[completeLessonAction] course bonus check failed:', bonusErr)
        }

        revalidatePath('/[locale]/courses/[slug]/lessons/[id]', 'page')
        revalidatePath('/[locale]/courses/[slug]', 'page')
        revalidatePath('/', 'layout')

        const finalXP = await service.getXPBalance(wallet)
        return { success: true, xpEarned: result.xpEarned, totalXP: finalXP, courseCompleted }
    } catch (error) {
        console.error('[completeLessonAction]', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to complete lesson'
        }
    }
}

export async function getCourseProgressAction(
    wallet: string,
    courseId: string
): Promise<{ progress: CourseProgress | null; error?: string }> {
    try {
        const service = createLearningProgressService()
        const progress = await service.getCourseProgress(wallet, courseId)
        return { progress }
    } catch (error) {
        console.error('[getCourseProgressAction]', error)
        return {
            progress: null,
            error: error instanceof Error ? error.message : 'Failed to get progress'
        }
    }
}

export async function getXPBalanceAction(
    wallet: string
): Promise<{ xp: number; error?: string }> {
    try {
        const service = createLearningProgressService()
        const xp = await service.getXPBalance(wallet)
        return { xp }
    } catch (error) {
        console.error('[getXPBalanceAction]', error)
        return {
            xp: 0,
            error: error instanceof Error ? error.message : 'Failed to get XP'
        }
    }
}

export async function getStreakDataAction(
    wallet: string
): Promise<{ streak: StreakData | null; error?: string }> {
    try {
        const service = createLearningProgressService()
        const streak = await service.getStreakData(wallet)
        return { streak }
    } catch (error) {
        console.error('[getStreakDataAction]', error)
        return {
            streak: null,
            error: error instanceof Error ? error.message : 'Failed to get streak data'
        }
    }
}

/**
 * Skills breakdown — uses getAllProgress() which reads directly from lesson_completions.
 * This matches the same data source as the public profile page.
 */
export async function getSkillsBreakdownAction(wallet: string): Promise<{ skills: Array<{ subject: string; value: number }> }> {
    try {
        const service = createLearningProgressService()
        const courses = await fetchAllCourses()

        // Use getAllProgress (reads lesson_completions directly — same as public profile)
        const allProgress = await service.getAllProgress(wallet)

        let totalCompleted = 0
        allProgress.forEach(p => totalCompleted += p.completedLessons.length)

        if (totalCompleted === 0) return { skills: [] }

        // Calculate per-track completion based on actual lesson counts
        const trackLessons: Record<string, number> = {}
        const trackCompleted: Record<string, number> = {}

        for (const course of courses) {
            const track = (course.track || 'fundamentals').toLowerCase()
            const courseLessons = course.modules?.flatMap(m => m.lessons).length ?? course.lessonCount ?? 0
            trackLessons[track] = (trackLessons[track] ?? 0) + courseLessons

            const progress = allProgress.find(p => p.courseId === course.id || p.courseId === course.slug)
            const completedInCourse = progress?.completedLessons.length ?? 0
            trackCompleted[track] = (trackCompleted[track] ?? 0) + completedInCourse
        }

        const skills = Object.entries(trackLessons)
            .filter(([, total]) => total > 0)
            .map(([trackId, total]) => {
                let subject = trackId.charAt(0).toUpperCase() + trackId.slice(1)
                if (subject === 'Defi') subject = 'DeFi'
                if (subject === 'Nft') subject = 'NFT'
                const completed = trackCompleted[trackId] ?? 0
                const value = Math.min(100, Math.round((completed / total) * 100))
                return { subject, value }
            })
            .filter(s => s.value > 0)
            .sort((a, b) => b.value - a.value)

        return { skills }
    } catch (error) {
        console.error('[getSkillsBreakdownAction]', error)
        return { skills: [] }
    }
}

/**
 * Count total completed lessons across ALL courses directly from lesson_completions.
 */
export async function getTotalCompletedLessonsAction(wallet: string): Promise<{ count: number; error?: string }> {
    try {
        const service = createLearningProgressService()
        const xp = await service.getXPBalance(wallet)
        // Each lesson = 50 XP; course bonus = 1000 XP with lesson_index -1 (excluded from count)
        // XP ledger UNIQUE on (wallet, course_id, lesson_index) — no double counting
        // Subtract course-complete bonuses from XP count
        const db = getSupabaseAdmin()
        const { count: bonusCount } = await db
            .from('xp_ledger')
            .select('*', { count: 'exact', head: true })
            .eq('wallet', wallet)
            .eq('reason', 'course_complete')
        const courseCompleteXP = (bonusCount ?? 0) * COURSE_COMPLETE_XP
        const lessonXP = xp - courseCompleteXP
        const count = Math.max(0, Math.floor(lessonXP / 50))
        return { count }
    } catch (error) {
        console.error('[getTotalCompletedLessonsAction]', error)
        return { count: 0, error: error instanceof Error ? error.message : 'Failed to count lessons' }
    }
}
