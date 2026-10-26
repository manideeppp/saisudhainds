import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { APP_NAME } from '../../lib/constants'
import { useSeason } from '../../contexts/SeasonContext'
import { Select } from '../ui/Select'
import { QuickAddDropdown } from './QuickAddDropdown'
import { UserMenu } from './UserMenu'

export function AppTopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { seasons, activeSeason, setActiveSeasonId, loading } = useSeason()

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/90 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[90rem] items-center gap-2 px-4 lg:px-6">
        <button
          type="button"
          className="rounded-lg border border-neutral-200 p-2 text-neutral-800 lg:hidden"
          onClick={onOpenMenu}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/home" className="hidden min-w-0 shrink sm:block">
          <span className="text-sm font-bold tracking-tight text-forest-900">{APP_NAME}</span>
        </Link>

        <div className="mx-1 hidden h-6 w-px bg-neutral-200 sm:block" aria-hidden />

        <div className="min-w-0 flex-1 max-w-xs">
          {loading ? (
            <div className="h-9 animate-pulse rounded-lg bg-neutral-100" aria-hidden />
          ) : seasons.length === 0 ? (
            <Link to="/season" className="text-xs font-medium text-amber-800">Set up season</Link>
          ) : (
            <Select
              label=""
              aria-label="Working season"
              value={activeSeason?.id ?? ''}
              onChange={(e) => setActiveSeasonId(e.target.value)}
              className="!py-1.5 !text-sm border-neutral-200"
            >
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.season_type}
                  {s.status === 'closed' ? ' (closed)' : ''}
                </option>
              ))}
            </Select>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <QuickAddDropdown />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
