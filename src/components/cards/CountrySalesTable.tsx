import { Fragment, useState } from 'react'
import { ArrowDown, ArrowUp, ChevronRight } from 'lucide-react'
import type { getCountrySales } from '../../data/sales'
import type { RegionId } from '../../data/types'
import { cx } from '../../lib/cx'
import { formatDecimal, formatEok } from '../../lib/format'

type Country = ReturnType<typeof getCountrySales>['countries'][number]
type SortKey = 'name' | 'region' | 'value'

const REGION_LABEL: Record<RegionId, string> = { kr: '국내', na: '북미', jp: '일본', eu: 'EU', etc: '기타' }
const REGION_ORDER: RegionId[] = ['kr', 'na', 'jp', 'eu', 'etc']

/** 국가·채널별 매출 — 머리글을 눌러 정렬, 행을 눌러 채널을 펼쳐요 */
export function CountrySalesTable({ countries, total }: { countries: Country[]; total: number }) {
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: 'value', desc: true })
  const [open, setOpen] = useState<Set<string>>(new Set())

  const sorted = [...countries].sort((a, b) => {
    const diff =
      sort.key === 'value'
        ? a.value - b.value
        : sort.key === 'region'
          ? REGION_ORDER.indexOf(a.region) - REGION_ORDER.indexOf(b.region) || b.value - a.value
          : a.name.localeCompare(b.name, 'ko')
    return sort.desc ? -diff : diff
  })

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: key === 'value' }))

  const toggleRow = (code: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })

  const sortHeader = (k: SortKey, label: string, className?: string) => {
    const active = sort.key === k
    const Icon = sort.desc ? ArrowDown : ArrowUp
    return (
      <th scope="col" className={cx('py-2 font-medium', className)} aria-sort={active ? (sort.desc ? 'descending' : 'ascending') : 'none'}>
        <button
          type="button"
          onClick={() => toggleSort(k)}
          className={cx('-my-1 inline-flex min-h-7 min-w-7 items-center gap-1 transition-colors hover:text-ink', active && 'text-ink')}
        >
          {label}
          {active && <Icon className="size-3" aria-hidden="true" />}
        </button>
      </th>
    )
  }

  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-[19rem] text-sm">
        <caption className="sr-only">국가·채널별 매출 (연초 누계)</caption>
        <thead className="border-b border-border text-left text-xs text-ink-subtle">
          <tr>
            {sortHeader('name', '국가')}
            {sortHeader('region', '지역', 'hidden sm:table-cell')}
            {sortHeader('value', '매출', 'text-right')}
            <th scope="col" className="py-2 text-right font-medium">
              비중
            </th>
            <th scope="col" className="hidden py-2 pl-4 font-medium md:table-cell">
              주요 채널
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c) => {
            const expanded = open.has(c.code)
            const top = [...c.channels].sort((a, b) => b.value - a.value)[0]
            return (
              <Fragment key={c.code}>
                <tr className="border-b border-border">
                  <td className="py-2.5">
                    <button
                      type="button"
                      onClick={() => toggleRow(c.code)}
                      aria-expanded={expanded}
                      className="-my-1 inline-flex min-h-7 items-center gap-1 font-medium text-ink"
                    >
                      <ChevronRight
                        className={cx('size-3.5 text-ink-subtle transition-transform', expanded && 'rotate-90')}
                        aria-hidden="true"
                      />
                      {c.name}
                    </button>
                  </td>
                  <td className="hidden py-2.5 text-ink-muted sm:table-cell">{REGION_LABEL[c.region]}</td>
                  <td className="py-2.5 text-right font-semibold text-ink tabular">{formatEok(c.value)}</td>
                  <td className="py-2.5 text-right text-ink-muted tabular">{formatDecimal((c.value / total) * 100)}%</td>
                  <td className="hidden py-2.5 pl-4 text-xs text-ink-subtle md:table-cell">
                    {top.name} {formatDecimal((top.value / c.value) * 100, 0)}%
                  </td>
                </tr>
                {expanded &&
                  c.channels.map((ch) => (
                    <tr key={ch.name} className="border-b border-border bg-surface-muted text-xs">
                      <td className="py-2 pl-6 text-ink-muted">{ch.name}</td>
                      <td className="hidden sm:table-cell" />
                      <td className="py-2 text-right text-ink tabular">{formatEok(ch.value)}</td>
                      <td className="py-2 text-right text-ink-subtle tabular">
                        {formatDecimal((ch.value / c.value) * 100, 0)}%
                        <span className="sr-only"> (국가 내 비중)</span>
                      </td>
                      <td className="hidden md:table-cell" />
                    </tr>
                  ))}
              </Fragment>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="text-sm">
            <td className="pt-2.5 font-semibold text-ink">합계</td>
            <td className="hidden sm:table-cell" />
            <td className="pt-2.5 text-right font-semibold text-ink tabular">{formatEok(total)}</td>
            <td className="pt-2.5 text-right text-ink-muted tabular">100%</td>
            <td className="hidden md:table-cell" />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
