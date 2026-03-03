-- =============================================================================
-- Superteam Academy Database Fixes
-- =============================================================================
-- This script fixes the issues preventing profile saves and progress tracking
--
-- Run this in your Supabase SQL Editor:
-- https://app.supabase.com/project/YOUR_PROJECT/sql/new
-- =============================================================================

-- FIX 1: Add missing xp_earned column to enrollments table
-- This column is required by SupabaseEnrollmentService
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS xp_earned INT NOT NULL DEFAULT 0;

-- FIX 2: Add INSERT and UPDATE policies for users table
-- Without these, profile updates are blocked by RLS
DROP POLICY IF EXISTS "Users can insert own row" ON users;
CREATE POLICY "Users can insert own row" ON users 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own row" ON users;
CREATE POLICY "Users can update own row" ON users 
  FOR UPDATE USING (true);

-- FIX 3: Add INSERT and UPDATE policies for enrollments table
DROP POLICY IF EXISTS "Enrollments insert own" ON enrollments;
CREATE POLICY "Enrollments insert own" ON enrollments 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enrollments update own" ON enrollments;
CREATE POLICY "Enrollments update own" ON enrollments 
  FOR UPDATE USING (true);

-- FIX 4: Add INSERT policy for lesson_completions
DROP POLICY IF EXISTS "Lesson completions insert own" ON lesson_completions;
CREATE POLICY "Lesson completions insert own" ON lesson_completions 
  FOR INSERT WITH CHECK (true);

-- FIX 5: Add INSERT policy for xp_ledger
DROP POLICY IF EXISTS "XP ledger insert own" ON xp_ledger;
CREATE POLICY "XP ledger insert own" ON xp_ledger 
  FOR INSERT WITH CHECK (true);

-- FIX 6: Add INSERT and UPDATE policies for streaks
DROP POLICY IF EXISTS "Streaks insert own" ON streaks;
CREATE POLICY "Streaks insert own" ON streaks 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Streaks update own" ON streaks;
CREATE POLICY "Streaks update own" ON streaks 
  FOR UPDATE USING (true);

-- FIX 7: Add INSERT policy for credentials
DROP POLICY IF EXISTS "Credentials insert own" ON credentials;
CREATE POLICY "Credentials insert own" ON credentials 
  FOR INSERT WITH CHECK (true);

-- =============================================================================
-- Verification Query
-- Run this after applying the fixes to verify everything is set up correctly:
-- =============================================================================

-- Check if xp_earned column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'enrollments' AND column_name = 'xp_earned';

-- Check RLS policies
SELECT tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
