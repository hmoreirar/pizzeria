import { useEffect, useState } from 'react'
import { getCategories, getProducts } from '../api'
import { Header } from '../components/Header'
import { CategoryFilter } from '../components/CategoryFilter'
import { MobileCartBar } from '../components/MobileCartBar'
import { ProductCard } from '../components/ProductCard'
import type { Category, Product } from '../types'

function scrollToMenu() {
  document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <img src="/images/hero.jpg" alt="" className="h-[62vh] min-h-[420px] w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto w-full max-w-5xl px-4">
          <div className="max-w-xl">
            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              Hot, fresh pizza delivered to your door
            </h1>
            <p className="mt-3 text-lg text-white/90">
              Order online in minutes. Pick your size, add toppings, done.
            </p>
            <button
              type="button"
              onClick={scrollToMenu}
              className="mt-6 rounded-xl bg-accent px-8 py-3.5 text-lg font-bold text-white shadow-lg transition-colors hover:bg-accent-dark"
            >
              Order now
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError('Could not load the menu.'))
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    getProducts(selectedCategory ?? undefined)
      .then(setProducts)
      .catch(() => setError('Could not load the products.'))
      .finally(() => setLoading(false))
  }, [selectedCategory])

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />

      <main id="menu" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-8">
        <h2 className="mb-1 text-2xl font-extrabold text-gray-900">Choose your favorites</h2>
        <p className="mb-6 text-gray-500">We deliver it right to your door.</p>

        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {error && <p className="mb-4 text-accent">{error}</p>}

        {loading ? (
          <p className="mt-6 text-gray-500">Loading…</p>
        ) : products.length === 0 ? (
          <p className="mt-6 text-gray-500">No products available.</p>
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
