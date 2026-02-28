# 🔧 Deployment Bug Fixes - Enrollment & Language Switching

## Issues Fixed

### 1. ✅ Enrollment Not Persisting on Page Refresh

**Root Cause:**
- Client components were directly calling `getSupabaseAdmin()` which uses `SUPABASE_SERVICE_ROLE_KEY`
- This environment variable is **NOT available in the browser** (only server-side)
- The client was falling back to anonymous key with RLS restrictions
- Database writes appeared to succeed but reads failed due to permission issues

**Solution:**
Created Next.js Server Actions to handle all database operations server-side:

- `app/actions/enrollment.ts` - Server actions for enrollment operations
- `app/actions/learning-progress.ts` - Server actions for lesson completion and streaks

**Files Modified:**
- ✅ `components/courses/EnrollButton.tsx` - Now uses `enrollInCourseAction()` and `checkEnrollmentAction()`
- ✅ `components/lesson/CompleteButton.tsx` - Now uses `completeLessonAction()`
- ✅ `services/supabase/SupabaseEnrollmentService.ts` - Fixed user creation and enrollment logic
- ✅ `services/supabase/SupabaseLearningProgressService.ts` - Added streak tracking

---

### 2. ✅ Language Auto-Switching Issue

**Root Cause:**
- `next-intl` middleware was detecting browser locale preferences and auto-redirecting
- Locale prefix was set to "as-needed" allowing URLs without locale
- Navbar language switcher wasn't highlighting current language

**Solution:**
- Disabled automatic locale detection: `localeDetection: false`
- Force locale prefix in all URLs: `localePrefix: 'always'`
- Updated language switcher to show current selection and properly preserve paths

**Files Modified:**
- ✅ `i18n/routing.ts` - Disabled auto-detection, enforced locale prefix
- ✅ `components/layout/Navbar.tsx` - Fixed language switcher to preserve current path and highlight active language

---

## Key Changes Summary

### Server Actions Created

#### `app/actions/enrollment.ts`
```typescript
- enrollInCourseAction(wallet, courseId)
- checkEnrollmentAction(wallet, courseId)
- getEnrollmentsAction(wallet)
```

#### `app/actions/learning-progress.ts`
```typescript
- completeLessonAction(wallet, courseId, lessonIndex)
- getCourseProgressAction(wallet, courseId)
- getStreakDataAction(wallet)
- getXPBalanceAction(wallet)
```

### Database Logic Improvements

1. **User Creation**: Automatically creates user record before enrollment
2. **Idempotent Operations**: Safe to call multiple times without duplication
3. **Streak Tracking**: Properly updates `streaks` table on lesson completion
4. **XP Deduplication**: Prevents double XP awards for same lesson

### Configuration Changes

```typescript
// i18n/routing.ts
export const routing = defineRouting({
    locales: ['en', 'pt-BR', 'es'],
    defaultLocale: 'en',
    localePrefix: 'always',      // ✅ NEW
    localeDetection: false,       // ✅ NEW
})
```

---

## Deployment Checklist

Before deploying to Vercel, ensure:

- [ ] All environment variables are set in Vercel dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` ← **Must be set as server-only variable**
  
- [ ] Supabase database migrations are applied:
  - `20240101_initial_schema.sql`
  - `20240102_phase5_wallet_keys.sql`

- [ ] RLS policies are configured correctly in Supabase

---

## Testing After Deployment

### Test Enrollment Persistence
1. Connect wallet
2. Enroll in a course
3. **Refresh the page** - should still show "Enrolled" ✅
4. Disconnect wallet and reconnect - should still show "Enrolled" ✅

### Test Streak Functionality
1. Complete a lesson
2. Check dashboard - streak should increment
3. Complete another lesson same day - streak stays same
4. Complete lesson next day - streak increments
5. Check database: `SELECT * FROM streaks WHERE wallet = 'YOUR_WALLET'`

### Test Language Switching
1. Select a language from navbar (EN/PT/ES)
2. Navigate to different pages
3. **Language should stay consistent** ✅
4. Refresh page - **language should persist** ✅
5. Active language should be highlighted in green ✅

---

## Environment Variables

### Required in Vercel:

```bash
# Public (available in browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# Server-only (NOT exposed to browser)
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  # ⚠️ CRITICAL - Server only!

# Optional
NEXT_PUBLIC_SERVICE_MODE=supabase
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

---

## Architecture Notes

### Before (❌ Broken)
```
Browser → Service → Supabase Admin Client → ❌ No SERVICE_ROLE_KEY → Fails
```

### After (✅ Fixed)
```
Browser → Server Action → Supabase Admin Client → ✅ Has SERVICE_ROLE_KEY → Success
```

Server Actions run on the server, so they have access to server-only environment variables.

---

## Files Changed

### Created:
- `app/actions/enrollment.ts` (NEW)
- `app/actions/learning-progress.ts` (NEW)

### Modified:
- `components/courses/EnrollButton.tsx`
- `components/lesson/CompleteButton.tsx`
- `services/supabase/SupabaseEnrollmentService.ts`
- `services/supabase/SupabaseLearningProgressService.ts`
- `i18n/routing.ts`
- `components/layout/Navbar.tsx`

---

## Rollback Plan

If issues occur after deployment:

1. Check Vercel logs for server action errors
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
3. Check Supabase dashboard for RLS policy issues
4. Verify database migrations were applied

---

## Next Steps

After successful deployment:

1. Monitor Vercel logs for any server action errors
2. Test enrollment flow with real users
3. Verify streak tracking works across multiple days
4. Consider adding rate limiting to server actions
5. Add error logging/monitoring (Sentry integration is already set up)

---

**Last Updated:** 2026-02-28
**Status:** ✅ Ready for deployment
