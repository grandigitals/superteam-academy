-- Superteam Academy — Supabase Schema Migration
-- Run this in your Supabase SQL editor or via supabase db push

-- USERS table (wallet-based identity)
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet      TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio         TEXT,
  twitter_handle TEXT,
  github_handle TEXT,
  is_public   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ENROLLMENTS table
CREATE TABLE IF NOT EXISTS enrollments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id   TEXT NOT NULL,              -- Sanity course _id
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  progress_pct SMALLINT NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  UNIQUE (user_id, course_id)
);

-- LESSON_COMPLETIONS table
CREATE TABLE IF NOT EXISTS lesson_completions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id   TEXT NOT NULL,              -- Sanity lesson _id
  course_id   TEXT NOT NULL,
  xp_earned   INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

-- CREDENTIALS table (mirrors on-chain soulbound NFTs)
CREATE TABLE IF NOT EXISTS credentials (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id   TEXT NOT NULL,
  track_name  TEXT NOT NULL,
  mint_address TEXT UNIQUE,               -- On-chain NFT mint address
  metadata_uri TEXT,
  xp_at_issue INT NOT NULL DEFAULT 0,
  issued_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- XP_LEDGER table (event log for XP transactions)
CREATE TABLE IF NOT EXISTS xp_ledger (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  amount      INT NOT NULL,               -- positive = earned, negative = spent
  reason      TEXT NOT NULL,             -- 'lesson_complete', 'course_complete', 'streak', etc.
  ref_id      TEXT,                       -- lesson_id or course_id
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Computed XP view
CREATE OR REPLACE VIEW user_xp AS
  SELECT user_id, COALESCE(SUM(amount), 0) AS total_xp
  FROM xp_ledger
  GROUP BY user_id;

-- STREAKS table
CREATE TABLE IF NOT EXISTS streaks (
  user_id     UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current     INT NOT NULL DEFAULT 0,
  longest     INT NOT NULL DEFAULT 0,
  last_active DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- Policies: users can read their own data; service role bypasses all
CREATE POLICY "Users can read own row" ON users FOR SELECT USING (true);
CREATE POLICY "Service role full access on users" ON users USING (auth.role() = 'service_role');
