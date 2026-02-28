'use client'

import { useState, useEffect } from 'react'
import { Settings, Globe, Palette, Wallet, User, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { getProfileAction, upsertProfileAction } from '@/app/actions/profile'
import { useTranslations, useLocale } from 'next-intl'

export function SettingsClient() {
    const t = useTranslations('settings')
    const { user, signIn } = useAuthStore()
    const locale = useLocale()

    const [displayName, setDisplayName] = useState('')
    const [bio, setBio] = useState('')
    const [twitter, setTwitter] = useState('')
    const [github, setGithub] = useState('')

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [savedMessage, setSavedMessage] = useState(false)

    useEffect(() => {
        if (!user?.wallet) return

        getProfileAction(user.wallet)
            .then(({ profile }) => {
                if (profile) {
                    setDisplayName(profile.displayName || '')
                    setBio(profile.bio || '')
                    setTwitter(profile.twitter || '')
                    setGithub(profile.github || '')
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [user?.wallet])

    const handleSave = async () => {
        if (!user?.wallet) return

        setSaving(true)
        setSavedMessage(false)

        try {
            const { success, profile } = await upsertProfileAction({
                wallet: user.wallet,
                displayName,
                bio,
                twitter,
                github,
            })

            if (success && profile) {
                // Update the global auth store if the display name changed
                if (profile.displayName !== user.displayName) {
                    signIn({ ...user, displayName: profile.displayName ?? null })
                }

                setSavedMessage(true)
                setTimeout(() => setSavedMessage(false), 3000)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-sol-green" />
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-sol-green" />
                <h1 className="font-display text-3xl font-bold">{t('title')}</h1>
            </div>

            {/* Profile Section */}
            <div className="card-glass rounded-2xl p-6">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <User className="h-4 w-4 text-sol-green" /> {t('profile')}
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-xs text-foreground-muted">Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="e.g. AliceDev"
                            className="w-full rounded-xl border border-border bg-background-surface py-2.5 px-3 text-sm text-foreground placeholder:text-foreground-subtle focus:border-sol-green/50 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs text-foreground-muted">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                            rows={3}
                            className="w-full rounded-xl border border-border bg-background-surface py-2.5 px-3 text-sm text-foreground placeholder:text-foreground-subtle focus:border-sol-green/50 focus:outline-none resize-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1.5 block text-xs text-foreground-muted">Twitter / X</label>
                            <input
                                type="text"
                                value={twitter}
                                onChange={(e) => setTwitter(e.target.value)}
                                placeholder="@username"
                                className="w-full rounded-xl border border-border bg-background-surface py-2.5 px-3 text-sm text-foreground placeholder:text-foreground-subtle focus:border-sol-green/50 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs text-foreground-muted">GitHub</label>
                            <input
                                type="text"
                                value={github}
                                onChange={(e) => setGithub(e.target.value)}
                                placeholder="username"
                                className="w-full rounded-xl border border-border bg-background-surface py-2.5 px-3 text-sm text-foreground placeholder:text-foreground-subtle focus:border-sol-green/50 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Language */}
            <div className="card-glass rounded-2xl p-6">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Globe className="h-4 w-4 text-sol-blue" /> {t('language')}
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {[{ code: 'en', label: '🇺🇸 English' }, { code: 'pt-BR', label: '🇧🇷 Português' }, { code: 'es', label: '🇪🇸 Español' }].map(l => (
                        <button
                            key={l.code}
                            disabled
                            className={`rounded-xl border py-2.5 text-sm font-medium transition-colors opacity-80 cursor-default ${locale === l.code ? 'border-sol-green/40 bg-sol-green/10 text-sol-green' : 'border-border text-foreground-muted'}`}
                        >
                            {l.label}
                        </button>
                    ))}
                </div>
                <p className="mt-3 text-xs text-foreground-muted">Use the language switcher in the navigation bar to change your interface language.</p>
            </div>

            {/* Wallets */}
            <div className="card-glass rounded-2xl p-6">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Wallet className="h-4 w-4 text-xp-gold" /> {t('connectedWallets')}
                </div>
                {user?.wallet && (
                    <div className="rounded-xl border border-sol-green/30 bg-sol-green/5 p-4 flex items-center justify-between">
                        <div>
                            <div className="font-mono text-sm text-foreground">{user.wallet.slice(0, 6)}...{user.wallet.slice(-4)}</div>
                        </div>
                        <div className="rounded border border-sol-green/30 bg-sol-green/10 px-2 py-0.5 text-xs text-sol-green">Primary</div>
                    </div>
                )}
            </div>

            {/* Save */}
            <button
                onClick={handleSave}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-background transition-all hover:scale-[1.01] disabled:opacity-70 disabled:hover:scale-100"
                style={{ background: 'linear-gradient(135deg, #ffd23f, #008c4c)' }}
            >
                {saving && <Loader2 className="h-5 w-5 animate-spin" />}
                {savedMessage ? t('saved') : t('saveChanges')}
            </button>
        </div>
    )
}
