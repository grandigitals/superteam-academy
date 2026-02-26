import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ArrowRight, Zap, Shield, Globe, Code2, Star, Users, Award, ChevronRight } from 'lucide-react'

const STATS = [
    { value: '20+', labelKey: 'courses' },
    { value: '5K+', labelKey: 'learners' },
    { value: '1K+', labelKey: 'credentials' },
]

const LEARNING_PATHS = [
    {
        id: 'fundamentals',
        title: 'Solana Fundamentals',
        description: 'Accounts, transactions, and the programming model',
        difficulty: 'Beginner',
        xp: 1500,
        lessons: 12,
        gradient: 'from-sol-green/20 to-sol-blue/20',
        border: 'border-sol-green/30',
        accent: 'text-sol-green',
    },
    {
        id: 'defi',
        title: 'DeFi Developer',
        description: 'Build AMMs, lending protocols, and yield optimizers',
        difficulty: 'Intermediate',
        xp: 3000,
        lessons: 18,
        gradient: 'from-sol-blue/20 to-sol-purple/20',
        border: 'border-sol-blue/30',
        accent: 'text-sol-blue',
    },
    {
        id: 'anchor',
        title: 'Anchor Program Dev',
        description: 'Deploy production programs with the Anchor framework',
        difficulty: 'Advanced',
        xp: 5000,
        lessons: 24,
        gradient: 'from-sol-purple/20 to-xp-gold/20',
        border: 'border-sol-purple/30',
        accent: 'text-sol-purple',
    },
]

export default function LandingPage() {
    const t = useTranslations('landing')
    const tCommon = useTranslations('common')

    return (
        <div className="flex flex-col">
            {/* ── Hero ─────────────────────────────────────────────────── */}
            <section className="gradient-hero relative overflow-hidden px-4 py-24 sm:py-36">
                {/* Decorative glow orbs */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(153,69,255,0.25) 0%, transparent 70%)' }} />
                    <div className="absolute top-1/3 right-0 h-[300px] w-[300px] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(20,241,149,0.15) 0%, transparent 70%)' }} />
                </div>

                <div className="relative mx-auto max-w-4xl text-center">
                    {/* Badge */}
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sol-green/30 bg-sol-green/10 px-4 py-1.5 text-sm font-medium text-sol-green">
                        <Zap className="h-3.5 w-3.5" fill="currentColor" />
                        Built for the Solana Ecosystem
                    </div>

                    <h1 className="mb-6 font-display text-5xl font-bold leading-tight sm:text-7xl">
                        <span className="gradient-sol-text">{t('hero.title')}</span>
                        <br />
                        <span className="text-foreground">{t('hero.subtitle')}</span>
                    </h1>

                    <p className="mx-auto mb-10 max-w-2xl text-lg text-foreground-muted">
                        The most comprehensive learning platform for Solana blockchain development. Interactive coding challenges, on-chain credentials, and gamified progression — in PT-BR, ES, and EN.
                    </p>

                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        <Link
                            href="/courses"
                            className="group flex items-center gap-2 rounded-xl px-8 py-3.5 font-semibold text-background transition-all hover:scale-105 hover:shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #14f195, #00c2ff)', boxShadow: '0 0 30px rgba(20,241,149,0.3)' }}
                        >
                            {t('hero.cta')}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link
                            href="https://github.com/solanabr/superteam-academy"
                            target="_blank"
                            className="flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 font-medium text-foreground-muted transition-all hover:border-border-strong hover:text-foreground"
                        >
                            View on GitHub
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mt-16 flex flex-wrap justify-center gap-x-12 gap-y-4">
                        {STATS.map(({ value, labelKey }) => (
                            <div key={labelKey} className="text-center">
                                <div className="font-display text-3xl font-bold gradient-sol-text">{value}</div>
                                <div className="mt-0.5 text-sm text-foreground-muted">{t(`hero.stats.${labelKey}`)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features ─────────────────────────────────────────────── */}
            <section className="px-4 py-20">
                <div className="mx-auto max-w-7xl">
                    <h2 className="mb-12 text-center font-display text-3xl font-bold sm:text-4xl">
                        Why <span className="gradient-sol-text">Superteam Academy?</span>
                    </h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            { icon: Code2, titleKey: 'editor', color: 'text-sol-green', bg: 'bg-sol-green/10' },
                            { icon: Shield, titleKey: 'credentials', color: 'text-sol-purple', bg: 'bg-sol-purple/10' },
                            { icon: Globe, titleKey: 'multilang', color: 'text-sol-blue', bg: 'bg-sol-blue/10' },
                            { icon: Star, titleKey: 'gamification', color: 'text-xp-gold', bg: 'bg-xp-gold/10' },
                        ].map(({ icon: Icon, titleKey, color, bg }) => (
                            <div
                                key={titleKey}
                                className="card-glass card-glow-green group rounded-2xl p-6 transition-all duration-300"
                            >
                                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                                    <Icon className={`h-6 w-6 ${color}`} />
                                </div>
                                <h3 className="mb-2 font-semibold text-foreground">{t(`features.${titleKey}.title`)}</h3>
                                <p className="text-sm text-foreground-muted leading-relaxed">{t(`features.${titleKey}.description`)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Learning Paths ────────────────────────────────────────── */}
            <section className="px-4 py-20" style={{ background: 'var(--background-elevated)' }}>
                <div className="mx-auto max-w-7xl">
                    <div className="mb-12 flex items-end justify-between">
                        <div>
                            <h2 className="font-display text-3xl font-bold sm:text-4xl">
                                Learning <span className="gradient-sol-text">Paths</span>
                            </h2>
                            <p className="mt-2 text-foreground-muted">Structured tracks for every developer level</p>
                        </div>
                        <Link href="/courses" className="hidden items-center gap-1 text-sm text-sol-green hover:underline sm:flex">
                            View all courses <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {LEARNING_PATHS.map((path) => (
                            <Link
                                key={path.id}
                                href={`/courses?track=${path.id}`}
                                className={`card-glass group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02] ${path.border}`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${path.gradient} opacity-50`} />
                                <div className="relative">
                                    <div className={`mb-1 text-xs font-semibold uppercase tracking-wide ${path.accent}`}>{path.difficulty}</div>
                                    <h3 className="mb-2 text-lg font-bold text-foreground">{path.title}</h3>
                                    <p className="mb-4 text-sm text-foreground-muted">{path.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-foreground-subtle">
                                        <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5 text-xp-gold" />{path.xp.toLocaleString()} XP</span>
                                        <span className="flex items-center gap-1"><Code2 className="h-3.5 w-3.5" />{path.lessons} lessons</span>
                                    </div>
                                    <div className={`mt-4 flex items-center gap-1 text-sm font-medium ${path.accent} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                        Start path <ArrowRight className="h-3.5 w-3.5" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ──────────────────────────────────────────────────── */}
            <section className="px-4 py-24 text-center">
                <div className="mx-auto max-w-2xl">
                    <h2 className="mb-4 font-display text-4xl font-bold">{t('cta.title')}</h2>
                    <p className="mb-8 text-foreground-muted">{t('cta.subtitle')}</p>
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 font-semibold text-background transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #14f195, #9945ff)', boxShadow: '0 0 30px rgba(153,69,255,0.3)' }}
                    >
                        {t('cta.button')} <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    )
}
