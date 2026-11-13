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