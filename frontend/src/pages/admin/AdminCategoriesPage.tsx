import { useEffect, useState, type FormEvent } from 'react'
import {
  getAdminCategories,
  createCategory,
  updateCategory,
} from '../../admin/api'
import type { Category } from '../../types'

const inputClass =
  'mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-brand focus:outline-none'

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // New category form.
  const [name, setName] = useState('')
  const [sortOrder, setSortOrder] = useState('0')
  const [active, setActive] = useState(true)

  const load = () =>
    getAdminCategories()
      .then(setCategories)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error loading'))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await createCategory({ name: name.trim(), sortOrder: Number(sortOrder) || 0, active })
      setName('')
      setSortOrder('0')
      setActive(true)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create.')
    }
  }

  async function toggle(cat: Category) {
    await updateCategory(cat.id, {
      name: cat.name,
      sortOrder: cat.sortOrder,
      active: !cat.active,
    })
    load()
  }

  if (loading) return <p className="text-gray-500">Loading…</p>
  if (error) return <p className="text-accent">{error}</p>

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-gray-900">Categories</h1>

      <form onSubmit={handleCreate} className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-40 flex-1">
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="w-24">
            <label className="text-sm font-medium text-gray-700">Sort order</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="accent-brand"
            />
            Active
          </label>
          <button type="submit" className="rounded-xl bg-brand px-4 py-2 font-semibold text-white">
            + Add
          </button>
        </div>
      </form>

      {categories.length === 0 ? (
        <p className="text-gray-500">No categories.</p>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between gap-2 rounded-xl bg-white px-4 py-3 shadow-sm"
            >
              <div>
                <p className="font-semibold text-gray-900">{cat.name}</p>
                <p className="text-xs text-gray-500">Sort: {cat.sortOrder}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    cat.active ? 'bg-leaf/15 text-leaf' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {cat.active ? 'Active' : 'Inactive'}
                </span>
                <button
                  type="button"
                  onClick={() => toggle(cat)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  {cat.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
