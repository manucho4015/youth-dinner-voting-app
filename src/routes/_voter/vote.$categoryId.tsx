import { createFileRoute, Link } from '@tanstack/react-router'
import { getVotingCategory } from '../../server/voting'
import { VotePage } from '../../components/VotePage'

export const Route = createFileRoute('/_voter/vote/$categoryId')({
    loader: ({ params }) =>
        getVotingCategory({ data: { categoryId: params.categoryId } }),
    component: VoteRoute,
})

function VoteRoute() {
    const data = Route.useLoaderData()

    if (!data) {
        return (
            <main className="mx-auto max-w-3xl px-5 py-16 text-center">
                <div className="text-5xl">🤔</div>
                <h1 className="mt-3 font-display text-2xl font-extrabold text-white">
                    Category not found
                </h1>
                <Link to="/" className="mt-4 inline-block text-party-teal">
                    ← Back to all categories
                </Link>
            </main>
        )
    }

    return <VotePage data={data} />
}