/** 품질·AS — 전부 가상 데이터 */
import { PRODUCT_LINEUP } from './company'
import { MONTHLY_LOYALTY } from './mock/customer'
import { MONTHLY_UNITS } from './mock/sales'
import { MONTHLY_AS, MONTHLY_DEFECTS } from './mock/quality'
import { MODEL_IDS } from './sales'
import { addMonths, FIRST_MONTH, LATEST_MONTH, monthRange, ytdMonths } from './period'
import type { ModelId, YearMonth } from './types'
import { allocate, mock, rowFor, rowsFor, sum, sumRecord, sumRows, weightedAverage } from './util'

/** 모델 경보 기준 — 초기불량률 % */
export const MODEL_DEFECT_ALERT = 1.0

/** 고장 유형 구성비 % (2026 연초 누계, 가상). 합 = 100 */
export const FAILURE_MIX = [
  { type: '교반 모터 이상', share: 27 },
  { type: '센서·냄새 경보 오류', share: 21 },
  { type: '히터·온도 이상', share: 15 },
  { type: '앱·Wi-Fi 연결', share: 12 },
  { type: '소음·진동', share: 9 },
  { type: '기타', share: 16 },
]

function rate(defects: number, units: number): number {
  return units === 0 ? 0 : (defects / units) * 100
}

function defectRateOf(months: YearMonth[], model?: ModelId): number {
  const keys = model ? [model] : MODEL_IDS
  const defects = sumRecord(sumRows(rowsFor(MONTHLY_DEFECTS, months), keys), keys)
  const units = sumRecord(sumRows(rowsFor(MONTHLY_UNITS, months), keys), keys)
  return rate(defects, units)
}

/** 월별 초기불량률 (%) — 전체와 모델별 */
export function getDefectRateTrend(from: YearMonth = FIRST_MONTH, to: YearMonth = LATEST_MONTH) {
  return {
    ...mock('판매 후 30일 내 불량 건수 ÷ 판매대수'),
    items: monthRange(from, to).map((month) => ({
      month,
      overall: defectRateOf([month]),
      byModel: Object.fromEntries(MODEL_IDS.map((m) => [m, defectRateOf([month], m)])) as Record<ModelId, number>,
    })),
  }
}

export function getDefectRate(asOf: YearMonth = LATEST_MONTH) {
  return {
    ...mock(),
    asOf,
    ytd: defectRateOf(ytdMonths(asOf)),
    month: defectRateOf([asOf]),
    prevMonth: defectRateOf([addMonths(asOf, -1)]),
  }
}

/** 모델별 초기불량률 — 기준월과 YTD */
export function getDefectByModel(asOf: YearMonth = LATEST_MONTH) {
  const months = ytdMonths(asOf)
  return {
    ...mock(),
    asOf,
    alertThreshold: MODEL_DEFECT_ALERT,
    overallYtd: defectRateOf(months),
    items: PRODUCT_LINEUP.map(({ id, name }) => ({
      id,
      name,
      ytd: defectRateOf(months, id),
      month: defectRateOf([asOf], id),
    })),
  }
}

/** AS 퍼널 — 기준월과 YTD 합계 */
export function getAsFunnel(asOf: YearMonth = LATEST_MONTH) {
  const stages = ['received', 'diagnosed', 'repaired', 'closed'] as const
  const labels = { received: '접수', diagnosed: '진단', repaired: '수리·교체', closed: '처리완료' }
  const month = rowFor(MONTHLY_AS, asOf)
  const ytd = sumRows(rowsFor(MONTHLY_AS, ytdMonths(asOf)), stages)
  return {
    ...mock(),
    asOf,
    stages: stages.map((s) => ({ id: s, label: labels[s], month: month[s], ytd: ytd[s] })),
  }
}

/** AS 평균 처리일 — 기준월과 YTD(처리완료 건수 가중) */
export function getAsDays(asOf: YearMonth = LATEST_MONTH) {
  const ytdRows = rowsFor(MONTHLY_AS, ytdMonths(asOf))
  return {
    ...mock(),
    asOf,
    month: rowFor(MONTHLY_AS, asOf).avgDays,
    prevMonth: rowFor(MONTHLY_AS, addMonths(asOf, -1)).avgDays,
    ytd: weightedAverage(ytdRows.map((r) => ({ value: r.avgDays, weight: r.closed }))),
  }
}

export function getAsTrend(from: YearMonth = FIRST_MONTH, to: YearMonth = LATEST_MONTH) {
  return { ...mock(), items: rowsFor(MONTHLY_AS, monthRange(from, to)) }
}

/** 고장 유형 (YTD) — 진단 건수를 구성비대로 나누고 파레토 누적 % 를 붙여요 */
export function getFailureTypes(asOf: YearMonth = LATEST_MONTH) {
  const diagnosed = sum(rowsFor(MONTHLY_AS, ytdMonths(asOf)).map((r) => r.diagnosed))
  const counts = allocate(diagnosed, FAILURE_MIX.map((f) => f.share))
  let running = 0
  return {
    ...mock(),
    asOf,
    total: diagnosed,
    items: FAILURE_MIX.map((f, i) => {
      running += counts[i]
      return { type: f.type, count: counts[i], share: (counts[i] / diagnosed) * 100, cumulativeShare: (running / diagnosed) * 100 }
    }),
  }
}

/** 필터·미생물 교체 주기 준수율 (%) */
export function getReplacementCompliance(from: YearMonth = FIRST_MONTH, to: YearMonth = LATEST_MONTH) {
  return {
    ...mock(),
    items: rowsFor(MONTHLY_LOYALTY, monthRange(from, to)).map(({ month, replacementCompliance }) => ({
      month,
      value: replacementCompliance,
    })),
  }
}
