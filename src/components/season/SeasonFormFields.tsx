import type { SeasonType } from '../../types/season'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

export function SeasonFormFields({
  name,
  onNameChange,
  seasonType,
  onSeasonTypeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  namePlaceholder = 'e.g. Kharif 2026–27',
}: {
  name: string
  onNameChange: (v: string) => void
  seasonType: SeasonType
  onSeasonTypeChange: (v: SeasonType) => void
  startDate: string
  onStartDateChange: (v: string) => void
  endDate: string
  onEndDateChange: (v: string) => void
  namePlaceholder?: string
}) {
  return (
    <>
      <Input
        label="Season name"
        required
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder={namePlaceholder}
        className="sm:col-span-2"
      />
      <Select
        label="Type"
        value={seasonType}
        onChange={(e) => onSeasonTypeChange(e.target.value as SeasonType)}
        className="sm:col-span-2"
      >
        <option value="Kharif">Kharif</option>
        <option value="Rabi">Rabi</option>
      </Select>
      <Input
        label="Start date"
        type="date"
        required
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
      />
      <Input
        label="End date"
        type="date"
        required
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
      />
    </>
  )
}
