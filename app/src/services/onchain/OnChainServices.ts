/**
 * app/src/services/onchain/OnChainServices.ts
 *
 * Production service implementations that talk to the real Superteam Academy
 * on-chain program (Program ID: ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf).
 *
 * Architecture (from INTEGRATION.md):
 *   - XP balance: Token-2022 ATA direct RPC call
 *   - Enrollment progress: Anchor Enrollment PDA + 256-bit bitmap decode
 *   - Lesson completion: POST to backend API (backend_signer co-signs)
 *   - Credentials: GET from backend API (Helius DAS query)
 *   - Streaks: Supabase (off-chain — per spec: "frontend-only feature")
 */

import type { LearningProgressService, CredentialService } from '../interfaces'
import type { CourseProgress, StreakData, Credential } from '../types'
import { Connection, PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'

const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')
const PROGRAM_ID = new PublicKey(
    process.env.NEXT_PUBLIC_PROGRAM_ID ?? 'ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf'
)

function getBackendUrl(): string {
    return process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000'
}

function getRpcUrl(): string {
    return process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com'
}

function getXpMint(): PublicKey | null {
    const mint = process.env.NEXT_PUBLIC_XP_MINT
    if (!mint) return null
    try { return new PublicKey(mint) } catch { return null }
}

// ─── PDA helpers (inline to avoid dynamic imports in server components) ──────

function enrollmentPda(courseId: string, learner: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('enrollment'), Buffer.from(courseId), learner.toBuffer()],
        PROGRAM_ID
    )
    return pda
}

// ─── Bitmap helpers ─────────────────────────────────────────────────────────
// Uses BN.js to match the Anchor-decoded [u64; 4] lessonFlags field type
import BN from 'bn.js'

function isLessonComplete(lessonFlags: BN[], lessonIndex: number): boolean {
    const wordIndex = Math.floor(lessonIndex / 64)
    const bitIndex = lessonIndex % 64
    if (wordIndex >= lessonFlags.length) return false
    return !lessonFlags[wordIndex]!.and(new BN(1).shln(bitIndex)).isZero()
}

function countCompletedLessons(lessonFlags: BN[]): number {
    return lessonFlags.reduce((sum, word) => {
        let count = 0
        let w = word.clone()
        while (!w.isZero()) {
            count += w.and(new BN(1)).toNumber()
            w = w.shrn(1)
        }
        return sum + count
    }, 0)
}

function getCompletedLessonIndices(lessonFlags: BN[], lessonCount: number): number[] {
    const completed: number[] = []
    for (let i = 0; i < lessonCount; i++) {
        if (isLessonComplete(lessonFlags, i)) completed.push(i)
    }
    return completed
}

// ─── On-Chain Learning Progress Service ─────────────────────────────────────

export class OnChainLearningProgressService implements LearningProgressService {
    private readonly rpcUrl: string

    constructor(rpcUrl: string) {
        this.rpcUrl = rpcUrl
    }

    /** Read XP from Token-2022 ATA */
    async getXPBalance(wallet: string): Promise<number> {
        const xpMint = getXpMint()
        if (!xpMint) return 0

        try {
            const connection = new Connection(this.rpcUrl, 'confirmed')
            const walletPubkey = new PublicKey(wallet)
            const xpAta = getAssociatedTokenAddressSync(xpMint, walletPubkey, false, TOKEN_2022_PROGRAM_ID)
            const balance = await connection.getTokenAccountBalance(xpAta)
            return Number(balance.value.amount)
        } catch {
            return 0
        }
    }

    /** Read Enrollment PDA and decode lesson bitmap */
    async getCourseProgress(wallet: string, courseId: string): Promise<CourseProgress | null> {
        try {
            const url = `${getBackendUrl()}/api/courses/${courseId}/enrollment/${wallet}`
            const res = await fetch(url, { cache: 'no-store' })
            if (!res.ok) return null
            const json = await res.json() as { enrolled: boolean; data?: BackendEnrollment }
            if (!json.enrolled || !json.data) return null

            const { data } = json
            return {
                courseId,
                completedLessons: data.completedLessons,
                totalLessons: data.lessonCount,
                xpEarned: data.completedCount * 50, // approximate — real XP from Token-2022 ATA
                enrolledAt: new Date(data.enrolledAt * 1000),
                completedAt: data.completedAt ? new Date(data.completedAt * 1000) : undefined,
            }
        } catch {
            return null
        }
    }

    /** Get all enrollments for a wallet from the backend */
    async getAllProgress(wallet: string): Promise<CourseProgress[]> {
        try {
            // Fetch all courses then check enrollment per course
            const coursesRes = await fetch(`${getBackendUrl()}/api/courses`, { cache: 'no-store' })
            if (!coursesRes.ok) return []
            const coursesJson = await coursesRes.json() as { data?: BackendCourse[] }
            const courses = coursesJson.data ?? []

            const progressList = await Promise.all(
                courses.map((c) => this.getCourseProgress(wallet, c.courseId))
            )

            return progressList.filter(Boolean) as CourseProgress[]
        } catch {
            return []
        }
    }

    /** Delegate lesson completion to the backend (backend_signer co-signs) */
    async completeLesson(
        wallet: string,
        courseId: string,
        lessonIndex: number
    ): Promise<{ xpEarned: number; totalXP: number }> {
        const res = await fetch(`${getBackendUrl()}/api/complete-lesson`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId, learnerWallet: wallet, lessonIndex }),
        })

        if (!res.ok) {
            const err = await res.json() as { error?: string }
            throw new Error(err.error ?? 'Failed to complete lesson')
        }

        // After completion, refresh XP balance
        const totalXP = await this.getXPBalance(wallet)
        const xpEarned = totalXP > 0 ? 50 : 0 // estimate; backend emits event with exact amount
        return { xpEarned, totalXP }
    }

    /** Streaks are off-chain per spec — delegated to Supabase via import */
    async getStreakData(wallet: string): Promise<StreakData> {
        try {
            const { SupabaseLearningProgressService } = await import('../supabase/SupabaseLearningProgressService')
            const svc = new SupabaseLearningProgressService()
            return svc.getStreakData(wallet)
        } catch {
            return { currentStreak: 0, longestStreak: 0, lastActivity: null, history: [] }
        }
    }
}

// ─── On-Chain Credential Service ─────────────────────────────────────────────

export class OnChainCredentialService implements CredentialService {
    /** Fetch Metaplex Core credentials via backend → Helius DAS */
    async getCredentials(wallet: string): Promise<Credential[]> {
        try {
            const res = await fetch(`${getBackendUrl()}/api/credentials/${wallet}`, { cache: 'no-store' })
            if (!res.ok) return []
            const json = await res.json() as { data?: RawCredential[] }
            return (json.data ?? []).map((c) => ({
                mint: c.mint,
                trackId: c.trackId,
                trackName: c.trackName,
                level: c.level,
                coursesCompleted: c.coursesCompleted,
                totalXP: c.totalXP,
                imageUrl: c.imageUrl,
                issuedAt: new Date(c.issuedAt),
            }))
        } catch {
            return []
        }
    }

    async getCredentialByMint(mint: string): Promise<Credential | null> {
        const heliusUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? ''
        if (!heliusUrl) return null

        try {
            const res = await fetch(heliusUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: '1',
                    method: 'getAsset',
                    params: { id: mint },
                }),
            })
            const json = await res.json() as { result?: DasAsset }
            const item = json.result
            if (!item) return null

            const attrs = item.content?.metadata?.attributes ?? []
            return {
                mint,
                trackId: attrs.find((a) => a.trait_type === 'track_id')?.value ?? '',
                trackName: item.content?.metadata?.name ?? '',
                level: parseInt(attrs.find((a) => a.trait_type === 'level')?.value ?? '1', 10),
                coursesCompleted: parseInt(attrs.find((a) => a.trait_type === 'courses_completed')?.value ?? '0', 10),
                totalXP: parseInt(attrs.find((a) => a.trait_type === 'total_xp')?.value ?? '0', 10),
                imageUrl: item.content?.links?.image ?? '',
                issuedAt: new Date(item.created_at ?? Date.now()),
            }
        } catch {
            return null
        }
    }
}

// ─── Local types ──────────────────────────────────────────────────────────────

interface BackendCourse { courseId: string }

interface BackendEnrollment {
    courseId: string
    learner: string
    lessonCount: number
    completedLessons: number[]
    completedCount: number
    enrolledAt: number
    completedAt: number | null
    credentialAsset: string | null
}

interface RawCredential {
    mint: string
    trackId: string
    trackName: string
    level: number
    coursesCompleted: number
    totalXP: number
    imageUrl: string
    issuedAt: string
}

interface DasAttr { trait_type: string; value: string }
interface DasAsset {
    id: string
    created_at?: string
    content?: {
        metadata?: { name?: string; attributes?: DasAttr[] }
        links?: { image?: string }
    }
}
