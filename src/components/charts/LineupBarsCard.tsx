import { getUnitsByModel } from '../../data/sales'
import type { YearMonth } from '../../data/types'
import { formatInt } from '../../lib/format'
import { Card, CardHeader } from '../cards/Card'
import { DeltaText } from '../cards/DeltaText'
import { MockBadge } from '../cards/SourceMark'
import { percentDelta } from '../../data/util'

/** 제품 라인업별 판매대수 (YTD) — 한 계열이라 한 색, 큰 순서로 정렬 */
export function LineupBarsCard({ asOf, className }: { asOf: YearMonth; className?: string }) {
  const units = getUnitsByModel(asOf)
  const items = [...units.items].sort((a, b) => b.value - a.value)
  const max = items[0]?.value ?? 1

  return (
    <Card className={className}>
      <CardHeader title="제품 라인업별 판매" badge={<MockBadge />} to="/sales" />
      <p className="-mt-2 mb-4 text-xs text-ink-subtle">연초 누계 {formatInt(units.total)}대</p>

      <ul className="flex flex-1 flex-col justify-around gap-3.5">
        {items.map((item) => (
          <li key={item.id} className="grid grid-cols-[4.5rem_1fr] items-center gap-x-3 gap-y-1">
            <span className="truncate text-sm text-ink-muted">{item.name}</span>
            <div className="flex items-center gap-2">
              <div className="h-3 flex-1">
                <div
                  className="h-full rounded-r-[4px] bg-chart-1"
                  style={{ width: `${(item.value / max) * 100}%` }}
                  title={`${item.name} ${formatInt(item.value)}대 · 전년 동기 ${formatInt(item.prevYear)}대`}
                />
              </div>
            </div>
            <span />
            <span className="flex items-center gap-3">
              <span className="text-sm font-semibold text-ink tabular">{formatInt(item.value)}대</span>
              <DeltaText label="전년" delta={percentDelta(item.value, item.prevYear, '전년 동기 대비')} />
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
