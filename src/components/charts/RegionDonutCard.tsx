import { Cell, Pie, PieChart, Tooltip } from 'recharts'
import { getRegionBreakdown } from '../../data/sales'
import type { RegionId, YearMonth } from '../../data/types'
import { formatDecimal, formatEok } from '../../lib/format'
import { Card, CardHeader } from '../cards/Card'
import { MockBadge } from '../cards/SourceMark'
import { ChartTooltipBox, ChartTooltipRow } from './ChartTooltip'

/** 지역 색은 지역에 고정돼요 (순위로 바뀌지 않음) */
export const REGION_COLORS: Record<RegionId, string> = {
  kr: 'var(--rc-chart-1)',
  na: 'var(--rc-chart-2)',
  jp: 'var(--rc-chart-3)',
  eu: 'var(--rc-chart-4)',
  etc: 'var(--rc-chart-5)',
}

export function RegionDonutCard({ asOf, className }: { asOf: YearMonth; className?: string }) {
  const breakdown = getRegionBreakdown(asOf)
  const overseasShare = 100 - (breakdown.items.find((i) => i.id === 'kr')?.share ?? 0)

  return (
    <Card className={className}>
      <CardHeader title="지역별 매출 구성" badge={<MockBadge />} to="/sales" />
      <p className="-mt-2 mb-4 text-xs text-ink-subtle">연초 누계 {formatEok(breakdown.total)}</p>

      {/* 카드가 넓은 모바일 가로(640~767px)에서만 도넛·표를 나란히, 나머지는 위아래로 */}
      <div className="flex flex-1 flex-col items-center gap-4 sm:max-md:flex-row sm:max-md:gap-6">
        <div className="relative size-40 shrink-0">
          <PieChart style={{ width: 160, height: 160 }} accessibilityLayer>
            <Pie
              data={breakdown.items}
              dataKey="value"
              nameKey="label"
              innerRadius={54}
              outerRadius={78}
              startAngle={90}
              endAngle={-270}
              stroke="var(--rc-surface)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {breakdown.items.map((item) => (
                <Cell key={item.id} fill={REGION_COLORS[item.id]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                const item = payload?.[0]?.payload as (typeof breakdown.items)[number] | undefined
                if (!active || !item) return null
                return (
                  <ChartTooltipBox title={item.label}>
                    <ChartTooltipRow color={REGION_COLORS[item.id]} label="매출" value={formatEok(item.value)} />
                    <ChartTooltipRow label="비중" value={`${formatDecimal(item.share)}%`} />
                  </ChartTooltipBox>
                )
              }}
            />
          </PieChart>
          <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
            <span className="text-[11px] text-ink-subtle">해외 비중</span>
            <span className="text-lg leading-tight font-bold text-ink">{formatDecimal(overseasShare)}%</span>
          </div>
        </div>

        {/* 범례 겸 표 — 색만으로 구분하지 않도록 이름·비중·금액을 함께 보여줘요 */}
        <table className="w-full text-sm">
          <caption className="sr-only">지역별 매출 (연초 누계)</caption>
          <tbody>
            {breakdown.items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <th scope="row" className="py-1.5 text-left font-normal text-ink-muted">
                  <span className="inline-flex items-center gap-2">
                    <span className="size-2.5 rounded-[3px]" style={{ background: REGION_COLORS[item.id] }} />
                    {item.label}
                  </span>
                </th>
                <td className="py-1.5 text-right font-semibold whitespace-nowrap text-ink tabular">{formatDecimal(item.share)}%</td>
                <td className="w-20 py-1.5 pl-3 text-right text-xs whitespace-nowrap text-ink-subtle tabular">{formatEok(item.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
