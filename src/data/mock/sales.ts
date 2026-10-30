// 가상 데이터 표 (2025-01 ~ 2026-10). 숫자를 고친 뒤엔 `npm test` 로 합계 정합성을 확인해요.
import type { MonthlyModelRow, MonthlyRegionRow } from '../types'

/** 월별 지역 매출 (백만원). 2025년 합계 = 공개 연매출 31,410 */
export const MONTHLY_REVENUE: MonthlyRegionRow[] = [
  { month: '2025-01', kr: 1748, na: 301, jp: 89, eu: 56, etc: 22 },
  { month: '2025-02', kr: 1537, na: 269, jp: 80, eu: 51, etc: 20 },
  { month: '2025-03', kr: 1757, na: 322, jp: 93, eu: 60, etc: 24 },
  { month: '2025-04', kr: 1909, na: 349, jp: 99, eu: 67, etc: 27 },
  { month: '2025-05', kr: 2142, na: 399, jp: 113, eu: 77, etc: 30 },
  { month: '2025-06', kr: 2369, na: 456, jp: 128, eu: 92, etc: 35 },
  { month: '2025-07', kr: 2535, na: 501, jp: 140, eu: 100, etc: 39 },
  { month: '2025-08', kr: 2347, na: 477, jp: 131, eu: 94, etc: 37 },
  { month: '2025-09', kr: 1950, na: 414, jp: 112, eu: 83, etc: 32 },
  { month: '2025-10', kr: 1844, na: 386, jp: 103, eu: 78, etc: 30 },
  { month: '2025-11', kr: 1993, na: 505, jp: 117, eu: 89, etc: 36 },
  { month: '2025-12', kr: 1874, na: 415, jp: 110, eu: 85, etc: 32 },
  { month: '2026-01', kr: 1847, na: 428, jp: 109, eu: 87, etc: 33 },
  { month: '2026-02', kr: 1580, na: 369, jp: 97, eu: 77, etc: 30 },
  { month: '2026-03', kr: 1895, na: 452, jp: 116, eu: 95, etc: 36 },
  { month: '2026-04', kr: 2064, na: 504, jp: 129, eu: 105, etc: 41 },
  { month: '2026-05', kr: 2358, na: 580, jp: 148, eu: 124, etc: 48 },
  { month: '2026-06', kr: 2642, na: 663, jp: 165, eu: 141, etc: 54 },
  { month: '2026-07', kr: 2774, na: 718, jp: 175, eu: 154, etc: 58 },
  { month: '2026-08', kr: 2635, na: 694, jp: 170, eu: 148, etc: 56 },
  { month: '2026-09', kr: 2069, na: 528, jp: 138, eu: 120, etc: 47 },
  { month: '2026-10', kr: 2067, na: 577, jp: 140, eu: 123, etc: 47 },
]

/** 월별 모델 판매대수 (대) */
export const MONTHLY_UNITS: MonthlyModelRow[] = [
  { month: '2025-01', easy: 1175, prime: 1595, primeS: 902, gravity: 623, gravityW: 179 },
  { month: '2025-02', easy: 1034, prime: 1419, primeS: 817, gravity: 574, gravityW: 190 },
  { month: '2025-03', easy: 1165, prime: 1617, primeS: 925, gravity: 683, gravityW: 240 },
  { month: '2025-04', easy: 1251, prime: 1730, primeS: 944, gravity: 719, gravityW: 287 },
  { month: '2025-05', easy: 1405, prime: 1953, primeS: 1105, gravity: 861, gravityW: 357 },
  { month: '2025-06', easy: 1566, prime: 2124, primeS: 1213, gravity: 951, gravityW: 429 },
  { month: '2025-07', easy: 1600, prime: 2232, primeS: 1261, gravity: 1034, gravityW: 493 },
  { month: '2025-08', easy: 1495, prime: 2001, primeS: 1169, gravity: 966, gravityW: 499 },
  { month: '2025-09', easy: 1285, prime: 1703, primeS: 994, gravity: 846, gravityW: 449 },
  { month: '2025-10', easy: 1177, prime: 1550, primeS: 904, gravity: 783, gravityW: 436 },
  { month: '2025-11', easy: 1311, prime: 1752, primeS: 998, gravity: 889, gravityW: 521 },
  { month: '2025-12', easy: 1178, prime: 1609, primeS: 934, gravity: 847, gravityW: 525 },
  { month: '2026-01', easy: 1151, prime: 1594, primeS: 939, gravity: 855, gravityW: 547 },
  { month: '2026-02', easy: 986, prime: 1314, primeS: 766, gravity: 742, gravityW: 499 },
  { month: '2026-03', easy: 1168, prime: 1590, primeS: 957, gravity: 919, gravityW: 622 },
  { month: '2026-04', easy: 1293, prime: 1698, primeS: 1042, gravity: 1040, gravityW: 740 },
  { month: '2026-05', easy: 1456, prime: 1921, primeS: 1154, gravity: 1156, gravityW: 865 },
  { month: '2026-06', easy: 1654, prime: 2188, primeS: 1317, gravity: 1347, gravityW: 1029 },
  { month: '2026-07', easy: 1661, prime: 2160, primeS: 1359, gravity: 1423, gravityW: 1095 },
  { month: '2026-08', easy: 1634, prime: 2073, primeS: 1306, gravity: 1408, gravityW: 1119 },
  { month: '2026-09', easy: 1261, prime: 1640, primeS: 993, gravity: 1110, gravityW: 918 },
  { month: '2026-10', easy: 1272, prime: 1623, primeS: 1027, gravity: 1176, gravityW: 980 },
]
