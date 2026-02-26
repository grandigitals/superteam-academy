import Link from 'next/link'
import { Zap, Github, Twitter } from 'lucide-react'

export function Footer() {
    return (
        <footer className="border-t border-border py-10 mt-16" style={{ background: 'var(--background-elevated)' }}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 font-display font-bold">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-sol">
                                <Zap className="h-3.5 w-3.5 text-background" fill="currentColor" />
                            </div>
                            <span className="gradient-sol-text text-sm">Superteam Academy</span>
                        </Link>
                        <p className="mt-2 text-xs text-foreground-muted leading-relaxed">
                            Interactive LMS for Solana blockchain development. Earn XP, build programs, get on-chain credentials.
                        </p>
                    </div>

                    {/* Learn */}
                    <div>
                        <h3 className="mb-3 text-xs font-semibold text-foreground uppercase tracking-wide">Learn</h3>
                        <ul className="space-y-2 text-sm text-foreground-muted">
                            <li><Link href="/courses" className="hover:text-sol-green transition-colors">Courses</Link></li>
                            <li><Link href="/leaderboard" className="hover:text-sol-green transition-colors">Leaderboard</Link></li>
                            <li><Link href="/dashboard" className="hover:text-sol-green transition-colors">Dashboard</Link></li>
                        </ul>
                    </div>

                    {/* Solana */}
                    <div>
                        <h3 className="mb-3 text-xs font-semibold text-foreground uppercase tracking-wide">Ecosystem</h3>
                        <ul className="space-y-2 text-sm text-foreground-muted">
                            <li><a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="hover:text-sol-green transition-colors">Solana</a></li>
                            <li><a href="https://superteam.fun" target="_blank" rel="noopener noreferrer" className="hover:text-sol-green transition-colors">Superteam</a></li>
                            <li><a href="https://github.com/solanabr/superteam-academy" target="_blank" rel="noopener noreferrer" className="hover:text-sol-green transition-colors">GitHub</a></li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="mb-3 text-xs font-semibold text-foreground uppercase tracking-wide">Community</h3>
                        <div className="flex gap-3">
                            <a href="https://github.com/solanabr/superteam-academy" target="_blank" rel="noopener noreferrer" className="text-foreground-muted hover:text-sol-green transition-colors" aria-label="GitHub">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="https://twitter.com/superteambr" target="_blank" rel="noopener noreferrer" className="text-foreground-muted hover:text-sol-green transition-colors" aria-label="Twitter">
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 sm:flex-row">
                    <p className="text-xs text-foreground-subtle">
                        © 2024 Superteam Academy. Open source under MIT License.
                    </p>
                    <p className="text-xs text-foreground-subtle">
                        Built on <span className="text-sol-green">Solana</span>
                    </p>
                </div>
            </div>
        </footer>
    )
}
