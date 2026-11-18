import { useEffect, useMemo, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { setCategoryNominees } from '../../server/admin-assignments'
import type { Category, Nominee } from '../../lib/types'
import { NomineeAvatar } from '../NomineeAvatar'

type Link = { categoryId: string; nomineeId: string }

type Props = {
    categories: Category[]
    nominees: Nominee[]
    links: Link[]
}

function sameSet(a: Set<string>, b: Set<string>) {
    return a.size === b.size && [...a].every((x) => b.has(x))
}

export function AssignmentPanel({ categories, nominees, links }: Props) {
    const router = useRouter()
    const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')
    const [search, setSearch] = useState('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')

    const category = categories.find((c) => c.id === categoryId) ?? null

    const saved = useMemo(
        () =>
            new Set(
                links.filter((l) => l.categoryId === categoryId).map((l) => l.nomineeId),
            ),
        [links, categoryId],
    )
    const [selected, setSelected] = useState<Set<string>>(() => new Set(saved))

    useEffect(() => {
        setSelected(new Set(saved))
    }, [saved])

    const counts = useMemo(() => {
        const map = new Map<string, number>()
        for (const l of links) map.set(l.categoryId, (map.get(l.categoryId) ?? 0) + 1)
        return map
    }, [links])

    const dirty = !sameSet(selected, saved)

    const eligible = category
        ? nominees.filter((n) => n.type === category.type)
        : []
    const visible = eligible.filter((n) =>
        n.name.toLowerCase().includes(search.trim().toLowerCase()),
    )

    function changeCategory(id: string) {
        if (id === categoryId) return
        if (dirty && !window.confirm('Discard your unsaved changes?')) return
        setCategoryId(id)
        setSearch('')
        setError('')
        setNotice('')
    }

    function toggle(id: string) {
        setNotice('')
        setSelected((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    function selectVisible() {
        setNotice('')
        setSelected((prev) => {
            const next = new Set(prev)
            for (const n of visible) next.add(n.id)
            return next
        })
    }

    function clearVisible() {
        setNotice('')
        setSelected((prev) => {
            const next = new Set(prev)
            for (const n of visible) next.delete(n.id)
            return next
        })
    }

    async function handleSave() {
        if (!category || busy) return
        setBusy(true)
        setError('')
        setNotice('')
        try {
            const res = await setCategoryNominees({
                data: { categoryId: category.id, nomineeIds: [...selected] },
            })
            await router.invalidate()
            setNotice(`Saved! ${res.count} nominee${res.count === 1 ? '' : 's'} in this category.`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setBusy(false)
        }
    }

    if (categories.length === 0) {
        return (
            <p className="text-white/60">
                No categories yet. Create one on the Categories page first.
            </p>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
                {categories.map((c) => {
                    const active = c.id === categoryId
                    const count = counts.get(c.id) ?? 0
                    return (
                        <button
                            key={c.id}
                            onClick={() => changeCategory(c.id)}
                            className={`rounded-full border px-4 py-2 text-sm transition active:scale-95 ${active
                                ? 'border-gold-400 bg-gold-400/15 font-bold text-gold-300'
                                : 'border-white/15 text-white/70 hover:border-white/40'
                                }`}
                        >
                            {c.type === 'individual' ? '👤' : '🏢'} {c.title}{' '}
                            <span className={count === 0 ? 'text-party-pink' : 'text-white/50'}>
                                ({count})
                            </span>
                        </button>
                    )
                })}
            </div>

            {category && (
                <section className="space-y-4 rounded-2xl border border-white/10 bg-night-900/80 p-5">
                    <div>
                        <h2 className="font-display text-xl font-bold text-white">
                            {category.title}
                        </h2>
                        <p className="text-sm text-white/60">
                            Choose which {category.type === 'individual' ? 'individuals' : 'departments'}{' '}
                            appear on the ballot.
                            {selected.size === 0 && (
                                <span className="text-party-pink">
                                    {' '}
                                    With nobody selected, voters won't see this category.
                                </span>
                            )}
                        </p>
                    </div>

                    {eligible.length === 0 ? (
                        <p className="text-white/50">
                            No {category.type} nominees yet. Add some on the Nominees page.
                        </p>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center gap-3">
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search nominees…"
                                    className="min-w-0 flex-1 rounded-xl border border-white/15 bg-night-950 px-3 py-2 text-white outline-none placeholder:text-white/30 focus:border-party-teal"
                                />
                                <button
                                    onClick={selectVisible}
                                    className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white/80 transition active:scale-95"
                                >
                                    Select all{search.trim() ? ` (${visible.length})` : ''}
                                </button>
                                <button
                                    onClick={clearVisible}
                                    className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white/80 transition active:scale-95"
                                >
                                    Clear{search.trim() ? ` (${visible.length})` : ''}
                                </button>
                            </div>

                            {visible.length === 0 ? (
                                <p className="text-white/50">No nominees match your search.</p>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {visible.map((n) => {
                                        const checked = selected.has(n.id)
                                        return (
                                            <label
                                                key={n.id}
                                                className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 transition focus-within:border-party-teal active:scale-[0.98] ${checked
                                                    ? 'border-gold-400 bg-gold-400/10'
                                                    : 'border-white/10 bg-night-950/60 hover:border-white/30'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggle(n.id)}
                                                    className="sr-only"
                                                />
                                                <NomineeAvatar
                                                    name={n.name}
                                                    type={n.type}
                                                    imageUrl={n.imageUrl}
                                                    className="h-12 w-12"
                                                />
                                                <span className="min-w-0 flex-1 truncate font-display font-bold text-white">
                                                    {n.name}
                                                </span>
                                                <span
                                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${checked
                                                        ? 'bg-gold-400 text-night-950'
                                                        : 'border border-white/30 text-transparent'
                                                        }`}
                                                >
                                                    ✓
                                                </span>
                                            </label>
                                        )
                                    })}
                                </div>
                            )}

                            <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-night-950/95 p-3 backdrop-blur">
                                <button
                                    onClick={handleSave}
                                    disabled={busy || !dirty}
                                    className="rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-5 py-2 font-display font-bold text-night-950 transition active:scale-95 disabled:opacity-40"
                                >
                                    {busy ? 'Saving…' : 'Save'}
                                </button>
                                <span className="text-sm text-white/70">
                                    {selected.size} of {eligible.length} selected
                                    {dirty && <span className="text-gold-300"> · unsaved changes</span>}
                                </span>
                                {notice && !dirty && (
                                    <span className="text-sm text-party-teal">{notice}</span>
                                )}
                                {error && <span className="text-sm text-party-pink">{error}</span>}
                            </div>
                        </>
                    )}
                </section>
            )}
        </div>
    )
}