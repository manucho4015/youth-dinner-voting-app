import { useEffect, useRef, useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { castVote } from '../server/voting'
import { fireVoteConfetti } from '../lib/confetti'
import { formatCountdown, getStatus } from '../lib/status'
import { useServerNow } from '../hooks/useServerNow'
import type { VotingData } from '../lib/types'
import { NomineeAvatar } from './NomineeAvatar'
import { NomineeChoiceCard } from './NomineeChoiceCard'

export function VotePage({ data }: { data: VotingData }) {
    const router = useRouter()
    const { category, nominees, votedNominee, status } = data
    const now = useServerNow(data.serverNow)
    const liveStatus = getStatus(category.opensAt, category.closesAt, now)

    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [confirming, setConfirming] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const refreshedFor = useRef('')

    // When the clock crosses opens/closes, reload so the page matches the server
    useEffect(() => {
        if (liveStatus === status) return
        const key = `${status}>${liveStatus}`
        if (refreshedFor.current === key) return
        refreshedFor.current = key
        void router.invalidate()
    }, [liveStatus, status, router])

    const selected = nominees.find((n) => n.id === selectedId) ?? null

    async function handleConfirm() {
        if (!selected || submitting) return
        setSubmitting(true)
        setError('')
        try {
            const res = await castVote({
                data: { categoryId: category.id, nomineeId: selected.id },
            })
            if (res.ok) await fireVoteConfetti()
            await router.invalidate()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
            setConfirming(false)
            await router.invalidate()
        } finally {
            setSubmitting(false)
        }
    }

    const showVoteBar = status === 'open' && !votedNominee && nominees.length > 0

    return (
        <main className="mx-auto max-w-3xl px-5 pb-44 pt-8">
            <Link to="/" className="text-sm text-white/60 hover:text-white">
                ← All categories
            </Link>

            <header className="mb-8 mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                    {category.type === 'individual'
                        ? '👤 Individual award'
                        : '🏢 Department award'}
                </p>
                <h1 className="font-display text-3xl font-extrabold text-gold-400">
                    {category.title}
                </h1>
                {category.description && (
                    <p className="mt-1 text-white/70">{category.description}</p>
                )}
            </header>

            {votedNominee ? (
                <div className="rounded-3xl border border-party-teal/40 bg-night-900/80 p-8 text-center">
                    <div className="text-5xl">🔒</div>
                    <h2 className="mt-3 font-display text-2xl font-extrabold text-party-teal">
                        Vote locked in!
                    </h2>
                    <div className="mt-6 flex justify-center">
                        <NomineeAvatar
                            name={votedNominee.name}
                            type={votedNominee.type}
                            imageUrl={votedNominee.imageUrl}
                            className="h-32 w-32"
                        />
                    </div>
                    <p className="mt-4 font-display text-xl font-bold text-white">
                        {votedNominee.name}
                    </p>
                    <p className="mt-2 text-sm text-white/60">
                        Results stay secret until the big reveal at the dinner. 🎉
                    </p>
                    <Link
                        to="/"
                        className="mt-6 inline-block rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-5 py-2 font-display font-bold text-night-950"
                    >
                        Back to categories
                    </Link>
                </div>
            ) : status === 'upcoming' ? (
                <div className="rounded-3xl border border-party-teal/30 bg-night-900/80 p-8 text-center">
                    <div className="text-5xl">🎬</div>
                    <h2 className="mt-3 font-display text-2xl font-extrabold text-white">
                        Not open yet
                    </h2>
                    <p className="mt-2 font-display text-3xl font-extrabold text-party-teal">
                        {formatCountdown(new Date(category.opensAt).getTime() - now)}
                    </p>
                    <p className="mt-2 text-sm text-white/60">until voting opens</p>
                </div>
            ) : status === 'closed' ? (
                <div className="rounded-3xl border border-white/10 bg-night-900/80 p-8 text-center">
                    <div className="text-5xl">🔒</div>
                    <h2 className="mt-3 font-display text-2xl font-extrabold text-white">
                        Voting has closed
                    </h2>
                    <p className="mt-2 text-sm text-white/60">
                        See you at the dinner for the big reveal!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {nominees.map((nominee) => (
                        <NomineeChoiceCard
                            key={nominee.id}
                            name={nominee.name}
                            type={nominee.type}
                            imageUrl={nominee.imageUrl}
                            selected={nominee.id === selectedId}
                            onSelect={() => {
                                setSelectedId(nominee.id)
                                setConfirming(false)
                            }}
                        />
                    ))}
                </div>
            )}

            {showVoteBar && (
                <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-night-950/90 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
                    <div className="mx-auto max-w-3xl">
                        {error && <p className="mb-2 text-sm text-party-pink">{error}</p>}

                        {!confirming ? (
                            <button
                                type="button"
                                disabled={!selected}
                                onClick={() => setConfirming(true)}
                                className="w-full rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-4 py-3 font-display text-lg font-bold text-night-950 transition active:scale-95 disabled:opacity-40"
                            >
                                {selected ? `Vote for ${selected.name}` : 'Pick your favorite'}
                            </button>
                        ) : (
                            <div>
                                <p className="mb-3 text-center text-sm text-white/80">
                                    Lock in{' '}
                                    <span className="font-bold text-gold-300">
                                        {selected?.name}
                                    </span>
                                    ? Votes are final.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setConfirming(false)}
                                        disabled={submitting}
                                        className="flex-1 rounded-xl border border-white/20 px-4 py-3 text-white/80 transition active:scale-95"
                                    >
                                        Go back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirm}
                                        disabled={submitting}
                                        className="flex-[2] rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-4 py-3 font-display text-lg font-bold text-night-950 transition active:scale-95 disabled:opacity-60"
                                    >
                                        {submitting ? 'Locking in…' : 'Lock it in 🔒'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    )
}