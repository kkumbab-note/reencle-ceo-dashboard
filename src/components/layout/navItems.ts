import { Earth, HeartHandshake, LayoutDashboard, ShieldCheck, Sprout, type LucideIcon } from 'lucide-react'

export interface NavItem {
  path: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/', label: '대시보드', icon: LayoutDashboard },
  { path: '/sales', label: '글로벌 매출', icon: Earth },
  { path: '/customer', label: '고객·NPS', icon: HeartHandshake },
  { path: '/quality', label: '품질·AS', icon: ShieldCheck },
  { path: '/esg', label: 'ESG 임팩트', icon: Sprout },
]
