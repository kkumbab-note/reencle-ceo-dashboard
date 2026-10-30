import type { Direction } from '../../data/types'
import { achievement } from '../../data/util'
import { formatDecimal } from '../../lib/format'

interface GoalMeterProps {
  current: number
  target: number
  direction: Direction
  /** 막대 아래 왼쪽 문구 — '목표까지 643억' */
  caption: string
}

/** 목표 달성률 막대 — 채운 부분은 브랜드색, 빈 부분은 같은 색의 옅은 단계 */
export function GoalMeter({ current, target, direction, caption }: GoalMeterProps) {
  const pct = achievement(current, target, direction) * 100
  return (
    <div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-primary-soft"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={caption}
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 flex justify-between gap-2 text-xs text-ink-subtle">
        <span className="truncate">{caption}</span>
        <span className="shrink-0 font-semibold text-ink-muted">{formatDecimal(pct, 0)}%</span>
      </p>
    </div>
  )
}
