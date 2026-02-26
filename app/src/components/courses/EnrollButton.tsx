'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
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

    const handleEnroll = async () => {
        if (!publicKey) return
        setLoading(true)
        try {
            const service = createEnrollmentService()
            await service.enrollInCourse(publicKey.toBase58(), courseId)
            setEnrolled(true)
            toast.success('Enrolled successfully! Start your first lesson.', {
                icon: '🎉',
            })
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

    if (enrolled) {
        return (
            <div className="flex items-center gap-2 rounded-xl border border-sol-green/30 bg-sol-green/10 px-5 py-3 text-sm font-medium text-sol-green">
                ✓ {t('enrolled')}
            </div>
        )
    }

    return (
        <button
            onClick={handleEnroll}
            disabled={loading}
            className="rounded-xl px-8 py-3 font-semibold text-background transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #14f195, #00c2ff)', boxShadow: '0 0 20px rgba(20,241,149,0.3)' }}
        >
            {loading ? 'Enrolling...' : t('enroll')}
        </button>
    )
}
