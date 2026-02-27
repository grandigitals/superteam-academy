/**
 * Analytics helpers — thin wrappers around posthog-js so components
 * never import posthog directly. Everything is no-op when no key is set.
 */
import posthog from 'posthog-js'

const enabled = () =>
    typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_POSTHOG_KEY

/** Identify a wallet-connected user in PostHog */
export function identifyUser(walletAddress: string, props?: Record<string, string | number | boolean>) {
    if (!enabled()) return
    posthog.identify(walletAddress, props)
}

/** Track a custom event */
export function trackEvent(event: string, props?: Record<string, string | number | boolean>) {
    if (!enabled()) return
    posthog.capture(event, props)
}

/** Reset identity (on wallet disconnect) */
export function resetUser() {
    if (!enabled()) return
    posthog.reset()
}
