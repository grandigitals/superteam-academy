import { CourseCard } from './CourseCard'
import type { Course } from '@/services/types'

interface CourseGridProps {
    courses: Course[]
    showProgress?: boolean
    progressMap?: Record<string, number>
}

export function CourseGrid({ courses, showProgress, progressMap }: CourseGridProps) {
    if (courses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 text-6xl">📚</div>
                <h3 className="mb-2 font-semibold text-foreground">No courses found</h3>
                <p className="text-sm text-foreground-muted">Try adjusting your search or filters</p>
            </div>
        )
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
                <CourseCard
                    key={course.id}
                    course={course}
                    progress={showProgress ? (progressMap?.[course.id] ?? 0) : undefined}
                />
            ))}
        </div>
    )
}
