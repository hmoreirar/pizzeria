import { Router } from 'express'
import { z } from 'zod'
import {
  listAllCategories,
  createCategory,
  updateCategory,
  type CategoryInput,
} from '../../repositories/categories'

export const adminCategoriesRouter = Router()

const idSchema = z.object({ id: z.coerce.number().int().positive() })

const categorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  active: z.boolean(),
  sortOrder: z.number().int().nonnegative(),
})

// GET /api/admin/categories — todas las categorías (activas e inactivas).
adminCategoriesRouter.get('/', async (_req, res) => {
  const categories = await listAllCategories()
  res.json(categories)
})

// POST /api/admin/categories — crea una categoría.
adminCategoriesRouter.post('/', async (req, res) => {
  const parsed = categorySchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos de la categoría inválidos' })
    return
  }
  const input: CategoryInput = { ...parsed.data }
  const { id } = await createCategory(input)
  res.status(201).json({ id })
})

// PATCH /api/admin/categories/:id — actualiza una categoría.
adminCategoriesRouter.patch('/:id', async (req, res) => {
  const idParsed = idSchema.safeParse(req.params)
  const bodyParsed = categorySchema.safeParse(req.body)
  if (!idParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: 'Datos de la categoría inválidos' })
    return
  }
  const updated = await updateCategory(idParsed.data.id, bodyParsed.data)
  if (!updated) {
    res.status(404).json({ error: 'Categoría no encontrada' })
    return
  }
  res.json({ id: idParsed.data.id })
})
