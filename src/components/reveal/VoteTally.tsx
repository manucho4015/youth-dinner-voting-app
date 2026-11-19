import { useCountUp } from '../../hooks/useCountUp'

export function VoteTally({ votes }: { votes: number }) {
    const value = useCountUp(votes)

    return (
        <span className="font-display text-3xl font-extrabold tabular-nums sm:text-4xl">
            {value}
            <span className="ml-1 text-base font-bold opacity-70">
                {votes === 1 ? 'vote' : 'votes'}
            </span>
        </span>
    )
}