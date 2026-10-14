import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useCart } from '../cart/cart'
import { Header } from '../components/Header'
import { formatPrice } from '../lib/format'

export function CartPage() {
  const { items, subtotal, setQuantity, removeItem } = useCart()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen pb-24 sm:pb-0">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-extrabold text-gray-900">{t('cart.title')}</h1>

        {items.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500">{t('cart.empty')}</p>
            <Link
              to="/"
              className="mt-4 inline-block rounded-xl bg-brand px-6 py-3 font-semibold text-white"
            >
              {t('common.viewMenu')}
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-cream text-xl">
                      {t('common.imageFallback')}
                    </div>
                  )}

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        {item.options.length > 0 && (
                          <p className="mt-1 text-xs text-gray-500">
                            {item.options
                              .map((o) => `${o.groupName}: ${o.optionName}`)
                              .join(' · ')}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="text-gray-400 transition-colors hover:text-accent"
                        aria-label={t('cart.remove', { name: item.name })}
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQuantity(item.key, item.quantity - 1)}
                          className="h-8 w-8 rounded-full border border-gray-300 font-semibold"
                          aria-label={t('cart.decreaseQty')}
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.key, item.quantity + 1)}
                          className="h-8 w-8 rounded-full border border-gray-300 font-semibold"
                          aria-label={t('cart.increaseQty')}
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-brand">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                    <p className="mt-1 text-right text-xs text-gray-400">
                      {t('cart.each', { price: formatPrice(item.unitPrice) })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-gray-600">
                <span>{t('cart.subtotal')}</span>
                <span className="text-lg font-bold text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-sm text-gray-400">{t('cart.deliveryNote')}</p>
            </div>

            <Link
              to="/checkout"
              className="mt-4 block w-full rounded-xl bg-accent py-3 text-center font-semibold text-white transition-colors hover:bg-accent-dark"
            >
              {t('cart.continueCheckout')}
            </Link>
          </>
        )}
      </main>
    </div>
  )
}
