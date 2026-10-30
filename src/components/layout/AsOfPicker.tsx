import { CalendarDays, ChevronDown } from 'lucide-react'
import { LATEST_MONTH, parseYearMonth, selectableMonths } from '../../data/period'
import { useAsOf } from '../../state/AsOfContext'

function monthLabel(ym: string): string {
  const { year, month } = parseYearMonth(ym)
  return `${year}년 ${month}월${ym === LATEST_MONTH ? ' (최신)' : ''}`
}

/** 기준일 변경 — 월 단위로 고르면 모든 화면이 그 시점으로 다시 계산돼요 */
export function AsOfPicker() {
  const { asOf, setAsOf } = useAsOf()

  return (
    // select 가 테두리 전체를 차지해서 어디를 눌러도 열려요 (모바일 터치 영역 40px)
    <label
      title="기준일 변경"
      className="relative flex h-10 items-center rounded-control border border-border bg-surface text-sm font-medium text-ink-muted shadow-card transition-colors focus-within:border-primary hover:text-ink"
    >
      <CalendarDays className="pointer-events-none absolute left-3 size-4" aria-hidden="true" />
      <select
        aria-label="기준일 변경"
        value={asOf}
        onChange={(e) => setAsOf(e.target.value)}
        className="h-full cursor-pointer appearance-none rounded-control bg-transparent pr-8 pl-9 outline-none"
      >
        {[...selectableMonths()].reverse().map((m) => (
          <option key={m} value={m}>
            {monthLabel(m)}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 size-4 text-ink-subtle" aria-hidden="true" />
    </label>
  )
}
