import { CartesianGrid, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import { AXIS_LINE, AXIS_TICK, GRID_STROKE, monthTick, monthTitle } from './common'
import { ChartTooltipBox, ChartTooltipRow, LegendItem } from './ChartTooltip'

export interface LineSeries {
  key: string
  label: string
  color: string
}

export type MonthlyRow = { month: string } & Record<string, number | string | null>

interface MonthlyLineChartProps {
  data: MonthlyRow[]
  series: LineSeries[]
  /** 툴팁 값 표시 */
  format: (value: number) => string
  /** 축 눈금 표시 (없으면 format) */
  axisFormat?: (value: number) => string
  domain?: [number, number | 'auto']
  /** 목표선·경보선 — 실선 헤어라인 + 이름 */
  reference?: { value: number; label: string; color?: string }
  height?: number
}

/** 월별 선 차트 — 2개 이상이면 범례, 마지막 점에만 표시 */
export function MonthlyLineChart({ data, series, format, axisFormat, domain, reference, height = 200 }: MonthlyLineChartProps) {
  const upper = (dataMax: number) => Math.max(dataMax, reference?.value ?? dataMax) * 1.08
  const yDomain: [number, number | 'auto' | ((max: number) => number)] = domain
    ? [domain[0], domain[1] === 'auto' ? upper : domain[1]]
    : [0, upper]

  return (
    <div>
      {series.length > 1 && (
        <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1">
          {series.map((s) => (
            <LegendItem key={s.key} color={s.color} label={s.label} shape="line" />
          ))}
        </div>
      )}
      <LineChart
        responsive
        data={data}
        margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
        style={{ width: '100%', height }}
        accessibilityLayer
      >
        <CartesianGrid vertical={false} stroke={GRID_STROKE} />
        <XAxis
          dataKey="month"
          tickFormatter={monthTick}
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={AXIS_LINE}
          interval="preserveStartEnd"
          minTickGap={16}
        />
        <YAxis
          width={44}
          domain={yDomain}
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          tickCount={5}
          tickFormatter={axisFormat ?? format}
        />
        {reference && (
          <ReferenceLine
            y={reference.value}
            stroke={reference.color ?? 'var(--rc-important)'}
            strokeWidth={1}
            ifOverflow="extendDomain"
            label={{
              value: reference.label,
              position: 'insideTopRight',
              fontSize: 11,
              fill: 'var(--rc-text-muted)',
            }}
          />
        )}
        <Tooltip
          cursor={{ stroke: 'var(--rc-border-strong)', strokeWidth: 1 }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            const row = payload[0].payload as MonthlyRow
            return (
              <ChartTooltipBox title={monthTitle(String(label))}>
                {series.map((s) =>
                  typeof row[s.key] === 'number' ? (
                    <ChartTooltipRow key={s.key} color={s.color} label={s.label} value={format(row[s.key] as number)} />
                  ) : null,
                )}
                {reference && <ChartTooltipRow label={reference.label} value={format(reference.value)} />}
              </ChartTooltipBox>
            )
          }}
        />
        {series.map((s) => {
          const lastIndex = data.findLastIndex((row) => typeof row[s.key] === 'number')
          return (
            <Line
              key={s.key}
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              isAnimationActive={false}
              activeDot={{ r: 5, stroke: 'var(--rc-surface)', strokeWidth: 2 }}
              dot={({ cx, cy, index }) =>
                index === lastIndex ? (
                  <circle key={`end-${s.key}`} cx={cx} cy={cy} r={4.5} fill={s.color} stroke="var(--rc-surface)" strokeWidth={2} />
                ) : (
                  <g key={`${s.key}-${index}`} />
                )
              }
            />
          )
        })}
      </LineChart>
    </div>
  )
}
