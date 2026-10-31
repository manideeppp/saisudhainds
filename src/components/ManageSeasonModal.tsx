import { useEffect, useState, type FormEvent } from 'react'
import { updateSeason } from '../lib/season/updateSeason'
import { deleteSeason } from '../lib/season/deleteSeason'
import { useSeason } from '../contexts/SeasonContext'
import { useToast } from '../contexts/ToastContext'
import type { Season, SeasonType } from '../types/season'
import { SeasonFormFields } from './season/SeasonFormFields'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'

export function ManageSeasonModal({
  season,
  action,
  onClose,
  onDeleted,
}: {
  season: Season | null
  action: 'edit' | 'delete' | null
  onClose: () => void
  onDeleted: (id: string) => void
}) {
  const { refreshSeasons } = useSeason()
  const { notify } = useToast()
  const [name, setName] = useState('')
  const [seasonType, setSeasonType] = useState<SeasonType>('Kharif')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!season) return
    setName(season.name)
    setSeasonType(season.season_type)
    setStartDate(season.start_date)
    setEndDate(season.end_date)
  }, [season])

  async function handleEdit(e: FormEvent) {
    e.preventDefault()
    if (!season) return
    setSaving(true)
    try {
      await updateSeason({ id: season.id, name, season_type: seasonType, start_date: startDate, end_date: endDate })
      await refreshSeasons()
      notify('Season updated.')
      onClose()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not update season.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!season) return
    setSaving(true)
    try {
      await deleteSeason(season.id)
      await refreshSeasons()
      onDeleted(season.id)
      notify('Season deleted.')
      onClose()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not delete season.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const isEdit = action === 'edit'
  return (
    <Modal open={Boolean(season && action)} title={isEdit ? 'Edit season' : 'Delete season'} onClose={onClose} wide={isEdit}>
      {isEdit ? (
        <form onSubmit={handleEdit} className="grid gap-4 sm:grid-cols-2">
          <SeasonFormFields name={name} onNameChange={setName} seasonType={seasonType} onSeasonTypeChange={setSeasonType}
            startDate={startDate} onStartDateChange={setStartDate} endDate={endDate} onEndDateChange={setEndDate} />
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={saving}>Save changes</Button>
          </div>
        </form>
      ) : (
        <div>
          <p className="text-sm leading-6 text-forest-700">
            Delete <strong>{season?.name}</strong>? This action is permanent. Seasons with recorded activity are protected and cannot be deleted.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="button" variant="danger" loading={saving} onClick={handleDelete}>Delete season</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
