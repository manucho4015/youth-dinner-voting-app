import { Link } from '@tanstack/react-router'
import type { CategoryStatus } from '../../lib/status'
import type { HomeCategory } from '../../lib/types'
import { CountdownBadge } from '../CountdownBadge'

type Props = {
    category: HomeCategory
    status: CategoryStatus
    now: number
}

export function CategoryTicket({ category, status, now }: Props) {
    const clickable = status === 'open' || category.hasVoted
    const highlight = status === 'open' && !category.hasVoted

    const ticket = (
        <div
            className={`flex overflow-hidden rounded-2xl border bg-night-900/80 transition ${highlight
                ? 'border-gold-400/50 shadow-[0_0_24px_rgba(245,183,0,0.15)] active:scale-[0.98]'
                : 'border-white/10'
                } ${status === 'closed' && !category.hasVoted ? 'opacity-60' : ''}`}
        >
            <div className="min-w-0 flex-1 p-5">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/50">
                    {category.type === 'individual'
                        ? '👤 Individual award'
                        : '🏢 Department award'}
                </span>
                <h3 className="mt-1 font-display text-xl font-extrabold text-white">
                    {category.title}
                </h3>
                {category.description && (
                    <p className="mt-1 text-sm text-white/60">{category.description}</p>
                )}
            </div>

            <div className="flex w-32 shrink-0 flex-col items-center justify-center gap-2 border-l-2 border-dashed border-white/15 p-3 text-center">
                {category.hasVoted ? (
                    <span className="-rotate-6 rounded-md border-2 border-party-teal px-2 py-1 font-display text-sm font-extrabold tracking-wide text-party-teal">
                        VOTED ✓
                    </span>
                ) : (
                    <>
                        <CountdownBadge
                            status={status}
                            opensAt={category.opensAt}
                            closesAt={category.closesAt}
                            now={now}
                        />
                        {status === 'open' && (
                            <span className="font-display text-sm font-bold text-gold-400">
                                Vote →
                            </span>
                        )}
                    </>
                )}
            </div>
        </div>
    )

    if (!clickable) return ticket

    return (
        <Link
            to="/vote/$categoryId"
            params={{ categoryId: category.id }}
            className="block"
        >
            {ticket}
        </Link>
    )
}