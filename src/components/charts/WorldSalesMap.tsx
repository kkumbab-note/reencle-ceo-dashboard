import { useRef, useState, type MouseEvent } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import worldUrl from 'world-atlas/countries-110m.json?url'
import { formatDecimal, formatEok } from '../../lib/format'
import { ChartTooltipBox, ChartTooltipRow } from './ChartTooltip'

export interface MapCountry {
  isoNumeric: string
  name: string
  value: number
  share: number
}

/** 매출 구간 (백만원) — 진할수록 큼. 값이 고르게 퍼지지 않아 구간으로 나눠요. */
const BINS = [
  { min: 5_000, color: 'var(--rc-seq-5)', label: '50억 이상' },
  { min: 2_000, color: 'var(--rc-seq-4)', label: '20~50억' },
  { min: 500, color: 'var(--rc-seq-3)', label: '5~20억' },
  { min: 100, color: 'var(--rc-seq-2)', label: '1~5억' },
  { min: 0, color: 'var(--rc-seq-1)', label: '1억 미만' },
]

function binColor(value: number): string {
  return (BINS.find((b) => value >= b.min) ?? BINS[BINS.length - 1]).color
}

// 남극은 면적만 크고 정보가 없어서 빼요
const ANTARCTICA = '010'

export function WorldSalesMap({ countries }: { countries: MapCountry[] }) {
  const byId = new Map(countries.map((c) => [c.isoNumeric, c]))
  const containerRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<{ country: MapCountry; x: number; y: number } | null>(null)

  const track = (country: MapCountry) => (e: MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setHover({ country, x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div>
      <div ref={containerRef} className="relative mx-auto max-w-[880px]" onMouseLeave={() => setHover(null)}>
        <ComposableMap
          projection="geoEqualEarth"
          width={800}
          height={360}
          projectionConfig={{ scale: 150, center: [12, 6] }}
          className="h-auto w-full"
          role="img"
          aria-label="국가별 매출 지도"
        >
          <Geographies
            geography={worldUrl}
            parseGeographies={(features) => features.filter((f) => f.id !== ANTARCTICA)}
          >
            {({ geographies }) =>
              geographies.map((geo) => {
                const country = byId.get(String(geo.id))
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={country ? binColor(country.value) : 'var(--rc-map-empty)'}
                    stroke="var(--rc-surface)"
                    strokeWidth={0.6}
                    className={country ? 'cursor-pointer outline-none hover:opacity-80' : 'outline-none'}
                    onMouseMove={country ? track(country) : undefined}
                    onClick={country ? track(country) : undefined}
                    onMouseLeave={() => setHover(null)}
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>

        {hover && (
          <div
            className="pointer-events-none absolute z-10"
            style={{
              left: hover.x,
              top: hover.y,
              transform: `translate(${hover.x > 200 ? '-100%' : '0'}, -110%)`,
            }}
          >
            <ChartTooltipBox title={hover.country.name}>
              <ChartTooltipRow color={binColor(hover.country.value)} label="매출" value={formatEok(hover.country.value)} />
              <ChartTooltipRow label="비중" value={`${formatDecimal(hover.country.share)}%`} />
            </ChartTooltipBox>
          </div>
        )}
      </div>

      {/* 단계 범례 — 연한 색 → 진한 색 */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {[...BINS].reverse().map((b) => (
          <span key={b.label} className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
            <span className="size-2.5 rounded-[3px]" style={{ background: b.color }} />
            {b.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-subtle">
          <span className="size-2.5 rounded-[3px]" style={{ background: 'var(--rc-map-empty)' }} />
          미진출
        </span>
      </div>
    </div>
  )
}
