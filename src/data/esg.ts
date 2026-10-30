/**
 * ESG 임팩트 — 활성 기기 수(가상) × 하루 투입량(가정치) × 감량률(공개 98%) 로 감량 톤을 계산해요.
 */
import { REDUCTION_RATE } from './company'
import { MONTHLY_ACTIVE_DEVICES } from './mock/esg'
import { cumulativeUnits, REGION_IDS, REGIONS } from './sales'
import { addMonths, daysInMonth, FIRST_MONTH, LATEST_MONTH, monthRange, sameMonthLastYear } from './period'
import type { YearMonth } from './types'
import { mock, rowFor, sum, sumRecord } from './util'

/** 환산 계수 — 전부 가정치예요. 실제 산정 근거가 생기면 바꿔요. */
export const ESG_FACTORS = {
  /** 활성 기기 1대가 하루에 넣는 음식물 (kg) — 가정치 */
  inputKgPerDevicePerDay: 0.55,
  /** 음식물 1톤 감량당 CO₂e 절감 (tCO₂e) — 가정치: 수거·운송·처리 배출 회피분에서 기기 전력 사용분을 뺀 값 */
  co2eTonPerTonReduced: 0.45,
  /** 소나무 1그루 연간 CO₂ 흡수량 (kg) — 가정치 */
  pineKgCo2PerYear: 6.6,
  /** 승용차 1대 연간 CO₂ 배출량 (톤) — 가정치 */
  carTonCo2PerYear: 2.0,
}

export function getEsgFactors() {
  return ESG_FACTORS
}

/** 2024년 말까지 누적 감량 (톤) — 가상 */
export const REDUCTION_BEFORE_2025 = 50_400

function activeDevices(month: YearMonth): number {
  return sumRecord(rowFor(MONTHLY_ACTIVE_DEVICES, month), REGION_IDS)
}

/** 한 달 감량 (톤) */
export function monthlyReduction(month: YearMonth): number {
  const inputTons = (activeDevices(month) * ESG_FACTORS.inputKgPerDevicePerDay * daysInMonth(month)) / 1000
  return Math.round(inputTons * (REDUCTION_RATE.value / 100))
}

/** 기준월까지 누적 감량 (톤) */
export function cumulativeReduction(asOf: YearMonth): number {
  return REDUCTION_BEFORE_2025 + sum(monthRange(FIRST_MONTH, asOf).map(monthlyReduction))
}

export function getReductionTrend(from: YearMonth = FIRST_MONTH, to: YearMonth = LATEST_MONTH) {
  return {
    ...mock('감량률 98%는 공개값, 활성 기기·투입량은 가상·가정치'),
    items: monthRange(from, to).map((month) => ({
      month,
      tons: monthlyReduction(month),
      cumulative: cumulativeReduction(month),
    })),
  }
}

export function getCumulativeReduction(asOf: YearMonth = LATEST_MONTH) {
  return {
    ...mock('감량률 98%는 공개값, 활성 기기·투입량은 가상·가정치'),
    asOf,
    value: cumulativeReduction(asOf),
    monthTons: monthlyReduction(asOf),
    prevMonthTons: monthlyReduction(addMonths(asOf, -1)),
    yearAgo: cumulativeReduction(sameMonthLastYear(asOf)),
  }
}

export function getCo2eTrend(from: YearMonth = FIRST_MONTH, to: YearMonth = LATEST_MONTH) {
  return {
    ...mock('환산 계수는 가정치'),
    items: monthRange(from, to).map((month) => ({
      month,
      tons: monthlyReduction(month) * ESG_FACTORS.co2eTonPerTonReduced,
      cumulative: cumulativeReduction(month) * ESG_FACTORS.co2eTonPerTonReduced,
    })),
  }
}

/** 누적 CO₂e 절감을 소나무·승용차로 환산 */
export function getEquivalents(asOf: YearMonth = LATEST_MONTH) {
  const co2eTons = cumulativeReduction(asOf) * ESG_FACTORS.co2eTonPerTonReduced
  return {
    ...mock('환산 계수는 가정치'),
    asOf,
    co2eTons,
    /** 소나무 N그루가 1년 동안 흡수하는 양 */
    pineTrees: Math.round((co2eTons * 1000) / ESG_FACTORS.pineKgCo2PerYear),
    /** 승용차 N대가 1년 동안 배출하는 양 */
    cars: Math.round(co2eTons / ESG_FACTORS.carTonCo2PerYear),
  }
}

/** 지역별 활성 기기 (추정) */
export function getActiveDevices(asOf: YearMonth = LATEST_MONTH) {
  const row = rowFor(MONTHLY_ACTIVE_DEVICES, asOf)
  const total = sumRecord(row, REGION_IDS)
  return {
    ...mock('추정치'),
    asOf,
    total,
    prevMonth: activeDevices(addMonths(asOf, -1)),
    /** 누적 판매 중 활성 비율 % */
    activeRatio: (total / cumulativeUnits(asOf)) * 100,
    items: REGIONS.map(({ id, label }) => ({ id, label, value: row[id], share: (row[id] / total) * 100 })),
  }
}
