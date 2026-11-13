import { formatCountdown } from '../lib/status'
import type { CategoryStatus } from '../lib/status'

type Props = {
    status: CategoryStatus
    opensAt: string
    closesAt: string
    now: number
}

export function CountdownBadge({ status, opensAt, closesAt, now }: Props) {
    if (status === 'closed') {
        return (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/60">
                Closed
            </span>
        )
    }

    const upcoming = status === 'upcoming'
    const target = new Date(upcoming ? opensAt : closesAt).getTime()
    const label = formatCountdown(target - now)

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${upcoming
                ? 'bg-party-teal/15 text-party-teal'
                : 'bg-party-pink/15 text-party-pink'
                }`}
        >
            {!upcoming && (
                <span className="h-2 w-2 animate-pulse rounded-full bg-party-pink" />
            )}
            {upcoming ? 'Opens in' : 'Closes in'} {label}
        </span>
    )
}