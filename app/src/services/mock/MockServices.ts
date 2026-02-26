import type {
    LearningProgressService,
    EnrollmentService,
    AchievementService,
    CredentialService,
    LeaderboardService,
    UserProfileService,
} from '../interfaces'
import type { CourseProgress, StreakData, LeaderboardEntry, LeaderboardTimeframe, Credential, Achievement, UserProfile, Enrollment } from '../types'

// ─── Mock implementations using hardcoded data ───────────────────────────────

const MOCK_XP: Record<string, number> = {}
const MOCK_PROGRESS: Record<string, CourseProgress> = {}
const MOCK_ENROLLMENTS: Record<string, Enrollment[]> = {}
const MOCK_ACHIEVEMENTS: Record<string, Achievement[]> = {}
const MOCK_PROFILES: Record<string, UserProfile> = {}

function walletCourseKey(wallet: string, courseId: string) {
    return `${wallet}:${courseId}`
}

export class MockLearningProgressService implements LearningProgressService {
    async getCourseProgress(wallet: string, courseId: string): Promise<CourseProgress | null> {
        return MOCK_PROGRESS[walletCourseKey(wallet, courseId)] ?? null
    }

    async getAllProgress(wallet: string): Promise<CourseProgress[]> {
        return Object.entries(MOCK_PROGRESS)
            .filter(([key]) => key.startsWith(`${wallet}:`))
            .map(([, v]) => v)
    }

    async completeLesson(
        wallet: string,
        courseId: string,
        lessonIndex: number
    ): Promise<{ xpEarned: number; totalXP: number }> {
        const key = walletCourseKey(wallet, courseId)
        const existing = MOCK_PROGRESS[key]
        const xpEarned = 50
        if (existing) {
            if (!existing.completedLessons.includes(lessonIndex)) {
                existing.completedLessons.push(lessonIndex)
                existing.xpEarned += xpEarned
            }
        } else {
            MOCK_PROGRESS[key] = {
                courseId,
                completedLessons: [lessonIndex],
                totalLessons: 10,
                xpEarned,
                enrolledAt: new Date(),
            }
        }
        MOCK_XP[wallet] = (MOCK_XP[wallet] ?? 0) + xpEarned
        return { xpEarned, totalXP: MOCK_XP[wallet] ?? xpEarned }
    }

    async getXPBalance(wallet: string): Promise<number> {
        return MOCK_XP[wallet] ?? 0
    }

    async getStreakData(wallet: string): Promise<StreakData> {
        return {
            currentStreak: 3,
            longestStreak: 7,
            lastActivity: new Date(),
            history: Array.from({ length: 7 }, (_, i) => ({
                date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0] ?? '',
                completed: Math.random() > 0.3,
            })).reverse(),
        }
    }
}

export class MockEnrollmentService implements EnrollmentService {
    async enrollInCourse(wallet: string, courseId: string): Promise<Enrollment> {
        if (!MOCK_ENROLLMENTS[wallet]) MOCK_ENROLLMENTS[wallet] = []
        const existing = MOCK_ENROLLMENTS[wallet]?.find(e => e.courseId === courseId)
        if (existing) return existing
        const enrollment: Enrollment = { courseId, wallet, enrolledAt: new Date(), xpEarned: 0 }
        MOCK_ENROLLMENTS[wallet]?.push(enrollment)
        return enrollment
    }

    async isEnrolled(wallet: string, courseId: string): Promise<boolean> {
        return MOCK_ENROLLMENTS[wallet]?.some(e => e.courseId === courseId) ?? false
    }

    async getEnrollments(wallet: string): Promise<Enrollment[]> {
        return MOCK_ENROLLMENTS[wallet] ?? []
    }
}

export class MockAchievementService implements AchievementService {
    async getAchievements(wallet: string): Promise<Achievement[]> {
        return MOCK_ACHIEVEMENTS[wallet] ?? []
    }

    async awardAchievement(wallet: string, achievementId: string): Promise<Achievement> {
        if (!MOCK_ACHIEVEMENTS[wallet]) MOCK_ACHIEVEMENTS[wallet] = []
        const achievement: Achievement = {
            id: achievementId,
            name: 'First Steps',
            description: 'Completed your first lesson',
            iconUrl: '/icons/first-steps.svg',
            earnedAt: new Date(),
            xpReward: 100,
        }
        MOCK_ACHIEVEMENTS[wallet]?.push(achievement)
        return achievement
    }
}

export class MockCredentialService implements CredentialService {
    async getCredentials(wallet: string): Promise<Credential[]> {
        // Return sample credentials for demo purposes
        return [
            {
                mint: `${wallet.slice(0, 8)}...DEMO`,
                trackId: 'solana-fundamentals',
                trackName: 'Solana Fundamentals',
                level: 1,
                coursesCompleted: 3,
                totalXP: 1500,
                imageUrl: '/credentials/solana-fundamentals.png',
                issuedAt: new Date('2024-01-15'),
            },
        ]
    }

    async getCredentialByMint(mint: string): Promise<Credential | null> {
        return {
            mint,
            trackId: 'solana-fundamentals',
            trackName: 'Solana Fundamentals',
            level: 1,
            coursesCompleted: 3,
            totalXP: 1500,
            imageUrl: '/credentials/solana-fundamentals.png',
            issuedAt: new Date('2024-01-15'),
        }
    }
}

export class MockLeaderboardService implements LeaderboardService {
    async getLeaderboard(timeframe: LeaderboardTimeframe, limit = 10): Promise<LeaderboardEntry[]> {
        const entries: LeaderboardEntry[] = [
            { rank: 1, wallet: 'Alice1111111111111111111111111111111', displayName: 'AliceDev', xp: 12500, level: 11, streak: 30 },
            { rank: 2, wallet: 'Bob22222222222222222222222222222222', displayName: 'BobSolana', xp: 9800, level: 9, streak: 14 },
            { rank: 3, wallet: 'Carol333333333333333333333333333333', displayName: 'CarolChain', xp: 7600, level: 8, streak: 7 },
            { rank: 4, wallet: 'Dave4444444444444444444444444444444', displayName: 'DaveDeFi', xp: 5200, level: 7, streak: 3 },
            { rank: 5, wallet: 'Eve55555555555555555555555555555555', displayName: 'EveAnchor', xp: 3800, level: 6, streak: 1 },
            { rank: 6, wallet: 'Frank666666666666666666666666666666', xp: 2100, level: 4 },
            { rank: 7, wallet: 'Grace777777777777777777777777777777', xp: 1500, level: 3 },
            { rank: 8, wallet: 'Heidi888888888888888888888888888888', xp: 900, level: 3 },
            { rank: 9, wallet: 'Ivan9999999999999999999999999999999', xp: 500, level: 2 },
            { rank: 10, wallet: 'JokerAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', xp: 100, level: 1 },
        ]
        return entries.slice(0, limit)
    }

    async getUserRank(wallet: string, timeframe: LeaderboardTimeframe): Promise<number | null> {
        return null
    }
}

export class MockUserProfileService implements UserProfileService {
    async getProfile(wallet: string): Promise<UserProfile | null> {
        return MOCK_PROFILES[wallet] ?? null
    }

    async getProfileByUsername(username: string): Promise<UserProfile | null> {
        return Object.values(MOCK_PROFILES).find(p => p.displayName === username) ?? null
    }

    async upsertProfile(profile: Partial<UserProfile> & { wallet: string }): Promise<UserProfile> {
        const existing = MOCK_PROFILES[profile.wallet]
        const updated: UserProfile = {
            wallet: profile.wallet,
            displayName: profile.displayName ?? existing?.displayName,
            avatar: profile.avatar ?? existing?.avatar,
            bio: profile.bio ?? existing?.bio,
            twitter: profile.twitter ?? existing?.twitter,
            github: profile.github ?? existing?.github,
            joinedAt: existing?.joinedAt ?? new Date(),
            xp: profile.xp ?? existing?.xp ?? 0,
            level: profile.level ?? existing?.level ?? 1,
            isPublic: profile.isPublic ?? existing?.isPublic ?? true,
        }
        MOCK_PROFILES[profile.wallet] = updated
        return updated
    }
}
