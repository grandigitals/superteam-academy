/**
 * backend/src/routes/progress.ts
 *
 * Backend-signed progress endpoints.
 *
 * The backend_signer keypair is required for these instructions — the program
 * verifies that the signer matches config.backend_signer on-chain.
 *
 * POST /api/complete-lesson   — Mark one lesson complete, mint xp_per_lesson XP
 * POST /api/finalize-course   — Verify full bitmap, mint completion bonus + creator reward
 */

import { Router, Request, Response } from 'express'
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js'
import { getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction, getAccount } from '@solana/spl-token'
import BN from 'bn.js'
import { z } from 'zod'
import { getProgram, getConnection } from '../client'
import { getBackendSigner } from '../keypair'
import { configPda, coursePda, enrollmentPda } from '../pda'
import { config } from '../config'

export const progressRouter = Router()

const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe8bv')

const CompleteLessonSchema = z.object({
    courseId: z.string().min(1),
    learnerWallet: z.string().min(32),
    lessonIndex: z.number().int().min(0).max(255),
})

const FinalizeCourseSchema = z.object({
    courseId: z.string().min(1),
    learnerWallet: z.string().min(32),
    creatorWallet: z.string().min(32),
})

/** Ensures the learner's Token-2022 XP ATA exists, creating it if not */
async function ensureXpAta(learnerPubkey: PublicKey, xpMintPubkey: PublicKey): Promise<PublicKey> {
    const connection = getConnection()
    const signer = getBackendSigner()

    const ata = getAssociatedTokenAddressSync(xpMintPubkey, learnerPubkey, false, TOKEN_2022_PROGRAM_ID)

    try {
        await getAccount(connection, ata, 'confirmed', TOKEN_2022_PROGRAM_ID)
    } catch {
        // ATA doesn't exist — create it (backend pays)
        const ix = createAssociatedTokenAccountInstruction(
            signer.publicKey,
            ata,
            learnerPubkey,
            xpMintPubkey,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        )
        const program = getProgram()
        await program.provider.sendAndConfirm!(
            new (await import('@solana/web3.js')).Transaction().add(ix),
            [signer]
        )
    }
    return ata
}

/** POST /api/complete-lesson — backend signs complete_lesson instruction */
progressRouter.post('/complete-lesson', async (req: Request, res: Response) => {
    const parsed = CompleteLessonSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.flatten() })
    }

    const { courseId, learnerWallet, lessonIndex } = parsed.data

    try {
        let learnerPubkey: PublicKey
        try {
            learnerPubkey = new PublicKey(learnerWallet)
        } catch {
            return res.status(400).json({ success: false, error: 'Invalid learner wallet' })
        }

        if (!config.xpMint) {
            return res.status(503).json({ success: false, error: 'XP_MINT not configured' })
        }

        const program = getProgram()
        const signer = getBackendSigner()
        const xpMintPubkey = new PublicKey(config.xpMint)

        const [configPdaKey] = configPda()
        const [coursePdaKey] = coursePda(courseId)
        const [enrollmentPdaKey] = enrollmentPda(courseId, learnerPubkey)
        const learnerXpAta = await ensureXpAta(learnerPubkey, xpMintPubkey)

        const tx = await program.methods
            .completeLesson(lessonIndex)
            .accountsPartial({
                config: configPdaKey,
                course: coursePdaKey,
                enrollment: enrollmentPdaKey,
                learner: learnerPubkey,
                learnerTokenAccount: learnerXpAta,
                xpMint: xpMintPubkey,
                backendSigner: signer.publicKey,
                tokenProgram: TOKEN_2022_PROGRAM_ID,
            })
            .signers([signer])
            .rpc()

        res.json({
            success: true,
            data: { tx, courseId, learnerWallet, lessonIndex },
        })
    } catch (err) {
        const message = (err as Error).message
        console.error('[POST /api/complete-lesson]', message)
        res.status(500).json({ success: false, error: message })
    }
})

/** POST /api/finalize-course — backend signs finalize_course instruction */
progressRouter.post('/finalize-course', async (req: Request, res: Response) => {
    const parsed = FinalizeCourseSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.flatten() })
    }

    const { courseId, learnerWallet, creatorWallet } = parsed.data

    try {
        let learnerPubkey: PublicKey, creatorPubkey: PublicKey
        try {
            learnerPubkey = new PublicKey(learnerWallet)
            creatorPubkey = new PublicKey(creatorWallet)
        } catch {
            return res.status(400).json({ success: false, error: 'Invalid wallet address' })
        }

        if (!config.xpMint) {
            return res.status(503).json({ success: false, error: 'XP_MINT not configured' })
        }

        const program = getProgram()
        const signer = getBackendSigner()
        const xpMintPubkey = new PublicKey(config.xpMint)

        const [configPdaKey] = configPda()
        const [coursePdaKey] = coursePda(courseId)
        const [enrollmentPdaKey] = enrollmentPda(courseId, learnerPubkey)
        const learnerXpAta = await ensureXpAta(learnerPubkey, xpMintPubkey)
        const creatorXpAta = getAssociatedTokenAddressSync(creatorPubkey, xpMintPubkey, false, TOKEN_2022_PROGRAM_ID)

        const tx = await program.methods
            .finalizeCourse()
            .accountsPartial({
                config: configPdaKey,
                course: coursePdaKey,
                enrollment: enrollmentPdaKey,
                learner: learnerPubkey,
                learnerTokenAccount: learnerXpAta,
                creatorTokenAccount: creatorXpAta,
                creator: creatorPubkey,
                xpMint: xpMintPubkey,
                backendSigner: signer.publicKey,
                tokenProgram: TOKEN_2022_PROGRAM_ID,
            })
            .signers([signer])
            .rpc()

        res.json({
            success: true,
            data: { tx, courseId, learnerWallet },
        })
    } catch (err) {
        const message = (err as Error).message
        console.error('[POST /api/finalize-course]', message)
        res.status(500).json({ success: false, error: message })
    }
})
