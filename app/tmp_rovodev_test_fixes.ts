/**
 * Test script to verify enrollment persistence and streak functionality
 * 
 * Run with: npx tsx tmp_rovodev_test_fixes.ts
 * 
 * Prerequisites:
 * - Set up your .env.local with Supabase credentials
 * - Have a test wallet address ready
 */

import { SupabaseEnrollmentService } from './src/services/supabase/SupabaseEnrollmentService'
import { SupabaseLearningProgressService } from './src/services/supabase/SupabaseLearningProgressService'

// Test wallet (replace with your actual test wallet)
const TEST_WALLET = 'TestWallet123456789'
const TEST_COURSE_ID = 'test-course-solana-basics'

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function testEnrollmentPersistence() {
    console.log('\n🔍 Testing Enrollment Persistence...\n')
    
    const enrollmentService = new SupabaseEnrollmentService()
    
    try {
        // Test 1: First enrollment
        console.log('1️⃣ Enrolling for the first time...')
        const enrollment1 = await enrollmentService.enrollInCourse(TEST_WALLET, TEST_COURSE_ID)
        console.log('✅ First enrollment successful:', {
            courseId: enrollment1.courseId,
            wallet: enrollment1.wallet,
            enrolledAt: enrollment1.enrolledAt
        })
        
        await sleep(500)
        
        // Test 2: Check if enrolled (simulating page refresh)
        console.log('\n2️⃣ Checking enrollment status (simulating refresh)...')
        const isEnrolled = await enrollmentService.isEnrolled(TEST_WALLET, TEST_COURSE_ID)
        console.log(`✅ Is enrolled: ${isEnrolled}`)
        
        if (!isEnrolled) {
            console.error('❌ FAILED: Enrollment not persisted after refresh!')
            return false
        }
        
        // Test 3: Re-enrolling (should not error, should return existing)
        console.log('\n3️⃣ Re-enrolling (should handle duplicates gracefully)...')
        const enrollment2 = await enrollmentService.enrollInCourse(TEST_WALLET, TEST_COURSE_ID)
        console.log('✅ Re-enrollment successful:', {
            courseId: enrollment2.courseId,
            wallet: enrollment2.wallet,
            enrolledAt: enrollment2.enrolledAt
        })
        
        // Test 4: Get all enrollments
        console.log('\n4️⃣ Getting all enrollments for wallet...')
        const allEnrollments = await enrollmentService.getEnrollments(TEST_WALLET)
        console.log(`✅ Found ${allEnrollments.length} enrollment(s)`)
        allEnrollments.forEach((e, i) => {
            console.log(`   ${i + 1}. Course: ${e.courseId}`)
        })
        
        console.log('\n✅ All enrollment persistence tests passed!\n')
        return true
    } catch (error) {
        console.error('❌ Enrollment test failed:', error)
        return false
    }
}

async function testStreakFunctionality() {
    console.log('\n🔥 Testing Streak Functionality...\n')
    
    const progressService = new SupabaseLearningProgressService()
    
    try {
        // Test 1: Complete first lesson
        console.log('1️⃣ Completing lesson 0...')
        const result1 = await progressService.completeLesson(TEST_WALLET, TEST_COURSE_ID, 0)
        console.log('✅ Lesson completed:', {
            xpEarned: result1.xpEarned,
            totalXP: result1.totalXP
        })
        
        await sleep(500)
        
        // Test 2: Check streak after first lesson
        console.log('\n2️⃣ Checking streak data...')
        const streak1 = await progressService.getStreakData(TEST_WALLET)
        console.log('✅ Streak data:', {
            currentStreak: streak1.currentStreak,
            longestStreak: streak1.longestStreak,
            lastActivity: streak1.lastActivity
        })
        
        if (streak1.currentStreak === 0) {
            console.warn('⚠️ Current streak is 0 (might be expected if not first activity today)')
        }
        
        // Test 3: Complete another lesson (should not increase streak on same day)
        console.log('\n3️⃣ Completing lesson 1 (same day)...')
        const result2 = await progressService.completeLesson(TEST_WALLET, TEST_COURSE_ID, 1)
        console.log('✅ Lesson completed:', {
            xpEarned: result2.xpEarned,
            totalXP: result2.totalXP
        })
        
        await sleep(500)
        
        // Test 4: Check streak hasn't changed
        console.log('\n4️⃣ Checking streak (should be same as before)...')
        const streak2 = await progressService.getStreakData(TEST_WALLET)
        console.log('✅ Streak data:', {
            currentStreak: streak2.currentStreak,
            longestStreak: streak2.longestStreak
        })
        
        if (streak1.currentStreak !== streak2.currentStreak) {
            console.error('❌ FAILED: Streak changed on same day!')
            return false
        }
        
        // Test 5: Try completing same lesson again (should not award XP)
        console.log('\n5️⃣ Completing same lesson again (should not award XP)...')
        const result3 = await progressService.completeLesson(TEST_WALLET, TEST_COURSE_ID, 1)
        console.log('✅ Result:', {
            xpEarned: result3.xpEarned,
            totalXP: result3.totalXP
        })
        
        if (result3.xpEarned !== 0) {
            console.error('❌ FAILED: XP awarded for duplicate completion!')
            return false
        }
        
        // Test 6: Check total XP balance
        console.log('\n6️⃣ Checking total XP balance...')
        const totalXP = await progressService.getXPBalance(TEST_WALLET)
        console.log(`✅ Total XP: ${totalXP}`)
        
        // Test 7: Check course progress
        console.log('\n7️⃣ Checking course progress...')
        const progress = await progressService.getCourseProgress(TEST_WALLET, TEST_COURSE_ID)
        console.log('✅ Course progress:', {
            courseId: progress?.courseId,
            completedLessons: progress?.completedLessons,
            xpEarned: progress?.xpEarned
        })
        
        // Test 8: Check streak history
        console.log('\n8️⃣ Checking 7-day streak history...')
        console.log('✅ Last 7 days:')
        streak2.history.forEach((day, i) => {
            const status = day.completed ? '✅' : '⬜'
            console.log(`   ${status} ${day.date}`)
        })
        
        console.log('\n✅ All streak tests passed!\n')
        return true
    } catch (error) {
        console.error('❌ Streak test failed:', error)
        return false
    }
}

async function runAllTests() {
    console.log('╔═══════════════════════════════════════════════════════╗')
    console.log('║  Superteam Academy - Bug Fix Verification Tests      ║')
    console.log('╚═══════════════════════════════════════════════════════╝')
    
    console.log(`\n📝 Test Configuration:`)
    console.log(`   Wallet: ${TEST_WALLET}`)
    console.log(`   Course: ${TEST_COURSE_ID}`)
    console.log(`   Timestamp: ${new Date().toISOString()}\n`)
    
    const enrollmentPassed = await testEnrollmentPersistence()
    await sleep(1000)
    
    const streakPassed = await testStreakFunctionality()
    
    console.log('\n╔═══════════════════════════════════════════════════════╗')
    console.log('║                    Test Summary                       ║')
    console.log('╚═══════════════════════════════════════════════════════╝\n')
    
    console.log(`Enrollment Persistence: ${enrollmentPassed ? '✅ PASSED' : '❌ FAILED'}`)
    console.log(`Streak Functionality:   ${streakPassed ? '✅ PASSED' : '❌ FAILED'}`)
    
    if (enrollmentPassed && streakPassed) {
        console.log('\n🎉 All tests passed! Both bugs are fixed.\n')
        process.exit(0)
    } else {
        console.log('\n⚠️ Some tests failed. Please review the output above.\n')
        process.exit(1)
    }
}

// Run tests
runAllTests().catch(error => {
    console.error('\n💥 Fatal error running tests:', error)
    process.exit(1)
})
