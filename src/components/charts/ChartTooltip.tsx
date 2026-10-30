import type { ReactNode } from 'react'

/** 차트 툴팁 껍데기 — 제목 + 행 목록 */
export function ChartTooltipBox({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="min-w-36 rounded-control border border-border bg-surface px-3 py-2.5 text-xs shadow-overlay">
      <p className="mb-1.5 font-semibold text-ink">{title}</p>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  )
}

export function ChartTooltipRow({ color, label, value }: { color?: string; label: ReactNode; value: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-ink-muted">
      {color && <span className="size-2 shrink-0 rounded-full" style={{ background: color }} />}
      <span>{label}</span>
      <span className="ml-auto pl-3 font-semibold text-ink tabular">{value}</span>
    </p>
  )
}

/** 범례 한 칸 — 색 표시는 마크 옆에, 글자는 본문색으로 */
export function LegendItem({ color, label, shape = 'dot' }: { color: string; label: ReactNode; shape?: 'dot' | 'line' | 'square' }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
      <span
        className={shape === 'line' ? 'h-0.5 w-3.5 rounded-full' : shape === 'square' ? 'size-2.5 rounded-[3px]' : 'size-2 rounded-full'}
        style={{ background: color }}
      />
      {label}
    </span>
  )
}
