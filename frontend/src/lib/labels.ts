import type { OrderStatus, PaymentMethod } from '../types'

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: 'bg-cream text-gray-800',
  confirmed: 'bg-brand/10 text-brand',
  preparing: 'bg-ember/10 text-ember',
  out_for_delivery: 'bg-brand/15 text-brand-dark',
  delivered: 'bg-leaf/15 text-leaf',
  cancelled: 'bg-accent/10 text-accent',
}

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  transfer: 'Bank transfer',
}

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
]
