import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatDate, formatINR, toInputDate } from '../../lib/format'
import { farmerPaddyTotals } from '../../lib/paddy'
import { useToast } from '../../contexts/ToastContext'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Textarea } from '../../components/ui/Textarea'
import type { FarmerPaddyIntake } from '../../types/database'
import { useSeasonScope } from '../../hooks/useSeasonScope'
import { SeasonPageShell } from '../../components/SeasonPageShell'

interface FormState {
  intake_date: string
  farmer_name: string
  village: string
  vehicle_number: string
  way_bill_number: string
  paddy_name: string
  bags: string
  quintals: string
  price_per_quintal: string
  amount_paid: string
  notes: string
}

const emptyForm = (): FormState => ({
  intake_date: toInputDate(),
  farmer_name: '',
  village: '',
  vehicle_number: '',
  way_bill_number: '',
  paddy_name: '',
  bags: '',
  quintals: '',
  price_per_quintal: '',
  amount_paid: '0',
  notes: '',
})

export function FarmerIntakePage() {
  const { notify } = useToast()
  const { seasonId, seasonLoading, isSeasonClosed } = useSeasonScope()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<FarmerPaddyIntake[]>([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const preview = useMemo(() => {
    const q = Number(form.quintals)
    const p = Number(form.price_per_quintal)
    const paid = Number(form.amount_paid) || 0
    if (!Number.isFinite(q) || !Number.isFinite(p) || q <= 0) {
      return { total_price: 0, due_amount: 0 }
    }
    return farmerPaddyTotals(q, p, paid)
  }, [form.quintals, form.price_per_quintal, form.amount_paid])

  const load = useCallback(async () => {
    if (!seasonId) {
      setRows([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('farmer_paddy_intakes')
      .select('*')
      .eq('season_id', seasonId)
      .order('intake_date', { ascending: false })

    if (error) {
      setLoadError(error.message)
      setRows([])
    } else {
      setLoadError(null)
      setRows(data ?? [])
    }
    setLoading(false)
  }, [notify, seasonId])

  useEffect(() => {
    if (!seasonLoading) load()
  }, [load, seasonLoading])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) =>
      [r.farmer_name, r.village, r.paddy_name, r.way_bill_number, r.vehicle_number]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
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

  function openEdit(row: FarmerPaddyIntake) {
    setEditingId(row.id)
    setForm({
      intake_date: row.intake_date,
      farmer_name: row.farmer_name,
      village: row.village,
      vehicle_number: row.vehicle_number,
      way_bill_number: row.way_bill_number,
      paddy_name: row.paddy_name,
      bags: String(row.bags),
      quintals: String(row.quintals),
      price_per_quintal: String(row.price_per_quintal),
      amount_paid: String(row.amount_paid),
      notes: row.notes,
    })
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!seasonId) return
    if (isSeasonClosed) {
      notify('This season is closed. Entries cannot be changed.', 'error')
      return
    }
    if (!form.farmer_name.trim()) {
      notify('Farmer name is required.', 'error')
      return
    }
    const quintals = Number(form.quintals)
    const price = Number(form.price_per_quintal)
    const paid = Number(form.amount_paid) || 0
    const bags = Number(form.bags) || 0

    if (!Number.isFinite(quintals) || quintals <= 0) {
      notify('Enter valid quintals.', 'error')
      return
    }
    if (!Number.isFinite(price) || price < 0) {
      notify('Enter valid price per quintal.', 'error')
      return
    }
    if (paid < 0) {
      notify('Paid amount cannot be negative.', 'error')
      return
    }

    const { total_price, due_amount } = farmerPaddyTotals(quintals, price, paid)
    if (paid > total_price + 0.009) {
      notify('Paid amount cannot exceed total price.', 'error')
      return
    }

    const payload = {
      intake_date: form.intake_date,
      farmer_name: form.farmer_name.trim(),
      village: form.village.trim(),
      vehicle_number: form.vehicle_number.trim(),
      way_bill_number: form.way_bill_number.trim(),
      paddy_name: form.paddy_name.trim(),
      bags,
      quintals,
      price_per_quintal: price,
      total_price,
      amount_paid: paid,
      due_amount,
      notes: form.notes.trim(),
      ...(editingId ? {} : { season_id: seasonId }),
    }

    setSaving(true)
    const { error } = editingId
      ? await supabase.from('farmer_paddy_intakes').update(payload).eq('id', editingId)
      : await supabase.from('farmer_paddy_intakes').insert(payload)
    setSaving(false)

    if (error) {
      notify(error.message, 'error')
      return
    }
    notify(editingId ? 'Record updated.' : 'Farmer intake saved.')
    setModalOpen(false)
    load()
  }

  async function handleDelete(id: string) {
    if (isSeasonClosed) {
      notify('This season is closed. Entries cannot be deleted.', 'error')
      return
    }
    if (!window.confirm('Delete this farmer intake record?')) return
    const { error } = await supabase.from('farmer_paddy_intakes').delete().eq('id', id)
    if (error) notify(error.message, 'error')
    else {
      notify('Record deleted.')
      load()
    }
  }

  return (
    <SeasonPageShell
      seasonLoading={seasonLoading}
      seasonId={seasonId}
      loading={loading}
      error={loadError}
      onRetry={load}
      loadingMessage="Loading farmer intake…"
    >
    <div className="space-y-6">
      <PageHeader
        title="Farmer paddy intake"
        description="Record paddy received directly from farmers — bags, quintals, payment & balance."
        action={
          <Button onClick={openCreate} disabled={isSeasonClosed}>
            <Plus className="h-4 w-4" />
            New intake
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="!p-4">
          <p className="text-xs font-medium uppercase text-forest-500">Filtered quintals</p>
          <p className="mt-1 text-xl font-bold text-forest-900">{summary.quintals.toFixed(3)} Q</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-medium uppercase text-forest-500">Total value</p>
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
            placeholder="Name, village, paddy, way bill…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-forest-100 text-forest-600">
                <th className="pb-3 pr-2 font-medium">Date</th>
                <th className="pb-3 pr-2 font-medium">Farmer</th>
                <th className="pb-3 pr-2 font-medium">Village</th>
                <th className="pb-3 pr-2 font-medium">Vehicle</th>
                <th className="pb-3 pr-2 font-medium">Way bill</th>
                <th className="pb-3 pr-2 font-medium">Paddy</th>
                <th className="pb-3 pr-2 font-medium text-right">Bags</th>
                <th className="pb-3 pr-2 font-medium text-right">Qtl</th>
                <th className="pb-3 pr-2 font-medium text-right">Total</th>
                <th className="pb-3 pr-2 font-medium text-right">Paid</th>
                <th className="pb-3 pr-2 font-medium text-right">Due</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-forest-500">
                    No farmer intake records yet.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-forest-50 hover:bg-ivory-100/50">
                    <td className="py-3 pr-2">{formatDate(r.intake_date)}</td>
                    <td className="py-3 pr-2 font-medium">{r.farmer_name}</td>
                    <td className="py-3 pr-2">{r.village || '—'}</td>
                    <td className="py-3 pr-2">{r.vehicle_number || '—'}</td>
                    <td className="py-3 pr-2">{r.way_bill_number || '—'}</td>
                    <td className="py-3 pr-2">{r.paddy_name || '—'}</td>
                    <td className="py-3 pr-2 text-right">{r.bags}</td>
                    <td className="py-3 pr-2 text-right">{Number(r.quintals).toFixed(3)}</td>
                    <td className="py-3 pr-2 text-right">{formatINR(Number(r.total_price))}</td>
                    <td className="py-3 pr-2 text-right text-emerald-700">
                      {formatINR(Number(r.amount_paid))}
                    </td>
                    <td className="py-3 pr-2 text-right font-semibold text-amber-800">
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
        title={editingId ? 'Edit farmer intake' : 'New farmer intake'}
        onClose={() => setModalOpen(false)}
        wide
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-700">Trip details</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Input
                label="Date"
                type="date"
                required
                value={form.intake_date}
                onChange={(e) => setForm((f) => ({ ...f, intake_date: e.target.value }))}
              />
              <Input
                label="Farmer name"
                required
                value={form.farmer_name}
                onChange={(e) => setForm((f) => ({ ...f, farmer_name: e.target.value }))}
              />
              <Input
                label="Village"
                value={form.village}
                onChange={(e) => setForm((f) => ({ ...f, village: e.target.value }))}
              />
              <Input
                label="Lorry / tractor number"
                value={form.vehicle_number}
                onChange={(e) => setForm((f) => ({ ...f, vehicle_number: e.target.value }))}
              />
              <Input
                label="Way bill number"
                value={form.way_bill_number}
                onChange={(e) => setForm((f) => ({ ...f, way_bill_number: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-700">Paddy & quantity</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <Input
                label="Name of paddy"
                value={form.paddy_name}
                onChange={(e) => setForm((f) => ({ ...f, paddy_name: e.target.value }))}
              />
              <Input
                label="No. of bags"
                type="number"
                min="0"
                value={form.bags}
                onChange={(e) => setForm((f) => ({ ...f, bags: e.target.value }))}
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
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-700">Payment</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
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
                label="Amount paid (₹)"
                type="number"
                min="0"
                step="0.01"
                value={form.amount_paid}
                onChange={(e) => setForm((f) => ({ ...f, amount_paid: e.target.value }))}
              />
            </div>
            <div className="mt-3 grid gap-3 rounded-xl border border-forest-100 bg-white p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-forest-500">Total amount</p>
                <p className="text-lg font-bold text-forest-900">{formatINR(preview.total_price)}</p>
              </div>
              <div>
                <p className="text-xs text-forest-500">Due</p>
                <p className="text-lg font-bold text-amber-800">{formatINR(preview.due_amount)}</p>
              </div>
            </div>
          </div>

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
    </SeasonPageShell>
  )
}
