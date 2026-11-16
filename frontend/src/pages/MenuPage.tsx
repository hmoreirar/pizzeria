import { useEffect, useState } from 'react'
import { getCategories, getProducts } from '../api'
import { Header } from '../components/Header'
import { MobileCartBar } from '../components/MobileCartBar'
import { ProductCard } from '../components/ProductCard'
import type { Category, Product } from '../types'

// Category taglines. Keyed by the stable placeholder category ids
// (1 Pizzas, 2 Combos, 3 Acompañamientos, 4 Bebidas, 5 Ofertas).
const TAGLINES: Record<number, string> = {
  1: 'Hechas a mano, horneadas en piedra al momento.',
  2: 'Platos para compartir.',
  3: 'Los acompañamientos perfectos.',
  4: 'Frías y refrescantes.',
  5: 'Gran valor, por tiempo limitado.',
}

function scrollToMenu() {
  document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-4 pt-8 pb-6">
      <div className="relative isolate overflow-hidden rounded-xl">
        <img
          src="/images/hero.jpg"
          alt="Pizza Margherita recién horneada"
          className="h-[280px] w-full object-cover object-center sm:h-[380px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-lg px-6 sm:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">Pizza House</p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              Pizza caliente y recién horneada a tu puerta
            </h1>
            <p className="mt-3 text-base text-white/90 sm:text-lg">
              Horneada en horno de piedra, ingredientes premium. Pide online en minutos.
            </p>
            <button
              type="button"
              onClick={scrollToMenu}
              className="mt-5 rounded-lg bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-dark"
            >
              Pedir ahora
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function CategoryNav({ categories }: { categories: Category[] }) {
  return (
    <nav className="sticky top-[52px] z-20 border-b border-black/5 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap gap-2 px-4 py-3">
        {categories.map((c) => (
          <a
            key={c.id}
            href={`#cat-${c.id}`}
            className="shrink-0 rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-brand hover:text-brand"
          >
            {c.name}
          </a>
        ))}
      </div>
    </nav>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border border-black/5 bg-white">
          <div className="h-40 w-full animate-pulse bg-cream" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-gray-100" />
            <div className="h-5 w-1/3 animate-pulse rounded bg-gray-200" />
            <div className="h-9 w-full animate-pulse rounded-lg bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
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
      .catch(() => setError('No se pudo cargar el menú.'))
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
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900">Nuestro menú</h2>
          <p className="mt-1 text-gray-500">Elige tus favoritos. Te los llevamos a tu puerta.</p>
        </div>

        {error && <p className="mb-4 text-accent">{error}</p>}

        {loading ? (
          <ProductGridSkeleton />
        ) : (
          sections.map(({ category, products: items }) => {
            const tagline = TAGLINES[category.id]

            return (
              <section key={category.id} id={`cat-${category.id}`} className="mb-12 scroll-mt-40 sm:scroll-mt-28">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                  {tagline && <p className="mt-1 text-sm text-gray-500">{tagline}</p>}
                </div>

                {items.length === 0 ? (
                  <p className="text-gray-400">Sin productos en esta sección.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                )}
              </section>
            )
          })
        )}
      </main>

      <MobileCartBar />
    </div>
  )
}
