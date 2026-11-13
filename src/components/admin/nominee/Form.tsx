import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { createNominee } from '../../../server/admin-nominees'

const inputClass =
    'w-full rounded-xl border border-white/15 bg-night-950 px-3 py-2 text-white outline-none placeholder:text-white/30 focus:border-party-teal [color-scheme:dark]'
const labelClass =
    'mb-1 block text-xs font-semibold uppercase tracking-wide text-white/60'

export function NomineeForm() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [type, setType] = useState<'individual' | 'department'>('individual')
    const [file, setFile] = useState<File | null>(null)
    const [fileKey, setFileKey] = useState(0)
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (saving) return
        setError('')
        setSaving(true)
        try {
            const fd = new FormData()
            fd.append('name', name)
            fd.append('type', type)
            if (file) fd.append('image', file)
            await createNominee({ data: fd })
            setName('')
            setFile(null)
            setFileKey((k) => k + 1)
            await router.invalidate()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                    <label className={labelClass}>Name</label>
                    <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Grace Wanjiru / Media Team"
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className={labelClass}>Type</label>
                    <select
                        value={type}
                        onChange={(e) =>
                            setType(e.target.value as 'individual' | 'department')
                        }
                        className={inputClass}
                    >
                        <option value="individual">Individual</option>
                        <option value="department">Department</option>
                    </select>
                </div>
            </div>

            <div>
                <label className={labelClass}>Picture (optional, max 4 MB)</label>
                <input
                    key={fileKey}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-night-700 file:px-3 file:py-2 file:text-white"
                />
            </div>

            {error && <p className="text-sm text-party-pink">{error}</p>}

            <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-5 py-2 font-display font-bold text-night-950 transition active:scale-95 disabled:opacity-60"
            >
                {saving ? 'Saving…' : 'Add nominee'}
            </button>
        </form>
    )
}