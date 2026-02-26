// Shared TypeScript types for the service layer

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type LessonType = 'content' | 'challenge'
export type ServiceMode = 'mock' | 'onchain'
export type LeaderboardTimeframe = 'weekly' | 'monthly' | 'all-time'

export interface StreakDay {
  date: string // ISO date
  completed: boolean
}

export interface CourseProgress {
  courseId: string
  completedLessons: number[]
  totalLessons: number
  xpEarned: number
  enrolledAt: Date
  completedAt?: Date
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActivity: Date | null
  history: StreakDay[]
  milestoneReached?: 7 | 30 | 100
}

export interface LeaderboardEntry {
  rank: number
  wallet: string
  displayName?: string
  avatar?: string
  xp: number
  level: number
  streak?: number
}

export interface Credential {
  mint: string
  trackId: string
  trackName: string
  level: number
  coursesCompleted: number
  totalXP: number
  imageUrl: string
  issuedAt: Date
}

export interface Achievement {
  id: string
  name: string
  description: string
  iconUrl: string
  earnedAt: Date
  xpReward: number
}

export interface UserProfile {
  wallet: string
  displayName?: string
  avatar?: string
  bio?: string
  twitter?: string
  github?: string
  joinedAt: Date
  xp: number
  level: number
  isPublic: boolean
}

export interface Course {
  id: string
  slug: string
  title: string
  description: string
  difficulty: Difficulty
  durationMinutes: number
  xpReward: number
  thumbnailUrl?: string
  instructorName: string
  moduleCount: number
  lessonCount: number
  onchainCourseId?: string
  prerequisiteSlugs?: string[]
}

export interface Enrollment {
  courseId: string
  wallet: string
  enrolledAt: Date
  completedAt?: Date
  xpEarned: number
}
