import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { getProduct } from '../api'
import { useCart, type CartItemOption } from '../cart/cart'
import { MobileCartBar } from '../components/MobileCartBar'
import { formatPrice } from '../lib/format'
import type { ProductDetail } from '../types'

export function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // groupId -> selected optionId (single-select groups for now).
  const [selected, setSelected] = useState<Record<number, number>>({})
  const [quantity, setQuantity] = useState(1)

  const load = useCallback(() => {
    const productId = Number(id)
    if (!Number.isInteger(productId) || productId <= 0) {
      setError('Invalid product.')
      setLoading(false)
      return
    }
    getProduct(productId)
      .then((p) => {
        setProduct(p)
        // Preselect the first option of each group (lowest price).
        const initial: Record<number, number> = {}
        for (const g of p.optionGroups) {
          if (g.options.length > 0) initial[g.id] = g.options[0].id
        }
        setSelected(initial)
      })
      .catch(() => setError('Could not load the product.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return <p className="p-6 text-gray-500">Loading…</p>
  }

  if (error || !product) {
    return (
      <div className="p-6">
        <p className="text-accent">{error ?? 'Product not found.'}</p>
        <Link to="/" className="mt-4 inline-block font-semibold text-brand">
          ← Back to menu
        </Link>
      </div>
    )
  }

  const unitPrice =
    product.price +
    product.optionGroups.reduce((sum, group) => {
      const optionId = selected[group.id]
      if (optionId === undefined) return sum
      const option = group.options.find((o) => o.id === optionId)
      return sum + (option?.priceDelta ?? 0)
    }, 0)

  const handleAdd = () => {
    const options = product.optionGroups.flatMap((group): CartItemOption[] => {
      const optionId = selected[group.id]
      if (optionId === undefined) return []
      const option = group.options.find((o) => o.id === optionId)
      if (!option) return []
      return [
        {
          optionId: option.id,
          groupName: group.name,
          optionName: option.name,
          priceDelta: option.priceDelta,
        },
      ]
    })

    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      unitPrice,
      quantity,
      options,
    })
    navigate('/cart')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:pb-6">
      <Link to="/" className="mb-4 inline-block font-semibold text-brand">
        ← Back to menu
      </Link>

      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          className="h-56 w-full rounded-2xl object-cover"
        />
      )}

      <h1 className="mt-4 text-2xl font-extrabold text-gray-900">{product.name}</h1>
      {product.description && <p className="mt-2 text-gray-600">{product.description}</p>}

      {product.optionGroups.map((group) => (
        <fieldset key={group.id} className="mt-6">
          <legend className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">
            {group.name}
            {group.minSelect > 0 && <span className="text-accent"> *</span>}
          </legend>
          <div className="space-y-2">
            {group.options.map((option) => {
              const isSelected = selected[group.id] === option.id
              return (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 ${
                    isSelected ? 'border-brand bg-brand/5' : 'border-gray-200 bg-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`group-${group.id}`}
                      checked={isSelected}
                      onChange={() =>
                        setSelected((prev) => ({ ...prev, [group.id]: option.id }))
                      }
                      className="accent-brand"
                    />
                    <span className="font-medium">{option.name}</span>
                  </span>
                  {option.priceDelta > 0 && (
                    <span className="text-sm font-semibold text-gray-500">
                      +{formatPrice(option.priceDelta)}
                    </span>
                  )}
                </label>
              )
            })}
          </div>
        </fieldset>
      ))}

      <div className="mt-6 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
        <span className="text-gray-600">Quantity</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-9 w-9 rounded-full border border-gray-300 text-lg font-semibold"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-6 text-center text-lg font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="h-9 w-9 rounded-full border border-gray-300 text-lg font-semibold"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
        <span className="text-gray-600">Estimated total</span>
        <span className="text-xl font-extrabold text-brand">{formatPrice(unitPrice * quantity)}</span>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="mt-4 w-full rounded-xl bg-accent py-3 font-semibold text-white transition-colors hover:bg-accent-dark"
      >
        Add to cart
      </button>

      <MobileCartBar />
    </div>
  )
}
