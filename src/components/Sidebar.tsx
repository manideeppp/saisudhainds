import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  Tags,
  HandCoins,
  LogOut,
  Wheat,
  Tractor,
  Building2,
  Package,
  Truck,
  CircleDot,
  ChevronDown,
  BarChart3,
} from 'lucide-react'
import { APP_NAME, APP_SUBTITLE, BYPRODUCT_NAV } from '../lib/constants'
import { useAuth } from '../contexts/AuthContext'

type NavItem = {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
}

const financeLinks: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/reports', label: 'Mill reports', icon: BarChart3 },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/receivables', label: 'Receivables', icon: HandCoins },
]

const paddyLinks: NavItem[] = [
  { to: '/paddy/farmer', label: 'Farmer intake', icon: Tractor },
  { to: '/paddy/ikp', label: 'IKP / PACS intake', icon: Building2 },
  { to: '/paddy/gunny', label: 'Gunny to centres', icon: Package },
]

const riceLinks: NavItem[] = [{ to: '/rice/delivery', label: 'Rice delivery', icon: Truck }]

function NavSection({ title, links, onNavigate }: { title: string; links: NavItem[]; onNavigate?: () => void }) {
  return (
    <div className="pt-2">
      <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gold-400/90">
        {title}
      </p>
      <div className="space-y-0.5">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-white/15 text-white shadow-inner ring-1 ring-white/10'
                  : 'text-forest-100 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0 text-gold-300" />
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  )
}

function ByproductAccordion({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()
  const isByproductRoute = location.pathname.startsWith('/byproducts/')
  const [open, setOpen] = useState(isByproductRoute)

  return (
    <div className="pt-2">
      <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gold-400/90">
        By-products
      </p>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          isByproductRoute
            ? 'bg-white/10 text-white'
            : 'text-forest-100 hover:bg-white/10 hover:text-white'
        }`}
      >
        <span className="flex items-center gap-3">
          <CircleDot className="h-5 w-5 shrink-0 text-gold-300" />
          All by-products
        </span>
        <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div className="ml-3 mt-0.5 space-y-0.5 border-l border-white/15 pl-2">
          {BYPRODUCT_NAV.map((b) => (
            <NavLink
              key={b.slug}
              to={`/byproducts/${b.slug}`}
              onClick={onNavigate}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? 'bg-white/15 font-semibold text-white'
                    : 'text-forest-200 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {b.label}
            </NavLink>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { signOut } = useAuth()

  return (
    <div className="flex h-full flex-col bg-linear-to-b from-forest-900 to-forest-800 text-white">
      <div className="border-b border-white/10 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500/20 text-gold-300 ring-1 ring-gold-400/40">
            <Wheat className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold leading-tight">{APP_NAME}</p>
            <p className="text-xs text-forest-200">{APP_SUBTITLE}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <NavSection title="Finance" links={financeLinks} onNavigate={onNavigate} />
        <NavSection title="Paddy & gunny" links={paddyLinks} onNavigate={onNavigate} />
        <NavSection title="Rice" links={riceLinks} onNavigate={onNavigate} />
        <ByproductAccordion onNavigate={onNavigate} />
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-forest-100 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-5 w-5 text-gold-300" />
          Sign out
        </button>
      </div>
    </div>
  )
}
