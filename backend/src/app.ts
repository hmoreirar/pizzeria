import express from 'express'
import { healthRouter } from './routes/health'
import { categoriesRouter } from './routes/categories'
import { productsRouter } from './routes/products'
import { settingsRouter } from './routes/settings'
import { ordersRouter } from './routes/orders'
import { authRouter } from './routes/auth'
import { adminRouter } from './routes/admin'
import { requireAdmin } from './middleware/requireAdmin'

// La app se exporta sin llamar a listen().
// Así los tests pueden importarla y hacer peticiones en memoria con Supertest.
export const app = express()

app.use(express.json())
app.use('/api/health', healthRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/products', productsRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/auth', authRouter)
app.use('/api/admin', requireAdmin, adminRouter)

// Manejador central de errores: cualquier error no controlado
// (Express 5 reenvía las promesas rechazadas de los handlers async)
// se responde como JSON 500 en lugar de HTML.
app.use(
  (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err)
    res.status(500).json({ error: 'Error interno del servidor' })
  },
)
