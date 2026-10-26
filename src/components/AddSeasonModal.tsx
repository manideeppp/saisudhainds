import { useEffect, useMemo, useState } from 'react'
import { createSeason } from '../lib/season/createSeason'
import { defaultDatesForType } from '../lib/season/defaults'
import { useSeason } from '../contexts/SeasonContext'
import { useToast } from '../contexts/ToastContext'
import type { SeasonType } from '../types/season'
import { SeasonFormFields } from './season/SeasonFormFields'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'

export function AddSeasonModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated?: (seasonId: string) => void
}) {
  const { seasons, refreshSeasons, setActiveSeasonId } = useSeason()
  const { notify } = useToast()
  const hasActive = useMemo(() => seasons.some((s) => s.status === 'active'), [seasons])

  const [name, setName] = useState('')
  const [seasonType, setSeasonType] = useState<SeasonType>('Kharif')
  const [startDate, setStartDate] = useState(() => defaultDatesForType('Kharif').start)
  const [endDate, setEndDate] = useState(() => defaultDatesForType('Kharif').end)
  const [setActive, setSetActive] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    const defaults = defaultDatesForType(seasonType)
    setStartDate(defaults.start)
    setEndDate(defaults.end)
    setSetActive(!hasActive)
  }, [open, seasonType, hasActive])

  useEffect(() => {
    if (open && hasActive) setSetActive(false)
  }, [open, hasActive])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const season = await createSeason({
        name,
        season_type: seasonType,
        start_date: startDate,
        end_date: endDate,
        setActive,
      })
      await refreshSeasons()
      if (setActive) setActiveSeasonId(season.id)
      notify(setActive ? 'Season created and set as active.' : 'Season created (closed).')
      onCreated?.(season.id)
      onClose()
      setName('')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to create season', 'error')
    }
    setSaving(false)
  }

  return (
    <Modal open={open} title="Add season" onClose={onClose} wide>
      <p className="mb-4 text-sm text-forest-600">
        Create a Kharif or Rabi season. Only one season can be <strong>active</strong> at a time.
      </p>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <SeasonFormFields
          name={name}
          onNameChange={setName}
          seasonType={seasonType}
          onSeasonTypeChange={setSeasonType}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
        />
        <label className="sm:col-span-2 flex items-start gap-3 rounded-xl border border-forest-100 bg-ivory-50 p-3 text-sm">
          <input
            type="checkbox"
            className="mt-1 accent-forest-700"
            checked={setActive}
            disabled={hasActive}
            onChange={(e) => setSetActive(e.target.checked)}
          />
          <span>
            <span className="font-semibold text-forest-900">Set as active season</span>
            <span className="block text-forest-600">
              {hasActive
                ? 'Close the current active season first, or save as closed (historical).'
                : 'New entries will use this season by default.'}
            </span>
          </span>
        </label>
        <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>Create season</Button>
        </div>
      </form>
    </Modal>
  )
}
