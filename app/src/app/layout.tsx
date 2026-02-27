import type { ReactNode } from 'react'
import type { Metadata } from 'next'

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

/**
 * Root layout — provides the single <html> and <body> for the entire app.
 *
 * ⚠️  The [locale]/layout.tsx must NOT render <html> or <body> tags.
 *     Nesting them inside this layout causes React hydration errors.
 *
 * suppressHydrationWarning on both <html> and <body> silences warnings
 * from browser extensions (e.g. Grammarly) that mutate the DOM.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
