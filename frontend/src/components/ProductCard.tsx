import { Link } from 'react-router'
import { useCart } from '../cart/cart'
import { formatPrice, formatFromPrice } from '../lib/format'
import type { Product } from '../types'

const addButtonClass =
  'mt-3 rounded-xl bg-accent px-4 py-2 text-center font-semibold text-white transition-colors hover:bg-accent-dark'

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      unitPrice: product.price,
      quantity: 1,
      options: [],
    })
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
      {product.image ? (
        <img src={product.image} alt={product.name} className="h-40 w-full object-cover" />
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-cream text-5xl">🍕</div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-bold text-gray-900">{product.name}</h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">{product.description}</p>
        )}

        <p className="mt-3 text-lg font-extrabold text-brand">
          {product.configurable ? formatFromPrice(product.price) : formatPrice(product.price)}
        </p>

        {product.configurable ? (
          <Link to={`/producto/${product.id}`} className={addButtonClass}>
            Agregar
          </Link>
        ) : (
          <button type="button" onClick={handleAdd} className={addButtonClass}>
            Agregar
          </button>
        )}
      </div>
    </article>
  )
}
