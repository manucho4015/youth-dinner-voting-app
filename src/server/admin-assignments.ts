import { createServerFn } from '@tanstack/react-start'
import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../db'
import { categories, categoryNominees, nominees, votes } from '../db/schema'
import { requireAdmin } from './admin-guard.server'

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireUuid(value: unknown) {
    if (typeof value !== 'string' || !UUID_RE.test(value)) {
        throw new Error('Invalid id')
    }
    return value
}

export const setCategoryNominees = createServerFn({ method: 'POST' })
    .validator((data: { categoryId: string; nomineeIds: string[] }) => {
        if (!Array.isArray(data?.nomineeIds) || data.nomineeIds.length > 500) {
            throw new Error('Invalid nominees')
        }
        return {
            categoryId: requireUuid(data.categoryId),
            nomineeIds: [...new Set(data.nomineeIds.map(requireUuid))],
        }
    })
    .handler(async ({ data }) => {
        await requireAdmin()

        const [category] = await db
            .select()
            .from(categories)
            .where(eq(categories.id, data.categoryId))
        if (!category) throw new Error('Category not found')

        // Individuals only go in individual categories, departments in department ones
        if (data.nomineeIds.length > 0) {
            const rows = await db
                .select({ id: nominees.id, type: nominees.type })
                .from(nominees)
                .where(inArray(nominees.id, data.nomineeIds))
            if (
                rows.length !== data.nomineeIds.length ||
                rows.some((r) => r.type !== category.type)
            ) {
                throw new Error('Nominee type does not match category type')
            }
        }

        // Don't let anyone who already received votes be removed from the category
        const current = await db
            .select({ nomineeId: categoryNominees.nomineeId })
            .from(categoryNominees)
            .where(eq(categoryNominees.categoryId, category.id))
        const keep = new Set(data.nomineeIds)
        const removed = current
            .map((c) => c.nomineeId)
            .filter((id) => !keep.has(id))

        if (removed.length > 0) {
            const voted = await db
                .select({ name: nominees.name })
                .from(votes)
                .innerJoin(nominees, eq(votes.nomineeId, nominees.id))
                .where(
                    and(
                        eq(votes.categoryId, category.id),
                        inArray(votes.nomineeId, removed),
                    ),
                )
                .groupBy(nominees.id, nominees.name)
            if (voted.length > 0) {
                throw new Error(
                    `Can't remove ${voted.map((v) => v.name).join(', ')}: already received votes in this category`,
                )
            }
        }

        const clear = db
            .delete(categoryNominees)
            .where(eq(categoryNominees.categoryId, category.id))

        if (data.nomineeIds.length === 0) {
            await clear
        } else {
            await db.batch([
                clear,
                db.insert(categoryNominees).values(
                    data.nomineeIds.map((nomineeId) => ({
                        categoryId: category.id,
                        nomineeId,
                    })),
                ),
            ])
        }

        return { ok: true as const, count: data.nomineeIds.length }
    })