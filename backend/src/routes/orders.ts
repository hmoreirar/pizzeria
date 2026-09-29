import { Router } from 'express'
import { z } from 'zod'
import { priceItems, ValidationError } from '../services/pricing'
import { getDeliveryFee } from '../repositories/settings'
import { createOrder, getOrderById } from '../repositories/orders'
import type { DeliveryInfo } from '../types'

export const ordersRouter = Router()

const quoteSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        optionIds: z.array(z.number().int().positive()),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
})

// POST /api/orders/quote — valida el carrito y devuelve el precio recalculado
// en el backend (fuente de verdad). No crea el pedido.
ordersRouter.post('/quote', async (req, res) => {
  const parsed = quoteSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({ error: 'Carrito inválido' })
    return
  }

  try {
    const { items, subtotal } = await priceItems(parsed.data.items)
    const deliveryFee = await getDeliveryFee()
    res.json({ items, subtotal, deliveryFee, total: subtotal + deliveryFee })
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ error: err.message })
      return
    }
    throw err
  }
})

const deliverySchema = z.object({
  name: z.string().trim().min(1, 'Nombre requerido').max(150),
  phone: z.string().trim().min(1, 'Teléfono requerido').max(50),
  address: z.string().trim().min(1, 'Dirección requerida').max(500),
  commune: z.string().trim().max(100).optional(),
  instructions: z.string().trim().max(500).optional(),
})

const createOrderSchema = z.object({
  delivery: deliverySchema,
  paymentMethod: z.enum(['cash', 'transfer']),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        optionIds: z.array(z.number().int().positive()),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
})

// POST /api/orders — crea el pedido (compra anónima) recalculando precios en backend.
ordersRouter.post('/', async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({ error: 'Datos del pedido inválidos' })
    return
  }

  const d = parsed.data.delivery
  const delivery: DeliveryInfo = {
    name: d.name,
    phone: d.phone,
    address: d.address,
    commune: d.commune || null,
    instructions: d.instructions || null,
  }

  try {
    const order = await createOrder({
      delivery,
      paymentMethod: parsed.data.paymentMethod,
      items: parsed.data.items,
    })
    res.status(201).json(order)
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ error: err.message })
      return
    }
    throw err
  }
})

const orderIdSchema = z.object({
  id: z.coerce.number().int().positive(),
})

// GET /api/orders/:id — estado del pedido para la pantalla de seguimiento.
ordersRouter.get('/:id', async (req, res) => {
  const parsed = orderIdSchema.safeParse(req.params)

  if (!parsed.success) {
    res.status(400).json({ error: 'Parámetro "id" inválido: debe ser un entero positivo' })
    return
  }

  const order = await getOrderById(parsed.data.id)
  if (!order) {
    res.status(404).json({ error: 'Pedido no encontrado' })
    return
  }

  res.json(order)
})
