import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getOrder } from '../api'
import { Header } from '../components/Header'
import { formatPrice } from '../lib/format'
import type { Order, OrderStatus } from '../types'

const STEPS: Array<{ key: OrderStatus; label: string }> = [
  { key: 'pending', label: 'Order received' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'out_for_delivery', label: 'Out for delivery' },
  { key: 'delivered', label: 'Delivered' },
]

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Cash',
  transfer: 'Bank transfer',
}

// Tracking: refresh status every 25s to reflect admin changes.
const POLL_INTERVAL_MS = 25000

export function OrderConfirmationPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    const orderId = Number(id)
    if (!Number.isInteger(orderId) || orderId <= 0) {
      setError('Invalid order.')
      setLoading(false)
      return
    }
    getOrder(orderId)
      .then(setOrder)
      .catch(() => setError('Could not load the order.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    load()
    const timer = setInterval(load, POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [load])

  if (loading) {
    return <p className="p-6 text-gray-500">Loading…</p>
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <p className="text-accent">{error ?? 'Order not found.'}</p>
        <Link to="/" className="mt-4 inline-block font-semibold text-brand">
          ← Back to menu
        </Link>
      </div>
    )
  }

  const currentStep = STEPS.findIndex((s) => s.key === order.status)
  const paid = order.paymentStatus === 'paid'

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-3xl text-brand">
            ✓
          </div>
          <h1 className="mt-3 text-2xl font-extrabold text-gray-900">Order received!</h1>
          <div className="mt-1 flex items-center justify-center gap-3 text-gray-500">
            <span>
              Order <span className="font-semibold text-brand">#{order.id}</span>
            </span>
            <button
              type="button"
              onClick={load}
              className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Last updated: {new Date(order.updatedAt).toLocaleString('en-US')}
          </p>
        </div>

        {order.status === 'cancelled' ? (
          <div className="mt-6 rounded-2xl bg-white p-4 text-center font-medium text-accent shadow-sm">
            This order was cancelled.
          </div>
        ) : (
          <ol className="mt-6 space-y-2">
            {STEPS.map((step, index) => {
              const done = index < currentStep
              const current = index === currentStep
              const icon = done ? '✓' : current ? '●' : '○'
              return (
                <li
                  key={step.key}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                    current ? 'bg-white font-semibold shadow-sm' : ''
                  } ${done || current ? 'text-brand' : 'text-gray-400'}`}
                >
                  <span className="w-4 text-center">{icon}</span>
                  <span>{step.label}</span>
                </li>
              )
            })}
          </ol>
        )}

        <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
            Summary
          </h2>
          <ul className="space-y-2 text-sm">
            {order.items.map((item, index) => (
              <li key={index} className="flex justify-between gap-2">
                <span className="text-gray-700">
                  {item.quantity}× {item.productName}
                  {item.options.length > 0 && (
                    <span className="text-gray-400">
                      {' '}
                      ({item.options.map((o) => o.optionName).join(', ')})
                    </span>
                  )}
                </span>
                <span className="font-medium text-gray-900">{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-gray-100 pt-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="mt-1 flex justify-between text-gray-600">
              <span>Delivery</span>
              <span>{formatPrice(order.deliveryFee)}</span>
            </div>
            <div className="mt-2 flex justify-between text-base font-bold text-gray-900">
              <span>Total</span>
              <span className="text-brand">{formatPrice(order.total)}</span>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-2xl bg-white p-4 text-sm shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Delivery</h2>
          <p className="text-gray-700">
            {order.delivery.name} · {order.delivery.phone}
          </p>
          <p className="text-gray-600">
            {order.delivery.address}
            {order.delivery.commune ? `, ${order.delivery.commune}` : ''}
          </p>
          {order.delivery.instructions && (
            <p className="mt-1 text-gray-500">"{order.delivery.instructions}"</p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-gray-500">Payment: {PAYMENT_LABELS[order.paymentMethod]}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                paid ? 'bg-leaf/15 text-leaf' : 'bg-ember/10 text-ember'
              }`}
            >
              {paid ? 'Payment confirmed' : 'Payment pending'}
            </span>
          </div>
        </section>

        <Link
          to="/"
          className="mt-6 block w-full rounded-xl bg-brand py-3 text-center font-semibold text-white"
        >
          Back to menu
        </Link>
      </main>
    </div>
  )
}
