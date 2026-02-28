'use client'

import { useCallback, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAuthStore } from '@/store/useAuthStore'
import { createSIWSMessage } from '@/lib/solana/auth'
import { toast } from 'sonner'
import bs58 from 'bs58'

interface SignInState {
    loading: boolean
    error: string | null
}

/**
 * useSignIn — implements the Sign-In With Solana flow.
 *
 * 1. Fetch a nonce from the server
 * 2. Build a SIWS message
 * 3. Request wallet signature
 * 4. Verify signature on server
 * 5. Update Zustand auth store
 */
export function useSignIn() {
    const { publicKey, signMessage } = useWallet()
    const signIn = useAuthStore(s => s.signIn)
    const [state, setState] = useState<SignInState>({ loading: false, error: null })

    const handleSignIn = useCallback(async () => {
        if (!publicKey || !signMessage) {
            toast.error('Connect your wallet first')
            return
        }

        setState({ loading: true, error: null })

        try {
            // Step 1: Get nonce
            const nonceRes = await fetch(`/api/auth/nonce?publicKey=${publicKey.toBase58()}`)
            if (!nonceRes.ok) throw new Error('Failed to get nonce')
            const { nonce } = await nonceRes.json() as { nonce: string }

            // Step 2: Build message
            const message = createSIWSMessage(publicKey.toBase58(), nonce)

            // Step 3: Sign with wallet
            const messageBytes = new TextEncoder().encode(message)
            const signatureBytes = await signMessage(messageBytes)
            const signatureBase58 = bs58.encode(signatureBytes)

            // Step 4: Verify on server — send the exact message that was signed
            // (server cannot reconstruct it because it embeds a live timestamp)
            const verifyRes = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    publicKey: publicKey.toBase58(),
                    signature: signatureBase58,
                    message,
                }),
            })

            if (!verifyRes.ok) {
                const { error } = await verifyRes.json() as { error: string }
                throw new Error(error ?? 'Signature verification failed')
            }

            const { user } = await verifyRes.json() as {
                user: { id: string; wallet: string; displayName: string | null }
            }

            // Step 5: Update store
            signIn(user)
            toast.success('Signed in successfully! 👋', { duration: 3000 })
            setState({ loading: false, error: null })
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Sign in failed'
            setState({ loading: false, error: message })
            toast.error(message)
        }
    }, [publicKey, signMessage, signIn])

    return { signIn: handleSignIn, ...state }
}
