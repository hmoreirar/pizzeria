import { Router } from 'express'
import { listCategories } from '../repositories/categories'

export const categoriesRouter = Router()

// GET /api/categories — lista todas las categorías del menú.
categoriesRouter.get('/', async (_req, res) => {
  const categories = await listCategories()
  res.json(categories)
})
