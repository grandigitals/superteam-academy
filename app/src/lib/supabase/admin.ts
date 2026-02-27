import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

/**
 * Returns a lazily-initialized Supabase admin client.
 * This defers env-var validation to request time, not module evaluation time,
 * so the build doesn't fail when env vars are not set locally.
 */
export function getSupabaseAdmin(): SupabaseClient {
    if (_client) return _client

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        throw new Error(
            'Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in .env.local'
        )
    }

    _client = createClient(url, key, {
        auth: { persistSession: false },
    })

    return _client
}

// Convenience re-export for direct import (lazy proxy)
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
    get(_, prop) {
        return (getSupabaseAdmin() as unknown as Record<string | symbol, unknown>)[prop]
    },
})
