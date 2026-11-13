import { useEffect, useState } from 'react'

export function useServerNow(serverNow: number) {
    // Starts at the server's time so server and client first renders match
    const [now, setNow] = useState(serverNow)

    useEffect(() => {
        const offset = serverNow - Date.now()
        const tick = () => setNow(Date.now() + offset)
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [serverNow])

    return now
}