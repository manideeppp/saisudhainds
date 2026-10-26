import { CalendarRange, Lock } from 'lucide-react'
import { formatDate } from '../lib/format'
import type { Season } from '../types/season'

export function SeasonCard({
  season,
  selected,
  onSelect,
}: {
  season: Season
  selected: boolean
  onSelect: () => void
}) {
  const closed = season.status === 'closed'
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border p-4 text-left transition shadow-sm ${
        selected
          ? 'border-gold-400 bg-white ring-2 ring-gold-400/50'
          : 'border-forest-100 bg-white hover:border-forest-200 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-forest-900">{season.name}</p>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-gold-700">
            {season.season_type}
          </p>
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
  )
}
