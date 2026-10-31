import { supabase } from '../supabase'
import type { Season, SeasonType } from '../../types/season'

export interface UpdateSeasonInput {
  id: string
  name: string
  season_type: SeasonType
  start_date: string
  end_date: string
}

export async function updateSeason(input: UpdateSeasonInput): Promise<Season> {
  const name = input.name.trim()
  if (!name) throw new Error('Season name is required.')
  if (!input.start_date || !input.end_date) throw new Error('Start and end dates are required.')
  if (input.end_date < input.start_date) throw new Error('End date must be on or after the start date.')

  const { data, error } = await supabase
    .from('seasons')
    .update({ name, season_type: input.season_type, start_date: input.start_date, end_date: input.end_date })
    .eq('id', input.id)
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Could not update season')
  return data as Season
}
