import { supabase } from '../supabase'
import type { DatePeriod } from '../period'
import type {
  ByproductSale,
  ExpenseWithCategory,
  FarmerPaddyIntake,
  IkpPaddyIntake,
  RiceDelivery,
} from '../../types/database'

export interface MillRawData {
  farmer: FarmerPaddyIntake[]
  ikp: IkpPaddyIntake[]
  rice: RiceDelivery[]
  byproducts: ByproductSale[]
  expenses: ExpenseWithCategory[]
}

export async function fetchMillData(
  period: DatePeriod,
  seasonId?: string | null,
): Promise<MillRawData> {
  const { start, end } = period

  let farmerQ = supabase
    .from('farmer_paddy_intakes')
    .select('*')
    .gte('intake_date', start)
    .lte('intake_date', end)
    .order('intake_date')
  let ikpQ = supabase
    .from('ikp_paddy_intakes')
    .select('*')
    .gte('intake_date', start)
    .lte('intake_date', end)
    .order('intake_date')
  let riceQ = supabase
    .from('rice_deliveries')
    .select('*')
    .gte('delivery_date', start)
    .lte('delivery_date', end)
    .order('delivery_date')
  let byQ = supabase
    .from('byproduct_sales')
    .select('*')
    .gte('sale_date', start)
    .lte('sale_date', end)
    .order('sale_date')
  let expQ = supabase
    .from('expenses')
    .select('*, categories(name)')
    .gte('expense_date', start)
    .lte('expense_date', end)
    .order('expense_date')

  if (seasonId) {
    farmerQ = farmerQ.eq('season_id', seasonId)
    ikpQ = ikpQ.eq('season_id', seasonId)
    riceQ = riceQ.eq('season_id', seasonId)
    byQ = byQ.eq('season_id', seasonId)
    expQ = expQ.eq('season_id', seasonId)
  }

  const [farmerRes, ikpRes, riceRes, byRes, expRes] = await Promise.all([
    farmerQ,
    ikpQ,
    riceQ,
    byQ,
    expQ,
  ])

  const err =
    farmerRes.error?.message ??
    ikpRes.error?.message ??
    riceRes.error?.message ??
    byRes.error?.message ??
    expRes.error?.message
  if (err) throw new Error(err)

  return {
    farmer: farmerRes.data ?? [],
    ikp: ikpRes.data ?? [],
    rice: riceRes.data ?? [],
    byproducts: byRes.data ?? [],
    expenses: (expRes.data ?? []) as ExpenseWithCategory[],
  }
}
