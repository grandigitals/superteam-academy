/**
 * backend/src/bitmap.ts
 *
 * Lesson progress is tracked via a 256-bit bitmap stored as [u64; 4] on the
 * Enrollment PDA. Each bit represents one lesson (bit 0 = lesson 0).
 *
 * From INTEGRATION.md — bitmap helpers.
 */

import BN from 'bn.js'

/** Returns true if the lesson at `lessonIndex` has been completed */
export function isLessonComplete(lessonFlags: BN[], lessonIndex: number): boolean {
    const wordIndex = Math.floor(lessonIndex / 64)
    const bitIndex = lessonIndex % 64
    if (wordIndex >= lessonFlags.length) return false
    return !lessonFlags[wordIndex]!.and(new BN(1).shln(bitIndex)).isZero()
}

/** Counts how many lessons have been completed based on the bitmap */
export function countCompletedLessons(lessonFlags: BN[]): number {
    return lessonFlags.reduce((sum, word) => {
        let count = 0
        let w = word.clone()
        while (!w.isZero()) {
            count += w.and(new BN(1)).toNumber()
            w = w.shrn(1)
        }
        return sum + count
    }, 0)
}

/** Returns the indices of all completed lessons */
export function getCompletedLessonIndices(lessonFlags: BN[], lessonCount: number): number[] {
    const completed: number[] = []
    for (let i = 0; i < lessonCount; i++) {
        if (isLessonComplete(lessonFlags, i)) completed.push(i)
    }
    return completed
}
