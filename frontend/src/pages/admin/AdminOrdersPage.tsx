import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getAdminOrders } from '../../admin/api'
import { formatPrice } from '../../lib/format'
import { STATUS_LABELS, STATUS_BADGE, PAYMENT_LABELS } from '../../lib/labels'
import type { OrderSummary } from '../../types'

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminOrders()
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error loading'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-500">Loading…</p>
  if (error) return <p className="text-accent">{error}</p>

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-gray-900">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/admin/orders/${order.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-4 py-3 shadow-sm hover:shadow"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900">#{order.id}</span>
                <span className="text-sm text-gray-600">{order.customerName}</span>
                <span className="text-sm text-gray-400">{PAYMENT_LABELS[order.paymentMethod]}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[order.status]}`}>
                  {STATUS_LABELS[order.status]}
                </span>
                <span className="font-semibold text-brand">{formatPrice(order.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
