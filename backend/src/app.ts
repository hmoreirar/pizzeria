import express from 'express'
import { healthRouter } from './routes/health'

// La app se exporta sin llamar a listen().
// Así los tests pueden importarla y hacer peticiones en memoria con Supertest.
export const app = express()

app.use(express.json())
app.use(healthRouter)
