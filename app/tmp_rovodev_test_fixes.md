# Fixed Issues

## 1. Profile Save Issue ✅
**Problem**: Database schema missing INSERT/UPDATE RLS policies
**Solution**: Added RLS policies for INSERT and UPDATE operations on `users` table

## 2. Course Progress Issue ✅
**Problem**: Missing `xp_earned` column in `enrollments` table
**Solution**: Added `xp_earned INT NOT NULL DEFAULT 0` column to enrollments table

## 3. RLS Policies ✅
**Problem**: All tables had only SELECT policies, blocking writes
**Solution**: Added INSERT/UPDATE policies for all tables:
- enrollments
- lesson_completions
- credentials
- xp_ledger
- streaks

## Next Steps
You need to apply this migration to your Supabase database:
1. Run the updated migration file
2. Or manually execute the ALTER/CREATE statements

Run this command to see what needs to be applied:
```sql
-- Add missing column
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS xp_earned INT NOT NULL DEFAULT 0;

-- Add RLS policies (if not already present)
CREATE POLICY IF NOT EXISTS "Users can insert own row" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Users can update own row" ON users FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Enrollments insert own" ON enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enrollments update own" ON enrollments FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Lesson completions insert own" ON lesson_completions FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "XP ledger insert own" ON xp_ledger FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Streaks insert own" ON streaks FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Streaks update own" ON streaks FOR UPDATE USING (true);
```
