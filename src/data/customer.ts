/** 고객 — 전부 가상 데이터. 고객충성도 수상은 company.ts 의 공개값을 써요. */
import { MONTHLY_LOYALTY, MONTHLY_NPS, MONTHLY_RATINGS } from './mock/customer'
import { addMonths, FIRST_MONTH, LATEST_MONTH, monthRange, sameMonthLastYear, ytdMonths } from './period'
import type { MonthlyNpsRow, RatingChannelId, YearMonth } from './types'
import { mock, rowFor, rowsFor, sum, weightedAverage } from './util'

export const RATING_CHANNELS: Array<{ id: RatingChannelId; label: string }> = [
  { id: 'naver', label: '네이버' },
  { id: 'coupang', label: '쿠팡' },
  { id: 'amazon', label: '아마존(US)' },
]
const CHANNEL_IDS = RATING_CHANNELS.map((c) => c.id)

/** 평점 경보 기준선 */
export const RATING_ALERT_THRESHOLD = 4.5

/** 리뷰 키워드 상위 (2026 연초 누계, 가상) */
const REVIEW_KEYWORDS = [
  { keyword: '냄새 없음', count: 1_840, sentiment: 'positive' },
  { keyword: '감량 효과', count: 1_520, sentiment: 'positive' },
  { keyword: '소음', count: 960, sentiment: 'negative' },
  { keyword: '초파리', count: 610, sentiment: 'negative' },
  { keyword: '미생물 관리', count: 540, sentiment: 'neutral' },
  { keyword: '디자인', count: 480, sentiment: 'positive' },
  { keyword: '앱 연동', count: 350, sentiment: 'neutral' },
  { keyword: '가격', count: 330, sentiment: 'negative' },
] as const

export function npsOf(row: MonthlyNpsRow): number {
  return row.promoters - row.detractors
}

export function getNpsTrend(from: YearMonth = FIRST_MONTH, to: YearMonth = LATEST_MONTH) {
  return {
    ...mock(),
    items: rowsFor(MONTHLY_NPS, monthRange(from, to)).map((row) => ({ ...row, nps: npsOf(row) })),
  }
}

export function getNps(asOf: YearMonth = LATEST_MONTH) {
  const row = rowFor(MONTHLY_NPS, asOf)
  return {
    ...mock(),
    ...row,
    value: npsOf(row),
    prevMonth: npsOf(rowFor(MONTHLY_NPS, addMonths(asOf, -1))),
    yearAgo: npsOf(rowFor(MONTHLY_NPS, sameMonthLastYear(asOf))),
  }
}

/** 채널별 평점 — 기준월 값과 연초 누계(리뷰 수 가중) */
export function getChannelRatings(asOf: YearMonth = LATEST_MONTH) {
  const ytdRows = rowsFor(MONTHLY_RATINGS, ytdMonths(asOf))
  const current = rowFor(MONTHLY_RATINGS, asOf)
  const previous = rowFor(MONTHLY_RATINGS, addMonths(asOf, -1))
  const channels = RATING_CHANNELS.map(({ id, label }) => ({
    id,
    label,
    month: current[id].rating,
    prevMonth: previous[id].rating,
    ytd: weightedAverage(ytdRows.map((r) => ({ value: r[id].rating, weight: r[id].reviews }))),
    reviewsYtd: sum(ytdRows.map((r) => r[id].reviews)),
  }))
  return {
    ...mock(),
    asOf,
    alertThreshold: RATING_ALERT_THRESHOLD,
    channels,
    overallYtd: weightedAverage(
      ytdRows.flatMap((r) => CHANNEL_IDS.map((id) => ({ value: r[id].rating, weight: r[id].reviews }))),
    ),
  }
}

export function getRatingTrend(from: YearMonth = FIRST_MONTH, to: YearMonth = LATEST_MONTH) {
  return { ...mock(), items: rowsFor(MONTHLY_RATINGS, monthRange(from, to)) }
}

export function getReviewKeywords() {
  return { ...mock('2026 연초 누계 기준'), items: REVIEW_KEYWORDS }
}

/** 소모품 재구매율 (%) */
export function getRepurchaseTrend(from: YearMonth = FIRST_MONTH, to: YearMonth = LATEST_MONTH) {
  return {
    ...mock(),
    items: rowsFor(MONTHLY_LOYALTY, monthRange(from, to)).map(({ month, repurchaseRate }) => ({ month, value: repurchaseRate })),
  }
}
