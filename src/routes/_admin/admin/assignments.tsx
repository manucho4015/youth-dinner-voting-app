import { createFileRoute } from '@tanstack/react-router'
import { getNomineesAdminData } from '../../../server/admin-nominees'
import { AssignmentPanel } from '../../../components/admin/AssignmentPanel'

export const Route = createFileRoute('/_admin/admin/assignments')({
    loader: () => getNomineesAdminData(),
    component: AssignmentsPage,
})

function AssignmentsPage() {
    const { nominees, categories, links } = Route.useLoaderData()

    return (
        <div className="space-y-6">
            <h2 className="font-display text-2xl font-extrabold text-white">
                Assign nominees
            </h2>
            <AssignmentPanel
                categories={categories}
                nominees={nominees}
                links={links}
            />
        </div>
    )
}