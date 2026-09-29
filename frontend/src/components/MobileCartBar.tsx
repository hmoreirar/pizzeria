import { Link } from 'react-router'
import { useCart } from '../cart/cart'
import { formatPrice } from '../lib/format'

// Acceso persistente al carrito en móvil (especificación §9).
export function MobileCartBar() {
  const { itemCount, subtotal } = useCart()

  if (itemCount === 0) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-black/10 bg-white p-3 shadow-lg sm:hidden">
      <Link
        to="/carrito"
        className="flex w-full items-center justify-between rounded-xl bg-accent px-4 py-3 font-semibold text-white"
      >
        <span>
          🛒 {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
        </span>
        <span>
          {formatPrice(subtotal)} · Ver carrito →
        </span>
      </Link>
    </div>
  )
}
