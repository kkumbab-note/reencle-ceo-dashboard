import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { ExternalLink, Info } from 'lucide-react'
import type { PublicSource, SourceMeta } from '../../data/types'
import { cx } from '../../lib/cx'

/** 가상 데이터 표시용 작은 회색 배지 */
export function MockBadge({ className }: { className?: string }) {
  return (
    <span
      title="가상 데이터"
      className={cx(
        'inline-flex shrink-0 items-center rounded-full border border-border bg-surface-muted px-1.5 py-px text-[10px] leading-4 font-semibold whitespace-nowrap text-ink-subtle',
        className,
      )}
    >
      가상
    </span>
  )
}

const TOOLTIP_WIDTH = 240
const GAP = 6

/**
 * 공개값 출처 — 마우스오버·포커스·탭으로 열려요.
 * 스크롤 영역에 잘리지 않도록 body 에 고정 위치로 띄워요.
 */
export function SourceInfo({ meta, className }: { meta: PublicSource; className?: string }) {
  const [style, setStyle] = useState<CSSProperties | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef(0)
  const id = useId()
  const open = style !== null

  const show = () => {
    window.clearTimeout(closeTimer.current)
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return
    const left = Math.min(Math.max(8, rect.right - TOOLTIP_WIDTH), window.innerWidth - TOOLTIP_WIDTH - 8)
    const placeAbove = rect.bottom + 140 > window.innerHeight
    setStyle(
      placeAbove
        ? { left, bottom: window.innerHeight - rect.top + GAP, width: TOOLTIP_WIDTH }
        : { left, top: rect.bottom + GAP, width: TOOLTIP_WIDTH },
    )
  }
  const hideSoon = () => {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setStyle(null), 120)
  }
  const keepOpen = () => window.clearTimeout(closeTimer.current)

  useEffect(() => {
    if (!open) return
    const close = () => setStyle(null)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (!buttonRef.current?.contains(target) && !tooltipRef.current?.contains(target)) close()
    }
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`출처: ${meta.sourceLabel}`}
        aria-describedby={open ? id : undefined}
        onMouseEnter={show}
        onMouseLeave={hideSoon}
        onFocus={show}
        onBlur={hideSoon}
        onClick={show}
        className={cx(
          // 아이콘은 14px, 누르는 영역은 28px (주변 배치는 20px 그대로)
          '-m-1 grid size-7 shrink-0 place-items-center rounded-full text-ink-subtle transition-colors hover:text-primary focus-visible:text-primary',
          open && 'text-primary',
          className,
        )}
      >
        <Info className="size-3.5" aria-hidden="true" />
      </button>
      {open &&
        createPortal(
          <div
            ref={tooltipRef}
            id={id}
            role="tooltip"
            style={style}
            onMouseEnter={keepOpen}
            onMouseLeave={hideSoon}
            onFocus={keepOpen}
            onBlur={hideSoon}
            className="fixed z-[60] rounded-control border border-border bg-surface p-3 text-xs leading-relaxed text-ink-muted shadow-overlay"
          >
            <p className="mb-1 font-semibold text-ink">공개자료 · {meta.asOf} 기준</p>
            <p>{meta.sourceLabel}</p>
            {meta.note && <p className="mt-1 text-ink-subtle">{meta.note}</p>}
            {meta.sourceUrl ? (
              <a
                href={meta.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                원문 보기 <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            ) : (
              <p className="mt-1.5 text-ink-subtle">원문 링크 확인 필요</p>
            )}
          </div>,
          document.body,
        )}
    </>
  )
}

/** 출처 정보에 맞춰 가상 배지 또는 출처 아이콘을 보여줘요 */
export function SourceMark({ meta }: { meta: SourceMeta }) {
  return meta.source === 'mock' ? <MockBadge /> : <SourceInfo meta={meta} />
}
