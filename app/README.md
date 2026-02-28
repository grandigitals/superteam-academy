# Superteam Academy 🚀

> An open-source, interactive Learning Management System for Solana blockchain development.
> Earn XP, complete coding challenges, and receive soulbound on-chain credentials.

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Built with Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![Solana](https://img.shields.io/badge/Solana-Devnet-14F195)](https://solana.com)

---

## ✨ Features

| Feature | Status |
|---------|--------|
| 10 fully-styled pages (Landing, Courses, Lessons, Dashboard, Profile, Leaderboard, Settings, Certificate) | ✅ |
| Interactive Monaco code editor for coding challenges | ✅ |
| Gamification: XP, levels, streaks, achievements | ✅ |
| Sign-In With Solana (SIWS) — no passwords | ✅ |
| On-chain credential NFTs via Metaplex Core | 🔧 Devnet |
| Sanity CMS for course/lesson content | ✅ |
| Multilingual: English 🇺🇸, Português 🇧🇷, Español 🇪🇸 | ✅ |
| Dark-mode first with Solana brand design system | ✅ |
| PostHog analytics + Sentry error tracking | ✅ |

---

## 🏗 Architecture

```
app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/           # next-intl locale wrapper
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── courses/        # Course catalog + detail + lessons
│   │   │   ├── dashboard/      # User dashboard
│   │   │   ├── profile/        # Public profile
│   │   │   ├── leaderboard/    # Leaderboard
│   │   │   ├── settings/       # User settings
│   │   │   ├── certificates/   # Certificate viewer
│   │   │   └── studio/         # Sanity Studio (embedded)
│   │   └── api/
│   │       └── auth/           # SIWS nonce + verify endpoints
│   ├── components/             # Reusable UI components
│   │   ├── gamification/       # XPBar, LevelBadge
│   │   ├── courses/            # CourseCard, CourseGrid, EnrollButton
│   │   ├── lesson/             # LessonEditor (Monaco), CompleteButton
│   │   ├── leaderboard/        # LeaderboardTable
│   │   ├── layout/             # Navbar, Footer, ThemeProvider
│   │   └── wallet/             # SolanaProvider, WalletGate
│   ├── services/               # Data layer (ALL data access through here)
│   │   ├── interfaces.ts       # Service contracts
│   │   ├── types.ts            # Shared types
│   │   ├── factory.ts          # Mock vs OnChain switch
│   │   ├── mock/               # In-memory implementations
│   │   └── onchain/            # Solana/Supabase implementations
│   ├── lib/
│   │   ├── solana/             # XP utils, SIWS auth, on-chain reader
│   │   ├── sanity/             # Sanity client, GROQ queries, schemas
│   │   ├── supabase/           # Admin client, user helpers
│   │   └── analytics/          # PostHog provider + track()
│   ├── store/                  # Zustand stores
│   │   └── useAuthStore.ts     # Auth state (SIWS + XP cache)
│   ├── hooks/                  # Custom React hooks
│   │   └── useSignIn.ts        # SIWS sign-in flow
│   └── i18n/                   # next-intl config + messages
├── supabase/
│   └── migrations/             # SQL schema (users, enrollments, xp_ledger, credentials)
├── sanity.config.ts            # Sanity Studio config
├── next.config.ts
└── .env.local.example
```

---

## 🚀 Quick Start

```bash
git clone https://github.com/solanabr/superteam-academy.git
cd superteam-academy/app
pnpm install
cp .env.local.example .env.local  # fill in your values
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/en`.

Sanity Studio is at `/en/studio` once `NEXT_PUBLIC_SANITY_PROJECT_ID` is set.

---

## 🔑 Sign-In With Solana (SIWS)

1. User connects wallet (Phantom/Solflare)  
2. App fetches one-time nonce: `GET /api/auth/nonce?publicKey=...`  
3. Wallet signs a human-readable SIWS message  
4. `POST /api/auth/verify` verifies ed25519 signature via `nacl`  
5. On success: user upserted in Supabase, auth stored in Zustand  

---

## 🎮 XP & Levels

| Action | XP |
|--------|-----|
| Complete content lesson | 50 XP |
| Pass coding challenge | 200–300 XP |
| Complete course | 500–2500 XP |
| 7-day streak | 500 XP |

Level = `floor(sqrt(totalXP / 100))`

---

## 🌍 Internationalization

| Locale | Language | Status |
|--------|----------|--------|
| `en` | English | ✅ |
| `pt-BR` | Português (Brasil) | ✅ |
| `es` | Español | ✅ |

---

## 🛠 Service Layer

Set `NEXT_PUBLIC_SERVICE_MODE=mock` (default) for fast local dev with in-memory data, or `=onchain` for real Solana + Supabase. **Never call Supabase/Solana directly from components.**

---

## 📜 License

MIT — open source, built for the Solana ecosystem.
