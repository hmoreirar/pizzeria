import { Link } from 'react-router'
import { useCart } from '../cart/cart'
import { formatPrice } from '../lib/format'

export function Header() {
  const { itemCount, subtotal } = useCart()

  return (
    <header className="sticky top-0 z-10 bg-brand text-white shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-extrabold tracking-tight">
          Pizza House
        </Link>
        <Link
          to="/cart"
          className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span>{itemCount > 0 ? `${itemCount} · ${formatPrice(subtotal)}` : 'Cart'}</span>
        </Link>
      </div>
    </header>
  )
}
