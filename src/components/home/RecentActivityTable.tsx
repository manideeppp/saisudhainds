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
              <tr className="border-b border-neutral-200 text-neutral-500">
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Detail</th>
                <th className="px-3 py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-neutral-50 hover:bg-neutral-50/80">
                  <td className="px-3 py-2.5 whitespace-nowrap text-neutral-600">{formatDate(r.date)}</td>
                  <td className="px-3 py-2.5">
                    <Link to={r.to} className="font-medium text-forest-800 hover:underline">
                      {r.type}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-neutral-700 max-w-[240px] truncate">{r.detail}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-neutral-900">{r.amount ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      )}
    </Card>
  )
}
