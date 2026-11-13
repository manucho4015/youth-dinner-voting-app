import { createFileRoute, redirect } from '@tanstack/react-router'
import { getAccessStatus } from '../server/auth'
import { AccessGate } from '../components/AccessGate'

export const Route = createFileRoute('/gate')({
    beforeLoad: async () => {
        const { hasAccess } = await getAccessStatus()
        if (hasAccess) throw redirect({ to: '/' })
    },
    component: AccessGate,
})