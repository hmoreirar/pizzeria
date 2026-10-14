import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useCart } from '../cart/cart'
import { formatPrice } from '../lib/format'

// Persistent cart access on mobile (spec section 9).
export function MobileCartBar() {
  const { itemCount, subtotal } = useCart()
  const { t } = useTranslation()

  if (itemCount === 0) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-black/10 bg-white p-3 shadow-lg sm:hidden">
      <Link
        to="/cart"
        className="flex w-full items-center justify-between rounded-xl bg-accent px-4 py-3 font-semibold text-white"
      >
        <span>
          {t('cart.label')} · {t('cart.items', { count: itemCount })}
        </span>
        <span>{formatPrice(subtotal)} · {t('cart.view')}</span>
      </Link>
    </div>
  )
}
