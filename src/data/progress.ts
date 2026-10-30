/**
 * World No.1 진척도
 * - KPI 달성률 = 현재 ÷ 목표 (작을수록 좋은 지표는 목표 ÷ 현재), 최대 100%
 * - 축 점수 = 그 축 KPI 달성률의 평균
 * - 종합 점수 = 축 점수 × 가중치(goals.ts) 의 합
 */
import { getChannelRatings, getNps } from './customer'
import { cumulativeReduction } from './esg'
import { AXES, GOALS, type AxisId, type GoalId } from './goals'
import { LATEST_MONTH } from './period'
import { getAsDays, getDefectRate } from './quality'
import { getMarketCountries, getOverseasShare, getRevenueSummary } from './sales'
import type { YearMonth } from './types'
import { achievement, mock, sum } from './util'

function currentValues(asOf: YearMonth): Record<GoalId, number> {
  return {
    revenue: getRevenueSummary(asOf).ltm,
    overseasShare: getOverseasShare(asOf).ytd,
    countries: getMarketCountries().count,
    nps: getNps(asOf).value,
    rating: getChannelRatings(asOf).overallYtd,
    defectRate: getDefectRate(asOf).ytd,
    asDays: getAsDays(asOf).ytd,
    cumulativeReduction: cumulativeReduction(asOf),
  }
}

export interface AxisProgress {
  id: AxisId
  label: string
  weight: number
  path: string
  /** 0~100 */
  score: number
  kpis: Array<{
    goalId: GoalId
    label: string
    shortLabel: string
    current: number
    target: number
    unit: string
    basis: string
    direction: 'higher' | 'lower'
    /** 0~100 */
    achievement: number
  }>
}

export function getWorldNo1Progress(asOf: YearMonth = LATEST_MONTH) {
  const current = currentValues(asOf)
  const axes: AxisProgress[] = AXES.map((axis) => {
    const kpis = Object.values(GOALS)
      .filter((g) => g.axis === axis.id)
      .map((g) => ({
        goalId: g.id,
        label: g.label,
        shortLabel: g.shortLabel,
        current: current[g.id],
        target: g.target,
        unit: g.unit,
        basis: g.basis,
        direction: g.direction,
        achievement: achievement(current[g.id], g.target, g.direction) * 100,
      }))
    return { ...axis, score: sum(kpis.map((k) => k.achievement)) / kpis.length, kpis }
  })
  return {
    ...mock('가상 데이터와 임시 목표치로 계산'),
    asOf,
    overall: sum(axes.map((a) => a.score * a.weight)),
    axes,
  }
}
