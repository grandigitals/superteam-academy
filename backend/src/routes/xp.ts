/**
 * backend/src/routes/xp.ts
 *
 * REST routes for XP balance queries via Token-2022.
 *
 * GET /api/xp/:wallet  — Returns the learner's Token-2022 XP ATA balance
 */

import { Router, Request, Response } from 'express'
import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { getConnection } from '../client'
import { config } from '../config'

export const xpRouter = Router()

const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')

/** GET /api/xp/:wallet — returns current XP token balance */
xpRouter.get('/:wallet', async (req: Request, res: Response) => {
    try {
        const { wallet } = req.params

        let walletPubkey: PublicKey
        try {
            walletPubkey = new PublicKey(wallet!)
        } catch {
            return res.status(400).json({ success: false, error: 'Invalid wallet address' })
        }

        if (!config.xpMint) {
            return res.status(503).json({ success: false, error: 'XP_MINT not configured on backend' })
        }

        const xpMintPubkey = new PublicKey(config.xpMint)
        const connection = getConnection()

        // Derive the Token-2022 Associated Token Account
        const xpAta = getAssociatedTokenAddressSync(
            xpMintPubkey,
            walletPubkey,
            false, // allowOwnerOffCurve
            TOKEN_2022_PROGRAM_ID
        )

        let xpAmount = 0

        try {
            const balance = await connection.getTokenAccountBalance(xpAta)
            xpAmount = Number(balance.value.amount)
        } catch {
            // Account doesn't exist yet — learner has 0 XP
            xpAmount = 0
        }

        res.json({
            success: true,
            data: {
                wallet: walletPubkey.toBase58(),
                xp: xpAmount,
                ata: xpAta.toBase58(),
            },
        })
    } catch (err) {
        console.error('[GET /api/xp/:wallet]', err)
        res.status(500).json({ success: false, error: 'Failed to fetch XP balance' })
    }
})
