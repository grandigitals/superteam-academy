'use client'

import { useState, useMemo } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { CourseGrid } from '@/components/courses/CourseGrid'
import type { Course, Difficulty } from '@/services/types'
import { cn } from '@/lib/utils'

interface CoursesClientProps {
    courses: Course[]
}

const DIFFICULTIES: { value: Difficulty; label: string; color: string; active: string }[] = [
    { value: 'beginner', label: 'Beginner', color: 'border-border text-foreground-muted hover:border-sol-green/50 hover:text-sol-green', active: 'border-sol-green/60 bg-sol-green/10 text-sol-green' },
    { value: 'intermediate', label: 'Intermediate', color: 'border-border text-foreground-muted hover:border-sol-blue/50 hover:text-sol-blue', active: 'border-sol-blue/60 bg-sol-blue/10 text-sol-blue' },
    { value: 'advanced', label: 'Advanced', color: 'border-border text-foreground-muted hover:border-sol-purple/50 hover:text-sol-purple', active: 'border-sol-purple/60 bg-sol-purple/10 text-sol-purple' },
]

export function CoursesClient({ courses }: CoursesClientProps) {
    const [query, setQuery] = useState('')
    const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | null>(null)

    const filtered = useMemo(() => {
        let result = courses

        // Difficulty filter
        if (activeDifficulty) {
            result = result.filter(c => c.difficulty === activeDifficulty)
        }

        // Text search — matches title or description
        const q = query.trim().toLowerCase()
        if (q) {
            result = result.filter(
                c =>
                    c.title.toLowerCase().includes(q) ||
                    c.description.toLowerCase().includes(q)
            )
        }

        return result
    }, [courses, query, activeDifficulty])

    const toggleDifficulty = (d: Difficulty) => {
        setActiveDifficulty(prev => (prev === d ? null : d))
    }

    const clearSearch = () => setQuery('')

    return (
        <div className="space-y-6">
            {/* Search + Filter bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Search input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle pointer-events-none" />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search courses…"
                        className="w-full rounded-xl border border-border bg-background-surface py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-foreground-subtle focus:border-sol-green/50 focus:outline-none focus:ring-2 focus:ring-sol-green/20 transition-colors"
                    />
                    {query && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground transition-colors"
                            aria-label="Clear search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Difficulty filters */}
                <div className="flex flex-wrap gap-2">
                    {DIFFICULTIES.map(({ value, label, color, active }) => (
                        <button
                            key={value}
                            onClick={() => toggleDifficulty(value)}
                            className={cn(
                                'rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200',
                                activeDifficulty === value ? active : color
                            )}
                        >
                            {label}
                        </button>
                    ))}
                    {/* Clear filters */}
                    {activeDifficulty && (
                        <button
                            onClick={() => setActiveDifficulty(null)}
                            className="flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs text-foreground-muted hover:border-error/40 hover:text-error transition-colors"
                        >
                            <X className="h-3 w-3" /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Result count */}
            <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <Filter className="h-3.5 w-3.5" />
                <span>
                    {filtered.length === courses.length
                        ? `${courses.length} courses`
                        : `${filtered.length} of ${courses.length} courses`}
                    {activeDifficulty && ` · ${activeDifficulty}`}
                    {query && ` matching "${query}"`}
                </span>
            </div>

            {/* Courses grid */}
            <CourseGrid courses={filtered} />
        </div>
    )
}
