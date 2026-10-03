import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  getAdminProduct,
  createProduct,
  updateProduct,
  getAdminCategories,
  getOptionGroups,
  createOptionGroup,
  deleteOptionGroup,
  createOption,
  deleteOption,
  updateOption,
  updateOptionGroup,
} from '../../admin/api'
import { formatPrice } from '../../lib/format'
import type { AdminOptionGroup, Category, Product } from '../../types'

const inputClass =
  'mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-brand focus:outline-none'

export function AdminProductEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const productId = isNew ? null : Number(id)

  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState<number>(0)
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [price, setPrice] = useState('')
  const [active, setActive] = useState(true)

  const [categories, setCategories] = useState<Category[]>([])
  const [groups, setGroups] = useState<AdminOptionGroup[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadGroups = useCallback(() => {
    if (productId) {
      getOptionGroups(productId)
        .then(setGroups)
        .catch(() => setError('Could not load options.'))
    }
  }, [productId])

  useEffect(() => {
    getAdminCategories()
      .then((cats) => {
        setCategories(cats)
        if (isNew) {
          setCategoryId((prev) => (prev === 0 && cats.length > 0 ? cats[0].id : prev))
        }
      })
      .catch(() => setError('Could not load categories.'))

    if (!isNew && productId) {
      getAdminProduct(productId)
        .then((p: Product) => {
          setName(p.name)
          setCategoryId(p.categoryId)
          setDescription(p.description ?? '')
          setImage(p.image ?? '')
          setPrice(String(p.price))
          setActive(p.active)
        })
        .catch(() => setError('Could not load the product.'))
        .finally(() => setLoading(false))
      loadGroups()
    } else {
      setLoading(false)
    }
  }, [id, isNew, productId, loadGroups])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const input = {
      name,
      categoryId,
      description: description.trim() || null,
      image: image.trim() || null,
      price: Number(price),
      active,
    }
    try {
      if (isNew) {
        const created = await createProduct(input)
        navigate(`/admin/products/${created.id}`)
      } else if (productId) {
        await updateProduct(productId, input)
        setSaving(false)
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.')
      setSaving(false)
    }
  }

  if (loading) return <p className="text-gray-500">Loading…</p>

  return (
    <div>
      <Link to="/admin/products" className="mb-4 inline-block font-semibold text-brand">
        ← Back to products
      </Link>
      <h1 className="mb-6 text-2xl font-extrabold text-gray-900">
        {isNew ? 'New product' : `Edit: ${name || '…'}`}
      </h1>

      <form onSubmit={handleSave} className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              className={inputClass}
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Price (CLP)</label>
            <input
              type="number"
              min={0}
              step={1}
              className={inputClass}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              className={inputClass}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">Image URL</label>
            <input
              className={inputClass}
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="/images/… or https://…"
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="accent-brand"
            />
            Active (visible to customers)
          </label>
        </div>

        {error && <p className="mt-4 rounded-xl bg-accent/10 px-4 py-2 text-sm text-accent">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-5 rounded-xl bg-brand px-6 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save product'}
        </button>
      </form>

      {!isNew && productId && (
        <OptionsManager productId={productId} groups={groups} onChanged={loadGroups} />
      )}
    </div>
  )
}

function OptionsManager({
  productId,
  groups,
  onChanged,
}: {
  productId: number
  groups: AdminOptionGroup[]
  onChanged: () => void
}) {
  const [newGroupName, setNewGroupName] = useState('')

  async function addGroup() {
    if (!newGroupName.trim()) return
    await createOptionGroup(productId, {
      name: newGroupName.trim(),
      minSelect: 0,
      maxSelect: 1,
      sortOrder: groups.length,
      active: true,
    })
    setNewGroupName('')
    onChanged()
  }

  async function toggleGroup(group: AdminOptionGroup) {
    await updateOptionGroup(group.id, {
      name: group.name,
      minSelect: group.minSelect,
      maxSelect: group.maxSelect,
      sortOrder: group.sortOrder,
      active: !group.active,
    })
    onChanged()
  }

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-lg font-bold text-gray-900">Configuration options</h2>

      {groups.map((group) => (
        <div key={group.id} className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-900">{group.name}</p>
              <p className="text-xs text-gray-500">
                {group.minSelect}–{group.maxSelect} selection ·{' '}
                {group.active ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleGroup(group)}
                className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-600"
              >
                {group.active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                type="button"
                onClick={() => deleteOptionGroup(group.id).then(onChanged)}
                className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-semibold text-accent"
              >
                Delete group
              </button>
            </div>
          </div>

          <ul className="mt-3 space-y-1">
            {group.options.map((option) => (
              <li key={option.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-gray-700">
                  {option.name}
                  {option.priceDelta > 0 && (
                    <span className="text-gray-400"> +{formatPrice(option.priceDelta)}</span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateOption(option.id, {
                        name: option.name,
                        priceDelta: option.priceDelta,
                        sortOrder: option.sortOrder,
                        active: !option.active,
                      }).then(onChanged)
                    }
                    className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-600"
                  >
                    {option.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteOption(option.id).then(onChanged)}
                    className="text-xs font-semibold text-accent"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <AddOption groupId={group.id} sortOrder={group.options.length} onAdded={onChanged} />
        </div>
      ))}

      <div className="flex gap-2">
        <input
          className={inputClass}
          placeholder="Group name (e.g. Crust)"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
        />
        <button
          type="button"
          onClick={addGroup}
          className="shrink-0 rounded-xl bg-brand px-4 py-2 font-semibold text-white"
        >
          + Add group
        </button>
      </div>
    </section>
  )
}

function AddOption({
  groupId,
  sortOrder,
  onAdded,
}: {
  groupId: number
  sortOrder: number
  onAdded: () => void
}) {
  const [name, setName] = useState('')
  const [priceDelta, setPriceDelta] = useState('0')

  async function add() {
    if (!name.trim()) return
    await createOption(groupId, {
      name: name.trim(),
      priceDelta: Number(priceDelta) || 0,
      sortOrder,
      active: true,
    })
    setName('')
    setPriceDelta('0')
    onAdded()
  }

  return (
    <div className="mt-3 flex gap-2">
      <input
        className={inputClass}
        placeholder="New option (e.g. Extra cheese)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="number"
        min={0}
        step={1}
        className="mt-1 w-24 rounded-xl border border-gray-300 px-2 py-2"
        value={priceDelta}
        onChange={(e) => setPriceDelta(e.target.value)}
      />
      <button
        type="button"
        onClick={add}
        className="mt-1 shrink-0 rounded-xl border border-brand px-3 font-semibold text-brand"
      >
        + Add
      </button>
    </div>
  )
}
