import type { categories, nominees } from '../db/schema'
import type { getVoterHome, getVotingCategory } from '../server/voting'
import type { getRevealOverview, revealCategory } from '../server/admin-reveal'

export type Category = typeof categories.$inferSelect
export type Nominee = typeof nominees.$inferSelect

export type HomeCategory = Awaited<
    ReturnType<typeof getVoterHome>
>['categories'][number]

export type VotingData = NonNullable<
    Awaited<ReturnType<typeof getVotingCategory>>
>

export type RevealCategory = Awaited<
    ReturnType<typeof getRevealOverview>
>['categories'][number]

export type RevealResult = Awaited<ReturnType<typeof revealCategory>>