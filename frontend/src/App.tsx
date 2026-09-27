import { useEffect, useState } from 'react'
import { getCategories, getProducts } from './api'
import { CategoryFilter } from './components/CategoryFilter'
import { ProductCard } from './components/ProductCard'
import type { Category, Product } from './types'

export default function App() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError('No se pudo cargar el catálogo.'))
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    getProducts(selectedCategory ?? undefined)
      .then(setProducts)
      .catch(() => setError('No se pudieron cargar los productos.'))
      .finally(() => setLoading(false))
  }, [selectedCategory])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">🍕 Pizzería</h1>
        <p className="text-gray-500">Elegí lo que quieras, lo llevamos a tu casa.</p>
      </header>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {loading ? (
        <p className="text-gray-500 mt-6">Cargando…</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500 mt-6">No hay productos disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
