/**
 * SupabaseEnrollmentService
 *
 * Persists course enrollments in the `enrollments` table.
 * Schema: enrollments(id, wallet, course_id, enrolled_at, completed_at, xp_earned)
 */

import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { EnrollmentService } from '../interfaces'
import type { Enrollment } from '../types'

export class SupabaseEnrollmentService implements EnrollmentService {
    async enrollInCourse(wallet: string, courseId: string): Promise<Enrollment> {
        const db = getSupabaseAdmin()

        const { data, error } = await db
            .from('enrollments')
            .upsert(
                { wallet, course_id: courseId, enrolled_at: new Date().toISOString() },
                { onConflict: 'wallet,course_id', ignoreDuplicates: true }
            )
            .select()
            .single()

        if (error) {
            console.error('[SupabaseEnrollmentService] enrollInCourse:', error.message)
            // Return a local object even if DB write fails — don't crash the UI
            return { courseId, wallet, enrolledAt: new Date(), xpEarned: 0 }
        }

        return this.rowToEnrollment(data as Record<string, unknown>)
    }

    async isEnrolled(wallet: string, courseId: string): Promise<boolean> {
        const db = getSupabaseAdmin()

        const { count, error } = await db
            .from('enrollments')
            .select('id', { count: 'exact', head: true })
            .eq('wallet', wallet)
            .eq('course_id', courseId)

        if (error) return false
        return (count ?? 0) > 0
    }

    async getEnrollments(wallet: string): Promise<Enrollment[]> {
        const db = getSupabaseAdmin()

        const { data, error } = await db
            .from('enrollments')
            .select('*')
            .eq('wallet', wallet)
            .order('enrolled_at', { ascending: false })

        if (error || !data) return []
        return (data as Record<string, unknown>[]).map(row => this.rowToEnrollment(row))
    }

    private rowToEnrollment(row: Record<string, unknown>): Enrollment {
        return {
            courseId: String(row.course_id ?? ''),
            wallet: String(row.wallet ?? ''),
            enrolledAt: new Date(String(row.enrolled_at ?? Date.now())),
            completedAt: row.completed_at ? new Date(String(row.completed_at)) : undefined,
            xpEarned: Number(row.xp_earned ?? 0),
        }
    }
}
