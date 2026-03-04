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

// Map camelCase domain model → snake_case Supabase column names
function toDbRow(row: Partial<UserRow> & { wallet?: string }) {
    const mapped: Record<string, unknown> = {}
    if (row.wallet !== undefined) mapped.wallet = row.wallet
    if (row.displayName !== undefined) mapped.display_name = row.displayName
    if (row.bio !== undefined) mapped.bio = row.bio
    if (row.twitterHandle !== undefined) mapped.twitter_handle = row.twitterHandle
    if (row.githubHandle !== undefined) mapped.github_handle = row.githubHandle
    if (row.isPublic !== undefined) mapped.is_public = row.isPublic
    return mapped
}

// Map snake_case Supabase row → camelCase domain model
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDbRow(row: any): UserRow {
    return {
        id: row.id,
        wallet: row.wallet,
        displayName: row.display_name ?? null,
        bio: row.bio ?? null,
        twitterHandle: row.twitter_handle ?? null,
        githubHandle: row.github_handle ?? null,
        isPublic: row.is_public ?? true,
        createdAt: row.created_at,
    }
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

    return fromDbRow(data)
}

/**
 * Update user profile fields.
 */
export async function updateUserProfile(
    wallet: string,
    updates: Partial<Pick<UserRow, 'displayName' | 'bio' | 'twitterHandle' | 'githubHandle' | 'isPublic'>>
): Promise<UserRow | null> {
    const dbUpdates = toDbRow(updates)

    const { data, error } = await supabaseAdmin
        .from('users')
        .update(dbUpdates)
        .eq('wallet', wallet)
        .select()
        .single()

    if (error) {
        console.error('[Supabase] updateUserProfile error:', error.message)
        return null
    }

    return fromDbRow(data)
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
    return fromDbRow(data)
}
