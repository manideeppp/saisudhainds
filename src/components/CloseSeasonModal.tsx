import { useEffect, useState } from 'react'
import { closeSeasonAndOpenNext } from '../lib/season/closeSeason'
import { defaultDatesForType } from '../lib/season/defaults'
import { useSeason } from '../contexts/SeasonContext'
import { useToast } from '../contexts/ToastContext'
import type { SeasonType } from '../types/season'
import { SeasonFormFields } from './season/SeasonFormFields'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'

export function CloseSeasonModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { activeSeason, refreshSeasons, setActiveSeasonId } = useSeason()
  const { notify } = useToast()
  const [nextName, setNextName] = useState('')
  const [nextType, setNextType] = useState<SeasonType>('Rabi')
  const [nextStart, setNextStart] = useState('')
  const [nextEnd, setNextEnd] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    const t = activeSeason?.season_type === 'Kharif' ? 'Rabi' : 'Kharif'
    setNextType(t)
    const d = defaultDatesForType(t)
    setNextStart(d.start)
    setNextEnd(d.end)
  }, [open, activeSeason?.season_type])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!activeSeason) return
    if (!nextName.trim() || !nextStart || !nextEnd) {
      notify('Fill in the next season details.', 'error')
      return
    }

    setSaving(true)
    try {
      const next = await closeSeasonAndOpenNext({
        closingSeasonId: activeSeason.id,
        nextName: nextName.trim(),
        nextType,
        nextStart,
        nextEnd,
      })
      await refreshSeasons()
      setActiveSeasonId(next.id)
      notify('Season closed. Stock and pending receivables carried forward.')
      onClose()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to close season', 'error')
    }
    setSaving(false)
  }

  return (
    <Modal open={open} title="Close season & open next" onClose={onClose} wide>
      <p className="mb-4 text-sm text-forest-600">
        Closing <strong>{activeSeason?.name}</strong> locks all entries. Closing stock and
        outstanding receivables move to the new season.
      </p>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <SeasonFormFields
          name={nextName}
          onNameChange={setNextName}
          seasonType={nextType}
          onSeasonTypeChange={setNextType}
          startDate={nextStart}
          onStartDateChange={setNextStart}
          endDate={nextEnd}
          onEndDateChange={setNextEnd}
          namePlaceholder="e.g. Rabi 2026–27"
        />
        <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>Close & open next</Button>
        </div>
      </form>
    </Modal>
  )
}
