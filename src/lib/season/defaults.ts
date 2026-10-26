import type { SeasonType } from '../../types/season'

export function defaultDatesForType(type: SeasonType): { start: string; end: string } {
  const y = new Date().getFullYear()
  if (type === 'Kharif') {
    return { start: `${y}-06-01`, end: `${y}-11-30` }
  }
  return { start: `${y}-11-01`, end: `${y + 1}-05-31` }
}
