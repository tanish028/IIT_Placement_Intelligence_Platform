import { useEffect, useRef, useState } from 'react'

/**
 * Counts from 0 up to `value` when the element scrolls into view.
 * Usage: <AnimatedNumber value={18.4} suffix=" LPA" decimals={1} />
 */
export default function AnimatedNumber({ value, suffix = '', prefix = '', decimals = 0, duration = 1400 }) {
  const [display, setDisplay] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  // Start counting when element enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  // Animate count-up
  useEffect(() => {
    if (!started) return
    const target = parseFloat(value)
    const startTime = performance.now()

    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = eased * target
      setDisplay(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.round(current))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [started, value, duration, decimals])

  return (
    <span ref={ref}>
      {prefix}{decimals > 0 ? display.toFixed(decimals) : display}{suffix}
    </span>
  )
}
