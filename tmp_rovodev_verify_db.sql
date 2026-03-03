-- =============================================================================
-- Verification Query - Check if fixes were applied
-- =============================================================================
-- Run this in Supabase SQL Editor to verify everything is set up correctly
-- =============================================================================

-- Check if xp_earned column exists in enrollments table
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'enrollments' AND column_name = 'xp_earned';

-- Check all RLS policies on your tables
SELECT tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Count how many policies exist per table
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
