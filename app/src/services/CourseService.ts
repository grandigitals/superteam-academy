/**
 * Unified course data loader.
 *
 * Strategy:
 *  1. If NEXT_PUBLIC_SANITY_PROJECT_ID is set and not "demo" → fetch from Sanity CMS
 *  2. Otherwise → return hardcoded mock data so the app works without a CMS
 *
 * This keeps all pages server-renderable and functional during development.
 */

import type { Course, Enrollment } from '@/services/types'

// ── Mock data fallback ────────────────────────────────────────────────────────

export const MOCK_COURSES: Course[] = [
    {
        id: 'intro-solana',
        slug: 'intro-solana',
        title: 'Introduction to Solana',
        description:
            'Learn the Solana programming model: accounts, transactions, programs, and the runtime. Build your first on-chain hello-world.',
        difficulty: 'beginner',
        xpReward: 500,
        durationMinutes: 120,
        lessonCount: 9,
        moduleCount: 3,
        instructorName: 'Superteam Brazil',
        track: 'fundamentals',
        modules: [
            {
                id: 'mod-1',
                title: 'Solana Fundamentals',
                order: 1,
                lessons: [
                    { id: 'l1', title: 'What is Solana?', type: 'content', xpReward: 50, estimatedMinutes: 10, order: 1 },
                    { id: 'l2', title: 'Accounts & Lamports', type: 'content', xpReward: 50, estimatedMinutes: 15, order: 2 },
                    { id: 'l3', title: 'The Account Model Quiz', type: 'quiz', xpReward: 100, estimatedMinutes: 10, order: 3 },
                ],
            },
            {
                id: 'mod-2',
                title: 'Programs on Solana',
                order: 2,
                lessons: [
                    { id: 'l4', title: 'Writing Your First Program', type: 'challenge', xpReward: 200, estimatedMinutes: 30, order: 1 },
                    { id: 'l5', title: 'PDAs Explained', type: 'content', xpReward: 50, estimatedMinutes: 15, order: 2 },
                ],
            },
            {
                id: 'mod-3',
                title: 'Transactions',
                order: 3,
                lessons: [
                    { id: 'l6', title: 'Building a Transaction', type: 'challenge', xpReward: 200, estimatedMinutes: 30, order: 1 },
                    { id: 'l7', title: 'Fees & Compute Units', type: 'content', xpReward: 50, estimatedMinutes: 10, order: 2 },
                    { id: 'l8', title: 'Final Challenge', type: 'challenge', xpReward: 300, estimatedMinutes: 25, order: 3 },
                    { id: 'l9', title: 'Course Review', type: 'content', xpReward: 50, estimatedMinutes: 10, order: 4 },
                ],
            },
        ],
    },
    {
        id: 'anchor-program-dev',
        slug: 'anchor-program-dev',
        title: 'Anchor Program Development',
        description:
            'Build and deploy Anchor programs from scratch. Complete with IDL generation, client integration, and testing with Bankrun.',
        difficulty: 'intermediate',
        xpReward: 1200,
        durationMinutes: 240,
        lessonCount: 18,
        moduleCount: 4,
        instructorName: 'Superteam Brazil',
        track: 'anchor',
        modules: [],
    },
    {
        id: 'defi-on-solana',
        slug: 'defi-on-solana',
        title: 'DeFi on Solana',
        description:
            'Build automated market makers, lending protocols, and token swap programs. Integrate with Raydium, Orca, and Jupiter.',
        difficulty: 'advanced',
        xpReward: 2000,
        durationMinutes: 300,
        lessonCount: 24,
        moduleCount: 5,
        instructorName: 'Superteam Brazil',
        track: 'defi',
        modules: [],
    },
]

// ── Fetchers ──────────────────────────────────────────────────────────────────

function isSanityConfigured(): boolean {
    const id = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    return Boolean(id && id !== 'demo' && id !== 'your_sanity_project_id')
}

export async function fetchAllCourses(): Promise<Course[]> {
    if (isSanityConfigured()) {
        try {
            const { getAllCourses } = await import('@/lib/sanity/queries')
            const data = await getAllCourses()
            if (Array.isArray(data) && data.length > 0) return data as Course[]
        } catch (err) {
            console.warn('[CourseService] Sanity fetch failed, using mock:', err)
        }
    }
    return MOCK_COURSES
}

export async function fetchCourseBySlug(slug: string): Promise<Course | null> {
    if (isSanityConfigured()) {
        try {
            const { getCourseBySlug } = await import('@/lib/sanity/queries')
            const data = await getCourseBySlug(slug)
            if (data) return data as Course
        } catch (err) {
            console.warn('[CourseService] Sanity fetch failed, using mock:', err)
        }
    }
    return MOCK_COURSES.find(c => c.slug === slug) ?? null
}
