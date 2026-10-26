import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatINR } from '../../lib/format'
import type { MonthlyProfit } from '../../lib/home/buildHomeDashboard'
import { Card } from '../ui/Card'
import { EmptyState } from '../EmptyState'

export function ProfitTrendChart({ data }: { data: MonthlyProfit[] }) {
  return (
    <Card title="Profit trend" className="h-full">
      {data.length === 0 ? (
        <EmptyState title="No trend yet" description="Add sales and expenses to see monthly profit." />
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#525252' }} />
              <YAxis tickFormatter={(v) => formatINR(Number(v))} width={56} tick={{ fontSize: 10, fill: '#525252' }} />
              <Tooltip formatter={(v) => formatINR(Number(v ?? 0))} />
              <Line type="monotone" dataKey="profit" name="Est. profit" stroke="#255a43" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
