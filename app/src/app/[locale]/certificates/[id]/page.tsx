import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink, Download, Share2, Shield, Award } from 'lucide-react'

interface Props {
    params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    return { title: `Certificate ${id}` }
}

export default async function CertificatePage({ params }: Props) {
    const { id } = await params

    const MOCK_CERT = {
        id,
        recipientName: 'AliceDev',
        courseName: 'Introduction to Solana',
        trackName: 'Solana Fundamentals',
        completedOn: 'February 15, 2024',
        mintAddress: '7nqRM...xyz9',
        metadataUri: 'https://arweave.net/abc123',
        totalXP: 1500,
    }

    return (
        <div className="min-h-screen px-4 py-10">
            <div className="mx-auto max-w-2xl space-y-6">
                {/* Certificate Card */}
                <div className="relative overflow-hidden rounded-3xl border-2 border-sol-green/40 bg-background-elevated p-10 text-center shadow-2xl"
                    style={{ boxShadow: '0 0 60px rgba(20,241,149,0.15), 0 0 20px rgba(153,69,255,0.1)' }}>
                    {/* Background gradient */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sol-purple/10 via-transparent to-sol-green/10" />

                    <div className="relative">
                        {/* Top badge */}
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl gradient-sol text-3xl shadow-lg" style={{ boxShadow: 'var(--shadow-glow-green)' }}>
                            ⚡
                        </div>

                        <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-foreground-muted">Certificate of Completion</div>

                        <div className="mb-1 font-display text-sm text-foreground-muted">This certifies that</div>
                        <div className="mb-1 font-display text-3xl font-bold gradient-sol-text">{MOCK_CERT.recipientName}</div>
                        <div className="mb-4 font-display text-sm text-foreground-muted">has successfully completed</div>

                        <div className="mb-2 font-display text-2xl font-bold text-foreground">{MOCK_CERT.courseName}</div>
                        <div className="mb-4 text-sm font-medium text-sol-green">{MOCK_CERT.trackName} Track</div>

                        <div className="mx-auto mb-6 flex w-max items-center gap-1 rounded-full border border-xp-gold/30 bg-xp-gold/10 px-4 py-1.5 text-sm text-xp-gold">
                            <Award className="h-4 w-4" />{MOCK_CERT.totalXP.toLocaleString()} XP Earned
                        </div>

                        <div className="text-xs text-foreground-subtle">Completed on {MOCK_CERT.completedOn}</div>

                        {/* On-chain badge */}
                        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-sol-green/20 bg-sol-green/5 p-3 text-sm text-foreground-muted">
                            <Shield className="h-4 w-4 text-sol-green" />
                            <span>Soulbound NFT — Verified on Solana Devnet</span>
                        </div>
                    </div>
                </div>

                {/* NFT Details */}
                <div className="card-glass rounded-2xl p-5 space-y-3">
                    <h2 className="font-display text-lg font-bold">NFT Details</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-foreground-muted">Mint Address</span>
                            <span className="font-mono text-foreground">{MOCK_CERT.mintAddress}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-foreground-muted">Metadata URI</span>
                            <a href={MOCK_CERT.metadataUri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sol-blue hover:underline text-xs">
                                arweave.net/abc123 <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-foreground-muted">Type</span>
                            <span className="text-foreground">Metaplex Core (Non-transferable)</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <a
                        href={`https://explorer.solana.com/address/${MOCK_CERT.mintAddress}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium text-foreground-muted hover:border-sol-green/40 hover:text-sol-green transition-colors"
                    >
                        <ExternalLink className="h-4 w-4" /> View on Explorer
                    </a>
                    <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium text-foreground-muted hover:border-sol-green/40 hover:text-sol-green transition-colors">
                        <Share2 className="h-4 w-4" /> Share
                    </button>
                    <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium text-foreground-muted hover:border-sol-green/40 hover:text-sol-green transition-colors">
                        <Download className="h-4 w-4" /> Download
                    </button>
                </div>
            </div>
        </div>
    )
}
