import request from 'supertest'
import { describe, it, expect, beforeEach } from 'vitest'
import { app } from '../src/app'
import { pool } from '../src/db/pool'

beforeEach(async () => {
  await pool.query(
    `INSERT INTO settings (key, value) VALUES ('delivery_fee', '2500')
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
  )
})

describe('GET /api/settings', () => {
  it('devuelve el costo de despacho configurado', async () => {
    const res = await request(app).get('/api/settings')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ deliveryFee: 2500 })
  })
})
