/**
 * 2030 목표치와 World No.1 진척도 가중치 — 목표는 이 파일에서만 관리해요.
 * [확인필요] 모든 목표값은 프롬프트 §3 의 임시값이에요.
 */
import type { Direction } from './types'

export const GOAL_YEAR = 2030

export type AxisId = 'global' | 'customer' | 'quality' | 'esg'

export interface AxisDef {
  id: AxisId
  label: string
  /** 종합 점수 가중치 (합 = 1) */
  weight: number
  path: string
}

export const AXES: AxisDef[] = [
  { id: 'global', label: '글로벌 매출·점유율', weight: 0.25, path: '/sales' },
  { id: 'customer', label: '고객', weight: 0.25, path: '/customer' },
  { id: 'quality', label: '품질·AS', weight: 0.25, path: '/quality' },
  { id: 'esg', label: 'ESG·환경', weight: 0.25, path: '/esg' },
]

export type GoalId =
  | 'revenue'
  | 'overseasShare'
  | 'countries'
  | 'nps'
  | 'rating'
  | 'defectRate'
  | 'asDays'
  | 'cumulativeReduction'

export interface GoalDef {
  id: GoalId
  axis: AxisId
  label: string
  /** 좁은 자리(진척도 띠)에 쓰는 짧은 이름 */
  shortLabel: string
  target: number
  unit: string
  direction: Direction
  /** 진척도 계산에 쓰는 현재값의 기준 */
  basis: string
}

export const GOALS: Record<GoalId, GoalDef> = {
  revenue: {
    id: 'revenue',
    axis: 'global',
    label: '연매출',
    shortLabel: '매출',
    target: 100_000, // 백만원 = 1,000억
    unit: '백만원',
    direction: 'higher',
    basis: '최근 12개월 합계',
  },
  overseasShare: {
    id: 'overseasShare',
    axis: 'global',
    label: '해외매출 비중',
    shortLabel: '해외 비중',
    target: 50,
    unit: '%',
    direction: 'higher',
    basis: '연초 누계(YTD)',
  },
  countries: {
    id: 'countries',
    axis: 'global',
    label: '진출국 수',
    shortLabel: '진출국',
    target: 20,
    unit: '개국',
    direction: 'higher',
    basis: '기준월 현재',
  },
  nps: { id: 'nps', axis: 'customer', label: 'NPS', shortLabel: 'NPS', target: 60, unit: '점', direction: 'higher', basis: '기준월' },
  rating: {
    id: 'rating',
    axis: 'customer',
    label: '리뷰 평점',
    shortLabel: '평점',
    target: 4.7,
    unit: '점',
    direction: 'higher',
    basis: '연초 누계, 리뷰 수 가중 평균',
  },
  defectRate: {
    id: 'defectRate',
    axis: 'quality',
    label: '초기불량률',
    shortLabel: '불량률',
    target: 0.5,
    unit: '%',
    direction: 'lower',
    basis: '연초 누계',
  },
  asDays: {
    id: 'asDays',
    axis: 'quality',
    label: 'AS 평균 처리일',
    shortLabel: 'AS 처리일',
    target: 2,
    unit: '일',
    direction: 'lower',
    basis: '연초 누계, 처리 건수 가중 평균',
  },
  cumulativeReduction: {
    id: 'cumulativeReduction',
    axis: 'esg',
    label: '누적 음식물 감량',
    shortLabel: '누적 감량',
    target: 500_000,
    unit: '톤',
    direction: 'higher',
    basis: '기준월까지 누적',
  },
}

export function getGoals() {
  return { year: GOAL_YEAR, axes: AXES, goals: GOALS }
}
