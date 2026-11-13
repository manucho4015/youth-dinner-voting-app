import type { categories, nominees } from '../db/schema'
import type { getVoterHome, getVotingCategory } from '../server/voting'

export type Category = typeof categories.$inferSelect
export type Nominee = typeof nominees.$inferSelect

export type HomeCategory = Awaited<
    ReturnType<typeof getVoterHome>
>['categories'][number]

export type VotingData = NonNullable<
    Awaited<ReturnType<typeof getVotingCategory>>
>