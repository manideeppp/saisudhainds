import { supabase } from '../supabase'

const linkedTables = [
  'expenses', 'receivables', 'farmer_paddy_intakes', 'ikp_paddy_intakes',
  'gunny_dispatches', 'rice_deliveries', 'byproduct_sales', 'rice_millings',
] as const

export async function deleteSeason(id: string): Promise<void> {
  // Preserve operational history: seasons containing records cannot be deleted.
  for (const table of linkedTables) {
    const { count, error } = await supabase
      .from(table)
      .select('id', { count: 'exact', head: true })
      .eq('season_id', id)
    if (error) throw new Error(error.message)
    if ((count ?? 0) > 0) {
      throw new Error('This season contains records and cannot be deleted. Close it to keep its history safe.')
    }
  }

  const { error } = await supabase.from('seasons').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
