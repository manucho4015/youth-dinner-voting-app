import type { RevealResult } from '../../lib/types'
import { NomineeAvatar } from '../NomineeAvatar'
import { VoteTally } from './VoteTally'

type Tier = RevealResult['tiers'][number]

// Classic podium order: 2nd, 1st, 3rd
const slots = [2, 1, 3] as const

const blockStyle = {
    1: 'h-44 sm:h-60 bg-gradient-to-b from-gold-300 to-gold-500',
    2: 'h-36 sm:h-48 bg-gradient-to-b from-slate-200 to-slate-400',
    3: 'h-28 sm:h-36 bg-gradient-to-b from-orange-300 to-orange-600',
} as const

const medals = { 1: '🥇', 2: '🥈', 3: '🥉' } as const

type Props = {
    tiers: Tier[]
    shown: number // how many steps have been revealed so far (from the bottom)
    totalVotes: number
}

export function Podium({ tiers, shown, totalVotes }: Props) {
    const firstVisibleIndex = tiers.length - shown

    return (
        <div className="mx-auto flex w-full max-w-4xl items-end gap-2 sm:gap-4">
            {slots.map((rank) => {
                const index = tiers.findIndex((t) => t.rank === rank)
                if (index === -1) return <div key={rank} className="flex-1" />

                const tier = tiers[index]
                const revealed = index >= firstVisibleIndex
                const big = rank === 1

                return (
                    <div
                        key={rank}
                        className="flex min-w-0 flex-1 flex-col items-center justify-end gap-3"
                    >
                        {revealed ? (
                            <div className="flex animate-rise flex-col items-center gap-2 motion-reduce:animate-none">
                                {tier.nominees.length > 1 && (
                                    <span className="rounded-full bg-party-pink/20 px-3 py-1 text-xs font-bold text-party-pink">
                                        It's a tie! 🤝
                                    </span>
                                )}
                                <div className="flex flex-wrap justify-center gap-3">
                                    {tier.nominees.map((n) => (
                                        <div
                                            key={n.id}
                                            className="flex w-24 flex-col items-center gap-2 text-center sm:w-36"
                                        >
                                            <NomineeAvatar
                                                name={n.name}
                                                type={n.type}
                                                imageUrl={n.imageUrl}
                                                className={
                                                    big
                                                        ? 'h-24 w-24 sm:h-32 sm:w-32'
                                                        : 'h-20 w-20 sm:h-24 sm:w-24'
                                                }
                                            />
                                            <span className="font-display text-base font-bold leading-tight text-white sm:text-xl">
                                                {n.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-24 sm:h-32" />
                        )}

                        <div
                            className={`flex w-full flex-col items-center justify-center gap-1 rounded-t-2xl text-night-950 ${blockStyle[rank]} ${revealed ? '' : 'opacity-25'
                                }`}
                        >
                            <span className="text-3xl sm:text-4xl">{medals[rank]}</span>
                            {revealed ? (
                                <VoteTally votes={tier.votes} totalVotes={totalVotes} />
                            ) : (
                                <span className="font-display text-3xl font-extrabold">?</span>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}