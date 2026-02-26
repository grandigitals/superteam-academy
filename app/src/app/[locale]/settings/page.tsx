import type { Metadata } from 'next'
import { Settings, Globe, Palette, Wallet, User } from 'lucide-react'
import { WalletGate } from '@/components/wallet/WalletGate'

export const metadata: Metadata = { title: 'Settings' }

export default function SettingsPage() {
    return (
        <WalletGate>
            <div className="min-h-screen px-4 py-10">
                <div className="mx-auto max-w-2xl space-y-6">
                    <div className="flex items-center gap-3">
                        <Settings className="h-6 w-6 text-sol-green" />
                        <h1 className="font-display text-3xl font-bold">Settings</h1>
                    </div>

                    {/* Profile Section */}
                    <div className="card-glass rounded-2xl p-6">
                        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                            <User className="h-4 w-4 text-sol-green" /> Profile
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs text-foreground-muted">Display Name</label>
                                <input type="text" placeholder="e.g. AliceDev" className="w-full rounded-xl border border-border bg-background-surface py-2.5 px-3 text-sm text-foreground placeholder:text-foreground-subtle focus:border-sol-green/50 focus:outline-none" defaultValue="AliceDev" />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs text-foreground-muted">Bio</label>
                                <textarea placeholder="Tell us about yourself..." rows={3} className="w-full rounded-xl border border-border bg-background-surface py-2.5 px-3 text-sm text-foreground placeholder:text-foreground-subtle focus:border-sol-green/50 focus:outline-none resize-none" defaultValue="Building on Solana. 🦀" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1.5 block text-xs text-foreground-muted">Twitter / X</label>
                                    <input type="text" placeholder="@username" className="w-full rounded-xl border border-border bg-background-surface py-2.5 px-3 text-sm text-foreground placeholder:text-foreground-subtle focus:border-sol-green/50 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs text-foreground-muted">GitHub</label>
                                    <input type="text" placeholder="username" className="w-full rounded-xl border border-border bg-background-surface py-2.5 px-3 text-sm text-foreground placeholder:text-foreground-subtle focus:border-sol-green/50 focus:outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Language */}
                    <div className="card-glass rounded-2xl p-6">
                        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Globe className="h-4 w-4 text-sol-blue" /> Language
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[{ code: 'en', label: '🇺🇸 English' }, { code: 'pt-BR', label: '🇧🇷 Português' }, { code: 'es', label: '🇪🇸 Español' }].map(l => (
                                <button
                                    key={l.code}
                                    className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${l.code === 'en' ? 'border-sol-green/40 bg-sol-green/10 text-sol-green' : 'border-border text-foreground-muted hover:border-sol-green/30 hover:text-sol-green'}`}
                                >
                                    {l.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Theme */}
                    <div className="card-glass rounded-2xl p-6">
                        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Palette className="h-4 w-4 text-sol-purple" /> Theme
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[{ key: 'dark', label: '🌙 Dark' }, { key: 'light', label: '☀️ Light' }, { key: 'system', label: '💻 System' }].map(t => (
                                <button
                                    key={t.key}
                                    className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${t.key === 'dark' ? 'border-sol-purple/40 bg-sol-purple/10 text-sol-purple' : 'border-border text-foreground-muted hover:border-sol-purple/30'}`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Wallets */}
                    <div className="card-glass rounded-2xl p-6">
                        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Wallet className="h-4 w-4 text-xp-gold" /> Connected Wallets
                        </div>
                        <div className="rounded-xl border border-sol-green/30 bg-sol-green/5 p-4 flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium">Phantom</div>
                                <div className="font-mono text-xs text-foreground-muted">Alice111...1111</div>
                            </div>
                            <div className="rounded border border-sol-green/30 bg-sol-green/10 px-2 py-0.5 text-xs text-sol-green">Primary</div>
                        </div>
                    </div>

                    {/* Save */}
                    <button
                        className="w-full rounded-xl py-3 font-semibold text-background transition-all hover:scale-[1.01]"
                        style={{ background: 'linear-gradient(135deg, #14f195, #9945ff)' }}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </WalletGate>
    )
}
