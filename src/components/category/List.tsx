import { getStatus } from '../../lib/status'
import type { HomeCategory } from '../../lib/types'
import { useServerNow } from '../../hooks/useServerNow'
import { CategoryTicket } from './Ticket'

type Props = {
    serverNow: number
    categories: HomeCategory[]
}

export function CategoryList({ serverNow, categories }: Props) {
    const now = useServerNow(serverNow)

    const withStatus = categories.map((category) => ({
        category,
        status: getStatus(category.opensAt, category.closesAt, now),
    }))

    const sections = [
        {
            key: 'open',
            title: '🔥 Voting now',
            items: withStatus.filter((x) => x.status === 'open'),
        },
        {
            key: 'upcoming',
            title: '⏳ Coming up',
            items: withStatus.filter((x) => x.status === 'upcoming'),
        },
        {
            key: 'closed',
            title: '🔒 Closed',
            items: withStatus.filter((x) => x.status === 'closed'),
        },
    ].filter((section) => section.items.length > 0)

    return (
        <main className="mx-auto max-w-3xl px-5 py-10">
            <header className="mb-10 text-center">
                <div className="text-5xl">🏆</div>
                <h1 className="mt-3 font-display text-4xl font-extrabold text-gold-400">
                    Youth Dinner Awards
                </h1>
                <p className="mt-2 text-white/70">
                    Pick your favorites. One vote per category, so choose wisely!
                </p>
            </header>

            {sections.length === 0 ? (
                <p className="text-center text-white/60">
                    No awards are ready yet. Check back soon! 🎬
                </p>
            ) : (
                <div className="space-y-10">
                    {sections.map((section) => (
                        <section key={section.key} className="space-y-4">
                            <h2 className="font-display text-xl font-bold text-white">
                                {section.title}
                            </h2>
                            {section.items.map(({ category, status }) => (
                                <CategoryTicket
                                    key={category.id}
                                    category={category}
                                    status={status}
                                    now={now}
                                />
                            ))}
                        </section>
                    ))}
                </div>
            )}
        </main>
    )
}