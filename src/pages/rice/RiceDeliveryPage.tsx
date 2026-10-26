import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatDate, formatINR, toInputDate } from '../../lib/format'
import { farmerPaddyTotals } from '../../lib/paddy'
import { PaymentSummary } from '../../components/PaymentSummary'
import { RICE_COMMUNITIES, type RiceCommunity } from '../../lib/constants'
import { useToast } from '../../contexts/ToastContext'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Modal } from '../../components/ui/Modal'
import { Textarea } from '../../components/ui/Textarea'
import type { RiceDelivery } from '../../types/database'
import { useSeasonScope } from '../../hooks/useSeasonScope'
import { SeasonPageShell } from '../../components/SeasonPageShell'

interface FormState {
  serial_no: string
  delivery_date: string
  vehicle_number: string
  way_bill_number: string
  godown_name: string
  variety: string
  community: RiceCommunity
  bags: string
  quintals: string
  consignment_number: string
  ck_serial: string
  price_per_quintal: string
  amount_paid: string
  notes: string
}

const emptyForm = (): FormState => ({
  serial_no: '',
  delivery_date: toInputDate(),
  vehicle_number: '',
  way_bill_number: '',
  godown_name: '',
  variety: '',
  community: 'B',
  bags: '',
  quintals: '',
  consignment_number: '',
  ck_serial: '',
  price_per_quintal: '',
  amount_paid: '0',
  notes: '',
})

function communityLabel(code: string) {
  return RICE_COMMUNITIES.find((c) => c.value === code)?.label ?? code
}

export function RiceDeliveryPage() {
  const { notify } = useToast()
  const { seasonId, seasonLoading, isSeasonClosed } = useSeasonScope()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<RiceDelivery[]>([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const paymentPreview = useMemo(() => {
    const q = Number(form.quintals)
    const p = Number(form.price_per_quintal)
    const paid = Number(form.amount_paid) || 0
    if (!Number.isFinite(q) || q <= 0 || !Number.isFinite(p)) {
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
      .from('rice_deliveries')
      .select('*')
      .eq('season_id', seasonId)
      .order('delivery_date', { ascending: false })
      .order('serial_no', { ascending: true })

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
      [
        r.serial_no,
        r.godown_name,
        r.variety,
        r.way_bill_number,
        r.vehicle_number,
        r.consignment_number,
        r.ck_serial,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [rows, search])

  const totals = useMemo(
    () => ({
      bags: filtered.reduce((s, r) => s + Number(r.bags), 0),
      quintals: filtered.reduce((s, r) => s + Number(r.quintals), 0),
      total: filtered.reduce((s, r) => s + Number(r.total_price ?? 0), 0),
      due: filtered.reduce((s, r) => s + Number(r.due_amount ?? 0), 0),
    }),
    [filtered],
  )

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  function openEdit(row: RiceDelivery) {
    setEditingId(row.id)
    setForm({
      serial_no: row.serial_no,
      delivery_date: row.delivery_date,
      vehicle_number: row.vehicle_number,
      way_bill_number: row.way_bill_number,
      godown_name: row.godown_name,
      variety: row.variety,
      community: row.community,
      bags: String(row.bags),
      quintals: String(row.quintals),
      consignment_number: row.consignment_number,
      ck_serial: row.ck_serial,
      price_per_quintal: String(row.price_per_quintal ?? 0),
      amount_paid: String(row.amount_paid ?? 0),
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
    const quintals = Number(form.quintals)
    const bags = Number(form.bags) || 0
    if (!Number.isFinite(quintals) || quintals <= 0) {
      notify('Enter valid quintals.', 'error')
      return
    }

    const price = Number(form.price_per_quintal) || 0
    const paid = Number(form.amount_paid) || 0
    const { total_price, due_amount } = farmerPaddyTotals(quintals, price, paid)
    if (paid > total_price + 0.009) {
      notify('Amount paid cannot exceed total amount.', 'error')
      return
    }

    const payload = {
      serial_no: form.serial_no.trim(),
      delivery_date: form.delivery_date,
      vehicle_number: form.vehicle_number.trim(),
      way_bill_number: form.way_bill_number.trim(),
      godown_name: form.godown_name.trim(),
      variety: form.variety.trim(),
      community: form.community,
      bags,
      quintals,
      consignment_number: form.consignment_number.trim(),
      ck_serial: form.ck_serial.trim(),
      price_per_quintal: price,
      total_price,
      amount_paid: paid,
      due_amount,
      notes: form.notes.trim(),
    }

    setSaving(true)
    const { error } = editingId
      ? await supabase.from('rice_deliveries').update(payload).eq('id', editingId)
      : await supabase.from('rice_deliveries').insert({ ...payload, season_id: seasonId })
    setSaving(false)

    if (error) {
      notify(error.message, 'error')
      return
    }
    notify(editingId ? 'Delivery updated.' : 'Rice delivery saved.')
    setModalOpen(false)
    load()
  }

  async function handleDelete(id: string) {
    if (isSeasonClosed) {
      notify('This season is closed. Entries cannot be deleted.', 'error')
      return
    }
    if (!window.confirm('Delete this rice delivery record?')) return
    const { error } = await supabase.from('rice_deliveries').delete().eq('id', id)
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
      loadingMessage="Loading rice deliveries…"
    >
    <div className="space-y-6">
      <PageHeader
        title="Rice delivery"
        description="Outgoing rice — godown, variety, community (B/R), consignment & CK serial."
        action={
          <Button onClick={openCreate} disabled={isSeasonClosed}>
            <Plus className="h-4 w-4" />
            New delivery
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="!p-4">
          <p className="text-xs font-medium uppercase text-forest-500">Filtered bags</p>
          <p className="mt-1 text-xl font-bold text-forest-900">{totals.bags}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-medium uppercase text-forest-500">Filtered quintals</p>
          <p className="mt-1 text-xl font-bold text-forest-900">{totals.quintals.toFixed(3)} Q</p>
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
            placeholder="Sno, godown, variety, way bill…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b border-forest-100 text-forest-600">
                <th className="pb-3 pr-2 font-medium">Sno</th>
                <th className="pb-3 pr-2 font-medium">Date</th>
                <th className="pb-3 pr-2 font-medium">Vehicle</th>
                <th className="pb-3 pr-2 font-medium">Way bill</th>
                <th className="pb-3 pr-2 font-medium">Godown</th>
                <th className="pb-3 pr-2 font-medium">Variety</th>
                <th className="pb-3 pr-2 font-medium">B/R</th>
                <th className="pb-3 pr-2 font-medium text-right">Bags</th>
                <th className="pb-3 pr-2 font-medium text-right">Qtl</th>
                <th className="pb-3 pr-2 font-medium">Consignment</th>
                <th className="pb-3 pr-2 font-medium">CK serial</th>
                <th className="pb-3 pr-2 font-medium text-right">Amount</th>
                <th className="pb-3 pr-2 font-medium text-right">Due</th>
                <th className="pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-8 text-center text-forest-500">
                    No rice delivery records yet.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-forest-50 hover:bg-ivory-100/50">
                    <td className="py-3 pr-2 font-medium">{r.serial_no || '—'}</td>
                    <td className="py-3 pr-2">{formatDate(r.delivery_date)}</td>
                    <td className="py-3 pr-2">{r.vehicle_number || '—'}</td>
                    <td className="py-3 pr-2">{r.way_bill_number || '—'}</td>
                    <td className="py-3 pr-2">{r.godown_name || '—'}</td>
                    <td className="py-3 pr-2">{r.variety || '—'}</td>
                    <td className="py-3 pr-2">{communityLabel(r.community)}</td>
                    <td className="py-3 pr-2 text-right">{r.bags}</td>
                    <td className="py-3 pr-2 text-right">{Number(r.quintals).toFixed(3)}</td>
                    <td className="py-3 pr-2">{r.consignment_number || '—'}</td>
                    <td className="py-3 pr-2">{r.ck_serial || '—'}</td>
                    <td className="py-3 pr-2 text-right">{formatINR(Number(r.total_price ?? 0))}</td>
                    <td className="py-3 pr-2 text-right font-semibold text-amber-800">
                      {formatINR(Number(r.due_amount ?? 0))}
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
        title={editingId ? 'Edit rice delivery' : 'New rice delivery'}
        onClose={() => setModalOpen(false)}
        wide
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-700">Register</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <Input
                label="Sno"
                value={form.serial_no}
                onChange={(e) => setForm((f) => ({ ...f, serial_no: e.target.value }))}
                placeholder="Serial number"
              />
              <Input
                label="Date"
                type="date"
                required
                value={form.delivery_date}
                onChange={(e) => setForm((f) => ({ ...f, delivery_date: e.target.value }))}
              />
              <Input
                label="Vehicle number"
                value={form.vehicle_number}
                onChange={(e) => setForm((f) => ({ ...f, vehicle_number: e.target.value }))}
              />
              <Input
                label="Way bill number"
                value={form.way_bill_number}
                onChange={(e) => setForm((f) => ({ ...f, way_bill_number: e.target.value }))}
              />
              <Input
                label="Godown name"
                value={form.godown_name}
                onChange={(e) => setForm((f) => ({ ...f, godown_name: e.target.value }))}
              />
              <Input
                label="Variety"
                value={form.variety}
                onChange={(e) => setForm((f) => ({ ...f, variety: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-700">Quantity & refs</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <Select
                label="Community (B / R)"
                value={form.community}
                onChange={(e) =>
                  setForm((f) => ({ ...f, community: e.target.value as RiceCommunity }))
                }
              >
                {RICE_COMMUNITIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>
              <Input
                label="Bags"
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
              <Input
                label="Consignment number"
                value={form.consignment_number}
                onChange={(e) => setForm((f) => ({ ...f, consignment_number: e.target.value }))}
              />
              <Input
                label="CK serial"
                value={form.ck_serial}
                onChange={(e) => setForm((f) => ({ ...f, ck_serial: e.target.value }))}
                className="sm:col-span-2"
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
