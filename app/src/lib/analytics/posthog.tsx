'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? ''
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com'

if (typeof window !== 'undefined' && POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: false, // manual capture for SPA routing
        capture_pageleave: true,
        persistence: 'localStorage',
    })
}

export function Analytics({ children }: { children: React.ReactNode }) {
    return (
        <PostHogProvider client={posthog}>
            {children}
        </PostHogProvider>
    )
}

/**
 * Track a custom analytics event.
 * Call this from anywhere in the app.
 */
export function track(event: string, properties?: Record<string, unknown>) {
    if (typeof window !== 'undefined' && POSTHOG_KEY) {
        posthog.capture(event, properties)
    }
}
