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

function AdminLayout() {
  const navigate = useNavigate()

  async function handleLogout() {
    await adminLogout()
    await navigate({ to: '/admin/login' })
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <span className="font-display text-2xl font-extrabold text-gold-400">
            🎬 Backstage
          </span>
          <nav className="flex gap-4 text-sm">
            <Link
              to="/admin/categories"
              className="text-white/70 hover:text-white [&.active]:font-bold [&.active]:text-party-teal"
            >
              Categories
            </Link>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-white/50 hover:text-white"
        >
          Log out
        </button>
      </header>
      <Outlet />
    </div>
  )
}