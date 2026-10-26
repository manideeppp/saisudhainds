import { formatINR } from '../lib/format'

export function PaymentSummary({
  total,
  due,
  paidLabel = 'Amount paid',
}: {
  total: number
  due: number
  paidLabel?: string
}) {
  const paid = Math.max(0, total - due)
  return (
    <div className="grid gap-3 rounded-xl border border-forest-100 bg-white p-4 sm:grid-cols-3">
      <div>
        <p className="text-xs text-forest-500">Total amount</p>
        <p className="text-lg font-bold text-forest-900">{formatINR(total)}</p>
      </div>
      <div>
        <p className="text-xs text-forest-500">{paidLabel}</p>
        <p className="text-lg font-bold text-emerald-700">{formatINR(paid)}</p>
      </div>
      <div>
        <p className="text-xs text-forest-500">Due</p>
        <p className="text-lg font-bold text-amber-800">{formatINR(due)}</p>
      </div>
    </div>
  )
}
