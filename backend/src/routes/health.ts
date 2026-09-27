import { Router } from 'express'
import { pool } from '../db/pool'

export const healthRouter = Router()

// GET /api/health — indica si la app está viva y si la base de datos responde.
healthRouter.get('/', async (_req, res) => {
  let db: 'up' | 'down' = 'down'

  try {
    await pool.query('SELECT 1')
    db = 'up'
  } catch {
    db = 'down'
  }

  res.json({ status: 'ok', db })
})
