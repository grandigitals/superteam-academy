'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// ─── Page-view tracker ────────────────────────────────────────────────────────

function PageviewTracker() {
    const pathname = usePathname()
    const ph = usePostHog()
    const prevPath = useRef<string | null>(null)

    useEffect(() => {
        if (!ph || pathname === prevPath.current) return
        prevPath.current = pathname
        ph.capture('$pageview', { $current_url: window.location.href })
    }, [pathname, ph])

    return null
}

// ─── PostHog Provider ─────────────────────────────────────────────────────────

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com'

    useEffect(() => {
        if (!key) return
        posthog.init(key, {
            api_host: host,
            capture_pageview: false,  // We handle it manually via PageviewTracker
            capture_pageleave: true,
            person_profiles: 'identified_only',
        })
    }, [key, host])

    if (!key) {
        // No key — analytics silently disabled
        return <>{children}</>
    }

    return (
        <PHProvider client={posthog}>
            <PageviewTracker />
            {children}
        </PHProvider>
    )
}
