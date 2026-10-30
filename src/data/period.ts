import type { YearMonth } from './types'

/** 대시보드 기준일 */
export const BASE_DATE = '2026-10-30'
/** 데이터가 있는 마지막 달 */
export const LATEST_MONTH: YearMonth = '2026-10'
/** 데이터가 있는 첫 달 (전년 비교용 2025년부터) */
export const FIRST_MONTH: YearMonth = '2025-01'

export function toYearMonth(year: number, month: number): YearMonth {
  return `${year}-${String(month).padStart(2, '0')}`
}

export function parseYearMonth(ym: YearMonth): { year: number; month: number } {
  const [year, month] = ym.split('-').map(Number)
  return { year, month }
}

export function addMonths(ym: YearMonth, delta: number): YearMonth {
  const { year, month } = parseYearMonth(ym)
  const index = year * 12 + (month - 1) + delta
  return toYearMonth(Math.floor(index / 12), (index % 12) + 1)
}

/** from ~ to (양 끝 포함) */
export function monthRange(from: YearMonth, to: YearMonth): YearMonth[] {
  const months: YearMonth[] = []
  for (let ym = from; ym <= to; ym = addMonths(ym, 1)) months.push(ym)
  return months
}

/** 그해 1월 ~ ym */
export function ytdMonths(ym: YearMonth): YearMonth[] {
  return monthRange(toYearMonth(parseYearMonth(ym).year, 1), ym)
}

/** ym 을 끝으로 하는 최근 12개월 */
export function ltmMonths(ym: YearMonth): YearMonth[] {
  return monthRange(addMonths(ym, -11), ym)
}

export function sameMonthLastYear(ym: YearMonth): YearMonth {
  return addMonths(ym, -12)
}

export function daysInMonth(ym: YearMonth): number {
  const { year, month } = parseYearMonth(ym)
  return new Date(year, month, 0).getDate()
}

/** 기준일 변경에서 고를 수 있는 달 (2026-01 ~ 최신월) */
export function selectableMonths(): YearMonth[] {
  return monthRange('2026-01', LATEST_MONTH)
}
