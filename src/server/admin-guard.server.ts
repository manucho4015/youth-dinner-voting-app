import { createHash, timingSafeEqual } from 'node:crypto'
import { getAdminSession } from './session.server'

export async function requireAdmin() {
    const session = await getAdminSession()
    if (!session.isAdmin) throw new Error('Unauthorized')
}

export function passwordMatches(given: string, expected: string) {
    const a = createHash('sha256').update(given).digest()
    const b = createHash('sha256').update(expected).digest()
    return timingSafeEqual(a, b)
}