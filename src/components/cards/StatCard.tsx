import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { SourceMeta } from '../../data/types'
import { useCountUp } from '../../hooks/useCountUp'
import { cx } from '../../lib/cx'
import { formatDecimal } from '../../lib/format'
import { SourceMark } from './SourceMark'

interface StatCardProps {
  label: string
  value: number
  digits?: number
  unit?: string
  /** 값 아래 한 줄 */
  sub?: ReactNode
  /** 맨 아래 (증감·목표 막대 등) */
  footer?: ReactNode
  meta?: SourceMeta
  icon?: LucideIcon
  className?: string
}

/** 상세 화면 상단 요약 숫자 */
export function StatCard({ label, value, digits = 0, unit, sub, footer, meta, icon: Icon, className }: StatCardProps) {
  const animated = useCountUp(value)
  return (
    <section className={cx('flex flex-col rounded-card bg-surface p-5 shadow-card', className)}>
      <div className="flex items-center gap-2">
        {Icon && (
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        )}
        <h2 className="truncate text-sm font-medium text-ink-muted">{label}</h2>
        {meta && (
          <span className="ml-auto">
            <SourceMark meta={meta} />
          </span>
        )}
      </div>
      <p className="mt-3 flex items-baseline gap-1">
        <span className="text-[28px] leading-none font-bold tracking-tight text-ink">{formatDecimal(animated, digits)}</span>
        {unit && <span className="text-sm font-medium text-ink-muted">{unit}</span>}
      </p>
      {sub && <p className="mt-1.5 text-xs text-ink-subtle">{sub}</p>}
      {footer && <div className="mt-auto pt-3">{footer}</div>}
    </section>
  )
}
