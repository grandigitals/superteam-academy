/**
 * backend/src/routes/credentials.ts
 *
 * Credential issuance (Metaplex Core NFTs) and queries (Helius DAS API).
 *
 * POST /api/credentials/issue      — issue_credential (first course in track)
 * POST /api/credentials/upgrade    — upgrade_credential (subsequent courses)
 * GET  /api/credentials/:wallet    — fetch all credentials via Helius DAS
 */

import { Router, Request, Response } from 'express'
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js'
import BN from 'bn.js'
import { z } from 'zod'
import { getProgram } from '../client'
import { getBackendSigner } from '../keypair'
import { configPda, coursePda, enrollmentPda } from '../pda'
import { config } from '../config'

export const credentialsRouter = Router()

const MPL_CORE_PROGRAM_ID = new PublicKey('CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d')

const IssueCredentialSchema = z.object({
    courseId: z.string().min(1),
    learnerWallet: z.string().min(32),
    credentialName: z.string().min(1),
    metadataUri: z.string().url(),
    track: z.enum(['fundamentals', 'anchor', 'defi', 'nft', 'security']),
    coursesCompleted: z.number().int().min(1),
    totalXp: z.number().int().min(0),
})

const UpgradeCredentialSchema = IssueCredentialSchema.extend({
    credentialAsset: z.string().min(32), // existing asset pubkey
})

/** Returns the track collection pubkey for a given track name */
function getTrackCollection(track: string): PublicKey {
    const collections = config.trackCollections as Record<string, string>
    const address = collections[track]
    if (!address) throw new Error(`Track collection not configured for: ${track}. Set TRACK_COLLECTION_${track.toUpperCase()} in .env`)
    return new PublicKey(address)
}

/** POST /api/credentials/issue — issue a new soulbound credential NFT */
credentialsRouter.post('/issue', async (req: Request, res: Response) => {
    const parsed = IssueCredentialSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.flatten() })
    }

    const { courseId, learnerWallet, credentialName, metadataUri, track, coursesCompleted, totalXp } = parsed.data

    try {
        let learnerPubkey: PublicKey
        try {
            learnerPubkey = new PublicKey(learnerWallet)
        } catch {
            return res.status(400).json({ success: false, error: 'Invalid learner wallet' })
        }

        const program = getProgram()
        const signer = getBackendSigner()
        const credentialAsset = Keypair.generate()
        const trackCollection = getTrackCollection(track)

        const [configPdaKey] = configPda()
        const [coursePdaKey] = coursePda(courseId)
        const [enrollmentPdaKey] = enrollmentPda(courseId, learnerPubkey)

        const tx = await program.methods
            .issueCredential(credentialName, metadataUri, coursesCompleted, new BN(totalXp))
            .accountsPartial({
                config: configPdaKey,
                course: coursePdaKey,
                enrollment: enrollmentPdaKey,
                learner: learnerPubkey,
                credentialAsset: credentialAsset.publicKey,
                trackCollection,
                payer: signer.publicKey,
                backendSigner: signer.publicKey,
                mplCoreProgram: MPL_CORE_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers([signer, credentialAsset])
            .rpc()

        res.json({
            success: true,
            data: {
                tx,
                credentialAsset: credentialAsset.publicKey.toBase58(),
                learnerWallet,
                track,
            },
        })
    } catch (err) {
        const message = (err as Error).message
        console.error('[POST /api/credentials/issue]', message)
        res.status(500).json({ success: false, error: message })
    }
})

/** POST /api/credentials/upgrade — upgrade an existing credential NFT in place */
credentialsRouter.post('/upgrade', async (req: Request, res: Response) => {
    const parsed = UpgradeCredentialSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.flatten() })
    }

    const { courseId, learnerWallet, credentialAsset: assetStr, credentialName, metadataUri, track, coursesCompleted, totalXp } = parsed.data

    try {
        let learnerPubkey: PublicKey, assetPubkey: PublicKey
        try {
            learnerPubkey = new PublicKey(learnerWallet)
            assetPubkey = new PublicKey(assetStr)
        } catch {
            return res.status(400).json({ success: false, error: 'Invalid wallet or asset address' })
        }

        const program = getProgram()
        const signer = getBackendSigner()
        const trackCollection = getTrackCollection(track)

        const [configPdaKey] = configPda()
        const [coursePdaKey] = coursePda(courseId)
        const [enrollmentPdaKey] = enrollmentPda(courseId, learnerPubkey)

        const tx = await program.methods
            .upgradeCredential(credentialName, metadataUri, coursesCompleted, new BN(totalXp))
            .accountsPartial({
                config: configPdaKey,
                course: coursePdaKey,
                enrollment: enrollmentPdaKey,
                learner: learnerPubkey,
                credentialAsset: assetPubkey,
                trackCollection,
                payer: signer.publicKey,
                backendSigner: signer.publicKey,
                mplCoreProgram: MPL_CORE_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers([signer])
            .rpc()

        res.json({
            success: true,
            data: { tx, credentialAsset: assetStr, learnerWallet, track },
        })
    } catch (err) {
        const message = (err as Error).message
        console.error('[POST /api/credentials/upgrade]', message)
        res.status(500).json({ success: false, error: message })
    }
})

/** GET /api/credentials/:wallet — query all Metaplex Core credentials via Helius DAS */
credentialsRouter.get('/:wallet', async (req: Request, res: Response) => {
    try {
        const { wallet } = req.params

        try {
            new PublicKey(wallet!)
        } catch {
            return res.status(400).json({ success: false, error: 'Invalid wallet address' })
        }

        if (!config.heliusRpcUrl) {
            return res.status(503).json({ success: false, error: 'HELIUS_RPC_URL not configured' })
        }

        // Query Helius DAS API
        const response = await fetch(config.heliusRpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: '1',
                method: 'getAssetsByOwner',
                params: { ownerAddress: wallet, page: 1, limit: 100 },
            }),
        })

        const das = (await response.json()) as { result?: { items: DasAsset[] } }
        const allAssets = das.result?.items ?? []

        // Get all configured track collection addresses
        const trackCollections = Object.entries(config.trackCollections)
            .filter(([, addr]) => addr !== '')
            .map(([track, addr]) => ({ track, addr }))

        const credentials = allAssets
            .filter((item: DasAsset) =>
                item.grouping?.some((g) =>
                    trackCollections.some((tc) => g.group_key === 'collection' && g.group_value === tc.addr)
                )
            )
            .map((item: DasAsset) => {
                const collection = item.grouping?.find((g) => g.group_key === 'collection')
                const tc = trackCollections.find((t) => t.addr === collection?.group_value)
                const attrs = item.content?.metadata?.attributes ?? []

                return {
                    mint: item.id,
                    trackId: attrs.find((a: Attr) => a.trait_type === 'track_id')?.value ?? tc?.track ?? 'unknown',
                    trackName: item.content?.metadata?.name ?? '',
                    level: parseInt(attrs.find((a: Attr) => a.trait_type === 'level')?.value ?? '1', 10),
                    coursesCompleted: parseInt(attrs.find((a: Attr) => a.trait_type === 'courses_completed')?.value ?? '0', 10),
                    totalXP: parseInt(attrs.find((a: Attr) => a.trait_type === 'total_xp')?.value ?? '0', 10),
                    imageUrl: item.content?.links?.image ?? '',
                    issuedAt: new Date(item.created_at ?? Date.now()).toISOString(),
                }
            })

        res.json({ success: true, data: credentials })
    } catch (err) {
        console.error('[GET /api/credentials/:wallet]', err)
        res.status(500).json({ success: false, error: 'Failed to fetch credentials' })
    }
})

// Local types for DAS API response
interface Attr { trait_type: string; value: string }
interface DasAsset {
    id: string
    created_at?: string
    grouping?: Array<{ group_key: string; group_value: string }>
    content?: {
        metadata?: {
            name?: string
            attributes?: Attr[]
        }
        links?: { image?: string }
    }
}
