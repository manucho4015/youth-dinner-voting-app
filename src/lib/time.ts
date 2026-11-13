const EAT_OFFSET_MS = 3 * 60 * 60 * 1000

// "2026-11-20T18:00" (typed as Nairobi time) -> UTC ISO string
export function eatInputToIso(value: string) {
    return new Date(`${value}:00+03:00`).toISOString()
}

// UTC date/ISO -> "2026-11-20T18:00" for datetime-local inputs
export function isoToEatInput(value: Date | string) {
    return new Date(new Date(value).getTime() + EAT_OFFSET_MS)
        .toISOString()
        .slice(0, 16)
}

export function formatEat(value: Date | string) {
    return new Intl.DateTimeFormat('en-KE', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Africa/Nairobi',
    }).format(new Date(value))
}