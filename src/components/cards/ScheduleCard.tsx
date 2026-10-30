import { getSchedule } from '../../data/dashboard'
import type { YearMonth } from '../../data/types'
import { cx } from '../../lib/cx'
import { Card, CardHeader } from './Card'
import { MockBadge } from './SourceMark'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function shortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, '0')} (${WEEKDAYS[d.getDay()]})`
}

export function ScheduleCard({ asOf, className }: { asOf: YearMonth; className?: string }) {
  const schedule = getSchedule(asOf)

  return (
    <Card className={className}>
      <CardHeader title="주요 일정" badge={<MockBadge />} />
      <ul className="flex flex-1 flex-col divide-y divide-border">
        {schedule.items.map((item) => {
          const soon = item.dDay <= 7
          return (
            <li key={item.date + item.title} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <span
                className={cx(
                  'w-14 shrink-0 rounded-control py-1.5 text-center text-xs font-bold tabular',
                  soon ? 'bg-urgent-soft text-urgent' : 'bg-surface-muted text-ink-muted',
                )}
              >
                {item.dDay === 0 ? 'D-day' : `D-${item.dDay}`}
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm leading-snug font-medium text-ink" title={item.title}>
                  {item.title}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-subtle">
                  {shortDate(item.date)}
                  <span className="rounded border border-border px-1 text-[10px] leading-4">{item.type}</span>
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
