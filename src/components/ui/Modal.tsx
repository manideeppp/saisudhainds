import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './Button'

export function Modal({
  open,
  title,
  onClose,
  children,
  wide,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-forest-900/50 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative z-10 w-full max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-forest-100 bg-ivory-50 shadow-2xl ${
          wide ? 'max-w-3xl' : 'max-w-lg'
        }`}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-forest-100 bg-ivory-50 px-5 py-4">
          <h2 id="modal-title" className="text-lg font-semibold text-forest-900">
            {title}
          </h2>
          <Button variant="ghost" onClick={onClose} className="!p-2" aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
