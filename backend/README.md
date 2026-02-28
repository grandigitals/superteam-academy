# Superteam Academy — Backend Service

Express + TypeScript server that holds the **`backend_signer`** keypair and co-signs on-chain transactions that require platform-authority.

## Architecture

```
Next.js Frontend
      │
      │ POST /api/complete-lesson     → backend_signer signs complete_lesson ix
      │ POST /api/finalize-course     → backend_signer signs finalize_course ix
      │ POST /api/credentials/issue   → backend_signer signs issue_credential ix
      │ POST /api/credentials/upgrade → backend_signer signs upgrade_credential ix
      │ GET  /api/xp/:wallet          → reads Token-2022 ATA balance
      │ GET  /api/courses             → reads Course PDAs
      │ GET  /api/credentials/:wallet → Helius DAS query
      ▼
On-Chain Program (ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf)
```

## Setup

### 1. Prerequisites

Run `anchor build` in `../onchain-academy/` first to generate the IDL:

```bash
cd ../onchain-academy
anchor build
```

This creates `../onchain-academy/target/idl/onchain_academy.json` which the backend imports.

### 2. Install Dependencies

```bash
cd backend
npm install    # or pnpm install / yarn install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Fill in:
- `BACKEND_SIGNER_KEYPAIR` — the keypair registered as `backend_signer` in the Config PDA
- `XP_MINT` — the Token-2022 XP mint address (from `initialize` instruction output)
- `HELIUS_RPC_URL` — Helius RPC endpoint (needed for Credential DAS queries)
- `TRACK_COLLECTION_*` — one Metaplex Core collection pubkey per learning track

### 4. Run

```bash
npm run dev     # development (ts-node-dev with hot reload)
npm run build   # compile TypeScript
npm start       # production
```

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/courses` | All on-chain Course PDAs |
| `GET` | `/api/courses/:id` | Single Course PDA |
| `GET` | `/api/courses/:id/enrollment/:wallet` | Enrollment PDA + bitmap |
| `GET` | `/api/xp/:wallet` | Token-2022 XP balance |
| `POST` | `/api/complete-lesson` | backend_signer signs `complete_lesson` |
| `POST` | `/api/finalize-course` | backend_signer signs `finalize_course` |
| `POST` | `/api/credentials/issue` | backend_signer signs `issue_credential` |
| `POST` | `/api/credentials/upgrade` | backend_signer signs `upgrade_credential` |
| `GET` | `/api/credentials/:wallet` | Metaplex Core NFTs via Helius DAS |

## Security Notes

- Never expose `BACKEND_SIGNER_KEYPAIR` publicly — this server should not be internet-accessible without auth
- Use `ALLOWED_ORIGINS` to restrict CORS to only the frontend domain
- The on-chain program validates that the signer matches `config.backend_signer` — a compromised key can be rotated via `update_config`
