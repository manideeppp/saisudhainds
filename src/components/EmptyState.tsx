import type { ReactNode } from 'react'

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-forest-200 bg-white px-6 py-14 text-center shadow-sm">
      <p className="text-lg font-semibold text-forest-900">{title}</p>
      {description ? <p className="mt-2 max-w-md text-sm text-forest-600">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
