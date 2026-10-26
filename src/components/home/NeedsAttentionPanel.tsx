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
        <ul className="divide-y divide-neutral-100">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to={item.to}
                className="flex items-center gap-3 py-3 transition hover:bg-neutral-50 -mx-2 px-2 rounded-lg"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    item.severity === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-neutral-900">{item.title}</span>
                  <span className="block text-xs text-neutral-500 truncate">{item.detail}</span>
                </span>
                {item.amount ? (
                  <span className="text-sm font-semibold text-neutral-800">{item.amount}</span>
                ) : null}
                <ChevronRight className="h-4 w-4 text-neutral-300" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
