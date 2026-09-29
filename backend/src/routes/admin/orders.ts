import { Router } from 'express'
import { z } from 'zod'
import { listOrders, getOrderById, updateOrderStatus } from '../../repositories/orders'

export const adminOrdersRouter = Router()

const idSchema = z.object({ id: z.coerce.number().int().positive() })

const statusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']),
})

// GET /api/admin/orders — listado de pedidos (más recientes primero).
adminOrdersRouter.get('/', async (_req, res) => {
  const orders = await listOrders()
  res.json(orders)
})

// GET /api/admin/orders/:id — detalle completo del pedido.
adminOrdersRouter.get('/:id', async (req, res) => {
  const parsed = idSchema.safeParse(req.params)
  if (!parsed.success) {
    res.status(400).json({ error: 'Parámetro "id" inválido' })
    return
  }

  const order = await getOrderById(parsed.data.id)
  if (!order) {
    res.status(404).json({ error: 'Pedido no encontrado' })
    return
  }
  res.json(order)
})

// PATCH /api/admin/orders/:id/status — cambia el estado del pedido.
adminOrdersRouter.patch('/:id/status', async (req, res) => {
  const idParsed = idSchema.safeParse(req.params)
  const statusParsed = statusSchema.safeParse(req.body)

  if (!idParsed.success || !statusParsed.success) {
    res.status(400).json({ error: 'Datos inválidos' })
    return
  }

  const order = await updateOrderStatus(idParsed.data.id, statusParsed.data.status)
  if (!order) {
    res.status(404).json({ error: 'Pedido no encontrado' })
    return
  }
  res.json(order)
})
