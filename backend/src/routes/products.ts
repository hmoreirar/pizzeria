import { Router } from 'express'
import { z } from 'zod'
import { listProducts } from '../repositories/products'

export const productsRouter = Router()

// `category` es opcional; si viene, debe ser un entero positivo.
const listProductsQuerySchema = z.object({
  category: z.coerce.number().int().positive().optional(),
})

// GET /api/products?category=1 — lista productos activos, opcionalmente filtrados por categoría.
productsRouter.get('/', async (req, res) => {
  const parsed = listProductsQuerySchema.safeParse(req.query)

  if (!parsed.success) {
    res.status(400).json({ error: 'Parámetro "category" inválido: debe ser un entero positivo' })
    return
  }

  const products = await listProducts(parsed.data.category)
  res.json(products)
})
