/**
 * app/src/lib/solana/pda.ts
 *
 * PDA derivation helpers for the frontend — mirrors the backend and on-chain seeds exactly.
 *
 * Program seeds from SPEC.md:
 *   Config     → ["config"]
 *   Course     → ["course", courseId]
 *   Enrollment → ["enrollment", courseId, learner]
 *   MinterRole → ["minter", minter]
 *   AchievementType   → ["achievement", achievementId]
 *   AchievementReceipt → ["achievement_receipt", achievementId, recipient]
 */

import { PublicKey } from '@solana/web3.js'

export const PROGRAM_ID = new PublicKey(
    process.env.NEXT_PUBLIC_PROGRAM_ID ?? 'ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf'
)

export function configPda(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from('config')], PROGRAM_ID)
}

export function coursePda(courseId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('course'), Buffer.from(courseId)],
        PROGRAM_ID
    )
}

export function enrollmentPda(courseId: string, learner: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('enrollment'), Buffer.from(courseId), learner.toBuffer()],
        PROGRAM_ID
    )
}

export function minterRolePda(minter: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('minter'), minter.toBuffer()],
        PROGRAM_ID
    )
}

export function achievementTypePda(achievementId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('achievement'), Buffer.from(achievementId)],
        PROGRAM_ID
    )
}
