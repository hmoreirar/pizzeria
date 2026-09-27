import request from 'supertest'
import { describe, it, expect, beforeEach } from 'vitest'
import { app } from '../src/app'
import { pool } from '../src/db/pool'

// Antes de cada test dejamos las tablas limpias para que los tests
// no dependan de datos previos ni se pisen entre sí.
beforeEach(async () => {
  await pool.query('TRUNCATE categories, products RESTART IDENTITY CASCADE')
})

describe('GET /api/categories', () => {
  it('devuelve la lista de categorías ordenada por nombre', async () => {
    await pool.query(
      `INSERT INTO categories (name) VALUES ('Pizzas'), ('Bebidas'), ('Postres')`,
    )

    const res = await request(app).get('/api/categories')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([
      { id: expect.any(Number), name: 'Bebidas' },
      { id: expect.any(Number), name: 'Pizzas' },
      { id: expect.any(Number), name: 'Postres' },
    ])
  })

  it('devuelve un arreglo vacío cuando no hay categorías', async () => {
    const res = await request(app).get('/api/categories')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})
