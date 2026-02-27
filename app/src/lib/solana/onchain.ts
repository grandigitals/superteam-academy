/**
 * On-chain XP reader using Helius DAS API.
 *
 * XP is stored as a custom token (SPL / Token-2022) mint with metadata.
 * The balance of this token for a wallet represents their total XP.
 *
 * Account derivation (mirrors the Anchor program):
 *   learner_account PDA: ["learner", wallet_pubkey]
 */

import { Connection, PublicKey } from '@solana/web3.js'

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com'
const XP_MINT = process.env.NEXT_PUBLIC_XP_MINT ?? ''

/**
 * Derive the learner PDA for a given wallet.
 * Matches: seeds = [b"learner", wallet.key()]
 */
export async function deriveLearnerPDA(wallet: string, programId: string): Promise<PublicKey> {
    const [pda] = await PublicKey.findProgramAddressSync(
        [Buffer.from('learner'), new PublicKey(wallet).toBytes()],
        new PublicKey(programId)
    )
    return pda
}

/**
 * Fetch XP balance for a wallet from the SPL token mint.
 * Returns 0 if no token account found (user has no XP yet).
 */
export async function getXPBalance(wallet: string): Promise<number> {
    if (!XP_MINT) return 0

    try {
        const connection = new Connection(RPC_URL, 'confirmed')
        const owner = new PublicKey(wallet)
        const mint = new PublicKey(XP_MINT)

        const accounts = await connection.getParsedTokenAccountsByOwner(owner, { mint })

        if (accounts.value.length === 0) return 0

        const balance = accounts.value[0]?.account.data.parsed.info.tokenAmount.uiAmount ?? 0
        return Math.floor(balance)
    } catch {
        return 0
    }
}

/**
 * Fetch credentials (soulbound NFTs) for a wallet using Helius DAS.
 * Returns compressed or Core NFTs with "academy" in their name.
 */
export async function getWalletCredentials(wallet: string): Promise<Array<{
    mintAddress: string
    name: string
    imageUri: string
    attributes: Array<{ trait_type: string; value: string }>
}>> {
    const heliusKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY
    if (!heliusKey) return []

    try {
        const response = await fetch(
            `https://api.helius.xyz/v0/addresses/${wallet}/nfts?api-key=${heliusKey}&limit=50`,
            { next: { revalidate: 60 } }
        )
        if (!response.ok) return []

        const data = await response.json() as Array<{
            mint: string
            name: string
            image: string
            attributes?: Array<{ trait_type: string; value: string }>
        }>

        return data
            .filter(nft => nft.name?.toLowerCase().includes('superteam') || nft.name?.toLowerCase().includes('academy'))
            .map(nft => ({
                mintAddress: nft.mint,
                name: nft.name,
                imageUri: nft.image,
                attributes: nft.attributes ?? [],
            }))
    } catch {
        return []
    }
}
