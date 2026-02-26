import { useTranslations } from 'next-intl'
import type { Metadata } from 'next'
import { Search, Filter, BookOpen } from 'lucide-react'
import { CourseGrid } from '@/components/courses/CourseGrid'

export const metadata: Metadata = {
    title: 'Courses',
    description: 'Browse all Solana development courses — from beginner to advanced.',
}

// Sample courses for SSR/mock render
const SAMPLE_COURSES = [
    {
        id: '1', slug: 'intro-to-solana', title: 'Introduction to Solana', description: 'Learn the Solana programming model: accounts, transactions, programs, and the runtime.', difficulty: 'beginner' as const, durationMinutes: 120, xpReward: 500, thumbnailUrl: '', instructorName: 'Superteam', moduleCount: 3, lessonCount: 9,
    },
    {
        id: '2', slug: 'anchor-development', title: 'Anchor Program Development', description: 'Build and deploy Anchor programs from scratch. Complete with IDL generation and client integration.', difficulty: 'intermediate' as const, durationMinutes: 240, xpReward: 1200, thumbnailUrl: '', instructorName: 'Superteam', moduleCount: 5, lessonCount: 18,
    },
    {
        id: '3', slug: 'defi-on-solana', title: 'DeFi on Solana', description: 'Build automated market makers, lending protocols, and token swap programs.', difficulty: 'advanced' as const, durationMinutes: 300, xpReward: 2000, thumbnailUrl: '', instructorName: 'Superteam', moduleCount: 6, lessonCount: 24,
    },
    {
        id: '4', slug: 'solana-token-2022', title: 'Token-2022 Deep Dive', description: 'Explore Token Extensions: transfer fees, interest-bearing tokens, non-transferable tokens, and metadata.', difficulty: 'intermediate' as const, durationMinutes: 180, xpReward: 900, thumbnailUrl: '', instructorName: 'Superteam', moduleCount: 4, lessonCount: 14,
    },
    {
        id: '5', slug: 'nft-with-metaplex', title: 'NFTs with Metaplex', description: 'Create and manage NFT collections using Metaplex Core — the modern standard.', difficulty: 'beginner' as const, durationMinutes: 90, xpReward: 400, thumbnailUrl: '', instructorName: 'Superteam', moduleCount: 2, lessonCount: 7,
    },
    {
        id: '6', slug: 'solana-security', title: 'Solana Program Security', description: 'Learn to audit and secure Solana programs. Covers common vulnerabilities and best practices.', difficulty: 'advanced' as const, durationMinutes: 360, xpReward: 2500, thumbnailUrl: '', instructorName: 'Superteam', moduleCount: 7, lessonCount: 28,
    },
]

export default function CoursesPage() {
    const t = useTranslations('course')

    return (
        <div className="min-h-screen px-4 py-12">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="font-display text-4xl font-bold sm:text-5xl">
                        <span className="gradient-sol-text">Courses</span>
                    </h1>
                    <p className="mt-3 text-lg text-foreground-muted">
                        Interactive courses for every stage of your Solana journey
                    </p>
                </div>

                {/* Search + Filter Bar */}
                <div className="mb-8 flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
                        <input
                            type="text"
                            placeholder={t('search')}
                            className="w-full rounded-xl border border-border bg-background-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-subtle focus:border-sol-green/50 focus:outline-none focus:ring-2 focus:ring-sol-green/20"
                        />
                    </div>
                    <div className="flex gap-2">
                        {(['beginner', 'intermediate', 'advanced'] as const).map((d) => (
                            <button
                                key={d}
                                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground-muted transition-colors hover:border-sol-green/50 hover:text-sol-green capitalize"
                            >
                                {t(`difficulty.${d}`)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Course Grid */}
                <CourseGrid courses={SAMPLE_COURSES} />
            </div>
        </div>
    )
}
