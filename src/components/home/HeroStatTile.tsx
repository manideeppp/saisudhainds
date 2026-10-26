import { Link } from 'react-router-dom'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Minus } from 'lucide-react'
import type { HeroStat } from '../../lib/home/buildHomeDashboard'

export function HeroStatTile({ stat }: { stat: HeroStat }) {
  const TrendIcon =
    stat.trend === 'up' ? ArrowUpRight : stat.trend === 'down' ? ArrowDownRight : Minus
  const trendColor =
    stat.warn
      ? 'text-amber-700 bg-amber-50'
      : stat.trend === 'up'
        ? 'text-forest-700 bg-forest-50'
        : stat.trend === 'down'
          ? 'text-neutral-600 bg-neutral-100'
          : 'text-neutral-600 bg-neutral-100'

  return (
    <Link
      to={stat.to}
      className="group flex min-h-[7.5rem] flex-col rounded-xl border border-neutral-200/90 bg-white p-4 shadow-[var(--shadow-card)] transition hover:border-forest-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{stat.label}</p>
        <ArrowRight className="h-4 w-4 shrink-0 text-neutral-300 transition group-hover:text-forest-600" aria-hidden />
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-900">{stat.value}</p>
      {stat.sub ? <p className="mt-0.5 text-xs text-neutral-500">{stat.sub}</p> : null}
      <div className={`mt-3 inline-flex items-center gap-1 self-start rounded-lg px-2 py-1 text-[11px] font-medium ${trendColor}`}>
        <TrendIcon className="h-3.5 w-3.5" aria-hidden />
        <span>{stat.trendLabel}</span>
      </div>
    </Link>
  )
}
