'use server'

import { createUserProfileService } from '@/services/factory'
import type { UserProfile } from '@/services/types'

export async function getProfileAction(
    wallet: string
): Promise<{ profile: UserProfile | null; error?: string }> {
    try {
        const service = createUserProfileService()
        const profile = await service.getProfile(wallet)
        return { profile }
    } catch (error) {
        console.error('[getProfileAction]', error)
        return {
            profile: null,
            error: error instanceof Error ? error.message : 'Failed to get profile'
        }
    }
}

export async function upsertProfileAction(
    data: Partial<UserProfile> & { wallet: string }
): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    try {
        const service = createUserProfileService()
        const profile = await service.upsertProfile(data)
        return { success: true, profile }
    } catch (error) {
        console.error('[upsertProfileAction]', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update profile'
        }
    }
}
