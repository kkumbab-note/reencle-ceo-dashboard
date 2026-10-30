import { Link } from 'react-router'
import { AlertTriangle, ChevronRight, Flag, Info, type LucideIcon } from 'lucide-react'
import { getBriefing, type BriefingLevel } from '../../data/dashboard'
import type { YearMonth } from '../../data/types'
import { cx } from '../../lib/cx'
import { Card, CardHeader } from './Card'
import { MockBadge } from './SourceMark'

export const LEVEL_STYLE: Record<BriefingLevel, { label: string; icon: LucideIcon; chip: string }> = {
  urgent: { label: '긴급', icon: AlertTriangle, chip: 'bg-urgent-soft text-urgent' },
  important: { label: '중요', icon: Flag, chip: 'bg-important-soft text-important' },
  normal: { label: '일반', icon: Info, chip: 'bg-normal-soft text-normal' },
}

export function BriefingCard({ asOf, className }: { asOf: YearMonth; className?: string }) {
  const briefing = getBriefing(asOf)
  const counts = briefing.items.reduce<Partial<Record<BriefingLevel, number>>>(
    (acc, item) => ({ ...acc, [item.level]: (acc[item.level] ?? 0) + 1 }),
    {},
  )

  return (
    <Card className={className}>
      <CardHeader
        title="오늘의 CEO 브리핑"
        badge={<MockBadge />}
        aside={
          <span className="text-xs text-ink-subtle">
            {(['urgent', 'important'] as const)
              .filter((level) => counts[level])
              .map((level) => `${LEVEL_STYLE[level].label} ${counts[level]}`)
              .join(' · ')}
          </span>
        }
      />
      <ul className="-mx-2 flex flex-col">
        {briefing.items.map((item) => {
          const style = LEVEL_STYLE[item.level]
          const Icon = style.icon
          return (
            <li key={item.title}>
              <Link
                to={item.path}
                className="group flex items-start gap-3 rounded-control px-2 py-2.5 transition-colors hover:bg-surface-muted"
              >
                <span
                  className={cx(
                    'mt-px inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                    style.chip,
                  )}
                >
                  <Icon className="size-3" strokeWidth={2.5} aria-hidden="true" />
                  {style.label}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm leading-snug font-medium text-ink">{item.title}</span>
                  <span className="mt-0.5 block text-xs text-ink-subtle">{item.detail}</span>
                </span>
                <ChevronRight
                  className="mt-0.5 size-4 shrink-0 text-ink-subtle opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
