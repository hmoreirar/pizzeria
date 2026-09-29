import { pool } from '../db/pool'
import { priceItems, type QuoteItemInput } from '../services/pricing'
import { getDeliveryFee } from './settings'
import type {
  DeliveryInfo,
  Order,
  OrderItem,
  OrderOption,
  OrderSummary,
  DashboardStats,
  PaymentMethod,
} from '../types'

export interface CreateOrderInput {
  delivery: DeliveryInfo
  paymentMethod: PaymentMethod
  items: QuoteItemInput[]
}

interface OrderRow {
  id: number
  status: Order['status']
  subtotal: string
  delivery_fee: string
  total: string
  payment_method: PaymentMethod
  payment_status: Order['paymentStatus']
  delivery_name: string
  delivery_phone: string
  delivery_address: string
  delivery_commune: string | null
  delivery_instructions: string | null
  created_at: Date
}

interface OrderItemRow {
  product_id: number
  product_name: string
  unit_price: string
  quantity: number
  options: OrderOption[]
}

// Crea el pedido con su snapshot histórico.
// El precio se recalcula en el backend (fuente de verdad) y los items se
// insertan en una transacción para no dejar pedidos a medias.
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const { items, subtotal } = await priceItems(input.items)
  const deliveryFee = await getDeliveryFee()
  const total = subtotal + deliveryFee

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const orderResult = await client.query<{ id: number; created_at: Date }>(
      `INSERT INTO orders
         (subtotal, delivery_fee, total, payment_method,
          delivery_name, delivery_phone, delivery_address, delivery_commune, delivery_instructions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, created_at`,
      [
        subtotal,
        deliveryFee,
        total,
        input.paymentMethod,
        input.delivery.name,
        input.delivery.phone,
        input.delivery.address,
        input.delivery.commune,
        input.delivery.instructions,
      ],
    )
    const order = orderResult.rows[0]

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, options)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          order.id,
          item.productId,
          item.productName,
          item.unitPrice,
          item.quantity,
          JSON.stringify(item.options),
        ],
      )
    }

    await client.query('COMMIT')

    return {
      id: order.id,
      status: 'pending',
      subtotal,
      deliveryFee,
      total,
      paymentMethod: input.paymentMethod,
      paymentStatus: 'pending',
      delivery: input.delivery,
      items,
      createdAt: order.created_at.toISOString(),
    }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function getOrderById(id: number): Promise<Order | null> {
  const orderResult = await pool.query<OrderRow>(
    `SELECT id, status, subtotal, delivery_fee, total, payment_method, payment_status,
            delivery_name, delivery_phone, delivery_address, delivery_commune, delivery_instructions,
            created_at
       FROM orders
      WHERE id = $1`,
    [id],
  )
  const row = orderResult.rows[0]
  if (!row) return null

  const itemsResult = await pool.query<OrderItemRow>(
    `SELECT product_id, product_name, unit_price, quantity, options
       FROM order_items
      WHERE order_id = $1
      ORDER BY id`,
    [id],
  )

  const items: OrderItem[] = itemsResult.rows.map((r) => ({
    productId: r.product_id,
    productName: r.product_name,
    unitPrice: Number(r.unit_price),
    quantity: r.quantity,
    lineTotal: Number(r.unit_price) * r.quantity,
    options: r.options,
  }))

  return {
    id: row.id,
    status: row.status,
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    delivery: {
      name: row.delivery_name,
      phone: row.delivery_phone,
      address: row.delivery_address,
      commune: row.delivery_commune,
      instructions: row.delivery_instructions,
    },
    items,
    createdAt: row.created_at.toISOString(),
  }
}

interface OrderSummaryRow {
  id: number
  status: Order['status']
  total: string
  payment_method: PaymentMethod
  payment_status: Order['paymentStatus']
  delivery_name: string
  created_at: Date
}

// Lista los pedidos (más recientes primero) para el panel administrativo.
export async function listOrders(limit?: number): Promise<OrderSummary[]> {
  const sql = `
    SELECT id, status, total, payment_method, payment_status, delivery_name, created_at
      FROM orders
     ORDER BY id DESC
  `
  const result = limit
    ? await pool.query<OrderSummaryRow>(`${sql} LIMIT $1`, [limit])
    : await pool.query<OrderSummaryRow>(sql)

  return result.rows.map((row) => ({
    id: row.id,
    status: row.status,
    total: Number(row.total),
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    customerName: row.delivery_name,
    createdAt: row.created_at.toISOString(),
  }))
}

// Actualiza el estado del pedido. Devuelve el pedido actualizado o null si no existe.
export async function updateOrderStatus(
  id: number,
  status: Order['status'],
): Promise<Order | null> {
  const result = await pool.query<{ id: number }>(
    `UPDATE orders SET status = $2, updated_at = now() WHERE id = $1 RETURNING id`,
    [id, status],
  )
  if (!result.rows[0]) return null
  return getOrderById(id)
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const pendingResult = await pool.query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM orders WHERE status = 'pending'`,
  )
  const todayResult = await pool.query<{ count: number; sales: string }>(
    `SELECT COUNT(*)::int AS count, COALESCE(SUM(total), 0) AS sales
       FROM orders
      WHERE created_at >= CURRENT_DATE AND status <> 'cancelled'`,
  )

  const recentOrders = await listOrders(5)

  return {
    pendingOrders: pendingResult.rows[0].count,
    ordersToday: todayResult.rows[0].count,
    salesToday: Number(todayResult.rows[0].sales),
    recentOrders,
  }
}
