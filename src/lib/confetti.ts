export async function fireVoteConfetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const { default: confetti } = await import('canvas-confetti')
    const colors = ['#ffd166', '#ff4fa3', '#22e0d0', '#ffffff']

    confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 }, colors })
    setTimeout(
        () =>
            confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.8 }, colors }),
        200,
    )
    setTimeout(
        () =>
            confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.8 }, colors }),
        400,
    )
}

export async function fireWinnerConfetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const { default: confetti } = await import('canvas-confetti')
    const colors = ['#ffd166', '#f5b700', '#ffe08a', '#ffffff']
    const end = Date.now() + 3000

    confetti({
        particleCount: 200,
        spread: 120,
        startVelocity: 45,
        origin: { y: 0.6 },
        colors,
    })

    const frame = () => {
        confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors })
        confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors })
        if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
}