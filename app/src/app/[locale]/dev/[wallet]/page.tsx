import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Trophy, Award, ExternalLink, Twitter, Github, Lock } from 'lucide-react'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { XPBar } from '@/components/gamification/XPBar'
import { getPublicResumeDataAction } from '@/app/actions/public-resume'

interface Props {
    params: Promise<{ locale: string; wallet: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { wallet } = await params
    return {
        title: `Developer Profile | ${wallet.slice(0, 4)}...${wallet.slice(-4)}`,
        description: `Verified Solana Developer Resume for ${wallet}`,
    }
}

export default async function PublicResumePage({ params }: Props) {
    const { wallet } = await params

    const data = await getPublicResumeDataAction(wallet)

    if (data.error || !data.profile) {
        return (
            <div className="min-h-screen px-4 py-20 flex flex-col items-center justify-center text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500 mb-6">
                    <Lock className="h-10 w-10" />
                </div>
                <h1 className="font-display text-3xl font-bold mb-3">Profile Unavailable</h1>
                <p className="text-foreground-muted mb-8 max-w-md">
                    We couldn't find a public Proof of Skill resume for this wallet address. They may not have created an account yet, or their profile is set to private.
                </p>
                <Link href="/" className="rounded-xl px-6 py-3 font-semibold text-background transition-transform hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #ffd23f, #008c4c)' }}>
                    Return to Academy
                </Link>
            </div>
        )
    }

    const { profile, skills, credentials } = data
    const displayName = profile.displayName || `${wallet.slice(0, 8)}…`
    const initials = displayName[0]?.toUpperCase() ?? '?'

    return (
        <div className="min-h-screen px-4 py-10">
            <div className="mx-auto max-w-4xl space-y-8">

                {/* Proof of Skill Banner */}
                <div className="flex items-center gap-3 rounded-2xl border border-sol-green/30 bg-sol-green/5 px-6 py-4">
                    <div className="flex bg-sol-green rounded-full p-1.5 shrink-0 text-background">
                        <Award className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="font-bold text-sm text-foreground">Verified Proof of Skill</h2>
                        <p className="text-xs text-foreground-muted">This developer's XP and credentials are cryptographically verified on the Solana blockchain.</p>
                    </div>
                </div>

                {/* Profile Header */}
                <div className="card-glass rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-sol-purple/20 via-sol-blue/20 to-sol-green/20" />
                    <div className="relative pt-12 flex flex-col items-start gap-6 sm:flex-row sm:items-end">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="h-24 w-24 rounded-full border-4 border-background bg-gradient-to-br from-sol-purple to-sol-blue flex items-center justify-center text-4xl font-bold text-white shadow-xl">
                                {initials}
                            </div>
                            <LevelBadge xp={profile.xp} size="md" className="absolute -bottom-2 -right-2 shadow-lg" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 pb-2">
                            <h1 className="font-display text-3xl font-bold truncate">{displayName}</h1>
                            {profile.bio && (
                                <p className="mt-2 text-sm text-foreground-muted leading-relaxed max-w-lg">{profile.bio}</p>
                            )}
                            <div className="mt-3 flex flex-wrap gap-4 text-xs text-foreground-subtle">
                                <a
                                    href={`https://explorer.solana.com/address/${wallet}?cluster=devnet`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono hover:text-sol-green transition-colors flex items-center gap-1.5"
                                >
                                    {wallet.slice(0, 12)}...{wallet.slice(-12)} <ExternalLink className="h-3 w-3" />
                                </a>
                                <span className="flex items-center gap-1.5 text-xp-gold font-medium">
                                    <Trophy className="h-4 w-4" /> Level {profile.level}
                                </span>
                            </div>
                            <div className="mt-4 flex gap-4">
                                {profile.twitter && (
                                    <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-foreground transition-colors hover:text-sol-blue">
                                        <Twitter className="h-4 w-4 text-sol-blue" /> @{profile.twitter}
                                    </a>
                                )}
                                {profile.github && (
                                    <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-foreground transition-colors hover:text-white">
                                        <Github className="h-4 w-4" /> {profile.github}
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* XP panel */}
                        <div className="w-full sm:w-56 pb-2">
                            <div className="mb-1 flex items-center justify-between">
                                <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Total XP Earned</span>
                                <span className="font-mono text-lg font-bold text-sol-green">{profile.xp.toLocaleString()}</span>
                            </div>
                            <XPBar xp={profile.xp} showDetails={false} />
                        </div>
                    </div>
                </div>

                {/* Skills */}
                <div className="card-glass rounded-2xl p-6 sm:p-8">
                    <h2 className="mb-6 font-display text-xl font-bold">Demonstrated Skills</h2>

                    {skills.length === 0 ? (
                        <div className="flex h-24 items-center justify-center rounded-xl border border-border bg-white/5 text-sm text-foreground-muted">
                            New learner — skills radar initializing!
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {skills.map(({ subject, value }) => (
                                <div key={subject} className="rounded-xl border border-border bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-white/10">
                                    <div className="mb-2 flex justify-between text-sm">
                                        <span className="font-medium text-foreground">{subject}</span>
                                        <span className="font-mono text-sol-green">{value}%</span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                                        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${value}%`, background: 'linear-gradient(90deg, #ffd23f, #008c4c)' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Credentials */}
                <div>
                    <h2 className="mb-6 flex items-center gap-2 font-display text-xl font-bold">
                        <Award className="h-6 w-6 text-xp-gold" /> Academy Credentials
                    </h2>

                    {credentials.length === 0 ? (
                        <div className="card-glass flex flex-col items-center justify-center gap-3 rounded-2xl p-10 text-center">
                            <Award className="h-12 w-12 text-foreground-subtle opacity-30" />
                            <p className="text-sm text-foreground-muted">No credentials verified for this wallet yet.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {credentials.map(c => (
                                <div key={c.mint} className="card-glass relative overflow-hidden rounded-2xl p-6 group transition-all hover:border-sol-green/30 hover:shadow-lg hover:shadow-sol-green/5">
                                    <div className="absolute inset-0 bg-gradient-to-br from-sol-purple/10 to-sol-green/5 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative">
                                        {c.imageUrl ? (
                                            <Image src={c.imageUrl} alt={c.trackName} width={64} height={64} className="mb-4 rounded-xl object-cover shadow-md" />
                                        ) : (
                                            <div className="mb-4 text-4xl">🏆</div>
                                        )}
                                        <div className="font-bold text-lg leading-tight">{c.trackName}</div>
                                        <div className="mt-1.5 text-xs font-medium text-foreground-muted">
                                            Level {c.level} · {c.totalXP.toLocaleString()} XP
                                        </div>
                                        <div className="mt-4 flex items-center gap-2">
                                            <div className="inline-flex items-center gap-1.5 rounded-md border border-sol-green/30 bg-sol-green/10 px-2.5 py-1 text-[11px] font-medium text-sol-green uppercase tracking-wide">
                                                ✓ Metaplex Core
                                            </div>
                                            <a
                                                href={`https://explorer.solana.com/address/${c.mint}?cluster=devnet`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ml-auto text-foreground-subtle hover:text-foreground transition-colors"
                                                title="View NFT on Solana Explorer"
                                            >
                                                <ExternalLink className="h-4 w-4" />
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
    )
}
