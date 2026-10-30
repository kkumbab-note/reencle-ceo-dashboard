import { useMemo } from 'react'
import { Earth, Landmark, MapPinned } from 'lucide-react'
import { Card, CardHeader } from '../components/cards/Card'
import { CountrySalesTable } from '../components/cards/CountrySalesTable'
import { GoalMeter } from '../components/cards/GoalMeter'
import { MockBadge } from '../components/cards/SourceMark'
import { StatCard } from '../components/cards/StatCard'
import { DeltaText } from '../components/cards/DeltaText'
import { MonthlyLineChart } from '../components/charts/MonthlyLineChart'
import { WorldSalesMap } from '../components/charts/WorldSalesMap'
import { AsOfPicker } from '../components/layout/AsOfPicker'
import { PageHeader } from '../components/layout/PageHeader'
import { getGoals } from '../data/goals'
import { FIRST_MONTH } from '../data/period'
import { getCountrySales, getMarketCountries, getMonthlyRevenue, getOverseasShare, getRevenueSummary, getUnitsByModel } from '../data/sales'
import { percentDelta } from '../data/util'
import { formatDecimal, formatEok, formatInt } from '../lib/format'
import { useAsOf } from '../state/AsOfContext'

export function GlobalSales() {
  const { asOf } = useAsOf()
  const { goals } = getGoals()
  const data = useMemo(() => {
    const countrySales = getCountrySales(asOf)
    return {
      revenue: getRevenueSummary(asOf),
      overseas: getOverseasShare(asOf),
      markets: getMarketCountries(),
      countrySales,
      mapCountries: countrySales.countries.map((c) => ({
        isoNumeric: c.isoNumeric,
        name: c.name,
        value: c.value,
        share: (c.value / countrySales.total) * 100,
      })),
      shareTrend: getMonthlyRevenue(FIRST_MONTH, asOf).items.map((i) => ({ month: i.month, share: i.overseasShare })),
      units: getUnitsByModel(asOf),
    }
  }, [asOf])
  const { revenue, overseas, markets, countrySales } = data

  return (
    <>
      <PageHeader
        title="글로벌 매출"
        description="국가·채널별 매출, 해외 비중 추이, 2030 목표 대비 갭"
        actions={<AsOfPicker />}
      />

      <div className="flex flex-col gap-4 md:gap-5">
        {/* 목표 대비 갭 */}
        <section aria-label="2030 목표 대비 갭" className="grid gap-4 sm:grid-cols-3 md:gap-5">
          <StatCard
            label="최근 12개월 매출"
            icon={Landmark}
            value={revenue.ltm / 100}
            digits={1}
            unit="억원"
            meta={{ source: 'mock' }}
            sub={<DeltaText label="연초 누계 전년 대비" delta={percentDelta(revenue.ytd, revenue.ytdPrevYear, '전년 동기 대비')} />}
            footer={
              <GoalMeter
                current={revenue.ltm}
                target={goals.revenue.target}
                direction="higher"
                caption={`2030 목표 ${formatEok(goals.revenue.target, 0)}까지 ${formatEok(goals.revenue.target - revenue.ltm, 0)}`}
              />
            }
          />
          <StatCard
            label="해외매출 비중"
            icon={Earth}
            value={overseas.ytd}
            digits={1}
            unit="%"
            meta={{ source: 'mock' }}
            sub={<DeltaText label="전년 동기 대비" delta={{ value: overseas.ytd - overseas.ytdPrevYear, kind: 'point', basis: '전년 동기 대비', direction: 'higher' }} pointUnit="%p" />}
            footer={
              <GoalMeter
                current={overseas.ytd}
                target={goals.overseasShare.target}
                direction="higher"
                caption={`목표 ${goals.overseasShare.target}%까지 ${formatDecimal(goals.overseasShare.target - overseas.ytd)}%p`}
              />
            }
          />
          <StatCard
            label="진출국 수"
            icon={MapPinned}
            value={markets.count}
            unit="개국"
            meta={markets}
            sub="한국·북미·일본·EU·기타 시장"
            footer={
              <GoalMeter
                current={markets.count}
                target={goals.countries.target}
                direction="higher"
                caption={`목표 ${goals.countries.target}개국까지 ${goals.countries.target - markets.count}개국`}
              />
            }
          />
        </section>

        <Card>
          <CardHeader
            title="국가별 매출 지도"
            badge={<MockBadge />}
            aside={<span className="text-xs text-ink-subtle">연초 누계 {formatEok(countrySales.total)}</span>}
          />
          <WorldSalesMap countries={data.mapCountries} />
        </Card>

        <div className="grid gap-4 md:gap-5 lg:grid-cols-[1.25fr_1fr]">
          <Card>
            <CardHeader title="국가·채널별 매출" badge={<MockBadge />} aside={<span className="text-xs text-ink-subtle">연초 누계</span>} />
            <CountrySalesTable countries={countrySales.countries} total={countrySales.total} />
          </Card>

          <div className="flex flex-col gap-4 md:gap-5">
            <Card>
              <CardHeader title="해외 비중 추이" badge={<MockBadge />} />
              <p className="-mt-2 mb-3 text-xs text-ink-subtle">
                이번 달 {formatDecimal(overseas.month)}% · 연초 누계 {formatDecimal(overseas.ytd)}%
              </p>
              <MonthlyLineChart
                data={data.shareTrend}
                series={[{ key: 'share', label: '해외 비중', color: 'var(--rc-chart-1)' }]}
                format={(v) => `${formatDecimal(v)}%`}
                axisFormat={(v) => `${formatDecimal(v, 0)}%`}
                reference={{ value: goals.overseasShare.target, label: `2030 목표 ${goals.overseasShare.target}%` }}
                height={190}
              />
            </Card>

            <Card>
              <CardHeader title="모델별 판매" badge={<MockBadge />} aside={<span className="text-xs text-ink-subtle">연초 누계</span>} />
              <table className="w-full text-sm">
                <caption className="sr-only">모델별 판매대수 (연초 누계)</caption>
                <thead className="border-b border-border text-left text-xs text-ink-subtle">
                  <tr>
                    <th scope="col" className="py-2 font-medium">모델</th>
                    <th scope="col" className="py-2 text-right font-medium">판매</th>
                    <th scope="col" className="py-2 text-right font-medium">비중</th>
                    <th scope="col" className="py-2 text-right font-medium">전년 대비</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data.units.items]
                    .sort((a, b) => b.value - a.value)
                    .map((m) => (
                      <tr key={m.id} className="border-b border-border last:border-0">
                        <td className="py-2.5 text-ink">{m.name}</td>
                        <td className="py-2.5 text-right font-semibold text-ink tabular">{formatInt(m.value)}대</td>
                        <td className="py-2.5 text-right text-ink-muted tabular">
                          {formatDecimal((m.value / data.units.total) * 100)}%
                        </td>
                        <td className="py-2.5 text-right">
                          <DeltaText label="" delta={percentDelta(m.value, m.prevYear, '전년 동기 대비')} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
