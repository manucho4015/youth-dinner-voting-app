import { createFileRoute } from '@tanstack/react-router'
import { getNomineesAdminData } from '../../../server/admin-nominees'
import { NomineeForm } from '../../../components/admin/nominee/Form'
import { NomineeCard } from '../../../components/admin/nominee/Card'

export const Route = createFileRoute('/_admin/admin/nominees')({
    loader: () => getNomineesAdminData(),
    component: NomineesPage,
})

function NomineesPage() {
    const { nominees, categories, links } = Route.useLoaderData()

    const assignedFor = (nomineeId: string) =>
        links.filter((l) => l.nomineeId === nomineeId).map((l) => l.categoryId)

    const groups = [
        { title: '👤 Individuals', items: nominees.filter((n) => n.type === 'individual') },
        { title: '🏢 Departments', items: nominees.filter((n) => n.type === 'department') },
    ]

    return (
        <div className="space-y-8">
            <section className="rounded-2xl border border-white/10 bg-night-900/80 p-5">
                <h2 className="mb-4 font-display text-xl font-bold text-white">
                    New nominee
                </h2>
                <NomineeForm />
            </section>

            {groups.map((group) => (
                <section key={group.title} className="space-y-4">
                    <h2 className="font-display text-xl font-bold text-white">
                        {group.title} ({group.items.length})
                    </h2>
                    {group.items.length === 0 ? (
                        <p className="text-white/50">None yet.</p>
                    ) : (
                        group.items.map((nominee) => (
                            <NomineeCard
                                key={nominee.id}
                                nominee={nominee}
                                categories={categories}
                                assignedIds={assignedFor(nominee.id)}
                            />
                        ))
                    )}
                </section>
            ))}
        </div>
    )
}