import { Link } from 'react-router'
import type { HeadlineKpi } from '../../data/dashboard'
import { useCountUp } from '../../hooks/useCountUp'
import { cx } from '../../lib/cx'
import { formatDecimal, formatMan } from '../../lib/format'
import { DeltaText } from './DeltaText'
import { SourceInfo, SourceMark } from './SourceMark'

const DISPLAY: Record<HeadlineKpi['id'], { divisor: number; digits: number; unit: string; pointUnit?: string }> = {
  revenueYtd: { divisor: 100, digits: 1, unit: '억원' },
  cumulativeUnits: { divisor: 10_000, digits: 1, unit: '만 대' },
  overseasShare: { divisor: 1, digits: 1, unit: '%', pointUnit: '%p' },
  nps: { divisor: 1, digits: 0, unit: '점', pointUnit: '점' },
  cumulativeReduction: { divisor: 10_000, digits: 1, unit: '만 톤' },
}

export function KpiCard({ kpi, className }: { kpi: HeadlineKpi; className?: string }) {
  const display = DISPLAY[kpi.id]
  const animated = useCountUp(kpi.value / display.divisor)

  return (
    <article
      className={cx(
        'relative flex flex-col rounded-card bg-surface p-5 shadow-card transition-shadow hover:shadow-overlay',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {/* 카드 전체가 눌리도록 링크를 카드 크기로 펼쳐요 */}
        <Link
          to={kpi.path}
          className="truncate text-sm font-medium text-ink-muted after:absolute after:inset-0 after:rounded-card"
        >
          {kpi.label}
        </Link>
        <span className="relative z-10 ml-auto">
          <SourceMark meta={kpi.meta} />
        </span>
      </div>

      <p className="mt-3 flex items-baseline gap-1">
        <span className="text-[28px] leading-none font-bold tracking-tight text-ink xl:text-[30px]">
          {formatDecimal(animated, display.digits)}
        </span>
        <span className="text-sm font-medium text-ink-muted">{display.unit}</span>
      </p>

      {kpi.breakdown ? (
        <p className="relative z-10 mt-1.5 flex items-center gap-0.5 text-xs text-ink-subtle">
          <span className="truncate" title={`공개 ${formatMan(kpi.breakdown.publicValue, 0)}대(${kpi.breakdown.publicAsOf}) + 가상 ${formatMan(kpi.breakdown.mockValue)}대`}>
            공개 {formatMan(kpi.breakdown.publicValue, 0)} + 가상 {formatMan(kpi.breakdown.mockValue)}
          </span>
          <SourceInfo meta={kpi.breakdown.publicMeta} />
        </p>
      ) : (
        <p className="mt-1.5 truncate text-xs text-ink-subtle">{kpi.caption}</p>
      )}

      <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-3">
        <DeltaText label="전월" delta={kpi.mom} pointUnit={display.pointUnit} digits={kpi.id === 'nps' ? 0 : 1} />
        <DeltaText label="전년" delta={kpi.yoy} pointUnit={display.pointUnit} digits={kpi.id === 'nps' ? 0 : 1} />
      </div>
    </article>
  )
}
