/**
 * SupabaseCredentialService
 *
 * Fetches credential NFTs for a wallet.
 *
 * Strategy:
 *   1. If NEXT_PUBLIC_HELIUS_API_KEY is set → fetch from Helius DAS (real NFTs)
 *   2. Otherwise → query the `credentials` table in Supabase (issued by the program)
 */

import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { CredentialService } from '../interfaces'
import type { Credential } from '../types'

export class SupabaseCredentialService implements CredentialService {
    async getCredentials(wallet: string): Promise<Credential[]> {
        // Try Helius DAS first when API key is available
        if (process.env.NEXT_PUBLIC_HELIUS_API_KEY) {
            try {
                const { getWalletCredentials } = await import('@/lib/solana/onchain')
                const nfts = await getWalletCredentials(wallet)
                if (nfts.length > 0) {
                    return nfts.map(nft => this.nftToCredential(nft))
                }
            } catch (err) {
                console.warn('[SupabaseCredentialService] Helius fetch failed, falling back to DB:', err)
            }
        }

        // Fallback: Supabase credentials table
        return this.getCredentialsFromDB(wallet)
    }

    async getCredentialByMint(mint: string): Promise<Credential | null> {
        const db = getSupabaseAdmin()

        const { data, error } = await db
            .from('credentials')
            .select('*')
            .eq('mint_address', mint)
            .single()

        if (error || !data) return null
        return this.rowToCredential(data as Record<string, unknown>)
    }

    private async getCredentialsFromDB(wallet: string): Promise<Credential[]> {
        const db = getSupabaseAdmin()

        const { data, error } = await db
            .from('credentials')
            .select('*')
            .eq('wallet', wallet)
            .order('issued_at', { ascending: false })

        if (error || !data) return []
        return (data as Record<string, unknown>[]).map(row => this.rowToCredential(row))
    }

    private nftToCredential(nft: {
        mintAddress: string
        name: string
        imageUri: string
        attributes: Array<{ trait_type: string; value: string }>
    }): Credential {
        const attr = (key: string) =>
            nft.attributes.find(a => a.trait_type.toLowerCase() === key)?.value ?? ''

        return {
            mint: nft.mintAddress,
            trackId: attr('track_id') || nft.name.toLowerCase().replace(/\s+/g, '-'),
            trackName: attr('track_name') || nft.name,
            level: parseInt(attr('level') || '1', 10),
            coursesCompleted: parseInt(attr('courses_completed') || '1', 10),
            totalXP: parseInt(attr('total_xp') || '0', 10),
            imageUrl: nft.imageUri,
            issuedAt: new Date(attr('issued_at') || Date.now()),
        }
    }

    private rowToCredential(row: Record<string, unknown>): Credential {
        return {
            mint: String(row.mint_address ?? ''),
            trackId: String(row.track_id ?? ''),
            trackName: String(row.track_name ?? ''),
            level: Number(row.level ?? 1),
            coursesCompleted: Number(row.courses_completed ?? 0),
            totalXP: Number(row.total_xp ?? 0),
            imageUrl: String(row.image_url ?? ''),
            issuedAt: new Date(String(row.issued_at ?? Date.now())),
        }
    }
}
