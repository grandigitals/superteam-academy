/**
 * XP and Level calculation utilities
 * Level formula: Math.floor(Math.sqrt(xp / 100))
 */

export const XP_MINT = process.env.NEXT_PUBLIC_XP_MINT ?? ''

/** Pure function: derive level from XP */
export function deriveLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100))
}

/** XP needed to reach a given level */
export function xpForLevel(level: number): number {
    return level * level * 100
}

/** XP needed to reach the NEXT level from current XP */
export function xpToNextLevel(xp: number): number {
    const currentLevel = deriveLevel(xp)
    const nextLevel = currentLevel + 1
    return xpForLevel(nextLevel) - xp
}

/** Progress percentage within the current level (0–100) */
export function levelProgress(xp: number): number {
    const currentLevel = deriveLevel(xp)
    const levelStart = xpForLevel(currentLevel)
    const levelEnd = xpForLevel(currentLevel + 1)
    return Math.round(((xp - levelStart) / (levelEnd - levelStart)) * 100)
}

/** Format XP for display */
export function formatXP(xp: number): string {
    if (xp >= 1_000_000) return `${(xp / 1_000_000).toFixed(1)}M XP`
    if (xp >= 1_000) return `${(xp / 1_000).toFixed(1)}K XP`
    return `${xp} XP`
}
