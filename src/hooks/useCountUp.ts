import { useEffect, useState } from 'react'

export function useCountUp(target: number, duration = 1200) {
    const [value, setValue] = useState(0)

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setValue(target)
            return
        }
        let frame = 0
        const start = performance.now()
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration)
            setValue(Math.round(target * (1 - Math.pow(1 - t, 3))))
            if (t < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
    }, [target, duration])

    return value
}