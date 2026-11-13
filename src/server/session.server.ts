import { getIronSession } from 'iron-session'
import { getCookie, setCookie } from '@tanstack/react-start/server'

type VoterSession = { voterId?: string }
type AdminSession = { isAdmin?: boolean }

function getPassword() {
    const password = process.env.SESSION_SECRET
    if (!password || password.length < 32) {
        throw new Error('SESSION_SECRET must be at least 32 characters')
    }
    return password
}

function baseCookieOptions() {
    return {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        httpOnly: true,
        path: '/',
    }
}

export function getVoterSession() {
    return getIronSession<VoterSession>(
        { read: getCookie, write: setCookie },
        {
            cookieName: 'voter-session',
            password: getPassword(),
            ttl: 60 * 60 * 24 * 30,
            cookieOptions: baseCookieOptions(),
        },
    )
}

export function getAdminSession() {
    return getIronSession<AdminSession>(
        { read: getCookie, write: setCookie },
        {
            cookieName: 'admin-session',
            password: getPassword(),
            ttl: 60 * 60 * 12,
            cookieOptions: baseCookieOptions(),
        },
    )
}