import { NextResponse } from 'next/server'
import { generateNonce } from '@/lib/solana/auth'

// In production: store nonces in Redis/Supabase with TTL
// For dev/demo: use a simple in-memory store
const NONCE_STORE = new Map<string, { nonce: string; createdAt: number }>()

// Clean up expired nonces every 5 minutes
setInterval(() => {
    const now = Date.now()
    for (const [key, value] of NONCE_STORE.entries()) {
        if (now - value.createdAt > 5 * 60 * 1000) {
            NONCE_STORE.delete(key)
        }
    }
}, 5 * 60 * 1000)

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const publicKey = searchParams.get('publicKey')

    if (!publicKey) {
        return NextResponse.json({ error: 'publicKey required' }, { status: 400 })
    }

    const nonce = generateNonce()
    NONCE_STORE.set(publicKey, { nonce, createdAt: Date.now() })

    return NextResponse.json({ nonce })
}
