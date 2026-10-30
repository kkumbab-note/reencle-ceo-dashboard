import {
  BookOpen,
  CalendarCheck,
  ChartColumn,
  ChartLine,
  Clock,
  Earth,
  HeartHandshake,
  LayoutDashboard,
  Network,
  Receipt,
  ShieldCheck,
  Sprout,
  SquarePen,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  path: string
  label: string
  icon: LucideIcon
  /** false 면 아직 화면이 없어 '준비 중' 화면으로 가요 */
  ready: boolean
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

/** '경영 관리' 메뉴의 주소 앞부분 */
export const MANAGE_PATH = '/manage'

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'KPI 대시보드',
    items: [
      { path: '/', label: '대시보드', icon: LayoutDashboard, ready: true },
      { path: '/sales', label: '글로벌 매출', icon: Earth, ready: true },
      { path: '/customer', label: '고객·NPS', icon: HeartHandshake, ready: true },
      { path: '/quality', label: '품질·AS', icon: ShieldCheck, ready: true },
      { path: '/esg', label: 'ESG 임팩트', icon: Sprout, ready: true },
    ],
  },
  {
    label: '경영 관리',
    items: [
      { path: `${MANAGE_PATH}/organization`, label: '조직관리', icon: Network, ready: false },
      { path: `${MANAGE_PATH}/members`, label: '구성원관리', icon: Users, ready: false },
      { path: `${MANAGE_PATH}/attendance`, label: '근태관리', icon: Clock, ready: false },
      { path: `${MANAGE_PATH}/payroll`, label: '급여관리', icon: Receipt, ready: false },
      { path: `${MANAGE_PATH}/leave`, label: '연차관리', icon: CalendarCheck, ready: false },
      { path: `${MANAGE_PATH}/evaluation`, label: '평가관리', icon: ChartLine, ready: false },
      { path: `${MANAGE_PATH}/recruiting`, label: '채용관리', icon: UserRound, ready: false },
      { path: `${MANAGE_PATH}/training`, label: '교육관리', icon: BookOpen, ready: false },
      { path: `${MANAGE_PATH}/approval`, label: '전자결재', icon: SquarePen, ready: false },
      { path: `${MANAGE_PATH}/reports`, label: '보고서', icon: ChartColumn, ready: false },
    ],
  },
]

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items)
