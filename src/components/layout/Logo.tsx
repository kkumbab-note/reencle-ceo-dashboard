import { Leaf } from 'lucide-react'

interface LogoProps {
  /** 아이콘만 표시 (접힌 사이드바) */
  compact?: boolean
  /** 워드마크 아래 "CEO Dashboard" 표시 */
  subtitle?: boolean
}

/** 공식 로고 파일 대신 쓰는 텍스트 워드마크 + 잎 아이콘 placeholder */
export function Logo({ compact = false, subtitle = true }: LogoProps) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-control bg-primary text-on-primary">
        <Leaf className="size-5" strokeWidth={2.2} aria-hidden="true" />
      </span>
      {compact ? (
        <span className="sr-only">Reencle</span>
      ) : (
        <span className="flex flex-col leading-none">
          <span className="text-[17px] font-bold tracking-tight text-ink">Reencle</span>
          {subtitle && <span className="mt-1 text-[11px] font-medium text-ink-subtle">CEO Dashboard</span>}
        </span>
      )}
    </span>
  )
}
