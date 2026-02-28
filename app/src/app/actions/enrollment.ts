'use server'

/**
 * Server actions for enrollment operations.
 * These run on the server and have access to SUPABASE_SERVICE_ROLE_KEY.
 */

import { createEnrollmentService } from '@/services/factory'
import type { Enrollment } from '@/services/types'

export async function enrollInCourseAction(
    wallet: string,
    courseId: string
): Promise<{ success: boolean; enrollment?: Enrollment; error?: string }> {
    try {
        const service = createEnrollmentService()
        const enrollment = await service.enrollInCourse(wallet, courseId)
        return { success: true, enrollment }
    } catch (error) {
        console.error('[enrollInCourseAction]', error)
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to enroll' 
        }
    }
}

export async function isEnrolledAction(
    wallet: string,
    courseId: string
): Promise<{ enrolled: boolean; error?: string }> {
    try {
        const service = createEnrollmentService()
        const enrolled = await service.isEnrolled(wallet, courseId)
        return { enrolled }
    } catch (error) {
        console.error('[isEnrolledAction]', error)
        return { 
            enrolled: false, 
            error: error instanceof Error ? error.message : 'Failed to check enrollment' 
        }
    }
}

export async function getEnrollmentsAction(
    wallet: string
): Promise<{ enrollments: Enrollment[]; error?: string }> {
    try {
        const service = createEnrollmentService()
        const enrollments = await service.getEnrollments(wallet)
        return { enrollments }
    } catch (error) {
        console.error('[getEnrollmentsAction]', error)
        return { 
            enrollments: [], 
            error: error instanceof Error ? error.message : 'Failed to get enrollments' 
        }
    }
}
