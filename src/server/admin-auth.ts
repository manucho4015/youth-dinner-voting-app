import { createServerFn } from '@tanstack/react-start'
import { getAdminSession } from './session.server'
import { passwordMatches } from './admin-guard.server'

export const getAdminStatus = createServerFn({ method: 'GET' }).handler(
    async () => {
        const session = await getAdminSession()
        return { isAdmin: Boolean(session.isAdmin) }
    },
)

export const adminLogin = createServerFn({ method: 'POST' })
    .validator((data: { password: string }) => {
        if (typeof data?.password !== 'string' || data.password.length > 200) {
            throw new Error('Invalid password')
        }
        return data
    })
    .handler(async ({ data }) => {
        const expected = process.env.ADMIN_PASSWORD
        if (!expected || !passwordMatches(data.password, expected)) {
            return { ok: false as const }
        }
        const session = await getAdminSession()
        session.isAdmin = true
        await session.save()
        return { ok: true as const }
    })

export const adminLogout = createServerFn({ method: 'POST' }).handler(
    async () => {
        const session = await getAdminSession()
        session.destroy()
        return { ok: true as const }
    },
)