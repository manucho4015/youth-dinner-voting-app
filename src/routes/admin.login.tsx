import { createFileRoute, redirect } from '@tanstack/react-router'
import { getAdminStatus } from '../server/admin-auth'
import { AdminLogin } from '../components/admin/Login'

export const Route = createFileRoute('/admin/login')({
    beforeLoad: async () => {
        const { isAdmin } = await getAdminStatus()
        if (isAdmin) throw redirect({ to: '/admin' })
    },
    component: AdminLogin,
})