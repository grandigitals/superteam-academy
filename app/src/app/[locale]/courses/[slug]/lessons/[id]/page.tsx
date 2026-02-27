import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

// Heavy Monaco editor — only loaded on lesson pages, never in initial bundle
const LessonEditor = dynamic(
    () => import('@/components/lesson/LessonEditor').then(m => m.LessonEditor),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full items-center justify-center bg-background-surface">
                <Loader2 className="h-6 w-6 animate-spin text-sol-green" />
                <span className="ml-2 text-sm text-foreground-muted">Loading editor…</span>
            </div>
        ),
    }
)

const CompleteButton = dynamic(
    () => import('@/components/lesson/CompleteButton').then(m => m.CompleteButton),
    { ssr: false }
)

interface Props {
    params: Promise<{ locale: string; slug: string; id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    return { title: `Lesson ${id}` }
}

const LESSON_CONTENT: Record<string, { title: string; content: string; type: string; starterCode?: string }> = {
    l1: {
        title: 'What is Solana?',
        type: 'content',
        content: `## What is Solana?

Solana is a high-performance blockchain designed for decentralized applications and crypto-currencies. It achieves high throughput via a unique combination of innovations:

### Key Innovations

**Proof of History (PoH)** — A cryptographic clock that enables nodes to agree on the order of events without constant communication, enabling parallel transaction processing.

**Tower BFT** — A PoH-optimized version of Practical Byzantine Fault Tolerance (PBFT) consensus.

**Gulf Stream** — Mempool-less transaction forwarding protocol that pushes transactions to validators before the current block is confirmed.

**Sealevel** — Parallel smart contract runtime that scales horizontally across SSDs and GPUs.

### Core Concepts

- **Validators** — Nodes that process transactions and maintain the ledger
- **Clusters** — Groups of validators working together (Mainnet, Devnet, Testnet, Localnet)
- **Transactions** — Atomic units containing instructions to modify state
- **Accounts** — The fundamental data storage unit on Solana

\`\`\`rust
// Every account on Solana has these fields:
pub struct Account {
    pub lamports: u64,      // SOL balance (1 SOL = 1B lamports)
    pub data: Vec<u8>,       // Account state data
    pub owner: Pubkey,       // Program that owns this account
    pub executable: bool,    // Is this a program?
    pub rent_epoch: Epoch,   // Rent exemption tracking
}
\`\`\`
`,
    },
    l6: {
        title: 'Challenge: Build a Transfer',
        type: 'challenge',
        starterCode: `// Challenge: Send SOL from payer to recipient
// Fill in the transfer instruction

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

async function transferSOL(
  connection: Connection,
  payer: Keypair,
  recipient: PublicKey,
  amountSOL: number
): Promise<string> {
  // TODO: Create a transfer instruction
  const instruction = SystemProgram.transfer({
    fromPubkey: /* your code here */,
    toPubkey: /* your code here */,
    lamports: /* your code here */,
  });

  // TODO: Build and send the transaction
  const tx = new Transaction().add(instruction);
  const signature = await /* your code here */;
  
  return signature;
}`,
        content: `## Challenge: Build a Transfer Program

Your task is to complete the \`transferSOL\` function that sends SOL from one account to another.

### Requirements

1. Create a \`SystemProgram.transfer\` instruction with the correct parameters
2. Build a \`Transaction\` with that instruction
3. Send the transaction and return the signature

### Hints

- \`LAMPORTS_PER_SOL = 1_000_000_000\` (1 SOL = 1 billion lamports)
- Use \`sendAndConfirmTransaction\` to send and wait for confirmation
- The payer signs the transaction automatically when passed as a signer

### Test Cases

- ✓ Transfers the correct amount in lamports
- ✓ Returns a valid transaction signature (88 chars)
- ✓ Recipient balance increases by amountSOL
- ✓ Payer balance decreases by amountSOL + fees
`,
    },
}

export default async function LessonPage({ params }: Props) {
    const { slug, id } = await params
    const lesson = LESSON_CONTENT[id] ?? {
        title: `Lesson ${id}`,
        type: 'content',
        content: '# Coming Soon\n\nThis lesson content is being prepared.',
    }

    const isChallenge = lesson.type === 'challenge'

    return (
        <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden">
            {/* Top bar */}
            <div className="flex h-12 flex-shrink-0 items-center justify-between border-b border-border px-4" style={{ background: 'var(--background-elevated)' }}>
                <Link href={`/courses/${slug}`} className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-sol-green transition-colors">
                    <ArrowLeft className="h-4 w-4" /> {slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </Link>
                <div className="flex items-center gap-3">
                    <Link href={`/courses/${slug}/lessons/prev`} className="rounded-lg p-1 text-foreground-muted hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <span className="text-xs text-foreground-subtle">Lesson {id?.slice(1)}</span>
                    <Link href={`/courses/${slug}/lessons/next`} className="rounded-lg p-1 text-foreground-muted hover:text-foreground">
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>

            {/* Split layout */}
            <div className={`flex flex-1 overflow-hidden ${isChallenge ? 'flex-col md:flex-row' : ''}`}>
                {/* Content Panel */}
                <div className={`overflow-y-auto border-r border-border ${isChallenge ? 'w-full md:w-[50%]' : 'w-full max-w-3xl mx-auto'}`}>
                    <div className="prose prose-invert max-w-none p-8">
                        <h1 className="font-display text-2xl font-bold text-foreground mb-4">{lesson.title}</h1>
                        {/* Render markdown content as pre-formatted for now */}
                        <div className="text-foreground-muted leading-relaxed whitespace-pre-wrap text-sm font-mono">
                            {lesson.content}
                        </div>
                    </div>

                    {/* Complete button for content lessons */}
                    {!isChallenge && (
                        <div className="sticky bottom-0 border-t border-border p-4" style={{ background: 'var(--background-elevated)' }}>
                            <CompleteButton courseId={slug} lessonId={id} />
                        </div>
                    )}
                </div>

                {/* Editor Panel (challenge only) */}
                {isChallenge && (
                    <div className="flex w-full flex-col overflow-hidden md:w-[50%]">
                        <LessonEditor
                            starterCode={lesson.starterCode ?? ''}
                            language="typescript"
                            courseId={slug}
                            lessonId={id}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
