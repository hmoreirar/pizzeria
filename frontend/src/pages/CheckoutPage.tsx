import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { createOrder, getSettings } from '../api'
import { useCart } from '../cart/cart'
import { Header } from '../components/Header'
import { formatPrice } from '../lib/format'
import type { PaymentMethod } from '../types'

const inputClass =
  'mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-brand focus:outline-none'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()
  const { t } = useTranslation()

  const [deliveryFee, setDeliveryFee] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [commune, setCommune] = useState('')
  const [instructions, setInstructions] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [submitting, setSubmitting] = useState(false)
  // Either a translation key (our own failure) or a raw API message.
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    getSettings()
      .then((s) => setDeliveryFee(s.deliveryFee))
      .catch(() => setErrorKey('checkout.errorSettings'))
  }, [])

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-10 text-center">
          <p className="text-gray-500">{t('cart.empty')}</p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-xl bg-brand px-6 py-3 font-semibold text-white"
          >
            {t('common.viewMenu')}
          </Link>
        </main>
      </div>
    )
  }

  const total = subtotal + (deliveryFee ?? 0)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setErrorKey(null)
    setErrorMessage(null)
    try {
      const order = await createOrder({
        delivery: { name, phone, address, commune, instructions },
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          optionIds: i.options.map((o) => o.optionId),
          quantity: i.quantity,
        })),
      })
      clearCart()
      navigate(`/order/${order.id}`)
    } catch (err) {
      if (err instanceof Error) setErrorMessage(err.message)
      else setErrorKey('checkout.errorCreate')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:pb-6">
        <h1 className="mb-6 text-2xl font-extrabold text-gray-900">{t('checkout.title')}</h1>

        {/* Order summary */}
        <section className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
            {t('checkout.yourOrder')}
          </h2>
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.key} className="flex justify-between gap-2 text-sm">
                <span className="text-gray-700">
                  {item.quantity}× {item.name}
                  {item.options.length > 0 && (
                    <span className="text-gray-400">
                      {' '}
                      ({item.options.map((o) => o.optionName).join(', ')})
                    </span>
                  )}
                </span>
                <span className="font-medium text-gray-900">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-gray-100 pt-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>{t('checkout.subtotal')}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="mt-1 flex justify-between text-gray-600">
              <span>{t('checkout.delivery')}</span>
              <span>{deliveryFee !== null ? formatPrice(deliveryFee) : '…'}</span>
            </div>
            <div className="mt-2 flex justify-between text-base font-bold text-gray-900">
              <span>{t('checkout.total')}</span>
              <span className="text-brand">{formatPrice(total)}</span>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Delivery details */}
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
              {t('checkout.deliveryDetails')}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700" htmlFor="name">
                  {t('checkout.name')}
                </label>
                <input
                  id="name"
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700" htmlFor="phone">
                  {t('checkout.phone')}
                </label>
                <input
                  id="phone"
                  type="tel"
                  className={inputClass}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  autoComplete="tel"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700" htmlFor="address">
                  {t('checkout.address')}
                </label>
                <input
                  id="address"
                  className={inputClass}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  autoComplete="street-address"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700" htmlFor="commune">
                  {t('checkout.commune')}
                </label>
                <input
                  id="commune"
                  className={inputClass}
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700" htmlFor="instructions">
                  {t('checkout.instructions')}
                </label>
                <textarea
                  id="instructions"
                  className={inputClass}
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Payment method */}
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
              {t('checkout.paymentMethod')}
            </h2>
            <div className="space-y-2">
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 ${
                  paymentMethod === 'cash' ? 'border-brand bg-brand/5' : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="accent-brand"
                />
                <span>
                  <span className="block font-medium">{t('checkout.cash')}</span>
                  <span className="text-sm text-gray-500">{t('checkout.cashNote')}</span>
                </span>
              </label>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 ${
                  paymentMethod === 'transfer' ? 'border-brand bg-brand/5' : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'transfer'}
                  onChange={() => setPaymentMethod('transfer')}
                  className="accent-brand"
                />
                <span>
                  <span className="block font-medium">{t('checkout.transfer')}</span>
                  <span className="text-sm text-gray-500">{t('checkout.transferNote')}</span>
                </span>
              </label>
            </div>
          </section>

          {(errorMessage ?? errorKey) && (
            <p className="rounded-xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent">
              {errorMessage ?? t(errorKey!)}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-accent py-3 font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
          >
            {submitting
              ? t('checkout.creating')
              : t('checkout.placeOrder', { total: formatPrice(total) })}
          </button>
        </form>
      </main>
    </div>
  )
}
