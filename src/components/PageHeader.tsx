import type { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-forest-900 sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1.5 text-sm leading-relaxed text-forest-600">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}
