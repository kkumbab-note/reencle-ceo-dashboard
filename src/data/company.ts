/**
 * 회사 팩트시트 — 공개자료에서 온 값만 둬요. 이 파일에 있는 값만 화면에서 '실제'로 표시해요.
 * 출처: Reencle_dashboard_prompt_v1.md §1 (2026-10-30 작성)
 */
import type { PublicSource, RegionId } from './types'

// sourceUrl 이 null 이면 원문 링크를 아직 확보하지 못한 것 [확인필요]
const SOURCES = {
  jobkoreaFinance: { sourceLabel: '잡코리아 기업정보(재무)', sourceUrl: null },
  saraminIncruit: { sourceLabel: '사람인·인크루트 기업정보', sourceUrl: null },
  saraminJobkorea: { sourceLabel: '사람인·잡코리아 기업정보', sourceUrl: null },
  jumpUpArticle: { sourceLabel: '중기부 도약 프로그램 선정 기사 (2026-05)', sourceUrl: null },
  envexArticle: { sourceLabel: 'ENVEX 2026 기사', sourceUrl: null },
  overseas: { sourceLabel: 'reencle.co · 해외 리뷰', sourceUrl: 'https://reencle.co' },
  productPages: { sourceLabel: '린클 제품 페이지·기사', sourceUrl: null },
  loyaltyAward: {
    sourceLabel: '한국경제 「린클, 관리 부담 낮춘 음식물처리기」 (2026-05-05)',
    sourceUrl: 'https://www.hankyung.com/article/2026050562791',
  },
  kitchenInnovation: { sourceLabel: '경남도민일보', sourceUrl: null },
  idea: {
    sourceLabel: 'IDSA IDEA 갤러리 — Reencle Prime',
    sourceUrl: 'https://www.idsa.org/awards-recognition/idea/idea-gallery/reencle-prime',
  },
  strategy: { sourceLabel: '이투데이·네이트 기사', sourceUrl: null },
  danawa: { sourceLabel: '다나와 기획전 (2026-04 판매량 기준)', sourceUrl: null },
} satisfies Record<string, Pick<PublicSource, 'sourceLabel' | 'sourceUrl'>>

function pub(key: keyof typeof SOURCES, asOf: string, note?: string): PublicSource {
  return { source: 'public', ...SOURCES[key], asOf, ...(note && { note }) }
}

/** 연매출 (백만원) — 2022~2025 */
export const ANNUAL_REVENUE = [
  { year: 2022, value: 26_880, ...pub('jobkoreaFinance', '2022-12-31') },
  { year: 2023, value: 28_570, ...pub('jobkoreaFinance', '2023-12-31') },
  { year: 2024, value: 24_870, ...pub('jobkoreaFinance', '2024-12-31', '사람인 기준 246.3억 — 출처 간 소폭 차이') },
  { year: 2025, value: 31_410, ...pub('jobkoreaFinance', '2025-12-31') },
]

/** 누적 판매대수 기준점 — 이후 증가분은 가상 데이터로 더해요 */
export const CUMULATIVE_UNITS_ANCHOR = {
  value: 300_000,
  month: '2026-05',
  ...pub('jumpUpArticle', '2026-05', '"30만 대 이상" 표현 — 하한값으로 사용'),
}

/** 24시간 내 감량률 % — ESG 감량 계산에 써요 */
export const REDUCTION_RATE = { value: 98, ...pub('envexArticle', '2026', '약 98% 감량, 미생물 발효·분해, 칼날·고온 없음') }

export const COMPANY_PROFILE = {
  corporation: { value: '㈜비앤테크', ...pub('saraminJobkorea', '2026-10') },
  brand: 'Reencle (린클)',
  headquarters: { value: '김해', ...pub('saraminJobkorea', '2026-10') },
  founded: { value: '2018-03-01', ...pub('saraminJobkorea', '2026-10') },
  employees: { min: 41, max: 47, ...pub('saraminIncruit', '2026-10') },
}

/** 출시 시장 — 2021 한국 → 2022 미국·캐나다·일본·EU */
export const MARKET_LAUNCHES: Array<{ market: string; region: RegionId; year: number }> = [
  { market: '한국', region: 'kr', year: 2021 },
  { market: '미국', region: 'na', year: 2022 },
  { market: '캐나다', region: 'na', year: 2022 },
  { market: '일본', region: 'jp', year: 2022 },
  { market: 'EU', region: 'eu', year: 2022 },
]
export const MARKET_LAUNCHES_SOURCE = pub('overseas', '2026-10')

/**
 * 미국 아마존 판매가 — 팩트시트 값.
 * [확인필요] 2026-10 웹 검색에선 정가 $699 · 할인가 $479~$499 로 보여 팩트시트($549)와 달라요.
 */
export const AMAZON_US_PRICE = { value: 549, currency: 'USD', model: 'Prime', ...pub('overseas', '2026-10') }

export const PRODUCT_LINEUP = [
  { id: 'easy', name: '이지' },
  { id: 'prime', name: '프라임' },
  { id: 'primeS', name: '프라임S' },
  { id: 'gravity', name: '그래비티' },
  { id: 'gravityW', name: '그래비티W', note: 'IoT 앱 연동' },
] as const
export const PRODUCT_LINEUP_SOURCE = pub('productPages', '2026-10')

export const AWARDS = [
  { title: '브랜드 고객충성도 대상 음식물처리기 부문 3년 연속 1위', year: 2026, ...pub('loyaltyAward', '2026-05-05') },
  { title: '독일 키친 이노베이션 어워드 4개 부문', year: 2025, ...pub('kitchenInnovation', '2025') },
  { title: 'IDEA 2024', year: 2024, ...pub('idea', '2024') },
]

export const STRATEGY = {
  items: ['2026 중기부 도약(Jump-up) 프로그램 선정', '하이브리드 차세대 솔루션', '자원순환·탄소저감', '수출국 다변화'],
  ...pub('strategy', '2026'),
}

/** 국내 음식물처리기 판매량 점유율 — 건조·분쇄식 포함 전체 시장. 린클 점유율은 공개값이 없어요. */
export const DOMESTIC_COMPETITORS = {
  shares: [
    { brand: '미닉스', share: 38 },
    { brand: '쿠쿠', share: 30 },
  ],
  ...pub('danawa', '2026-04'),
}

export function getAnnualRevenue() {
  return ANNUAL_REVENUE
}

export function getCompanyFacts() {
  return {
    profile: COMPANY_PROFILE,
    launches: { items: MARKET_LAUNCHES, ...MARKET_LAUNCHES_SOURCE },
    amazonPrice: AMAZON_US_PRICE,
    lineup: { items: PRODUCT_LINEUP, ...PRODUCT_LINEUP_SOURCE },
    awards: AWARDS,
    strategy: STRATEGY,
    competitors: DOMESTIC_COMPETITORS,
    reductionRate: REDUCTION_RATE,
    cumulativeUnitsAnchor: CUMULATIVE_UNITS_ANCHOR,
  }
}
