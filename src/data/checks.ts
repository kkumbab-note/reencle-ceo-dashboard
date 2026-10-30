/**
 * 데이터 정합성 체크 — 가상 데이터를 고치거나 실제 데이터로 바꿀 때 합계가 어긋나지 않았는지 확인해요.
 * `npm test` 로 돌리고, 개발 서버에선 시작할 때 콘솔에 결과를 남겨요.
 */
import { ANNUAL_REVENUE, CUMULATIVE_UNITS_ANCHOR } from './company'
import { getReductionTrend, REDUCTION_BEFORE_2025 } from './esg'
import { AXES } from './goals'
import { MONTHLY_LOYALTY, MONTHLY_NPS, MONTHLY_RATINGS } from './mock/customer'
import { MONTHLY_ACTIVE_DEVICES } from './mock/esg'
import { MONTHLY_AS, MONTHLY_DEFECTS } from './mock/quality'
import { MONTHLY_REVENUE, MONTHLY_UNITS } from './mock/sales'
import { addMonths, FIRST_MONTH, LATEST_MONTH, monthRange, selectableMonths } from './period'
import { getWorldNo1Progress } from './progress'
import { FAILURE_MIX, getFailureTypes } from './quality'
import {
  COUNTRY_MIX,
  cumulativeUnits,
  getCountrySales,
  getMonthlyRevenue,
  getRegionBreakdown,
  getRevenueSummary,
  MODEL_IDS,
  REGION_IDS,
} from './sales'
import type { YearMonth } from './types'
import { rowFor, sum, sumRecord } from './util'

export interface CheckResult {
  name: string
  ok: boolean
  detail: string
}

const EPSILON = 1e-9

export function runDataChecks(): CheckResult[] {
  const results: CheckResult[] = []
  const check = (name: string, ok: boolean, detail = '') => results.push({ name, ok, detail })
  const months = monthRange(FIRST_MONTH, LATEST_MONTH)
  const failingMonths = (predicate: (m: YearMonth) => boolean, list = months) => list.filter((m) => !predicate(m))
  const describeFailures = (failed: YearMonth[]) => (failed.length ? `어긋난 달: ${failed.join(', ')}` : '')

  // 1. 월별 표가 같은 기간을 빠짐없이 가짐
  const tables = {
    MONTHLY_REVENUE,
    MONTHLY_UNITS,
    MONTHLY_DEFECTS,
    MONTHLY_AS,
    MONTHLY_NPS,
    MONTHLY_RATINGS,
    MONTHLY_LOYALTY,
    MONTHLY_ACTIVE_DEVICES,
  }
  for (const [name, rows] of Object.entries(tables)) {
    const tableMonths = rows.map((r) => r.month)
    check(`${name}: ${FIRST_MONTH}~${LATEST_MONTH} 빠짐없음`, tableMonths.join() === months.join(), `${tableMonths.length}개월`)
  }

  // 2. 2025 월별 매출 합계 = 공개 연매출
  const annual2025 = ANNUAL_REVENUE.find((r) => r.year === 2025)?.value ?? NaN
  const monthly2025 = sum(getMonthlyRevenue('2025-01', '2025-12').items.map((i) => i.total))
  check('2025 월별 매출 합계 = 공개 연매출(314.1억)', monthly2025 === annual2025, `${monthly2025} / ${annual2025} 백만원`)

  // 3. YTD 매출 = 지역 합 = 국가 합 = 채널 합 (고를 수 있는 모든 기준월)
  const revenueMismatch = failingMonths((m) => {
    const ytd = getRevenueSummary(m).ytd
    const regions = getRegionBreakdown(m)
    const countries = getCountrySales(m).countries
    return (
      regions.total === ytd &&
      sum(regions.items.map((r) => r.value)) === ytd &&
      sum(countries.map((c) => c.value)) === ytd &&
      sum(countries.flatMap((c) => c.channels.map((ch) => ch.value))) === ytd
    )
  }, selectableMonths())
  check('YTD 매출 = 지역 합 = 국가 합 = 채널 합', revenueMismatch.length === 0, describeFailures(revenueMismatch))

  // 4. 구성비 합 = 100
  for (const region of REGION_IDS) {
    const total = sum(COUNTRY_MIX.filter((c) => c.region === region).map((c) => c.share))
    check(`국가 구성비 합 = 100 (${region})`, total === 100, `${total}`)
  }
  const badChannels = COUNTRY_MIX.filter((c) => sum(c.channels.map((ch) => ch.share)) !== 100).map((c) => c.name)
  check('국가별 채널 구성비 합 = 100', badChannels.length === 0, badChannels.join(', '))
  check('고장 유형 구성비 합 = 100', sum(FAILURE_MIX.map((f) => f.share)) === 100)
  check('진척도 축 가중치 합 = 1', Math.abs(sum(AXES.map((a) => a.weight)) - 1) < EPSILON)

  // 5. 고장 유형 건수 합 = 진단 건수
  const failureMismatch = failingMonths((m) => {
    const f = getFailureTypes(m)
    return sum(f.items.map((i) => i.count)) === f.total
  }, selectableMonths())
  check('고장 유형 건수 합 = AS 진단 건수', failureMismatch.length === 0, describeFailures(failureMismatch))

  // 6. NPS 응답 구성 합 = 100
  const npsBad = failingMonths((m) => {
    const r = rowFor(MONTHLY_NPS, m)
    return r.promoters + r.passives + r.detractors === 100 && [r.promoters, r.passives, r.detractors].every((v) => v >= 0)
  })
  check('NPS 추천+중립+비추천 = 100%', npsBad.length === 0, describeFailures(npsBad))

  // 7. AS 퍼널은 단계마다 같거나 줄어듦
  const funnelBad = failingMonths((m) => {
    const r = rowFor(MONTHLY_AS, m)
    return r.received >= r.diagnosed && r.diagnosed >= r.repaired && r.repaired >= r.closed && r.avgDays > 0
  })
  check('AS 퍼널: 접수 ≥ 진단 ≥ 수리 ≥ 처리완료', funnelBad.length === 0, describeFailures(funnelBad))

  // 8. 초기불량 건수 ≤ 판매대수
  const defectBad = failingMonths((m) => {
    const d = rowFor(MONTHLY_DEFECTS, m)
    const u = rowFor(MONTHLY_UNITS, m)
    return MODEL_IDS.every((id) => d[id] >= 0 && d[id] <= u[id])
  })
  check('모델별 초기불량 건수 ≤ 판매대수', defectBad.length === 0, describeFailures(defectBad))

  // 9. 평점은 1~5
  const ratingBad = failingMonths((m) => {
    const r = rowFor(MONTHLY_RATINGS, m)
    return [r.naver, r.coupang, r.amazon].every((c) => c.rating >= 1 && c.rating <= 5 && c.reviews >= 0)
  })
  check('채널 평점 1~5 범위', ratingBad.length === 0, describeFailures(ratingBad))

  // 10. 누적 판매대수: 기준점 = 공개값, 매달 늘어남
  check(
    '누적 판매대수 2026-05 = 공개값 30만 대',
    cumulativeUnits(CUMULATIVE_UNITS_ANCHOR.month) === CUMULATIVE_UNITS_ANCHOR.value,
    `${cumulativeUnits(CUMULATIVE_UNITS_ANCHOR.month)}`,
  )
  const unitsNotIncreasing = failingMonths((m) => m === FIRST_MONTH || cumulativeUnits(m) > cumulativeUnits(addMonths(m, -1)))
  check('누적 판매대수는 매달 증가', unitsNotIncreasing.length === 0, describeFailures(unitsNotIncreasing))

  // 11. 활성 기기 ≤ 누적 판매대수
  const activeBad = failingMonths((m) => sumRecord(rowFor(MONTHLY_ACTIVE_DEVICES, m), REGION_IDS) <= cumulativeUnits(m))
  check('활성 기기 ≤ 누적 판매대수', activeBad.length === 0, describeFailures(activeBad))

  // 12. 누적 감량 = 2024년 말 누적 + 월별 감량 합
  const trend = getReductionTrend().items
  const reductionBad = trend
    .filter((item, i) => item.cumulative !== REDUCTION_BEFORE_2025 + sum(trend.slice(0, i + 1).map((t) => t.tons)))
    .map((t) => t.month)
  check('누적 감량 = 2024년 말 누적 + 월별 감량 합', reductionBad.length === 0, describeFailures(reductionBad))

  // 13. 진척도 종합 = 축 점수 가중합, 0~100
  const progressBad = failingMonths((m) => {
    const p = getWorldNo1Progress(m)
    const weighted = sum(p.axes.map((a) => a.score * a.weight))
    return Math.abs(p.overall - weighted) < EPSILON && p.overall >= 0 && p.overall <= 100
  }, selectableMonths())
  check('진척도 종합 = 축 점수 가중합 (0~100)', progressBad.length === 0, describeFailures(progressBad))

  return results
}

/** 개발 서버 시작 시 콘솔에 결과 출력 */
export function reportDataChecks(): void {
  const results = runDataChecks()
  const failed = results.filter((r) => !r.ok)
  if (failed.length === 0) console.info(`[data] 정합성 체크 ${results.length}개 모두 통과`)
  else console.error(`[data] 정합성 체크 ${failed.length}/${results.length}개 실패`, failed)
}
