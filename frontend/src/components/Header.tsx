import { Link } from 'react-router'
import { useCart } from '../cart/cart'
import { formatPrice } from '../lib/format'

export function Header() {
  const { itemCount, subtotal } = useCart()

  return (
    <header className="sticky top-0 z-10 bg-brand text-white shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-extrabold tracking-tight">
          🍕 Pizzería
        </Link>
        <Link
          to="/carrito"
          className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold"
        >
          <span aria-hidden>🛒</span>
          <span>{itemCount > 0 ? `${itemCount} · ${formatPrice(subtotal)}` : 'Carrito'}</span>
        </Link>
      </div>
    </header>
  )
}
