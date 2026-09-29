import { Router } from 'express'
import { getDeliveryFee } from '../repositories/settings'

export const settingsRouter = Router()

// GET /api/settings — expone la configuración pública que necesita el frontend
// para mostrar estimaciones (por ahora, el costo de despacho).
settingsRouter.get('/', async (_req, res) => {
  const deliveryFee = await getDeliveryFee()
  res.json({ deliveryFee })
})
