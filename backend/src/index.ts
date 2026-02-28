/**
 * backend/src/index.ts
 *
 * Express application entry point.
 *
 * Mounts all API routes and starts the HTTP server.
 * The backend_signer keypair is loaded on startup — if it's invalid,
 * the process exits immediately rather than silently failing at request time.
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from './config'
import { getBackendSigner } from './keypair'
import { coursesRouter } from './routes/courses'
import { xpRouter } from './routes/xp'
import { progressRouter } from './routes/progress'
import { credentialsRouter } from './routes/credentials'

// --- Startup: validate keypair immediately --------------------------------
try {
    const signer = getBackendSigner()
    console.log(`✅ Backend signer loaded: ${signer.publicKey.toBase58()}`)
} catch (err) {
    console.error('❌ FATAL: Failed to load backend signer keypair:', (err as Error).message)
    process.exit(1)
}

// --- App -----------------------------------------------------------------

const app = express()

app.use(helmet())
app.use(cors({
    origin: config.allowedOrigins,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())

// --- Routes --------------------------------------------------------------

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', program: config.programId.toBase58() })
})

app.use('/api/courses', coursesRouter)
app.use('/api/xp', xpRouter)
app.use('/api', progressRouter)          // /api/complete-lesson, /api/finalize-course
app.use('/api/credentials', credentialsRouter)

// --- 404 -----------------------------------------------------------------

app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Not found' })
})

// --- Start ---------------------------------------------------------------

app.listen(config.port, () => {
    console.log(`🚀 Superteam Academy backend running on http://localhost:${config.port}`)
    console.log(`   Program ID: ${config.programId.toBase58()}`)
    console.log(`   RPC: ${config.solanaRpcUrl}`)
})

export default app
