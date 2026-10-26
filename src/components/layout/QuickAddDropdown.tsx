import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Plus } from 'lucide-react'
import { TOP_BAR_QUICK_ADD } from '../../lib/navigation'
import { useSeason } from '../../contexts/SeasonContext'

export function QuickAddDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { isSeasonClosed } = useSeason()

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  if (isSeasonClosed) return null

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-xl bg-forest-700 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-forest-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Quick add
        <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-[12rem] overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
        >
          {TOP_BAR_QUICK_ADD.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                role="menuitem"
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
              >
                <Icon className="h-4 w-4 text-forest-700" aria-hidden />
                {item.label}
              </Link>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
