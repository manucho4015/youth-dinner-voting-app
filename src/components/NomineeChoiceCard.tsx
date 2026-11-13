import { NomineeAvatar } from './NomineeAvatar'

type Props = {
    name: string
    type: 'individual' | 'department'
    imageUrl: string | null
    selected: boolean
    onSelect: () => void
}

export function NomineeChoiceCard({
    name,
    type,
    imageUrl,
    selected,
    onSelect,
}: Props) {
    return (
        <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            className={`relative flex flex-col items-center gap-3 rounded-3xl border-2 p-4 text-center transition active:scale-95 ${selected
                ? '-rotate-1 scale-[1.03] border-gold-400 bg-gold-400/10 shadow-[0_0_30px_rgba(245,183,0,0.35)]'
                : 'border-white/10 bg-night-900/80 hover:rotate-1 hover:border-white/30'
                }`}
        >
            {selected && (
                <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-gold-400 font-bold text-night-950">
                    ✓
                </span>
            )}
            <NomineeAvatar
                name={name}
                type={type}
                imageUrl={imageUrl}
                className="h-28 w-28"
            />
            <span className="font-display text-lg font-bold leading-tight text-white">
                {name}
            </span>
        </button>
    )
}