import { supabase } from '../supabase'
import type { MillRawData } from '../mill/millData'
import type { GunnyDispatch } from '../../types/database'

export async function fetchSeasonMillData(seasonId: string): Promise<MillRawData & { gunny: GunnyDispatch[] }> {
  const [farmerRes, ikpRes, riceRes, byRes, expRes, gunnyRes] = await Promise.all([
    supabase.from('farmer_paddy_intakes').select('*').eq('season_id', seasonId),
    supabase.from('ikp_paddy_intakes').select('*').eq('season_id', seasonId),
    supabase.from('rice_deliveries').select('*').eq('season_id', seasonId),
    supabase.from('byproduct_sales').select('*').eq('season_id', seasonId),
    supabase.from('expenses').select('*, categories(name)').eq('season_id', seasonId),
    supabase.from('gunny_dispatches').select('*').eq('season_id', seasonId),
  ])

  const err =
    farmerRes.error?.message ??
    ikpRes.error?.message ??
    riceRes.error?.message ??
    byRes.error?.message ??
    expRes.error?.message ??
    gunnyRes.error?.message
  if (err) throw new Error(err)

  return {
    farmer: farmerRes.data ?? [],
    ikp: ikpRes.data ?? [],
    rice: riceRes.data ?? [],
    byproducts: byRes.data ?? [],
    expenses: expRes.data ?? [],
    gunny: gunnyRes.data ?? [],
  }
}
