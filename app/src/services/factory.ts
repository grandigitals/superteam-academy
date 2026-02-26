import {
    MockLearningProgressService,
    MockEnrollmentService,
    MockAchievementService,
    MockCredentialService,
    MockLeaderboardService,
    MockUserProfileService,
} from './mock/MockServices'
import { OnChainLearningProgressService } from './onchain/OnChainServices'
import type {
    LearningProgressService,
    EnrollmentService,
    AchievementService,
    CredentialService,
    LeaderboardService,
    UserProfileService,
} from './interfaces'

const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com'

function getServiceMode(): string {
    return process.env.NEXT_PUBLIC_SERVICE_MODE ?? 'mock'
}

export function createLearningProgressService(): LearningProgressService {
    if (getServiceMode() === 'onchain') {
        return new OnChainLearningProgressService(SOLANA_RPC_URL)
    }
    return new MockLearningProgressService()
}

export function createEnrollmentService(): EnrollmentService {
    return new MockEnrollmentService()
}

export function createAchievementService(): AchievementService {
    return new MockAchievementService()
}

export function createCredentialService(): CredentialService {
    return new MockCredentialService()
}

export function createLeaderboardService(): LeaderboardService {
    return new MockLeaderboardService()
}

export function createUserProfileService(): UserProfileService {
    return new MockUserProfileService()
}
