import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getAdminOrder, updateOrderStatus } from '../../admin/api'
import { formatPrice } from '../../lib/format'
import {
  STATUS_LABELS,
  STATUS_BADGE,
  PAYMENT_LABELS,
  ORDER_STATUSES,
} from '../../lib/labels'
import type { Order, OrderStatus } from '../../types'

export function AdminOrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    const orderId = Number(id)
    if (!Number.isInteger(orderId)) return
    getAdminOrder(orderId)
      .then(setOrder)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar'))
  }, [id])

  useEffect(load, [load])

  async function changeStatus(status: OrderStatus) {
    if (!order) return
    setError(null)
    try {
      const updated = await updateOrderStatus(order.id, status)
      setOrder(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar')
    }
  }

  if (error) return <p className="text-accent">{error}</p>
  if (!order) return <p className="text-gray-500">Cargando…</p>

  return (
    <div>
      <Link to="/admin/orders" className="mb-4 inline-block font-semibold text-brand">
        ← Volver a pedidos
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold text-gray-900">Pedido #{order.id}</h1>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_BADGE[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Cambio de estado */}
      <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
          Cambiar estado
        </h2>
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => changeStatus(status)}
              disabled={status === order.status}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                status === order.status
                  ? 'bg-brand text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Cliente */}
      <section className="mt-4 rounded-2xl bg-white p-4 text-sm shadow-sm">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">Cliente</h2>
        <p className="text-gray-900">
          {order.delivery.name} · {order.delivery.phone}
        </p>
        <p className="text-gray-600">
          {order.delivery.address}
          {order.delivery.commune ? `, ${order.delivery.commune}` : ''}
        </p>
        {order.delivery.instructions && (
          <p className="mt-1 text-gray-500">“{order.delivery.instructions}”</p>
        )}
        <p className="mt-2 text-gray-500">
          Pago: {PAYMENT_LABELS[order.paymentMethod]} ·{' '}
          {order.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
        </p>
      </section>

      {/* Productos */}
      <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Productos</h2>
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
    </div>
  )
}
