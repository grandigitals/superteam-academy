/**
 * backend/src/config.ts
 *
 * Loads and validates all required environment variables at startup.
 * Throws immediately if any critical config is missing — fail-fast.
 */

import 'dotenv/config'
import { PublicKey } from '@solana/web3.js'

function required(key: string): string {
    const val = process.env[key]
    if (!val) throw new Error(`Missing required environment variable: ${key}`)
    return val
}

function optional(key: string, fallback: string): string {
    return process.env[key] ?? fallback
}

export const config = {
    port: parseInt(optional('PORT', '4000'), 10),
    allowedOrigins: optional('ALLOWED_ORIGINS', 'http://localhost:3000').split(','),

    solanaRpcUrl: optional('SOLANA_RPC_URL', 'https://api.devnet.solana.com'),
    heliusRpcUrl: optional('HELIUS_RPC_URL', ''),
    heliusApiKey: optional('HELIUS_API_KEY', ''),

    programId: new PublicKey(optional('PROGRAM_ID', 'ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf')),
    xpMint: optional('XP_MINT', ''),

    backendSignerKeypair: required('BACKEND_SIGNER_KEYPAIR'),

    /** Track collection pubkeys — one Metaplex Core collection per learning track */
    trackCollections: {
        fundamentals: optional('TRACK_COLLECTION_FUNDAMENTALS', ''),
        anchor: optional('TRACK_COLLECTION_ANCHOR', ''),
        defi: optional('TRACK_COLLECTION_DEFI', ''),
        nft: optional('TRACK_COLLECTION_NFT', ''),
        security: optional('TRACK_COLLECTION_SECURITY', ''),
    },
} as const
