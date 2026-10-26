import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatDate, formatINR, toInputDate } from '../../lib/format'
import { farmerPaddyTotals, ikpHasQuantity, ikpTotalQuintals } from '../../lib/paddy'
import { PaymentSummary } from '../../components/PaymentSummary'
import { useToast } from '../../contexts/ToastContext'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Textarea } from '../../components/ui/Textarea'
import type { IkpPaddyIntake } from '../../types/database'
import { useSeasonScope } from '../../hooks/useSeasonScope'
import { SeasonPageShell } from '../../components/SeasonPageShell'

interface FormState {
  intake_date: string
  vehicle_number: string
  truck_sheet_number: string
  center_name: string
  grade_a_bags: string
  grade_a_quintals: string
  common_bags: string
  common_quintals: string
  gunny_old: string
  gunny_new: string
  price_per_quintal: string
  amount_paid: string
  notes: string
}

const emptyForm = (): FormState => ({
  intake_date: toInputDate(),
  vehicle_number: '',
  truck_sheet_number: '',
  center_name: '',
  grade_a_bags: '0',
  grade_a_quintals: '0',
  common_bags: '0',
  common_quintals: '0',
  gunny_old: '0',
  gunny_new: '0',
  price_per_quintal: '',
  amount_paid: '0',
  notes: '',
})

export function IkpIntakePage() {
  const { notify } = useToast()
  const { seasonId, seasonLoading, isSeasonClosed } = useSeasonScope()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<IkpPaddyIntake[]>([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const paymentPreview = useMemo(() => {
    const q = ikpTotalQuintals(Number(form.grade_a_quintals), Number(form.common_quintals))
    const p = Number(form.price_per_quintal)
    const paid = Number(form.amount_paid) || 0
    if (!Number.isFinite(q) || q <= 0 || !Number.isFinite(p)) {
      return { total_price: 0, due_amount: 0 }
    }
    return farmerPaddyTotals(q, p, paid)
  }, [form.grade_a_quintals, form.common_quintals, form.price_per_quintal, form.amount_paid])

  const load = useCallback(async () => {
    if (!seasonId) {
      setRows([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('ikp_paddy_intakes')
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
      [r.center_name, r.vehicle_number, r.truck_sheet_number].join(' ').toLowerCase().includes(q),
    )
  }, [rows, search])

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, r) => ({
        gradeA: acc.gradeA + Number(r.grade_a_quintals),
        common: acc.common + Number(r.common_quintals),
        gunny: acc.gunny + Number(r.gunny_old) + Number(r.gunny_new),
        due: acc.due + Number(r.due_amount ?? 0),
        total: acc.total + Number(r.total_price ?? 0),
      }),
      { gradeA: 0, common: 0, gunny: 0, due: 0, total: 0 },
    )
  }, [filtered])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  function openEdit(row: IkpPaddyIntake) {
    setEditingId(row.id)
    setForm({
      intake_date: row.intake_date,
      vehicle_number: row.vehicle_number,
      truck_sheet_number: row.truck_sheet_number,
      center_name: row.center_name,
      grade_a_bags: String(row.grade_a_bags),
      grade_a_quintals: String(row.grade_a_quintals),
      common_bags: String(row.common_bags),
      common_quintals: String(row.common_quintals),
      gunny_old: String(row.gunny_old),
      gunny_new: String(row.gunny_new),
      price_per_quintal: String(row.price_per_quintal ?? 0),
      amount_paid: String(row.amount_paid ?? 0),
      notes: row.notes,
    })
    setModalOpen(true)
  }

  function parsePayload(form: FormState) {
    const grade_a_quintals = Number(form.grade_a_quintals) || 0
    const common_quintals = Number(form.common_quintals) || 0
    const totalQ = ikpTotalQuintals(grade_a_quintals, common_quintals)
    const price = Number(form.price_per_quintal) || 0
    const paid = Number(form.amount_paid) || 0
    const { total_price, due_amount } = farmerPaddyTotals(totalQ, price, paid)

    return {
      intake_date: form.intake_date,
      vehicle_number: form.vehicle_number.trim(),
      truck_sheet_number: form.truck_sheet_number.trim(),
      center_name: form.center_name.trim(),
      grade_a_bags: Number(form.grade_a_bags) || 0,
      grade_a_quintals,
      common_bags: Number(form.common_bags) || 0,
      common_quintals,
      gunny_old: Number(form.gunny_old) || 0,
      gunny_new: Number(form.gunny_new) || 0,
      price_per_quintal: price,
      total_price,
      amount_paid: paid,
      due_amount,
      notes: form.notes.trim(),
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!seasonId) return
    if (isSeasonClosed) {
      notify('This season is closed. Entries cannot be changed.', 'error')
      return
    }
    const payload = parsePayload(form)
    if (!payload.center_name) {
      notify('Center name is required.', 'error')
      return
    }
    if (!ikpHasQuantity(payload)) {
      notify('Enter bags or quintals for Grade A or Common paddy.', 'error')
      return
    }
    if (payload.amount_paid > payload.total_price + 0.009) {
      notify('Amount paid cannot exceed total amount.', 'error')
      return
    }

    setSaving(true)
    const { error } = editingId
      ? await supabase.from('ikp_paddy_intakes').update(payload).eq('id', editingId)
      : await supabase.from('ikp_paddy_intakes').insert({ ...payload, season_id: seasonId })
    setSaving(false)

    if (error) {
      notify(error.message, 'error')
      return
    }
    notify(editingId ? 'Record updated.' : 'IKP/PACS intake saved.')
    setModalOpen(false)
    load()
  }

  async function handleDelete(id: string) {
    if (isSeasonClosed) {
      notify('This season is closed. Entries cannot be deleted.', 'error')
      return
    }
    if (!window.confirm('Delete this IKP/PACS intake record?')) return
    const { error } = await supabase.from('ikp_paddy_intakes').delete().eq('id', id)
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
      loadingMessage="Loading IKP/PACS intake…"
    >
    <div className="space-y-6">
      <PageHeader
        title="IKP / PACS intake"
        description="Paddy received from centres — Grade A & Common quantities and gunny (old / new)."
        action={
          <Button onClick={openCreate} disabled={isSeasonClosed}>
            <Plus className="h-4 w-4" />
            New intake
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="!p-4">
          <p className="text-xs font-medium uppercase text-forest-500">Grade A (qtl)</p>
          <p className="mt-1 text-xl font-bold text-forest-900">{totals.gradeA.toFixed(3)} Q</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-medium uppercase text-forest-500">Common (qtl)</p>
          <p className="mt-1 text-xl font-bold text-forest-900">{totals.common.toFixed(3)} Q</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-medium uppercase text-forest-500">Gunny (old+new)</p>
          <p className="mt-1 text-xl font-bold text-forest-900">{totals.gunny}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-medium uppercase text-forest-500">Total amount</p>
          <p className="mt-1 text-xl font-bold text-forest-900">{formatINR(totals.total)}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-medium uppercase text-forest-500">Total due</p>
          <p className="mt-1 text-xl font-bold text-amber-800">{formatINR(totals.due)}</p>
        </Card>
      </div>

      <Card>
        <div className="mb-4 relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-forest-400" />
          <Input
            label="Search"
            className="pl-9"
            placeholder="Center, vehicle, truck sheet…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-forest-500">No IKP/PACS intake records yet.</p>
          ) : (
            filtered.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-forest-100 bg-ivory-50/60 p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-forest-900">{r.center_name}</p>
                    <p className="text-sm text-forest-600">
                      {formatDate(r.intake_date)} · Vehicle {r.vehicle_number || '—'} · Sheet{' '}
                      {r.truck_sheet_number || '—'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" className="!py-2" onClick={() => openEdit(r)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      className="!py-2 text-red-600"
                      onClick={() => handleDelete(r.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-emerald-100 bg-white p-3">
                    <p className="text-xs font-semibold uppercase text-emerald-800">Grade A</p>
                    <p className="mt-1 text-sm text-forest-800">
                      <span className="font-medium">{r.grade_a_bags}</span> bags ·{' '}
                      <span className="font-medium">{Number(r.grade_a_quintals).toFixed(3)}</span> quintals
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-100 bg-white p-3">
                    <p className="text-xs font-semibold uppercase text-amber-800">Common</p>
                    <p className="mt-1 text-sm text-forest-800">
                      <span className="font-medium">{r.common_bags}</span> bags ·{' '}
                      <span className="font-medium">{Number(r.common_quintals).toFixed(3)}</span> quintals
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <span className="rounded-full bg-forest-100 px-3 py-1 text-forest-800">
                    Gunny old: <strong>{r.gunny_old}</strong>
                  </span>
                  <span className="rounded-full bg-forest-100 px-3 py-1 text-forest-800">
                    Gunny new: <strong>{r.gunny_new}</strong>
                  </span>
                  <span className="rounded-full bg-gold-100 px-3 py-1 text-forest-900">
                    Amount: <strong>{formatINR(Number(r.total_price ?? 0))}</strong>
                  </span>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">
                    Due: <strong>{formatINR(Number(r.due_amount ?? 0))}</strong>
                  </span>
                </div>
                {r.notes ? <p className="mt-2 text-xs text-forest-500">Note: {r.notes}</p> : null}
              </div>
            ))
          )}
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title={editingId ? 'Edit IKP/PACS intake' : 'New IKP/PACS intake'}
        onClose={() => setModalOpen(false)}
        wide
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-700">Centre & transport</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Input
                label="Date"
                type="date"
                required
                value={form.intake_date}
                onChange={(e) => setForm((f) => ({ ...f, intake_date: e.target.value }))}
              />
              <Input
                label="Center name (IKP / PACS)"
                required
                value={form.center_name}
                onChange={(e) => setForm((f) => ({ ...f, center_name: e.target.value }))}
              />
              <Input
                label="Vehicle number"
                value={form.vehicle_number}
                onChange={(e) => setForm((f) => ({ ...f, vehicle_number: e.target.value }))}
              />
              <Input
                label="Truck sheet number"
                value={form.truck_sheet_number}
                onChange={(e) => setForm((f) => ({ ...f, truck_sheet_number: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-700">Paddy type — Grade A</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Input
                label="Bags"
                type="number"
                min="0"
                value={form.grade_a_bags}
                onChange={(e) => setForm((f) => ({ ...f, grade_a_bags: e.target.value }))}
              />
              <Input
                label="Quintals"
                type="number"
                min="0"
                step="0.001"
                value={form.grade_a_quintals}
                onChange={(e) => setForm((f) => ({ ...f, grade_a_quintals: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-700">Paddy type — Common</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Input
                label="Bags"
                type="number"
                min="0"
                value={form.common_bags}
                onChange={(e) => setForm((f) => ({ ...f, common_bags: e.target.value }))}
              />
              <Input
                label="Quintals"
                type="number"
                min="0"
                step="0.001"
                value={form.common_quintals}
                onChange={(e) => setForm((f) => ({ ...f, common_quintals: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-700">Gunny detail</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Input
                label="Old gunny (count)"
                type="number"
                min="0"
                value={form.gunny_old}
                onChange={(e) => setForm((f) => ({ ...f, gunny_old: e.target.value }))}
              />
              <Input
                label="New gunny (count)"
                type="number"
                min="0"
                value={form.gunny_new}
                onChange={(e) => setForm((f) => ({ ...f, gunny_new: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-700">Payment</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Input
                label="Price per quintal (₹) — total qtl (Grade A + Common)"
                type="number"
                min="0"
                step="0.01"
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
            <div className="mt-3">
              <PaymentSummary
                total={paymentPreview.total_price}
                due={paymentPreview.due_amount}
              />
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
