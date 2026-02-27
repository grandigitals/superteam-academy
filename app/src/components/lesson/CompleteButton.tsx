'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useTranslations } from 'next-intl'
import { CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createLearningProgressService } from '@/services/factory'
import { useAuthStore } from '@/store/useAuthStore'
import { useXP } from '@/hooks/useXP'

interface CompleteButtonProps {
    courseId: string
    lessonId: string
    xpReward?: number
}

export function CompleteButton({ courseId, lessonId, xpReward = 50 }: CompleteButtonProps) {
    const { publicKey } = useWallet()
    const t = useTranslations('lesson')
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)
    const { refreshXP } = useXP()
    const setXP = useAuthStore(s => s.setXP)

    const handleComplete = async () => {
        if (!publicKey) return
        setLoading(true)
        try {
            const service = createLearningProgressService()
            // Parse numeric index from lesson ID (e.g. "l3" → index 2)
            const match = lessonId.match(/\d+/)
            const lessonIndex = match ? parseInt(match[0], 10) - 1 : 0

            const { xpEarned, totalXP } = await service.completeLesson(
                publicKey.toBase58(),
                courseId,
                lessonIndex
            )

            setDone(true)
            // Update XP in store immediately for instant UI feedback
            setXP(totalXP)
            toast.success(`+${xpEarned} XP earned!`, { icon: '⚡', duration: 3000 })

            // Then re-fetch from source to ensure accuracy
            await refreshXP()
        } catch {
            toast.error('Failed to record completion')
        } finally {
            setLoading(false)
        }
    }

    if (done) {
        return (
            <div className="flex items-center gap-2 text-sm font-medium text-sol-green">
                <CheckCircle className="h-4 w-4" /> {t('completed')}
            </div>
        )
    }

    return (
        <button
            onClick={handleComplete}
            disabled={loading || !publicKey}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-background transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
            style={{ background: 'linear-gradient(135deg, #14f195, #00c2ff)', boxShadow: '0 0 20px rgba(20,241,149,0.2)' }}
            title={!publicKey ? 'Connect wallet to mark complete' : ''}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            {t('complete')}
        </button>
    )
}
