import { useEffect } from 'react'
import { NavLink } from 'react-router'
import { Settings, X } from 'lucide-react'
import { cx } from '../../lib/cx'
import { Logo } from './Logo'
import { NAV_GROUPS } from './navItems'

const itemBase = 'flex w-full items-center gap-3 rounded-control text-[15px] font-medium transition-colors'

// 아이콘만 보일 땐 조금 촘촘하게 — 메뉴 15개가 768px 높이에 들어가도록
function itemLayout(collapsed: boolean) {
  return collapsed ? 'h-9 justify-center' : 'h-10 px-3'
}

function SidebarNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  return (
    <nav aria-label="주 메뉴" className="flex flex-1 flex-col overflow-y-auto px-3 py-3">
      {NAV_GROUPS.map((group, groupIndex) => (
        <div key={group.label} role="group" aria-label={group.label} className="flex flex-col gap-0.5">
          {/* 펼친 상태는 그룹 제목, 아이콘만 보일 땐 구분선 */}
          {collapsed ? (
            groupIndex > 0 && <hr className="mx-2 my-1.5 border-border" />
          ) : (
            <p className={cx('px-3 pb-1.5 text-[11px] font-semibold tracking-wide text-ink-subtle', groupIndex > 0 ? 'pt-4' : 'pt-1')}>
              {group.label}
            </p>
          )}
          {group.items.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                cx(
                  itemBase,
                  itemLayout(collapsed),
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
        </div>
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
        className={cx(itemBase, itemLayout(collapsed), 'cursor-default text-ink-muted hover:bg-surface-muted')}
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
