import { useHomeDashboard } from '../hooks/useHomeDashboard'
import { HeroStatTile } from '../components/home/HeroStatTile'
import { HomeDashboardSkeleton } from '../components/home/HomeDashboardSkeleton'
import { ProfitTrendChart } from '../components/home/ProfitTrendChart'
import { StockByTypeChart } from '../components/home/StockByTypeChart'
import { PageError } from '../components/ui/PageState'
import { Button } from '../components/ui/Button'
import { ManageSeasonModal } from '../components/ManageSeasonModal'
import { formatDate } from '../lib/format'
import { CalendarDays, Pencil } from 'lucide-react'
import { useState } from 'react'

export function HomePage() {
  const { seasonLoading, loading, error, reload, activeSeason, dashboard } = useHomeDashboard()
  const [editSeasonOpen, setEditSeasonOpen] = useState(false)

  if (seasonLoading || loading) {
    return (
      <div className="space-y-6 text-slate-900">
        <header className="rounded-2xl border border-blue-100 bg-white px-5 py-5 shadow-sm">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Mill overview</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Loading your season snapshot…</p>
        </header>
        <HomeDashboardSkeleton />
      </div>
    )
  }

  if (error) {
    return <PageError message={error} onRetry={reload} homeTo="/home" />
  }

  if (!activeSeason || !dashboard) {
    return (
      <PageError
        title="No season selected"
        message="Choose a season to see mill performance."
        homeTo="/season"
      />
    )
  }

  return (
    <div className="space-y-6 rounded-3xl bg-gradient-to-br from-blue-50/70 via-slate-50/40 to-white p-3 text-slate-900 sm:p-5">
      <header className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-blue-50 to-transparent sm:block" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Season analytics</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Dashboard</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
            <span className="font-semibold text-slate-800">{activeSeason.name}</span>
            <span className="text-slate-300">·</span><span>{activeSeason.season_type}</span>
            <span className="text-slate-300">·</span>
            <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
            <span>{formatDate(activeSeason.start_date)} – {formatDate(activeSeason.end_date)}</span>
            {activeSeason.status === 'closed' ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Closed season</span> : null}
          </p>
          </div>
          <Button type="button" variant="secondary" className="!border-blue-200 !text-blue-800 hover:!bg-blue-50" onClick={() => setEditSeasonOpen(true)}>
            <Pencil className="h-4 w-4" /> Edit season
          </Button>
        </div>
      </header>

      <section aria-label="Season performance metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {dashboard.hero.map((stat) => (
          <HeroStatTile key={stat.id} stat={stat} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2" aria-label="Season analytics charts">
        <ProfitTrendChart data={dashboard.monthlyProfit} />
        <StockByTypeChart data={dashboard.stockSlices} />
      </section>
      <ManageSeasonModal
        season={activeSeason}
        action={editSeasonOpen ? 'edit' : null}
        onClose={() => setEditSeasonOpen(false)}
        onDeleted={() => undefined}
      />
    </div>
  )
}
