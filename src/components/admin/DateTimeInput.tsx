type Props = {
    value: string
    onChange: (value: string) => void
    required?: boolean
}

export default function DateTimeInput({ value, onChange, required }: Props) {
    return (
        <input
            type="datetime-local"
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onClick={(e) => {
                try {
                    e.currentTarget.showPicker()
                } catch {
                    // Older browsers: the native control still works by typing
                }
            }}
            className="w-full rounded-xl border border-white/15 bg-night-950 px-3 py-2 text-white outline-none focus:border-party-teal [color-scheme:dark]"
        />
    )
}