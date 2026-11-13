import { createServerFn } from '@tanstack/react-start'
import { getVoterSession } from './session.server'

export const getAccessStatus = createServerFn({ method: 'GET' }).handler(
    async () => {
        const session = await getVoterSession()
        return { hasAccess: Boolean(session.voterId) }
    },
)

export const submitAccessCode = createServerFn({ method: 'POST' })
    .validator((data: { code: string }) => {
        if (typeof data?.code !== 'string' || data.code.length > 100) {
            throw new Error('Invalid code')
        }
        return data
    })
    .handler(async ({ data }) => {
        const expected = process.env.ACCESS_CODE?.trim().toLowerCase()
        const given = data.code.trim().toLowerCase()

        if (!expected || given !== expected) {
            return { ok: false as const }
        }

        const session = await getVoterSession()
        if (!session.voterId) {
            session.voterId = crypto.randomUUID()
            await session.save()
        }
        return { ok: true as const }
    })