import { z } from 'zod'

const envSchema = z.object({
    // Sanity
    NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1).default('placeholder'),
    NEXT_PUBLIC_SANITY_DATASET: z.string().min(1).default('production'),
    SANITY_API_READ_TOKEN: z.string().optional(),

    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

    // Auth
    NEXTAUTH_SECRET: z.string().optional(),
    NEXTAUTH_URL: z.string().url().optional(),

    // Solana
    NEXT_PUBLIC_SOLANA_RPC_URL: z.string().url().default('https://api.devnet.solana.com'),
    NEXT_PUBLIC_HELIUS_API_KEY: z.string().optional(),
    NEXT_PUBLIC_SERVICE_MODE: z.enum(['mock', 'onchain']).default('mock'),

    // Analytics
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
    SENTRY_DSN: z.string().url().optional(),
})

type Env = z.infer<typeof envSchema>

function parseEnv(): Env {
    const result = envSchema.safeParse(process.env)
    if (!result.success) {
        // Safe to print in server context only
        console.error('❌ Invalid environment variables:', result.error.flatten().fieldErrors)
    }
    // Return data even on partial failure (defaults fill in missing optional vars)
    return envSchema.parse(process.env)
}

export const env = parseEnv()
