'use server'

/**
 * Server actions for learning progress operations.
 * These run on the server and have access to SUPABASE_SERVICE_ROLE_KEY.
 */

import { createLearningProgressService } from '@/services/factory'
import type { CourseProgress, StreakData } from '@/services/types'

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
