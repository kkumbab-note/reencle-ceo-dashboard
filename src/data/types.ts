/** 'YYYY-MM' */
export type YearMonth = string

/** 팩트시트(공개자료)에서 온 값 */
export interface PublicSource {
  source: 'public'
  /** 출처 이름 — 툴팁에 표시 */
  sourceLabel: string
  /** 원문 링크. null 이면 아직 링크를 확보하지 못한 것 [확인필요] */
  sourceUrl: string | null
  /** 값의 기준 시점 */
  asOf: string
  note?: string
}

/** 가상 데이터 */
export interface MockSource {
  source: 'mock'
  note?: string
}

export type SourceMeta = PublicSource | MockSource

export type RegionId = 'kr' | 'na' | 'jp' | 'eu' | 'etc'
export type RegionValues = Record<RegionId, number>

export type ModelId = 'easy' | 'prime' | 'primeS' | 'gravity' | 'gravityW'
export type ModelValues = Record<ModelId, number>

export type RatingChannelId = 'naver' | 'coupang' | 'amazon'

/** 값이 클수록 좋은지, 작을수록 좋은지 */
export type Direction = 'higher' | 'lower'

export type MonthlyRegionRow = { month: YearMonth } & RegionValues
export type MonthlyModelRow = { month: YearMonth } & ModelValues

export interface MonthlyNpsRow {
  month: YearMonth
  /** 추천(9~10점) 비율 % */
  promoters: number
  /** 중립(7~8점) 비율 % */
  passives: number
  /** 비추천(0~6점) 비율 % */
  detractors: number
  responses: number
}

export type MonthlyRatingRow = { month: YearMonth } & Record<RatingChannelId, { rating: number; reviews: number }>

export interface MonthlyLoyaltyRow {
  month: YearMonth
  /** 소모품(미생물·필터) 재구매율 % */
  repurchaseRate: number
  /** 필터·미생물 교체 주기 준수율 % */
  replacementCompliance: number
}

export interface MonthlyAsRow {
  month: YearMonth
  received: number
  diagnosed: number
  repaired: number
  closed: number
  /** 접수~처리완료 평균 일수 */
  avgDays: number
}
