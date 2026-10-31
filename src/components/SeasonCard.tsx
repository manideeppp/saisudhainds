import { CalendarRange, Lock, Pencil, Trash2 } from 'lucide-react'
import { Button } from './ui/Button'
import { formatDate } from '../lib/format'
import type { Season } from '../types/season'

export function SeasonCard({
  season,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: {
  season: Season
  selected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const closed = season.status === 'closed'
  return (
    <div
      className={`flex items-center gap-2 rounded-2xl border p-3 transition shadow-sm ${
        selected
          ? 'border-gold-400 bg-white ring-2 ring-gold-400/50'
          : 'border-forest-100 bg-white hover:border-forest-200 hover:shadow-md'
      }`}
    >
      <button type="button" onClick={onSelect} aria-pressed={selected}
        className="min-w-0 flex-1 rounded-xl p-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-forest-900">{season.name}</p>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-gold-700">{season.season_type}</p>
          </div>
        {closed ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-forest-100 px-2 py-0.5 text-[10px] font-semibold text-forest-700">
            <Lock className="h-3 w-3" />
            Closed
          </span>
        ) : (
          <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
            Active
          </span>
        )}
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-forest-600">
          <CalendarRange className="h-3.5 w-3.5" />
          {formatDate(season.start_date)} — {formatDate(season.end_date)}
        </p>
      </button>
      <div className="flex shrink-0 items-center gap-1 border-l border-forest-100 pl-2">
        <Button type="button" variant="ghost" className="!p-2" onClick={onEdit} aria-label={`Edit ${season.name}`} title="Edit season">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" className="!p-2 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={onDelete} aria-label={`Delete ${season.name}`} title="Delete season">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
