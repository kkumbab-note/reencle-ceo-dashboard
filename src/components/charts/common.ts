/** 차트 공통 설정 — 축·격자는 눈에 띄지 않게 */
export const AXIS_TICK = { fontSize: 11, fill: 'var(--rc-text-subtle)' }
export const AXIS_LINE = { stroke: 'var(--rc-border)' }
export const GRID_STROKE = 'var(--rc-chart-grid)'

/** '2025-01' → '25.01' */
export function monthTick(ym: string): string {
  return `${ym.slice(2, 4)}.${ym.slice(5)}`
}

/** '2025-01' → '2025년 1월' */
export function monthTitle(ym: string): string {
  return `${ym.slice(0, 4)}년 ${Number(ym.slice(5))}월`
}
