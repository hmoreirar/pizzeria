import { useEffect, useState } from 'react'
import { getCategories, getProducts } from '../api'
import { Header } from '../components/Header'
import { MobileCartBar } from '../components/MobileCartBar'
import { ProductCard } from '../components/ProductCard'
import type { Category, Product } from '../types'

const TAGLINES: Record<string, string> = {
  Pizzas: 'Handcrafted, stone-baked to order.',
  Combos: 'Feasts made for sharing.',
  Sides: 'The perfect companions.',
  Drinks: 'Cold and refreshing.',
  Deals: 'Great value, for a limited time.',
}

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
            <p className="text-sm font-bold uppercase tracking-widest text-ember">Pizza House</p>
            <h1 className="mt-2 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              Hot, fresh pizza delivered to your door
            </h1>
            <p className="mt-3 text-lg text-white/90">
              Stone-baked, premium ingredients. Order online in minutes.
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

function CategoryNav({ categories }: { categories: Category[] }) {
  return (
    <nav className="sticky top-14 z-20 border-b border-black/10 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-3">
        {categories.map((c) => (
          <a
            key={c.id}
            href={`#cat-${c.id}`}
            className="shrink-0 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-brand shadow-sm transition-colors hover:bg-brand hover:text-white"
          >
            {c.name}
          </a>
        ))}
      </div>
    </nav>
  )
}

export function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getCategories(), getProducts()])
      .then(([cats, prods]) => {
        setCategories(cats)
        setProducts(prods)
      })
      .catch(() => setError('Could not load the menu.'))
      .finally(() => setLoading(false))
  }, [])

  const sections = categories.map((category) => ({
    category,
    products: products.filter((p) => p.categoryId === category.id),
  }))

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      {categories.length > 0 && <CategoryNav categories={categories} />}

      <main id="menu" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-10">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Our Menu</h2>
          <p className="mt-1 text-gray-500">Choose your favorites. We deliver to your door.</p>
        </div>

        {error && <p className="mb-4 text-accent">{error}</p>}

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : (
          sections.map(({ category, products: items }) => (
            <section key={category.id} id={`cat-${category.id}`} className="mb-12 scroll-mt-28">
              <div className="mb-6">
                <h3 className="text-2xl font-extrabold text-gray-900">{category.name}</h3>
                {TAGLINES[category.name] && (
                  <p className="mt-1 text-gray-500">{TAGLINES[category.name]}</p>
                )}
                <div className="mt-3 h-1 w-16 rounded bg-accent" />
              </div>

              {items.length === 0 ? (
                <p className="text-gray-400">No products in this section.</p>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </section>
          ))
        )}
      </main>

      <MobileCartBar />
    </div>
  )
}
