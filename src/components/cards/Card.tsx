import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { cx } from '../../lib/cx'

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cx('relative flex flex-col rounded-card bg-surface p-5 shadow-card md:p-6', className)}>
      {children}
    </section>
  )
}

interface CardHeaderProps {
  title: string
  /** 제목 옆 (가상 배지·출처 아이콘 등) */
  badge?: ReactNode
  /** 오른쪽 보조 정보 */
  aside?: ReactNode
  /** 상세 화면 링크 */
  to?: string
}

export function CardHeader({ title, badge, aside, to }: CardHeaderProps) {
  return (
    <header className="mb-4 flex items-center gap-2">
      <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
      {badge}
      <div className="ml-auto flex items-center gap-2">
        {aside}
        {to && (
          <Link
            to={to}
            className="-mr-1.5 flex items-center gap-0.5 rounded-md px-1.5 py-1 text-xs font-medium text-ink-subtle transition-colors hover:text-primary"
          >
            자세히
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
    </header>
  )
}
