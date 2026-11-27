import { useEffect, useState } from 'react'

export function useCountUp(target: number, duration = 1200, decimals = 0) {
    const [value, setValue] = useState(0)

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setValue(target)
            return
        }
        const factor = 10 ** decimals
        let frame = 0
        const start = performance.now()
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration)
            const eased = 1 - Math.pow(1 - t, 3)
            setValue(Math.round(target * eased * factor) / factor)
            if (t < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
    }, [target, duration, decimals])

    return value
}