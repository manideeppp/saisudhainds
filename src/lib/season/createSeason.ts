import { supabase } from '../supabase'
import type { Season, SeasonType } from '../../types/season'

export interface CreateSeasonInput {
  name: string
  season_type: SeasonType
  start_date: string
  end_date: string
  /** When true, season is created as the sole active season (fails if another is active). */
  setActive: boolean
}

export async function createSeason(input: CreateSeasonInput): Promise<Season> {
  const name = input.name.trim()
  if (!name) throw new Error('Season name is required.')
  if (!input.start_date || !input.end_date) throw new Error('Start and end dates are required.')
  if (input.end_date < input.start_date) {
    throw new Error('End date must be on or after the start date.')
  }

  if (input.setActive) {
    const { data: activeRow, error: activeErr } = await supabase
      .from('seasons')
      .select('id, name')
      .eq('status', 'active')
      .maybeSingle()

    if (activeErr) throw new Error(activeErr.message)
    if (activeRow) {
      throw new Error(
        `“${activeRow.name}” is still active. Close it from the header or create this season as closed (for past records).`,
      )
    }
  }

  const status = input.setActive ? 'active' : 'closed'

  const { data, error } = await supabase
    .from('seasons')
    .insert({
      name,
      season_type: input.season_type,
      start_date: input.start_date,
      end_date: input.end_date,
      status,
    })
    .select()
    .single()

  if (error || !data) throw new Error(error?.message ?? 'Could not create season')

  const { error: stockErr } = await supabase.from('season_opening_stocks').insert({
    season_id: data.id,
    paddy_quintals: 0,
    rice_quintals: 0,
    gunny_count: 0,
  })

  if (stockErr) throw new Error(stockErr.message)

  return data as Season
}
