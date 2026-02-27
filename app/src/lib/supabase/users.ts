import { supabaseAdmin } from './admin'

export interface UserRow {
    id: string
    wallet: string
    displayName: string | null
    bio: string | null
    twitterHandle: string | null
    githubHandle: string | null
    isPublic: boolean
    createdAt: string
}

/**
 * Upsert a user profile row keyed by wallet address.
 * Called after successful SIWS authentication.
 */
export async function getOrCreateUserProfile(wallet: string): Promise<UserRow | null> {
    const { data, error } = await supabaseAdmin
        .from('users')
        .upsert({ wallet }, { onConflict: 'wallet', ignoreDuplicates: false })
        .select()
        .single()

    if (error) {
        console.error('[Supabase] getOrCreateUserProfile error:', error.message)
        return null
    }

    return data as UserRow
}

/**
 * Update user profile fields.
 */
export async function updateUserProfile(
    wallet: string,
    updates: Partial<Pick<UserRow, 'displayName' | 'bio' | 'twitterHandle' | 'githubHandle' | 'isPublic'>>
): Promise<UserRow | null> {
    const { data, error } = await supabaseAdmin
        .from('users')
        .update(updates)
        .eq('wallet', wallet)
        .select()
        .single()

    if (error) {
        console.error('[Supabase] updateUserProfile error:', error.message)
        return null
    }

    return data as UserRow
}

/**
 * Fetch user by wallet address.
 */
export async function getUserByWallet(wallet: string): Promise<UserRow | null> {
    const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('wallet', wallet)
        .single()

    if (error) return null
    return data as UserRow
}
