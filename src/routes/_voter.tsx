import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getAccessStatus } from '../server/auth'

export const Route = createFileRoute('/_voter')({
    beforeLoad: async () => {
        const { hasAccess } = await getAccessStatus()
        if (!hasAccess) throw redirect({ to: '/gate' })
    },
    component: Outlet,
})