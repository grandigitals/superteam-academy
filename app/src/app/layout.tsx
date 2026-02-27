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
        {/* Preconnect to Google Fonts — loaded via globals.css @import */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for external services */}
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        <link rel="dns-prefetch" href="https://mainnet.helius-rpc.com" />
        <link rel="dns-prefetch" href="https://app.posthog.com" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
