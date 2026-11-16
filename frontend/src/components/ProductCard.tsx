import { Link } from 'react-router'
import { useCart } from '../cart/cart'
import { formatPrice, formatFromPrice } from '../lib/format'
import { useToast } from './toast-context'
import type { Product } from '../types'

const addButtonClass =
  'mt-3 rounded-lg border border-brand px-4 py-2 text-center font-semibold text-brand transition-colors hover:bg-brand hover:text-white'

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const showToast = useToast()

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      unitPrice: product.price,
      quantity: 1,
      options: [],
    })
    showToast('Añadido al carrito')
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-black/5 bg-white">
      {product.image ? (
        <img src={product.image} alt={product.name} className="h-40 w-full object-cover" />
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-cream text-sm text-gray-400">Pizza</div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-gray-900">{product.name}</h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">{product.description}</p>
        )}

        <p className="mt-3 text-base font-bold text-brand">
          {product.configurable ? formatFromPrice(product.price) : formatPrice(product.price)}
        </p>

        {product.configurable ? (
          <Link to={`/product/${product.id}`} className={addButtonClass}>
            Añadir al carrito
          </Link>
        ) : (
          <button type="button" onClick={handleAdd} className={addButtonClass}>
            Añadir al carrito
          </button>
        )}
      </div>
    </article>
  )
}
