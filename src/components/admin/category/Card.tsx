import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { deleteCategory } from '../../../server/admin-categories'
import { formatEat } from '../../../lib/time'
import type { Category } from '../../../lib/types'
import { CategoryForm } from './Form'

export function CategoryCard({ category }: { category: Category }) {
    const router = useRouter()
    const [editing, setEditing] = useState(false)

    async function handleDelete() {
        const ok = window.confirm(
            `Delete "${category.title}"? Its votes will be deleted too.`,
        )
        if (!ok) return
        await deleteCategory({ data: { id: category.id } })
        await router.invalidate()
    }

    if (editing) {
        return (
            <div className="rounded-2xl border border-party-teal/40 bg-night-900/80 p-5">
                <CategoryForm initial={category} onDone={() => setEditing(false)} />
            </div>
        )
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-night-900/80 p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="font-display text-xl font-bold text-white">
                        {category.title}
                    </h3>
                    {category.description && (
                        <p className="mt-1 text-sm text-white/60">{category.description}</p>
                    )}
                </div>
                <span className="shrink-0 rounded-full bg-night-700 px-3 py-1 text-xs font-semibold text-gold-300">
                    {category.type === 'individual' ? '👤 Individual' : '🏢 Department'}
                </span>
            </div>

            <dl className="mt-4 grid gap-1 text-sm text-white/70 sm:grid-cols-2">
                <div>
                    <dt className="inline text-white/40">Opens: </dt>
                    <dd className="inline">{formatEat(category.opensAt)}</dd>
                </div>
                <div>
                    <dt className="inline text-white/40">Closes: </dt>
                    <dd className="inline">{formatEat(category.closesAt)}</dd>
                </div>
            </dl>

            <div className="mt-4 flex gap-3 text-sm">
                <button
                    onClick={() => setEditing(true)}
                    className="rounded-lg border border-white/20 px-3 py-1.5 text-white/80 transition active:scale-95"
                >
                    Edit
                </button>
                <button
                    onClick={handleDelete}
                    className="rounded-lg border border-party-pink/40 px-3 py-1.5 text-party-pink transition active:scale-95"
                >
                    Delete
                </button>
            </div>
        </div>
    )
}