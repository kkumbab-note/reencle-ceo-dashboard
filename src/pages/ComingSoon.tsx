import { Link, useLocation } from 'react-router'
import { ArrowLeft, Construction } from 'lucide-react'
import { Card } from '../components/cards/Card'
import { PageHeader } from '../components/layout/PageHeader'
import { NAV_ITEMS } from '../components/layout/navItems'

/** 아직 화면을 만들지 않은 '경영 관리' 메뉴 */
export function ComingSoon() {
  const { pathname } = useLocation()
  const item = NAV_ITEMS.find((i) => i.path === pathname)
  const Icon = item?.icon ?? Construction
  const label = item?.label ?? '준비 중'

  return (
    <>
      <PageHeader title={label} description="경영 관리" />
      <Card className="items-center py-14 text-center md:py-20">
        <span className="grid size-16 place-items-center rounded-full bg-primary-soft text-primary">
          <Icon className="size-8" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-lg font-bold text-ink">{label} 화면은 준비 중이에요</h2>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          이번 Concept Prototype은 KPI 대시보드 5개 화면까지 만들었어요. 이 메뉴는 자리만 잡아 두었어요.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-10 items-center gap-1.5 rounded-control border border-border bg-surface px-4 text-sm font-medium text-ink-muted shadow-card transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          대시보드로 돌아가기
        </Link>
      </Card>
    </>
  )
}
