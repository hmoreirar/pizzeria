import type { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../auth/token'

// Protección real en backend: valida el token y que el rol sea 'admin'.
// Ocultar botones en el frontend NO constituye autorización (especificación §8).
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autenticado' })
    return
  }

  try {
    const payload = verifyToken(header.slice('Bearer '.length))
    if (payload.role !== 'admin') {
      res.status(403).json({ error: 'No autorizado' })
      return
    }
    next()
  } catch {
    res.status(401).json({ error: 'Sesión inválida o expirada' })
  }
}
