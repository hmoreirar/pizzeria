import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { createOrder, getSettings } from '../api'
import { useCart } from '../cart/cart'
import { Header } from '../components/Header'
import { formatPrice } from '../lib/format'
import type { PaymentMethod } from '../types'

const inputClass =
  'mt-1 w-full rounded-lg border bg-white px-3 py-2 text-gray-900 focus:border-brand focus:outline-none'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()

  const [deliveryFee, setDeliveryFee] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [commune, setCommune] = useState('')
  const [instructions, setInstructions] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  // Field name -> validation message.
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    getSettings()
      .then((s) => setDeliveryFee(s.deliveryFee))
      .catch(() => setErrorMessage('No se pudo cargar la configuración.'))
  }, [])

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-10 text-center">
          <p className="text-gray-500">Tu carrito está vacío.</p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-white"
          >
            Ver menú
          </Link>
        </main>
      </div>
    )
  }

  const total = subtotal + (deliveryFee ?? 0)

  const fieldClass = (field: string) =>
    `${inputClass} ${errors[field] ? 'border-accent' : 'border-gray-300'}`

  function clearError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function validate(): Record<string, string> {
    const next: Record<string, string> = {}
    if (name.trim().length < 2) next.name = 'Ingresa tu nombre.'
    if (phone.replace(/\D/g, '').length < 8) next.phone = 'Ingresa un teléfono válido.'
    if (address.trim().length < 5) next.address = 'Ingresa tu dirección.'
    return next
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    setErrors({})
    setSubmitting(true)
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
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo crear el pedido.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:pb-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Pago</h1>

        {/* Order summary */}
        <section className="mb-6 rounded-xl border border-black/5 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Tu pedido
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
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="mt-1 flex justify-between text-gray-600">
              <span>Despacho</span>
              <span>{deliveryFee !== null ? formatPrice(deliveryFee) : '…'}</span>
            </div>
            <div className="mt-2 flex justify-between text-base font-bold text-gray-900">
              <span>Total</span>
              <span className="text-brand">{formatPrice(total)}</span>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Delivery details */}
          <section className="rounded-xl border border-black/5 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Datos de entrega
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700" htmlFor="name">
                  Nombre
                </label>
                <input
                  id="name"
                  className={fieldClass('name')}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    clearError('name')
                  }}
                  required
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1 text-xs font-medium text-accent">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700" htmlFor="phone">
                  Teléfono
                </label>
                <input
                  id="phone"
                  type="tel"
                  className={fieldClass('phone')}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    clearError('phone')
                  }}
                  required
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                />
                {errors.phone && (
                  <p id="phone-error" className="mt-1 text-xs font-medium text-accent">
                    {errors.phone}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700" htmlFor="address">
                  Dirección
                </label>
                <input
                  id="address"
                  className={fieldClass('address')}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value)
                    clearError('address')
                  }}
                  required
                  autoComplete="street-address"
                  aria-invalid={Boolean(errors.address)}
                  aria-describedby={errors.address ? 'address-error' : undefined}
                />
                {errors.address && (
                  <p id="address-error" className="mt-1 text-xs font-medium text-accent">
                    {errors.address}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700" htmlFor="commune">
                  Comuna
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
                  Instrucciones de entrega (opcional)
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
          <section className="rounded-xl border border-black/5 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Método de pago
            </h2>
            <div className="space-y-2">
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 ${
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
                  <span className="block font-medium">Efectivo</span>
                  <span className="text-sm text-gray-500">Paga al recibir</span>
                </span>
              </label>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 ${
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
                  <span className="block font-medium">Transferencia bancaria</span>
                  <span className="text-sm text-gray-500">Confirmamos el pago manualmente</span>
                </span>
              </label>
            </div>
          </section>

          {errorMessage && (
            <p className="rounded-lg bg-accent/10 px-4 py-3 text-sm font-medium text-accent">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-accent py-3 font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
          >
            {submitting ? 'Creando pedido…' : `Realizar pedido · ${formatPrice(total)}`}
          </button>
        </form>
      </main>
    </div>
  )
}
