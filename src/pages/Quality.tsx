import { useMemo } from 'react'
import { CheckCircle2, Clock, Inbox, ShieldAlert } from 'lucide-react'
import { Card, CardHeader } from '../components/cards/Card'
import { DeltaText } from '../components/cards/DeltaText'
import { GoalMeter } from '../components/cards/GoalMeter'
import { MockBadge } from '../components/cards/SourceMark'
import { StatCard } from '../components/cards/StatCard'
import { BarList } from '../components/charts/BarList'
import { MonthlyLineChart } from '../components/charts/MonthlyLineChart'
import { AsOfPicker } from '../components/layout/AsOfPicker'
import { PageHeader } from '../components/layout/PageHeader'
import { getGoals } from '../data/goals'
import { FIRST_MONTH } from '../data/period'
import {
  getAsDays,
  getAsFunnel,
  getAsTrend,
  getDefectByModel,
  getDefectRate,
  getDefectRateTrend,
  getFailureTypes,
  getReplacementCompliance,
} from '../data/quality'
import { percentDelta, pointDelta } from '../data/util'
import { formatDecimal, formatInt } from '../lib/format'
import { useAsOf } from '../state/AsOfContext'

export function Quality() {
  const { asOf } = useAsOf()
  const { goals } = getGoals()
  const data = useMemo(() => {
    const asTrend = getAsTrend(FIRST_MONTH, asOf).items
    return {
      defect: getDefectRate(asOf),
      defectTrend: getDefectRateTrend(FIRST_MONTH, asOf).items.map((r) => ({ month: r.month, rate: r.overall })),
      byModel: getDefectByModel(asOf),
      funnel: getAsFunnel(asOf),
      asDays: getAsDays(asOf),
      asTrend: asTrend.map((r) => ({ month: r.month, days: r.avgDays })),
      asNow: asTrend[asTrend.length - 1],
      asPrev: asTrend[asTrend.length - 2],
      failures: getFailureTypes(asOf),
      compliance: getReplacementCompliance(FIRST_MONTH, asOf).items,
    }
  }, [asOf])
  const { defect, byModel, funnel, asDays, asNow, asPrev, failures } = data
  const received = funnel.stages[0].month
  const top3Share = failures.items[2]?.cumulativeShare ?? 0
  const complianceNow = data.compliance[data.compliance.length - 1]

  return (
    <>
      <PageHeader title="품질·AS" description="초기불량률, AS 처리 흐름, 고장 유형, 모델별 비교" actions={<AsOfPicker />} />

      <div className="flex flex-col gap-4 md:gap-5">
        <section aria-label="품질 핵심 지표" className="grid gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-4">
          <StatCard
            label="초기불량률 (연초 누계)"
            icon={ShieldAlert}
            value={defect.ytd}
            digits={2}
            unit="%"
            meta={{ source: 'mock' }}
            sub={`이번 달 ${formatDecimal(defect.month, 2)}% · 판매 후 30일 내`}
            footer={
              <GoalMeter
                current={defect.ytd}
                target={goals.defectRate.target}
                direction="lower"
                caption={`목표 ${goals.defectRate.target}% 이하`}
              />
            }
          />
          <StatCard
            label="AS 평균 처리일"
            icon={Clock}
            value={asDays.month}
            digits={1}
            unit="일"
            meta={{ source: 'mock' }}
            sub={
              <span className="flex flex-wrap gap-x-3">
                <DeltaText label="전월" delta={pointDelta(asDays.month, asDays.prevMonth, '전월 대비', 'lower')} pointUnit="일" />
                <span>연초 누계 {formatDecimal(asDays.ytd)}일</span>
              </span>
            }
            footer={
              <GoalMeter
                current={asDays.month}
                target={goals.asDays.target}
                direction="lower"
                caption={`목표 ${goals.asDays.target}일 이내`}
              />
            }
          />
          <StatCard
            label="AS 접수"
            icon={Inbox}
            value={asNow.received}
            unit="건"
            meta={{ source: 'mock' }}
            sub={<DeltaText label="전월" delta={percentDelta(asNow.received, asPrev.received, '전월 대비', 'lower')} />}
          />
          <StatCard
            label="교체 주기 준수율"
            icon={CheckCircle2}
            value={complianceNow.value}
            digits={1}
            unit="%"
            meta={{ source: 'mock' }}
            sub={
              <span className="flex flex-wrap gap-x-3">
                <DeltaText
                  label="전월"
                  delta={pointDelta(complianceNow.value, data.compliance[data.compliance.length - 2].value, '전월 대비')}
                  pointUnit="%p"
                />
                <span>필터·미생물</span>
              </span>
            }
          />
        </section>

        <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader title="초기불량률 추이" badge={<MockBadge />} />
            <MonthlyLineChart
              data={data.defectTrend}
              series={[{ key: 'rate', label: '초기불량률', color: 'var(--rc-chart-1)' }]}
              format={(v) => `${formatDecimal(v, 2)}%`}
              axisFormat={(v) => `${formatDecimal(v, 1)}%`}
              reference={{ value: goals.defectRate.target, label: `목표 ${goals.defectRate.target}%` }}
              height={220}
            />
          </Card>

          <Card>
            <CardHeader title="모델별 초기불량률" badge={<MockBadge />} aside={<span className="text-xs text-ink-subtle">연초 누계</span>} />
            <BarList
              items={[...byModel.items]
                .sort((a, b) => b.ytd - a.ytd)
                .map((m) => ({
                  key: m.id,
                  label: m.name,
                  value: m.ytd,
                  valueLabel: `${formatDecimal(m.ytd, 2)}%`,
                  extra: `이번 달 ${formatDecimal(m.month, 2)}%`,
                  title: `${m.name} 연초 누계 ${formatDecimal(m.ytd, 2)}% · 이번 달 ${formatDecimal(m.month, 2)}%`,
                }))}
              markers={[
                { value: goals.defectRate.target, label: `목표 ${goals.defectRate.target}%`, color: 'var(--rc-important)' },
                { value: byModel.alertThreshold, label: `경보 ${formatDecimal(byModel.alertThreshold)}%`, color: 'var(--rc-urgent)' },
              ]}
            />
          </Card>

          <Card>
            <CardHeader title="AS 접수·처리 퍼널" badge={<MockBadge />} aside={<span className="text-xs text-ink-subtle">이번 달</span>} />
            <BarList
              items={funnel.stages.map((s) => ({
                key: s.id,
                label: s.label,
                value: s.month,
                valueLabel: `${formatInt(s.month)}건`,
                extra: `접수 대비 ${formatDecimal((s.month / received) * 100, 0)}%`,
                title: `${s.label} — 연초 누계 ${formatInt(s.ytd)}건`,
              }))}
              max={received}
            />
            <p className="mt-4 border-t border-border pt-3 text-xs text-ink-subtle">
              연초 누계 접수 {formatInt(funnel.stages[0].ytd)}건 · 처리완료 {formatInt(funnel.stages[3].ytd)}건
            </p>
          </Card>

          <Card>
            <CardHeader title="AS 평균 처리일 추이" badge={<MockBadge />} />
            <MonthlyLineChart
              data={data.asTrend}
              series={[{ key: 'days', label: '평균 처리일', color: 'var(--rc-chart-1)' }]}
              format={(v) => `${formatDecimal(v)}일`}
              axisFormat={(v) => `${formatDecimal(v, 0)}일`}
              reference={{ value: goals.asDays.target, label: `목표 ${goals.asDays.target}일` }}
              height={220}
            />
          </Card>

          <Card>
            <CardHeader title="고장 유형 Top5" badge={<MockBadge />} aside={<span className="text-xs text-ink-subtle">연초 누계 {formatInt(failures.total)}건</span>} />
            <p className="-mt-2 mb-4 text-xs text-ink-subtle">상위 3개 유형이 전체의 {formatDecimal(top3Share, 0)}% (파레토 누적)</p>
            <BarList
              items={failures.items.map((f) => ({
                key: f.type,
                label: f.type,
                value: f.share,
                valueLabel: `${formatDecimal(f.share)}%`,
                extra: f.type === '기타' ? `${formatInt(f.count)}건` : `${formatInt(f.count)}건 · 누적 ${formatDecimal(f.cumulativeShare, 0)}%`,
                color: f.type === '기타' ? 'var(--rc-chart-compare)' : undefined,
              }))}
            />
          </Card>

          <Card>
            <CardHeader title="교체 주기 준수율 추이" badge={<MockBadge />} />
            <p className="-mt-2 mb-3 text-xs text-ink-subtle">권장 주기에 맞춰 필터·미생물을 교체한 기기 비율</p>
            <MonthlyLineChart
              data={data.compliance}
              series={[{ key: 'value', label: '준수율', color: 'var(--rc-chart-1)' }]}
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
