import { Link } from 'react-router-dom'
import { formatDate } from '../../lib/format'
import type { ActivityRow } from '../../lib/home/buildHomeDashboard'
import { Card } from '../ui/Card'
import { EmptyState } from '../EmptyState'
import { TableShell } from '../ui/TableShell'

export function RecentActivityTable({ rows }: { rows: ActivityRow[] }) {
  return (
    <Card title="Recent activity">
      {rows.length === 0 ? (
        <EmptyState title="No activity" description="Entries for this season will appear here." />
      ) : (
        <TableShell>
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-blue-100 bg-blue-50/60 text-slate-500">
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Detail</th>
                <th className="px-3 py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 transition-colors hover:bg-blue-50/50">
                  <td className="px-3 py-2.5 whitespace-nowrap text-slate-600">{formatDate(r.date)}</td>
                  <td className="px-3 py-2.5">
                    <Link to={r.to} className="font-semibold text-blue-700 hover:text-blue-900 hover:underline">
                      {r.type}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-slate-700 max-w-[240px] truncate">{r.detail}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-slate-900">{r.amount ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      )}
    </Card>
  )
}
