import { NextResponse } from 'next/server'
import { verifySIWSSignature } from '@/lib/solana/auth'
import { getOrCreateUserProfile } from '@/lib/supabase/users'

interface VerifyBody {
    publicKey: string
    signature: string
    /**
     * The exact message string the user signed on the client.
     * We verify the signature against this directly instead of
     * re-constructing the message server-side (which would produce
     * a different timestamp and always fail verification).
     */
    message: string
}

export async function POST(request: Request) {
    let body: VerifyBody
    try {
        body = await request.json() as VerifyBody
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { publicKey, signature, message } = body

    if (!publicKey || !signature || !message) {
        return NextResponse.json({ error: 'publicKey, signature, and message are required' }, { status: 400 })
    }

    // Sanity-check: message must reference the correct wallet
    if (!message.includes(publicKey)) {
        return NextResponse.json({ error: 'Message/publicKey mismatch' }, { status: 400 })
    }

    // Verify the ed25519 signature against the exact message that was signed
    const isValid = verifySIWSSignature(message, signature, publicKey)

    if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Upsert user profile in Supabase (gracefully skipped when Supabase is not configured)
    let user = null
    try {
        user = await getOrCreateUserProfile(publicKey)
    } catch {
        // Supabase env vars not set — auth still succeeds in mock/dev mode
    }

    return NextResponse.json({
        authenticated: true,
        user: {
            wallet: publicKey,
            id: user?.id ?? publicKey,
            displayName: user?.displayName ?? null,
        },
    })
}
