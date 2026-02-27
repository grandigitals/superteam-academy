'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Config } from 'sanity'
import { Loader2 } from 'lucide-react'

// Sanity Studio is pure CSR — never SSR
const NextStudioComponent = dynamic(
    () => import('next-sanity/studio').then((m) => m.NextStudio),
    { ssr: false }
)

export default function StudioPage() {
    const [config, setConfig] = useState<Config | null>(null)

    useEffect(() => {
        // Load config client-side to avoid build-time evaluation
        import('@root/sanity.config').then((mod) => {
            setConfig(mod.default as Config)
        })
    }, [])

    if (!config) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-sol-green" />
                <span className="ml-3 text-foreground-muted">Loading Studio…</span>
            </div>
        )
    }

    return <NextStudioComponent config={config} />
}
