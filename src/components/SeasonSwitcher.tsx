import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarRange, Lock, Plus } from 'lucide-react'
import { useSeason } from '../contexts/SeasonContext'
import { CloseSeasonModal } from './CloseSeasonModal'
import { AddSeasonModal } from './AddSeasonModal'
import { Select } from './ui/Select'

export function SeasonSwitcher() {
  const { seasons, activeSeason, setActiveSeasonId, loading, isSeasonClosed } = useSeason()
  const [closeOpen, setCloseOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  if (loading) {
    return (
      <div className="h-9 w-40 animate-pulse rounded-xl bg-forest-100/80" aria-hidden />
    )
  }

  if (seasons.length === 0) {
    return (
      <span className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
        Run seasons SQL in Supabase
      </span>
    )
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 ml-auto">
        <div className="min-w-[140px] max-w-[200px] flex-1 sm:flex-none">
          <Select
            label=""
            aria-label="Season"
            value={activeSeason?.id ?? ''}
            onChange={(e) => setActiveSeasonId(e.target.value)}
            className="!py-2 text-sm shadow-sm"
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.season_type}){s.status === 'closed' ? ' · Closed' : ''}
              </option>
            ))}
          </Select>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-1 rounded-xl border border-forest-200/80 bg-white px-2.5 py-2 text-xs font-semibold text-forest-800 shadow-sm hover:bg-ivory-100"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New</span>
        </button>
        <Link
          to="/season"
          className="inline-flex items-center gap-1 rounded-xl border border-forest-200/80 bg-white px-2.5 py-2 text-xs font-semibold text-forest-800 shadow-sm hover:bg-ivory-100"
        >
          <CalendarRange className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Change</span>
        </Link>
        {activeSeason?.status === 'active' ? (
          <button
            type="button"
            onClick={() => setCloseOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-forest-200/80 bg-white px-2.5 py-2 text-xs font-semibold text-forest-800 shadow-sm hover:bg-ivory-100"
          >
            <Lock className="h-3.5 w-3.5" />
            Close season
          </button>
        ) : isSeasonClosed ? (
          <span className="inline-flex items-center gap-1 text-xs text-forest-600 px-2 py-2">
            <CalendarRange className="h-3.5 w-3.5" />
            View only
          </span>
        ) : null}
      </div>
      <CloseSeasonModal open={closeOpen} onClose={() => setCloseOpen(false)} />
      <AddSeasonModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  )
}
