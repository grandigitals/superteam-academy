/**
 * backend/src/routes/courses.ts
 *
 * REST routes for fetching course and enrollment data from on-chain PDAs.
 *
 * GET /api/courses             — All active Course PDAs
 * GET /api/courses/:courseId   — Single Course PDA
 * GET /api/courses/:courseId/enrollment/:wallet  — Enrollment PDA for a learner
 */

import { Router } from 'express'
import type { Request, Response } from 'express'
import { PublicKey } from '@solana/web3.js'
import { getProgram } from '../client'
import { coursePda, enrollmentPda } from '../pda'
import { countCompletedLessons, getCompletedLessonIndices } from '../bitmap'
import BN from 'bn.js'

export const coursesRouter = Router()

// When Anchor IDL is loaded with require(), account namespace is dynamically typed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAccount = any

/** GET /api/courses — fetch all Course PDAs from chain */
coursesRouter.get('/', async (_req: Request, res: Response) => {
    try {
        const program = getProgram()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allCourses = await (program.account as AnyAccount).course.all()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const courses = allCourses.map(({ account }: { account: AnyAccount }) => ({
            courseId: account.courseId as string,
            creator: (account.creator as PublicKey).toBase58(),
            lessonCount: account.lessonCount as number,
            difficulty: account.difficulty as number,
            xpPerLesson: (account.xpPerLesson as BN).toNumber(),
            trackId: account.trackId as number,
            trackLevel: account.trackLevel as number,
            isActive: account.isActive as boolean,
            totalCompletions: account.totalCompletions as number,
            prerequisite: account.prerequisite ? (account.prerequisite as PublicKey).toBase58() : null,
        }))

        res.json({ success: true, data: courses })
    } catch (err) {
        console.error('[GET /api/courses]', err)
        res.status(500).json({ success: false, error: 'Failed to fetch courses' })
    }
})

/** GET /api/courses/:courseId — fetch single Course PDA */
coursesRouter.get('/:courseId', async (req: Request, res: Response) => {
    try {
        const courseId = String(req.params['courseId'] ?? '')
        if (!courseId) return res.status(400).json({ success: false, error: 'courseId required' })

        const program = getProgram()
        const [pda] = coursePda(courseId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const course: AnyAccount = await (program.account as AnyAccount).course.fetchNullable(pda)

        if (!course) return res.status(404).json({ success: false, error: 'Course not found' })

        res.json({
            success: true,
            data: {
                courseId: course.courseId as string,
                creator: (course.creator as PublicKey).toBase58(),
                lessonCount: course.lessonCount as number,
                difficulty: course.difficulty as number,
                xpPerLesson: (course.xpPerLesson as BN).toNumber(),
                trackId: course.trackId as number,
                trackLevel: course.trackLevel as number,
                isActive: course.isActive as boolean,
                totalCompletions: course.totalCompletions as number,
                creatorRewardXp: (course.creatorRewardXp as BN).toNumber(),
                minCompletionsForReward: course.minCompletionsForReward as number,
                pda: pda.toBase58(),
            },
        })
    } catch (err) {
        console.error('[GET /api/courses/:courseId]', err)
        res.status(500).json({ success: false, error: 'Failed to fetch course' })
    }
})

/** GET /api/courses/:courseId/enrollment/:wallet — fetch Enrollment PDA for a learner */
coursesRouter.get('/:courseId/enrollment/:wallet', async (req: Request, res: Response) => {
    try {
        const courseId = String(req.params['courseId'] ?? '')
        const wallet = String(req.params['wallet'] ?? '')

        let walletPubkey: PublicKey
        try {
            walletPubkey = new PublicKey(wallet)
        } catch {
            return res.status(400).json({ success: false, error: 'Invalid wallet address' })
        }

        const program = getProgram()
        const [pda] = enrollmentPda(courseId, walletPubkey)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const enrollment: AnyAccount = await (program.account as AnyAccount).enrollment.fetchNullable(pda)

        if (!enrollment) {
            return res.json({ success: true, data: null, enrolled: false })
        }

        const lessonFlags = enrollment.lessonFlags as BN[]
        const lessonCount = enrollment.lessonCount as number
        const completedIndices = getCompletedLessonIndices(lessonFlags, lessonCount)

        res.json({
            success: true,
            enrolled: true,
            data: {
                courseId: enrollment.courseId as string,
                learner: (enrollment.learner as PublicKey).toBase58(),
                lessonCount,
                completedLessons: completedIndices,
                completedCount: countCompletedLessons(lessonFlags),
                enrolledAt: (enrollment.enrolledAt as BN).toNumber(),
                completedAt: enrollment.completedAt ? (enrollment.completedAt as BN).toNumber() : null,
                credentialAsset: enrollment.credentialAsset
                    ? (enrollment.credentialAsset as PublicKey).toBase58()
                    : null,
                pda: pda.toBase58(),
            },
        })
    } catch (err) {
        console.error('[GET /api/courses/:courseId/enrollment/:wallet]', err)
        res.status(500).json({ success: false, error: 'Failed to fetch enrollment' })
    }
})
