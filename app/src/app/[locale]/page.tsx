import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ArrowRight, Zap, Shield, Globe, Code2, Star, Award, ChevronRight } from 'lucide-react'

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
        slug: 'intro-solana',
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
        slug: 'defi-on-solana',
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
        slug: 'anchor-program-dev',
        gradient: 'from-sol-purple/20 to-xp-gold/20',
        border: 'border-sol-purple/30',
        accent: 'text-sol-purple',
    },
]

export default function LandingPage() {
    const t = useTranslations('landing')

    return (
        <div className="flex flex-col">
            {/* ── Hero ─────────────────────────────────────────────────── */}
            <section className="gradient-hero relative overflow-hidden px-4 py-20 sm:py-36">
                {/* Decorative glow orbs */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(153,69,255,0.25) 0%, transparent 70%)' }} />
                    <div className="absolute top-1/3 right-0 h-[300px] w-[300px] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(20,241,149,0.15) 0%, transparent 70%)' }} />
                </div>

                <div className="relative mx-auto max-w-4xl text-center">
                    {/* Badge */}
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sol-green/30 bg-sol-green/10 px-4 py-1.5 text-xs font-medium text-sol-green sm:text-sm">
                        <Zap className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" />
                        {t('hero.builtFor')}
                    </div>

                    {/* Hero title — smaller on mobile, huge on desktop */}
                    <h1 className="mb-5 font-display text-4xl font-bold leading-tight sm:text-6xl lg:text-7xl">
                        <span className="gradient-sol-text">{t('hero.title')}</span>
                        <br />
                        <span className="text-foreground">{t('hero.subtitle')}</span>
                    </h1>

                    <p className="mx-auto mb-8 max-w-2xl text-base text-foreground-muted sm:text-lg">
                        {t('hero.description')}
                    </p>

                    {/* CTA buttons — stacked on mobile, row on sm+ */}
                    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
                        <Link
                            href="/courses"
                            className="group flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 font-semibold text-background transition-all hover:scale-105"
                            style={{ background: 'linear-gradient(135deg, #ffd23f, #008c4c)', boxShadow: '0 0 30px rgba(255,210,63,0.35)' }}
                        >
                            {t('hero.cta')}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link
                            href="https://github.com/solanabr/superteam-academy"
                            target="_blank"
                            className="flex items-center justify-center gap-2 rounded-xl border border-border px-8 py-3.5 font-medium text-foreground-muted transition-all hover:border-border-strong hover:text-foreground"
                        >
                            {t('hero.github')}
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-6 sm:gap-x-12">
                        {STATS.map(({ value, labelKey }) => (
                            <div key={labelKey} className="text-center">
                                <div className="font-display text-2xl font-bold gradient-sol-text sm:text-3xl">{value}</div>
                                <div className="mt-0.5 text-xs text-foreground-muted sm:text-sm">{t(`hero.stats.${labelKey}`)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features ─────────────────────────────────────────────── */}
            <section className="px-4 py-16 sm:py-20">
                <div className="mx-auto max-w-7xl">
                    <h2 className="mb-10 text-center font-display text-2xl font-bold sm:text-4xl">
                        {t('features.whyTitle')}
                    </h2>
                    {/* 2 cols on mobile, 4 on lg */}
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                        {[
                            { icon: Code2, titleKey: 'editor', color: 'text-sol-green', bg: 'bg-sol-green/10' },
                            { icon: Shield, titleKey: 'credentials', color: 'text-sol-purple', bg: 'bg-sol-purple/10' },
                            { icon: Globe, titleKey: 'multilang', color: 'text-sol-blue', bg: 'bg-sol-blue/10' },
                            { icon: Star, titleKey: 'gamification', color: 'text-xp-gold', bg: 'bg-xp-gold/10' },
                        ].map(({ icon: Icon, titleKey, color, bg }) => (
                            <div
                                key={titleKey}
                                className="card-glass card-glow-green group rounded-2xl p-4 sm:p-6 transition-all duration-300"
                            >
                                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${bg}`}>
                                    <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${color}`} />
                                </div>
                                <h3 className="mb-1 text-sm font-semibold text-foreground sm:text-base sm:mb-2">{t(`features.${titleKey}.title`)}</h3>
                                <p className="text-xs text-foreground-muted leading-relaxed sm:text-sm">{t(`features.${titleKey}.description`)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Learning Paths ────────────────────────────────────────── */}
            <section className="px-4 py-16 sm:py-20" style={{ background: 'var(--background-elevated)' }}>
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex items-end justify-between sm:mb-12">
                        <div>
                            <h2 className="font-display text-2xl font-bold sm:text-4xl">
                                {t('paths.title')}
                            </h2>
                            <p className="mt-2 text-sm text-foreground-muted sm:text-base">{t('paths.subtitle')}</p>
                        </div>
                        <Link href="/courses" className="flex items-center gap-1 text-sm text-sol-green hover:underline whitespace-nowrap ml-4">
                            {t('paths.viewAll')} <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {/* 1 col on mobile, 3 on md */}
                    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3">
                        {LEARNING_PATHS.map((path) => (
                            <Link
                                key={path.id}
                                href={`/courses/${path.slug}`}
                                className={`card-glass group relative overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all duration-300 hover:scale-[1.02] ${path.border}`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${path.gradient} opacity-50`} />
                                <div className="relative">
                                    <div className={`mb-1 text-xs font-semibold uppercase tracking-wide ${path.accent}`}>{path.difficulty}</div>
                                    <h3 className="mb-2 text-base font-bold text-foreground sm:text-lg">{path.title}</h3>
                                    <p className="mb-4 text-xs text-foreground-muted sm:text-sm">{path.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-foreground-subtle">
                                        <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5 text-xp-gold" />{path.xp.toLocaleString()} XP</span>
                                        <span className="flex items-center gap-1"><Code2 className="h-3.5 w-3.5" />{path.lessons} lessons</span>
                                    </div>
                                    <div className={`mt-4 flex items-center gap-1 text-sm font-medium ${path.accent} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                        {t('paths.start')} <ArrowRight className="h-3.5 w-3.5" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ──────────────────────────────────────────────────── */}
            <section className="px-4 py-20 text-center sm:py-24">
                <div className="mx-auto max-w-2xl">
                    <h2 className="mb-4 font-display text-3xl font-bold sm:text-4xl">{t('cta.title')}</h2>
                    <p className="mb-8 text-sm text-foreground-muted sm:text-base">{t('cta.subtitle')}</p>
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 font-semibold text-background transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #ffd23f, #008c4c)', boxShadow: '0 0 30px rgba(0,140,76,0.3)' }}
                    >
                        {t('cta.button')} <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    )
}
