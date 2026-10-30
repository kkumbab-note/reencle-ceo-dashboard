import { useEffect, useRef, useState } from 'react'

const DURATION_MS = 700

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** 숫자 카운트업 — 값이 바뀌면 이전 값에서 새 값으로 이어서 올라가요 */
export function useCountUp(target: number): number {
  const [display, setDisplay] = useState(() => (prefersReducedMotion() ? target : 0))
  const fromRef = useRef(display)

  useEffect(() => {
    if (prefersReducedMotion()) {
      fromRef.current = target
      setDisplay(target)
      return
    }
    const from = fromRef.current
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION_MS, 1)
      const eased = 1 - (1 - t) ** 3
      const value = from + (target - from) * eased
      fromRef.current = value
      setDisplay(value)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target])

  return display
}
