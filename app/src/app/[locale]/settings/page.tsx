import type { Metadata } from 'next'
import { WalletGate } from '@/components/wallet/WalletGate'
import { SettingsClient } from './SettingsClient'

export const metadata: Metadata = { title: 'Settings' }

export default function SettingsPage() {
    return (
        <WalletGate>
            <div className="min-h-screen px-4 py-10">
                <SettingsClient />
            </div>
        </WalletGate>
    )
}
