import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import {
    deleteNominee,
    setNomineeCategories,
    updateNominee,
} from '../../../server/admin-nominees'
import type { Category, Nominee } from '../../../lib/types'
import { NomineeAvatar } from '../../NomineeAvatar'

type Props = {
    nominee: Nominee
    categories: Category[]
    assignedIds: string[]
}

function errorMessage(err: unknown) {
    return err instanceof Error ? err.message : 'Something went wrong'
}

export function NomineeCard({ nominee, categories, assignedIds }: Props) {
    const router = useRouter()
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState(nominee.name)
    const [file, setFile] = useState<File | null>(null)
    const [removeImage, setRemoveImage] = useState(false)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    const eligible = categories.filter((c) => c.type === nominee.type)

    async function toggleCategory(categoryId: string) {
        if (busy) return
        setBusy(true)
        setError('')
        const next = assignedIds.includes(categoryId)
            ? assignedIds.filter((id) => id !== categoryId)
            : [...assignedIds, categoryId]
        try {
            await setNomineeCategories({
                data: { nomineeId: nominee.id, categoryIds: next },
            })
            await router.invalidate()
        } catch (err) {
            setError(errorMessage(err))
        } finally {
            setBusy(false)
        }
    }

    async function handleSave() {
        if (busy) return
        setBusy(true)
        setError('')
        try {
            const fd = new FormData()
            fd.append('id', nominee.id)
            fd.append('name', name)
            if (file) fd.append('image', file)
            if (removeImage) fd.append('removeImage', '1')
            await updateNominee({ data: fd })
            await router.invalidate()
            setEditing(false)
            setFile(null)
            setRemoveImage(false)
        } catch (err) {
            setError(errorMessage(err))
        } finally {
            setBusy(false)
        }
    }

    function handleCancel() {
        setEditing(false)
        setName(nominee.name)
        setFile(null)
        setRemoveImage(false)
        setError('')
    }

    async function handleDelete() {
        const ok = window.confirm(
            `Delete "${nominee.name}"? Their votes will be deleted too.`,
        )
        if (!ok) return
        setBusy(true)
        try {
            await deleteNominee({ data: { id: nominee.id } })
            await router.invalidate()
        } catch (err) {
            setError(errorMessage(err))
            setBusy(false)
        }
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-night-900/80 p-5">
            <div className="flex items-start gap-4">
                <NomineeAvatar
                    name={nominee.name}
                    type={nominee.type}
                    imageUrl={removeImage ? null : nominee.imageUrl}
                />

                <div className="min-w-0 flex-1">
                    {editing ? (
                        <div className="space-y-3">
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-xl border border-white/15 bg-night-950 px-3 py-2 text-white outline-none focus:border-party-teal"
                            />
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                className="block w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-night-700 file:px-3 file:py-2 file:text-white"
                            />
                            {nominee.imageUrl && !file && (
                                <label className="flex items-center gap-2 text-sm text-white/70">
                                    <input
                                        type="checkbox"
                                        checked={removeImage}
                                        onChange={(e) => setRemoveImage(e.target.checked)}
                                    />
                                    Remove current picture
                                </label>
                            )}
                            <div className="flex gap-3 text-sm">
                                <button
                                    onClick={handleSave}
                                    disabled={busy}
                                    className="rounded-lg bg-gradient-to-r from-gold-400 to-gold-500 px-4 py-1.5 font-bold text-night-950 transition active:scale-95 disabled:opacity-60"
                                >
                                    {busy ? 'Saving…' : 'Save'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="rounded-lg border border-white/20 px-4 py-1.5 text-white/80 transition active:scale-95"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h3 className="truncate font-display text-xl font-bold text-white">
                                {nominee.name}
                            </h3>
                            <div className="mt-2 flex gap-3 text-sm">
                                <button
                                    onClick={() => setEditing(true)}
                                    className="rounded-lg border border-white/20 px-3 py-1 text-white/80 transition active:scale-95"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={busy}
                                    className="rounded-lg border border-party-pink/40 px-3 py-1 text-party-pink transition active:scale-95"
                                >
                                    Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/60">
                    Nominated in
                </p>
                {eligible.length === 0 ? (
                    <p className="text-sm text-white/40">
                        No {nominee.type} categories yet. Create one first.
                    </p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {eligible.map((c) => {
                            const active = assignedIds.includes(c.id)
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => toggleCategory(c.id)}
                                    disabled={busy}
                                    className={`rounded-full border px-3 py-1 text-sm transition active:scale-95 ${active
                                        ? 'border-gold-400 bg-gold-400/15 text-gold-300'
                                        : 'border-white/15 text-white/60 hover:border-white/40'
                                        }`}
                                >
                                    {active ? '✓ ' : ''}
                                    {c.title}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            {error && <p className="mt-3 text-sm text-party-pink">{error}</p>}
        </div>
    )
}