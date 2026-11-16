import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getOrder } from '../api'
import { Header } from '../components/Header'
import { formatDateTime, formatPrice } from '../lib/format'
import type { Order, OrderStatus } from '../types'

// Tracking steps, in order. Cancelled orders are handled apart.
const STEPS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']

const STEP_LABELS: Record<string, string> = {
  pending: 'Pedido recibido',
  confirmed: 'Confirmado',
  preparing: 'En preparación',
  out_for_delivery: 'En camino',
  delivered: 'Entregado',
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia bancaria',
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
      setError('Pedido no válido.')
      setLoading(false)
      return
    }
    getOrder(orderId)
      .then(setOrder)
      .catch(() => setError('No se pudo cargar el pedido.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    load()
    const timer = setInterval(load, POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [load])

  if (loading) {
    return <p className="p-6 text-gray-500">Cargando…</p>
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <p className="text-accent">{error ?? 'Pedido no encontrado.'}</p>
        <Link to="/" className="mt-4 inline-block font-semibold text-brand">
          ← Volver al menú
        </Link>
      </div>
    )
  }

  const currentStep = STEPS.findIndex((s) => s === order.status)
  const paid = order.paymentStatus === 'paid'

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-3xl text-brand">
            ✓
          </div>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">¡Pedido recibido!</h1>
          <div className="mt-1 flex items-center justify-center gap-3 text-gray-500">
            <span>
              Pedido <span className="font-semibold text-brand">#{order.id}</span>
            </span>
            <button
              type="button"
              onClick={load}
              className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              Actualizar
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Última actualización: {formatDateTime(order.updatedAt)}
          </p>
        </div>

        {order.status === 'cancelled' ? (
          <div className="mt-6 rounded-xl border border-black/5 bg-white p-4 text-center font-medium text-accent">
            Este pedido fue cancelado.
          </div>
        ) : (
          <ol className="mt-6 space-y-2">
            {STEPS.map((step, index) => {
              const done = index < currentStep
              const current = index === currentStep
              const icon = done ? '✓' : current ? '●' : '○'
              return (
                <li
                  key={step}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                    current ? 'border border-black/5 bg-white font-semibold' : ''
                  } ${done || current ? 'text-brand' : 'text-gray-400'}`}
                >
                  <span className="w-4 text-center">{icon}</span>
                  <span>{STEP_LABELS[step]}</span>
                </li>
              )
            })}
          </ol>
        )}

        <section className="mt-6 rounded-xl border border-black/5 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Resumen
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
              <span>Despacho</span>
              <span>{formatPrice(order.deliveryFee)}</span>
            </div>
            <div className="mt-2 flex justify-between text-base font-bold text-gray-900">
              <span>Total</span>
              <span className="text-brand">{formatPrice(order.total)}</span>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-black/5 bg-white p-4 text-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Entrega
          </h2>
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
            <span className="text-gray-500">
              Pago: {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                paid ? 'bg-leaf/15 text-leaf' : 'bg-ember/10 text-ember'
              }`}
            >
              {paid ? 'Pago confirmado' : 'Pago pendiente'}
            </span>
          </div>
        </section>

        <Link
          to="/"
          className="mt-6 block w-full rounded-lg bg-brand py-3 text-center font-semibold text-white"
        >
          Volver al menú
        </Link>
      </main>
    </div>
  )
}
