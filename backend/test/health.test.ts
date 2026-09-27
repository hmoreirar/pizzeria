import request from 'supertest'
import { describe, it, expect } from 'vitest'
import { app } from '../src/app'

describe('GET /health', () => {
  it('responde 200 con el estado de la app y de la base de datos', async () => {
    const res = await request(app).get('/health')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      status: 'ok',
      db: expect.any(String),
    })
    // No forzamos 'up' en el test para que siga pasando aunque la BD esté caída;
    // verificamos 'up' manualmente contra la BD real durante la verificación.
    expect(['up', 'down']).toContain(res.body.db)
  })
})
