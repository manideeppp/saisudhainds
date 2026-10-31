import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { HeroStat } from '../../lib/home/buildHomeDashboard'

export function HeroStatTile({ stat }: { stat: HeroStat }) {
  const TrendIcon =
    stat.trend === 'up' ? ArrowUpRight : stat.trend === 'down' ? ArrowDownRight : Minus
  const trendColor =
    stat.warn
      ? 'text-amber-700 bg-amber-50'
      : stat.trend === 'up'
        ? 'text-blue-800 bg-blue-50'
        : stat.trend === 'down'
          ? 'text-neutral-600 bg-neutral-100'
          : 'text-neutral-600 bg-neutral-100'

  return (
    <article className="flex min-h-[8.25rem] flex-col rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{stat.label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{stat.value}</p>
      {stat.sub ? <p className="mt-0.5 text-xs text-slate-500">{stat.sub}</p> : null}
      <div className={`mt-3 inline-flex items-center gap-1 self-start rounded-lg px-2 py-1 text-[11px] font-medium ${trendColor}`}>
        <TrendIcon className="h-3.5 w-3.5" aria-hidden />
        <span>{stat.trendLabel}</span>
      </div>
    </article>
  )
}
