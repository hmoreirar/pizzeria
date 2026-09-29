import { useEffect, useState } from 'react'
import { getCategories, getProducts } from '../api'
import { Header } from '../components/Header'
import { CategoryFilter } from '../components/CategoryFilter'
import { MobileCartBar } from '../components/MobileCartBar'
import { ProductCard } from '../components/ProductCard'
import type { Category, Product } from '../types'

export function MenuPage() {
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
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-6 pb-24 sm:pb-6">
        <h1 className="mb-1 text-2xl font-extrabold text-gray-900">Elegí lo que quieras</h1>
        <p className="mb-6 text-gray-500">Lo llevamos a tu casa.</p>

        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {error && <p className="mb-4 text-accent">{error}</p>}

        {loading ? (
          <p className="mt-6 text-gray-500">Cargando…</p>
        ) : products.length === 0 ? (
          <p className="mt-6 text-gray-500">No hay productos disponibles.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>

      <MobileCartBar />
    </div>
  )
}
