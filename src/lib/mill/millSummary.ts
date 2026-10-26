import { BYPRODUCT_TYPES } from '../constants'
import type { MillRawData } from './millData'

export interface MillSummaryFigures {
  riceSales: number
  byproductSales: number
  totalSales: number
  farmerPaddyCost: number
  ikpPaddyCost: number
  totalPaddyCost: number
  expenses: number
  estimatedProfit: number
  cashIn: number
  cashOut: number
  dueToCollect: number
  dueToPay: number
  byproductBreakdown: Record<string, number>
}

function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0)
}

export function computeMillSummary(data: MillRawData): MillSummaryFigures {
  const riceSales = sum(data.rice.map((r) => Number(r.total_price ?? 0)))
  const byproductBreakdown: Record<string, number> = {}
  for (const t of BYPRODUCT_TYPES) {
    byproductBreakdown[t] = sum(
      data.byproducts.filter((b) => b.product_type === t).map((b) => Number(b.total_price)),
    )
  }
  const byproductSales = sum(data.byproducts.map((b) => Number(b.total_price)))
  const totalSales = riceSales + byproductSales

  const farmerPaddyCost = sum(data.farmer.map((f) => Number(f.total_price)))
  const ikpPaddyCost = sum(data.ikp.map((i) => Number(i.total_price ?? 0)))
  const totalPaddyCost = farmerPaddyCost + ikpPaddyCost

  const expenses = sum(data.expenses.map((e) => Number(e.amount)))

  const estimatedProfit = totalSales - totalPaddyCost - expenses

  const cashIn =
    sum(data.rice.map((r) => Number(r.amount_paid ?? 0))) +
    sum(data.byproducts.map((b) => Number(b.amount_given)))

  const cashOut =
    sum(data.farmer.map((f) => Number(f.amount_paid))) +
    sum(data.ikp.map((i) => Number(i.amount_paid ?? 0))) +
    expenses

  const dueToCollect =
    sum(data.rice.map((r) => Number(r.due_amount ?? 0))) +
    sum(data.byproducts.map((b) => Number(b.due_amount)))

  const dueToPay =
    sum(data.farmer.map((f) => Number(f.due_amount))) +
    sum(data.ikp.map((i) => Number(i.due_amount ?? 0)))

  return {
    riceSales,
    byproductSales,
    totalSales,
    farmerPaddyCost,
    ikpPaddyCost,
    totalPaddyCost,
    expenses,
    estimatedProfit,
    cashIn,
    cashOut,
    dueToCollect,
    dueToPay,
    byproductBreakdown,
  }
}
