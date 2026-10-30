import { useEffect } from 'react'
import { NavLink } from 'react-router'
import { Settings, X } from 'lucide-react'
import { cx } from '../../lib/cx'
import { Logo } from './Logo'
import { NAV_ITEMS } from './navItems'

const itemBase =
  'flex h-11 w-full items-center gap-3 rounded-control px-3 text-[15px] font-medium transition-colors'

function SidebarNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  return (
    <nav aria-label="주 메뉴" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {!collapsed && (
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-wide text-ink-subtle">메뉴</p>
      )}
      {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          onClick={onNavigate}
          title={collapsed ? label : undefined}
          className={({ isActive }) =>
            cx(
              itemBase,
              collapsed && 'justify-center px-0',
              isActive
                ? 'bg-primary-soft font-semibold text-primary'
                : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
            )
          }
        >
          <Icon className="size-5 shrink-0" aria-hidden="true" />
          {collapsed ? <span className="sr-only">{label}</span> : <span className="truncate">{label}</span>}
        </NavLink>
      ))}
    </nav>
  )
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="border-t border-border px-3 py-3">
      {/* 설정은 모양만 있는 메뉴예요 */}
      <button
        type="button"
        aria-disabled="true"
        title="설정 (준비 중)"
        className={cx(itemBase, 'cursor-default text-ink-muted hover:bg-surface-muted', collapsed && 'justify-center px-0')}
      >
        <Settings className="size-5 shrink-0" aria-hidden="true" />
        {collapsed ? <span className="sr-only">설정</span> : <span>설정</span>}
      </button>
      {!collapsed && <p className="px-3 pt-2 text-[11px] text-ink-subtle">운영사 ㈜비앤테크</p>}
    </div>
  )
}

/** 태블릿·데스크톱 고정 사이드바 */
export function Sidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <aside
      className={cx(
        'fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-surface transition-[width] duration-200',
        collapsed ? 'w-[76px]' : 'w-64',
      )}
    >
      <div className={cx('flex h-16 shrink-0 items-center border-b border-border', collapsed ? 'justify-center' : 'px-6')}>
        <Logo compact={collapsed} />
      </div>
      <SidebarNav collapsed={collapsed} />
      <SidebarFooter collapsed={collapsed} />
    </aside>
  )
}

/** 모바일 햄버거 드로어 */
export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  return (
    <div className={cx('fixed inset-0 z-50', !open && 'pointer-events-none')} inert={!open}>
      <div
        className={cx('absolute inset-0 bg-ink/40 transition-opacity duration-200', open ? 'opacity-100' : 'opacity-0')}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="메뉴"
        className={cx(
          'absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-surface shadow-overlay transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border pr-3 pl-5">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="메뉴 닫기"
            className="grid size-10 place-items-center rounded-control text-ink-muted hover:bg-surface-muted"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <SidebarNav collapsed={false} onNavigate={onClose} />
        <SidebarFooter collapsed={false} />
      </aside>
    </div>
  )
}
