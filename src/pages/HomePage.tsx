import { Link } from 'react-router-dom'
import { useHomeDashboard } from '../hooks/useHomeDashboard'
import { HeroStatTile } from '../components/home/HeroStatTile'
import { HomeDashboardSkeleton } from '../components/home/HomeDashboardSkeleton'
import { ProfitTrendChart } from '../components/home/ProfitTrendChart'
import { StockByTypeChart } from '../components/home/StockByTypeChart'
import { NeedsAttentionPanel } from '../components/home/NeedsAttentionPanel'
import { RecentActivityTable } from '../components/home/RecentActivityTable'
import { PageError } from '../components/ui/PageState'
import { formatDate } from '../lib/format'
import { Button } from '../components/ui/Button'

export function HomePage() {
  const { seasonLoading, loading, error, reload, activeSeason, dashboard, isEmpty } = useHomeDashboard()

  if (seasonLoading || loading) {
    return (
      <div>
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">Loading your season snapshot…</p>
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
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-600">
            <span className="font-medium text-forest-800">{activeSeason.name}</span>
            {' · '}
            {activeSeason.season_type}
            {' · '}
            {formatDate(activeSeason.start_date)} – {formatDate(activeSeason.end_date)}
            {activeSeason.status === 'closed' ? (
              <span className="ml-2 rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                View only
              </span>
            ) : null}
          </p>
        </div>
        <Link to="/reports">
          <Button type="button" variant="secondary">Full reports</Button>
        </Link>
      </header>

      {isEmpty ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
          <p className="text-lg font-semibold text-neutral-900">Start recording this season</p>
          <p className="mt-2 text-sm text-neutral-600">
            Add farmer intake or an expense — metrics will populate instantly.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link to="/paddy/farmer">
              <Button type="button">Farmer intake</Button>
            </Link>
            <Link to="/expenses">
              <Button type="button" variant="secondary">Add expense</Button>
            </Link>
          </div>
        </div>
      ) : null}

      <section aria-label="Key metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {dashboard.hero.map((stat) => (
          <HeroStatTile key={stat.id} stat={stat} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2" aria-label="Charts">
        <ProfitTrendChart data={dashboard.monthlyProfit} />
        <StockByTypeChart data={dashboard.stockSlices} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3" aria-label="Alerts and activity">
        <div className="lg:col-span-1">
          <NeedsAttentionPanel items={dashboard.attention} />
        </div>
        <div className="lg:col-span-2">
          <RecentActivityTable rows={dashboard.activity} />
        </div>
      </section>
    </div>
  )
}
