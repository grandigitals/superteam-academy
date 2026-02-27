import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { withSentryConfig } from '@sentry/nextjs'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // Allow Wallet Adapter WASM files
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      crypto: false,
    }
    return config
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: '**.ipfs.nftstorage.link' },
      { protocol: 'https', hostname: 'arweave.net' },
      { protocol: 'https', hostname: 'www.gravatar.com' },
    ],
  },
}

const withIntl = withNextIntl(nextConfig)

// Sentry wraps on top — only activates when DSN + auth token are present
export default withSentryConfig(withIntl, {
  // Suppress source map upload noise when no auth token is set
  silent: !process.env.SENTRY_AUTH_TOKEN,
  // Upload source maps only when SENTRY_AUTH_TOKEN is provided
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
})

