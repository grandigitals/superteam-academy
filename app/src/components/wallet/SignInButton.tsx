'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useSignIn } from '@/hooks/useSignIn'
import { LogIn, LogOut, CheckCircle, Loader2, User } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

/**
 * Renders either:
 * - A "Sign In" button (wallet connected, not SIWS authenticated)
 * - A user avatar/name with sign-out dropdown (authenticated)
 */
export function SignInButton() {
    const { connected } = useWallet()
    const { isAuthenticated, user, signOut } = useAuthStore()
    const { signIn, loading } = useSignIn()
    const [showDropdown, setShowDropdown] = useState(false)

    // Not connected — nothing to show (WalletMultiButton handles this)
    if (!connected) return null

    // Authenticated — show user menu
    if (isAuthenticated && user) {
        const shortWallet = user.wallet.slice(0, 4) + '…' + user.wallet.slice(-4)
        const displayName = user.displayName ?? shortWallet

        return (
            <div className="relative">
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:border-sol-green/50 hover:text-sol-green"
                >
                    <CheckCircle className="h-3.5 w-3.5 text-sol-green" />
                    <span className="max-w-[100px] truncate">{displayName}</span>
                </button>

                {showDropdown && (
                    <div
                        className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-border py-1 shadow-xl"
                        style={{ background: 'var(--background-elevated)' }}
                        onMouseLeave={() => setShowDropdown(false)}
                    >
                        <Link
                            href="/profile"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-white/5"
                            onClick={() => setShowDropdown(false)}
                        >
                            <User className="h-3.5 w-3.5" />
                            Profile
                        </Link>
                        <button
                            onClick={() => { signOut(); setShowDropdown(false) }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground-muted hover:text-error hover:bg-white/5"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        )
    }

    // Connected but not authenticated — show Sign In
    return (
        <button
            onClick={signIn}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-sol-green/40 px-3 py-1.5 text-sm font-semibold text-sol-green transition-all hover:bg-sol-green/10 disabled:opacity-50"
            title="Sign in by signing a message with your wallet"
        >
            {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
                <LogIn className="h-3.5 w-3.5" />
            )}
            {loading ? 'Signing…' : 'Sign In'}
        </button>
    )
}
