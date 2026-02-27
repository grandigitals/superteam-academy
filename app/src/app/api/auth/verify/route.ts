import { NextResponse } from 'next/server'
import { verifySIWSSignature, createSIWSMessage } from '@/lib/solana/auth'
import { getOrCreateUserProfile } from '@/lib/supabase/users'

interface VerifyBody {
    publicKey: string
    signature: string
    nonce: string
}

// Same nonce store — in MVP both routes share the module scope
// In production: use Redis or Supabase
const NONCE_STORE = new Map<string, { nonce: string; createdAt: number }>()

export async function POST(request: Request) {
    let body: VerifyBody
    try {
        body = await request.json() as VerifyBody
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { publicKey, signature, nonce } = body

    if (!publicKey || !signature || !nonce) {
        return NextResponse.json({ error: 'publicKey, signature, and nonce are required' }, { status: 400 })
    }

    // Reconstruct the message that was signed
    const message = createSIWSMessage(publicKey, nonce)

    // Verify the ed25519 signature
    const isValid = verifySIWSSignature(message, signature, publicKey)

    if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Upsert user profile in Supabase
    const user = await getOrCreateUserProfile(publicKey)

    // In production: create a JWT session token here
    // For now, return user data — frontend stores in Zustand
    return NextResponse.json({
        authenticated: true,
        user: {
            wallet: publicKey,
            id: user?.id,
            displayName: user?.displayName,
        },
    })
}
