import { Fragment, type ReactNode } from 'react'

export interface BarListItem {
  key: string
  label: ReactNode
  value: number
  /** 막대 오른쪽 값 */
  valueLabel: ReactNode
  /** 값 아래 보조 정보 */
  extra?: ReactNode
  color?: string
  /** 막대 위에 뜨는 설명 */
  title?: string
}

interface BarListProps {
  items: BarListItem[]
  max?: number
  /** 목표·경보 같은 기준선 */
  markers?: Array<{ value: number; label: string; color: string }>
}

/**
 * 가로 막대 목록 — 이름 | 막대 | 값.
 * 막대 끝만 4px 둥글게, 시작점은 각지게 해요.
 */
export function BarList({ items, max, markers = [] }: BarListProps) {
  const scaleMax = max ?? Math.max(...items.map((i) => i.value), ...markers.map((m) => m.value)) * 1.05

  return (
    <div>
      {markers.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1">
          {markers.map((m) => (
            <span key={m.label} className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
              <span className="h-3 w-px" style={{ background: m.color }} />
              {m.label}
            </span>
          ))}
        </div>
      )}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-3">
        {items.map((item) => (
          <Fragment key={item.key}>
            <span className="max-w-[7.5rem] truncate text-sm text-ink-muted">{item.label}</span>
            <div className="relative h-3" title={item.title}>
              <div
                className="h-full rounded-r-[4px]"
                style={{ width: `${Math.min(item.value / scaleMax, 1) * 100}%`, background: item.color ?? 'var(--rc-chart-1)' }}
              />
              {markers.map((m) => (
                <span
                  key={m.label}
                  className="absolute -top-1 -bottom-1 w-px"
                  style={{ left: `${(m.value / scaleMax) * 100}%`, background: m.color }}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-right">
              <span className="block text-sm font-semibold whitespace-nowrap text-ink tabular">{item.valueLabel}</span>
              {item.extra && <span className="block text-[11px] whitespace-nowrap text-ink-subtle">{item.extra}</span>}
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
