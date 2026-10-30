import { Link } from 'react-router'
import { FileDown, Handshake, MessageSquareText, Package, Presentation, Wrench, type LucideIcon } from 'lucide-react'
import { Card, CardHeader } from './Card'

type Shortcut = { label: string; icon: LucideIcon } & ({ to: string } | { action: 'print' } | { disabled: true })

// 상세 화면이 있는 항목은 이동, 보고서는 브라우저 인쇄(PDF 저장), 이사회 자료는 준비 중
const SHORTCUTS: Shortcut[] = [
  { label: '신제품 현황', icon: Package, to: '/sales' },
  { label: '해외 파트너', icon: Handshake, to: '/sales' },
  { label: '보고서 다운로드', icon: FileDown, action: 'print' },
  { label: '리뷰 모니터링', icon: MessageSquareText, to: '/customer' },
  { label: 'AS 현황', icon: Wrench, to: '/quality' },
  { label: '이사회 자료', icon: Presentation, disabled: true },
]

const tileClass =
  'flex flex-col items-center justify-center gap-2 rounded-control border border-border px-2 py-3.5 text-center text-xs font-medium text-ink-muted transition-colors'

function TileContent({ shortcut, note }: { shortcut: Shortcut; note?: string }) {
  const Icon = shortcut.icon
  return (
    <>
      <span className="grid size-9 place-items-center rounded-full bg-primary-soft text-primary">
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <span>
        {shortcut.label}
        {note && <span className="block text-[10px] font-normal text-ink-subtle">{note}</span>}
      </span>
    </>
  )
}

export function ShortcutsCard({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader title="바로가기" />
      <div className="grid flex-1 grid-cols-3 gap-2.5">
        {SHORTCUTS.map((s) =>
          'to' in s ? (
            <Link key={s.label} to={s.to} className={`${tileClass} hover:border-primary/40 hover:bg-primary-soft/40 hover:text-ink`}>
              <TileContent shortcut={s} />
            </Link>
          ) : 'action' in s ? (
            <button
              key={s.label}
              type="button"
              onClick={() => window.print()}
              className={`${tileClass} hover:border-primary/40 hover:bg-primary-soft/40 hover:text-ink`}
            >
              <TileContent shortcut={s} note="인쇄 → PDF" />
            </button>
          ) : (
            <button key={s.label} type="button" aria-disabled="true" title="준비 중" className={`${tileClass} cursor-default opacity-60`}>
              <TileContent shortcut={s} note="준비 중" />
            </button>
          ),
        )}
      </div>
    </Card>
  )
}
