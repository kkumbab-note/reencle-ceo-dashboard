import { useState, type ButtonHTMLAttributes } from 'react'
import { Bell, ChevronDown, Menu, Search } from 'lucide-react'
import { cx } from '../../lib/cx'
import { Logo } from './Logo'

function IconButton({ label, className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        'relative grid size-10 shrink-0 place-items-center rounded-control text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

function SearchField({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  return (
    <label
      className={cx(
        'flex h-10 items-center gap-2 rounded-control border border-border bg-surface-muted px-3 text-ink-subtle transition-colors focus-within:border-primary focus-within:bg-surface',
        className,
      )}
    >
      <Search className="size-4 shrink-0" aria-hidden="true" />
      <input
        type="search"
        placeholder="메뉴, KPI, 국가 검색..."
        aria-label="메뉴, KPI, 국가 검색"
        autoFocus={autoFocus}
        className="w-full min-w-0 bg-transparent text-base text-ink outline-none placeholder:text-ink-subtle md:text-sm"
      />
    </label>
  )
}

interface TopbarProps {
  isMobile: boolean
  navExpanded: boolean
  onMenuClick: () => void
}

export function Topbar({ isMobile, navExpanded, onMenuClick }: TopbarProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const notificationCount = 3

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
      <div className="flex h-16 items-center gap-2 px-4 md:gap-3 md:px-6 xl:px-8">
        <IconButton
          label={isMobile ? '메뉴 열기' : navExpanded ? '사이드바 접기' : '사이드바 펼치기'}
          aria-expanded={navExpanded}
          onClick={onMenuClick}
          className="-ml-2"
        >
          <Menu className="size-5" aria-hidden="true" />
        </IconButton>

        {isMobile && <Logo subtitle={false} />}

        <SearchField className="hidden w-full max-w-[420px] md:flex" />

        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <IconButton
            label="검색"
            aria-expanded={mobileSearchOpen}
            onClick={() => setMobileSearchOpen((open) => !open)}
            className="md:hidden"
          >
            <Search className="size-5" aria-hidden="true" />
          </IconButton>

          <span className="rounded-full border border-secondary bg-secondary-soft px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-ink-muted sm:px-2.5 sm:py-1 sm:text-[11px]">
            <span className="hidden sm:inline">Concept </span>Prototype
          </span>

          <IconButton label={`알림 ${notificationCount}건`}>
            <Bell className="size-5" aria-hidden="true" />
            <span className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-urgent px-1 text-[10px] leading-4 font-bold text-on-primary tabular">
              {notificationCount}
            </span>
          </IconButton>

          <button
            type="button"
            aria-label="프로필"
            className="flex items-center gap-2 rounded-control p-1 transition-colors hover:bg-surface-muted md:pr-2"
          >
            <span className="grid size-8 place-items-center rounded-full bg-secondary text-[11px] font-bold text-ink">
              CEO
            </span>
            <span className="hidden flex-col items-start leading-tight lg:flex">
              <span className="text-sm font-semibold text-ink">대표님</span>
              <span className="text-[11px] text-ink-subtle">㈜비앤테크</span>
            </span>
            <ChevronDown className="hidden size-4 text-ink-subtle lg:block" aria-hidden="true" />
          </button>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="border-t border-border px-4 py-3 md:hidden">
          <SearchField autoFocus />
        </div>
      )}
    </header>
  )
}
