'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

interface WalletGateProps {
    children: React.ReactNode
    message?: string
}

export function WalletGate({ children, message = 'Connect your wallet to access this page' }: WalletGateProps) {
    const { connected } = useWallet()

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

    return <>{children}</>
}
