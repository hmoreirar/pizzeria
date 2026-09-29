import { Router } from 'express'
import { getDashboardStats } from '../../repositories/orders'

export const dashboardRouter = Router()

// GET /api/admin/dashboard — métricas operacionales básicas.
dashboardRouter.get('/', async (_req, res) => {
  const stats = await getDashboardStats()
  res.json(stats)
})
