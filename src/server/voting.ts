import { createServerFn } from '@tanstack/react-start'
import { and, asc, count, eq, gt, lte, sql } from 'drizzle-orm'
import { db } from '../db'
import { categories, categoryNominees, nominees, votes } from '../db/schema'
import { getStatus } from '../lib/status'
import { requireVoter } from './voter-guard.server'

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireUuid(value: unknown) {
    if (typeof value !== 'string' || !UUID_RE.test(value)) {
        throw new Error('Invalid id')
    }
    return value
}

// Random order per load so nobody benefits from being first in the list
function shuffle<T>(items: T[]) {
    const copy = [...items]
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
}

export const getVoterHome = createServerFn({ method: 'GET' }).handler(
    async () => {
        const voterId = await requireVoter()

        const [rows, myVotes, nomineeCounts] = await Promise.all([
            db
                .select()
                .from(categories)
                .orderBy(asc(categories.sortOrder), asc(categories.opensAt)),
            db
                .select({ categoryId: votes.categoryId })
                .from(votes)
                .where(eq(votes.voterId, voterId)),
            db
                .select({ categoryId: categoryNominees.categoryId, total: count() })
                .from(categoryNominees)
                .groupBy(categoryNominees.categoryId),
        ])

        const votedIds = new Set(myVotes.map((v) => v.categoryId))
        const totals = new Map(nomineeCounts.map((c) => [c.categoryId, c.total]))

        return {
            serverNow: Date.now(),
            categories: rows
                // Hide categories that have no nominees yet
                .filter((c) => (totals.get(c.id) ?? 0) > 0)
                .map((c) => ({
                    id: c.id,
                    title: c.title,
                    description: c.description,
                    type: c.type,
                    opensAt: c.opensAt.toISOString(),
                    closesAt: c.closesAt.toISOString(),
                    hasVoted: votedIds.has(c.id),
                })),
        }
    },
)

export const getVotingCategory = createServerFn({ method: 'GET' })
    .validator((data: { categoryId: string }) => ({
        categoryId: requireUuid(data?.categoryId),
    }))
    .handler(async ({ data }) => {
        const voterId = await requireVoter()

        const [category] = await db
            .select()
            .from(categories)
            .where(eq(categories.id, data.categoryId))
        if (!category) return null

        const now = Date.now()
        const status = getStatus(category.opensAt, category.closesAt, now)

        const [myVote] = await db
            .select({ nomineeId: votes.nomineeId })
            .from(votes)
            .where(
                and(eq(votes.categoryId, category.id), eq(votes.voterId, voterId)),
            )

        let votedNominee: {
            id: string
            name: string
            type: 'individual' | 'department'
            imageUrl: string | null
        } | null = null

        if (myVote) {
            const [row] = await db
                .select({
                    id: nominees.id,
                    name: nominees.name,
                    type: nominees.type,
                    imageUrl: nominees.imageUrl,
                })
                .from(nominees)
                .where(eq(nominees.id, myVote.nomineeId))
            votedNominee = row ?? null
        }

        // Nominees are only sent while voting is open and the voter hasn't voted
        const nomineeList =
            status === 'open' && !votedNominee
                ? shuffle(
                    await db
                        .select({
                            id: nominees.id,
                            name: nominees.name,
                            type: nominees.type,
                            imageUrl: nominees.imageUrl,
                        })
                        .from(categoryNominees)
                        .innerJoin(nominees, eq(categoryNominees.nomineeId, nominees.id))
                        .where(eq(categoryNominees.categoryId, category.id)),
                )
                : []

        return {
            serverNow: now,
            status,
            category: {
                id: category.id,
                title: category.title,
                description: category.description,
                type: category.type,
                opensAt: category.opensAt.toISOString(),
                closesAt: category.closesAt.toISOString(),
            },
            nominees: nomineeList,
            votedNominee,
        }
    })

export const castVote = createServerFn({ method: 'POST' })
    .validator((data: { categoryId: string; nomineeId: string }) => ({
        categoryId: requireUuid(data?.categoryId),
        nomineeId: requireUuid(data?.nomineeId),
    }))
    .handler(async ({ data }) => {
        const voterId = await requireVoter()

        // Window check uses the database clock
        const [open] = await db
            .select({ id: categories.id })
            .from(categories)
            .where(
                and(
                    eq(categories.id, data.categoryId),
                    lte(categories.opensAt, sql`now()`),
                    gt(categories.closesAt, sql`now()`),
                ),
            )
        if (!open) throw new Error('Voting is not open for this category')

        const [link] = await db
            .select({ nomineeId: categoryNominees.nomineeId })
            .from(categoryNominees)
            .where(
                and(
                    eq(categoryNominees.categoryId, data.categoryId),
                    eq(categoryNominees.nomineeId, data.nomineeId),
                ),
            )
        if (!link) throw new Error('That nominee is not in this category')

        // The unique index (category_id, voter_id) makes a second vote a no-op
        const inserted = await db
            .insert(votes)
            .values({
                categoryId: data.categoryId,
                nomineeId: data.nomineeId,
                voterId,
            })
            .onConflictDoNothing()
            .returning({ id: votes.id })

        if (inserted.length === 0) {
            return { ok: false as const, reason: 'already' as const }
        }
        return { ok: true as const }
    })