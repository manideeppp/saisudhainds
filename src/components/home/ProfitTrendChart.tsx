import {
  CartesianGrid,
  Line,
  LineChart,
  Legend,
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
    <Card title="Financial performance" className="h-full">
      {data.length === 0 ? (
        <EmptyState title="No financial data yet" description="Monthly sales, costs, and estimated profit will appear here as the season progresses." />
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatINR(Number(v))} width={56} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => formatINR(Number(v ?? 0))} contentStyle={{ borderRadius: 12, borderColor: '#dbeafe' }} />
              <Legend />
              <Line type="monotone" dataKey="sales" name="Sales" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="profit" name="Est. profit" stroke="#0f766e" strokeWidth={3} dot={{ r: 3, fill: '#0f766e', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
