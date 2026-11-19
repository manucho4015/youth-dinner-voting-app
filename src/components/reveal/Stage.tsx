import { useEffect, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { revealCategory } from '../../server/admin-reveal'
import { fireWinnerConfetti } from '../../lib/confetti'
import type { RevealCategory, RevealResult } from '../../lib/types'
import { Podium } from './Podium'

type Phase = 'ready' | 'loading' | 'countdown' | 'show' | 'empty'

type Props = {
    category: RevealCategory
    onClose: () => void
}

export function RevealStage({ category, onClose }: Props) {
    const router = useRouter()
    const [phase, setPhase] = useState<Phase>('ready')
    const [result, setResult] = useState<RevealResult | null>(null)
    const [count, setCount] = useState(3)
    const [shown, setShown] = useState(0)
    const [error, setError] = useState('')
    const [stillOpen, setStillOpen] = useState(category.status === 'open')

    const total = result?.tiers.length ?? 0
    const finished = phase === 'show' && total > 0 && shown >= total

    async function handleReveal() {
        setError('')
        setPhase('loading')
        try {
            const res = await revealCategory({ data: { categoryId: category.id } })
            setResult(res)
            setStillOpen(false)
            setShown(0)
            setCount(3)
            setPhase(res.tiers.length === 0 ? 'empty' : 'countdown')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
            setPhase('ready')
        }
    }

    // 3... 2... 1...
    useEffect(() => {
        if (phase !== 'countdown') return
        if (count === 0) {
            setPhase('show')
            return
        }
        const id = setTimeout(() => setCount((c) => c - 1), 1000)
        return () => clearTimeout(id)
    }, [phase, count])

    // Podium steps appear from the bottom up, with a longer pause before 1st
    useEffect(() => {
        if (phase !== 'show' || total === 0 || shown >= total) return
        const wait = shown === 0 ? 400 : shown === total - 1 ? 3500 : 2500
        const id = setTimeout(() => setShown((s) => s + 1), wait)
        return () => clearTimeout(id)
    }, [phase, shown, total])

    // Winner is in: gold confetti
    useEffect(() => {
        if (finished) void fireWinnerConfetti()
    }, [finished])

    function handleClose() {
        void router.invalidate()
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-night-950/95 backdrop-blur">
            <button
                onClick={handleClose}
                className="absolute right-4 top-4 rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white/60 transition hover:text-white"
            >
                ✕ Close
            </button>

            <div className="mx-auto flex min-h-full max-w-4xl flex-col items-center justify-center px-5 py-16 text-center">
                <p className="text-sm font-semibold uppercase tracking-widest text-white/50">
                    {category.type === 'individual'
                        ? '👤 Individual award'
                        : '🏢 Department award'}
                </p>
                <h1 className="mt-2 font-display text-4xl font-extrabold text-gold-400 sm:text-6xl">
                    {category.title}
                </h1>

                {(phase === 'ready' || phase === 'loading') && (
                    <div className="mt-12">
                        <div className="text-7xl">🥁</div>
                        <p className="mt-4 text-xl text-white/70">The votes are in…</p>
                        {stillOpen && (
                            <p className="mx-auto mt-6 max-w-md rounded-xl border border-party-pink/40 bg-party-pink/10 px-4 py-3 text-sm text-party-pink">
                                Voting is still open. Revealing now will close it immediately.
                            </p>
                        )}
                        <button
                            onClick={handleReveal}
                            disabled={phase === 'loading'}
                            className="mt-8 rounded-2xl bg-gradient-to-r from-gold-400 to-gold-500 px-10 py-4 font-display text-2xl font-extrabold text-night-950 transition active:scale-95 disabled:opacity-60"
                        >
                            {phase === 'loading'
                                ? 'Counting…'
                                : stillOpen
                                    ? 'Close voting & reveal 🥁'
                                    : 'Reveal results 🥁'}
                        </button>
                        {category.revealed && (
                            <p className="mt-4 text-sm text-white/40">
                                Already revealed once, so this will replay it.
                            </p>
                        )}
                        {error && <p className="mt-4 text-party-pink">{error}</p>}
                    </div>
                )}

                {phase === 'countdown' && count > 0 && (
                    <div
                        key={count}
                        className="mt-12 animate-pop font-display text-[10rem] font-extrabold leading-none text-party-pink motion-reduce:animate-none sm:text-[14rem]"
                    >
                        {count}
                    </div>
                )}

                {phase === 'empty' && (
                    <div className="mt-12">
                        <div className="text-6xl">🦗</div>
                        <p className="mt-4 text-xl text-white/70">
                            No votes were cast in this category.
                        </p>
                    </div>
                )}

                {phase === 'show' && result && (
                    <div className="mt-10 w-full">
                        <Podium tiers={result.tiers} shown={shown} />

                        {finished && (
                            <div className="mt-10 animate-rise motion-reduce:animate-none">
                                <p className="text-white/60">
                                    {result.totalVotes} {result.totalVotes === 1 ? 'vote' : 'votes'} cast
                                </p>
                                <div className="mt-4 flex justify-center gap-3">
                                    <button
                                        onClick={() => setPhase('ready')}
                                        className="rounded-xl border border-white/20 px-5 py-2 text-white/80 transition active:scale-95"
                                    >
                                        Replay
                                    </button>
                                    <button
                                        onClick={handleClose}
                                        className="rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-5 py-2 font-display font-bold text-night-950 transition active:scale-95"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}