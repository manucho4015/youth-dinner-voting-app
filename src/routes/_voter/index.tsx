import { createFileRoute } from '@tanstack/react-router'
import { getVoterHome } from '../../server/voting'
import { CategoryList } from '../../components/category/List'

export const Route = createFileRoute('/_voter/')({
    loader: () => getVoterHome(),
    component: HomePage,
})

function HomePage() {
    const data = Route.useLoaderData()
    return (
        <CategoryList serverNow={data.serverNow} categories={data.categories} />
    )
}