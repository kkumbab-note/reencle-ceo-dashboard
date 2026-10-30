import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { BriefingCard } from '../components/cards/BriefingCard'
import { KpiCard } from '../components/cards/KpiCard'
import { ProgressBand } from '../components/cards/ProgressBand'
import { ScheduleCard } from '../components/cards/ScheduleCard'
import { ShortcutsCard } from '../components/cards/ShortcutsCard'
import { LineupBarsCard } from '../components/charts/LineupBarsCard'
import { RegionDonutCard } from '../components/charts/RegionDonutCard'
import { RevenueTrendCard } from '../components/charts/RevenueTrendCard'
import { AsOfPicker } from '../components/layout/AsOfPicker'
import { PageHeader } from '../components/layout/PageHeader'
import { getHeadlineKpis } from '../data/dashboard'
import { LATEST_MONTH } from '../data/period'
import { getWorldNo1Progress } from '../data/progress'
import { cx } from '../lib/cx'
import { useAsOf } from '../state/AsOfContext'

export function Dashboard() {
  const { asOf, asOfDate } = useAsOf()
  // 모바일 첫 화면은 KPI · 진척도 · 브리핑만. 나머지는 '더 보기'로 펼쳐요.
  const [showMore, setShowMore] = useState(false)
  const kpis = useMemo(() => getHeadlineKpis(asOf), [asOf])
  const progress = useMemo(() => getWorldNo1Progress(asOf), [asOf])
  const secondary = cx(!showMore && 'max-md:hidden')

  return (
    <>
      <PageHeader
        title="대표님, 좋은 아침입니다."
        description={
          <>
            기준일 {asOfDate}
            {asOf !== LATEST_MONTH && (
              <span className="ml-2 rounded-full bg-important-soft px-2 py-0.5 text-xs font-medium text-important">
                과거 시점
              </span>
            )}
          </>
        }
        actions={<AsOfPicker />}
      />

      <div className="flex flex-col gap-4 md:gap-5">
        {/* 모바일: 가로 스와이프 / 768~1359px: 3+2 / 1360px(85rem) 이상: 5열 (카드 폭이 180px 아래로 줄면 글자가 잘려요) */}
        <section
          aria-label="핵심 지표"
          className="scrollbar-none -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-6 md:gap-4 md:overflow-visible md:px-0 md:pb-0 min-[85rem]:grid-cols-5"
        >
          {kpis.map((kpi) => (
            <KpiCard
              key={kpi.id}
              kpi={kpi}
              className="w-[72%] shrink-0 snap-start sm:w-[44%] md:col-span-2 md:w-auto md:nth-[n+4]:col-span-3 min-[85rem]:col-span-1 min-[85rem]:nth-[n+4]:col-span-1"
            />
          ))}
        </section>

        <ProgressBand progress={progress} />

        {/* 3·4행 위젯 6개 — 태블릿 2열 × 3줄, 데스크톱 3열 × 2줄 */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
          <RevenueTrendCard asOf={asOf} className={secondary} />
          <RegionDonutCard asOf={asOf} className={secondary} />
          <BriefingCard asOf={asOf} className="max-md:order-first" />
          <LineupBarsCard asOf={asOf} className={secondary} />
          <ScheduleCard asOf={asOf} className={secondary} />
          <ShortcutsCard className={secondary} />
        </section>

        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          aria-expanded={showMore}
          className="flex h-11 items-center justify-center gap-1.5 rounded-control border border-border bg-surface text-sm font-medium text-ink-muted shadow-card md:hidden"
        >
          {showMore ? '접기' : '매출 추이·지역·라인업·일정 더 보기'}
          <ChevronDown className={cx('size-4 transition-transform', showMore && 'rotate-180')} aria-hidden="true" />
        </button>
      </div>
    </>
  )
}
