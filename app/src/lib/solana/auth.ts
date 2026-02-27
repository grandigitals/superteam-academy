/**
 * Wallet-based authentication utilities.
 *
 * Sign-In With Solana (SIWS) message format compatible with the Solana
 * wallet adapter ecosystem. The user signs a plaintext statement with their
 * wallet private key — no seed phrase or sensitive data ever leaves the wallet.
 *
 * Flow:
 *   1. Frontend calls `createSIWSMessage(publicKey, nonce)` → message string
 *   2. Wallet signs the UTF-8 bytes of that message  → Uint8Array `signature`
 *   3. Frontend sends `{ publicKey, signature, nonce }` to the verification endpoint
 *   4. Server calls `verifySIWSSignature(...)` → returns `isValid`
 */

import { PublicKey } from '@solana/web3.js'
import nacl from 'tweetnacl'
import bs58 from 'bs58'

export interface SIWSMessage {
    statement: string
    nonce: string
    issuedAt: string
    expirationTime: string
}

/**
 * Create a human-readable sign-in message for the user to sign.
 */
export function createSIWSMessage(publicKey: string, nonce: string): string {
    const issuedAt = new Date().toISOString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 min

    return [
        'Superteam Academy',
        '',
        'Sign in to Superteam Academy.',
        '',
        `URI: https://academy.superteam.fun`,
        `Version: 1`,
        `Chain ID: devnet`,
        `Nonce: ${nonce}`,
        `Issued At: ${issuedAt}`,
        `Expiration Time: ${expiresAt}`,
        `Wallet: ${publicKey}`,
    ].join('\n')
}

/**
 * Verify a SIWS message signature on the server side.
 * The wallet signs the raw UTF-8 bytes of the message string.
 */
export function verifySIWSSignature(
    message: string,
    signatureBase58: string,
    publicKeyBase58: string
): boolean {
    try {
        const messageBytes = new TextEncoder().encode(message)
        const signatureBytes = bs58.decode(signatureBase58)
        const publicKeyBytes = new PublicKey(publicKeyBase58).toBytes()

        return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes)
    } catch {
        return false
    }
}

/**
 * Generate a cryptographically secure nonce.
 * Should be stored server-side and consumed once.
 */
export function generateNonce(): string {
    const bytes = nacl.randomBytes(16)
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}
