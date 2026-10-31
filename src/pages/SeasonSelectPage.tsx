import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight, Plus } from 'lucide-react'
import { useSeason } from '../contexts/SeasonContext'
import { markSeasonEntered } from '../lib/season/session'
import { BrandedShell, PageLoading } from '../components/ui/PageState'
import { Button } from '../components/ui/Button'
import { AddSeasonModal } from '../components/AddSeasonModal'
import { SeasonCard } from '../components/SeasonCard'
import { ManageSeasonModal } from '../components/ManageSeasonModal'
import type { Season } from '../types/season'

export function SeasonSelectPage() {
  const { seasons, loading, activeSeason, setActiveSeasonId } = useSeason()
  const [pickedId, setPickedId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [managedSeason, setManagedSeason] = useState<Season | null>(null)
  const [manageAction, setManageAction] = useState<'edit' | 'delete' | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  useEffect(() => {
    if (activeSeason?.id) setPickedId(activeSeason.id)
  }, [activeSeason?.id])

  function handleContinue() {
    if (!pickedId) return
    setActiveSeasonId(pickedId)
    markSeasonEntered()
    navigate(from && from !== '/season' ? from : '/home', { replace: true })
  }

  function openManage(season: Season, action: 'edit' | 'delete') {
    setManagedSeason(season)
    setManageAction(action)
  }

  if (loading) {
    return (
      <BrandedShell subtitle="Choose your working season">
        <PageLoading message="Loading seasons…" fullScreen />
      </BrandedShell>
    )
  }

  return (
    <BrandedShell subtitle="Select season">
      <div className="rounded-3xl border border-white/10 bg-ivory-50/95 p-6 shadow-2xl backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-sm text-forest-600 flex-1 min-w-[200px]">
            {seasons.length === 0
              ? 'Create your first season, then continue to the home screen.'
              : 'Entries and reports use the season you select here.'}
          </p>
          <Button type="button" variant="secondary" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add season
          </Button>
        </div>

        {seasons.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-forest-200 bg-white/80 px-4 py-10 text-center text-sm text-forest-600">
            No seasons yet. Tap <strong>Add season</strong> to get started.
          </div>
        ) : (
          <div className="mt-4 space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {seasons.map((s) => (
              <SeasonCard
                key={s.id}
                season={s}
                selected={pickedId === s.id}
                onSelect={() => setPickedId(s.id)}
                onEdit={() => openManage(s, 'edit')}
                onDelete={() => openManage(s, 'delete')}
              />
            ))}
          </div>
        )}

        <Button
          type="button"
          className="mt-6 w-full"
          disabled={!pickedId}
          onClick={handleContinue}
        >
          Continue to home
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <AddSeasonModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={(id) => setPickedId(id)}
      />
      <ManageSeasonModal
        season={managedSeason}
        action={manageAction}
        onClose={() => { setManagedSeason(null); setManageAction(null) }}
        onDeleted={(id) => setPickedId((current) => current === id ? null : current)}
      />
    </BrandedShell>
  )
}
