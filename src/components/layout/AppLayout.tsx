import { Suspense, useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useBreakpoint, type Breakpoint } from '../../hooks/useBreakpoint'
import { cx } from '../../lib/cx'
import { NAV_ITEMS } from './navItems'
import { MobileDrawer, Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppLayout() {
  const bp = useBreakpoint()
  const isMobile = bp === 'mobile'
  const { pathname } = useLocation()

  const [drawerOpen, setDrawerOpen] = useState(false)
  // 햄버거로 바꾼 접힘 상태는 그 화면 폭 구간 안에서만 유지해요.
  // 구간이 바뀌면 기본값(태블릿 = 아이콘만, 데스크톱 = 펼침)으로 돌아가요.
  const [collapseOverride, setCollapseOverride] = useState<{ bp: Breakpoint; collapsed: boolean } | null>(null)
  const collapsed = collapseOverride?.bp === bp ? collapseOverride.collapsed : bp === 'tablet'

  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const handleMenuClick = () => {
    if (isMobile) setDrawerOpen(true)
    else setCollapseOverride({ bp, collapsed: !collapsed })
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    const current = NAV_ITEMS.find((item) => item.path === pathname)
    document.title = current ? `${current.label} · Reencle CEO Dashboard` : 'Reencle CEO Dashboard'
  }, [pathname])

  return (
    <div className="min-h-dvh">
      {isMobile ? <MobileDrawer open={drawerOpen} onClose={closeDrawer} /> : <Sidebar collapsed={collapsed} />}

      <div
        className={cx(
          'flex min-h-dvh min-w-0 flex-col transition-[padding] duration-200',
          !isMobile && (collapsed ? 'pl-[76px]' : 'pl-64'),
        )}
      >
        <Topbar isMobile={isMobile} navExpanded={isMobile ? drawerOpen : !collapsed} onMenuClick={handleMenuClick} />
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-5 md:px-6 md:py-6 xl:px-8">
          <Suspense
            fallback={
              <p className="py-20 text-center text-sm text-ink-subtle" role="status">
                화면을 불러오는 중…
              </p>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
