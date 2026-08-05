import { useEffect, useRef } from 'react'

export default function PaperPlaneCursor() {
  const cursorRef = useRef(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return undefined

    const cursor = cursorRef.current
    let frame = 0
    let targetX = -100
    let targetY = -100
    let currentX = -100
    let currentY = -100
    let angle = -12

    const render = () => {
      const velocityX = targetX - currentX
      const velocityY = targetY - currentY
      currentX += (targetX - currentX) * 0.22
      currentY += (targetY - currentY) * 0.22
      angle += ((-13 + velocityX * 0.055 + velocityY * 0.025) - angle) * 0.16
      if (cursor) {
        cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) perspective(90px) rotateX(14deg) rotateZ(${Math.max(-28, Math.min(8, angle))}deg)`
      }
      frame = requestAnimationFrame(render)
    }

    const move = (event) => {
      targetX = event.clientX + 7
      targetY = event.clientY + 7
      cursor?.classList.add('is-visible')
    }
    const hide = () => cursor?.classList.remove('is-visible')
    const press = () => cursor?.classList.add('is-pressed')
    const release = () => cursor?.classList.remove('is-pressed')

    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('mouseleave', hide)
    window.addEventListener('pointerdown', press)
    window.addEventListener('pointerup', release)
    frame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('mouseleave', hide)
      window.removeEventListener('pointerdown', press)
      window.removeEventListener('pointerup', release)
    }
  }, [])

  return (
    <div ref={cursorRef} className="paper-plane-cursor" aria-hidden="true">
      <svg viewBox="0 0 36 36">
        <defs>
          <linearGradient id="planeTop" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#d9f3fb" />
          </linearGradient>
          <linearGradient id="planeWing" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a9d8e8" />
            <stop offset="1" stopColor="#5e8fa6" />
          </linearGradient>
        </defs>
        <path className="plane-shadow" d="M5 8 33 17 20 23 14 32Z" />
        <path className="plane-top" d="M3.6 5.8 32.2 17 19.8 20.8Z" />
        <path className="plane-wing" d="m3.6 5.8 16.2 15 11.1-3.5-16.1 13.9Z" />
        <path className="plane-fold" d="m8.2 9.1 11.6 11.7 12.4-3.8" />
      </svg>
      <span className="plane-trail" />
    </div>
  )
}
