export type CategoryStatus = 'upcoming' | 'open' | 'closed'

export function getStatus(
    opensAt: string | Date,
    closesAt: string | Date,
    now: number,
): CategoryStatus {
    const opens = new Date(opensAt).getTime()
    const closes = new Date(closesAt).getTime()
    if (now < opens) return 'upcoming'
    if (now >= closes) return 'closed'
    return 'open'
}

export function formatCountdown(ms: number) {
    const total = Math.max(0, Math.floor(ms / 1000))
    const days = Math.floor(total / 86400)
    const hours = Math.floor((total % 86400) / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    const seconds = total % 60

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, '0')}s`
    return `${seconds}s`
}