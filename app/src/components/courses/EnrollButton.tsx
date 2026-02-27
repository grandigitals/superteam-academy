'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { createEnrollmentService } from '@/services/factory'
import { toast } from 'sonner'

interface EnrollButtonProps {
    courseId: string
}

export function EnrollButton({ courseId }: EnrollButtonProps) {
    const { connected, publicKey } = useWallet()
    const t = useTranslations('course')
    const [loading, setLoading] = useState(false)
    const [enrolled, setEnrolled] = useState(false)
    const [checking, setChecking] = useState(true)

    // Check enrollment state on mount so returning learners see correct state
    useEffect(() => {
        if (!publicKey) { setChecking(false); return }

        const service = createEnrollmentService()
        service.isEnrolled(publicKey.toBase58(), courseId)
            .then(setEnrolled)
            .catch(() => {/* ignore */ })
            .finally(() => setChecking(false))
    }, [publicKey, courseId])

    const handleEnroll = async () => {
        if (!publicKey) return
        setLoading(true)
        try {
            const service = createEnrollmentService()
            await service.enrollInCourse(publicKey.toBase58(), courseId)
            setEnrolled(true)
            toast.success('Enrolled! Start your first lesson.', { icon: '🎉' })
        } catch {
            toast.error('Failed to enroll. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (!connected) {
        return (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <p className="text-sm text-foreground-muted">Connect your wallet to enroll</p>
                <WalletMultiButton />
            </div>
        )
    }

    if (checking) {
        return (
            <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <Loader2 className="h-4 w-4 animate-spin" /> Checking enrollment…
            </div>
        )
    }

    if (enrolled) {
        return (
            <div className="flex items-center gap-2 rounded-xl border border-sol-green/30 bg-sol-green/10 px-5 py-3 text-sm font-medium text-sol-green">
                <CheckCircle className="h-4 w-4" /> {t('enrolled')}
            </div>
        )
    }

    return (
        <button
            onClick={handleEnroll}
            disabled={loading}
            className="rounded-xl px-8 py-3 font-semibold text-background transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #ffd23f, #008c4c)', boxShadow: '0 0 20px rgba(255,210,63,0.3)' }}
        >
            {loading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Enrolling…</span> : t('enroll')}
        </button>
    )
}
