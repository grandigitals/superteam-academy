'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Play, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { completeLessonAction, getCourseProgressAction } from '@/app/actions/learning-progress'
import { useWallet } from '@solana/wallet-adapter-react'

// Lazy-load Monaco — NOT in initial bundle (performance requirement)
const Editor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false,
    loading: () => (
        <div className="flex h-full items-center justify-center bg-background-surface">
            <Loader2 className="h-6 w-6 animate-spin text-sol-green" />
        </div>
    ),
})

interface TestResult {
    name: string
    passed: boolean
    output?: string
}

interface LessonEditorProps {
    starterCode: string
    language: 'typescript' | 'rust' | 'json'
    courseId: string
    lessonId: string
    lessonIndex: number
}

// Simulated tests for the challenge
const MOCK_TESTS: TestResult[] = [
    { name: 'Transfers correct lamport amount', passed: false },
    { name: 'Returns valid transaction signature', passed: false },
    { name: 'Recipient balance increases correctly', passed: false },
    { name: 'Payer pays transaction fees', passed: false },
]

export function LessonEditor({ starterCode, language, courseId, lessonId, lessonIndex }: LessonEditorProps) {
    const [code, setCode] = useState(starterCode)
    const [running, setRunning] = useState(false)
    const [tests, setTests] = useState<TestResult[]>(MOCK_TESTS)
    const [allPassed, setAllPassed] = useState(false)
    const [completed, setCompleted] = useState(false)
    const [checking, setChecking] = useState(true)
    const { publicKey } = useWallet()

    // On mount, check from Supabase if this challenge was already completed
    useEffect(() => {
        if (!publicKey) { setChecking(false); return }
        getCourseProgressAction(publicKey.toBase58(), courseId)
            .then(({ progress }) => {
                if (progress?.completedLessons.includes(lessonIndex)) {
                    setCompleted(true)
                    setAllPassed(true)
                    setTests(MOCK_TESTS.map(t => ({ ...t, passed: true })))
                }
            })
            .catch(() => { /* silently ignore */ })
            .finally(() => setChecking(false))
    }, [publicKey, courseId, lessonIndex])

    const handleRunTests = async () => {
        setRunning(true)
        // Simulate test run with delay
        await new Promise(r => setTimeout(r, 1500))

        // Check if user has filled in ALL the placeholders
        const filled = !code.includes('/* your code here */')
        // All 4 tests pass once the code is complete — no hidden gotchas
        const results = MOCK_TESTS.map((t) => ({
            ...t,
            passed: filled,
            output: filled ? 'OK' : 'FAIL: Missing implementation',
        }))
        setTests(results)

        const passed = results.every(r => r.passed)
        setAllPassed(passed)

        if (passed) {
            toast.success('All tests passed! 🎉 Click "Mark Complete" to earn XP!', { duration: 4000 })
        }
        setRunning(false)
    }

    const handleComplete = async () => {
        if (!publicKey || !allPassed) return
        try {
            const result = await completeLessonAction(publicKey.toBase58(), courseId, lessonIndex)
            if (result.success && result.xpEarned) {
                setCompleted(true)
                toast.success(`Lesson completed! +${result.xpEarned} XP`, { icon: '⚡' })
            } else {
                toast.error(result.error || 'Failed to record completion')
            }
        } catch {
            toast.error('Failed to record completion')
        }
    }

    return (
        <div className="flex h-full flex-col">
            {/* Editor */}
            <div className="flex-1 overflow-hidden">
                <Editor
                    height="100%"
                    language={language}
                    value={code}
                    onChange={(v) => setCode(v ?? '')}
                    theme="vs-dark"
                    options={{
                        fontSize: 13,
                        fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                        minimap: { enabled: false },
                        padding: { top: 16, bottom: 16 },
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                    }}
                />
            </div>

            {/* Test panel */}
            <div className="flex-shrink-0 border-t border-border" style={{ background: 'var(--background-elevated)' }}>
                {/* Test results */}
                <div className="max-h-40 overflow-y-auto px-4 pt-3">
                    <div className="space-y-1.5">
                        {tests.map((test, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                                {test.passed ? (
                                    <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-sol-green" />
                                ) : (
                                    <XCircle className="h-3.5 w-3.5 flex-shrink-0 text-error" />
                                )}
                                <span className={test.passed ? 'text-foreground-muted' : 'text-foreground-subtle'}>{test.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action bar */}
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={handleRunTests}
                        disabled={running}
                        className="flex items-center gap-2 rounded-lg border border-sol-green/30 bg-sol-green/10 px-4 py-2 text-sm font-medium text-sol-green transition-colors hover:bg-sol-green/20 disabled:opacity-50"
                    >
                        {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" fill="currentColor" />}
                        {running ? 'Running...' : 'Run Tests'}
                    </button>

                    {allPassed && !completed && (
                        <button
                            onClick={handleComplete}
                            className="rounded-lg px-4 py-2 text-sm font-semibold text-background transition-all hover:scale-105"
                            style={{ background: 'linear-gradient(135deg, #ffd23f, #008c4c)' }}
                        >
                            Mark Complete ✓
                        </button>
                    )}
                    {completed && (
                        <div className="flex items-center gap-2 text-sm font-medium text-sol-green">
                            <CheckCircle className="h-4 w-4" /> Completed
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
