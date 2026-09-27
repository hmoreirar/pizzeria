import { formatPrice } from '../lib/format'
import type { Product } from '../types'

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="h-40 w-full bg-gray-100 flex items-center justify-center text-5xl">
          🍕
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-gray-500 mt-1">{product.description}</p>
        )}
        <p className="font-bold text-gray-900 mt-3">{formatPrice(product.price)}</p>
      </div>
    </article>
  )
}
