'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Twitter, Github, Trophy, Award, ExternalLink } from 'lucide-react'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { XPBar } from '@/components/gamification/XPBar'
import { WalletGate } from '@/components/wallet/WalletGate'
import { useAuthStore } from '@/store/useAuthStore'
import { useXP } from '@/hooks/useXP'
import { createCredentialService } from '@/services/factory'
import type { Credential } from '@/services/types'
import { deriveLevel } from '@/lib/solana/xp'

const SKILL_DATA = [
    { subject: 'Rust', value: 65 },
    { subject: 'Anchor', value: 45 },
    { subject: 'Frontend', value: 80 },
    { subject: 'Security', value: 30 },
    { subject: 'DeFi', value: 55 },
    { subject: 'Infrastructure', value: 40 },
]

export default function ProfilePage() {
    const { publicKey } = useWallet()
    const { xp, user, isAuthenticated } = useAuthStore()
    const { refreshXP } = useXP()
    const [credentials, setCredentials] = useState<Credential[]>([])
    const [loadingCreds, setLoadingCreds] = useState(true)

    const displayName = user?.displayName ?? (publicKey ? `${publicKey.toBase58().slice(0, 8)}…` : 'Learner')
    const initials = displayName[0]?.toUpperCase() ?? '?'
    const level = deriveLevel(xp)

    useEffect(() => {
        if (!publicKey || !isAuthenticated) { setLoadingCreds(false); return }
        const wallet = publicKey.toBase58()

        refreshXP()
        createCredentialService()
            .getCredentials(wallet)
            .then(setCredentials)
            .catch(console.warn)
            .finally(() => setLoadingCreds(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publicKey, isAuthenticated])

    return (
        <WalletGate requireAuth message="Connect your wallet to view your profile.">
            <div className="min-h-screen px-4 py-10">
                <div className="mx-auto max-w-4xl space-y-8">
                    {/* Profile Header */}
                    <div className="card-glass rounded-2xl p-6 sm:p-8">
                        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <div className="h-20 w-20 rounded-full border-2 border-sol-green/40 bg-gradient-to-br from-sol-purple to-sol-blue flex items-center justify-center text-3xl font-bold text-background">
                                    {initials}
                                </div>
                                <LevelBadge xp={xp} size="sm" className="absolute -bottom-1 -right-1" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h1 className="font-display text-2xl font-bold truncate">{displayName}</h1>
                                <p className="mt-1 text-sm text-foreground-muted">Building on Solana. Level {level} learner.</p>
                                <div className="mt-2 flex flex-wrap gap-3 text-xs text-foreground-subtle">
                                    {publicKey && (
                                        <span className="font-mono">{publicKey.toBase58().slice(0, 20)}…</span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Trophy className="h-3.5 w-3.5 text-xp-gold" /> Level {level}
                                    </span>
                                </div>
                                <div className="mt-3 flex gap-3">
                                    {user && (
                                        <>
                                            <a href="#" className="text-foreground-muted hover:text-sol-green transition-colors" aria-label="Twitter">
                                                <Twitter className="h-4 w-4" />
                                            </a>
                                            <a href="#" className="text-foreground-muted hover:text-sol-green transition-colors" aria-label="GitHub">
                                                <Github className="h-4 w-4" />
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* XP panel */}
                            <div className="w-full sm:w-52">
                                <div className="mb-1 flex items-center justify-between">
                                    <span className="text-xs text-foreground-muted">Total XP</span>
                                    <span className="font-mono text-sm font-bold text-sol-green">{xp.toLocaleString()}</span>
                                </div>
                                <XPBar xp={xp} showDetails={false} />
                            </div>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="card-glass rounded-2xl p-6">
                        <h2 className="mb-4 font-display text-lg font-bold">Skills Breakdown</h2>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {SKILL_DATA.map(({ subject, value }) => (
                                <div key={subject} className="rounded-xl border border-border bg-white/5 p-3">
                                    <div className="mb-1 flex justify-between text-xs">
                                        <span className="text-foreground-muted">{subject}</span>
                                        <span className="font-mono text-sol-green">{value}%</span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                                        <div className="h-full rounded-full" style={{ width: `${value}%`, background: 'linear-gradient(90deg, #14f195, #9945ff)' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Credentials */}
                    <div>
                        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
                            <Award className="h-5 w-5 text-xp-gold" /> On-Chain Credentials
                        </h2>

                        {loadingCreds ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {[1, 2].map(i => (
                                    <div key={i} className="card-glass animate-pulse rounded-2xl p-5 h-28" />
                                ))}
                            </div>
                        ) : credentials.length === 0 ? (
                            <div className="card-glass flex flex-col items-center justify-center gap-3 rounded-2xl p-10 text-center">
                                <Award className="h-10 w-10 text-foreground-subtle opacity-30" />
                                <p className="text-sm text-foreground-muted">No credentials yet — complete a course track to earn your first NFT credential!</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {credentials.map(c => (
                                    <div key={c.mint} className="card-glass relative overflow-hidden rounded-2xl p-5">
                                        <div className="absolute inset-0 bg-gradient-to-br from-sol-purple/20 to-sol-green/10" />
                                        <div className="relative">
                                            {c.imageUrl ? (
                                                <img src={c.imageUrl} alt={c.trackName} className="mb-3 h-12 w-12 rounded-lg object-cover" />
                                            ) : (
                                                <div className="mb-3 text-3xl">🏆</div>
                                            )}
                                            <div className="font-bold">{c.trackName}</div>
                                            <div className="mt-1 text-xs text-foreground-muted">
                                                Level {c.level} · {c.totalXP.toLocaleString()} XP · Issued {c.issuedAt.toLocaleDateString()}
                                            </div>
                                            <div className="mt-3 flex items-center gap-2">
                                                <div className="inline-flex items-center gap-1 rounded border border-sol-green/30 bg-sol-green/10 px-2 py-0.5 text-xs text-sol-green">
                                                    ✓ Verified On-Chain
                                                </div>
                                                <a
                                                    href={`https://explorer.solana.com/address/${c.mint}?cluster=devnet`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-foreground-subtle hover:text-sol-green transition-colors"
                                                    title="View on Solana Explorer"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </WalletGate>
    )
}
