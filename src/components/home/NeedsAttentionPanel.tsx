import { Link } from 'react-router-dom'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import type { AttentionItem } from '../../lib/home/buildHomeDashboard'
import { Card } from '../ui/Card'
import { EmptyState } from '../EmptyState'

export function NeedsAttentionPanel({ items }: { items: AttentionItem[] }) {
  return (
    <Card title="Needs attention" className="h-full">
      {items.length === 0 ? (
        <EmptyState
          title="All clear"
          description="No overdue receivables, pending farmer payments, or low gunny alerts."
        />
      ) : (
        <ul className="divide-y divide-blue-50">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to={item.to}
                className="flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-blue-50/70 -mx-2"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    item.severity === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900">{item.title}</span>
                  <span className="block text-xs text-slate-500 truncate">{item.detail}</span>
                </span>
                {item.amount ? (
                  <span className="text-sm font-semibold text-slate-800">{item.amount}</span>
                ) : null}
                <ChevronRight className="h-4 w-4 text-blue-300" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
