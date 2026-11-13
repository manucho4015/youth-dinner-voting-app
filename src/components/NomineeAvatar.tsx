type Props = {
    name: string
    type: 'individual' | 'department'
    imageUrl: string | null
    className?: string
}

const gradients = [
    'from-party-pink to-gold-500',
    'from-party-teal to-night-700',
    'from-gold-400 to-party-pink',
    'from-night-700 to-party-teal',
]

function pickGradient(name: string) {
    let h = 0
    for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997
    return gradients[h % gradients.length]
}

function initials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('')
}

export function NomineeAvatar({
    name,
    type,
    imageUrl,
    className = 'h-16 w-16',
}: Props) {
    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={name}
                loading="lazy"
                className={`${className} rounded-2xl object-cover`}
            />
        )
    }

    return (
        <div
            aria-label={name}
            className={`${className} flex items-center justify-center rounded-2xl bg-gradient-to-br ${pickGradient(name)} font-display text-xl font-extrabold text-white`}
        >
            {type === 'department' ? '🏢' : initials(name)}
        </div>
    )
}