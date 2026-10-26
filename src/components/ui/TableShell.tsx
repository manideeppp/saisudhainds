import type { ReactNode } from 'react'

/** Responsive wrapper for data tables — use on every list page. */
export function TableShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-forest-100/80 ${className}`}>
      {children}
    </div>
  )
}
