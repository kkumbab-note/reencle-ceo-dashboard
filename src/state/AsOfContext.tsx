import { createContext, useContext, useState, type ReactNode } from 'react'
import { referenceDate } from '../data/dashboard'
import { LATEST_MONTH } from '../data/period'
import type { YearMonth } from '../data/types'

interface AsOfState {
  /** 기준월 */
  asOf: YearMonth
  /** 화면에 보여줄 기준일 (최신월이면 오늘, 지난달이면 그달 말일) */
  asOfDate: string
  setAsOf: (month: YearMonth) => void
}

const AsOfContext = createContext<AsOfState | null>(null)

export function AsOfProvider({ children }: { children: ReactNode }) {
  const [asOf, setAsOf] = useState<YearMonth>(LATEST_MONTH)
  return (
    <AsOfContext.Provider value={{ asOf, asOfDate: referenceDate(asOf), setAsOf }}>{children}</AsOfContext.Provider>
  )
}

export function useAsOf(): AsOfState {
  const state = useContext(AsOfContext)
  if (!state) throw new Error('useAsOf 는 AsOfProvider 안에서만 쓸 수 있어요')
  return state
}
