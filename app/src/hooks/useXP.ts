'use client'

/**
 * useXP hook
 *
 * Auto-fetches the connected wallet's XP balance and writes it to the
 * global auth store so the Navbar LevelBadge, Dashboard, and Profile
 * always show fresh data.
 *
 * Priority:
 *   1. SPL token balance (if NEXT_PUBLIC_XP_MINT is set)
 *   2. Sum from LearningProgressService (Supabase xp_ledger or mock)
 */

import { useEffect, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAuthStore } from '@/store/useAuthStore'
import { getXPBalanceAction } from '@/app/actions/learning-progress'
import { getXPBalance } from '@/lib/solana/onchain'

/**
 * Call this hook once at the top level of any authenticated page.
 * It re-fetches XP whenever the wallet changes and exposes a manual
 * `refreshXP()` function for components like CompleteButton.
 */
export function useXP() {
    const { publicKey } = useWallet()
    const { isAuthenticated, setXP } = useAuthStore()

    const fetchXP = useCallback(async () => {
        if (!publicKey || !isAuthenticated) return

        const wallet = publicKey.toBase58()

        try {
            // 1. Try on-chain SPL token balance first
            const XP_MINT = process.env.NEXT_PUBLIC_XP_MINT
            if (XP_MINT) {
                const onchainXP = await getXPBalance(wallet)
                if (onchainXP > 0) {
                    setXP(onchainXP)
                    return
                }
            }

            // 2. Fall back to service layer (Supabase sum or mock in-memory)
            const { xp, error } = await getXPBalanceAction(wallet)
            if (error) console.warn('[useXP] backend error:', error)
            setXP(xp ?? 0)
        } catch (err) {
            console.warn('[useXP] failed to fetch XP:', err)
        }
    }, [publicKey, isAuthenticated, setXP])

    // Fetch on mount and whenever the wallet changes
    useEffect(() => {
        fetchXP()
    }, [fetchXP])

    return { refreshXP: fetchXP }
}
