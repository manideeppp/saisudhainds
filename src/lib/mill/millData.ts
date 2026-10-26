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

export async function fetchMillData(period: DatePeriod): Promise<MillRawData> {
  const { start, end } = period

  const [farmerRes, ikpRes, riceRes, byRes, expRes] = await Promise.all([
    supabase
      .from('farmer_paddy_intakes')
      .select('*')
      .gte('intake_date', start)
      .lte('intake_date', end)
      .order('intake_date'),
    supabase
      .from('ikp_paddy_intakes')
      .select('*')
      .gte('intake_date', start)
      .lte('intake_date', end)
      .order('intake_date'),
    supabase
      .from('rice_deliveries')
      .select('*')
      .gte('delivery_date', start)
      .lte('delivery_date', end)
      .order('delivery_date'),
    supabase
      .from('byproduct_sales')
      .select('*')
      .gte('sale_date', start)
      .lte('sale_date', end)
      .order('sale_date'),
    supabase
      .from('expenses')
      .select('*, categories(name)')
      .gte('expense_date', start)
      .lte('expense_date', end)
      .order('expense_date'),
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
