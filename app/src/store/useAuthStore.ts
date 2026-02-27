/**
 * Global auth state store using Zustand.
 *
 * Manages:
 *   - Connected wallet public key
 *   - SIWS authentication status
 *   - Cached user XP balance and profile
 *
 * Kept separate from wallet adapter state (connection) —
 * auth is explicitly obtained by signing in, not just by connecting.
 */

'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserData {
    id: string
    wallet: string
    displayName: string | null
}

interface AuthState {
    // Wallet
    connectedWallet: string | null
    setConnectedWallet: (wallet: string | null) => void

    // SIWS Auth
    isAuthenticated: boolean
    user: UserData | null
    signIn: (user: UserData) => void
    signOut: () => void

    // XP cache (refreshed after each lesson completion)
    xp: number
    setXP: (xp: number) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            connectedWallet: null,
            setConnectedWallet: (wallet) => set({ connectedWallet: wallet }),

            isAuthenticated: false,
            user: null,
            signIn: (user) => set({ isAuthenticated: true, user, connectedWallet: user.wallet }),
            signOut: () => set({ isAuthenticated: false, user: null, connectedWallet: null, xp: 0 }),

            xp: 0,
            setXP: (xp) => set({ xp }),
        }),
        {
            name: 'sta-auth',
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                user: state.user,
                connectedWallet: state.connectedWallet,
                xp: state.xp,
            }),
        }
    )
)
