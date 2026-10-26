import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDate, formatINR, toInputDate } from '../lib/format'
import { PAYMENT_MODES } from '../lib/constants'
import { useToast } from '../contexts/ToastContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Textarea } from '../components/ui/Textarea'
import { Modal } from '../components/ui/Modal'
import type { Category, ExpenseWithCategory, PaymentMode } from '../types/database'
import { useSeasonScope } from '../hooks/useSeasonScope'
import { SeasonPageShell } from '../components/SeasonPageShell'
import { SeasonPageHeader } from '../components/SeasonPageHeader'
import { usePageLoad } from '../hooks/usePageLoad'
import { TableShell } from '../components/ui/TableShell'
import { navigateAfterCreate } from '../lib/navigateSuccess'

interface ExpenseForm {
  expense_date: string
  category_id: string
  description: string
  paid_to: string
  payment_mode: PaymentMode
  amount: string
}

const emptyForm = (): ExpenseForm => ({
  expense_date: toInputDate(),
  category_id: '',
  description: '',
  paid_to: '',
  payment_mode: 'Cash',
  amount: '',
})

export function ExpensesPage() {
  const { notify } = useToast()
  const navigate = useNavigate()
  const { seasonId, seasonLoading, isSeasonClosed } = useSeasonScope()
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [modeFilter, setModeFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ExpenseForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!seasonId) {
      setExpenses([])
      return null
    }
    const [expRes, catRes] = await Promise.all([
      supabase
        .from('expenses')
        .select('*, categories(name)')
        .eq('season_id', seasonId)
        .order('expense_date', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ])

    if (expRes.error) return expRes.error.message
    setExpenses((expRes.data ?? []) as ExpenseWithCategory[])

    if (catRes.error) return catRes.error.message
    setCategories(catRes.data ?? [])
    return null
  }, [seasonId])

  const { loading, error: loadError, reload } = usePageLoad(load, !seasonLoading && Boolean(seasonId))

  const activeCategories = useMemo(
    () => categories.filter((c) => c.is_active),
    [categories],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return expenses.filter((e) => {
      if (categoryFilter && e.category_id !== categoryFilter) return false
      if (modeFilter && e.payment_mode !== modeFilter) return false
      if (!q) return true
      const hay = [
        e.description,
        e.paid_to,
        e.categories?.name,
        e.payment_mode,
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [expenses, search, categoryFilter, modeFilter])

  function openCreate() {
    setEditingId(null)
    const firstCat = activeCategories[0]?.id ?? ''
    setForm({ ...emptyForm(), category_id: firstCat })
    setModalOpen(true)
  }

  function openEdit(expense: ExpenseWithCategory) {
    setEditingId(expense.id)
    setForm({
      expense_date: expense.expense_date,
      category_id: expense.category_id,
      description: expense.description,
      paid_to: expense.paid_to,
      payment_mode: expense.payment_mode,
      amount: String(expense.amount),
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
    const amount = Number(form.amount)
    if (!form.category_id) {
      notify('Please select a category.', 'error')
      return
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      notify('Enter a valid amount greater than zero.', 'error')
      return
    }

    setSaving(true)
    const payload = {
      expense_date: form.expense_date,
      category_id: form.category_id,
      description: form.description.trim(),
      paid_to: form.paid_to.trim(),
      payment_mode: form.payment_mode,
      amount,
      ...(editingId ? {} : { season_id: seasonId }),
    }

    const { error } = editingId
      ? await supabase.from('expenses').update(payload).eq('id', editingId)
      : await supabase.from('expenses').insert(payload)

    setSaving(false)

    if (error) {
      notify(error.message, 'error')
      return
    }

    setModalOpen(false)
    if (editingId) {
      notify('Expense updated.')
      reload()
    } else {
      navigateAfterCreate(navigate, {
        title: 'Expense recorded',
        message: `${formatINR(amount)} logged for this season.`,
        returnTo: '/expenses',
        returnLabel: 'View expenses',
        listTo: '/home',
        listLabel: 'Back to home',
      })
    }
  }

  async function handleDelete(id: string) {
    if (isSeasonClosed) {
      notify('This season is closed. Entries cannot be deleted.', 'error')
      return
    }
    if (!window.confirm('Delete this expense permanently?')) return
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) {
      notify(error.message, 'error')
      return
    }
    notify('Expense deleted.')
    reload()
  }

  return (
    <SeasonPageShell
      seasonLoading={seasonLoading}
      seasonId={seasonId}
      loading={loading}
      error={loadError}
      onRetry={reload}
      loadingMessage="Loading expenses…"
    >
    <div className="space-y-6">
      <SeasonPageHeader
        title="Expenses"
        description="Track daily mill spending"
        action={
          <Button onClick={openCreate} disabled={isSeasonClosed}>
            <Plus className="h-4 w-4" />
            Add expense
          </Button>
        }
      />

      <Card>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <div className="relative md:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-forest-400" />
            <Input
              label="Search"
              className="pl-9"
              placeholder="Description, party, category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            label="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{!c.is_active ? ' (inactive)' : ''}</option>
            ))}
          </Select>
          <Select
            label="Payment mode"
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
          >
            <option value="">All modes</option>
            {PAYMENT_MODES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Select>
        </div>

        <TableShell>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-forest-100 text-forest-600">
                <th className="pb-3 pr-3 font-medium">Date</th>
                <th className="pb-3 pr-3 font-medium">Category</th>
                <th className="pb-3 pr-3 font-medium">Description</th>
                <th className="pb-3 pr-3 font-medium">Paid to</th>
                <th className="pb-3 pr-3 font-medium">Mode</th>
                <th className="pb-3 pr-3 text-right font-medium">Amount</th>
                <th className="pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-forest-500">
                    No expenses match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.id} className="border-b border-forest-50 hover:bg-ivory-100/60">
                    <td className="py-3 pr-3">{formatDate(e.expense_date)}</td>
                    <td className="py-3 pr-3">{e.categories?.name}</td>
                    <td className="py-3 pr-3 max-w-[200px] truncate">{e.description || '—'}</td>
                    <td className="py-3 pr-3">{e.paid_to || '—'}</td>
                    <td className="py-3 pr-3">{e.payment_mode}</td>
                    <td className="py-3 pr-3 text-right font-semibold">{formatINR(Number(e.amount))}</td>
                    <td className="py-3 text-right">
                      <div className="inline-flex gap-1">
                        <Button variant="ghost" className="!px-2 !py-2" onClick={() => openEdit(e)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" className="!px-2 !py-2 text-red-600" onClick={() => handleDelete(e.id)} aria-label="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableShell>
      </Card>

      <Modal
        open={modalOpen}
        title={editingId ? 'Edit expense' : 'Add expense'}
        onClose={() => setModalOpen(false)}
        wide
      >
        <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Date"
            type="date"
            required
            value={form.expense_date}
            onChange={(e) => setForm((f) => ({ ...f, expense_date: e.target.value }))}
          />
          <Select
            label="Category"
            required
            value={form.category_id}
            onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
          >
            <option value="">Select category</option>
            {activeCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Input
            label="Paid to"
            value={form.paid_to}
            onChange={(e) => setForm((f) => ({ ...f, paid_to: e.target.value }))}
          />
          <Select
            label="Payment mode"
            value={form.payment_mode}
            onChange={(e) =>
              setForm((f) => ({ ...f, payment_mode: e.target.value as PaymentMode }))
            }
          >
            {PAYMENT_MODES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Select>
          <Input
            label="Amount (₹)"
            type="number"
            min="0"
            step="0.01"
            required
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingId ? 'Save changes' : 'Add expense'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
    </SeasonPageShell>
  )
}
