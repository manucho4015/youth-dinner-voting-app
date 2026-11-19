import { useState } from 'react'
import { formatEat } from '../../lib/time'
import type { RevealCategory } from '../../lib/types'
import { RevealStage } from './Stage'

export function RevealList({ categories }: { categories: RevealCategory[] }) {
    const [activeId, setActiveId] = useState<string | null>(null)
    const active = categories.find((c) => c.id === activeId) ?? null

    if (categories.length === 0) {
        return <p className="text-white/60">No categories yet.</p>
    }

    return (
        <>
            <div className="space-y-4">
                {categories.map((c) => (
                    <div
                        key={c.id}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-night-900/80 p-5"
                    >
                        <div className="min-w-0">
                            <h3 className="truncate font-display text-xl font-bold text-white">
                                {c.type === 'individual' ? '👤' : '🏢'} {c.title}
                            </h3>
                            <p className="mt-1 text-sm text-white/60">
                                {c.nomineeCount} nominees · {c.totalVotes} votes ·{' '}
                                {c.status === 'closed'
                                    ? `closed ${formatEat(c.closesAt)}`
                                    : c.status === 'open'
                                        ? `closes ${formatEat(c.closesAt)}`
                                        : 'not open yet'}
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                            {c.status === 'upcoming' ? (
                                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/60">
                                    Upcoming
                                </span>
                            ) : (
                                <>
                                    {c.status === 'open' && (
                                        <span className="rounded-full bg-party-pink/15 px-3 py-1 text-xs font-semibold text-party-pink">
                                            Voting open
                                        </span>
                                    )}
                                    {c.revealed && (
                                        <span className="rounded-full bg-party-teal/15 px-3 py-1 text-xs font-semibold text-party-teal">
                                            Revealed ✓
                                        </span>
                                    )}
                                    <button
                                        onClick={() => setActiveId(c.id)}
                                        className={
                                            c.revealed && c.status === 'closed'
                                                ? 'rounded-xl border border-white/20 px-4 py-2 text-sm text-white/80 transition active:scale-95'
                                                : 'rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-4 py-2 font-display font-bold text-night-950 transition active:scale-95'
                                        }
                                    >
                                        {c.status === 'open'
                                            ? 'Close & reveal 🥁'
                                            : c.revealed
                                                ? 'Replay'
                                                : 'Reveal 🥁'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {active && (
                <RevealStage category={active} onClose={() => setActiveId(null)} />
            )}
        </>
    )
}