'use client'

import { deriveLevel, levelProgress, xpToNextLevel } from '@/lib/solana/xp'
import { cn } from '@/lib/utils'

interface XPBarProps {
    xp: number
    className?: string
    showDetails?: boolean
}

export function XPBar({ xp, className, showDetails = true }: XPBarProps) {
    const level = deriveLevel(xp)
    const progress = levelProgress(xp)
    const toNext = xpToNextLevel(xp)

    return (
        <div className={cn('flex flex-col gap-1', className)}>
            {showDetails && (
                <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-sol-green font-semibold">Level {level}</span>
                    <span className="text-foreground-muted">{toNext.toLocaleString()} XP to next level</span>
                </div>
            )}
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                    style={{
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, #14f195, #00c2ff)',
                        boxShadow: '0 0 8px rgba(20, 241, 149, 0.6)',
                    }}
                />
            </div>
            {showDetails && (
                <div className="text-right text-xs text-foreground-subtle">{progress}%</div>
            )}
        </div>
    )
}
