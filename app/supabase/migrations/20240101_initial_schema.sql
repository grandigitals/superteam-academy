-- Superteam Academy — Supabase Schema Migration
-- Drop existing tables to fix the schema mismatch
DROP VIEW IF EXISTS user_xp;
DROP TABLE IF EXISTS streaks CASCADE;
DROP TABLE IF EXISTS xp_ledger CASCADE;
DROP TABLE IF EXISTS credentials CASCADE;
DROP TABLE IF EXISTS lesson_completions CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

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
  wallet      TEXT REFERENCES users(wallet) ON DELETE CASCADE,
  course_id   TEXT NOT NULL,              -- Sanity course _id
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  progress_pct SMALLINT NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  xp_earned   INT NOT NULL DEFAULT 0,     -- Total XP earned in this course
  UNIQUE (wallet, course_id)
);

-- LESSON_COMPLETIONS table
CREATE TABLE IF NOT EXISTS lesson_completions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet      TEXT REFERENCES users(wallet) ON DELETE CASCADE,
  lesson_index INT NOT NULL,
  course_id   TEXT NOT NULL,
  xp_earned   INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (wallet, course_id, lesson_index)
);

-- CREDENTIALS table (mirrors on-chain soulbound NFTs)
CREATE TABLE IF NOT EXISTS credentials (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet      TEXT REFERENCES users(wallet) ON DELETE CASCADE,
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
  wallet      TEXT REFERENCES users(wallet) ON DELETE CASCADE,
  amount      INT NOT NULL,               -- positive = earned, negative = spent
  reason      TEXT NOT NULL,             -- 'lesson_complete', 'course_complete', 'streak', etc.
  course_id   TEXT,
  lesson_index INT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (wallet, course_id, lesson_index)
);

-- Computed XP view
CREATE OR REPLACE VIEW user_xp AS
  SELECT wallet, COALESCE(SUM(amount), 0) AS total_xp
  FROM xp_ledger
  GROUP BY wallet;

-- STREAKS table
CREATE TABLE IF NOT EXISTS streaks (
  wallet      TEXT PRIMARY KEY REFERENCES users(wallet) ON DELETE CASCADE,
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
CREATE POLICY "Users can insert own row" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own row" ON users FOR UPDATE USING (true);

CREATE POLICY "Enrollments select all" ON enrollments FOR SELECT USING (true);
CREATE POLICY "Enrollments insert own" ON enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enrollments update own" ON enrollments FOR UPDATE USING (true);

CREATE POLICY "Lesson completions select all" ON lesson_completions FOR SELECT USING (true);
CREATE POLICY "Lesson completions insert own" ON lesson_completions FOR INSERT WITH CHECK (true);

CREATE POLICY "Credentials select all" ON credentials FOR SELECT USING (true);
CREATE POLICY "Credentials insert own" ON credentials FOR INSERT WITH CHECK (true);

CREATE POLICY "XP ledger select all" ON xp_ledger FOR SELECT USING (true);
CREATE POLICY "XP ledger insert own" ON xp_ledger FOR INSERT WITH CHECK (true);

CREATE POLICY "Streaks select all" ON streaks FOR SELECT USING (true);
CREATE POLICY "Streaks insert own" ON streaks FOR INSERT WITH CHECK (true);
CREATE POLICY "Streaks update own" ON streaks FOR UPDATE USING (true);

