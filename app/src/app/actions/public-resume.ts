'use server'

import { getUserByWallet } from '@/lib/supabase/users'
import { createCredentialService, createLearningProgressService } from '@/services/factory'
import type { UserProfile, Credential } from '@/services/types'
import { deriveLevel } from '@/lib/solana/xp'
import { getSkillsBreakdownAction } from './learning-progress'

/**
 * Fetch the public developer resume for a given wallet.
 * Uses the same real data source as the private dashboard/profile pages.
 */
export async function getPublicResumeDataAction(wallet: string) {
    try {
        const userRow = await getUserByWallet(wallet)

        if (!userRow || !userRow.isPublic) {
            return { error: 'Profile not found or is private' }
        }

        const profile: UserProfile = {
            wallet: userRow.wallet,
            displayName: userRow.displayName ?? undefined,
            bio: userRow.bio ?? undefined,
            twitter: userRow.twitterHandle ?? undefined,
            github: userRow.githubHandle ?? undefined,
            joinedAt: new Date(userRow.createdAt),
            isPublic: userRow.isPublic,
            xp: 0,
            level: 1,
        }

        const progressService = createLearningProgressService()
        const xp = await progressService.getXPBalance(wallet)
        profile.xp = xp
        profile.level = deriveLevel(xp)

        // Same real action as private dashboard and profile — reads lesson_completions directly
        const { skills } = await getSkillsBreakdownAction(wallet)

        let credentials: Credential[] = []
        try {
            const credentialService = createCredentialService()
            credentials = await credentialService.getCredentials(wallet)
        } catch (e) {
            console.warn('[PublicResume] Failed to fetch credentials for wallet:', wallet, e)
        }

        return { profile, skills, credentials }

    } catch (error) {
        console.error('[PublicResume] Error fetching dataset:', error)
        return { error: 'Failed to generate public resume' }
    }
}
