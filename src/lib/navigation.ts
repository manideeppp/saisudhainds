import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Building2,
  CircleDot,
  HandCoins,
  Home,
  IndianRupee,
  LayoutDashboard,
  Package,
  Receipt,
  Tags,
  Tractor,
  Truck,
  Wheat,
} from 'lucide-react'
import { BYPRODUCT_NAV } from './constants'

export type AppNavLink = {
  to: string
  label: string
  icon: LucideIcon
  description?: string
  end?: boolean
}

export type AppNavModule = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  accent: string
  sidebarTitle: string
  links: AppNavLink[]
}

const byproductLinks: AppNavLink[] = BYPRODUCT_NAV.map((b) => ({
  to: `/byproducts/${b.slug}`,
  label: b.label,
  icon: CircleDot,
}))

export const APP_NAV_MODULES: AppNavModule[] = [
  {
    id: 'overview',
    title: 'Overview & reports',
    sidebarTitle: 'Overview',
    description: 'Season KPIs, profit trends, and exports',
    icon: LayoutDashboard,
    accent: 'from-forest-600 to-forest-800',
    links: [
      { to: '/home', label: 'Home dashboard', icon: LayoutDashboard, description: 'At-a-glance metrics' },
      { to: '/reports', label: 'Mill reports', icon: BarChart3, description: 'Profit PDF & Excel' },
    ],
  },
  {
    id: 'finance',
    title: 'Finance',
    sidebarTitle: 'Finance',
    description: 'Expenses, categories & money to collect',
    icon: Receipt,
    accent: 'from-gold-500 to-gold-700',
    links: [
      { to: '/expenses', label: 'Expenses', icon: Receipt },
      { to: '/categories', label: 'Categories', icon: Tags },
      { to: '/receivables', label: 'Receivables', icon: HandCoins },
    ],
  },
  {
    id: 'paddy',
    title: 'Paddy & gunny',
    sidebarTitle: 'Paddy & gunny',
    description: 'Farmer & IKP intake, gunny dispatch',
    icon: Wheat,
    accent: 'from-emerald-600 to-forest-700',
    links: [
      { to: '/paddy/farmer', label: 'Farmer intake', icon: Tractor },
      { to: '/paddy/ikp', label: 'IKP / PACS', icon: Building2 },
      { to: '/paddy/gunny', label: 'Gunny dispatch', icon: Package },
    ],
  },
  {
    id: 'rice',
    title: 'Rice',
    sidebarTitle: 'Rice',
    description: 'Outgoing rice deliveries & payments',
    icon: Truck,
    accent: 'from-forest-500 to-emerald-800',
    links: [{ to: '/rice/delivery', label: 'Rice delivery', icon: Truck }],
  },
  {
    id: 'byproducts',
    title: 'By-products',
    sidebarTitle: 'By-products',
    description: 'Bran, husk, param & more',
    icon: CircleDot,
    accent: 'from-amber-500 to-amber-700',
    links: byproductLinks,
  },
]

export const NAV_HOME: AppNavLink = { to: '/home', label: 'Home', icon: Home, end: true }

export const HUB_SECTIONS = APP_NAV_MODULES

/** Top bar quick-add actions */
export const TOP_BAR_QUICK_ADD: AppNavLink[] = [
  { to: '/paddy/farmer', label: 'Farmer intake', icon: Tractor },
  { to: '/expenses', label: 'Expense', icon: Receipt },
  { to: '/rice/delivery', label: 'Rice delivery', icon: Truck },
  { to: '/receivables', label: 'Payment / receivable', icon: IndianRupee },
]

export const QUICK_ADD_LINKS: AppNavLink[] = [
  APP_NAV_MODULES.find((m) => m.id === 'paddy')!.links[0],
  APP_NAV_MODULES.find((m) => m.id === 'paddy')!.links[1],
  APP_NAV_MODULES.find((m) => m.id === 'rice')!.links[0],
  byproductLinks[0],
  APP_NAV_MODULES.find((m) => m.id === 'finance')!.links[0],
  APP_NAV_MODULES.find((m) => m.id === 'finance')!.links[2],
]

const ROUTE_LABELS: Record<string, string> = {
  '/home': 'Home',
  '/dashboard': 'Home',
  '/reports': 'Mill reports',
  '/success': 'Success',
  '/season': 'Season',
}

for (const mod of APP_NAV_MODULES) {
  for (const link of mod.links) {
    ROUTE_LABELS[link.to] = link.label
  }
}

export function pageTitleForPath(pathname: string): string {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname]
  const byproduct = pathname.match(/^\/byproducts\/([^/]+)/)
  if (byproduct) {
    const found = byproductLinks.find((l) => l.to === pathname)
    return found?.label ?? 'By-product'
  }
  return 'Sai Sudha Rice Mill'
}

export function breadcrumbForPath(pathname: string): { parent?: AppNavLink; current: string } {
  if (pathname === '/home') return { current: 'Home' }
  for (const mod of APP_NAV_MODULES) {
    const link = mod.links.find((l) => l.to === pathname)
    if (link) {
      return { parent: NAV_HOME, current: link.label }
    }
  }
  return { current: pageTitleForPath(pathname) }
}
