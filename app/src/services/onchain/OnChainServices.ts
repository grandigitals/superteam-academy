import type {
    LearningProgressService,
    EnrollmentService,
    AchievementService,
    CredentialService,
    LeaderboardService,
    UserProfileService,
} from '../interfaces'
import type { CourseProgress, StreakData, LeaderboardEntry, LeaderboardTimeframe, Credential, Achievement, UserProfile, Enrollment } from '../types'

const NOT_IMPLEMENTED = (method: string) => {
    throw new Error(`OnChainService.${method}: Not implemented — connect Anchor program`)
}

export class OnChainLearningProgressService implements LearningProgressService {
    private readonly rpcUrl: string

    constructor(rpcUrl: string) {
        this.rpcUrl = rpcUrl
    }

    async getXPBalance(wallet: string): Promise<number> {
        // TODO: Read Token-2022 soulbound XP token from Devnet
        // const connection = new Connection(this.rpcUrl)
        // const balance = await getTokenAccountBalance(connection, wallet, XP_MINT)
        return 0
    }

    async getCredentials(wallet: string): Promise<Credential[]> {
        // TODO: fetchAssetsByOwner via Metaplex Core
        return []
    }

    async getCourseProgress(wallet: string, courseId: string): Promise<CourseProgress | null> {
        NOT_IMPLEMENTED('getCourseProgress')
        return null
    }

    async getAllProgress(wallet: string): Promise<CourseProgress[]> {
        NOT_IMPLEMENTED('getAllProgress')
        return []
    }

    async completeLesson(wallet: string, courseId: string, lessonIndex: number): Promise<{ xpEarned: number; totalXP: number }> {
        NOT_IMPLEMENTED('completeLesson')
        return { xpEarned: 0, totalXP: 0 }
    }

    async getStreakData(wallet: string): Promise<StreakData> {
        NOT_IMPLEMENTED('getStreakData')
        return { currentStreak: 0, longestStreak: 0, lastActivity: null, history: [] }
    }
}
