import { useCallback, useEffect, useMemo, useState } from 'react'
import { FileSpreadsheet, FileText, Download } from 'lucide-react'
import { formatINR } from '../../lib/format'
import { monthPeriod, customPeriod, type DatePeriod } from '../../lib/period'
import { fetchMillData } from '../../lib/mill/millData'
import { computeMillSummary } from '../../lib/mill/millSummary'
import {
  exportByproductsCsv,
  exportFarmerCsv,
  exportFullExcel,
  exportIkpCsv,
  exportProfitPdf,
  exportRiceCsv,
} from '../../lib/export/millExports'
import { useToast } from '../../contexts/ToastContext'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card, StatCard } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { LoadingScreen } from '../../components/ui/LoadingScreen'
import { BYPRODUCT_TYPES } from '../../lib/constants'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function MillReportsPage() {
  const { notify } = useToast()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [useCustom, setUseCustom] = useState(false)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [loading, setLoading] = useState(true)

  const period: DatePeriod = useMemo(() => {
    if (useCustom && customStart && customEnd) {
      return customPeriod(customStart, customEnd)
    }
    return monthPeriod(year, month)
  }, [useCustom, customStart, customEnd, year, month])

  const [data, setData] = useState<Awaited<ReturnType<typeof fetchMillData>> | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const raw = await fetchMillData(period)
      setData(raw)
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Failed to load report data', 'error')
      setData(null)
    }
    setLoading(false)
  }, [period, notify])

  useEffect(() => {
    load()
  }, [load])

  const summary = useMemo(() => (data ? computeMillSummary(data) : null), [data])

  const years = Array.from({ length: 6 }, (_, i) => now.getFullYear() - 3 + i)

  if (loading && !data) return <LoadingScreen message="Calculating mill report…" />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mill reports & profit"
        description="Month-wise sales, paddy cost, expenses, and estimated profit. Export PDF or Excel for your records."
      />

      <Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="flex items-center gap-2 text-sm font-medium text-forest-800 lg:col-span-2">
            <input
              type="checkbox"
              checked={useCustom}
              onChange={(e) => setUseCustom(e.target.checked)}
              className="rounded border-forest-300"
            />
            Custom date range (instead of calendar month)
          </label>
          {!useCustom ? (
            <>
              <Select label="Month" value={String(month)} onChange={(e) => setMonth(Number(e.target.value))}>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </Select>
              <Select label="Year" value={String(year)} onChange={(e) => setYear(Number(e.target.value))}>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Select>
            </>
          ) : (
            <>
              <Input
                label="From"
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
              <Input
                label="To"
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </>
          )}
        </div>
        <p className="mt-3 text-sm text-forest-600">
          Reporting period: <strong>{period.label}</strong> ({period.start} → {period.end})
        </p>
      </Card>

      {summary && data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total sales" value={formatINR(summary.totalSales)} icon={<span className="text-lg">₹</span>} accent="gold" />
            <StatCard label="Paddy cost" value={formatINR(summary.totalPaddyCost)} icon={<span className="text-lg">₹</span>} accent="forest" />
            <StatCard label="Expenses" value={formatINR(summary.expenses)} icon={<span className="text-lg">₹</span>} accent="amber" />
            <StatCard
              label="Estimated profit"
              value={formatINR(summary.estimatedProfit)}
              icon={<span className="text-lg">₹</span>}
              accent={summary.estimatedProfit >= 0 ? 'forest' : 'red'}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Sales breakdown">
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Rice delivery</span>
                  <span className="font-semibold">{formatINR(summary.riceSales)}</span>
                </li>
                <li className="flex justify-between border-t border-forest-100 pt-2">
                  <span>All by-products</span>
                  <span className="font-semibold">{formatINR(summary.byproductSales)}</span>
                </li>
                {BYPRODUCT_TYPES.map((t) => (
                  <li key={t} className="flex justify-between pl-3 text-forest-600">
                    <span>{t}</span>
                    <span>{formatINR(summary.byproductBreakdown[t] ?? 0)}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="Cash & dues (this period)">
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Cash received</span>
                  <span className="font-semibold text-emerald-700">{formatINR(summary.cashIn)}</span>
                </li>
                <li className="flex justify-between">
                  <span>Cash paid out</span>
                  <span className="font-semibold text-red-700">{formatINR(summary.cashOut)}</span>
                </li>
                <li className="flex justify-between border-t border-forest-100 pt-2">
                  <span>Due to collect</span>
                  <span className="font-semibold text-amber-800">{formatINR(summary.dueToCollect)}</span>
                </li>
                <li className="flex justify-between">
                  <span>Due to pay (farmers + IKP)</span>
                  <span className="font-semibold text-amber-800">{formatINR(summary.dueToPay)}</span>
                </li>
              </ul>
              <p className="mt-4 text-xs text-forest-500">
                Profit uses total sale/cost amounts. Cash lines use amounts actually paid in this period.
              </p>
            </Card>
          </div>

          <Card title="Downloads">
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" onClick={() => exportProfitPdf(summary, period)}>
                <FileText className="h-4 w-4" />
                Profit PDF
              </Button>
              <Button variant="secondary" onClick={() => exportFullExcel(data, summary, period)}>
                <FileSpreadsheet className="h-4 w-4" />
                Full Excel (.xlsx)
              </Button>
              <Button variant="secondary" onClick={() => exportFarmerCsv(data, period)}>
                <Download className="h-4 w-4" />
                Farmer paddy CSV
              </Button>
              <Button variant="secondary" onClick={() => exportIkpCsv(data, period)}>
                <Download className="h-4 w-4" />
                IKP paddy CSV
              </Button>
              <Button variant="secondary" onClick={() => exportRiceCsv(data, period)}>
                <Download className="h-4 w-4" />
                Rice CSV
              </Button>
              <Button variant="secondary" onClick={() => exportByproductsCsv(data, period)}>
                <Download className="h-4 w-4" />
                By-products CSV
              </Button>
            </div>
          </Card>
        </>
      ) : (
        <Card>
          <p className="text-forest-600">No data loaded. Check Supabase connection and try again.</p>
          <Button className="mt-3" onClick={load}>Retry</Button>
        </Card>
      )}
    </div>
  )
}
