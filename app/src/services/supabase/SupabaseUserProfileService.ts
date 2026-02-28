import { UserProfileService } from '../interfaces'
import type { UserProfile } from '../types'
import { getUserByWallet, updateUserProfile } from '@/lib/supabase/users'

/**
 * Supabase implementation for User Profiles.
 * Reads and writes directly to the `users` table via the admin client.
 */
export class SupabaseUserProfileService implements UserProfileService {
    async getProfile(wallet: string): Promise<UserProfile | null> {
        const user = await getUserByWallet(wallet)
        if (!user) return null

        return {
            wallet: user.wallet,
            displayName: user.displayName ?? undefined,
            bio: user.bio ?? undefined,
            twitter: user.twitterHandle ?? undefined,
            github: user.githubHandle ?? undefined,
            joinedAt: new Date(user.createdAt),
            // XP and Level are handled globally via Token-2022 ATA, not DB
            xp: 0,
            level: 1,
            isPublic: user.isPublic,
        }
    }

    async getProfileByUsername(username: string): Promise<UserProfile | null> {
        // Search by displayName if a public profile feature is needed in the future
        return null
    }

    async upsertProfile(data: Partial<UserProfile> & { wallet: string }): Promise<UserProfile> {
        // Map the domain properties to the exact columns in the Supabase 'users' table
        const updates = {
            displayName: data.displayName,
            bio: data.bio,
            twitterHandle: data.twitter,
            githubHandle: data.github,
        }

        const updatedUser = await updateUserProfile(data.wallet, updates)

        if (!updatedUser) {
            throw new Error('Failed to update user profile in Supabase')
        }

        return {
            wallet: updatedUser.wallet,
            displayName: updatedUser.displayName ?? undefined,
            bio: updatedUser.bio ?? undefined,
            twitter: updatedUser.twitterHandle ?? undefined,
            github: updatedUser.githubHandle ?? undefined,
            joinedAt: new Date(updatedUser.createdAt),
            xp: 0,
            level: 1,
            isPublic: updatedUser.isPublic,
        }
    }
}
