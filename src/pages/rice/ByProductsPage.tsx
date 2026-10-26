import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatDate, formatINR, toInputDate } from '../../lib/format'
import { farmerPaddyTotals } from '../../lib/paddy'
import type { ByproductType } from '../../lib/constants'
import { useToast } from '../../contexts/ToastContext'
import { PageHeader } from '../../components/PageHeader'
import { PaymentSummary } from '../../components/PaymentSummary'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Textarea } from '../../components/ui/Textarea'
import { LoadingScreen } from '../../components/ui/LoadingScreen'
import type { ByproductSale } from '../../types/database'

interface FormState {
  sale_date: string
  party_name: string
  quintals: string
  price_per_quintal: string
  amount_given: string
  notes: string
}

const emptyForm = (): FormState => ({
  sale_date: toInputDate(),
  party_name: '',
  quintals: '',
  price_per_quintal: '',
  amount_given: '0',
  notes: '',
})

export function ByProductsPage({ productType }: { productType: ByproductType }) {
  const { notify } = useToast()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<ByproductSale[]>([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)

  const preview = useMemo(() => {
    const q = Number(form.quintals)
    const p = Number(form.price_per_quintal)
    const given = Number(form.amount_given) || 0
    if (!Number.isFinite(q) || !Number.isFinite(p) || q <= 0) {
      return { total_price: 0, due_amount: 0 }
    }
    return farmerPaddyTotals(q, p, given)
  }, [form.quintals, form.price_per_quintal, form.amount_given])

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('byproduct_sales')
      .select('*')
      .eq('product_type', productType)
      .order('sale_date', { ascending: false })

    if (error) notify(error.message, 'error')
    else setRows(data ?? [])
    setLoading(false)
  }, [notify, productType])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => [r.party_name, r.notes].join(' ').toLowerCase().includes(q))
  }, [rows, search])

  const summary = useMemo(() => {
    return filtered.reduce(
      (acc, r) => ({
        quintals: acc.quintals + Number(r.quintals),
        total: acc.total + Number(r.total_price),
        due: acc.due + Number(r.due_amount),
      }),
      { quintals: 0, total: 0, due: 0 },
    )
  }, [filtered])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  function openEdit(row: ByproductSale) {
    setEditingId(row.id)
    setForm({
      sale_date: row.sale_date,
      party_name: row.party_name,
      quintals: String(row.quintals),
      price_per_quintal: String(row.price_per_quintal),
      amount_given: String(row.amount_given),
      notes: row.notes,
    })
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const quintals = Number(form.quintals)
    const price = Number(form.price_per_quintal)
    const given = Number(form.amount_given) || 0

    if (!Number.isFinite(quintals) || quintals <= 0) {
      notify('Enter valid quintals.', 'error')
      return
    }
    if (!Number.isFinite(price) || price < 0) {
      notify('Enter valid price per quintal.', 'error')
      return
    }
    if (given < 0) {
      notify('Amount given cannot be negative.', 'error')
      return
    }

    const { total_price, due_amount } = farmerPaddyTotals(quintals, price, given)
    if (given > total_price + 0.009) {
      notify('Amount given cannot exceed total amount.', 'error')
      return
    }

    const payload = {
      product_type: productType,
      sale_date: form.sale_date,
      party_name: form.party_name.trim(),
      quintals,
      price_per_quintal: price,
      total_price,
      amount_given: given,
      due_amount,
      notes: form.notes.trim(),
    }

    setSaving(true)
    const { error } = editingId
      ? await supabase.from('byproduct_sales').update(payload).eq('id', editingId)
      : await supabase.from('byproduct_sales').insert(payload)
    setSaving(false)

    if (error) {
      notify(error.message, 'error')
      return
    }
    notify(editingId ? 'Record updated.' : 'Entry saved.')
    setModalOpen(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this record?')) return
    const { error } = await supabase.from('byproduct_sales').delete().eq('id', id)
    if (error) notify(error.message, 'error')
    else {
      notify('Record deleted.')
      load()
    }
  }

  if (loading) return <LoadingScreen message={`Loading ${productType}…`} />

  return (
    <div className="space-y-6">
      <PageHeader
        title={productType}
        description="Quintals, party, price per quintal, amount given & due."
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New entry
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="!p-4">
          <p className="text-xs font-medium uppercase text-forest-500">Quintals</p>
          <p className="mt-1 text-xl font-bold text-forest-900">{summary.quintals.toFixed(3)} Q</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-medium uppercase text-forest-500">Total amount</p>
          <p className="mt-1 text-xl font-bold text-forest-900">{formatINR(summary.total)}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-medium uppercase text-forest-500">Total due</p>
          <p className="mt-1 text-xl font-bold text-amber-800">{formatINR(summary.due)}</p>
        </Card>
      </div>

      <Card>
        <div className="mb-4 relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-forest-400" />
          <Input
            label="Search"
            className="pl-9"
            placeholder="Party name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-forest-100 text-forest-600">
                <th className="pb-3 pr-3 font-medium">Date</th>
                <th className="pb-3 pr-3 font-medium">To whom</th>
                <th className="pb-3 pr-3 font-medium text-right">Quintals</th>
                <th className="pb-3 pr-3 font-medium text-right">Price/Qtl</th>
                <th className="pb-3 pr-3 font-medium text-right">Total</th>
                <th className="pb-3 pr-3 font-medium text-right">Given</th>
                <th className="pb-3 pr-3 font-medium text-right">Due</th>
                <th className="pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-forest-500">
                    No entries yet.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-forest-50 hover:bg-ivory-100/50">
                    <td className="py-3 pr-3">{formatDate(r.sale_date)}</td>
                    <td className="py-3 pr-3 font-medium">{r.party_name || '—'}</td>
                    <td className="py-3 pr-3 text-right">{Number(r.quintals).toFixed(3)}</td>
                    <td className="py-3 pr-3 text-right">{formatINR(Number(r.price_per_quintal))}</td>
                    <td className="py-3 pr-3 text-right">{formatINR(Number(r.total_price))}</td>
                    <td className="py-3 pr-3 text-right text-emerald-700">
                      {formatINR(Number(r.amount_given))}
                    </td>
                    <td className="py-3 pr-3 text-right font-semibold text-amber-800">
                      {formatINR(Number(r.due_amount))}
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex gap-1">
                        <Button variant="ghost" className="!px-2 !py-2" onClick={() => openEdit(r)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="!px-2 !py-2 text-red-600"
                          onClick={() => handleDelete(r.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title={editingId ? `Edit — ${productType}` : `New — ${productType}`}
        onClose={() => setModalOpen(false)}
        wide
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Date"
              type="date"
              required
              value={form.sale_date}
              onChange={(e) => setForm((f) => ({ ...f, sale_date: e.target.value }))}
            />
            <Input
              label="To whom"
              value={form.party_name}
              onChange={(e) => setForm((f) => ({ ...f, party_name: e.target.value }))}
            />
            <Input
              label="Quintals"
              type="number"
              min="0"
              step="0.001"
              required
              value={form.quintals}
              onChange={(e) => setForm((f) => ({ ...f, quintals: e.target.value }))}
            />
            <Input
              label="Price per quintal (₹)"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.price_per_quintal}
              onChange={(e) => setForm((f) => ({ ...f, price_per_quintal: e.target.value }))}
            />
            <Input
              label="Amount given (₹)"
              type="number"
              min="0"
              step="0.01"
              value={form.amount_given}
              onChange={(e) => setForm((f) => ({ ...f, amount_given: e.target.value }))}
            />
          </div>

          <PaymentSummary
            total={preview.total_price}
            due={preview.due_amount}
            paidLabel="Amount given"
          />

          <Textarea
            label="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
