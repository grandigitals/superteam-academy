'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { cn } from '@/lib/utils'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { SignInButton } from '@/components/wallet/SignInButton'
import { useAuthStore } from '@/store/useAuthStore'
import { deriveLevel } from '@/lib/solana/xp'
import { BookOpen, LayoutDashboard, Trophy, Menu, X, Zap } from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

const LOCALES = [
    { code: 'en', label: 'EN', flag: '🇺🇸' },
    { code: 'pt-BR', label: 'PT', flag: '🇧🇷' },
    { code: 'es', label: 'ES', flag: '🇪🇸' },
]

export function Navbar() {
    const t = useTranslations('nav')
    const { connected } = useWallet()
    const { isAuthenticated, xp } = useAuthStore()
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)
    const level = deriveLevel(xp)

    const navLinks = [
        { href: '/courses', label: t('courses'), icon: BookOpen },
        { href: '/leaderboard', label: t('leaderboard'), icon: Trophy },
        ...(connected ? [{ href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard }] : []),
    ]

    return (
        <header className="sticky top-0 z-50 border-b border-border backdrop-blur-xl" style={{ background: 'rgba(10,10,15,0.85)' }}>
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-sol">
                        <Zap className="h-4 w-4 text-background" fill="currentColor" />
                    </div>
                    <span className="gradient-sol-text hidden sm:block">Superteam Academy</span>
                    <span className="gradient-sol-text sm:hidden">STA</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden items-center gap-6 md:flex">
                    {navLinks.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-sol-green',
                                pathname?.includes(href) ? 'text-sol-green' : 'text-foreground-muted'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    {/* Language switcher */}
                    <div className="hidden items-center gap-1 md:flex">
                        {LOCALES.map(({ code, label, flag }) => (
                            <Link
                                key={code}
                                href={`/${code}${pathname?.replace(/^\/(en|pt-BR|es)/, '') ?? ''}`}
                                className="rounded px-1.5 py-0.5 text-xs font-mono text-foreground-muted transition-colors hover:text-sol-green"
                                title={flag}
                            >
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Level badge — only when authenticated */}
                    {isAuthenticated && (
                        <Link href="/profile" title={`Level ${level}`}>
                            <LevelBadge xp={xp} size="sm" />
                        </Link>
                    )}

                    {/* SIWS Sign In / user menu */}
                    <SignInButton />

                    {/* Wallet connect button */}
                    <div className="wallet-adapter-custom">
                        <WalletMultiButton />
                    </div>

                    {/* Mobile menu toggle */}
                    <button
                        className="rounded-lg p-2 text-foreground-muted hover:text-foreground md:hidden"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="border-t border-border md:hidden" style={{ background: 'var(--background-elevated)' }}>
                    <div className="flex flex-col gap-1 px-4 py-3">
                        {navLinks.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted hover:bg-white/5 hover:text-sol-green"
                                onClick={() => setMobileOpen(false)}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </Link>
                        ))}
                        {/* Language switcher — mobile */}
                        <div className="flex gap-2 px-3 py-2 border-t border-border mt-1 pt-3">
                            {LOCALES.map(({ code, label, flag }) => (
                                <Link
                                    key={code}
                                    href={`/${code}${pathname?.replace(/^\/(en|pt-BR|es)/, '') ?? ''}`}
                                    className="text-xs font-mono text-foreground-muted hover:text-sol-green"
                                    title={flag}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
