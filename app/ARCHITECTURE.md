# Superteam Academy Architecture

Welcome to the Superteam Academy repository! This document explains the core structural and architectural decisions made in the codebase to help new contributors understand how everything fits together.

## 🏗 High-Level Structure

This project uses **Next.js 16 (App Router)** with **TypeScript**, styled via **Tailwind CSS**, and deployed on **Vercel**. 

The source code lives inside the `app/src/` directory.

### Key Directories

```text
app/src/
├── app/                    # Next.js App Router (Pages, Layouts, API routes)
│   ├── [locale]/           # next-intl dynamic segment for i18n
│   └── api/                # Next.js Serverless API endpoints
├── components/             # Reusable UI Components
│   ├── courses/            # Course/Lesson related UI
│   ├── gamification/       # XP Bars, Badges, Level visuals
│   ├── layout/             # Navbar, Footer, Providers
│   ├── leaderboard/        # Leaderboard table
│   ├── lesson/             # Monaco Editor and challenge UI
│   └── wallet/             # Solana wallet connection components
├── hooks/                  # Custom React Hooks
│   ├── useXP.ts            # Fetches and syncs user XP globally
│   └── useSignIn.ts        # Manage Sign-In With Solana (SIWS)
├── i18n/                   # Internationalization config (next-intl)
├── lib/                    # Utility Functions and Configurations
│   ├── solana/             # SPL Token fetching, SIWS crypto tools
│   ├── sanity/             # CMS client setup and queries
│   └── supabase/           # Supabase Admin client
├── services/               # 🧠 THE DATA LAYER (Crucial Concept)
│   ├── interfaces.ts       # TypeScript interfaces for all services
│   ├── types.ts            # Shared domain model types
│   ├── factory.ts          # Swaps between Mock and Production implementations
│   ├── mock/               # Hardcoded data for local UI development
│   └── onchain/            # Production implementations (Supabase + RPCs)
└── store/                  # Global State (Zustand)
    └── useAuthStore.ts     # Holds session, wallet, and cached XP data
```

---

## 🔌 The Service Layer Pattern

**Rule #1: UI components never fetch data directly from Supabase, Sanity, or Solana RPCs.**

Instead, all data fetching goes through the **Service Layer** (`app/src/services/`). This allows us to easily swap out the backend implementation (e.g., from mock data to real data) without touching a single React component.

### Service Interfaces

We define strict TypeScript interfaces in `services/interfaces.ts`:
- `ICourseService`: Fetches course metadata from Sanity CMS.
- `IEnrollmentService`: Enrolls users into courses (Supabase).
- `ILearningProgressService`: Marks lessons complete, awards XP, updates streaks (Supabase).
- `ILeaderboardService`: Fetches top users ranked by XP (Supabase).
- `ICredentialService`: Fetches compressed NFTs minted to the user's wallet via Helius (Solana RPC).

### The Factory (`factory.ts`)

Components call `createCourseService()`, which checks the `NEXT_PUBLIC_SERVICE_MODE` environment variable. 
- If `"mock"`, it returns the implementations from `services/mock/`.
- If `"onchain"`, it returns the implementations from `services/onchain/`.

---

## 🔒 Security & Server Actions

**Rule #2: Client Components cannot bypass Supabase Row Level Security (RLS).**

For operations that write to the database (like enrolling in a course or claiming XP), doing it directly from a Client Component using the `SUPABASE_ANON_KEY` will result in a silent failure due to RLS policies.

To fix this, we use Next.js **Server Actions** (`app/src/app/actions/`).

1. The user clicks "Mark Complete" in a Client Component (`LessonEditor.tsx`).
2. The component calls the `completeLessonAction` Server Action.
3. The Server Action uses the `SUPABASE_SERVICE_ROLE_KEY` (admin bypass) to write the XP and completion status securely to the database.

---

## 🔑 Authentication (SIWS)

Superteam Academy is completely passwordless, relying on **Sign-In With Solana (SIWS)**.

1. The user connects their wallet (Phantom, Solflare, etc.).
2. The `SignInButton` fetches a unique, secure nonce from `GET /api/auth/nonce`.
3. The wallet signs a standardized SIWS message containing this nonce.
4. The signed payload is sent to `POST /api/auth/verify`.
5. The backend cryptographically verifies the ed25519 signature. If valid, the user is authenticated and their session is stored in the Zustand `useAuthStore`.

---

## 💡 State Management

We use **Zustand** (`store/useAuthStore.ts`) for global state.

- `user`: The authenticated user's profile data.
- `xp`: The user's total XP balance across all courses. 
- `isAuthenticated`: Boolean flag.

**Why store XP globally?**
The user's XP dictates their "Level", which is displayed globally in the Navbar (`LevelBadge`). By keeping it in Zustand, the `useXP` hook can auto-refresh the balance in the background, instantly updating the Navbar badge without requiring a page reload when a user finishes a lesson.

---

## 🌐 Internationalization (i18n)

The app supports English (`en`), Portuguese (`pt-BR`), and Spanish (`es`) via `next-intl`.

- The language string is always present in the URL (e.g. `/pt-BR/courses`).
- `middleware.ts` intercepts requests and redirects to the default locale (`/en/..`) if none is provided.
- Translation dictionaries live in `app/src/i18n/messages/`.
- Use the `useTranslations('namespace')` hook inside components to render localized text.
