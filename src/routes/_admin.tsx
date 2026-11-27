import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { adminLogout, getAdminStatus } from '../server/admin-auth'

export const Route = createFileRoute('/_admin')({
  beforeLoad: async () => {
    const { isAdmin } = await getAdminStatus()
    if (!isAdmin) throw redirect({ to: '/admin/login' })
  },
  component: AdminLayout,
})

const links = [
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/nominees', label: 'Nominees' },
  { to: '/admin/assignments', label: 'Assignments' },
  { to: '/admin/reveal', label: 'Reveal' },
] as const

function AdminLayout() {
  const navigate = useNavigate()

  async function handleLogout() {
    await adminLogout()
    await navigate({ to: '/admin/login' })
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-5 sm:py-8">
      <header className="mb-8 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="font-display text-xl font-extrabold text-gold-400 sm:text-2xl">
            🎬 Backstage
          </span>
          <button
            onClick={handleLogout}
            className="shrink-0 text-sm text-white/50 hover:text-white"
          >
            Log out
          </button>
        </div>

        <nav className="flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-white/70 transition hover:border-white/40 hover:text-white [&.active]:border-party-teal [&.active]:bg-party-teal/15 [&.active]:font-bold [&.active]:text-party-teal"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <Outlet />
    </div>
  )
}