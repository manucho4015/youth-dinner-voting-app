import { createFileRoute } from '@tanstack/react-router'
import { getRevealOverview } from '../../../server/admin-reveal'
import { RevealList } from '../../../components/reveal/List'

export const Route = createFileRoute('/_admin/admin/reveal')({
    loader: () => getRevealOverview(),
    component: RevealPage,
})

function RevealPage() {
    const { categories } = Route.useLoaderData()

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-2xl font-extrabold text-white">
                    Reveal results
                </h2>
                <p className="mt-1 text-sm text-white/60">
                    Only categories whose voting has closed can be revealed.
                </p>
            </div>
            <RevealList categories={categories} />
        </div>
    )
}