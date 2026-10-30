import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import type { Delta } from '../../data/util'
import { cx } from '../../lib/cx'
import { formatDecimal } from '../../lib/format'

interface DeltaTextProps {
  /** 앞에 붙는 짧은 이름 — '전월', '전년' */
  label: string
  delta: Delta
  /** point 일 때 붙일 단위 — '%p', '점' */
  pointUnit?: string
  digits?: number
}

/** 화살표 아이콘 + 부호 있는 값. 색은 좋은 방향일 때 초록, 나쁜 방향일 때 빨강이에요. */
export function DeltaText({ label, delta, pointUnit = '', digits = 1 }: DeltaTextProps) {
  const rounded = Number(delta.value.toFixed(digits))
  const flat = rounded === 0
  const up = rounded > 0
  const good = (up && delta.direction === 'higher') || (!up && delta.direction === 'lower')
  const Icon = flat ? Minus : up ? ArrowUp : ArrowDown
  const unit = delta.kind === 'percent' ? '%' : pointUnit

  return (
    <span className="inline-flex items-center gap-1 text-xs whitespace-nowrap" title={delta.basis}>
      <span className="text-ink-subtle">{label}</span>
      <span className={cx('inline-flex items-center font-semibold', flat ? 'text-ink-subtle' : good ? 'text-up' : 'text-down')}>
        <Icon className="size-3" strokeWidth={2.5} aria-hidden="true" />
        <span className="sr-only">{flat ? '변동 없음' : up ? '증가' : '감소'}</span>
        {formatDecimal(Math.abs(rounded), digits)}
        {unit}
      </span>
    </span>
  )
}
