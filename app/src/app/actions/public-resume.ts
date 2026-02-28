'use server'

import { getUserByWallet } from '@/lib/supabase/users'
import { createCredentialService, createLearningProgressService } from '@/services/factory'
import type { UserProfile, Credential } from '@/services/types'
import { deriveLevel } from '@/lib/solana/xp'

/**
 * Fetch the public developer resume for a given wallet.
 * This bypasses WalletGate and is safe to expose on a public route.
 */
export async function getPublicResumeDataAction(wallet: string) {
    try {
        // 1. Fetch Supabase Profile
        const userRow = await getUserByWallet(wallet)

        // If not found or they opted out of public profiles
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
            xp: 0, // Hydrated via service below
            level: 1,
        }

        // 2. Fetch On-Chain XP (Token-2022 ATA balance)
        const progressService = createLearningProgressService()
        const xp = await progressService.getXPBalance(wallet)
        profile.xp = xp
        profile.level = deriveLevel(xp)

        // 3. Fetch Skills Breakdown
        const allProgress = await progressService.getAllProgress(wallet)

        let totalCompleted = 0
        allProgress.forEach(p => totalCompleted += p.completedLessons.length)

        // Mock skill distribution logic (same as private profile)
        const skills = [
            { subject: 'Solana Core', value: Math.min(100, (totalCompleted / 5) * 100) },
            { subject: 'Rust', value: Math.min(100, (totalCompleted / 8) * 100) },
            { subject: 'Anchor', value: Math.min(100, (totalCompleted / 10) * 100) },
            { subject: 'Security', value: Math.min(100, (totalCompleted / 15) * 100) },
        ]

        // 4. Fetch Metaplex Core Credentials
        let credentials: Credential[] = []
        try {
            const credentialService = createCredentialService()
            credentials = await credentialService.getCredentials(wallet)
        } catch (e) {
            console.warn('[PublicResume] Failed to fetch credentials for wallet:', wallet, e)
        }

        return {
            profile,
            skills,
            credentials,
        }

    } catch (error) {
        console.error('[PublicResume] Error fetching dataset:', error)
        return { error: 'Failed to generate public resume' }
    }
}
