'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useAuthStore } from '@/store/useAuthStore'
import { SignInButton } from '@/components/wallet/SignInButton'

interface WalletGateProps {
    children: React.ReactNode
    message?: string
    requireAuth?: boolean // if true, also requires SIWS sign-in (not just wallet connect)
}

/**
 * Guards content behind:
 *   - Wallet connection (always)
 *   - SIWS authentication (when requireAuth=true)
 */
export function WalletGate({
    children,
    message = 'Connect your wallet to access this page',
    requireAuth = false,
}: WalletGateProps) {
    const { connected } = useWallet()
    const { isAuthenticated } = useAuthStore()

    if (!connected) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center px-4">
                <div className="text-6xl">🔐</div>
                <div>
                    <h2 className="mb-2 font-display text-2xl font-bold">Wallet Required</h2>
                    <p className="text-foreground-muted">{message}</p>
                </div>
                <WalletMultiButton />
            </div>
        )
    }

    if (requireAuth && !isAuthenticated) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center px-4">
                <div className="text-6xl">✍️</div>
                <div>
                    <h2 className="mb-2 font-display text-2xl font-bold">Sign In Required</h2>
                    <p className="text-foreground-muted">
                        Sign a message with your wallet to verify your identity and access this page.
                    </p>
                </div>
                <SignInButton />
            </div>
        )
    }

    return <>{children}</>
}
