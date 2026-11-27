import { useCountUp } from '../../hooks/useCountUp'

type Props = {
    votes: number
    totalVotes: number
}

function formatPercent(value: number) {
    return value.toFixed(1).replace(/\.0$/, '')
}

export function VoteTally({ votes, totalVotes }: Props) {
    const percent =
        totalVotes > 0 ? Math.round((votes / totalVotes) * 1000) / 10 : 0
    const value = useCountUp(percent, 1400, 1)

    return (
        <div className="flex flex-col items-center leading-none">
            <span className="font-display text-2xl font-extrabold tabular-nums sm:text-5xl">
                {formatPercent(value)}%
            </span>
            <span className="mt-1 text-xs font-semibold opacity-60 sm:text-sm">
                {votes} {votes === 1 ? 'vote' : 'votes'}
            </span>
        </div>
    )
}