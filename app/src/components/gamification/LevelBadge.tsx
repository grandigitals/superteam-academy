'use client'

import { deriveLevel } from '@/lib/solana/xp'
import { cn } from '@/lib/utils'

interface LevelBadgeProps {
    xp: number
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

const SIZE_MAP = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-12 w-12 text-base',
}

export function LevelBadge({ xp, size = 'md', className }: LevelBadgeProps) {
    const level = deriveLevel(xp)

    return (
        <div
            className={cn(
                'relative flex items-center justify-center rounded-full font-mono font-bold text-background',
                SIZE_MAP[size],
                className
            )}
            style={{
                background: 'linear-gradient(135deg, #ffd23f, #008c4c)',
                boxShadow: '0 0 12px rgba(255, 210, 63, 0.5), 0 0 4px rgba(255, 210, 63, 0.8)',
            }}
            aria-label={`Level ${level}`}
        >
            {level}
        </div>
    )
}
