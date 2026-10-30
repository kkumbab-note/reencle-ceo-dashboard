import { lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AppLayout } from './components/layout/AppLayout'
import { AsOfProvider } from './state/AsOfContext'

// 화면별로 나눠 불러와요 — 차트·지도 라이브러리를 첫 화면에 한꺼번에 싣지 않으려고
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const GlobalSales = lazy(() => import('./pages/GlobalSales').then((m) => ({ default: m.GlobalSales })))
const Customer = lazy(() => import('./pages/Customer').then((m) => ({ default: m.Customer })))
const Quality = lazy(() => import('./pages/Quality').then((m) => ({ default: m.Quality })))
const Esg = lazy(() => import('./pages/Esg').then((m) => ({ default: m.Esg })))
const ComingSoon = lazy(() => import('./pages/ComingSoon').then((m) => ({ default: m.ComingSoon })))

// GitHub Pages 처럼 하위 경로(/reencle-ceo-dashboard/)에 올릴 때도 주소가 맞도록 Vite base 를 따라가요
const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export function App() {
  return (
    <AsOfProvider>
      <BrowserRouter basename={BASENAME}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="sales" element={<GlobalSales />} />
            <Route path="customer" element={<Customer />} />
            <Route path="quality" element={<Quality />} />
            <Route path="esg" element={<Esg />} />
            {/* 경영 관리 메뉴 — 아직 화면이 없어 준비 중 안내 */}
            <Route path="manage/*" element={<ComingSoon />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AsOfProvider>
  )
}
