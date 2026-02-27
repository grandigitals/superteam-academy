import type { Metadata } from 'next'
import { CoursesClient } from '@/components/courses/CoursesClient'
import { fetchAllCourses } from '@/services/CourseService'

export const metadata: Metadata = {
    title: 'Courses',
    description: 'Browse all Solana development courses — from beginner to advanced.',
}

export default async function CoursesPage() {
    const courses = await fetchAllCourses()

    return (
        <div className="min-h-screen px-4 py-12">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-display text-4xl font-bold sm:text-5xl">
                        <span className="gradient-sol-text">Courses</span>
                    </h1>
                    <p className="mt-3 text-lg text-foreground-muted">
                        Interactive courses for every stage of your Solana journey
                    </p>
                </div>

                {/* Interactive search + filter + grid — client component */}
                <CoursesClient courses={courses} />
            </div>
        </div>
    )
}
