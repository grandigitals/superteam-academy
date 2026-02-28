import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { SolanaProvider } from '@/components/wallet/SolanaProvider'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { PostHogProvider } from '@/components/providers/PostHogProvider'
import { Toaster } from 'sonner'
import { JetBrains_Mono, Fira_Code } from 'next/font/google'
import '../globals.css'

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains-mono',
    display: 'swap',
})

const firaCode = Fira_Code({
    subsets: ['latin'],
    variable: '--font-fira-code',
    display: 'swap',
})

type SupportedLocale = 'en' | 'pt-BR' | 'es'

interface Props {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}

/**
 * Locale layout — wraps pages in providers.
 *
 * ⚠️  NO <html> or <body> tags here. The root layout.tsx owns those.
 *     Adding them here causes nested HTML → React hydration errors.
 */
export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = await params

    if (!routing.locales.includes(locale as SupportedLocale)) {
        notFound()
    }

    const messages = await getMessages()

    return (
        <PostHogProvider>
            <ThemeProvider>
                <NextIntlClientProvider messages={messages}>
                    <SolanaProvider>
                        <Navbar />
                        <main className={`min-h-[calc(100dvh-4rem)] ${jetbrainsMono.variable} ${firaCode.variable}`}>
                            {children}
                        </main>
                        <Footer />
                        <Toaster position="bottom-right" theme="dark" richColors />
                    </SolanaProvider>
                </NextIntlClientProvider>
            </ThemeProvider>
        </PostHogProvider>
    )
}

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }))
}
