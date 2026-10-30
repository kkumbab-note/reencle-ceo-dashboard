import { Bar, BarChart, CartesianGrid, Cell, LabelList, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { getAnnualRevenue, getMonthlyRevenue, getRevenueSummary } from '../../data/sales'
import { parseYearMonth } from '../../data/period'
import type { PublicSource, YearMonth } from '../../data/types'
import { formatDecimal, formatEok, formatSigned } from '../../lib/format'
import { Card, CardHeader } from '../cards/Card'
import { MockBadge, SourceInfo } from '../cards/SourceMark'
import { ChartTooltipBox, ChartTooltipRow, LegendItem } from './ChartTooltip'

const AXIS_TICK = { fontSize: 11, fill: 'var(--rc-text-subtle)' }

interface AnnualBar {
  label: string
  value: number
  meta: PublicSource | null
}

/**
 * 연도별(실제)과 월별(가상)은 크기 단위가 달라 한 축에 그리면 축이 두 개 필요해져요.
 * 그래서 같은 카드 안에 두 개의 차트로 나눠요.
 */
export function RevenueTrendCard({ asOf, className }: { asOf: YearMonth; className?: string }) {
  const { year, month } = parseYearMonth(asOf)
  const summary = getRevenueSummary(asOf)
  const annual = getAnnualRevenue()

  const bars: AnnualBar[] = [
    ...annual.map(({ year: y, value, ...meta }) => ({ label: String(y), value, meta })),
    { label: `${year} YTD`, value: summary.ytd, meta: null },
  ]

  const prevYear = getMonthlyRevenue(`${year - 1}-01`, `${year - 1}-12`).items
  const thisYear = getMonthlyRevenue(`${year}-01`, asOf).items
  const lines = prevYear.map((p, i) => ({
    label: `${i + 1}월`,
    prev: p.total,
    current: thisYear[i]?.total ?? null,
  }))
  const lastIndex = thisYear.length - 1
  const monthYoy = ((summary.month - prevYear[month - 1].total) / prevYear[month - 1].total) * 100

  return (
    <Card className={className}>
      <CardHeader title="매출 추이" to="/sales" />

      <div className="mb-1 flex items-center gap-1.5">
        <h3 className="text-xs font-semibold text-ink-muted">연매출</h3>
        <SourceInfo meta={annual[annual.length - 1]} />
        <span className="ml-auto flex gap-3">
          <LegendItem color="var(--rc-chart-1)" label="실제(공개)" shape="square" />
          <LegendItem color="var(--rc-chart-soft)" label={`가상 1~${month}월`} shape="square" />
        </span>
      </div>
      <BarChart
        responsive
        data={bars}
        margin={{ top: 22, right: 4, bottom: 0, left: 4 }}
        style={{ width: '100%', height: 150 }}
        accessibilityLayer
      >
        <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: 'var(--rc-border)' }} interval={0} />
        <YAxis hide domain={[0, (max: number) => max * 1.12]} />
        <Tooltip
          cursor={{ fill: 'var(--rc-surface-muted)' }}
          content={({ active, payload }) => {
            const bar = payload?.[0]?.payload as AnnualBar | undefined
            if (!active || !bar) return null
            return (
              <ChartTooltipBox title={bar.label}>
                <ChartTooltipRow label="매출" value={formatEok(bar.value)} />
                <p className="mt-1 max-w-52 text-ink-subtle">
                  {bar.meta ? `${bar.meta.sourceLabel} · ${bar.meta.asOf} 기준${bar.meta.note ? ` · ${bar.meta.note}` : ''}` : `가상 데이터 · 1~${month}월 누계`}
                </p>
              </ChartTooltipBox>
            )
          }}
        />
        <Bar dataKey="value" maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false}>
          {bars.map((b) => (
            <Cell key={b.label} fill={b.meta ? 'var(--rc-chart-1)' : 'var(--rc-chart-soft)'} />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            formatter={(v) => formatEok(Number(v))}
            style={{ fontSize: 11, fontWeight: 600, fill: 'var(--rc-text-muted)' }}
          />
        </Bar>
      </BarChart>

      <div className="mt-5 mb-1 flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="text-xs font-semibold text-ink-muted">월별 매출</h3>
        <MockBadge />
        <span className="ml-auto flex gap-3">
          <LegendItem color="var(--rc-chart-1)" label={String(year)} shape="line" />
          <LegendItem color="var(--rc-chart-compare)" label={String(year - 1)} shape="line" />
        </span>
      </div>
      <p className="mb-2 text-xs text-ink-subtle">
        {month}월 <span className="font-semibold text-ink">{formatEok(summary.month)}</span> · 전년 동월 대비 {formatSigned(monthYoy)}%
      </p>
      <LineChart
        responsive
        data={lines}
        margin={{ top: 6, right: 8, bottom: 0, left: 0 }}
        style={{ width: '100%', height: 150 }}
        accessibilityLayer
      >
        <CartesianGrid vertical={false} stroke="var(--rc-chart-grid)" />
        <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: 'var(--rc-border)' }} interval="preserveStartEnd" minTickGap={8} />
        <YAxis
          width={40}
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          tickCount={4}
          tickFormatter={(v: number) => `${formatDecimal(v / 100, 0)}억`}
        />
        <Tooltip
          cursor={{ stroke: 'var(--rc-border-strong)', strokeWidth: 1 }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            const row = payload[0].payload as (typeof lines)[number]
            return (
              <ChartTooltipBox title={label}>
                {row.current !== null && <ChartTooltipRow color="var(--rc-chart-1)" label={year} value={formatEok(row.current)} />}
                <ChartTooltipRow color="var(--rc-chart-compare)" label={year - 1} value={formatEok(row.prev)} />
                {row.current !== null && (
                  <ChartTooltipRow label="전년 대비" value={`${formatSigned(((row.current - row.prev) / row.prev) * 100)}%`} />
                )}
              </ChartTooltipBox>
            )
          }}
        />
        <Line
          dataKey="prev"
          stroke="var(--rc-chart-compare)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, stroke: 'var(--rc-surface)', strokeWidth: 2 }}
          isAnimationActive={false}
        />
        <Line
          dataKey="current"
          stroke="var(--rc-chart-1)"
          strokeWidth={2}
          connectNulls={false}
          isAnimationActive={false}
          activeDot={{ r: 5, stroke: 'var(--rc-surface)', strokeWidth: 2 }}
          dot={({ cx, cy, index }) =>
            index === lastIndex ? (
              <circle key="end" cx={cx} cy={cy} r={4.5} fill="var(--rc-chart-1)" stroke="var(--rc-surface)" strokeWidth={2} />
            ) : (
              <g key={index} />
            )
          }
        />
      </LineChart>
    </Card>
  )
}
