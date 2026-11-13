import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { adminLogin } from '../../server/admin-auth'

export function AdminLogin() {
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!password || loading) return
        setLoading(true)
        setError(false)
        try {
            const res = await adminLogin({ data: { password } })
            if (res.ok) {
                await navigate({ to: '/admin' })
                return
            }
            setError(true)
        } catch {
            setError(true)
        }
        setLoading(false)
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-5">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm rounded-3xl border border-white/10 bg-night-900/80 p-8 text-center shadow-2xl backdrop-blur"
            >
                <div className="mb-3 text-5xl">🎬</div>
                <h1 className="font-display text-3xl font-extrabold text-gold-400">
                    Backstage
                </h1>
                <p className="mt-2 text-sm text-white/70">Organizers only.</p>

                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Admin password"
                    autoComplete="current-password"
                    className={`mt-6 w-full rounded-xl border bg-night-950 px-4 py-3 text-center text-white outline-none placeholder:text-white/30 focus:border-party-teal ${error ? 'animate-shake border-party-pink' : 'border-white/15'
                        }`}
                />
                {error && (
                    <p className="mt-2 text-sm text-party-pink">Wrong password.</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-5 w-full rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-4 py-3 font-display text-lg font-bold text-night-950 transition active:scale-95 disabled:opacity-60"
                >
                    {loading ? 'Checking…' : 'Enter'}
                </button>
            </form>
        </main>
    )
}