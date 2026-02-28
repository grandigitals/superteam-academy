/**
 * backend/src/pda.ts
 *
 * All 6 PDA derivation helpers matching the on-chain seeds from SPEC.md.
 * Mirrors what the frontend derives — must stay in sync with the Anchor program.
 */

import { PublicKey } from '@solana/web3.js'
import { config } from './config'

const PROGRAM_ID = config.programId

/** Config singleton PDA — ["config"] */
export function configPda(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from('config')], PROGRAM_ID)
}

/** Course PDA — ["course", courseId] */
export function coursePda(courseId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('course'), Buffer.from(courseId)],
        PROGRAM_ID
    )
}

/** Enrollment PDA — ["enrollment", courseId, learner] */
export function enrollmentPda(courseId: string, learner: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('enrollment'), Buffer.from(courseId), learner.toBuffer()],
        PROGRAM_ID
    )
}

/** MinterRole PDA — ["minter", minter] */
export function minterRolePda(minter: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('minter'), minter.toBuffer()],
        PROGRAM_ID
    )
}

/** AchievementType PDA — ["achievement", achievementId] */
export function achievementTypePda(achievementId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('achievement'), Buffer.from(achievementId)],
        PROGRAM_ID
    )
}

/** AchievementReceipt PDA — ["achievement_receipt", achievementId, recipient] */
export function achievementReceiptPda(achievementId: string, recipient: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('achievement_receipt'), Buffer.from(achievementId), recipient.toBuffer()],
        PROGRAM_ID
    )
}
