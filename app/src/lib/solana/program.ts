/**
 * app/src/lib/solana/program.ts
 *
 * Read-only Anchor Program client for the frontend.
 *
 * IMPORTANT: This module requires the Anchor IDL to be generated first.
 * Run `anchor build` in the `onchain-academy/` directory before using this.
 *
 * The program instance is used to:
 * - Read Course PDAs to display catalog
 * - Read Enrollment PDAs for progress display
 *
 * It does NOT hold a signer keypair:
 * - Mutations (complete_lesson, finalize_course) → backend/ REST API
 * - Learner transactions (enroll, close_enrollment) → user's wallet adapter
 */

import { Connection, PublicKey } from '@solana/web3.js'

export const PROGRAM_ID = new PublicKey(
    process.env.NEXT_PUBLIC_PROGRAM_ID ?? 'ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf'
)

export const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')

/** Lazy singleton RPC connection */
let _connection: Connection | null = null
export function getConnection(): Connection {
    if (!_connection) {
        const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com'
        _connection = new Connection(rpc, 'confirmed')
    }
    return _connection
}

/**
 * Creates a read-only Anchor program instance.
 *
 * REQUIRES: Run `anchor build` in onchain-academy/ first to generate IDL at:
 * onchain-academy/target/idl/onchain_academy.json
 *
 * This function is intentionally kept as a dynamic import to:
 * 1. Avoid bundling Anchor + IDL on every page
 * 2. Allow graceful runtime failure when IDL not yet built
 */
export async function getReadonlyProgram() {
    const [{ AnchorProvider, Program, Wallet }, { Keypair }] = await Promise.all([
        import('@coral-xyz/anchor'),
        import('@solana/web3.js'),
    ])

    // Dynamic require of generated IDL. Run `anchor build` to create this file.
    // Using require() (not import()) so TypeScript does not validate the path at compile time.
    let IDL: object
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        IDL = require('../../../onchain-academy/target/idl/onchain_academy.json') as object
    } catch {
        throw new Error(
            'Anchor IDL not found. Run `anchor build` in onchain-academy/ first.\n' +
            'Expected: onchain-academy/target/idl/onchain_academy.json'
        )
    }

    const connection = getConnection()
    const dummyKeypair = Keypair.generate()
    const wallet = new Wallet(dummyKeypair)
    const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Program(IDL as any, provider)
}
