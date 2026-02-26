import type {
    CourseProgress,
    StreakData,
    LeaderboardEntry,
    LeaderboardTimeframe,
    Credential,
    Achievement,
    UserProfile,
    Enrollment,
    Course,
} from './types'

// ─────────────────────────────────────────────────────────
// Learning Progress Service
// ─────────────────────────────────────────────────────────

export interface LearningProgressService {
    /** Get progress for a specific course */
    getCourseProgress(wallet: string, courseId: string): Promise<CourseProgress | null>
    /** Get all course progresses for a user */
    getAllProgress(wallet: string): Promise<CourseProgress[]>
    /** Mark a lesson as complete — returns updated XP */
    completeLesson(wallet: string, courseId: string, lessonIndex: number): Promise<{ xpEarned: number; totalXP: number }>
    /** Get XP balance from token account */
    getXPBalance(wallet: string): Promise<number>
    /** Get current streak data */
    getStreakData(wallet: string): Promise<StreakData>
}

// ─────────────────────────────────────────────────────────
// Enrollment Service
// ─────────────────────────────────────────────────────────

export interface EnrollmentService {
    /** Enroll user in a course */
    enrollInCourse(wallet: string, courseId: string): Promise<Enrollment>
    /** Check if user is enrolled */
    isEnrolled(wallet: string, courseId: string): Promise<boolean>
    /** Get all enrollments for a user */
    getEnrollments(wallet: string): Promise<Enrollment[]>
}

// ─────────────────────────────────────────────────────────
// Achievement Service
// ─────────────────────────────────────────────────────────

export interface AchievementService {
    /** Get all achievements for a user */
    getAchievements(wallet: string): Promise<Achievement[]>
    /** Award an achievement to a user */
    awardAchievement(wallet: string, achievementId: string): Promise<Achievement>
}

// ─────────────────────────────────────────────────────────
// Credential Service
// ─────────────────────────────────────────────────────────

export interface CredentialService {
    /** Get all on-chain credentials (NFTs) for a wallet */
    getCredentials(wallet: string): Promise<Credential[]>
    /** Get a single credential by mint address */
    getCredentialByMint(mint: string): Promise<Credential | null>
}

// ─────────────────────────────────────────────────────────
// Leaderboard Service
// ─────────────────────────────────────────────────────────

export interface LeaderboardService {
    /** Get the leaderboard for a given timeframe */
    getLeaderboard(timeframe: LeaderboardTimeframe, limit?: number): Promise<LeaderboardEntry[]>
    /** Get a user's rank */
    getUserRank(wallet: string, timeframe: LeaderboardTimeframe): Promise<number | null>
}

// ─────────────────────────────────────────────────────────
// User Profile Service
// ─────────────────────────────────────────────────────────

export interface UserProfileService {
    /** Get user profile by wallet */
    getProfile(wallet: string): Promise<UserProfile | null>
    /** Get user profile by display name (for public profiles) */
    getProfileByUsername(username: string): Promise<UserProfile | null>
    /** Upsert user profile */
    upsertProfile(profile: Partial<UserProfile> & { wallet: string }): Promise<UserProfile>
}

// ─────────────────────────────────────────────────────────
// Course Service
// ─────────────────────────────────────────────────────────

export interface CourseService {
    /** Get all courses */
    getCourses(): Promise<Course[]>
    /** Get a single course by slug */
    getCourseBySlug(slug: string): Promise<Course | null>
}
