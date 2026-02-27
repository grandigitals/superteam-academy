import {
    MockLearningProgressService,
    MockEnrollmentService,
    MockAchievementService,
    MockCredentialService,
    MockLeaderboardService,
    MockUserProfileService,
} from './mock/MockServices'
import { OnChainLearningProgressService } from './onchain/OnChainServices'
import { SupabaseEnrollmentService } from './supabase/SupabaseEnrollmentService'
import { SupabaseLearningProgressService } from './supabase/SupabaseLearningProgressService'
import { SupabaseLeaderboardService } from './supabase/SupabaseLeaderboardService'
import { SupabaseCredentialService } from './supabase/SupabaseCredentialService'
import type {
    LearningProgressService,
    EnrollmentService,
    AchievementService,
    CredentialService,
    LeaderboardService,
    UserProfileService,
} from './interfaces'

const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com'

/**
 * Service mode controls which backend is used:
 *
 *   mock     → in-memory stubs (default, works with no env vars)
 *   supabase → real Supabase DB (needs NEXT_PUBLIC_SUPABASE_URL + keys)
 *   onchain  → SPL token XP + Helius DAS credentials + Supabase for progress
 */
function getServiceMode(): string {
    return process.env.NEXT_PUBLIC_SERVICE_MODE ?? 'mock'
}

function isSupabaseMode(): boolean {
    return getServiceMode() === 'supabase' || getServiceMode() === 'onchain'
}

export function createLearningProgressService(): LearningProgressService {
    if (getServiceMode() === 'onchain') {
        return new OnChainLearningProgressService(SOLANA_RPC_URL)
    }
    if (isSupabaseMode()) {
        return new SupabaseLearningProgressService()
    }
    return new MockLearningProgressService()
}

export function createEnrollmentService(): EnrollmentService {
    if (isSupabaseMode()) {
        return new SupabaseEnrollmentService()
    }
    return new MockEnrollmentService()
}

export function createAchievementService(): AchievementService {
    return new MockAchievementService()
}

export function createCredentialService(): CredentialService {
    if (isSupabaseMode()) {
        return new SupabaseCredentialService()
    }
    return new MockCredentialService()
}

export function createLeaderboardService(): LeaderboardService {
    if (isSupabaseMode()) {
        return new SupabaseLeaderboardService()
    }
    return new MockLeaderboardService()
}

export function createUserProfileService(): UserProfileService {
    return new MockUserProfileService()
}
