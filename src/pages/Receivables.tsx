import { useCallback, useEffect, useMemo, useState } from 'react'
import { IndianRupee, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import {
  formatDate,
  formatINR,
  receivableMetrics,
  statusBadgeClass,
  toInputDate,
} from '../lib/format'
import { useToast } from '../contexts/ToastContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Textarea } from '../components/ui/Textarea'
import { Modal } from '../components/ui/Modal'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import type { ReceivableStatus, ReceivableWithPayments } from '../types/database'

interface ReceivableForm {
  date_given: string
  party_name: string
  details: string
  amount_due: string
  due_date: string
  notes: string
}

const emptyReceivableForm = (): ReceivableForm => ({
  date_given: toInputDate(),
  party_name: '',
  details: '',
  amount_due: '',
  due_date: toInputDate(),
  notes: '',
})

export function ReceivablesPage() {
  const { notify } = useToast()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<ReceivableWithPayments[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReceivableStatus | ''>('')

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ReceivableForm>(emptyReceivableForm())
  const [saving, setSaving] = useState(false)

  const [paymentOpen, setPaymentOpen] = useState(false)
  const [paymentReceivable, setPaymentReceivable] = useState<ReceivableWithPayments | null>(null)
  const [paymentDate, setPaymentDate] = useState(toInputDate())
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('receivables')
      .select('*, receivable_payments(*)')
      .order('date_given', { ascending: false })

    if (error) {
      notify(error.message, 'error')
    } else {
      setRows((data ?? []) as ReceivableWithPayments[])
    }
    setLoading(false)
  }, [notify])

  useEffect(() => {
    load()
  }, [load])

  const enriched = useMemo(() => {
    return rows.map((r) => {
      const m = receivableMetrics(
        Number(r.amount_due),
        r.receivable_payments ?? [],
        r.due_date,
      )
      return { ...r, ...m }
    })
  }, [rows])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return enriched.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false
      if (!q) return true
      return [r.party_name, r.details, r.notes].join(' ').toLowerCase().includes(q)
    })
  }, [enriched, search, statusFilter])

  function openCreate() {
    setEditingId(null)
    setForm(emptyReceivableForm())
    setFormOpen(true)
  }

  function openEdit(r: ReceivableWithPayments) {
    setEditingId(r.id)
    setForm({
      date_given: r.date_given,
      party_name: r.party_name,
      details: r.details,
      amount_due: String(r.amount_due),
      due_date: r.due_date,
      notes: r.notes,
    })
    setFormOpen(true)
  }

  async function saveReceivable(e: React.FormEvent) {
    e.preventDefault()
    const amount = Number(form.amount_due)
    if (!form.party_name.trim()) {
      notify('Party name is required.', 'error')
      return
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      notify('Enter a valid amount due.', 'error')
      return
    }

    const payload = {
      date_given: form.date_given,
      party_name: form.party_name.trim(),
      details: form.details.trim(),
      amount_due: amount,
      due_date: form.due_date,
      notes: form.notes.trim(),
    }

    setSaving(true)
    const { error } = editingId
      ? await supabase.from('receivables').update(payload).eq('id', editingId)
      : await supabase.from('receivables').insert(payload)
    setSaving(false)

    if (error) {
      notify(error.message, 'error')
      return
    }

    notify(editingId ? 'Receivable updated.' : 'Receivable added.')
    setFormOpen(false)
    load()
  }

  async function deleteReceivable(id: string) {
    if (!window.confirm('Delete this receivable and all payment history?')) return
    const { error } = await supabase.from('receivables').delete().eq('id', id)
    if (error) {
      notify(error.message, 'error')
      return
    }
    notify('Receivable deleted.')
    load()
  }

  function openPayment(r: ReceivableWithPayments) {
    const m = receivableMetrics(Number(r.amount_due), r.receivable_payments ?? [], r.due_date)
    setPaymentReceivable(r)
    setPaymentDate(toInputDate())
    setPaymentAmount(m.outstanding > 0 ? String(m.outstanding) : '')
    setPaymentNotes('')
    setPaymentOpen(true)
  }

  async function submitPayment(e: React.FormEvent) {
    e.preventDefault()
    if (!paymentReceivable) return

    const amount = Number(paymentAmount)
    const m = receivableMetrics(
      Number(paymentReceivable.amount_due),
      paymentReceivable.receivable_payments ?? [],
      paymentReceivable.due_date,
    )

    if (!Number.isFinite(amount) || amount <= 0) {
      notify('Enter a valid payment amount.', 'error')
      return
    }
    if (amount > m.outstanding + 0.009) {
      notify(`Payment cannot exceed outstanding balance (${formatINR(m.outstanding)}).`, 'error')
      return
    }

    setSaving(true)
    const { error } = await supabase.from('receivable_payments').insert({
      receivable_id: paymentReceivable.id,
      payment_date: paymentDate,
      amount,
      notes: paymentNotes.trim(),
    })
    setSaving(false)

    if (error) {
      notify(error.message, 'error')
      return
    }

    notify('Payment recorded.')
    setPaymentOpen(false)
    load()
  }

  if (loading) return <LoadingScreen message="Loading receivables…" />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-forest-900">Receivables</h2>
          <p className="text-sm text-forest-600">Track money owed to the mill</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add receivable
        </Button>
      </div>

      <Card>
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-forest-400" />
            <Input
              label="Search"
              className="pl-9"
              placeholder="Party, details, notes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReceivableStatus | '')}
          >
            <option value="">All statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </Select>
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-forest-500">No receivables match your filters.</p>
          ) : (
            filtered.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-forest-100 bg-ivory-50/50 p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-forest-900">{r.party_name}</h3>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(r.status)}`}
                      >
                        {r.status}
                        {r.status === 'Overdue' ? ` · ${r.daysOverdue}d` : ''}
                      </span>
                    </div>
                    <p className="text-sm text-forest-600">
                      Given {formatDate(r.date_given)} · Due {formatDate(r.due_date)}
                    </p>
                    {r.details ? <p className="text-sm text-forest-800">{r.details}</p> : null}
                    {r.notes ? (
                      <p className="text-xs text-forest-500">Note: {r.notes}</p>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm min-w-[240px]">
                    <div>
                      <p className="text-forest-500">Due</p>
                      <p className="font-semibold">{formatINR(Number(r.amount_due))}</p>
                    </div>
                    <div>
                      <p className="text-forest-500">Received</p>
                      <p className="font-semibold text-emerald-700">{formatINR(r.received)}</p>
                    </div>
                    <div>
                      <p className="text-forest-500">Balance</p>
                      <p className="font-semibold">{formatINR(r.outstanding)}</p>
                    </div>
                  </div>
                </div>

                {(r.receivable_payments ?? []).length > 0 ? (
                  <div className="mt-4 overflow-x-auto rounded-xl border border-forest-100 bg-white">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-forest-100 text-forest-600">
                          <th className="px-3 py-2 font-medium">Payment date</th>
                          <th className="px-3 py-2 font-medium">Notes</th>
                          <th className="px-3 py-2 text-right font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...(r.receivable_payments ?? [])]
                          .sort((a, b) => b.payment_date.localeCompare(a.payment_date))
                          .map((p) => (
                            <tr key={p.id} className="border-b border-forest-50">
                              <td className="px-3 py-2">{formatDate(p.payment_date)}</td>
                              <td className="px-3 py-2">{p.notes || '—'}</td>
                              <td className="px-3 py-2 text-right font-medium">
                                {formatINR(Number(p.amount))}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {r.outstanding > 0.009 ? (
                    <Button variant="primary" className="!py-2" onClick={() => openPayment(r)}>
                      <IndianRupee className="h-4 w-4" />
                      Record payment
                    </Button>
                  ) : null}
                  <Button variant="secondary" className="!py-2" onClick={() => openEdit(r)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className="!py-2 text-red-600"
                    onClick={() => deleteReceivable(r.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Modal
        open={formOpen}
        title={editingId ? 'Edit receivable' : 'Add receivable'}
        onClose={() => setFormOpen(false)}
        wide
      >
        <form onSubmit={saveReceivable} className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Date given"
            type="date"
            required
            value={form.date_given}
            onChange={(e) => setForm((f) => ({ ...f, date_given: e.target.value }))}
          />
          <Input
            label="Due date"
            type="date"
            required
            value={form.due_date}
            onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
          />
          <Input
            label="Party name"
            required
            value={form.party_name}
            onChange={(e) => setForm((f) => ({ ...f, party_name: e.target.value }))}
            className="sm:col-span-2"
          />
          <Input
            label="Amount due (₹)"
            type="number"
            min="0"
            step="0.01"
            required
            value={form.amount_due}
            onChange={(e) => setForm((f) => ({ ...f, amount_due: e.target.value }))}
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Details"
              value={form.details}
              onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={paymentOpen}
        title={`Record payment — ${paymentReceivable?.party_name ?? ''}`}
        onClose={() => setPaymentOpen(false)}
      >
        <form onSubmit={submitPayment} className="space-y-4">
          <Input
            label="Payment date"
            type="date"
            required
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />
          <Input
            label="Amount (₹)"
            type="number"
            min="0"
            step="0.01"
            required
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
          />
          <Textarea
            label="Notes"
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setPaymentOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>Record payment</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
