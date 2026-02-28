/**
 * backend/src/keypair.ts
 *
 * Loads the backend signer keypair from environment variable.
 * Supports both JSON array format ([1,2,...,64]) and base58 string.
 */

import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'
import { config } from './config'

let _backendSigner: Keypair | null = null

export function getBackendSigner(): Keypair {
    if (_backendSigner) return _backendSigner

    const raw = config.backendSignerKeypair.trim()

    try {
        if (raw.startsWith('[')) {
            // JSON array of bytes
            const bytes = JSON.parse(raw) as number[]
            _backendSigner = Keypair.fromSecretKey(Uint8Array.from(bytes))
        } else {
            // base58 encoded secret key
            _backendSigner = Keypair.fromSecretKey(bs58.decode(raw))
        }
    } catch (err) {
        throw new Error(`Failed to load BACKEND_SIGNER_KEYPAIR: ${(err as Error).message}`)
    }

    return _backendSigner
}
