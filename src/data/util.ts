import type { Direction, MockSource, SourceMeta, YearMonth } from './types'

export function mock(note?: string): MockSource {
  return note ? { source: 'mock', note } : { source: 'mock' }
}

/** 조회 결과에 섞여 있는 출처 정보만 꺼내요 */
export function metaOf(item: SourceMeta): SourceMeta {
  if (item.source === 'mock') return mock(item.note)
  const { sourceLabel, sourceUrl, asOf, note } = item
  return { source: 'public', sourceLabel, sourceUrl, asOf, ...(note && { note }) }
}

/** 전월·전년 대비 변화 */
export interface Delta {
  value: number
  /** percent: 증감률(%) / point: 차이(%p·점) */
  kind: 'percent' | 'point'
  /** 무엇을 비교했는지 */
  basis: string
  /** 좋은 방향 — 색 결정에 써요 */
  direction: Direction
}

export function percentDelta(current: number, previous: number, basis: string, direction: Direction = 'higher'): Delta {
  return { value: previous === 0 ? 0 : ((current - previous) / previous) * 100, kind: 'percent', basis, direction }
}

export function pointDelta(current: number, previous: number, basis: string, direction: Direction = 'higher'): Delta {
  return { value: current - previous, kind: 'point', basis, direction }
}

export function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0)
}

export function sumRecord<K extends string>(record: Record<K, number>, keys: readonly K[]): number {
  return sum(keys.map((k) => record[k]))
}

/** 여러 행의 같은 키끼리 합 */
export function sumRows<K extends string>(rows: Array<Record<K, number>>, keys: readonly K[]): Record<K, number> {
  return Object.fromEntries(keys.map((k) => [k, sum(rows.map((r) => r[k]))])) as Record<K, number>
}

export function rowFor<T extends { month: YearMonth }>(rows: T[], month: YearMonth): T {
  const row = rows.find((r) => r.month === month)
  if (!row) throw new Error(`데이터가 없는 달이에요: ${month}`)
  return row
}

export function rowsFor<T extends { month: YearMonth }>(rows: T[], months: YearMonth[]): T[] {
  return months.map((m) => rowFor(rows, m))
}

/** 가중 평균 */
export function weightedAverage(items: Array<{ value: number; weight: number }>): number {
  const totalWeight = sum(items.map((i) => i.weight))
  return totalWeight === 0 ? 0 : sum(items.map((i) => i.value * i.weight)) / totalWeight
}

/** total 을 비율대로 정수 배분 — 합계가 정확히 total 이 되게 (최대잔여법) */
export function allocate(total: number, weights: number[]): number[] {
  const weightSum = sum(weights)
  const raw = weights.map((w) => (weightSum === 0 ? 0 : (total * w) / weightSum))
  const out = raw.map(Math.floor)
  const order = raw.map((r, i) => ({ frac: r - Math.floor(r), i })).sort((a, b) => b.frac - a.frac)
  const rest = total - sum(out)
  for (let k = 0; k < rest; k++) out[order[k].i]++
  return out
}

/** 달성률 (0~1). 작을수록 좋은 지표는 목표 ÷ 현재 */
export function achievement(current: number, target: number, direction: Direction): number {
  if (direction === 'higher') return target === 0 ? 1 : Math.min(current / target, 1)
  return current <= 0 ? 1 : Math.min(target / current, 1)
}
