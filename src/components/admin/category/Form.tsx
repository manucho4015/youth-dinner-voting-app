import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { createCategory, updateCategory } from '../../../server/admin-categories'
import { eatInputToIso, isoToEatInput } from '../../../lib/time'
import type { Category } from '../../../lib/types'
import DateTimeInput from '../DateTimeInput'

type Props = {
    initial?: Category
    onDone?: () => void
}

const inputClass =
    'w-full rounded-xl border border-white/15 bg-night-950 px-3 py-2 text-white outline-none placeholder:text-white/30 focus:border-party-teal'
const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-white/60'

export function CategoryForm({ initial, onDone }: Props) {
    const router = useRouter()
    const [title, setTitle] = useState(initial?.title ?? '')
    const [description, setDescription] = useState(initial?.description ?? '')
    const [type, setType] = useState<'individual' | 'department'>(
        initial?.type ?? 'individual',
    )
    const [opensAt, setOpensAt] = useState(
        initial ? isoToEatInput(initial.opensAt) : '',
    )
    const [closesAt, setClosesAt] = useState(
        initial ? isoToEatInput(initial.closesAt) : '',
    )
    const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0))
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (saving) return
        setError('')
        setSaving(true)
        try {
            const payload = {
                title,
                description,
                type,
                opensAt: eatInputToIso(opensAt),
                closesAt: eatInputToIso(closesAt),
                sortOrder: Number(sortOrder) || 0,
            }
            if (initial) {
                await updateCategory({ data: { id: initial.id, ...payload } })
            } else {
                await createCategory({ data: payload })
                setTitle('')
                setDescription('')
                setOpensAt('')
                setClosesAt('')
                setSortOrder('0')
            }
            await router.invalidate()
            onDone?.()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className={labelClass}>Title</label>
                <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Most Innovative Person"
                    className={inputClass}
                />
            </div>

            <div>
                <label className={labelClass}>Description (optional)</label>
                <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Who surprised us with fresh ideas this year?"
                    className={inputClass}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as 'individual' | 'department')}
                        className={inputClass}
                    >
                        <option value="individual">Individual</option>
                        <option value="department">Department</option>
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Order</label>
                    <input
                        type="number"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className={inputClass}
                    />
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div>
                    <label className={labelClass}>Opens (Nairobi time)</label>
                    <DateTimeInput required value={opensAt} onChange={setOpensAt} />
                </div>
                <div>
                    <label className={labelClass}>Closes (Nairobi time)</label>
                    <DateTimeInput required value={closesAt} onChange={setClosesAt} />
                </div>
            </div>

            {error && <p className="text-sm text-party-pink">{error}</p>}

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-5 py-2 font-display font-bold text-night-950 transition active:scale-95 disabled:opacity-60"
                >
                    {saving ? 'Saving…' : initial ? 'Save changes' : 'Add category'}
                </button>
                {initial && (
                    <button
                        type="button"
                        onClick={onDone}
                        className="rounded-xl border border-white/20 px-5 py-2 text-white/80 transition active:scale-95"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    )
}