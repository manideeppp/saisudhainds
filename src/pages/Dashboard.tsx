import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  CalendarDays,
  IndianRupee,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react'
import {
  endOfMonth,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfYear,
} from 'date-fns'
import { supabase } from '../lib/supabase'
import { formatDate, formatINR, receivableMetrics } from '../lib/format'
import { Card, StatCard } from '../components/ui/Card'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { Select } from '../components/ui/Select'
import type { ExpenseWithCategory, ReceivableWithPayments } from '../types/database'

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const PIE_COLORS = {
  Paid: '#059669',
  Pending: '#d97706',
  Overdue: '#dc2626',
}

export function DashboardPage() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([])
  const [receivables, setReceivables] = useState<ReceivableWithPayments[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const yearStart = format(startOfYear(new Date(year, 0, 1)), 'yyyy-MM-dd')
    const yearEnd = format(new Date(year, 11, 31), 'yyyy-MM-dd')

    const [expRes, recRes] = await Promise.all([
      supabase
        .from('expenses')
        .select('*, categories(name)')
        .gte('expense_date', yearStart)
        .lte('expense_date', yearEnd)
        .order('expense_date', { ascending: false }),
      supabase
        .from('receivables')
        .select('*, receivable_payments(*)')
        .order('due_date', { ascending: true }),
    ])

    if (expRes.error || recRes.error) {
      setError(expRes.error?.message ?? recRes.error?.message ?? 'Failed to load dashboard')
      setLoading(false)
      return
    }

    setExpenses((expRes.data ?? []) as ExpenseWithCategory[])
    setReceivables((recRes.data ?? []) as ReceivableWithPayments[])
    setLoading(false)
  }, [year])

  useEffect(() => {
    load()
  }, [load])

  const today = startOfDay(new Date())
  const monthStart = startOfMonth(new Date(year, month - 1, 1))
  const monthEnd = endOfMonth(monthStart)

  const stats = useMemo(() => {
    const monthExpenses = expenses.filter((e) => {
      const d = parseISO(e.expense_date)
      return d >= monthStart && d <= monthEnd
    })
    const monthTotal = monthExpenses.reduce((s, e) => s + Number(e.amount), 0)

    const todayStr = format(today, 'yyyy-MM-dd')
    const todayTotal = expenses
      .filter((e) => e.expense_date === todayStr)
      .reduce((s, e) => s + Number(e.amount), 0)

    let totalOutstanding = 0
    let overdueCount = 0
    const statusTotals = { Paid: 0, Pending: 0, Overdue: 0 }

    for (const r of receivables) {
      const m = receivableMetrics(
        Number(r.amount_due),
        r.receivable_payments ?? [],
        r.due_date,
        today,
      )
      if (m.status !== 'Paid') {
        totalOutstanding += m.outstanding
      }
      if (m.status === 'Overdue') overdueCount += 1
      statusTotals[m.status] += m.outstanding > 0 ? m.outstanding : 0
    }

    return { monthTotal, todayTotal, totalOutstanding, overdueCount, statusTotals }
  }, [expenses, receivables, monthStart, monthEnd, today])

  const categoryChart = useMemo(() => {
    const map = new Map<string, number>()
    expenses
      .filter((e) => {
        const d = parseISO(e.expense_date)
        return d >= monthStart && d <= monthEnd
      })
      .forEach((e) => {
        const name = e.categories?.name ?? 'Unknown'
        map.set(name, (map.get(name) ?? 0) + Number(e.amount))
      })
    return Array.from(map.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
  }, [expenses, monthStart, monthEnd])

  const monthlyChart = useMemo(() => {
    const totals = MONTHS.map((label) => ({ month: label, total: 0 }))
    expenses.forEach((e) => {
      const d = parseISO(e.expense_date)
      if (d.getFullYear() !== year) return
      totals[d.getMonth()].total += Number(e.amount)
    })
    return totals
  }, [expenses, year])

  const pieData = useMemo(
    () =>
      (['Paid', 'Pending', 'Overdue'] as const).map((status) => ({
        name: status,
        value: stats.statusTotals[status],
      })),
    [stats.statusTotals],
  )

  const recentExpenses = expenses.slice(0, 8)

  const overdueList = useMemo(() => {
    return receivables
      .map((r) => {
        const m = receivableMetrics(
          Number(r.amount_due),
          r.receivable_payments ?? [],
          r.due_date,
          today,
        )
        return { ...r, ...m }
      })
      .filter((r) => r.status === 'Overdue')
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
      .slice(0, 8)
  }, [receivables, today])

  if (loading) return <LoadingScreen message="Loading dashboard…" />

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
        {error}
      </div>
    )
  }

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-forest-900">Dashboard</h2>
          <p className="text-sm text-forest-600">
            Live overview from your Supabase records
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select
            label="Month"
            value={String(month)}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="min-w-[120px]"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </Select>
          <Select
            label="Year"
            value={String(year)}
            onChange={(e) => setYear(Number(e.target.value))}
            className="min-w-[100px]"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="This month's expenses"
          value={formatINR(stats.monthTotal)}
          icon={<CalendarDays className="h-5 w-5" />}
          accent="forest"
        />
        <StatCard
          label="Today's expenses"
          value={formatINR(stats.todayTotal)}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="gold"
        />
        <StatCard
          label="Total money to receive"
          value={formatINR(stats.totalOutstanding)}
          icon={<IndianRupee className="h-5 w-5" />}
          accent="amber"
        />
        <StatCard
          label="Overdue receivables"
          value={String(stats.overdueCount)}
          icon={<AlertTriangle className="h-5 w-5" />}
          accent="red"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title={`Category expenses — ${MONTHS[month - 1]} ${year}`}>
          {categoryChart.length === 0 ? (
            <p className="text-sm text-forest-500">No expenses for this month.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChart} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dceee5" />
                  <XAxis type="number" tickFormatter={(v) => formatINR(v)} fontSize={11} />
                  <YAxis type="category" dataKey="name" width={110} fontSize={11} />
                  <Tooltip formatter={(v) => formatINR(Number(v ?? 0))} />
                  <Bar dataKey="total" fill="#2d6f52" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Receivables by status (outstanding)">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatINR(Number(v ?? 0))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title={`Monthly expenses — ${year}`}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dceee5" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis tickFormatter={(v) => formatINR(v)} fontSize={11} width={72} />
              <Tooltip formatter={(v) => formatINR(Number(v ?? 0))} />
              <Bar dataKey="total" fill="#c9a227" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Recent transactions">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-forest-100 text-forest-600">
                  <th className="pb-2 pr-2 font-medium">Date</th>
                  <th className="pb-2 pr-2 font-medium">Category</th>
                  <th className="pb-2 pr-2 font-medium">Paid to</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-forest-500">No expenses yet.</td>
                  </tr>
                ) : (
                  recentExpenses.map((e) => (
                    <tr key={e.id} className="border-b border-forest-50">
                      <td className="py-2.5 pr-2">{formatDate(e.expense_date)}</td>
                      <td className="py-2.5 pr-2">{e.categories?.name}</td>
                      <td className="py-2.5 pr-2">{e.paid_to || '—'}</td>
                      <td className="py-2.5 text-right font-semibold">{formatINR(Number(e.amount))}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Overdue payments">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-forest-100 text-forest-600">
                  <th className="pb-2 pr-2 font-medium">Party</th>
                  <th className="pb-2 pr-2 font-medium">Due</th>
                  <th className="pb-2 pr-2 font-medium">Days</th>
                  <th className="pb-2 text-right font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {overdueList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-forest-500">No overdue receivables.</td>
                  </tr>
                ) : (
                  overdueList.map((r) => (
                    <tr key={r.id} className="border-b border-forest-50">
                      <td className="py-2.5 pr-2 font-medium">{r.party_name}</td>
                      <td className="py-2.5 pr-2">{formatDate(r.due_date)}</td>
                      <td className="py-2.5 pr-2 text-red-700">{r.daysOverdue}d</td>
                      <td className="py-2.5 text-right font-semibold text-red-700">
                        {formatINR(r.outstanding)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
