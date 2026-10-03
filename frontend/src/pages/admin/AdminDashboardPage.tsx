import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getDashboard } from '../../admin/api'
import { formatPrice } from '../../lib/format'
import { STATUS_LABELS, STATUS_BADGE } from '../../lib/labels'
import type { DashboardStats } from '../../types'

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDashboard()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error loading'))
  }, [])

  if (error) return <p className="text-accent">{error}</p>
  if (!stats) return <p className="text-gray-500">Loading…</p>

  const cards = [
    { label: 'Pending orders', value: String(stats.pendingOrders) },
    { label: 'Orders today', value: String(stats.ordersToday) },
    { label: 'Sales today', value: formatPrice(stats.salesToday) },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-1 text-3xl font-extrabold text-brand">{card.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-lg font-bold text-gray-900">Recent orders</h2>
      {stats.recentOrders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <ul className="space-y-2">
          {stats.recentOrders.map((order) => (
            <li key={order.id}>
              <Link
                to={`/admin/orders/${order.id}`}
                className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm hover:shadow"
              >
                <div>
                  <span className="font-semibold text-gray-900">#{order.id}</span>
                  <span className="ml-2 text-sm text-gray-500">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span className="font-semibold text-brand">{formatPrice(order.total)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
