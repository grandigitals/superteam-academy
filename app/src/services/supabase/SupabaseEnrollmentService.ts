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

        // First, ensure user exists in users table
        await db
            .from('users')
            .upsert(
                { wallet, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
                { onConflict: 'wallet', ignoreDuplicates: true }
            )

        // Try to insert enrollment
        const { error: insertError } = await db
            .from('enrollments')
            .insert({ wallet, course_id: courseId, enrolled_at: new Date().toISOString() })

        // If insert fails (duplicate), that's fine - user is already enrolled
        if (insertError && !insertError.message.includes('duplicate')) {
            console.error('[SupabaseEnrollmentService] enrollInCourse:', insertError.message)
        }

        // Always fetch the current enrollment record to return
        const { data, error: fetchError } = await db
            .from('enrollments')
            .select('*')
            .eq('wallet', wallet)
            .eq('course_id', courseId)
            .single()

        if (fetchError || !data) {
            console.error('[SupabaseEnrollmentService] enrollInCourse fetch:', fetchError?.message)
            // Return a local object even if DB fetch fails — don't crash the UI
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
