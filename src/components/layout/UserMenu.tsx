import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarRange, ChevronDown, LogOut, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useSeason } from '../../contexts/SeasonContext'
import { CloseSeasonModal } from '../CloseSeasonModal'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

export function UserMenu() {
  const { signOut } = useAuth()
  const { activeSeason } = useSeason()
  const [open, setOpen] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const [closeModal, setCloseModal] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-2.5 py-2 text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-50"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="User menu"
        >
          <User className="h-4 w-4 text-forest-700" aria-hidden />
          <ChevronDown className={`h-4 w-4 text-neutral-400 ${open ? 'rotate-180' : ''}`} aria-hidden />
        </button>
        {open ? (
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
          >
            <Link
              role="menuitem"
              to="/season"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50"
            >
              <CalendarRange className="h-4 w-4" />
              Change season
            </Link>
            {activeSeason?.status === 'active' ? (
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-neutral-800 hover:bg-neutral-50"
                onClick={() => {
                  setOpen(false)
                  setConfirmClose(true)
                }}
              >
                Close season…
              </button>
            ) : null}
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 border-t border-neutral-100 px-4 py-2.5 text-left text-sm text-neutral-800 hover:bg-neutral-50"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        ) : null}
      </div>

      <Modal open={confirmClose} title="Close current season?" onClose={() => setConfirmClose(false)}>
        <p className="text-sm text-neutral-600">
          Closing <strong>{activeSeason?.name}</strong> locks entries for this season. You will set up
          the next season and carry stock and receivables forward.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setConfirmClose(false)}>Cancel</Button>
          <Button
            type="button"
            onClick={() => {
              setConfirmClose(false)
              setCloseModal(true)
            }}
          >
            Continue
          </Button>
        </div>
      </Modal>
      <CloseSeasonModal open={closeModal} onClose={() => setCloseModal(false)} />
    </>
  )
}
