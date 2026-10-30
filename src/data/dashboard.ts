/** 메인 대시보드 전용 조합 — KPI 카드, CEO 브리핑, 주요 일정 */
import { formatDecimal, formatEok, formatInt, formatMan, formatSigned } from '../lib/format'
import { getChannelRatings, getNps, RATING_ALERT_THRESHOLD } from './customer'
import { getCumulativeReduction } from './esg'
import { GOALS } from './goals'
import { BASE_DATE, daysInMonth, LATEST_MONTH, parseYearMonth } from './period'
import { getAsDays, getDefectByModel, MODEL_DEFECT_ALERT } from './quality'
import { getCumulativeUnits, getOverseasShare, getRevenueSummary } from './sales'
import type { PublicSource, SourceMeta, YearMonth } from './types'
import { metaOf, mock, percentDelta, pointDelta, type Delta } from './util'

export interface HeadlineKpi {
  id: 'revenueYtd' | 'cumulativeUnits' | 'overseasShare' | 'nps' | 'cumulativeReduction'
  label: string
  value: number
  unit: string
  /** 값이 무엇인지 한 줄 설명 */
  caption: string
  mom: Delta
  yoy: Delta
  meta: SourceMeta
  path: string
  /** 공개값 + 가상 증분으로 이뤄진 값 */
  breakdown?: { publicValue: number; publicAsOf: string; publicMeta: PublicSource; mockValue: number }
}

export function getHeadlineKpis(asOf: YearMonth = LATEST_MONTH): HeadlineKpi[] {
  const month = parseYearMonth(asOf).month
  const revenue = getRevenueSummary(asOf)
  const units = getCumulativeUnits(asOf)
  const overseas = getOverseasShare(asOf)
  const nps = getNps(asOf)
  const reduction = getCumulativeReduction(asOf)

  return [
    {
      id: 'revenueYtd',
      label: '연매출 YTD',
      value: revenue.ytd,
      unit: '백만원',
      caption: `${parseYearMonth(asOf).year}년 1~${month}월 누계`,
      mom: percentDelta(revenue.month, revenue.prevMonth, '월 매출 전월 대비'),
      yoy: percentDelta(revenue.ytd, revenue.ytdPrevYear, '전년 동기 대비'),
      meta: metaOf(revenue),
      path: '/sales',
    },
    {
      id: 'cumulativeUnits',
      label: '누적 판매대수',
      value: units.value,
      unit: '대',
      caption: `이번 달 +${formatInt(units.monthUnits)}대`,
      mom: percentDelta(units.monthUnits, units.prevMonthUnits, '월 판매대수 전월 대비'),
      yoy: percentDelta(units.value, units.yearAgo, '누적 전년 동월 대비'),
      meta: metaOf(units),
      path: '/sales',
      breakdown: units.breakdown,
    },
    {
      id: 'overseasShare',
      label: '해외매출 비중',
      value: overseas.ytd,
      unit: '%',
      caption: `연초 누계 · 목표 ${GOALS.overseasShare.target}%`,
      mom: pointDelta(overseas.month, overseas.prevMonth, '월 비중 전월 대비'),
      yoy: pointDelta(overseas.ytd, overseas.ytdPrevYear, '전년 동기 대비'),
      meta: mock(),
      path: '/sales',
    },
    {
      id: 'nps',
      label: 'NPS',
      value: nps.value,
      unit: '점',
      caption: `추천 ${nps.promoters}% · 비추천 ${nps.detractors}%`,
      mom: pointDelta(nps.value, nps.prevMonth, '전월 대비'),
      yoy: pointDelta(nps.value, nps.yearAgo, '전년 동월 대비'),
      meta: mock(),
      path: '/customer',
    },
    {
      id: 'cumulativeReduction',
      label: '누적 음식물 감량',
      value: reduction.value,
      unit: '톤',
      caption: `이번 달 +${formatInt(reduction.monthTons)}톤`,
      mom: percentDelta(reduction.monthTons, reduction.prevMonthTons, '월 감량 전월 대비'),
      yoy: percentDelta(reduction.value, reduction.yearAgo, '누적 전년 동월 대비'),
      meta: metaOf(reduction),
      path: '/esg',
    },
  ]
}

// ---------------------------------------------------------------------------
// 주요 일정 (가상)

export type ScheduleType = '전시회' | '인증' | '출시' | '프로모션' | '회의' | '계약'

const SCHEDULE: Array<{ date: string; type: ScheduleType; title: string }> = [
  { date: '2026-11-02', type: '인증', title: 'EU 인증(CE·RoHS) 갱신 서류 제출 마감' },
  { date: '2026-11-12', type: '계약', title: '일본 유통 파트너 연간 계약 갱신' },
  { date: '2026-11-19', type: '회의', title: '이사회 — 3분기 실적·2027 사업계획 보고' },
  { date: '2026-11-27', type: '프로모션', title: '북미 블랙프라이데이 프로모션 시작' },
  { date: '2026-12-08', type: '출시', title: '그래비티W 앱 2.0 업데이트 배포' },
  { date: '2026-12-10', type: '전시회', title: '해외 바이어 초청 전시회 참가' },
  { date: '2027-01-14', type: '출시', title: '영국 오프라인 리테일 입점' },
]

/** 기준월의 '오늘' — 최신월이면 기준일, 지난달이면 그달 말일 */
export function referenceDate(asOf: YearMonth): string {
  if (asOf === LATEST_MONTH) return BASE_DATE
  return `${asOf}-${String(daysInMonth(asOf)).padStart(2, '0')}`
}

function dayDiff(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000)
}

export function getSchedule(asOf: YearMonth = LATEST_MONTH, limit = 5) {
  const today = referenceDate(asOf)
  return {
    ...mock(),
    today,
    items: SCHEDULE.filter((s) => s.date >= today)
      .slice(0, limit)
      .map((s) => ({ ...s, dDay: dayDiff(today, s.date) })),
  }
}

// ---------------------------------------------------------------------------
// 오늘의 CEO 브리핑 — 데이터에서 이상 신호를 찾아 만들어요

export type BriefingLevel = 'urgent' | 'important' | 'normal'

export interface BriefingItem {
  level: BriefingLevel
  title: string
  detail: string
  path: string
}

const LEVEL_ORDER: Record<BriefingLevel, number> = { urgent: 0, important: 1, normal: 2 }

export function getBriefing(asOf: YearMonth = LATEST_MONTH, limit = 6) {
  const items: BriefingItem[] = []

  // 1) 채널 평점이 기준선 아래로 떨어짐
  for (const ch of getChannelRatings(asOf).channels) {
    if (ch.month < RATING_ALERT_THRESHOLD) {
      items.push({
        level: 'urgent',
        title: `${ch.label} 평점 ${formatDecimal(ch.month)} — 기준선 ${formatDecimal(RATING_ALERT_THRESHOLD)} 아래로 하락`,
        detail: `전월 ${formatDecimal(ch.prevMonth)} → ${formatDecimal(ch.month)}. 최근 리뷰의 불만 키워드 확인이 필요해요.`,
        path: '/customer',
      })
    }
  }

  // 2) 7일 안에 마감되는 인증·계약 일정
  for (const s of getSchedule(asOf, SCHEDULE.length).items) {
    if ((s.type === '인증' || s.type === '계약') && s.dDay <= 7) {
      items.push({ level: 'urgent', title: `${s.title} D-${s.dDay}`, detail: `${s.date} 마감`, path: '/sales' })
    }
  }

  // 3) 초기불량률이 경보 기준을 넘는 모델
  const defects = getDefectByModel(asOf)
  for (const m of defects.items) {
    if (m.month > MODEL_DEFECT_ALERT) {
      items.push({
        level: 'important',
        title: `${m.name} 초기불량률 ${formatDecimal(m.month, 2)}% — 경보 기준 ${formatDecimal(MODEL_DEFECT_ALERT)}% 초과`,
        detail: `전체 평균(연초 누계) ${formatDecimal(defects.overallYtd, 2)}%`,
        path: '/quality',
      })
    }
  }

  // 4) AS 처리일이 목표보다 김
  const asDays = getAsDays(asOf)
  if (asDays.month > GOALS.asDays.target) {
    items.push({
      level: 'important',
      title: `AS 평균 처리일 ${formatDecimal(asDays.month)}일 — 목표 ${GOALS.asDays.target}일보다 ${formatDecimal(asDays.month - GOALS.asDays.target)}일 김`,
      detail: `전월 ${formatDecimal(asDays.prevMonth)}일`,
      path: '/quality',
    })
  }

  // 5) NPS 전월 대비 2점 이상 하락
  const nps = getNps(asOf)
  if (nps.value - nps.prevMonth <= -2) {
    items.push({
      level: 'important',
      title: `NPS ${nps.value}점 — 전월보다 ${nps.prevMonth - nps.value}점 하락`,
      detail: `비추천 비율 ${nps.detractors}%`,
      path: '/customer',
    })
  }

  // 6) 매출 성장 (좋은 소식)
  const revenue = getRevenueSummary(asOf)
  const yoy = percentDelta(revenue.ytd, revenue.ytdPrevYear, '').value
  items.push({
    level: 'normal',
    title: `연매출 YTD ${formatEok(revenue.ytd)} — 전년 동기 ${formatSigned(yoy)}%`,
    detail: `최근 12개월 ${formatEok(revenue.ltm)} · 2030 목표 ${formatEok(GOALS.revenue.target, 0)}`,
    path: '/sales',
  })

  // 7) 30일 안의 프로모션·출시
  for (const s of getSchedule(asOf, SCHEDULE.length).items) {
    if ((s.type === '프로모션' || s.type === '출시') && s.dDay <= 30) {
      items.push({ level: 'normal', title: `${s.title} D-${s.dDay}`, detail: `${s.date} 시작`, path: '/sales' })
    }
  }

  // 8) 누적 감량 1만 톤 단위 돌파
  const reduction = getCumulativeReduction(asOf)
  const milestone = Math.floor(reduction.value / 10_000) * 10_000
  if (reduction.value - reduction.monthTons < milestone) {
    items.push({
      level: 'normal',
      title: `누적 음식물 감량 ${formatMan(milestone, 0)} 톤 돌파`,
      detail: `이번 달 +${formatInt(reduction.monthTons)}톤`,
      path: '/esg',
    })
  }

  return {
    ...mock('가상 데이터에서 규칙으로 만든 알림'),
    asOf,
    items: items.sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]).slice(0, limit),
  }
}
