-- Phase 5 Migration: Add wallet-keyed columns for direct RPC access
-- The services use `wallet TEXT` as the primary key for direct RPC lookups
-- (avoiding the user_id FK join requirement for each service call).
-- Run this AFTER the initial schema migration.

-- Add wallet column to enrollments for direct wallet-based queries
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS wallet TEXT;
ALTER TABLE lesson_completions ADD COLUMN IF NOT EXISTS wallet TEXT;
ALTER TABLE lesson_completions ADD COLUMN IF NOT EXISTS lesson_index INT;
ALTER TABLE xp_ledger ADD COLUMN IF NOT EXISTS wallet TEXT;
ALTER TABLE xp_ledger ADD COLUMN IF NOT EXISTS course_id TEXT;
ALTER TABLE xp_ledger ADD COLUMN IF NOT EXISTS lesson_index INT;
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS wallet TEXT;
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS track_id TEXT;
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS level INT NOT NULL DEFAULT 1;
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS courses_completed INT NOT NULL DEFAULT 0;
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS total_xp INT NOT NULL DEFAULT 0;
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS issued_at TIMESTAMPTZ;
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS track_name TEXT;

-- Unique constraint for idempotent upserts from the service layer
ALTER TABLE enrollments ADD CONSTRAINT IF NOT EXISTS enrollments_wallet_course_unique UNIQUE (wallet, course_id);
ALTER TABLE lesson_completions ADD CONSTRAINT IF NOT EXISTS lc_wallet_course_lesson_unique UNIQUE (wallet, course_id, lesson_index);
ALTER TABLE xp_ledger ADD CONSTRAINT IF NOT EXISTS xp_wallet_course_lesson_unique UNIQUE (wallet, course_id, lesson_index);

-- Leaderboard view (all-time ranking by wallet)
CREATE OR REPLACE VIEW leaderboard_all_time AS
  SELECT
    xl.wallet,
    u.display_name,
    SUM(xl.amount) AS total_xp,
    RANK() OVER (ORDER BY SUM(xl.amount) DESC) AS rank
  FROM xp_ledger xl
  LEFT JOIN users u ON u.wallet = xl.wallet
  WHERE xl.wallet IS NOT NULL
  GROUP BY xl.wallet, u.display_name;

-- RLS policies for wallet column access
CREATE POLICY IF NOT EXISTS "Enrollments wallet read" ON enrollments
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Lesson completions wallet read" ON lesson_completions
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "XP ledger wallet read" ON xp_ledger
  FOR SELECT USING (true);
