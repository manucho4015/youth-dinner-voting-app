import { createServerFn } from '@tanstack/react-start'
import { and, asc, count, desc, eq, lte, sql } from 'drizzle-orm'
import { db } from '../db'
import { categories, categoryNominees, nominees, votes } from '../db/schema'
import { getStatus } from '../lib/status'
import { requireAdmin } from './admin-guard.server'

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireUuid(value: unknown) {
    if (typeof value !== 'string' || !UUID_RE.test(value)) {
        throw new Error('Invalid id')
    }
    return value
}

// Overview only: turnout totals, never a per-nominee breakdown
export const getRevealOverview = createServerFn({ method: 'GET' }).handler(
    async () => {
        await requireAdmin()

        const [rows, voteTotals, nomineeTotals] = await Promise.all([
            db
                .select()
                .from(categories)
                .orderBy(asc(categories.sortOrder), asc(categories.opensAt)),
            db
                .select({ categoryId: votes.categoryId, total: count() })
                .from(votes)
                .groupBy(votes.categoryId),
            db
                .select({ categoryId: categoryNominees.categoryId, total: count() })
                .from(categoryNominees)
                .groupBy(categoryNominees.categoryId),
        ])

        const votesBy = new Map(voteTotals.map((v) => [v.categoryId, v.total]))
        const nomineesBy = new Map(nomineeTotals.map((n) => [n.categoryId, n.total]))
        const now = Date.now()

        return {
            categories: rows.map((c) => ({
                id: c.id,
                title: c.title,
                type: c.type,
                closesAt: c.closesAt.toISOString(),
                status: getStatus(c.opensAt, c.closesAt, now),
                revealed: c.revealedAt !== null,
                totalVotes: votesBy.get(c.id) ?? 0,
                nomineeCount: nomineesBy.get(c.id) ?? 0,
            })),
        }
    },
)

export const revealCategory = createServerFn({ method: 'POST' })
    .validator((data: { categoryId: string }) => ({
        categoryId: requireUuid(data?.categoryId),
    }))
    .handler(async ({ data }) => {
        await requireAdmin()

        // Voting must have opened (database clock). An open category is closed right now.
        const [category] = await db
            .select({
                id: categories.id,
                title: categories.title,
                type: categories.type,
            })
            .from(categories)
            .where(
                and(
                    eq(categories.id, data.categoryId),
                    lte(categories.opensAt, sql`now()`),
                ),
            )
        if (!category) {
            throw new Error("Category not found, or voting hasn't opened yet.")
        }

        // One atomic update: shut voting if still open, and mark as revealed
        await db
            .update(categories)
            .set({
                closesAt: sql`least(${categories.closesAt}, now())`,
                revealedAt: sql`coalesce(${categories.revealedAt}, now())`,
            })
            .where(eq(categories.id, category.id))

        const rows = await db
            .select({
                id: nominees.id,
                name: nominees.name,
                type: nominees.type,
                imageUrl: nominees.imageUrl,
                voteCount: count(votes.id),
            })
            .from(categoryNominees)
            .innerJoin(nominees, eq(categoryNominees.nomineeId, nominees.id))
            .leftJoin(
                votes,
                and(
                    eq(votes.nomineeId, nominees.id),
                    eq(votes.categoryId, categoryNominees.categoryId),
                ),
            )
            .where(eq(categoryNominees.categoryId, category.id))
            .groupBy(nominees.id, nominees.name, nominees.type, nominees.imageUrl)
            .orderBy(desc(count(votes.id)), asc(nominees.name))

        const totalVotes = rows.reduce((sum, r) => sum + r.voteCount, 0)

        // Podium steps: people tied on votes share a step; up to 3 steps
        const tiers: {
            rank: number
            votes: number
            nominees: {
                id: string
                name: string
                type: 'individual' | 'department'
                imageUrl: string | null
            }[]
        }[] = []

        for (const row of rows) {
            if (row.voteCount === 0) break
            const person = {
                id: row.id,
                name: row.name,
                type: row.type,
                imageUrl: row.imageUrl,
            }
            const last = tiers[tiers.length - 1]
            if (last && last.votes === row.voteCount) {
                last.nominees.push(person)
                continue
            }
            if (tiers.length === 3) break
            tiers.push({
                rank: tiers.length + 1,
                votes: row.voteCount,
                nominees: [person],
            })
        }

        return {
            category: { id: category.id, title: category.title, type: category.type },
            totalVotes,
            tiers,
        }
    })