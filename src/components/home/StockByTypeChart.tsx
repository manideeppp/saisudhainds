import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { StockSlice } from '../../lib/home/buildHomeDashboard'
import { Card } from '../ui/Card'

export function StockByTypeChart({ data }: { data: StockSlice[] }) {
  const chartData = data.map((d) => ({
    name: d.name,
    value: d.value,
    label: `${d.value.toFixed(d.unit === 'bags' ? 0 : 2)} ${d.unit}`,
  }))

  return (
    <Card title="Stock by type" className="h-full">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#404040' }} />
            <YAxis tick={{ fontSize: 10, fill: '#525252' }} />
            <Tooltip
              formatter={(value, _name, item) => {
                const label = (item?.payload as { label?: string })?.label
                return [label ?? String(value), 'Stock']
              }}
            />
            <Bar dataKey="value" fill="#255a43" radius={[8, 8, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
