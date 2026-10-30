import { describe, expect, it } from 'vitest'
import { runDataChecks } from './checks'
import { getAnnualRevenue } from './company'

describe('데이터 정합성', () => {
  it.each(runDataChecks().map((r) => [r.name, r] as const))('%s', (_name, result) => {
    expect(result.ok, result.detail).toBe(true)
  })

  it('2022~2025 연매출이 팩트시트와 정확히 일치', () => {
    expect(getAnnualRevenue().map((r) => [r.year, r.value])).toEqual([
      [2022, 26_880],
      [2023, 28_570],
      [2024, 24_870],
      [2025, 31_410],
    ])
  })

  it('공개값에는 출처와 기준 시점이 있음', () => {
    for (const r of getAnnualRevenue()) {
      expect(r.source).toBe('public')
      expect(r.sourceLabel).toBeTruthy()
      expect(r.asOf).toBeTruthy()
      expect(r).toHaveProperty('sourceUrl')
    }
  })
})
