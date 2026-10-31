import type { ReactNode } from 'react'

export function Card({
  children,
  className = '',
  title,
  action,
}: {
  children: ReactNode
  className?: string
  title?: string
  action?: ReactNode
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-blue-50 px-4 py-3.5">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {action}
        </div>
      ) : null}
      <div className="p-4">{children}</div>
    </div>
  )
}

export function StatCard({
  label,
  value,
  icon,
  accent = 'forest',
}: {
  label: string
  value: string
  icon: ReactNode
  accent?: 'forest' | 'gold' | 'red' | 'amber'
}) {
  const accents = {
    forest: 'from-forest-700 to-forest-900',
    gold: 'from-gold-500 to-gold-600',
    red: 'from-red-500 to-red-700',
    amber: 'from-amber-500 to-amber-600',
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-forest-600">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-forest-900">{value}</p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br ${accents[accent]} text-white shadow-sm`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}
