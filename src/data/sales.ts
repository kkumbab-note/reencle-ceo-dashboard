/** 매출·판매 — 2022~2025 연매출만 공개값, 나머지는 가상 데이터 */
import { CUMULATIVE_UNITS_ANCHOR, getAnnualRevenue, PRODUCT_LINEUP } from './company'
import { MONTHLY_REVENUE, MONTHLY_UNITS } from './mock/sales'
import { addMonths, FIRST_MONTH, LATEST_MONTH, ltmMonths, monthRange, sameMonthLastYear, ytdMonths } from './period'
import type { ModelId, PublicSource, RegionId, RegionValues, YearMonth } from './types'
import { allocate, metaOf, mock, rowFor, rowsFor, sum, sumRecord, sumRows } from './util'

export const REGIONS: Array<{ id: RegionId; label: string }> = [
  { id: 'kr', label: '국내' },
  { id: 'na', label: '북미' },
  { id: 'jp', label: '일본' },
  { id: 'eu', label: 'EU' },
  { id: 'etc', label: '기타' },
]
export const REGION_IDS = REGIONS.map((r) => r.id)
export const OVERSEAS_REGION_IDS: RegionId[] = ['na', 'jp', 'eu', 'etc']

export const MODEL_IDS: ModelId[] = PRODUCT_LINEUP.map((m) => m.id)

interface CountryMix {
  code: string
  /** world-atlas 지도 id (ISO 3166-1 숫자) */
  isoNumeric: string
  name: string
  region: RegionId
  /** 지역 매출 중 이 나라 비중 % */
  share: number
  /** 이 나라 매출 중 채널 비중 % */
  channels: Array<{ name: string; share: number }>
}

/** 지역 → 국가 → 채널 구성비 (가상). 각 단계 합은 100 이어야 해요. */
export const COUNTRY_MIX: CountryMix[] = [
  {
    code: 'KR',
    isoNumeric: '410',
    name: '한국',
    region: 'kr',
    share: 100,
    channels: [
      { name: '네이버 스마트스토어', share: 26 },
      { name: '자사몰', share: 22 },
      { name: '쿠팡', share: 20 },
      { name: '홈쇼핑', share: 12 },
      { name: 'B2B·공공', share: 10 },
      { name: '오프라인', share: 10 },
    ],
  },
  {
    code: 'US',
    isoNumeric: '840',
    name: '미국',
    region: 'na',
    share: 88,
    channels: [
      { name: 'Amazon US', share: 62 },
      { name: '자사몰', share: 30 },
      { name: '리테일 파트너', share: 8 },
    ],
  },
  {
    code: 'CA',
    isoNumeric: '124',
    name: '캐나다',
    region: 'na',
    share: 12,
    channels: [
      { name: 'Amazon CA', share: 70 },
      { name: '자사몰', share: 30 },
    ],
  },
  {
    code: 'JP',
    isoNumeric: '392',
    name: '일본',
    region: 'jp',
    share: 100,
    channels: [
      { name: 'Amazon JP', share: 55 },
      { name: '라쿠텐', share: 25 },
      { name: '현지 파트너', share: 20 },
    ],
  },
  {
    code: 'DE',
    isoNumeric: '276',
    name: '독일',
    region: 'eu',
    share: 40,
    channels: [
      { name: 'Amazon DE', share: 60 },
      { name: '현지 파트너', share: 40 },
    ],
  },
  {
    code: 'FR',
    isoNumeric: '250',
    name: '프랑스',
    region: 'eu',
    share: 20,
    channels: [
      { name: 'Amazon FR', share: 65 },
      { name: '현지 파트너', share: 35 },
    ],
  },
  {
    code: 'NL',
    isoNumeric: '528',
    name: '네덜란드',
    region: 'eu',
    share: 15,
    channels: [
      { name: '현지 파트너', share: 70 },
      { name: '자사몰', share: 30 },
    ],
  },
  { code: 'IT', isoNumeric: '380', name: '이탈리아', region: 'eu', share: 13, channels: [{ name: 'Amazon IT', share: 100 }] },
  { code: 'ES', isoNumeric: '724', name: '스페인', region: 'eu', share: 12, channels: [{ name: 'Amazon ES', share: 100 }] },
  {
    code: 'GB',
    isoNumeric: '826',
    name: '영국',
    region: 'etc',
    share: 45,
    channels: [
      { name: 'Amazon UK', share: 70 },
      { name: '자사몰', share: 30 },
    ],
  },
  {
    code: 'AU',
    isoNumeric: '036',
    name: '호주',
    region: 'etc',
    share: 35,
    channels: [
      { name: '현지 파트너', share: 60 },
      { name: 'Amazon AU', share: 40 },
    ],
  },
  { code: 'TW', isoNumeric: '158', name: '대만', region: 'etc', share: 20, channels: [{ name: '현지 파트너', share: 100 }] },
]

/** 미생물식 시장 점유율 추정 (가상) — 2030 목표가 없어서 진척도엔 반영하지 않아요 */
const MARKET_SHARE_ESTIMATE = { domesticMicrobial: 41, globalMicrobial: 12 }

function revenueTotal(month: YearMonth): number {
  return sumRecord(rowFor(MONTHLY_REVENUE, month), REGION_IDS)
}

function revenueByRegion(months: YearMonth[]): RegionValues {
  return sumRows(rowsFor(MONTHLY_REVENUE, months), REGION_IDS)
}

function overseasShareOf(values: RegionValues): number {
  const total = sumRecord(values, REGION_IDS)
  return total === 0 ? 0 : (sumRecord(values, OVERSEAS_REGION_IDS) / total) * 100
}

function unitsTotal(month: YearMonth): number {
  return sumRecord(rowFor(MONTHLY_UNITS, month), MODEL_IDS)
}

/** 2022~2025 연매출(공개) */
export { getAnnualRevenue }

/** 월별 매출 (백만원) */
export function getMonthlyRevenue(from: YearMonth = FIRST_MONTH, to: YearMonth = LATEST_MONTH) {
  return {
    ...mock(),
    items: monthRange(from, to).map((month) => {
      const byRegion = revenueByRegion([month])
      return { month, total: sumRecord(byRegion, REGION_IDS), byRegion, overseasShare: overseasShareOf(byRegion) }
    }),
  }
}

/** 매출 요약 — YTD·전년 동기·월·전월·최근 12개월 */
export function getRevenueSummary(asOf: YearMonth = LATEST_MONTH) {
  const ytd = sum(ytdMonths(asOf).map(revenueTotal))
  const ytdPrevYear = sum(ytdMonths(sameMonthLastYear(asOf)).map(revenueTotal))
  return {
    ...mock('2026년 월별 매출은 가상 데이터'),
    asOf,
    ytd,
    ytdPrevYear,
    month: revenueTotal(asOf),
    prevMonth: revenueTotal(addMonths(asOf, -1)),
    ltm: sum(ltmMonths(asOf).map(revenueTotal)),
  }
}

/** 지역별 매출 구성 (YTD) */
export function getRegionBreakdown(asOf: YearMonth = LATEST_MONTH) {
  const values = revenueByRegion(ytdMonths(asOf))
  const total = sumRecord(values, REGION_IDS)
  return {
    ...mock(),
    asOf,
    total,
    items: REGIONS.map(({ id, label }) => ({ id, label, value: values[id], share: (values[id] / total) * 100 })),
  }
}

/** 해외매출 비중 (%) — YTD·월 기준과 전년·전월 값 */
export function getOverseasShare(asOf: YearMonth = LATEST_MONTH) {
  return {
    ...mock(),
    asOf,
    ytd: overseasShareOf(revenueByRegion(ytdMonths(asOf))),
    ytdPrevYear: overseasShareOf(revenueByRegion(ytdMonths(sameMonthLastYear(asOf)))),
    month: overseasShareOf(revenueByRegion([asOf])),
    prevMonth: overseasShareOf(revenueByRegion([addMonths(asOf, -1)])),
  }
}

/** 국가·채널별 매출 (YTD). 국가 합 = 지역 합이 되도록 정수 배분해요. */
export function getCountrySales(asOf: YearMonth = LATEST_MONTH) {
  const byRegion = revenueByRegion(ytdMonths(asOf))
  const countries = REGION_IDS.flatMap((region) => {
    const list = COUNTRY_MIX.filter((c) => c.region === region)
    const amounts = allocate(byRegion[region], list.map((c) => c.share))
    return list.map((c, i) => {
      const channelAmounts = allocate(amounts[i], c.channels.map((ch) => ch.share))
      return {
        code: c.code,
        isoNumeric: c.isoNumeric,
        name: c.name,
        region: c.region,
        value: amounts[i],
        channels: c.channels.map((ch, k) => ({ name: ch.name, value: channelAmounts[k] })),
      }
    })
  })
  return { ...mock(), asOf, total: sumRecord(byRegion, REGION_IDS), countries }
}

/** 진출국 수 (가상) */
export function getMarketCountries() {
  return { ...mock('팩트시트의 출시 시장(한국·미국·캐나다·일본·EU)을 국가 단위로 가정'), count: COUNTRY_MIX.length }
}

export function getMarketShareEstimate() {
  return { ...mock('시장 규모 추정 기반, 진척도 미반영'), ...MARKET_SHARE_ESTIMATE }
}

/** 모델별 판매대수 (YTD) */
export function getUnitsByModel(asOf: YearMonth = LATEST_MONTH) {
  const current = sumRows(rowsFor(MONTHLY_UNITS, ytdMonths(asOf)), MODEL_IDS)
  const prevYear = sumRows(rowsFor(MONTHLY_UNITS, ytdMonths(sameMonthLastYear(asOf))), MODEL_IDS)
  return {
    ...mock(),
    asOf,
    total: sumRecord(current, MODEL_IDS),
    items: PRODUCT_LINEUP.map(({ id, name }) => ({ id, name, value: current[id], prevYear: prevYear[id] })),
  }
}

/** 월별 판매대수 합계 */
export function getMonthlyUnits(from: YearMonth = FIRST_MONTH, to: YearMonth = LATEST_MONTH) {
  return { ...mock(), items: monthRange(from, to).map((month) => ({ month, value: unitsTotal(month) })) }
}

/**
 * 누적 판매대수 — 2026-05 공개값 30만 대를 기준점으로,
 * 이후 달은 가상 판매대수를 더하고 이전 달은 빼서 계산해요.
 */
export function cumulativeUnits(asOf: YearMonth): number {
  const anchor = CUMULATIVE_UNITS_ANCHOR
  if (asOf === anchor.month) return anchor.value
  if (asOf > anchor.month) return anchor.value + sum(monthRange(addMonths(anchor.month, 1), asOf).map(unitsTotal))
  return anchor.value - sum(monthRange(addMonths(asOf, 1), anchor.month).map(unitsTotal))
}

export function getCumulativeUnits(asOf: YearMonth = LATEST_MONTH) {
  const anchor = CUMULATIVE_UNITS_ANCHOR
  const value = cumulativeUnits(asOf)
  return {
    ...(asOf === anchor.month
      ? { source: anchor.source, sourceLabel: anchor.sourceLabel, sourceUrl: anchor.sourceUrl, asOf: anchor.asOf }
      : mock(`공개값 ${anchor.value.toLocaleString('ko-KR')}대(${anchor.month}) 기준 가상 증감`)),
    month: asOf,
    value,
    breakdown: {
      publicValue: anchor.value,
      publicAsOf: anchor.month,
      publicMeta: metaOf(anchor) as PublicSource,
      mockValue: value - anchor.value,
    },
    monthUnits: unitsTotal(asOf),
    prevMonthUnits: unitsTotal(addMonths(asOf, -1)),
    yearAgo: cumulativeUnits(sameMonthLastYear(asOf)),
  }
}
