import { createFileRoute } from '@tanstack/react-router'
import { listCategories } from '../../../server/admin-categories'
import { CategoryForm } from '../../../components/admin/category/Form'
import { CategoryCard } from '../../../components/admin/category/Card'

export const Route = createFileRoute('/_admin/admin/categories')({
    loader: () => listCategories(),
    component: CategoriesPage,
})

function CategoriesPage() {
    const categories = Route.useLoaderData()

    return (
        <div className="space-y-8">
            <section className="rounded-2xl border border-white/10 bg-night-900/80 p-5">
                <h2 className="mb-4 font-display text-xl font-bold text-white">
                    New category
                </h2>
                <CategoryForm />
            </section>

            <section className="space-y-4">
                <h2 className="font-display text-xl font-bold text-white">
                    All categories ({categories.length})
                </h2>
                {categories.length === 0 ? (
                    <p className="text-white/50">No categories yet. Add your first one above.</p>
                ) : (
                    categories.map((category) => (
                        <CategoryCard key={category.id} category={category} />
                    ))
                )}
            </section>
        </div>
    )
}