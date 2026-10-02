import fs from 'fs'
import path from 'path'
import express from 'express'
import { app } from './app'
import { env } from './config/env'
import { ensureSeedData } from './db/bootstrap'

// Sirve el frontend compilado (Vite → frontend/dist) en producción.
// En desarrollo el frontend corre con `vite` (que proxea /api a este backend),
// así que esta parte solo se activa si existe el build.
const frontendDist = path.resolve(__dirname, '../../frontend/dist')
const indexHtml = path.join(frontendDist, 'index.html')

if (fs.existsSync(indexHtml)) {
  app.use(express.static(frontendDist))
  // Fallback SPA: cualquier GET que no sea de la API devuelve index.html.
  app.use((req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'Ruta no encontrada' })
      return
    }
    res.sendFile(indexHtml)
  })
}

async function main() {
  // Siembra catálogo + admin si la base está vacía (idempotente).
  await ensureSeedData()

  app.listen(env.PORT, () => {
    console.log(`Pizzeria API escuchando en http://localhost:${env.PORT}`)
  })
}

main().catch((err) => {
  console.error('Error al iniciar:', err)
  process.exit(1)
})
