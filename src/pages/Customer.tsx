import { useMemo } from 'react'
import { Award, HeartHandshake, Repeat, Star } from 'lucide-react'
import { Card, CardHeader } from '../components/cards/Card'
import { DeltaText } from '../components/cards/DeltaText'
import { GoalMeter } from '../components/cards/GoalMeter'
import { MockBadge, SourceInfo } from '../components/cards/SourceMark'
import { StatCard } from '../components/cards/StatCard'
import { BarList } from '../components/charts/BarList'
import { LegendItem } from '../components/charts/ChartTooltip'
import { MonthlyLineChart } from '../components/charts/MonthlyLineChart'
import { AsOfPicker } from '../components/layout/AsOfPicker'
import { PageHeader } from '../components/layout/PageHeader'
import { getCompanyFacts } from '../data/company'
import {
  getChannelRatings,
  getNps,
  getNpsTrend,
  getRatingTrend,
  getRepurchaseTrend,
  getReviewKeywords,
} from '../data/customer'
import { getGoals } from '../data/goals'
import { FIRST_MONTH } from '../data/period'
import type { RatingChannelId } from '../data/types'
import { pointDelta } from '../data/util'
import { formatDecimal, formatInt } from '../lib/format'
import { useAsOf } from '../state/AsOfContext'

const CHANNEL_COLORS: Record<RatingChannelId, string> = {
  naver: 'var(--rc-channel-1)',
  coupang: 'var(--rc-channel-2)',
  amazon: 'var(--rc-channel-3)',
}

const SENTIMENT = {
  positive: { label: '긍정', color: 'var(--rc-polar-pos)' },
  neutral: { label: '중립', color: 'var(--rc-polar-mid)' },
  negative: { label: '부정', color: 'var(--rc-polar-neg)' },
} as const

export function Customer() {
  const { asOf } = useAsOf()
  const { goals } = getGoals()
  const data = useMemo(() => {
    const repurchase = getRepurchaseTrend(FIRST_MONTH, asOf).items
    return {
      nps: getNps(asOf),
      npsTrend: getNpsTrend(FIRST_MONTH, asOf).items.map((r) => ({ month: r.month, nps: r.nps })),
      ratings: getChannelRatings(asOf),
      ratingTrend: getRatingTrend(FIRST_MONTH, asOf).items.map((r) => ({
        month: r.month,
        naver: r.naver.rating,
        coupang: r.coupang.rating,
        amazon: r.amazon.rating,
      })),
      keywords: getReviewKeywords(),
      repurchase,
      repurchaseNow: repurchase[repurchase.length - 1],
      repurchasePrev: repurchase[repurchase.length - 2],
      loyaltyAward: getCompanyFacts().awards[0],
    }
  }, [asOf])
  const { nps, ratings, repurchaseNow, repurchasePrev, loyaltyAward } = data

  const npsSegments = [
    { key: 'promoters', label: '추천 (9~10점)', value: nps.promoters, color: 'var(--rc-polar-pos)' },
    { key: 'passives', label: '중립 (7~8점)', value: nps.passives, color: 'var(--rc-polar-mid)' },
    { key: 'detractors', label: '비추천 (0~6점)', value: nps.detractors, color: 'var(--rc-polar-neg)' },
  ]

  return (
    <>
      <PageHeader title="고객·NPS" description="추천 의향, 채널별 평점, 리뷰 키워드, 재구매율" actions={<AsOfPicker />} />

      <div className="flex flex-col gap-4 md:gap-5">
        <section aria-label="고객 핵심 지표" className="grid gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-4">
          <StatCard
            label="NPS"
            icon={HeartHandshake}
            value={nps.value}
            unit="점"
            meta={{ source: 'mock' }}
            sub={
              <span className="flex flex-wrap gap-x-3">
                <DeltaText label="전월" delta={pointDelta(nps.value, nps.prevMonth, '전월 대비')} pointUnit="점" digits={0} />
                <DeltaText label="전년" delta={pointDelta(nps.value, nps.yearAgo, '전년 동월 대비')} pointUnit="점" digits={0} />
              </span>
            }
            footer={
              <GoalMeter
                current={nps.value}
                target={goals.nps.target}
                direction="higher"
                caption={`2030 목표 ${goals.nps.target}점까지 ${goals.nps.target - nps.value}점`}
              />
            }
          />
          <StatCard
            label="리뷰 평점 (연초 누계)"
            icon={Star}
            value={ratings.overallYtd}
            digits={2}
            unit="점"
            meta={{ source: 'mock' }}
            sub="네이버·쿠팡·아마존 리뷰 수 가중 평균"
            footer={
              <GoalMeter
                current={ratings.overallYtd}
                target={goals.rating.target}
                direction="higher"
                caption={`목표 ${goals.rating.target}점`}
              />
            }
          />
          <StatCard
            label="소모품 재구매율"
            icon={Repeat}
            value={repurchaseNow.value}
            digits={1}
            unit="%"
            meta={{ source: 'mock' }}
            sub={
              <DeltaText
                label="전월"
                delta={pointDelta(repurchaseNow.value, repurchasePrev.value, '전월 대비')}
                pointUnit="%p"
              />
            }
          />
          {/* 공개값 — 출처 툴팁 */}
          <section className="flex flex-col rounded-card bg-surface p-5 shadow-card">
            <div className="flex items-center gap-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                <Award className="size-4" aria-hidden="true" />
              </span>
              <h2 className="truncate text-sm font-medium text-ink-muted">고객충성도</h2>
              <span className="ml-auto">
                <SourceInfo meta={loyaltyAward} />
              </span>
            </div>
            <p className="mt-3 flex items-baseline gap-1">
              <span className="text-[28px] leading-none font-bold tracking-tight text-ink">1위</span>
              <span className="text-sm font-medium text-ink-muted">3년 연속</span>
            </p>
            <p className="mt-1.5 text-xs text-ink-subtle">{loyaltyAward.title} ({loyaltyAward.year})</p>
          </section>
        </section>

        <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader title="NPS 추이와 구성" badge={<MockBadge />} />
            <MonthlyLineChart
              data={data.npsTrend}
              series={[{ key: 'nps', label: 'NPS', color: 'var(--rc-chart-1)' }]}
              format={(v) => `${formatDecimal(v, 0)}점`}
              axisFormat={(v) => formatDecimal(v, 0)}
              reference={{ value: goals.nps.target, label: `2030 목표 ${goals.nps.target}점` }}
              height={180}
            />
            {/* 기준월 응답 구성 — 100% 막대 하나 */}
            <h3 className="mt-5 mb-2 text-xs font-semibold text-ink-muted">
              {asOf.slice(0, 4)}년 {Number(asOf.slice(5))}월 응답 구성 · {formatInt(nps.responses)}명
            </h3>
            <div className="flex h-3 gap-0.5 overflow-hidden rounded-[4px]" role="img" aria-label={npsSegments.map((s) => `${s.label} ${s.value}%`).join(', ')}>
              {npsSegments.map((s) => (
                <div key={s.key} style={{ width: `${s.value}%`, background: s.color }} />
              ))}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
              {npsSegments.map((s) => (
                <LegendItem key={s.key} color={s.color} shape="square" label={<>{s.label} <b className="font-semibold text-ink">{s.value}%</b></>} />
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="채널별 평점" badge={<MockBadge />} />
            <MonthlyLineChart
              data={data.ratingTrend}
              series={ratings.channels.map((c) => ({ key: c.id, label: c.label, color: CHANNEL_COLORS[c.id] }))}
              format={(v) => formatDecimal(v)}
              domain={[4, 5]}
              reference={{
                value: ratings.alertThreshold,
                label: `경보 기준 ${formatDecimal(ratings.alertThreshold)}`,
                color: 'var(--rc-urgent)',
              }}
              height={180}
            />
            <table className="mt-4 w-full text-sm">
              <caption className="sr-only">채널별 평점 표</caption>
              <thead className="border-b border-border text-left text-xs text-ink-subtle">
                <tr>
                  <th scope="col" className="py-2 font-medium">채널</th>
                  <th scope="col" className="py-2 text-right font-medium">이번 달</th>
                  <th scope="col" className="py-2 text-right font-medium">연초 누계</th>
                  <th scope="col" className="py-2 text-right font-medium">리뷰 수</th>
                </tr>
              </thead>
              <tbody>
                {ratings.channels.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <th scope="row" className="py-2 text-left font-normal text-ink-muted">
                      <LegendItem color={CHANNEL_COLORS[c.id]} label={c.label} shape="line" />
                    </th>
                    <td className="py-2 text-right">
                      <span className="font-semibold text-ink tabular">{formatDecimal(c.month)}</span>
                      {c.month < ratings.alertThreshold && (
                        <span className="ml-1.5 rounded-full bg-urgent-soft px-1.5 py-px text-[10px] font-semibold text-urgent">
                          경보
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-right text-ink-muted tabular">{formatDecimal(c.ytd, 2)}</td>
                    <td className="py-2 text-right text-ink-subtle tabular">{formatInt(c.reviewsYtd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card>
            <CardHeader title="리뷰 키워드 상위" badge={<MockBadge />} aside={<span className="text-xs text-ink-subtle">{data.keywords.note}</span>} />
            <BarList
              items={data.keywords.items.map((k) => ({
                key: k.keyword,
                label: k.keyword,
                value: k.count,
                valueLabel: `${formatInt(k.count)}건`,
                extra: SENTIMENT[k.sentiment].label,
                color: SENTIMENT[k.sentiment].color,
              }))}
            />
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3">
              {Object.values(SENTIMENT).map((s) => (
                <LegendItem key={s.label} color={s.color} label={s.label} shape="square" />
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="소모품 재구매율" badge={<MockBadge />} />
            <p className="-mt-2 mb-3 text-xs text-ink-subtle">미생물·필터 등 소모품을 다시 산 고객 비율</p>
            <MonthlyLineChart
              data={data.repurchase}
              series={[{ key: 'value', label: '재구매율', color: 'var(--rc-chart-1)' }]}
              format={(v) => `${formatDecimal(v)}%`}
              axisFormat={(v) => `${formatDecimal(v, 0)}%`}
              domain={[40, 'auto']}
              height={200}
            />
          </Card>
        </div>
      </div>
    </>
  )
}
