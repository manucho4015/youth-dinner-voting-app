import { createServerFn } from '@tanstack/react-start'
import { asc, eq } from 'drizzle-orm'
import { db } from '../db'
import { categories } from '../db/schema'
import { requireAdmin } from './admin-guard.server'

type CategoryInput = {
    title: string
    description?: string
    type: 'individual' | 'department'
    opensAt: string // ISO string
    closesAt: string // ISO string
    sortOrder: number
}

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireUuid(value: unknown) {
    if (typeof value !== 'string' || !UUID_RE.test(value)) {
        throw new Error('Invalid id')
    }
    return value
}

function parseCategory(data: CategoryInput) {
    const title = data?.title?.trim()
    if (!title || title.length > 120) {
        throw new Error('Title is required (max 120 characters)')
    }
    if (data.type !== 'individual' && data.type !== 'department') {
        throw new Error('Invalid category type')
    }
    const opensAt = new Date(data.opensAt)
    const closesAt = new Date(data.closesAt)
    if (Number.isNaN(opensAt.getTime()) || Number.isNaN(closesAt.getTime())) {
        throw new Error('Invalid dates')
    }
    if (closesAt <= opensAt) {
        throw new Error('Closing time must be after opening time')
    }
    return {
        title,
        description: data.description?.trim() || null,
        type: data.type,
        opensAt,
        closesAt,
        sortOrder: Number.isFinite(data.sortOrder) ? Math.trunc(data.sortOrder) : 0,
    }
}

export const listCategories = createServerFn({ method: 'GET' }).handler(
    async () => {
        await requireAdmin()
        return db
            .select()
            .from(categories)
            .orderBy(asc(categories.sortOrder), asc(categories.opensAt))
    },
)

export const createCategory = createServerFn({ method: 'POST' })
    .validator((data: CategoryInput) => parseCategory(data))
    .handler(async ({ data }) => {
        await requireAdmin()
        const [row] = await db.insert(categories).values(data).returning()
        return row
    })

export const updateCategory = createServerFn({ method: 'POST' })
    .validator((data: CategoryInput & { id: string }) => ({
        id: requireUuid(data?.id),
        ...parseCategory(data),
    }))
    .handler(async ({ data }) => {
        await requireAdmin()
        const { id, ...values } = data
        await db.update(categories).set(values).where(eq(categories.id, id))
        return { ok: true as const }
    })

export const deleteCategory = createServerFn({ method: 'POST' })
    .validator((data: { id: string }) => ({ id: requireUuid(data?.id) }))
    .handler(async ({ data }) => {
        await requireAdmin()
        await db.delete(categories).where(eq(categories.id, data.id))
        return { ok: true as const }
    })