import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatDate, toInputDate } from '../../lib/format'
import { useToast } from '../../contexts/ToastContext'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Textarea } from '../../components/ui/Textarea'
import type { GunnyDispatch } from '../../types/database'
import { useSeasonScope } from '../../hooks/useSeasonScope'
import { SeasonPageShell } from '../../components/SeasonPageShell'

interface FormState {
  dispatch_date: string
  ppc_center_name: string
  mandal: string
  gunny_count: string
  notes: string
}

const emptyForm = (): FormState => ({
  dispatch_date: toInputDate(),
  ppc_center_name: '',
  mandal: '',
  gunny_count: '',
  notes: '',
})

export function GunnyDispatchPage() {
  const { notify } = useToast()
  const { seasonId, seasonLoading, isSeasonClosed } = useSeasonScope()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<GunnyDispatch[]>([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!seasonId) {
      setRows([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('gunny_dispatches')
      .select('*')
      .eq('season_id', seasonId)
      .order('dispatch_date', { ascending: false })

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
      [r.ppc_center_name, r.mandal].join(' ').toLowerCase().includes(q),
    )
  }, [rows, search])

  const totalGunnies = useMemo(
    () => filtered.reduce((sum, r) => sum + Number(r.gunny_count), 0),
    [filtered],
  )

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  function openEdit(row: GunnyDispatch) {
    setEditingId(row.id)
    setForm({
      dispatch_date: row.dispatch_date,
      ppc_center_name: row.ppc_center_name,
      mandal: row.mandal,
      gunny_count: String(row.gunny_count),
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
    const count = Number(form.gunny_count)
    if (!form.ppc_center_name.trim()) {
      notify('PPC center name is required.', 'error')
      return
    }
    if (!Number.isFinite(count) || count <= 0) {
      notify('Enter number of gunnies (greater than zero).', 'error')
      return
    }

    const payload = {
      dispatch_date: form.dispatch_date,
      ppc_center_name: form.ppc_center_name.trim(),
      mandal: form.mandal.trim(),
      gunny_count: count,
      notes: form.notes.trim(),
    }

    setSaving(true)
    const { error } = editingId
      ? await supabase.from('gunny_dispatches').update(payload).eq('id', editingId)
      : await supabase.from('gunny_dispatches').insert({ ...payload, season_id: seasonId })
    setSaving(false)

    if (error) {
      notify(error.message, 'error')
      return
    }
    notify(editingId ? 'Record updated.' : 'Gunny dispatch saved.')
    setModalOpen(false)
    load()
  }

  async function handleDelete(id: string) {
    if (isSeasonClosed) {
      notify('This season is closed. Entries cannot be deleted.', 'error')
      return
    }
    if (!window.confirm('Delete this gunny dispatch record?')) return
    const { error } = await supabase.from('gunny_dispatches').delete().eq('id', id)
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
      loadingMessage="Loading gunny dispatch…"
    >
    <div className="space-y-6">
      <PageHeader
        title="Gunny to IKP / PPC centres"
        description="Track empty gunny bags sent out to centres — date, centre, mandal & count."
        action={
          <Button onClick={openCreate} disabled={isSeasonClosed}>
            <Plus className="h-4 w-4" />
            New dispatch
          </Button>
        }
      />

      <Card className="!p-4 max-w-sm">
        <p className="text-xs font-medium uppercase text-forest-500">Total gunnies (filtered)</p>
        <p className="mt-1 text-2xl font-bold text-forest-900">{totalGunnies}</p>
      </Card>

      <Card>
        <div className="mb-4 relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-forest-400" />
          <Input
            label="Search"
            className="pl-9"
            placeholder="Centre or mandal…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-forest-100 text-forest-600">
                <th className="pb-3 pr-3 font-medium">Date</th>
                <th className="pb-3 pr-3 font-medium">PPC centre</th>
                <th className="pb-3 pr-3 font-medium">Mandal</th>
                <th className="pb-3 pr-3 font-medium text-right">No. of gunnies</th>
                <th className="pb-3 pr-3 font-medium">Notes</th>
                <th className="pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-forest-500">
                    No gunny dispatch records yet.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-forest-50 hover:bg-ivory-100/50">
                    <td className="py-3 pr-3">{formatDate(r.dispatch_date)}</td>
                    <td className="py-3 pr-3 font-medium">{r.ppc_center_name}</td>
                    <td className="py-3 pr-3">{r.mandal || '—'}</td>
                    <td className="py-3 pr-3 text-right font-semibold">{r.gunny_count}</td>
                    <td className="py-3 pr-3 max-w-[200px] truncate">{r.notes || '—'}</td>
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
        title={editingId ? 'Edit gunny dispatch' : 'New gunny dispatch'}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Date"
            type="date"
            required
            value={form.dispatch_date}
            onChange={(e) => setForm((f) => ({ ...f, dispatch_date: e.target.value }))}
          />
          <Input
            label="PPC center name"
            required
            value={form.ppc_center_name}
            onChange={(e) => setForm((f) => ({ ...f, ppc_center_name: e.target.value }))}
          />
          <Input
            label="Mandal"
            value={form.mandal}
            onChange={(e) => setForm((f) => ({ ...f, mandal: e.target.value }))}
          />
          <Input
            label="No. of gunnies"
            type="number"
            min="1"
            required
            value={form.gunny_count}
            onChange={(e) => setForm((f) => ({ ...f, gunny_count: e.target.value }))}
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
    </SeasonPageShell>
  )
}
