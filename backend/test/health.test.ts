import request from 'supertest'
import { describe, it, expect } from 'vitest'
import { app } from '../src/app'

describe('GET /api/health', () => {
  it('responde 200 con el estado de la app y de la base de datos', async () => {
    const res = await request(app).get('/api/health')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      status: 'ok',
      db: expect.any(String),
    })
    expect(['up', 'down']).toContain(res.body.db)
  })
})
