import { useCallback, useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useToast } from '../contexts/ToastContext'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { PageFrame } from '../components/PageFrame'
import { usePageLoad } from '../hooks/usePageLoad'
import type { Category } from '../types/database'

export function CategoriesPage() {
  const { notify } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('categories').select('*').order('name')
    if (error) return error.message
    setCategories(data ?? [])
    return null
  }, [])

  const { loading, error: loadError, reload } = usePageLoad(load, true)

  function openAdd() {
    setEditing(null)
    setName('')
    setModalOpen(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setName(cat.name)
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      notify('Category name is required.', 'error')
      return
    }

    setSaving(true)
    const { error } = editing
      ? await supabase.from('categories').update({ name: trimmed }).eq('id', editing.id)
      : await supabase.from('categories').insert({ name: trimmed })

    setSaving(false)

    if (error) {
      notify(error.message, 'error')
      return
    }

    notify(editing ? 'Category updated.' : 'Category added.')
    setModalOpen(false)
    reload()
  }

  async function toggleActive(cat: Category) {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: !cat.is_active })
      .eq('id', cat.id)

    if (error) {
      notify(error.message, 'error')
      return
    }
    notify(cat.is_active ? 'Category deactivated.' : 'Category activated.')
    reload()
  }

  return (
    <PageFrame
      status={loading ? 'loading' : loadError ? 'error' : 'ready'}
      loadingMessage="Loading categories…"
      errorMessage={loadError}
      onRetry={reload}
    >
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Deactivated categories stay on old expenses but won't appear in new entries."
        action={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add category
          </Button>
        }
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-forest-100 text-forest-600">
                <th className="pb-3 pr-3 font-medium">Name</th>
                <th className="pb-3 pr-3 font-medium">Status</th>
                <th className="pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-forest-50">
                  <td className="py-3 pr-3 font-medium">{cat.name}</td>
                  <td className="py-3 pr-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        cat.is_active
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-forest-50 text-forest-500 border-forest-200'
                      }`}
                    >
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="inline-flex flex-wrap justify-end gap-2">
                      <Button variant="secondary" className="!py-2" onClick={() => openEdit(cat)}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant={cat.is_active ? 'ghost' : 'primary'}
                        className="!py-2"
                        onClick={() => toggleActive(cat)}
                      >
                        {cat.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title={editing ? 'Edit category' : 'Add category'}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
    </PageFrame>
  )
}
