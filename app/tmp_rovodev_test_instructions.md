# Test Instructions for Bug Fixes

## Prerequisites

1. **Install tsx** (TypeScript executor):
   ```bash
   npm install -D tsx
   ```

2. **Ensure your `.env.local` has Supabase credentials**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_SERVICE_MODE=supabase
   ```

3. **Update the test wallet** in `tmp_rovodev_test_fixes.ts`:
   ```typescript
   // Replace with a real test wallet address
   const TEST_WALLET = 'YOUR_TEST_WALLET_ADDRESS'
   ```

## Running the Tests

### Option 1: Quick Test (Automated)

```bash
cd superteam-academy/app
npx tsx tmp_rovodev_test_fixes.ts
```

### Option 2: Manual Testing via Browser

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Test Enrollment Persistence**:
   - Navigate to `/courses/solana-basics` (or any course)
   - Connect your wallet
   - Click "Enroll in Course"
   - ✅ Should show "Enrolled" badge
   - **Refresh the page** (F5 or Ctrl+R)
   - ✅ Should STILL show "Enrolled" badge (not "Enroll" button)

3. **Test Daily Streak**:
   - Go to a lesson page: `/courses/solana-basics/lessons/l1`
   - Click "Mark Complete"
   - ✅ Should see "+50 XP earned!" toast
   - Go to dashboard: `/dashboard`
   - ✅ Check "Current Streak" shows 1 (or continues from previous)
   - ✅ Check the 7-day history shows today marked
   - Complete another lesson
   - ✅ Streak should stay same (only increments on different days)
   - Try completing the same lesson again
   - ✅ Should not award XP again

## Expected Results

### ✅ Enrollment Test Should Show:
```
✅ First enrollment successful
✅ Is enrolled: true
✅ Re-enrollment successful (handles duplicates)
✅ Found 1+ enrollment(s)
```

### ✅ Streak Test Should Show:
```
✅ Lesson completed: xpEarned: 50, totalXP: 50+
✅ Streak data: currentStreak: 1+, longestStreak: 1+
✅ Same lesson completion: xpEarned: 0 (no duplicate XP)
✅ 7-day history with today marked
```

## Troubleshooting

### If enrollment test fails:
1. Check Supabase credentials in `.env.local`
2. Verify `users` table exists and RLS policies allow service role
3. Check browser console for errors

### If streak test fails:
1. Verify `streaks` table exists with correct schema
2. Check that `lesson_completions` and `xp_ledger` have data
3. Look for errors in terminal output

## Cleanup

After testing, remove the test files:
```bash
rm tmp_rovodev_test_fixes.ts
rm tmp_rovodev_test_instructions.md
```

## Database Verification

You can also verify directly in Supabase:

```sql
-- Check enrollments
SELECT * FROM enrollments WHERE wallet = 'YOUR_TEST_WALLET';

-- Check streaks
SELECT * FROM streaks WHERE wallet = 'YOUR_TEST_WALLET';

-- Check lesson completions
SELECT * FROM lesson_completions WHERE wallet = 'YOUR_TEST_WALLET';

-- Check XP ledger
SELECT * FROM xp_ledger WHERE wallet = 'YOUR_TEST_WALLET';
```
