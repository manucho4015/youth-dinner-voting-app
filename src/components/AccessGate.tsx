import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { submitAccessCode } from '../server/auth'

export function AccessGate() {
    const navigate = useNavigate()
    const [code, setCode] = useState('')
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!code.trim() || loading) return
        setLoading(true)
        setError(false)
        try {
            const res = await submitAccessCode({ data: { code } })
            if (res.ok) {
                await navigate({ to: '/' })
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
                <div className="mb-3 text-5xl">🎟️</div>
                <h1 className="font-display text-3xl font-extrabold text-gold-400">
                    Youth Dinner Awards
                </h1>
                <p className="mt-2 text-sm text-white/70">
                    Got your golden ticket? Enter the secret code from the group chat.
                </p>

                <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="SECRET CODE"
                    autoCapitalize="characters"
                    autoComplete="off"
                    className={`mt-6 w-full rounded-xl border bg-night-950 px-4 py-3 text-center font-display text-lg uppercase tracking-widest text-white outline-none placeholder:text-white/30 focus:border-party-teal ${error ? 'animate-shake border-party-pink' : 'border-white/15'
                        }`}
                />

                {error && (
                    <p className="mt-2 text-sm text-party-pink">
                        That code didn't work. Check the group chat again!
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-5 w-full rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-4 py-3 font-display text-lg font-bold text-night-950 transition active:scale-95 disabled:opacity-60"
                >
                    {loading ? 'Checking…' : 'Let me in ✨'}
                </button>
            </form>
        </main>
    )
}