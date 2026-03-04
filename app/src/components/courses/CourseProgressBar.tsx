'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { getCourseProgressAction } from '@/app/actions/learning-progress'

interface CourseProgressBarProps {
    courseId: string
    totalLessons: number
}

export function CourseProgressBar({ courseId, totalLessons }: CourseProgressBarProps) {
    const { publicKey } = useWallet()
    const [completedCount, setCompletedCount] = useState(0)

    useEffect(() => {
        if (!publicKey || !courseId) return
        getCourseProgressAction(publicKey.toBase58(), courseId)
            .then(({ progress }) => {
                if (progress) {
                    setCompletedCount(progress.completedLessons.length)
                }
            })
            .catch(console.error)
    }, [publicKey, courseId])

    const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

    return (
        <div className="mb-6">
            <div className="mb-1.5 flex justify-between text-xs text-foreground-subtle">
                <span>{completedCount} / {totalLessons} lessons</span>
                <span>{progressPct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #ffd23f, #008c4c)' }}
                />
            </div>
        </div>
    )
}
