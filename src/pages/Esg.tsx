import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { Car, CloudOff, Recycle, TreePine, type LucideIcon } from 'lucide-react'
import { Card, CardHeader } from '../components/cards/Card'
import { DeltaText } from '../components/cards/DeltaText'
import { GoalMeter } from '../components/cards/GoalMeter'
import { MockBadge, SourceInfo } from '../components/cards/SourceMark'
import { BarList } from '../components/charts/BarList'
import { ChartTooltipBox, ChartTooltipRow } from '../components/charts/ChartTooltip'
import { AXIS_LINE, AXIS_TICK, GRID_STROKE, monthTick, monthTitle } from '../components/charts/common'
import { AsOfPicker } from '../components/layout/AsOfPicker'
import { PageHeader } from '../components/layout/PageHeader'
import { getCompanyFacts } from '../data/company'
import { getActiveDevices, getCo2eTrend, getCumulativeReduction, getEquivalents, getEsgFactors } from '../data/esg'
import { getGoals } from '../data/goals'
import { FIRST_MONTH } from '../data/period'
import { percentDelta } from '../data/util'
import { useCountUp } from '../hooks/useCountUp'
import { formatDecimal, formatInt, formatMan } from '../lib/format'
import { useAsOf } from '../state/AsOfContext'

function EquivalentTile({ icon: Icon, label, value, unit, note }: { icon: LucideIcon; label: string; value: number; unit: string; note: string }) {
  const animated = useCountUp(value)
  return (
    <section className="flex items-center gap-4 rounded-card bg-surface p-5 shadow-card">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-sm font-medium text-ink-muted">
          {label} <MockBadge />
        </h2>
        <p className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl leading-none font-bold tracking-tight text-ink">{formatInt(animated)}</span>
          <span className="text-sm font-medium text-ink-muted">{unit}</span>
        </p>
        <p className="mt-1 text-xs text-ink-subtle">{note}</p>
      </div>
    </section>
  )
}

export function Esg() {
  const { asOf } = useAsOf()
  const { goals } = getGoals()
  const data = useMemo(
    () => ({
      reduction: getCumulativeReduction(asOf),
      equivalents: getEquivalents(asOf),
      co2eTrend: getCo2eTrend(FIRST_MONTH, asOf).items,
      devices: getActiveDevices(asOf),
      factors: getEsgFactors(),
      reductionRate: getCompanyFacts().reductionRate,
    }),
    [asOf],
  )
  const { reduction, equivalents, devices, factors, reductionRate } = data
  const counter = useCountUp(reduction.value)

  return (
    <>
      <PageHeader title="ESG 임팩트" description="음식물 감량과 탄소 절감으로 본 린클의 환경 기여" actions={<AsOfPicker />} />

      <div className="flex flex-col gap-4 md:gap-5">
        <div className="grid gap-4 md:gap-5 lg:grid-cols-[1.35fr_1fr]">
          {/* 누적 감량 톤 카운터 — 이 화면의 대표 숫자 */}
          <Card>
            <CardHeader
              title="누적 음식물 감량"
              badge={<MockBadge />}
              aside={
                <span className="inline-flex items-center gap-1 text-xs text-ink-subtle">
                  감량률 {reductionRate.value}% <SourceInfo meta={reductionRate} />
                </span>
              }
            />
            <div className="flex flex-1 flex-col justify-center gap-5">
              <p className="flex items-baseline gap-2">
                <Recycle className="size-8 shrink-0 self-center text-primary" aria-hidden="true" />
                <span className="text-[44px] leading-none font-bold tracking-tight text-ink sm:text-[52px]">{formatInt(counter)}</span>
                <span className="text-xl font-semibold text-ink-muted">톤</span>
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-muted">
                <span>
                  이번 달 <b className="font-semibold text-ink">+{formatInt(reduction.monthTons)}톤</b>
                </span>
                <DeltaText label="누적 전년 동월 대비" delta={percentDelta(reduction.value, reduction.yearAgo, '전년 동월 대비')} />
              </div>
              <GoalMeter
                current={reduction.value}
                target={goals.cumulativeReduction.target}
                direction="higher"
                caption={`2030 목표 ${formatMan(goals.cumulativeReduction.target, 0)}톤까지 ${formatMan(goals.cumulativeReduction.target - reduction.value)}톤`}
              />
            </div>
          </Card>

          {/* 환산 카드 */}
          <div className="grid gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-1">
            <EquivalentTile
              icon={CloudOff}
              label="누적 CO₂e 절감"
              value={equivalents.co2eTons}
              unit="tCO₂e"
              note={`감량 1톤당 ${factors.co2eTonPerTonReduced}tCO₂e (가정치)`}
            />
            <EquivalentTile
              icon={TreePine}
              label="소나무 환산"
              value={equivalents.pineTrees}
              unit="그루"
              note={`1그루 연간 ${factors.pineKgCo2PerYear}kg 흡수 기준 (가정치)`}
            />
            <EquivalentTile
              icon={Car}
              label="승용차 환산"
              value={equivalents.cars}
              unit="대"
              note={`1대 연간 ${factors.carTonCo2PerYear}톤 배출 기준 (가정치)`}
            />
          </div>
        </div>

        <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader title="월별 CO₂e 절감" badge={<MockBadge />} aside={<span className="text-xs text-ink-subtle">tCO₂e</span>} />
            <BarChart
              responsive
              data={data.co2eTrend}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              style={{ width: '100%', height: 230 }}
              accessibilityLayer
            >
              <CartesianGrid vertical={false} stroke={GRID_STROKE} />
              <XAxis dataKey="month" tickFormatter={monthTick} tick={AXIS_TICK} tickLine={false} axisLine={AXIS_LINE} interval="preserveStartEnd" minTickGap={16} />
              <YAxis width={44} tick={AXIS_TICK} tickLine={false} axisLine={false} tickCount={5} tickFormatter={(v: number) => formatInt(v)} />
              <Tooltip
                cursor={{ fill: 'var(--rc-surface-muted)' }}
                content={({ active, payload, label }) => {
                  const row = payload?.[0]?.payload as (typeof data.co2eTrend)[number] | undefined
                  if (!active || !row) return null
                  return (
                    <ChartTooltipBox title={monthTitle(String(label))}>
                      <ChartTooltipRow color="var(--rc-chart-1)" label="절감" value={`${formatInt(row.tons)} tCO₂e`} />
                      <ChartTooltipRow label="누적" value={`${formatInt(row.cumulative)} tCO₂e`} />
                    </ChartTooltipBox>
                  )
                }}
              />
              <Bar dataKey="tons" fill="var(--rc-chart-1)" maxBarSize={18} radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </Card>

          <Card>
            <CardHeader title="활성 기기 지역 분포" badge={<MockBadge />} aside={<span className="text-xs text-ink-subtle">추정치</span>} />
            <p className="-mt-2 mb-4 text-xs text-ink-subtle">
              활성 기기 {formatInt(devices.total)}대 · 누적 판매 중 {formatDecimal(devices.activeRatio)}%
            </p>
            <BarList
              items={devices.items.map((r) => ({
                key: r.id,
                label: r.label,
                value: r.value,
                valueLabel: `${formatInt(r.value)}대`,
                extra: `${formatDecimal(r.share)}%`,
              }))}
            />
          </Card>
        </div>

        {/* 산정 기준 — 가정치를 숨기지 않고 보여줘요 */}
        <Card>
          <CardHeader title="산정 기준" />
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <dt className="text-xs text-ink-subtle">감량률 (공개값)</dt>
              <dd className="mt-0.5 text-ink">24시간 내 약 {reductionRate.value}%</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-subtle">기기당 하루 투입량 (가정치)</dt>
              <dd className="mt-0.5 text-ink">{factors.inputKgPerDevicePerDay}kg</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-subtle">감량 1톤당 CO₂e 절감 (가정치)</dt>
              <dd className="mt-0.5 text-ink">{factors.co2eTonPerTonReduced}tCO₂e · 기기 전력 사용분 차감 후</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-subtle">계산식</dt>
              <dd className="mt-0.5 text-ink">활성 기기 × 투입량 × 일수 × 감량률</dd>
            </div>
          </dl>
        </Card>
      </div>
    </>
  )
}
