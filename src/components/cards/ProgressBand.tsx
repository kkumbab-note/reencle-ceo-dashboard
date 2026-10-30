import { Link } from 'react-router'
import { Target } from 'lucide-react'
import type { AxisProgress, getWorldNo1Progress } from '../../data/progress'
import { useCountUp } from '../../hooks/useCountUp'
import { cx } from '../../lib/cx'
import { formatDecimal, formatEok, formatInt, formatMan } from '../../lib/format'
import { Card, CardHeader } from './Card'
import { MockBadge } from './SourceMark'

type Progress = ReturnType<typeof getWorldNo1Progress>
type Kpi = AxisProgress['kpis'][number]

/** 목표 단위별 표시 — '357억', '28.0%', '12개국', '4.69점', '3.4일', '12.1만 톤' */
function formatGoalValue(value: number, unit: string, isTarget: boolean): string {
  const digits = isTarget && Number.isInteger(value) ? 0 : 1
  switch (unit) {
    case '백만원':
      return formatEok(value, 0)
    case '%':
      return `${formatDecimal(value, value < 1 && !isTarget ? 2 : digits)}%`
    case '점':
      return formatDecimal(value, Number.isInteger(value) ? 0 : 2)
    case '톤':
      return `${formatMan(value, isTarget ? 0 : 1)}톤`
    case '개국':
      return `${formatInt(value)}개국`
    default:
      return `${formatDecimal(value, digits)}${unit}`
  }
}

function kpiLine(k: Kpi, short = false): string {
  return `${short ? k.shortLabel : k.label} ${formatGoalValue(k.current, k.unit, false)} / ${formatGoalValue(k.target, k.unit, true)}`
}

const RING_RADIUS = 24
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

function Ring({ value }: { value: number }) {
  const animated = useCountUp(value)
  return (
    <span className="relative grid size-16 shrink-0 place-items-center">
      <svg viewBox="0 0 60 60" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="30" cy="30" r={RING_RADIUS} fill="none" stroke="var(--rc-primary-soft)" strokeWidth="7" />
        <circle
          cx="30"
          cy="30"
          r={RING_RADIUS}
          fill="none"
          stroke="var(--rc-primary)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${(RING_CIRCUMFERENCE * Math.min(animated, 100)) / 100} ${RING_CIRCUMFERENCE}`}
        />
      </svg>
      <span className="relative text-sm font-bold text-ink">
        {formatDecimal(animated, 0)}
        <span className="text-[10px] font-semibold text-ink-muted">%</span>
      </span>
    </span>
  )
}

function AxisItem({ axis, focus }: { axis: AxisProgress; focus: boolean }) {
  return (
    <li>
      <Link
        to={axis.path}
        className={cx(
          'flex h-full flex-col gap-2.5 rounded-control border p-3 transition-colors hover:bg-surface-muted',
          focus ? 'border-important/40 bg-important-soft/40' : 'border-border',
        )}
      >
        <span className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Ring value={axis.score} />
          <span className="flex min-w-0 items-center gap-1.5 text-sm leading-snug font-semibold text-ink">
            {axis.label}
            {focus && <Target className="size-3.5 shrink-0 text-important" aria-label="집중 필요" />}
          </span>
        </span>
        <span className="hidden flex-col gap-0.5 text-xs text-ink-subtle sm:flex">
          {axis.kpis.map((k) => (
            <span key={k.goalId} title={`${kpiLine(k)} · ${k.basis} · 달성률 ${formatDecimal(k.achievement, 1)}%`}>
              {kpiLine(k, true)}
            </span>
          ))}
        </span>
      </Link>
    </li>
  )
}

export function ProgressBand({ progress }: { progress: Progress }) {
  const overall = useCountUp(progress.overall)
  const weakest = progress.axes.reduce((min, a) => (a.score < min.score ? a : min))

  return (
    <Card>
      <CardHeader
        title="World No.1 진척도"
        badge={<MockBadge />}
        aside={<span className="hidden text-xs text-ink-subtle sm:inline">2030 목표 대비 · 4축 균등 가중</span>}
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(220px,1fr)_3.4fr] xl:items-center xl:gap-6">
        <div>
          <p className="flex items-baseline gap-1">
            <span className="text-[52px] leading-none font-bold tracking-tight text-ink">{formatDecimal(overall, 1)}</span>
            <span className="text-xl font-semibold text-ink-muted">%</span>
          </p>
          <div
            className="mt-4 h-2 overflow-hidden rounded-full bg-primary-soft"
            role="progressbar"
            aria-label="종합 진척도"
            aria-valuenow={Math.round(progress.overall)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(overall, 100)}%` }} />
          </div>
          <p className="mt-2 text-xs text-ink-subtle">세계 1위 목표까지 {formatDecimal(100 - progress.overall, 1)}%p</p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-important-soft px-2.5 py-1 text-xs font-medium text-ink">
            <Target className="size-3.5 text-important" aria-hidden="true" />
            집중 필요 · {weakest.label} {formatDecimal(weakest.score, 0)}%
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-2.5 md:gap-3 lg:grid-cols-4">
          {progress.axes.map((axis) => (
            <AxisItem key={axis.id} axis={axis} focus={axis.id === weakest.id} />
          ))}
        </ul>
      </div>
    </Card>
  )
}
