import { useSyncExternalStore } from 'react'

export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

// PROMPT §6 반응형 기준 (Tailwind md = 768px, xl = 1280px 와 같아요)
const TABLET_QUERY = '(min-width: 768px)'
const DESKTOP_QUERY = '(min-width: 1280px)'

function getSnapshot(): Breakpoint {
  if (window.matchMedia(DESKTOP_QUERY).matches) return 'desktop'
  if (window.matchMedia(TABLET_QUERY).matches) return 'tablet'
  return 'mobile'
}

function subscribe(onChange: () => void) {
  const queries = [TABLET_QUERY, DESKTOP_QUERY].map((q) => window.matchMedia(q))
  queries.forEach((mq) => mq.addEventListener('change', onChange))
  return () => queries.forEach((mq) => mq.removeEventListener('change', onChange))
}

export function useBreakpoint(): Breakpoint {
  return useSyncExternalStore(subscribe, getSnapshot)
}
