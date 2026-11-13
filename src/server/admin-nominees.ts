import { createServerFn } from '@tanstack/react-start'
import { put, del } from '@vercel/blob'
import { asc, eq, inArray } from 'drizzle-orm'
import { db } from '../db'
import { categories, categoryNominees, nominees } from '../db/schema'
import { requireAdmin } from './admin-guard.server'

const MAX_IMAGE_BYTES = 4 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireUuid(value: unknown) {
    if (typeof value !== 'string' || !UUID_RE.test(value)) {
        throw new Error('Invalid id')
    }
    return value
}

function parseName(value: unknown) {
    const name = String(value ?? '').trim()
    if (!name || name.length > 120) {
        throw new Error('Name is required (max 120 characters)')
    }
    return name
}

type NomineeType = 'individual' | 'department'

function parseType(value: unknown): NomineeType {
    if (value !== 'individual' && value !== 'department') {
        throw new Error('Invalid nominee type')
    }
    return value
}

function parseImage(value: unknown) {
    return value instanceof File && value.size > 0 ? value : null
}

async function uploadImage(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Image must be a JPG, PNG or WebP')
    }
    if (file.size > MAX_IMAGE_BYTES) {
        throw new Error('Image must be under 4 MB')
    }
    const ext =
        file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    const blob = await put(`nominees/${crypto.randomUUID()}.${ext}`, file, {
        access: 'public',
    })
    return blob.url
}

async function removeBlob(url: string | null) {
    if (!url) return
    try {
        await del(url)
    } catch {
        // Best effort: an orphaned image is harmless
    }
}

export const getNomineesAdminData = createServerFn({ method: 'GET' }).handler(
    async () => {
        await requireAdmin()
        const [nomineeRows, categoryRows, links] = await Promise.all([
            db.select().from(nominees).orderBy(asc(nominees.name)),
            db
                .select()
                .from(categories)
                .orderBy(asc(categories.sortOrder), asc(categories.opensAt)),
            db.select().from(categoryNominees),
        ])
        return { nominees: nomineeRows, categories: categoryRows, links }
    },
)

export const createNominee = createServerFn({ method: 'POST' })
    .validator((data: FormData) => {
        if (!(data instanceof FormData)) throw new Error('Invalid form data')
        return {
            name: parseName(data.get('name')),
            type: parseType(data.get('type')),
            image: parseImage(data.get('image')),
        }
    })
    .handler(async ({ data }) => {
        await requireAdmin()
        const imageUrl = data.image ? await uploadImage(data.image) : null
        const [row] = await db
            .insert(nominees)
            .values({ name: data.name, type: data.type, imageUrl })
            .returning()
        return row
    })

export const updateNominee = createServerFn({ method: 'POST' })
    .validator((data: FormData) => {
        if (!(data instanceof FormData)) throw new Error('Invalid form data')
        return {
            id: requireUuid(data.get('id')),
            name: parseName(data.get('name')),
            image: parseImage(data.get('image')),
            removeImage: data.get('removeImage') === '1',
        }
    })
    .handler(async ({ data }) => {
        await requireAdmin()
        const [existing] = await db
            .select()
            .from(nominees)
            .where(eq(nominees.id, data.id))
        if (!existing) throw new Error('Nominee not found')

        let imageUrl = existing.imageUrl
        if (data.image) {
            imageUrl = await uploadImage(data.image)
        } else if (data.removeImage) {
            imageUrl = null
        }

        await db
            .update(nominees)
            .set({ name: data.name, imageUrl })
            .where(eq(nominees.id, data.id))

        if (imageUrl !== existing.imageUrl) await removeBlob(existing.imageUrl)
        return { ok: true as const }
    })

export const setNomineeCategories = createServerFn({ method: 'POST' })
    .validator((data: { nomineeId: string; categoryIds: string[] }) => {
        if (!Array.isArray(data?.categoryIds) || data.categoryIds.length > 50) {
            throw new Error('Invalid categories')
        }
        return {
            nomineeId: requireUuid(data.nomineeId),
            categoryIds: [...new Set(data.categoryIds.map(requireUuid))],
        }
    })
    .handler(async ({ data }) => {
        await requireAdmin()
        const [nominee] = await db
            .select()
            .from(nominees)
            .where(eq(nominees.id, data.nomineeId))
        if (!nominee) throw new Error('Nominee not found')

        if (data.categoryIds.length > 0) {
            const rows = await db
                .select({ id: categories.id, type: categories.type })
                .from(categories)
                .where(inArray(categories.id, data.categoryIds))
            if (
                rows.length !== data.categoryIds.length ||
                rows.some((r) => r.type !== nominee.type)
            ) {
                throw new Error('Nominee type does not match category type')
            }
        }

        const clear = db
            .delete(categoryNominees)
            .where(eq(categoryNominees.nomineeId, nominee.id))

        if (data.categoryIds.length === 0) {
            await clear
        } else {
            await db.batch([
                clear,
                db.insert(categoryNominees).values(
                    data.categoryIds.map((categoryId) => ({
                        categoryId,
                        nomineeId: nominee.id,
                    })),
                ),
            ])
        }
        return { ok: true as const }
    })

export const deleteNominee = createServerFn({ method: 'POST' })
    .validator((data: { id: string }) => ({ id: requireUuid(data?.id) }))
    .handler(async ({ data }) => {
        await requireAdmin()
        const [existing] = await db
            .select()
            .from(nominees)
            .where(eq(nominees.id, data.id))
        if (!existing) return { ok: true as const }
        await db.delete(nominees).where(eq(nominees.id, data.id))
        await removeBlob(existing.imageUrl)
        return { ok: true as const }
    })