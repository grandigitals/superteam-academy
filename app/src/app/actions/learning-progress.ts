'use server'

/**
 * Server actions for learning progress operations.
 * These run on the server and have access to SUPABASE_SERVICE_ROLE_KEY.
 */

import { createLearningProgressService } from '@/services/factory'
import type { CourseProgress, StreakData } from '@/services/types'
import { getEnrollmentsAction } from './enrollment'
import { fetchAllCourses } from '@/services/CourseService'

export async function completeLessonAction(
    wallet: string,
    courseId: string,
    lessonIndex: number
): Promise<{ success: boolean; xpEarned?: number; totalXP?: number; error?: string }> {
    try {
        const service = createLearningProgressService()
        const result = await service.completeLesson(wallet, courseId, lessonIndex)
        return { success: true, ...result }
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

export async function getSkillsBreakdownAction(wallet: string): Promise<{ skills: Array<{ subject: string; value: number }> }> {
    try {
        const { enrollments } = await getEnrollmentsAction(wallet)
        const courses = await fetchAllCourses()

        const trackStats: Record<string, { xpEarned: number; maxXP: number }> = {}

        // Calculate maximum possible XP per track
        for (const course of courses) {
            const track = (course.track || 'fundamentals').toLowerCase()
            if (!trackStats[track]) trackStats[track] = { xpEarned: 0, maxXP: 0 }
            trackStats[track].maxXP += course.xpReward || 0
        }

        // Add user's earned XP from their enrollments
        for (const enrollment of (enrollments || [])) {
            const course = courses.find((c) => c.id === enrollment.courseId || c.slug === enrollment.courseId)
            if (course) {
                const track = (course.track || 'fundamentals').toLowerCase()
                if (trackStats[track]) {
                    trackStats[track].xpEarned += enrollment.xpEarned || 0
                }
            }
        }

        // Format for the UI
        const skills = Object.entries(trackStats)
            .filter(([_, stats]) => stats.maxXP > 0)
            .map(([trackId, stats]) => {
                let subject = trackId.charAt(0).toUpperCase() + trackId.slice(1)
                if (subject === 'Defi') subject = 'DeFi'
                if (subject === 'Nft') subject = 'NFT'

                const value = Math.min(100, Math.round((stats.xpEarned / stats.maxXP) * 100))
                return { subject, value }
            })
            // Sort by highest value first
            .sort((a, b) => b.value - a.value)

        return { skills }
    } catch (error) {
        console.error('[getSkillsBreakdownAction]', error)
        return { skills: [] }
    }
}
