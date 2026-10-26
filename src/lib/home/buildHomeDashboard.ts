import { format, parseISO, startOfDay } from 'date-fns'
import { computeMillSummary } from '../mill/millSummary'
import { receivableMetrics } from '../format'
import { computeStockSimple } from '../season/stockMetrics'
import type { fetchSeasonMillData } from '../season/seasonMillData'
import type { ReceivableWithPayments } from '../../types/database'
import type { SeasonOpeningStock } from '../../types/season'

export const LOW_GUNNY_THRESHOLD = 150

export type TrendDir = 'up' | 'down' | 'flat'

export type HeroStat = {
  id: string
  label: string
  value: string
  sub?: string
  to: string
  trend: TrendDir
  trendLabel: string
  warn?: boolean
}

export type AttentionItem = {
  id: string
  kind: 'receivable' | 'farmer' | 'gunny'
  title: string
  detail: string
  amount?: string
  to: string
  severity: 'amber' | 'neutral'
}

export type ActivityRow = {
  id: string
  date: string
  type: string
  detail: string
  amount?: string
  to: string
}

export type MonthlyProfit = { month: string; profit: number; expenses: number; sales: number }

export type StockSlice = { name: string; value: number; unit: string }

export function buildHomeDashboard(
  millData: Awaited<ReturnType<typeof fetchSeasonMillData>>,
  receivables: ReceivableWithPayments[],
  opening: SeasonOpeningStock | null,
  riceProduced: number,
): {
  hero: HeroStat[]
  monthlyProfit: MonthlyProfit[]
  stockSlices: StockSlice[]
  attention: AttentionItem[]
  activity: ActivityRow[]
  seasonProfit: number
} {
  const summary = computeMillSummary(millData)
  const stock = computeStockSimple(opening, millData, riceProduced, millData.gunny)

  const paddyReceived =
    millData.farmer.reduce((s, r) => s + Number(r.quintals), 0) +
    millData.ikp.reduce((s, r) => s + Number(r.grade_a_quintals) + Number(r.common_quintals), 0)

  const today = format(startOfDay(new Date()), 'yyyy-MM-dd')
  const todayExpenses = millData.expenses
    .filter((e) => e.expense_date === today)
    .reduce((s, e) => s + Number(e.amount), 0)

  const expenseDays = new Set(millData.expenses.map((e) => e.expense_date))
  const avgDailyExpense =
    expenseDays.size > 0
      ? millData.expenses.reduce((s, e) => s + Number(e.amount), 0) / expenseDays.size
      : 0

  const receivableOutstanding = receivables.reduce((sum, r) => {
    const m = receivableMetrics(Number(r.amount_due), r.receivable_payments ?? [], r.due_date)
    return sum + m.outstanding
  }, 0)

  const overdueCount = receivables.filter((r) => {
    const m = receivableMetrics(Number(r.amount_due), r.receivable_payments ?? [], r.due_date)
    return m.status === 'Overdue' && m.outstanding > 0
  }).length

  const expenseTrend: TrendDir =
    todayExpenses > avgDailyExpense * 1.15 ? 'up' : todayExpenses < avgDailyExpense * 0.85 ? 'down' : 'flat'

  const hero: HeroStat[] = [
    {
      id: 'paddy-in',
      label: 'Paddy received',
      value: `${paddyReceived.toFixed(2)} Q`,
      sub: 'This season',
      to: '/paddy/farmer',
      trend: paddyReceived > 0 ? 'up' : 'flat',
      trendLabel: paddyReceived > 0 ? 'Intake on record' : 'No intake yet',
    },
    {
      id: 'paddy-stock',
      label: 'Paddy stock',
      value: `${stock.paddy_quintals.toFixed(2)} Q`,
      sub: 'Estimated',
      to: '/reports',
      trend: stock.paddy_quintals > 50 ? 'flat' : 'down',
      trendLabel: stock.paddy_quintals > 50 ? 'Healthy buffer' : 'Monitor levels',
      warn: stock.paddy_quintals < 25,
    },
    {
      id: 'rice-stock',
      label: 'Rice stock',
      value: `${stock.rice_quintals.toFixed(2)} Q`,
      sub: 'Estimated',
      to: '/rice/delivery',
      trend: stock.rice_quintals > 20 ? 'flat' : 'down',
      trendLabel: stock.rice_quintals > 20 ? 'Available' : 'Low stock',
      warn: stock.rice_quintals < 10,
    },
    {
      id: 'receivables',
      label: 'Receivables',
      value: formatINRCompact(receivableOutstanding),
      sub: overdueCount > 0 ? `${overdueCount} overdue` : 'Outstanding',
      to: '/receivables',
      trend: overdueCount > 0 ? 'up' : receivableOutstanding > 0 ? 'flat' : 'down',
      trendLabel: overdueCount > 0 ? 'Needs collection' : 'On track',
      warn: overdueCount > 0,
    },
    {
      id: 'today-exp',
      label: "Today's expenses",
      value: formatINRCompact(todayExpenses),
      sub: `Avg ${formatINRCompact(avgDailyExpense)}/day`,
      to: '/expenses',
      trend: expenseTrend,
      trendLabel:
        expenseTrend === 'up' ? 'Above daily avg' : expenseTrend === 'down' ? 'Below daily avg' : 'Near daily avg',
    },
    {
      id: 'profit',
      label: 'Season profit',
      value: formatINRCompact(summary.estimatedProfit),
      sub: 'Estimated',
      to: '/reports',
      trend: summary.estimatedProfit >= 0 ? 'up' : 'down',
      trendLabel: summary.estimatedProfit >= 0 ? 'Positive' : 'Review costs',
      warn: summary.estimatedProfit < 0,
    },
  ]

  const monthlyMap = new Map<string, { expenses: number; sales: number }>()
  for (const e of millData.expenses) {
    const key = format(parseISO(e.expense_date), 'MMM yy')
    const row = monthlyMap.get(key) ?? { expenses: 0, sales: 0 }
    row.expenses += Number(e.amount)
    monthlyMap.set(key, row)
  }
  for (const r of millData.rice) {
    const key = format(parseISO(r.delivery_date), 'MMM yy')
    const row = monthlyMap.get(key) ?? { expenses: 0, sales: 0 }
    row.sales += Number(r.total_price ?? 0)
    monthlyMap.set(key, row)
  }
  for (const b of millData.byproducts) {
    const key = format(parseISO(b.sale_date), 'MMM yy')
    const row = monthlyMap.get(key) ?? { expenses: 0, sales: 0 }
    row.sales += Number(b.total_price)
    monthlyMap.set(key, row)
  }

  const monthlyProfit: MonthlyProfit[] = Array.from(monthlyMap.entries())
    .map(([month, { expenses, sales }]) => ({
      month,
      expenses,
      sales,
      profit: sales - expenses - monthlyPaddyCostForMonth(millData, month),
    }))
    .slice(-6)

  const stockSlices: StockSlice[] = [
    { name: 'Paddy', value: stock.paddy_quintals, unit: 'Q' },
    { name: 'Rice', value: stock.rice_quintals, unit: 'Q' },
    { name: 'Gunny', value: stock.gunny_count, unit: 'bags' },
  ]

  const attention: AttentionItem[] = []

  receivables.forEach((r) => {
    const m = receivableMetrics(Number(r.amount_due), r.receivable_payments ?? [], r.due_date)
    if (m.status === 'Overdue' && m.outstanding > 0.009) {
      attention.push({
        id: `rec-${r.id}`,
        kind: 'receivable',
        title: r.party_name,
        detail: `${m.daysOverdue} days overdue`,
        amount: formatINRCompact(m.outstanding),
        to: '/receivables',
        severity: 'amber',
      })
    }
  })

  millData.farmer
    .filter((f) => Number(f.due_amount) > 0.009)
    .slice(0, 5)
    .forEach((f) => {
      attention.push({
        id: `farmer-${f.id}`,
        kind: 'farmer',
        title: f.farmer_name,
        detail: `${f.village || 'Farmer'} · pending payment`,
        amount: formatINRCompact(Number(f.due_amount)),
        to: '/paddy/farmer',
        severity: 'amber',
      })
    })

  if (stock.gunny_count < LOW_GUNNY_THRESHOLD) {
    attention.push({
      id: 'gunny-low',
      kind: 'gunny',
      title: 'Gunny stock low',
      detail: `${stock.gunny_count} bags remaining (threshold ${LOW_GUNNY_THRESHOLD})`,
      to: '/paddy/gunny',
      severity: 'amber',
    })
  }

  const activity: ActivityRow[] = []
  millData.farmer.forEach((r) =>
    activity.push({
      id: `f-${r.id}`,
      date: r.intake_date,
      type: 'Farmer paddy',
      detail: `${r.farmer_name} · ${Number(r.quintals).toFixed(2)} Q`,
      amount: formatINRCompact(Number(r.total_price)),
      to: '/paddy/farmer',
    }),
  )
  millData.rice.forEach((r) =>
    activity.push({
      id: `rice-${r.id}`,
      date: r.delivery_date,
      type: 'Rice delivery',
      detail: `${r.godown_name || r.variety} · ${Number(r.quintals).toFixed(2)} Q`,
      amount: formatINRCompact(Number(r.total_price ?? 0)),
      to: '/rice/delivery',
    }),
  )
  millData.expenses.forEach((r) =>
    activity.push({
      id: `exp-${r.id}`,
      date: r.expense_date,
      type: 'Expense',
      detail: r.categories?.name ?? r.description ?? 'Expense',
      amount: formatINRCompact(Number(r.amount)),
      to: '/expenses',
    }),
  )

  activity.sort((a, b) => b.date.localeCompare(a.date))

  return {
    hero,
    monthlyProfit,
    stockSlices,
    attention: attention.slice(0, 8),
    activity: activity.slice(0, 12),
    seasonProfit: summary.estimatedProfit,
  }
}

function formatINRCompact(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function monthlyPaddyCostForMonth(
  data: Awaited<ReturnType<typeof fetchSeasonMillData>>,
  monthLabel: string,
): number {
  let cost = 0
  for (const f of data.farmer) {
    if (format(parseISO(f.intake_date), 'MMM yy') === monthLabel) cost += Number(f.total_price)
  }
  for (const i of data.ikp) {
    if (format(parseISO(i.intake_date), 'MMM yy') === monthLabel) cost += Number(i.total_price ?? 0)
  }
  return cost
}
