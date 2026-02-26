import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { SolanaProvider } from '@/components/wallet/SolanaProvider'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { Toaster } from 'sonner'
import '../globals.css'

export const metadata: Metadata = {
    title: {
        default: 'Superteam Academy — Learn Solana Development',
        template: '%s | Superteam Academy',
    },
    description:
        'The interactive learning platform for Solana blockchain development. Earn XP, build real programs, and get on-chain credentials.',
    keywords: ['Solana', 'blockchain', 'learn', 'Web3', 'development', 'LMS'],
    openGraph: {
        title: 'Superteam Academy',
        description: 'Learn Solana Development. Earn on-chain credentials.',
        type: 'website',
    },
}

type SupportedLocale = 'en' | 'pt-BR' | 'es'

interface Props {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = await params

    if (!routing.locales.includes(locale as SupportedLocale)) {
        notFound()
    }

    const messages = await getMessages()

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body>
                <ThemeProvider>
                    <NextIntlClientProvider messages={messages}>
                        <SolanaProvider>
                            <Navbar />
                            <main className="min-h-[calc(100dvh-4rem)]">{children}</main>
                            <Footer />
                            <Toaster position="bottom-right" theme="dark" richColors />
                        </SolanaProvider>
                    </NextIntlClientProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }))
}
