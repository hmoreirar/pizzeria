import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getAdminProducts } from '../../admin/api'
import { formatPrice } from '../../lib/format'
import type { Product } from '../../types'

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminProducts()
      .then(setProducts)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error loading'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-500">Loading…</p>
  if (error) return <p className="text-accent">{error}</p>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">Products</h1>
        <Link
          to="/admin/products/new"
          className="rounded-xl bg-brand px-4 py-2 font-semibold text-white"
        >
          + New product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500">No products.</p>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between gap-2 rounded-xl bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                {product.image ? (
                  <img src={product.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cream text-xs">
                    Pizza
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.categoryName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-brand">{formatPrice(product.price)}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    product.active ? 'bg-leaf/15 text-leaf' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {product.active ? 'Active' : 'Inactive'}
                </span>
                <Link
                  to={`/admin/products/${product.id}`}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
