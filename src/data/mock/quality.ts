// 가상 데이터 표 (2025-01 ~ 2026-10). 숫자를 고친 뒤엔 `npm test` 로 합계 정합성을 확인해요.
import type { MonthlyAsRow, MonthlyModelRow } from '../types'

/** 월별 모델 초기불량 건수 (판매 후 30일 내) */
export const MONTHLY_DEFECTS: MonthlyModelRow[] = [
  { month: '2025-01', easy: 14, prime: 17, primeS: 9, gravity: 7, gravityW: 3 },
  { month: '2025-02', easy: 13, prime: 15, primeS: 7, gravity: 7, gravityW: 3 },
  { month: '2025-03', easy: 14, prime: 16, primeS: 9, gravity: 7, gravityW: 4 },
  { month: '2025-04', easy: 14, prime: 17, primeS: 9, gravity: 8, gravityW: 4 },
  { month: '2025-05', easy: 16, prime: 19, primeS: 10, gravity: 10, gravityW: 6 },
  { month: '2025-06', easy: 20, prime: 23, primeS: 12, gravity: 11, gravityW: 7 },
  { month: '2025-07', easy: 20, prime: 24, primeS: 12, gravity: 12, gravityW: 8 },
  { month: '2025-08', easy: 18, prime: 21, primeS: 11, gravity: 11, gravityW: 8 },
  { month: '2025-09', easy: 14, prime: 15, primeS: 8, gravity: 8, gravityW: 6 },
  { month: '2025-10', easy: 12, prime: 14, primeS: 7, gravity: 7, gravityW: 6 },
  { month: '2025-11', easy: 13, prime: 15, primeS: 8, gravity: 9, gravityW: 7 },
  { month: '2025-12', easy: 12, prime: 14, primeS: 7, gravity: 8, gravityW: 7 },
  { month: '2026-01', easy: 12, prime: 13, primeS: 7, gravity: 8, gravityW: 7 },
  { month: '2026-02', easy: 10, prime: 11, primeS: 5, gravity: 7, gravityW: 6 },
  { month: '2026-03', easy: 11, prime: 13, primeS: 7, gravity: 8, gravityW: 8 },
  { month: '2026-04', easy: 13, prime: 13, primeS: 7, gravity: 9, gravityW: 9 },
  { month: '2026-05', easy: 14, prime: 14, primeS: 8, gravity: 10, gravityW: 10 },
  { month: '2026-06', easy: 18, prime: 19, primeS: 10, gravity: 13, gravityW: 14 },
  { month: '2026-07', easy: 17, prime: 18, primeS: 10, gravity: 14, gravityW: 14 },
  { month: '2026-08', easy: 17, prime: 18, primeS: 10, gravity: 12, gravityW: 14 },
  { month: '2026-09', easy: 11, prime: 12, primeS: 6, gravity: 9, gravityW: 10 },
  { month: '2026-10', easy: 11, prime: 11, primeS: 6, gravity: 9, gravityW: 11 },
]

/** 월별 AS 퍼널 (건)과 평균 처리일 */
export const MONTHLY_AS: MonthlyAsRow[] = [
  { month: '2025-01', received: 1042, diagnosed: 1011, repaired: 969, closed: 927, avgDays: 4.1 },
  { month: '2025-02', received: 1079, diagnosed: 1047, repaired: 1003, closed: 962, avgDays: 4 },
  { month: '2025-03', received: 1050, diagnosed: 1019, repaired: 977, closed: 938, avgDays: 4 },
  { month: '2025-04', received: 1084, diagnosed: 1051, repaired: 1008, closed: 969, avgDays: 3.9 },
  { month: '2025-05', received: 1110, diagnosed: 1077, repaired: 1032, closed: 994, avgDays: 3.9 },
  { month: '2025-06', received: 1278, diagnosed: 1240, repaired: 1189, closed: 1147, avgDays: 4.1 },
  { month: '2025-07', received: 1325, diagnosed: 1285, repaired: 1232, closed: 1191, avgDays: 4.3 },
  { month: '2025-08', received: 1263, diagnosed: 1225, repaired: 1175, closed: 1137, avgDays: 4.1 },
  { month: '2025-09', received: 1198, diagnosed: 1162, repaired: 1114, closed: 1080, avgDays: 3.7 },
  { month: '2025-10', received: 1198, diagnosed: 1162, repaired: 1114, closed: 1082, avgDays: 3.6 },
  { month: '2025-11', received: 1185, diagnosed: 1149, repaired: 1102, closed: 1072, avgDays: 3.6 },
  { month: '2025-12', received: 1254, diagnosed: 1216, repaired: 1166, closed: 1136, avgDays: 3.5 },
  { month: '2026-01', received: 1239, diagnosed: 1202, repaired: 1152, closed: 1124, avgDays: 3.5 },
  { month: '2026-02', received: 1239, diagnosed: 1202, repaired: 1152, closed: 1126, avgDays: 3.4 },
  { month: '2026-03', received: 1292, diagnosed: 1253, repaired: 1202, closed: 1176, avgDays: 3.4 },
  { month: '2026-04', received: 1285, diagnosed: 1246, repaired: 1195, closed: 1171, avgDays: 3.3 },
  { month: '2026-05', received: 1333, diagnosed: 1293, repaired: 1240, closed: 1217, avgDays: 3.3 },
  { month: '2026-06', received: 1487, diagnosed: 1442, repaired: 1383, closed: 1360, avgDays: 3.5 },
  { month: '2026-07', received: 1544, diagnosed: 1498, repaired: 1436, closed: 1414, avgDays: 3.7 },
  { month: '2026-08', received: 1536, diagnosed: 1490, repaired: 1428, closed: 1409, avgDays: 3.5 },
  { month: '2026-09', received: 1353, diagnosed: 1312, repaired: 1258, closed: 1243, avgDays: 3.1 },
  { month: '2026-10', received: 1377, diagnosed: 1336, repaired: 1281, closed: 1267, avgDays: 3 },
]
