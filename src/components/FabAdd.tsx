import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import { useSeason } from '../contexts/SeasonContext'
import { QUICK_ADD_LINKS } from '../lib/navigation'

export function FabAdd() {
  const [open, setOpen] = useState(false)
  const { isSeasonClosed, loading } = useSeason()

  if (loading || isSeasonClosed) return null

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 lg:hidden">
      {open ? (
        <div className="mb-1 flex max-h-[min(60vh,420px)] flex-col gap-0.5 overflow-y-auto rounded-2xl border border-forest-100 bg-white p-2 shadow-xl ring-1 ring-forest-900/5">
          {QUICK_ADD_LINKS.map((l) => {
            const Icon = l.icon
            return (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-forest-800 hover:bg-ivory-100 whitespace-nowrap"
              >
                <Icon className="h-4 w-4 text-forest-500" />
                {l.label}
              </Link>
            )
          })}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-700 text-white shadow-lg shadow-forest-900/25 ring-4 ring-forest-700/15 hover:bg-forest-800 active:scale-95 transition"
        aria-label={open ? 'Close quick add menu' : 'Quick add'}
      >
        {open ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>
    </div>
  )
}
